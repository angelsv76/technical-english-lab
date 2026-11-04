import { generateContent } from './aiClient';

export interface GeneratedActivities {
  simulation: {
    visual: string;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  };
  practice: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  };
}

/**
 * Generates simulation and practice activities for a list of vocabulary words.
 */
export async function generateActivities(vocabulary: { word: string; meaning: string; example: string; context: string }[]): Promise<Record<string, GeneratedActivities>> {
  if (!vocabulary.length) return {};

  const prompt = `
    Generate a technical English simulation and a practice exercise for each of the following vocabulary words.
    
    Vocabulary:
    ${vocabulary.map(v => `- Word: ${v.word}, Meaning: ${v.meaning}, Example: ${v.example}, Context: ${v.context}`).join('\n')}

    For each word, provide:
    1. A simulation activity:
       - visual: A text representation of a UI element (e.g., "[ Save ]", "File > Open", "Error: 404").
       - question: A question about identifying or interpreting the element.
       - options: 4 multiple choice options.
       - answer: The correct option.
       - explanation: A brief explanation (in Spanish, 1-2 sentences) of WHY the answer is correct and what the word means in this context. It will be shown to the student when they answer incorrectly, so make it teach the concept.
    2. A practice exercise:
       - question: A question about the usage or meaning of the word in a technical context.
       - options: 4 multiple choice options.
       - answer: The correct option.
       - explanation: A brief explanation (in Spanish, 1-2 sentences) of WHY the answer is correct, shown to the student when they fail.

    Return the result as a JSON object where keys are the words.
  `;

  try {
    const response = await Promise.race([
      generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: 'OBJECT',
            additionalProperties: {
              type: 'OBJECT',
              properties: {
                simulation: {
                  type: 'OBJECT',
                  properties: {
                    visual: { type: 'STRING' },
                    question: { type: 'STRING' },
                    options: { type: 'ARRAY', items: { type: 'STRING' } },
                    answer: { type: 'STRING' },
                    explanation: { type: 'STRING' }
                  },
                  required: ["visual", "question", "options", "answer", "explanation"]
                },
                practice: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    options: { type: 'ARRAY', items: { type: 'STRING' } },
                    answer: { type: 'STRING' },
                    explanation: { type: 'STRING' }
                  },
                  required: ["question", "options", "answer", "explanation"]
                }
              },
              required: ["simulation", "practice"]
            }
          }
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Bulk generation timed out")), 30000))
    ]) as any;

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof Error && error.message === "Bulk generation timed out") {
      console.warn("Bulk activity generation timed out. Individual cards will use hybrid fallback.");
    } else {
      console.error("Error generating activities:", error);
    }
    // Fallback or empty result
    return {};
  }
}

/**
 * Generates a single practice exercise for a vocabulary word.
 */
export async function generateSinglePractice(word: string, context: string): Promise<GeneratedActivities['practice'] | null> {
  const prompt = `
    Generate a technical English practice exercise for the vocabulary word: "${word}".
    Context: ${context}
    
    Provide:
    - question: A question about the usage or meaning of the word in a technical context.
    - options: 4 multiple choice options.
    - answer: The correct option.
    - explanation: A brief explanation (in Spanish, 1-2 sentences) of WHY the answer is correct. It will be shown to the student when they answer incorrectly, so make it teach the concept.

    Return the result as a JSON object.
  `;

  try {
    const response = await generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            answer: { type: 'STRING' },
            explanation: { type: 'STRING' }
          },
          required: ["question", "options", "answer", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating single practice:", error);
    return null;
  }
}
