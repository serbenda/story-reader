# config/ · datos del juego

Valores fijos que ajustan el juego **sin tocar la lógica**: niveles y tolerancias del micro
([`niveles.js`](niveles.js)), estrellas, metas y límites ([`recompensas.js`](recompensas.js)), lo que se
vende ([`tienda.js`](tienda.js)), colores y opciones para vestir ([`apariencia.js`](apariencia.js)) y frases
de ánimo ([`mensajes.js`](mensajes.js)).

- Importa siempre desde [`index.js`](index.js): `import { NIVELES, ESTRELLAS } from '../config/index.js'`.
- No importa nada. Son datos congelados (`Object.freeze`).
- Las mascotas y los cuentos no están aquí: son contenido, en `stories/`.
