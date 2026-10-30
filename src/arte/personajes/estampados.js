/**
 * @file Estampados del vestido (se compran en la tienda).
 *
 * Capa: arte. Cada estampado es un <pattern> que se pinta encima del vestido.
 * Para añadir uno: un «else if» más con el mismo valor que en src/config/tienda.js.
 */
import { flor, estrellita } from './adornos.js';

let idPatron = 0;

/**
 * @param {string} [tipo]  «lunares», «rayas», «estrellas», «flores»; vacío o «liso» → nada.
 * @returns {string} <defs> con el patrón y la forma del vestido rellena con él.
 */
export function estampado(tipo) {
  if (!tipo || tipo === 'liso') return '';
  const id = 'est' + (++idPatron);
  let p;
  if (tipo === 'lunares') p = `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="#FFFFFF" opacity=".85"/><circle cx="11" cy="11" r="2.6" fill="#FFFFFF" opacity=".85"/></pattern>`;
  else if (tipo === 'rayas') p = `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="4" fill="#FFFFFF" opacity=".55"/></pattern>`;
  else if (tipo === 'estrellas') p = `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">${estrellita(6, 6, 4.5, '#FFE08A')}${estrellita(16, 15, 3.5, '#FFFFFF')}</pattern>`;
  else if (tipo === 'flores') p = `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse">${flor(7, 7, '#FFFFFF')}${flor(18, 18, '#F7B7C8')}</pattern>`;
  else return '';
  return `<defs>${p}</defs><path d="M44 90 Q60 84 76 90 L95 156 Q60 168 25 156 Z" fill="url(#${id})"/>`;
}
