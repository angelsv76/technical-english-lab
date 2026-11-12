# Plan: evaluaciones vigiladas

Fecha: 12 de noviembre de 2026. Estado: propuesta para revisar. No se ha construido nada.

## Qué pides

Que cuando un alumno empiece una evaluación, el navegador pase a pantalla completa y el sitio registre y penalice lo que sugiere trampa: salir de la pantalla completa, cambiar de pestaña, abrir otra aplicación, capturar la pantalla. Todo debe valer solo mientras dure la prueba, y quieres saber qué haría falta descargar en la computadora del alumno.

## Lo primero: qué es posible y qué no

Una página web es una página: no puede mirar el resto de la computadora. Lo que ves en otros sitios es una de dos cosas, y conviene separarlas.

| Comportamiento del alumno | Desde la página web | Con Safe Exam Browser |
|---|---|---|
| Salir de pantalla completa | Se detecta al instante, no se puede impedir (Esc siempre funciona) | Se impide: el navegador no sale del modo kiosco |
| Cambiar de pestaña o de ventana (Alt+Tab) | Se detecta después de que ocurre | Se impide |
| Abrir otro programa | Solo se sabe que la página perdió el foco, no cuál programa fue | Se impide o se cierra el programa |
| Copiar, pegar, clic derecho, imprimir | Se bloquea en su mayor parte | Se bloquea |
| Captura de pantalla | Poco fiable: a veces se detecta la tecla Imprimir, la herramienta de recortes y el celular no | Se bloquea en Windows, con reservas según la versión |
| Grabar o compartir pantalla (OBS, Zoom) | No se detecta | Se bloquean los programas conocidos |
| Máquina virtual | No se detecta | Se puede detectar y rechazar |
| Foto con otro celular o segundo dispositivo | No se detecta | Tampoco; solo ayuda la vigilancia presencial |
| Lector de pantalla | No se puede detectar de forma confiable | Igual |

Sobre el lector de pantalla: no lo incluiría como falta. Es una ayuda de accesibilidad que un alumno con discapacidad visual necesita, y penalizarla sería discriminar. Además no hay forma segura de saber si alguien lo está usando.

Lo que sí hace una página web es **registrar** lo que ocurre y dejar constancia. Lo que **impide** de verdad es un programa instalado en la computadora, y el que usan los sitios que viste es de ese tipo.

## Las dos vías

### Vía 1: modo vigilado en el navegador (sin instalar nada)

La página pide pantalla completa al iniciar y vigila el foco y la pestaña. Cada salida queda registrada en el servidor con la hora y la pregunta en que ocurrió, y suma incidencias según las reglas que elijas.

Qué se descarga: nada. Son unos pocos kilobytes de JavaScript que ya vienen con la página, y dejan de actuar cuando termina la prueba.

Alcance: disuade y deja pruebas, pero un alumno decidido puede copiar con un celular o con otra computadora.

### Vía 2: Safe Exam Browser (para exámenes de nota alta)

Programa gratuito y de código abierto, hecho para esto. Abre el sitio en modo kiosco: ocupa toda la pantalla, no deja cambiar de ventana y bloquea capturas y programas externos. El servidor del sitio puede exigirlo: si la evaluación llega desde un navegador común, no deja empezar.

Qué se descarga:
- Una vez, el instalador de Safe Exam Browser (Windows o macOS). Revisa en safeexambrowser.org la versión vigente y los sistemas que soporta, porque no existe para Linux ni para Chromebook.
- Un archivo de configuración `.seb` de pocos kilobytes, que genera el panel docente.

En un laboratorio del INTI lo instala una sola vez la persona encargada y los alumnos no descargan nada. Si el examen es desde casa, cada alumno lo instala y se desinstala cuando quiera.

### Recomendación

Empezar con la vía 1 en todas las evaluaciones, y sumar la vía 2 para exámenes de periodo hechos en el laboratorio. Con la vía 2 sola, un alumno sin la computadora adecuada quedaría fuera.

## Secuencia de un examen vigilado

1. El docente configura la evaluación: modo (normal, vigilado o Safe Exam Browser obligatorio), minutos, ventana de fechas, código de acceso, y las reglas de penalización.
2. El alumno abre la evaluación y ve una pantalla previa con las reglas, lo que se registra y lo que no, y un botón **Comenzar**. La pantalla completa solo se puede pedir con un clic del alumno, por eso este botón es necesario.
3. El servidor crea una sesión de examen: hora de inicio, hora límite (la controla el servidor, no el reloj del navegador), orden de preguntas y un solo intento.
4. Durante la prueba la página:
   - muestra una pregunta a la vez, sin botón de regreso;
   - envía cada respuesta al servidor al momento, para que una desconexión no pierda lo contestado;
   - manda una señal cada 10 segundos, y si faltan más de 30 se marca desconexión;
   - bloquea copiar, pegar, clic derecho, seleccionar texto e imprimir;
   - avisa cada evento (salida de pantalla completa, pérdida de foco, cambio de pestaña) al servidor.
5. Si el alumno sale de pantalla completa, aparece una cortina: «Vuelve a pantalla completa para continuar». El tiempo sigue corriendo, y la incidencia queda registrada.
6. Al terminar, el servidor califica como hoy y guarda por separado la nota y las incidencias.
7. El docente ve en el panel una línea de tiempo por alumno, con las incidencias y la nota con y sin descuento. Puede perdonar una incidencia o anular el intento.

## Reglas de penalización

Propuesta, todo configurable por evaluación:

- Primera incidencia: aviso en pantalla, sin descuento.
- Segunda y tercera: aviso y registro.
- Desde la cuarta: descuento de 5 puntos por incidencia, con un tope que tú fijes.
- Con 6 incidencias o más: el intento queda marcado **para revisión del docente**, no se anula solo.

Mi recomendación es no aplicar descuentos automáticos sin que tú los confirmes: un aviso del sistema, un clic mal dado o una caída del Wi‑Fi producen incidencias que no son trampa. Por eso el panel deja ver la nota original y la nota con descuento, y tú decides.

## Qué se construye

**Datos.** Dos tablas nuevas: sesiones de examen (alumno, evaluación, inicio, límite, estado) e incidencias (sesión, tipo, hora, pregunta). La configuración del examen se agrega al bloque de evaluación de la lección.

**Servidor.** Crear y cerrar sesiones, recibir respuestas y señales, aplicar las reglas, verificar que la sesión exista y no haya vencido al calificar. Para Safe Exam Browser, validar el encabezado que envía el programa y generar el archivo `.seb`.

**Navegador del alumno.** Pantalla previa, pantalla completa, vigilancia de foco, bloqueos de copiar y pegar, cortina de regreso a pantalla completa, guardado progresivo.

**Panel docente.** Configuración del examen en el editor, línea de tiempo de incidencias, perdonar o anular, y el botón para descargar el `.seb`.

## Fases

| Fase | Contenido | Tamaño |
|---|---|---|
| 1 | Sesiones de examen: tiempo controlado por el servidor, un intento, guardado progresivo, ventana de fechas y código de acceso | Mediano |
| 2 | Modo vigilado en el navegador: pantalla completa, detección, registro de incidencias, cortina de regreso | Mediano |
| 3 | Reglas de penalización y panel de revisión del docente | Mediano |
| 4 | Safe Exam Browser: validación en el servidor, archivo `.seb`, guía de instalación para el laboratorio | Mediano |

La fase 2 sola ya cambia la experiencia, pero sin la fase 1 el tiempo y los intentos dependen del navegador, que el alumno puede manipular. Por eso el orden es 1, 2, 3, 4.

## Límites y riesgos

- **Lo que viene del navegador no es de fiar.** Un alumno con conocimientos puede desactivar el JavaScript de vigilancia. Por eso el tiempo, el intento único y la nota se deciden en el servidor, y lo que se vigila en el navegador sirve de indicio, no de prueba.
- **Falsos positivos.** Notificaciones del sistema, un clic fuera de la ventana, una llamada, la batería baja. De ahí la revisión del docente antes de descontar.
- **Alumnos con adaptaciones.** Hay que poder dar tiempo extra y desactivar el modo vigilado para un alumno concreto, sin que el resto lo note.
- **Privacidad.** El plan no graba pantalla, cámara ni micrófono. Solo registra eventos con hora. Hay que avisar a alumnos y a sus familias qué se registra, antes del examen. Son menores de edad.
- **Celulares.** En celular el modo de pantalla completa de las páginas web no funciona de forma consistente, sobre todo en iPhone. La evaluación vigilada debería exigir computadora.
- **Nada reemplaza a la persona en el aula.** Con el docente en el aula, mirando las pantallas, y con preguntas en orden aleatorio para cada alumno, se evita más trampa que con cualquier programa. Lo de este plan complementa esa vigilancia, no la sustituye.

## Decisiones que necesito

1. **¿Dónde se harán los exámenes?** Laboratorio del INTI con computadoras fijas, casa de cada alumno, o ambos. Cambia mucho la vía 2.
2. **¿Quién instalaría Safe Exam Browser** en el laboratorio, y sobre qué sistema operativo?
3. **¿Descuento automático o solo registro con revisión tuya?** Recomiendo lo segundo.
4. **Reglas por defecto:** cuántos avisos y cuántos puntos por incidencia, con qué tope.
5. **¿Tiempo límite y ventana de fechas** en todas las evaluaciones, o solo en las de periodo?
6. **¿Se permite hacerlo en celular?**
7. **¿Cómo atenderías a un alumno con adaptación** (tiempo extra, lector de pantalla)?
