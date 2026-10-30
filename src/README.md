# src/ · el juego

Todo el código del juego, en **módulos ES nativos** sin compilar. `index.html` carga solo
[`main.js`](main.js), que importa lo demás. Cada carpeta es una **capa**: una capa solo importa de las de
más abajo en esta lista (y de sí misma).

| Capa | Para qué | Puede importar de |
|---|---|---|
| [`pantallas/`](pantallas) | Una pantalla por archivo (no se importan entre sí: navegan con `ir()`) | todo lo de abajo |
| [`ui/`](ui) | Piezas de interfaz reutilizables | dominio, estado, contenido, servicios, arte, config, util |
| [`dominio/`](dominio) | Reglas del juego, sin pantalla | estado, contenido, config, util |
| [`estado/`](estado) | Progreso guardado y sesión | config, util |
| [`arte/`](arte) | Dibujos SVG con código | util |
| [`servicios/`](servicios) | APIs del navegador: voz, audio, almacenamiento | util, config |
| [`contenido/`](contenido) | Cuentos: carga, plantillas, bloques, sílabas | util |
| [`util/`](util) | Ayudas genéricas | — |
| [`config/`](config) | Datos fijos del juego | — |

Además: [`main.js`](main.js) (arranque) y [`depuracion.js`](depuracion.js) (`window.Juego` para las pruebas).

Las reglas las vigila `node herramientas/arquitectura.js`. La explicación completa, con diagramas, está en
[docs/ARQUITECTURA.md](../docs/ARQUITECTURA.md).
