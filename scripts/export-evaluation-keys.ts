// Genera scripts/evaluation-keys.json con las respuestas correctas de las 40
// evaluaciones, para poblar evaluation_keys vía scripts/sync-evaluation-keys.mjs
// (no vía copy-paste de SQL: los acentos se corrompen al pegar en el editor
// web de Supabase — JSON + supabase-js preserva el UTF-8 correctamente).
// Re-ejecutar cada vez que cambien las evaluaciones.
// Uso: npx tsx scripts/export-evaluation-keys.ts
import { weeks } from '../src/data/weeks/index';
import { writeFileSync } from 'fs';

const rows = weeks.flatMap(w =>
  w.evaluation.map(q => ({
    week_number: w.week,
    question: q.question,
    answer: q.answer
  }))
);

writeFileSync('scripts/evaluation-keys.json', JSON.stringify(rows, null, 2));
console.log(`scripts/evaluation-keys.json: ${rows.length} claves de ${weeks.length} semanas`);
