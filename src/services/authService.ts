/**
 * Autenticación del docente con Supabase Auth.
 *
 * El rol vive en `app_metadata.role = 'teacher'`, que solo se puede escribir
 * con la service key (el usuario no puede editarlo). La autorización real la
 * hacen las políticas RLS (`public.is_teacher()`); esto solo decide qué
 * pantalla mostrar.
 */
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function isTeacherUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'teacher';
}

/** Inicia sesión; si la cuenta no es docente, cierra la sesión y devuelve false. */
export async function signInTeacher(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return false;
  if (!isTeacherUser(data.user)) {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}

/** Comprueba la sesión contra el servidor (getUser, no el token en caché). */
export async function isTeacherSession(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return isTeacherUser(user);
}

export async function logoutTeacher(): Promise<void> {
  await supabase.auth.signOut();
}
