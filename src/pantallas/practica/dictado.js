/**
 * @file Dictado mágico: el juego dice una palabra y ella la escribe con fichas de sílabas.
 *
 * Capa: pantallas (practica). Navega a: practica.
 *   - Las fichas incluyen sílabas «trampa» parecidas (b/d, p/q, sílaba invertida).
 *   - Si se equivoca, se marcan solo las sílabas que fallan y vuelven a la bandeja.
 *   - A los dos fallos se enseña la palabra separada en sílabas y se vuelve a intentar.
 *   - Desde Lectora se puede escribir con el teclado (en Superlectora, frases cortas).
 * Cada palabra se apunta en el registro de dictado para el informe.
 */
import { estado, guardar } from '../../estado/sesion.js';
import { EJERCICIOS_POR_SESION, DICTADO_POR_NIVEL, ELOGIOS } from '../../config/index.js';
import * as Voz from '../../servicios/voz/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { fichasDeDictado, corregirEscrito } from '../../contenido/dictado.js';
import { silabas } from '../../contenido/silabas.js';
import { $, $$, esc } from '../../util/dom.js';
import { azar } from '../../util/azar.js';
import { palabrasParaDictado, frasesParaDictado } from '../../dominio/ejercicios.js';
import { anotarDictado } from '../../dominio/practica.js';
import { registrarPantalla } from '../../ui/navegacion.js';
import { palabras } from '../../ui/palabras.js';
import { decir } from '../../ui/voz-alta.js';
import { confeti } from '../../ui/avisos.js';
import { abrirSesion, marcoActividad, pintarProgreso, contarEjercicio, pintarFinSesion } from './comun.js';

/** Fallos tras los que se enseña la palabra separada en sílabas. */
const FALLOS_PARA_AYUDA = 2;
/** Pausa entre sílabas al dictar despacio. */
const PASO_SILABA_MS = 800;

/** ¿Escribe con teclado? (se recuerda en los ajustes) */
const conTeclado = () => !!estado.ajustes.dictadoTeclado && (DICTADO_POR_NIVEL[estado.nivel] || {}).teclado;

/** Dice la palabra sílaba a sílaba, despacio. */
function dictarPorSilabas(palabra) {
  silabas(palabra).forEach((s, i) => setTimeout(() => Voz.hablar(s, 0.55), i * PASO_SILABA_MS));
}

/** Botones para volver a oír lo dictado. */
const botonesOir = (porSilabas) => `<div class="voz-controles">
  <button class="boton boton-principal boton-grande" id="oir">🔊 Escuchar</button>
  ${porSilabas ? '<button class="boton boton-suave" id="oir-silabas">🐢 Por sílabas</button>' : ''}</div>`;

/**
 * Una palabra con fichas de sílabas.
 * @param {HTMLElement} cont
 * @param {string} palabra
 * @param {(aLaPrimera: boolean) => void} alAcertar
 */
function ejercicioFichas(cont, palabra, alAcertar) {
  const cfg = DICTADO_POR_NIVEL[estado.nivel] || DICTADO_POR_NIVEL.aprendiz;
  const { silabas: sils, fichas } = fichasDeDictado(palabra, cfg.trampas);
  const puestas = sils.map(() => null);         // índice de ficha en cada hueco
  let fallos = 0;

  cont.innerHTML = `
    <p class="linea">${palabras('Escucha la palabra y escríbela con las sílabas.')}</p>
    ${botonesOir(true)}
    <div class="huecos" aria-label="Palabra que escribes">${sils.map((_, i) => `<button class="hueco-silaba" data-hueco="${i}" aria-label="Hueco ${i + 1}"></button>`).join('')}</div>
    <div class="bandeja">${fichas.map((f, i) => `<button class="ficha" data-ficha="${i}">${esc(f)}</button>`).join('')}</div>
    <p class="ayuda-dictado" hidden></p>
    <p class="respuesta" role="status"></p>`;

  const pintar = () => {
    $$('.hueco-silaba', cont).forEach((h, i) => { h.textContent = puestas[i] == null ? '' : fichas[puestas[i]]; h.classList.toggle('lleno', puestas[i] != null); });
    $$('.ficha', cont).forEach((f, i) => { f.hidden = puestas.includes(i); });
  };
  const comprobar = () => {
    const mal = puestas.map((p, i) => fichas[p] !== sils[i]);
    if (!mal.some(Boolean)) {
      anotarDictado(palabra, fallos === 0);
      $$('.hueco-silaba', cont).forEach((h) => { h.classList.add('bien'); h.disabled = true; });
      $$('.ficha', cont).forEach((f) => { f.disabled = true; });
      $('.respuesta', cont).textContent = fallos ? `¡Eso es! «${palabra}».` : `⭐ ${azar(ELOGIOS)}`;
      Sonido.tocar(fallos ? 'bien' : 'estrella'); confeti(20);
      decir(palabra, 0.8);
      setTimeout(() => alAcertar(fallos === 0), 1200);
      return;
    }
    fallos++;
    $$('.hueco-silaba', cont).forEach((h, i) => h.classList.toggle('mal', mal[i]));
    $('.respuesta', cont).textContent = 'Casi. Escucha otra vez y cambia las sílabas marcadas.';
    setTimeout(() => {
      mal.forEach((m, i) => { if (m) puestas[i] = null; });
      $$('.hueco-silaba', cont).forEach((h) => h.classList.remove('mal'));
      pintar();
      if (fallos >= FALLOS_PARA_AYUDA) {
        const ayuda = $('.ayuda-dictado', cont);
        ayuda.hidden = false;
        ayuda.innerHTML = `Mírala bien: ${sils.map((s, i) => `<span class="sil s${i % 2}">${esc(s)}</span>`).join('<span class="sil-punto">·</span>')}`;
        dictarPorSilabas(palabra);
      }
    }, 1100);
  };

  $$('.ficha', cont).forEach((f) => { f.onclick = () => {
    const libre = puestas.indexOf(null);
    if (libre < 0) return;
    puestas[libre] = +f.dataset.ficha;
    Voz.hablar(fichas[+f.dataset.ficha], 0.7);
    pintar();
    if (!puestas.includes(null)) comprobar();
  }; });
  $$('.hueco-silaba', cont).forEach((h) => { h.onclick = () => { puestas[+h.dataset.hueco] = null; pintar(); }; });
  $('#oir', cont).onclick = () => decir(palabra, 0.7);
  $('#oir-silabas', cont).onclick = () => dictarPorSilabas(palabra);
  setTimeout(() => decir(palabra, 0.7), 400);
}

/**
 * Una palabra o frase con teclado.
 * @param {HTMLElement} cont
 * @param {string} dictado
 * @param {(aLaPrimera: boolean) => void} alAcertar
 */
function ejercicioTeclado(cont, dictado, alAcertar) {
  let fallos = 0;
  const esFrase = /\s/.test(dictado.trim());
  cont.innerHTML = `
    <p class="linea">${palabras(esFrase ? 'Escucha la frase y escríbela con el teclado.' : 'Escucha la palabra y escríbela con el teclado.')}</p>
    ${botonesOir(!esFrase)}
    <input id="escrito" class="campo-nombre campo-dictado" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lo que escribes">
    <div class="barra-botones"><button class="boton boton-principal" id="comprobar">✓ Comprobar</button></div>
    <p class="respuesta" role="status"></p>`;
  const campo = $('#escrito', cont), respuesta = $('.respuesta', cont);
  const comprobar = () => {
    if (!campo.value.trim()) { campo.focus(); return; }
    const c = corregirEscrito(campo.value, dictado);
    if (c.bien || c.soloTildes) {
      anotarDictado(dictado, fallos === 0 && c.bien);
      respuesta.innerHTML = c.bien ? `⭐ ${esc(azar(ELOGIOS))}` : `¡Casi perfecto! Fíjate en las tildes: <b>${esc(dictado)}</b>`;
      Sonido.tocar(c.bien && !fallos ? 'estrella' : 'bien'); confeti(20);
      $('#comprobar', cont).disabled = true; campo.disabled = true;
      setTimeout(() => alAcertar(fallos === 0 && c.bien), c.bien ? 1200 : 2600);
      return;
    }
    fallos++;
    respuesta.textContent = fallos >= FALLOS_PARA_AYUDA ? `Mírala bien: ${dictado}. Ahora escríbela tú.` : 'Casi. Escucha otra vez y revisa letra a letra.';
    if (fallos >= FALLOS_PARA_AYUDA && !esFrase) dictarPorSilabas(dictado);
    campo.focus();
  };
  $('#comprobar', cont).onclick = comprobar;
  campo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') comprobar(); });
  $('#oir', cont).onclick = () => decir(dictado, 0.7);
  const s = $('#oir-silabas', cont); if (s) s.onclick = () => dictarPorSilabas(dictado);
  setTimeout(() => { decir(dictado, 0.7); campo.focus(); }, 400);
}

function pantallaDictado() {
  const sesion = abrirSesion('dictado');
  const cfg = DICTADO_POR_NIVEL[estado.nivel] || DICTADO_POR_NIVEL.aprendiz;
  const teclado = conTeclado();
  const lista = teclado && estado.nivel === 'superlectora'
    ? [...frasesParaDictado(Math.floor(EJERCICIOS_POR_SESION / 2)), ...palabrasParaDictado(EJERCICIOS_POR_SESION)].slice(0, EJERCICIOS_POR_SESION)
    : palabrasParaDictado(EJERCICIOS_POR_SESION);
  const cont = marcoActividad({
    titulo: 'Dictado mágico', icono: '✍️', sesion,
    extra: cfg.teclado ? `<label class="interruptor"><input type="checkbox" id="modo-teclado" ${teclado ? 'checked' : ''}><span class="pista-int" aria-hidden="true"></span>Escribir con el teclado</label>` : ''
  });
  const modo = $('#modo-teclado');
  if (modo) modo.onchange = () => { estado.ajustes.dictadoTeclado = modo.checked; guardar(); pantallaDictado(); };
  let i = 0;
  const siguiente = () => {
    pintarProgreso(i, lista.length);
    if (i >= lista.length) {
      pintarFinSesion({ sesion, otraVez: 'dictado', mensaje: sesion.primera >= lista.length - 1 ? '¡Dictado perfecto! Escribes de maravilla.' : '¡Dictado terminado! Cada vez te sale mejor.' });
      return;
    }
    const w = lista[i++];
    const alAcertar = (aLaPrimera) => { contarEjercicio(sesion, aLaPrimera); guardar(); siguiente(); };
    (teclado ? ejercicioTeclado : ejercicioFichas)(cont, w, alAcertar);
  };
  if (!lista.length) { cont.innerHTML = `<p class="linea">${palabras('Todavía no hay palabras para dictar. ¡Lee un cuento primero!')}</p>`; return; }
  siguiente();
}

registrarPantalla('dictado', pantallaDictado);
