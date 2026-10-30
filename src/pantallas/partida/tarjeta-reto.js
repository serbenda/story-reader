/**
 * @file Tarjeta «Cerradura mágica»: el minijuego de letras al final de algunas escenas.
 *
 * Capa: pantallas (partida). El reto lo crea src/dominio/cerraduras.js. Si no
 * se puede crear ninguno con las palabras de la escena, la tarjeta no se
 * enseña y se da por abierta.
 */
import { partida, guardar } from '../../estado/sesion.js';
import { ESTRELLAS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { $, $$, esc } from '../../util/dom.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { crearReto } from '../../dominio/cerraduras.js';
import { palabras } from '../../ui/palabras.js';
import { confeti } from '../../ui/avisos.js';
import { decir } from '../../ui/voz-alta.js';

/**
 * @param {Record<string, any>} b  Bloque de tipo «reto» (guarda «resuelto»).
 * @param {{alTerminar: () => void}} opciones
 * @returns {HTMLElement}
 */
export function tarjetaReto(b, { alTerminar }) {
  const el = document.createElement('div');
  const r = crearReto(partida.escena.bloques.filter((x) => x.tipo !== 'reto').map((x) => x.texto));
  if (!r) { b.resuelto = true; el.hidden = true; return el; }
  const enunciado = r.tipo === 'letra' ? '¿Qué letra falta?' : '¿Cuál está bien escrita?';
  el.className = 'tarjeta-reto aparece';
  el.innerHTML = `
    <div class="voz-cabecera"><span aria-hidden="true">🔒</span> Cerradura mágica</div>
    <p class="pregunta linea">${palabras(`Para seguir, abre la cerradura. ${enunciado}`)}</p>
    ${r.tipo === 'letra' ? `<p class="reto-palabra" aria-label="Palabra con una letra que falta">${[...r.palabra].map((c, i) => (i === r.hueco ? '<span class="reto-hueco">?</span>' : esc(c))).join('')}</p>` : ''}
    <div class="reto-opciones reto-${r.tipo}">${r.opciones.map((o, i) => `<button class="opcion reto-opcion" data-i="${i}">${esc(o)}</button>`).join('')}</div>
    <div class="voz-controles"><button class="boton boton-suave boton-chico reto-oir">🔊 Escuchar la palabra</button></div>
    <p class="respuesta" role="status"></p>`;
  let fallos = 0;
  $('.reto-oir', el).onclick = () => decir(r.palabra, 0.7);
  $$('.reto-opcion', el).forEach((btn) => btn.addEventListener('click', () => {
    if (b.resuelto) return;
    if (r.opciones[+btn.dataset.i] === r.correcta) {
      b.resuelto = true;
      btn.classList.add('correcta');
      $$('.reto-opcion', el).forEach((x) => { x.disabled = true; });
      if (r.tipo === 'letra') { const h = $('.reto-hueco', el); h.textContent = r.correcta; h.classList.add('puesta'); }
      partida.reg.retos++;
      if (!fallos) { partida.reg.retosPrimera++; ganarEstrellas(ESTRELLAS.cerradura); }
      guardar();
      $('.respuesta', el).textContent = `${fallos ? '¡Eso es!' : '⭐'} ¡La cerradura se abre! 🔓`;
      el.classList.add('abierta');
      Sonido.tocar('estrella'); confeti(20);
      setTimeout(alTerminar, 900);
    } else {
      fallos++;
      btn.classList.add('mal'); btn.disabled = true;
      $('.respuesta', el).textContent = r.tipo === 'letra'
        ? 'Casi. Fíjate hacia dónde mira la letra. Puedes escuchar la palabra.'
        : 'Casi. Léelas despacio, letra a letra.';
    }
  }));
  return el;
}
