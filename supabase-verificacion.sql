-- ============================================================
-- PARTE 1 — Ejecutar YA (no rompe nada)
-- ============================================================

-- Código de verificación por registro de nota, generado por la BASE
-- (gen_random_uuid), nunca por el navegador. Se imprime en el PDF y se
-- consulta en /verificar/<código>.
alter table weekly_progress
  add column if not exists verification_code uuid not null default gen_random_uuid();

create unique index if not exists idx_weekly_progress_verification
  on weekly_progress (verification_code);

-- Claves de calificación de las evaluaciones. SIN políticas para anon:
-- solo la Edge Function (service role) puede leerlas. El navegador no las ve.
create table if not exists evaluation_keys (
  week_number integer not null,
  question text not null,
  answer text not null,
  primary key (week_number, question)
);

alter table evaluation_keys enable row level security;
-- (sin políticas = invisible e intocable para anon; service role las ignora)

-- Después de esta PARTE 1: ejecutar también supabase-evaluation-keys.sql
-- (generado por scripts/export-evaluation-keys.ts) para poblar las claves.

-- ============================================================
-- PARTE 2 — Ejecutar SOLO cuando la Edge Function submit-evaluation esté
-- desplegada Y el código nuevo de la app esté en producción.
-- Cierra la escritura directa de notas desde el navegador: desde entonces
-- las notas solo entran por la Edge Function (con la clave secreta).
-- ============================================================

-- drop policy if exists "app puede insertar progreso" on weekly_progress;
-- drop policy if exists "app puede actualizar progreso" on weekly_progress;
