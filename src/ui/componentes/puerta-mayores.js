/**
 * @file Botón que hay que mantener pulsado para entrar en «Para mayores».
 *
 * Capa: ui. Evita que las niñas entren sin querer. Funciona con el dedo, el
 * ratón y el teclado (mantener Enter o Espacio). Si se suelta antes de tiempo,
 * aparece una ayuda («Mantén pulsado el botón para entrar»).
 */
import { $ } from '../../util/dom.js';

/** Tiempo que hay que mantener pulsado. Debe coincidir con la animación de .carga en el CSS. */
export const TIEMPO_PUERTA_MS = 1800;

/**
 * @param {HTMLElement} boton
 * @param {() => void} alAbrir
 * @param {string} [selectorAyuda='#ayuda-mayores']  Elemento (oculto) con la ayuda.
 */
export function puertaMayores(boton, alAbrir, selectorAyuda = '#ayuda-mayores') {
  let t = null;
  const ayuda = $(selectorAyuda);
  const empezar = (ev) => {
    ev.preventDefault();
    boton.classList.add('cargando');
    t = setTimeout(() => { boton.classList.remove('cargando'); alAbrir(); }, TIEMPO_PUERTA_MS);
  };
  const cancelar = () => {
    if (t) { clearTimeout(t); t = null; if (boton.classList.contains('cargando') && ayuda) ayuda.hidden = false; }
    boton.classList.remove('cargando');
  };
  boton.addEventListener('pointerdown', empezar);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => boton.addEventListener(e, cancelar));
  boton.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && !t && !ev.repeat) empezar(ev); });
  boton.addEventListener('keyup', cancelar);
  boton.addEventListener('contextmenu', (ev) => ev.preventDefault());
}
