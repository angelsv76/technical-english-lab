-- La nota y el registro de actividad se guardan en una sola transacción.
-- Solo submit-evaluation debe invocar esta función con la clave service_role.
create or replace function public.record_evaluation(
  p_student_id uuid, p_week integer, p_score integer, p_answered integer
)
returns jsonb language plpgsql set search_path = ''
as $$
declare v_saved public.weekly_progress%rowtype;
begin
  if p_student_id is null or p_week not between 1 and 40 or
     p_score not between 0 and 100 or p_answered not between 1 and 100 then
    raise exception 'Evaluación inválida';
  end if;

  insert into public.weekly_progress (
    student_id, week_number, last_score, best_score, attempts,
    completed, completed_at, updated_at
  ) values (
    p_student_id, p_week, p_score, p_score, 1,
    p_score >= 70, case when p_score >= 70 then now() else null end, now()
  )
  on conflict (student_id, week_number) do update set
    last_score = excluded.last_score,
    best_score = greatest(coalesce(public.weekly_progress.best_score, 0), excluded.last_score),
    attempts = coalesce(public.weekly_progress.attempts, 0) + 1,
    completed = coalesce(public.weekly_progress.completed, false) or excluded.completed,
    completed_at = case
      when public.weekly_progress.completed_at is null and excluded.completed then now()
      else public.weekly_progress.completed_at
    end,
    updated_at = now()
  returning * into v_saved;

  insert into public.activity_log (student_id, action_type, week_number, metadata)
  values (p_student_id, 'evaluation_completed', p_week,
          jsonb_build_object('score', p_score, 'completed', p_score >= 70,
                             'via', 'edge', 'answered', p_answered));

  return to_jsonb(v_saved);
end;
$$;
revoke all on function public.record_evaluation(uuid, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.record_evaluation(uuid, integer, integer, integer)
  to service_role;
