@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Technical English Lab - local (SQLite)

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js. Instalalo desde https://nodejs.org y vuelve a abrir este archivo.
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

if not exist "dist-local\index.html" (
  echo Construyendo la app local, solo la primera vez o tras cambiar el codigo...
  call npm run build:local
  if errorlevel 1 (
    echo La construccion fallo.
    pause
    exit /b 1
  )
)

echo.
echo Technical English Lab, version local con SQLite. Todo corre en este equipo.
echo Se abre en http://localhost:3000   Cierra esta ventana para detenerlo.
echo (Primera vez: npm run admin -- docente tu-correo tu-contrasena)
echo.

start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:3000"
call npm run servidor
if errorlevel 1 (
  echo.
  echo El servidor se detuvo con un error. Si dice que el puerto esta en uso, cierra la otra ventana.
  pause
)
