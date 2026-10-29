import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...CORS, "Content-Type": "application/json" }
});

// La respuesta pública solo confirma la existencia del código: no expone
// identidad, NIE, calificación ni otros datos del registro.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 200) return json({ valid: false }, 400);
    const { code } = JSON.parse(raw);
    if (typeof code !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)) {
      return json({ valid: false }, 400);
    }

    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await service.from("weekly_progress")
      .select("id").eq("verification_code", code).maybeSingle();
    if (error) throw error;
    return json({ valid: !!data });
  } catch (error) {
    console.error("Error verificando reporte:", error);
    return json({ error: "No se pudo verificar el reporte" }, 502);
  }
});
