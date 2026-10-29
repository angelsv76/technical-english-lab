-- Paso 2: aplicar solo después de preparar cuentas, probar las funciones y
-- confirmar un respaldo restaurable. No ejecutar antes del frontend compatible.
begin;

do $$
begin
  if not exists (select 1 from public.teacher_users) then
    raise exception 'Falta registrar al menos un docente en teacher_users';
  end if;
  if exists (select 1 from public.students where active = true and auth_user_id is null) then
    raise exception 'Hay alumnos activos sin auth_user_id; revisar el backfill';
  end if;
end;
$$;

-- Las Edge Functions usan service_role para validar la identidad y consultar
-- claves/notas. BYPASSRLS no concede privilegios SQL sobre tablas nuevas.
grant select on public.students, public.weekly_progress, public.evaluation_keys
  to service_role;

-- Los alumnos solo leen su fila activa. El docente lee y modifica alumnos.
alter table public.students enable row level security;
revoke all on public.students from anon, authenticated;
grant select, update on public.students to authenticated;
drop policy if exists "identidad segura alumnos select" on public.students;
create policy "identidad segura alumnos select" on public.students
  for select to authenticated
  using ((active = true and auth_user_id = (select auth.uid())) or (select public.is_teacher()));
drop policy if exists "limite seguro alumnos select" on public.students;
create policy "limite seguro alumnos select" on public.students
  as restrictive for select to authenticated
  using ((active = true and auth_user_id = (select auth.uid())) or (select public.is_teacher()));
drop policy if exists "docente cambia alumnos" on public.students;
create policy "docente cambia alumnos" on public.students
  for update to authenticated
  using ((select public.is_teacher())) with check ((select public.is_teacher()));
drop policy if exists "limite seguro alumnos update" on public.students;
create policy "limite seguro alumnos update" on public.students
  as restrictive for update to authenticated
  using ((select public.is_teacher())) with check ((select public.is_teacher()));

-- Las notas se escriben exclusivamente desde submit-evaluation (service role).
alter table public.weekly_progress enable row level security;
revoke all on public.weekly_progress from anon, authenticated;
grant select on public.weekly_progress to authenticated;
-- Las respuestas de evaluación nunca se entregan al navegador.
revoke all on public.evaluation_keys from anon, authenticated;
drop policy if exists "identidad segura notas select" on public.weekly_progress;
create policy "identidad segura notas select" on public.weekly_progress
  for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
drop policy if exists "limite seguro notas select" on public.weekly_progress;
create policy "limite seguro notas select" on public.weekly_progress
  as restrictive for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));

-- El glosario pertenece al alumno; el docente solo lo consulta.
alter table public.glossary_entries enable row level security;
revoke all on public.glossary_entries from anon, authenticated;
grant select, insert, update on public.glossary_entries to authenticated;
drop policy if exists "identidad segura glosario select" on public.glossary_entries;
create policy "identidad segura glosario select" on public.glossary_entries
  for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
drop policy if exists "limite seguro glosario select" on public.glossary_entries;
create policy "limite seguro glosario select" on public.glossary_entries
  as restrictive for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
drop policy if exists "identidad segura glosario insert" on public.glossary_entries;
create policy "identidad segura glosario insert" on public.glossary_entries
  for insert to authenticated with check (student_id = (select public.current_student_id()));
drop policy if exists "limite seguro glosario insert" on public.glossary_entries;
create policy "limite seguro glosario insert" on public.glossary_entries
  as restrictive for insert to authenticated with check (student_id = (select public.current_student_id()));
drop policy if exists "identidad segura glosario update" on public.glossary_entries;
create policy "identidad segura glosario update" on public.glossary_entries
  for update to authenticated
  using (student_id = (select public.current_student_id()))
  with check (student_id = (select public.current_student_id()));
drop policy if exists "limite seguro glosario update" on public.glossary_entries;
create policy "limite seguro glosario update" on public.glossary_entries
  as restrictive for update to authenticated
  using (student_id = (select public.current_student_id()))
  with check (student_id = (select public.current_student_id()));

-- El historial de inicio de sesión lo escribe touch_student; el de notas, Edge.
alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon, authenticated;
grant select on public.activity_log to authenticated;
drop policy if exists "identidad segura actividad select" on public.activity_log;
create policy "identidad segura actividad select" on public.activity_log
  for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
drop policy if exists "limite seguro actividad select" on public.activity_log;
create policy "limite seguro actividad select" on public.activity_log
  as restrictive for select to authenticated
  using (student_id = (select public.current_student_id()) or (select public.is_teacher()));

-- La configuración de semanas es pública para lectura y docente para cambios.
create table if not exists public.course_config (
  week_number integer primary key,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.course_config enable row level security;
revoke all on public.course_config from anon, authenticated;
grant select on public.course_config to anon;
grant select, insert, update on public.course_config to authenticated;
drop policy if exists "lectura publica semanas" on public.course_config;
create policy "lectura publica semanas" on public.course_config
  for select to anon, authenticated using (true);
drop policy if exists "docente inserta semanas" on public.course_config;
create policy "docente inserta semanas" on public.course_config
  for insert to authenticated with check ((select public.is_teacher()));
drop policy if exists "limite seguro semanas insert" on public.course_config;
create policy "limite seguro semanas insert" on public.course_config
  as restrictive for insert to authenticated with check ((select public.is_teacher()));
drop policy if exists "docente actualiza semanas" on public.course_config;
create policy "docente actualiza semanas" on public.course_config
  for update to authenticated
  using ((select public.is_teacher())) with check ((select public.is_teacher()));
drop policy if exists "limite seguro semanas update" on public.course_config;
create policy "limite seguro semanas update" on public.course_config
  as restrictive for update to authenticated
  using ((select public.is_teacher())) with check ((select public.is_teacher()));

-- La carga de fotos del alumnado solo corresponde al docente.
drop policy if exists "limite seguro fotos insert" on storage.objects;
create policy "limite seguro fotos insert" on storage.objects
  as restrictive for insert to anon, authenticated
  with check (bucket_id <> 'student-photos' or (select public.is_teacher()));
drop policy if exists "limite seguro fotos update" on storage.objects;
create policy "limite seguro fotos update" on storage.objects
  as restrictive for update to anon, authenticated
  using (bucket_id <> 'student-photos' or (select public.is_teacher()))
  with check (bucket_id <> 'student-photos' or (select public.is_teacher()));
drop policy if exists "docente sube fotos" on storage.objects;
create policy "docente sube fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'student-photos' and (select public.is_teacher()));
drop policy if exists "docente cambia fotos" on storage.objects;
create policy "docente cambia fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'student-photos' and (select public.is_teacher()))
  with check (bucket_id = 'student-photos' and (select public.is_teacher()));
drop policy if exists "limite seguro fotos delete" on storage.objects;
create policy "limite seguro fotos delete" on storage.objects
  as restrictive for delete to anon, authenticated
  using (bucket_id <> 'student-photos' or (select public.is_teacher()));

commit;
