/**
 * @file Grabar, escuchar y borrar la voz de la familia (en Ajustes y en el Informe).
 *
 * Capa: ui. El almacenamiento está en src/servicios/grabaciones.js.
 * Uso: pintar {@link htmlGrabaciones} / {@link htmlSugerenciasGrabar} y luego
 * llamar a {@link activarGrabaciones} con la función que vuelve a pintar la pantalla.
 */
import * as Grabaciones from '../../servicios/grabaciones.js';
import * as Voz from '../../servicios/voz/index.js';
import { $, $$, esc, confirmarConSegundoToque } from '../../util/dom.js';
import { claveDePalabra, palabrasDificiles } from '../../dominio/registro-lectura.js';
import { aviso } from '../avisos.js';

/** Duración máxima de una grabación de palabra. */
const DURACION_MS = 3000;
/** Una grabación más pequeña está vacía (se pulsó sin hablar). */
const BYTES_MINIMOS = 800;

/** Lista de palabras grabadas con sus botones. @returns {string} */
export function htmlGrabaciones() {
  const lista = Grabaciones.lista();
  if (!lista.length) return '<p class="nota">Todavía no hay palabras grabadas.</p>';
  return `<ul class="lista-grabadas">${lista.map((w) => `<li><span class="palabra-grabada">${esc(w)}</span>
    <button class="boton boton-suave boton-chico" data-escuchar-grab="${esc(w)}" aria-label="Escuchar ${esc(w)}">▶</button>
    <button class="boton boton-suave boton-chico" data-grabar="${esc(w)}" aria-label="Grabar otra vez ${esc(w)}">🎙️</button>
    <button class="boton boton-suave boton-chico" data-borrar-grab="${esc(w)}" aria-label="Borrar ${esc(w)}">🗑️</button></li>`).join('')}</ul>`;
}

/** Chips para grabar las palabras difíciles que aún no tienen grabación. @returns {string} */
export function htmlSugerenciasGrabar() {
  const faltan = palabrasDificiles().map(([w]) => w).filter((w) => !Grabaciones.tiene(w)).slice(0, 8);
  if (!faltan.length) return '';
  return `<p class="etiqueta-opcion">Palabras que le cuestan, sin grabar</p><div class="chips">${faltan.map((w) => `<button class="chip chip-peque" data-grabar="${esc(w)}">🎙️ ${esc(w)}</button>`).join('')}</div>`;
}

/**
 * Graba una palabra con el botón como indicador (tocarlo otra vez para antes).
 * @param {string} palabra
 * @param {HTMLElement} boton
 * @param {() => void} [alTerminar]
 */
async function grabarPalabra(palabra, boton, alTerminar) {
  const clave = claveDePalabra(palabra);
  if (!clave) { aviso('Escribe primero la palabra.'); return; }
  const textoAntes = boton.innerHTML;
  try {
    Voz.parar();
    const blob = await Grabaciones.grabar({
      maxMs: DURACION_MS,
      alEmpezar: (parar) => { boton.innerHTML = '⏺ Grabando… (toca para parar)'; boton.classList.add('grabando'); boton.onclick = parar; }
    });
    if (blob.size < BYTES_MINIMOS) throw new Error('vacía');
    await Grabaciones.guardar(clave, blob);
    Grabaciones.reproducirYa(clave);
    aviso(`🎙️ «${clave}» grabada. Ahora suena con tu voz.`);
  } catch (e) {
    console.warn(e);
    aviso(e && e.name === 'NotAllowedError' ? 'El navegador no deja usar el micro. Dale permiso y prueba otra vez.' : 'No se ha podido grabar. Prueba otra vez.', 5000);
  } finally {
    boton.classList.remove('grabando'); boton.innerHTML = textoAntes;
    alTerminar?.();
  }
}

/**
 * Conecta los botones de grabar, escuchar y borrar de la pantalla actual.
 * @param {() => void} refrescar  Vuelve a pintar la pantalla tras un cambio.
 */
export function activarGrabaciones(refrescar) {
  const nueva = $('#grabar-nueva');
  if (nueva) nueva.onclick = () => grabarPalabra($('#palabra-grabar').value, nueva, refrescar);
  $$('[data-grabar]').forEach((b) => { b.onclick = () => grabarPalabra(b.dataset.grabar, b, refrescar); });
  $$('[data-escuchar-grab]').forEach((b) => { b.onclick = () => Grabaciones.reproducirYa(b.dataset.escucharGrab); });
  $$('[data-borrar-grab]').forEach((b) => confirmarConSegundoToque(b, {
    pregunta: '¿Borrar?',
    alConfirmar: async () => { await Grabaciones.borrar(b.dataset.borrarGrab); refrescar(); }
  }));
}
