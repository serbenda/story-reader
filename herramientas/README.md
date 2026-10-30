# herramientas/

| Herramienta | Para qué | Uso |
|---|---|---|
| [`arquitectura.js`](arquitectura.js) | Vigila importaciones, capas, ciclos, documentación, estilos y catálogo | `node herramientas/arquitectura.js` |
| [`recursos-sin-conexion.js`](recursos-sin-conexion.js) | Genera la lista de archivos y la versión de `sw.js` | `npm run preparar` · `--comprobar` en CI |
| [`validar.py`](validar.py) | Sortea cientos de partidas de cada libro y busca frases que no encajan | `python herramientas/validar.py <libro\|todos> [--muestras]` |

Las de Node no necesitan instalar nada. `validar.py` necesita Playwright (ver
[CONTRIBUTING.md](../CONTRIBUTING.md#preparar-el-entorno)).
