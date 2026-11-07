// Motor de consultas de /api/db. Recibe una petición con la misma forma de
// consulta que usa la app con supabase-js y la ejecuta sobre SQLite, aplicando
// las reglas de acceso por rol (lo que en Supabase hacían las políticas RLS).
//
// Nada de lo que llega del cliente se concatena al SQL: tablas y columnas se
// validan contra el esquema, y los valores van siempre como parámetros.
import type { DatabaseSync } from 'node:sqlite';
import { TABLAS, valoresPorDefecto, type TipoColumna } from './esquema.ts';
import { enTransaccion } from './db.ts';

export type Rol = 'anon' | 'student' | 'teacher';

export interface Identidad {
  rol: Rol;
  /** Alumno autenticado (rol student). */
  studentId?: string;
  /** Solo los alumnos activos pueden escribir su glosario y su actividad. */
  active?: boolean;
}

export interface Filtro { col: string; op: string; val: unknown }

export interface Peticion {
  table: string;
  op: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  columns?: string;
  filters?: Filtro[];
  order?: { col: string; ascending?: boolean }[];
  range?: [number, number];
  limit?: number;
  single?: 'single' | 'maybe' | null;
  values?: unknown;
  onConflict?: string;
  ignoreDuplicates?: boolean;
  returning?: boolean;
}

export interface ErrorDatos { message: string; code: string }
export interface Respuesta { data: unknown; error: ErrorDatos | null }

type Cond = { sql: string; params: unknown[] } | null;

interface Permisos {
  leer: Cond;
  insertar: ((fila: Record<string, unknown>) => boolean) | null;
  actualizar: { cond: Cond; columnas: string[] } | null;
}

const TODO: Cond = { sql: '1 = 1', params: [] };
const falla = (message: string, code: string): Respuesta => ({ data: null, error: { message, code } });

function propio(columna: string, id: Identidad): Cond {
  return id.studentId ? { sql: `"${columna}" = ?`, params: [id.studentId] } : null;
}

const columnasDe = (tabla: string, excepto: string[] = []) =>
  Object.keys(TABLAS[tabla].columnas).filter(c => !excepto.includes(c));

/** Reglas por tabla y rol. Lo que no aparece aquí queda denegado. */
function permisosDe(tabla: string, id: Identidad): Permisos {
  const docente = id.rol === 'teacher';
  const alumno = id.rol === 'student' && !!id.studentId;
  const alumnoActivo = alumno && id.active === true;

  switch (tabla) {
    case 'students':
      return {
        leer: docente ? TODO : alumno ? propio('id', id) : null,
        insertar: null, // las altas pasan solo por inscripción o importación
        actualizar: docente
          ? { cond: TODO, columnas: columnasDe('students', ['id']) }
          : alumno
            ? { cond: propio('id', id), columnas: ['last_login', 'last_seen'] }
            : null
      };
    case 'weekly_progress':
      return {
        leer: docente ? TODO : alumno ? propio('student_id', id) : null,
        insertar: null, // las notas solo las escribe la función submit-evaluation
        actualizar: null
      };
    case 'glossary_entries':
      return {
        leer: docente ? TODO : alumno ? propio('student_id', id) : null,
        insertar: alumnoActivo ? (fila) => fila.student_id === id.studentId : null,
        actualizar: alumnoActivo
          ? { cond: propio('student_id', id), columnas: columnasDe('glossary_entries', ['id', 'student_id']) }
          : null
      };
    case 'activity_log':
      return {
        leer: docente ? TODO : null,
        insertar: alumnoActivo ? (fila) => fila.student_id === id.studentId : null,
        actualizar: null
      };
    case 'course_config':
      return {
        leer: TODO, // los alumnos ven qué semanas están activas
        insertar: docente ? () => true : null,
        actualizar: docente ? { cond: TODO, columnas: columnasDe('course_config') } : null
      };
    default:
      return { leer: null, insertar: null, actualizar: null };
  }
}

// ---------- conversión de valores ----------

function haciaSql(tipo: TipoColumna, valor: unknown): unknown {
  if (valor === undefined || valor === null) return null;
  if (tipo === 'bool') return valor ? 1 : 0;
  if (tipo === 'json') return typeof valor === 'string' ? valor : JSON.stringify(valor);
  return valor;
}

function desdeSql(tabla: string, fila: Record<string, unknown>): Record<string, unknown> {
  const salida: Record<string, unknown> = {};
  for (const [columna, valor] of Object.entries(fila)) {
    const tipo = TABLAS[tabla].columnas[columna];
    if (valor === null || valor === undefined) salida[columna] = null;
    else if (tipo === 'bool') salida[columna] = valor === 1 || valor === true;
    else if (tipo === 'json') {
      try { salida[columna] = JSON.parse(String(valor)); } catch { salida[columna] = valor; }
    } else salida[columna] = valor;
  }
  return salida;
}

// ---------- construcción de SQL ----------

const OPERADORES: Record<string, string> = {
  eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<='
};

function listaColumnas(tabla: string, texto: string | undefined): string[] | null {
  const pedido = (texto ?? '*').trim();
  if (pedido === '*' || pedido === '') return Object.keys(TABLAS[tabla].columnas);
  const columnas = pedido.split(',').map(c => c.trim()).filter(Boolean);
  return columnas.every(c => c in TABLAS[tabla].columnas) ? columnas : null;
}

function construirWhere(tabla: string, filtros: Filtro[], extra: Cond): { sql: string; params: unknown[] } | Respuesta {
  const piezas: string[] = [];
  const params: unknown[] = [];
  for (const filtro of filtros) {
    const tipo = TABLAS[tabla].columnas[filtro.col];
    if (!tipo) return falla(`Columna desconocida: ${filtro.col}`, '42703');
    if (filtro.op in OPERADORES) {
      piezas.push(`"${filtro.col}" ${OPERADORES[filtro.op]} ?`);
      params.push(haciaSql(tipo, filtro.val));
    } else if (filtro.op === 'in') {
      if (!Array.isArray(filtro.val)) return falla('El filtro "in" necesita una lista.', '22023');
      if (filtro.val.length === 0) { piezas.push('0'); continue; }
      piezas.push(`"${filtro.col}" IN (${filtro.val.map(() => '?').join(', ')})`);
      params.push(...filtro.val.map(v => haciaSql(tipo, v)));
    } else if (filtro.op === 'is') {
      if (filtro.val === null) piezas.push(`"${filtro.col}" IS NULL`);
      else { piezas.push(`"${filtro.col}" = ?`); params.push(haciaSql(tipo, filtro.val)); }
    } else {
      return falla(`Operador no soportado: ${filtro.op}`, '22023');
    }
  }
  if (extra) { piezas.push(`(${extra.sql})`); params.push(...extra.params); }
  return { sql: piezas.length ? piezas.join(' AND ') : '1 = 1', params };
}

function traducirErrorSqlite(error: unknown): Respuesta {
  const mensaje = (error as Error)?.message ?? String(error);
  if (/UNIQUE constraint failed/i.test(mensaje)) {
    return falla('duplicate key value violates unique constraint', '23505');
  }
  if (/FOREIGN KEY constraint failed/i.test(mensaje)) {
    return falla('violates foreign key constraint', '23503');
  }
  if (/NOT NULL constraint failed/i.test(mensaje)) {
    return falla('null value in column violates not-null constraint', '23502');
  }
  if (/CHECK constraint failed/i.test(mensaje)) {
    return falla('new row violates check constraint', '23514');
  }
  console.error('Error de base de datos:', mensaje);
  return falla('Error interno de base de datos', 'XX000');
}

/** Aplica single/maybeSingle como PostgREST. */
function entregar(rows: Record<string, unknown>[], modo: Peticion['single']): Respuesta {
  if (modo === 'single') {
    return rows.length === 1
      ? { data: rows[0], error: null }
      : falla('JSON object requested, multiple (or no) rows returned', 'PGRST116');
  }
  if (modo === 'maybe') {
    if (rows.length > 1) return falla('JSON object requested, multiple (or no) rows returned', 'PGRST116');
    return { data: rows[0] ?? null, error: null };
  }
  return { data: rows, error: null };
}

// ---------- ejecución ----------

export function ejecutar(db: DatabaseSync, id: Identidad, peticion: Peticion): Respuesta {
  const tabla = peticion?.table;
  if (typeof tabla !== 'string' || !(tabla in TABLAS)) return falla('Tabla no disponible.', 'PGRST205');
  if (!['select', 'insert', 'update', 'upsert', 'delete'].includes(peticion.op)) {
    return falla('Operación no válida.', '22023');
  }
  const filtros = Array.isArray(peticion.filters) ? peticion.filters : [];
  const permisos = permisosDe(tabla, id);

  try {
    switch (peticion.op) {
      case 'select': return seleccionar(db, tabla, peticion, filtros, permisos);
      case 'insert':
      case 'upsert': return insertar(db, tabla, peticion, permisos);
      case 'update': return actualizar(db, tabla, peticion, filtros, permisos);
      case 'delete': return { data: peticion.returning ? [] : null, error: null }; // sin permiso: 0 filas, como RLS
    }
  } catch (error) {
    return traducirErrorSqlite(error);
  }
  return falla('Operación no válida.', '22023');
}

function ordenYLimite(tabla: string, p: Peticion): string | Respuesta {
  const orden: string[] = [];
  for (const o of p.order ?? []) {
    if (!(o?.col in TABLAS[tabla].columnas)) return falla(`Columna desconocida: ${o?.col}`, '42703');
    orden.push(`"${o.col}" ${o.ascending === false ? 'DESC' : 'ASC'}`);
  }
  let sql = orden.length ? ` ORDER BY ${orden.join(', ')}` : '';
  if (p.range) {
    const [desde, hasta] = p.range.map(Number);
    if (!Number.isInteger(desde) || !Number.isInteger(hasta) || desde < 0 || hasta < desde) {
      return falla('Rango no válido.', '22023');
    }
    sql += ` LIMIT ${Math.min(hasta - desde + 1, 5000)} OFFSET ${desde}`;
  } else if (p.limit !== undefined) {
    const n = Number(p.limit);
    if (!Number.isInteger(n) || n < 0) return falla('Límite no válido.', '22023');
    sql += ` LIMIT ${Math.min(n, 5000)}`;
  } else {
    sql += ' LIMIT 5000'; // tope de seguridad, como el máximo de filas de PostgREST
  }
  return sql;
}

function seleccionar(db: DatabaseSync, tabla: string, p: Peticion, filtros: Filtro[], permisos: Permisos): Respuesta {
  const columnas = listaColumnas(tabla, p.columns);
  if (!columnas) return falla('Columnas no válidas.', '42703');
  // Sin permiso de lectura RLS no falla: devuelve cero filas.
  if (!permisos.leer) return entregar([], p.single);

  const donde = construirWhere(tabla, filtros, permisos.leer);
  if ('error' in donde) return donde;
  const cola = ordenYLimite(tabla, p);
  if (typeof cola !== 'string') return cola;

  const sql = `SELECT ${columnas.map(c => `"${c}"`).join(', ')} FROM "${tabla}" WHERE ${donde.sql}${cola}`;
  const filas = db.prepare(sql).all(...(donde.params as never[])) as Record<string, unknown>[];
  return entregar(filas.map(f => desdeSql(tabla, f)), p.single);
}

function insertar(db: DatabaseSync, tabla: string, p: Peticion, permisos: Permisos): Respuesta {
  const esUpsert = p.op === 'upsert';
  const lista = Array.isArray(p.values) ? p.values : [p.values];
  if (lista.length === 0 || lista.some(v => !v || typeof v !== 'object' || Array.isArray(v))) {
    return falla('Valores no válidos.', '22023');
  }
  if (!permisos.insertar) {
    return falla(`new row violates row-level security policy for table "${tabla}"`, '42501');
  }
  if (esUpsert && !p.ignoreDuplicates && !permisos.actualizar) {
    return falla(`new row violates row-level security policy for table "${tabla}"`, '42501');
  }

  const columnasTabla = TABLAS[tabla].columnas;
  const conflicto = (p.onConflict ? p.onConflict.split(',').map(c => c.trim()) : TABLAS[tabla].clave);
  if (esUpsert && !conflicto.every(c => c in columnasTabla)) return falla('onConflict no válido.', '42703');

  const retorno = p.returning ? listaColumnas(tabla, p.columns) : null;
  if (p.returning && !retorno) return falla('Columnas no válidas.', '42703');

  const filas: Record<string, unknown>[] = [];
  try {
  enTransaccion(db, () => {
    for (const original of lista as Record<string, unknown>[]) {
      for (const clave of Object.keys(original)) {
        if (!(clave in columnasTabla)) throw Object.assign(new Error(`columna ${clave}`), { desconocida: clave });
      }
      const fila = { ...valoresPorDefecto(tabla), ...original };
      if (!permisos.insertar!(fila)) throw Object.assign(new Error('rls'), { rls: true });

      const columnas = Object.keys(fila);
      let sql = `INSERT INTO "${tabla}" (${columnas.map(c => `"${c}"`).join(', ')}) VALUES (${columnas.map(() => '?').join(', ')})`;
      if (esUpsert) {
        const aActualizar = Object.keys(original).filter(c => !conflicto.includes(c));
        sql += aActualizar.length && !p.ignoreDuplicates
          ? ` ON CONFLICT (${conflicto.map(c => `"${c}"`).join(', ')}) DO UPDATE SET ${aActualizar.map(c => `"${c}" = excluded."${c}"`).join(', ')}`
          : ` ON CONFLICT (${conflicto.map(c => `"${c}"`).join(', ')}) DO NOTHING`;
      }
      if (retorno) sql += ` RETURNING ${retorno.map(c => `"${c}"`).join(', ')}`;

      const valores = columnas.map(c => haciaSql(columnasTabla[c], fila[c]));
      const stmt = db.prepare(sql);
      if (retorno) filas.push(...(stmt.all(...(valores as never[])) as Record<string, unknown>[]));
      else stmt.run(...(valores as never[]));
    }
    return true;
  });
  } catch (error) {
    const e = error as { desconocida?: string; rls?: boolean };
    if (e.desconocida) return falla(`Columna desconocida: ${e.desconocida}`, '42703');
    if (e.rls) return falla(`new row violates row-level security policy for table "${tabla}"`, '42501');
    throw error;
  }
  return retorno ? entregar(filas.map(f => desdeSql(tabla, f)), p.single) : { data: null, error: null };
}

function actualizar(db: DatabaseSync, tabla: string, p: Peticion, filtros: Filtro[], permisos: Permisos): Respuesta {
  const valores = p.values as Record<string, unknown>;
  if (!valores || typeof valores !== 'object' || Array.isArray(valores) || Object.keys(valores).length === 0) {
    return falla('Valores no válidos.', '22023');
  }
  const columnasTabla = TABLAS[tabla].columnas;
  for (const c of Object.keys(valores)) {
    if (!(c in columnasTabla)) return falla(`Columna desconocida: ${c}`, '42703');
  }
  const retorno = p.returning ? listaColumnas(tabla, p.columns) : null;
  if (p.returning && !retorno) return falla('Columnas no válidas.', '42703');

  // Sin permiso de escritura RLS tampoco falla: no toca ninguna fila.
  if (!permisos.actualizar || !permisos.actualizar.cond) {
    return p.returning ? entregar([], p.single) : { data: null, error: null };
  }
  const prohibidas = Object.keys(valores).filter(c => !permisos.actualizar!.columnas.includes(c));
  if (prohibidas.length) return falla('Solo el docente puede modificar estos campos', '42501');

  const donde = construirWhere(tabla, filtros, permisos.actualizar.cond);
  if ('error' in donde) return donde;

  const columnas = Object.keys(valores);
  let sql = `UPDATE "${tabla}" SET ${columnas.map(c => `"${c}" = ?`).join(', ')} WHERE ${donde.sql}`;
  if (retorno) sql += ` RETURNING ${retorno.map(c => `"${c}"`).join(', ')}`;
  const params = [...columnas.map(c => haciaSql(columnasTabla[c], valores[c])), ...donde.params] as never[];

  const stmt = db.prepare(sql);
  if (!retorno) { stmt.run(...params); return { data: null, error: null }; }
  const filas = stmt.all(...params) as Record<string, unknown>[];
  return entregar(filas.map(f => desdeSql(tabla, f)), p.single);
}
