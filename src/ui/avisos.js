/**
 * @file Avisos, confeti y capas (ventanas encima de la pantalla).
 *
 * Capa: ui. Se usan desde cualquier pantalla. Nunca se usan alert() ni
 * confirm() del navegador: interrumpen y asustan.
 */
import { $, $$, movimientoReducido } from '../util/dom.js';
import { azar } from '../util/azar.js';
import { COLORES_CONFETI } from '../config/index.js';

/** Duración por defecto de un aviso. */
const DURACION_AVISO_MS = 3200;
/** Lo que dura cada trocito de confeti en pantalla. */
const DURACION_CONFETI_MS = 2800;

let temporizadorAviso = null;

/**
 * Muestra un aviso abajo durante un rato (se anuncia a los lectores de pantalla).
 * @param {string} texto
 * @param {number} [ms]
 */
export function aviso(texto, ms = DURACION_AVISO_MS) {
  const a = $('#aviso');
  a.textContent = texto; a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { a.hidden = true; }, ms);
}

/**
 * Lanza confeti (no hace nada si se han pedido menos animaciones).
 * @param {number} [cuantos=40]
 */
export function confeti(cuantos = 40) {
  if (movimientoReducido()) return;
  const c = $('#confeti');
  for (let i = 0; i < cuantos; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = azar(COLORES_CONFETI);
    p.style.animationDelay = Math.random() * 0.35 + 's';
    p.style.setProperty('--dx', (Math.random() * 30 - 15) + 'vw');
    p.style.setProperty('--giro', (Math.random() * 900 - 450) + 'deg');
    c.appendChild(p);
    setTimeout(() => p.remove(), DURACION_CONFETI_MS);
  }
}

/**
 * Abre una capa con el HTML dado. Se cierra tocando fuera o cualquier
 * elemento con el atributo `data-cerrar`. Solo hay una capa a la vez.
 * @param {string} html
 * @param {() => void} [alCerrar]
 * @returns {HTMLElement} La capa (para buscar elementos dentro).
 */
export function abrirCapa(html, alCerrar) {
  cerrarCapa();
  const capa = document.createElement('div');
  capa.className = 'capa';
  capa.innerHTML = `<div class="capa-caja" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(capa);
  capa.addEventListener('click', (ev) => {
    if (ev.target === capa || ev.target.closest('[data-cerrar]')) { cerrarCapa(); alCerrar?.(); }
  });
  capa.querySelector('[data-cerrar], button')?.focus();
  return capa;
}

/** Cierra la capa abierta, si hay. */
export function cerrarCapa() { $$('.capa').forEach((c) => c.remove()); }
