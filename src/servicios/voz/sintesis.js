/**
 * @file Leer en voz alta con las voces del dispositivo (speechSynthesis).
 *
 * Capa: servicios. Elige sola la voz en español que mejor suene (las
 * «naturales» o «premium» primero), salvo que los mayores elijan otra.
 */

const haySintesis = () => 'speechSynthesis' in window;

/** @type {SpeechSynthesisVoice|null} */
let vozElegida = null;
/** @type {SpeechSynthesisVoice|null} */
let vozAutomatica = null;
let preferida = '';
let factor = 1;

/**
 * Puntuación de una voz: mejor si es de España, «natural», de una familia
 * conocida que suena bien, o de red (suelen ser mejores que las locales).
 * @param {SpeechSynthesisVoice} v
 * @returns {number}
 */
const puntuar = (v) => (/^es[-_]ES/i.test(v.lang) ? 4 : 0) + (/natural|neural|premium|enhanced|mejorad/i.test(v.name) ? 3 : 0)
  + (/google|monica|mónica|paulina|lucia|lucía|helena|elvira|marisol/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);

/**
 * Voces en español disponibles, de mejor a peor.
 * @returns {SpeechSynthesisVoice[]}
 */
export function voces() {
  if (!haySintesis()) return [];
  return speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang)).sort((a, b) => puntuar(b) - puntuar(a));
}

function buscarVoz() {
  const vs = voces();
  vozAutomatica = vs[0] || null;
  vozElegida = (preferida && vs.find((v) => v.name === preferida)) || vozAutomatica;
}
// Las voces llegan tarde en algunos navegadores: se vuelve a buscar cuando cambian
if (haySintesis()) { buscarVoz(); speechSynthesis.addEventListener?.('voiceschanged', buscarVoz); }

/**
 * Cambia la voz y la velocidad.
 * @param {object} [opciones]
 * @param {string} [opciones.voz='']  Nombre de la voz ('' = automática).
 * @param {number} [opciones.factor=1]  Multiplica la velocidad de todas las frases.
 */
export function configurar({ voz = '', factor: f = 1 } = {}) {
  preferida = voz;
  factor = f;
  buscarVoz();
}

/** Nombre de la voz que se elegiría en automático ('' si no hay). */
export const nombreAutomatica = () => (vozAutomatica ? vozAutomatica.name : '');

/**
 * Dice un texto (cortando lo que se estuviera diciendo).
 * @param {string} texto
 * @param {number} [velocidad=0.85]  Velocidad base (se multiplica por la configurada).
 * @returns {boolean} false si el dispositivo no puede hablar.
 */
export function hablar(texto, velocidad = 0.85) {
  if (!haySintesis()) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES'; u.rate = velocidad * factor; u.pitch = 1.05;
    if (vozElegida) { u.voice = vozElegida; u.lang = vozElegida.lang; }
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}

/** Calla lo que se esté diciendo. */
export function callar() {
  if (haySintesis()) speechSynthesis.cancel();
}
