/**
 * @file Parte el texto de una escena (ya rellenado) en bloques.
 *
 * Capa: contenido. Cada línea no vacía es un bloque:
 *
 *   > frase             → «voz»: hay que leerla en voz alta para seguir
 *   ? pregunta          → «pregunta», con las opciones de las líneas siguientes:
 *   * opción buena
 *   - opción mala          (sin opciones, el juego pregunta por los lugares)
 *   cualquier otra      → «texto» normal
 *
 * Dentro de cualquier texto, [[así]] marca una pista para el cuaderno.
 */
import { capitalizar } from './plantillas.js';

/**
 * @typedef {object} Opcion
 * @property {string} texto
 * @property {boolean} correcta
 */

/**
 * @typedef {object} Bloque
 * @property {'texto'|'voz'|'pregunta'|'reto'} tipo  («reto» lo añade la partida, no el cuento)
 * @property {string} texto
 * @property {Opcion[]} [opciones]  Solo en las preguntas.
 */

/**
 * @param {string} texto
 * @returns {Bloque[]}
 */
export function bloques(texto) {
  const out = [];
  for (const raw of texto.split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    if (/^>\s?/.test(l)) { out.push({ tipo: 'voz', texto: l.replace(/^>\s?/, '') }); continue; }
    if (/^\?\s+/.test(l)) { out.push({ tipo: 'pregunta', texto: l.replace(/^\?\s+/, ''), opciones: [] }); continue; }
    const ultimo = out[out.length - 1];
    if (/^[*-]\s+/.test(l) && ultimo && ultimo.tipo === 'pregunta') {
      ultimo.opciones.push({ texto: capitalizar(l.replace(/^[*-]\s+/, '')), correcta: l[0] === '*' });
      continue;
    }
    out.push({ tipo: 'texto', texto: l });
  }
  return out;
}

/**
 * Quita las marcas de pista [[ ]] dejando el texto.
 * @param {string} t
 * @returns {string}
 */
export const limpiarPistas = (t) => t.replace(/\[\[|\]\]/g, '');

/**
 * Las pistas marcadas con [[ ]], con mayúscula inicial.
 * @param {string} t
 * @returns {string[]}
 */
export const pistasDe = (t) => [...t.matchAll(/\[\[(.+?)\]\]/g)].map((m) => capitalizar(m[1]));
