/**
 * @file El escenario dibujado de cada escena: paisaje, personajes y tesoros escondidos.
 *
 * Capa: ui. Los personajes que aparecen los decide la escena con «@con:»
 * (mascota, ayudante, ayudante2, buscado). Las protagonistas salen siempre,
 * salvo con «@sin: niñas».
 */
import { estado, catalogo, partida } from '../estado/sesion.js';
import * as Arte from '../arte/index.js';
import { esc } from '../util/dom.js';
import { azar } from '../util/azar.js';
import { protagonistas, sonDosNinas } from '../dominio/protagonistas.js';

/** Probabilidad de que haya un tesoro escondido en una escena. */
const PROBABILIDAD_TESORO = 0.6;
/** Semilla de los dibujos fuera de una partida. */
const SEMILLA_FIJA = 7;

/**
 * Personaje dibujado con un emoji (mascota, ayudantes, lo que se busca).
 * Se puede tocar para que salude.
 */
const personajeEmoji = (emoji, clase, nombre) =>
  `<div class="pj pj-emoji ${clase}" data-nombre="${esc(nombre || '')}" data-saludo="${esc(nombre ? `¡Hola! Soy ${nombre}.` : '¡Hola!')}"><span class="emoji">${emoji}</span>${nombre ? `<span class="etiqueta">${esc(nombre)}</span>` : ''}</div>`;

/** Las protagonistas (una o dos). */
function protagonistasHtml() {
  const n = protagonistas();
  const pj = [`<div class="pj pj-alaya" data-nombre="${esc(n.lectora)}" data-saludo="¡Hola! Soy ${esc(n.lectora)}, la detective.">${Arte.nina(estado.perfil.alaya, 'largo')}<span class="etiqueta">${esc(n.lectora)}</span></div>`];
  if (sonDosNinas()) pj.push(`<div class="pj pj-lucia" data-nombre="${esc(n.hermana)}" data-saludo="¡Hola! Soy ${esc(n.hermana)}. ¿Tienes galletas?">${Arte.nina(estado.perfil.lucia, 'coletas')}<span class="etiqueta">${esc(n.hermana)}</span></div>`);
  return pj;
}

/** @param {string} c  Valor de «@con». */
function acompananteHtml(c) {
  if (c === 'mascota') return personajeEmoji((catalogo.mascotas[estado.perfil.mascota.especie] || {}).emoji || '🐶', 'pj-mascota', estado.perfil.mascota.nombre);
  if ((c === 'ayudante' || c === 'ayudante2') && partida) {
    const A = partida.libro.meta.ayudantes[partida.ayudantes[c === 'ayudante' ? 0 : 1]];
    return personajeEmoji(A.emoji, 'pj-' + c, A.nombre);
  }
  if (c === 'buscado' && partida && partida.cap.meta.buscamos && partida.cap.meta.buscamos.emoji) {
    const b = partida.cap.meta.buscamos;
    return personajeEmoji(b.emoji, 'pj-buscado', b.nombre.split(' ').pop());
  }
  return '';
}

/** Un tesoro del libro escondido en un sitio al azar (a veces no hay). */
function tesoroHtml() {
  if (!partida || Math.random() >= PROBABILIDAD_TESORO) return '';
  const t = azar(partida.libro.meta.tesoros || []);
  if (!t) return '';
  return `<button class="tesoro" style="left:${8 + Math.random() * 80}%;top:${8 + Math.random() * 42}%" data-emoji="${esc(t.emoji)}" data-nombre="${esc(t.nombre)}" aria-label="Algo escondido">${t.emoji}</button>`;
}

/**
 * Nombre del paisaje: el de la escena, el del lugar sorteado ($lugar, $falso) o uno forzado.
 * @param {string} [fondo]
 * @param {string} [forzado]
 */
function tipoDeFondo(fondo, forzado) {
  if (forzado) return forzado;
  const tipo = fondo || 'bosque';
  if (tipo === '$lugar' && partida) return partida.lugares.lugar.fondo;
  if (tipo === '$falso' && partida) return partida.lugares.falso.fondo;
  return tipo;
}

/**
 * @param {Record<string, any> & {con?: string[]}} props  Propiedades de la escena (@fondo, @noche, @con, @sin).
 * @param {object} [opciones]
 * @param {boolean} [opciones.tesoro]   Puede esconder un tesoro.
 * @param {string} [opciones.fondo]     Fuerza un paisaje.
 * @param {number} [opciones.semilla]   Se suma a la semilla de la partida (para variar el dibujo).
 * @returns {string}
 */
export function escenario(props, opciones = {}) {
  const tipo = tipoDeFondo(props.fondo, opciones.fondo);
  const noche = !!props.noche;
  const fondo = /\.(png|jpe?g|webp|svg|gif)$/i.test(tipo)
    ? `<img class="fondo" src="${esc(tipo)}" alt="">`
    : Arte.paisaje(tipo, { noche, semilla: (partida ? partida.semilla : SEMILLA_FIJA) + (opciones.semilla || 0) });
  const pj = props.sin !== 'niñas' && props.sin !== 'ninas' ? protagonistasHtml() : [];
  for (const c of props.con || []) pj.push(acompananteHtml(c));
  const tesoro = opciones.tesoro ? tesoroHtml() : '';
  return `<div class="escenario${noche ? ' noche' : ''}">${fondo}<div class="personajes">${pj.join('')}</div>${tesoro}</div>`;
}
