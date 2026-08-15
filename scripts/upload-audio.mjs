/**
 * Sube audio-upload/weekNN/*.mp3|wav al bucket público `vocabulary-audio` de Supabase.
 *
 * Uso (PowerShell, desde technical-english-lab-main):
 *   $env:VITE_SUPABASE_URL = "https://TU-PROYECTO.supabase.co"
 *   $env:SUPABASE_SERVICE_KEY = "service_role key (Settings > API)"
 *   node scripts/upload-audio.mjs
 *
 * ⚠️ La service_role key NUNCA va en .env.local ni en el repo — solo en esta terminal.
 * Es idempotente: usa upsert, se puede re-ejecutar sin duplicar.
 */
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);
const BUCKET = 'vocabulary-audio';
const ROOT = 'audio-upload';

const folders = readdirSync(ROOT).filter(f => statSync(join(ROOT, f)).isDirectory());
let ok = 0, fail = 0;

for (const folder of folders) {
  const files = readdirSync(join(ROOT, folder)).filter(f => /\.(mp3|wav)$/i.test(f));
  for (const file of files) {
    const path = `${folder}/${file}`;
    const body = readFileSync(join(ROOT, folder, file));
    const contentType = file.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType,
      upsert: true
    });
    if (error) {
      fail++;
      console.error(`✗ ${path}: ${error.message}`);
    } else {
      ok++;
      if (ok % 25 === 0) console.log(`… ${ok} subidos`);
    }
  }
}

console.log(`\nListo: ${ok} archivos subidos, ${fail} errores.`);
