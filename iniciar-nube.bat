@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Technical English Lab - local

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js. Instalalo desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo Falta el archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
  echo Pidele a Angel la plantilla o copia las dos variables desde Supabase ^> Settings ^> API.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias, solo la primera vez...
  call npm install
  if errorlevel 1 (
    echo La instalacion fallo. Revisa la conexion a internet.
    pause
    exit /b 1
  )
)

echo.
echo Technical English Lab en http://localhost:3000
echo OJO: usa la base de datos REAL de Supabase. Para pruebas entra con la cuenta
echo de pruebas (scripts\test-student.mjs), no con la de un alumno.
echo Cierra esta ventana para detener el servidor.
echo.

start "" /b cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm run dev
if errorlevel 1 (
  echo.
  echo El servidor se detuvo con un error. Si dice que el puerto 3000 esta en uso, cierra la otra ventana.
  pause
)
