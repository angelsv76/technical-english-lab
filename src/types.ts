export interface Student {
  id?: string;
  nie: string;
  name: string;
  code: string;
  photo_url?: string | null;
  photo_pending?: string | null;
}

export interface VocabularyEntry {
  word: string;
  meaning: string;
  example: string;
  context: string;
  weekIntroduced: number;
  mastered: boolean;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  srsLevel?: number;
  nextReviewAt?: string | null;
  simulation?: {
    visual: string;
    question: string;
    options: string[];
    answer: string;
  };
  practice?: {
    question: string;
    options: string[];
    answer: string;
  };
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Simulation {
  simulationId: string;
  type: string;
  visual: string;
  instruction: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface WeekData {
  week: number;
  title: string;
  objective: string;
  introText: string;
  keywords: string[];
  vocabulary: {
    word: string;
    meaning: string;
    example: string;
    context: string;
    phonetic?: string;     // 👈 NUEVO
    audioUrl?: string;     // 👈 NUEVO
    audioEjemplo?: string; // audio de la oración de ejemplo (lecciones por bloques)
  }[];
  simulation: { simulationId: string };
  practice: Question[];
  evaluation: Question[];
  active?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  /** Lecciones por bloques (versión local): bloques tal como los guardó el docente. */
  blocks?: BloqueLeccion[];
  /** true cuando las respuestas de la evaluación no llegan al navegador y las califica el servidor. */
  servidorCalifica?: boolean;
  /** true si la lección está en borrador (los alumnos no la ven). */
  borrador?: boolean;
}

export interface PreguntaLeccion { question: string; options: string[]; answer: string; explanation?: string }
export interface ItemVocabularioLeccion {
  word: string; meaning: string; example: string; context?: string;
  phonetic?: string; audio?: string; audioEjemplo?: string;
}
export type BloqueLeccion = { id: string; titulo?: string } & (
  | { type: 'texto'; texto: string }
  | { type: 'imagen'; src: string; alt?: string; pie?: string }
  | { type: 'video'; src?: string; youtube?: string }
  | { type: 'audio'; src: string }
  | { type: 'pdf'; src: string }
  | { type: 'vocabulario'; items: ItemVocabularioLeccion[] }
  | { type: 'practica'; preguntas: PreguntaLeccion[] }
  | { type: 'evaluacion'; preguntas: PreguntaLeccion[] }
  | { type: 'simulacion'; simulationId: string }
);
export interface Leccion {
  week: number; title: string; objective: string; keywords: string[];
  status: 'draft' | 'published'; blocks: BloqueLeccion[]; updated_at?: string;
}

export interface WeekProgress {
  week: number;
  lastScore: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
}

export interface AppState {
  student: Student | null;
  progress: WeekProgress[];
  glossary: VocabularyEntry[];
}
