-- Tabla course_config: hace REAL el interruptor Activa/Inactiva de semanas.
-- Antes vivía en localStorage del navegador del docente y los alumnos nunca lo veían.
-- ⚠️ EJECUTAR EN EL SQL EDITOR DE SUPABASE ANTES DE DESPLEGAR (o después: la app
-- es tolerante — sin tabla, todas las semanas aparecen activas por defecto).

create table if not exists course_config (
  week_number integer primary key,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table course_config enable row level security;

drop policy if exists "leer config del curso" on course_config;
create policy "leer config del curso"
  on course_config for select to anon, authenticated
  using (true);

drop policy if exists "app puede insertar config" on course_config;
create policy "app puede insertar config"
  on course_config for insert to anon, authenticated
  with check (true);

drop policy if exists "app puede actualizar config" on course_config;
create policy "app puede actualizar config"
  on course_config for update to anon, authenticated
  using (true) with check (true);
