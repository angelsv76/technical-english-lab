// Servidor local: API (/api/*), fotos, audios y la app ya construida, en un solo puerto.
import http from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { abrirBase } from './db.ts';
import { ejecutar, type Identidad } from './datos.ts';
import {
  enviarEvaluacion, generarContenido, gestionarAlumnos, inscribirAlumno, verificarReporte,
  type Contexto, type Resp
} from './funciones.ts';
import { firmarSesion, leerSesion, verificarPassword } from './seguridad.ts';

export interface Opciones {
  rutaBase: string;      // archivo SQLite (o ':memory:')
  dirDatos: string;      // fotos y secreto
  dirDist: string;       // la app construida
  dirAudio: string;      // mp3 de vocabulario y oraciones
  secreto: string;       // clave de firma de sesiones
  geminiKey?: string;
  geminiModelo?: string;
  ahora?: () => Date;
  duracionSesionSeg?: number;
}

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.woff2': 'font/woff2', '.map': 'application/json'
};

const LIMITES_FUNCION: Record<string, number> = {
  'submit-evaluation': 20_000, 'generate-content': 20_000, 'enroll-student': 4_000, 'manage-students': 60_000
};

const MAX_FOTO = 3 * 1024 * 1024;

/** Extensión según los primeros bytes (no se confía en el nombre ni en el Content-Type). */
function tipoImagen(d: Buffer): 'png' | 'jpg' | 'webp' | null {
  if (d.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return 'png';
  if (d.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (d.subarray(0, 4).toString('latin1') === 'RIFF' && d.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}
const TOPE_DESCARTE = 16 * 1024 * 1024; // lo máximo que se lee de una petición demasiado grande antes de cortarla
const VENTANA_LOGIN_MS = 15 * 60 * 1000;
const MAX_FALLOS_CUENTA = 8;   // por correo: frena adivinar la contraseña de un alumno
const MAX_FALLOS_IP = 60;      // por IP: más holgado, porque un salón puede salir por una sola IP

class ErrorHttp extends Error {
  constructor(public status: number, mensaje: string) { super(mensaje); }
}

function leerCuerpo(req: http.IncomingMessage, limite: number): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    const partes: Buffer[] = [];
    let total = 0;
    req.on('data', (parte: Buffer) => {
      total += parte.length;
      if (total > limite + TOPE_DESCARTE) { req.destroy(); return; } // flujo sin fin: se corta
      if (total <= limite) partes.push(parte);                       // el exceso se lee y se descarta
    });
    req.on('end', () => (total > limite ? rechazar(new ErrorHttp(413, 'solicitud demasiado larga')) : resolver(Buffer.concat(partes))));
    req.on('error', rechazar);
  });
}

async function leerJson(req: http.IncomingMessage, limite: number): Promise<any> {
  const texto = (await leerCuerpo(req, limite)).toString('utf8');
  if (!texto) return {};
  try { return JSON.parse(texto); } catch { throw new ErrorHttp(400, 'JSON inválido'); }
}

/** Une una ruta de la URL a una carpeta raíz sin permitir salirse de ella. */
function rutaSegura(raiz: string, rutaUrl: string): string | null {
  let decodificada: string;
  try { decodificada = decodeURIComponent(rutaUrl); } catch { return null; }
  const destino = resolve(join(raiz, normalize(decodificada)));
  return destino === resolve(raiz) || destino.startsWith(resolve(raiz) + sep) ? destino : null;
}

export function crearServidor(op: Opciones): { servidor: http.Server; db: DatabaseSync } {
  const db = abrirBase(op.rutaBase);
  const ahora = op.ahora ?? (() => new Date());
  const duracion = op.duracionSesionSeg ?? 7 * 24 * 3600;
  const dirFotos = join(op.dirDatos, 'fotos');
  const fallosLogin = new Map<string, number[]>();

  const demasiadosFallos = (clave: string, maximo: number) => {
    const desde = ahora().getTime() - VENTANA_LOGIN_MS;
    const recientes = (fallosLogin.get(clave) ?? []).filter(t => t > desde);
    fallosLogin.set(clave, recientes);
    return recientes.length >= maximo;
  };
  const anotarFallo = (clave: string) => fallosLogin.set(clave, [...(fallosLogin.get(clave) ?? []), ahora().getTime()]);

  type Usuario = { id: string; email: string; role: 'student' | 'teacher' };
  const usuarioDe = (req: http.IncomingMessage): Usuario | null => {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    const carga = token ? leerSesion(token, op.secreto, ahora().getTime()) : null;
    if (!carga) return null;
    // Se comprueba en la base en cada petición: borrar la cuenta corta el acceso al instante.
    return (db.prepare('SELECT id, email, role FROM auth_users WHERE id = ?').get(carga.sub) as Usuario | undefined) ?? null;
  };

  const identidadDe = (usuario: Usuario | null): Identidad => {
    if (!usuario) return { rol: 'anon' };
    if (usuario.role === 'teacher') return { rol: 'teacher' };
    const nie = usuario.email.split('@')[0];
    const alumno = db.prepare('SELECT id, active FROM students WHERE nie = ?').get(nie) as { id: string; active: number } | undefined;
    return alumno ? { rol: 'student', studentId: alumno.id, active: alumno.active === 1 } : { rol: 'student' };
  };

  const responder = (res: http.ServerResponse, status: number, cuerpo: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(cuerpo));
  };

  const servirArchivo = (res: http.ServerResponse, archivo: string, cache: string): boolean => {
    if (!existsSync(archivo) || !statSync(archivo).isFile()) return false;
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': statSync(archivo).size,
      'Cache-Control': cache
    });
    createReadStream(archivo).pipe(res);
    return true;
  };

  async function api(req: http.IncomingMessage, res: http.ServerResponse, ruta: string) {
    const usuario = usuarioDe(req);
    const ident = identidadDe(usuario);

    if (ruta === '/api/salud') return responder(res, 200, { ok: true });

    if (ruta === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await leerJson(req, 2_000);
      if (typeof email !== 'string' || typeof password !== 'string' || password.length > 200) {
        return responder(res, 400, { error: 'invalid_credentials' });
      }
      const correo = email.trim().toLowerCase();
      const ip = req.socket.remoteAddress ?? '?';
      if (demasiadosFallos(`e:${correo}`, MAX_FALLOS_CUENTA) || demasiadosFallos(`i:${ip}`, MAX_FALLOS_IP)) {
        return responder(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
      }
      const fila = db.prepare('SELECT id, email, password_hash, role FROM auth_users WHERE email = ?').get(correo) as any;
      // Siempre se calcula un hash, exista o no la cuenta, para no revelar qué NIE existen por el tiempo de respuesta.
      const valido = verificarPassword(password, fila?.password_hash ?? 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(86) + '==');
      if (!fila || !valido) {
        anotarFallo(`e:${correo}`); anotarFallo(`i:${ip}`);
        return responder(res, 400, { error: 'invalid_credentials' });
      }
      fallosLogin.delete(`e:${correo}`);
      const { token, expiraEn } = firmarSesion({ sub: fila.id, email: fila.email, role: fila.role }, op.secreto, duracion, ahora().getTime());
      return responder(res, 200, {
        access_token: token, expires_at: expiraEn,
        user: { id: fila.id, email: fila.email, app_metadata: { role: fila.role }, user_metadata: {} }
      });
    }

    if (ruta === '/api/auth/user' && req.method === 'GET') {
      if (!usuario) return responder(res, 401, { error: 'Auth session missing' });
      return responder(res, 200, { user: { id: usuario.id, email: usuario.email, app_metadata: { role: usuario.role }, user_metadata: {} } });
    }

    if (ruta === '/api/db' && req.method === 'POST') {
      return responder(res, 200, ejecutar(db, ident, await leerJson(req, 1_000_000)));
    }

    const funcion = ruta.match(/^\/api\/functions\/([a-z-]+)$/);
    if (funcion && req.method === 'POST') {
      const nombre = funcion[1];
      if (!(nombre in LIMITES_FUNCION)) return responder(res, 404, { error: 'función no encontrada' });
      const cuerpo = await leerJson(req, LIMITES_FUNCION[nombre]);
      const ctx: Contexto = { db, ident, ahora, dirDatos: op.dirDatos, geminiKey: op.geminiKey, geminiModelo: op.geminiModelo };
      const r: Resp =
        nombre === 'submit-evaluation' ? enviarEvaluacion(ctx, cuerpo)
        : nombre === 'generate-content' ? await generarContenido(ctx, cuerpo)
        : nombre === 'enroll-student' ? await inscribirAlumno(ctx, cuerpo)
        : gestionarAlumnos(ctx, cuerpo);
      return responder(res, r.status, r.body);
    }

    const verificar = ruta.match(/^\/api\/verificar\/([^/]{1,200})$/);
    if (verificar && req.method === 'GET') {
      const r = verificarReporte(db, verificar[1]);
      return responder(res, r.status, r.body);
    }

    const foto = ruta.match(/^\/api\/storage\/student-photos\/([0-9a-f-]{36})\/avatar\.(png|jpe?g|webp)$/i);
    if (foto && req.method === 'PUT') {
      if (ident.rol !== 'teacher') return responder(res, 401, { error: 'Solo el docente puede subir fotos.' });
      const datos = await leerCuerpo(req, MAX_FOTO);
      if (!tipoImagen(datos)) return responder(res, 400, { error: 'El archivo no es una imagen válida.' });

      const carpeta = join(dirFotos, foto[1].toLowerCase());
      mkdirSync(carpeta, { recursive: true });
      for (const previo of readdirSync(carpeta)) if (previo.startsWith('avatar.')) rmSync(join(carpeta, previo));
      const ext = foto[2].toLowerCase();
      writeFileSync(join(carpeta, `avatar.${ext}`), datos);
      return responder(res, 200, { path: `${foto[1]}/avatar.${ext}` });
    }

    // El alumno propone su foto; no se ve hasta que el docente la apruebe.
    if (ruta === '/api/foto-propuesta' && req.method === 'PUT') {
      if (ident.rol !== 'student' || !ident.studentId || !ident.active) return responder(res, 401, { error: 'Inicia sesión como alumno.' });
      const datos = await leerCuerpo(req, MAX_FOTO);
      const ext = tipoImagen(datos);
      if (!ext) return responder(res, 400, { error: 'El archivo no es una imagen válida (PNG, JPG o WebP).' });
      const carpeta = join(op.dirDatos, 'fotos-pendientes', ident.studentId);
      rmSync(carpeta, { recursive: true, force: true });
      mkdirSync(carpeta, { recursive: true });
      writeFileSync(join(carpeta, `propuesta.${ext}`), datos);
      db.prepare('UPDATE students SET photo_pending = ? WHERE id = ?').run(ext, ident.studentId);
      return responder(res, 200, { ok: true });
    }

    const pendiente = ruta.match(/^\/api\/fotos-pendientes\/([0-9a-f-]{36})$/i);
    if (pendiente && req.method === 'GET') {
      if (ident.rol !== 'teacher') return responder(res, 401, { error: 'Solo el docente puede ver fotos pendientes.' });
      const id = pendiente[1].toLowerCase();
      const fila = db.prepare('SELECT photo_pending FROM students WHERE id = ?').get(id) as { photo_pending: string | null } | undefined;
      const archivo = fila?.photo_pending ? join(op.dirDatos, 'fotos-pendientes', id, `propuesta.${fila.photo_pending}`) : null;
      if (archivo && servirArchivo(res, archivo, 'no-store')) return;
      return responder(res, 404, { error: 'Sin foto pendiente' });
    }

    return responder(res, 404, { error: 'No encontrado' });
  }

  const servidor = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const ruta = url.pathname;

      if (ruta.startsWith('/api/')) return await api(req, res, ruta);

      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }

      if (ruta.startsWith('/audio/')) {
        const archivo = rutaSegura(op.dirAudio, ruta.slice('/audio/'.length));
        if (archivo && servirArchivo(res, archivo, 'public, max-age=86400')) return;
        res.writeHead(404).end('No encontrado'); return;
      }
      if (ruta.startsWith('/fotos/')) {
        const archivo = rutaSegura(dirFotos, ruta.slice('/fotos/'.length));
        if (archivo && servirArchivo(res, archivo, 'no-cache')) return;
        res.writeHead(404).end('No encontrado'); return;
      }

      const archivo = ruta === '/' ? null : rutaSegura(op.dirDist, ruta);
      if (archivo && servirArchivo(res, archivo, ruta.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')) return;
      if (extname(ruta)) { res.writeHead(404).end('No encontrado'); return; } // archivo con extensión que no existe
      if (!servirArchivo(res, join(op.dirDist, 'index.html'), 'no-cache')) {
        res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
          .end('La app no está construida. Ejecuta: npm run build:local');
      }
    } catch (error) {
      if (error instanceof ErrorHttp) return responder(res, error.status, { error: error.message });
      console.error('Error:', error);
      if (!res.headersSent) responder(res, 500, { error: 'Error interno' });
    }
  });

  return { servidor, db };
}
