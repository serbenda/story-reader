/**
 * @file Niveles de lectura y exigencia del micrófono.
 *
 * Capa: config (no importa nada). Son datos puros: cambiar un texto o un
 * umbral aquí cambia el juego sin tocar la lógica.
 *
 * Para añadir un nivel nuevo:
 *   1. Añádelo a {@link NIVELES} en el orden de dificultad que le toque.
 *   2. Escribe sus textos en los cuentos con «### nombre» (ver stories/GUIA-ESCRITURA.md).
 *   3. Añade su id a NIVELES_DE_TEXTO en src/contenido/escenas.js.
 */

/**
 * @typedef {object} Nivel
 * @property {string} id      Identificador usado en los cuentos («### lectora») y en el guardado.
 * @property {string} nombre  Nombre que ve la niña.
 * @property {string} icono   Emoji de la insignia.
 * @property {string} desc    Explicación corta para los mayores.
 */

/** Niveles de más fácil a más difícil. El orden importa: se sube al siguiente. @type {readonly Nivel[]} */
export const NIVELES = Object.freeze([
  { id: 'aprendiz', nombre: 'Aprendiz', icono: '🌱', desc: 'Frases cortitas y pistas muy claras.' },
  { id: 'novatilla', nombre: 'Novatilla', icono: '🌼', desc: 'Textos más largos, con alguna pista tramposa.' },
  { id: 'lectora', nombre: 'Lectora', icono: '📖', desc: 'Palabras nuevas y preguntas de «¿por qué?».' },
  { id: 'superlectora', nombre: 'Superlectora', icono: '🔎', desc: 'Pistas repartidas para resolver el caso.' }
]);

/** Nivel con el que empieza una partida nueva. */
export const NIVEL_INICIAL = NIVELES[0].id;

/**
 * Busca un nivel por su id.
 * @param {string} id
 * @returns {Nivel} El nivel, o el primero si el id no existe.
 */
export const nivelPorId = (id) => NIVELES.find((n) => n.id === id) || NIVELES[0];

/**
 * Posición de un nivel en {@link NIVELES} (−1 si no existe).
 * @param {string} id
 * @returns {number}
 */
export const posicionDeNivel = (id) => NIVELES.findIndex((n) => n.id === id);

/**
 * @typedef {object} Tolerancia
 * @property {string} nombre  Texto del botón en «Para mayores».
 * @property {number} umbral  Parecido mínimo (0–1) para dar una palabra por bien leída.
 * @property {number} pasa    Proporción de palabras bien leídas para superar la frase.
 */

/** Cuánto perdona el micrófono los errores de lectura. @type {Readonly<Record<string, Tolerancia>>} */
export const TOLERANCIAS = Object.freeze({
  facil: { nombre: 'Fácil', umbral: 0.5, pasa: 0.7 },
  normal: { nombre: 'Normal', umbral: 0.62, pasa: 0.8 },
  exigente: { nombre: 'Exigente', umbral: 0.8, pasa: 0.95 }
});

/** Tamaños de la letra de lectura (valor de la variable CSS --tam-lectura). */
export const TAMANOS_LETRA = Object.freeze({ normal: '1.5rem', grande: '1.85rem', enorme: '2.25rem' });

/** Textos de los botones de tamaño de letra. */
export const NOMBRES_TAMANO = Object.freeze({ normal: 'Normal', grande: 'Grande', enorme: 'Muy grande' });

/** Velocidades de la voz que lee (multiplican la velocidad de cada frase). */
export const VELOCIDADES_VOZ = Object.freeze({ lenta: 0.8, normal: 1, rapida: 1.2 });

/** Textos de los botones de velocidad. */
export const NOMBRES_VELOCIDAD = Object.freeze({ lenta: 'Despacio', normal: 'Normal', rapida: 'Rápida' });
