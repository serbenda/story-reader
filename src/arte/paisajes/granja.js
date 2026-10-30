/**
 * @file Paisajes: Campo de cultivo: «La granja de los abuelos».
 *
 * Capa: arte. Cada función dibuja un paisaje de 800×500 y devuelve el
 * contenido del SVG (sin la etiqueta <svg>, que pone ./index.js).
 * Firma común: (r, noche, defs) → string, donde
 *   r     = número al azar repetible (0–1) de ../aleatorio.js
 *   noche = si hay que dibujarlo de noche
 *   defs  = lista donde dejar degradados u otras definiciones <defs>
 */
import * as P from '../piezas.js';
import { cielo, astros, velo } from '../cielo.js';
import { redondear1 as n } from '../../util/numeros.js';

/** Paisaje «granja». @type {import('./index.js').DibujoPaisaje} */
export function granja(r, noche, defs) {
  let b = cielo(defs, noche, '#9ED6EE', '#F1F7E8') + astros(r, noche, 120, 80);
  b += '<path d="M0 290 Q220 230 460 280 T800 260 V500 H0 Z" fill="#A9D79A"/><path d="M0 330 Q300 300 800 336 V500 H0 Z" fill="#8FC96E"/>';
  b += '<rect x="650" y="160" width="70" height="190" fill="#B8C2C8" stroke="#5F6B73" stroke-width="3"/><path d="M650 160 Q685 120 720 160 Z" fill="#8E9AA2" stroke="#5F6B73" stroke-width="3"/>';
  b += '<rect x="420" y="200" width="230" height="150" fill="#C2453B" stroke="#6E2520" stroke-width="4"/><path d="M405 205 L535 130 L665 205 Z" fill="#8E2F28" stroke="#6E2520" stroke-width="4"/>';
  b += '<rect x="495" y="250" width="80" height="100" fill="#FFF7E6" stroke="#6E2520" stroke-width="3"/><path d="M495 250 L575 350 M575 250 L495 350" stroke="#C2453B" stroke-width="6"/>';
  b += `<rect x="515" y="165" width="40" height="30" fill="${noche ? '#FFE08A' : '#FFF7E6'}" stroke="#6E2520" stroke-width="3"/>`;
  for (let x = 0; x < 400; x += 40) b += `<rect x="${x}" y="320" width="8" height="50" fill="#B98A5A"/>`;
  b += '<rect x="0" y="330" width="400" height="7" fill="#B98A5A"/><rect x="0" y="352" width="400" height="7" fill="#B98A5A"/>';
  for (const [x, y] of [[300, 420], [360, 440], [700, 420]]) b += `<rect x="${x}" y="${y}" width="60" height="40" rx="8" fill="#F2C75C" stroke="#C99A2E" stroke-width="3"/><path d="M${x + 6} ${y + 14} H${x + 54} M${x + 6} ${y + 28} H${x + 54}" stroke="#C99A2E" stroke-width="2"/>`;
  b += '<path d="M520 350 Q500 430 470 500 H600 Q570 430 560 350 Z" fill="#D9B98A"/>';
  for (let i = 0; i < 14; i++) b += P.hierba(r() * 800, 360 + r() * 140, '#5E9E48', 1 + r() * .5);
  return b + velo(r, noche);
}

/** Paisaje «huerto». @type {import('./index.js').DibujoPaisaje} */
export function huerto(r, noche, defs) {
  let b = cielo(defs, noche, '#A5DAF0', '#F3F8E7') + astros(r, noche, 660, 80);
  b += '<path d="M0 270 Q300 230 800 270 V500 H0 Z" fill="#A9D79A"/>';
  for (let i = 0; i < 5; i++) {
    const y = 300 + i * 42;
    b += `<path d="M0 ${y} Q400 ${y - 10} 800 ${y} V${y + 26} Q400 ${y + 16} 0 ${y + 26} Z" fill="#8A5A3B"/>`;
    for (let x = 30 + (i % 2) * 30; x < 800; x += 70) {
      const t = (i + Math.floor(r() * 3)) % 3;
      if (t === 0) b += `<circle cx="${x}" cy="${y + 4}" r="14" fill="#7CC36A"/><circle cx="${x}" cy="${y + 4}" r="8" fill="#A8DC8E"/>`;
      else if (t === 1) b += `<path d="M${x - 5} ${y + 8} L${x} ${y + 22} L${x + 5} ${y + 8} Z" fill="#F08A3C"/><path d="M${x} ${y + 8} l-8 -14 M${x} ${y + 8} l0 -16 M${x} ${y + 8} l8 -14" stroke="#4E9A42" stroke-width="4" stroke-linecap="round"/>`;
      else b += `<path d="M${x} ${y + 10} V${y - 24}" stroke="#B98A5A" stroke-width="4"/><circle cx="${x - 6}" cy="${y - 8}" r="7" fill="#E04A3C"/><circle cx="${x + 6}" cy="${y - 16}" r="6" fill="#E04A3C"/><circle cx="${x + 2}" cy="${y}" r="5" fill="#4E9A42"/>`;
    }
  }
  const sx = 600 + r() * 120;
  b += `<path d="M${n(sx)} 330 V200 M${n(sx - 50)} 235 H${n(sx + 50)}" stroke="#8A6040" stroke-width="8"/><path d="M${n(sx - 30)} 230 L${n(sx + 30)} 230 L${n(sx + 24)} 300 L${n(sx - 24)} 300 Z" fill="#5F7FC4"/><circle cx="${n(sx)}" cy="190" r="20" fill="#F2D7A6"/><path d="M${n(sx - 30)} 180 L${n(sx + 30)} 180 L${n(sx)} 150 Z" fill="#E2B04A"/><circle cx="${n(sx - 7)}" cy="190" r="2.5" fill="#2E2A3B"/><circle cx="${n(sx + 7)}" cy="190" r="2.5" fill="#2E2A3B"/>`;
  return b + velo(r, noche);
}
