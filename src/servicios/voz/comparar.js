/**
 * @file Compara lo que había que leer con lo que ha oído el micrófono.
 *
 * Capa: servicios (lógica pura, sin APIs del navegador). Es tolerante a
 * propósito: para una niña con dislexia importa que lo intente y lo lea, no
 * que el reconocedor de voz lo entienda perfecto.
 */

const NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];

/** Palabras siguientes en las que se busca cada palabra (por si el reconocedor se salta o añade alguna). */
const VENTANA = 4;

/**
 * Texto → lista de palabras sin tildes, mayúsculas ni signos. Las cifras se
 * escriben con letras («3» → «tres»), como las dice el reconocedor.
 * @param {string} s
 * @returns {string[]}
 */
export function normalizar(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\d+/g, (d) => NUMEROS[+d] || d)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(Boolean);
}

/**
 * Distancia de Levenshtein (letras que hay que cambiar, poner o quitar).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function distancia(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/**
 * Parecido entre dos palabras, de 0 (nada) a 1 (iguales).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export const parecido = (a, b) => 1 - distancia(a, b) / Math.max(a.length, b.length, 1);

/**
 * Compara palabra a palabra, avanzando en orden por lo oído.
 * Tiene en cuenta que el reconocedor a veces junta dos palabras en una
 * («alaia y» → «alaiay»).
 * @param {string[]} objetivo  Palabras normalizadas que había que leer.
 * @param {string[]} oidas     Palabras normalizadas que se han oído.
 * @param {number} umbral      Parecido mínimo para darla por buena (ver TOLERANCIAS).
 * @returns {boolean[]} Una entrada por palabra objetivo: ¿se ha leído bien?
 */
export function comparar(objetivo, oidas, umbral) {
  const res = objetivo.map(() => false);
  let p = 0;
  for (let i = 0; i < objetivo.length; i++) {
    let mejor = -1, sim = 0;
    for (let j = p; j < Math.min(oidas.length, p + VENTANA); j++) {
      const s = parecido(objetivo[i], oidas[j]);
      if (s > sim) { sim = s; mejor = j; }
    }
    if (sim < umbral && i + 1 < objetivo.length) {
      for (let j = p; j < Math.min(oidas.length, p + VENTANA); j++) {
        if (parecido(objetivo[i] + objetivo[i + 1], oidas[j]) >= umbral) { sim = 1; mejor = j - 1; res[i + 1] = true; break; }
      }
    }
    if (mejor >= -1 && sim >= umbral) { res[i] = true; p = Math.max(p, mejor + 1); }
  }
  return res;
}
