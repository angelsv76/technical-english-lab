import { createClient } from "npm:@supabase/supabase-js@2";

/** Match a verified Supabase Auth user to the active student record. */
export async function authenticatedStudent(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error } = await auth.auth.getUser(token);
  if (error || !user?.email) return null;

  const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false }
  });
  const { data: student } = await service
    .from("students")
    .select("id, nie, active")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!student?.active || user.email.toLowerCase() !== `${student.nie}@inti.edu.sv`.toLowerCase()) {
    return null;
  }
  return { student, service };
}
