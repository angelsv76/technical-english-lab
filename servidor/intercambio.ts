// Exportar e importar lecciones y cursos completos (un .zip con curso.json y los archivos que usan).
// Sirve para respaldar el contenido, pasarlo a otra instalación y reutilizar el sitio en otras materias.
//
// Importar es en dos pasos: primero se sube el .zip y se muestra qué trae (sin tocar nada);
// después el docente elige a qué semanas va cada lección y se aplica. Lo importado entra como
// borrador por defecto, y lo que reemplaza queda en el historial de versiones.
import type http from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import { closeSync, createWriteStream, existsSync, mkdirSync, openSync, readdirSync, readSync, renameSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  guardarLeccion, leerLeccion, listarLecciones, SEMANA_MAX, SEMANA_MIN, validarLeccion, type Leccion
} from './lecciones.ts';
import { detectarMedio, LIMITE_MAXIMO } from './medios.ts';
import { rutaSegura } from './rutas.ts';
import { ErrorZip, escribirZip, extraerArchivo, extraerBuffer, listarZip, type ItemZip } from './zip.ts';

export class ErrorIntercambio extends Error {
  constructor(public status: number, mensaje: string) { super(mensaje); }
}

const FORMATO = 'technical-english-lab/curso';
const MAX_MANIFIESTO = 5 * 1024 * 1024;
export const MAX_IMPORTACION = 1024 * 1024 * 1024;       // tamaño del .zip
const MAX_DESCOMPRIMIDO = 1536 * 1024 * 1024;            // suma declarada de todos los archivos
const MAX_EXPORTACION = 2.5 * 1024 * 1024 * 1024;
const TOPE_DESCARTE = 16 * 1024 * 1024;
const VIGENCIA_STAGING_MS = 2 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const RUTA_ARCHIVO = /^\/(medios|audio)\/[A-Za-z0-9._\-/]+$/;

export interface ContextoIntercambio {
  db: DatabaseSync; dirDatos: string; dirAudio: string; ahora: () => Date;
}

// ---------- recorrer los archivos que usa una lección ----------

type Bloques = Leccion['blocks'];

/** Copia de la lección con cada ruta de archivo transformada por `f` ('' la quita). */
function mapearSrc(l: Leccion, f: (src: string) => string): Leccion {
  const copia: Leccion = JSON.parse(JSON.stringify(l));
  for (const b of copia.blocks as unknown as Record<string, any>[]) {
    for (const campo of ['src']) if (typeof b[campo] === 'string' && b[campo]) b[campo] = f(b[campo]);
    if (b.type === 'vocabulario') {
      for (const it of b.items) for (const campo of ['audio', 'audioEjemplo']) if (it[campo]) it[campo] = f(it[campo]);
    }
    for (const campo of ['src']) if (b[campo] === '') delete b[campo];
  }
  return copia;
}

function srcsDe(l: Leccion): string[] {
  const salida = new Set<string>();
  mapearSrc(l, s => { salida.add(s); return s; });
  return [...salida];
}

const nombreArchivo = (prefijo: string, ahora: Date) =>
  `${prefijo}-${ahora.toISOString().slice(0, 10)}.zip`;

// ---------- exportar ----------

export interface Exportacion { nombre: string; items: ItemZip[]; lecciones: number; archivos: number; faltantes: string[] }

export function prepararExportacion(c: ContextoIntercambio, semanas: number[]): Exportacion {
  const lecciones: Leccion[] = [];
  for (const s of semanas) {
    const l = leerLeccion(c.db, s, true);
    if (l) lecciones.push(l);
  }
  if (lecciones.length === 0) throw new ErrorIntercambio(404, 'No hay lecciones para exportar.');

  const ruta = (src: string) => src.startsWith('/medios/')
    ? rutaSegura(join(c.dirDatos, 'medios'), src.slice('/medios/'.length))
    : src.startsWith('/audio/') ? rutaSegura(c.dirAudio, src.slice('/audio/'.length)) : null;

  const items: ItemZip[] = [];
  const archivos: { entrada: string; src: string }[] = [];
  const faltantes: string[] = [];
  let total = 0;
  for (const src of new Set(lecciones.flatMap(srcsDe))) {
    const disco = RUTA_ARCHIVO.test(src) ? ruta(src) : null;
    if (!disco || !existsSync(disco) || !statSync(disco).isFile()) { faltantes.push(src); continue; }
    const tamano = statSync(disco).size;
    total += tamano;
    if (total > MAX_EXPORTACION) throw new ErrorIntercambio(413, 'Los archivos del curso superan el máximo exportable (2.5 GB). Exporta por partes.');
    const ext = (src.match(/\.([A-Za-z0-9]{2,4})$/)?.[1] ?? 'bin').toLowerCase();
    const entrada = `archivos/${String(archivos.length + 1).padStart(4, '0')}.${ext}`;
    archivos.push({ entrada, src });
    items.push({ nombre: entrada, archivo: disco, tamano });
  }

  const manifiesto = {
    formato: FORMATO, version: 1, creado: c.ahora().toISOString(),
    lecciones: lecciones.map(({ updated_at, ...resto }) => resto), archivos, faltantes
  };
  items.unshift({ nombre: 'curso.json', datos: Buffer.from(JSON.stringify(manifiesto, null, 1), 'utf8') });
  const nombre = lecciones.length === 1 ? nombreArchivo(`leccion-semana-${String(lecciones[0].week).padStart(2, '0')}`, c.ahora()) : nombreArchivo('curso', c.ahora());
  return { nombre, items, lecciones: lecciones.length, archivos: archivos.length, faltantes };
}

export const escribirExportacion = (salida: http.ServerResponse, e: Exportacion, ahora: Date) => escribirZip(salida, e.items, ahora);

// ---------- importar: paso 1 (subir y mostrar qué trae) ----------

const carpetaStaging = (dirDatos: string) => join(dirDatos, 'importaciones');

function limpiarStaging(dirDatos: string, ahora: number) {
  const carpeta = carpetaStaging(dirDatos);
  if (!existsSync(carpeta)) return;
  for (const f of readdirSync(carpeta)) {
    try { if (ahora - statSync(join(carpeta, f)).mtimeMs > VIGENCIA_STAGING_MS) rmSync(join(carpeta, f), { force: true }); } catch { /* otro proceso lo borró */ }
  }
}

async function guardarEnDisco(req: http.IncomingMessage, destino: string, max: number): Promise<number> {
  const salida = createWriteStream(destino);
  let total = 0, excedido = false;
  try {
    for await (const parte of req as AsyncIterable<Buffer>) {
      total += parte.length;
      if (excedido) { if (total > max + TOPE_DESCARTE) break; continue; }
      if (total > max) { excedido = true; continue; }
      await new Promise<void>((ok, mal) => salida.write(parte, e => (e ? mal(e) : ok())));
    }
  } finally { await new Promise<void>(ok => salida.end(ok)); }
  if (excedido) { rmSync(destino, { force: true }); throw new ErrorIntercambio(413, 'El archivo supera el límite de 1 GB.'); }
  return total;
}

interface Manifiesto {
  lecciones: Leccion[]; archivos: { entrada: string; src: string }[]; creado: string; faltantes: string[];
}

function leerManifiesto(zip: string): Manifiesto {
  let entradas;
  try { entradas = listarZip(zip); } catch (e) { throw new ErrorIntercambio(400, e instanceof ErrorZip ? e.message : 'No se pudo leer el ZIP.'); }
  const nombres = entradas.map(e => e.nombre);
  if (new Set(nombres).size !== nombres.length) throw new ErrorIntercambio(400, 'El ZIP tiene archivos repetidos.');
  if (entradas.reduce((s, e) => s + e.tamReal, 0) > MAX_DESCOMPRIMIDO) throw new ErrorIntercambio(413, 'El contenido del ZIP es demasiado grande.');
  const entrada = entradas.find(e => e.nombre === 'curso.json');
  if (!entrada) throw new ErrorIntercambio(400, 'Este ZIP no es un curso exportado (falta curso.json).');

  let bruto: any;
  try { bruto = JSON.parse(extraerBuffer(zip, entrada, MAX_MANIFIESTO).toString('utf8')); }
  catch (e) { throw new ErrorIntercambio(400, e instanceof ErrorZip ? e.message : 'curso.json no es un JSON válido.'); }
  if (bruto?.formato !== FORMATO || bruto?.version !== 1) throw new ErrorIntercambio(400, 'El archivo no tiene el formato de Technical English Lab (versión 1).');
  if (!Array.isArray(bruto.lecciones) || bruto.lecciones.length === 0 || bruto.lecciones.length > SEMANA_MAX) {
    throw new ErrorIntercambio(400, 'El curso no trae lecciones válidas.');
  }

  const lecciones: Leccion[] = [];
  const semanas = new Set<number>();
  for (const l of bruto.lecciones) {
    const v = validarLeccion(l, l?.week);
    if (!v.ok || !v.valor) throw new ErrorIntercambio(400, `Semana ${l?.week}: ${v.error}`);
    if (semanas.has(v.valor.week)) throw new ErrorIntercambio(400, `La semana ${v.valor.week} aparece dos veces en el archivo.`);
    semanas.add(v.valor.week);
    lecciones.push(v.valor);
  }

  const archivos = Array.isArray(bruto.archivos) ? bruto.archivos : [];
  for (const a of archivos) {
    if (typeof a?.entrada !== 'string' || !/^archivos\/\d{4}\.[a-z0-9]{2,4}$/.test(a.entrada) || !nombres.includes(a.entrada) ||
        typeof a?.src !== 'string' || !RUTA_ARCHIVO.test(a.src) || a.src.includes('..')) {
      throw new ErrorIntercambio(400, 'La lista de archivos del curso no es válida.');
    }
  }
  return {
    lecciones, archivos, creado: typeof bruto.creado === 'string' ? bruto.creado.slice(0, 40) : '',
    faltantes: Array.isArray(bruto.faltantes) ? bruto.faltantes.filter((f: unknown) => typeof f === 'string').slice(0, 200) : []
  };
}

export async function recibirImportacion(c: ContextoIntercambio, req: http.IncomingMessage) {
  const carpeta = carpetaStaging(c.dirDatos);
  mkdirSync(carpeta, { recursive: true });
  limpiarStaging(c.dirDatos, c.ahora().getTime());
  const id = randomUUID();
  const zip = join(carpeta, `${id}.zip`);
  const bytes = await guardarEnDisco(req, zip, MAX_IMPORTACION);
  try {
    const fd = openSync(zip, 'r');
    const cabeza = Buffer.alloc(4);
    try { readSync(fd, cabeza, 0, 4, 0); } finally { closeSync(fd); }
    if (bytes < 22 || cabeza.toString('latin1') !== 'PK\x03\x04') throw new ErrorIntercambio(400, 'El archivo no es un ZIP.');
    const m = leerManifiesto(zip);
    const semanas = Array.from({ length: SEMANA_MAX - SEMANA_MIN + 1 }, (_, i) => {
      const week = SEMANA_MIN + i;
      const existente = listarLecciones(c.db, true).find(l => l.week === week);
      const notas = (c.db.prepare('SELECT COUNT(*) AS n FROM weekly_progress WHERE week_number = ?').get(week) as { n: number }).n;
      return { week, title: existente?.title ?? null, notas };
    });
    return {
      id, bytes, creado: m.creado, archivos: m.archivos.length, faltantes: m.faltantes.length,
      lecciones: m.lecciones.map(l => ({
        week: l.week, title: l.title, status: l.status, bloques: l.blocks.length,
        preguntasEvaluacion: l.blocks.reduce((s, b) => s + (b.type === 'evaluacion' ? b.preguntas.length : 0), 0),
        archivos: srcsDe(l).length
      })),
      semanas
    };
  } catch (e) {
    rmSync(zip, { force: true });
    throw e;
  }
}

// ---------- importar: paso 2 (aplicar) ----------

export interface Destino { origen: number; destino: number }

export async function aplicarImportacion(c: ContextoIntercambio, id: unknown, destinos: unknown, estado: unknown) {
  if (typeof id !== 'string' || !UUID.test(id)) throw new ErrorIntercambio(400, 'Importación no válida.');
  const zip = join(carpetaStaging(c.dirDatos), `${id}.zip`);
  if (!existsSync(zip)) throw new ErrorIntercambio(404, 'La importación venció. Sube el archivo otra vez.');
  if (estado !== 'draft' && estado !== 'published' && estado !== 'conservar') throw new ErrorIntercambio(400, 'Estado no válido.');
  if (!Array.isArray(destinos) || destinos.length === 0 || destinos.length > SEMANA_MAX) throw new ErrorIntercambio(400, 'Elige al menos una lección.');

  const m = leerManifiesto(zip);
  const elegidas: Destino[] = destinos.map((d: any) => ({ origen: d?.origen, destino: d?.destino }));
  const usados = new Set<number>();
  for (const d of elegidas) {
    if (!m.lecciones.some(l => l.week === d.origen)) throw new ErrorIntercambio(400, `La semana ${d.origen} no está en el archivo.`);
    if (!Number.isInteger(d.destino) || d.destino < SEMANA_MIN || d.destino > SEMANA_MAX) throw new ErrorIntercambio(400, 'Semana de destino no válida.');
    if (usados.has(d.destino)) throw new ErrorIntercambio(400, `Dos lecciones irían a la semana ${d.destino}.`);
    usados.add(d.destino);
  }

  const entradas = listarZip(zip);
  const creados: string[] = [];
  const dirMedios = join(c.dirDatos, 'medios');
  mkdirSync(dirMedios, { recursive: true });
  const advertencias: string[] = [];
  try {
    // 1) copiar a /medios solo los archivos que usan las lecciones elegidas
    const necesarios = new Set(elegidas.flatMap(d => srcsDe(m.lecciones.find(l => l.week === d.origen)!)));
    const nuevaRuta = new Map<string, string>();
    for (const a of m.archivos) {
      if (!necesarios.has(a.src)) continue;
      const entrada = entradas.find(e => e.nombre === a.entrada)!;
      const parcial = join(dirMedios, `${randomUUID()}.part`);
      creados.push(parcial);
      try { await extraerArchivo(zip, entrada, parcial, LIMITE_MAXIMO); }
      catch (e) { throw new ErrorIntercambio(400, e instanceof ErrorZip ? e.message : 'No se pudo extraer un archivo.'); }
      const fd = openSync(parcial, 'r');
      const cabeza = Buffer.alloc(16);
      let leidos = 0;
      try { leidos = readSync(fd, cabeza, 0, 16, 0); } finally { closeSync(fd); }
      const info = detectarMedio(cabeza.subarray(0, leidos));
      if (!info) throw new ErrorIntercambio(400, `El archivo ${a.src} no es un formato permitido.`);
      if (statSync(parcial).size > info.max) throw new ErrorIntercambio(400, `El archivo ${a.src} supera el límite para ${info.tipo}.`);
      const final = join(dirMedios, `${randomUUID()}.${info.ext}`);
      renameSync(parcial, final);
      creados.splice(creados.indexOf(parcial), 1, final);
      nuevaRuta.set(a.src, `/medios/${final.slice(dirMedios.length + 1).replace(/\\/g, '/')}`);
    }

    // 2) reescribir las rutas, validar todo antes de guardar nada
    const listas: Leccion[] = [];
    for (const d of elegidas) {
      const original = m.lecciones.find(l => l.week === d.origen)!;
      let perdidos = 0;
      const reescrita = mapearSrc(original, src => { const n = nuevaRuta.get(src); if (!n) perdidos++; return n ?? ''; });
      const v = validarLeccion({ ...reescrita, status: estado === 'conservar' ? original.status : estado }, d.destino);
      if (!v.ok || !v.valor) {
        throw new ErrorIntercambio(400, `La semana ${d.origen} usa archivos que no vienen en el ZIP (${perdidos}). ${v.error}`);
      }
      if (perdidos > 0) advertencias.push(`Semana ${d.origen}: ${perdidos} archivo(s) de audio no venían en el ZIP y se quitaron.`);
      listas.push(v.valor);
    }

    // 3) guardar (cada reemplazo deja la versión anterior en el historial)
    for (const l of listas) guardarLeccion(c.db, l, c.ahora());
    rmSync(zip, { force: true });
    return {
      importadas: listas.map(l => ({ week: l.week, title: l.title, status: l.status })),
      archivos: nuevaRuta.size, advertencias
    };
  } catch (e) {
    for (const f of creados) rmSync(f, { force: true });
    throw e;
  }
}
