import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Verifica el token contra Supabase Auth (no confía en lo que diga el cliente)
 * y exige app_metadata.role = 'teacher', que solo escribe la service key.
 * Devuelve el cliente de servicio para las operaciones administrativas.
 */
export async function authenticatedTeacher(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;

  const url = Deno.env.get("SUPABASE_URL")!;
  const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false }
  });
  const { data: { user }, error } = await auth.auth.getUser(token);
  if (error || !user || user.app_metadata?.role !== "teacher") return null;

  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false }
  });
  return { user, service };
}
