import { supabase } from '../lib/supabase';

/** Convierte el error de una Edge Function en un mensaje para el usuario. */
export async function mensajeDeFuncion(error: unknown): Promise<string> {
  const contexto = (error as { context?: Response })?.context;
  if (contexto && typeof contexto.json === 'function') {
    try {
      const cuerpo = await contexto.json();
      if (cuerpo?.error) return String(cuerpo.error);
    } catch { /* respuesta sin JSON: se usa el mensaje genérico */ }
  }
  return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
}

export interface DatosInscripcion {
  nie: string;
  nombre: string;
  grupo: string;
  password: string;
  codigo: string;
}

/** Grupos con inscripción abierta (código activo y vigente). */
export async function gruposAbiertos(): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke('enroll-student', { body: { action: 'groups' } });
  if (error) throw new Error(await mensajeDeFuncion(error));
  return Array.isArray(data?.groups) ? data.groups : [];
}

export async function inscribirse(datos: DatosInscripcion): Promise<void> {
  const { error } = await supabase.functions.invoke('enroll-student', { body: datos });
  if (error) throw new Error(await mensajeDeFuncion(error));
}

/** Operaciones de gestión de usuarios (solo docente; la función lo verifica). */
export async function gestionar<T = Record<string, unknown>>(
  accion: string,
  datos: Record<string, unknown> = {}
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('manage-students', {
    body: { action: accion, ...datos }
  });
  if (error) throw new Error(await mensajeDeFuncion(error));
  return data as T;
}
