/**
 * @file Fechas en hora local: días, semanas y formatos cortos en español.
 *
 * Capa: util. Los días se identifican con una clave «AAAA-MM-DD» en hora local
 * (no UTC), para que «hoy» sea el hoy de la familia.
 */

/** Milisegundos de un día. */
export const DIA_MS = 864e5;

/** Letras de los días empezando en domingo (como Date.getDay()). */
export const LETRAS_DIA_DESDE_DOMINGO = Object.freeze(['D', 'L', 'M', 'X', 'J', 'V', 'S']);

/** Letras de los días empezando en lunes (como se ve la semana). */
export const LETRAS_DIA_DESDE_LUNES = Object.freeze(['L', 'M', 'X', 'J', 'V', 'S', 'D']);

/**
 * Medianoche de hoy.
 * @returns {number} Marca de tiempo en ms.
 */
export function inicioDeHoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return +d;
}

/**
 * Clave de día «AAAA-MM-DD» en hora local.
 * @param {number} t Marca de tiempo en ms.
 * @returns {string}
 */
export function claveDia(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Medianoche del lunes de la semana de `t`.
 * @param {number} t
 * @returns {number}
 */
export function lunesDe(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return +d;
}

/**
 * «3 nov.»
 * @param {number} t
 * @returns {string}
 */
export const fechaCorta = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

/**
 * «3 de noviembre de 2026»
 * @param {number} t
 * @returns {string}
 */
export const fechaLarga = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * «17:05»
 * @param {number} t
 * @returns {string}
 */
export const hora = (t) => new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
