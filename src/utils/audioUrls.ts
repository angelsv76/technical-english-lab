/**
 * URLs de audio en Supabase Storage por convención:
 *   vocabulary-audio/weekNN/<palabra>.wav          → palabra suelta (grabaciones existentes)
 *   vocabulary-audio/weekNN/<palabra>_example.mp3  → oración de ejemplo (generadas con kokoro)
 *
 * El slug debe coincidir con scripts/export-audio-manifest.ts
 */

export const wordSlug = (word: string): string =>
  word.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function sentenceAudioUrl(week: number, word: string): string | null {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  const folder = `week${String(week).padStart(2, '0')}`;
  return `${base}/storage/v1/object/public/vocabulary-audio/${folder}/${wordSlug(word)}_example.mp3`;
}
