/**
 * @file Registro de paisajes y función para dibujarlos.
 *
 * Capa: arte. Los cuentos eligen el paisaje por su nombre («@fondo: faro» en
 * una escena o «fondo: faro» en un lugar de libro.md).
 *
 * Para añadir un paisaje nuevo:
 *   1. Escribe la función en el archivo del mundo que le toque (o en uno nuevo),
 *      con la firma {@link DibujoPaisaje}.
 *   2. Añádela a {@link PAISAJES} aquí abajo.
 *   3. Úsala en un cuento. El validador (herramientas/validar.py) avisa si un
 *      cuento pide un paisaje que no existe.
 */
import { aleatorio } from '../aleatorio.js';
import { casa } from './hogar.js';
import { bosque, rio, cueva, puente, prado, arbol } from './bosque.js';
import { playa, faro, barco } from './mar.js';
import { granja, huerto } from './granja.js';
import { castillo, torre } from './castillo.js';
import { luna, planeta, nave, espacio } from './espacio.js';
import { nieve, lago, iglu, cabana } from './nieve.js';

/**
 * @callback DibujoPaisaje
 * @param {() => number} r      Azar repetible.
 * @param {boolean} noche
 * @param {string[]} defs       Definiciones para <defs> (degradados…).
 * @returns {string}            Contenido del SVG.
 */

/** Todos los paisajes por nombre. @type {Readonly<Record<string, DibujoPaisaje>>} */
export const PAISAJES = Object.freeze({
  casa,
  bosque, rio, cueva, puente, prado, arbol,
  playa, faro, barco,
  granja, huerto,
  castillo, torre,
  luna, planeta, nave, espacio,
  nieve, lago, iglu, cabana
});

/** Paisaje que se usa si se pide uno que no existe. */
const PAISAJE_DE_RESERVA = 'bosque';

/**
 * Dibuja un paisaje completo.
 * @param {string} tipo  Nombre en {@link PAISAJES}.
 * @param {object} [opciones]
 * @param {boolean} [opciones.noche=false]
 * @param {number} [opciones.semilla]  Misma semilla → mismo dibujo.
 * @returns {string} Un <svg class="fondo"> que cubre su caja (como background-size: cover).
 */
export function paisaje(tipo, { noche = false, semilla = Math.random() * 1e9 } = {}) {
  const dibujar = PAISAJES[tipo] || PAISAJES[PAISAJE_DE_RESERVA];
  if (!PAISAJES[tipo]) console.warn(`Paisaje desconocido «${tipo}», uso el ${PAISAJE_DE_RESERVA}.`);
  const defs = [];
  const cuerpo = dibujar(aleatorio(Math.floor(semilla)), noche, defs);
  return `<svg class="fondo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs.join('')}</defs>${cuerpo}</svg>`;
}
