/**
 * @file Gráfico de barras SVG: frases leídas cada día (a la primera y con repetición).
 *
 * Capa: ui. Recibe los datos de src/dominio/informe.js → frasesPorDia().
 */
import { LETRAS_DIA_DESDE_DOMINGO } from '../../util/fechas.js';

const ANCHO = 700, ALTO = 230, MARGEN = { izq: 34, der: 8, abajo: 44, arriba: 12 };
/** Proporción del hueco de cada día que ocupa la barra. */
const GROSOR_BARRA = 0.64;

/**
 * @param {import('../../dominio/informe.js').FrasesDia[]} dias
 * @returns {string} Un <svg> accesible.
 */
export function graficoDias(dias) {
  const max = Math.max(4, ...dias.map((d) => d.total));
  const tope = Math.ceil(max / 4) * 4;
  const izq = MARGEN.izq, abajo = MARGEN.abajo, arriba = MARGEN.arriba, W = ANCHO, H = ALTO;
  const ancho = (W - izq - MARGEN.der) / dias.length;
  const y = (v) => arriba + (H - arriba - abajo) * (1 - v / tope);
  let s = '';
  for (const v of [0, tope / 2, tope]) s += `<line x1="${izq}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" class="g-rejilla"/><text x="${izq - 8}" y="${y(v) + 4}" class="g-eje" text-anchor="end">${v}</text>`;
  dias.forEach((d, i) => {
    const x = izq + i * ancho + ancho * ((1 - GROSOR_BARRA) / 2), w = ancho * GROSOR_BARRA;
    if (d.primera) s += `<rect x="${x}" y="${y(d.primera)}" width="${w}" height="${y(0) - y(d.primera)}" rx="3" class="g-primera"><title>${d.primera} a la primera</title></rect>`;
    const resto = d.total - d.primera;
    if (resto > 0) s += `<rect x="${x}" y="${y(d.total)}" width="${w}" height="${y(d.primera) - y(d.total)}" rx="3" class="g-resto"><title>${resto} repitiendo o sin micro</title></rect>`;
    if (d.total) s += `<text x="${x + w / 2}" y="${y(d.total) - 5}" class="g-valor" text-anchor="middle">${d.total}</text>`;
    const f = new Date(d.ini);
    s += `<text x="${x + w / 2}" y="${H - abajo + 18}" class="g-eje${d.hoy ? ' g-hoy' : ''}" text-anchor="middle">${LETRAS_DIA_DESDE_DOMINGO[f.getDay()]}</text><text x="${x + w / 2}" y="${H - abajo + 34}" class="g-eje g-num" text-anchor="middle">${f.getDate()}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="Frases leídas cada día en las últimas dos semanas">${s}</svg>`;
}
