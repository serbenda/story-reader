/**
 * @file Cuentas pequeñas.
 *
 * Capa: util.
 */

/**
 * Redondea a un decimal (para que los SVG generados no lleven 15 decimales).
 * @param {number} x
 * @returns {number}
 */
export const redondear1 = (x) => Math.round(x * 10) / 10;

/**
 * Suma lo que devuelve `f` para cada elemento (los valores vacíos cuentan 0).
 * @template T
 * @param {readonly T[]} lista
 * @param {(x: T) => number|undefined} f
 * @returns {number}
 */
export const sumar = (lista, f) => lista.reduce((s, x) => s + (f(x) || 0), 0);

/**
 * Porcentaje entero de `parte` sobre `total`, o null si no hay total.
 * @param {number} parte
 * @param {number} total
 * @returns {number|null}
 */
export const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : null);
