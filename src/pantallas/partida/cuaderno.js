/**
 * @file Cuaderno de detective: las pistas [[marcadas]] que van saliendo en el capítulo.
 *
 * Capa: pantallas (partida). El botón aparece en cuanto hay una pista (en
 * Superlectora, desde el principio) y da un saltito con cada pista nueva.
 */
import { partida } from '../../estado/sesion.js';
import { $, reanimar } from '../../util/dom.js';
import { palabras } from '../../ui/palabras.js';
import { abrirCapa } from '../../ui/avisos.js';

/** Actualiza el número del botón del cuaderno y lo hace saltar. */
export function actualizarCuaderno() {
  const btn = $('#cuaderno');
  if (!btn) return;
  btn.hidden = false;
  $('#num-pistas').textContent = partida.cuaderno.length;
  reanimar(btn, 'salta');
}

/** Abre el cuaderno con todas las pistas. */
export function verCuaderno() {
  const lista = partida.cuaderno.length
    ? `<ol class="lista-pistas">${partida.cuaderno.map((p) => `<li class="linea">${palabras(p)}</li>`).join('')}</ol>`
    : `<p class="linea">${palabras('Todavía no hay pistas. ¡Lee con atención!')}</p>`;
  abrirCapa(`<div class="cuaderno"><h2 class="titulo">📓 Cuaderno de detective</h2><div class="texto">${lista}</div>
    <button class="boton boton-principal" data-cerrar>Cerrar</button></div>`);
}
