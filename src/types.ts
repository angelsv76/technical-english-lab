export interface Student {
  nie: string;
  name: string;
  code: string;
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
}

export interface Simulation {
  simulationId: string;
  type: string;
  visual: string;
  instruction: string;
  question: string;
  options: string[];
  answer: string;
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
  }[];
  simulation: { simulationId: string };
  practice: Question[];
  evaluation: Question[];
  active?: boolean;
  availableFrom?: string;
  availableUntil?: string;
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
