/**
 * @file Números al azar repetibles a partir de una semilla (mulberry32).
 *
 * Capa: arte. Con la misma semilla salen siempre los mismos números: así un
 * paisaje no cambia cada vez que se redibuja la pantalla, pero sí en cada
 * partida nueva (que estrena semilla).
 */

/**
 * Convierte un texto en un número (FNV-1a), para usar textos como semilla.
 * @param {string} s
 * @returns {number}
 */
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Crea un generador de números entre 0 (incluido) y 1 (excluido).
 * @param {number|string} semilla
 * @returns {() => number}
 */
export function aleatorio(semilla) {
  let a = typeof semilla === 'number' ? semilla : hash(String(semilla));
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
