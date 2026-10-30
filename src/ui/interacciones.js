/**
 * @file Toques que funcionan en cualquier pantalla (delegación de eventos).
 *
 * Capa: ui. Se activan una sola vez al arrancar con {@link activarInteracciones}:
 *   - tocar una palabra → se oye; tocarla otra vez enseguida → se oye por sílabas;
 *   - con la regla de lectura, tocar una línea la destaca;
 *   - tocar un personaje → da un saltito y saluda;
 *   - tocar un tesoro escondido → va al álbum.
 */
import { estado, guardar } from '../estado/sesion.js';
import * as Voz from '../servicios/voz/index.js';
import * as Sonido from '../servicios/sonido.js';
import { $$, reanimar } from '../util/dom.js';
import { partesDePalabra } from '../contenido/silabas.js';
import { buscadoraDeTesoros } from '../dominio/protagonistas.js';
import { decir, silabear } from './voz-alta.js';
import { aviso, confeti } from './avisos.js';

/** Segundo toque dentro de este tiempo = leer por sílabas. */
const DOBLE_TOQUE_MS = 3500;

let ultimoToque = { el: null, t: 0 };

/**
 * Destaca una línea de lectura (si la opción de resaltar o la regla están activas).
 * @param {Element|null} linea
 */
export function activarLinea(linea) {
  if (!linea || !(estado.ajustes.resaltar || estado.ajustes.regla)) return;
  $$('.linea-activa').forEach((x) => x.classList.remove('linea-activa'));
  linea.classList.add('linea-activa');
}

/**
 * Cuando el texto nombra a alguien que está en el dibujo, ese personaje se mueve como si hablara.
 * @param {string} texto
 */
export function animarQuienHabla(texto) {
  if (!texto) return;
  for (const pj of $$('.escenario-sitio .pj[data-nombre]')) {
    const nombre = pj.dataset.nombre;
    if (nombre && texto.includes(nombre)) {
      reanimar(pj, 'habla');
      setTimeout(() => pj.classList.remove('habla'), 1600);
    }
  }
}

/** @param {MouseEvent} ev */
function alTocarPalabra(ev) {
  const p = ev.target.closest('.palabra');
  if (!p || p.classList.contains('silabeando')) return;
  const [, letras] = partesDePalabra(p.textContent.trim());
  const repetido = ultimoToque.el === p && Date.now() - ultimoToque.t < DOBLE_TOQUE_MS;
  ultimoToque = { el: p, t: Date.now() };
  if (repetido && letras) silabear(p, letras);
  else decir(letras || p.textContent);
  reanimar(p, 'sonando');
  activarLinea(p.closest('.linea'));
}

/** @param {MouseEvent} ev */
function alTocarLinea(ev) {
  if (!estado.ajustes.regla || ev.target.closest('.palabra, button')) return;
  const linea = ev.target.closest('.bloques > p.linea');
  if (linea) activarLinea(linea);
}

/** @param {MouseEvent} ev */
function alTocarPersonaje(ev) {
  const pj = ev.target.closest('.pj[data-saludo]');
  if (!pj) return;
  reanimar(pj, 'salta');
  setTimeout(() => pj.classList.remove('salta'), 520);
  Voz.hablar(pj.dataset.saludo, 0.95);
}

/** @param {MouseEvent} ev */
function alTocarTesoro(ev) {
  const t = ev.target.closest('.tesoro');
  if (!t) return;
  const { emoji, nombre } = t.dataset;
  estado.album.tesoros[emoji] = (estado.album.tesoros[emoji] || 0) + 1; guardar();
  t.classList.add('encontrado');
  setTimeout(() => t.remove(), 600);
  Sonido.tocar('tesoro'); confeti(18);
  const frase = `¡${buscadoraDeTesoros()} ha encontrado ${nombre}!`;
  aviso(`${emoji} ${frase}`);
  Voz.hablar(frase, 0.95);
}

/** Activa todos los toques globales. Llamar una vez. */
export function activarInteracciones() {
  for (const fn of [alTocarPalabra, alTocarLinea, alTocarPersonaje, alTocarTesoro]) document.addEventListener('click', fn);
}
