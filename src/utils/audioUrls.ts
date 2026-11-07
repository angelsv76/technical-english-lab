/**
 * URLs de audio en Supabase Storage por convención:
 *   vocabulary-audio/weekNN/<palabra>.wav          → palabra suelta (grabaciones existentes)
 *   vocabulary-audio/weekNN/<palabra>_example.mp3  → oración de ejemplo (generadas con kokoro)
 *
 * El slug debe coincidir con scripts/export-audio-manifest.ts
 */

export const wordSlug = (word: string): string =>
  word.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PREFIJO_NUBE = /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/vocabulary-audio\//;

/** En modo local los audios salen de /audio/ (carpeta audio-upload); en la nube se dejan como están. */
export function urlDeAudio(url?: string): string | undefined {
  if (!url) return url;
  return import.meta.env.VITE_BACKEND === 'local' ? url.replace(PREFIJO_NUBE, '/audio/') : url;
}

export function sentenceAudioUrl(week: number, word: string): string | null {
  const folder0 = `week${String(week).padStart(2, '0')}`;
  if (import.meta.env.VITE_BACKEND === 'local') return `/audio/${folder0}/${wordSlug(word)}_example.mp3`;
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  const folder = `week${String(week).padStart(2, '0')}`;
  return `${base}/storage/v1/object/public/vocabulary-audio/${folder}/${wordSlug(word)}_example.mp3`;
}
