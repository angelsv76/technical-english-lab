// Cliente "local": imita la parte de supabase-js que usa la app, pero habla con el
// servidor SQLite (servidor/). Así el resto del código no cambia entre nube y local.
//
// Solo implementa lo que la app usa: from().select/insert/update/upsert/delete con
// filtros, orden, rango y single/maybeSingle; auth; functions.invoke; storage.upload.

const LLAVE_SESION = 'tel-local-session';

interface Sesion { access_token: string; expires_at: number; user: LocalUser }
interface LocalUser { id: string; email: string; app_metadata: { role: string }; user_metadata: object }

function leerSesion(): Sesion | null {
  try {
    const crudo = localStorage.getItem(LLAVE_SESION);
    if (!crudo) return null;
    const s = JSON.parse(crudo) as Sesion;
    return s.expires_at * 1000 > Date.now() ? s : null;
  } catch { return null; }
}
function guardarSesion(s: Sesion | null) {
  try {
    if (s) localStorage.setItem(LLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(LLAVE_SESION);
  } catch { /* sin almacenamiento: la sesión dura hasta recargar */ }
}

function cabeceras(extra: Record<string, string> = {}) {
  const s = leerSesion();
  return { ...(s ? { Authorization: `Bearer ${s.access_token}` } : {}), ...extra };
}

type Filtro = { col: string; op: string; val: unknown };
type Resultado = { data: any; error: { message: string; code?: string } | null };

class Consulta implements PromiseLike<Resultado> {
  private p: Record<string, any>;
  constructor(tabla: string) { this.p = { table: tabla, op: 'select', filters: [] as Filtro[], returning: true }; }

  select(columnas = '*') {
    // select() tras insert/update/upsert significa "devuélveme las filas"; solo cambia la operación si aún era select.
    this.p.columns = columnas; this.p.returning = true; return this;
  }
  insert(valores: unknown) { this.p.op = 'insert'; this.p.values = valores; this.p.returning = false; return this; }
  update(valores: unknown) { this.p.op = 'update'; this.p.values = valores; this.p.returning = false; return this; }
  upsert(valores: unknown, opciones: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
    this.p.op = 'upsert'; this.p.values = valores; this.p.returning = false;
    this.p.onConflict = opciones.onConflict; this.p.ignoreDuplicates = !!opciones.ignoreDuplicates; return this;
  }
  delete() { this.p.op = 'delete'; this.p.returning = false; return this; }

  private filtro(op: string) { return (col: string, val: unknown) => { this.p.filters.push({ col, op, val }); return this; }; }
  eq = this.filtro('eq'); neq = this.filtro('neq'); gt = this.filtro('gt'); gte = this.filtro('gte');
  lt = this.filtro('lt'); lte = this.filtro('lte'); is = this.filtro('is'); in = this.filtro('in');

  order(col: string, opciones: { ascending?: boolean } = {}) {
    (this.p.order ??= []).push({ col, ascending: opciones.ascending !== false }); return this;
  }
  range(desde: number, hasta: number) { this.p.range = [desde, hasta]; return this; }
  limit(n: number) { this.p.limit = n; return this; }
  single() { this.p.single = 'single'; return this; }
  maybeSingle() { this.p.single = 'maybe'; return this; }

  then<A = Resultado, B = never>(
    ok?: ((v: Resultado) => A | PromiseLike<A>) | null,
    fallo?: ((r: unknown) => B | PromiseLike<B>) | null
  ): Promise<A | B> { return this.ejecutar().then(ok, fallo); }

  private async ejecutar(): Promise<Resultado> {
    try {
      const r = await fetch('/api/db', {
        method: 'POST', headers: cabeceras({ 'Content-Type': 'application/json' }), body: JSON.stringify(this.p)
      });
      if (!r.ok) return { data: null, error: { message: `Error del servidor (${r.status})`, code: String(r.status) } };
      return await r.json() as Resultado;
    } catch {
      return { data: null, error: { message: 'No se pudo conectar con el servidor local.', code: 'network' } };
    }
  }
}

class ErrorFuncion extends Error {
  context: Response;
  constructor(mensaje: string, contexto: Response) { super(mensaje); this.name = 'FunctionsHttpError'; this.context = contexto; }
}

export const clienteLocal = {
  from: (tabla: string) => new Consulta(tabla),

  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const r = await fetch('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
        });
        const cuerpo = await r.json().catch(() => ({}));
        if (!r.ok) {
          return { data: { user: null, session: null }, error: { message: cuerpo.error ?? 'invalid_credentials', status: r.status } };
        }
        guardarSesion(cuerpo as Sesion);
        return { data: { user: cuerpo.user as LocalUser, session: cuerpo as Sesion }, error: null };
      } catch {
        return { data: { user: null, session: null }, error: { message: 'No se pudo conectar con el servidor local.', status: 0 } };
      }
    },
    async signOut() { guardarSesion(null); return { error: null }; },
    async getSession() { const s = leerSesion(); return { data: { session: s }, error: null }; },
    async getUser() {
      const s = leerSesion();
      if (!s) return { data: { user: null }, error: { message: 'Auth session missing' } };
      try {
        const r = await fetch('/api/auth/user', { headers: cabeceras() });
        if (!r.ok) { guardarSesion(null); return { data: { user: null }, error: { message: 'Auth session missing' } }; }
        const cuerpo = await r.json();
        return { data: { user: cuerpo.user as LocalUser }, error: null };
      } catch {
        // Sin red no se puede confirmar; se confía en la sesión guardada (el servidor la revalida en cada petición).
        return { data: { user: s.user }, error: null };
      }
    }
  },

  functions: {
    async invoke(nombre: string, opciones: { body?: unknown } = {}) {
      try {
        const r = await fetch(`/api/functions/${nombre}`, {
          method: 'POST', headers: cabeceras({ 'Content-Type': 'application/json' }), body: JSON.stringify(opciones.body ?? {})
        });
        if (!r.ok) return { data: null, error: new ErrorFuncion('Edge Function returned a non-2xx status code', r) };
        return { data: await r.json(), error: null };
      } catch (e) {
        return { data: null, error: { name: 'FunctionsFetchError', message: (e as Error).message } };
      }
    }
  },

  storage: {
    from: (bucket: string) => ({
      async upload(ruta: string, archivo: Blob) {
        try {
          const r = await fetch(`/api/storage/${bucket}/${ruta}`, {
            method: 'PUT', headers: cabeceras({ 'Content-Type': archivo.type || 'application/octet-stream' }), body: archivo
          });
          if (!r.ok) {
            const cuerpo = await r.json().catch(() => ({}));
            return { data: null, error: { message: cuerpo.error ?? `Error al subir (${r.status})` } };
          }
          return { data: { path: ruta }, error: null };
        } catch {
          return { data: null, error: { message: 'No se pudo conectar con el servidor local.' } };
        }
      },
      getPublicUrl(ruta: string) {
        return { data: { publicUrl: bucket === 'student-photos' ? `/fotos/${ruta}` : `/${bucket}/${ruta}` } };
      }
    })
  }
};
