/**
 * @file Melodías cortas del juego, sintetizadas con Web Audio (sin archivos).
 *
 * Capa: servicios. Regla del proyecto: no hay sonido de error, solo de
 * premio. Para añadir una melodía, añádela a {@link MELODIAS} como lista de
 * [frecuencia en Hz, segundos desde el inicio].
 */

/** @type {Readonly<Record<string, ReadonlyArray<[number, number]>>>} */
export const MELODIAS = Object.freeze({
  bien: [[523, 0], [659, 0.09], [784, 0.18]],
  estrella: [[784, 0], [1047, 0.1]],
  tesoro: [[880, 0], [1175, 0.08], [1568, 0.16]],
  fin: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.5], [1047, 0.62]],
  pagina: [[440, 0], [554, 0.06]]
});

const DURACION_NOTA = 0.32;

/** @type {AudioContext|null} Se crea al primer sonido (los navegadores lo exigen tras un toque). */
let contexto = null;
/** @type {() => boolean} */
let estaActivo = () => true;

/**
 * Indica cómo saber si los sonidos están activados (se consulta en cada sonido,
 * así un cambio en los ajustes se nota al momento).
 * @param {() => boolean} fn
 */
export function configurarSonido(fn) { estaActivo = fn; }

function nota(frecuencia, inicio, duracion, volumen = 0.16, forma = 'sine') {
  const o = contexto.createOscillator(), g = contexto.createGain();
  o.type = forma; o.frequency.value = frecuencia;
  g.gain.setValueAtTime(0, inicio);
  g.gain.linearRampToValueAtTime(volumen, inicio + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
  o.connect(g).connect(contexto.destination);
  o.start(inicio); o.stop(inicio + duracion + 0.05);
}

/**
 * Toca una melodía. Si no hay audio o está desactivado, no hace nada.
 * @param {keyof typeof MELODIAS} nombre
 */
export function tocar(nombre) {
  if (!estaActivo()) return;
  try {
    contexto = contexto || new (window.AudioContext || window.webkitAudioContext)();
    if (contexto.state === 'suspended') contexto.resume();
    const t = contexto.currentTime + 0.02;
    (MELODIAS[nombre] || []).forEach(([f, d]) => nota(f, t + d, DURACION_NOTA));
  } catch (e) { /* sin sonido */ }
}
