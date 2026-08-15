/**
 * Estandariza las audioUrl de las semanas 1-12: apunta cada palabra a
 * weekNN/<slug>.mp3 (kokoro, mismo formato que semanas 13-40).
 * Idempotente. Uso: node scripts/standardize-audio-urls-1-12.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = 'https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio';
const slug = w => w.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const manifest = JSON.parse(readFileSync('scripts/audio-manifest.json', 'utf8'));
let updated = 0, issues = [];

for (let week = 1; week <= 12; week++) {
  const nn = String(week).padStart(2, '0');
  const path = `src/data/weeks/week${nn}.ts`;
  let content = readFileSync(path, 'utf8');
  const words = manifest.filter(m => m.week === week).map(m => m.word);

  for (const word of words) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const entryRe = new RegExp(`(word: "${escaped}",[\\s\\S]*?audioUrl: ")[^"]*(")`);
    if (!entryRe.test(content)) { issues.push(`week${nn}:${word}`); continue; }
    const url = `${BASE_URL}/week${nn}/${slug(word)}.mp3`;
    content = content.replace(entryRe, `$1${url}$2`);
    updated++;
  }
  writeFileSync(path, content);
}

console.log(`URLs estandarizadas: ${updated}`);
if (issues.length) console.log('SIN audioUrl previo:', issues.join(', '));
