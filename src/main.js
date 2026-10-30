/**
 * @file Punto de entrada: prepara los servicios, carga los libros y abre la primera pantalla.
 *
 * Es el único módulo que index.html carga directamente
 * (<script type="module" src="src/main.js">). El orden de arranque:
 *   1. Ajustes visuales y de voz, sonido, toques globales y contador de estrellas.
 *   2. Grabaciones de la familia y almacenamiento persistente (en segundo plano).
 *   3. Catálogo de libros (stories/). Si falla, se explica en pantalla.
 *   4. Bienvenida (primera vez) o casa.
 *   5. Modo sin conexión (service worker).
 */
import { estado, fijarCatalogo } from './estado/sesion.js';
import { cargarCatalogo } from './contenido/catalogo.js';
import * as Grabaciones from './servicios/grabaciones.js';
import { configurarSonido } from './servicios/sonido.js';
import { pedirAlmacenamientoPersistente, registrarModoSinConexion } from './servicios/plataforma.js';
import { esc } from './util/dom.js';
import { app, ir } from './ui/navegacion.js';
import { aplicarAjustes } from './ui/ajustes-visuales.js';
import { activarInteracciones } from './ui/interacciones.js';
import { activarContadorEstrellas } from './ui/cabecera.js';
import './pantallas/index.js';
import { exponerParaPruebas } from './depuracion.js';

async function iniciar() {
  aplicarAjustes();
  configurarSonido(() => !!estado.ajustes.sonido);
  activarInteracciones();
  activarContadorEstrellas();
  Grabaciones.iniciar();
  pedirAlmacenamientoPersistente();
  exponerParaPruebas();

  app.innerHTML = '<p class="cargando">Abriendo el libro…</p>';
  try {
    fijarCatalogo(await cargarCatalogo());
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="error"><h1 class="titulo">No se han podido cargar las historias</h1>
      <p>${esc(err.message)}</p><p class="nota">Si has abierto el archivo con doble clic, hace falta un servidor (por ejemplo, GitHub Pages).</p></div>`;
    return;
  }
  ir(estado.perfil ? 'inicio' : 'bienvenida');
  registrarModoSinConexion('sw.js');
}

iniciar();
