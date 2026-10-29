-- Estructura mínima para ensayar las migraciones 01–04 con datos ficticios.
-- Ejecutar solo en un proyecto Supabase de pruebas vacío.
begin;

create table public.students (
  id uuid primary key default gen_random_uuid(),
  nie text not null unique,
  name text not null,
  group_code text not null,
  created_at timestamptz not null default now(),
  last_login timestamp,
  last_seen timestamptz,
  photo_url text,
  active boolean not null default true
);

create table public.weekly_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  week_number integer not null,
  last_score double precision,
  best_score double precision,
  attempts integer not null default 0,
  completed boolean not null default false,
  completed_at timestamp,
  evaluation_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verification_code uuid not null default gen_random_uuid(),
  unique (student_id, week_number),
  unique (verification_code)
);

create table public.glossary_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  word text not null,
  meaning text,
  example text,
  context text,
  mastered boolean not null default false,
  review_count integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  week_introduced integer not null,
  audio_url text,
  created_at timestamptz not null default now(),
  last_reviewed_at timestamp,
  srs_level integer not null default 0,
  next_review_at timestamptz,
  unique (student_id, word)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  action_type text not null,
  week_number integer,
  metadata jsonb,
  timestamp timestamptz not null default now()
);

create table public.course_config (
  week_number integer primary key,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.evaluation_keys (
  week_number integer not null,
  question text not null,
  answer text not null,
  primary key (week_number, question)
);

alter table public.students enable row level security;
alter table public.weekly_progress enable row level security;
alter table public.glossary_entries enable row level security;
alter table public.activity_log enable row level security;
alter table public.course_config enable row level security;
alter table public.evaluation_keys enable row level security;

commit;
