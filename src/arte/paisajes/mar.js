/**
 * @file Paisajes: Costa: «El secreto del faro».
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

/** Paisaje «playa». @type {import('./index.js').DibujoPaisaje} */
export function playa(r, noche, defs) {
  let b = cielo(defs, noche, '#8FD3F0', '#E6F6F5') + astros(r, noche, 640, 80);
  const mar = P.grad('#4FA9D6', '#2C7FB3'); defs.push(mar.def);
  b += `<rect x="0" y="235" width="800" height="120" fill="url(#${mar.id})"/>`;
  for (let i = 0; i < 12; i++) { const x = r() * 760, y = 250 + r() * 80; b += `<path d="M${n(x)} ${n(y)} q12 -6 24 0 q12 6 24 0" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`; }
  b += '<path d="M0 330 Q200 310 420 328 T800 318 V500 H0 Z" fill="#F3D9A2"/><path d="M0 330 Q200 310 420 328 T800 318" stroke="#FFFFFF" stroke-width="6" fill="none" opacity=".7"/>';
  // palmera
  const px = 650 + r() * 80;
  b += `<path d="M${n(px)} 470 Q${n(px - 20)} 360 ${n(px + 10)} 250" stroke="#9C6A3E" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  for (const a of [-160, -120, -60, -20, 20]) { const rad = a * Math.PI / 180; b += `<path d="M${n(px + 10)} 250 Q${n(px + 10 + Math.cos(rad) * 50)} ${n(250 + Math.sin(rad) * 50 - 20)} ${n(px + 10 + Math.cos(rad) * 95)} ${n(250 + Math.sin(rad) * 95 + 25)}" stroke="#3F8F4E" stroke-width="16" fill="none" stroke-linecap="round"/>`; }
  b += `<circle cx="${n(px + 4)}" cy="262" r="8" fill="#7A4E2E"/><circle cx="${n(px + 18)}" cy="264" r="8" fill="#7A4E2E"/>`;
  for (let i = 0; i < 7; i++) { const x = 60 + r() * 560, y = 380 + r() * 100; b += r() < .5 ? `<path d="M${n(x)} ${n(y)} l6 -14 l6 14 l14 2 l-11 9 l4 14 l-13 -8 l-13 8 l4 -14 l-11 -9 Z" fill="#E9775A"/>` : `<path d="M${n(x - 10)} ${n(y)} Q${n(x)} ${n(y - 18)} ${n(x + 10)} ${n(y)} Z" fill="#F7B7C8" stroke="#D98AA0" stroke-width="2"/>`; }
  b += `<path d="M${n(120 + r() * 300)} 250 l30 0 l-6 10 l-18 0 Z" fill="#FFFFFF"/>`;
  return b + velo(r, noche);
}

/** Paisaje «faro». @type {import('./index.js').DibujoPaisaje} */
export function faro(r, noche, defs) {
  let b = cielo(defs, noche, '#9FD8F2', '#EEF7F2') + astros(r, noche, 140, 80);
  b += '<rect x="0" y="250" width="800" height="250" fill="#3E8DBE"/>';
  for (let i = 0; i < 10; i++) { const x = 480 + r() * 300, y = 270 + r() * 200; b += `<path d="M${n(x)} ${n(y)} q10 -5 20 0 q10 5 20 0" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".55"/>`; }
  b += '<path d="M0 280 Q260 250 470 300 Q520 360 500 500 H0 Z" fill="#8FC96E"/><path d="M470 300 Q520 360 500 500 L440 500 Q470 380 430 300 Z" fill="#8E8A7E"/>';
  if (noche) b += '<path d="M455 118 L800 40 L800 190 Z" fill="#FFE98A" opacity=".35"/>';
  b += '<path d="M410 300 L425 140 L485 140 L500 300 Z" fill="#FFFFFF" stroke="#2E2A3B" stroke-width="3"/>';
  for (const y of [175, 230, 280]) b += `<path d="M${n(422 - (y - 140) * .05)} ${y} L${n(488 + (y - 140) * .05)} ${y} L${n(490 + (y - 140) * .056)} ${y + 22} L${n(420 - (y - 140) * .056)} ${y + 22} Z" fill="#C9476B"/>`;
  b += `<rect x="428" y="104" width="54" height="36" rx="4" fill="${noche ? '#FFE98A' : '#CFEFFF'}" stroke="#2E2A3B" stroke-width="3"/><path d="M420 104 L455 78 L490 104 Z" fill="#C9476B" stroke="#2E2A3B" stroke-width="3"/>`;
  b += '<rect x="440" y="258" width="30" height="42" rx="15" fill="#3F7D4E" stroke="#2E2A3B" stroke-width="3"/>';
  for (let i = 0; i < 12; i++) b += P.hierba(r() * 420, 300 + r() * 190, '#5E9E48', 1 + r() * .5);
  b += P.piedra(560, 330, 26, '#8E8A7E', '#B5B1A6') + P.piedra(620, 380, 18, '#8E8A7E', '#B5B1A6');
  return b + velo(r, noche);
}

/** Paisaje «barco». @type {import('./index.js').DibujoPaisaje} */
export function barco(r, noche, defs) {
  let b = cielo(defs, noche, '#8FD3F0', '#E9F6F4') + astros(r, noche, 120, 90);
  b += '<rect x="0" y="240" width="800" height="120" fill="#3E8DBE"/>';
  for (let i = 0; i < 8; i++) { const x = r() * 760, y = 255 + r() * 70; b += `<path d="M${n(x)} ${n(y)} q10 -5 20 0 q10 5 20 0" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".55"/>`; }
  b += '<rect x="390" y="40" width="16" height="320" fill="#7A5232"/><path d="M406 60 Q560 120 520 300 L406 300 Z" fill="#FFF7E6" stroke="#B89A6A" stroke-width="3"/>';
  b += `<path d="M406 40 L460 52 L406 64 Z" fill="${['#C9476B', '#3F7D4E', '#F2B33D'][Math.floor(r() * 3)]}"/>`;
  b += '<path d="M398 60 L120 330 M398 60 L760 330" stroke="#5E4630" stroke-width="3"/>';
  b += '<rect x="0" y="330" width="800" height="170" fill="#B9874F"/>';
  for (let x = 0; x < 800; x += 46) b += `<path d="M${x} 330 V500" stroke="#8A6040" stroke-width="2"/>`;
  b += '<rect x="0" y="318" width="800" height="16" fill="#8A6040"/>';
  for (let x = 20; x < 800; x += 60) b += `<rect x="${x}" y="290" width="8" height="30" fill="#8A6040"/>`;
  b += '<rect x="0" y="286" width="800" height="8" fill="#8A6040"/>';
  for (const x of [600 + r() * 60, 700]) b += `<rect x="${n(x)}" y="370" width="54" height="66" rx="10" fill="#9C6A3E" stroke="#5E3A26" stroke-width="3"/><path d="M${n(x)} 388 H${n(x + 54)} M${n(x)} 418 H${n(x + 54)}" stroke="#5E3A26" stroke-width="3"/>`;
  b += '<circle cx="520" cy="450" r="26" fill="none" stroke="#C9476B" stroke-width="10"/><circle cx="520" cy="450" r="26" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-dasharray="14 14"/>';
  return b + velo(r, noche);
}
