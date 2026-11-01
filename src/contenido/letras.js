/**
 * @file Letras que se confunden con facilidad en la dislexia.
 *
 * Capa: contenido. Lo usan las cerraduras mágicas (src/dominio/cerraduras.js)
 * y el dictado (./dictado.js) para fabricar opciones «trampa» parecidas.
 * Añade un grupo para practicar otras confusiones.
 */

/** Grupos de letras que se confunden por su forma o su sonido. */
export const GRUPOS_LETRAS = Object.freeze([['b', 'd', 'p', 'q'], ['m', 'n', 'u']]);

/** Vocales (con y sin tilde). */
export const ES_VOCAL = /[aeiouáéíóú]/;

/**
 * Grupo al que pertenece una letra, si se confunde con otras.
 * @param {string} c
 * @returns {string[]|undefined}
 */
export const grupoDe = (c) => GRUPOS_LETRAS.find((g) => g.includes(c));
