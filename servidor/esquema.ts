// Esquema de la base local (SQLite). Refleja las tablas de Supabase que usa la app,
// más auth_users (cuentas de acceso) y las tablas internas de inscripción.
import { randomUUID } from 'node:crypto';

export type TipoColumna = 'text' | 'int' | 'bool' | 'json';

export interface Tabla {
  columnas: Record<string, TipoColumna>;
  /** Columnas de la clave primaria, para upsert sin onConflict. */
  clave: string[];
}

/** Tablas que el cliente puede consultar por /api/db (lo demás es interno). */
export const TABLAS: Record<string, Tabla> = {
  students: {
    clave: ['id'],
    columnas: {
      id: 'text', nie: 'text', name: 'text', email: 'text', group_code: 'text',
      active: 'bool', enrollment_status: 'text', enrolled_at: 'text',
      last_login: 'text', last_seen: 'text', photo_url: 'text', photo_pending: 'text', created_at: 'text'
    }
  },
  weekly_progress: {
    clave: ['id'],
    columnas: {
      id: 'text', student_id: 'text', week_number: 'int', last_score: 'int', best_score: 'int',
      attempts: 'int', completed: 'bool', completed_at: 'text', evaluation_pdf_url: 'text',
      verification_code: 'text', created_at: 'text', updated_at: 'text'
    }
  },
  glossary_entries: {
    clave: ['id'],
    columnas: {
      id: 'text', student_id: 'text', word: 'text', meaning: 'text', example: 'text', context: 'text',
      mastered: 'bool', review_count: 'int', correct_count: 'int', wrong_count: 'int',
      week_introduced: 'int', audio_url: 'text', srs_level: 'int', next_review_at: 'text',
      created_at: 'text', last_reviewed_at: 'text'
    }
  },
  activity_log: {
    clave: ['id'],
    columnas: {
      id: 'text', student_id: 'text', action_type: 'text', week_number: 'int',
      metadata: 'json', timestamp: 'text'
    }
  },
  course_config: {
    clave: ['week_number'],
    columnas: { week_number: 'int', active: 'bool', updated_at: 'text' }
  }
};

/** Valores que la base pone cuando el cliente no los envía (como los defaults de Postgres). */
export function valoresPorDefecto(tabla: string): Record<string, unknown> {
  const ahora = new Date().toISOString();
  switch (tabla) {
    case 'students':
      return { id: randomUUID(), created_at: ahora, active: true, enrollment_status: 'approved' };
    case 'weekly_progress':
      return { id: randomUUID(), verification_code: randomUUID(), attempts: 0, completed: false, created_at: ahora, updated_at: ahora };
    case 'glossary_entries':
      return { id: randomUUID(), created_at: ahora, mastered: false, review_count: 0, correct_count: 0, wrong_count: 0, srs_level: 0 };
    case 'activity_log':
      return { id: randomUUID(), timestamp: ahora };
    case 'course_config':
      return { updated_at: ahora, active: true };
    default:
      return {};
  }
}

export const DDL = `
create table if not exists auth_users (
  id            text primary key,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'student' check (role in ('student', 'teacher')),
  created_at    text not null
);

create table if not exists students (
  id                text primary key,
  nie               text not null unique,
  name              text not null,
  email             text,
  group_code        text not null,
  active            integer not null default 1,
  enrollment_status text not null default 'approved'
                    check (enrollment_status in ('pending', 'approved', 'rejected')),
  enrolled_at       text,
  last_login        text,
  last_seen         text,
  photo_url         text,
  photo_pending     text,
  created_at        text not null
);

create table if not exists weekly_progress (
  id                 text primary key,
  student_id         text not null references students(id),
  week_number        integer not null,
  last_score         integer,
  best_score         integer,
  attempts           integer not null default 0,
  completed          integer not null default 0,
  completed_at       text,
  evaluation_pdf_url text,
  verification_code  text not null unique,
  created_at         text not null,
  updated_at         text not null,
  unique (student_id, week_number)
);

create table if not exists glossary_entries (
  id               text primary key,
  student_id       text not null references students(id),
  word             text not null,
  meaning          text,
  example          text,
  context          text,
  mastered         integer not null default 0,
  review_count     integer not null default 0,
  correct_count    integer not null default 0,
  wrong_count      integer not null default 0,
  week_introduced  integer,
  audio_url        text,
  srs_level        integer not null default 0,
  next_review_at   text,
  created_at       text not null,
  last_reviewed_at text,
  unique (student_id, word)
);

create table if not exists activity_log (
  id          text primary key,
  student_id  text not null references students(id),
  action_type text not null,
  week_number integer,
  metadata    text,
  timestamp   text not null
);
create index if not exists idx_activity_student on activity_log (student_id, timestamp);

create table if not exists course_config (
  week_number integer primary key,
  active      integer not null default 1,
  updated_at  text not null
);

create table if not exists enrollment_codes (
  group_code text primary key,
  code       text not null,
  expires_at text not null,
  active     integer not null default 1,
  created_at text not null
);

create table if not exists enrollment_attempts (
  id         integer primary key autoincrement,
  nie        text,
  ok         integer not null default 0,
  created_at text not null
);
create index if not exists idx_enrollment_attempts_recent on enrollment_attempts (created_at);
`;
