/**
 * @file Creación de una partida y elección del texto de cada escena.
 *
 * Capa: dominio. Una partida es un capítulo jugado en el nivel actual. Al
 * crearla se sortean las variables, se quitan las escenas sin texto para el
 * nivel, se añade el calentamiento de palabras mágicas (si toca) y se deciden
 * dónde van las cerraduras mágicas:
 *   - al final de la primera escena del cuento, siempre;
 *   - desde Novatilla, también en la penúltima (si el capítulo tiene más de dos).
 */
import { estado, partida } from '../estado/sesion.js';
import { versionesPara } from '../contenido/escenas.js';
import { rellenar } from '../contenido/plantillas.js';
import { bloques } from '../contenido/bloques.js';
import { azar } from '../util/azar.js';
import { prepararPartida, tituloCapitulo } from './variables.js';
import { escenaRepaso } from './repaso.js';
import { nuevoRegistro } from './registro-lectura.js';

/**
 * @typedef {object} EscenaEnCurso
 * @property {import('../contenido/escenas.js').Escena} e
 * @property {(import('../contenido/bloques.js').Bloque & Record<string, any>)[]} bloques
 *           Los bloques guardan su progreso (superado, resuelta, resuelto…).
 * @property {number} k  Siguiente bloque por enseñar.
 */

/**
 * @typedef {import('./variables.js').SorteoPartida & {
 *   libro: import('../contenido/catalogo.js').Libro,
 *   cap: import('../contenido/catalogo.js').Capitulo,
 *   capIndex: number,
 *   escenas: import('../contenido/escenas.js').Escena[],
 *   i: number,
 *   retos: Set<string>,
 *   semilla: number,
 *   estrellas: number,
 *   leidas: number,
 *   cuaderno: string[],
 *   tEscena: number|null,
 *   escena?: EscenaEnCurso,
 *   reg: import('../estado/almacen.js').Partida & {guardado?: boolean}
 * }} PartidaEnCurso
 */

/**
 * Crea una partida nueva (no la activa: eso lo hace quien llama con fijarPartida).
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @param {number} capIndex
 * @param {{micro: boolean}} opciones  ¿Se juega con micrófono?
 * @returns {PartidaEnCurso|null} null si el capítulo no tiene textos para este nivel.
 */
export function crearPartida(libro, capIndex, { micro }) {
  const cap = libro.capitulos[capIndex];
  const sorteo = prepararPartida(libro, cap);
  const escenas = cap.escenas.filter((e) => versionesPara(e, estado.nivel));
  if (!escenas.length) return null;
  const repaso = escenaRepaso(sorteo.vars);
  if (repaso) escenas.unshift(repaso);

  const cuento = escenas.filter((e) => !e.repaso);
  const retos = new Set([cuento[0] && cuento[0].id]);
  if (estado.nivel !== 'aprendiz' && cuento.length > 2) retos.add(cuento[cuento.length - 2].id);

  return {
    retos,
    libro, cap, capIndex, escenas, i: 0, ...sorteo,
    semilla: Math.floor(Math.random() * 1e6), estrellas: 0, leidas: 0, cuaderno: [],
    tEscena: null,
    reg: nuevoRegistro({ libro: libro.id, cap: cap.id, titulo: tituloCapitulo(cap), micro, repaso: repaso ? repaso.palabras : [] })
  };
}

/**
 * Elige una versión de la escena actual, la rellena y la parte en bloques.
 * Si la escena lleva cerradura, añade al final un bloque «reto».
 * Deja la escena en `partida.escena` y empieza a contar su tiempo.
 * @returns {EscenaEnCurso}
 */
export function prepararEscenaActual() {
  const e = partida.escenas[partida.i];
  const texto = rellenar(azar(versionesPara(e, estado.nivel)), partida.vars);
  partida.escena = { e, bloques: bloques(texto), k: 0 };
  if (partida.retos.has(e.id)) partida.escena.bloques.push({ tipo: 'reto', texto: '' });
  partida.tEscena = Date.now();
  // Los ayudantes que aparecen se apuntan en el álbum
  for (const c of e.props.con) if (c === 'ayudante' || c === 'ayudante2') estado.album.amigos[partida.ayudantes[c === 'ayudante' ? 0 : 1]] = true;
  return partida.escena;
}

/** ¿Es la escena actual la última del capítulo? */
export const esUltimaEscena = () => !!partida.escena.e.props.final || partida.i === partida.escenas.length - 1;

/**
 * Apunta una pista nueva en el cuaderno.
 * @param {string} pista
 * @returns {boolean} true si era nueva.
 */
export function anotarPista(pista) {
  if (partida.cuaderno.includes(pista)) return false;
  partida.cuaderno.push(pista);
  return true;
}
