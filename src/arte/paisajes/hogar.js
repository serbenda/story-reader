/**
 * @file Paisajes: El hogar de las protagonistas (pantalla de inicio).
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

/** Paisaje «casa». @type {import('./index.js').DibujoPaisaje} */
export function casa(r, noche, defs) {
  let b = cielo(defs, noche, '#9ED6EE', '#E7F5EE') + astros(r, noche, 690, 82);
  for (const [x, rr] of [[560, 46], [610, 60], [680, 70], [750, 66], [800, 60]]) b += P.copa(x, 275, rr * (.9 + r() * .2), '#5C9A5E', '#4A8550');
  b += '<path d="M0 330 Q200 300 420 322 T800 318 V500 H0 Z" fill="#8FC96E"/>';
  const tejado = ['#C9476B', '#3F7D4E', '#5F7FC4', '#E07A3F'][Math.floor(r() * 4)];
  b += '<rect x="230" y="200" width="220" height="150" fill="#F4DDB1" stroke="#7E5136" stroke-width="5"/>';
  b += `<path d="M212 208 L340 118 L468 208 Z" fill="${tejado}" stroke="#5E3A33" stroke-width="5" stroke-linejoin="round"/>`;
  b += '<rect x="380" y="128" width="28" height="44" fill="#9C6A4A" stroke="#7E5136" stroke-width="4"/>';
  b += '<rect x="316" y="268" width="48" height="82" rx="24" fill="#3F7D4E" stroke="#7E5136" stroke-width="4"/><circle cx="352" cy="312" r="4" fill="#F2B33D"/>';
  const luz = noche ? '#FFE08A' : '#BFE6F3';
  for (const x of [252, 392]) b += `<rect x="${x}" y="228" width="44" height="40" rx="4" fill="${luz}" stroke="#7E5136" stroke-width="4"/><path d="M${x + 22} 228 V268 M${x} 248 H${x + 44}" stroke="#7E5136" stroke-width="3"/>`;
  b += '<path d="M0 392 Q300 368 800 400 V500 H0 Z" fill="#7DB95D"/>';
  b += '<path d="M318 350 Q300 420 250 500 H360 Q352 420 362 350 Z" fill="#E7CB94"/>';
  for (let x = 470; x < 800; x += 26) b += `<path d="M${x} 362 V318 L${x + 8} 306 L${x + 16} 318 V362 Z" fill="#FFF7E6" stroke="#B89A6A" stroke-width="2"/>`;
  b += '<rect x="466" y="326" width="340" height="7" fill="#FFF7E6" stroke="#B89A6A" stroke-width="2"/><rect x="466" y="346" width="340" height="7" fill="#FFF7E6" stroke="#B89A6A" stroke-width="2"/>';
  for (let i = 0; i < 26; i++) { const x = r() * 780 + 10, y = 410 + r() * 80; if (x > 240 && x < 370) continue; b += P.flor(x, y, 4 + r() * 3, ['#FFFFFF', '#F7B7C8', '#FFE08A'][Math.floor(r() * 3)]); }
  for (let i = 0; i < 18; i++) b += P.hierba(r() * 800, 360 + r() * 140, '#5E9E48', .8 + r() * .6);
  if (!noche) b += P.mariposa(520 + r() * 80, 200 + r() * 40, '#4F8FD0', 1.1);
  return b + velo(r, noche);
}
