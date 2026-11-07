// Equivalentes locales de las Edge Functions de Supabase. Reutilizan las reglas
// puras de supabase/functions/_shared (las mismas que ya tienen pruebas).
import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { weeks } from '../src/data/weeks/index.ts';
import { gruposConInscripcionAbierta, inscribir, type EnrollDeps } from '../supabase/functions/_shared/enrollment.ts';
import {
  correoDeNie, generarClave, generarCodigo, validarDiasVigencia, validarFilasImportacion, validarGrupo
} from '../supabase/functions/_shared/enrollmentRules.ts';
import { enTransaccion } from './db.ts';
import { hashPassword } from './seguridad.ts';
import type { Identidad } from './datos.ts';

export interface Contexto {
  db: DatabaseSync;
  ident: Identidad;
  ahora: () => Date;
  /** Carpeta de datos (fotos aprobadas y pendientes). */
  dirDatos?: string;
  geminiKey?: string;
  /** Si se define, sustituye el modelo que pide el cliente (los nombres cambian con el tiempo). */
  geminiModelo?: string;
}

export interface Resp { status: number; body: Record<string, unknown> }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const alumnoActivo = (c: Contexto) => c.ident.rol === 'student' && !!c.ident.studentId && c.ident.active === true;

// ---------- evaluación (calificada aquí, nunca en el navegador) ----------

const normalizar = (s: unknown) =>
  typeof s === 'string' ? s.normalize('NFC').trim().replace(/\s+/g, ' ') : '';

export function enviarEvaluacion(c: Contexto, cuerpo: any): Resp {
  if (!alumnoActivo(c)) return { status: 401, body: { error: 'sesión de estudiante inválida' } };
  const { studentId, week, answers } = cuerpo ?? {};
  if (studentId !== c.ident.studentId || !Number.isInteger(week) || week < 1 || week > 40 ||
      !Array.isArray(answers) || answers.length > 100) {
    return { status: 400, body: { error: 'payload inválido' } };
  }
  const claves = weeks.find(w => w.week === week)?.evaluation ?? [];
  if (claves.length === 0) return { status: 400, body: { error: `sin claves de evaluación para la semana ${week}` } };

  let correctas = 0;
  for (const clave of claves) {
    const pregunta = normalizar(clave.question);
    const enviada = answers.find((a: { question?: string }) => normalizar(a?.question) === pregunta);
    if (enviada && normalizar(enviada.answer) === normalizar(clave.answer)) correctas++;
  }
  const score = Math.round((correctas / claves.length) * 100);
  const aprobada = score >= 70;
  const ahora = c.ahora().toISOString();

  const guardado = enTransaccion(c.db, () => {
    const previo = c.db.prepare(
      'SELECT best_score, attempts, completed, completed_at, verification_code FROM weekly_progress WHERE student_id = ? AND week_number = ?'
    ).get(studentId, week) as any;

    const fila = {
      best: Math.max(previo?.best_score ?? 0, score),
      intentos: (previo?.attempts ?? 0) + 1,
      completa: aprobada || !!previo?.completed,
      completadaEn: aprobada && !previo?.completed_at ? ahora : previo?.completed_at ?? null,
      codigo: previo?.verification_code ?? randomUUID()
    };
    if (previo) {
      c.db.prepare(
        `UPDATE weekly_progress SET last_score = ?, best_score = ?, attempts = ?, completed = ?, completed_at = ?, updated_at = ?
         WHERE student_id = ? AND week_number = ?`
      ).run(score, fila.best, fila.intentos, fila.completa ? 1 : 0, fila.completadaEn, ahora, studentId, week);
    } else {
      c.db.prepare(
        `INSERT INTO weekly_progress (id, student_id, week_number, last_score, best_score, attempts, completed, completed_at, verification_code, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(randomUUID(), studentId, week, score, fila.best, fila.intentos, fila.completa ? 1 : 0, fila.completadaEn, fila.codigo, ahora, ahora);
    }
    c.db.prepare(
      'INSERT INTO activity_log (id, student_id, action_type, week_number, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(randomUUID(), studentId, 'evaluation_completed', week,
      JSON.stringify({ score, completed: aprobada, via: 'local', answered: answers.length }), ahora);
    return fila;
  });

  return {
    status: 200,
    body: { score, bestScore: guardado.best, attempts: guardado.intentos, completed: guardado.completa, verificationCode: guardado.codigo }
  };
}

// ---------- tutor IA ----------

export async function generarContenido(c: Contexto, cuerpo: any): Promise<Resp> {
  if (!alumnoActivo(c)) return { status: 401, body: { error: 'sesión de estudiante inválida' } };
  if (!c.geminiKey) return { status: 503, body: { error: 'tutor IA no configurado' } };
  const { model, contents, config } = cuerpo ?? {};
  if (typeof model !== 'string' || !/^gemini-[a-z0-9.-]+$/.test(model) || !contents) {
    return { status: 400, body: { error: 'solicitud inválida' } };
  }
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: c.geminiKey });
    const segura = config && typeof config === 'object' && !Array.isArray(config)
      ? { ...config, maxOutputTokens: 4096 } : { maxOutputTokens: 4096 };
    const r = await ai.models.generateContent({ model: c.geminiModelo || model, contents, config: segura });
    return { status: 200, body: { text: r.text ?? '' } };
  } catch (error) {
    console.error('Error generando contenido:', (error as Error).message);
    return { status: 502, body: { error: 'No se pudo generar contenido' } };
  }
}

// ---------- inscripción ----------

function depsInscripcion(db: DatabaseSync, ahora: () => Date): EnrollDeps {
  const cuenta = (sql: string, ...p: unknown[]) => (db.prepare(sql).get(...(p as never[])) as { n: number }).n;
  return {
    ahora,
    async obtenerCodigo(grupo) {
      const f = db.prepare('SELECT code, expires_at, active FROM enrollment_codes WHERE group_code = ?').get(grupo) as any;
      return f ? { code: f.code, expires_at: f.expires_at, active: !!f.active } : null;
    },
    async gruposAbiertos(ahoraIso) {
      return (db.prepare('SELECT group_code FROM enrollment_codes WHERE active = 1 AND expires_at > ? ORDER BY group_code')
        .all(ahoraIso) as { group_code: string }[]).map(f => f.group_code);
    },
    async existeAlumno(nie) {
      return !!db.prepare('SELECT 1 FROM students WHERE nie = ?').get(nie);
    },
    async fallosDesde(desde, nie) {
      return nie
        ? cuenta('SELECT COUNT(*) n FROM enrollment_attempts WHERE ok = 0 AND created_at >= ? AND nie = ?', desde, nie)
        : cuenta('SELECT COUNT(*) n FROM enrollment_attempts WHERE ok = 0 AND created_at >= ?', desde);
    },
    async registrarIntento(nie, ok) {
      db.prepare('INSERT INTO enrollment_attempts (nie, ok, created_at) VALUES (?, ?, ?)').run(nie, ok ? 1 : 0, ahora().toISOString());
    },
    async crearUsuarioAuth(correo, password) {
      if (db.prepare('SELECT 1 FROM auth_users WHERE email = ?').get(correo)) return { error: 'existe' };
      const id = randomUUID();
      db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id, correo, hashPassword(password), 'student', ahora().toISOString());
      return { id };
    },
    async insertarAlumno(fila) {
      try {
        db.prepare(
          'INSERT INTO students (id, nie, name, group_code, active, enrollment_status, enrolled_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(randomUUID(), fila.nie, fila.name, fila.group_code, fila.active ? 1 : 0, fila.enrollment_status, fila.enrolled_at, ahora().toISOString());
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    },
    async borrarUsuarioAuth(id) {
      db.prepare('DELETE FROM auth_users WHERE id = ?').run(id);
    }
  };
}

export async function inscribirAlumno(c: Contexto, cuerpo: any): Promise<Resp> {
  const deps = depsInscripcion(c.db, c.ahora);
  const r = cuerpo?.action === 'groups' ? await gruposConInscripcionAbierta(deps) : await inscribir(deps, cuerpo);
  return { status: r.status, body: r.body };
}

// ---------- gestión de usuarios (solo docente) ----------

export function gestionarAlumnos(c: Contexto, cuerpo: any): Resp {
  if (c.ident.rol !== 'teacher') return { status: 401, body: { error: 'Solo el docente puede hacer esto.' } };
  const { db } = c;
  const ahora = c.ahora();

  switch (cuerpo?.action) {
    case 'list_codes': {
      const filas = db.prepare('SELECT group_code, code, expires_at, active FROM enrollment_codes ORDER BY group_code').all() as any[];
      return { status: 200, body: { codes: filas.map(f => ({ ...f, active: !!f.active })) } };
    }
    case 'create_code': {
      const grupo = validarGrupo(cuerpo.group);
      if (!grupo.ok) return { status: 400, body: { error: grupo.error } };
      const codigo = generarCodigo();
      const vence = new Date(ahora.getTime() + validarDiasVigencia(cuerpo.days) * 86_400_000).toISOString();
      db.prepare(
        `INSERT INTO enrollment_codes (group_code, code, expires_at, active, created_at) VALUES (?, ?, ?, 1, ?)
         ON CONFLICT (group_code) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at, active = 1, created_at = excluded.created_at`
      ).run(grupo.valor, codigo, vence, ahora.toISOString());
      return { status: 200, body: { group_code: grupo.valor, code: codigo, expires_at: vence, active: true } };
    }
    case 'disable_code': {
      const grupo = validarGrupo(cuerpo.group);
      if (!grupo.ok) return { status: 400, body: { error: grupo.error } };
      db.prepare('UPDATE enrollment_codes SET active = 0 WHERE group_code = ?').run(grupo.valor);
      return { status: 200, body: { ok: true } };
    }
    case 'reset_password': {
      if (!UUID.test(cuerpo.studentId ?? '')) return { status: 400, body: { error: 'Alumno no válido.' } };
      const alumno = db.prepare('SELECT nie FROM students WHERE id = ?').get(cuerpo.studentId) as { nie: string } | undefined;
      if (!alumno) return { status: 404, body: { error: 'Alumno no encontrado.' } };
      const password = generarClave();
      const correo = correoDeNie(alumno.nie);
      const existe = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(correo);
      if (existe) {
        db.prepare('UPDATE auth_users SET password_hash = ? WHERE email = ?').run(hashPassword(password), correo);
      } else {
        db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(randomUUID(), correo, hashPassword(password), 'student', ahora.toISOString());
      }
      return { status: 200, body: { password, created: !existe } };
    }
    case 'approve_photo':
    case 'reject_photo': {
      if (!UUID.test(cuerpo.studentId ?? '') || !c.dirDatos) return { status: 400, body: { error: 'Alumno no válido.' } };
      const id = String(cuerpo.studentId).toLowerCase();
      const fila = db.prepare('SELECT photo_pending FROM students WHERE id = ?').get(id) as { photo_pending: string | null } | undefined;
      if (!fila?.photo_pending) return { status: 404, body: { error: 'Este alumno no tiene una foto por revisar.' } };
      const origen = join(c.dirDatos, 'fotos-pendientes', id, `propuesta.${fila.photo_pending}`);
      if (cuerpo.action === 'approve_photo') {
        if (!existsSync(origen)) return { status: 404, body: { error: 'No se encontró el archivo de la foto.' } };
        const destino = join(c.dirDatos, 'fotos', id);
        mkdirSync(destino, { recursive: true });
        for (const previo of readdirSync(destino)) if (previo.startsWith('avatar.')) rmSync(join(destino, previo));
        renameSync(origen, join(destino, `avatar.${fila.photo_pending}`));
        db.prepare('UPDATE students SET photo_url = ?, photo_pending = NULL WHERE id = ?')
          .run(`/fotos/${id}/avatar.${fila.photo_pending}?t=${ahora.getTime()}`, id);
      } else {
        rmSync(origen, { force: true });
        db.prepare('UPDATE students SET photo_pending = NULL WHERE id = ?').run(id);
      }
      return { status: 200, body: { ok: true } };
    }
    case 'delete_student': {
      if (!UUID.test(cuerpo.studentId ?? '')) return { status: 400, body: { error: 'Alumno no válido.' } };
      const alumno = db.prepare('SELECT nie FROM students WHERE id = ?').get(cuerpo.studentId) as { nie: string } | undefined;
      if (!alumno) return { status: 404, body: { error: 'Alumno no encontrado.' } };
      try {
        db.prepare('DELETE FROM students WHERE id = ?').run(cuerpo.studentId);
      } catch {
        return { status: 409, body: { error: 'Este alumno tiene progreso registrado y no se puede borrar. Desactívalo en lugar de borrarlo.' } };
      }
      db.prepare('DELETE FROM auth_users WHERE email = ?').run(correoDeNie(alumno.nie));
      if (c.dirDatos) {
        rmSync(join(c.dirDatos, 'fotos-pendientes', String(cuerpo.studentId).toLowerCase()), { recursive: true, force: true });
        rmSync(join(c.dirDatos, 'fotos', String(cuerpo.studentId).toLowerCase()), { recursive: true, force: true });
      }
      return { status: 200, body: { ok: true } };
    }
    case 'import_students': {
      const filas = validarFilasImportacion(cuerpo.rows);
      if (!filas.ok) return { status: 400, body: { error: filas.error } };
      const resultados = filas.valor!.map(fila => {
        const base = { nie: fila.nie, nombre: fila.nombre, grupo: fila.grupo };
        if (db.prepare('SELECT 1 FROM students WHERE nie = ?').get(fila.nie)) return { ...base, estado: 'omitido', detalle: 'Ya existe' };
        const correo = correoDeNie(fila.nie);
        if (db.prepare('SELECT 1 FROM auth_users WHERE email = ?').get(correo)) {
          return { ...base, estado: 'omitido', detalle: 'Ya tiene cuenta de acceso' };
        }
        const password = generarClave();
        try {
          enTransaccion(db, () => {
            db.prepare('INSERT INTO auth_users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)')
              .run(randomUUID(), correo, hashPassword(password), 'student', ahora.toISOString());
            db.prepare(
              `INSERT INTO students (id, nie, name, group_code, active, enrollment_status, enrolled_at, created_at)
               VALUES (?, ?, ?, ?, 1, 'approved', ?, ?)`
            ).run(randomUUID(), fila.nie, fila.nombre, fila.grupo, ahora.toISOString(), ahora.toISOString());
          });
          return { ...base, estado: 'creado', password };
        } catch {
          return { ...base, estado: 'error', detalle: 'No se pudo guardar el alumno' };
        }
      });
      return { status: 200, body: { results: resultados } };
    }
    default:
      return { status: 400, body: { error: 'Acción desconocida.' } };
  }
}

// ---------- verificación pública de reportes ----------

export function verificarReporte(db: DatabaseSync, codigo: string): Resp {
  if (!UUID.test(codigo)) return { status: 200, body: { found: false } };
  const fila = db.prepare(
    `SELECT w.week_number, w.last_score, w.best_score, w.attempts, w.completed, w.updated_at, s.name, s.nie
     FROM weekly_progress w JOIN students s ON s.id = w.student_id WHERE w.verification_code = ?`
  ).get(codigo.toLowerCase()) as any;
  if (!fila) return { status: 200, body: { found: false } };
  return {
    status: 200,
    body: {
      found: true,
      studentName: fila.name, nie: fila.nie, week: fila.week_number,
      lastScore: fila.last_score ?? 0, bestScore: fila.best_score ?? 0, attempts: fila.attempts ?? 1,
      completed: !!fila.completed, updatedAt: fila.updated_at
    }
  };
}
