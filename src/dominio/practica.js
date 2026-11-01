/**
 * @file Sesiones de práctica (dictado, taller, lectura repetida, mi frase) y lo que se aprende de ellas.
 *
 * Capa: dominio. Cada sesión se guarda en `estado.practicas` para el informe y
 * cuenta para la meta del día. Las palabras del dictado tienen su propio
 * registro (`estado.dictado`), separado del de lectura: una palabra puede
 * leerse bien y escribirse mal.
 */
import { estado, guardar } from '../estado/sesion.js';
import { MAX_PRACTICAS, MAX_ESCRITOS } from '../config/index.js';
import { inicioDeHoy } from '../util/fechas.js';
import { conquistada } from './registro-lectura.js';

/**
 * @typedef {object} SesionPractica
 * @property {import('../estado/almacen.js').Practica['tipo']} tipo
 * @property {number} inicio  Cuándo empezó (ms).
 * @property {number} total
 * @property {number} primera
 * @property {number[]} ppm
 */

/**
 * Empieza a contar una sesión.
 * @param {import('../estado/almacen.js').Practica['tipo']} tipo
 * @returns {SesionPractica}
 */
export const empezarSesion = (tipo) => ({ tipo, inicio: Date.now(), total: 0, primera: 0, ppm: [] });

/** Sesión abierta ahora mismo (para que la meta del día la cuente en vivo). @type {SesionPractica|null} */
let abierta = null;

/** @param {SesionPractica|null} s */
export function marcarSesionAbierta(s) { abierta = s; }

/**
 * Guarda la sesión en el registro (si se ha hecho algo) y la cierra. Guarda.
 * @param {SesionPractica} s
 */
export function terminarSesion(s) {
  if (abierta === s) abierta = null;
  if (!s || s.guardada || (!s.total && !s.ppm.length)) return;
  s.guardada = true;
  const seg = Math.min(1800, Math.round((Date.now() - s.inicio) / 1000));
  estado.practicas.push({ fecha: s.inicio, tipo: s.tipo, total: s.total, primera: s.primera, seg, ...(s.ppm.length ? { ppm: s.ppm } : {}) });
  if (estado.practicas.length > MAX_PRACTICAS) estado.practicas = estado.practicas.slice(-MAX_PRACTICAS);
  guardar();
}

/**
 * Segundos de práctica de hoy (incluida la sesión abierta), para la meta del día.
 * @returns {number}
 */
export function segundosPracticaHoy() {
  const hoy = inicioDeHoy();
  const guardados = (estado.practicas || []).filter((p) => p.fecha >= hoy).reduce((s, p) => s + (p.seg || 0), 0);
  return guardados + (abierta ? Math.min(1800, (Date.now() - abierta.inicio) / 1000) : 0);
}

/**
 * Apunta cómo ha escrito una palabra en el dictado. No guarda.
 * @param {string} palabra
 * @param {boolean} bien
 */
export function anotarDictado(palabra, bien) {
  const k = palabra.toLowerCase();
  const p = estado.dictado[k] || (estado.dictado[k] = { f: 0, a: 0, u: 0 });
  if (bien) p.a++; else p.f++;
  p.u = Date.now();
}

/**
 * Palabras que le cuesta escribir, de más a menos.
 * @returns {[string, import('../estado/almacen.js').PalabraRegistrada][]}
 */
export const palabrasDificilesDeEscribir = () => Object.entries(estado.dictado || {})
  .filter(([, p]) => p.f > 0 && !conquistada(p))
  .sort((x, y) => (y[1].f - y[1].a) - (x[1].f - x[1].a) || y[1].u - x[1].u);

/**
 * Guarda una frase escrita por ella. No guarda el estado.
 * @param {string} texto
 * @param {string} [tema]
 */
export function guardarEscrito(texto, tema) {
  estado.escritos.push({ fecha: Date.now(), texto: texto.trim(), ...(tema ? { tema } : {}) });
  if (estado.escritos.length > MAX_ESCRITOS) estado.escritos = estado.escritos.slice(-MAX_ESCRITOS);
}
