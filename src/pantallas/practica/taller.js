/**
 * @file Taller de frases: ordenar palabras para formar la frase y completar frases.
 *
 * Capa: pantallas (practica). Navega a: practica.
 *   - Ordenar: las palabras salen desordenadas, sin mayúscula al principio ni
 *     signo al final. Hay que ordenarlas y poner la mayúscula y el punto
 *     (o el signo que toque): así se practica cómo se construye una oración.
 *   - Completar: falta una palabra y se elige entre tres.
 * Las frases salen de los deberes del cole y de los cuentos (src/dominio/ejercicios.js).
 */
import { guardar } from '../../estado/sesion.js';
import { EJERCICIOS_POR_SESION, ELOGIOS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import * as Voz from '../../servicios/voz/index.js';
import { comprobarOrden, montarFrase } from '../../contenido/frases.js';
import { $, $$, esc } from '../../util/dom.js';
import { azar } from '../../util/azar.js';
import { ejerciciosTaller } from '../../dominio/ejercicios.js';
import { registrarPantalla } from '../../ui/navegacion.js';
import { palabras, htmlTexto } from '../../ui/palabras.js';
import { decir } from '../../ui/voz-alta.js';
import { confeti } from '../../ui/avisos.js';
import { abrirSesion, marcoActividad, pintarProgreso, contarEjercicio, pintarFinSesion } from './comun.js';

/** Signos que se pueden poner al final. */
const SIGNOS = ['.', '?', '!'];

/** Celebra un acierto y pasa al siguiente. */
function acierto(cont, frase, fallos, alAcertar) {
  $('.respuesta', cont).textContent = fallos ? '¡Eso es! ¡Qué frase tan bien hecha!' : `⭐ ${azar(ELOGIOS)}`;
  Sonido.tocar(fallos ? 'bien' : 'estrella'); confeti(22);
  Voz.hablar(frase, 0.85);
  setTimeout(() => alAcertar(fallos === 0), 1500);
}

/**
 * Ordenar la frase, con mayúscula y signo final.
 * @param {HTMLElement} cont
 * @param {import('../../contenido/frases.js').FraseParaOrdenar} e
 * @param {(aLaPrimera: boolean) => void} alAcertar
 */
function ejercicioOrdenar(cont, e, alAcertar) {
  const elegidas = [];           // índices de e.piezas en el orden elegido
  let mayuscula = false, final = '', fallos = 0;
  cont.innerHTML = `
    <p class="linea">${palabras('Ordena las palabras para formar la frase. ¡No te olvides de la mayúscula y del punto!')}</p>
    <div class="frase-montada" aria-live="polite"></div>
    <div class="bandeja">${e.piezas.map((p, i) => `<button class="ficha ficha-palabra" data-pieza="${i}">${esc(p)}</button>`).join('')}</div>
    <div class="herramientas-frase">
      <button class="boton boton-suave boton-chico" id="mayuscula" aria-pressed="false">Aa Mayúscula</button>
      ${SIGNOS.map((s) => `<button class="boton boton-suave boton-chico signo" data-signo="${s}" aria-pressed="false">${s === '.' ? 'Punto  .' : s === '?' ? 'Pregunta  ¿?' : 'Exclamación  ¡!'}</button>`).join('')}
      <button class="boton boton-principal" id="comprobar" disabled>✓ Comprobar</button>
    </div>
    <p class="respuesta" role="status"></p>`;
  const montada = $('.frase-montada', cont);
  const pintar = () => {
    const ps = elegidas.map((i) => e.piezas[i]);
    const texto = ps.length ? montarFrase(ps, { mayuscula, final: final === '?' ? '?' : final === '!' ? '!' : final }) : '';
    const conApertura = final === '?' ? '¿' + texto : final === '!' ? '¡' + texto : texto;
    montada.innerHTML = ps.length ? elegidas.map((i, k) => `<button class="ficha ficha-puesta" data-puesta="${k}">${esc(k === 0 && mayuscula ? e.piezas[i].charAt(0).toUpperCase() + e.piezas[i].slice(1) : e.piezas[i])}</button>`).join(' ') + (final ? `<span class="signo-final">${esc(final)}</span>` : '') : '<span class="nota">Toca las palabras en orden…</span>';
    montada.dataset.texto = conApertura;
    $$('.ficha-palabra', cont).forEach((b, i) => { b.hidden = elegidas.includes(i); });
    $$('.ficha-puesta', cont).forEach((b) => { b.onclick = () => { elegidas.splice(+b.dataset.puesta, 1); pintar(); }; });
    $('#mayuscula', cont).setAttribute('aria-pressed', mayuscula);
    $('#mayuscula', cont).classList.toggle('elegida', mayuscula);
    $$('.signo', cont).forEach((b) => { b.setAttribute('aria-pressed', b.dataset.signo === final); b.classList.toggle('elegida', b.dataset.signo === final); });
    $('#comprobar', cont).disabled = elegidas.length !== e.piezas.length;
  };
  $$('.ficha-palabra', cont).forEach((b) => { b.onclick = () => { elegidas.push(+b.dataset.pieza); Voz.hablar(e.piezas[+b.dataset.pieza], 0.8); pintar(); }; });
  $('#mayuscula', cont).onclick = () => { mayuscula = !mayuscula; pintar(); };
  $$('.signo', cont).forEach((b) => { b.onclick = () => { final = final === b.dataset.signo ? '' : b.dataset.signo; pintar(); }; });
  $('#comprobar', cont).onclick = () => {
    const bienOrden = comprobarOrden(elegidas.map((i) => e.piezas[i]), e.correcta);
    const ordenOk = bienOrden.every(Boolean), signoOk = final === (e.final.includes('?') ? '?' : e.final.includes('!') ? '!' : '.');
    if (ordenOk && mayuscula && signoOk) {
      $$('.ficha-puesta', cont).forEach((b) => { b.classList.add('bien'); b.disabled = true; });
      $$('.herramientas-frase button', cont).forEach((b) => { b.disabled = true; });
      acierto(cont, e.frase, fallos, alAcertar);
      return;
    }
    fallos++;
    const r = $('.respuesta', cont);
    if (!ordenOk) {
      $$('.ficha-puesta', cont).forEach((b, k) => b.classList.toggle('mal', !bienOrden[k]));
      r.textContent = 'Casi. Lee la frase en voz alta: ¿suena bien? Mueve las palabras marcadas.';
    } else if (!mayuscula) r.textContent = '¡Las palabras están perfectas! ¿Con qué letra empieza una frase?';
    else r.textContent = '¡Muy bien ordenada! ¿Qué signo se pone al final?';
  };
  pintar();
}

/**
 * Completar la frase eligiendo la palabra que falta.
 * @param {HTMLElement} cont
 * @param {import('../../contenido/frases.js').FraseConHueco} e
 * @param {(aLaPrimera: boolean) => void} alAcertar
 */
function ejercicioCompletar(cont, e, alAcertar) {
  let fallos = 0;
  const frase = `${e.antes} ${e.correcta}${e.despues}`;
  cont.innerHTML = `
    <p class="linea">${palabras('¿Qué palabra falta?')}</p>
    <p class="frase-hueco linea">${htmlTexto(e.antes)} <span class="hueco-palabra">____</span>${htmlTexto(e.despues)}</p>
    <div class="opciones">${e.opciones.map((o, i) => `<button class="opcion" data-i="${i}"><span class="opcion-texto">${htmlTexto(o)}</span></button>`).join('')}</div>
    <div class="voz-controles"><button class="boton boton-suave boton-chico" id="oir-frase">🔊 Escuchar la frase</button></div>
    <p class="respuesta" role="status"></p>`;
  $('#oir-frase', cont).onclick = () => decir(`${e.antes} ${e.despues}`, 0.8);
  $$('.opcion', cont).forEach((b) => { b.onclick = (ev) => {
    if (ev.target.closest('.palabra') || b.disabled) return;
    const o = e.opciones[+b.dataset.i];
    if (o !== e.correcta) {
      fallos++;
      b.classList.add('mal'); b.disabled = true;
      $('.respuesta', cont).textContent = 'Casi. Lee la frase con esa palabra: ¿tiene sentido?';
      return;
    }
    b.classList.add('correcta');
    $$('.opcion', cont).forEach((x) => { x.disabled = true; });
    const hueco = $('.hueco-palabra', cont); hueco.textContent = e.correcta; hueco.classList.add('puesta');
    acierto(cont, frase, fallos, alAcertar);
  }; });
}

function pantallaTaller() {
  const sesion = abrirSesion('taller');
  const lista = ejerciciosTaller(EJERCICIOS_POR_SESION);
  const cont = marcoActividad({ titulo: 'Taller de frases', icono: '🧩', sesion });
  if (!lista.length) { cont.innerHTML = `<p class="linea">${palabras('Todavía no hay frases. ¡Lee un cuento primero!')}</p>`; return; }
  let i = 0;
  const siguiente = () => {
    pintarProgreso(i, lista.length);
    if (i >= lista.length) {
      pintarFinSesion({ sesion, otraVez: 'taller', mensaje: '¡Taller terminado! Ya sabes construir frases de detective.' });
      return;
    }
    const e = lista[i++];
    const alAcertar = (aLaPrimera) => { contarEjercicio(sesion, aLaPrimera); guardar(); siguiente(); };
    (e.tipo === 'completar' ? ejercicioCompletar : ejercicioOrdenar)(cont, e, alAcertar);
  };
  siguiente();
}

registrarPantalla('taller', pantallaTaller);
