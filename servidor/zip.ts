// ZIP mínimo para exportar e importar cursos, sin dependencias.
// Escritura: texto comprimido (deflate) y archivos sin comprimir (los mp3, mp4, png ya vienen comprimidos).
// Lectura: solo lo que escribe este mismo módulo más lo que producen los programas comunes (sin cifrado ni ZIP64).
// Los nombres de las entradas nunca se usan como ruta en disco: quien importa decide dónde guardar cada archivo.
import { closeSync, createReadStream, createWriteStream, fstatSync, openSync, readSync } from 'node:fs';
import { Transform, type Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { crc32, deflateRawSync, inflateRawSync, createInflateRaw } from 'node:zlib';

export class ErrorZip extends Error {}

export interface EntradaZip {
  nombre: string; metodo: 0 | 8; tamComprimido: number; tamReal: number; crc: number; offset: number;
}

export const MAX_ENTRADAS = 2000;

const fechaDos = (d: Date) => ({
  hora: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
  fecha: (((d.getFullYear() - 1980) & 0x7f) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
});

/** CRC-32 de un archivo, leyéndolo por partes. */
export async function crcDeArchivo(ruta: string): Promise<number> {
  let crc = 0;
  for await (const parte of createReadStream(ruta)) crc = crc32(parte as Buffer, crc);
  return crc >>> 0;
}

export type ItemZip = { nombre: string; datos: Buffer } | { nombre: string; archivo: string; tamano: number };

/** Escribe el ZIP completo en `salida` (por ejemplo, la respuesta HTTP) sin cargar los archivos en memoria. */
export async function escribirZip(salida: Writable, items: ItemZip[], ahora: Date): Promise<void> {
  const escribir = (b: Buffer) => new Promise<void>((ok, mal) => salida.write(b, e => (e ? mal(e) : ok())));
  const { hora, fecha } = fechaDos(ahora);
  const central: Buffer[] = [];
  let posicion = 0;

  for (const item of items) {
    const nombre = Buffer.from(item.nombre, 'utf8');
    let metodo = 0, crc: number, tamReal: number, tamComp: number;
    let cuerpo: Buffer | null = null;
    if ('datos' in item) {
      crc = crc32(item.datos) >>> 0;
      tamReal = item.datos.length;
      const comprimido = deflateRawSync(item.datos);
      if (comprimido.length < tamReal) { metodo = 8; cuerpo = comprimido; } else { cuerpo = item.datos; }
      tamComp = cuerpo.length;
    } else {
      crc = await crcDeArchivo(item.archivo);
      tamReal = tamComp = item.tamano;
    }
    if (tamReal >= 0xffffffff || posicion >= 0xffffffff) throw new ErrorZip('El curso es demasiado grande para un ZIP (máximo 4 GB).');

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(metodo, 8); local.writeUInt16LE(hora, 10); local.writeUInt16LE(fecha, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(tamComp, 18); local.writeUInt32LE(tamReal, 22);
    local.writeUInt16LE(nombre.length, 26); local.writeUInt16LE(0, 28);
    await escribir(local); await escribir(nombre);
    if (cuerpo) await escribir(cuerpo);
    else { let enviados = 0; for await (const parte of createReadStream((item as { archivo: string }).archivo)) { enviados += (parte as Buffer).length; await escribir(parte as Buffer); } if (enviados !== tamReal) throw new ErrorZip('Un archivo cambió mientras se exportaba.'); }

    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(metodo, 10); c.writeUInt16LE(hora, 12); c.writeUInt16LE(fecha, 14);
    c.writeUInt32LE(crc, 16); c.writeUInt32LE(tamComp, 20); c.writeUInt32LE(tamReal, 24);
    c.writeUInt16LE(nombre.length, 28); c.writeUInt32LE(posicion, 42);
    central.push(Buffer.concat([c, nombre]));
    posicion += 30 + nombre.length + tamComp;
  }

  const directorio = Buffer.concat(central);
  await escribir(directorio);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(items.length, 8); fin.writeUInt16LE(items.length, 10);
  fin.writeUInt32LE(directorio.length, 12); fin.writeUInt32LE(posicion, 16);
  await escribir(fin);
}

// ---------------------------------------------------------------------------

function leer(fd: number, posicion: number, largo: number): Buffer {
  const b = Buffer.alloc(largo);
  const n = readSync(fd, b, 0, largo, posicion);
  if (n !== largo) throw new ErrorZip('El archivo ZIP está incompleto o dañado.');
  return b;
}

/** Lista las entradas del ZIP y rechaza todo lo sospechoso (nombres raros, cifrado, ZIP64, demasiadas entradas). */
export function listarZip(ruta: string): EntradaZip[] {
  const fd = openSync(ruta, 'r');
  try {
    const total = fstatSync(fd).size;
    if (total < 22) throw new ErrorZip('El archivo no es un ZIP.');
    const cola = Math.min(total, 65557);
    const fin = leer(fd, total - cola, cola);
    let p = -1;
    for (let i = cola - 22; i >= 0; i--) if (fin.readUInt32LE(i) === 0x06054b50) { p = i; break; }
    if (p < 0) throw new ErrorZip('El archivo no es un ZIP válido.');
    const cuantas = fin.readUInt16LE(p + 10);
    const tamDir = fin.readUInt32LE(p + 12);
    const offDir = fin.readUInt32LE(p + 16);
    if (cuantas === 0xffff || tamDir === 0xffffffff || offDir === 0xffffffff) throw new ErrorZip('Los ZIP64 no están soportados.');
    if (cuantas > MAX_ENTRADAS) throw new ErrorZip(`El ZIP tiene demasiados archivos (máximo ${MAX_ENTRADAS}).`);
    if (tamDir > 4 * 1024 * 1024 || offDir + tamDir > total) throw new ErrorZip('El ZIP está dañado.');

    const dir = leer(fd, offDir, tamDir);
    const entradas: EntradaZip[] = [];
    let q = 0;
    for (let i = 0; i < cuantas; i++) {
      if (q + 46 > dir.length || dir.readUInt32LE(q) !== 0x02014b50) throw new ErrorZip('El ZIP está dañado.');
      const flags = dir.readUInt16LE(q + 8), metodo = dir.readUInt16LE(q + 10);
      const crc = dir.readUInt32LE(q + 16), tamComp = dir.readUInt32LE(q + 20), tamReal = dir.readUInt32LE(q + 24);
      const lNombre = dir.readUInt16LE(q + 28), lExtra = dir.readUInt16LE(q + 30), lComentario = dir.readUInt16LE(q + 32);
      const offset = dir.readUInt32LE(q + 42);
      const nombre = dir.subarray(q + 46, q + 46 + lNombre).toString('utf8');
      q += 46 + lNombre + lExtra + lComentario;
      if (flags & 1) throw new ErrorZip('El ZIP está cifrado; no se puede leer.');
      if (metodo !== 0 && metodo !== 8) throw new ErrorZip('El ZIP usa un método de compresión no soportado.');
      if (tamComp === 0xffffffff || tamReal === 0xffffffff || offset === 0xffffffff) throw new ErrorZip('Los ZIP64 no están soportados.');
      if (!nombre || nombre.startsWith('/') || nombre.includes('\\') || nombre.includes('\0') || nombre.split('/').includes('..')) {
        throw new ErrorZip('El ZIP contiene un nombre de archivo no permitido.');
      }
      if (offset + 30 + tamComp > total) throw new ErrorZip('El ZIP está dañado.');
      if (!nombre.endsWith('/')) entradas.push({ nombre, metodo: metodo as 0 | 8, tamComprimido: tamComp, tamReal, crc, offset });
    }
    return entradas;
  } finally { closeSync(fd); }
}

function inicioDatos(ruta: string, e: EntradaZip): number {
  const fd = openSync(ruta, 'r');
  try {
    const l = leer(fd, e.offset, 30);
    if (l.readUInt32LE(0) !== 0x04034b50) throw new ErrorZip('El ZIP está dañado.');
    return e.offset + 30 + l.readUInt16LE(26) + l.readUInt16LE(28);
  } finally { closeSync(fd); }
}

/** Lee una entrada pequeña a memoria, con tope de tamaño y comprobación de CRC. */
export function extraerBuffer(ruta: string, e: EntradaZip, max: number): Buffer {
  if (e.tamReal > max || e.tamComprimido > max) throw new ErrorZip(`"${e.nombre}" es demasiado grande.`);
  const fd = openSync(ruta, 'r');
  try {
    const crudo = leer(fd, inicioDatos(ruta, e), e.tamComprimido);
    let datos: Buffer;
    try { datos = e.metodo === 8 ? inflateRawSync(crudo, { maxOutputLength: max }) : crudo; }
    catch { throw new ErrorZip(`"${e.nombre}" está dañado o es demasiado grande.`); }
    if (datos.length !== e.tamReal || (crc32(datos) >>> 0) !== e.crc) throw new ErrorZip(`"${e.nombre}" está dañado (no coincide su CRC).`);
    return datos;
  } finally { closeSync(fd); }
}

/** Extrae una entrada a un archivo, comprobando tamaño y CRC. Quien llama borra el destino si lanza error. */
export async function extraerArchivo(ruta: string, e: EntradaZip, destino: string, max: number): Promise<void> {
  if (e.tamReal > max) throw new ErrorZip(`"${e.nombre}" es demasiado grande.`);
  const inicio = inicioDatos(ruta, e);
  let crc = 0, bytes = 0;
  const vigilante = new Transform({
    transform(parte: Buffer, _c, cb) {
      bytes += parte.length;
      if (bytes > e.tamReal || bytes > max) return cb(new ErrorZip(`"${e.nombre}" es más grande de lo declarado.`));
      crc = crc32(parte, crc);
      cb(null, parte);
    }
  });
  const origen = createReadStream(ruta, { start: inicio, end: inicio + e.tamComprimido - 1 });
  try {
    if (e.tamComprimido === 0) { await pipeline(origen, vigilante, createWriteStream(destino)); }
    else if (e.metodo === 8) await pipeline(origen, createInflateRaw(), vigilante, createWriteStream(destino));
    else await pipeline(origen, vigilante, createWriteStream(destino));
  } catch (error) {
    if (error instanceof ErrorZip) throw error;
    throw new ErrorZip(`"${e.nombre}" está dañado.`);
  }
  if (bytes !== e.tamReal || (crc >>> 0) !== e.crc) throw new ErrorZip(`"${e.nombre}" está dañado (no coincide su CRC).`);
}
