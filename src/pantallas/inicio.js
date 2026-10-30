/**
 * @file Casa: las protagonistas, la meta del día, «seguir leyendo» y la estantería.
 *
 * Capa: pantallas. Navega a: album, personalizar, tienda, ajustes (manteniendo
 * pulsado), libro y partida.
 */
import { estado, catalogo, fijarPartida } from '../estado/sesion.js';
import { COLORES_TAPA } from '../config/index.js';
import * as Arte from '../arte/index.js';
import { rellenar } from '../contenido/plantillas.js';
import { $, $$, esc } from '../util/dom.js';
import { protagonistas, sonDosNinas } from '../dominio/protagonistas.js';
import { varsBasicas } from '../dominio/variables.js';
import { capituloHecho, nivelActual, siguienteParaLeer, clavePegatina, PEGATINA_POR_DEFECTO } from '../dominio/progreso.js';
import { app, ir, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera } from '../ui/cabecera.js';
import { escenario } from '../ui/escenario.js';
import { palabras } from '../ui/palabras.js';
import { cerrarCapa } from '../ui/avisos.js';
import { htmlMeta } from '../ui/componentes/meta.js';
import { puertaMayores } from '../ui/componentes/puerta-mayores.js';

/** Semilla base de los dibujos de las tapas (cada libro suma su posición). */
const SEMILLA_TAPAS = 3;

/**
 * Lomo de un libro en la estantería, con sus pegatinas conseguidas.
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @param {number} i  Posición (elige el color de la tapa).
 */
function htmlLomo(libro, i) {
  const hechos = libro.capitulos.filter((c) => capituloHecho(libro.id, c.id)).length;
  const total = libro.capitulos.length;
  const pegatinas = libro.capitulos.map((c) => estado.album.pegatinas[clavePegatina(libro.id, c.id)]
    ? `<span class="emoji">${c.meta.pegatina || PEGATINA_POR_DEFECTO}</span>` : '<span class="hueco"></span>').join('');
  return `<li><button class="libro-tapa" data-libro-abrir="${esc(libro.id)}" style="--tapa:${COLORES_TAPA[i % COLORES_TAPA.length]}">
    <span class="tapa-dibujo">${Arte.paisaje(libro.meta.portada || 'bosque', { semilla: SEMILLA_TAPAS + i })}</span>
    <span class="tapa-texto">
      <span class="tapa-titulo">${esc(libro.meta.titulo || libro.id)}</span>
      <span class="tapa-resumen">${esc(rellenar(libro.meta.resumen || '', varsBasicas()))}</span>
      <span class="tapa-progreso">${pegatinas}<span class="tapa-cuenta">${hechos === total ? '¡Terminado!' : hechos ? `${hechos} de ${total}` : 'Nuevo'}</span></span>
    </span></button></li>`;
}

/** Título de la casa: «Alaia, Lucía y Toby» o «Alaia y Toby». */
function tituloEquipo() {
  const n = protagonistas(), mascota = estado.perfil.mascota.nombre;
  return sonDosNinas() ? `${n.lectora}, ${n.hermana} y ${mascota}` : `${n.lectora} y ${mascota}`;
}

function pantallaInicio() {
  fijarPartida(null);
  cerrarCapa();
  const n = nivelActual(), seguir = siguienteParaLeer();
  app.innerHTML = `
    ${cabecera()}
    <section class="inicio-hero">
      <div class="hero-escena">${escenario({ fondo: 'casa', con: ['mascota'] })}</div>
      <div class="hero-info">
        <h1 class="titulo-grande">${palabras(tituloEquipo())}</h1>
        <p class="nivel-actual"><span class="insignia-nivel">${n.icono}</span> Nivel <b>${n.nombre}</b></p>
        ${htmlMeta()}
        ${seguir ? `<button class="boton boton-principal boton-grande boton-seguir" id="seguir-leyendo">
          ▶ <span><span class="seguir-sub">Seguir leyendo</span>${esc(seguir.libro.meta.titulo || '')} · capítulo ${seguir.capIndex + 1}</span></button>` : ''}
        <div class="acciones-hero">
          <button class="boton boton-suave" id="album">📒 Álbum</button>
          <button class="boton boton-suave" id="vestir">🎨 Vestir</button>
          <button class="boton boton-suave" id="tienda">🛍️ Tienda</button>
          <button class="boton boton-suave boton-mayores" id="mayores" aria-describedby="ayuda-mayores"><span class="carga" aria-hidden="true"></span>⚙️ Mayores</button>
        </div>
        <p class="pista-pequena" id="ayuda-mayores" hidden>Mantén pulsado el botón para entrar.</p>
      </div>
    </section>
    <section class="estanteria-sitio">
      <h2 class="titulo">La biblioteca</h2>
      <ul class="estanteria">${catalogo.libros.map(htmlLomo).join('')}</ul>
    </section>`;

  $('#album').onclick = irA('album');
  $('#vestir').onclick = irA('personalizar', { primeraVez: false });
  $('#tienda').onclick = irA('tienda');
  puertaMayores($('#mayores'), irA('ajustes'));
  if (seguir) $('#seguir-leyendo').onclick = irA('partida', seguir.libro, seguir.capIndex);
  $$('[data-libro-abrir]').forEach((b) => b.addEventListener('click', () => ir('libro', catalogo.libros.find((l) => l.id === b.dataset.libroAbrir))));
}

registrarPantalla('inicio', pantallaInicio);
