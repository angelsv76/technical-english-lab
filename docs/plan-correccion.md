# Plan de corrección — Technical English Lab

Fecha: 29 de octubre de 2026. Base: revisión del código local y compilación; el esquema y las políticas de Supabase desplegadas aún no se han verificado. Las estimaciones son días de trabajo de un agente e incluyen revisión y pruebas.

## Trabajo ya aplicado en esta copia

- La clave de Gemini sale del paquete web; `generate-content` y `submit-evaluation` comprueban la sesión del alumno. Falta desplegar y probar ambas funciones, configurar el secreto y rotar la clave anterior.
- El alumno restaura la sesión con Supabase Auth y no guarda notas directamente. Falta cerrar las escrituras directas en la base de datos desplegada.
- El panel docente muestra alumnos activos/inactivos y permite cambiar su estado; ofrece PDF resumen y CSV por evaluación. El alumno solo puede descargar un reporte después de guardar la nota. El acceso docente ya usa Supabase Auth y hay migraciones RLS preparadas, pero aún deben probarse y aplicarse en la base desplegada.
- La verificación pública consulta una función que responde únicamente si existe el código, sin identidad ni calificación. Falta desplegar y probar esta función.
- El script de respaldo ahora marca los errores con salida no cero y deja las copias incompletas en una carpeta `.partial`. La sincronización de claves usa una función SQL atómica preparada, pendiente de aplicar y probar en Supabase.
- Se instaló `blobatar` con su adaptador React como avatar cuando no hay foto. Se corrigieron la navegación del portal con enlaces, el idioma HTML y los campos del acceso estudiantil.

## Asignación por esfuerzo y dependencias

| Fase | Responsable | Trabajo | Esfuerzo | Criterio de aceptación |
| --- | --- | --- | ---: | --- |
| 0 · Preparación | Agente coordinador + administrador de Supabase | Confirmar esquema, políticas y buckets reales; hacer respaldo comprobado; preparar entorno de pruebas. El remoto Git ya está vinculado. | 0,5–1 día | Inventario reproducible, respaldo restaurable y entorno separado de producción. |
| 1 · Seguridad crítica | Agente de seguridad y datos | Sustituir `VITE_ADMIN_HASH` y `teacherLoggedIn` por Supabase Auth con rol docente; aplicar autorización del lado servidor a activar/desactivar alumnos, fotos, configuración y reportes. | 2–4 días | Un cliente anónimo o alumno no puede leer ni cambiar datos administrativos, incluso llamando directamente a la API. |
| 2 · RLS y evaluaciones | Agente de seguridad y datos | Migrar `students` a `auth_user_id`, restringir SELECT/INSERT/UPDATE por propietario, crear verificación pública mínima, cerrar escritura directa de notas, hacer atómicos los intentos y la sincronización de claves. | 3–5 días | Pruebas con anónimo, alumno A, alumno B y docente; un alumno no modifica datos ajenos; fallos parciales preservan notas y claves existentes. |
| 3 · Experiencia funcional | Agente frontend | Manejar errores y reintentos de progreso/glosario; evitar redirección mientras se restaura sesión; validar caché de IA; diferir y deduplicar solicitudes IA; revisar estados de alumnos deshabilitados. | 1,5–3 días | Recarga de ruta estudiantil conserva sesión; errores de red se explican; no se presenta como guardada una operación fallida. |
| 4 · Interfaz accesible | Agente frontend y diseño | Aplicar navegación por teclado, etiquetas, foco de diálogos, Escape, estados ARIA, tamaño táctil, diseño móvil y movimiento reducido en alumno y docente. Mantener marca y jerarquía actuales. | 2–3 días | Portal, formularios, tablas, pestañas y diálogos operables con teclado; revisión a 375 px y con movimiento reducido. |
| 5 · Calidad y entrega | Agente de pruebas y despliegue | Corregir respaldos y `.gitignore`; añadir pruebas de Auth, notas y reportes; comprobar Edge Functions con Deno y CI; auditar y actualizar dependencias; dividir carga de PDF y rutas. | 2–3 días | `npm ci`, tipos, pruebas, build y comprobación de funciones pasan en CI; fallo de respaldo da código no cero; descarga PDF/CSV validada. |
| 6 · Publicación | Coordinador + administrador de Supabase | Desplegar migraciones y funciones antes del frontend; configurar secreto Gemini; rotar clave antigua; probar cuentas y reportes; publicar por etapas. | 0,5–1 día | Lista de comprobación completada y plan de reversión probado antes de producción. |

Las fases 1 y 2 van primero. Las fases 3, 4 y 5 pueden avanzar en paralelo sobre contratos acordados; la fase 6 depende de todas. Esfuerzo total aproximado: **9,5–17 días de agente**; con tres agentes, el calendario depende sobre todo de seguridad, acceso al Supabase real y pruebas de despliegue.

Referencias de despliegue facilitadas por el propietario: repositorio `angelsv76/technical-english-lab`, equipo Vercel `angelsanchez-1919s-projects` y proyecto Supabase `uecbylctkvdmvfqcxlzg`. No aplicar cambios de base de datos ni publicar el frontend antes de completar las pruebas de autorización.

## Hallazgos que gobiernan el orden

1. **Crítico:** el código de acceso docente ya cambió a Supabase Auth, pero la migración de `teacher_users` y las políticas RLS aún no están aplicadas ni verificadas en Supabase. Los SQL históricos permiten escrituras amplias (`supabase-fix-rls-escritura.sql`, `supabase-course-config.sql`). La opción de activar/desactivar alumnos no debe considerarse segura hasta completar las fases 1 y 2.
2. **Alto:** la función de reemplazo atómico de claves y el respaldo con fallo explícito están implementados, pero requieren prueba de restauración y ejecución contra una base de pruebas. `backups/` ya está ignorado por Git.
3. **Alto:** los reportes docentes antes podían estar incompletos. Esta copia pagina alumnos, progreso y glosario, limita el tamaño de cada filtro y deshabilita descargas tras un error. El CSV neutraliza celdas que podrían ejecutarse como fórmulas al abrirse en una hoja de cálculo. Falta contrastar los recuentos y las descargas con datos reales.
4. **Alto:** `npm audit --omit=dev` informa 22 avisos (3 críticos, 13 altos); hay que distinguir dependencias usadas en producción de herramientas de build y actualizar con pruebas. No hay pruebas ni CI; `tsconfig.json` excluye `supabase/functions`. El build mantiene un paquete principal de aproximadamente 1,3 MB.
5. **Medio:** faltan tratamiento consistente de errores, foco de diálogos, nombres accesibles y comportamiento móvil en varias vistas.

## Guías usadas para la interfaz

- `fronted-design`: conservar propósito del portal y marca INTI; mejorar jerarquía y estados de interacción.
- `web-design-guidelines`: enlaces semánticos, nombres accesibles, foco visible, etiquetas asociadas y control de descargas.
- `ui-ux-pro-max`: priorizar accesibilidad, objetivo táctil, formularios y diseño móvil en React.
- `find-skills`: se revisaron opciones de accesibilidad y Supabase; las guías ya disponibles cubren esta etapa. Evaluar una guía adicional solo si aporta pruebas o patrones que falten.

## Condición para cerrar el plan

La implementación queda completa cuando las pruebas de autorización y reportes pasan contra un Supabase de pruebas, se verifica la restauración del respaldo, se puede deshabilitar y rehabilitar un alumno sin acceso indebido, y el despliegue se hace con funciones, migraciones y frontend compatibles.
