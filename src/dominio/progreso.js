/**
 * @file Capítulos terminados, pegatinas y subida de nivel.
 *
 * Capa: dominio. Un capítulo se abre cuando el anterior está terminado (en
 * cualquier nivel). Al terminar un libro entero en un nivel, se ofrece subir
 * al siguiente, una sola vez por nivel.
 */
import { estado, catalogo } from '../estado/sesion.js';
import { NIVELES, nivelPorId, posicionDeNivel } from '../config/index.js';

/** Pegatina por defecto si el capítulo no trae la suya. */
export const PEGATINA_POR_DEFECTO = '🏅';

/** Clave de una pegatina en el álbum. */
export const clavePegatina = (libroId, capId) => `${libroId}/${capId}`;

/**
 * Veces terminado cada nivel en un capítulo.
 * @param {string} libroId @param {string} capId
 * @returns {Record<string, number>}
 */
export const nivelesTerminados = (libroId, capId) => (estado.progreso[libroId] && estado.progreso[libroId][capId]) || {};

/**
 * ¿Se ha terminado el capítulo alguna vez?
 * @param {string} libroId @param {string} capId
 * @returns {boolean}
 */
export const capituloHecho = (libroId, capId) => Object.keys(nivelesTerminados(libroId, capId)).length > 0;

/**
 * ¿Se puede jugar el capítulo i? (el primero siempre; los demás, si el anterior está hecho)
 * @param {import('../contenido/catalogo.js').Libro} libro @param {number} i
 */
export const capituloAbierto = (libro, i) => i === 0 || capituloHecho(libro.id, libro.capitulos[i - 1].id);

/** @returns {import('../config/niveles.js').Nivel} */
export const nivelActual = () => nivelPorId(estado.nivel);

/**
 * El siguiente capítulo por leer del último libro que se abrió.
 * @returns {{libro: import('../contenido/catalogo.js').Libro, capIndex: number}|null}
 */
export function siguienteParaLeer() {
  const libro = catalogo.libros.find((l) => l.id === estado.ultimoLibro);
  if (!libro) return null;
  const i = libro.capitulos.findIndex((c) => !capituloHecho(libro.id, c.id));
  if (i < 0) return null;
  return { libro, capIndex: i };
}

/**
 * Apunta un capítulo terminado en el nivel actual y le da su pegatina. No guarda.
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @param {import('../contenido/catalogo.js').Capitulo} cap
 * @returns {{pegatina: string, nueva: boolean}}
 */
export function anotarCapituloTerminado(libro, cap) {
  const p = (estado.progreso[libro.id] = estado.progreso[libro.id] || {});
  const pc = (p[cap.id] = p[cap.id] || {});
  pc[estado.nivel] = (pc[estado.nivel] || 0) + 1;
  const clave = clavePegatina(libro.id, cap.id);
  const pegatina = cap.meta.pegatina || PEGATINA_POR_DEFECTO;
  const nueva = !estado.album.pegatinas[clave];
  estado.album.pegatinas[clave] = pegatina;
  return { pegatina, nueva };
}

/**
 * Si se acaba de terminar todo el libro en el nivel actual, devuelve el
 * siguiente nivel para ofrecerlo (y apunta que ya se ofreció). No guarda.
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @returns {import('../config/niveles.js').Nivel|null}
 */
export function nivelParaSubir(libro) {
  const i = posicionDeNivel(estado.nivel);
  if (i < 0 || i >= NIVELES.length - 1 || estado.ofrecidos[estado.nivel]) return null;
  const todo = libro.capitulos.every((c) => nivelesTerminados(libro.id, c.id)[estado.nivel]);
  if (!todo) return null;
  estado.ofrecidos[estado.nivel] = true;
  return NIVELES[i + 1];
}
