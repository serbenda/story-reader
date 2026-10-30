/**
 * @file Tarjeta de pregunta: opciones del cuento o, si no las trae, «¿adónde vamos?»
 * con los tres lugares sorteados.
 *
 * Capa: pantallas (partida). Si se elige un lugar equivocado, se ve ese lugar
 * vacío y se anima a volver a leer la pista (nunca un «¡mal!»).
 */
import { partida, guardar } from '../../estado/sesion.js';
import { ELOGIOS, ESTRELLAS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { rellenar, capitalizar } from '../../contenido/plantillas.js';
import { $, $$ } from '../../util/dom.js';
import { azar, barajar } from '../../util/azar.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { varsLugar } from '../../dominio/variables.js';
import { palabras, htmlTexto } from '../../ui/palabras.js';
import { confeti, abrirCapa } from '../../ui/avisos.js';
import { escenario } from '../../ui/escenario.js';

/**
 * Enseña el lugar equivocado que se ha elegido.
 * @param {import('../../dominio/variables.js').Lugar} L
 */
function caminoEquivocado(L) {
  const v = Object.assign({}, partida.vars, varsLugar('elegido', L));
  const texto = rellenar(azar(partida.libro.meta.equivocado || ['{elegido}: aquí no hay nadie.']), v);
  abrirCapa(`
    <div class="equivocado">
      <div class="mini-escena">${escenario({ fondo: L.fondo, noche: partida.escena.e.props.noche }, { semilla: 99 })}</div>
      <div class="texto">${texto.split('\n').map((l) => `<p class="linea">${palabras(l)}</p>`).join('')}
        <p class="linea consejo">${palabras('Vuelve a leer la pista con calma.')}</p></div>
      <button class="boton boton-principal" data-cerrar>← Volver a la pista</button>
    </div>`);
}

/** Opciones de la pregunta, barajadas. Sin opciones en el cuento, son los lugares. */
function opcionesDe(b) {
  if (b.opciones.length) return barajar(b.opciones.map((o) => ({ texto: o.texto, correcta: o.correcta })));
  return barajar(['lugar', 'falso', 'otro'].map((k) => ({
    texto: capitalizar(partida.vars['al_' + k]), correcta: k === 'lugar', lugar: k, icono: partida.lugares[k].icono || ''
  })));
}

/**
 * @param {Record<string, any>} b  Bloque de tipo «pregunta» (guarda «resuelta»).
 * @param {{alTerminar: () => void}} opciones
 * @returns {HTMLElement}
 */
export function tarjetaPregunta(b, { alTerminar }) {
  const opciones = opcionesDe(b);
  let fallos = 0;
  const el = document.createElement('div');
  el.className = 'tarjeta-pregunta aparece';
  el.innerHTML = `
    <p class="pregunta linea">${palabras(b.texto)}</p>
    <div class="opciones">${opciones.map((o, i) => `
      <button class="opcion" data-i="${i}">${o.icono ? `<span class="opcion-icono" aria-hidden="true">${o.icono}</span>` : ''}<span class="opcion-texto">${htmlTexto(o.texto)}</span></button>`).join('')}</div>
    <p class="respuesta" role="status"></p>`;
  $$('.opcion', el).forEach((btn) => btn.addEventListener('click', (ev) => {
    if (ev.target.closest('.palabra')) return;
    const o = opciones[+btn.dataset.i];
    if (b.resuelta) return;
    if (o.correcta) {
      b.resuelta = true;
      btn.classList.add('correcta');
      $$('.opcion', el).forEach((x) => { x.disabled = true; });
      const msg = $('.respuesta', el);
      partida.reg.preguntas++;
      if (fallos === 0) {
        partida.reg.preguntasPrimera++;
        ganarEstrellas(ESTRELLAS.pregunta); guardar();
        msg.textContent = '⭐ ' + azar(ELOGIOS);
      } else msg.textContent = '¡Eso es! Lo has encontrado.';
      Sonido.tocar(fallos === 0 ? 'estrella' : 'bien'); confeti(26);
      setTimeout(alTerminar, 900);
      return;
    }
    fallos++;
    btn.classList.add('mal'); btn.disabled = true;
    if (o.lugar) caminoEquivocado(partida.lugares[o.lugar]);
    else $('.respuesta', el).textContent = rellenar(azar(partida.libro.meta.equivocado_pregunta || ['¡Prueba otra vez!']), partida.vars);
  }));
  return el;
}
