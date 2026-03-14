import { generateActivities, GeneratedActivities, generateSinglePractice } from './aiActivityGenerator';
import { getTemplateForWord } from '../data/simulationTemplates';

/**
 * Helper to create a timeout promise
 */
const timeout = (ms: number, message: string) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error(message)), ms)
);

/**
 * Generates activities for a word using AI with a 5-second timeout fallback to local templates.
 */
export async function generateHybridActivities(word: string, meaning: string, example: string, context: string): Promise<GeneratedActivities> {
  try {
    // Attempt AI generation with 5s timeout
    const aiResult = await Promise.race([
      generateActivities([{ word, meaning, example, context }]),
      timeout(5000, 'Individual activity generation timed out')
    ]) as Record<string, GeneratedActivities>;

    if (aiResult && aiResult[word]) {
      return aiResult[word];
    }
    
    throw new Error('AI failed to return valid data');
  } catch (error) {
    if (error instanceof Error && error.message === 'Individual activity generation timed out') {
      console.warn(`AI timed out for "${word}". Using local template.`);
    } else {
      console.warn(`Fallback to template for word: ${word}`, error);
    }
    return getTemplateForWord(word);
  }
}

/**
 * Generates a single practice for a word with timeout fallback.
 */
export async function generateHybridPractice(word: string, context: string): Promise<GeneratedActivities['practice']> {
  try {
    const aiResult = await Promise.race([
      generateSinglePractice(word, context),
      timeout(5000, 'Individual practice generation timed out')
    ]) as GeneratedActivities['practice'];

    if (aiResult) {
      return aiResult;
    }
    
    throw new Error('AI failed to return valid data');
  } catch (error) {
    if (error instanceof Error && error.message === 'Individual practice generation timed out') {
      console.warn(`AI practice timed out for "${word}". Using local template.`);
    } else {
      console.warn(`Fallback to template practice for word: ${word}`, error);
    }
    return getTemplateForWord(word).practice;
  }
}
