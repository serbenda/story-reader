/**
 * @file Escuchar a la niña con el reconocimiento de voz del navegador.
 *
 * Capa: servicios. Funciona en Chrome y Edge (necesita internet) y en Safari
 * del iPad. En Firefox no existe: el juego pasa al botón «¡Ya lo he leído!».
 * Si el permiso del micro se deniega, se recuerda (`bloqueado`) para no
 * volver a intentarlo en esta visita.
 */

const Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Errores que significan «aquí no hay micro» (no tiene sentido reintentar). */
export const ERRORES_SIN_MICRO = Object.freeze(['not-allowed', 'service-not-allowed', 'audio-capture']);

let bloqueado = false;
/** @type {any} reconocimiento en marcha */
let actual = null;

/** ¿Existe el reconocimiento de voz en este navegador? */
export const soportado = !!Reconocedor;

/** ¿Se puede escuchar ahora (existe y no está bloqueado)? */
export const disponible = () => !!Reconocedor && !bloqueado;

/** ¿Se ha denegado el micro en esta visita? */
export const estaBloqueado = () => bloqueado;

/** ¿Está escuchando en este momento? */
export const escuchando = () => !!actual;

/**
 * @typedef {object} OyentesEscucha
 * @property {(texto: string) => void} [parcial]  Lo que va entendiendo mientras se habla.
 * @property {(alternativas: string[]) => void} final  Las posibles frases entendidas.
 * @property {(tipo: string) => void} [error]     Código de error de la Web Speech API.
 * @property {() => void} [fin]                   Siempre se llama al terminar.
 */

/**
 * Escucha una frase (se para sola al dejar de hablar).
 * Si termina sin resultado final pero había uno parcial, se usa ese.
 * @param {OyentesEscucha} cb
 */
export function escuchar(cb) {
  let rec;
  try { rec = new Reconocedor(); } catch (e) { bloqueado = true; cb.error?.('not-allowed'); cb.fin?.(); return; }
  actual = rec;
  rec.lang = 'es-ES';
  rec.interimResults = true;
  rec.maxAlternatives = 4;
  rec.continuous = false;
  let dadoFinal = false, ultimoParcial = '';
  rec.onresult = (ev) => {
    let parcial = '';
    const alts = [];
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) for (let a = 0; a < r.length; a++) alts.push(r[a].transcript);
      else parcial += r[0].transcript;
    }
    if (parcial) { ultimoParcial = parcial; cb.parcial?.(parcial); }
    if (alts.length) { dadoFinal = true; cb.final(alts); }
  };
  rec.onerror = (ev) => {
    if (ERRORES_SIN_MICRO.includes(ev.error)) bloqueado = true;
    cb.error?.(ev.error);
  };
  rec.onend = () => {
    actual = null;
    if (!dadoFinal && ultimoParcial) cb.final([ultimoParcial]);
    cb.fin?.();
  };
  try { rec.start(); } catch (e) { actual = null; cb.error?.('aborted'); cb.fin?.(); }
}

/** Deja de escuchar (se llamará a `final` con lo que haya). */
export function parar() {
  if (actual) try { actual.stop(); } catch (e) { /* ya estaba parado */ }
}
