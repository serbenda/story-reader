/**
 * @file Estrellas que se ganan, meta diaria y límites del registro.
 *
 * Capa: config. Todas las cifras de premios del juego están aquí, para
 * equilibrarlas de un vistazo.
 */

/** Estrellas por cada acción. */
export const ESTRELLAS = Object.freeze({
  frase: 1,           // leer una frase en voz alta
  pregunta: 1,        // acertar una pregunta a la primera
  cerradura: 1,       // abrir una cerradura a la primera
  meta: 3,            // cumplir la meta del día
  cofre: 15           // cumplir la meta 5 días en una semana
});

/** Días de la semana con la meta cumplida para abrir el cofre. */
export const DIAS_PARA_COFRE = 5;

/**
 * @typedef {object} Meta
 * @property {string} nombre  Texto del botón.
 * @property {number} [min]   Minutos de lectura. Sin «min», la meta es terminar un capítulo.
 */

/** Metas diarias que pueden elegir los mayores. @type {Readonly<Record<string, Meta>>} */
export const METAS = Object.freeze({
  m5: { nombre: '5 minutos', min: 5 },
  m10: { nombre: '10 minutos', min: 10 },
  m15: { nombre: '15 minutos', min: 15 },
  cap: { nombre: '1 capítulo' }
});

/** Meta por defecto. */
export const META_INICIAL = 'm10';

/** Partidas que se guardan como máximo en el registro (las más antiguas se descartan). */
export const MAX_PARTIDAS_REGISTRO = 300;

/** Segundos máximos que cuenta una escena (por si se deja la tablet encendida). */
export const MAX_SEGUNDOS_ESCENA = 600;
