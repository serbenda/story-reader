# tests/

| Pruebas | Qué cubren | Uso |
|---|---|---|
| [`unidad/`](unidad) | Lógica pura en Node: plantillas, alternativas, bloques, escenas, sílabas, comparación de voz, utilidades, arte, coherencia de la configuración, frases (ordenar, completar, diálogos, velocidad) y dictado | `node --test "tests/unidad/*.test.js"` |
| [`partidas.py`](partidas.py) | Extremo a extremo en Chromium con micrófono simulado: nombres, una o dos niñas, tienda, sílabas, regla, meta y racha, grabación, copia de seguridad, código de progreso, informe, deberes, dictado, taller, lectura relámpago, mi frase, velocidad lectora y una partida completa de cada libro con sus preguntas del detective | `python tests/partidas.py [--rapido]` |

Las pruebas en navegador entran al juego por `window.Juego` (ver `src/depuracion.js`). Todas se ejecutan en
cada PR.
