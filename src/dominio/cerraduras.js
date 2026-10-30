/**
 * @file Cerraduras mágicas: minijuegos para las confusiones típicas de la dislexia.
 *
 * Capa: dominio. Dos tipos:
 *   «letra»   → falta una letra que se confunde por su forma (b d p q, m n u): ¿cuál es?
 *   «escrita» → tres versiones de una palabra; solo una está bien escrita
 *               (las falsas cambian una letra parecida o invierten una sílaba: pla → pal).
 * Las palabras salen del texto de la escena y de las que le cuestan.
 */
import { limpiarPistas } from '../contenido/bloques.js';
import { azar, barajar } from '../util/azar.js';
import { claveDePalabra, nombresPropios, palabrasDificiles } from './registro-lectura.js';

/** Letras que se confunden entre sí. Añade un grupo para practicar otras. */
export const GRUPOS_LETRAS = Object.freeze([['b', 'd', 'p', 'q'], ['m', 'n', 'u']]);
const ES_VOCAL = /[aeiouáéíóú]/;
const LARGO = { min: 4, max: 10 };

/** @param {string} c @returns {string[]|undefined} */
const grupoDe = (c) => GRUPOS_LETRAS.find((g) => g.includes(c));

/**
 * @typedef {object} Reto
 * @property {'letra'|'escrita'} tipo
 * @property {string} palabra
 * @property {number} [hueco]  Posición de la letra que falta (tipo «letra»).
 * @property {string[]} opciones
 * @property {string} correcta
 */

/**
 * Palabras candidatas: de 4 a 10 letras, sin nombres propios.
 * @param {string[]} textos
 * @returns {string[]}
 */
export function palabrasParaReto(textos) {
  const propios = nombresPropios(), lista = new Set();
  const anadir = (w) => { const k = claveDePalabra(w); if (k.length >= LARGO.min && k.length <= LARGO.max && !propios.has(k)) lista.add(k); };
  for (const t of textos) for (const w of limpiarPistas(t).split(/\s+/)) anadir(w);
  for (const [w] of palabrasDificiles().slice(0, 8)) anadir(w);
  return [...lista];
}

/**
 * Crea un reto con las palabras de los textos, o null si ninguna sirve.
 * @param {string[]} textos  Textos de la escena.
 * @returns {Reto|null}
 */
export function crearReto(textos) {
  const candidatas = barajar(palabrasParaReto(textos));
  for (const tipo of barajar(['letra', 'escrita'])) {
    for (const w of candidatas) {
      const posiciones = [...w].map((c, i) => (grupoDe(c) ? i : -1)).filter((i) => i >= 0);
      if (tipo === 'letra') {
        if (!posiciones.length) continue;
        const i = azar(posiciones);
        return { tipo, palabra: w, hueco: i, opciones: barajar(grupoDe(w[i])), correcta: w[i] };
      }
      const falsas = new Set();
      // 1) una letra parecida cambiada
      for (const i of barajar(posiciones)) { falsas.add(w.slice(0, i) + azar(grupoDe(w[i]).filter((c) => c !== w[i])) + w.slice(i + 1)); break; }
      // 2) una sílaba invertida (consonante + vocal → vocal + consonante)
      const inversiones = [];
      for (let i = 1; i < w.length - 1; i++) if (!ES_VOCAL.test(w[i]) && ES_VOCAL.test(w[i + 1])) inversiones.push(i);
      for (const i of barajar(inversiones)) { const f = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); if (f !== w) { falsas.add(f); break; } }
      // 3) si faltan, dos letras seguidas intercambiadas
      for (let i = 0; i < w.length - 1 && falsas.size < 2; i++) { const f = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); if (f !== w) falsas.add(f); }
      falsas.delete(w);
      if (falsas.size < 2) continue;
      return { tipo, palabra: w, opciones: barajar([w, ...[...falsas].slice(0, 2)]), correcta: w };
    }
  }
  return null;
}
