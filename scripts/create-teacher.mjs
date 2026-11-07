/**
 * Crea (o repara) la cuenta DOCENTE: usuario de Supabase Auth con
 * app_metadata.role = 'teacher'. Ese rol solo se puede escribir con la
 * service key, así que ningún alumno puede darse el rol desde el navegador.
 *
 * Uso (CMD, desde technical-english-lab-main):
 *   set VITE_SUPABASE_URL=https://uecbylctkvdmvfqcxlzg.supabase.co
 *   set SUPABASE_SERVICE_KEY=<service_role / secret key>
 *   set DOCENTE_EMAIL=tu-correo@ejemplo.com
 *   set DOCENTE_PASSWORD=<contraseña fuerte, tu eliges>
 *   node scripts/create-teacher.mjs
 *
 * Idempotente: si el correo ya existe, le pone el rol y actualiza la contraseña.
 * Despues de crearla, cierra sesion y vuelve a entrar para que el token lleve el rol.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
const email = process.env.DOCENTE_EMAIL?.trim().toLowerCase();
const password = process.env.DOCENTE_PASSWORD;

if (!url || !key || !email || !password) {
  console.error('Faltan variables: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, DOCENTE_EMAIL y DOCENTE_PASSWORD.');
  process.exit(1);
}
if (password.length < 10) {
  console.error('La contraseña debe tener al menos 10 caracteres.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function buscar() {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find(u => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const existente = await buscar();
if (existente) {
  const { error } = await supabase.auth.admin.updateUserById(existente.id, {
    password,
    email_confirm: true,
    app_metadata: { ...existente.app_metadata, role: 'teacher' }
  });
  if (error) { console.error('✗', error.message); process.exit(1); }
  console.log(`= La cuenta ${email} ya existía: rol docente y contraseña actualizados.`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'teacher' }
  });
  if (error) { console.error('✗', error.message); process.exit(1); }
  console.log(`✓ Cuenta docente creada: ${email}`);
}
console.log('Entra en /teacher/login con ese correo y la contraseña que definiste.');
