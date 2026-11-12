# Plan: evaluaciones vigiladas

Fecha: 12 de noviembre de 2026. Actualizado el mismo día con las decisiones de Ángel sobre dónde se examina, el cierre del navegador y el cuadro de penalizaciones. Estado: propuesta para revisar. No se ha construido nada.

## Qué pides

Que cuando un alumno empiece una evaluación, el navegador pase a pantalla completa y el sitio registre y penalice lo que sugiere trampa: salir de la pantalla completa, cambiar de pestaña, abrir otra aplicación, capturar la pantalla. Todo debe valer solo mientras dure la prueba, y quieres saber qué haría falta descargar en la computadora del alumno.

## Decisiones ya tomadas

1. **Dónde se examina:** los alumnos usan sus propias computadoras.
2. **Cierre del navegador:** el alumno puede reanudar, con penalización.
3. **Avisos:** solo advierten, sin descuento.
4. **Faltas leves:** la primera advierte; desde la segunda descuentan.
5. **Faltas críticas:** descuentan 3 puntos cada vez.
6. **Evaluaciones normales** (semanales): modo vigilado en el navegador, solo con **Chrome o Edge**.
7. **Exámenes de periodo:** **Safe Exam Browser obligatorio**. Chrome y Edge no pueden abrirlos.

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

### Cómo lo vive el alumno con Safe Exam Browser

Una página web no puede instalar un programa en la computadora, ni siquiera redirigiendo. El alumno lo descarga e instala una vez, y después el sitio lo abre.

1. **Instalación, una sola vez.** El alumno descarga el programa desde safeexambrowser.org (gratis, para Windows o macOS; también existe para iPad) y lo instala. En Windows suele pedir permisos de administrador. Conviene hacerlo antes del día del examen.
2. **Entrada al examen.** El docente descarga desde el panel un archivo de configuración `.seb` por evaluación y lo comparte con los alumnos (por Classroom, por ejemplo). El alumno le da doble clic y se abre Safe Exam Browser, ya apuntando al examen. Otra forma es un botón «Abrir con Safe Exam Browser» en la pantalla previa del sitio, que usa un enlace especial (`sebs://`) y le pide al sistema que abra el programa.
3. **Si entra con un navegador común.** El servidor comprueba una señal que solo envía Safe Exam Browser. Si no llega, no muestra el examen. Muestra una página que explica los tres pasos: descargar el programa (con el enlace según el sistema operativo), abrir el archivo `.seb` o pulsar el botón, y volver a entrar. No lo redirige solo al programa, porque si no lo tiene instalado quedaría sin saber qué pasó.
4. **Durante el examen.** El programa ocupa toda la pantalla y no deja cambiar de ventana. Al terminar, el sitio manda al alumno a una dirección de salida y el programa se cierra solo, sin pedir contraseña.
5. **Prueba previa.** Recomiendo una evaluación de práctica sin nota, unos días antes, para que cada alumno confirme que lo instaló y que funciona.

Lo que sí hay que revisar antes de decidir:

- **Dónde está el sitio.** Hoy el sitio corre en tu computadora y se ve en la red del INTI. Si los alumnos rinden desde su casa, el servidor tiene que ser accesible desde internet (un túnel o un servidor en línea), y eso hay que resolverlo con o sin Safe Exam Browser.
- **Quién no puede usarlo.** Linux y Chromebook quedan fuera. Por eso el modo en el navegador sigue siendo la base y este programa es opcional.

### Cómo se reparten los dos modos

| Tipo de evaluación | Modo | Con qué entra el alumno |
|---|---|---|
| Normal (semanal) | Vigilado en el navegador | Chrome o Edge. La pantalla previa lo comprueba y no deja comenzar con otro |
| Examen de periodo | Reforzado | Solo Safe Exam Browser. El servidor no muestra las preguntas a ningún otro navegador |

Qué cambia con computadoras propias:

- No se controla qué más tienen instalado: grabadores de pantalla, máquinas virtuales, programas de escritorio remoto. En el modo normal eso queda fuera de lo detectable, y la evidencia que se guarda sirve como indicio, no como prueba.
- La pantalla previa hace una **revisión de compatibilidad** antes de dejar comenzar: navegador, pantalla completa disponible, una sola pantalla y una conexión estable.
- Si el examen es en casa, nadie vigila en persona. Por eso conviene un tiempo límite corto, una ventana de fechas y un panel **en vivo** donde veas quién está conectado y quién acumula incidencias.

**Alumnos sin equipo compatible.** Safe Exam Browser no existe para Linux ni para Chromebook. Quien tenga uno de esos equipos no podría rendir un examen de periodo. Hay que acordar una salida antes del primer examen, por ejemplo:

- que rinda en una computadora del INTI con el programa instalado;
- que el docente le habilite el modo vigilado en el navegador para ese alumno, con vigilancia presencial o por videollamada;
- que se le preste una computadora compatible el día del examen.

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

## Avisos al alumno antes de comenzar

Antes de mostrar una sola pregunta, la pantalla previa revisa el equipo. Si algo no cumple, el alumno recibe un aviso que dice qué pasa y qué hacer, y no puede comenzar. Esta revisión no penaliza nada: todavía no empezó la prueba.

| Situación | Aviso que ve el alumno | Qué puede hacer |
|---|---|---|
| Navegador que no es Chrome ni Edge, en una evaluación normal | «Esta evaluación solo se puede rendir con Google Chrome o Microsoft Edge. Estás usando [navegador].» | Copiar el enlace y abrirlo en uno de los dos |
| Chrome o Edge demasiado viejo | «Actualiza tu navegador para poder rendir esta evaluación.» | Actualizar y volver a entrar |
| Examen de periodo desde un navegador común | «Este examen se rinde únicamente con Safe Exam Browser.» con los tres pasos: descargar, abrir el archivo `.seb`, volver a entrar | Seguir los pasos |
| Equipo sin Safe Exam Browser posible (Linux, Chromebook) | «Tu equipo no es compatible. Habla con tu docente para acordar cómo rendir.» | Contactar al docente |
| Celular o tableta | «Esta evaluación debe rendirse desde una computadora.» | Cambiar de equipo |
| Más de una pantalla | «Desconecta la otra pantalla y pulsa Volver a revisar.» | Desconectarla y revisar de nuevo |
| Pantalla completa no disponible | «Tu navegador no permite pantalla completa. Prueba con otro navegador.» | Cambiar de navegador |
| Conexión inestable | «Tu conexión es inestable. Acércate al router o cambia de red antes de comenzar.» | Mejorar la conexión |
| Reloj de la computadora desfasado | «La hora de tu computadora no está bien. Actívala en automático.» | Corregir la hora |
| Evaluación cerrada o fuera de fecha | «Esta evaluación estará disponible del [fecha] al [fecha].» | Esperar |

Cómo se detecta el navegador: por la información que el propio navegador declara sobre su marca. Brave y Opera, aunque están hechos sobre Chrome, no se identifican como Chrome ni Edge, y quedarían fuera. Si quieres permitirlos, se agregan a la lista, aunque Brave oculta algunos datos y habría que revisar su comportamiento.

Detalles que hay que cuidar:

- **La revisión se repite en el servidor.** No basta con la del navegador, porque un alumno con conocimientos puede engañarla. El servidor valida al crear la sesión de examen.
- **Queda un registro.** Cada intento rechazado se anota como aviso para el docente («Fulano intentó entrar con Firefox el 20/11 a las 8:02»), sin descuento. Así sabes quién necesita ayuda antes de que empiece el examen.
- **El mensaje es claro y amable.** Dice qué falló, qué hacer y a quién escribir, sin lenguaje técnico.
- **La revisión se puede hacer antes.** Desde el panel, el alumno puede abrir una página de «Probar mi equipo» días antes y ver si todo está bien, sin entrar a ninguna evaluación.

## Qué se registra como evidencia

Todo lo que el alumno haga fuera de contestar queda guardado. Esta es la lista, con qué tan confiable es cada detección y la gravedad que propongo:

| Evento | Cómo se detecta | Fiabilidad | Gravedad |
|---|---|---|---|
| Sale de pantalla completa | Evento del navegador | Alta | Grave |
| Pierde el foco o cambia de ventana o programa | Eventos de foco | Alta | Grave |
| Cambia de pestaña | Visibilidad de la página | Alta | Grave |
| Cierra o recarga la página | Aviso al cerrar; si no llega, falta la señal de vida | Media | Crítica |
| Se corta la señal por más de 30 segundos (cierre forzado, apagado, caída de red) | El servidor ve que faltan señales | Alta como hecho; no distingue la causa | Crítica |
| Más de una pantalla | Estado de las pantallas del navegador | Alta en Chrome y Edge; nula en otros | Crítica |
| Abre el mismo examen en otra pestaña o equipo | El servidor ve dos conexiones | Alta | Crítica |
| Copiar, cortar, pegar, clic derecho, arrastrar | Eventos del navegador (se bloquean) | Alta | Leve |
| Imprimir o guardar (Ctrl+P, Ctrl+S) | Eventos y teclas | Media | Leve |
| Tecla Imprimir pantalla o atajos de recorte | Teclas, que no siempre llegan | Baja | Grave |
| F12, Ctrl+Shift+I, Ctrl+U, herramientas abiertas | Teclas y diferencia de tamaño de ventana | Baja a media | Grave |
| Cambia el tamaño de la ventana o la resolución | Evento de tamaño | Alta | Leve |
| El reloj de la computadora no coincide con el del servidor | Comparación de horas | Media | Aviso |
| Inactividad de 3 minutos o más | Sin ratón ni teclado | Alta | Aviso |
| Vuelve a entrar tras un cierre | El servidor | Alta | Aviso (se anota el tiempo fuera) |

Cómo queda como evidencia:

- El registro solo se agrega, no se edita ni se borra desde la aplicación. Cada incidencia lleva la hora del servidor, la hora del navegador, la pregunta en que ocurrió, el tipo y el detalle.
- Cada registro guarda una huella que incluye la del anterior. Si alguien altera la base de datos después, la cadena se rompe y se nota.
- El docente ve una línea de tiempo por alumno. El reporte en PDF del alumno y la página pública `/verificar/<código>` muestran cuántas incidencias hubo y cuántas fueron graves.
- Perdonar una incidencia también se registra: quién, cuándo y por qué motivo.
- La evidencia son eventos con hora. No se guardan imágenes de la pantalla, ni cámara ni micrófono.

Una limitación que conviene tener presente: un alumno con conocimientos podría impedir que el navegador envíe un evento. Por eso lo que vale más como prueba es lo que decide el servidor: las señales de vida que faltan, la hora de cada respuesta y las dos conexiones simultáneas.

## Cerrar el navegador

Se atrapa de dos maneras a la vez. Al cerrar o recargar, la página intenta avisar al servidor en el último instante, y funciona con la X, Ctrl+W, Alt+F4 y F5. Si el cierre es brusco (administrador de tareas, apagado, corte de luz), no hay aviso, pero el servidor registra que dejaron de llegar las señales de vida.

**Política elegida: reanudar con penalización.**

- El alumno puede volver a entrar y continúa en la misma pregunta, con lo ya contestado guardado.
- El tiempo no se detiene mientras estuvo fuera.
- Cada cierre o interrupción de más de 30 segundos cuenta como **una incidencia crítica** (3 puntos).
- Al volver, el sistema registra cuánto tiempo estuvo fuera.
- Si cierra tres veces o más en una misma evaluación, el intento queda marcado para revisión del docente.

El servidor no distingue un cierre a propósito de una falla de internet. Por eso el docente puede perdonar la incidencia con motivo cuando el alumno demuestre que fue un corte de red.

## Varias pantallas

Se revisa en dos momentos:

1. **Antes de comenzar**, en la pantalla previa: si hay un escritorio extendido, no se deja iniciar hasta que desconecte la otra pantalla. Aquí no hay penalización, porque aún no empezó.
2. **Durante la prueba:** si conecta otra pantalla, se registra como incidencia crítica.

Para que esto funcione el alumno debe usar Chrome o Edge: la pantalla previa lo verifica y no deja comenzar con otro navegador. Una pantalla en modo duplicado (espejo) no se puede detectar desde la página. Con Safe Exam Browser sí se puede cerrar esa puerta, porque se configura para no aceptar más de una pantalla.

## Cuadro de penalizaciones

Las penalizaciones se aplican solas y el docente puede revertirlas con motivo. Los puntos se restan de la nota de la evaluación, que va de 0 a 100.

| Gravedad | Qué pasa | Descuento |
|---|---|---|
| **Aviso** | Solo se registra y se advierte | 0 |
| **Leve** | La primera de la evaluación solo advierte. Desde la segunda, descuenta | 1 punto por incidencia, desde la segunda |
| **Grave** | Advertencia en pantalla y descuento desde la primera | 2 puntos por incidencia |
| **Crítica** | Advertencia en pantalla y descuento | 3 puntos por incidencia |

Qué eventos caen en cada gravedad:

| Gravedad | Eventos |
|---|---|
| Aviso | Inactividad de 3 minutos o más; reloj desfasado; reingreso tras un cierre |
| Leve | Copiar, cortar, pegar, clic derecho o arrastrar (el intento se bloquea); imprimir o guardar; cambiar el tamaño de la ventana o la resolución |
| Grave | Salir de pantalla completa; perder el foco o cambiar de ventana o programa; cambiar de pestaña; tecla Imprimir pantalla; F12 y atajos de herramientas del navegador |
| Crítica | Cerrar o recargar la página, o corte de señal de más de 30 segundos; más de una pantalla durante la prueba; abrir el mismo examen en otra pestaña o equipo |

Reglas para que no se cobre de más:

- **Una misma acción no se cobra dos veces.** Salir de pantalla completa suele producir también un cambio de foco y de visibilidad. Los eventos que ocurren dentro de una ventana de 10 segundos y vienen de una misma acción se cuentan como una sola incidencia, la de mayor gravedad, y todos quedan en el registro.
- **La nota nunca baja de 0.**
- **Hay un tope de descuento total por evaluación.** Propongo 30 puntos; tú lo confirmas.
- **El alumno ve este cuadro** en la pantalla previa, antes de comenzar, tal como está aquí.
- **El panel docente** muestra la nota original, el descuento por gravedad y la nota final, para que se vea cómo se llegó a ella.
- Perdonar una incidencia devuelve sus puntos y queda registrado con quién, cuándo y por qué.

Los números de las faltas leves (1 punto) y graves (2 puntos) son una propuesta mía, porque indicaste solo los de las críticas. Mantienen el orden: leve menos que grave, y grave menos que crítica.

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
- **Computadoras de los alumnos.** Sin control del equipo, la vigilancia es de indicios. Se compensa con tiempo límite, ventana de fechas, preguntas en orden aleatorio para cada alumno y el panel en vivo.
- **Celulares.** En celular el modo de pantalla completa de las páginas web no funciona de forma consistente, sobre todo en iPhone. La evaluación vigilada debería exigir computadora.
- **Nada reemplaza a la persona en el aula.** Con el docente en el aula, mirando las pantallas, y con preguntas en orden aleatorio para cada alumno, se evita más trampa que con cualquier programa. Lo de este plan complementa esa vigilancia, no la sustituye.

## Decisiones que faltan

1. **Dónde rinden:** ¿dentro del INTI, conectados a la red de la institución, o desde su casa? Si es desde casa, el servidor tiene que ser accesible por internet.
2. **Alumnos sin equipo compatible con Safe Exam Browser** (Linux, Chromebook): ¿cuál de las salidas anteriores prefieres?
3. **Puntos de las faltas leves y graves:** ¿te sirven 1 y 2? Quedaron propuestos por mí.
4. **Tope total de descuento por evaluación:** ¿30 puntos?
5. **¿Se permite hacerlo en celular?** Recomiendo que no.
6. **¿Cómo atenderías a un alumno con adaptación** (tiempo extra, lector de pantalla), sin que el resto lo note?
7. **Aviso previo a alumnos y familias:** ¿quién lo redacta y cuándo se entrega? Debe decir qué se registra y qué se penaliza.
8. **¿Quieres el panel en vivo** (quién está conectado y cuántas incidencias lleva) desde la primera versión?
