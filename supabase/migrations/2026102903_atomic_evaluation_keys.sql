-- Reemplazo atómico de claves: si un lote es inválido, no se pierde la versión anterior.
create or replace function public.replace_evaluation_keys(p_rows jsonb)
returns integer language plpgsql set search_path = ''
as $$
declare v_count integer;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Las claves deben ser un arreglo no vacío';
  end if;

  delete from public.evaluation_keys;
  insert into public.evaluation_keys (week_number, question, answer)
  select week_number, question, answer
  from jsonb_to_recordset(p_rows) as entry(week_number integer, question text, answer text);
  get diagnostics v_count = row_count;
  if v_count <> jsonb_array_length(p_rows) then
    raise exception 'Número de claves inesperado';
  end if;
  return v_count;
end;
$$;
revoke all on function public.replace_evaluation_keys(jsonb) from public, anon, authenticated;
grant execute on function public.replace_evaluation_keys(jsonb) to service_role;
