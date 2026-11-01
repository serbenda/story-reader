/**
 * @file Dictado con fichas de sílabas y corrección de lo escrito con teclado.
 *
 * Capa: contenido. Para cada palabra se dan sus sílabas y algunas «trampa»
 * parecidas (b/d, p/q, m/n, sílaba invertida: pla → pal), que son justo las
 * confusiones que hay que entrenar. Probado en tests/unidad/lectoescritura.test.js.
 */
import { barajar, azar } from '../util/azar.js';
import { silabas } from './silabas.js';
import { grupoDe, ES_VOCAL } from './letras.js';

/** Quita tildes y pasa a minúsculas. */
export const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Sílabas parecidas a una dada, que sirven de trampa.
 * @param {string} s
 * @returns {string[]}
 */
export function silabasParecidas(s) {
  const out = new Set();
  [...s].forEach((c, i) => {
    const g = grupoDe(c.toLowerCase());
    if (g) for (const otra of g) if (otra !== c) out.add(s.slice(0, i) + otra + s.slice(i + 1));
  });
  // Inversión consonante-vocal: «bra» → «bar», «la» → «al»
  if (s.length >= 2 && !ES_VOCAL.test(s[0]) && ES_VOCAL.test(s[s.length - 1])) out.add(s.slice(0, -2) + s[s.length - 1] + s[s.length - 2]);
  if (s.length === 3 && !ES_VOCAL.test(s[0]) && !ES_VOCAL.test(s[1])) out.add(s[0] + s[2] + s[1]);   // bra → bar
  out.delete(s);
  return [...out];
}

/**
 * @typedef {object} FichasDictado
 * @property {string} palabra
 * @property {string[]} silabas  En orden.
 * @property {string[]} fichas   Sílabas y trampas, barajadas.
 */

/**
 * Prepara las fichas para dictar una palabra.
 * @param {string} palabra   En minúsculas.
 * @param {number} [trampas=2]
 * @returns {FichasDictado}
 */
export function fichasDeDictado(palabra, trampas = 2) {
  const sils = silabas(palabra);
  const candidatas = barajar([...new Set(sils.flatMap(silabasParecidas))].filter((x) => !sils.includes(x)));
  const falsas = candidatas.slice(0, trampas);
  // Si no hay parecidas, una sílaba de la propia palabra con la vocal cambiada
  while (falsas.length < trampas) {
    const base = azar(sils), vocales = 'aeiou';
    const cambiada = base.replace(/[aeiou]/, (v) => vocales[(vocales.indexOf(v) + 1 + falsas.length) % 5]);
    if (!sils.includes(cambiada) && !falsas.includes(cambiada)) falsas.push(cambiada); else break;
  }
  return { palabra, silabas: sils, fichas: barajar([...sils, ...falsas]) };
}

/**
 * @typedef {object} Correccion
 * @property {boolean} bien        Igual (sin contar mayúsculas ni espacios de más).
 * @property {boolean} soloTildes  Bien salvo alguna tilde.
 * @property {boolean[]} palabras  Por cada palabra correcta: ¿está bien escrita?
 */

/**
 * Corrige lo escrito con teclado frente a lo dictado.
 * @param {string} escrito
 * @param {string} correcto
 * @returns {Correccion}
 */
export function corregirEscrito(escrito, correcto) {
  const limpiar = (s) => String(s).toLowerCase().replace(/[.,;:!¡?¿«»"]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const a = limpiar(escrito), b = limpiar(correcto);
  const palabras = b.map((w, i) => a[i] === w);
  const bien = a.length === b.length && palabras.every(Boolean);
  const soloTildes = !bien && a.length === b.length && b.every((w, i) => sinTildes(a[i]) === sinTildes(w));
  return { bien, soloTildes, palabras };
}
