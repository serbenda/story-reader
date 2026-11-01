/**
 * @file Ajustes de la zona «Practicar»: dictado, taller de frases, lectura repetida y mi frase.
 *
 * Capa: config. Lo que se pide en cada nivel, para que el esfuerzo crezca
 * poco a poco. Cambiar un número aquí cambia la dificultad sin tocar lógica.
 */

/** Ejercicios en cada sesión de dictado o de taller. */
export const EJERCICIOS_POR_SESION = 6;

/** Veces que se lee el mismo texto en la lectura repetida. */
export const LECTURAS_REPETIDAS = 3;

/**
 * Palabras que se dictan, por nivel: número de sílabas y de letras.
 * Desde Lectora se puede dictar con teclado (frases cortas en Superlectora).
 */
export const DICTADO_POR_NIVEL = Object.freeze({
  aprendiz: { silabas: [2, 2], letras: [4, 6], trampas: 2, teclado: false },
  novatilla: { silabas: [2, 3], letras: [4, 8], trampas: 2, teclado: false },
  lectora: { silabas: [3, 4], letras: [5, 10], trampas: 3, teclado: true },
  superlectora: { silabas: [3, 5], letras: [6, 12], trampas: 3, teclado: true }
});

/** Largo (en palabras) de las frases del taller, por nivel. */
export const FRASES_POR_NIVEL = Object.freeze({
  aprendiz: { min: 3, max: 5 },
  novatilla: { min: 4, max: 7 },
  lectora: { min: 5, max: 9 },
  superlectora: { min: 6, max: 11 }
});

/** Largo (en palabras) del texto de la lectura repetida, por nivel. */
export const LECTURA_REPETIDA_POR_NIVEL = Object.freeze({
  aprendiz: { min: 10, max: 20 },
  novatilla: { min: 18, max: 30 },
  lectora: { min: 28, max: 45 },
  superlectora: { min: 40, max: 60 }
});

/** Sesiones de práctica que se guardan como máximo (las más antiguas se descartan). */
export const MAX_PRACTICAS = 300;

/** Frases escritas («Mi frase») que se guardan como máximo. */
export const MAX_ESCRITOS = 100;
