/**
 * Borra los .wav antiguos del bucket `vocabulary-audio` (semanas 1-12),
 * ya reemplazados por los .mp3 de kokoro.
 *
 * Seguridad: antes de borrar cada .wav verifica que su .mp3 equivalente
 * exista en el bucket. Si falta el mp3, NO borra ese wav y lo reporta.
 *
 * Uso (PowerShell, desde technical-english-lab-main):
 *   $env:VITE_SUPABASE_URL = "https://uecbylctkvdmvfqcxlzg.supabase.co"
 *   $env:SUPABASE_SERVICE_KEY = "<service_role key>"
 *   node scripts/delete-old-wavs.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);
const BUCKET = 'vocabulary-audio';

let borrados = 0, conservados = 0;

for (let week = 1; week <= 12; week++) {
  const folder = `week${String(week).padStart(2, '0')}`;
  const { data: files, error } = await supabase.storage.from(BUCKET).list(folder);
  if (error) { console.error(`✗ listando ${folder}: ${error.message}`); continue; }

  const nombres = files.map(f => f.name);
  const wavs = nombres.filter(n => n.toLowerCase().endsWith('.wav'));

  for (const wav of wavs) {
    const mp3 = wav.replace(/\.wav$/i, '.mp3');
    if (!nombres.includes(mp3)) {
      conservados++;
      console.warn(`⚠ ${folder}/${wav} conservado: no existe ${mp3}`);
      continue;
    }
    const { error: delError } = await supabase.storage.from(BUCKET).remove([`${folder}/${wav}`]);
    if (delError) {
      console.error(`✗ ${folder}/${wav}: ${delError.message}`);
    } else {
      borrados++;
      console.log(`🗑 ${folder}/${wav}`);
    }
  }
}

console.log(`\nListo: ${borrados} .wav borrados, ${conservados} conservados por precaución.`);
