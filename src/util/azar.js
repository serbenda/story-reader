/**
 * @file Azar: elegir y barajar.
 *
 * Capa: util. Para azar repetible (dibujos que no cambian al redibujar) usa
 * src/arte/aleatorio.js, que parte de una semilla.
 */

/**
 * Un elemento cualquiera de la lista.
 * @template T
 * @param {readonly T[]} lista
 * @returns {T}
 */
export const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

/**
 * Copia barajada de la lista (Fisher–Yates). No modifica la original.
 * @template T
 * @param {readonly T[]} lista
 * @returns {T[]}
 */
export function barajar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
