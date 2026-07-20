// Edge Function: submit-evaluation
// Recibe las respuestas del alumno, calcula la nota en el SERVIDOR contra
// evaluation_keys (invisible para el cliente) y escribe weekly_progress con
// la service key. El navegador nunca decide su propia nota.
//
// Desplegar:  npx supabase functions deploy submit-evaluation
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las inyecta Supabase automáticamente)
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const { studentId, week, answers } = await req.json();

    if (typeof studentId !== "string" || typeof week !== "number" || !Array.isArray(answers)) {
      return json({ error: "payload inválido" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: student } = await supabase
      .from("students")
      .select("id, active")
      .eq("id", studentId)
      .maybeSingle();
    if (!student || student.active === false) {
      return json({ error: "estudiante no encontrado" }, 404);
    }

    const { data: keys } = await supabase
      .from("evaluation_keys")
      .select("question, answer")
      .eq("week_number", week);
    if (!keys || keys.length === 0) {
      return json({ error: `sin claves de evaluación para la semana ${week}` }, 400);
    }

    // Normaliza para comparar: distintas formas de acentos/espacios (p.ej. tras
    // copiar el SQL a mano) no deben hacer que una respuesta correcta cuente como mal.
    const norm = (s: unknown) =>
      typeof s === "string" ? s.normalize("NFC").trim().replace(/\s+/g, " ") : "";

    // Calificación en servidor: una pregunta cuenta solo si coincide con la clave
    let correct = 0;
    for (const key of keys) {
      const keyQuestion = norm(key.question);
      const submitted = answers.find(
        (a: { question?: string }) => norm(a?.question) === keyQuestion
      );
      if (submitted && norm(submitted.answer) === norm(key.answer)) correct++;
    }
    const score = Math.round((correct / keys.length) * 100);
    const passed = score >= 70;
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("weekly_progress")
      .select("best_score, attempts, completed, completed_at")
      .eq("student_id", studentId)
      .eq("week_number", week)
      .maybeSingle();

    const row = {
      student_id: studentId,
      week_number: week,
      last_score: score,
      best_score: Math.max(existing?.best_score ?? 0, score),
      attempts: (existing?.attempts ?? 0) + 1,
      completed: passed || existing?.completed || false,
      completed_at: passed && !existing?.completed_at ? now : existing?.completed_at ?? null,
      updated_at: now
    };

    const { data: saved, error } = await supabase
      .from("weekly_progress")
      .upsert(row, { onConflict: "student_id,week_number" })
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    await supabase.from("activity_log").insert({
      student_id: studentId,
      action_type: "evaluation_completed",
      week_number: week,
      metadata: { score, completed: passed, via: "edge", answered: answers.length }
    });

    return json({
      score,
      bestScore: saved.best_score,
      attempts: saved.attempts,
      completed: saved.completed,
      verificationCode: saved.verification_code ?? null
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
