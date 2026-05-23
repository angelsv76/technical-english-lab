# Technical English Lab — INTI

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
   GEMINI_API_KEY=tu_api_key_de_gemini
   VITE_ADMIN_USER=usuario_docente
   VITE_ADMIN_HASH=hash_sha256_de_la_contraseña
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

La app está configurada para Vercel. Las variables de entorno deben definirse en el dashboard de Vercel (nunca en el repositorio).

---

**Desarrollado por:** Ángel Sánchez  
**Institución:** Instituto Nacional Técnico Industrial (INTI)  
**Uso:** Educativo — Especialidad Desarrollo de Software
