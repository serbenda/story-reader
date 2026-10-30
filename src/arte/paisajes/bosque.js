/**
 * @file Paisajes: Bosque y campo: «El bosque de los susurros» y fondos de uso general.
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

/** Paisaje «bosque». @type {import('./index.js').DibujoPaisaje} */
export function bosque(r, noche, defs) {
  const g = noche ? P.grad('#2A3557', '#3E5A55') : P.grad('#D8EDC8', '#A6CF8F');
  defs.push(g.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  if (noche) b += astros(r, true, 120 + r() * 560, 70);
  for (let x = -20; x < 840; x += 55) b += P.arbol(x + (r() - .5) * 20, 330, 150 + r() * 60, 46 + r() * 14, '#A08466', '#9CC79A', '#8DBA8B');
  if (!noche) b += '<g fill="#FFFFFF" opacity=".16"><path d="M300 0 L360 0 L520 500 L380 500 Z"/><path d="M470 0 L500 0 L640 500 L590 500 Z"/><path d="M120 0 L150 0 L220 500 L160 500 Z"/></g>';
  b += '<path d="M0 320 Q400 300 800 322 V500 H0 Z" fill="#7FB062"/>';
  const curva = 330 + r() * 120;
  b += `<path d="M380 318 Q420 320 430 340 Q${n(curva + 40)} 410 420 500 H200 Q330 420 360 340 Q362 322 380 318 Z" fill="#E4C793"/>`;
  for (const [x, sc] of [[-10, 1], [60, .9], [770, 1.05], [690, .85]]) b += P.arbol(x, 480, 300 * sc, 110 * sc, '#6B4630', '#3F7D4E', '#2F6A3E');
  for (let i = 0; i < 14; i++) b += P.hierba(r() * 800, 330 + r() * 170, '#5A9445', 1 + r() * .8);
  for (let i = 0; i < 4; i++) b += P.seta(130 + r() * 540, 360 + r() * 90, .8 + r() * .6);
  return b + velo(r, noche);
}

/** Paisaje «rio». @type {import('./index.js').DibujoPaisaje} */
export function rio(r, noche, defs) {
  let b = cielo(defs, noche, '#A3DAF0', '#E9F6EF') + astros(r, noche, 660, 90);
  const agua = P.grad('#7EC3E3', '#3E8DBE'); defs.push(agua.def);
  b += '<path d="M0 260 Q160 200 330 250 T800 240 V500 H0 Z" fill="#A9D79A"/>';
  b += '<path d="M0 290 Q250 250 520 285 T800 280 V500 H0 Z" fill="#8CC77A"/>';
  for (const x of [90, 160, 700, 760]) b += P.pino(x + (r() - .5) * 30, 300, 100 + r() * 40, 70, '#4C8A57');
  b += `<path d="M470 280 Q520 278 560 284 Q600 330 690 380 Q760 430 800 450 V500 H420 Q450 420 470 360 Q480 310 470 280 Z" fill="url(#${agua.id})"/>`;
  for (let i = 0; i < 9; i++) { const y = 300 + i * 22, x = 480 + i * 30 + (r() - .5) * 20; b += `<path d="M${n(x)} ${y} q14 -6 28 0 q14 6 28 0" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`; }
  for (const [x, y, rr] of [[440, 470, 26], [410, 440, 16], [700, 360, 18], [770, 400, 14], [455, 330, 12]]) b += P.piedra(x + (r() - .5) * 20, y, rr);
  for (let x = 380; x < 470; x += 14) { const h = 60 + r() * 40; b += `<path d="M${x} 470 Q${x + 4} ${n(470 - h / 2)} ${x + 2} ${n(470 - h)}" stroke="#4E8A3E" stroke-width="4" fill="none"/><rect x="${x - 3}" y="${n(470 - h - 4)}" width="10" height="24" rx="5" fill="#7A4E2E"/>`; }
  for (let i = 0; i < 12; i++) b += P.hierba(r() * 380, 320 + r() * 180, '#5E9E48', 1 + r() * .6);
  return b + velo(r, noche);
}

/** Paisaje «cueva». @type {import('./index.js').DibujoPaisaje} */
export function cueva(r, noche, defs) {
  const roca = noche ? P.grad('#6C6378', '#4A4250') : P.grad('#C7B79C', '#8F7C66'); defs.push(roca.def);
  const boca = P.nuevoId('b');
  defs.push(`<radialGradient id="${boca}" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#140F1C"/><stop offset="1" stop-color="#3A3040"/></radialGradient>`);
  let b = `<rect width="800" height="500" fill="url(#${roca.id})"/>`;
  for (const [x, y, rr] of [[80, 120, 120], [260, 60, 110], [700, 90, 140], [520, 30, 100]]) b += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${n(rr * .7)}" fill="#B3A285" opacity="${noche ? .25 : .7}"/>`;
  b += `<path d="M360 420 Q350 180 520 150 Q700 140 720 420 Z" fill="url(#${boca})"/>`;
  b += '<path d="M360 420 Q350 180 520 150 Q700 140 720 420" fill="none" stroke="#6E5C48" stroke-width="16" stroke-linecap="round"/>';
  for (let x = 410; x < 690; x += 34) { const h = 24 + r() * 28; b += `<path d="M${x} 170 L${x + 10} ${n(170 + h)} L${x + 20} 170 Z" fill="#8F7C66"/>`; }
  for (let i = 0; i < 3; i++) { const x = 470 + r() * 150, y = 220 + r() * 50; b += `<path d="M${n(x - 12)} ${n(y)} q6 -8 12 0 q6 -8 12 0" stroke="#5B4F66" stroke-width="3" fill="none"/>`; }
  for (let i = 0; i < 4; i++) { const x = 390 + r() * 310, y = 395 + r() * 20; b += `<circle cx="${n(x)}" cy="${n(y)}" r="7" fill="#7FE0D6" opacity=".85"/><circle cx="${n(x)}" cy="${n(y)}" r="14" fill="#7FE0D6" opacity=".2"/>`; }
  b += '<path d="M0 400 Q400 370 800 400 V500 H0 Z" fill="#7B6A57"/><path d="M0 440 Q300 420 800 450 V500 H0 Z" fill="#6A5A49"/>';
  for (const [x, y, rr] of [[120, 420, 30], [220, 455, 22], [760, 430, 34], [650, 470, 18]]) b += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${n(rr * .55)}" fill="#9A8A74"/>`;
  for (const [x, y, w] of [[330, 230, 60], [700, 200, 70], [40, 300, 80], [740, 330, 50]]) b += `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="12" fill="#6E9A4E" opacity=".85"/>`;
  return b + (noche ? '<rect width="800" height="500" fill="#1C2152" opacity=".3"/>' : '');
}

/** Paisaje «puente». @type {import('./index.js').DibujoPaisaje} */
export function puente(r, noche, defs) {
  let b = cielo(defs, noche, '#A9DCEF', '#F0F7E8') + astros(r, noche, 110, 80);
  const barr = P.grad('#7FA977', '#4E7A55'); defs.push(barr.def);
  b += `<rect x="250" y="300" width="300" height="200" fill="url(#${barr.id})"/>`;
  for (const x of [290, 340, 470, 520]) b += P.pino(x, 470, 100 + r() * 40, 60, '#3F6E48');
  b += '<path d="M300 500 Q400 450 520 500 Z" fill="#5FA8CF"/>';
  b += '<path d="M0 290 L300 300 Q320 360 290 420 L300 500 H0 Z" fill="#8FC96E"/><path d="M290 300 Q320 360 290 420 L300 500 L250 500 Q270 400 250 300 Z" fill="#9B6E4C"/>';
  b += '<path d="M800 285 L510 300 Q490 360 515 420 L505 500 H800 Z" fill="#8FC96E"/><path d="M515 300 Q490 360 515 420 L505 500 L560 500 Q540 400 560 300 Z" fill="#9B6E4C"/>';
  for (let i = 0; i < 16; i++) { const t = i / 15, x = 296 + t * 214, y = 300 + Math.sin(t * Math.PI) * 34; b += `<rect x="${n(x - 6)}" y="${n(y - 4)}" width="13" height="10" rx="2" fill="#B9874F" stroke="#7A5232" stroke-width="2"/>`; }
  b += '<path d="M296 262 Q403 300 510 262" stroke="#8A6040" stroke-width="4" fill="none"/><path d="M296 300 Q403 340 510 300" stroke="#8A6040" stroke-width="3" fill="none"/>';
  for (let i = 1; i < 8; i++) { const t = i / 8, x = 296 + t * 214; b += `<path d="M${n(x)} ${n(262 + Math.sin(t * Math.PI) * 20)} V${n(300 + Math.sin(t * Math.PI) * 34)}" stroke="#8A6040" stroke-width="2"/>`; }
  for (const x of [292, 514]) b += `<rect x="${x - 6}" y="248" width="12" height="60" rx="3" fill="#7A5232"/>`;
  for (const [x, s] of [[60, 1], [720, .9], [770, 1.1]]) b += P.arbol(x, 310, 120 * s * (.9 + r() * .2), 60 * s);
  for (let i = 0; i < 12; i++) { const x = r() < .5 ? r() * 260 : 560 + r() * 240; b += P.hierba(x, 320 + r() * 180, '#5E9E48', 1 + r() * .6); }
  return b + velo(r, noche);
}

/** Paisaje «prado». @type {import('./index.js').DibujoPaisaje} */
export function prado(r, noche, defs) {
  let b = cielo(defs, noche, '#9FD8F2', '#F4F8E6') + astros(r, noche, 640, 90);
  b += '<path d="M0 280 Q200 220 420 270 T800 250 V500 H0 Z" fill="#B5DC8F"/>';
  b += P.arbol(640 + r() * 120, 270, 70, 48, '#7A5236', '#62A15C', '#4E8F57');
  b += '<path d="M0 320 Q300 280 560 315 T800 310 V500 H0 Z" fill="#94CB6E"/>';
  const pts = [];
  for (let i = 0; i < 140; i++) pts.push([310 + r() * 190, r() * 800, r()]);
  pts.sort((a, c) => a[0] - c[0]);
  for (const [y, x, k] of pts) b += P.flor(x, y, 6 * (.4 + (y - 300) / 200 * .9), k < .5 ? '#FFFFFF' : k < .75 ? '#FFE08A' : '#F7B7C8');
  if (!noche) b += P.mariposa(250 + r() * 150, 220 + r() * 30, '#F2B33D', 1.2) + P.mariposa(480 + r() * 100, 190 + r() * 40, '#C9476B', .9) + P.mariposa(120 + r() * 80, 250, '#5FA8CF', 1);
  return b + velo(r, noche);
}

/** Paisaje «arbol». @type {import('./index.js').DibujoPaisaje} */
export function arbol(r, noche, defs) {
  const g = noche ? P.grad('#1E2550', '#4A4E86') : P.grad('#F6E3B6', '#E9C98E'); defs.push(g.def);
  const tr = P.grad('#8A5E3C', '#6B4630', false); defs.push(tr.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  if (noche) b += astros(r, true, 180, 90);
  for (let x = -20; x < 840; x += 70) b += P.arbol(x, 330, 120 + r() * 50, 40 + r() * 15, '#B08D67', '#E7B56B', '#D99A55');
  b += '<path d="M0 330 Q400 300 800 330 V500 H0 Z" fill="#B9A15E"/><path d="M0 400 Q400 380 800 410 V500 H0 Z" fill="#A58C4E"/>';
  b += `<path d="M480 430 Q500 260 520 120 L650 120 Q670 260 700 430 Q740 470 780 480 L400 480 Q450 470 480 430 Z" fill="url(#${tr.id})"/>`;
  b += '<path d="M480 430 Q440 470 400 482 M700 430 Q740 465 790 480 M560 440 Q560 470 540 490 M630 440 Q640 470 660 492" stroke="#6B4630" stroke-width="14" fill="none" stroke-linecap="round"/>';
  b += '<ellipse cx="590" cy="250" rx="34" ry="46" fill="#2E2030"/>';
  b += `<path d="M564 440 V400 Q564 372 590 372 Q616 372 616 400 V440 Z" fill="#3F7D4E" stroke="#2C5E39" stroke-width="4"/><circle cx="606" cy="410" r="4" fill="#F2B33D"/>`;
  if (noche) b += '<path d="M564 440 V400 Q564 372 590 372 Q616 372 616 400 V440 Z" fill="#FFE98A" opacity=".25"/>';
  for (let i = 0; i < 5; i++) b += `<path d="M${520 + i * 30} ${150 + i * 50} q10 20 0 40" stroke="#5A3A26" stroke-width="3" fill="none" opacity=".6"/>`;
  b += P.copa(590, 110, 130, '#E39A45', '#C9763A') + P.copa(470, 140, 80, '#F2B33D', '#E39A45') + P.copa(720, 150, 85, '#D9683F', '#C9763A');
  for (let i = 0; i < 16; i++) { const x = r() * 800, y = 200 + r() * 290, c = ['#E39A45', '#F2B33D', '#C9763A', '#D9683F'][Math.floor(r() * 4)]; b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="7" ry="4" fill="${c}" transform="rotate(${Math.floor(r() * 180)} ${n(x)} ${n(y)})"/>`; }
  b += P.seta(430, 470, 1.1, '#C9476B') + P.seta(740, 470, .9, '#C9476B');
  return b + velo(r, noche);
}
