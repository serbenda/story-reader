/**
 * @file Lo que hace falta saber del navegador y del dispositivo.
 *
 * Capa: servicios.
 */

let persistente = null;

/**
 * Pide al navegador que no borre el progreso aunque falte espacio o pasen
 * semanas sin abrir la web. Nunca falla.
 */
export function pedirAlmacenamientoPersistente() {
  try { navigator.storage?.persist?.().then((ok) => { persistente = ok; }); } catch (e) { /* no disponible */ }
}

/** ¿Ha prometido el navegador no borrar los datos? (null si aún no ha contestado) */
export const almacenamientoPersistente = () => persistente;

/** ¿Está la web instalada en la pantalla de inicio? */
export const instalada = () => !!((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone);

/** ¿Es un iPhone o iPad (también los iPad que dicen ser Mac)? */
export const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Registra el service worker (modo sin internet e instalable). Solo en la web
 * publicada (https o localhost), no en la versión de un solo archivo.
 * @param {string} ruta
 */
export function registrarModoSinConexion(ruta) {
  if (!('serviceWorker' in navigator) || window.__EMBEBIDO__ || !/^(https:|http:\/\/localhost)/.test(location.href)) return;
  navigator.serviceWorker.register(ruta).catch((e) => console.warn('Sin modo offline:', e));
}

/**
 * Copia texto al portapapeles.
 * @param {string} texto
 * @returns {Promise<void>} Se rechaza si el navegador no deja (hay que ofrecer copiarlo a mano).
 */
export function copiarAlPortapapeles(texto) {
  try { return navigator.clipboard.writeText(texto); } catch (e) { return Promise.reject(e); }
}
