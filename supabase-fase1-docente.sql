-- ============================================================
-- FASE 1 — Rol docente real (Supabase Auth + RLS)
-- NO ejecutar en producción antes de probarlo en un proyecto de pruebas.
-- Orden: 1) crear el usuario docente  2) este SQL  3) desplegar el frontend.
-- ============================================================

-- PASO 1 (a mano, una vez):
--   Dashboard de Supabase > Authentication > Users > Add user
--   (correo + contraseña fuerte, "Auto confirm user" marcado). Luego:
--
--   update auth.users
--      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"teacher"}'
--    where email = 'CORREO_DEL_DOCENTE';
--
--   app_metadata solo lo escribe la service key / el SQL editor: el usuario
--   no puede darse el rol a sí mismo desde el navegador.
--   Cierra sesión y vuelve a entrar para que el JWT lleve el rol.

-- ------------------------------------------------------------
-- Función de rol (lee el JWT firmado, no algo que el cliente controle)
-- ------------------------------------------------------------
create or replace function public.is_teacher()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'teacher', false);
$$;

-- ------------------------------------------------------------
-- Lectura docente de los datos de los alumnos
-- ------------------------------------------------------------
drop policy if exists "docente lee students" on students;
create policy "docente lee students" on students
  for select to authenticated using (public.is_teacher());

drop policy if exists "docente actualiza students" on students;
create policy "docente actualiza students" on students
  for update to authenticated using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "docente lee weekly_progress" on weekly_progress;
create policy "docente lee weekly_progress" on weekly_progress
  for select to authenticated using (public.is_teacher());

drop policy if exists "docente lee glossary_entries" on glossary_entries;
create policy "docente lee glossary_entries" on glossary_entries
  for select to authenticated using (public.is_teacher());

drop policy if exists "docente lee activity_log" on activity_log;
create policy "docente lee activity_log" on activity_log
  for select to authenticated using (public.is_teacher());

-- ------------------------------------------------------------
-- course_config: lectura pública (los alumnos ven semanas activas),
-- escritura solo docente. Se eliminan las políticas abiertas.
-- ------------------------------------------------------------
drop policy if exists "app puede insertar config" on course_config;
drop policy if exists "app puede actualizar config" on course_config;

drop policy if exists "docente inserta config" on course_config;
create policy "docente inserta config" on course_config
  for insert to authenticated with check (public.is_teacher());

drop policy if exists "docente actualiza config" on course_config;
create policy "docente actualiza config" on course_config
  for update to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- ------------------------------------------------------------
-- students: solo el docente cambia active / nie / name / group_code / photo_url.
-- Un trigger no depende de qué políticas viejas existan: aunque una política
-- histórica deje a un alumno hacer UPDATE, no puede tocar estas columnas
-- (sí last_login / last_seen, que la app necesita).
-- Desde el SQL editor o la service key (sin claims anon/authenticated) pasa.
-- ------------------------------------------------------------
create or replace function public.guard_students_privileged()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_teacher() then
    if new.active      is distinct from old.active
    or new.nie         is distinct from old.nie
    or new.name        is distinct from old.name
    or new.group_code  is distinct from old.group_code
    or new.photo_url   is distinct from old.photo_url then
      raise exception 'Solo el docente puede modificar estos campos' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_students_privileged on students;
create trigger trg_guard_students_privileged
  before update on students
  for each row execute function public.guard_students_privileged();

-- ------------------------------------------------------------
-- Pendiente (Fase 2): políticas por propietario para alumnos (auth_user_id),
-- y política de storage del bucket de fotos solo para docente.
-- Pruebas mínimas tras ejecutar (con anon key):
--   * anónimo:   update students set active=false  -> 42501 o 0 filas
--   * alumno:    update students set active=false  -> 42501
--   * alumno:    update course_config ...          -> 0 filas / denegado
--   * docente:   las tres operaciones funcionan
-- ------------------------------------------------------------
