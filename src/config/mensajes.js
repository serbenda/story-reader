/**
 * @file Frases de ánimo que dice el juego.
 *
 * Capa: config. Regla del proyecto: nunca hay mensajes de error para la niña,
 * solo ánimos. Si añades frases, que sean cortas y positivas.
 */

/** Se dice al leer bien una frase o acertar una pregunta. */
export const ELOGIOS = Object.freeze([
  '¡Qué bien lo has leído!', '¡Eres una lectora estupenda!', '¡Bravo, detective!',
  '¡Muy bien leído!', '¡Lo has bordado!', '¡Genial! Sigue así.'
]);

/** Se dice cuando faltan palabras por leer bien. */
export const ANIMOS = Object.freeze([
  '¡Casi! Lee otra vez las palabras subrayadas.',
  '¡Muy cerca! Repite solo las que faltan.',
  '¡Vas muy bien! Prueba con las subrayadas.'
]);
