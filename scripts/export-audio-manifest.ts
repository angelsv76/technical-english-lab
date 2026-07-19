// Exporta todas las oraciones de ejemplo a un manifest JSON para generar audio con kokoro.
// Uso: npx tsx scripts/export-audio-manifest.ts
import { weeks } from '../src/data/weeks/index';
import { writeFileSync } from 'fs';

const slug = (word: string) =>
  word.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const manifest = weeks.flatMap(w =>
  w.vocabulary.map(v => ({
    week: w.week,
    folder: `week${String(w.week).padStart(2, '0')}`,
    file: `${slug(v.word)}_example.mp3`,
    word: v.word,
    text: v.example
  }))
);

writeFileSync('scripts/audio-manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Manifest: ${manifest.length} oraciones de ${weeks.length} semanas`);
