/* ──────────────────────────────────────────────────────────────
   ARTE · Todo lo que se dibuja con código, sin archivos de imagen.
   - Paisajes generados al momento (cambian un poco en cada partida).
   - Alaia y Lucía, con su ropa, pelo y complementos.
   Para añadir un paisaje nuevo: escribe una función en PAISAJES
   y úsala desde libro.md con «fondo: nombre».
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // Números al azar repetibles a partir de una semilla
  function aleatorio(semilla) {
    let a = typeof semilla === 'number' ? semilla : hash(String(semilla));
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  const n = (x) => Math.round(x * 10) / 10;
  let idGrad = 0;

  // ───────── Piezas reutilizables ─────────
  const P = {
    grad(a, b, vertical = true) {
      const id = 'g' + (++idGrad);
      const fin = vertical ? 'x2="0" y2="1"' : 'x2="1" y2="0"';
      return { id, def: `<linearGradient id="${id}" x1="0" y1="0" ${fin}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` };
    },
    nube(x, y, s = 1) {
      return `<g fill="#FFFFFF" opacity=".92"><ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(52 * s)}" ry="${n(18 * s)}"/><ellipse cx="${n(x + 26 * s)}" cy="${n(y - 12 * s)}" rx="${n(32 * s)}" ry="${n(20 * s)}"/><ellipse cx="${n(x - 24 * s)}" cy="${n(y - 6 * s)}" rx="${n(24 * s)}" ry="${n(15 * s)}"/></g>`;
    },
    sol(x, y, r = 42) {
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${r + 24}" fill="#FFE59A" opacity=".35"/><circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="#F6C343"/>`;
    },
    flor(x, y, r = 6, petalo = '#FFFFFF', centro = '#F2B33D') {
      let s = '';
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; s += `<circle cx="${n(x + r * Math.cos(a))}" cy="${n(y + r * Math.sin(a))}" r="${n(r * .62)}" fill="${petalo}"/>`; }
      return s + `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * .55)}" fill="${centro}"/>`;
    },
    copa(x, y, r, c1, c2) {
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${c1}"/><circle cx="${n(x - r * .7)}" cy="${n(y + r * .25)}" r="${n(r * .72)}" fill="${c1}"/><circle cx="${n(x + r * .7)}" cy="${n(y + r * .2)}" r="${n(r * .75)}" fill="${c1}"/><circle cx="${n(x + r * .25)}" cy="${n(y + r * .45)}" r="${n(r * .6)}" fill="${c2}"/><circle cx="${n(x - r * .35)}" cy="${n(y - r * .35)}" r="${n(r * .35)}" fill="#FFFFFF" opacity=".12"/>`;
    },
    arbol(x, suelo, alto, r, tronco = '#7A5236', c1 = '#4E8F57', c2 = '#3B7346') {
      const w = r * .32;
      return `<path d="M${n(x - w / 2)} ${suelo} L${n(x - w / 2.6)} ${n(suelo - alto)} L${n(x + w / 2.6)} ${n(suelo - alto)} L${n(x + w / 2)} ${suelo} Z" fill="${tronco}"/>` + P.copa(x, suelo - alto - r * .3, r, c1, c2);
    },
    pino(x, suelo, alto, ancho, c = '#3D7A4A', t = '#6B4630') {
      let s = `<rect x="${n(x - ancho * .07)}" y="${n(suelo - alto * .2)}" width="${n(ancho * .14)}" height="${n(alto * .2)}" fill="${t}"/>`;
      for (let i = 0; i < 3; i++) {
        const y0 = suelo - alto * .15 - i * alto * .27, a = ancho * (1 - i * .22);
        s += `<path d="M${n(x - a / 2)} ${n(y0)} L${n(x)} ${n(y0 - alto * .42)} L${n(x + a / 2)} ${n(y0)} Z" fill="${c}"/>`;
      }
      return s;
    },
    seta(x, y, s = 1, c = '#D9496C') {
      return `<rect x="${n(x - 4 * s)}" y="${n(y - 14 * s)}" width="${n(8 * s)}" height="${n(14 * s)}" rx="${n(3 * s)}" fill="#FFF3DD"/><path d="M${n(x - 14 * s)} ${n(y - 12 * s)} Q${n(x)} ${n(y - 34 * s)} ${n(x + 14 * s)} ${n(y - 12 * s)} Z" fill="${c}"/><circle cx="${n(x - 5 * s)}" cy="${n(y - 19 * s)}" r="${n(2.4 * s)}" fill="#FFFFFF"/><circle cx="${n(x + 5 * s)}" cy="${n(y - 22 * s)}" r="${n(2 * s)}" fill="#FFFFFF"/>`;
    },
    hierba(x, y, c = '#5E9E48', s = 1) {
      return `<path d="M${n(x - 8 * s)} ${n(y)} Q${n(x - 6 * s)} ${n(y - 14 * s)} ${n(x - 2 * s)} ${n(y - 18 * s)} Q${n(x - s)} ${n(y - 8 * s)} ${n(x)} ${n(y)} Q${n(x + 2 * s)} ${n(y - 16 * s)} ${n(x + 7 * s)} ${n(y - 20 * s)} Q${n(x + 5 * s)} ${n(y - 8 * s)} ${n(x + 8 * s)} ${n(y)} Z" fill="${c}"/>`;
    },
    mariposa(x, y, c = '#5FA8CF', s = 1) {
      return `<g transform="translate(${n(x)} ${n(y)}) scale(${s})"><ellipse cx="-7" cy="-4" rx="8" ry="6" fill="${c}"/><ellipse cx="7" cy="-4" rx="8" ry="6" fill="${c}"/><ellipse cx="-5" cy="5" rx="5" ry="4" fill="${c}"/><ellipse cx="5" cy="5" rx="5" ry="4" fill="${c}"/><rect x="-1.2" y="-8" width="2.4" height="16" rx="1.2" fill="#2E2A3B"/></g>`;
    },
    piedra(x, y, r, c = '#9A9AA6', brillo = '#C2C2CC') {
      return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r)}" ry="${n(r * .6)}" fill="${c}"/><ellipse cx="${n(x - r * .3)}" cy="${n(y - r * .2)}" rx="${n(r * .4)}" ry="${n(r * .2)}" fill="${brillo}"/>`;
    }
  };

  // Cielo: de día o de noche
  function cielo(defs, noche, dia1, dia2) {
    const g = noche ? P.grad('#1E2550', '#4A4E86') : P.grad(dia1, dia2);
    defs.push(g.def);
    return `<rect width="800" height="500" fill="url(#${g.id})"/>`;
  }
  function astros(r, noche, xSol, ySol) {
    if (!noche) return P.sol(xSol, ySol) + P.nube(120 + r() * 180, 70 + r() * 30) + P.nube(400 + r() * 150, 55 + r() * 40, .7);
    let s = `<circle cx="${xSol}" cy="${ySol}" r="70" fill="#FFF4C7" opacity=".18"/><circle cx="${xSol}" cy="${ySol}" r="42" fill="#FFF4C7"/><circle cx="${xSol - 12}" cy="${ySol - 8}" r="7" fill="#EDE2B0"/><circle cx="${xSol + 10}" cy="${ySol + 12}" r="5" fill="#EDE2B0"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${n(r() * 800)}" cy="${n(r() * 220)}" r="${n(.8 + r() * 1.6)}" fill="#FFFFFF" opacity="${n(.5 + r() * .5)}"/>`;
    return s;
  }
  // Velo azul de noche por encima del paisaje, y luciérnagas
  function velo(r, noche) {
    if (!noche) return '';
    let s = '<rect width="800" height="500" fill="#1C2152" opacity=".42"/>';
    for (let i = 0; i < 14; i++) { const x = r() * 800, y = 200 + r() * 280; s += `<circle cx="${n(x)}" cy="${n(y)}" r="9" fill="#FFE98A" opacity=".18"/><circle cx="${n(x)}" cy="${n(y)}" r="2.6" fill="#FFF2B0"/>`; }
    return s;
  }

  // ───────── Paisajes ─────────
  const PAISAJES = {
    casa(r, noche, defs) {
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
    },

    bosque(r, noche, defs) {
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
    },

    rio(r, noche, defs) {
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
    },

    cueva(r, noche, defs) {
      const roca = noche ? P.grad('#6C6378', '#4A4250') : P.grad('#C7B79C', '#8F7C66'); defs.push(roca.def);
      const boca = 'b' + (++idGrad);
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
    },

    puente(r, noche, defs) {
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
    },

    prado(r, noche, defs) {
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
    },

    arbol(r, noche, defs) {
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
    },

    // ───── Mar ─────
    playa(r, noche, defs) {
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
    },
    faro(r, noche, defs) {
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
    },
    barco(r, noche, defs) {
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
    },

    // ───── Granja ─────
    granja(r, noche, defs) {
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
    },
    huerto(r, noche, defs) {
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
    },

    // ───── Castillo ─────
    castillo(r, noche, defs) {
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
    },
    torre(r, noche, defs) {
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
    },

    // ───── Espacio ─────
    luna(r, noche, defs) {
      let b = '<rect width="800" height="500" fill="#121633"/>';
      for (let i = 0; i < 90; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 300)}" r="${n(.6 + r() * 1.6)}" fill="#FFFFFF" opacity="${n(.4 + r() * .6)}"/>`;
      b += '<circle cx="640" cy="100" r="48" fill="#3E8DBE"/><path d="M610 80 q20 -10 30 10 q10 20 -10 30 q-20 -5 -20 -40 Z M660 110 q16 -8 20 10 q-10 16 -20 -10" fill="#5FB06A"/><circle cx="640" cy="100" r="48" fill="none" stroke="#BFE6F3" stroke-width="4" opacity=".6"/>';
      b += '<path d="M0 300 Q200 270 400 300 T800 290 V500 H0 Z" fill="#B8B8C6"/><path d="M0 360 Q400 330 800 370 V500 H0 Z" fill="#A2A2B2"/>';
      for (let i = 0; i < 8; i++) { const x = r() * 800, y = 320 + r() * 160, rr = 14 + r() * 26; b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * .35)}" fill="#8C8C9E"/><ellipse cx="${n(x)}" cy="${n(y - 2)}" rx="${n(rr * .7)}" ry="${n(rr * .2)}" fill="#7A7A8C"/>`; }
      const cx = 680;
      b += `<path d="M${cx} 180 Q${cx + 28} 220 ${cx + 28} 320 H${cx - 28} Q${cx - 28} 220 ${cx} 180 Z" fill="#F4F4F8" stroke="#2E2A3B" stroke-width="3"/><circle cx="${cx}" cy="250" r="12" fill="#5FA8CF" stroke="#2E2A3B" stroke-width="3"/><path d="M${cx - 28} 290 L${cx - 48} 330 L${cx - 28} 320 Z M${cx + 28} 290 L${cx + 48} 330 L${cx + 28} 320 Z" fill="#C9476B" stroke="#2E2A3B" stroke-width="3"/>`;
      b += '<path d="M120 300 V250" stroke="#E2E2EA" stroke-width="4"/><path d="M120 250 h40 v24 h-40 Z" fill="#C9476B"/>';
      return b;
    },
    planeta(r, noche, defs) {
      const g = P.grad('#3A1F5C', '#B0558C'); defs.push(g.def);
      let b = `<rect width="800" height="500" fill="url(#${g.id})"/>`;
      for (let i = 0; i < 60; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 260)}" r="${n(.6 + r() * 1.4)}" fill="#FFFFFF" opacity="${n(.4 + r() * .5)}"/>`;
      b += '<circle cx="180" cy="90" r="30" fill="#F2B33D"/><circle cx="260" cy="130" r="16" fill="#9FE0D6"/>';
      b += '<path d="M0 290 Q180 250 380 290 T800 270 V500 H0 Z" fill="#D9683F"/><path d="M0 350 Q380 320 800 360 V500 H0 Z" fill="#C2532E"/>';
      for (let i = 0; i < 6; i++) { const x = 60 + r() * 700, y = 330 + r() * 120; b += `<path d="M${n(x - 18)} ${n(y)} L${n(x - 8)} ${n(y - 26)} L${n(x + 10)} ${n(y - 18)} L${n(x + 20)} ${n(y)} Z" fill="#9E3E22"/>`; }
      for (let i = 0; i < 5; i++) { const x = 80 + r() * 640, y = 330 + r() * 100, h = 40 + r() * 40; b += `<path d="M${n(x)} ${n(y)} V${n(y - h)}" stroke="#4FC7B0" stroke-width="10" stroke-linecap="round"/><circle cx="${n(x)}" cy="${n(y - h - 8)}" r="10" fill="#B7F5E6"/><circle cx="${n(x)}" cy="${n(y - h - 8)}" r="20" fill="#B7F5E6" opacity=".25"/>`; }
      return b;
    },
    nave(r, noche, defs) {
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
    },
    espacio(r, noche, defs) {
      let b = '<rect width="800" height="500" fill="#0E1230"/>';
      b += '<ellipse cx="250" cy="160" rx="220" ry="90" fill="#6A3FA0" opacity=".25"/><ellipse cx="560" cy="260" rx="200" ry="70" fill="#2F8FB0" opacity=".2"/>';
      for (let i = 0; i < 120; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(.5 + r() * 1.8)}" fill="#FFFFFF" opacity="${n(.4 + r() * .6)}"/>`;
      b += '<circle cx="600" cy="140" r="60" fill="#F2B33D"/><ellipse cx="600" cy="140" rx="105" ry="20" fill="none" stroke="#E9775A" stroke-width="8" transform="rotate(-15 600 140)"/>';
      for (let i = 0; i < 5; i++) { const x = r() * 800, y = 100 + r() * 220, rr = 8 + r() * 16; b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rr)}" ry="${n(rr * .8)}" fill="#7A6F80"/>`; }
      b += '<path d="M-20 420 Q100 330 260 360 Q420 320 520 380 Q640 340 820 400 V520 H-20 Z" fill="#8C8098"/><path d="M-20 450 Q300 400 820 450 V520 H-20 Z" fill="#776B84"/>';
      for (let i = 0; i < 5; i++) b += `<ellipse cx="${n(r() * 800)}" cy="${n(430 + r() * 50)}" rx="18" ry="6" fill="#665A72"/>`;
      return b;
    },

    // ───── Nieve ─────
    nieve(r, noche, defs) {
      let b = cielo(defs, noche, '#BFE3F5', '#F2F8FB') + astros(r, noche, 650, 80);
      b += '<path d="M-20 300 L160 120 L280 240 L420 90 L600 280 L700 170 L820 300 Z" fill="#9FB8CC"/><path d="M160 120 L130 150 L150 160 L175 140 L200 165 L215 150 Z M420 90 L380 135 L405 145 L430 120 L455 150 L470 135 Z M700 170 L675 195 L700 205 L720 190 Z" fill="#FFFFFF"/>';
      b += '<path d="M0 300 Q300 270 800 310 V500 H0 Z" fill="#F4F9FC"/><path d="M0 380 Q400 350 800 390 V500 H0 Z" fill="#E6F0F7"/>';
      for (let i = 0; i < 6; i++) { const x = r() < .5 ? r() * 250 : 520 + r() * 280, s = .8 + r() * .5; b += P.pino(x, 330 + r() * 40, 110 * s, 70 * s, '#3F6E58') + `<path d="M${n(x - 25 * s)} ${n(300 - 10 * s)} L${n(x)} ${n(270 - 20 * s)} L${n(x + 25 * s)} ${n(300 - 10 * s)} Z" fill="#FFFFFF" opacity=".85"/>`; }
      const mx = 560 + r() * 120;
      b += `<circle cx="${n(mx)}" cy="430" r="34" fill="#FFFFFF" stroke="#BFD3E2" stroke-width="3"/><circle cx="${n(mx)}" cy="378" r="24" fill="#FFFFFF" stroke="#BFD3E2" stroke-width="3"/><path d="M${n(mx)} 380 l18 4 l-18 4 Z" fill="#F08A3C"/><circle cx="${n(mx - 8)}" cy="372" r="3" fill="#2E2A3B"/><circle cx="${n(mx + 6)}" cy="372" r="3" fill="#2E2A3B"/><rect x="${n(mx - 22)}" y="392" width="44" height="8" rx="4" fill="#C9476B"/>`;
      for (let i = 0; i < 40; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
      return b + velo(r, noche);
    },
    lago(r, noche, defs) {
      let b = cielo(defs, noche, '#C3E4F4', '#F3F9FC') + astros(r, noche, 150, 80);
      b += '<path d="M-20 280 L180 140 L330 260 L520 120 L820 280 Z" fill="#A9BFD1"/><path d="M180 140 L150 165 L180 172 L205 160 Z M520 120 L485 150 L515 158 L545 140 Z" fill="#FFFFFF"/>';
      b += '<path d="M0 280 Q400 260 800 285 V500 H0 Z" fill="#F4F9FC"/>';
      const hielo = P.grad('#D6EEF8', '#A7D3EA'); defs.push(hielo.def);
      b += `<ellipse cx="520" cy="390" rx="300" ry="80" fill="url(#${hielo.id})" stroke="#FFFFFF" stroke-width="6"/>`;
      b += '<path d="M380 370 l40 10 l20 -14 l30 20 M560 420 l30 -12 l24 16 M620 360 l-20 20" stroke="#FFFFFF" stroke-width="3" fill="none"/><path d="M460 350 L560 350" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".7"/>';
      for (const x of [60, 130, 760]) b += P.pino(x, 320, 120, 74, '#3F6E58') + `<path d="M${x - 24} 296 L${x} 266 L${x + 24} 296 Z" fill="#FFFFFF" opacity=".85"/>`;
      for (let i = 0; i < 30; i++) b += `<circle cx="${n(r() * 800)}" cy="${n(r() * 500)}" r="${n(1.5 + r() * 2.5)}" fill="#FFFFFF" opacity=".85"/>`;
      return b + velo(r, noche);
    },
    iglu(r, noche, defs) {
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
    },
    cabana(r, noche, defs) {
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
  };

  /** Dibuja un paisaje. tipo: casa, bosque, rio, cueva, puente, prado, arbol. */
  function paisaje(tipo, { noche = false, semilla = Math.random() * 1e9 } = {}) {
    const fn = PAISAJES[tipo] || PAISAJES.bosque;
    if (!PAISAJES[tipo]) console.warn(`Paisaje desconocido «${tipo}», uso el bosque.`);
    const defs = [];
    const cuerpo = fn(aleatorio(Math.floor(semilla)), noche, defs);
    return `<svg class="fondo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs.join('')}</defs>${cuerpo}</svg>`;
  }

  // ───────── Las niñas ─────────
  const TINTA = '#2E2A3B';
  function flor(x, y, c) {
    let f = '';
    for (let i = 0; i < 5; i++) { const a = i * 1.2566; f += `<circle cx="${n(x + 4.2 * Math.cos(a))}" cy="${n(y + 4.2 * Math.sin(a))}" r="3.4" fill="${c}"/>`; }
    return f + `<circle cx="${x}" cy="${y}" r="2.6" fill="#F2B33D"/>`;
  }
  const estrellita = (x, y, r, c) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += `${i ? 'L' : 'M'}${n(x + rr * Math.cos(a))} ${n(y + rr * Math.sin(a))} `; }
    return `<path d="${d}Z" fill="${c}" stroke="#B9831A" stroke-width="1.2" stroke-linejoin="round"/>`;
  };

  function accesorio(tipo, color, cfg = {}) {
    switch (tipo) {
      case 'flores': {
        let f = '';
        [['#F7B7C8', 32, 40], ['#FFFFFF', 40, 29], ['#F7B7C8', 50, 23], ['#FFFFFF', 60, 21], ['#F7B7C8', 70, 23], ['#FFFFFF', 80, 29], ['#F7B7C8', 88, 40]]
          .forEach(([c, x, y]) => { f += flor(x, y, c); });
        return `<path d="M30 42 Q60 12 90 42" stroke="#4E9A42" stroke-width="3" fill="none"/>${f}`;
      }
      case 'orejas': return `<path d="M33 38 L36 10 L54 27 Z" fill="${cfg.pelo || '#6B3E26'}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 31 L39.5 17 L48 26 Z" fill="#F7B7C8"/>
        <path d="M87 38 L84 10 L66 27 Z" fill="${cfg.pelo || '#6B3E26'}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M82 31 L80.5 17 L72 26 Z" fill="#F7B7C8"/>`;
      case 'gorro': return `<path d="M28 46 Q28 14 60 14 Q92 14 92 46 Z" fill="${color}" stroke="${TINTA}" stroke-width="2.5"/>
        <rect x="26" y="38" width="68" height="12" rx="6" fill="#FFF7E6" stroke="${TINTA}" stroke-width="2.5"/>
        <path d="M38 22 V38 M48 17 V38 M60 15 V38 M72 17 V38 M82 22 V38" stroke="#FFFFFF" stroke-width="2" opacity=".45"/>
        <circle cx="60" cy="12" r="8" fill="#FFF7E6" stroke="${TINTA}" stroke-width="2.5"/>`;
      case 'tiara': return `<path d="M34 40 Q60 22 86 40" stroke="#E2B04A" stroke-width="4" fill="none" stroke-linecap="round"/>${estrellita(60, 22, 9, '#FFD45E')}${estrellita(44, 31, 6, '#FFD45E')}${estrellita(76, 31, 6, '#FFD45E')}`;
      case 'pirata': return `<path d="M28 48 Q28 20 60 20 Q92 20 92 48 Q60 36 28 48 Z" fill="#C2453B" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="46" cy="32" r="2.6" fill="#FFFFFF"/><circle cx="60" cy="27" r="2.6" fill="#FFFFFF"/><circle cx="74" cy="32" r="2.6" fill="#FFFFFF"/><circle cx="54" cy="38" r="2.2" fill="#FFFFFF"/><circle cx="68" cy="38" r="2.2" fill="#FFFFFF"/>
        <path d="M90 42 L104 36 L100 50 Z M90 44 L102 56 L94 58 Z" fill="#C2453B" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>`;
      case 'casco': return `<circle cx="60" cy="56" r="40" fill="#CFEFFF" opacity=".28" stroke="#FFFFFF" stroke-width="4"/>
        <path d="M30 34 Q42 20 58 18" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
        <rect x="30" y="88" width="60" height="10" rx="5" fill="#E2E2EA" stroke="${TINTA}" stroke-width="2.5"/>`;
      case 'corona': return '<path d="M38 32 L42 12 L51 25 L60 8 L69 25 L78 12 L82 32 Z" fill="#F4B740" stroke="#B9831A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="22" r="3" fill="#C9476B"/>';
      case 'lazo': return `<path d="M74 28 L92 16 L90 40 Z M74 28 L60 14 L58 36 Z" fill="${color}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/><circle cx="74" cy="28" r="5" fill="${color}" stroke="${TINTA}" stroke-width="2"/>`;
      case 'gorra': return `<path d="M29 46 Q30 18 60 18 Q90 18 91 46 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><path d="M86 44 Q106 42 110 51 L86 51 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><circle cx="60" cy="19" r="3" fill="${TINTA}"/>`;
      case 'gafas': return `<g fill="none" stroke="${TINTA}" stroke-width="2.6"><circle cx="49" cy="60" r="8"/><circle cx="71" cy="60" r="8"/><path d="M57 60 H63 M41 58 L31 54 M79 58 L89 54"/></g>`;
      case 'sombrero': return '<ellipse cx="60" cy="32" rx="40" ry="8" fill="#C9A36A" stroke="#7E5E34" stroke-width="2"/><path d="M38 32 Q40 10 60 10 Q80 10 82 32 Z" fill="#D9B87E" stroke="#7E5E34" stroke-width="2"/><rect x="39" y="24" width="42" height="6" fill="#7E5E34"/>';
      default: return '';
    }
  }

  // Estampados del vestido (se compran en la tienda)
  let idPatron = 0;
  function estampado(tipo) {
    if (!tipo || tipo === 'liso') return '';
    const id = 'est' + (++idPatron);
    let p;
    if (tipo === 'lunares') p = `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="#FFFFFF" opacity=".85"/><circle cx="11" cy="11" r="2.6" fill="#FFFFFF" opacity=".85"/></pattern>`;
    else if (tipo === 'rayas') p = `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="4" fill="#FFFFFF" opacity=".55"/></pattern>`;
    else if (tipo === 'estrellas') p = `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse">${estrellita(6, 6, 4.5, '#FFE08A')}${estrellita(16, 15, 3.5, '#FFFFFF')}</pattern>`;
    else if (tipo === 'flores') p = `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse">${flor(7, 7, '#FFFFFF')}${flor(18, 18, '#F7B7C8')}</pattern>`;
    else return '';
    return `<defs>${p}</defs><path d="M44 90 Q60 84 76 90 L95 156 Q60 168 25 156 Z" fill="url(#${id})"/>`;
  }

  /** cfg: {piel, pelo, vestido, accesorio, estampado}  peinado: 'largo' | 'coletas' */
  function nina(cfg, peinado = 'largo') {
    const { piel, pelo, vestido } = cfg;
    let pelo_detras = peinado === 'largo'
      ? `<path d="M27 56 Q22 104 34 116 L86 116 Q98 104 93 56 Z" fill="${pelo}"/>`
      : `<circle cx="26" cy="62" r="14" fill="${pelo}"/><circle cx="94" cy="62" r="14" fill="${pelo}"/><circle cx="34" cy="52" r="4" fill="#C9476B"/><circle cx="86" cy="52" r="4" fill="#C9476B"/>`;
    return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${pelo_detras}
      <rect x="44" y="148" width="11" height="36" rx="5" fill="${piel}"/><rect x="65" y="148" width="11" height="36" rx="5" fill="${piel}"/>
      <ellipse cx="48" cy="186" rx="12" ry="6.5" fill="${TINTA}"/><ellipse cx="72" cy="186" rx="12" ry="6.5" fill="${TINTA}"/>
      <rect x="23" y="98" width="12" height="44" rx="6" fill="${piel}" transform="rotate(16 29 100)"/>
      <rect x="85" y="98" width="12" height="44" rx="6" fill="${piel}" transform="rotate(-16 91 100)"/>
      <path d="M44 90 Q60 84 76 90 L95 156 Q60 168 25 156 Z" fill="${vestido}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>
      ${estampado(cfg.estampado)}
      <path d="M30 150 Q60 160 90 150" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".55"/>
      <circle cx="60" cy="56" r="30" fill="${piel}"/>
      <path d="M30 54 Q32 22 60 22 Q90 22 90 54 Q78 38 62 42 Q56 34 46 42 Q38 44 30 54 Z" fill="${pelo}"/>
      <circle cx="49" cy="61" r="3.8" fill="${TINTA}"/><circle cx="71" cy="61" r="3.8" fill="${TINTA}"/>
      <circle cx="50.3" cy="59.7" r="1.3" fill="#FFFFFF"/><circle cx="72.3" cy="59.7" r="1.3" fill="#FFFFFF"/>
      <circle cx="41" cy="70" r="5" fill="#F08A8A" opacity=".45"/><circle cx="79" cy="70" r="5" fill="#F08A8A" opacity=".45"/>
      <path d="M51 72 Q60 80 69 72" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${accesorio(cfg.accesorio, vestido, cfg)}
    </svg>`;
  }

  window.Arte = { paisaje, nina, aleatorio, PAISAJES };
})();
