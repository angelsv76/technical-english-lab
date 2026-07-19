/**
 * Respalda todas las tablas de Supabase a archivos JSON con fecha.
 * La evidencia del curso vive en un free tier — sin esto, un fallo o pausa
 * del proyecto la pierde toda.
 *
 * Uso (PowerShell, desde technical-english-lab-main):
 *   $env:VITE_SUPABASE_URL = "https://TU-PROYECTO.supabase.co"
 *   $env:SUPABASE_SERVICE_KEY = "<service_role key>"
 *   node scripts/backup-supabase.mjs
 *
 * Crea backups/AAAA-MM-DD/<tabla>.json. Recomendado: ejecutar cada viernes
 * y copiar la carpeta a Google Drive.
 */
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);
const TABLES = ['students', 'weekly_progress', 'glossary_entries', 'activity_log', 'course_config'];
const PAGE = 1000;

const dir = join('backups', new Date().toISOString().split('T')[0]);
mkdirSync(dir, { recursive: true });

let totalRows = 0;
for (const table of TABLES) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + PAGE - 1);
    if (error) {
      console.error(`✗ ${table}: ${error.message}`);
      break;
    }
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows, null, 2));
  totalRows += rows.length;
  console.log(`✓ ${table}: ${rows.length} filas`);
}

console.log(`\nRespaldo completo en ${dir} (${totalRows} filas). Copia esta carpeta a Google Drive.`);
