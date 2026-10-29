import { GoogleGenAI } from "npm:@google/genai@1.45.0";
import { authenticatedStudent } from "../_shared/studentAuth.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...CORS, "Content-Type": "application/json" }
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);
  if (!(await authenticatedStudent(req))) return json({ error: "sesión de estudiante inválida" }, 401);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "tutor IA no configurado" }, 503);
  try {
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: "solicitud demasiado larga" }, 413);
    const { model, contents, config } = JSON.parse(raw);
    if (!["gemini-2.0-flash", "gemini-3-flash-preview"].includes(model) || !contents) {
      return json({ error: "solicitud inválida" }, 400);
    }
    const ai = new GoogleGenAI({ apiKey });
    const safeConfig = config && typeof config === "object" && !Array.isArray(config)
      ? { ...config, maxOutputTokens: 4096 }
      : { maxOutputTokens: 4096 };
    const response = await ai.models.generateContent({ model, contents, config: safeConfig });
    return json({ text: response.text ?? "" });
  } catch (error) {
    console.error("Error generando contenido:", error);
    return json({ error: "No se pudo generar contenido" }, 502);
  }
});
