/**
 * @file Decir palabras en voz alta: con la voz de la familia si está grabada,
 * si no con la del dispositivo; y leerlas sílaba a sílaba.
 *
 * Capa: ui (toca el DOM para iluminar las sílabas).
 */
import * as Voz from '../servicios/voz/index.js';
import * as Grabaciones from '../servicios/grabaciones.js';
import { $$, esc } from '../util/dom.js';
import { silabas, partesDePalabra } from '../contenido/silabas.js';
import { claveDePalabra } from '../dominio/registro-lectura.js';

/** Tiempo entre sílaba y sílaba al leer por sílabas. */
const PASO_SILABA_MS = 750;

/**
 * Dice una palabra o frase. Una sola palabra grabada por la familia suena con esa grabación.
 * @param {string} texto
 * @param {number} [velocidad=0.75]
 */
export function decir(texto, velocidad = 0.75) {
  const limpia = String(texto).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!limpia) return;
  if (!/\s/.test(limpia) && Grabaciones.reproducirYa(claveDePalabra(limpia))) return;
  Voz.hablar(limpia, velocidad);
}

/** Función para cortar el silabeo en marcha (solo hay uno a la vez). */
let pararSilabeo = null;

/**
 * Lee una palabra por sílabas: se iluminan una a una mientras se oyen
 * («ma… ri… po… sa») y al final se dice entera.
 * @param {HTMLElement} el      El <span class="palabra">.
 * @param {string} letras       La palabra sin signos.
 */
export function silabear(el, letras) {
  const sils = silabas(letras);
  if (sils.length < 2) { decir(letras); return; }
  if (pararSilabeo) pararSilabeo();
  const original = el.innerHTML;
  const [antes, , despues] = partesDePalabra(el.textContent.trim());
  el.innerHTML = esc(antes) + sils.map((s, i) => `<span class="sil-paso">${esc(s)}</span>${i < sils.length - 1 ? '<span class="sil-punto" aria-hidden="true">·</span>' : ''}`).join('') + esc(despues);
  el.classList.add('silabeando');
  const pasos = $$('.sil-paso', el);
  const tiempos = pasos.map((p, i) => setTimeout(() => {
    pasos.forEach((x) => x.classList.remove('ahora'));
    p.classList.add('ahora');
    Voz.hablar(sils[i], 0.6);
  }, i * PASO_SILABA_MS));
  const terminar = () => { tiempos.forEach(clearTimeout); el.innerHTML = original; el.classList.remove('silabeando'); pararSilabeo = null; };
  tiempos.push(setTimeout(() => { terminar(); decir(letras, 0.7); }, sils.length * PASO_SILABA_MS + 250));
  pararSilabeo = terminar;
}
