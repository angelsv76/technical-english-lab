# Technical English Lab — INTI

Consulta el [plan de corrección](docs/plan-correccion.md) para prioridades, responsables y criterios de aceptación.

Plataforma interactiva de Inglés Técnico para estudiantes de Desarrollo de Software del Instituto Nacional Técnico Industrial (INTI).

## Características

- 40 semanas de contenido estructurado
- Portal del estudiante con progreso persistente (Supabase)
- Tutor IA integrado (Google Gemini)
- Generador de actividades y simulaciones
- Glosario personal con seguimiento de dominio
- Panel de administración para el docente
- Generación de reportes PDF

## Tecnologías

- React 19 + TypeScript + Vite
- Tailwind CSS
- Supabase (base de datos y autenticación)
- Google Gemini API
- Vercel (hosting)

## Configuración local

**Prerrequisitos:** Node.js 18+

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Crear archivo `.env.local` con las variables de entorno:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

   El docente es un usuario de Supabase Auth con `app_metadata.role = 'teacher'`
   (ver `supabase-fase1-docente.sql`). Ya no existen `VITE_ADMIN_USER` ni `VITE_ADMIN_HASH`.

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Versión local con SQLite (sin Docker ni Supabase)

Todo corre en tu equipo: un servidor Node (`servidor/`) con base SQLite (`datos/laboratorio.db`). Requiere Node 22.5 o superior.

1. Doble clic en `iniciar.bat` (instala, construye y abre http://localhost:3000). Los alumnos de la red entran por la IP que imprime la ventana.
2. Primera vez, cuenta de docente: `npm run admin -- docente tu-correo@ejemplo.com tu-contraseña-larga`
3. Alumno de pruebas (NIE 20269999): `npm run admin -- alumno-prueba` (`--borrar` lo elimina).
4. Traer los datos de la nube: `npm run admin -- importar-nube` (genera contraseñas nuevas en un CSV).
5. Tutor IA opcional: `GEMINI_API_KEY` en `.env.local`.

Pruebas: `npm run test:servidor`. Respaldo: copia la carpeta `datos/` (base, fotos y `secreto.key`). Para volver a la nube sigue usando `iniciar-nube.bat` y `npm run build`.

## Despliegue

La app está configurada para Vercel. Las variables de entorno deben definirse en el dashboard de Vercel (nunca en el repositorio).

### Funciones de Supabase y seguridad

La IA y la calificación necesitan las funciones `generate-content` y `submit-evaluation`.
Configura `GEMINI_API_KEY` **solo** como secreto de Supabase y despliega ambas funciones
antes de publicar esta versión del frontend. La clave de Gemini ya no se incluye en
el JavaScript público; si se usó con una versión anterior, rótala en Google AI Studio.

```bash
npx supabase secrets set GEMINI_API_KEY=tu_clave
npx supabase functions deploy generate-content
npx supabase functions deploy submit-evaluation
```

Las funciones comprueban la sesión de Supabase Auth y el NIE antes de acceder a los
datos del estudiante. Después de verificar el flujo de evaluación, ejecuta la
**parte 2** de `supabase-verificacion.sql` en el SQL Editor para revocar la escritura
directa de notas. No vuelvas a aplicar `supabase-fix-rls-escritura.sql` después de
cerrar esas políticas: ese archivo abre escrituras para cualquier cliente anónimo.

**Acceso docente (Fase 1, en código, sin desplegar):** el docente entra con Supabase Auth
y la autorización la hacen las políticas RLS y un trigger de `supabase-fase1-docente.sql`.
Antes de desplegar el frontend hay que crear el usuario docente y ejecutar ese SQL.

**Pendiente de endurecer (Fase 2):** varias políticas RLS históricas de alumnos siguen
siendo amplias (cualquier alumno autenticado puede leer datos de otros). Falta migrar
`students` a `auth_user_id` y restringir por propietario, y la política del bucket de fotos.

---

**Desarrollado por:** Ángel Sánchez  
**Institución:** Instituto Nacional Técnico Industrial (INTI)  
**Uso:** Educativo — Especialidad Desarrollo de Software

## Inscripción y gestión de usuarios

- **Inscripción** (`/inscripcion`, pública): el alumno escribe NIE, nombre, grupo, una
  contraseña propia y el **código de inscripción** de su grupo. La cuenta queda
  *pendiente* (no entra ni guarda notas) hasta que el docente la aprueba.
- **Gestión de usuarios** (panel docente → *Gestión de Usuarios*): códigos por grupo con
  vencimiento, aprobar/rechazar pendientes, activar/desactivar, restablecer contraseña,
  borrar (solo sin progreso) e importar alumnos desde CSV (`nie,nombre,grupo`).
- **Servidor**: `supabase/functions/enroll-student` (pública, con límite de intentos) y
  `supabase/functions/manage-students` (exige rol docente). La lógica de reglas está en
  `supabase/functions/_shared/` y se prueba con `npx tsx scripts/test-enrollment.ts`.
- **Despliegue, en este orden**: 1) `supabase-fase1-docente.sql`, 2) `supabase-inscripcion.sql`,
  3) `npx supabase functions deploy enroll-student` y `manage-students`, 4) frontend.
- Cuentas de prueba: `scripts/test-student.mjs` (alumno) y `scripts/create-teacher.mjs` (docente).
