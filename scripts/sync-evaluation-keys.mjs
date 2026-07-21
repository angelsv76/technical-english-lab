/**
 * Sube scripts/evaluation-keys.json a la tabla evaluation_keys de Supabase
 * usando supabase-js (no copy-paste de SQL: los acentos/tildes se corrompen
 * al pegar texto grande en el editor web — este método preserva el UTF-8).
 *
 * Uso (PowerShell, desde technical-english-lab-main):
 *   $env:VITE_SUPABASE_URL = "https://uecbylctkvdmvfqcxlzg.supabase.co"
 *   $env:SUPABASE_SERVICE_KEY = "<service_role key>"
 *   node scripts/sync-evaluation-keys.mjs
 *
 * Reemplaza TODAS las claves existentes (borra e inserta de nuevo) — es
 * seguro re-ejecutar cada vez que cambien las evaluaciones.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);
const rows = JSON.parse(readFileSync('scripts/evaluation-keys.json', 'utf8'));

const { error: delError } = await supabase.from('evaluation_keys').delete().neq('week_number', -1);
if (delError) {
  console.error('Error borrando claves anteriores:', delError.message);
  process.exit(1);
}

const BATCH = 100;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await supabase.from('evaluation_keys').insert(chunk);
  if (error) {
    console.error(`✗ lote ${i}-${i + chunk.length}: ${error.message}`);
    process.exit(1);
  }
  inserted += chunk.length;
  console.log(`… ${inserted}/${rows.length}`);
}

console.log(`\nListo: ${inserted} claves de evaluación sincronizadas.`);
