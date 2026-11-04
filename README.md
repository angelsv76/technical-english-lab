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
