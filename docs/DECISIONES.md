# Decisiones de diseño

Registro de las decisiones importantes del proyecto: qué se decidió, por qué y qué se descartó. Si una
decisión cambia, no se borra: se añade una nueva que la sustituye. Formato inspirado en los
*Architecture Decision Records*.

| # | Decisión | Estado |
|---|---|---|
| 1 | [Web estática en GitHub Pages, sin servidor](#1-web-estática-en-github-pages-sin-servidor) | Vigente |
| 2 | [Sin paso de compilación ni dependencias npm](#2-sin-paso-de-compilación-ni-dependencias-npm) | Vigente |
| 3 | [Módulos ES por capas](#3-módulos-es-por-capas) | Vigente (sustituye a los scripts clásicos con ámbito compartido) |
| 4 | [Navegación por registro de pantallas](#4-navegación-por-registro-de-pantallas) | Vigente |
| 5 | [Un único estado guardado en localStorage](#5-un-único-estado-guardado-en-localstorage) | Vigente |
| 6 | [Cuentos en Markdown con YAML](#6-cuentos-en-markdown-con-yaml) | Vigente |
| 7 | [Dibujos generados con código](#7-dibujos-generados-con-código) | Vigente |
| 8 | [Todo en español](#8-todo-en-español) | Vigente |
| 9 | [Nada de mensajes ni sonidos de error](#9-nada-de-mensajes-ni-sonidos-de-error) | Vigente |
| 10 | [Pruebas en un navegador real](#10-pruebas-en-un-navegador-real) | Vigente |
| 11 | [La arquitectura la vigila una herramienta](#11-la-arquitectura-la-vigila-una-herramienta) | Vigente |

## 1. Web estática en GitHub Pages, sin servidor

**Contexto.** Es un juego para una familia, que se abre en una tablet y un portátil.
**Decisión.** Una web estática publicada desde `main` en GitHub Pages, instalable como app (PWA) y con modo
sin conexión.
**Por qué.** Gratis, sin mantenimiento, sin cuentas y sin datos de la niña en ningún servidor.
**Consecuencias.** El progreso vive en cada navegador: por eso existen la copia de seguridad en archivo y
el código para pasar el progreso entre dispositivos. El archivo `.nojekyll` es imprescindible para que
GitHub sirva los `.md` tal cual.

## 2. Sin paso de compilación ni dependencias npm

**Decisión.** El código del repositorio es exactamente el que se sirve. La única librería externa es
js-yaml (desde cdnjs, versión fija). `package.json` solo guarda atajos de comandos.
**Por qué.** Cualquiera puede abrir un archivo, cambiarlo y verlo funcionando, años después, sin que un
`npm install` falle. Menos piezas, menos cosas que se rompen.
**Descartado.** Frameworks (React, Vue…) y bundlers (Vite…): resuelven problemas que este proyecto no tiene
y añaden un paso que hay que mantener.
**Consecuencias.** Las herramientas propias (`herramientas/*.js`) usan solo la biblioteca estándar de Node.

## 3. Módulos ES por capas

**Contexto.** La primera versión eran cinco scripts clásicos que compartían el ámbito global
(`js/juego/01…05`). Funcionaba, pero cualquier función podía usar cualquier otra y era difícil saber
dónde tocar.
**Decisión.** Módulos ES nativos en `src/`, uno por responsabilidad, en capas con dependencias en un solo
sentido (config → util → contenido/servicios/arte → estado → dominio → ui → pantallas).
**Por qué.** Las importaciones dicen explícitamente de qué depende cada archivo; la lógica del juego queda
separada de la pantalla y se puede probar sola; ampliar es añadir archivos, no tocar uno enorme.
**Consecuencias.** El estado global se expone como *live bindings* con funciones `fijar…` para cambiarlo.
Las pruebas, que no ven variables globales, usan `window.Juego` (`src/depuracion.js`). El cambio se verificó
con capturas píxel a píxel de todas las pantallas antes y después, y con las mismas pruebas de siempre.

## 4. Navegación por registro de pantallas

**Decisión.** Cada pantalla se registra con un nombre (`registrarPantalla`) y se abre con `ir('nombre')`.
**Por qué.** Las pantallas se llaman unas a otras (casa → tienda → casa): importándose entre sí habría
dependencias circulares. Con el registro, ninguna pantalla importa a otra.
**Descartado.** Un router con URLs (`#/tienda`): la niña no navega con el botón atrás del navegador, y
volver a una partida a medias desde una URL no tiene sentido.

## 5. Un único estado guardado en localStorage

**Decisión.** Todo el progreso es un objeto JSON en una sola clave. Los campos nuevos se completan al
cargar con los valores de `estadoInicial()`.
**Por qué.** Simple de guardar, de copiar a un archivo y de juntar con otro dispositivo.
**Consecuencias.** Nunca se cambia `CLAVE_GUARDADO` ni se renombran campos guardados (por eso siguen
existiendo `perfil.alaya` y `perfil.lucia`). Las grabaciones de voz, que pesan, van aparte en IndexedDB.

## 6. Cuentos en Markdown con YAML

**Decisión.** Un libro es una carpeta con `libro.md` (el mundo) y `cap-XX.md` (escenas por nivel con
varias versiones), con variables que se sortean en cada partida.
**Por qué.** Se escriben con cualquier editor, sin saber programar; las variables y versiones hacen que
cada partida sea distinta y no se pueda resolver de memoria.
**Consecuencias.** Hace falta un validador (`herramientas/validar.py`) que sortee cientos de partidas para
encontrar frases que no encajan.

## 7. Dibujos generados con código

**Decisión.** Paisajes y personajes en SVG generado, con azar repetible por semilla. Mascotas y ayudantes
son emoji.
**Por qué.** No pesa (la web carga rápido y cabe sin conexión), cambia en cada partida y no hace falta
dibujar a mano cada escena.

## 8. Todo en español

**Decisión.** Código, comentarios, documentación y mensajes de commit en español.
**Por qué.** El juego y su familia son españoles, el dominio está en español (sílabas, artículos, «al/del»)
y quien lo mantenga debe poder leerlo sin traducir.

## 9. Nada de mensajes ni sonidos de error

**Decisión.** Ante un fallo de lectura o una respuesta equivocada, el juego anima («¡Casi!»), nunca
castiga. Tras tres intentos siempre se puede seguir.
**Por qué.** La niña tiene dislexia y le cuesta leer: el objetivo es que quiera volver a jugar.

## 10. Pruebas en un navegador real

**Decisión.** Además de pruebas unitarias en Node para la lógica pura, las pruebas importantes se
ejecutan en Chromium con Playwright y un micrófono simulado.
**Por qué.** Lo que más puede fallar (voz, pantalla, guardado, cuentos) solo se ve de verdad en un
navegador.

## 11. La arquitectura la vigila una herramienta

**Decisión.** `herramientas/arquitectura.js` falla en la CI si se rompe una regla: capas, ciclos,
importaciones que no existen, archivos o exportaciones sin documentar, hojas de estilo sin enlazar o
módulos fuera del catálogo.
**Por qué.** Las reglas que solo están escritas en un documento se olvidan; las que comprueba la CI, no.
