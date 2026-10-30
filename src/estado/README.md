# estado/ · el progreso

- [`almacen.js`](almacen.js): la forma del progreso (`@typedef Estado`), su valor inicial y la lectura y
  escritura en localStorage. **Todo campo nuevo necesita valor en `estadoInicial()`.**
- [`sesion.js`](sesion.js): el único estado global (`estado`, `catalogo`, `partida`) como *live bindings*
  con funciones `fijar…` / `reemplazarEstado` / `guardar`.

Importa de `config/` y `util/`. Detalles en la
[sección 5 de la arquitectura](../../docs/ARQUITECTURA.md#5-el-estado).
