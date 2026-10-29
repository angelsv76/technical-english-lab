-- Paso 1: preparar identidades sin cambiar todavía las políticas existentes.
-- Ejecutar primero en un proyecto de pruebas y comprobar los recuentos.
begin;

create table if not exists public.teacher_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.teacher_users enable row level security;
revoke all on public.teacher_users from anon, authenticated;
grant select on public.teacher_users to authenticated;
drop policy if exists "docente ve su membresía" on public.teacher_users;
create policy "docente ve su membresía" on public.teacher_users
  for select to authenticated using (user_id = (select auth.uid()));

alter table public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create unique index if not exists students_auth_user_id_unique
  on public.students(auth_user_id) where auth_user_id is not null;
update public.students as student
set auth_user_id = account.id
from auth.users as account
where student.auth_user_id is null
  and lower(account.email) = lower(student.nie || '@inti.edu.sv');

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.teacher_users
    where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_teacher() from public, anon;
grant execute on function public.is_teacher() to authenticated;

create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path = ''
as $$
  select id from public.students
  where auth_user_id = (select auth.uid()) and active = true
  limit 1;
$$;
revoke all on function public.current_student_id() from public, anon;
grant execute on function public.current_student_id() to authenticated;

create or replace function public.touch_student(p_event text)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if p_event not in ('login', 'seen') then return false; end if;
  update public.students
  set last_seen = now(),
      last_login = case when p_event = 'login' then now() else last_login end
  where auth_user_id = (select auth.uid()) and active = true
  returning id into v_student_id;
  if v_student_id is null then return false; end if;
  if p_event = 'login' then
    insert into public.activity_log(student_id, action_type, metadata)
    values (v_student_id, 'login', jsonb_build_object('via', 'auth'));
  end if;
  return true;
end;
$$;
revoke all on function public.touch_student(text) from public, anon;
grant execute on function public.touch_student(text) to authenticated;

commit;
