// Contraseñas (scrypt) y sesiones (JWT HS256) con solo node:crypto, sin dependencias.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function hashPassword(password: string): string {
  const sal = randomBytes(16);
  const hash = scryptSync(password, sal, 64);
  return `scrypt$${sal.toString('base64')}$${hash.toString('base64')}`;
}

export function verificarPassword(password: string, guardado: string): boolean {
  const [esquema, sal, hash] = guardado.split('$');
  if (esquema !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const calculado = scryptSync(password, Buffer.from(sal, 'base64'), esperado.length);
  return timingSafeEqual(calculado, esperado);
}

const b64url = (datos: Buffer | string) =>
  Buffer.from(datos).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

export interface CargaSesion {
  sub: string;       // id de auth_users
  email: string;
  role: 'student' | 'teacher';
  iat: number;
  exp: number;
}

export function firmarSesion(
  carga: Omit<CargaSesion, 'iat' | 'exp'>,
  secreto: string,
  duracionSeg: number,
  ahoraMs = Date.now()
): { token: string; expiraEn: number } {
  const iat = Math.floor(ahoraMs / 1000);
  const exp = iat + duracionSeg;
  const cabecera = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const cuerpo = b64url(JSON.stringify({ ...carga, iat, exp }));
  const firma = b64url(createHmac('sha256', secreto).update(`${cabecera}.${cuerpo}`).digest());
  return { token: `${cabecera}.${cuerpo}.${firma}`, expiraEn: exp };
}

export function leerSesion(token: string, secreto: string, ahoraMs = Date.now()): CargaSesion | null {
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  const [cabecera, cuerpo, firma] = partes;
  const esperada = createHmac('sha256', secreto).update(`${cabecera}.${cuerpo}`).digest();
  const recibida = Buffer.from(firma.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return null;
  try {
    const carga = JSON.parse(Buffer.from(cuerpo.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    if (typeof carga.exp !== 'number' || carga.exp * 1000 <= ahoraMs) return null;
    return carga as CargaSesion;
  } catch {
    return null;
  }
}

/** Secreto de firma: se genera una vez y se guarda en la carpeta de datos. */
export function cargarSecreto(ruta: string): string {
  if (existsSync(ruta)) return readFileSync(ruta, 'utf8').trim();
  mkdirSync(dirname(ruta), { recursive: true });
  const secreto = randomBytes(32).toString('hex');
  writeFileSync(ruta, secreto, { mode: 0o600 });
  return secreto;
}
