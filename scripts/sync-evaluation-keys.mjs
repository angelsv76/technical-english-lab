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
 * Requiere la migración 2026102903_atomic_evaluation_keys.sql.
 * Reemplaza las claves en una sola transacción de base de datos.
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
if (!Array.isArray(rows) || rows.length === 0 || rows.some(row =>
  !Number.isInteger(row.week_number) || typeof row.question !== 'string' ||
  !row.question.trim() || typeof row.answer !== 'string' || !row.answer.trim()
)) {
  console.error('El archivo de claves está vacío o contiene filas inválidas.');
  process.exit(1);
}

const { data: count, error } = await supabase.rpc('replace_evaluation_keys', { p_rows: rows });
if (error || count !== rows.length) {
  console.error('No se sincronizaron las claves:', error?.message || 'recuento inesperado');
  process.exit(1);
}
console.log(`Listo: ${count} claves de evaluación sincronizadas.`);
