/**
 * @file Cifras del informe de lectura para mayores.
 *
 * Capa: dominio. Todo se calcula a partir de `estado.registro` (una entrada
 * por partida) y `estado.palabras`. «A la primera» solo cuenta partidas con
 * micrófono, que es cuando se sabe si la frase salió bien al primer intento.
 */
import { estado } from '../estado/sesion.js';
import { NIVELES, nivelPorId, posicionDeNivel } from '../config/index.js';
import { DIA_MS, inicioDeHoy, fechaCorta } from '../util/fechas.js';
import { sumar, porcentaje } from '../util/numeros.js';
import { palabrasDificiles, palabrasConquistadas } from './registro-lectura.js';
import { protagonistas } from './protagonistas.js';

/** Capítulos terminados con micro en el nivel actual que hacen falta para recomendar. */
const MINIMO_PARA_RECOMENDAR = 3;
/** Se miran los últimos capítulos de este número. */
const VENTANA_RECOMENDACION = 5;
/** Umbrales (en %) para recomendar subir o bajar. */
const UMBRAL = { subirFrases: 85, subirPreguntas: 80, bajarFrases: 50 };
/** Días del gráfico. */
const DIAS_GRAFICO = 14;

/** @param {import('../estado/almacen.js').Partida[]} partidas */
const conMicro = (partidas) => partidas.filter((r) => r.micro && r.frases);

/**
 * % de frases leídas a la primera (solo con micro), o null si no hay datos.
 * @param {import('../estado/almacen.js').Partida[]} partidas
 * @returns {number|null}
 */
const pctPrimera = (partidas) => { const m = conMicro(partidas); return porcentaje(sumar(m, (r) => r.frasesPrimera), sumar(m, (r) => r.frases)); };

/**
 * @typedef {object} Recomendacion
 * @property {'subir'|'bajar'|'mantener'|'neutro'} tipo
 * @property {string} texto
 * @property {import('../config/niveles.js').Nivel} [nivel]  Nivel al que cambiar.
 */

/**
 * Recomienda subir, bajar o mantener el nivel según los últimos capítulos.
 * @returns {Recomendacion}
 */
export function recomendacionNivel() {
  const i = posicionDeNivel(estado.nivel);
  const n = NIVELES[i];
  const ult = conMicro(estado.registro.filter((r) => r.nivel === estado.nivel && r.terminado)).slice(-VENTANA_RECOMENDACION);
  if (ult.length < MINIMO_PARA_RECOMENDAR) return { tipo: 'neutro', texto: `Para recomendar un nivel hacen falta ${MINIMO_PARA_RECOMENDAR} capítulos terminados con micro en ${n.nombre}. Lleva ${ult.length}.` };
  const p = porcentaje(sumar(ult, (r) => r.frasesPrimera), sumar(ult, (r) => r.frases));
  const preg = sumar(ult, (r) => r.preguntas);
  const q = preg ? porcentaje(sumar(ult, (r) => r.preguntasPrimera), preg) : 100;
  const datos = `En sus últimos ${ult.length} capítulos lee el ${p} % de las frases a la primera y acierta el ${q} % de las preguntas a la primera.`;
  if (p >= UMBRAL.subirFrases && q >= UMBRAL.subirPreguntas && i < NIVELES.length - 1) return { tipo: 'subir', texto: `${datos} Está lista para probar ${NIVELES[i + 1].nombre}.`, nivel: NIVELES[i + 1] };
  if (p < UMBRAL.bajarFrases && i > 0) return { tipo: 'bajar', texto: `${datos} Le está costando: puede venirle bien volver a ${NIVELES[i - 1].nombre} un tiempo.`, nivel: NIVELES[i - 1] };
  return { tipo: 'mantener', texto: `${datos} ${n.nombre} es un buen nivel para ella ahora mismo.` };
}

/**
 * @typedef {object} ResumenSemana
 * @property {number} capitulos
 * @property {number} frases
 * @property {number} minutos
 * @property {number|null} primera     % frases a la primera estos 7 días.
 * @property {number|null} primeraAnt  Ídem los 7 anteriores (para la tendencia).
 * @property {number|null} preguntas   % preguntas a la primera.
 * @property {number|null} retos       % cerraduras a la primera.
 */

/**
 * Cifras de los últimos 7 días (hoy incluido).
 * @returns {ResumenSemana}
 */
export function resumenSemana() {
  const R = estado.registro, hoy = inicioDeHoy();
  const semana = R.filter((r) => r.fecha >= hoy - 6 * DIA_MS);
  const anterior = R.filter((r) => r.fecha >= hoy - 13 * DIA_MS && r.fecha < hoy - 6 * DIA_MS);
  return {
    capitulos: semana.filter((r) => r.terminado).length,
    frases: sumar(semana, (r) => r.frases),
    minutos: Math.round(sumar(semana, (r) => r.seg) / 60),
    primera: pctPrimera(semana), primeraAnt: pctPrimera(anterior),
    preguntas: porcentaje(sumar(semana, (r) => r.preguntasPrimera), sumar(semana, (r) => r.preguntas)),
    retos: porcentaje(sumar(semana, (r) => r.retosPrimera), sumar(semana, (r) => r.retos))
  };
}

/**
 * @typedef {object} FrasesDia
 * @property {number} ini      Medianoche del día.
 * @property {boolean} hoy
 * @property {number} total    Frases leídas.
 * @property {number} primera  De ellas, a la primera (con micro).
 */

/**
 * Frases leídas cada día de las dos últimas semanas, del más antiguo a hoy.
 * @returns {FrasesDia[]}
 */
export function frasesPorDia() {
  const R = estado.registro, hoy = inicioDeHoy(), dias = [];
  for (let i = DIAS_GRAFICO - 1; i >= 0; i--) {
    const ini = hoy - i * DIA_MS, rs = R.filter((r) => r.fecha >= ini && r.fecha < ini + DIA_MS);
    dias.push({ ini, hoy: i === 0, total: sumar(rs, (r) => r.frases), primera: sumar(rs.filter((r) => r.micro), (r) => r.frasesPrimera) });
  }
  return dias;
}

/**
 * Formatea un porcentaje (o «—» si no hay dato).
 * @param {number|null} v @param {string} [sufijo='']
 */
export const formatear = (v, sufijo = '') => (v == null ? '—' : v + sufijo);

/**
 * Resumen en texto plano para pegar en un mensaje (al colegio, a la logopeda…).
 * @returns {string}
 */
export function textoResumen() {
  const s = resumenSemana(), hoy = inicioDeHoy(), rec = recomendacionNivel();
  return [
    `Informe de lectura de ${protagonistas().lectora} · ${fechaCorta(hoy - 6 * DIA_MS)} – ${fechaCorta(hoy)}`,
    `Nivel: ${nivelPorId(estado.nivel).nombre}`,
    `Capítulos terminados: ${s.capitulos} · Frases leídas: ${s.frases} · Minutos: ${s.minutos}`,
    `Frases a la primera: ${formatear(s.primera, ' %')}${s.primeraAnt != null ? ` (semana anterior: ${s.primeraAnt} %)` : ''}`,
    `Preguntas a la primera: ${formatear(s.preguntas, ' %')}`,
    `Cerraduras de letras (b/d, p/q, m/n, sílabas) a la primera: ${formatear(s.retos, ' %')}`,
    `Palabras que le cuestan: ${palabrasDificiles().slice(0, 12).map(([w]) => w).join(', ') || '—'}`,
    `Palabras conquistadas: ${palabrasConquistadas().map(([w]) => w).join(', ') || '—'}`,
    `Recomendación: ${rec.texto}`
  ].join('\n');
}
