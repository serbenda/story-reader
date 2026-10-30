/**
 * @file Convierte un archivo Markdown de capítulo en datos.
 *
 * Capa: contenido. Formato (detallado en stories/GUIA-ESCRITURA.md):
 *
 *   ---                         ← cabecera YAML (título, resumen, lugares…)
 *   titulo: …
 *   ---
 *   ## nombre-de-escena         ← empieza una escena
 *   @fondo: bosque              ← propiedades de la escena (antes del primer nivel)
 *   @con: mascota, ayudante
 *   ### Aprendiz                ← textos de ese nivel («### Todos» vale para todos)
 *   Texto…
 *   ---                         ← separa versiones: se elige una al azar
 *   Otra versión…
 *
 * Los comentarios HTML <!-- … --> se ignoran.
 */

/** Niveles que pueden aparecer en «### nivel» (además de «todos»). */
export const NIVELES_DE_TEXTO = Object.freeze(['aprendiz', 'novatilla', 'lectora', 'superlectora', 'todos']);

/**
 * @typedef {object} Escena
 * @property {string} id                         Nombre tras «##».
 * @property {Record<string, any> & {con: string[]}} props  Propiedades @…; «con» siempre es una lista.
 * @property {Record<string, string[]>} niveles  nivel → versiones de texto.
 * @property {boolean} [repaso]                  Solo la escena de calentamiento que genera el juego.
 * @property {string[]} [palabras]               Ídem: palabras que se repasan.
 */

/** Minúsculas y sin tildes («Novatilla» → «novatilla», «Fondo» → «fondo»). */
const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Separa la cabecera YAML del cuerpo. Usa js-yaml (cargado en index.html como `window.jsyaml`).
 * @param {string} txt
 * @returns {{meta: Record<string, any>, cuerpo: string}}
 */
export function separarCabecera(txt) {
  const m = txt.match(/^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  if (!m) return { meta: {}, cuerpo: txt };
  return { meta: window.jsyaml.load(m[1]) || {}, cuerpo: m[2] };
}

/**
 * Convierte el cuerpo de un capítulo en escenas → niveles → versiones.
 * @param {string} cuerpo
 * @param {string} archivo  Solo para los avisos de la consola.
 * @returns {Escena[]}
 */
export function parsearEscenas(cuerpo, archivo) {
  const escenas = [];
  let escena = null, nivel = null;
  const lineas = cuerpo.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
  for (const l of lineas) {
    let m;
    if ((m = l.match(/^##\s+(.+?)\s*$/))) {
      escena = { id: m[1].trim(), props: {}, niveles: {} };
      escenas.push(escena); nivel = null; continue;
    }
    if (!escena) continue;
    if ((m = l.match(/^###\s+(.+?)\s*$/))) {
      nivel = sinTildes(m[1]);
      if (!NIVELES_DE_TEXTO.includes(nivel)) console.warn(`${archivo}: nivel desconocido «${m[1]}» en la escena ${escena.id}`);
      escena.niveles[nivel] = [[]];
      continue;
    }
    if (!nivel) {
      if ((m = l.match(/^@([\wáéíóúñ]+)\s*:?\s*(.*)$/i))) escena.props[sinTildes(m[1])] = m[2].trim() || true;
      continue;
    }
    if (/^-{3,}\s*$/.test(l)) { escena.niveles[nivel].push([]); continue; }
    const versiones = escena.niveles[nivel];
    versiones[versiones.length - 1].push(l);
  }
  for (const e of escenas) {
    for (const k in e.niveles) e.niveles[k] = e.niveles[k].map((v) => v.join('\n').trim()).filter(Boolean);
    e.props.con = typeof e.props.con === 'string' ? e.props.con.split(/[,\s]+/).filter(Boolean) : [];
  }
  return escenas;
}

/**
 * Versiones de una escena para un nivel (o las de «todos»).
 * @param {Escena} escena
 * @param {string} nivel
 * @returns {string[]|null} null si la escena no tiene texto para ese nivel.
 */
export function versionesPara(escena, nivel) {
  const v = escena.niveles[nivel] || escena.niveles.todos;
  return v && v.length ? v : null;
}
