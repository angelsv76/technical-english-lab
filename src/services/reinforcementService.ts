import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ReinforcementActivity {
  word: string;
  instruction: string;
  question: string;
  options: string[];
  answer: string;
  type: 'action' | 'object' | 'interface' | 'instruction' | 'menu';
}

/**
 * Generates a reinforcement activity for a specific vocabulary word using AI.
 */
export async function generateReinforcementActivity(wordData: { word: string; meaning: string; example: string; context: string }): Promise<ReinforcementActivity | null> {
  const prompt = `
    Generate a technical English reinforcement activity for the following vocabulary word.
    
    Word: ${wordData.word}
    Meaning: ${wordData.meaning}
    Example: ${wordData.example}
    Context: ${wordData.context}

    The activity should be one of these types: Action identification, Object identification, Interface recognition, Instruction interpretation, or Menu recognition.

    Return the result as a JSON object with:
    - word: The word being practiced.
    - instruction: A short technical instruction or context (e.g., "Run the program", "Click the Save button").
    - question: A question to identify the word or its role (e.g., "Identify the Action", "What does this button do?").
    - options: 4 multiple choice options.
    - answer: The correct option.
    - type: The type of activity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            instruction: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['action', 'object', 'interface', 'instruction', 'menu'] }
          },
          required: ["word", "instruction", "question", "options", "answer", "type"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating reinforcement activity:", error);
    return null;
  }
}
