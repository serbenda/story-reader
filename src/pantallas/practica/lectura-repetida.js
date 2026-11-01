/**
 * @file Lectura relámpago: leer el mismo texto corto tres veces y ver cómo sube la velocidad.
 *
 * Capa: pantallas (practica). Navega a: practica.
 * Es la «lectura repetida», una técnica muy usada para la fluidez lectora:
 * al repetir, la niña ve con sus propios ojos que cada vez lee más rápido.
 * Se cronometra con dos botones (empezar / he terminado), así funciona también
 * sin micrófono. Se puede escuchar primero el texto leído por el juego.
 */
import { LECTURAS_REPETIDAS, ESTRELLAS } from '../../config/index.js';
import * as Voz from '../../servicios/voz/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { contarPalabras, palabrasPorMinuto } from '../../contenido/frases.js';
import { $ } from '../../util/dom.js';
import { textoLecturaRepetida } from '../../dominio/ejercicios.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { registrarPantalla } from '../../ui/navegacion.js';
import { palabras } from '../../ui/palabras.js';
import { confeti } from '../../ui/avisos.js';
import { abrirSesion, marcoActividad, pintarProgreso, pintarFinSesion } from './comun.js';

/**
 * Barras con la velocidad de cada lectura.
 * @param {number[]} ppm
 * @returns {string}
 */
function barras(ppm) {
  const max = Math.max(...ppm, 1);
  return `<div class="barras-velocidad">${ppm.map((v, i) => `
    <div class="barra-vel"><span class="barra-vel-valor">${v}</span><span class="barra-vel-columna" style="height:${Math.round(20 + 80 * v / max)}%"></span><span class="barra-vel-etiqueta">${i + 1}.ª</span></div>`).join('')}</div>
    <p class="nota centrada">palabras por minuto</p>`;
}

function pantallaLecturaRepetida() {
  const sesion = abrirSesion('repetida');
  const texto = textoLecturaRepetida();
  const n = contarPalabras(texto);
  const cont = marcoActividad({ titulo: 'Lectura relámpago', icono: '⚡', sesion });
  let inicio = 0;

  const pintarLectura = () => {
    const vez = sesion.ppm.length + 1;
    pintarProgreso(sesion.ppm.length, LECTURAS_REPETIDAS);
    cont.innerHTML = `
      <p class="linea">${palabras(vez === 1 ? 'Lee este texto en voz alta. Pulsa «Empezar» y, al terminar, «¡He terminado!».' : `Lectura ${vez} de ${LECTURAS_REPETIDAS}. ¿Podrás leerlo un poco más rápido?`)}</p>
      <div class="texto-repetido bloques"><p class="linea">${palabras(texto)}</p></div>
      ${sesion.ppm.length ? barras(sesion.ppm) : ''}
      <div class="voz-controles">
        <button class="boton boton-principal boton-grande" id="empezar-lectura">▶ Empezar</button>
        ${vez === 1 ? '<button class="boton boton-suave" id="escuchar-texto">🔊 Escucharlo primero</button>' : ''}
      </div>
      <p class="respuesta" role="status"></p>`;
    const boton = $('#empezar-lectura', cont);
    const oir = $('#escuchar-texto', cont); if (oir) oir.onclick = () => Voz.hablar(texto, 0.85);
    boton.onclick = () => {
      if (!inicio) {
        Voz.callar();
        inicio = Date.now();
        boton.textContent = '✅ ¡He terminado!';
        cont.classList.add('cronometrando');
        return;
      }
      const ppm = palabrasPorMinuto(n, Date.now() - inicio);
      inicio = 0;
      cont.classList.remove('cronometrando');
      if (!ppm) { $('.respuesta', cont).textContent = '¡Uy, qué rápido! ¿Lo has leído entero? Prueba otra vez.'; boton.textContent = '▶ Empezar'; return; }
      sesion.ppm.push(ppm);
      Sonido.tocar('bien');
      if (sesion.ppm.length < LECTURAS_REPETIDAS) return pintarLectura();
      terminar();
    };
  };

  const terminar = () => {
    const [primera] = sesion.ppm, ultima = sesion.ppm[sesion.ppm.length - 1];
    const mejora = ultima > primera;
    sesion.total = sesion.ppm.length;
    sesion.primera = mejora ? 1 : 0;
    if (mejora) { ganarEstrellas(ESTRELLAS.mejora); confeti(40); }
    pintarFinSesion({
      sesion, otraVez: 'lectura-repetida',
      mensaje: mejora ? `¡La última vez has leído un ${Math.round((ultima - primera) / primera * 100)} % más rápido que la primera!` : '¡Muy bien! Leer despacio y bien también es leer de maravilla.',
      detalle: barras(sesion.ppm)
    });
  };

  pintarLectura();
}

registrarPantalla('lectura-repetida', pantallaLecturaRepetida);
