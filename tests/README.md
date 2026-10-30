# tests/

| Pruebas | Qué cubren | Uso |
|---|---|---|
| [`unidad/`](unidad) | Lógica pura en Node: plantillas, alternativas, bloques, escenas, sílabas, comparación de voz, utilidades, arte y coherencia de la configuración | `node --test "tests/unidad/*.test.js"` |
| [`partidas.py`](partidas.py) | Extremo a extremo en Chromium con micrófono simulado: nombres, una o dos niñas, tienda, sílabas, regla, meta y racha, grabación, copia de seguridad, código de progreso, informe y una partida completa de cada libro | `python tests/partidas.py [--rapido]` |

Las pruebas en navegador entran al juego por `window.Juego` (ver `src/depuracion.js`). Todas se ejecutan en
cada PR.
