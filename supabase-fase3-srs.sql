-- Fase 3: Repetición espaciada (SRS)
-- ⚠️ EJECUTAR EN EL SQL EDITOR DE SUPABASE **ANTES** DE DESPLEGAR EL CÓDIGO DE LA FASE 3.
-- El código nuevo escribe srs_level y next_review_at en glossary_entries;
-- si estas columnas no existen, los updates fallarán.

alter table glossary_entries
  add column if not exists srs_level integer not null default 0;

alter table glossary_entries
  add column if not exists next_review_at timestamptz;

-- Backfill: todas las palabras existentes quedan pendientes de repaso hoy.
-- Esto incluye las "dominadas" — vuelven a la rotación (arregla el "3 aciertos y desaparece").
update glossary_entries
set next_review_at = now()
where next_review_at is null;

-- Índice para la consulta de palabras vencidas por alumno
create index if not exists idx_glossary_review
  on glossary_entries (student_id, next_review_at);
