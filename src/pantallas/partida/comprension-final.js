/**
 * @file «Preguntas del detective»: comprensión al final del capítulo, sin el texto delante.
 *
 * Capa: pantallas (partida). Las preguntas las crea src/dominio/comprension.js
 * con lo que la niña ha leído. Una a una; si falla, se anima y se puede volver
 * a intentar (nunca un «¡mal!»). Cada acierto a la primera da una estrella.
 */
import { partida, guardar } from '../../estado/sesion.js';
import { ESTRELLAS, ELOGIOS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { $, $$ } from '../../util/dom.js';
import { azar, barajar } from '../../util/azar.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { app } from '../../ui/navegacion.js';
import { cabecera } from '../../ui/cabecera.js';
import { palabras, htmlTexto } from '../../ui/palabras.js';
import { confeti } from '../../ui/avisos.js';

/** Espera tras acertar antes de pasar a la siguiente pregunta. */
const PAUSA_MS = 1100;

/** Apunta una pregunta resuelta en el registro y da la estrella si fue a la primera. */
function anotar(aLaPrimera) {
  partida.reg.comprension = (partida.reg.comprension || 0) + 1;
  if (aLaPrimera) { partida.reg.comprensionPrimera = (partida.reg.comprensionPrimera || 0) + 1; ganarEstrellas(ESTRELLAS.comprension); }
  guardar();
}

/** Pregunta de ordenar: se tocan los pasos en el orden en que pasaron. */
function pintarOrdenar(p, cont, siguiente) {
  const piezas = barajar(p.pasos.map((texto, orden) => ({ texto, orden })));
  let paso = 0, fallos = 0;
  cont.innerHTML = `<p class="pregunta linea">${palabras(p.texto)}</p>
    <div class="opciones opciones-orden">${piezas.map((x, i) => `<button class="opcion opcion-orden" data-i="${i}"><span class="orden-num" aria-hidden="true"></span><span class="opcion-texto">${htmlTexto(x.texto)}</span></button>`).join('')}</div>
    <p class="respuesta" role="status"></p>`;
  $$('.opcion-orden', cont).forEach((btn) => btn.addEventListener('click', (ev) => {
    if (ev.target.closest('.palabra') || btn.disabled) return;
    const x = piezas[+btn.dataset.i];
    if (x.orden !== paso) {
      fallos++;
      btn.classList.remove('mal'); void btn.offsetWidth; btn.classList.add('mal');
      $('.respuesta', cont).textContent = paso === 0 ? 'Casi. ¿Qué pasó primero de todo?' : 'Casi. ¿Qué pasó justo después?';
      return;
    }
    paso++;
    btn.disabled = true; btn.classList.add('correcta');
    $('.orden-num', btn).textContent = paso;
    if (paso < p.pasos.length) { $('.respuesta', cont).textContent = '¡Eso es! ¿Y después?'; return; }
    anotar(fallos === 0);
    $('.respuesta', cont).textContent = `${fallos ? '¡Lo has ordenado!' : '⭐ ' + azar(ELOGIOS)}`;
    Sonido.tocar(fallos ? 'bien' : 'estrella'); confeti(24);
    setTimeout(siguiente, PAUSA_MS);
  }));
}

/** Pregunta de elegir una opción. */
function pintarOpciones(p, cont, siguiente) {
  let fallos = 0;
  cont.innerHTML = `<p class="pregunta linea">${palabras(p.texto)}</p>
    <div class="opciones">${p.opciones.map((o, i) => `<button class="opcion" data-i="${i}"><span class="opcion-texto">${htmlTexto(o.texto)}</span></button>`).join('')}</div>
    <p class="respuesta" role="status"></p>`;
  $$('.opcion', cont).forEach((btn) => btn.addEventListener('click', (ev) => {
    if (ev.target.closest('.palabra') || btn.disabled) return;
    if (!p.opciones[+btn.dataset.i].correcta) {
      fallos++;
      btn.classList.add('mal'); btn.disabled = true;
      $('.respuesta', cont).textContent = 'Casi. Intenta recordar lo que leíste.';
      return;
    }
    btn.classList.add('correcta');
    $$('.opcion', cont).forEach((x) => { x.disabled = true; });
    anotar(fallos === 0);
    $('.respuesta', cont).textContent = fallos ? '¡Eso es! Te has acordado.' : '⭐ ' + azar(ELOGIOS);
    Sonido.tocar(fallos ? 'bien' : 'estrella'); confeti(24);
    setTimeout(siguiente, PAUSA_MS);
  }));
}

/**
 * Enseña las preguntas una a una y, al acabar, llama a `alTerminar`.
 * @param {import('../../dominio/comprension.js').PreguntaComprension[]} preguntas
 * @param {() => void} alTerminar
 */
export function mostrarComprension(preguntas, alTerminar) {
  let i = 0;
  app.innerHTML = `
    ${cabecera()}
    <section class="comprension">
      <p class="sobretitulo">Capítulo ${partida.capIndex + 1} · sin mirar el cuento</p>
      <h1 class="titulo-grande">${palabras('🔎 Preguntas del detective')}</h1>
      <div class="pasos" aria-hidden="true">${preguntas.map(() => '<span></span>').join('')}</div>
      <div class="tarjeta-pregunta texto" id="pregunta-final"></div>
    </section>`;
  const cont = $('#pregunta-final');
  const marcar = () => $$('.comprension .pasos span').forEach((s, k) => { s.className = k < i ? 'hecho' : k === i ? 'activo' : ''; });
  const siguiente = () => {
    if (!partida || !cont.isConnected) return;     // se salió mientras tanto
    if (i >= preguntas.length) { alTerminar(); return; }
    marcar();
    const p = preguntas[i++];
    (p.tipo === 'ordenar' ? pintarOrdenar : pintarOpciones)(p, cont, siguiente);
  };
  siguiente();
}
