# Plan: Estudio de lecciones y plantillas por materia

Fecha: 8 de noviembre de 2026. Estado: propuesta, falta tu visto bueno y las decisiones del final.

## Qué quieres lograr

Preparar lecciones en una herramienta aparte, parecida a eXeLearning, ver cómo quedan tal como las verá el alumno, y partir de plantillas distintas según la materia (inglés técnico, taller, programación, matemática, proyectos). Lo que armes se lleva al sitio con **Importar**.

## Con qué contamos hoy

- Un editor dentro del sitio con nueve tipos de bloque, vista previa, borrador y publicada, historial de 20 versiones.
- Exportar e importar cursos en `.zip`, con sus imágenes, audios, videos y PDF.
- Arranque sin las semanas de inglés (`SEMBRAR_LECCIONES=0`), para usar el sitio con otra materia.

Lo que falta para tu idea:

- El curso tiene 40 semanas fijas y los textos del sitio ("Inglés Técnico", "Semana", colores) están escritos en el código.
- Solo se califican preguntas de opción múltiple.
- No hay plantillas ni forma de guardar una lección como modelo.
- Para editar hay que tener el servidor encendido.

## Cómo sería el Estudio

Un archivo que abres con doble clic, sin instalar nada y sin conexión. Tres zonas:

1. A la izquierda, el árbol del curso: unidades y lecciones, que se reordenan arrastrando.
2. Al centro, el editor de bloques que ya conoces.
3. A la derecha, la vista previa, con un botón para verla en computadora o en celular.

La vista previa usa los mismos componentes del sitio, no una copia. Si algo cambia en el sitio, cambia igual en el Estudio. Guarda y abre archivos `.zip` en tu computadora, y guarda solo cada pocos segundos para que no se pierda trabajo si se cierra la ventana.

## Plantillas

Hay dos niveles:

- **Plantilla de curso:** la estructura completa (cuántas unidades, cómo se llaman), los colores, el logo y las lecciones esqueleto con textos guía como "Escribe aquí el objetivo".
- **Plantilla de lección:** una secuencia de bloques para reutilizar. Cualquier lección tuya se podrá guardar como plantilla.

Primeras cinco plantillas propuestas (las confirmas o cambias):

| Plantilla | Secuencia de la lección |
|---|---|
| Idioma técnico | Introducción, vocabulario con audio, práctica, evaluación (la actual) |
| Taller o laboratorio | Objetivo, normas de seguridad, materiales, procedimiento por pasos, práctica, evaluación |
| Programación | Concepto, código de ejemplo, ejercicio, reto, evaluación |
| Matemática | Concepto, fórmulas, ejemplo resuelto, ejercicios, evaluación |
| Proyecto y portafolio | Planteamiento, hitos, entregables, rúbrica |

## Cambios que necesita el sitio

**Curso configurable.** Nombre, materia, cómo se llaman las unidades (semana, sesión, unidad), cantidad de unidades más allá de 40, colores y logo. El paquete `.zip` pasa a la versión 2 y sigue leyendo los de la versión 1.

**Bloques nuevos.** Aviso (nota, precaución, seguridad), pasos numerados, tabla, código con colores, fórmula matemática, pestañas o acordeón.

**Preguntas nuevas.** Verdadero o falso, completar espacios, emparejar, ordenar pasos. Se califican en el servidor, igual que hoy, y el alumno no recibe las respuestas.

## Fases y orden

| Fase | Contenido | Tamaño |
|---|---|---|
| A | Curso configurable y paquete versión 2 | Mediano |
| C | Estudio, primera versión: abrir y guardar `.zip`, árbol del curso, editor, vista previa fiel | Grande |
| B | Bloques y preguntas nuevas, con sus pruebas de calificación | Grande |
| D | Biblioteca de plantillas, "guardar como plantilla" y asistente de curso nuevo | Mediano |
| E | Opcional, a pedido: exportar a sitio estático o SCORM, generar audio con Kokoro, importar desde Word o Markdown, banco de preguntas | Cada uno aparte |

El orden es A, C, B, D. El Estudio se hace antes que los bloques nuevos porque reutiliza los mismos componentes, así que los bloques nuevos aparecen en los dos lugares sin repetir trabajo. Las plantillas de taller y matemática van al final porque necesitan esos bloques.

Al terminar la fase C ya tendrías un editor externo con lo que existe hoy.

## Lo que no se hará

eXeLearning lleva años de desarrollo. Aquí queda fuera: edición de varios docentes a la vez por internet, decenas de tipos de actividad, cuentas de alumnos dentro del Estudio. Si más adelante algo de esto hace falta, se evalúa como proyecto aparte.

## Riesgos

- **Que crezca sin fin.** Cada fase tiene una lista cerrada de entregas y no se agrega nada a medias.
- **Dos copias del código.** El Estudio y el sitio comparten componentes y el mismo validador. No hay dos versiones de la vista previa.
- **Archivos que vienen de otra persona.** Ya se revisan por su contenido real, su integridad y su tamaño antes de guardar algo.
- **Calificación con tipos nuevos.** Cada tipo de pregunta lleva sus propias pruebas antes de usarse con alumnos.

## Cómo se comprueba cada fase

Pruebas automáticas del servidor, recorrido en un navegador real y un curso de ejemplo completo por cada plantilla, probado de punta a punta: crear en el Estudio, importar al sitio, rendir la evaluación como alumno.

## Decisiones que necesito de ti

1. **¿Un sitio por materia o un solo sitio con varias materias?** Recomiendo un sitio por materia, copiando la carpeta, como ya se puede. Un sitio único con todas las materias exige cuentas, grupos y notas separados por materia, y eso es otro proyecto.
2. **¿Qué materias quieres primero** y con qué estructura de clase? Con eso se ajustan las cinco plantillas.
3. **¿Necesitas llevar las lecciones a Google Classroom?** Si sí, la fase E de exportación sube de prioridad.
4. **¿Lo usarán otros docentes además de ti?** Cambia cómo se entrega: un archivo suelto o algo con instrucciones de instalación.
5. **¿Cómo llamas a las unidades?** Semana, sesión o unidad, según la materia.
