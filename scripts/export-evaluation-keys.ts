// Genera supabase-evaluation-keys.sql con las respuestas correctas de las
// 40 evaluaciones, para poblar la tabla evaluation_keys (solo legible por la
// Edge Function). Re-ejecutar cada vez que cambien las evaluaciones.
// Uso: npx tsx scripts/export-evaluation-keys.ts
import { weeks } from '../src/data/weeks/index';
import { writeFileSync } from 'fs';

const esc = (s: string) => s.replace(/'/g, "''");

const values = weeks.flatMap(w =>
  w.evaluation.map(q =>
    `  (${w.week}, '${esc(q.question)}', '${esc(q.answer)}')`
  )
);

const sql = `-- Claves de calificación (generado por scripts/export-evaluation-keys.ts)
-- Ejecutar en el SQL Editor DESPUÉS de la Parte 1 de supabase-verificacion.sql.
-- Idempotente: reemplaza las claves existentes.

delete from evaluation_keys;

insert into evaluation_keys (week_number, question, answer) values
${values.join(',\n')};
`;

writeFileSync('supabase-evaluation-keys.sql', sql);
console.log(`supabase-evaluation-keys.sql: ${values.length} claves de ${weeks.length} semanas`);
