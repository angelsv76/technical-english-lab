-- La función fue creada con los permisos del invocador. service_role puede
-- ejecutarla, pero no tiene escritura directa en weekly_progress ni activity_log.
-- Mantener la escritura encapsulada en la función, propiedad de postgres.
alter function public.record_evaluation(uuid, integer, integer, integer)
  security definer;

revoke all on function public.record_evaluation(uuid, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.record_evaluation(uuid, integer, integer, integer)
  to service_role;
