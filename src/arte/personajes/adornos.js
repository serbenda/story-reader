/**
 * @file Adornos pequeños de los personajes (flores y estrellitas), usados en
 * complementos y estampados.
 *
 * Capa: arte.
 */
import { redondear1 as n } from '../../util/numeros.js';

/** Color de los contornos de los personajes. */
export const TINTA = '#2E2A3B';

/**
 * Flor de cinco pétalos con centro amarillo.
 * @param {number} x @param {number} y @param {string} c Color de los pétalos.
 * @returns {string}
 */
export function flor(x, y, c) {
  let f = '';
  for (let i = 0; i < 5; i++) { const a = i * 1.2566; f += `<circle cx="${n(x + 4.2 * Math.cos(a))}" cy="${n(y + 4.2 * Math.sin(a))}" r="3.4" fill="${c}"/>`; }
  return f + `<circle cx="${x}" cy="${y}" r="2.6" fill="#F2B33D"/>`;
}

/**
 * Estrella de cinco puntas con borde dorado.
 * @param {number} x @param {number} y @param {number} r Radio. @param {string} c Color.
 * @returns {string}
 */
export const estrellita = (x, y, r, c) => {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += `${i ? 'L' : 'M'}${n(x + rr * Math.cos(a))} ${n(y + rr * Math.sin(a))} `; }
  return `<path d="${d}Z" fill="${c}" stroke="#B9831A" stroke-width="1.2" stroke-linejoin="round"/>`;
};
