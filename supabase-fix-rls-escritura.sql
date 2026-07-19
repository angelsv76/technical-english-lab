-- FIX: RLS bloquea la escritura desde la app (error 42501 desde ~mayo 2026).
-- Las tablas weekly_progress, glossary_entries y activity_log tienen RLS activo
-- con lectura permitida pero SIN políticas de INSERT/UPDATE, así que las
-- evaluaciones, el glosario y el historial no se guardan.
--
-- ⚠️ EJECUTAR EN EL SQL EDITOR DE SUPABASE.
--
-- Nota: la app usa autenticación propia por NIE (no Supabase Auth), por lo que
-- todas las peticiones llegan con el rol `anon`. Estas políticas restauran el
-- comportamiento original (la clave pública puede escribir). No se permite DELETE.

-- weekly_progress: guardar notas de evaluaciones
drop policy if exists "app puede insertar progreso" on weekly_progress;
create policy "app puede insertar progreso"
  on weekly_progress for insert to anon, authenticated
  with check (true);

drop policy if exists "app puede actualizar progreso" on weekly_progress;
create policy "app puede actualizar progreso"
  on weekly_progress for update to anon, authenticated
  using (true) with check (true);

-- glossary_entries: glosario personal y repetición espaciada (SRS)
drop policy if exists "app puede insertar glosario" on glossary_entries;
create policy "app puede insertar glosario"
  on glossary_entries for insert to anon, authenticated
  with check (true);

drop policy if exists "app puede actualizar glosario" on glossary_entries;
create policy "app puede actualizar glosario"
  on glossary_entries for update to anon, authenticated
  using (true) with check (true);

-- activity_log: historial de logins y evaluaciones
drop policy if exists "app puede insertar actividad" on activity_log;
create policy "app puede insertar actividad"
  on activity_log for insert to anon, authenticated
  with check (true);
