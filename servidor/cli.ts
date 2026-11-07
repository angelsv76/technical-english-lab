// Administración de la base local.   npm run admin -- <comando> [argumentos]
//   docente <correo> <contraseña>   crea o repara la cuenta de docente
//   alumno-prueba [--borrar]        crea (o borra) el alumno de pruebas: NIE 20269999 / 20269999#
//   importar-nube                   copia alumnos, notas y glosario desde Supabase (nube) a SQLite
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { abrirBase, enTransaccion } from './db.ts';
import { hashPassword } from './seguridad.ts';
import { TABLAS } from './esquema.ts';
import { DIR_DATOS, RAIZ, RUTA_BASE } from './config.ts';
import { generarClave } from '../supabase/functions/_shared/enrollmentRules.ts';

const [comando, ...args] = process.argv.slice(2);
const db = abrirBase(RUTA_BASE);
const ahora = () => new Date().toISOString();

function asegurarCuenta(correo: string, password: string, rol: 'student' | 'teacher') {
  const existente = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(correo) as { id: string } | undefined;
  if (existente) {
    db.prepare('UPDATE auth_users SET password_hash = ?, role = ? WHERE id = ?').run(hashPassword(password), rol, existente.id);
    return { id: existente.id, creada: false };
  }
  const id = randomUUID();
  db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, correo, hashPassword(password), rol, ahora());
  return { id, creada: true };
}

switch (comando) {
  case 'docente': {
    const [correo, password] = args;
    if (!correo || !/^\S+@\S+\.\S+$/.test(correo) || !password) {
      console.error('Uso: npm run admin -- docente correo@ejemplo.com contraseña-de-10-o-mas-caracteres'); process.exit(1);
    }
    if (password.length < 10) { console.error('La contraseña debe tener al menos 10 caracteres.'); process.exit(1); }
    const r = asegurarCuenta(correo.trim().toLowerCase(), password, 'teacher');
    console.log(r.creada ? `✓ Cuenta de docente creada: ${correo}` : `= La cuenta ${correo} ya existía: contraseña actualizada y rol docente.`);
    break;
  }

  case 'alumno-prueba': {
    const nie = '20269999';
    const correo = `${nie}@inti.edu.sv`;
    if (args.includes('--borrar')) {
      db.prepare('DELETE FROM activity_log WHERE student_id IN (SELECT id FROM students WHERE nie = ?)').run(nie);
      db.prepare('DELETE FROM glossary_entries WHERE student_id IN (SELECT id FROM students WHERE nie = ?)').run(nie);
      db.prepare('DELETE FROM weekly_progress WHERE student_id IN (SELECT id FROM students WHERE nie = ?)').run(nie);
      db.prepare('DELETE FROM students WHERE nie = ?').run(nie);
      db.prepare('DELETE FROM auth_users WHERE email = ?').run(correo);
      console.log('Alumno de pruebas borrado, con su progreso.');
      break;
    }
    asegurarCuenta(correo, `${nie}#`, 'student');
    if (!db.prepare('SELECT 1 FROM students WHERE nie = ?').get(nie)) {
      db.prepare(
        `INSERT INTO students (id, nie, name, group_code, active, enrollment_status, enrolled_at, created_at)
         VALUES (?, ?, 'Alumno de Pruebas (borrar)', 'TEST', 1, 'approved', ?, ?)`
      ).run(randomUUID(), nie, ahora(), ahora());
    }
    console.log(`✓ Listo. Entra con NIE ${nie} y contraseña ${nie}#  (grupo TEST)`);
    break;
  }

  case 'importar-nube': await importarNube(); break;

  default:
    console.log('Comandos:\n  docente <correo> <contraseña>\n  alumno-prueba [--borrar]\n  importar-nube');
    process.exit(comando ? 1 : 0);
}

// ---------------------------------------------------------------------------

async function importarNube() {
  const { config } = await import('dotenv');
  config({ path: join(RAIZ, '.env.local'), quiet: true });
  const url = process.env.VITE_SUPABASE_URL;
  const clave = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !clave) { console.error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.'); process.exit(1); }

  async function traer(tabla: string, orden: string): Promise<Record<string, unknown>[]> {
    const filas: Record<string, unknown>[] = [];
    for (let desde = 0; ; desde += 1000) {
      const r = await fetch(`${url}/rest/v1/${tabla}?select=*&order=${orden}&limit=1000&offset=${desde}`, {
        headers: { apikey: clave!, Authorization: `Bearer ${clave}` }
      }).catch(e => { throw new Error(`No se pudo conectar con Supabase (${(e as Error).message}). ¿El proyecto está activo?`); });
      if (!r.ok) throw new Error(`Supabase respondió ${r.status} al leer ${tabla}: ${(await r.text()).slice(0, 200)}`);
      const lote = await r.json() as Record<string, unknown>[];
      filas.push(...lote);
      if (lote.length < 1000) return filas;
    }
  }

  const orden: Record<string, string> = {
    students: 'created_at', weekly_progress: 'created_at', glossary_entries: 'created_at',
    activity_log: 'timestamp', course_config: 'week_number'
  };

  const resumen: string[] = [];
  const nube: Record<string, Record<string, unknown>[]> = {};
  for (const tabla of Object.keys(orden)) {
    nube[tabla] = await traer(tabla, orden[tabla]);
  }

  const convertir = (tabla: string, fila: Record<string, unknown>) => {
    const salida: Record<string, unknown> = {};
    for (const [col, tipo] of Object.entries(TABLAS[tabla].columnas)) {
      let v = fila[col];
      if (v === undefined) continue;
      if (v === null) { salida[col] = null; continue; }
      if (tipo === 'bool') v = v ? 1 : 0;
      else if (tipo === 'json') v = typeof v === 'string' ? v : JSON.stringify(v);
      salida[col] = v;
    }
    return salida;
  };

  const insertar = (tabla: string, fila: Record<string, unknown>): boolean => {
    const f = convertir(tabla, fila);
    const columnas = Object.keys(f);
    const r = db.prepare(
      `INSERT OR IGNORE INTO "${tabla}" (${columnas.map(c => `"${c}"`).join(', ')}) VALUES (${columnas.map(() => '?').join(', ')})`
    ).run(...(columnas.map(c => f[c]) as never[]));
    return Number(r.changes) > 0;
  };

  enTransaccion(db, () => {
    for (const tabla of ['students', 'weekly_progress', 'glossary_entries', 'activity_log', 'course_config']) {
      let nuevas = 0;
      for (const fila of nube[tabla]) {
        if (tabla === 'weekly_progress' && !fila.verification_code) fila.verification_code = randomUUID();
        if (tabla === 'students' && fila.enrollment_status === undefined) fila.enrollment_status = 'approved';
        if (insertar(tabla, fila)) nuevas++;
      }
      resumen.push(`  ${tabla}: ${nuevas} nuevas de ${nube[tabla].length}`);
    }
  });

  // Fotos: se descargan a la carpeta local para que sigan viéndose sin la nube.
  let fotos = 0;
  for (const alumno of nube.students) {
    const foto = typeof alumno.photo_url === 'string' ? alumno.photo_url : '';
    if (!/^https?:\/\//.test(foto)) continue;
    try {
      const r = await fetch(foto);
      if (!r.ok) continue;
      const ext = (foto.split('?')[0].split('.').pop() || 'png').toLowerCase().replace('jpeg', 'jpg');
      const carpeta = join(DIR_DATOS, 'fotos', String(alumno.id));
      mkdirSync(carpeta, { recursive: true });
      writeFileSync(join(carpeta, `avatar.${ext}`), Buffer.from(await r.arrayBuffer()));
      db.prepare('UPDATE students SET photo_url = ? WHERE id = ?').run(`/fotos/${alumno.id}/avatar.${ext}`, String(alumno.id));
      fotos++;
    } catch { /* una foto que no baja no detiene la importación */ }
  }
  resumen.push(`  fotos descargadas: ${fotos}`);

  // Cuentas de acceso: las contraseñas de la nube no se pueden exportar, así que cada
  // alumno recibe una nueva y se guarda en un archivo para entregarla en papel.
  const credenciales = ['nie,nombre,grupo,contraseña'];
  enTransaccion(db, () => {
    for (const alumno of nube.students) {
      const correo = `${alumno.nie}@inti.edu.sv`;
      if (db.prepare('SELECT 1 FROM auth_users WHERE email = ?').get(correo)) continue;
      const password = generarClave();
      db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(randomUUID(), correo, hashPassword(password), 'student', ahora());
      credenciales.push([alumno.nie, `"${String(alumno.name).replace(/"/g, '""')}"`, alumno.group_code, password].join(','));
    }
  });

  console.log('Importación desde la nube terminada:\n' + resumen.join('\n'));
  if (credenciales.length > 1) {
    const archivo = join(RAIZ, `credenciales-importadas-${new Date().toISOString().slice(0, 10)}.csv`);
    writeFileSync(archivo, '﻿' + credenciales.join('\n'), 'utf8');
    console.log(`\n${credenciales.length - 1} cuentas creadas con contraseña nueva. Entrégalas y luego borra el archivo:\n  ${archivo}`);
  }
  if (!existsSync(join(RAIZ, '.env.local'))) console.log('(No hay .env.local)');
}
