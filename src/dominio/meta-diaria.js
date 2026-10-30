/**
 * @file Meta de cada día, racha de días y cofre de la semana.
 *
 * Capa: dominio. Los mayores eligen la meta (minutos o un capítulo). Al
 * cumplirla se ganan estrellas; si se cumple 5 días en una semana (de lunes a
 * domingo), se abre un cofre con más. La racha perdona saltarse un solo día:
 * se trata de animar, no de castigar.
 */
import { estado, guardar } from '../estado/sesion.js';
import { METAS, META_INICIAL, ESTRELLAS, DIAS_PARA_COFRE } from '../config/index.js';
import { DIA_MS, inicioDeHoy, claveDia, lunesDe } from '../util/fechas.js';
import { ganarEstrellas } from './estrellas.js';
import { segundosSinGuardar } from './registro-lectura.js';

/** Días sin leer seguidos que se perdonan en la racha. */
const DIAS_PERDONADOS = 1;
/** Hasta dónde se mira hacia atrás al contar la racha. */
const MAX_DIAS_RACHA = 400;

/** @returns {import('../config/recompensas.js').Meta} */
export const metaElegida = () => METAS[estado.ajustes.meta] || METAS[META_INICIAL];

/**
 * @typedef {object} ProgresoMeta
 * @property {number} parte  De 0 a 1.
 * @property {string} texto  «4 de 10 minutos» o «Lee un capítulo».
 * @property {import('../config/recompensas.js').Meta} meta
 */

/**
 * Cuánto se lleva hoy (incluye la partida en curso).
 * @returns {ProgresoMeta}
 */
export function progresoHoy() {
  const hoy = estado.registro.filter((r) => r.fecha >= inicioDeHoy());
  const seg = hoy.reduce((s, r) => s + (r.seg || 0), 0) + segundosSinGuardar();
  const caps = hoy.filter((r) => r.terminado).length;
  const meta = metaElegida();
  if (!meta.min) return { parte: Math.min(1, caps), texto: caps ? '¡Capítulo leído!' : 'Lee un capítulo', meta };
  const min = Math.floor(seg / 60);
  return { parte: Math.min(1, seg / 60 / meta.min), texto: `${Math.min(min, meta.min)} de ${meta.min} minutos`, meta };
}

/** ¿Se ha cumplido ya la meta hoy? */
export const metaCumplidaHoy = () => !!estado.metaDias[claveDia(inicioDeHoy())];

/**
 * Días seguidos cumpliendo la meta (hoy cuenta si ya se ha cumplido).
 * @returns {number}
 */
export function racha() {
  let n = 0, sinLeer = 0, d = inicioDeHoy();
  if (!estado.metaDias[claveDia(d)]) d -= DIA_MS;
  for (let i = 0; i < MAX_DIAS_RACHA; i++, d -= DIA_MS) {
    if (estado.metaDias[claveDia(d)]) { n++; sinLeer = 0; } else if (++sinLeer > DIAS_PERDONADOS) break;
  }
  return n;
}

/**
 * @typedef {object} DiaSemana
 * @property {string} clave  «2026-10-30»
 * @property {boolean} cumplido
 * @property {boolean} hoy
 */

/**
 * Los siete días de esta semana, de lunes a domingo.
 * @returns {DiaSemana[]}
 */
export function semanaActual() {
  const lunes = lunesDe(Date.now()), hoy = claveDia(Date.now());
  return Array.from({ length: 7 }, (_, i) => {
    const clave = claveDia(lunes + i * DIA_MS);
    return { clave, cumplido: !!estado.metaDias[clave], hoy: clave === hoy };
  });
}

/** ¿Está abierto ya el cofre de esta semana? */
export const cofreAbierto = () => !!estado.cofres[claveDia(lunesDe(Date.now()))];

/**
 * @typedef {object} MetaRecienCumplida
 * @property {boolean} cofre  ¿Se ha abierto también el cofre de la semana?
 * @property {number} racha
 */

/**
 * Si la meta de hoy se acaba de cumplir, da las estrellas (y el cofre si toca) y guarda.
 * Llamarlo de más no pasa nada: solo premia una vez al día.
 * @returns {MetaRecienCumplida|null} null si no había nada que celebrar.
 */
export function comprobarMeta() {
  if (!estado.perfil) return null;
  const k = claveDia(inicioDeHoy());
  if (estado.metaDias[k] || progresoHoy().parte < 1) return null;
  estado.metaDias[k] = true;
  ganarEstrellas(ESTRELLAS.meta);
  const claveLunes = claveDia(lunesDe(Date.now()));
  const enSemana = semanaActual().filter((d) => d.cumplido).length;
  let cofre = false;
  if (enSemana >= DIAS_PARA_COFRE && !estado.cofres[claveLunes]) {
    estado.cofres[claveLunes] = true;
    ganarEstrellas(ESTRELLAS.cofre);
    cofre = true;
  }
  guardar();
  return { cofre, racha: racha() };
}
