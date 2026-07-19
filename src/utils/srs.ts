import { VocabularyEntry } from '../types';
import { shuffleArray } from './helpers';

// Intervalos de repaso en días: 1er acierto → 1d, 2do → 3d, 3ro → 7d, 4to+ → 21d
export const SRS_INTERVALS_DAYS = [1, 3, 7, 21];

/**
 * Fecha del próximo repaso según el nivel SRS recién alcanzado.
 */
export function nextReviewDate(newLevel: number, from: Date = new Date()): string {
  const idx = Math.min(Math.max(newLevel - 1, 0), SRS_INTERVALS_DAYS.length - 1);
  const d = new Date(from);
  d.setDate(d.getDate() + SRS_INTERVALS_DAYS[idx]);
  return d.toISOString();
}

/**
 * Una palabra está vencida si nunca se ha programado o si su fecha ya pasó.
 */
export function isDueForReview(entry: VocabularyEntry, now: Date = new Date()): boolean {
  if (!entry.nextReviewAt) return true;
  return new Date(entry.nextReviewAt) <= now;
}

export interface ReviewQuestion {
  word: string;
  question: string;
  options: string[];
  answer: string;
  meaning: string;
  example: string;
}

/**
 * Construye preguntas de repaso 100% locales a partir del glosario del alumno.
 * Sin llamadas a IA: los distractores son significados/palabras de otras entradas.
 */
export function buildReviewQuestions(glossary: VocabularyEntry[], max = 8): ReviewQuestion[] {
  const due = shuffleArray(glossary.filter(e => isDueForReview(e))).slice(0, max);

  return due.map(entry => {
    const others = shuffleArray(
      glossary.filter(e => e.word !== entry.word && e.meaning !== entry.meaning)
    ).slice(0, 3);

    const askMeaning = others.length === 0 || Math.random() < 0.5;

    if (askMeaning) {
      return {
        word: entry.word,
        question: `¿Qué significa "${entry.word}"?`,
        options: shuffleArray([entry.meaning, ...others.map(o => o.meaning)]),
        answer: entry.meaning,
        meaning: entry.meaning,
        example: entry.example
      };
    }

    return {
      word: entry.word,
      question: `Which word means: "${entry.meaning}"?`,
      options: shuffleArray([entry.word, ...others.map(o => o.word)]),
      answer: entry.word,
      meaning: entry.meaning,
      example: entry.example
    };
  });
}
