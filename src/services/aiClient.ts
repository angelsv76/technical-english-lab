import { supabase } from '../lib/supabase';

type GenerateRequest = {
  model: string;
  contents: unknown;
  config?: unknown;
};

export async function generateContent(request: GenerateRequest): Promise<{ text?: string }> {
  const { data, error } = await supabase.functions.invoke('generate-content', { body: request });
  if (error) throw error;
  if (!data || typeof data.text !== 'string') throw new Error('Respuesta inválida del tutor IA');
  return data;
}
