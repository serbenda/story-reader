/**
 * @file La sesión de juego: el progreso, los libros cargados y la partida en curso.
 *
 * Capa: estado. Es el único sitio con estado global mutable. Se exportan como
 * «live bindings» de los módulos ES: quien importa `estado` ve siempre el
 * valor actual, pero solo este módulo puede reasignarlo (con las funciones
 * fijar… / reemplazar…). Así cualquier cambio de «qué objeto es el estado»
 * pasa por un sitio localizable.
 *
 *   import { estado, catalogo, partida, guardar } from '../estado/sesion.js';
 *   estado.estrellas += 1; guardar();
 */
import { cargarEstado, guardarEstado } from './almacen.js';

/** Progreso de la niña (se guarda). @type {import('./almacen.js').Estado} */
export let estado = cargarEstado();

/** Libros, mascotas y nombres por defecto (se carga al arrancar). @type {import('../contenido/catalogo.js').Catalogo|null} */
export let catalogo = null;

/** Partida en curso, o null fuera de un capítulo. @type {import('../dominio/partida.js').PartidaEnCurso|null} */
export let partida = null;

/** Guarda el progreso actual en el dispositivo. */
export const guardar = () => guardarEstado(estado);

/** @param {import('./almacen.js').Estado} nuevo  Sustituye todo el progreso (p. ej. al borrarlo). */
export function reemplazarEstado(nuevo) { estado = nuevo; }

/** @param {import('../contenido/catalogo.js').Catalogo} c */
export function fijarCatalogo(c) { catalogo = c; }

/** @param {import('../dominio/partida.js').PartidaEnCurso|null} p */
export function fijarPartida(p) { partida = p; }
