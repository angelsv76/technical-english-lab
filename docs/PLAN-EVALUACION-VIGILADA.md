# Plan: evaluaciones vigiladas

Fecha: 12 de noviembre de 2026. Actualizado el mismo día con el registro de evidencias, el cierre del navegador y las varias pantallas. Estado: propuesta para revisar. No se ha construido nada.

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
| Cerrar el navegador o la pestaña (X, Ctrl+W, Alt+F4, F5) | Se detecta el intento y se avisa al servidor. No llega si matan el proceso o se apaga la computadora, pero el servidor nota que faltó la señal de vida | Se impide cerrar |
| Varias pantallas | Se detecta si hay un escritorio extendido, solo en Chrome y Edge. No detecta una pantalla duplicada (espejo) ni se ve en Firefox o Safari | Se puede configurar para no permitir más de una pantalla; revisa el ajuste en la versión instalada |
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

## Qué se registra como evidencia

Todo lo que el alumno haga fuera de contestar queda guardado. Esta es la lista, con qué tan confiable es cada detección y la gravedad que propongo:

| Evento | Cómo se detecta | Fiabilidad | Gravedad |
|---|---|---|---|
| Sale de pantalla completa | Evento del navegador | Alta | Grave |
| Pierde el foco o cambia de ventana o programa | Eventos de foco | Alta | Grave |
| Cambia de pestaña | Visibilidad de la página | Alta | Grave |
| Cierra o recarga la página | Aviso al cerrar; si no llega, falta la señal de vida | Media | Crítica |
| Se corta la señal (cierre forzado, apagado, caída de red) | El servidor ve que faltan señales | Alta como hecho; no distingue la causa | Según la duración |
| Más de una pantalla | Estado de las pantallas del navegador | Alta en Chrome y Edge; nula en otros | Crítica |
| Abre el mismo examen en otra pestaña o equipo | El servidor ve dos conexiones | Alta | Grave |
| Copiar, cortar, pegar, clic derecho, arrastrar | Eventos del navegador (se bloquean) | Alta | Leve |
| Imprimir o guardar (Ctrl+P, Ctrl+S) | Eventos y teclas | Media | Leve |
| Tecla Imprimir pantalla o atajos de recorte | Teclas, que no siempre llegan | Baja | Grave |
| F12, Ctrl+Shift+I, Ctrl+U, herramientas abiertas | Teclas y diferencia de tamaño de ventana | Baja a media | Grave |
| Cambia el tamaño de la ventana o la resolución | Evento de tamaño | Alta | Leve |
| El reloj de la computadora no coincide con el del servidor | Comparación de horas | Media | Aviso al docente |
| Inactividad de varios minutos | Sin ratón ni teclado | Alta | Aviso al docente |
| Vuelve a entrar tras un cierre | El servidor | Alta | Se anota el tiempo que estuvo fuera |

Cómo queda como evidencia:

- El registro solo se agrega, no se edita ni se borra desde la aplicación. Cada incidencia lleva la hora del servidor, la hora del navegador, la pregunta en que ocurrió, el tipo y el detalle.
- Cada registro guarda una huella que incluye la del anterior. Si alguien altera la base de datos después, la cadena se rompe y se nota.
- El docente ve una línea de tiempo por alumno. El reporte en PDF del alumno y la página pública `/verificar/<código>` muestran cuántas incidencias hubo y cuántas fueron graves.
- Perdonar una incidencia también se registra: quién, cuándo y por qué motivo.
- La evidencia son eventos con hora. No se guardan imágenes de la pantalla, ni cámara ni micrófono.

Una limitación que conviene tener presente: un alumno con conocimientos podría impedir que el navegador envíe un evento. Por eso lo que vale más como prueba es lo que decide el servidor: las señales de vida que faltan, la hora de cada respuesta y las dos conexiones simultáneas.

## Cerrar el navegador

Se atrapa de dos maneras a la vez. Al cerrar o recargar, la página intenta avisar al servidor en el último instante, y funciona con la X, Ctrl+W, Alt+F4 y F5. Si el cierre es brusco (administrador de tareas, apagado, corte de luz), no hay aviso, pero el servidor registra que dejaron de llegar las señales de vida, y eso queda como interrupción con su duración.

El servidor no puede saber si fue un cierre a propósito o una falla de internet. Por eso propongo dos políticas y eliges una por evaluación:

- **Cierre final (para exámenes de nota alta):** el intento termina con lo contestado hasta ese momento, se aplica la penalización crítica y solo el docente puede reabrirlo.
- **Reanudar con penalización (para evaluaciones semanales):** el alumno puede volver a entrar, el tiempo sigue corriendo y se aplica la penalización según cuánto estuvo fuera.

## Varias pantallas

Se revisa en dos momentos:

1. **Antes de comenzar**, en la pantalla previa: si hay un escritorio extendido, no se deja iniciar hasta que desconecte la otra pantalla. Aquí no hay penalización, porque aún no empezó.
2. **Durante la prueba:** si conecta otra pantalla, se registra como incidencia crítica.

Para que esto funcione el alumno debe usar Chrome o Edge: la pantalla previa lo verifica y no deja comenzar con otro navegador. Una pantalla en modo duplicado (espejo) no se puede detectar desde la página. Con Safe Exam Browser sí se puede cerrar esa puerta, porque se configura para no aceptar más de una pantalla.

## Reglas de penalización

Se aplican solas, según la gravedad, y el docente puede revertirlas con motivo. Propuesta inicial, todo configurable por evaluación:

| Gravedad | Qué pasa por cada incidencia |
|---|---|
| Aviso | Solo se registra y se avisa al docente |
| Leve | Se registra y se avisa al alumno. Sin descuento hasta la tercera; desde la cuarta, 1 punto |
| Grave | Aviso en pantalla y 5 puntos de descuento |
| Crítica | 20 puntos de descuento y, si la política es cierre final, el intento termina |

Hay un tope de descuento total por evaluación, que tú fijas. El panel muestra siempre la nota original, el descuento y la nota final, para que se vea cómo se llegó a ella.

La penalización automática puede equivocarse: una notificación del sistema, una llamada o una falla de la red generan incidencias que no son trampa. Por eso el docente ve las incidencias antes de cerrar las notas y puede perdonar las que no correspondan.

## Qué se construye

**Datos.** Dos tablas nuevas: sesiones de examen (alumno, evaluación, inicio, límite, estado) e incidencias (sesión, número de orden, tipo, gravedad, hora del servidor, hora del navegador, pregunta, huella encadenada). La configuración del examen (política de cierre, tabla de penalizaciones, tope) se agrega al bloque de evaluación de la lección.

**Servidor.** Crear y cerrar sesiones, recibir respuestas y señales, aplicar las reglas, verificar que la sesión exista y no haya vencido al calificar. Para Safe Exam Browser, validar el encabezado que envía el programa y generar el archivo `.seb`.

**Navegador del alumno.** Pantalla previa, pantalla completa, vigilancia de foco, bloqueos de copiar y pegar, cortina de regreso a pantalla completa, guardado progresivo.

**Panel docente.** Configuración del examen en el editor, línea de tiempo de incidencias, perdonar o anular, y el botón para descargar el `.seb`.

## Fases

| Fase | Contenido | Tamaño |
|---|---|---|
| 1 | Sesiones de examen: tiempo controlado por el servidor, un intento, guardado progresivo, ventana de fechas y código de acceso | Mediano |
| 2 | Modo vigilado en el navegador: pantalla completa, todos los eventos de la tabla, aviso al cerrar, revisión de pantallas, registro encadenado, cortina de regreso | Grande |
| 3 | Penalización por gravedad, política de cierre, panel de revisión con línea de tiempo, perdón con motivo, incidencias en el PDF y en la verificación | Mediano |
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
3. **Cierre del navegador:** ¿cierre final del intento o reanudar con penalización? Puede ser distinto en exámenes de periodo y en evaluaciones semanales.
4. **Cuadro de penalizaciones:** ¿te sirven 0, 1, 5 y 20 puntos para aviso, leve, grave y crítica? ¿Qué tope total de descuento?
5. **¿Exiges Chrome o Edge** en el modo vigilado, para poder detectar varias pantallas?
6. **¿Se permite hacerlo en celular?** Recomiendo que no.
7. **¿Cómo atenderías a un alumno con adaptación** (tiempo extra, lector de pantalla), sin que el resto lo note?
8. **Aviso previo a alumnos y familias:** ¿quién lo redacta y cuándo se entrega? Debe decir qué se registra.
