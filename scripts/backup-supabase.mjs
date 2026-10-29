/**
 * Exporta las tablas públicas de la aplicación a archivos JSON con fecha.
 * No incluye auth.users, esquema, políticas ni buckets: NO sustituye un
 * respaldo PostgreSQL restaurable antes de una migración de producción.
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
import { mkdirSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);
const TABLES = ['students', 'weekly_progress', 'glossary_entries', 'activity_log', 'course_config', 'evaluation_keys'];
const PAGE = 1000;

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = join('backups', stamp);
const partialDir = `${dir}.partial`;
mkdirSync(partialDir, { recursive: true });

let totalRows = 0;
for (const table of TABLES) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + PAGE - 1);
    if (error) {
      console.error(`✗ ${table}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
    rows.push(...(data || []));
    if (!data || data.length < PAGE) break;
  }
  if (process.exitCode) break;
  writeFileSync(join(partialDir, `${table}.json`), JSON.stringify(rows, null, 2));
  totalRows += rows.length;
  console.log(`✓ ${table}: ${rows.length} filas`);
}

if (process.exitCode) {
  console.error(`Respaldo incompleto en ${partialDir}. No usarlo como copia restaurable.`);
} else {
  renameSync(partialDir, dir);
  console.log(`\nExportación de tablas de la aplicación en ${dir} (${totalRows} filas). Copia esta carpeta a un lugar seguro.`);
}
