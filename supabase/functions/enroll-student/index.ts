// Edge Function pública: inscripción de un alumno con código de grupo.
// Crea la cuenta de acceso y la fila en `students` en estado PENDIENTE
// (active = false); el docente la aprueba desde Gestión de usuarios.
// No exige sesión: quien se inscribe todavía no tiene cuenta. La defensa es el
// código del grupo, su vencimiento y el límite de intentos (ver _shared/enrollment.ts).
//
// Desplegar:  npx supabase functions deploy enroll-student
import { createClient } from "npm:@supabase/supabase-js@2";
import { gruposConInscripcionAbierta, inscribir, type EnrollDeps } from "../_shared/enrollment.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...CORS, "Content-Type": "application/json" }
});

const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false }
});

const deps: EnrollDeps = {
  ahora: () => new Date(),

  async obtenerCodigo(grupo) {
    const { data } = await service.from("enrollment_codes")
      .select("code, expires_at, active").eq("group_code", grupo).maybeSingle();
    return data ?? null;
  },

  async gruposAbiertos(ahoraIso) {
    const { data } = await service.from("enrollment_codes")
      .select("group_code").eq("active", true).gt("expires_at", ahoraIso).order("group_code");
    return (data ?? []).map((fila) => fila.group_code as string);
  },

  async existeAlumno(nie) {
    const { data } = await service.from("students").select("id").eq("nie", nie).maybeSingle();
    return !!data;
  },

  async fallosDesde(desdeIso, nie) {
    let consulta = service.from("enrollment_attempts")
      .select("id", { count: "exact", head: true }).eq("ok", false).gte("created_at", desdeIso);
    if (nie) consulta = consulta.eq("nie", nie);
    const { count } = await consulta;
    return count ?? 0;
  },

  async registrarIntento(nie, ok) {
    await service.from("enrollment_attempts").insert({ nie, ok });
  },

  async crearUsuarioAuth(correo, password) {
    const { data, error } = await service.auth.admin.createUser({
      email: correo, password, email_confirm: true
    });
    if (error || !data.user) {
      return { error: /already|registered|exists/i.test(error?.message ?? "") ? "existe" : "falla" };
    }
    return { id: data.user.id };
  },

  async insertarAlumno(fila) {
    const { error } = await service.from("students").insert(fila);
    return error ? error.message : null;
  },

  async borrarUsuarioAuth(id) {
    await service.auth.admin.deleteUser(id);
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const texto = await req.text();
    if (texto.length > 4000) return json({ error: "solicitud demasiado larga" }, 413);
    const cuerpo = JSON.parse(texto);

    const respuesta = cuerpo?.action === "groups"
      ? await gruposConInscripcionAbierta(deps)
      : await inscribir(deps, cuerpo);
    return json(respuesta.body, respuesta.status);
  } catch (error) {
    console.error("enroll-student:", error);
    return json({ error: "No se pudo procesar la inscripción." }, 500);
  }
});
