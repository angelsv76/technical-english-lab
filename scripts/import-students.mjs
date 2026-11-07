/**
 * Carga masiva de alumnos desde un CSV: crea la cuenta de Supabase Auth
 * (<nie>@inti.edu.sv) y la fila en `students`. Los alumnos NO se registran
 * solos: sin estas dos piezas no pueden entrar.
 *
 * CSV (UTF-8, con encabezado):  nie,nombre,grupo
 *   19709037,Adolfo Nicolas Artiga Maldonado,DS1B
 *
 * Uso (CMD, desde technical-english-lab-main):
 *   set VITE_SUPABASE_URL=https://uecbylctkvdmvfqcxlzg.supabase.co
 *   set SUPABASE_SERVICE_KEY=<secret / service_role key>
 *   node scripts/import-students.mjs alumnos.csv --dry-run   (solo muestra que haria)
 *   node scripts/import-students.mjs alumnos.csv             (crea)
 *   node scripts/import-students.mjs alumnos.csv --reset     (tambien cambia la contraseña
 *                                                              de los que ya existen)
 *
 * Genera credenciales-<fecha>.csv con la contraseña inicial de cada alumno nuevo
 * para que la entregues en papel. Ese archivo NO se sube a git (ver .gitignore).
 * Alumnos que ya existen se saltan, salvo con --reset.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { randomInt } from 'crypto';

const [archivo, ...flags] = process.argv.slice(2);
const dryRun = flags.includes('--dry-run');
const reset = flags.includes('--reset');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!archivo || !url || !key) {
  console.error('Uso: node scripts/import-students.mjs alumnos.csv [--dry-run] [--reset]');
  console.error('Y definir VITE_SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}

// Sin 0/O/1/l/I para que no se confundan al copiarlas del papel
const ALFABETO = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generar = () => Array.from({ length: 8 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');

const filas = readFileSync(archivo, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
const [encabezado, ...datos] = filas;
if (!/^nie\s*[,;]\s*nombre\s*[,;]\s*grupo/i.test(encabezado)) {
  console.error('La primera linea debe ser: nie,nombre,grupo');
  process.exit(1);
}
const alumnos = datos.map((l, i) => {
  const [nie, nombre, grupo] = l.split(/[,;]/).map(s => s.trim());
  return { nie, nombre, grupo, linea: i + 2 };
});

const malos = alumnos.filter(a => !/^\d{4,12}$/.test(a.nie || '') || !a.nombre || !a.grupo);
if (malos.length) {
  console.error('Filas invalidas (NIE numerico, nombre y grupo obligatorios):');
  malos.forEach(a => console.error(`  linea ${a.linea}: ${JSON.stringify(a)}`));
  process.exit(1);
}
const repetidos = alumnos.filter((a, i) => alumnos.findIndex(b => b.nie === a.nie) !== i);
if (repetidos.length) {
  console.error('NIE repetidos en el CSV:', repetidos.map(a => a.nie).join(', '));
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Mapa correo -> usuario de Auth, una sola lectura
const usuarios = new Map();
for (let page = 1; page < 50; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error('✗ No se pudo leer Auth:', error.message); process.exit(1); }
  data.users.forEach(u => u.email && usuarios.set(u.email.toLowerCase(), u));
  if (data.users.length < 200) break;
}

const salida = ['nie,nombre,grupo,contraseña'];
let nuevos = 0, saltados = 0, reseteados = 0, errores = 0;

for (const a of alumnos) {
  const email = `${a.nie}@inti.edu.sv`;
  const existente = usuarios.get(email);

  if (existente && !reset) { saltados++; console.log(`= ${a.nie} ya existe, se salta`); continue; }
  if (dryRun) { console.log(`${existente ? '~ reseteo' : '+ crearia'} ${a.nie} ${a.nombre} (${a.grupo})`); continue; }

  const password = generar();
  const { error: eAuth } = existente
    ? await supabase.auth.admin.updateUserById(existente.id, { password, email_confirm: true })
    : await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (eAuth) { errores++; console.error(`✗ ${a.nie} (auth): ${eAuth.message}`); continue; }

  const fila = { nie: a.nie, name: a.nombre, group_code: a.grupo, active: true };
  const { data: previo } = await supabase.from('students').select('id').eq('nie', a.nie).maybeSingle();
  const { error: eRow } = previo
    ? await supabase.from('students').update({ name: a.nombre, group_code: a.grupo }).eq('id', previo.id)
    : await supabase.from('students').insert(fila);
  if (eRow) { errores++; console.error(`✗ ${a.nie} (students): ${eRow.message}`); continue; }

  existente ? reseteados++ : nuevos++;
  salida.push([a.nie, `"${a.nombre}"`, a.grupo, password].join(','));
  console.log(`✓ ${a.nie} ${a.nombre}`);
}

console.log(`\nNuevos: ${nuevos} · Reseteados: ${reseteados} · Saltados: ${saltados} · Errores: ${errores}`);
if (!dryRun && salida.length > 1) {
  const nombre = `credenciales-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(nombre, '﻿' + salida.join('\n'), 'utf8');
  console.log(`Contraseñas iniciales guardadas en ${nombre} — entregalas y luego borra el archivo.`);
}
