-- Restaura los valores reales (previos a mis pruebas de diagnóstico) para la
-- cuenta de prueba 20260001 (Angel Sanchez), semanas 1, 2, 5 y 10.
-- Ejecutar una sola vez en el SQL Editor.

update weekly_progress set last_score = 100, attempts = 1, updated_at = '2026-05-03T01:34:56.898'
where student_id = 'e265b3a6-9070-450a-abf0-a7c06b513296' and week_number = 1;

update weekly_progress set last_score = 90, attempts = 1, updated_at = '2026-05-03T01:57:27.372'
where student_id = 'e265b3a6-9070-450a-abf0-a7c06b513296' and week_number = 2;

update weekly_progress set last_score = 100, attempts = 1, updated_at = '2026-05-03T02:44:33.604'
where student_id = 'e265b3a6-9070-450a-abf0-a7c06b513296' and week_number = 5;

update weekly_progress set last_score = 90, attempts = 1, updated_at = '2026-05-03T15:08:46.673'
where student_id = 'e265b3a6-9070-450a-abf0-a7c06b513296' and week_number = 10;
