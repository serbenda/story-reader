# ui/ · piezas de interfaz

Lo que pintan y usan varias pantallas:

- [`navegacion.js`](navegacion.js): `registrarPantalla`, `ir`, `irA` y el contenedor `app`.
- [`avisos.js`](avisos.js): avisos, confeti y capas (nunca `alert`).
- [`palabras.js`](palabras.js): texto de lectura con palabras tocables, sílabas de colores y pistas.
- [`voz-alta.js`](voz-alta.js): decir palabras (con la voz de la familia si existe) y leerlas por sílabas.
- [`interacciones.js`](interacciones.js): toques globales (palabras, regla, personajes, tesoros).
- [`escenario.js`](escenario.js) · [`cabecera.js`](cabecera.js) · [`ajustes-visuales.js`](ajustes-visuales.js).
- [`componentes/`](componentes): meta del día, puerta de mayores, opciones, grabaciones, gráfico, copiar.

Puede importar de todas las capas salvo `pantallas/`.
