/**
 * @file Paisajes: Espacio: «Viaje a la luna».
 *
 * Capa: arte. Cada función dibuja un paisaje de 800×500 y devuelve el
 * contenido del SVG (sin la etiqueta <svg>, que pone ./index.js).
 * Firma común: (r, noche, defs) → string, donde
 *   r     = número al azar repetible (0–1) de ../aleatorio.js
 *   noche = si hay que dibujarlo de noche
 *   defs  = lista donde dejar degradados u otras definiciones <defs>
 */
import * as P from '../piezas.js';
import { redondear1 as n } from '../../util/numeros.js';

/** Paisaje «luna». @type {import('./index.js').DibujoPaisaje} */
export function luna(r, noche, defs) {
  let b = '<rect width="800" height="500" fill="#121633"/>';
  for (let i = 0; i < 90; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 300)}" r="${n(.6 + r() * 1.6)}" fill="#FFFFFF" opacity="${n(.4 + r() * .6)}"/>`;
  b += '<circle cx="640" cy="100" r="48" fill="#3E8DBE"/><path d="M610 80 q20 -10 30 10 q10 20 -10 30 q-20 -5 -20 -40 Z M660 110 q16 -8 20 10 q-10 16 -20 -10" fill="#5FB06A"/><circle cx="640" cy="100" r="48" fill="none" stroke="#BFE6F3" stroke-width="4" opacity=".6"/>';
  b += '<path d="M0 300 Q200 270 400 300 T800 290 V500 H0 Z" fill="#B8B8C6"/><path d="M0 360 Q400 330 800 370 V500 H0 Z" fill="#A2A2B2"/>';
  for (let i = 0; i < 8; i++) { const x = r() * 800, y = 320 + r() * 160, rr = 14 + r() * 26; b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * .35)}" fill="#8C8C9E"/><ellipse cx="${n(x)}" cy="${n(y - 2)}" rx="${n(rr * .7)}" ry="${n(rr * .2)}" fill="#7A7A8C"/>`; }
  const cx = 680;
  b += `<path d="M${cx} 180 Q${cx + 28} 220 ${cx + 28} 320 H${cx - 28} Q${cx - 28} 220 ${cx} 180 Z" fill="#F4F4F8" stroke="#2E2A3B" stroke-width="3"/><circle cx="${cx}" cy="250" r="12" fill="#5FA8CF" stroke="#2E2A3B" stroke-width="3"/><path d="M${cx - 28} 290 L${cx - 48} 330 L${cx - 28} 320 Z M${cx + 28} 290 L${cx + 48} 330 L${cx + 28} 320 Z" fill="#C9476B" stroke="#2E2A3B" stroke-width="3"/>`;
  b += '<path d="M120 300 V250" stroke="#E2E2EA" stroke-width="4"/><path d="M120 250 h40 v24 h-40 Z" fill="#C9476B"/>';
  return b;
}

/** Paisaje «planeta». @type {import('./index.js').DibujoPaisaje} */
export function planeta(r, noche, defs) {
  const g = P.grad('#3A1F5C', '#B0558C'); defs.push(g.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  for (let i = 0; i < 60; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 260)}" r="${n(.6 + r() * 1.4)}" fill="#FFFFFF" opacity="${n(.4 + r() * .5)}"/>`;
  b += '<circle cx="180" cy="90" r="30" fill="#F2B33D"/><circle cx="260" cy="130" r="16" fill="#9FE0D6"/>';
  b += '<path d="M0 290 Q180 250 380 290 T800 270 V500 H0 Z" fill="#D9683F"/><path d="M0 350 Q380 320 800 360 V500 H0 Z" fill="#C2532E"/>';
  for (let i = 0; i < 6; i++) { const x = 60 + r() * 700, y = 330 + r() * 120; b += `<path d="M${n(x - 18)} ${n(y)} L${n(x - 8)} ${n(y - 26)} L${n(x + 10)} ${n(y - 18)} L${n(x + 20)} ${n(y)} Z" fill="#9E3E22"/>`; }
  for (let i = 0; i < 5; i++) { const x = 80 + r() * 640, y = 330 + r() * 100, h = 40 + r() * 40; b += `<path d="M${n(x)} ${n(y)} V${n(y - h)}" stroke="#4FC7B0" stroke-width="10" stroke-linecap="round"/><circle cx="${n(x)}" cy="${n(y - h - 8)}" r="10" fill="#B7F5E6"/><circle cx="${n(x)}" cy="${n(y - h - 8)}" r="20" fill="#B7F5E6" opacity=".25"/>`; }
  return b;
}

/** Paisaje «nave». @type {import('./index.js').DibujoPaisaje} */
export function nave(r, noche, defs) {
  const g = P.grad('#D9E0E8', '#9AA6B4'); defs.push(g.def);
  let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  b += '<circle cx="520" cy="190" r="140" fill="#121633" stroke="#5F6B7A" stroke-width="18"/>';
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = r() * 125; b += `<circle cx="${n(520 + Math.cos(a) * d)}" cy="${n(190 + Math.sin(a) * d)}" r="${n(.6 + r() * 1.5)}" fill="#FFFFFF"/>`; }
  b += '<circle cx="570" cy="230" r="44" fill="#E9775A"/><ellipse cx="570" cy="230" rx="70" ry="14" fill="none" stroke="#F2B33D" stroke-width="5"/>';
  for (const x of [60, 760]) b += `<rect x="${x - 40}" y="40" width="80" height="300" rx="20" fill="#C3CCD6" stroke="#5F6B7A" stroke-width="3"/>`;
  b += '<rect x="0" y="360" width="800" height="140" fill="#6E7A88"/><path d="M0 360 H800" stroke="#4A5562" stroke-width="6"/>';
  b += '<rect x="150" y="300" width="230" height="80" rx="14" fill="#4A5562" stroke="#2E2A3B" stroke-width="3"/>';
  const colores = ['#E04A3C', '#F2B33D', '#4FC7B0', '#5FA8CF', '#C9476B'];
  for (let i = 0; i < 10; i++) b += `<circle cx="${175 + (i % 5) * 45}" cy="${322 + Math.floor(i / 5) * 30}" r="9" fill="${colores[Math.floor(r() * 5)]}"/>`;
  return b;
}

/** Paisaje «espacio». @type {import('./index.js').DibujoPaisaje} */
export function espacio(r, noche, defs) {
  let b = '<rect width="800" height="500" fill="#0E1230"/>';
  b += '<ellipse cx="250" cy="160" rx="220" ry="90" fill="#6A3FA0" opacity=".25"/><ellipse cx="560" cy="260" rx="200" ry="70" fill="#2F8FB0" opacity=".2"/>';
  for (let i = 0; i < 120; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(.5 + r() * 1.8)}" fill="#FFFFFF" opacity="${n(.4 + r() * .6)}"/>`;
  b += '<circle cx="600" cy="140" r="60" fill="#F2B33D"/><ellipse cx="600" cy="140" rx="105" ry="20" fill="none" stroke="#E9775A" stroke-width="8" transform="rotate(-15 600 140)"/>';
  for (let i = 0; i < 5; i++) { const x = r() * 800, y = 100 + r() * 220, rr = 8 + r() * 16; b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * .8)}" fill="#7A6F80"/>`; }
  b += '<path d="M-20 420 Q100 330 260 360 Q420 320 520 380 Q640 340 820 400 V520 H-20 Z" fill="#8C8098"/><path d="M-20 450 Q300 400 820 450 V520 H-20 Z" fill="#776B84"/>';
  for (let i = 0; i < 5; i++) b += `<ellipse cx="${n(r() * 800)}" cy="${n(430 + r() * 50)}" rx="18" ry="6" fill="#665A72"/>`;
  return b;
}
