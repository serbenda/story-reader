# contenido/ · de Markdown a texto

Todo lo que convierte los cuentos de `stories/` en texto listo para pintar, **sin tocar el DOM**:

1. [`catalogo.js`](catalogo.js) carga `stories/index.json` y cada libro.
2. [`escenas.js`](escenas.js) separa la cabecera YAML y parte el capítulo en escenas → niveles → versiones.
3. [`plantillas.js`](plantillas.js) rellena variables `{x}` y alternativas `{{dos|una}}`.
4. [`bloques.js`](bloques.js) parte el texto en bloques: texto, voz (`>`), pregunta (`?`).
5. [`silabas.js`](silabas.js) separa palabras en sílabas (para las sílabas de colores y la lectura por sílabas).

Solo importa de `util/`. Probado en `tests/unidad/contenido.test.js`.
