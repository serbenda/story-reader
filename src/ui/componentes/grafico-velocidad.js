/**
 * @file Gráfico SVG de la velocidad lectora (palabras por minuto) día a día.
 *
 * Capa: ui. Recibe los datos de src/dominio/informe.js → velocidadPorDia().
 * Los días sin medida no tienen punto; la línea une solo los días medidos.
 */
import { LETRAS_DIA_DESDE_DOMINGO } from '../../util/fechas.js';

const ANCHO = 700, ALTO = 200, MARGEN = { izq: 38, der: 12, abajo: 40, arriba: 18 };

/**
 * @param {{ini: number, hoy: boolean, ppm: number|null}[]} dias
 * @returns {string} Un <svg> accesible.
 */
export function graficoVelocidad(dias) {
  const medidos = dias.filter((d) => d.ppm != null);
  const max = Math.max(40, ...medidos.map((d) => d.ppm));
  const tope = Math.ceil(max / 20) * 20;
  const W = ANCHO, H = ALTO, { izq, der, abajo, arriba } = MARGEN;
  const paso = (W - izq - der) / dias.length;
  const x = (i) => izq + paso * (i + 0.5);
  const y = (v) => arriba + (H - arriba - abajo) * (1 - v / tope);
  let s = '';
  for (const v of [0, tope / 2, tope]) s += `<line x1="${izq}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" class="g-rejilla"/><text x="${izq - 8}" y="${y(v) + 4}" class="g-eje" text-anchor="end">${v}</text>`;
  const puntos = dias.map((d, i) => (d.ppm == null ? null : [x(i), y(d.ppm), d])).filter(Boolean);
  if (puntos.length > 1) s += `<polyline points="${puntos.map(([px, py]) => `${px},${py}`).join(' ')}" class="g-linea" fill="none"/>`;
  for (const [px, py, d] of puntos) s += `<circle cx="${px}" cy="${py}" r="5" class="g-punto"><title>${d.ppm} palabras por minuto</title></circle><text x="${px}" y="${py - 10}" class="g-valor" text-anchor="middle">${d.ppm}</text>`;
  dias.forEach((d, i) => {
    const f = new Date(d.ini);
    s += `<text x="${x(i)}" y="${H - abajo + 18}" class="g-eje${d.hoy ? ' g-hoy' : ''}" text-anchor="middle">${LETRAS_DIA_DESDE_DOMINGO[f.getDay()]}</text><text x="${x(i)}" y="${H - abajo + 33}" class="g-eje g-num" text-anchor="middle">${f.getDate()}</text>`;
  });
  if (!puntos.length) s += `<text x="${W / 2}" y="${H / 2}" class="g-eje" text-anchor="middle">Todavía sin medidas: se miden al leer con el micro</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="Palabras por minuto cada día en las últimas dos semanas">${s}</svg>`;
}
