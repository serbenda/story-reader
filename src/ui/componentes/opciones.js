/**
 * @file Controles de elección: muestras de color, chips e interruptores.
 *
 * Capa: ui. Solo generan HTML; quien los usa conecta los eventos buscando sus
 * atributos data-* (data-campo/data-valor, data-ajuste, data-interruptor…).
 */
import { esc } from '../../util/dom.js';
import { ARTICULOS_TIENDA } from '../../config/index.js';
import { comprado } from '../../dominio/tienda.js';

/**
 * Botones redondos de color.
 * @param {string} campo           Valor de data-campo.
 * @param {readonly string[]} valores  Colores.
 * @param {string} actual
 * @param {readonly string[]} [nombres]  Nombres accesibles (por defecto, el propio color).
 * @returns {string}
 */
export const muestras = (campo, valores, actual, nombres) => valores.map((v, i) =>
  `<button class="muestra${v === actual ? ' elegida' : ''}" data-campo="${campo}" data-valor="${esc(v)}" style="--c:${esc(v)}" aria-label="${esc(nombres ? nombres[i] : v)}" aria-pressed="${v === actual}"></button>`).join('');

/**
 * Chips de un ajuste de «Para mayores».
 * @param {string} campo  Clave en estado.ajustes (data-ajuste).
 * @param {Record<string, string>} valores  valor → texto.
 * @param {string} actual
 * @returns {string}
 */
export const chipsAjuste = (campo, valores, actual) => Object.entries(valores).map(([k, v]) =>
  `<button class="chip${k === actual ? ' elegida' : ''}" data-ajuste="${campo}" data-valor="${k}" aria-pressed="${k === actual}">${esc(v)}</button>`).join('');

/**
 * Interruptor (checkbox con aspecto de palanca) de un ajuste.
 * @param {string} campo  Clave en estado.ajustes (data-interruptor).
 * @param {string} texto
 * @param {boolean} activo
 * @returns {string}
 */
export const interruptor = (campo, texto, activo) =>
  `<label class="interruptor"><input type="checkbox" id="aj-${campo}" data-interruptor="${campo}" ${activo ? 'checked' : ''}><span class="pista-int" aria-hidden="true"></span>${esc(texto)}</label>`;

/**
 * Chips de complementos o estampados: los gratis, los comprados y, con candado, los de la tienda.
 * @param {'accesorio'|'estampado'} tipo
 * @param {Record<string, string>} gratis  valor → nombre.
 * @param {string} actual
 * @returns {string}
 */
export function chipsConTienda(tipo, gratis, actual) {
  const libres = Object.entries(gratis).map(([k, nom]) =>
    `<button class="chip${actual === k ? ' elegida' : ''}" data-campo="${tipo}" data-valor="${k}" aria-pressed="${actual === k}">${esc(nom)}</button>`);
  const corto = (t) => esc(t.nombre.replace(/^Vestido de /, ''));
  const deTienda = ARTICULOS_TIENDA.filter((t) => t.tipo === tipo).map((t) => comprado(t.id)
    ? `<button class="chip${actual === t.valor ? ' elegida' : ''}" data-campo="${tipo}" data-valor="${t.valor}" aria-pressed="${actual === t.valor}">✨ ${corto(t)}</button>`
    : `<button class="chip chip-bloqueada" data-bloqueado="${t.precio}">${corto(t)}<span class="candado">🔒 ${t.precio}</span></button>`);
  return libres.concat(deTienda).join('');
}
