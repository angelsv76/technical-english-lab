// Pruebas de la lógica de inscripción (sin red). Uso: npx tsx scripts/test-enrollment.ts
import assert from 'node:assert/strict';
import {
  inscribir, gruposConInscripcionAbierta,
  MAX_FALLOS_POR_NIE, MAX_FALLOS_GLOBALES, type EnrollDeps
} from '../supabase/functions/_shared/enrollment.ts';
import {
  generarCodigo, generarClave, normalizarCodigo, codigosIguales,
  validarInscripcion, validarFilasImportacion, validarDiasVigencia
} from '../supabase/functions/_shared/enrollmentRules.ts';

let pasaron = 0;
const prueba = async (nombre: string, fn: () => Promise<void> | void) => {
  try { await fn(); pasaron++; console.log(`  ✓ ${nombre}`); }
  catch (e) { console.error(`  ✗ ${nombre}\n    ${(e as Error).message}`); process.exitCode = 1; }
};

// ---- base falsa en memoria ----
function crearEntorno(opciones: { insertFalla?: boolean; authFalla?: 'existe' | 'falla' } = {}) {
  const ahora = new Date('2026-11-07T15:00:00Z');
  const estado = {
    codigos: new Map<string, { code: string; expires_at: string; active: boolean }>([
      ['DS1B', { code: 'ABCD-2345', expires_at: '2026-11-20T00:00:00Z', active: true }],
      ['DS1A', { code: 'ZZZZ-9999', expires_at: '2026-11-01T00:00:00Z', active: true }],   // vencido
      ['DS1D', { code: 'MMMM-7777', expires_at: '2026-11-20T00:00:00Z', active: false }]   // desactivado
    ]),
    alumnos: new Set<string>(['19709037']),
    usuariosAuth: new Map<string, string>(),
    filasAlumno: [] as any[],
    intentos: [] as { nie: string | null; ok: boolean; en: Date }[],
    borrados: [] as string[]
  };
  const deps: EnrollDeps = {
    ahora: () => ahora,
    obtenerCodigo: async g => estado.codigos.get(g) ?? null,
    gruposAbiertos: async iso => [...estado.codigos].filter(([, c]) => c.active && c.expires_at > iso).map(([g]) => g),
    existeAlumno: async nie => estado.alumnos.has(nie),
    fallosDesde: async (desde, nie) =>
      estado.intentos.filter(i => !i.ok && i.en.toISOString() >= desde && (!nie || i.nie === nie)).length,
    registrarIntento: async (nie, ok) => { estado.intentos.push({ nie, ok, en: ahora }); },
    crearUsuarioAuth: async (correo) => {
      if (opciones.authFalla) return { error: opciones.authFalla };
      if (estado.usuariosAuth.has(correo)) return { error: 'existe' };
      const id = `auth-${estado.usuariosAuth.size + 1}`;
      estado.usuariosAuth.set(correo, id);
      return { id };
    },
    insertarAlumno: async fila => {
      if (opciones.insertFalla) return 'boom';
      estado.filasAlumno.push(fila); estado.alumnos.add(fila.nie); return null;
    },
    borrarUsuarioAuth: async id => {
      estado.borrados.push(id);
      for (const [c, v] of estado.usuariosAuth) if (v === id) estado.usuariosAuth.delete(c);
    }
  };
  return { deps, estado };
}

const valida = (extra: Record<string, unknown> = {}) => ({
  nie: '20269123', nombre: 'María José Pérez López', grupo: 'DS1B',
  password: 'Clave-Segura-9', codigo: 'abcd 2345', ...extra
});

console.log('Reglas');
await prueba('generarCodigo tiene formato XXXX-XXXX sin caracteres ambiguos', () => {
  for (let i = 0; i < 200; i++) assert.match(generarCodigo(), /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
});
await prueba('generarClave: 10 caracteres sin 0/O/1/l/I', () => {
  for (let i = 0; i < 200; i++) assert.match(generarClave(), /^[a-hj-km-np-zA-HJ-KM-NP-Z2-9]{10}$/);
});
await prueba('los códigos generados no se repiten', () => {
  assert.equal(new Set(Array.from({ length: 500 }, generarCodigo)).size, 500);
});
await prueba('normalizarCodigo ignora mayúsculas, guiones y espacios', () => {
  assert.equal(normalizarCodigo(' abcd-2345 '), 'ABCD2345');
  assert.ok(codigosIguales('abcd 2345', 'ABCD-2345'));
  assert.ok(!codigosIguales('ABCD-2345', 'ABCD-2346'));
  assert.ok(!codigosIguales('ABCD-2345', ''));
});
await prueba('validarInscripcion acepta una solicitud correcta', () => {
  const r = validarInscripcion(valida());
  assert.ok(r.ok); if (r.ok) { assert.equal(r.valor.grupo, 'DS1B'); assert.equal(r.valor.nie, '20269123'); }
});
for (const [titulo, extra] of [
  ['NIE con letras', { nie: '20A69' }], ['NIE corto', { nie: '123' }],
  ['nombre con números', { nombre: 'Juan 123' }], ['nombre muy corto', { nombre: 'Al' }],
  ['grupo con símbolos', { grupo: 'DS-1B!' }], ['contraseña corta', { password: 'abc123' }],
  ['contraseña igual al NIE', { password: '20269123' }], ['contraseña con el NIE dentro', { password: 'x20269123x' }],
  ['contraseña repetida', { password: 'aaaaaaaaaa' }], ['contraseña común', { password: '12345678' }],
  ['código vacío', { codigo: '' }], ['código demasiado corto', { codigo: 'AB' }]
] as [string, Record<string, unknown>][]) {
  await prueba(`rechaza: ${titulo}`, () => assert.equal(validarInscripcion(valida(extra)).ok, false));
}
await prueba('rechaza cuerpos que no son objeto', () => {
  for (const x of [null, undefined, 'texto', 42]) assert.equal(validarInscripcion(x).ok, false);
});
await prueba('importación: acepta filas buenas, rechaza repetidas, malas y exceso', () => {
  assert.ok(validarFilasImportacion([{ nie: '1234', nombre: 'Ana Gómez', grupo: 'ds1b' }]).ok);
  assert.equal(validarFilasImportacion([]).ok, false);
  assert.equal(validarFilasImportacion([{ nie: '1234', nombre: 'Ana Gómez', grupo: 'A' }]).ok, false);
  const dup = { nie: '1234', nombre: 'Ana Gómez', grupo: 'DS1B' };
  assert.equal(validarFilasImportacion([dup, dup]).ok, false);
  assert.equal(validarFilasImportacion(Array.from({ length: 101 }, (_, i) => ({ nie: String(1000 + i), nombre: 'Ana Gómez', grupo: 'DS1B' }))).ok, false);
});
await prueba('validarDiasVigencia acota entre 1 y 60', () => {
  assert.equal(validarDiasVigencia(undefined), 14); assert.equal(validarDiasVigencia(0), 1);
  assert.equal(validarDiasVigencia(999), 60); assert.equal(validarDiasVigencia(7), 7);
  assert.equal(validarDiasVigencia(NaN), 14);
});

console.log('Flujo de inscripción');
await prueba('inscripción correcta: queda PENDIENTE e inactiva', async () => {
  const { deps, estado } = crearEntorno();
  const r = await inscribir(deps, valida());
  assert.equal(r.status, 200); assert.deepEqual(r.body, { ok: true, status: 'pending' });
  assert.equal(estado.filasAlumno.length, 1);
  assert.equal(estado.filasAlumno[0].active, false);
  assert.equal(estado.filasAlumno[0].enrollment_status, 'pending');
  assert.equal(estado.filasAlumno[0].group_code, 'DS1B');
  assert.ok(estado.usuariosAuth.has('20269123@inti.edu.sv'));
});
await prueba('código incorrecto → 403 y no se crea nada', async () => {
  const { deps, estado } = crearEntorno();
  const r = await inscribir(deps, valida({ codigo: 'ABCD-0000' }));
  assert.equal(r.status, 403); assert.equal(estado.filasAlumno.length, 0); assert.equal(estado.usuariosAuth.size, 0);
});
await prueba('código de OTRO grupo no sirve', async () => {
  const { deps } = crearEntorno();
  assert.equal((await inscribir(deps, valida({ grupo: 'DS1A', codigo: 'ABCD-2345' }))).status, 403);
});
await prueba('código vencido → 403 aunque sea el correcto', async () => {
  const { deps } = crearEntorno();
  assert.equal((await inscribir(deps, valida({ grupo: 'DS1A', codigo: 'ZZZZ-9999' }))).status, 403);
});
await prueba('código desactivado → 403 aunque sea el correcto', async () => {
  const { deps } = crearEntorno();
  assert.equal((await inscribir(deps, valida({ grupo: 'DS1D', codigo: 'MMMM-7777' }))).status, 403);
});
await prueba('grupo inexistente → mismo mensaje que código malo (no revela grupos)', async () => {
  const { deps } = crearEntorno();
  const a = await inscribir(deps, valida({ grupo: 'XX9' }));
  const b = await inscribir(deps, valida({ codigo: 'ABCD-0000' }));
  assert.equal(a.status, 403); assert.deepEqual(a.body, b.body);
});
await prueba('NIE ya inscrito → 409 y no toca la cuenta existente', async () => {
  const { deps, estado } = crearEntorno();
  const r = await inscribir(deps, valida({ nie: '19709037' }));
  assert.equal(r.status, 409); assert.equal(estado.usuariosAuth.size, 0); assert.equal(estado.filasAlumno.length, 0);
});
await prueba('si falla el insert se BORRA la cuenta de acceso (sin huérfanos)', async () => {
  const { deps, estado } = crearEntorno({ insertFalla: true });
  const r = await inscribir(deps, valida());
  assert.equal(r.status, 500); assert.equal(estado.usuariosAuth.size, 0); assert.equal(estado.borrados.length, 1);
});
await prueba('cuenta de acceso ya existente sin alumno → 409 genérico', async () => {
  const { deps } = crearEntorno({ authFalla: 'existe' });
  assert.equal((await inscribir(deps, valida())).status, 409);
});
await prueba('falla de Auth → 502 y no queda fila de alumno', async () => {
  const { deps, estado } = crearEntorno({ authFalla: 'falla' });
  assert.equal((await inscribir(deps, valida())).status, 502); assert.equal(estado.filasAlumno.length, 0);
});
await prueba(`tras ${MAX_FALLOS_POR_NIE} fallos de un NIE, el siguiente intento (aun con código bueno) → 429`, async () => {
  const { deps, estado } = crearEntorno();
  for (let i = 0; i < MAX_FALLOS_POR_NIE; i++) assert.equal((await inscribir(deps, valida({ codigo: 'ABCD-0000' }))).status, 403);
  const r = await inscribir(deps, valida());
  assert.equal(r.status, 429); assert.equal(estado.filasAlumno.length, 0);
});
await prueba('el límite por NIE no bloquea a otro NIE', async () => {
  const { deps } = crearEntorno();
  for (let i = 0; i < MAX_FALLOS_POR_NIE; i++) await inscribir(deps, valida({ codigo: 'ABCD-0000' }));
  assert.equal((await inscribir(deps, valida({ nie: '20269124' }))).status, 200);
});
await prueba(`límite global: ${MAX_FALLOS_GLOBALES} fallos de NIE distintos bloquean todo`, async () => {
  const { deps } = crearEntorno();
  for (let i = 0; i < MAX_FALLOS_GLOBALES; i++) await inscribir(deps, valida({ nie: String(30000000 + i), codigo: 'ABCD-0000' }));
  assert.equal((await inscribir(deps, valida({ nie: '20269999' }))).status, 429);
});
await prueba('validación falla antes de tocar la base (400, sin intentos registrados)', async () => {
  const { deps, estado } = crearEntorno();
  assert.equal((await inscribir(deps, valida({ password: '1' }))).status, 400);
  assert.equal(estado.intentos.length, 0);
});
await prueba('grupos abiertos: solo con código activo y vigente', async () => {
  const { deps } = crearEntorno();
  assert.deepEqual((await gruposConInscripcionAbierta(deps)).body, { groups: ['DS1B'] });
});

console.log(`\n${pasaron} pruebas pasaron${process.exitCode ? ' — HAY FALLAS' : ''}`);
