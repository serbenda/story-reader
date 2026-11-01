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

/** Palabras de un texto (sin contar signos ni marcas de pista). */
const palabrasDe = (t) => (t.replace(/\[\[|\]\]/g, '').match(/[\p{L}\p{N}]+/gu) || []).length;

/** Margen por encima del objetivo que se acepta al sumar frases (para no cortar una frase a medias). */
const MARGEN_LECTURA = 1.3;

/**
 * Alarga las lecturas en voz alta hasta el largo del nivel: a cada bloque
 * «voz» más corto que el objetivo se le suman las líneas de texto que vienen
 * justo después (y, si no hay, las de justo antes), sin pasar de un margen.
 * Las preguntas y otras lecturas cortan la suma. No modifica la lista original.
 * @example ampliarLecturas(bloques('Hola.\n> Lee esto.\nY esto otro.'), 6)
 *   // [{tipo:'texto', texto:'Hola.'}, {tipo:'voz', texto:'Lee esto. Y esto otro.'}]
 * @param {Bloque[]} lista
 * @param {number} objetivo  Palabras por lectura (PALABRAS_POR_LECTURA del nivel).
 * @returns {Bloque[]}
 */
export function ampliarLecturas(lista, objetivo) {
  const out = lista.map((b) => ({ ...b }));
  const minimo = objetivo * 0.75, maximo = objetivo * MARGEN_LECTURA;
  for (let i = 0; i < out.length; i++) {
    const b = out[i];
    if (b.tipo !== 'voz') continue;
    let n = palabrasDe(b.texto);
    while (n < minimo && out[i + 1] && out[i + 1].tipo === 'texto' && n + palabrasDe(out[i + 1].texto) <= maximo) {
      n += palabrasDe(out[i + 1].texto);
      b.texto += ' ' + out[i + 1].texto;
      out.splice(i + 1, 1);
    }
    while (n < minimo && out[i - 1] && out[i - 1].tipo === 'texto' && n + palabrasDe(out[i - 1].texto) <= maximo) {
      n += palabrasDe(out[i - 1].texto);
      b.texto = out[i - 1].texto + ' ' + b.texto;
      out.splice(i - 1, 1);
      i--;
    }
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
