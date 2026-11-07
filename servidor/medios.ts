// Subida de archivos de las lecciones (imágenes, audio, PDF y video).
// El tipo se decide por los primeros bytes del archivo, nunca por su nombre ni su Content-Type.
import type http from 'node:http';
import { createWriteStream, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export type TipoMedio = 'imagen' | 'audio' | 'pdf' | 'video';
export interface InfoMedio { ext: string; tipo: TipoMedio; max: number }

const MB = 1024 * 1024;
export const LIMITE_MAXIMO = 200 * MB;
const TOPE_DESCARTE = 16 * MB;

export function detectarMedio(d: Buffer): InfoMedio | null {
  const ascii = (a: number, b: number) => d.subarray(a, b).toString('latin1');
  if (d.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return { ext: 'png', tipo: 'imagen', max: 5 * MB };
  if (d.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { ext: 'jpg', tipo: 'imagen', max: 5 * MB };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', tipo: 'imagen', max: 5 * MB };
  if (ascii(0, 4) === 'GIF8') return { ext: 'gif', tipo: 'imagen', max: 5 * MB };
  if (ascii(0, 5) === '%PDF-') return { ext: 'pdf', tipo: 'pdf', max: 20 * MB };
  if (ascii(0, 3) === 'ID3' || (d[0] === 0xff && (d[1] & 0xe0) === 0xe0)) return { ext: 'mp3', tipo: 'audio', max: 10 * MB };
  if (ascii(4, 8) === 'ftyp') return { ext: 'mp4', tipo: 'video', max: LIMITE_MAXIMO };
  if (d.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return { ext: 'webm', tipo: 'video', max: LIMITE_MAXIMO };
  return null;
}

export class ErrorMedio extends Error {
  constructor(public status: number, mensaje: string) { super(mensaje); }
}

/**
 * Guarda el cuerpo de la petición en disco sin cargarlo entero en memoria.
 * Si algo falla, el archivo parcial se borra. Un archivo demasiado grande se lee y se
 * descarta para poder contestar 413 en lugar de cortar la conexión.
 */
export async function guardarMedio(req: http.IncomingMessage, dirMedios: string): Promise<{ src: string; tipo: TipoMedio; bytes: number }> {
  mkdirSync(dirMedios, { recursive: true });
  const parcial = join(dirMedios, `${randomUUID()}.part`);
  let cabeza = Buffer.alloc(0);
  let info: InfoMedio | null = null;
  let salida: ReturnType<typeof createWriteStream> | null = null;
  let total = 0;
  let error: ErrorMedio | null = null;

  const escribir = (parte: Buffer) => new Promise<void>((ok, mal) => salida!.write(parte, e => (e ? mal(e) : ok())));
  const decidir = async () => {
    info = detectarMedio(cabeza);
    if (!info) { error = new ErrorMedio(400, 'Formato no permitido. Usa PNG, JPG, WebP, GIF, MP3, PDF, MP4 o WebM.'); return; }
    salida = createWriteStream(parcial);
    await escribir(cabeza);
  };

  try {
    for await (const parte of req as AsyncIterable<Buffer>) {
      total += parte.length;
      if (error) { if (total > LIMITE_MAXIMO + TOPE_DESCARTE) break; continue; }
      if (!info) {
        cabeza = Buffer.concat([cabeza, parte]);
        if (cabeza.length < 16) continue;
        await decidir();
        if (error) continue;
      } else {
        await escribir(parte);
      }
      if (info && total > (info as InfoMedio).max) {
        error = new ErrorMedio(413, `El archivo supera el límite de ${(info as InfoMedio).max / MB} MB para ${(info as InfoMedio).tipo}.`);
      }
    }
    if (!error && !info) {
      if (cabeza.length === 0) error = new ErrorMedio(400, 'No se recibió ningún archivo.');
      else await decidir();
    }
    if (!error && info && total > (info as InfoMedio).max) error = new ErrorMedio(413, 'El archivo es demasiado grande.');
    if (salida) await new Promise<void>(ok => (salida as ReturnType<typeof createWriteStream>).end(ok));
    if (error) { rmSync(parcial, { force: true }); throw error; }
    const final = `${randomUUID()}.${(info as unknown as InfoMedio).ext}`;
    renameSync(parcial, join(dirMedios, final));
    return { src: `/medios/${final}`, tipo: (info as unknown as InfoMedio).tipo, bytes: total };
  } catch (e) {
    rmSync(parcial, { force: true });
    throw e;
  }
}
