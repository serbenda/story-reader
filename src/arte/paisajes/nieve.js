/**
 * @file Paisajes: Invierno: «La montaña nevada».
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

/** Paisaje «nieve». @type {import('./index.js').DibujoPaisaje} */
export function nieve(r, noche, defs) {
  let b = cielo(defs, noche, '#BFE3F5', '#F2F8FB') + astros(r, noche, 650, 80);
  b += '<path d="M-20 300 L160 120 L280 240 L420 90 L600 280 L700 170 L820 300 Z" fill="#9FB8CC"/><path d="M160 120 L130 150 L150 160 L175 140 L200 165 L215 150 Z M420 90 L380 135 L405 145 L430 120 L455 150 L470 135 Z M700 170 L675 195 L700 205 L720 190 Z" fill="#FFFFFF"/>';
  b += '<path d="M0 300 Q300 270 800 310 V500 H0 Z" fill="#F4F9FC"/><path d="M0 380 Q400 350 800 390 V500 H0 Z" fill="#E6F0F7"/>';
  for (let i = 0; i < 6; i++) { const x = r() < .5 ? r() * 250 : 520 + r() * 280, s = .8 + r() * .5; b += P.pino(x, 330 + r() * 40, 110 * s, 70 * s, '#3F6E58') + `<path d="M${n(x - 25 * s)} ${n(300 - 10 * s)} L${n(x)} ${n(270 - 20 * s)} L${n(x + 25 * s)} ${n(300 - 10 * s)} Z" fill="#FFFFFF" opacity=".85"/>`; }
  const mx = 560 + r() * 120;
  b += `<circle cx="${n(mx)}" cy="430" r="34" fill="#FFFFFF" stroke="#BFD3E2" stroke-width="3"/><circle cx="${n(mx)}" cy="378" r="24" fill="#FFFFFF" stroke="#BFD3E2" stroke-width="3"/><path d="M${n(mx)} 380 l18 4 l-18 4 Z" fill="#F08A3C"/><circle cx="${n(mx - 8)}" cy="372" r="3" fill="#2E2A3B"/><circle cx="${n(mx + 6)}" cy="372" r="3" fill="#2E2A3B"/><rect x="${n(mx - 22)}" y="392" width="44" height="8" rx="4" fill="#C9476B"/>`;
  for (let i = 0; i < 40; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
  return b + velo(r, noche);
}

/** Paisaje «lago». @type {import('./index.js').DibujoPaisaje} */
export function lago(r, noche, defs) {
  let b = cielo(defs, noche, '#C3E4F4', '#F3F9FC') + astros(r, noche, 150, 80);
  b += '<path d="M-20 280 L180 140 L330 260 L520 120 L820 280 Z" fill="#A9BFD1"/><path d="M180 140 L150 165 L180 172 L205 160 Z M520 120 L485 150 L515 158 L545 140 Z" fill="#FFFFFF"/>';
  b += '<path d="M0 280 Q400 260 800 285 V500 H0 Z" fill="#F4F9FC"/>';
  const hielo = P.grad('#D6EEF8', '#A7D3EA'); defs.push(hielo.def);
  b += `<ellipse cx="520" cy="390" rx="300" ry="80" fill="url(#${hielo.id})" stroke="#FFFFFF" stroke-width="6"/>`;
  b += '<path d="M380 370 l40 10 l20 -14 l30 20 M560 420 l30 -12 l24 16 M620 360 l-20 20" stroke="#FFFFFF" stroke-width="3" fill="none"/><path d="M460 350 L560 350" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".7"/>';
  for (const x of [60, 130, 760]) b += P.pino(x, 320, 120, 74, '#3F6E58') + `<path d="M${x - 24} 296 L${x} 266 L${x + 24} 296 Z" fill="#FFFFFF" opacity=".85"/>`;
  for (let i = 0; i < 30; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
  return b + velo(r, noche);
}

/** Paisaje «iglu». @type {import('./index.js').DibujoPaisaje} */
export function iglu(r, noche, defs) {
  let b = cielo(defs, noche, '#C9E6F5', '#F4FAFD') + astros(r, noche, 640, 80);
  if (noche) b += '<path d="M0 120 Q200 60 400 130 T800 100" stroke="#5FE0A8" stroke-width="40" fill="none" opacity=".35"/><path d="M0 160 Q260 100 520 170 T800 140" stroke="#8A62C4" stroke-width="26" fill="none" opacity=".3"/>';
  b += '<path d="M0 290 Q400 260 800 300 V500 H0 Z" fill="#F4F9FC"/>';
  b += '<path d="M380 360 A140 120 0 0 1 660 360 Z" fill="#FFFFFF" stroke="#BFD3E2" stroke-width="4"/>';
  for (const y of [270, 310, 340]) b += `<path d="M${n(520 - Math.sqrt(Math.max(0, 1 - ((360 - y) / 120) ** 2)) * 140)} ${y} H${n(520 + Math.sqrt(Math.max(0, 1 - ((360 - y) / 120) ** 2)) * 140)}" stroke="#D3E3EE" stroke-width="3"/>`;
  b += `<path d="M590 360 V320 A28 28 0 0 1 646 320 V360 Z" fill="${noche ? '#FFD27A' : '#5B7E99'}" stroke="#BFD3E2" stroke-width="4"/>`;
  b += '<path d="M0 360 Q400 340 800 370 V500 H0 Z" fill="#E6F0F7"/>';
  b += '<rect x="150" y="380" width="90" height="12" rx="6" fill="#C9476B"/><path d="M150 392 Q140 404 160 404 H250" stroke="#8A6040" stroke-width="5" fill="none"/>';
  for (let i = 0; i < 35; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
  return b + velo(r, noche);
}

/** Paisaje «cabana». @type {import('./index.js').DibujoPaisaje} */
export function cabana(r, noche, defs) {
  let b = cielo(defs, noche, '#BFE3F5', '#F2F8FB') + astros(r, noche, 140, 80);
  b += '<path d="M0 300 Q400 270 800 305 V500 H0 Z" fill="#F4F9FC"/>';
  for (let i = 0; i < 5; i++) { const x = r() < .5 ? r() * 200 : 640 + r() * 160; b += P.pino(x, 320, 120, 70, '#3F6E58') + `<path d="M${n(x - 22)} 296 L${n(x)} 268 L${n(x + 22)} 296 Z" fill="#FFFFFF" opacity=".85"/>`; }
  b += '<rect x="330" y="220" width="250" height="140" fill="#9C6A3E" stroke="#5E3A26" stroke-width="4"/>';
  for (let y = 236; y < 360; y += 22) b += `<path d="M330 ${y} H580" stroke="#7A5232" stroke-width="3"/>`;
  b += '<path d="M310 226 L455 140 L600 226 Z" fill="#7A5232" stroke="#5E3A26" stroke-width="4"/><path d="M318 222 L455 142 L592 222 L586 232 L455 156 L324 232 Z" fill="#FFFFFF"/>';
  b += '<rect x="520" y="150" width="30" height="56" fill="#8E8A7E" stroke="#5E3A26" stroke-width="3"/>';
  for (let i = 0; i < 4; i++) b += `<circle cx="${535 + i * 8}" cy="${130 - i * 22}" r="${10 + i * 4}" fill="#FFFFFF" opacity="${n(.7 - i * .14)}"/>`;
  const luz = noche ? '#FFD27A' : '#CFEFFF';
  b += `<rect x="360" y="260" width="60" height="50" fill="${luz}" stroke="#5E3A26" stroke-width="4"/><path d="M390 260 V310 M360 285 H420" stroke="#5E3A26" stroke-width="3"/>`;
  b += '<rect x="470" y="270" width="60" height="90" rx="6" fill="#C9476B" stroke="#5E3A26" stroke-width="4"/><circle cx="518" cy="318" r="4" fill="#F2B33D"/>';
  b += '<path d="M0 380 Q400 360 800 390 V500 H0 Z" fill="#E6F0F7"/>';
  for (let i = 0; i < 35; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
  return b + velo(r, noche);
}
