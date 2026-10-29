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
  function accesorio(tipo, color) {
    switch (tipo) {
      case 'corona': return '<path d="M38 32 L42 12 L51 25 L60 8 L69 25 L78 12 L82 32 Z" fill="#F4B740" stroke="#B9831A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="22" r="3" fill="#C9476B"/>';
      case 'lazo': return `<path d="M74 28 L92 16 L90 40 Z M74 28 L60 14 L58 36 Z" fill="${color}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/><circle cx="74" cy="28" r="5" fill="${color}" stroke="${TINTA}" stroke-width="2"/>`;
      case 'gorra': return `<path d="M29 46 Q30 18 60 18 Q90 18 91 46 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><path d="M86 44 Q106 42 110 51 L86 51 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><circle cx="60" cy="19" r="3" fill="${TINTA}"/>`;
      case 'gafas': return `<g fill="none" stroke="${TINTA}" stroke-width="2.6"><circle cx="49" cy="60" r="8"/><circle cx="71" cy="60" r="8"/><path d="M57 60 H63 M41 58 L31 54 M79 58 L89 54"/></g>`;
      case 'sombrero': return '<ellipse cx="60" cy="32" rx="40" ry="8" fill="#C9A36A" stroke="#7E5E34" stroke-width="2"/><path d="M38 32 Q40 10 60 10 Q80 10 82 32 Z" fill="#D9B87E" stroke="#7E5E34" stroke-width="2"/><rect x="39" y="24" width="42" height="6" fill="#7E5E34"/>';
      default: return '';
    }
  }

  /** cfg: {piel, pelo, vestido, accesorio}  peinado: 'largo' | 'coletas' */
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
      <path d="M30 150 Q60 160 90 150" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".55"/>
      <circle cx="60" cy="56" r="30" fill="${piel}"/>
      <path d="M30 54 Q32 22 60 22 Q90 22 90 54 Q78 38 62 42 Q56 34 46 42 Q38 44 30 54 Z" fill="${pelo}"/>
      <circle cx="49" cy="61" r="3.8" fill="${TINTA}"/><circle cx="71" cy="61" r="3.8" fill="${TINTA}"/>
      <circle cx="50.3" cy="59.7" r="1.3" fill="#FFFFFF"/><circle cx="72.3" cy="59.7" r="1.3" fill="#FFFFFF"/>
      <circle cx="41" cy="70" r="5" fill="#F08A8A" opacity=".45"/><circle cx="79" cy="70" r="5" fill="#F08A8A" opacity=".45"/>
      <path d="M51 72 Q60 80 69 72" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${accesorio(cfg.accesorio, vestido)}
    </svg>`;
  }

  window.Arte = { paisaje, nina, aleatorio, PAISAJES };
})();
