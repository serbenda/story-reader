/**
 * @file Cielo, sol, luna, estrellas y el velo de la noche, comunes a muchos paisajes.
 *
 * Capa: arte.
 */
import * as P from './piezas.js';
import { redondear1 as n } from '../util/numeros.js';

/**
 * Fondo de cielo: degradado de día o azul de noche.
 * @param {string[]} defs  Donde se deja el degradado.
 * @param {boolean} noche
 * @param {string} dia1  Color de arriba de día.
 * @param {string} dia2  Color de abajo de día.
 * @returns {string}
 */
export function cielo(defs, noche, dia1, dia2) {
  const g = noche ? P.grad('#1E2550', '#4A4E86') : P.grad(dia1, dia2);
  defs.push(g.def);
  return `<rect width="800" height="500" fill="url(#${g.id})"/>`;
}

/**
 * De día, sol y dos nubes; de noche, luna y estrellas.
 * @param {() => number} r  Azar repetible.
 * @param {boolean} noche
 * @param {number} xSol  Posición del sol (o de la luna).
 * @param {number} ySol
 * @returns {string}
 */
export function astros(r, noche, xSol, ySol) {
  if (!noche) return P.sol(xSol, ySol) + P.nube(120 + r() * 180, 70 + r() * 30) + P.nube(400 + r() * 150, 55 + r() * 40, .7);
  let s = `<circle cx="${xSol}" cy="${ySol}" r="70" fill="#FFF4C7" opacity=".18"/><circle cx="${xSol}" cy="${ySol}" r="42" fill="#FFF4C7"/><circle cx="${xSol - 12}" cy="${ySol - 8}" r="7" fill="#EDE2B0"/><circle cx="${xSol + 10}" cy="${ySol + 12}" r="5" fill="#EDE2B0"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${n(r() * 800)}" cy="${n(r() * 220)}" r="${n(.8 + r() * 1.6)}" fill="#FFFFFF" opacity="${n(.5 + r() * .5)}"/>`;
  return s;
}

/**
 * De noche, oscurece todo el paisaje y añade luciérnagas. Va al final del dibujo.
 * @param {() => number} r
 * @param {boolean} noche
 * @returns {string}
 */
export function velo(r, noche) {
  if (!noche) return '';
  let s = '<rect width="800" height="500" fill="#1C2152" opacity=".42"/>';
  for (let i = 0; i < 14; i++) { const x = r() * 800, y = 200 + r() * 280; s += `<circle cx="${n(x)}" cy="${n(y)}" r="9" fill="#FFE98A" opacity=".18"/><circle cx="${n(x)}" cy="${n(y)}" r="2.6" fill="#FFF2B0"/>`; }
  return s;
}
