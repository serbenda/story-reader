/**
 * @file Tarjeta de la meta del día (anillo de progreso, semana y cofre) y su celebración.
 *
 * Capa: ui. Los cálculos están en src/dominio/meta-diaria.js.
 */
import { esc } from '../../util/dom.js';
import { redondear1 } from '../../util/numeros.js';
import { LETRAS_DIA_DESDE_LUNES } from '../../util/fechas.js';
import { DIAS_PARA_COFRE, ESTRELLAS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { progresoHoy, racha, semanaActual, cofreAbierto, metaCumplidaHoy, comprobarMeta } from '../../dominio/meta-diaria.js';
import { aviso, confeti, abrirCapa } from '../avisos.js';
import { palabras } from '../palabras.js';

const RADIO_ANILLO = 24;

/** @returns {string} */
export function htmlMeta() {
  const p = progresoHoy(), hecha = metaCumplidaHoy(), r = racha(), dias = semanaActual();
  const semana = dias.map((d, i) => {
    const l = LETRAS_DIA_DESDE_LUNES[i];
    return `<span class="dia${d.cumplido ? ' hecho' : ''}${d.hoy ? ' hoy' : ''}" title="${l}">${d.cumplido ? '★' : l}</span>`;
  }).join('');
  const enSemana = dias.filter((d) => d.cumplido).length;
  const cofre = cofreAbierto()
    ? '<span class="cofre abierto" title="Cofre abierto">🎉</span>'
    : `<span class="cofre" title="Cumple la meta ${DIAS_PARA_COFRE} días para abrir el cofre">🎁 <small>${enSemana}/${DIAS_PARA_COFRE}</small></span>`;
  const C = 2 * Math.PI * RADIO_ANILLO;
  return `<div class="meta-hoy${hecha ? ' cumplida' : ''}">
    <svg class="anillo" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${RADIO_ANILLO}" class="anillo-fondo"/><circle cx="30" cy="30" r="${RADIO_ANILLO}" class="anillo-progreso" stroke-dasharray="${redondear1(C * (hecha ? 1 : p.parte))} ${redondear1(C)}" transform="rotate(-90 30 30)"/><text x="30" y="36" text-anchor="middle" class="anillo-texto">${hecha ? '✓' : Math.round(p.parte * 100) + '%'}</text></svg>
    <div class="meta-texto"><b>${hecha ? '¡Meta de hoy cumplida!' : 'Meta de hoy'}</b><span>${hecha ? (r > 1 ? `🔥 ${r} días seguidos` : '¡Muy bien!') : esc(p.texto)}</span>
      <div class="semana">${semana}${cofre}</div></div>
  </div>`;
}

/**
 * Comprueba la meta y, si se acaba de cumplir, lo celebra (aviso, o capa si se abre el cofre).
 * Se llama al avanzar de escena, al salir y al terminar un capítulo.
 */
export function comprobarYCelebrarMeta() {
  const r = comprobarMeta();
  if (!r) return;
  Sonido.tocar('fin'); confeti(r.cofre ? 120 : 60);
  if (r.cofre) {
    abrirCapa(`<div class="cofre-capa"><div class="cofre-grande" aria-hidden="true">🎁</div>
      <h2 class="titulo">¡Cofre de la semana!</h2><p class="linea texto">${palabras(`Has cumplido la meta cinco días esta semana. ¡Dentro hay ${ESTRELLAS.cofre} estrellas!`)}</p>
      <button class="boton boton-principal" data-cerrar>¡Genial! ⭐</button></div>`);
  } else {
    aviso(`🎯 ¡Meta de hoy cumplida! +${ESTRELLAS.meta} ⭐${r.racha > 1 ? ` · 🔥 ${r.racha} días seguidos` : ''}`, 4500);
  }
}
