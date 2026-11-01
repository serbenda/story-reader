/**
 * @file Mi frase: escribe su propia frase, la escucha leída en voz alta y la guarda.
 *
 * Capa: pantallas (practica). Navega a: practica.
 * Escuchar lo que ha escrito ayuda a encontrar sola sus errores (falta una
 * letra, sobra una palabra…). Se le recuerda empezar con mayúscula y acabar
 * con punto, sin bloquearla. Las frases quedan guardadas para que los mayores
 * las vean en el informe y puedan repasarlas con ella.
 */
import { guardar } from '../../estado/sesion.js';
import { ESTRELLAS } from '../../config/index.js';
import * as Voz from '../../servicios/voz/index.js';
import { contarPalabras } from '../../contenido/frases.js';
import { $, esc } from '../../util/dom.js';
import { propuestaParaEscribir } from '../../dominio/ejercicios.js';
import { guardarEscrito } from '../../dominio/practica.js';
import { ultimosEscritos } from '../../dominio/informe.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { registrarPantalla } from '../../ui/navegacion.js';
import { palabras } from '../../ui/palabras.js';
import { abrirSesion, marcoActividad, pintarFinSesion } from './comun.js';

/** Palabras mínimas para que sea una frase. */
const MINIMO_PALABRAS = 3;
/** Largo máximo de la frase. */
const MAX_LETRAS = 160;

function pantallaMiFrase() {
  const sesion = abrirSesion('escribir');
  const { titulo, tema } = propuestaParaEscribir();
  const cont = marcoActividad({ titulo: 'Mi frase', icono: '📝', sesion });
  const anteriores = ultimosEscritos(3);
  cont.innerHTML = `
    <p class="linea">${palabras(titulo)}</p>
    <textarea id="mi-frase" class="caja-escribir" rows="3" maxlength="${MAX_LETRAS}" spellcheck="false" autocapitalize="off" aria-label="Tu frase"></textarea>
    <ul class="comprobaciones">
      <li id="ok-mayuscula">Empieza con mayúscula</li>
      <li id="ok-punto">Termina con punto (o ? o !)</li>
    </ul>
    <div class="barra-botones">
      <button class="boton boton-suave" id="escuchar-frase">🔊 Escuchar mi frase</button>
      <button class="boton boton-principal" id="guardar-frase">💾 Guardar mi frase</button>
    </div>
    <p class="respuesta" role="status"></p>
    ${anteriores.length ? `<h2 class="titulo">Tus últimas frases</h2><ul class="lista-escritos">${anteriores.map((e) => `<li class="linea">${esc(e.texto)}</li>`).join('')}</ul>` : ''}`;
  const caja = $('#mi-frase', cont), respuesta = $('.respuesta', cont);
  const revisar = () => {
    const t = caja.value.trim();
    const mayuscula = /^[¡¿«"]*\p{Lu}/u.test(t), punto = /[.!?…]["»]?$/.test(t);
    $('#ok-mayuscula', cont).classList.toggle('hecho', mayuscula);
    $('#ok-punto', cont).classList.toggle('hecho', punto);
    return { t, mayuscula, punto };
  };
  caja.addEventListener('input', revisar);
  $('#escuchar-frase', cont).onclick = () => { const { t } = revisar(); if (t) Voz.hablar(t, 0.8); else caja.focus(); };
  $('#guardar-frase', cont).onclick = () => {
    const { t, mayuscula, punto } = revisar();
    if (contarPalabras(t) < MINIMO_PALABRAS) { respuesta.textContent = 'Escribe una frase un poco más larga, de tres palabras o más.'; caja.focus(); return; }
    if (!mayuscula) { respuesta.textContent = '¡Qué buena frase! Ponle mayúscula a la primera letra.'; caja.focus(); return; }
    if (!punto) { respuesta.textContent = '¡Casi lista! ¿Qué se pone al final de una frase?'; caja.focus(); return; }
    guardarEscrito(t, tema);
    ganarEstrellas(ESTRELLAS.escrito);
    sesion.total = 1; sesion.primera = 1;
    guardar();
    Voz.hablar(t, 0.85);
    pintarFinSesion({ sesion, otraVez: 'mi-frase', mensaje: '¡Frase guardada! Los mayores podrán leerla en el informe.', detalle: `<p class="frase-guardada linea">«${esc(t)}»</p>` });
  };
  caja.focus();
}

registrarPantalla('mi-frase', pantallaMiFrase);
