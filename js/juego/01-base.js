/* ──────────────────────────────────────────────────────────────
   BASE · Configuración, estado guardado, registro de lectura, sonidos, avisos,
   palabras que se leen al tocarlas, variables de los cuentos y escenario dibujado
   Los archivos de js/juego/ comparten nombres entre sí (E, J, CAT, aviso,
   palabras…): se cargan en orden desde index.html y forman un solo juego.
   ────────────────────────────────────────────────────────────── */
'use strict';

// ───────── Configuración ─────────
const NIVELES = [
  { id: 'aprendiz', nombre: 'Aprendiz', icono: '🌱', desc: 'Frases cortitas y pistas muy claras.' },
  { id: 'novatilla', nombre: 'Novatilla', icono: '🌼', desc: 'Textos más largos, con alguna pista tramposa.' },
  { id: 'lectora', nombre: 'Lectora', icono: '📖', desc: 'Palabras nuevas y preguntas de «¿por qué?».' },
  { id: 'superlectora', nombre: 'Superlectora', icono: '🔎', desc: 'Pistas repartidas para resolver el caso.' }
];
const TOLERANCIAS = {
  facil: { nombre: 'Fácil', umbral: 0.5, pasa: 0.7 },
  normal: { nombre: 'Normal', umbral: 0.62, pasa: 0.8 },
  exigente: { nombre: 'Exigente', umbral: 0.8, pasa: 0.95 }
};
const TAMANOS = { normal: '1.5rem', grande: '1.85rem', enorme: '2.25rem' };
const ELOGIOS = ['¡Qué bien lo has leído!', '¡Eres una lectora estupenda!', '¡Bravo, detective!', '¡Muy bien leído!', '¡Lo has bordado!', '¡Genial! Sigue así.'];
const ANIMOS = ['¡Casi! Lee otra vez las palabras subrayadas.', '¡Muy cerca! Repite solo las que faltan.', '¡Vas muy bien! Prueba con las subrayadas.'];
const APARIENCIA = {
  piel: ['#F7D7BA', '#EDBB91', '#C98D61', '#8E5B3C'],
  pelo: { 'castaño': '#6B3E26', rubio: '#E2B04A', negro: '#2A2024', pelirrojo: '#C4532E' },
  vestido: ['#C9476B', '#3F7D4E', '#5FA8CF', '#8A62C4', '#F2B33D', '#E9775A'],
  accesorio: { ninguno: 'Nada', sombrero: 'Sombrero', corona: 'Corona', lazo: 'Lazo', gorra: 'Gorra', gafas: 'Gafas' }
};
// Cosas que se compran con estrellas (las mascotas de pago están en stories/index.json, con «precio»)
const TIENDA = [
  { id: 'acc-flores', tipo: 'accesorio', valor: 'flores', nombre: 'Corona de flores', precio: 15 },
  { id: 'acc-orejas', tipo: 'accesorio', valor: 'orejas', nombre: 'Orejas de gato', precio: 15 },
  { id: 'acc-gorro', tipo: 'accesorio', valor: 'gorro', nombre: 'Gorro de lana', precio: 20 },
  { id: 'acc-tiara', tipo: 'accesorio', valor: 'tiara', nombre: 'Tiara de estrellas', precio: 25 },
  { id: 'acc-pirata', tipo: 'accesorio', valor: 'pirata', nombre: 'Pañuelo pirata', precio: 25 },
  { id: 'acc-casco', tipo: 'accesorio', valor: 'casco', nombre: 'Casco de astronauta', precio: 35 },
  { id: 'est-lunares', tipo: 'estampado', valor: 'lunares', nombre: 'Vestido de lunares', precio: 15 },
  { id: 'est-rayas', tipo: 'estampado', valor: 'rayas', nombre: 'Vestido de rayas', precio: 15 },
  { id: 'est-flores', tipo: 'estampado', valor: 'flores', nombre: 'Vestido de flores', precio: 20 },
  { id: 'est-estrellas', tipo: 'estampado', valor: 'estrellas', nombre: 'Vestido de estrellas', precio: 25 }
];
const ESTAMPADO_LISO = { liso: 'Liso' };
const COLORES_TAPA = ['#3F7D4E', '#2F7FB3', '#C2453B', '#8A62C4', '#2E3A70', '#5F8FA8', '#C9763A'];
const NOMBRES_MASCOTA =['Toby', 'Luna', 'Coco', 'Nala', 'Bolita', 'Pipo', 'Kiwi', 'Lola'];
const CLAVE = 'biblioteca-magica-v1';

// ───────── Utilidades ─────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const barajar = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const movimientoReducido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const app = document.getElementById('app');

// ───────── Estado guardado ─────────
const estadoInicial = () => ({
  perfil: null, nivel: 'aprendiz', progreso: {}, estrellas: 0, ofrecidos: {},
  album: { amigos: {}, tesoros: {}, pegatinas: {} },
  ajustes: { tamano: 'normal', tolerancia: 'normal', sinMicro: false, resaltar: true, sonido: true, silabas: false, regla: false, meta: 'm10' },
  gastadas: 0,      // estrellas gastadas en la tienda (el saldo es estrellas - gastadas)
  desbloqueado: {}, // cosas compradas en la tienda
  metaDias: {},     // días en los que se cumplió la meta ('2026-10-30': true)
  cofres: {},       // cofres semanales abiertos
  registro: [],   // una entrada por partida (para el informe)
  palabras: {}    // palabra → { f: fallos, a: aciertos, u: última vez }
});
let E = cargar();
function cargar() {
  const base = estadoInicial();
  try {
    const t = localStorage.getItem(CLAVE);
    if (t) {
      const d = JSON.parse(t);
      return Object.assign(base, d, {
        ajustes: Object.assign(base.ajustes, d.ajustes || {}),
        album: Object.assign(base.album, d.album || {})
      });
    }
  } catch (e) { /* sin guardado */ }
  return base;
}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) { /* sin guardado */ } }

function aplicarAjustes() {
  document.documentElement.style.setProperty('--tam-lectura', TAMANOS[E.ajustes.tamano] || TAMANOS.normal);
  document.body.classList.toggle('con-resaltado', !!E.ajustes.resaltar || !!E.ajustes.regla);
  document.body.classList.toggle('con-silabas', !!E.ajustes.silabas);
  document.body.classList.toggle('con-regla', !!E.ajustes.regla);
  Voz.configurar({ voz: E.ajustes.voz, velocidad: E.ajustes.velocidad });
}

let CAT = null;   // catálogo de libros
let J = null;     // partida en curso

/** Nombres de las protagonistas (los elegidos al vestir, o los del índice) y si son dos */
function P() {
  const n = (E.perfil && E.perfil.nombres) || {};
  return { lectora: n.lectora || CAT.protagonistas.lectora, hermana: n.hermana || CAT.protagonistas.hermana };
}
const sonDos = () => !(E.perfil && E.perfil.ninas === 1);

/** Título del capítulo, con nombres y alternativas para una o dos niñas */
const tituloCap = (cap) => Texto.rellenar(cap.meta.titulo || cap.id, varsMascota());

const saldo = () => Math.max(0, (E.estrellas || 0) - (E.gastadas || 0));
function ganarEstrellas(n) {
  E.estrellas = (E.estrellas || 0) + n;
  if (J) J.estrellas = (J.estrellas || 0) + n;
  const c = $('#total-estrellas');
  if (c) { c.textContent = saldo(); const caja = c.closest('.contador-estrellas'); caja.classList.remove('brilla'); void caja.offsetWidth; caja.classList.add('brilla'); }
}

// ───────── Registro de lectura (alimenta el informe y el repaso) ─────────
const claveDePalabra = (t) => String(t).toLowerCase().replace(/[^\p{L}]/gu, '');
// Los nombres propios no se cuentan: el reconocedor de voz se equivoca mucho con ellos
function nombresPropios() {
  const s = new Set([P().lectora, P().hermana, E.perfil.mascota.nombre].map(claveDePalabra));
  for (const l of CAT.libros) for (const a of Object.values(l.meta.ayudantes || {})) s.add(claveDePalabra(a.nombre));
  return s;
}
function anotarPalabra(clave, bien) {
  if (!clave || clave.length < 3) return;
  const p = E.palabras[clave] || (E.palabras[clave] = { f: 0, a: 0, u: 0 });
  if (bien) p.a++; else p.f++;
  p.u = Date.now();
}
// Una palabra está conquistada cuando se ha acertado dos veces más de las que se ha fallado
const conquistada = (p) => p.f > 0 && p.a >= p.f + 2;
function palabrasDificiles() {
  return Object.entries(E.palabras)
    .filter(([, p]) => p.f > 0 && !conquistada(p))
    .sort((x, y) => (y[1].f - y[1].a) - (x[1].f - x[1].a) || y[1].u - x[1].u);
}
function cerrarEscenaRegistro() {
  if (!J || !J.reg || J.tEscena == null) return;
  const seg = Math.min(600, Math.round((Date.now() - J.tEscena) / 1000));
  J.reg.escenas.push({ id: J.escena.e.id, seg });
  J.reg.seg += seg;
  J.tEscena = null;
}
function guardarRegistro(terminado) {
  if (!J || !J.reg || J.reg.guardado) return;
  cerrarEscenaRegistro();
  J.reg.guardado = true;
  const { guardado, ...r } = J.reg;
  r.terminado = terminado;
  E.registro.push(r);
  if (E.registro.length > 300) E.registro = E.registro.slice(-300);
  guardar();
}
// Escena extra al empezar: leer en voz alta tres palabras que le cuestan
// Calentamiento al empezar un capítulo con las palabras que le cuestan, adaptado al nivel:
//   Aprendiz: 2-3 palabras sueltas · Novatilla: 3 palabras · Lectora: una frase de los cuentos
//   que las contiene · Superlectora: dos frases.
function frasesConPalabra(palabra, vars, maxPalabras) {
  const encontradas = [];
  for (const libro of CAT.libros) for (const cap of libro.capitulos) for (const e of cap.escenas) for (const versiones of Object.values(e.niveles)) for (const v of versiones) {
    if (!v.toLowerCase().includes(palabra)) continue;
    const texto = Texto.limpiarPistas(Texto.rellenar(v, vars));
    for (const linea of texto.split('\n')) {
      if (/^\s*[?*-]/.test(linea) || /\{/.test(linea)) continue;
      const limpia = linea.replace(/^>\s?/, '').replace(/^—\s?/, '').trim();
      for (const frase of limpia.match(/[^.!?…]+[.!?…]+[»"”]?|[^.!?…]+$/g) || []) {
        const f = frase.trim().replace(/^[»"”]\s*/, '');
        const n = f.split(/\s+/).length;
        if (n < 4 || n > maxPalabras || /[«»—]/.test(f)) continue;
        if (f.split(/\s+/).some((w) => claveDePalabra(w) === palabra)) encontradas.push(Texto.capitalizar(f));
      }
    }
  }
  return [...new Set(encontradas)];
}

function escenaRepaso(vars) {
  const lista = palabrasDificiles().slice(0, 8);
  if (lista.length < 2) return null;
  const nivel = E.nivel;
  const intro = '{ayudante} ha escrito unas palabras mágicas en una hoja.';
  let lineas, palabrasUsadas;
  if (nivel === 'lectora' || nivel === 'superlectora') {
    const cuantas = nivel === 'superlectora' ? 2 : 1;
    const frases = [];
    palabrasUsadas = [];
    for (const [w] of barajar(lista)) {
      const opciones = frasesConPalabra(w, vars, nivel === 'superlectora' ? 20 : 14).filter((f) => !frases.includes(f));
      if (!opciones.length) continue;
      frases.push(azar(opciones)); palabrasUsadas.push(w);
      if (frases.length === cuantas) break;
    }
    if (frases.length) {
      lineas = [intro, cuantas > 1 && frases.length > 1 ? 'Para abrir el capítulo, hay que leer estas frases en voz alta.' : 'Para abrir el capítulo, hay que leer esta frase en voz alta.',
        ...frases.map((f) => '> ' + f), '¡El libro empieza a brillar!'];
    }
  }
  if (!lineas) {
    palabrasUsadas = barajar(lista).slice(0, nivel === 'aprendiz' ? 3 : Math.min(4, lista.length)).map(([k]) => k);
    lineas = [intro, 'Para abrir el capítulo, hay que leerlas en voz alta.', '> ' + palabrasUsadas.join('  ·  '), '¡El libro empieza a brillar!'];
  }
  return { id: 'repaso', repaso: true, palabras: palabrasUsadas, props: { fondo: 'bosque', con: ['ayudante'] }, niveles: { todos: [lineas.join('\n')] } };
}

// ───────── Sonidos (sin sonidos de error) ─────────
const Sonido = (() => {
  let ctx = null;
  function nota(f, t0, dur, vol = 0.16, tipo = 'sine') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  const melodias = {
    bien: [[523, 0], [659, 0.09], [784, 0.18]],
    estrella: [[784, 0], [1047, 0.1]],
    tesoro: [[880, 0], [1175, 0.08], [1568, 0.16]],
    fin: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.5], [1047, 0.62]],
    pagina: [[440, 0], [554, 0.06]]
  };
  return {
    tocar(nombre) {
      if (!E.ajustes.sonido) return;
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime + 0.02;
        (melodias[nombre] || []).forEach(([f, d]) => nota(f, t + d, 0.32));
      } catch (e) { /* sin sonido */ }
    }
  };
})();

// ───────── Avisos, confeti y capas ─────────
let temporizadorAviso = null;
function aviso(texto, ms = 3200) {
  const a = $('#aviso');
  a.textContent = texto; a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { a.hidden = true; }, ms);
}
function confeti(cuantos = 40) {
  if (movimientoReducido()) return;
  const c = $('#confeti');
  const colores = ['#C9476B', '#F2B33D', '#3F7D4E', '#5FA8CF', '#8A62C4'];
  for (let i = 0; i < cuantos; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = azar(colores);
    p.style.animationDelay = Math.random() * 0.35 + 's';
    p.style.setProperty('--dx', (Math.random() * 30 - 15) + 'vw');
    p.style.setProperty('--giro', (Math.random() * 900 - 450) + 'deg');
    c.appendChild(p);
    setTimeout(() => p.remove(), 2800);
  }
}
function abrirCapa(html, alCerrar) {
  cerrarCapa();
  const capa = document.createElement('div');
  capa.className = 'capa';
  capa.innerHTML = `<div class="capa-caja" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(capa);
  capa.addEventListener('click', (ev) => {
    if (ev.target === capa || ev.target.closest('[data-cerrar]')) { cerrarCapa(); alCerrar && alCerrar(); }
  });
  const foco = capa.querySelector('[data-cerrar], button');
  foco && foco.focus();
  return capa;
}
function cerrarCapa() { $$('.capa').forEach((c) => c.remove()); }

// ───────── Palabras que se pueden tocar para oírlas ─────────
// Con la opción «sílabas de colores», cada palabra se pinta por sílabas alternas: ma·ri·po·sa
function htmlPalabra(token) {
  const [antes, letras, despues] = Texto.partesDePalabra(token);
  if (!letras || !E.ajustes.silabas) return esc(token);
  return esc(antes) + Texto.silabas(letras).map((s, i) => `<span class="sil s${i % 2}">${esc(s)}</span>`).join('') + esc(despues);
}
/** Texto con sílabas de colores pero sin palabras tocables (para botones) */
const htmlTexto = (texto) => String(texto).split(/(\s+)/).map((t) => (/^\s*$/.test(t) ? t : htmlPalabra(t))).join('');
function palabras(texto) {
  return String(texto).split(/\[\[(.+?)\]\]/).map((trozo, i) => {
    const html = trozo.split(/(\s+)/).map((t) => (!t || /^\s+$/.test(t)) ? t : `<span class="palabra">${htmlPalabra(t)}</span>`).join('');
    return i % 2 ? `<mark class="pista"><span class="lupa" aria-hidden="true">🔎</span>${html}</mark>` : html;
  }).join('');
}

/** Dice una palabra: con la voz grabada por la familia si existe, si no con la del dispositivo */
function decir(palabra, velocidad = 0.75) {
  const limpia = String(palabra).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (!limpia) return;
  if (!/\s/.test(limpia) && window.Grabaciones && Grabaciones.reproducirYa(claveDePalabra(limpia))) return;
  Voz.hablar(limpia, velocidad);
}

// Lectura por sílabas: se iluminan una a una mientras se oyen («ma… ri… po… sa»)
let silabeando = null;
function silabear(el, letras) {
  const sils = Texto.silabas(letras);
  if (sils.length < 2) { decir(letras); return; }
  if (silabeando) silabeando();
  const original = el.innerHTML;
  const [antes, , despues] = Texto.partesDePalabra(el.textContent.trim());
  el.innerHTML = esc(antes) + sils.map((s, i) => `<span class="sil-paso">${esc(s)}</span>${i < sils.length - 1 ? '<span class="sil-punto" aria-hidden="true">·</span>' : ''}`).join('') + esc(despues);
  el.classList.add('silabeando');
  const pasos = $$('.sil-paso', el);
  const tiempos = [];
  pasos.forEach((p, i) => tiempos.push(setTimeout(() => {
    pasos.forEach((x) => x.classList.remove('ahora'));
    p.classList.add('ahora');
    Voz.hablar(sils[i], 0.6);
  }, i * 750)));
  const terminar = () => { tiempos.forEach(clearTimeout); el.innerHTML = original; el.classList.remove('silabeando'); silabeando = null; };
  tiempos.push(setTimeout(() => { terminar(); decir(letras, 0.7); }, sils.length * 750 + 250));
  silabeando = terminar;
}

// Tocar una palabra la lee; tocarla otra vez enseguida la lee por sílabas
let ultimoToque = { el: null, t: 0 };
document.addEventListener('click', (ev) => {
  const p = ev.target.closest('.palabra');
  if (!p || p.classList.contains('silabeando')) return;
  const [, letras] = Texto.partesDePalabra(p.textContent.trim());
  const repetido = ultimoToque.el === p && Date.now() - ultimoToque.t < 3500;
  ultimoToque = { el: p, t: Date.now() };
  if (repetido && letras) silabear(p, letras);
  else decir(letras || p.textContent);
  p.classList.remove('sonando'); void p.offsetWidth; p.classList.add('sonando');
  activarLinea(p.closest('.linea'));
});
// Regla de lectura: tocar una línea la destaca y atenúa las demás
function activarLinea(linea) {
  if (!linea || !(E.ajustes.resaltar || E.ajustes.regla)) return;
  $$('.linea-activa').forEach((x) => x.classList.remove('linea-activa'));
  linea.classList.add('linea-activa');
}
document.addEventListener('click', (ev) => {
  if (!E.ajustes.regla || ev.target.closest('.palabra, button')) return;
  const linea = ev.target.closest('.bloques > p.linea');
  if (linea) activarLinea(linea);
});

// ───────── Variables de la partida ─────────
function varsLugar(prefijo, L) {
  const base = `${L.articulo} ${L.nombre}`;
  const el = L.articulo === 'el';
  return {
    [prefijo]: base,
    ['al_' + prefijo]: el ? `al ${L.nombre}` : `a ${base}`,
    ['del_' + prefijo]: el ? `del ${L.nombre}` : `de ${base}`,
    ['en_' + prefijo]: `en ${base}`,
    ['hacia_' + prefijo]: `hacia ${base}`
  };
}
function varsAyudante(prefijo, A, gracia) {
  const base = `${A.articulo} ${A.especie} ${A.nombre}`;
  return {
    [prefijo]: base,
    ['al_' + prefijo]: A.articulo === 'el' ? `al ${A.especie} ${A.nombre}` : `a ${base}`,
    ['del_' + prefijo]: A.articulo === 'el' ? `del ${A.especie} ${A.nombre}` : `de ${base}`,
    [prefijo + '_nombre']: A.nombre,
    [prefijo + '_desc']: A.descripcion,
    [gracia]: azar(A.gracias || ['se ríe un montón'])
  };
}
function varsMascota() {
  const m = E.perfil.mascota, esp = CAT.mascotas[m.especie] || Object.values(CAT.mascotas)[0];
  const chica = m.genero === 'chica', animal = chica ? esp.chica : esp.chico;
  const nom = P(), dos = sonDos();
  return { lectora: nom.lectora, hermana: nom.hermana, __dos: dos, las_ninas: dos ? `${nom.lectora} y ${nom.hermana}` : nom.lectora,
    mascota: m.nombre, animal, el_animal: (chica ? 'la ' : 'el ') + animal, un_animal: (chica ? 'una ' : 'un ') + animal, mo: chica ? 'a' : 'o' };
}

function prepararPartida(libro, cap) {
  const mundo = libro.meta, cm = cap.meta;
  const claves = barajar((cm.lugares && cm.lugares.length ? cm.lugares : Object.keys(mundo.lugares)).filter((k) => mundo.lugares[k]));
  while (claves.length < 3) claves.push(claves[0]);
  const [kl, kf, ko] = claves;
  const L = mundo.lugares[kl], F = mundo.lugares[kf], O = mundo.lugares[ko];
  const ka = barajar(cm.ayudantes || Object.keys(mundo.ayudantes));
  const a1 = mundo.ayudantes[ka[0]], a2 = mundo.ayudantes[ka[1] || ka[0]];

  const v = Object.assign({}, varsMascota(),
    varsLugar('lugar', L), varsLugar('falso', F), varsLugar('otro', O),
    varsAyudante('ayudante', a1, 'gracia'), varsAyudante('ayudante2', a2, 'gracia2'));
  const pistas = barajar(L.pistas || ['dejó huellas']);
  v.pista1 = pistas[0]; v.pista2 = pistas[1] || pistas[0]; v.pista3 = pistas[2] || pistas[0];
  v.pista_falsa = azar(F.pistas || ['dejó huellas']);
  const senales = barajar(L.senales || ['hay muchos árboles']);
  v.senal1 = senales[0]; v.senal2 = senales[1] || senales[0];
  v.senal_falsa = azar(F.senales || ['hay muchos árboles']);
  v.o2 = a1.articulo === 'la' ? 'a' : 'o';
  if (!cm.buscamos || cm.buscamos === 'mascota') { v.buscado = v.mascota; v.o = v.mo; }
  else { v.buscado = cm.buscamos.nombre; v.o = cm.buscamos.genero === 'f' ? 'a' : 'o'; }

  return { vars: v, lugares: { lugar: { clave: kl, ...L }, falso: { clave: kf, ...F }, otro: { clave: ko, ...O } }, ayudantes: [ka[0], ka[1] || ka[0]] };
}

const versionesPara = (esc_, nivel) => {
  const v = esc_.niveles[nivel] || esc_.niveles.todos;
  return v && v.length ? v : null;
};

// ───────── Escenario dibujado ─────────
function escenario(props, opciones = {}) {
  let tipo = props.fondo || 'bosque';
  if (tipo === '$lugar' && J) tipo = J.lugares.lugar.fondo;
  else if (tipo === '$falso' && J) tipo = J.lugares.falso.fondo;
  if (opciones.fondo) tipo = opciones.fondo;
  const noche = !!props.noche;
  const fondo = /\.(png|jpe?g|webp|svg|gif)$/i.test(tipo)
    ? `<img class="fondo" src="${esc(tipo)}" alt="">`
    : Arte.paisaje(tipo, { noche, semilla: (J ? J.semilla : 7) + (opciones.semilla || 0) });

  const pj = [];
  if (props.sin !== 'niñas' && props.sin !== 'ninas') {
    pj.push(`<div class="pj pj-alaya" data-nombre="${esc(P().lectora)}" data-saludo="¡Hola! Soy ${esc(P().lectora)}, la detective.">${Arte.nina(E.perfil.alaya, 'largo')}<span class="etiqueta">${esc(P().lectora)}</span></div>`);
    if (sonDos()) pj.push(`<div class="pj pj-lucia" data-nombre="${esc(P().hermana)}" data-saludo="¡Hola! Soy ${esc(P().hermana)}. ¿Tienes galletas?">${Arte.nina(E.perfil.lucia, 'coletas')}<span class="etiqueta">${esc(P().hermana)}</span></div>`);
  }
  const emojiPj = (emoji, clase, nombre) => `<div class="pj pj-emoji ${clase}" data-nombre="${esc(nombre || '')}" data-saludo="${esc(nombre ? `¡Hola! Soy ${nombre}.` : '¡Hola!')}"><span class="emoji">${emoji}</span>${nombre ? `<span class="etiqueta">${esc(nombre)}</span>` : ''}</div>`;
  for (const c of props.con || []) {
    if (c === 'mascota') pj.push(emojiPj((CAT.mascotas[E.perfil.mascota.especie] || {}).emoji || '🐶', 'pj-mascota', E.perfil.mascota.nombre));
    else if ((c === 'ayudante' || c === 'ayudante2') && J) {
      const A = J.libro.meta.ayudantes[J.ayudantes[c === 'ayudante' ? 0 : 1]];
      pj.push(emojiPj(A.emoji, 'pj-' + c, A.nombre));
    } else if (c === 'buscado' && J && J.cap.meta.buscamos && J.cap.meta.buscamos.emoji) {
      const b = J.cap.meta.buscamos;
      pj.push(emojiPj(b.emoji, 'pj-buscado', b.nombre.split(' ').pop()));
    }
  }
  let tesoro = '';
  if (opciones.tesoro && J && Math.random() < 0.6) {
    const t = azar(J.libro.meta.tesoros || []);
    if (t) tesoro = `<button class="tesoro" style="left:${8 + Math.random() * 80}%;top:${8 + Math.random() * 42}%" data-emoji="${esc(t.emoji)}" data-nombre="${esc(t.nombre)}" aria-label="Algo escondido">${t.emoji}</button>`;
  }
  return `<div class="escenario${noche ? ' noche' : ''}">${fondo}<div class="personajes">${pj.join('')}</div>${tesoro}</div>`;
}

// Tocar a un personaje: da un saltito y saluda
document.addEventListener('click', (ev) => {
  const pj = ev.target.closest('.pj[data-saludo]');
  if (!pj) return;
  pj.classList.remove('salta'); void pj.offsetWidth; pj.classList.add('salta');
  setTimeout(() => pj.classList.remove('salta'), 520);
  Voz.hablar(pj.dataset.saludo, 0.95);
});
// Cuando el texto nombra a alguien que está en el dibujo, ese personaje se mueve como si hablara
function animarQuienHabla(texto) {
  if (!texto) return;
  for (const pj of $$('.escenario-sitio .pj[data-nombre]')) {
    const nombre = pj.dataset.nombre;
    if (nombre && texto.includes(nombre)) {
      pj.classList.remove('habla'); void pj.offsetWidth; pj.classList.add('habla');
      setTimeout(() => pj.classList.remove('habla'), 1600);
    }
  }
}

// Lucía encuentra tesoros escondidos en el dibujo
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('.tesoro');
  if (!t) return;
  const emoji = t.dataset.emoji, nombre = t.dataset.nombre;
  E.album.tesoros[emoji] = (E.album.tesoros[emoji] || 0) + 1; guardar();
  t.classList.add('encontrado');
  setTimeout(() => t.remove(), 600);
  Sonido.tocar('tesoro'); confeti(18);
  const frase = `¡${sonDos() ? P().hermana : P().lectora} ha encontrado ${nombre}!`;
  aviso(`${emoji} ${frase}`);
  Voz.hablar(frase, 0.95);
});
