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
   VITE_ADMIN_USER=usuario_docente
   VITE_ADMIN_HASH=hash_sha256_de_la_contraseña
   ```

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

**Pendiente de endurecer:** el acceso docente usa un hash público `VITE_ADMIN_HASH`
y una bandera en `localStorage`, y varias políticas RLS históricas permiten acceso
amplio a datos. No son un límite de seguridad. Antes de usar datos sensibles en
producción, migra el rol docente a Supabase Auth y restringe las políticas RLS por
usuario. El cambio requiere revisar las políticas de la base de datos desplegada.

---

**Desarrollado por:** Ángel Sánchez  
**Institución:** Instituto Nacional Técnico Industrial (INTI)  
**Uso:** Educativo — Especialidad Desarrollo de Software
