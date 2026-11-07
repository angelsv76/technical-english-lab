/** Llamadas del editor de lecciones (solo docente). El servidor valida todo; aquí solo se transportan los datos. */
import { supabase } from '../lib/supabase';
import type { Leccion } from '../types';

export interface VersionLeccion { id: number; title: string; status: string; saved_at: string }
export interface MedioSubido { src: string; tipo: 'imagen' | 'audio' | 'pdf' | 'video'; bytes: number }

async function cabeceras(): Promise<Record<string, string>> {
  const sesion = (await supabase.auth.getSession()).data.session;
  return { Authorization: `Bearer ${sesion?.access_token ?? ''}` };
}

async function pedir<T>(ruta: string, opciones: { metodo?: string; cuerpo?: unknown } = {}): Promise<T> {
  let r: Response;
  try {
    r = await fetch(ruta, {
      method: opciones.metodo ?? (opciones.cuerpo !== undefined ? 'POST' : 'GET'),
      headers: { ...(await cabeceras()), ...(opciones.cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(cuerpo.error ?? `El servidor respondió ${r.status}.`);
  return cuerpo as T;
}

export const obtenerLeccion = async (semana: number) => (await pedir<{ lesson: Leccion }>(`/api/lecciones/${semana}`)).lesson;

export const guardarLeccion = async (semana: number, leccion: Leccion) =>
  (await pedir<{ lesson: Leccion }>(`/api/lecciones/${semana}`, { metodo: 'PUT', cuerpo: leccion })).lesson;

export const listarVersiones = async (semana: number) =>
  (await pedir<{ versions: VersionLeccion[] }>(`/api/lecciones/${semana}/versiones`)).versions;

export const restaurarVersion = async (semana: number, versionId: number) =>
  (await pedir<{ lesson: Leccion }>(`/api/lecciones/${semana}/restaurar`, { cuerpo: { versionId } })).lesson;

/** Cuántos alumnos ya tienen nota en esa semana (para avisar antes de cambiar la evaluación). */
export async function alumnosConNota(semana: number): Promise<number> {
  const { data } = await supabase.from('weekly_progress').select('id').eq('week_number', semana);
  return Array.isArray(data) ? data.length : 0;
}

/** Sube un archivo con barra de progreso. El servidor decide el tipo por su contenido, no por el nombre. */
export async function subirMedio(archivo: File, alProgresar?: (porcentaje: number) => void): Promise<MedioSubido> {
  const headers = await cabeceras();
  return new Promise((resolver, rechazar) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/medios');
    xhr.setRequestHeader('Authorization', headers.Authorization);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = e => { if (e.lengthComputable) alProgresar?.(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => rechazar(new Error('No se pudo conectar con el servidor.'));
    xhr.onload = () => {
      let cuerpo: { error?: string } & Partial<MedioSubido> = {};
      try { cuerpo = JSON.parse(xhr.responseText); } catch { /* respuesta sin JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && cuerpo.src) resolver(cuerpo as MedioSubido);
      else rechazar(new Error(cuerpo.error ?? `No se pudo subir el archivo (${xhr.status}).`));
    };
    xhr.send(archivo);
  });
}
