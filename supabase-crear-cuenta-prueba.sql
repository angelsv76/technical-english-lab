-- Crea una cuenta de alumno DESECHABLE, solo para verificar la Edge Function
-- por curl (no inicia sesión en la app, no necesita contraseña).
-- Ejecutar y copiar el "id" que devuelve.

insert into students (nie, name, group_code, active)
values ('00000000', 'Cuenta de Prueba (borrar)', 'TEST', true)
returning id;
