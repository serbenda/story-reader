/**
 * @file Un libro: portada, resumen y lista de capítulos (con candado los que faltan por abrir).
 *
 * Capa: pantallas. Navega a: inicio, partida.
 */
import { estado, guardar, fijarPartida } from '../estado/sesion.js';
import { NIVELES } from '../config/index.js';
import * as Arte from '../arte/index.js';
import { rellenar } from '../contenido/plantillas.js';
import { $, $$, esc } from '../util/dom.js';
import { varsBasicas, tituloCapitulo } from '../dominio/variables.js';
import { capituloAbierto, nivelesTerminados, clavePegatina } from '../dominio/progreso.js';
import { app, ir, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera, botonVolver } from '../ui/cabecera.js';

/**
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @param {import('../contenido/catalogo.js').Capitulo} cap
 * @param {number} i
 * @param {Record<string, any>} vars
 */
function htmlCapitulo(libro, cap, i, vars) {
  const abierto = capituloAbierto(libro, i);
  const hechos = nivelesTerminados(libro.id, cap.id);
  const sellos = NIVELES.filter((nv) => hechos[nv.id]).map((nv) => `<span title="${nv.nombre}">${nv.icono}</span>`).join('');
  const pegatina = cap.meta.pegatina && estado.album.pegatinas[clavePegatina(libro.id, cap.id)] ? cap.meta.pegatina : '';
  return `<li>
    <button class="capitulo${abierto ? '' : ' cerrado'}" ${abierto ? '' : 'disabled'} data-libro="${esc(libro.id)}" data-capitulo="${i}">
      <span class="num">${abierto ? i + 1 : '🔒'}</span>
      <span class="cap-texto"><span class="cap-titulo">${esc(tituloCapitulo(cap))}</span>
      <span class="cap-resumen">${esc(abierto ? rellenar(cap.meta.resumen || '', vars) : 'Termina el capítulo anterior para abrirlo.')}</span></span>
      <span class="sellos">${sellos || pegatina}</span>
    </button></li>`;
}

/** @param {import('../contenido/catalogo.js').Libro} libro */
function pantallaLibro(libro) {
  fijarPartida(null);
  estado.ultimoLibro = libro.id; guardar();
  const vars = varsBasicas();
  app.innerHTML = `
    ${cabecera(botonVolver('← Biblioteca'))}
    <section class="libro">
      <div class="libro-cabecera">
        <div class="libro-portada">${Arte.paisaje(libro.meta.portada || 'bosque', { semilla: 3 })}</div>
        <div><p class="sobretitulo">Libro</p><h2 class="titulo">${esc(libro.meta.titulo || libro.id)}</h2>
        <p class="libro-resumen">${esc(rellenar(libro.meta.resumen || '', vars))}</p></div>
      </div>
      <ol class="capitulos">${libro.capitulos.map((cap, i) => htmlCapitulo(libro, cap, i, vars)).join('')}</ol>
    </section>`;
  $('#volver').onclick = irA('inicio');
  $$('[data-capitulo]').forEach((b) => b.addEventListener('click', () => ir('partida', libro, +b.dataset.capitulo)));
}

registrarPantalla('libro', pantallaLibro);
