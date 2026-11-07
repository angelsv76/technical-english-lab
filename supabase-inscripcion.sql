-- ============================================================
-- INSCRIPCIÓN DE ALUMNOS + GESTIÓN DE USUARIOS
-- Requiere haber ejecutado ANTES supabase-fase1-docente.sql
-- (usa public.is_teacher() y reemplaza el trigger guard_students_privileged).
-- Orden de despliegue: 1) este SQL  2) funciones enroll-student y manage-students
--                      3) frontend.
-- Seguro de re-ejecutar (idempotente).
-- ============================================================

-- ------------------------------------------------------------
-- students: estado de la inscripción.
-- `active` sigue siendo la puerta de acceso (login y evaluaciones); este campo
-- solo dice por qué un alumno está inactivo: pendiente de aprobar, rechazado,
-- o ya aprobado (y desactivado después, si active = false).
-- Los alumnos que ya existen quedan 'approved'.
-- ------------------------------------------------------------
alter table students
  add column if not exists enrollment_status text not null default 'approved';

alter table students drop constraint if exists students_enrollment_status_check;
alter table students
  add constraint students_enrollment_status_check
  check (enrollment_status in ('pending', 'approved', 'rejected'));

alter table students
  add column if not exists enrolled_at timestamptz;

-- ------------------------------------------------------------
-- Códigos de inscripción: uno por grupo, con vencimiento.
-- RLS activada SIN políticas: el navegador no puede ver ni tocar esta tabla.
-- Solo las Edge Functions (service key) la leen y la escriben.
-- ------------------------------------------------------------
create table if not exists enrollment_codes (
  group_code  text primary key,
  code        text not null,
  expires_at  timestamptz not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table enrollment_codes enable row level security;

-- ------------------------------------------------------------
-- Intentos de inscripción (para limitar adivinanzas del código).
-- Igual que la anterior: sin políticas, solo service key.
-- ------------------------------------------------------------
create table if not exists enrollment_attempts (
  id          bigint generated always as identity primary key,
  nie         text,
  ok          boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table enrollment_attempts enable row level security;

create index if not exists idx_enrollment_attempts_recent
  on enrollment_attempts (created_at desc);
create index if not exists idx_enrollment_attempts_nie
  on enrollment_attempts (nie, created_at desc);

-- ------------------------------------------------------------
-- Trigger de students: ahora también protege enrollment_status y enrolled_at.
-- Sin esto un alumno con la clave pública podría marcarse 'approved' (aunque
-- `active` ya lo bloqueaba, el estado debe ser coherente).
-- Sustituye la función de supabase-fase1-docente.sql; el trigger ya existe.
-- ------------------------------------------------------------
create or replace function public.guard_students_privileged()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_teacher() then
    if new.active            is distinct from old.active
    or new.nie               is distinct from old.nie
    or new.name              is distinct from old.name
    or new.group_code        is distinct from old.group_code
    or new.photo_url         is distinct from old.photo_url
    or new.enrollment_status is distinct from old.enrollment_status
    or new.enrolled_at       is distinct from old.enrolled_at then
      raise exception 'Solo el docente puede modificar estos campos' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- Pruebas mínimas tras ejecutar (con la clave pública, sin sesión):
--   select * from enrollment_codes;       -> [] (sin permiso; no debe mostrar códigos)
--   select * from enrollment_attempts;    -> []
--   update students set enrollment_status='approved' ...  -> 42501
