/**
 * @file Deberes del cole: palabras y frases de la semana que pone la familia.
 *
 * Capa: dominio. El profe trabaja en clase lo mismo que manda de deberes, así
 * que lo que se ponga aquí pasa a ser lo primero en el dictado, el taller de
 * frases, la lectura repetida, las palabras mágicas y las cerraduras.
 */
import { estado } from '../estado/sesion.js';

/** Máximo de palabras y de frases que se guardan. */
const MAX_PALABRAS = 40;
const MAX_FRASES = 20;

/** @returns {import('../estado/almacen.js').Deberes} */
export const deberes = () => estado.deberes || { palabras: [], frases: [], actualizado: 0 };

/** ¿Hay deberes puestos? */
export const hayDeberes = () => deberes().palabras.length > 0 || deberes().frases.length > 0;

/**
 * Palabras de los deberes en minúsculas y sin signos (como las claves del registro).
 * @returns {string[]}
 */
export const palabrasDeDeberes = () => deberes().palabras.map((w) => w.toLowerCase().replace(/[^\p{L}]/gu, '')).filter((w) => w.length >= 2);

/** Frases de los deberes, tal cual. @returns {string[]} */
export const frasesDeDeberes = () => deberes().frases;

/**
 * Lee lo que escriben los mayores. Palabras: separadas por comas, espacios o
 * saltos de línea. Frases: una por línea (o separadas por punto). No guarda.
 * @param {string} textoPalabras
 * @param {string} textoFrases
 */
export function ponerDeberes(textoPalabras, textoFrases) {
  const palabras = [...new Set(String(textoPalabras).split(/[\s,;]+/).map((w) => w.trim()).filter((w) => /\p{L}/u.test(w)))].slice(0, MAX_PALABRAS);
  const frases = String(textoFrases).split(/\n+|(?<=[.!?])\s+/).map((f) => f.trim()).filter((f) => /\p{L}/u.test(f))
    .map((f) => (/[.!?…]$/.test(f) ? f : f + '.')).map((f) => f.charAt(0).toUpperCase() + f.slice(1)).slice(0, MAX_FRASES);
  estado.deberes = { palabras, frases, actualizado: Date.now() };
}

/** Quita los deberes. No guarda. */
export function borrarDeberes() {
  estado.deberes = { palabras: [], frases: [], actualizado: Date.now() };
}
