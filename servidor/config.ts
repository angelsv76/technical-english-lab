import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as cargarEnv } from 'dotenv';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Variables del servidor (p. ej. GEMINI_API_KEY) viven en .env.local, que no se sube a git.
cargarEnv({ path: join(RAIZ, '.env.local'), quiet: true });

export const DIR_DATOS = resolve(process.env.DATA_DIR || join(RAIZ, 'datos'));
export const RUTA_BASE = join(DIR_DATOS, 'laboratorio.db');
export const RUTA_SECRETO = join(DIR_DATOS, 'secreto.key');
export const DIR_DIST = join(RAIZ, 'dist-local');
export const DIR_AUDIO = join(RAIZ, 'audio-upload');
export const PUERTO = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || '0.0.0.0';
export const GEMINI_KEY = process.env.GEMINI_API_KEY || undefined;
export const GEMINI_MODELO = process.env.GEMINI_MODEL || undefined;
/** SEMBRAR_LECCIONES=0 arranca sin las 40 semanas de inglés (para otra materia; luego se importa un curso). */
export const SEMBRAR = process.env.SEMBRAR_LECCIONES !== '0';
