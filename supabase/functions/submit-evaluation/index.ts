// Edge Function: submit-evaluation
// Recibe las respuestas del alumno, calcula la nota en el SERVIDOR contra
// evaluation_keys (invisible para el cliente) y escribe weekly_progress con
// la service key. El navegador nunca decide su propia nota.
//
// Desplegar:  npx supabase functions deploy submit-evaluation
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las inyecta Supabase automáticamente)
import { authenticatedStudent } from "../_shared/studentAuth.ts";

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
    const identity = await authenticatedStudent(req);
    if (!identity) return json({ error: "sesión de estudiante inválida" }, 401);
    const { studentId, week, answers } = await req.json();

    if (studentId !== identity.student.id || !Number.isInteger(week) || week < 1 || week > 40 ||
        !Array.isArray(answers) || answers.length < 1 || answers.length > 100) {
      return json({ error: "payload inválido" }, 400);
    }
    const supabase = identity.service;

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
    const { data: saved, error } = await supabase.rpc("record_evaluation", {
      p_student_id: studentId,
      p_week: week,
      p_score: score,
      p_answered: answers.length
    });
    if (error || !saved) return json({ error: error?.message || "No se guardó la evaluación" }, 500);

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
