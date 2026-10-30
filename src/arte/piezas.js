/**
 * @file Piezas de dibujo reutilizables para los paisajes (árboles, nubes, flores…).
 *
 * Capa: arte. Cada función devuelve un trozo de SVG como texto. Los paisajes
 * las usan así: `import * as P from '../piezas.js'` → `P.arbol(...)`.
 * Si dibujas algo que podría servir en más de un paisaje, ponlo aquí.
 */
import { redondear1 as n } from '../util/numeros.js';

let idGrad = 0;

/**
 * Id único para una definición SVG (degradados, máscaras…). Hace falta
 * porque varios dibujos conviven en la misma página y los id no pueden repetirse.
 * @param {string} prefijo
 * @returns {string}
 */
export const nuevoId = (prefijo) => prefijo + (++idGrad);

/**
 * Degradado lineal. Devuelve su id (para fill="url(#id)") y la definición para <defs>.
 * @param {string} a Color de arriba (o izquierda).
 * @param {string} b Color de abajo (o derecha).
 * @param {boolean} [vertical=true]
 * @returns {{id: string, def: string}}
 */
export function grad(a, b, vertical = true) {
  const id = nuevoId('g');
  const fin = vertical ? 'x2="0" y2="1"' : 'x2="1" y2="0"';
  return { id, def: `<linearGradient id="${id}" x1="0" y1="0" ${fin}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` };
}

/**
 * Nube de tres óvalos. @param {number} x @param {number} y @param {number} [s=1] Escala.
 */
export function nube(x, y, s = 1) {
  return `<g fill="#FFFFFF" opacity=".92"><ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(52 * s)}" ry="${n(18 * s)}"/><ellipse cx="${n(x + 26 * s)}" cy="${n(y - 12 * s)}" rx="${n(32 * s)}" ry="${n(20 * s)}"/><ellipse cx="${n(x - 24 * s)}" cy="${n(y - 6 * s)}" rx="${n(24 * s)}" ry="${n(15 * s)}"/></g>`;
}

/**
 * Sol con halo. @param {number} x @param {number} y @param {number} [r=42] Radio.
 */
export function sol(x, y, r = 42) {
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${r + 24}" fill="#FFE59A" opacity=".35"/><circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="#F6C343"/>`;
}

/**
 * Flor de seis pétalos. @param {number} x @param {number} y @param {number} [r=6] @param {string} [petalo] @param {string} [centro]
 */
export function flor(x, y, r = 6, petalo = '#FFFFFF', centro = '#F2B33D') {
  let s = '';
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += `<circle cx="${n(x + r * Math.cos(a))}" cy="${n(y + r * Math.sin(a))}" r="${n(r * .62)}" fill="${petalo}"/>`; }
  return s + `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * .55)}" fill="${centro}"/>`;
}

/**
 * Copa de árbol hecha de círculos, con luz y sombra. @param {number} x @param {number} y @param {number} r @param {string} c1 Color principal. @param {string} c2 Sombra.
 */
export function copa(x, y, r, c1, c2) {
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${c1}"/><circle cx="${n(x - r * .7)}" cy="${n(y + r * .25)}" r="${n(r * .72)}" fill="${c1}"/><circle cx="${n(x + r * .7)}" cy="${n(y + r * .2)}" r="${n(r * .75)}" fill="${c1}"/><circle cx="${n(x + r * .25)}" cy="${n(y + r * .45)}" r="${n(r * .6)}" fill="${c2}"/><circle cx="${n(x - r * .35)}" cy="${n(y - r * .35)}" r="${n(r * .35)}" fill="#FFFFFF" opacity=".12"/>`;
}

/**
 * Árbol de hoja ancha. @param {number} x @param {number} suelo Altura del suelo. @param {number} alto Altura del tronco. @param {number} r Radio de la copa.
 */
export function arbol(x, suelo, alto, r, tronco = '#7A5236', c1 = '#4E8F57', c2 = '#3B7346') {
  const w = r * .32;
  return `<path d="M${n(x - w / 2)} ${suelo} L${n(x - w / 2.6)} ${n(suelo - alto)} L${n(x + w / 2.6)} ${n(suelo - alto)} L${n(x + w / 2)} ${suelo} Z" fill="${tronco}"/>` + copa(x, suelo - alto - r * .3, r, c1, c2);
}

/**
 * Pino de tres pisos. @param {number} x @param {number} suelo @param {number} alto @param {number} ancho
 */
export function pino(x, suelo, alto, ancho, c = '#3D7A4A', t = '#6B4630') {
  let s = `<rect x="${n(x - ancho * .07)}" y="${n(suelo - alto * .2)}" width="${n(ancho * .14)}" height="${n(alto * .2)}" fill="${t}"/>`;
  for (let i = 0; i < 3; i++) {
    const y0 = suelo - alto * .15 - i * alto * .27, a = ancho * (1 - i * .22);
    s += `<path d="M${n(x - a / 2)} ${n(y0)} L${n(x)} ${n(y0 - alto * .42)} L${n(x + a / 2)} ${n(y0)} Z" fill="${c}"/>`;
  }
  return s;
}

/**
 * Seta con lunares. @param {number} x @param {number} y @param {number} [s=1] @param {string} [c] Color del sombrero.
 */
export function seta(x, y, s = 1, c = '#D9496C') {
  return `<rect x="${n(x - 4 * s)}" y="${n(y - 14 * s)}" width="${n(8 * s)}" height="${n(14 * s)}" rx="${n(3 * s)}" fill="#FFF3DD"/><path d="M${n(x - 14 * s)} ${n(y - 12 * s)} Q${n(x)} ${n(y - 34 * s)} ${n(x + 14 * s)} ${n(y - 12 * s)} Z" fill="${c}"/><circle cx="${n(x - 5 * s)}" cy="${n(y - 19 * s)}" r="${n(2.4 * s)}" fill="#FFFFFF"/><circle cx="${n(x + 5 * s)}" cy="${n(y - 22 * s)}" r="${n(2 * s)}" fill="#FFFFFF"/>`;
}

/**
 * Mata de hierba. @param {number} x @param {number} y @param {string} [c] @param {number} [s=1]
 */
export function hierba(x, y, c = '#5E9E48', s = 1) {
  return `<path d="M${n(x - 8 * s)} ${n(y)} Q${n(x - 6 * s)} ${n(y - 14 * s)} ${n(x - 2 * s)} ${n(y - 18 * s)} Q${n(x - s)} ${n(y - 8 * s)} ${n(x)} ${n(y)} Q${n(x + 2 * s)} ${n(y - 16 * s)} ${n(x + 7 * s)} ${n(y - 20 * s)} Q${n(x + 5 * s)} ${n(y - 8 * s)} ${n(x + 8 * s)} ${n(y)} Z" fill="${c}"/>`;
}

/**
 * Mariposa. @param {number} x @param {number} y @param {string} [c] @param {number} [s=1]
 */
export function mariposa(x, y, c = '#5FA8CF', s = 1) {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${s})"><ellipse cx="-7" cy="-4" rx="8" ry="6" fill="${c}"/><ellipse cx="7" cy="-4" rx="8" ry="6" fill="${c}"/><ellipse cx="-5" cy="5" rx="5" ry="4" fill="${c}"/><ellipse cx="5" cy="5" rx="5" ry="4" fill="${c}"/><rect x="-1.2" y="-8" width="2.4" height="16" rx="1.2" fill="#2E2A3B"/></g>`;
}

/**
 * Piedra con brillo. @param {number} x @param {number} y @param {number} r @param {string} [c] @param {string} [brillo]
 */
export function piedra(x, y, r, c = '#9A9AA6', brillo = '#C2C2CC') {
  return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r)}" ry="${n(r * .6)}" fill="${c}"/><ellipse cx="${n(x - r * .3)}" cy="${n(y - r * .2)}" rx="${n(r * .4)}" ry="${n(r * .2)}" fill="${brillo}"/>`;
}
