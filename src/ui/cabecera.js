/**
 * @file Cabecera común: marca o botones a la izquierda, contador de estrellas a la derecha.
 *
 * Capa: ui. El contador se anima solo cuando cambian las estrellas (escucha el
 * evento 'estrellas-cambiadas' del dominio).
 */
import { $, esc, reanimar } from '../util/dom.js';
import { escuchar } from '../util/eventos.js';
import { saldo } from '../dominio/estrellas.js';

/**
 * @param {string} [izquierda]  HTML para la izquierda (por defecto, el nombre del juego).
 * @returns {string}
 */
export function cabecera(izquierda = '') {
  return `<header class="cabecera">
    <div class="cabecera-izq">${izquierda || '<span class="marca">La biblioteca mágica</span>'}</div>
    <div class="cabecera-der">
      <span class="contador-estrellas" aria-label="Estrellas"><span aria-hidden="true">⭐</span> <b id="total-estrellas">${saldo()}</b></span>
    </div>
  </header>`;
}

/**
 * Botón «← Volver» (o con otro texto) para la cabecera. Su id es «volver».
 * @param {string} [texto='← Volver']
 */
export const botonVolver = (texto = '← Volver') => `<button class="boton boton-suave boton-chico" id="volver">${esc(texto)}</button>`;

/** Hace brillar el contador con el saldo nuevo. */
function actualizarContador({ saldo: s }) {
  const c = $('#total-estrellas');
  if (!c) return;
  c.textContent = s;
  reanimar(c.closest('.contador-estrellas'), 'brilla');
}

/** Conecta el contador con los cambios de estrellas. Llamar una vez al arrancar. */
export const activarContadorEstrellas = () => escuchar('estrellas-cambiadas', actualizarContador);
