-- Prueba transaccional de las migraciones 03 y 04 en un proyecto desechable.
-- No conserva los datos ficticios. Requiere supabase/test-bootstrap.sql y 01, 03, 04.
begin;

do $$
declare
  v_student_id uuid;
  v_count integer;
begin
  insert into public.students (nie, name, group_code)
  values ('TEST-0001', 'Alumno de prueba', 'TEST')
  returning id into v_student_id;

  perform public.record_evaluation(v_student_id, 1, 80, 10);
  perform public.record_evaluation(v_student_id, 1, 50, 10);
  if not exists (
    select 1 from public.weekly_progress
    where student_id = v_student_id and week_number = 1
      and attempts = 2 and last_score = 50 and best_score = 80
      and completed = true and verification_code is not null
  ) then
    raise exception 'La nota o los intentos no se conservaron correctamente';
  end if;
  if (select count(*) from public.activity_log where student_id = v_student_id) <> 2 then
    raise exception 'El historial no coincide con los intentos';
  end if;

  insert into public.evaluation_keys (week_number, question, answer)
  values (1, 'anterior', 'respuesta');
  select public.replace_evaluation_keys('[
    {"week_number":1,"question":"primera","answer":"uno"},
    {"week_number":1,"question":"segunda","answer":"dos"}
  ]'::jsonb) into v_count;
  if v_count <> 2 then raise exception 'Recuento de claves incorrecto'; end if;

  begin
    perform public.replace_evaluation_keys('[
      {"week_number":1,"question":"duplicada","answer":"uno"},
      {"week_number":1,"question":"duplicada","answer":"dos"}
    ]'::jsonb);
    raise exception 'Se aceptaron claves duplicadas';
  exception
    when unique_violation then null;
  end;
  if (select count(*) from public.evaluation_keys) <> 2 or
     not exists (select 1 from public.evaluation_keys where question = 'primera') then
    raise exception 'Un reemplazo fallido alteró las claves previas';
  end if;

  if has_function_privilege('anon', 'public.record_evaluation(uuid,integer,integer,integer)', 'execute') or
     has_function_privilege('authenticated', 'public.replace_evaluation_keys(jsonb)', 'execute') then
    raise exception 'Las funciones permiten acceso de un cliente';
  end if;
end;
$$;

rollback;
