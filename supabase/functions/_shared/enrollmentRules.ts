// Reglas puras (sin red ni base de datos) de inscripción y gestión de alumnos.
// Se usan desde las Edge Functions y se prueban con scripts/test-enrollment.ts.

const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ALFABETO_CLAVE = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Sin unión discriminada: el proyecto no usa "strict" y TS no la estrecharía.
export type Resultado<T> = { ok: boolean; valor?: T; error?: string };

export interface Inscripcion {
  nie: string;
  nombre: string;
  grupo: string;
  password: string;
  codigo: string;
}

export interface FilaImportacion {
  nie: string;
  nombre: string;
  grupo: string;
}

export const MAX_FILAS_IMPORTACION = 100;

/** Texto aleatorio sin sesgo de módulo (rechaza bytes que sesgarían el reparto). */
function aleatorio(alfabeto: string, largo: number): string {
  const limite = 256 - (256 % alfabeto.length);
  let salida = "";
  while (salida.length < largo) {
    for (const byte of crypto.getRandomValues(new Uint8Array(largo * 2))) {
      if (byte < limite && salida.length < largo) salida += alfabeto[byte % alfabeto.length];
    }
  }
  return salida;
}

/** Código de inscripción legible: sin 0/O/1/I/L, formato XXXX-XXXX. */
export function generarCodigo(): string {
  const c = aleatorio(ALFABETO_CODIGO, 8);
  return `${c.slice(0, 4)}-${c.slice(4)}`;
}

/** Contraseña inicial de 10 caracteres, sin caracteres que se confundan en papel. */
export function generarClave(): string {
  return aleatorio(ALFABETO_CLAVE, 10);
}

export function normalizarCodigo(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Comparación en tiempo constante sobre códigos ya normalizados. */
export function codigosIguales(a: string, b: string): boolean {
  const x = normalizarCodigo(a);
  const y = normalizarCodigo(b);
  let diferencia = x.length ^ y.length;
  const largo = Math.max(x.length, y.length);
  for (let i = 0; i < largo; i++) {
    diferencia |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diferencia === 0;
}

export function normalizarNombre(valor: string): string {
  return valor.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function validarNie(valor: unknown): Resultado<string> {
  const nie = typeof valor === "string" ? valor.trim() : "";
  if (!/^\d{4,12}$/.test(nie)) return { ok: false, error: "El NIE debe tener entre 4 y 12 dígitos." };
  return { ok: true, valor: nie };
}

export function validarGrupo(valor: unknown): Resultado<string> {
  const grupo = typeof valor === "string" ? valor.trim().toUpperCase() : "";
  if (!/^[A-Z0-9]{2,12}$/.test(grupo)) return { ok: false, error: "Grupo no válido." };
  return { ok: true, valor: grupo };
}

export function validarNombre(valor: unknown): Resultado<string> {
  const nombre = typeof valor === "string" ? normalizarNombre(valor) : "";
  if (!/^[\p{L}][\p{L}\s.'’-]{2,119}$/u.test(nombre)) {
    return { ok: false, error: "Escribe tu nombre completo, solo con letras." };
  }
  return { ok: true, valor: nombre };
}

const CLAVES_COMUNES = new Set(["12345678", "123456789", "1234567890", "password", "contraseña", "qwertyui"]);

export function validarPassword(valor: unknown, nie: string): Resultado<string> {
  const password = typeof valor === "string" ? valor : "";
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  if (password.length > 72) return { ok: false, error: "La contraseña es demasiado larga (máximo 72)." };
  if (/^(.)\1+$/.test(password)) return { ok: false, error: "La contraseña no puede repetir el mismo carácter." };
  if (CLAVES_COMUNES.has(password.toLowerCase())) return { ok: false, error: "Esa contraseña es demasiado común." };
  if (nie && password.includes(nie)) return { ok: false, error: "La contraseña no puede contener tu NIE." };
  return { ok: true, valor: password };
}

export function validarInscripcion(crudo: unknown): Resultado<Inscripcion> {
  if (!crudo || typeof crudo !== "object") return { ok: false, error: "Solicitud inválida." };
  const c = crudo as Record<string, unknown>;

  const nie = validarNie(c.nie);
  if (!nie.ok) return { ok: false, error: nie.error };
  const nombre = validarNombre(c.nombre);
  if (!nombre.ok) return { ok: false, error: nombre.error };
  const grupo = validarGrupo(c.grupo);
  if (!grupo.ok) return { ok: false, error: grupo.error };
  const password = validarPassword(c.password, nie.valor);
  if (!password.ok) return { ok: false, error: password.error };
  const codigo = typeof c.codigo === "string" ? c.codigo : "";
  if (normalizarCodigo(codigo).length < 6 || codigo.length > 40) {
    return { ok: false, error: "Escribe el código de inscripción que te dio tu docente." };
  }

  return {
    ok: true,
    valor: { nie: nie.valor, nombre: nombre.valor, grupo: grupo.valor, password: password.valor, codigo }
  };
}

export function validarFilasImportacion(crudo: unknown): Resultado<FilaImportacion[]> {
  if (!Array.isArray(crudo) || crudo.length === 0) return { ok: false, error: "No hay filas para importar." };
  if (crudo.length > MAX_FILAS_IMPORTACION) {
    return { ok: false, error: `Máximo ${MAX_FILAS_IMPORTACION} alumnos por importación.` };
  }
  const filas: FilaImportacion[] = [];
  const vistos = new Set<string>();
  for (let i = 0; i < crudo.length; i++) {
    const fila = (crudo[i] ?? {}) as Record<string, unknown>;
    const nie = validarNie(fila.nie);
    const nombre = validarNombre(fila.nombre);
    const grupo = validarGrupo(fila.grupo);
    if (!nie.ok || !nombre.ok || !grupo.ok) {
      const motivo = !nie.ok ? nie.error : !nombre.ok ? nombre.error : grupo.error;
      return { ok: false, error: `Fila ${i + 1}: ${motivo}` };
    }
    if (vistos.has(nie.valor)) return { ok: false, error: `Fila ${i + 1}: NIE repetido (${nie.valor}).` };
    vistos.add(nie.valor);
    filas.push({ nie: nie.valor, nombre: nombre.valor, grupo: grupo.valor });
  }
  return { ok: true, valor: filas };
}

/** Días de vigencia de un código: entero entre 1 y 60 (por defecto 14). */
export function validarDiasVigencia(valor: unknown): number {
  const dias = typeof valor === "number" ? Math.floor(valor) : 14;
  return Math.min(60, Math.max(1, Number.isFinite(dias) ? dias : 14));
}

export const correoDeNie = (nie: string) => `${nie}@inti.edu.sv`;
