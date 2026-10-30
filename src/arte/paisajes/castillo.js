/**
 * @file Paisajes: Reino en las nubes: «El castillo de las nubes».
 *
 * Capa: arte. Cada función dibuja un paisaje de 800×500 y devuelve el
 * contenido del SVG (sin la etiqueta <svg>, que pone ./index.js).
 * Firma común: (r, noche, defs) → string, donde
 *   r     = número al azar repetible (0–1) de ../aleatorio.js
 *   noche = si hay que dibujarlo de noche
 *   defs  = lista donde dejar degradados u otras definiciones <defs>
 */
import * as P from '../piezas.js';
import { astros } from '../cielo.js';
import { redondear1 as n } from '../../util/numeros.js';

/** Paisaje «castillo». @type {import('./index.js').DibujoPaisaje} */
export function castillo(r, noche, defs) {
  const g = noche ? P.grad('#2A2558', '#5A4E8A') : P.grad('#F6C9E0', '#D9E8FA'); defs.push(g.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>` + (noche ? astros(r, true, 150, 80) : P.sol(130, 90, 34));
  const torre = (x, y, w, h, techo) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F7EEF7" stroke="#6E5A8A" stroke-width="3"/><path d="M${x - 8} ${y} L${x + w / 2} ${y - w * 1.2} L${x + w + 8} ${y} Z" fill="${techo}" stroke="#6E5A8A" stroke-width="3"/><rect x="${x + w / 2 - 7}" y="${y + 30}" width="14" height="22" rx="7" fill="${noche ? '#FFE08A' : '#8FC3E8'}"/><path d="M${x + w / 2} ${y - w * 1.2} V${y - w * 1.2 - 26}" stroke="#6E5A8A" stroke-width="3"/><path d="M${x + w / 2} ${y - w * 1.2 - 26} l22 7 l-22 7 Z" fill="#F2B33D"/>`;
  b += '<rect x="330" y="200" width="300" height="160" fill="#EFE2F1" stroke="#6E5A8A" stroke-width="3"/>';
  for (let x = 330; x < 630; x += 30) b += `<rect x="${x}" y="186" width="18" height="16" fill="#EFE2F1" stroke="#6E5A8A" stroke-width="3"/>`;
  b += torre(300, 150, 60, 210, '#B06AB3') + torre(600, 150, 60, 210, '#B06AB3') + torre(450, 110, 64, 120, '#8A62C4');
  b += '<path d="M450 360 V300 Q480 270 510 300 V360 Z" fill="#7A5232" stroke="#6E5A8A" stroke-width="3"/>';
  for (let i = 0; i < 9; i++) { const x = i * 100 - 20 + r() * 30, y = 360 + r() * 30; b += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(50 + r() * 30)}" fill="#FFFFFF"/>`; }
  b += '<rect x="0" y="390" width="800" height="110" fill="#FFFFFF"/>';
  for (let i = 0; i < 6; i++) { const x = r() * 800; b += `<circle cx="${n(x)}" cy="${n(420 + r() * 60)}" r="${n(30 + r() * 20)}" fill="#F1F4FB"/>`; }
  if (!noche) b += P.nube(720, 120, .8) + P.nube(220, 200, .6);
  return b + (noche ? '<rect width="800" height="500" fill="#1C2152" opacity=".25"/>' : '');
}

/** Paisaje «torre». @type {import('./index.js').DibujoPaisaje} */
export function torre(r, noche, defs) {
  const g = P.grad('#B9AFC2', '#8E849A'); defs.push(g.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  for (let y = 0; y < 380; y += 40) for (let x = (y / 40) % 2 ? -40 : 0; x < 800; x += 80) b += `<rect x="${x + 2}" y="${y + 2}" width="76" height="36" rx="5" fill="#A79DB2" opacity="${n(.5 + r() * .5)}"/>`;
  const cielo2 = noche ? '#2A3570' : '#9FD8F2';
  b += `<path d="M420 80 H600 V260 H420 Z M420 80 Q510 10 600 80" fill="${cielo2}" stroke="#5E5470" stroke-width="10"/>`;
  b += noche ? '<circle cx="560" cy="120" r="22" fill="#FFF4C7"/>' : P.nube(500, 150, .7);
  b += '<path d="M510 40 V260 M420 170 H600" stroke="#5E5470" stroke-width="6"/>';
  b += '<rect x="0" y="380" width="800" height="120" fill="#9C6A3E"/>';
  for (let x = 0; x < 800; x += 60) b += `<path d="M${x} 380 V500" stroke="#7A5232" stroke-width="2"/>`;
  b += '<rect x="250" y="360" width="200" height="12" fill="#C9476B"/><ellipse cx="350" cy="440" rx="120" ry="30" fill="#C9476B" opacity=".85"/>';
  b += '<rect x="620" y="340" width="110" height="70" rx="8" fill="#B9874F" stroke="#6B4630" stroke-width="4"/><path d="M620 340 Q675 300 730 340" fill="#C99A5E" stroke="#6B4630" stroke-width="4"/><rect x="666" y="355" width="18" height="18" fill="#F2B33D"/>';
  for (const x of [140, 760]) b += `<rect x="${x - 26}" y="60" width="52" height="150" fill="${x < 400 ? '#8A62C4' : '#3F7D4E'}"/><path d="M${x - 26} 210 L${x} 190 L${x + 26} 210 Z" fill="#A79DB2"/><circle cx="${x}" cy="110" r="12" fill="#F2B33D"/>`;
  b += '<rect x="230" y="300" width="10" height="40" fill="#FFF7E6"/><path d="M235 300 q-6 -10 0 -18 q6 8 0 18" fill="#F2B33D"/>';
  return b + (noche ? '<rect width="800" height="500" fill="#1C2152" opacity=".3"/>' : '');
}
