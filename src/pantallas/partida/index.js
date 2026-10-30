/**
 * @file Pantalla de partida: va enseñando cada escena del capítulo bloque a bloque.
 *
 * Capa: pantallas (partida). Navega a: inicio (al salir).
 *
 * Flujo:
 *   ir('partida', libro, capIndex)
 *     → crearPartida()                      (src/dominio/partida.js)
 *     → mostrarEscena()  ── por cada escena:
 *         prepararEscenaActual() elige texto y lo parte en bloques
 *         revelar() enseña bloques hasta el primero que hay que superar
 *           (leer en voz alta, responder, abrir cerradura); al superarlo, sigue
 *         pintarFinEscena() → «Seguir →» o «¡Caso resuelto!»
 *     → terminarCapitulo()                  (./fin-capitulo.js)
 */
import { estado, partida, guardar, fijarPartida } from '../../estado/sesion.js';
import * as Voz from '../../servicios/voz/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { contarPartida } from '../../servicios/contador.js';
import { pistasDe } from '../../contenido/bloques.js';
import { $, esc, mostrarEnPantalla, confirmarConSegundoToque } from '../../util/dom.js';
import { crearPartida, prepararEscenaActual, esUltimaEscena, anotarPista } from '../../dominio/partida.js';
import { cerrarEscenaRegistro, guardarRegistro } from '../../dominio/registro-lectura.js';
import { tituloCapitulo } from '../../dominio/variables.js';
import { app, ir, registrarPantalla } from '../../ui/navegacion.js';
import { cabecera } from '../../ui/cabecera.js';
import { escenario } from '../../ui/escenario.js';
import { palabras } from '../../ui/palabras.js';
import { aviso } from '../../ui/avisos.js';
import { activarLinea, animarQuienHabla } from '../../ui/interacciones.js';
import { comprobarYCelebrarMeta } from '../../ui/componentes/meta.js';
import { tarjetaVoz } from './tarjeta-voz.js';
import { tarjetaPregunta } from './tarjeta-pregunta.js';
import { tarjetaReto } from './tarjeta-reto.js';
import { actualizarCuaderno, verCuaderno } from './cuaderno.js';
import { terminarCapitulo } from './fin-capitulo.js';

const BOTON_CASA = '🏠 <span class="solo-ancho">Casa</span>';

/** Tarjeta interactiva de cada tipo de bloque. Para un tipo nuevo, añádelo aquí. */
const TARJETAS = { voz: tarjetaVoz, pregunta: tarjetaPregunta, reto: tarjetaReto };

/** ¿Hay que superar este bloque antes de enseñar el siguiente? */
const bloqueaAvance = (b) => (b.tipo === 'voz' && !b.superado) || (b.tipo === 'pregunta' && !b.resuelta) || (b.tipo === 'reto' && !b.resuelto);

/** @param {Record<string, any>} b */
function pintarBloque(b) {
  const tarjeta = TARJETAS[b.tipo];
  if (tarjeta) return tarjeta(b, { alTerminar: revelar });
  const el = document.createElement('p');
  el.className = 'linea aparece' + (/^[—«]/.test(b.texto) ? ' dialogo' : '');
  el.innerHTML = palabras(b.texto);
  return el;
}

/** Enseña bloques hasta el siguiente que hay que superar; si no queda ninguno, el final de escena. */
function revelar() {
  const s = partida.escena, cont = $('#bloques');
  while (s.k < s.bloques.length) {
    const b = s.bloques[s.k];
    const el = pintarBloque(b);
    cont.appendChild(el);
    if (b.tipo === 'texto' && estado.ajustes.regla) activarLinea(el);
    if (s.k > 0) mostrarEnPantalla(el);
    for (const p of pistasDe(b.texto)) if (anotarPista(p)) actualizarCuaderno();
    animarQuienHabla(b.texto);
    s.k++;
    if (bloqueaAvance(b)) return;
  }
  pintarFinEscena();
}

function pintarFinEscena() {
  const final = esUltimaEscena();
  $('#pie-escena').innerHTML = `<button class="boton boton-principal boton-grande" id="seguir">${final ? '🏅 ¡Caso resuelto!' : 'Seguir →'}</button>`;
  const btn = $('#seguir');
  mostrarEnPantalla(btn);
  btn.onclick = () => {
    Sonido.tocar('pagina');
    if (final) return terminarCapitulo();
    partida.i++;
    mostrarEscena();
  };
}

function mostrarEscena() {
  cerrarEscenaRegistro();
  comprobarYCelebrarMeta();
  const { e } = prepararEscenaActual();
  guardar();

  const puntos = partida.escenas.map((_, i) => `<span class="${i < partida.i ? 'hecho' : i === partida.i ? 'activo' : ''}"></span>`).join('');
  app.innerHTML = `
    ${cabecera(`<button class="boton boton-suave boton-chico" id="salir">${BOTON_CASA}</button>
      <div class="titulo-cap"><span class="sobretitulo">Capítulo ${partida.capIndex + 1}</span><span class="nombre-cap">${esc(tituloCapitulo(partida.cap))}</span></div>`)}
    <div class="progreso-escenas" aria-label="Escena ${partida.i + 1} de ${partida.escenas.length}">${puntos}
      <button class="boton boton-suave boton-chico boton-cuaderno" id="cuaderno" ${partida.cuaderno.length || estado.nivel === 'superlectora' ? '' : 'hidden'}>📓 Cuaderno <b id="num-pistas">${partida.cuaderno.length}</b></button>
    </div>
    <div class="juego">
      <div class="escenario-sitio">${escenario(e.props, { tesoro: true })}</div>
      <section class="lectura" aria-live="polite">
        <div id="bloques" class="bloques texto"></div>
        <div id="pie-escena" class="pie-escena"></div>
      </section>
    </div>`;

  confirmarConSegundoToque($('#salir'), {
    pregunta: '¿Salir? Toca otra vez',
    alConfirmar: () => { Voz.parar(); guardarRegistro(false); comprobarYCelebrarMeta(); ir('inicio'); }
  });
  $('#cuaderno').onclick = verCuaderno;
  window.scrollTo({ top: 0 });
  revelar();
}

/**
 * @param {import('../../contenido/catalogo.js').Libro} libro
 * @param {number} capIndex
 */
function empezarCapitulo(libro, capIndex) {
  contarPartida();
  const nueva = crearPartida(libro, capIndex, { micro: !(estado.ajustes.sinMicro || !Voz.disponible()) });
  if (!nueva) { aviso('Este capítulo todavía no tiene textos para este nivel.'); return; }
  estado.ultimoLibro = libro.id;
  fijarPartida(nueva);
  Sonido.tocar('pagina');
  mostrarEscena();
}

registrarPantalla('partida', empezarCapitulo);
