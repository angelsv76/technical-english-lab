import { join, normalize, resolve, sep } from 'node:path';

/** Une una ruta de la URL a una carpeta raíz sin permitir salirse de ella. */
export function rutaSegura(raiz: string, rutaUrl: string): string | null {
  let decodificada: string;
  try { decodificada = decodeURIComponent(rutaUrl); } catch { return null; }
  const destino = resolve(join(raiz, normalize(decodificada)));
  return destino === resolve(raiz) || destino.startsWith(resolve(raiz) + sep) ? destino : null;
}
