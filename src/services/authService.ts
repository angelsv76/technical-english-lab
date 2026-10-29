import { supabase } from '../lib/supabase';

/** La pertenencia se consulta en la base, nunca en el almacenamiento del navegador. */
export async function isTeacherLoggedIn(): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  const { data, error: roleError } = await supabase
    .from('teacher_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return !roleError && !!data;
}

export async function signInTeacher(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return false;
  const authorized = await isTeacherLoggedIn();
  if (!authorized) await supabase.auth.signOut();
  return authorized;
}

export async function logoutTeacher(): Promise<void> {
  await supabase.auth.signOut();
}
