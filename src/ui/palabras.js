/**
 * @file Texto de lectura: palabras que se tocan para oírlas, sílabas de colores y pistas.
 *
 * Capa: ui. Todo texto que la niña tiene que leer pasa por {@link palabras}:
 *   - cada palabra va en <span class="palabra"> (al tocarla se oye, ver ./interacciones.js);
 *   - con «sílabas de colores» activado, cada sílaba alterna color (ma·ri·po·sa);
 *   - las pistas [[así]] se resaltan con una lupa.
 */
import { estado } from '../estado/sesion.js';
import { esc } from '../util/dom.js';
import { silabas, partesDePalabra } from '../contenido/silabas.js';

/**
 * Una palabra (con sus signos) en HTML, con sílabas de colores si están activadas.
 * @param {string} token
 * @returns {string}
 */
export function htmlPalabra(token) {
  const [antes, letras, despues] = partesDePalabra(token);
  if (!letras || !estado.ajustes.silabas) return esc(token);
  return esc(antes) + silabas(letras).map((s, i) => `<span class="sil s${i % 2}">${esc(s)}</span>`).join('') + esc(despues);
}

/**
 * Texto con sílabas de colores pero sin palabras tocables (para botones).
 * @param {string} texto
 * @returns {string}
 */
export const htmlTexto = (texto) => String(texto).split(/(\s+)/).map((t) => (/^\s*$/.test(t) ? t : htmlPalabra(t))).join('');

/**
 * Texto de lectura con palabras tocables y pistas resaltadas.
 * @param {string} texto
 * @returns {string}
 */
export function palabras(texto) {
  return String(texto).split(/\[\[(.+?)\]\]/).map((trozo, i) => {
    const html = trozo.split(/(\s+)/).map((t) => (!t || /^\s+$/.test(t)) ? t : `<span class="palabra">${htmlPalabra(t)}</span>`).join('');
    return i % 2 ? `<mark class="pista"><span class="lupa" aria-hidden="true">🔎</span>${html}</mark>` : html;
  }).join('');
}
