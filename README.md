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

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

La app está configurada para Vercel. Las variables de entorno deben definirse en el dashboard de Vercel (nunca en el repositorio).

### Funciones de Supabase y seguridad

La IA, la calificación y la verificación pública de códigos necesitan las funciones
`generate-content`, `submit-evaluation` y `verify-report`.
Configura `GEMINI_API_KEY` **solo** como secreto de Supabase y despliega ambas funciones
antes de publicar esta versión del frontend. La clave de Gemini ya no se incluye en
el JavaScript público; si se usó con una versión anterior, rótala en Google AI Studio.

```bash
npx supabase secrets set GEMINI_API_KEY=tu_clave
npx supabase functions deploy generate-content
npx supabase functions deploy submit-evaluation
npx supabase functions deploy verify-report
```

Las funciones comprueban la sesión de Supabase Auth y el NIE antes de acceder a los
datos del estudiante. Después de verificar el flujo de evaluación, ejecuta la
**parte 2** de `supabase-verificacion.sql` en el SQL Editor para revocar la escritura
directa de notas. No vuelvas a aplicar `supabase-fix-rls-escritura.sql` después de
cerrar esas políticas: ese archivo abre escrituras para cualquier cliente anónimo.

### Migración de cuentas y permisos

El acceso docente usa una cuenta de Supabase Auth y su ID en `public.teacher_users`.
No necesita variables `VITE_ADMIN_*`. El inicio de sesión de alumnos requiere que
`students.auth_user_id` apunte a su cuenta Auth; la primera migración intenta
asociarla por el correo `<NIE>@inti.edu.sv`.

Antes de desplegar este frontend, revisar el esquema y las políticas reales de
Supabase, crear un respaldo restaurable y ensayar en un proyecto de pruebas:

1. Confirmar que se aplicó la parte 1 de `supabase-verificacion.sql`, incluida la
   tabla `evaluation_keys` y la columna `weekly_progress.verification_code`.
2. Aplicar `supabase/migrations/2026102901_prepare_auth.sql`.
3. Crear la cuenta docente en Supabase Auth y registrar su UUID con
   `insert into public.teacher_users (user_id) values ('UUID_DE_AUTH');`.
4. Comprobar que todos los alumnos activos tengan `auth_user_id`, y que las
   funciones `generate-content`, `submit-evaluation` y `verify-report` respondan.
5. Aplicar `supabase/migrations/2026102902_enforce_rls.sql` y probar accesos
   de docente, alumno activo, alumno inactivo y visitante anónimo.
6. Aplicar `supabase/migrations/2026102903_atomic_evaluation_keys.sql` antes de
   usar `node scripts/sync-evaluation-keys.mjs`. La sincronización reemplaza
   todas las claves en una sola transacción; si falla, conserva las anteriores.

Estas migraciones están preparadas en el repositorio, pero **no se han aplicado**
al proyecto Supabase de producción. El panel docente requiere los pasos anteriores.
La verificación pública solo indica si existe un código; no revela identidad ni notas.

---

**Desarrollado por:** Ángel Sánchez  
**Institución:** Instituto Nacional Técnico Industrial (INTI)  
**Uso:** Educativo — Especialidad Desarrollo de Software
