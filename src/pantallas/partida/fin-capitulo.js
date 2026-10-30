/**
 * @file Final del capítulo: pegatina, resumen, oferta de subir de nivel y qué hacer después.
 *
 * Capa: pantallas (partida). Navega a: partida (siguiente capítulo u otra vez), inicio.
 */
import { estado, partida, guardar } from '../../estado/sesion.js';
import * as Sonido from '../../servicios/sonido.js';
import { $ } from '../../util/dom.js';
import { guardarRegistro } from '../../dominio/registro-lectura.js';
import { anotarCapituloTerminado, nivelParaSubir, nivelActual } from '../../dominio/progreso.js';
import { app, irA } from '../../ui/navegacion.js';
import { cabecera } from '../../ui/cabecera.js';
import { palabras } from '../../ui/palabras.js';
import { aviso, confeti } from '../../ui/avisos.js';
import { comprobarYCelebrarMeta } from '../../ui/componentes/meta.js';

/** Bloque «¿Quieres subir al nivel…?». */
const htmlSubir = (subir) => `<div class="subir-nivel">
  <p class="linea texto">${palabras(`¡Has terminado todo el libro como ${nivelActual().nombre}! ¿Quieres subir al nivel ${subir.nombre}?`)}</p>
  <div class="barra-botones centrada">
    <button class="boton boton-principal" id="subir">${subir.icono} ¡Sí, quiero subir!</button>
    <button class="boton boton-suave" id="no-subir">Todavía no</button>
  </div></div>`;

/** Cierra el capítulo en curso y pinta la pantalla final. */
export function terminarCapitulo() {
  guardarRegistro(true);
  comprobarYCelebrarMeta();
  const { libro, cap, capIndex, estrellas, leidas } = partida;
  const { pegatina, nueva } = anotarCapituloTerminado(libro, cap);
  const subir = nivelParaSubir(libro);
  guardar();
  Sonido.tocar('fin'); confeti(70);

  const siguiente = libro.capitulos[capIndex + 1];
  app.innerHTML = `
    ${cabecera()}
    <section class="final-capitulo">
      <div class="pegatina-grande${nueva ? ' nueva' : ''}" aria-hidden="true">${pegatina}</div>
      <h1 class="titulo-grande">${palabras('¡Capítulo terminado!')}</h1>
      <p class="linea texto">${palabras(nueva ? 'Has ganado una pegatina nueva para el álbum.' : '¡Otra vez resuelto, y cada vez es distinto!')}</p>
      <div class="resumen-final">
        <div><b>${estrellas}</b><span>⭐ estrellas</span></div>
        <div><b>${leidas}</b><span>🎤 frases leídas</span></div>
      </div>
      ${subir ? htmlSubir(subir) : ''}
      <div class="barra-botones centrada">
        ${siguiente ? `<button class="boton boton-principal boton-grande" id="sig-cap">Capítulo ${capIndex + 2} →</button>` : ''}
        <button class="boton boton-suave" id="otra-vez">🔁 Jugar otra vez</button>
        <button class="boton boton-suave" id="a-casa">🏠 Volver a casa</button>
      </div>
    </section>`;
  $('#otra-vez').onclick = irA('partida', libro, capIndex);
  $('#a-casa').onclick = irA('inicio');
  if (siguiente) $('#sig-cap').onclick = irA('partida', libro, capIndex + 1);
  if (subir) {
    $('#subir').onclick = () => {
      estado.nivel = subir.id; guardar();
      Sonido.tocar('fin'); confeti(80);
      aviso(`¡Ahora eres ${subir.nombre}! ${subir.icono}`);
      $('.subir-nivel').remove();
    };
    $('#no-subir').onclick = () => $('.subir-nivel').remove();
  }
}
