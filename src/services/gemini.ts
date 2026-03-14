import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const askTutor = async (question: string, context?: string) => {
  if (!ai) {
    throw new Error("Gemini API key not configured");
  }

  const systemInstruction = `
    Eres un tutor experto en Inglés Técnico para estudiantes de Desarrollo de Software.
    Tu objetivo es ayudar a los estudiantes a entender términos técnicos en inglés, 
    explicar conceptos de programación en inglés y resolver dudas sobre el contenido del curso.
    
    Responde de manera amable, profesional y educativa.
    Si el estudiante pregunta algo fuera del tema de inglés técnico o programación, 
    redirígelo gentilmente al tema principal.
    
    Contexto actual: ${context || 'General'}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: 'user', parts: [{ text: question }] }],
    config: {
      systemInstruction,
    }
  });

  return response.text;
};
