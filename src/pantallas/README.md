# pantallas/ · una por pantalla

Cada archivo pinta una pantalla en `app` y se registra con `registrarPantalla('nombre', fn)`; se abre con
`ir('nombre', …)`. **Una pantalla no importa otra** (lo vigila la CI): así no hay ciclos.

| Archivo | Pantalla |
|---|---|
| [`bienvenida.js`](bienvenida.js) | La primera vez |
| [`personalizar.js`](personalizar.js) | Elegir y vestir a las protagonistas y la mascota |
| [`inicio.js`](inicio.js) | Casa y estantería |
| [`libro.js`](libro.js) | Capítulos de un libro |
| [`partida/`](partida) | El capítulo en juego: controlador ([`index.js`](partida/index.js)), una tarjeta por tipo de bloque, cuaderno y final |
| [`tienda.js`](tienda.js) · [`album.js`](album.js) | Tienda y álbum |
| [`ajustes.js`](ajustes.js) · [`informe.js`](informe.js) | Para mayores |

[`index.js`](index.js) las importa todas. Para una pantalla nueva, mira la
[receta](../../CONTRIBUTING.md#una-pantalla-nueva).
