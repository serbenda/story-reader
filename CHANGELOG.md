# Cambios

Lo importante de cada versión. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [2.0.0] · 2026-10-30

Reorganización completa del código. **Para la niña no cambia nada**: el juego se ve y se comporta igual
(comprobado con capturas píxel a píxel de todas las pantallas y con todas las pruebas), y el progreso
guardado se conserva.

### Cambiado
- El juego pasa de cinco scripts con variables compartidas (`js/`) a **86 módulos ES** en `src/`,
  organizados en capas: `config`, `util`, `contenido`, `servicios`, `arte`, `estado`, `dominio`, `ui` y
  `pantallas`. Ver [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).
- Las reglas del juego (`src/dominio/`) ya no tocan la pantalla; avisan con eventos.
- Las pantallas navegan con `ir('nombre')` en lugar de llamarse unas a otras.
- Los paisajes, separados por mundos (`src/arte/paisajes/`), y los personajes en sus propios archivos.
- El CSS, dividido en `css/base/`, `css/componentes/` y `css/pantallas/`, con `css/estilos.css` como índice.
- La lista de archivos sin conexión de `sw.js` y su versión se generan solas (`npm run preparar`).
- Las pruebas en navegador acceden al juego por `window.Juego.modulos`.

### Añadido
- `herramientas/arquitectura.js`: vigila capas, ciclos, importaciones, documentación y estilos.
- Pruebas unitarias en `tests/unidad/` (71 pruebas, con el ejecutor de Node, sin instalar nada).
- `package.json` con atajos: `comprobar`, `validar`, `partidas`, `preparar`, `servir`.
- Documentación: [arquitectura](docs/ARQUITECTURA.md), [decisiones](docs/DECISIONES.md),
  [cómo contribuir](CONTRIBUTING.md) con recetas, un README en cada capa de `src/`, en `herramientas/` y en `tests/`, y JSDoc en todas
  las funciones exportadas.
- `.editorconfig`.

### Arreglado
- En el álbum, con una sola protagonista ya no aparece dibujada la hermana.

## [1.x] · hasta octubre de 2026

Seis libros, cuatro niveles, lectura en voz alta con micrófono, cerraduras mágicas, palabras mágicas,
sílabas de colores, regla de lectura, voz de la familia, meta diaria con racha y cofre, tienda, álbum,
informe para mayores, copia de seguridad, código para pasar el progreso, una o dos protagonistas con
nombres a elegir, modo sin conexión e instalación como app.
