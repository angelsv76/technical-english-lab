import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de la base de datos
export type Student = {
  id: string;
  nie: string;
  name: string;
  email?: string;
  group_code: string;
  created_at: string;
  last_login?: string;
  active: boolean;
};

export type WeeklyProgress = {
  id: string;
  student_id: string;
  week_number: number;
  last_score?: number;
  best_score?: number;
  attempts: number;
  completed: boolean;
  completed_at?: string;
  evaluation_pdf_url?: string;
  created_at: string;
  updated_at: string;
};

export type GlossaryEntry = {
  id: string;
  student_id: string;
  word: string;
  meaning: string;
  example: string;
  context: string;
  mastered: boolean;
  review_count: number;
  correct_count: number;
  wrong_count: number;
  week_introduced: number;
  audio_url?: string;
  created_at: string;
  last_reviewed_at?: string;
};

export type ActivityLog = {
  id: string;
  student_id: string;
  action_type: string;
  week_number?: number;
  metadata?: any;
  timestamp: string;
};

