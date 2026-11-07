/**
 * Crea o borra el alumno de PRUEBAS del sistema (Auth + fila en students).
 *
 * La Edge Function submit-evaluation exige una sesión real de Supabase Auth
 * cuyo correo sea <nie>@inti.edu.sv y que exista en `students`. Por eso el
 * usuario de pruebas necesita las dos piezas.
 *
 * Uso (PowerShell, desde technical-english-lab-main):
 *   $env:VITE_SUPABASE_URL = "https://uecbylctkvdmvfqcxlzg.supabase.co"
 *   $env:SUPABASE_SERVICE_KEY = "<service_role key>"
 *   node scripts/test-student.mjs            # crear (idempotente)
 *   node scripts/test-student.mjs --delete   # borrar con todo su progreso
 *
 * Credenciales de la cuenta: NIE 20269999 / contraseña 20269999#
 * Grupo TEST, para distinguirlo de los 21 alumnos reales en el panel.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

const NIE = '20269999';
const EMAIL = `${NIE}@inti.edu.sv`;
const PASSWORD = `${NIE}#`;

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function findAuthUser() {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find(u => u.email?.toLowerCase() === EMAIL);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

if (process.argv.includes('--delete')) {
  const { error: delRow } = await supabase.from('students').delete().eq('nie', NIE);
  if (delRow) console.error('✗ students:', delRow.message);
  const user = await findAuthUser();
  if (user) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) console.error('✗ auth:', error.message);
  }
  console.log('Alumno de pruebas borrado (si existía).');
  process.exit(0);
}

let user = await findAuthUser();
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true
  });
  if (error) { console.error('✗ auth:', error.message); process.exit(1); }
  user = data.user;
  console.log('✓ Usuario de Auth creado');
} else {
  console.log('= Usuario de Auth ya existía');
}

const row = { nie: NIE, name: 'Alumno de Pruebas (borrar)', group_code: 'TEST', active: true };
const { data: existing } = await supabase.from('students').select('id').eq('nie', NIE).maybeSingle();
const { error: rowError } = existing
  ? await supabase.from('students').update(row).eq('id', existing.id)
  : await supabase.from('students').insert(row);
if (rowError) { console.error('✗ students:', rowError.message); process.exit(1); }

console.log(`✓ Listo. Entra con NIE ${NIE} y contraseña ${PASSWORD}`);
