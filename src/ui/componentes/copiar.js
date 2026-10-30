/**
 * @file Copiar un texto al portapapeles, o enseñarlo para copiarlo a mano.
 *
 * Capa: ui. Algunos navegadores (o páginas sin https) no dejan copiar: en ese
 * caso se abre una capa con el texto ya seleccionado.
 */
import { $, esc } from '../../util/dom.js';
import { copiarAlPortapapeles } from '../../servicios/plataforma.js';
import { aviso, abrirCapa } from '../avisos.js';

/**
 * @param {string} texto
 * @param {object} opciones
 * @param {string} opciones.titulo       Título de la capa de respaldo.
 * @param {string} opciones.idCaja       id del <textarea> de la capa (las pruebas lo buscan).
 * @param {string} opciones.exito        Aviso si se copia bien.
 * @param {number} [opciones.filas=6]
 * @param {boolean} [opciones.soloLectura=false]
 */
export function copiarOMostrar(texto, { titulo, idCaja, exito, filas = 6, soloLectura = false }) {
  const respaldo = () => {
    abrirCapa(`<div class="cuaderno"><h2 class="titulo">${esc(titulo)}</h2><textarea class="resumen-copia" id="${idCaja}" rows="${filas}"${soloLectura ? ' readonly' : ''}>${esc(texto)}</textarea>
      <p class="nota">Selecciona ${soloLectura ? 'todo el texto' : 'el texto'} y cópialo.</p><button class="boton boton-principal" data-cerrar>Cerrar</button></div>`);
    const caja = $('#' + idCaja); caja.focus(); caja.select();
  };
  copiarAlPortapapeles(texto).then(() => aviso(exito), respaldo);
}
