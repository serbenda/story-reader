/**
 * @file Trabajo con frases: partirlas, ordenarlas, completarlas, contar palabras,
 * encontrar diálogos y medir la velocidad lectora.
 *
 * Capa: contenido (solo texto, sin DOM ni estado). Lo usan el taller de frases,
 * la lectura repetida, la comprensión del final del capítulo y el registro de
 * velocidad. Probado en tests/unidad/lectoescritura.test.js.
 */
import { barajar } from '../util/azar.js';
import { capitalizar } from './plantillas.js';
import { limpiarPistas } from './bloques.js';

/** Signos con los que puede acabar una frase. */
const FINAL = /[.!?…]+[»"”]?$/;
/** Verbos de habla que introducen quién dice algo en los cuentos. */
const VERBOS_DECIR = 'dice|pregunta|grita|susurra|responde|explica|exclama|contesta|murmura|añade';

/** Velocidad lectora mínima creíble (palabras por minuto); por debajo, la medida no vale. */
export const PPM_MIN = 5;

/** Velocidad lectora máxima creíble; por encima, se pulsó «terminado» sin leer. */
export const PPM_MAX = 250;

/**
 * Parte un texto en frases (por . ! ? …), sin marcas de pista ni de voz.
 * @param {string} texto
 * @returns {string[]}
 */
export function partirFrases(texto) {
  const out = [];
  for (const linea of limpiarPistas(texto).split('\n')) {
    if (/^\s*[?*-]\s/.test(linea)) continue;                 // preguntas y opciones
    const limpia = linea.replace(/^>\s?/, '').trim();
    for (const f of limpia.match(/[^.!?…]+[.!?…]+[»"”]?|[^.!?…]+$/g) || []) {
      const frase = f.trim().replace(/^[»"”]\s*/, '');
      if (frase) out.push(frase);
    }
  }
  return out;
}

/**
 * Número de palabras de un texto.
 * @param {string} texto
 * @returns {number}
 */
export const contarPalabras = (texto) => (String(texto).match(/[\p{L}\p{N}]+/gu) || []).length;

/**
 * ¿Sirve la frase para ejercicios? Sin diálogos ni llaves, y con un largo dado.
 * @param {string} frase
 * @param {{min: number, max: number}} largo  En palabras.
 * @returns {boolean}
 */
export function fraseApta(frase, { min, max }) {
  if (/[«»—{}\[\]:;()]/.test(frase) || !FINAL.test(frase)) return false;
  const n = contarPalabras(frase);
  return n >= min && n <= max;
}

/**
 * Palabras (con sus signos) de una frase.
 * @param {string} frase
 * @returns {string[]}
 */
export const piezasDeFrase = (frase) => frase.trim().split(/\s+/).filter(Boolean);

/**
 * @typedef {object} FraseParaOrdenar
 * @property {string} frase      La frase original.
 * @property {string[]} correcta Palabras en orden, sin mayúscula inicial ni signo final.
 * @property {string[]} piezas   Las mismas, barajadas (nunca en el orden correcto).
 * @property {string} final      Signo con el que acaba («.», «!», «?»).
 */

/**
 * Prepara una frase para el taller: se quita la mayúscula del principio y el
 * punto final (la niña tiene que ponerlos) y se barajan las palabras.
 * @param {string} frase
 * @returns {FraseParaOrdenar}
 */
export function prepararOrdenar(frase) {
  const final = (frase.match(/[.!?…]+[»"”]?$/) || ['.'])[0].replace(/[»"”]/g, '');
  const sinFinal = frase.replace(/[.!?…]+[»"”]?$/, '').trim();
  const correcta = piezasDeFrase(sinFinal).map((p, i) => (i === 0 ? minusculaInicial(p) : p));
  let piezas = barajar(correcta);
  for (let i = 0; i < 10 && correcta.length > 1 && piezas.join(' ') === correcta.join(' '); i++) piezas = barajar(correcta);
  return { frase, correcta, piezas, final };
}

/** «Toby» se queda igual (nombre propio); «El» pasa a «el». */
function minusculaInicial(palabra) {
  const comunes = /^(El|La|Los|Las|Un|Una|Unos|Unas|En|De|Del|Al|Con|Por|Para|Y|Pero|Cuando|Mientras|Allí|Aquí|Entonces|Luego|Después|Hoy|Ayer|Todo|Todos|Todas|Nadie|Alguien|Algo|Hay|Es|Está|Son|Se|Le|Les|Lo|Su|Sus|Mi|Tu|Muy|No|Sí|Ya|Qué|Quién|Dónde|Cómo|Por qué)$/;
  return comunes.test(palabra) ? palabra.charAt(0).toLowerCase() + palabra.slice(1) : palabra;
}

/**
 * Comprueba el orden elegido. Tolera elegir una palabra repetida en cualquiera de sus posiciones.
 * @param {string[]} elegidas
 * @param {string[]} correcta
 * @returns {boolean[]} Por posición: ¿está bien?
 */
export const comprobarOrden = (elegidas, correcta) => correcta.map((p, i) => elegidas[i] === p);

/**
 * Monta la frase final con la mayúscula y el signo que haya puesto la niña.
 * @param {string[]} palabras
 * @param {{mayuscula: boolean, final: string}} marcas
 * @returns {string}
 */
export function montarFrase(palabras, { mayuscula, final }) {
  const texto = palabras.join(' ');
  return (mayuscula ? capitalizar(texto) : texto) + (final || '');
}

/**
 * @typedef {object} FraseConHueco
 * @property {string} antes
 * @property {string} despues
 * @property {string} correcta
 * @property {string[]} opciones  La correcta y dos trampas, barajadas.
 */

/**
 * Quita una palabra de la frase para completarla eligiendo entre tres.
 * @param {string} frase
 * @param {string[]} otrasPalabras  Palabras de donde sacar las trampas.
 * @param {Set<string>} [evitar]    Palabras que no se pueden quitar (nombres propios…).
 * @returns {FraseConHueco|null} null si no hay ninguna palabra adecuada.
 */
export function prepararHueco(frase, otrasPalabras, evitar = new Set()) {
  const piezas = piezasDeFrase(frase);
  const candidatas = piezas.map((p, i) => [p.replace(/[^\p{L}]/gu, ''), i])
    .filter(([w, i]) => w.length >= 4 && i > 0 && !evitar.has(w.toLowerCase()));
  if (!candidatas.length) return null;
  const [palabra, i] = barajar(candidatas)[0];
  const trampas = barajar([...new Set(otrasPalabras.map((w) => w.replace(/[^\p{L}]/gu, '')))]
    .filter((w) => w.length >= 3 && w.toLowerCase() !== palabra.toLowerCase() && !evitar.has(w.toLowerCase())))
    .slice(0, 2);
  if (trampas.length < 2) return null;
  const pieza = piezas[i];
  const [antesSigno, despuesSigno] = pieza.split(palabra);
  return {
    antes: [...piezas.slice(0, i), antesSigno].join(' ').trimEnd(),
    despues: (despuesSigno || '') + (i < piezas.length - 1 ? ' ' + piezas.slice(i + 1).join(' ') : ''),
    correcta: palabra,
    opciones: barajar([palabra, ...trampas])
  };
}

/**
 * @typedef {object} Dialogo
 * @property {string} cita   Lo que se dice (sin comillas).
 * @property {string} quien  Quién lo dice (una palabra con mayúscula).
 */

/**
 * Busca diálogos del tipo «Vamos al río», dice Bruno.
 * @param {string[]} textos
 * @returns {Dialogo[]}
 */
export function extraerDialogos(textos) {
  const re = new RegExp(`«([^»]{6,80})»,?\\s+(?:${VERBOS_DECIR})\\s+(?:el |la )?([A-ZÁÉÍÓÚÑ][\\p{L}]+)`, 'gu');
  const out = [];
  for (const t of textos) for (const m of limpiarPistas(t).matchAll(re)) out.push({ cita: capitalizar(m[1].trim()), quien: m[2] });
  return out;
}

/**
 * Palabras por minuto, o null si la medida no es creíble.
 * @param {number} palabras
 * @param {number} ms  Tiempo que ha tardado en leerlas.
 * @returns {number|null}
 */
export function palabrasPorMinuto(palabras, ms) {
  if (!palabras || !ms || ms < 300) return null;
  const ppm = Math.round(palabras / (ms / 60000));
  return ppm >= PPM_MIN && ppm <= PPM_MAX ? ppm : null;
}
