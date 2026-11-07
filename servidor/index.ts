// Arranca el servidor local: npm run servidor   (o iniciar.bat)
import { networkInterfaces } from 'node:os';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { crearServidor } from './app.ts';
import { cargarSecreto } from './seguridad.ts';
import {
  DIR_AUDIO, DIR_DATOS, DIR_DIST, GEMINI_KEY, GEMINI_MODELO, HOST, PUERTO, RUTA_BASE, RUTA_SECRETO
} from './config.ts';

const { servidor, db } = crearServidor({
  rutaBase: RUTA_BASE,
  dirDatos: DIR_DATOS,
  dirDist: DIR_DIST,
  dirAudio: DIR_AUDIO,
  secreto: cargarSecreto(RUTA_SECRETO),
  geminiKey: GEMINI_KEY,
  geminiModelo: GEMINI_MODELO
});

servidor.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PUERTO} ya está en uso. Cierra la otra ventana o usa otro: set PORT=3100`);
  } else {
    console.error('No se pudo iniciar el servidor:', error.message);
  }
  process.exit(1);
});

servidor.listen(PUERTO, HOST, () => {
  const alumnos = (db.prepare('SELECT COUNT(*) n FROM students').get() as { n: number }).n;
  const docentes = (db.prepare("SELECT COUNT(*) n FROM auth_users WHERE role = 'teacher'").get() as { n: number }).n;

  console.log('\nTechnical English Lab (local, SQLite)');
  console.log(`  En este equipo:  http://localhost:${PUERTO}`);
  if (HOST === '0.0.0.0') {
    for (const lista of Object.values(networkInterfaces())) {
      for (const dir of lista ?? []) {
        if (dir.family === 'IPv4' && !dir.internal) console.log(`  En tu red local: http://${dir.address}:${PUERTO}`);
      }
    }
  }
  console.log(`  Base de datos:   ${RUTA_BASE}`);
  console.log(`  Alumnos: ${alumnos} · Docentes: ${docentes} · Tutor IA: ${GEMINI_KEY ? 'configurado' : 'sin clave (opcional)'}`);
  if (docentes === 0) console.log('\n  ⚠ No hay cuenta de docente. Crea una:  npm run admin -- docente tu-correo@ejemplo.com tu-contraseña');
  if (!existsSync(join(DIR_DIST, 'index.html'))) console.log('\n  ⚠ La app no está construida. Ejecuta:  npm run build:local');
  console.log('\n  Para detenerlo, cierra esta ventana (Ctrl+C).\n');
});

const cerrar = () => { servidor.close(); db.close(); process.exit(0); };
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
