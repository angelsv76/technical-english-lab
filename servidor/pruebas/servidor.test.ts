// Pruebas del servidor local con base SQLite en memoria.   npm run test:servidor
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { crearServidor } from '../app.ts';
import { hashPassword } from '../seguridad.ts';
import { weeks } from '../../src/data/weeks/index.ts';

const carpeta = mkdtempSync(join(tmpdir(), 'lab-test-'));
const dirAudio = join(carpeta, 'audio');
const dirDist = join(carpeta, 'dist');
mkdirSync(join(dirAudio, 'week01'), { recursive: true });
mkdirSync(dirDist, { recursive: true });
writeFileSync(join(dirAudio, 'week01', 'x.mp3'), 'ID3');
writeFileSync(join(carpeta, 'secreto-fuera.txt'), 'no me sirvas');

let reloj = new Date('2026-11-10T15:00:00Z');
const { servidor, db } = crearServidor({
  rutaBase: ':memory:', dirDatos: carpeta, dirDist, dirAudio, secreto: 's'.repeat(64),
  ahora: () => reloj
});
let base = '';
before(async () => {
  await new Promise<void>(r => servidor.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`;
});
after(() => { servidor.close(); db.close(); rmSync(carpeta, { recursive: true, force: true }); });

// ---------- ayudas ----------
const ahoraIso = () => reloj.toISOString();
function cuenta(correo: string, password: string, rol: 'student' | 'teacher' = 'student') {
  db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(randomUUID(), correo, hashPassword(password), rol, ahoraIso());
}
function alumno(nie: string, nombre: string, grupo = 'DS1B', opciones: { active?: number; estado?: string } = {}) {
  const id = randomUUID();
  db.prepare(`INSERT INTO students (id, nie, name, group_code, active, enrollment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, nie, nombre, grupo, opciones.active ?? 1, opciones.estado ?? 'approved', ahoraIso());
  cuenta(`${nie}@inti.edu.sv`, `${nie}#clave`);
  return id;
}
async function http(ruta: string, o: { metodo?: string; cuerpo?: unknown; token?: string; raw?: Buffer; tipo?: string } = {}) {
  const r = await fetch(base + ruta, {
    method: o.metodo ?? (o.cuerpo !== undefined || o.raw ? 'POST' : 'GET'),
    headers: {
      ...(o.token ? { Authorization: `Bearer ${o.token}` } : {}),
      ...(o.cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(o.tipo ? { 'Content-Type': o.tipo } : {})
    },
    body: o.raw ?? (o.cuerpo !== undefined ? JSON.stringify(o.cuerpo) : undefined)
  });
  const texto = await r.text();
  let json: any = null;
  try { json = JSON.parse(texto); } catch { /* no es JSON */ }
  return { status: r.status, json, texto, tipo: r.headers.get('content-type') };
}
async function entrar(correo: string, password: string): Promise<string> {
  const r = await http('/api/auth/login', { cuerpo: { email: correo, password } });
  assert.equal(r.status, 200, `login de ${correo}: ${r.texto}`);
  return r.json.access_token;
}
const consulta = async (token: string | undefined, p: Record<string, unknown>) =>
  (await http('/api/db', { cuerpo: p, token })).json as { data: any; error: { message: string; code: string } | null };
const fn = (nombre: string, cuerpo: unknown, token?: string) => http(`/api/functions/${nombre}`, { cuerpo, token });

// ---------- datos base ----------
let ana: string, beto: string, pendiente: string;
let tDocente: string, tAna: string, tBeto: string, tPendiente: string;
before(async () => {
  await new Promise(r => setTimeout(r, 0));
  cuenta('docente@inti.edu.sv', 'clave-docente-1', 'teacher');
  ana = alumno('20260001', 'Ana Pérez');
  beto = alumno('20260002', 'Beto Gómez');
  pendiente = alumno('20260003', 'Pía Pendiente', 'DS1B', { active: 0, estado: 'pending' });
  db.prepare("INSERT INTO course_config (week_number, active, updated_at) VALUES (1, 1, ?), (2, 0, ?)").run(ahoraIso(), ahoraIso());
  tDocente = await entrar('docente@inti.edu.sv', 'clave-docente-1');
  tAna = await entrar('20260001@inti.edu.sv', '20260001#clave');
  tBeto = await entrar('20260002@inti.edu.sv', '20260002#clave');
  tPendiente = await entrar('20260003@inti.edu.sv', '20260003#clave');
});

// ===================== estáticos =====================
test('estáticos: audio sí, salirse de la carpeta no, app no construida avisa', async () => {
  assert.equal((await http('/api/salud')).json.ok, true);
  const a = await http('/audio/week01/x.mp3');
  assert.equal(a.status, 200); assert.equal(a.tipo, 'audio/mpeg');
  assert.equal((await http('/audio/week01/no-existe.mp3')).status, 404);
  assert.equal((await http('/audio/..%2fsecreto-fuera.txt')).status, 404);
  assert.equal((await http('/audio/%2e%2e/%2e%2e/secreto-fuera.txt')).status, 404);
  assert.equal((await http('/fotos/..%2f..%2fsecreto-fuera.txt')).status, 404);
  const sinApp = await http('/modulos');
  assert.equal(sinApp.status, 503); assert.match(sinApp.texto, /npm run build:local/);
  writeFileSync(join(dirDist, 'index.html'), '<html>app</html>');
  const spa = await http('/ruta/profunda');
  assert.equal(spa.status, 200); assert.match(spa.texto, /app/);
  assert.equal((await http('/falta.js')).status, 404);
});

// ===================== autenticación =====================
test('login: credenciales malas 400, buenas dan sesión con rol', async () => {
  assert.equal((await http('/api/auth/login', { cuerpo: { email: '20260001@inti.edu.sv', password: 'mala' } })).status, 400);
  assert.equal((await http('/api/auth/login', { cuerpo: { email: 'nadie@inti.edu.sv', password: 'x' } })).status, 400);
  assert.equal((await http('/api/auth/login', { cuerpo: { email: 5, password: {} } })).status, 400);
  const r = await http('/api/auth/login', { cuerpo: { email: ' 20260001@INTI.edu.sv ', password: '20260001#clave' } });
  assert.equal(r.status, 200); assert.equal(r.json.user.app_metadata.role, 'student');
  assert.equal((await http('/api/auth/user', { token: r.json.access_token })).json.user.email, '20260001@inti.edu.sv');
  assert.equal((await http('/api/auth/user', { token: tDocente })).json.user.app_metadata.role, 'teacher');
});

test('sesión: sin token, token alterado, vencido o cuenta borrada no entran', async () => {
  assert.equal((await http('/api/auth/user')).status, 401);
  assert.equal((await http('/api/auth/user', { token: tAna.slice(0, -3) + 'abc' })).status, 401);
  assert.equal((await http('/api/auth/user', { token: 'basura' })).status, 401);
  const tTemporal = (cuenta('temp@inti.edu.sv', 'clave-temporal-1'), await entrar('temp@inti.edu.sv', 'clave-temporal-1'));
  assert.equal((await http('/api/auth/user', { token: tTemporal })).status, 200);
  db.prepare("DELETE FROM auth_users WHERE email = 'temp@inti.edu.sv'").run();
  assert.equal((await http('/api/auth/user', { token: tTemporal })).status, 401, 'borrar la cuenta corta el acceso');
  const antes = reloj;
  reloj = new Date(reloj.getTime() + 8 * 24 * 3600 * 1000);
  assert.equal((await http('/api/auth/user', { token: tAna })).status, 401, 'la sesión vence a los 7 días');
  reloj = antes;
});

test('login: tras 8 fallos se bloquea aunque la contraseña sea la correcta', async () => {
  cuenta('bloqueo@inti.edu.sv', 'clave-correcta-1');
  for (let i = 0; i < 8; i++) {
    assert.equal((await http('/api/auth/login', { cuerpo: { email: 'bloqueo@inti.edu.sv', password: 'mala' + i } })).status, 400);
  }
  assert.equal((await http('/api/auth/login', { cuerpo: { email: 'bloqueo@inti.edu.sv', password: 'clave-correcta-1' } })).status, 429);
  reloj = new Date(reloj.getTime() + 16 * 60 * 1000);
  // La ventana de 15 minutos pasó, pero la IP (127.0.0.1) acumuló fallos de otras cuentas: se comprueba que se recupera.
  const r = await http('/api/auth/login', { cuerpo: { email: 'bloqueo@inti.edu.sv', password: 'clave-correcta-1' } });
  assert.equal(r.status, 200);
});

// ===================== permisos de datos =====================
test('anónimo: no lee alumnos ni notas, pero sí las semanas activas', async () => {
  assert.deepEqual((await consulta(undefined, { table: 'students', op: 'select' })).data, []);
  assert.deepEqual((await consulta(undefined, { table: 'weekly_progress', op: 'select' })).data, []);
  const c = await consulta(undefined, { table: 'course_config', op: 'select', order: [{ col: 'week_number' }] });
  assert.deepEqual(c.data.map((f: any) => [f.week_number, f.active]), [[1, true], [2, false]]);
  assert.equal((await consulta(undefined, { table: 'students', op: 'update', values: { name: 'x' }, filters: [{ col: 'id', op: 'eq', val: ana }] })).data, null);
  assert.equal(db.prepare('SELECT name FROM students WHERE id = ?').get(ana)!.name, 'Ana Pérez');
});

test('alumno: solo ve su propia fila y las demás no existen para él', async () => {
  const propias = await consulta(tAna, { table: 'students', op: 'select', columns: 'id, nie, name, active' });
  assert.deepEqual(propias.data.map((f: any) => f.nie), ['20260001']);
  assert.equal(propias.data[0].active, true, 'los booleanos salen como true/false');
  const ajena = await consulta(tAna, { table: 'students', op: 'select', filters: [{ col: 'nie', op: 'eq', val: '20260002' }], single: 'maybe' });
  assert.equal(ajena.data, null);
  const unica = await consulta(tAna, { table: 'students', op: 'select', filters: [{ col: 'nie', op: 'eq', val: '20260002' }], single: 'single' });
  assert.equal(unica.error?.code, 'PGRST116');
});

test('alumno: actualiza solo last_seen/last_login propios', async () => {
  const ok = await consulta(tAna, { table: 'students', op: 'update', values: { last_seen: 'ahora' },
    filters: [{ col: 'id', op: 'eq', val: ana }], returning: true, columns: 'active', single: 'maybe' });
  assert.deepEqual(ok.data, { active: true });
  const otro = await consulta(tAna, { table: 'students', op: 'update', values: { last_seen: 'x' },
    filters: [{ col: 'id', op: 'eq', val: beto }], returning: true, columns: 'id' });
  assert.deepEqual(otro.data, [], 'la fila de otro alumno no se toca (0 filas, como RLS)');
  for (const prohibido of [{ active: true }, { name: 'Hacker' }, { group_code: 'X' }, { enrollment_status: 'approved' }, { nie: '1' }]) {
    const r = await consulta(tPendiente, { table: 'students', op: 'update', values: prohibido, filters: [{ col: 'id', op: 'eq', val: pendiente }] });
    assert.equal(r.error?.code, '42501', `un alumno no puede cambiar ${Object.keys(prohibido)[0]}`);
  }
  assert.equal(db.prepare('SELECT active FROM students WHERE id = ?').get(pendiente)!.active, 0);
});

test('notas: ningún alumno ni anónimo puede escribirlas ni borrarlas', async () => {
  const fila = { student_id: ana, week_number: 5, last_score: 100, best_score: 100, attempts: 1, completed: true, verification_code: 'falso' };
  for (const token of [tAna, undefined, tDocente]) {
    assert.equal((await consulta(token, { table: 'weekly_progress', op: 'insert', values: fila })).error?.code, '42501');
    assert.equal((await consulta(token, { table: 'weekly_progress', op: 'upsert', values: fila, onConflict: 'student_id,week_number' })).error?.code, '42501');
    assert.equal((await consulta(token, { table: 'weekly_progress', op: 'update', values: { best_score: 100 } })).data, null);
  }
  assert.equal((db.prepare('SELECT COUNT(*) n FROM weekly_progress').get() as any).n, 0);
});

test('glosario: el alumno escribe el suyo; el de otro o el de un alumno inactivo, no', async () => {
  const entrada = (student_id: string, word: string) => ({ student_id, word, meaning: 'm', example: 'e', context: 'c', week_introduced: 1 });
  assert.equal((await consulta(tAna, { table: 'glossary_entries', op: 'insert', values: entrada(ana, 'Search') })).error, null);
  assert.equal((await consulta(tAna, { table: 'glossary_entries', op: 'insert', values: entrada(beto, 'Search') })).error?.code, '42501');
  assert.equal((await consulta(tPendiente, { table: 'glossary_entries', op: 'insert', values: entrada(pendiente, 'Search') })).error?.code, '42501');
  assert.equal((await consulta(tAna, { table: 'glossary_entries', op: 'insert', values: entrada(ana, 'Search') })).error?.code, '23505', 'duplicado');
  // upsert que ignora duplicados (como addToGlossary): solo devuelve lo nuevo
  const up = await consulta(tAna, { table: 'glossary_entries', op: 'upsert', onConflict: 'student_id,word', ignoreDuplicates: true,
    values: [entrada(ana, 'Search'), entrada(ana, 'Settings')], returning: true, columns: '*' });
  assert.deepEqual(up.data.map((f: any) => f.word), ['Settings']);
  assert.equal(up.data[0].mastered, false); assert.equal(up.data[0].srs_level, 0);
  const mod = await consulta(tAna, { table: 'glossary_entries', op: 'update', values: { mastered: true, srs_level: 3, correct_count: 3 },
    filters: [{ col: 'student_id', op: 'eq', val: ana }, { col: 'word', op: 'eq', val: 'Search' }], returning: true, columns: 'mastered, srs_level', single: 'single' });
  assert.deepEqual(mod.data, { mastered: true, srs_level: 3 });
  // el glosario de Beto no se ve ni se toca desde la sesión de Ana
  await consulta(tBeto, { table: 'glossary_entries', op: 'insert', values: entrada(beto, 'File') });
  assert.deepEqual((await consulta(tAna, { table: 'glossary_entries', op: 'select', columns: 'word', order: [{ col: 'word' }] })).data.map((f: any) => f.word), ['Search', 'Settings']);
  const robo = await consulta(tAna, { table: 'glossary_entries', op: 'update', values: { mastered: true },
    filters: [{ col: 'student_id', op: 'eq', val: beto }], returning: true, columns: 'id' });
  assert.deepEqual(robo.data, []);
});

test('actividad: el alumno registra la suya; solo el docente la lee', async () => {
  const meta = { nie: '20260001', anidado: { ok: true, n: [1, 2] } };
  assert.equal((await consulta(tAna, { table: 'activity_log', op: 'insert', values: { student_id: ana, action_type: 'login', metadata: meta } })).error, null);
  assert.equal((await consulta(tAna, { table: 'activity_log', op: 'insert', values: { student_id: beto, action_type: 'login' } })).error?.code, '42501');
  assert.deepEqual((await consulta(tAna, { table: 'activity_log', op: 'select' })).data, []);
  const docente = await consulta(tDocente, { table: 'activity_log', op: 'select', filters: [{ col: 'student_id', op: 'eq', val: ana }] });
  assert.deepEqual(docente.data[0].metadata, meta, 'el JSON entra y sale intacto');
  assert.ok(docente.data[0].timestamp && docente.data[0].id);
});

test('semanas activas: solo el docente las cambia', async () => {
  const intento = { table: 'course_config', op: 'upsert', onConflict: 'week_number', values: { week_number: 3, active: false } };
  assert.equal((await consulta(tAna, intento)).error?.code, '42501');
  assert.equal((await consulta(undefined, intento)).error?.code, '42501');
  assert.equal((await consulta(tDocente, intento)).error, null);
  assert.equal((await consulta(tDocente, { ...intento, values: { week_number: 3, active: true } })).error, null);
  const c = await consulta(undefined, { table: 'course_config', op: 'select', filters: [{ col: 'week_number', op: 'eq', val: 3 }], single: 'single' });
  assert.equal(c.data.active, true, 'el upsert actualizó la fila en lugar de duplicarla');
});

test('docente: lista, filtra, ordena, pagina y gestiona alumnos', async () => {
  const todos = await consulta(tDocente, { table: 'students', op: 'select', columns: 'nie, name, active', order: [{ col: 'name' }] });
  assert.deepEqual(todos.data.map((f: any) => f.name), ['Ana Pérez', 'Beto Gómez', 'Pía Pendiente']);
  const inactivos = await consulta(tDocente, { table: 'students', op: 'select', columns: 'nie', filters: [{ col: 'active', op: 'eq', val: false }] });
  assert.deepEqual(inactivos.data, [{ nie: '20260003' }], 'filtrar por booleano funciona');
  const enLista = await consulta(tDocente, { table: 'students', op: 'select', columns: 'nie', filters: [{ col: 'nie', op: 'in', val: ['20260001', '20260002'] }], order: [{ col: 'nie', ascending: false }] });
  assert.deepEqual(enLista.data.map((f: any) => f.nie), ['20260002', '20260001']);
  assert.deepEqual((await consulta(tDocente, { table: 'students', op: 'select', columns: 'nie', filters: [{ col: 'nie', op: 'in', val: [] }] })).data, []);
  const pagina = await consulta(tDocente, { table: 'students', op: 'select', columns: 'nie', order: [{ col: 'nie' }], range: [1, 1] });
  assert.deepEqual(pagina.data, [{ nie: '20260002' }]);
  const aprobar = await consulta(tDocente, { table: 'students', op: 'update', values: { active: true, enrollment_status: 'approved' },
    filters: [{ col: 'id', op: 'eq', val: pendiente }], returning: true, columns: 'id, active, enrollment_status', single: 'single' });
  assert.deepEqual(aprobar.data, { id: pendiente, active: true, enrollment_status: 'approved' });
  await consulta(tDocente, { table: 'students', op: 'update', values: { active: false, enrollment_status: 'pending' }, filters: [{ col: 'id', op: 'eq', val: pendiente }] });
});

test('consultas hostiles: tablas y columnas ajenas, inyección SQL y estructura rota', async () => {
  assert.equal((await consulta(tDocente, { table: 'auth_users', op: 'select' })).error?.code, 'PGRST205', 'auth_users no se expone');
  assert.equal((await consulta(tDocente, { table: 'enrollment_codes', op: 'select' })).error?.code, 'PGRST205');
  assert.equal((await consulta(tDocente, { table: 'sqlite_master', op: 'select' })).error?.code, 'PGRST205');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', columns: 'password_hash' })).error?.code, '42703');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', columns: 'id) FROM students --' })).error?.code, '42703');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', filters: [{ col: 'id" OR 1=1 --', op: 'eq', val: 1 }] })).error?.code, '42703');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', filters: [{ col: 'id', op: 'LIKE', val: '%' }] })).error?.code, '22023');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', order: [{ col: 'name; DROP TABLE students' }] })).error?.code, '42703');
  const inyeccion = await consulta(tDocente, { table: 'students', op: 'select', filters: [{ col: 'nie', op: 'eq', val: "x' OR '1'='1" }] });
  assert.deepEqual(inyeccion.data, [], 'los valores van como parámetros, no como SQL');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'update', values: { name: 'x', inventada: 1 } })).error?.code, '42703');
  assert.equal((await consulta(tDocente, { table: 'course_config', op: 'insert', values: { week_number: 9, inventada: 1 } })).error?.code, '42703');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'select', range: [5, 1] })).error?.code, '22023');
  assert.equal((await consulta(tDocente, { table: 'students', op: 'borrar' as any })).error?.code, '22023');
  assert.equal((await consulta(tDocente, null as any)).error?.code, 'PGRST205');
  assert.equal((await http('/api/db', { metodo: 'POST', raw: Buffer.from('{no es json'), tipo: 'application/json' })).status, 400);
  assert.equal((await http('/api/db', { cuerpo: { x: 'a'.repeat(1_100_000) } })).status, 413);
  assert.equal((db.prepare('SELECT COUNT(*) n FROM students').get() as any).n, 3, 'la tabla sigue intacta');
});

// ===================== evaluaciones =====================
const respuestasSemana = (n: number, equivocadas = 0) =>
  weeks.find(w => w.week === n)!.evaluation.map((q, i) => ({ question: q.question, answer: i < equivocadas ? '__mal__' : q.answer }));
let codigoVerificacion = '';

test('evaluación: se califica en el servidor y conserva la mejor nota y el código', async () => {
  const completa = await fn('submit-evaluation', { studentId: ana, week: 1, answers: respuestasSemana(1) }, tAna);
  assert.equal(completa.status, 200);
  const { resultados, ...sinResultados } = completa.json;
  assert.equal(resultados.length, weeks[0].evaluation.length);
  assert.deepEqual({ ...sinResultados, verificationCode: 'x' }, { score: 100, bestScore: 100, attempts: 1, completed: true, verificationCode: 'x' });
  codigoVerificacion = completa.json.verificationCode;
  assert.match(codigoVerificacion, /^[0-9a-f-]{36}$/);

  const mala = await fn('submit-evaluation', { studentId: ana, week: 1, answers: respuestasSemana(1, 9) }, tAna);
  assert.equal(mala.json.score, 10); assert.equal(mala.json.bestScore, 100);
  assert.equal(mala.json.attempts, 2); assert.equal(mala.json.completed, true);
  assert.equal(mala.json.verificationCode, codigoVerificacion, 'el código no cambia al reintentar');

  const vacia = await fn('submit-evaluation', { studentId: ana, week: 2, answers: [] }, tAna);
  assert.equal(vacia.json.score, 0); assert.equal(vacia.json.completed, false);
  const registro = await consulta(tAna, { table: 'weekly_progress', op: 'select', columns: 'week_number, best_score, completed, attempts', order: [{ col: 'week_number' }] });
  assert.deepEqual(registro.data, [
    { week_number: 1, best_score: 100, completed: true, attempts: 2 },
    { week_number: 2, best_score: 0, completed: false, attempts: 1 }
  ]);
  const log = await consulta(tDocente, { table: 'activity_log', op: 'select', filters: [{ col: 'action_type', op: 'eq', val: 'evaluation_completed' }] });
  assert.equal(log.data.length, 3); assert.equal(log.data[0].metadata.via, 'local');
});

test('evaluación: las preguntas con tildes y espacios raros cuentan bien', async () => {
  const preguntas = weeks.find(w => w.week === 1)!.evaluation;
  const conTilde = preguntas.findIndex(q => /[áéíóúñ¿]/i.test(q.question));
  assert.ok(conTilde >= 0, 'la semana 1 tiene preguntas con acentos');
  const respuestas = respuestasSemana(1).map((r, i) => i === conTilde
    ? { question: '  ' + r.question.normalize('NFD').replace(/ /g, '  ') + ' ', answer: r.answer.normalize('NFD') } : r);
  const r = await fn('submit-evaluation', { studentId: beto, week: 1, answers: respuestas }, tBeto);
  assert.equal(r.json.score, 100);
});

test('evaluación: rechaza suplantaciones, alumnos inactivos, anónimos y datos raros', async () => {
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 1, answers: respuestasSemana(1) }, tBeto)).status, 400, 'Beto no manda notas de Ana');
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 1, answers: [] })).status, 401);
  assert.equal((await fn('submit-evaluation', { studentId: pendiente, week: 1, answers: [] }, tPendiente)).status, 401, 'inactivo');
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 41, answers: [] }, tAna)).status, 400);
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: '1', answers: [] }, tAna)).status, 400);
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 1, answers: 'x' }, tAna)).status, 400);
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 1, answers: new Array(101).fill({}) }, tAna)).status, 400);
  assert.equal((await fn('submit-evaluation', { studentId: ana, week: 1, answers: [] }, tDocente)).status, 401, 'el docente no entrega evaluaciones');
  assert.equal((await http('/api/functions/inexistente', { cuerpo: {} })).status, 404);
});

// ===================== verificación =====================
test('verificación pública: código real muestra el registro, uno inventado no', async () => {
  const real = await http(`/api/verificar/${codigoVerificacion}`);
  assert.equal(real.json.found, true);
  assert.equal(real.json.studentName, 'Ana Pérez'); assert.equal(real.json.week, 1);
  assert.equal(real.json.bestScore, 100); assert.equal(real.json.completed, true);
  assert.equal((await http(`/api/verificar/${randomUUID()}`)).json.found, false);
  assert.equal((await http('/api/verificar/codigo-falso')).json.found, false);
  assert.equal((await http(`/api/verificar/${"'; DROP TABLE students;--"}`)).json.found, false);
});

// ===================== inscripción y gestión =====================
test('inscripción de punta a punta: código por grupo, aprobación y límites', async () => {
  assert.deepEqual((await fn('enroll-student', { action: 'groups' })).json.groups, [], 'sin códigos, inscripción cerrada');
  const solicitud = (extra = {}) => ({ nie: '20269123', nombre: 'María José Pérez López', grupo: 'DS1B', password: 'Clave-Segura-9', codigo: 'xxxx-0000', ...extra });
  assert.equal((await fn('enroll-student', solicitud())).status, 403);

  assert.equal((await fn('manage-students', { action: 'create_code', group: 'DS1B' }, tAna)).status, 401, 'un alumno no crea códigos');
  assert.equal((await fn('manage-students', { action: 'create_code', group: 'DS1B' })).status, 401);
  const codigo = (await fn('manage-students', { action: 'create_code', group: 'ds1b', days: 7 }, tDocente)).json.code as string;
  assert.match(codigo, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.deepEqual((await fn('enroll-student', { action: 'groups' })).json.groups, ['DS1B']);

  assert.equal((await fn('enroll-student', solicitud({ codigo }))).json.status, 'pending');
  assert.equal((await fn('enroll-student', solicitud({ codigo }))).status, 409, 'NIE repetido');
  assert.equal((await fn('enroll-student', solicitud({ nie: '20260001', codigo }))).status, 409, 'NIE de un alumno existente');

  // pendiente: puede iniciar sesión pero no hacer nada hasta que lo aprueben
  const tNueva = await entrar('20269123@inti.edu.sv', 'Clave-Segura-9');
  const fila = await consulta(tNueva, { table: 'students', op: 'select', columns: 'id, active, enrollment_status', single: 'single' });
  assert.deepEqual({ a: fila.data.active, e: fila.data.enrollment_status }, { a: false, e: 'pending' });
  assert.equal((await fn('submit-evaluation', { studentId: fila.data.id, week: 1, answers: [] }, tNueva)).status, 401);
  assert.equal((await consulta(tNueva, { table: 'students', op: 'update', values: { active: true }, filters: [{ col: 'id', op: 'eq', val: fila.data.id }] })).error?.code, '42501');

  await consulta(tDocente, { table: 'students', op: 'update', values: { active: true, enrollment_status: 'approved' }, filters: [{ col: 'id', op: 'eq', val: fila.data.id }] });
  assert.equal((await fn('submit-evaluation', { studentId: fila.data.id, week: 1, answers: respuestasSemana(1) }, tNueva)).json.score, 100, 'aprobado: ya puede evaluarse');

  // código vencido
  reloj = new Date(reloj.getTime() + 8 * 24 * 3600 * 1000);
  assert.equal((await fn('enroll-student', solicitud({ nie: '20269124', codigo }))).status, 403);
  assert.deepEqual((await fn('enroll-student', { action: 'groups' })).json.groups, []);
  reloj = new Date(reloj.getTime() - 8 * 24 * 3600 * 1000);

  // límite de intentos por NIE
  for (let i = 0; i < 5; i++) await fn('enroll-student', solicitud({ nie: '20269200', codigo: 'MALO-0000' }));
  assert.equal((await fn('enroll-student', solicitud({ nie: '20269200', codigo }))).status, 429);
});

test('gestión: restablecer contraseña, borrar, importar y cerrar códigos', async () => {
  const reset = await fn('manage-students', { action: 'reset_password', studentId: beto }, tDocente);
  assert.match(reset.json.password as string, /^[a-hj-km-np-zA-HJ-KM-NP-Z2-9]{10}$/);
  assert.equal((await http('/api/auth/login', { cuerpo: { email: '20260002@inti.edu.sv', password: '20260002#clave' } })).status, 400, 'la contraseña vieja ya no sirve');
  await entrar('20260002@inti.edu.sv', reset.json.password as string);
  assert.equal((await fn('manage-students', { action: 'reset_password', studentId: 'no-uuid' }, tDocente)).status, 400);
  assert.equal((await fn('manage-students', { action: 'reset_password', studentId: randomUUID() }, tDocente)).status, 404);

  const importado = await fn('manage-students', { action: 'import_students', rows: [
    { nie: '20270001', nombre: 'Ángel Josué Martínez', grupo: 'DS1B' },
    { nie: '20260001', nombre: 'Ana Pérez', grupo: 'DS1B' }
  ] }, tDocente);
  assert.deepEqual(importado.json.results.map((r: any) => r.estado), ['creado', 'omitido']);
  await entrar('20270001@inti.edu.sv', importado.json.results[0].password);
  assert.equal((await fn('manage-students', { action: 'import_students', rows: [{ nie: 'abc', nombre: 'X', grupo: 'DS1B' }] }, tDocente)).status, 400);

  const nuevo = (await consulta(tDocente, { table: 'students', op: 'select', columns: 'id', filters: [{ col: 'nie', op: 'eq', val: '20270001' }], single: 'single' })).data.id;
  assert.equal((await fn('manage-students', { action: 'delete_student', studentId: nuevo }, tDocente)).status, 200);
  assert.equal(db.prepare("SELECT 1 FROM auth_users WHERE email = '20270001@inti.edu.sv'").get(), undefined, 'también se borra su cuenta de acceso');
  assert.equal((await fn('manage-students', { action: 'delete_student', studentId: ana }, tDocente)).status, 409, 'con progreso no se borra');
  assert.ok(db.prepare('SELECT 1 FROM students WHERE id = ?').get(ana));

  assert.equal((await fn('manage-students', { action: 'disable_code', group: 'DS1B' }, tDocente)).status, 200);
  assert.deepEqual((await fn('enroll-student', { action: 'groups' })).json.groups, []);
  const codigos = await fn('manage-students', { action: 'list_codes' }, tDocente);
  assert.equal(codigos.json.codes[0].active, false);
  assert.equal((await fn('manage-students', { action: 'list_codes' }, tAna)).status, 401);
  assert.equal((await fn('manage-students', { action: 'rm -rf' }, tDocente)).status, 400);
});

test('tutor IA: exige sesión, clave configurada y un modelo válido', async () => {
  assert.equal((await fn('generate-content', { model: 'gemini-2.0-flash', contents: 'hola' })).status, 401);
  assert.equal((await fn('generate-content', { model: 'gemini-2.0-flash', contents: 'hola' }, tAna)).status, 503, 'sin clave de Gemini');
  const conClave = crearServidor({ rutaBase: ':memory:', dirDatos: carpeta, dirDist, dirAudio, secreto: 'k'.repeat(64), geminiKey: 'clave-falsa' });
  await new Promise<void>(r => conClave.servidor.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${(conClave.servidor.address() as AddressInfo).port}`;
  const idTemp = randomUUID();
  conClave.db.prepare("INSERT INTO students (id, nie, name, group_code, created_at) VALUES (?, '1111', 'T', 'X', ?)").run(idTemp, ahoraIso());
  conClave.db.prepare("INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, '1111@inti.edu.sv', ?, 'student', ?)").run(randomUUID(), hashPassword('abcdefgh'), ahoraIso());
  const login = await (await fetch(url + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: '1111@inti.edu.sv', password: 'abcdefgh' }) })).json() as any;
  const llamar = async (body: unknown) => (await fetch(url + '/api/functions/generate-content', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.access_token}` }, body: JSON.stringify(body) })).status;
  assert.equal(await llamar({ model: 'gpt-4', contents: 'x' }), 400, 'solo modelos gemini');
  assert.equal(await llamar({ model: 'gemini-2.0-flash; rm', contents: 'x' }), 400);
  assert.equal(await llamar({ model: 'gemini-2.0-flash' }), 400, 'sin contenido');
  conClave.servidor.close(); conClave.db.close();
});

// ===================== fotos =====================
test('fotos: solo el docente sube imágenes reales y se sirven desde /fotos', async () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40, 1)]);
  const ruta = `/api/storage/student-photos/${ana}/avatar.png`;
  assert.equal((await http(ruta, { metodo: 'PUT', raw: png, token: tAna, tipo: 'image/png' })).status, 401);
  assert.equal((await http(ruta, { metodo: 'PUT', raw: png, tipo: 'image/png' })).status, 401);
  assert.equal((await http(ruta, { metodo: 'PUT', raw: Buffer.from('<script>alert(1)</script>'), token: tDocente, tipo: 'image/png' })).status, 400, 'un html disfrazado no pasa');
  assert.equal((await http(ruta, { metodo: 'PUT', raw: Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]), token: tDocente, tipo: 'image/png' })).status, 413);
  assert.equal((await http(`/api/storage/student-photos/${ana}/avatar.php`, { metodo: 'PUT', raw: png, token: tDocente })).status, 404);
  assert.equal((await http('/api/storage/student-photos/../../secreto/avatar.png', { metodo: 'PUT', raw: png, token: tDocente })).status, 404);
  const ok = await http(ruta, { metodo: 'PUT', raw: png, token: tDocente, tipo: 'image/png' });
  assert.equal(ok.status, 200);
  const foto = await fetch(`${base}/fotos/${ana}/avatar.png`);
  assert.equal(foto.status, 200); assert.equal(foto.headers.get('content-type'), 'image/png');
  assert.equal((await fetch(`${base}/fotos/${ana}/avatar.png`, { method: 'DELETE' })).status, 405);
});

test('foto propuesta: el alumno la sube, queda pendiente y solo el docente la aprueba o rechaza', async () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40, 2)]);
  const subir = (token?: string, raw: Buffer = png) => http('/api/foto-propuesta', { metodo: 'PUT', raw, token, tipo: 'image/png' });
  assert.equal((await subir()).status, 401, 'sin sesión no');
  assert.equal((await subir(tDocente)).status, 401, 'el docente usa el otro camino');
  assert.equal((await subir(tAna, Buffer.from('<script>x</script>'))).status, 400, 'un html disfrazado no pasa');
  assert.equal((await subir(tAna, Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]))).status, 413);
  assert.equal((await subir(tAna)).status, 200);

  const fila = db.prepare('SELECT photo_pending, photo_url FROM students WHERE id = ?').get(ana) as any;
  assert.equal(fila.photo_pending, 'png');
  assert.notEqual(fila.photo_url?.includes('/fotos/'), true, 'todavía no es pública');

  // el alumno no puede ver ni escribir el estado por el motor genérico
  const mia = await http('/api/db', { metodo: 'POST', token: tAna, cuerpo: { table: 'students', op: 'update', values: { photo_url: '/fotos/x', photo_pending: null }, filters: [{ col: 'id', op: 'eq', val: ana }] } });
  assert.equal(db.prepare('SELECT photo_pending FROM students WHERE id = ?').get(ana)!.photo_pending, 'png', mia.status + ' no cambia nada');

  // ver la pendiente: solo docente
  assert.equal((await fetch(`${base}/api/fotos-pendientes/${ana}`, { headers: { Authorization: `Bearer ${tAna}` } })).status, 401);
  const vista = await fetch(`${base}/api/fotos-pendientes/${ana}`, { headers: { Authorization: `Bearer ${tDocente}` } });
  assert.equal(vista.status, 200); assert.equal(vista.headers.get('content-type'), 'image/png');

  // un alumno no aprueba
  assert.equal((await http('/api/functions/manage-students', { metodo: 'POST', token: tAna, cuerpo: { action: 'approve_photo', studentId: ana } })).status, 401);

  // rechazar limpia
  assert.equal((await http('/api/functions/manage-students', { metodo: 'POST', token: tDocente, cuerpo: { action: 'reject_photo', studentId: ana } })).status, 200);
  assert.equal(db.prepare('SELECT photo_pending FROM students WHERE id = ?').get(ana)!.photo_pending, null);
  assert.equal((await fetch(`${base}/api/fotos-pendientes/${ana}`, { headers: { Authorization: `Bearer ${tDocente}` } })).status, 404);

  // subir de nuevo y aprobar: pasa a /fotos
  assert.equal((await subir(tAna)).status, 200);
  assert.equal((await http('/api/functions/manage-students', { metodo: 'POST', token: tDocente, cuerpo: { action: 'approve_photo', studentId: ana } })).status, 200);
  const aprobada = db.prepare('SELECT photo_pending, photo_url FROM students WHERE id = ?').get(ana) as any;
  assert.equal(aprobada.photo_pending, null);
  assert.match(aprobada.photo_url, new RegExp(`^/fotos/${ana}/avatar\.png`));
  assert.equal((await fetch(`${base}/fotos/${ana}/avatar.png`)).status, 200);
});

// ---------- lecciones por bloques y medios ----------
import { validarLeccion, leerLeccion } from '../lecciones.ts';
import { readdirSync } from 'node:fs';

const leccionBase = (extra: Record<string, unknown> = {}) => ({
  title: 'Prueba', objective: 'Probar', keywords: ['uno'], status: 'published',
  blocks: [
    { type: 'texto', titulo: 'Intro', texto: 'Hola <script>alert(1)</script>' },
    { type: 'practica', preguntas: [{ question: 'Q1', options: ['a', 'b'], answer: 'a', explanation: 'porque sí' }] },
    { type: 'evaluacion', preguntas: [{ question: 'E1', options: ['x', 'y'], answer: 'y' }, { question: 'E2', options: ['m', 'n'], answer: 'm' }] }
  ],
  ...extra
});

test('lecciones: las 40 semanas del código se copiaron y todas son válidas', () => {
  const filas = db.prepare('SELECT week_number FROM lessons ORDER BY week_number').all() as { week_number: number }[];
  assert.equal(filas.length, 40);
  const malas: string[] = [];
  for (const { week_number } of filas) {
    const l = leerLeccion(db, week_number, true)!;
    const v = validarLeccion({ ...l }, week_number);
    if (!v.ok) malas.push(`semana ${week_number}: ${v.error}`);
  }
  assert.deepEqual(malas, [], 'las semanas existentes deben poder editarse y guardarse sin errores');
});

test('lecciones: el alumno no recibe las respuestas de la evaluación ni los borradores', async () => {
  assert.equal((await http('/api/lecciones')).status, 401, 'sin sesión no');
  const lista = await http('/api/lecciones', { token: tAna });
  assert.equal(lista.json.lessons.length, 40);

  const comoAlumno = (await http('/api/lecciones/1', { token: tAna })).json.lesson;
  const ev = comoAlumno.blocks.find((b: any) => b.type === 'evaluacion');
  assert.ok(ev.preguntas.length > 0);
  assert.ok(ev.preguntas.every((p: any) => p.answer === ''), 'evaluación sin respuestas');
  const pr = comoAlumno.blocks.find((b: any) => b.type === 'practica');
  assert.ok(pr.preguntas.every((p: any) => p.answer), 'la práctica sí trae respuesta para dar retroalimentación');
  const comoDocente = (await http('/api/lecciones/1', { token: tDocente })).json.lesson;
  assert.ok(comoDocente.blocks.find((b: any) => b.type === 'evaluacion').preguntas.every((p: any) => p.answer));

  db.prepare("UPDATE lessons SET status = 'draft' WHERE week_number = 40").run();
  assert.equal((await http('/api/lecciones/40', { token: tAna })).status, 404);
  assert.equal((await http('/api/lecciones/40', { token: tDocente })).status, 200);
  assert.equal((await http('/api/lecciones', { token: tAna })).json.lessons.length, 39);
  db.prepare("UPDATE lessons SET status = 'published' WHERE week_number = 40").run();
});

test('lecciones: solo el docente edita y todo lo que llega se valida', async () => {
  const put = (semana: number, cuerpo: unknown, token = tDocente) => http(`/api/lecciones/${semana}`, { metodo: 'PUT', cuerpo, token });
  assert.equal((await put(5, leccionBase(), tAna)).status, 401);
  assert.equal((await put(5, leccionBase(), '')).status, 401);
  assert.equal((await put(41, leccionBase())).status, 400);

  const malo = async (cambio: (l: any) => void, texto: RegExp) => {
    const l: any = leccionBase(); cambio(l);
    const r = await put(5, l);
    assert.equal(r.status, 400, texto.source);
    assert.match(r.json.error, texto);
  };
  await malo(l => { l.blocks[1].preguntas[0].answer = 'zzz'; }, /una de las opciones/);
  await malo(l => { l.blocks[1].preguntas[0].options = ['a', 'a']; }, /repetidas/);
  await malo(l => { l.blocks.push({ type: 'evaluacion', preguntas: l.blocks[2].preguntas }); }, /solo puede tener un bloque de evaluación/);
  await malo(l => { l.blocks.push({ type: 'script', texto: 'x' }); }, /desconocido/);
  await malo(l => { l.blocks.push({ type: 'imagen', src: '/medios/../../secreto.png' }); }, /ruta de archivo/);
  await malo(l => { l.blocks.push({ type: 'imagen', src: 'https://malo.example/x.png' }); }, /ruta de archivo/);
  await malo(l => { l.blocks.push({ type: 'video', youtube: 'https://malo.example/watch' }); }, /YouTube/);
  await malo(l => { l.blocks.push({ type: 'video' }); }, /sube un video/);
  await malo(l => { l.blocks.push({ type: 'simulacion', simulationId: "SIM-1'; DROP" }); }, /SIM-011/);
  await malo(l => { l.title = ''; }, /título/);
  await malo(l => { l.status = 'otro'; }, /estado/);
  await malo(l => { l.blocks[0].texto = 'x'.repeat(20001); }, /demasiado largo/);

  const ok: any = leccionBase();
  ok.blocks.push({ type: 'video', youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5' });
  const r = await put(5, ok);
  assert.equal(r.status, 200);
  const guardada = r.json.lesson.blocks;
  assert.equal(guardada[0].texto, 'Hola <script>alert(1)</script>', 'el texto se guarda tal cual, y la pantalla lo mostrará como texto');
  assert.equal(guardada.at(-1).youtube, 'dQw4w9WgXcQ');
  assert.ok(guardada.every((b: any) => typeof b.id === 'string' && b.id.length > 0));
});

test('lecciones: cada guardado deja una versión y se puede volver atrás', async () => {
  const put = (cuerpo: unknown) => http('/api/lecciones/6', { metodo: 'PUT', cuerpo, token: tDocente });
  const original = (await http('/api/lecciones/6', { token: tDocente })).json.lesson;
  assert.equal((await put(leccionBase({ title: 'Cambio 1' }))).status, 200);
  assert.equal((await put(leccionBase({ title: 'Cambio 2' }))).status, 200);
  const v = (await http('/api/lecciones/6/versiones', { token: tDocente })).json.versions;
  assert.equal(v.length, 2);
  assert.equal((await http('/api/lecciones/6/versiones', { token: tAna })).status, 401);
  const masVieja = v[v.length - 1];
  assert.equal(masVieja.title, original.title);
  assert.equal((await http('/api/lecciones/6/restaurar', { cuerpo: { versionId: masVieja.id }, token: tAna })).status, 401);
  assert.equal((await http('/api/lecciones/6/restaurar', { cuerpo: { versionId: 99999 }, token: tDocente })).status, 404);
  const rest = await http('/api/lecciones/6/restaurar', { cuerpo: { versionId: masVieja.id }, token: tDocente });
  assert.equal(rest.status, 200);
  assert.equal(rest.json.lesson.title, original.title);
  for (let i = 0; i < 25; i++) await put(leccionBase({ title: `Rápido ${i}` }));
  assert.equal((await http('/api/lecciones/6/versiones', { token: tDocente })).json.versions.length, 20, 'solo se guardan las últimas 20');
});

test('lecciones: la nota se calcula con la evaluación editada', async () => {
  const l: any = leccionBase();
  assert.equal((await http('/api/lecciones/7', { metodo: 'PUT', cuerpo: l, token: tDocente })).status, 200);
  const ok = await fn('submit-evaluation', { studentId: ana, week: 7, answers: [{ question: 'E1', answer: 'y' }, { question: 'E2', answer: 'm' }] }, tAna);
  assert.equal(ok.status, 200); assert.equal(ok.json.score, 100);
  const mitad = await fn('submit-evaluation', { studentId: ana, week: 7, answers: [{ question: 'E1', answer: 'x' }, { question: 'E2', answer: 'm' }] }, tAna);
  assert.equal(mitad.json.score, 50);
  assert.equal(mitad.json.bestScore, 100, 'la mejor nota anterior se conserva');
});

test('medios: solo el docente sube; el tipo se decide por el contenido real', async () => {
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(100, 3)]);
  const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypisom'), Buffer.alloc(5000, 7)]);
  const pdf = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(200, 32)]);
  const mp3 = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(200, 1)]);
  const subir = (raw: Buffer, token?: string) => http('/api/medios', { metodo: 'POST', raw, token, tipo: 'application/octet-stream' });

  assert.equal((await subir(png)).status, 401);
  assert.equal((await subir(png, tAna)).status, 401);
  assert.equal((await subir(Buffer.from('<html><script>alert(1)</script></html>'), tDocente)).status, 400);
  assert.equal((await subir(Buffer.from('MZ\x90\x00 programa'), tDocente)).status, 400, 'un ejecutable no pasa');
  assert.equal((await subir(Buffer.alloc(0), tDocente)).status, 400);
  assert.equal((await subir(Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]), tDocente)).status, 413, 'imagen sobre 5 MB');

  const img = await subir(png, tDocente);
  assert.equal(img.status, 200); assert.equal(img.json.tipo, 'imagen'); assert.match(img.json.src, /^\/medios\/[0-9a-f-]{36}\.png$/);
  const vista = await fetch(base + img.json.src);
  assert.equal(vista.status, 200); assert.equal(vista.headers.get('content-type'), 'image/png');

  const doc = (await subir(pdf, tDocente)).json; assert.equal(doc.tipo, 'pdf');
  const aud = (await subir(mp3, tDocente)).json; assert.equal(aud.tipo, 'audio');
  const vid = (await subir(mp4, tDocente)).json; assert.equal(vid.tipo, 'video'); assert.equal(vid.bytes, mp4.length);

  // los videos necesitan poder saltar de posición (Range)
  const parcial = await fetch(base + vid.src, { headers: { Range: 'bytes=100-199' } });
  assert.equal(parcial.status, 206);
  assert.equal(parcial.headers.get('content-range'), `bytes 100-199/${mp4.length}`);
  assert.equal((await parcial.arrayBuffer()).byteLength, 100);
  assert.equal((await fetch(base + vid.src, { headers: { Range: 'bytes=999999-' } })).status, 416);

  // los archivos subidos se pueden usar en una lección
  const l: any = leccionBase(); l.blocks.push({ type: 'imagen', src: img.json.src, alt: 'logo' }, { type: 'pdf', src: doc.src });
  assert.equal((await http('/api/lecciones/8', { metodo: 'PUT', cuerpo: l, token: tDocente })).status, 200);

  assert.equal((await fetch(base + '/medios/../secreto-fuera.txt')).status, 404);
  assert.equal(readdirSync(join(carpeta, 'medios')).filter(f => f.endsWith('.part')).length, 0, 'no quedan archivos a medias');
});

test('lecciones: ?completo=1 trae todo en una petición y la evaluación informa qué preguntas acertó', async () => {
  const completo = await http('/api/lecciones?completo=1', { token: tAna });
  assert.equal(completo.json.lessons.length, 40);
  assert.ok(completo.json.lessons.every((l: any) => Array.isArray(l.blocks)));
  const ev = completo.json.lessons[0].blocks.find((b: any) => b.type === 'evaluacion');
  assert.ok(ev.preguntas.every((p: any) => p.answer === ''), 'también en la versión completa se ocultan las respuestas');
  assert.equal((await http('/api/lecciones?completo=1')).status, 401);

  const claves = weeks.find(w => w.week === 1)!.evaluation;
  const answers = claves.map((q, i) => ({ question: q.question, answer: i === 0 ? 'respuesta equivocada' : q.answer }));
  const r = await fn('submit-evaluation', { studentId: ana, week: 1, answers }, tAna);
  assert.equal(r.status, 200);
  assert.equal(r.json.resultados.length, claves.length);
  assert.equal(r.json.resultados[0].correct, false);
  assert.ok(r.json.resultados.slice(1).every((x: any) => x.correct));
});

// ---------- exportar e importar cursos ----------
import { Writable } from 'node:stream';
import { readFileSync } from 'node:fs';
import { escribirZip, listarZip, extraerBuffer, type ItemZip } from '../zip.ts';

async function construirZip(items: ItemZip[]): Promise<Buffer> {
  const partes: Buffer[] = [];
  await escribirZip(new Writable({ write(p, _e, cb) { partes.push(Buffer.from(p)); cb(); } }), items, new Date('2026-11-10T10:00:00Z'));
  return Buffer.concat(partes);
}
const manifiestoDe = (lecciones: unknown[], extra: Record<string, unknown> = {}) =>
  Buffer.from(JSON.stringify({ formato: 'technical-english-lab/curso', version: 1, creado: '2026-11-10', lecciones, archivos: [], faltantes: [], ...extra }));
const bajar = async (ruta: string, token?: string) => {
  const r = await fetch(base + ruta, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return { status: r.status, tipo: r.headers.get('content-type'), datos: Buffer.from(await r.arrayBuffer()), cabeceras: r.headers };
};
const subirZip = (zip: Buffer, token?: string) => http('/api/importar', { metodo: 'POST', raw: zip, token, tipo: 'application/zip' });
const aplicar = (cuerpo: unknown, token = tDocente) => http('/api/importar/aplicar', { cuerpo, token });
const pngPrueba = () => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('imagen-de-prueba-'.repeat(20))]);

test('zip: lo que se escribe se lee igual, con CRC, y se rechazan nombres peligrosos', async () => {
  const grande = Buffer.from('a'.repeat(50000));
  const zip = await construirZip([{ nombre: 'curso.json', datos: grande }, { nombre: 'archivos/0001.png', datos: Buffer.from([1, 2, 3]) }]);
  const ruta = join(carpeta, 'prueba.zip'); writeFileSync(ruta, zip);
  const e = listarZip(ruta);
  assert.deepEqual(e.map(x => x.nombre), ['curso.json', 'archivos/0001.png']);
  assert.equal(e[0].metodo, 8, 'el texto se comprime');
  assert.ok(extraerBuffer(ruta, e[0], 100000).equals(grande));
  assert.throws(() => extraerBuffer(ruta, e[0], 1000), /demasiado grande/);

  for (const malo of ['../fuera.txt', '/absoluto.txt', 'a/../../b.txt', 'a\\b.txt']) {
    const z = await construirZip([{ nombre: malo, datos: Buffer.from('x') }]);
    writeFileSync(ruta, z);
    assert.throws(() => listarZip(ruta), /no permitido/, malo);
  }
  writeFileSync(ruta, Buffer.from('esto no es un zip, solo texto largo para pasar el mínimo de bytes'));
  assert.throws(() => listarZip(ruta), /ZIP/);
});

test('exportar: solo el docente, parámetros válidos y el ZIP trae la lección con sus archivos', async () => {
  assert.equal((await bajar('/api/exportar')).status, 401);
  assert.equal((await bajar('/api/exportar', tAna)).status, 401);
  assert.equal((await bajar('/api/exportar?semanas=0', tDocente)).status, 400);
  assert.equal((await bajar('/api/exportar?semanas=1,x', tDocente)).status, 400);

  const img = (await http('/api/medios', { metodo: 'POST', raw: pngPrueba(), token: tDocente, tipo: 'application/octet-stream' })).json;
  const l: any = leccionBase(); l.blocks.push({ type: 'imagen', src: img.src, alt: 'prueba' }, { type: 'audio', src: '/audio/week01/x.mp3' });
  assert.equal((await http('/api/lecciones/9', { metodo: 'PUT', cuerpo: l, token: tDocente })).status, 200);

  const r = await bajar('/api/exportar?semanas=9', tDocente);
  assert.equal(r.status, 200); assert.equal(r.tipo, 'application/zip');
  assert.match(r.cabeceras.get('content-disposition') ?? '', /leccion-semana-09-\d{4}-\d{2}-\d{2}\.zip/);
  const ruta = join(carpeta, 'export9.zip'); writeFileSync(ruta, r.datos);
  const e = listarZip(ruta);
  assert.deepEqual(e.map(x => x.nombre).sort(), ['archivos/0001.png', 'archivos/0002.mp3', 'curso.json']);
  const m = JSON.parse(extraerBuffer(ruta, e.find(x => x.nombre === 'curso.json')!, 1e6).toString());
  assert.equal(m.lecciones.length, 1); assert.equal(m.lecciones[0].week, 9);
  assert.ok(extraerBuffer(ruta, e.find(x => x.nombre === 'archivos/0001.png')!, 1e6).equals(pngPrueba()));

  const todas = await bajar('/api/exportar?semanas=todas', tDocente);
  writeFileSync(ruta, todas.datos);
  const mt = JSON.parse(extraerBuffer(ruta, listarZip(ruta).find(x => x.nombre === 'curso.json')!, 5e6).toString());
  assert.equal(mt.lecciones.length, 40);
});

test('importar: se ve qué trae, se elige el destino y entra como borrador con sus archivos', async () => {
  const exp = await bajar('/api/exportar?semanas=9', tDocente);
  assert.equal((await subirZip(exp.datos)).status, 401);
  assert.equal((await subirZip(exp.datos, tAna)).status, 401);

  const previa = await subirZip(exp.datos, tDocente);
  assert.equal(previa.status, 200, previa.texto);
  assert.equal(previa.json.lecciones.length, 1);
  assert.equal(previa.json.lecciones[0].week, 9);
  assert.equal(previa.json.lecciones[0].preguntasEvaluacion, 2);
  assert.equal(previa.json.archivos, 2);
  assert.equal(previa.json.semanas.length, 40);
  assert.ok(previa.json.semanas.find((s: any) => s.week === 1).notas >= 1, 'avisa qué semanas ya tienen notas');

  const antes = (db.prepare('SELECT COUNT(*) n FROM lesson_versions WHERE week_number = 12').get() as any).n;
  assert.equal((await aplicar({ id: previa.json.id, destinos: [{ origen: 9, destino: 99 }], estado: 'draft' })).status, 400);
  assert.equal((await aplicar({ id: previa.json.id, destinos: [{ origen: 5, destino: 12 }], estado: 'draft' })).status, 400, 'esa semana no está en el archivo');
  assert.equal((await aplicar({ id: previa.json.id, destinos: [{ origen: 9, destino: 12 }], estado: 'raro' })).status, 400);
  assert.equal((await aplicar({ id: previa.json.id, destinos: [{ origen: 9, destino: 12 }], estado: 'draft' }, tAna)).status, 401);

  const ok = await aplicar({ id: previa.json.id, destinos: [{ origen: 9, destino: 12 }], estado: 'draft' });
  assert.equal(ok.status, 200, ok.texto);
  assert.equal(ok.json.importadas[0].week, 12); assert.equal(ok.json.importadas[0].status, 'draft');

  const doce = (await http('/api/lecciones/12', { token: tDocente })).json.lesson;
  assert.equal(doce.status, 'draft');
  const nueva = doce.blocks.find((b: any) => b.type === 'imagen');
  assert.match(nueva.src, /^\/medios\/[0-9a-f-]{36}\.png$/);
  const original = (await http('/api/lecciones/9', { token: tDocente })).json.lesson.blocks.find((b: any) => b.type === 'imagen');
  assert.notEqual(nueva.src, original.src, 'cada importación guarda sus propios archivos');
  assert.ok(Buffer.from(await (await fetch(base + nueva.src)).arrayBuffer()).equals(pngPrueba()));
  assert.equal((await http('/api/lecciones/12', { token: tAna })).status, 404, 'el borrador no lo ve el alumno');
  assert.equal((db.prepare('SELECT COUNT(*) n FROM lesson_versions WHERE week_number = 12').get() as any).n, antes + 1, 'lo reemplazado queda en el historial');

  assert.equal((await aplicar({ id: previa.json.id, destinos: [{ origen: 9, destino: 12 }], estado: 'draft' })).status, 404, 'la importación se usa una sola vez');
});

test('importar: archivos dañados, hostiles o inválidos se rechazan sin dejar rastro', async () => {
  const lecc = (extra: Record<string, unknown> = {}) => ({ week: 20, title: 'X', objective: '', keywords: [], status: 'published', blocks: [{ type: 'texto', texto: 'hola' }], ...extra });
  const medios = () => readdirSync(join(carpeta, 'medios'));
  const antes = medios().length;

  assert.equal((await subirZip(Buffer.from('no soy un zip pero tengo bastantes bytes para engañar'), tDocente)).status, 400);
  assert.equal((await subirZip(await construirZip([{ nombre: '../curso.json', datos: manifiestoDe([lecc()]) }]), tDocente)).status, 400);
  assert.equal((await subirZip(await construirZip([{ nombre: 'otro.txt', datos: Buffer.from('x') }]), tDocente)).status, 400, 'sin curso.json');
  assert.equal((await subirZip(await construirZip([{ nombre: 'curso.json', datos: Buffer.from('{no es json') }]), tDocente)).status, 400);
  assert.equal((await subirZip(await construirZip([{ nombre: 'curso.json', datos: manifiestoDe([lecc()], { formato: 'otra-cosa' }) }]), tDocente)).status, 400);
  assert.equal((await subirZip(await construirZip([{ nombre: 'curso.json', datos: manifiestoDe([lecc(), lecc()]) }]), tDocente)).status, 400, 'semana repetida');
  assert.equal((await subirZip(await construirZip([{ nombre: 'curso.json', datos: manifiestoDe([]) }]), tDocente)).status, 400);
  const invalida = await subirZip(await construirZip([{ nombre: 'curso.json', datos: manifiestoDe([lecc({ blocks: [{ type: 'evaluacion', preguntas: [{ question: 'q', options: ['a', 'b'], answer: 'z' }] }] })]) }]), tDocente);
  assert.equal(invalida.status, 400); assert.match(invalida.json.error, /Semana 20/);
  const bomba = await subirZip(await construirZip([{ nombre: 'curso.json', datos: Buffer.alloc(20 * 1024 * 1024) }]), tDocente);
  assert.equal(bomba.status, 400, 'un texto que se infla a 20 MB no pasa');

  // un archivo con el CRC alterado se detecta al aplicar y no deja nada en /medios
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), randomBytes(400)]); // no comprimible: se guarda tal cual
  const man = manifiestoDe([lecc({ blocks: [{ type: 'imagen', src: '/medios/aaaa.png', alt: 'x' }] })], { archivos: [{ entrada: 'archivos/0001.png', src: '/medios/aaaa.png' }] });
  const bueno = await construirZip([{ nombre: 'curso.json', datos: man }, { nombre: 'archivos/0001.png', datos: png }]);
  const posicion = bueno.indexOf(png); assert.ok(posicion > 0, 'el archivo va sin comprimir');
  const roto = Buffer.from(bueno); roto[posicion + 40] ^= 0xff;
  const pr = await subirZip(roto, tDocente); assert.equal(pr.status, 200, 'la vista previa solo lee el manifiesto');
  const mal = await aplicar({ id: pr.json.id, destinos: [{ origen: 20, destino: 20 }], estado: 'draft' });
  assert.equal(mal.status, 400); assert.match(mal.json.error, /dañado|CRC/);
  assert.equal(medios().length, antes, 'no quedan archivos a medias');

  // un archivo que no es de un formato permitido tampoco entra
  const exe = Buffer.from('MZ\x90\x00 programa que no debería entrar nunca');
  const man2 = manifiestoDe([lecc({ blocks: [{ type: 'imagen', src: '/medios/bbbb.png', alt: 'x' }] })], { archivos: [{ entrada: 'archivos/0001.png', src: '/medios/bbbb.png' }] });
  const z2 = await construirZip([{ nombre: 'curso.json', datos: man2 }, { nombre: 'archivos/0001.png', datos: exe }]);
  const p2 = await subirZip(z2, tDocente);
  const m2 = await aplicar({ id: p2.json.id, destinos: [{ origen: 20, destino: 20 }], estado: 'draft' });
  assert.equal(m2.status, 400); assert.match(m2.json.error, /formato permitido/);
  assert.equal(medios().length, antes);

  // referencia a un archivo que no viene en el ZIP: error claro para imagen, se quita en el audio del vocabulario
  const man3 = manifiestoDe([lecc({ blocks: [{ type: 'imagen', src: '/medios/cccc.png', alt: 'x' }] })]);
  const p3 = await subirZip(await construirZip([{ nombre: 'curso.json', datos: man3 }]), tDocente);
  assert.equal((await aplicar({ id: p3.json.id, destinos: [{ origen: 20, destino: 20 }], estado: 'draft' })).status, 400);
  const man4 = manifiestoDe([lecc({ blocks: [{ type: 'vocabulario', items: [{ word: 'a', meaning: 'b', example: 'c', audio: '/medios/dddd.mp3' }] }] })]);
  const p4 = await subirZip(await construirZip([{ nombre: 'curso.json', datos: man4 }]), tDocente);
  const a4 = await aplicar({ id: p4.json.id, destinos: [{ origen: 20, destino: 20 }], estado: 'conservar' });
  assert.equal(a4.status, 200); assert.equal(a4.json.advertencias.length, 1);
  assert.equal((await http('/api/lecciones/20', { token: tDocente })).json.lesson.blocks[0].items[0].audio, undefined);

  // dos lecciones al mismo destino
  const man5 = manifiestoDe([lecc({ week: 21 }), lecc({ week: 22 })]);
  const p5 = await subirZip(await construirZip([{ nombre: 'curso.json', datos: man5 }]), tDocente);
  assert.equal((await aplicar({ id: p5.json.id, destinos: [{ origen: 21, destino: 30 }, { origen: 22, destino: 30 }], estado: 'draft' })).status, 400);
  assert.equal((await aplicar({ id: 'no-es-uuid', destinos: [], estado: 'draft' })).status, 400);
});

test('importar: una importación vieja se limpia y se puede arrancar sin las semanas de inglés', async () => {
  const dirImp = join(carpeta, 'importaciones');
  const vieja = join(dirImp, `${randomUUID()}.zip`);
  writeFileSync(vieja, 'viejo');
  const antiguo = new Date(Date.now() - 3 * 3600 * 1000);
  const { utimesSync } = await import('node:fs'); utimesSync(vieja, antiguo, antiguo);
  const exp = await bajar('/api/exportar?semanas=9', tDocente);
  await subirZip(exp.datos, tDocente);
  assert.equal(existsSync(vieja), false, 'se borró lo que llevaba más de 2 horas');

  const { servidor: s2, db: db2 } = crearServidor({
    rutaBase: ':memory:', dirDatos: join(carpeta, 'otra'), dirDist, dirAudio, secreto: 'x'.repeat(64), sembrar: false
  });
  assert.equal((db2.prepare('SELECT COUNT(*) n FROM lessons').get() as any).n, 0, 'sin semilla: sin lecciones');
  s2.close(); db2.close();
});
