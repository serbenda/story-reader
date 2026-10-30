/* ──────────────────────────────────────────────────────────────
   JUEGO · Pantallas, partida, niveles, álbum y ajustes
   ────────────────────────────────────────────────────────────── */
(function () {
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

  // ───────── Pantalla: bienvenida ─────────
  function pantallaBienvenida() {
    app.innerHTML = `
      <section class="portada">
        <p class="sobretitulo">Un juego para leer</p>
        <h1 class="titulo-grande">La biblioteca mágica</h1>
        <div class="texto texto-portada">
          <p class="linea">${palabras('¡Hola! Hoy empieza una aventura muy especial.')}</p>
          <p class="linea">${palabras('Primero vamos a elegir a las protagonistas y a su mascota.')}</p>
        </div>
        <button class="boton boton-principal boton-grande" id="empezar">¡Vamos!</button>
        <p class="pista-pequena">Toca cualquier palabra para oírla.</p>
      </section>`;
    $('#empezar').onclick = () => { Sonido.tocar('pagina'); borrador = null; pantallaPersonalizar(0, true); };
  }

  // ───────── Pantalla: personalizar ─────────
  const perfilPorDefecto = () => ({
    ninas: 2,
    nombres: { lectora: CAT.protagonistas.lectora, hermana: CAT.protagonistas.hermana },
    alaya: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#C9476B', accesorio: 'sombrero' },
    lucia: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#F2B33D', accesorio: 'lazo' },
    mascota: { especie: 'perro', genero: 'chico', nombre: 'Toby' }
  });
  let borrador = null;
  const limpiarNombre = (t) => String(t || '').replace(/[^\p{L}\s'-]/gu, '').replace(/\s+/g, ' ').trimStart().slice(0, 14);
  const conMayuscula = (t) => { t = String(t || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };

  function pantallaPersonalizar(paso, primeraVez) {
    // El borrador se crea al entrar; los cambios de cada paso se guardan en él hasta pulsar «¡Listo!»
    if (!borrador) {
      borrador = JSON.parse(JSON.stringify(E.perfil || perfilPorDefecto()));
      const def = perfilPorDefecto();
      borrador.ninas = borrador.ninas === 1 ? 1 : 2;
      borrador.nombres = Object.assign({}, def.nombres, borrador.nombres || {});
    }
    const dos = borrador.ninas !== 1;
    const pasos = dos ? ['quien', 'lectora', 'hermana', 'mascota'] : ['quien', 'lectora', 'mascota'];
    paso = Math.max(0, Math.min(paso, pasos.length - 1));
    const tipo = pasos[paso], ultimo = paso === pasos.length - 1;
    const nom = borrador.nombres;
    let opciones = '', vista = '', titulo = '';

    const muestras = (campo, valores, actual, nombres) => valores.map((v, i) =>
      `<button class="muestra${v === actual ? ' elegida' : ''}" data-campo="${campo}" data-valor="${esc(v)}" style="--c:${esc(v)}" aria-label="${esc(nombres ? nombres[i] : v)}" aria-pressed="${v === actual}"></button>`).join('');

    if (tipo === 'quien') {
      titulo = '¿Quién protagoniza los cuentos?';
      vista = `<div class="vista-quien">
        <div class="mini-nina">${Arte.nina(borrador.alaya, 'largo')}<span class="nombre-mascota" id="vista-lectora">${esc(nom.lectora || '…')}</span></div>
        ${dos ? `<div class="mini-nina peque">${Arte.nina(borrador.lucia, 'coletas')}<span class="nombre-mascota" id="vista-hermana">${esc(nom.hermana || '…')}</span></div>` : ''}
      </div>`;
      opciones = `
        <div class="fila-opcion"><span class="etiqueta-opcion">¿Cuántas niñas?</span><div class="chips">
          <button class="chip chip-grande${!dos ? ' elegida' : ''}" data-ninas="1" aria-pressed="${!dos}">👧 Una</button>
          <button class="chip chip-grande${dos ? ' elegida' : ''}" data-ninas="2" aria-pressed="${dos}">👧👧 Dos hermanas</button></div></div>
        <div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-lectora">${dos ? 'La que lee (la mayor)' : 'Se llama'}</label>
          <input id="nombre-lectora" class="campo-nombre" maxlength="14" autocomplete="off" value="${esc(nom.lectora)}"></div>
        ${dos ? `<div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-hermana">Su hermana pequeña</label>
          <input id="nombre-hermana" class="campo-nombre" maxlength="14" autocomplete="off" value="${esc(nom.hermana)}"></div>` : ''}
        <p class="nota">Los cuentos usarán estos nombres. ${dos ? '' : 'Con una sola niña, los cuentos se cuentan solo con ella.'}</p>`;
    } else if (tipo === 'lectora' || tipo === 'hermana') {
      const quien = tipo === 'lectora' ? 'alaya' : 'lucia';
      const c = borrador[quien];
      titulo = `¿Cómo es ${tipo === 'lectora' ? nom.lectora : nom.hermana}?`;
      vista = `<div class="vista-nina">${Arte.nina(c, quien === 'alaya' ? 'largo' : 'coletas')}</div>`;
      const pelos = Object.entries(APARIENCIA.pelo);
      opciones = `
        <div class="fila-opcion"><span class="etiqueta-opcion">Piel</span><div class="muestras">${muestras('piel', APARIENCIA.piel, c.piel)}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Pelo</span><div class="muestras">${muestras('pelo', pelos.map((p) => p[1]), c.pelo, pelos.map((p) => p[0]))}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Ropa</span><div class="muestras">${muestras('vestido', APARIENCIA.vestido, c.vestido)}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Estampado</span><div class="chips">${chipsTienda('estampado', ESTAMPADO_LISO, c.estampado || 'liso')}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Complemento</span><div class="chips">${chipsTienda('accesorio', APARIENCIA.accesorio, c.accesorio)}</div></div>`;
    } else {
      const m = borrador.mascota;
      titulo = dos ? '¿Cómo es vuestra mascota?' : '¿Cómo es tu mascota?';
      const esp = CAT.mascotas[m.especie] || Object.values(CAT.mascotas)[0];
      vista = `<div class="vista-mascota"><span class="emoji-grande">${esp.emoji}</span><span class="nombre-mascota">${esc(m.nombre || '…')}</span></div>`;
      opciones = `
        <div class="fila-opcion"><span class="etiqueta-opcion">Animal</span><div class="chips">${Object.entries(CAT.mascotas).map(([k, e]) => {
          const tiene = !e.precio || E.desbloqueado['mas-' + k];
          const texto = `<span class="emoji">${e.emoji}</span>${esc(m.genero === 'chica' ? e.chica : e.chico)}`;
          return tiene
            ? `<button class="chip chip-animal${m.especie === k ? ' elegida' : ''}" data-campo="especie" data-valor="${k}" aria-pressed="${m.especie === k}">${texto}</button>`
            : `<button class="chip chip-animal chip-bloqueada" data-bloqueado="${e.precio}">${texto}<span class="candado">🔒 ${e.precio}</span></button>`;
        }).join('')}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">¿Chico o chica?</span><div class="chips">
          <button class="chip${m.genero === 'chico' ? ' elegida' : ''}" data-campo="genero" data-valor="chico">Chico</button>
          <button class="chip${m.genero === 'chica' ? ' elegida' : ''}" data-campo="genero" data-valor="chica">Chica</button></div></div>
        <div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-mascota">¿Cómo se llama?</label>
          <input id="nombre-mascota" class="campo-nombre" maxlength="12" autocomplete="off" value="${esc(m.nombre)}">
          <div class="chips chips-nombres">${NOMBRES_MASCOTA.map((nm) => `<button class="chip chip-peque" data-campo="nombre" data-valor="${nm}">${nm}</button>`).join('')}</div></div>`;
    }

    app.innerHTML = `
      <section class="personalizar">
        <div class="pasos" aria-label="Paso ${paso + 1} de ${pasos.length}">${pasos.map((_, i) => `<span class="${i === paso ? 'activo' : i < paso ? 'hecho' : ''}"></span>`).join('')}</div>
        <h1 class="titulo">${palabras(titulo)}</h1>
        <div class="personalizar-cuerpo">
          <div class="personalizar-vista">${vista}</div>
          <div class="personalizar-opciones">${opciones}</div>
        </div>
        <div class="barra-botones">
          ${paso > 0 ? '<button class="boton boton-suave" id="atras">← Atrás</button>' : (!primeraVez ? '<button class="boton boton-suave" id="cancelar">Cancelar</button>' : '<span></span>')}
          <button class="boton boton-principal" id="siguiente">${ultimo ? '¡Listo!' : 'Siguiente →'}</button>
        </div>
      </section>`;

    $$('[data-bloqueado]').forEach((b) => b.addEventListener('click', () => aviso(`Se consigue en la 🛍️ tienda por ${b.dataset.bloqueado} ⭐.`)));
    $$('[data-ninas]').forEach((b) => b.addEventListener('click', () => {
      borrador.ninas = +b.dataset.ninas; Sonido.tocar('pagina'); pantallaPersonalizar(0, primeraVez);
    }));
    $$('[data-campo]').forEach((b) => b.addEventListener('click', () => {
      const campo = b.dataset.campo, valor = b.dataset.valor;
      if (tipo === 'lectora') borrador.alaya[campo] = valor;
      else if (tipo === 'hermana') borrador.lucia[campo] = valor;
      else borrador.mascota[campo] = valor;
      Sonido.tocar('pagina');
      pantallaPersonalizar(paso, primeraVez);
      if (campo === 'nombre') $('#nombre-mascota')?.focus();
    }));
    for (const [id, clave, vistaId] of [['#nombre-lectora', 'lectora', '#vista-lectora'], ['#nombre-hermana', 'hermana', '#vista-hermana']]) {
      const campo = $(id);
      if (campo) campo.addEventListener('input', () => {
        const limpio = limpiarNombre(campo.value);
        if (limpio !== campo.value) campo.value = limpio;
        borrador.nombres[clave] = limpio;
        const v = $(vistaId); if (v) v.textContent = limpio || '…';
      });
    }
    const campoNombre = $('#nombre-mascota');
    if (campoNombre) campoNombre.addEventListener('input', () => {
      borrador.mascota.nombre = campoNombre.value.replace(/[^\p{L}\s-]/gu, '').slice(0, 12);
      $('.nombre-mascota').textContent = borrador.mascota.nombre || '…';
    });
    $('#atras') && ($('#atras').onclick = () => pantallaPersonalizar(paso - 1, primeraVez));
    $('#cancelar') && ($('#cancelar').onclick = () => { borrador = null; pantallaInicio(); });
    $('#siguiente').onclick = () => {
      if (tipo === 'quien') {
        const l = conMayuscula(borrador.nombres.lectora), h = conMayuscula(borrador.nombres.hermana);
        if (!l) { aviso('Escribe el nombre de la niña que lee.'); $('#nombre-lectora').focus(); return; }
        if (dos && !h) { aviso('Escribe el nombre de su hermana.'); $('#nombre-hermana').focus(); return; }
        if (dos && l.toLowerCase() === h.toLowerCase()) { aviso('Las dos niñas necesitan nombres distintos.'); return; }
        borrador.nombres.lectora = l; if (h) borrador.nombres.hermana = h;
      }
      if (!ultimo) return pantallaPersonalizar(paso + 1, primeraVez);
      const nombre = (borrador.mascota.nombre || '').trim();
      if (!nombre) { aviso('Escribe un nombre para la mascota.'); campoNombre && campoNombre.focus(); return; }
      borrador.mascota.nombre = conMayuscula(nombre);
      E.perfil = borrador; borrador = null; guardar();
      Sonido.tocar('bien'); confeti(30);
      pantallaInicio();
    };
  }

  // ───────── Meta diaria, racha y cofre de la semana ─────────
  const METAS = { m5: { nombre: '5 minutos', min: 5 }, m10: { nombre: '10 minutos', min: 10 }, m15: { nombre: '15 minutos', min: 15 }, cap: { nombre: '1 capítulo' } };
  const DIA_MS = 864e5;
  const hoyCero = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return +d; };
  const claveDia = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const lunesDe = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return +d; };

  function progresoHoy() {
    const ini = hoyCero();
    const hoy = E.registro.filter((r) => r.fecha >= ini);
    let seg = hoy.reduce((s, r) => s + (r.seg || 0), 0);
    if (J && J.reg && !J.reg.guardado) seg += J.reg.seg + (J.tEscena ? Math.min(600, (Date.now() - J.tEscena) / 1000) : 0);
    const caps = hoy.filter((r) => r.terminado).length;
    const meta = METAS[E.ajustes.meta] || METAS.m10;
    if (!meta.min) return { parte: Math.min(1, caps), texto: caps ? '¡Capítulo leído!' : 'Lee un capítulo', meta };
    const min = Math.floor(seg / 60);
    return { parte: Math.min(1, seg / 60 / meta.min), texto: `${Math.min(min, meta.min)} de ${meta.min} minutos`, meta };
  }

  /** Días seguidos cumpliendo la meta. Saltarse un solo día no rompe la racha. */
  function racha() {
    let n = 0, sinLeer = 0, d = hoyCero();
    if (!E.metaDias[claveDia(d)]) d -= DIA_MS;
    for (let i = 0; i < 400; i++, d -= DIA_MS) {
      if (E.metaDias[claveDia(d)]) { n++; sinLeer = 0; } else if (++sinLeer > 1) break;
    }
    return n;
  }

  function htmlMeta() {
    const p = progresoHoy(), hecha = !!E.metaDias[claveDia(hoyCero())], r = racha();
    const lunes = lunesDe(Date.now()), letras = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const semana = letras.map((l, i) => {
      const t = lunes + i * DIA_MS, k = claveDia(t);
      return `<span class="dia${E.metaDias[k] ? ' hecho' : ''}${k === claveDia(Date.now()) ? ' hoy' : ''}" title="${l}">${E.metaDias[k] ? '★' : l}</span>`;
    }).join('');
    const enSemana = letras.filter((_, i) => E.metaDias[claveDia(lunes + i * DIA_MS)]).length;
    const cofre = E.cofres[claveDia(lunes)] ? '<span class="cofre abierto" title="Cofre abierto">🎉</span>' : `<span class="cofre" title="Cumple la meta 5 días para abrir el cofre">🎁 <small>${enSemana}/5</small></span>`;
    const C = 2 * Math.PI * 24;
    return `<div class="meta-hoy${hecha ? ' cumplida' : ''}">
      <svg class="anillo" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="24" class="anillo-fondo"/><circle cx="30" cy="30" r="24" class="anillo-progreso" stroke-dasharray="${n2(C * (hecha ? 1 : p.parte))} ${n2(C)}" transform="rotate(-90 30 30)"/><text x="30" y="36" text-anchor="middle" class="anillo-texto">${hecha ? '✓' : Math.round(p.parte * 100) + '%'}</text></svg>
      <div class="meta-texto"><b>${hecha ? '¡Meta de hoy cumplida!' : 'Meta de hoy'}</b><span>${hecha ? (r > 1 ? `🔥 ${r} días seguidos` : '¡Muy bien!') : esc(p.texto)}</span>
        <div class="semana">${semana}${cofre}</div></div>
    </div>`;
  }
  const n2 = (x) => Math.round(x * 10) / 10;

  /** Se llama al avanzar: si se acaba de cumplir la meta, se celebra (y quizá se abre el cofre) */
  function comprobarMeta() {
    if (!E.perfil) return;
    const k = claveDia(hoyCero());
    if (E.metaDias[k] || progresoHoy().parte < 1) return;
    E.metaDias[k] = true;
    ganarEstrellas(3);
    const lunes = lunesDe(Date.now());
    const enSemana = [0, 1, 2, 3, 4, 5, 6].filter((i) => E.metaDias[claveDia(lunes + i * DIA_MS)]).length;
    let cofre = false;
    if (enSemana >= 5 && !E.cofres[claveDia(lunes)]) { E.cofres[claveDia(lunes)] = true; ganarEstrellas(15); cofre = true; }
    guardar();
    Sonido.tocar('fin'); confeti(cofre ? 120 : 60);
    const r = racha();
    if (cofre) abrirCapa(`<div class="cofre-capa"><div class="cofre-grande" aria-hidden="true">🎁</div>
      <h2 class="titulo">¡Cofre de la semana!</h2><p class="linea texto">${palabras('Has cumplido la meta cinco días esta semana. ¡Dentro hay 15 estrellas!')}</p>
      <button class="boton boton-principal" data-cerrar>¡Genial! ⭐</button></div>`);
    else aviso(`🎯 ¡Meta de hoy cumplida! +3 ⭐${r > 1 ? ` · 🔥 ${r} días seguidos` : ''}`, 4500);
  }

  // ───────── Tienda ─────────
  function articulosTienda() {
    const mascotas = Object.entries(CAT.mascotas).filter(([, m]) => m.precio)
      .map(([k, m]) => ({ id: 'mas-' + k, tipo: 'mascota', valor: k, nombre: m.chico.charAt(0).toUpperCase() + m.chico.slice(1), precio: m.precio, emoji: m.emoji }));
    return TIENDA.concat(mascotas);
  }

  function pantallaTienda() {
    J = null;
    const grupos = [['accesorio', '👑 Complementos'], ['estampado', '👗 Vestidos'], ['mascota', '🐾 Mascotas']];
    const vistaPrevia = (a) => {
      if (a.tipo === 'mascota') return `<span class="emoji tienda-emoji">${a.emoji}</span>`;
      const cfg = Object.assign({}, E.perfil.alaya, a.tipo === 'accesorio' ? { accesorio: a.valor } : { estampado: a.valor });
      return Arte.nina(cfg, 'largo');
    };
    const tarjeta = (a) => {
      const tiene = !!E.desbloqueado[a.id];
      const falta = a.precio - saldo();
      let pie;
      if (tiene) pie = a.tipo === 'mascota'
        ? `<button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="mascota">Elegir como mascota</button>`
        : `<div class="poner"><button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="alaya">Para ${esc(P().lectora)}</button>${sonDos() ? `<button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="lucia">Para ${esc(P().hermana)}</button>` : ''}</div>`;
      else if (falta > 0) pie = `<button class="boton boton-chico boton-falta" disabled>Te faltan ${falta} ⭐</button>`;
      else pie = `<button class="boton boton-principal boton-chico" data-comprar="${a.id}">Comprar · ${a.precio} ⭐</button>`;
      return `<li class="articulo${tiene ? ' comprado' : ''}">
        <div class="articulo-vista">${vistaPrevia(a)}</div>
        <div class="articulo-texto"><b>${esc(a.nombre)}</b>${tiene ? '<span class="sello-tuyo">✓ ¡Es tuyo!</span>' : `<span class="precio">${a.precio} ⭐</span>`}</div>
        ${pie}</li>`;
    };
    const arts = articulosTienda();
    app.innerHTML = `
      ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Volver</button>')}
      <section class="tienda">
        <div class="tienda-cabecera">
          <h1 class="titulo-grande">La tienda</h1>
          <p class="saldo-grande"><span aria-hidden="true">⭐</span> <b>${saldo()}</b> <span>estrellas para gastar</span></p>
        </div>
        <p class="pista-pequena">${palabras('Las estrellas se ganan leyendo en voz alta, acertando preguntas, abriendo cerraduras y cumpliendo la meta del día.')}</p>
        ${grupos.map(([tipo, titulo]) => `<h2 class="titulo">${titulo}</h2><ul class="rejilla-tienda">${arts.filter((a) => a.tipo === tipo).map(tarjeta).join('')}</ul>`).join('')}
      </section>`;
    $('#volver').onclick = pantallaInicio;
    $$('[data-comprar]').forEach((b) => {
      let seguro = false, t = null;
      b.onclick = () => {
        const a = arts.find((x) => x.id === b.dataset.comprar);
        if (!seguro) { seguro = true; b.textContent = '¿Seguro? Toca otra vez'; b.classList.add('seguro'); t = setTimeout(() => { seguro = false; b.textContent = `Comprar · ${a.precio} ⭐`; b.classList.remove('seguro'); }, 3000); return; }
        clearTimeout(t);
        if (saldo() < a.precio) return;
        E.gastadas = (E.gastadas || 0) + a.precio;
        E.desbloqueado[a.id] = true; guardar();
        Sonido.tocar('tesoro'); confeti(70);
        aviso(`🎉 ¡${a.nombre} ya es tuyo!`);
        pantallaTienda();
      };
    });
    $$('[data-poner]').forEach((b) => b.onclick = () => {
      const a = arts.find((x) => x.id === b.dataset.poner), quien = b.dataset.quien;
      if (a.tipo === 'mascota') E.perfil.mascota.especie = a.valor;
      else E.perfil[quien][a.tipo === 'accesorio' ? 'accesorio' : 'estampado'] = a.valor;
      guardar(); Sonido.tocar('bien');
      aviso(a.tipo === 'mascota' ? `${a.emoji} ¡Ahora ${E.perfil.mascota.nombre} es ${a.nombre.toLowerCase()}!` : `✨ ¡Listo! Mira qué guapa.`);
      pantallaTienda();
    });
  }

  /** Botones de opciones: las gratis, las compradas y, con candado, las de la tienda */
  function chipsTienda(tipo, gratis, actual) {
    const libres = Object.entries(gratis).map(([k, nom]) =>
      `<button class="chip${actual === k ? ' elegida' : ''}" data-campo="${tipo}" data-valor="${k}" aria-pressed="${actual === k}">${esc(nom)}</button>`);
    const deTienda = TIENDA.filter((t) => t.tipo === tipo).map((t) => E.desbloqueado[t.id]
      ? `<button class="chip${actual === t.valor ? ' elegida' : ''}" data-campo="${tipo}" data-valor="${t.valor}" aria-pressed="${actual === t.valor}">✨ ${esc(t.nombre.replace(/^Vestido de /, ''))}</button>`
      : `<button class="chip chip-bloqueada" data-bloqueado="${t.precio}">${esc(t.nombre.replace(/^Vestido de /, ''))}<span class="candado">🔒 ${t.precio}</span></button>`);
    return libres.concat(deTienda).join('');
  }

  // ───────── Pantalla: inicio ─────────
  const capituloHecho = (libroId, capId) => !!(E.progreso[libroId] && E.progreso[libroId][capId] && Object.keys(E.progreso[libroId][capId]).length);
  const nivelActual = () => NIVELES.find((n) => n.id === E.nivel) || NIVELES[0];

  function cabecera(extraIzq = '') {
    return `<header class="cabecera">
      <div class="cabecera-izq">${extraIzq || '<span class="marca">La biblioteca mágica</span>'}</div>
      <div class="cabecera-der">
        <span class="contador-estrellas" aria-label="Estrellas"><span aria-hidden="true">⭐</span> <b id="total-estrellas">${saldo()}</b></span>
      </div>
    </header>`;
  }

  function pantallaInicio() {
    J = null;
    cerrarCapa();
    const n = nivelActual(), vm = varsMascota(), seguir = siguienteParaLeer();
    app.innerHTML = `
      ${cabecera()}
      <section class="inicio-hero">
        <div class="hero-escena">${escenario({ fondo: 'casa', con: ['mascota'] })}</div>
        <div class="hero-info">
          <h1 class="titulo-grande">${palabras(sonDos() ? `${P().lectora}, ${P().hermana} y ${vm.mascota}` : `${P().lectora} y ${vm.mascota}`)}</h1>
          <p class="nivel-actual"><span class="insignia-nivel">${n.icono}</span> Nivel <b>${n.nombre}</b></p>
          ${htmlMeta()}
          ${seguir ? `<button class="boton boton-principal boton-grande boton-seguir" id="seguir-leyendo">
            ▶ <span><span class="seguir-sub">Seguir leyendo</span>${esc(seguir.libro.meta.titulo || '')} · capítulo ${seguir.capIndex + 1}</span></button>` : ''}
          <div class="acciones-hero">
            <button class="boton boton-suave" id="album">📒 Álbum</button>
            <button class="boton boton-suave" id="vestir">🎨 Vestir</button>
            <button class="boton boton-suave" id="tienda">🛍️ Tienda</button>
            <button class="boton boton-suave boton-mayores" id="mayores" aria-describedby="ayuda-mayores"><span class="carga" aria-hidden="true"></span>⚙️ Mayores</button>
          </div>
          <p class="pista-pequena" id="ayuda-mayores" hidden>Mantén pulsado el botón para entrar.</p>
        </div>
      </section>
      <section class="estanteria-sitio">
        <h2 class="titulo">La biblioteca</h2>
        <ul class="estanteria">${CAT.libros.map((libro, i) => htmlLomo(libro, i)).join('')}</ul>
      </section>`;

    $('#album').onclick = pantallaAlbum;
    $('#vestir').onclick = () => { borrador = null; pantallaPersonalizar(0, false); };
    $('#tienda').onclick = pantallaTienda;
    puertaMayores($('#mayores'), pantallaAjustes);
    if (seguir) $('#seguir-leyendo').onclick = () => empezarCapitulo(seguir.libro, seguir.capIndex);
    $$('[data-libro-abrir]').forEach((b) => b.addEventListener('click', () => pantallaLibro(CAT.libros.find((l) => l.id === b.dataset.libroAbrir))));
  }

  // El siguiente capítulo por leer del último libro que se abrió
  function siguienteParaLeer() {
    const libro = CAT.libros.find((l) => l.id === E.ultimoLibro);
    if (!libro) return null;
    const i = libro.capitulos.findIndex((c) => !capituloHecho(libro.id, c.id));
    if (i < 0) return null;
    return { libro, capIndex: i };
  }

  function htmlLomo(libro, i) {
    const hechos = libro.capitulos.filter((c) => capituloHecho(libro.id, c.id)).length;
    const total = libro.capitulos.length;
    const pegatinas = libro.capitulos.map((c) => E.album.pegatinas[`${libro.id}/${c.id}`] ? `<span class="emoji">${c.meta.pegatina || '🏅'}</span>` : '<span class="hueco"></span>').join('');
    return `<li><button class="libro-tapa" data-libro-abrir="${esc(libro.id)}" style="--tapa:${COLORES_TAPA[i % COLORES_TAPA.length]}">
      <span class="tapa-dibujo">${Arte.paisaje(libro.meta.portada || 'bosque', { semilla: 3 + i })}</span>
      <span class="tapa-texto">
        <span class="tapa-titulo">${esc(libro.meta.titulo || libro.id)}</span>
        <span class="tapa-resumen">${esc(Texto.rellenar(libro.meta.resumen || '', varsMascota()))}</span>
        <span class="tapa-progreso">${pegatinas}<span class="tapa-cuenta">${hechos === total ? '¡Terminado!' : hechos ? `${hechos} de ${total}` : 'Nuevo'}</span></span>
      </span></button></li>`;
  }

  function pantallaLibro(libro) {
    J = null;
    E.ultimoLibro = libro.id; guardar();
    const vm = varsMascota();
    app.innerHTML = `
      ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Biblioteca</button>')}
      ${htmlLibro(libro, vm)}`;
    $('#volver').onclick = pantallaInicio;
    $$('[data-capitulo]').forEach((b) => b.addEventListener('click', () => empezarCapitulo(libro, +b.dataset.capitulo)));
  }

  function htmlLibro(libro, vm) {
    const caps = libro.capitulos.map((cap, i) => {
      const abierto = i === 0 || capituloHecho(libro.id, libro.capitulos[i - 1].id);
      const hechos = (E.progreso[libro.id] && E.progreso[libro.id][cap.id]) || {};
      const sellos = NIVELES.filter((nv) => hechos[nv.id]).map((nv) => `<span title="${nv.nombre}">${nv.icono}</span>`).join('');
      const resumen = Texto.rellenar(cap.meta.resumen || '', vm);
      return `<li>
        <button class="capitulo${abierto ? '' : ' cerrado'}" ${abierto ? '' : 'disabled'} data-libro="${esc(libro.id)}" data-capitulo="${i}">
          <span class="num">${abierto ? i + 1 : '🔒'}</span>
          <span class="cap-texto"><span class="cap-titulo">${esc(cap.meta.titulo || cap.id)}</span>
          <span class="cap-resumen">${esc(abierto ? resumen : 'Termina el capítulo anterior para abrirlo.')}</span></span>
          <span class="sellos">${sellos || (cap.meta.pegatina && E.album.pegatinas[`${libro.id}/${cap.id}`] ? cap.meta.pegatina : '')}</span>
        </button></li>`;
    }).join('');
    return `<section class="libro">
      <div class="libro-cabecera">
        <div class="libro-portada">${Arte.paisaje(libro.meta.portada || 'bosque', { semilla: 3 })}</div>
        <div><p class="sobretitulo">Libro</p><h2 class="titulo">${esc(libro.meta.titulo || libro.id)}</h2>
        <p class="libro-resumen">${esc(Texto.rellenar(libro.meta.resumen || '', vm))}</p></div>
      </div>
      <ol class="capitulos">${caps}</ol>
    </section>`;
  }

  // Botón que hay que mantener pulsado 2 segundos (para que no entren las niñas sin querer)
  function puertaMayores(boton, alAbrir) {
    let t = null;
    const ayuda = $('#ayuda-mayores');
    const empezar = (ev) => { ev.preventDefault(); boton.classList.add('cargando'); t = setTimeout(() => { boton.classList.remove('cargando'); alAbrir(); }, 1800); };
    const cancelar = () => { if (t) { clearTimeout(t); t = null; if (boton.classList.contains('cargando') && ayuda) ayuda.hidden = false; } boton.classList.remove('cargando'); };
    boton.addEventListener('pointerdown', empezar);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => boton.addEventListener(e, cancelar));
    boton.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && !t && !ev.repeat) empezar(ev); });
    boton.addEventListener('keyup', cancelar);
    boton.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  // ───────── Partida ─────────
  function empezarCapitulo(libro, capIndex) {
    const cap = libro.capitulos[capIndex];
    const datos = prepararPartida(libro, cap);
    const escenas = cap.escenas.filter((e) => versionesPara(e, E.nivel));
    if (!escenas.length) { aviso('Este capítulo todavía no tiene textos para este nivel.'); return; }
    const repaso = escenaRepaso(datos.vars);
    if (repaso) escenas.unshift(repaso);
    E.ultimoLibro = libro.id;
    // Cerraduras mágicas: al final de la primera escena del cuento y, desde Novatilla, también en la penúltima
    const cuento = escenas.filter((e) => !e.repaso);
    const retos = new Set([cuento[0] && cuento[0].id]);
    if (E.nivel !== 'aprendiz' && cuento.length > 2) retos.add(cuento[cuento.length - 2].id);
    J = {
      retos,
      libro, cap, capIndex, escenas, i: 0, ...datos, semilla: Math.floor(Math.random() * 1e6), estrellas: 0, leidas: 0, cuaderno: [],
      tEscena: null,
      reg: {
        fecha: Date.now(), libro: libro.id, cap: cap.id, titulo: cap.meta.titulo || cap.id, nivel: E.nivel,
        micro: !(E.ajustes.sinMicro || !Voz.disponible()),
        frases: 0, frasesPrimera: 0, intentos: 0, preguntas: 0, preguntasPrimera: 0, retos: 0, retosPrimera: 0,
        repaso: repaso ? repaso.palabras : [], escenas: [], seg: 0
      }
    };
    Sonido.tocar('pagina');
    mostrarEscena();
  }

  function mostrarEscena() {
    cerrarEscenaRegistro();
    comprobarMeta();
    const e = J.escenas[J.i];
    const plantilla = azar(versionesPara(e, E.nivel));
    const texto = Texto.rellenar(plantilla, J.vars);
    J.escena = { e, bloques: Texto.bloques(texto), k: 0 };
    if (J.retos.has(e.id)) J.escena.bloques.push({ tipo: 'reto', texto: '' });
    J.tEscena = Date.now();

    for (const c of e.props.con) if (c === 'ayudante' || c === 'ayudante2') E.album.amigos[J.ayudantes[c === 'ayudante' ? 0 : 1]] = true;
    guardar();

    const puntos = J.escenas.map((_, i) => `<span class="${i < J.i ? 'hecho' : i === J.i ? 'activo' : ''}"></span>`).join('');
    app.innerHTML = `
      ${cabecera(`<button class="boton boton-suave boton-chico" id="salir">🏠 <span class="solo-ancho">Casa</span></button>
        <div class="titulo-cap"><span class="sobretitulo">Capítulo ${J.capIndex + 1}</span><span class="nombre-cap">${esc(J.cap.meta.titulo || '')}</span></div>`)}
      <div class="progreso-escenas" aria-label="Escena ${J.i + 1} de ${J.escenas.length}">${puntos}
        <button class="boton boton-suave boton-chico boton-cuaderno" id="cuaderno" ${J.cuaderno.length || E.nivel === 'superlectora' ? '' : 'hidden'}>📓 Cuaderno <b id="num-pistas">${J.cuaderno.length}</b></button>
      </div>
      <div class="juego">
        <div class="escenario-sitio">${escenario(e.props, { tesoro: true })}</div>
        <section class="lectura" aria-live="polite">
          <div id="bloques" class="bloques texto"></div>
          <div id="pie-escena" class="pie-escena"></div>
        </section>
      </div>`;

    let confirmar = false;
    $('#salir').onclick = (ev) => {
      if (!confirmar) { confirmar = true; ev.currentTarget.innerHTML = '¿Salir? Toca otra vez'; setTimeout(() => { confirmar = false; const b = $('#salir'); if (b) b.innerHTML = '🏠 <span class="solo-ancho">Casa</span>'; }, 3000); return; }
      Voz.parar(); guardarRegistro(false); comprobarMeta(); pantallaInicio();
    };
    $('#cuaderno').onclick = verCuaderno;
    window.scrollTo({ top: 0 });
    revelar();
  }

  // Va enseñando el texto poco a poco: se para en cada frase de voz y en cada pregunta
  function revelar() {
    const s = J.escena, cont = $('#bloques');
    while (s.k < s.bloques.length) {
      const b = s.bloques[s.k];
      const el = pintarBloque(b);
      cont.appendChild(el);
      if (b.tipo === 'texto' && E.ajustes.regla) activarLinea(el);
      if (s.k > 0) requestAnimationFrame(() => el.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'nearest' }));
      for (const p of Texto.pistasDe(b.texto)) if (!J.cuaderno.includes(p)) { J.cuaderno.push(p); actualizarCuaderno(); }
      animarQuienHabla(b.texto);
      s.k++;
      if ((b.tipo === 'voz' && !b.superado) || (b.tipo === 'pregunta' && !b.resuelta) || (b.tipo === 'reto' && !b.resuelto)) return;
    }
    pintarFinEscena();
  }

  function pintarBloque(b) {
    if (b.tipo === 'texto') {
      const el = document.createElement('p');
      el.className = 'linea aparece' + (/^[—«]/.test(b.texto) ? ' dialogo' : '');
      el.innerHTML = palabras(b.texto);
      return el;
    }
    if (b.tipo === 'voz') return tarjetaVoz(b);
    if (b.tipo === 'reto') return tarjetaReto(b);
    return tarjetaPregunta(b);
  }

  // ───────── Cerraduras mágicas (minijuegos para la dislexia) ─────────
  // Letras que se confunden por su forma o sonido, y sílabas que se invierten (pla → pal)
  const GRUPOS_LETRAS = [['b', 'd', 'p', 'q'], ['m', 'n', 'u']];
  const ES_VOCAL = /[aeiouáéíóú]/;
  const grupoDe = (c) => GRUPOS_LETRAS.find((g) => g.includes(c));

  function palabrasParaReto(textos) {
    const propios = nombresPropios(), lista = new Set();
    const anadir = (w) => { const k = claveDePalabra(w); if (k.length >= 4 && k.length <= 10 && !propios.has(k)) lista.add(k); };
    for (const t of textos) for (const w of Texto.limpiarPistas(t).split(/\s+/)) anadir(w);
    for (const [w] of palabrasDificiles().slice(0, 8)) anadir(w);
    return [...lista];
  }

  function crearReto(textos) {
    const candidatas = barajar(palabrasParaReto(textos));
    for (const tipo of barajar(['letra', 'escrita'])) {
      for (const w of candidatas) {
        const posiciones = [...w].map((c, i) => (grupoDe(c) ? i : -1)).filter((i) => i >= 0);
        if (tipo === 'letra') {
          if (!posiciones.length) continue;
          const i = azar(posiciones);
          return { tipo, palabra: w, hueco: i, opciones: barajar(grupoDe(w[i])), correcta: w[i] };
        }
        const falsas = new Set();
        for (const i of barajar(posiciones)) { falsas.add(w.slice(0, i) + azar(grupoDe(w[i]).filter((c) => c !== w[i])) + w.slice(i + 1)); break; }
        const inversiones = [];
        for (let i = 1; i < w.length - 1; i++) if (!ES_VOCAL.test(w[i]) && ES_VOCAL.test(w[i + 1])) inversiones.push(i);
        for (const i of barajar(inversiones)) { const f = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); if (f !== w) { falsas.add(f); break; } }
        for (let i = 0; i < w.length - 1 && falsas.size < 2; i++) { const f = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); if (f !== w) falsas.add(f); }
        falsas.delete(w);
        if (falsas.size < 2) continue;
        return { tipo, palabra: w, opciones: barajar([w, ...[...falsas].slice(0, 2)]), correcta: w };
      }
    }
    return null;
  }

  function tarjetaReto(b) {
    const el = document.createElement('div');
    const r = crearReto(J.escena.bloques.filter((x) => x.tipo !== 'reto').map((x) => x.texto));
    if (!r) { b.resuelto = true; el.hidden = true; return el; }
    const enunciado = r.tipo === 'letra' ? '¿Qué letra falta?' : '¿Cuál está bien escrita?';
    el.className = 'tarjeta-reto aparece';
    el.innerHTML = `
      <div class="voz-cabecera"><span aria-hidden="true">🔒</span> Cerradura mágica</div>
      <p class="pregunta linea">${palabras(`Para seguir, abre la cerradura. ${enunciado}`)}</p>
      ${r.tipo === 'letra' ? `<p class="reto-palabra" aria-label="Palabra con una letra que falta">${[...r.palabra].map((c, i) => (i === r.hueco ? '<span class="reto-hueco">?</span>' : esc(c))).join('')}</p>` : ''}
      <div class="reto-opciones reto-${r.tipo}">${r.opciones.map((o, i) => `<button class="opcion reto-opcion" data-i="${i}">${esc(o)}</button>`).join('')}</div>
      <div class="voz-controles"><button class="boton boton-suave boton-chico reto-oir">🔊 Escuchar la palabra</button></div>
      <p class="respuesta" role="status"></p>`;
    let fallos = 0;
    $('.reto-oir', el).onclick = () => decir(r.palabra, 0.7);
    $$('.reto-opcion', el).forEach((btn) => btn.addEventListener('click', () => {
      if (b.resuelto) return;
      const elegida = r.opciones[+btn.dataset.i];
      if (elegida === r.correcta) {
        b.resuelto = true;
        btn.classList.add('correcta');
        $$('.reto-opcion', el).forEach((x) => { x.disabled = true; });
        if (r.tipo === 'letra') { const h = $('.reto-hueco', el); h.textContent = r.correcta; h.classList.add('puesta'); }
        J.reg.retos++;
        if (!fallos) { J.reg.retosPrimera++; ganarEstrellas(1); }
        guardar();
        $('.respuesta', el).textContent = `${fallos ? '¡Eso es!' : '⭐'} ¡La cerradura se abre! 🔓`;
        el.classList.add('abierta');
        Sonido.tocar('estrella'); confeti(20);
        setTimeout(revelar, 900);
      } else {
        fallos++;
        btn.classList.add('mal'); btn.disabled = true;
        $('.respuesta', el).textContent = r.tipo === 'letra'
          ? 'Casi. Fíjate hacia dónde mira la letra. Puedes escuchar la palabra.'
          : 'Casi. Léelas despacio, letra a letra.';
      }
    }));
    return el;
  }

  function actualizarCuaderno() {
    const btn = $('#cuaderno'); if (!btn) return;
    btn.hidden = false; $('#num-pistas').textContent = J.cuaderno.length;
    btn.classList.remove('salta'); void btn.offsetWidth; btn.classList.add('salta');
  }
  function verCuaderno() {
    const lista = J.cuaderno.length
      ? `<ol class="lista-pistas">${J.cuaderno.map((p) => `<li class="linea">${palabras(p)}</li>`).join('')}</ol>`
      : `<p class="linea">${palabras('Todavía no hay pistas. ¡Lee con atención!')}</p>`;
    abrirCapa(`<div class="cuaderno"><h2 class="titulo">📓 Cuaderno de detective</h2><div class="texto">${lista}</div>
      <button class="boton boton-principal" data-cerrar>Cerrar</button></div>`);
  }

  // ───────── Leer en voz alta ─────────
  function tarjetaVoz(b) {
    const tol = TOLERANCIAS[E.ajustes.tolerancia] || TOLERANCIAS.normal;
    const limpio = Texto.limpiarPistas(b.texto);
    b.objetivo = []; b.claves = []; b.intentos = 0;
    const repaso = !!(J.escena && J.escena.e.repaso);
    const html = limpio.split(/\s+/).filter(Boolean).map((t) => {
      const nrm = Voz.normalizar(t).join('');
      if (!nrm) return `<span class="signo">${esc(t)}</span>`;
      const k = b.objetivo.length; b.objetivo.push(nrm); b.claves.push(claveDePalabra(t));
      return `<span class="palabra" data-k="${k}">${htmlPalabra(t)}</span>`;
    }).join(' ');
    b.marcadas = b.objetivo.map(() => false);
    const sinMicro = E.ajustes.sinMicro || !Voz.disponible();

    const el = document.createElement('div');
    el.className = 'tarjeta-voz aparece' + (repaso ? ' tarjeta-repaso' : '');
    el.innerHTML = `
      <div class="voz-cabecera"><span class="voz-icono" aria-hidden="true">${repaso ? '✨' : '🎤'}</span> ${repaso ? 'Palabras mágicas' : 'Lee en voz alta'}</div>
      <p class="frase-voz linea">${html}</p>
      <div class="voz-controles">
        <button class="boton boton-mic" ${sinMicro ? 'hidden' : ''}><span class="anillos" aria-hidden="true"></span>🎤 <span class="txt">Leer</span></button>
        <button class="boton boton-principal boton-ya" ${sinMicro ? '' : 'hidden'}>✅ ¡Ya lo he leído!</button>
        <button class="boton boton-suave boton-oir" disabled title="Se activa después de intentarlo">🔊 Escuchar</button>
      </div>
      <p class="estado-voz" role="status">${sinMicro ? 'Léela en voz alta y luego pulsa el botón verde.' : 'Pulsa el micro y lee la frase.'}</p>`;

    const mic = $('.boton-mic', el), ya = $('.boton-ya', el), oir = $('.boton-oir', el), estado = $('.estado-voz', el);
    const spans = $$('.palabra[data-k]', el);
    const pintar = (temporal) => spans.forEach((s) => {
      const k = +s.dataset.k;
      s.classList.toggle('ok', b.marcadas[k]);
      s.classList.toggle('oyendo', !!(temporal && temporal[k] && !b.marcadas[k]));
    });
    const significativas = () => { const idx = b.objetivo.map((w, i) => (w.length > 2 ? i : -1)).filter((i) => i >= 0); return idx.length ? idx : b.objetivo.map((_, i) => i); };
    const aprobado = () => { const idx = significativas(); return idx.filter((i) => b.marcadas[i]).length / idx.length >= tol.pasa; };

    function superar(conAyuda) {
      if (b.superado) return;
      b.superado = true;
      b.marcadas = b.marcadas.map(() => true); pintar();
      spans.forEach((s) => s.classList.remove('falta'));
      el.classList.add('superada');
      mic.hidden = true; ya.hidden = true; oir.disabled = false;
      estado.textContent = conAyuda ? '¡Lo has intentado muy bien! Seguimos.' : azar(ELOGIOS);
      J.leidas++; ganarEstrellas(1);
      J.reg.frases++; J.reg.intentos += Math.max(1, b.intentos);
      if (b.intentos === 1 && !conAyuda) J.reg.frasesPrimera++;
      guardar();
      Sonido.tocar('bien'); confeti(16);
      setTimeout(revelar, 650);
    }
    function evaluar(alternativas) {
      let mejor = null, mejorN = -1;
      for (const alt of alternativas) {
        const r = Voz.comparar(b.objetivo, Voz.normalizar(alt), tol.umbral);
        const cuenta = r.filter(Boolean).length;
        if (cuenta > mejorN) { mejorN = cuenta; mejor = r; }
      }
      if (mejor) b.marcadas = b.marcadas.map((m, i) => m || mejor[i]);
      // Solo cuenta el primer intento: así se ve qué palabras le cuestan de verdad
      if (b.intentos === 0) {
        const propios = nombresPropios();
        for (const i of significativas()) if (!propios.has(b.claves[i])) anotarPalabra(b.claves[i], !!(mejor && mejor[i]));
      }
      b.intentos++; oir.disabled = false;
      pintar();
      if (aprobado()) return superar(false);
      const sig = significativas();
      spans.forEach((s) => s.classList.toggle('falta', sig.includes(+s.dataset.k) && !b.marcadas[+s.dataset.k]));
      estado.textContent = azar(ANIMOS);
      if (b.intentos >= 3) {
        ya.hidden = false; ya.textContent = 'Seguir adelante →';
        estado.textContent = '¡Lo estás haciendo genial! Si quieres, escucha la frase y sigue.';
      }
    }
    function pasarASinMicro(motivo) {
      mic.hidden = true; ya.hidden = false;
      estado.textContent = 'Léela en voz alta y luego pulsa el botón verde.';
      if (motivo) aviso(motivo, 5000);
      setTimeout(() => { oir.disabled = false; }, 4000);
    }

    mic.addEventListener('click', () => {
      if (Voz.escuchando) { Voz.parar(); return; }
      if (!Voz.disponible()) return pasarASinMicro();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      el.classList.add('escuchando'); mic.querySelector('.txt').textContent = 'Te escucho…';
      estado.textContent = 'Te escucho. Lee la frase con calma.';
      Voz.escuchar({
        parcial: (t) => pintar(Voz.comparar(b.objetivo, Voz.normalizar(t), tol.umbral)),
        final: evaluar,
        error: (tipo) => {
          if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(tipo)) pasarASinMicro('El micro no está disponible aquí. Lee en voz alta y pulsa «¡Ya lo he leído!».');
          else if (tipo === 'no-speech') estado.textContent = 'No te he oído. Pulsa el micro y lee un poco más alto.';
          else if (tipo === 'network') estado.textContent = 'No hay internet para escuchar. Prueba otra vez en un momento.';
        },
        fin: () => { el.classList.remove('escuchando'); if (!b.superado) mic.querySelector('.txt').textContent = 'Leer otra vez'; pintar(); }
      });
    });
    ya.addEventListener('click', () => superar(b.intentos >= 3));
    oir.addEventListener('click', () => Voz.hablar(limpio, 0.8));
    if (sinMicro) setTimeout(() => { oir.disabled = false; }, 4000);
    return el;
  }

  // ───────── Preguntas ─────────
  function tarjetaPregunta(b) {
    let opciones;
    if (b.opciones.length) opciones = barajar(b.opciones.map((o) => ({ texto: o.texto, correcta: o.correcta })));
    else opciones = barajar(['lugar', 'falso', 'otro'].map((k) => ({
      texto: Texto.capitalizar(J.vars['al_' + k]), correcta: k === 'lugar', lugar: k, icono: J.lugares[k].icono || ''
    })));
    let fallos = 0;
    const el = document.createElement('div');
    el.className = 'tarjeta-pregunta aparece';
    el.innerHTML = `
      <p class="pregunta linea">${palabras(b.texto)}</p>
      <div class="opciones">${opciones.map((o, i) => `
        <button class="opcion" data-i="${i}">${o.icono ? `<span class="opcion-icono" aria-hidden="true">${o.icono}</span>` : ''}<span class="opcion-texto">${htmlTexto(o.texto)}</span></button>`).join('')}</div>
      <p class="respuesta" role="status"></p>`;
    $$('.opcion', el).forEach((btn) => btn.addEventListener('click', (ev) => {
      if (ev.target.closest('.palabra')) return;
      const o = opciones[+btn.dataset.i];
      if (b.resuelta) return;
      if (o.correcta) {
        b.resuelta = true;
        btn.classList.add('correcta');
        $$('.opcion', el).forEach((x) => { x.disabled = true; });
        const msg = $('.respuesta', el);
        J.reg.preguntas++;
        if (fallos === 0) J.reg.preguntasPrimera++;
        if (fallos === 0) { ganarEstrellas(1); guardar(); msg.textContent = '⭐ ' + azar(ELOGIOS); }
        else msg.textContent = '¡Eso es! Lo has encontrado.';
        Sonido.tocar(fallos === 0 ? 'estrella' : 'bien'); confeti(26);
        setTimeout(revelar, 900);
        return;
      }
      fallos++;
      btn.classList.add('mal'); btn.disabled = true;
      if (o.lugar) caminoEquivocado(J.lugares[o.lugar]);
      else $('.respuesta', el).textContent = Texto.rellenar(azar(J.libro.meta.equivocado_pregunta || ['¡Prueba otra vez!']), J.vars);
    }));
    return el;
  }

  function caminoEquivocado(L) {
    const v = Object.assign({}, J.vars, varsLugar('elegido', L));
    const texto = Texto.rellenar(azar(J.libro.meta.equivocado || ['{elegido}: aquí no hay nadie.']), v);
    abrirCapa(`
      <div class="equivocado">
        <div class="mini-escena">${escenario({ fondo: L.fondo, noche: J.escena.e.props.noche }, { semilla: 99 })}</div>
        <div class="texto">${texto.split('\n').map((l) => `<p class="linea">${palabras(l)}</p>`).join('')}
          <p class="linea consejo">${palabras('Vuelve a leer la pista con calma.')}</p></div>
        <button class="boton boton-principal" data-cerrar>← Volver a la pista</button>
      </div>`);
  }

  function pintarFinEscena() {
    const pie = $('#pie-escena');
    const final = !!J.escena.e.props.final || J.i === J.escenas.length - 1;
    pie.innerHTML = final
      ? '<button class="boton boton-principal boton-grande" id="seguir">🏅 ¡Caso resuelto!</button>'
      : '<button class="boton boton-principal boton-grande" id="seguir">Seguir →</button>';
    const btn = $('#seguir');
    requestAnimationFrame(() => btn.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'nearest' }));
    btn.onclick = () => {
      Sonido.tocar('pagina');
      if (final) return terminarCapitulo();
      J.i++; mostrarEscena();
    };
  }

  // ───────── Fin del capítulo ─────────
  function terminarCapitulo() {
    guardarRegistro(true);
    comprobarMeta();
    const { libro, cap } = J;
    const p = (E.progreso[libro.id] = E.progreso[libro.id] || {});
    const pc = (p[cap.id] = p[cap.id] || {});
    pc[E.nivel] = (pc[E.nivel] || 0) + 1;
    const clavePeg = `${libro.id}/${cap.id}`;
    const pegatina = cap.meta.pegatina || '🏅';
    const nueva = !E.album.pegatinas[clavePeg];
    E.album.pegatinas[clavePeg] = pegatina;
    const subir = nivelParaSubir(libro);
    guardar();
    Sonido.tocar('fin'); confeti(70);

    const siguiente = libro.capitulos[J.capIndex + 1];
    app.innerHTML = `
      ${cabecera()}
      <section class="final-capitulo">
        <div class="pegatina-grande${nueva ? ' nueva' : ''}" aria-hidden="true">${pegatina}</div>
        <h1 class="titulo-grande">${palabras('¡Capítulo terminado!')}</h1>
        <p class="linea texto">${palabras(nueva ? 'Has ganado una pegatina nueva para el álbum.' : '¡Otra vez resuelto, y cada vez es distinto!')}</p>
        <div class="resumen-final">
          <div><b>${J.estrellas}</b><span>⭐ estrellas</span></div>
          <div><b>${J.leidas}</b><span>🎤 frases leídas</span></div>
        </div>
        ${subir ? `<div class="subir-nivel">
          <p class="linea texto">${palabras(`¡Has terminado todo el libro como ${nivelActual().nombre}! ¿Quieres subir al nivel ${subir.nombre}?`)}</p>
          <div class="barra-botones centrada">
            <button class="boton boton-principal" id="subir">${subir.icono} ¡Sí, quiero subir!</button>
            <button class="boton boton-suave" id="no-subir">Todavía no</button>
          </div></div>` : ''}
        <div class="barra-botones centrada">
          ${siguiente ? `<button class="boton boton-principal boton-grande" id="sig-cap">Capítulo ${J.capIndex + 2} →</button>` : ''}
          <button class="boton boton-suave" id="otra-vez">🔁 Jugar otra vez</button>
          <button class="boton boton-suave" id="a-casa">🏠 Volver a casa</button>
        </div>
      </section>`;
    const lib = libro, idx = J.capIndex;
    $('#otra-vez').onclick = () => empezarCapitulo(lib, idx);
    $('#a-casa').onclick = pantallaInicio;
    if (siguiente) $('#sig-cap').onclick = () => empezarCapitulo(lib, idx + 1);
    if (subir) {
      $('#subir').onclick = () => { E.nivel = subir.id; guardar(); Sonido.tocar('fin'); confeti(80); aviso(`¡Ahora eres ${subir.nombre}! ${subir.icono}`); $('.subir-nivel').remove(); };
      $('#no-subir').onclick = () => $('.subir-nivel').remove();
    }
  }

  function nivelParaSubir(libro) {
    const i = NIVELES.findIndex((n) => n.id === E.nivel);
    if (i < 0 || i >= NIVELES.length - 1 || E.ofrecidos[E.nivel]) return null;
    const todo = libro.capitulos.every((c) => E.progreso[libro.id] && E.progreso[libro.id][c.id] && E.progreso[libro.id][c.id][E.nivel]);
    if (!todo) return null;
    E.ofrecidos[E.nivel] = true;
    return NIVELES[i + 1];
  }

  // ───────── Álbum ─────────
  function pantallaAlbum() {
    const amigos = [], tesoros = [], pegatinas = [];
    const vistos = new Set();
    for (const libro of CAT.libros) {
      for (const [k, A] of Object.entries(libro.meta.ayudantes || {})) {
        const conocido = E.album.amigos[k];
        amigos.push(`<li class="ficha${conocido ? '' : ' oculta'}"><span class="emoji">${conocido ? A.emoji : '❔'}</span>
          <span class="ficha-nombre">${conocido ? esc(A.nombre) : '???'}</span>
          ${conocido ? `<span class="ficha-desc">${palabras(Texto.capitalizar(Texto.rellenar(A.descripcion, varsMascota())))}</span>` : ''}</li>`);
      }
      for (const t of libro.meta.tesoros || []) {
        if (vistos.has(t.emoji)) continue; vistos.add(t.emoji);
        const n = E.album.tesoros[t.emoji] || 0;
        tesoros.push(`<li class="tesoro-album${n ? '' : ' oculta'}" title="${esc(t.nombre)}"><span class="emoji">${n ? t.emoji : '❔'}</span>${n > 1 ? `<span class="cuenta">×${n}</span>` : ''}</li>`);
      }
      libro.capitulos.forEach((c, i) => {
        const p = E.album.pegatinas[`${libro.id}/${c.id}`];
        pegatinas.push(`<li class="pegatina${p ? '' : ' oculta'}"><span class="emoji">${p || '❔'}</span><span class="ficha-nombre">${p ? esc(c.meta.titulo || '') : `Capítulo ${i + 1}`}</span></li>`);
      });
    }
    const m = E.perfil.mascota, esp = CAT.mascotas[m.especie] || {};
    app.innerHTML = `
      ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Volver</button>')}
      <section class="album">
        <h1 class="titulo-grande">Mi álbum</h1>
        <div class="album-equipo">
          <div class="mini-nina">${Arte.nina(E.perfil.alaya, 'largo')}</div>
          <div class="mini-nina peque">${Arte.nina(E.perfil.lucia, 'coletas')}</div>
          <div class="mini-mascota"><span class="emoji">${esp.emoji || '🐶'}</span><span class="ficha-nombre">${esc(m.nombre)}</span></div>
        </div>
        <h2 class="titulo">Pegatinas</h2><ul class="rejilla rejilla-pegatinas">${pegatinas.join('')}</ul>
        <h2 class="titulo">Amigos de los cuentos</h2><ul class="rejilla rejilla-amigos">${amigos.join('')}</ul>
        <h2 class="titulo">${sonDos() ? `Tesoros de ${esc(P().hermana)}` : 'Tesoros escondidos'}</h2>
        <p class="pista-pequena">${esc(sonDos() ? P().hermana : P().lectora)} encuentra cosas escondidas en los dibujos. ¡Hay que tocarlas!</p>
        <ul class="rejilla rejilla-tesoros">${tesoros.join('')}</ul>
      </section>`;
    $('#volver').onclick = pantallaInicio;
  }

  // ───────── Pasar el progreso entre dispositivos ─────────
  // El código es el progreso en JSON, comprimido (si el navegador sabe) y en base64.
  const aBase64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
  const deBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  async function transformar(bytes, Clase) {
    const flujo = new Blob([bytes]).stream().pipeThrough(new Clase('gzip'));
    return new Uint8Array(await new Response(flujo).arrayBuffer());
  }
  async function codificarProgreso() {
    const { ajustes, ...datos } = E;
    const bytes = new TextEncoder().encode(JSON.stringify(datos));
    if (window.CompressionStream) { try { return 'BM1:' + aBase64(await transformar(bytes, CompressionStream)); } catch (e) { /* sin comprimir */ } }
    return 'BM0:' + aBase64(bytes);
  }
  async function decodificarProgreso(codigo) {
    const limpio = codigo.replace(/\s+/g, '');
    const m = limpio.match(/^BM([01]):(.+)$/);
    if (!m) throw new Error('formato');
    let bytes = deBase64(m[2]);
    if (m[1] === '1') bytes = await transformar(bytes, DecompressionStream);
    const datos = JSON.parse(new TextDecoder().decode(bytes));
    if (!datos || typeof datos !== 'object') throw new Error('contenido');
    return datos;
  }
  function fusionarProgreso(o) {
    const max = (a, b) => Math.max(a || 0, b || 0);
    if (!E.perfil && o.perfil) E.perfil = o.perfil;
    const iN = (id) => NIVELES.findIndex((n) => n.id === id);
    if (iN(o.nivel) > iN(E.nivel)) E.nivel = o.nivel;
    E.estrellas = max(E.estrellas, o.estrellas);
    E.gastadas = max(E.gastadas, o.gastadas);
    Object.assign(E.desbloqueado, o.desbloqueado || {});
    Object.assign(E.metaDias, o.metaDias || {});
    Object.assign(E.cofres, o.cofres || {});
    for (const [lib, caps] of Object.entries(o.progreso || {})) {
      const dl = (E.progreso[lib] = E.progreso[lib] || {});
      for (const [cap, niv] of Object.entries(caps)) {
        const dc = (dl[cap] = dl[cap] || {});
        for (const [nv, n] of Object.entries(niv)) dc[nv] = max(dc[nv], n);
      }
    }
    Object.assign(E.ofrecidos, o.ofrecidos || {});
    const al = o.album || {};
    Object.assign(E.album.amigos, al.amigos || {});
    Object.assign(E.album.pegatinas, al.pegatinas || {});
    for (const [k, n] of Object.entries(al.tesoros || {})) E.album.tesoros[k] = max(E.album.tesoros[k], n);
    const vistos = new Set(E.registro.map((r) => `${r.fecha}|${r.cap}`));
    for (const r of o.registro || []) if (!vistos.has(`${r.fecha}|${r.cap}`)) E.registro.push(r);
    E.registro.sort((x, y) => x.fecha - y.fecha);
    if (E.registro.length > 300) E.registro = E.registro.slice(-300);
    for (const [w, p] of Object.entries(o.palabras || {})) {
      const q = E.palabras[w];
      E.palabras[w] = q ? { f: max(q.f, p.f), a: max(q.a, p.a), u: max(q.u, p.u) } : p;
    }
    if (!E.ultimoLibro && o.ultimoLibro) E.ultimoLibro = o.ultimoLibro;
  }

  function vocesHtml() {
    const voces = Voz.voces();
    if (!voces.length) return '<option value="">La del dispositivo</option>';
    const actual = E.ajustes.voz || '';
    return `<option value="">Automática${Voz.nombreAuto() ? ` (${esc(Voz.nombreAuto())})` : ''}</option>` +
      voces.map((v) => `<option value="${esc(v.name)}"${v.name === actual ? ' selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('');
  }

  // ───────── Grabar la voz de la familia ─────────
  function htmlGrabaciones() {
    const lista = Grabaciones.lista();
    if (!lista.length) return '<p class="nota">Todavía no hay palabras grabadas.</p>';
    return `<ul class="lista-grabadas">${lista.map((w) => `<li><span class="palabra-grabada">${esc(w)}</span>
      <button class="boton boton-suave boton-chico" data-escuchar-grab="${esc(w)}" aria-label="Escuchar ${esc(w)}">▶</button>
      <button class="boton boton-suave boton-chico" data-grabar="${esc(w)}" aria-label="Grabar otra vez ${esc(w)}">🎙️</button>
      <button class="boton boton-suave boton-chico" data-borrar-grab="${esc(w)}" aria-label="Borrar ${esc(w)}">🗑️</button></li>`).join('')}</ul>`;
  }
  function htmlSugerenciasGrabar() {
    const faltan = palabrasDificiles().map(([w]) => w).filter((w) => !Grabaciones.tiene(w)).slice(0, 8);
    if (!faltan.length) return '';
    return `<p class="etiqueta-opcion">Palabras que le cuestan, sin grabar</p><div class="chips">${faltan.map((w) => `<button class="chip chip-peque" data-grabar="${esc(w)}">🎙️ ${esc(w)}</button>`).join('')}</div>`;
  }
  async function grabarPalabra(palabra, boton, alTerminar) {
    const clave = claveDePalabra(palabra);
    if (!clave) { aviso('Escribe primero la palabra.'); return; }
    const textoAntes = boton.innerHTML;
    try {
      Voz.parar();
      const blob = await Grabaciones.grabar({
        maxMs: 3000,
        alEmpezar: (parar) => { boton.innerHTML = '⏺ Grabando… (toca para parar)'; boton.classList.add('grabando'); boton.onclick = parar; }
      });
      if (blob.size < 800) throw new Error('vacía');
      await Grabaciones.guardar(clave, blob);
      Grabaciones.reproducirYa(clave);
      aviso(`🎙️ «${clave}» grabada. Ahora suena con tu voz.`);
    } catch (e) {
      console.warn(e);
      aviso(e && e.name === 'NotAllowedError' ? 'El navegador no deja usar el micro. Dale permiso y prueba otra vez.' : 'No se ha podido grabar. Prueba otra vez.', 5000);
    } finally {
      boton.classList.remove('grabando'); boton.innerHTML = textoAntes;
      if (alTerminar) alTerminar();
    }
  }
  /** Conecta los botones de grabar, escuchar y borrar de la pantalla actual */
  function activarGrabaciones(refrescar = pantallaAjustes) {
    if (!window.Grabaciones) return;
    const nueva = $('#grabar-nueva');
    if (nueva) nueva.onclick = () => grabarPalabra($('#palabra-grabar').value, nueva, refrescar);
    $$('[data-grabar]').forEach((b) => b.onclick = () => grabarPalabra(b.dataset.grabar, b, refrescar));
    $$('[data-escuchar-grab]').forEach((b) => b.onclick = () => Grabaciones.reproducirYa(b.dataset.escucharGrab));
    $$('[data-borrar-grab]').forEach((b) => {
      let seguro = false;
      b.onclick = async () => {
        if (!seguro) { seguro = true; b.textContent = '¿Borrar?'; setTimeout(() => { seguro = false; b.textContent = '🗑️'; }, 3000); return; }
        await Grabaciones.borrar(b.dataset.borrarGrab); refrescar();
      };
    });
  }

  let almacenPersistente = null;
  function estadoGuardado() {
    const instalada = window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios && !instalada) return 'En iPad, Safari puede borrarlo si pasan unas semanas sin abrir la web: instálala en la pantalla de inicio (Compartir → «Añadir a pantalla de inicio») para que no ocurra.';
    if (almacenPersistente) return 'Este navegador ha prometido no borrarlo.';
    return 'No se borra salvo que se limpien los datos del navegador.';
  }

  // ───────── Ajustes para mayores ─────────
  function pantallaAjustes() {
    const a = E.ajustes;
    const grupo = (campo, valores, actual) => Object.entries(valores).map(([k, v]) =>
      `<button class="chip${k === actual ? ' elegida' : ''}" data-ajuste="${campo}" data-valor="${k}" aria-pressed="${k === actual}">${esc(v)}</button>`).join('');
    const interruptor = (campo, texto) => `<label class="interruptor"><input type="checkbox" id="aj-${campo}" data-interruptor="${campo}" ${a[campo] ? 'checked' : ''}><span class="pista-int" aria-hidden="true"></span>${esc(texto)}</label>`;
    const micInfo = !Voz.soportado
      ? 'Este navegador no reconoce la voz. En el portátil usad Chrome o Edge; en el iPad, Safari. Mientras tanto, el juego usa el botón «¡Ya lo he leído!».'
      : Voz.bloqueado ? 'El micro está bloqueado en esta página. Dale permiso en el candado de la barra de direcciones.' : 'El micro funciona en este navegador. La primera vez pedirá permiso.';
    app.innerHTML = `
      ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Volver</button>')}
      <section class="ajustes">
        <h1 class="titulo-grande">Para mayores</h1>
        <button class="boton boton-principal boton-informe" id="ver-informe">📊 Ver el informe de lectura</button>
        <div class="ajuste-bloque">
          <h2 class="titulo">Nivel de lectura</h2>
          <div class="niveles">${NIVELES.map((n) => `<button class="nivel-carta${n.id === E.nivel ? ' elegida' : ''}" data-nivel="${n.id}" aria-pressed="${n.id === E.nivel}">
            <span class="insignia-nivel">${n.icono}</span><b>${n.nombre}</b><span>${n.desc}</span></button>`).join('')}</div>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Letra</h2>
          <div class="chips">${grupo('tamano', { normal: 'Normal', grande: 'Grande', enorme: 'Muy grande' }, a.tamano)}</div>
          <p class="texto muestra-texto linea">${palabras('Así se verán los textos del cuento.')}</p>
          ${interruptor('resaltar', 'Resaltar la línea al tocar una palabra')}
          ${interruptor('silabas', 'Sílabas de colores (ma·ri·po·sa)')}
          ${interruptor('regla', 'Regla de lectura: atenuar las demás líneas')}
          <p class="nota">Tocar una palabra la lee. Tocarla otra vez enseguida la lee <b>por sílabas</b>.</p>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Micrófono</h2>
          <p class="nota">${esc(micInfo)}</p>
          <p class="etiqueta-opcion">Cuánto perdona los errores</p>
          <div class="chips">${grupo('tolerancia', Object.fromEntries(Object.entries(TOLERANCIAS).map(([k, t]) => [k, t.nombre])), a.tolerancia)}</div>
          ${interruptor('sinMicro', 'Jugar sin micrófono (botón «¡Ya lo he leído!»)')}
          ${interruptor('sonido', 'Sonidos del juego')}
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Meta de cada día</h2>
          <p class="nota">Al cumplirla gana 3 estrellas. Si la cumple 5 días en una semana, abre un cofre con 15 más. Saltarse un día no rompe la racha.</p>
          <div class="chips">${grupo('meta', Object.fromEntries(Object.entries(METAS).map(([k, m]) => [k, m.nombre])), a.meta || 'm10')}</div>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Tu voz para las palabras difíciles</h2>
          <p class="nota">Graba cómo dices una palabra y, cuando ${esc(P().lectora)} la toque, sonará con tu voz. Las grabaciones se quedan en este dispositivo.</p>
          ${window.Grabaciones && Grabaciones.soportado() ? `
          <div class="fila-voz">
            <label class="etiqueta-opcion" for="palabra-grabar">Palabra</label>
            <input id="palabra-grabar" class="selector" maxlength="20" autocomplete="off" placeholder="mariposa">
            <button class="boton boton-principal boton-chico" id="grabar-nueva">🎙️ Grabar</button>
          </div>
          ${htmlSugerenciasGrabar()}
          <div id="lista-grabaciones">${htmlGrabaciones()}</div>` : '<p class="nota">Este navegador no permite grabar. Prueba con Chrome, Edge o Safari actualizados.</p>'}
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Voz que lee las palabras</h2>
          <p class="nota">Es la voz que suena al tocar una palabra o al pulsar «Escuchar». Cada dispositivo tiene sus propias voces: elige la que suene más natural.</p>
          <div class="fila-voz">
            <label class="etiqueta-opcion" for="aj-voz">Voz</label>
            <select id="aj-voz" class="selector">${vocesHtml()}</select>
            <button class="boton boton-suave boton-chico" id="probar-voz">🔊 Probar</button>
          </div>
          <p class="etiqueta-opcion">Velocidad</p>
          <div class="chips">${grupo('velocidad', { lenta: 'Despacio', normal: 'Normal', rapida: 'Rápida' }, a.velocidad || 'normal')}</div>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Pasar el progreso a otro dispositivo</h2>
          <p class="nota">Si juega en la tablet y en el portátil, copia aquí el código y pégalo en el otro. Se juntan los dos progresos (estrellas, capítulos, álbum, informe y palabras), no se borra nada.</p>
          <div class="barra-botones" style="justify-content:flex-start;margin-top:0">
            <button class="boton boton-suave" id="copiar-codigo">📋 Copiar el código de este dispositivo</button>
          </div>
          <label class="etiqueta-opcion" for="pegar-codigo">Pegar el código del otro dispositivo</label>
          <textarea id="pegar-codigo" class="resumen-copia" rows="3" placeholder="BM1:…" spellcheck="false"></textarea>
          <div><button class="boton boton-principal" id="juntar">Juntar progresos</button></div>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Copia de seguridad</h2>
          <p class="nota">El progreso se guarda solo en este navegador. ${estadoGuardado()} Guarda de vez en cuando una copia en un archivo (en Drive, iCloud o el ordenador) por si se borra.</p>
          <p class="nota"><b>Última copia:</b> ${E.ultimaCopia ? new Date(E.ultimaCopia).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'nunca'}</p>
          <div class="barra-botones" style="justify-content:flex-start;margin-top:0">
            <button class="boton boton-principal" id="descargar-copia">💾 Guardar copia en un archivo</button>
            <label class="boton boton-suave" for="cargar-copia">📂 Recuperar desde un archivo</label>
            <input type="file" id="cargar-copia" accept=".json,application/json" hidden>
          </div>
        </div>
        <div class="ajuste-bloque">
          <h2 class="titulo">Progreso</h2>
          <p class="nota">${E.estrellas} estrellas · ${Object.keys(E.album.pegatinas).length} pegatinas · ${Object.values(E.album.tesoros).reduce((x, y) => x + y, 0)} tesoros encontrados.</p>
          <button class="boton boton-peligro" id="borrar">Borrar todo el progreso</button>
        </div>
      </section>`;
    $('#volver').onclick = pantallaInicio;
    $('#ver-informe').onclick = pantallaInforme;
    $$('[data-nivel]').forEach((b) => b.onclick = () => { E.nivel = b.dataset.nivel; guardar(); pantallaAjustes(); });
    $$('[data-ajuste]').forEach((b) => b.onclick = () => { a[b.dataset.ajuste] = b.dataset.valor; guardar(); aplicarAjustes(); pantallaAjustes(); });
    $$('[data-interruptor]').forEach((i) => i.onchange = () => { a[i.dataset.interruptor] = i.checked; guardar(); aplicarAjustes(); });
    activarGrabaciones();
    $('#aj-voz').onchange = (ev) => { a.voz = ev.target.value; guardar(); aplicarAjustes(); Voz.hablar('¡Hola! Así sueno yo.'); };
    $('#probar-voz').onclick = () => Voz.hablar(`${P().lectora} busca una mariposa azul.`);
    $('#copiar-codigo').onclick = async () => {
      const codigo = await codificarProgreso();
      const respaldo = () => {
        abrirCapa(`<div class="cuaderno"><h2 class="titulo">Código de progreso</h2><textarea class="resumen-copia" id="codigo-copia" rows="6" readonly>${esc(codigo)}</textarea>
          <p class="nota">Selecciona todo el texto y cópialo.</p><button class="boton boton-principal" data-cerrar>Cerrar</button></div>`);
        const t = $('#codigo-copia'); t.focus(); t.select();
      };
      try { navigator.clipboard.writeText(codigo).then(() => aviso('Código copiado. Pégalo en el otro dispositivo.'), respaldo); } catch (e) { respaldo(); }
    };
    $('#descargar-copia').onclick = () => {
      const { ajustes, ...datos } = E;
      const copia = { app: 'biblioteca-magica', version: 1, fecha: new Date().toISOString(), datos };
      const url = URL.createObjectURL(new Blob([JSON.stringify(copia)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = `biblioteca-${claveDePalabra(P().lectora)}-${claveDia(Date.now())}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      E.ultimaCopia = Date.now(); guardar();
      aviso('💾 Copia guardada. Búscala en Descargas.'); pantallaAjustes();
    };
    $('#cargar-copia').onchange = async (ev) => {
      const archivo = ev.target.files && ev.target.files[0];
      if (!archivo) return;
      try {
        const copia = JSON.parse(await archivo.text());
        if (!copia || copia.app !== 'biblioteca-magica' || !copia.datos) throw new Error('formato');
        fusionarProgreso(copia.datos); guardar(); aplicarAjustes();
        aviso('📂 Copia recuperada. Se ha juntado con el progreso de este dispositivo.', 5000);
        pantallaAjustes();
      } catch (e) { console.error(e); aviso('Ese archivo no es una copia de La biblioteca mágica.', 5000); }
    };
    $('#juntar').onclick = async () => {
      const txt = $('#pegar-codigo').value.trim();
      if (!txt) { aviso('Primero pega el código del otro dispositivo.'); return; }
      try {
        const otro = await decodificarProgreso(txt);
        fusionarProgreso(otro); guardar(); aplicarAjustes();
        aviso('¡Progresos juntados!'); pantallaAjustes();
      } catch (e) { console.error(e); aviso('Ese código no es válido. Cópialo entero otra vez.', 5000); }
    };
    let confirmar = false;
    $('#borrar').onclick = (ev) => {
      if (!confirmar) { confirmar = true; ev.currentTarget.textContent = 'Seguro: toca otra vez para borrarlo'; return; }
      const perfil = E.perfil; E = estadoInicial(); E.perfil = perfil; guardar(); aplicarAjustes();
      aviso('Progreso borrado. La ropa y la mascota se quedan igual.');
      pantallaAjustes();
    };
  }

  // ───────── Informe de lectura (para mayores) ─────────
  const DIA = 864e5;
  const suma = (arr, f) => arr.reduce((s, r) => s + (f(r) || 0), 0);
  const porcentaje = (a, b) => (b ? Math.round((a / b) * 100) : null);
  const conMicro = (arr) => arr.filter((r) => r.micro && r.frases);
  const inicioDeHoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return +d; };
  const fechaCorta = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const LETRA_DIA = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  function recomendacionNivel() {
    const i = NIVELES.findIndex((n) => n.id === E.nivel);
    const n = NIVELES[i];
    const ult = conMicro(E.registro.filter((r) => r.nivel === E.nivel && r.terminado)).slice(-5);
    if (ult.length < 3) return { tipo: 'neutro', texto: `Para recomendar un nivel hacen falta 3 capítulos terminados con micro en ${n.nombre}. Lleva ${ult.length}.` };
    const p = porcentaje(suma(ult, (r) => r.frasesPrimera), suma(ult, (r) => r.frases));
    const preg = suma(ult, (r) => r.preguntas);
    const q = preg ? porcentaje(suma(ult, (r) => r.preguntasPrimera), preg) : 100;
    const datos = `En sus últimos ${ult.length} capítulos lee el ${p} % de las frases a la primera y acierta el ${q} % de las preguntas a la primera.`;
    if (p >= 85 && q >= 80 && i < NIVELES.length - 1) return { tipo: 'subir', texto: `${datos} Está lista para probar ${NIVELES[i + 1].nombre}.`, nivel: NIVELES[i + 1] };
    if (p < 50 && i > 0) return { tipo: 'bajar', texto: `${datos} Le está costando: puede venirle bien volver a ${NIVELES[i - 1].nombre} un tiempo.`, nivel: NIVELES[i - 1] };
    return { tipo: 'mantener', texto: `${datos} ${n.nombre} es un buen nivel para ella ahora mismo.` };
  }

  function graficoDias(dias) {
    const max = Math.max(4, ...dias.map((d) => d.total));
    const tope = Math.ceil(max / 4) * 4;
    const W = 700, H = 230, izq = 34, abajo = 44, arriba = 12, ancho = (W - izq - 8) / dias.length;
    const y = (v) => arriba + (H - arriba - abajo) * (1 - v / tope);
    let s = '';
    for (const v of [0, tope / 2, tope]) s += `<line x1="${izq}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" class="g-rejilla"/><text x="${izq - 8}" y="${y(v) + 4}" class="g-eje" text-anchor="end">${v}</text>`;
    dias.forEach((d, i) => {
      const x = izq + i * ancho + ancho * 0.18, w = ancho * 0.64;
      if (d.primera) s += `<rect x="${x}" y="${y(d.primera)}" width="${w}" height="${y(0) - y(d.primera)}" rx="3" class="g-primera"><title>${d.primera} a la primera</title></rect>`;
      const resto = d.total - d.primera;
      if (resto > 0) s += `<rect x="${x}" y="${y(d.total)}" width="${w}" height="${y(d.primera) - y(d.total)}" rx="3" class="g-resto"><title>${resto} repitiendo o sin micro</title></rect>`;
      if (d.total) s += `<text x="${x + w / 2}" y="${y(d.total) - 5}" class="g-valor" text-anchor="middle">${d.total}</text>`;
      const f = new Date(d.ini);
      s += `<text x="${x + w / 2}" y="${H - abajo + 18}" class="g-eje${d.hoy ? ' g-hoy' : ''}" text-anchor="middle">${LETRA_DIA[f.getDay()]}</text><text x="${x + w / 2}" y="${H - abajo + 34}" class="g-eje g-num" text-anchor="middle">${f.getDate()}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="Frases leídas cada día en las últimas dos semanas">${s}</svg>`;
  }

  function pantallaInforme() {
    const N = P(), R = E.registro, hoy = inicioDeHoy();
    const semana = R.filter((r) => r.fecha >= hoy - 6 * DIA);
    const anterior = R.filter((r) => r.fecha >= hoy - 13 * DIA && r.fecha < hoy - 6 * DIA);
    const pctPrimera = (arr) => { const m = conMicro(arr); return porcentaje(suma(m, (r) => r.frasesPrimera), suma(m, (r) => r.frases)); };
    const s = {
      capitulos: semana.filter((r) => r.terminado).length,
      frases: suma(semana, (r) => r.frases),
      minutos: Math.round(suma(semana, (r) => r.seg) / 60),
      primera: pctPrimera(semana), primeraAnt: pctPrimera(anterior),
      preguntas: porcentaje(suma(semana, (r) => r.preguntasPrimera), suma(semana, (r) => r.preguntas)),
      retos: porcentaje(suma(semana, (r) => r.retosPrimera), suma(semana, (r) => r.retos))
    };
    const dias = [];
    for (let i = 13; i >= 0; i--) {
      const ini = hoy - i * DIA, rs = R.filter((r) => r.fecha >= ini && r.fecha < ini + DIA);
      dias.push({ ini, hoy: i === 0, total: suma(rs, (r) => r.frases), primera: suma(rs.filter((r) => r.micro), (r) => r.frasesPrimera) });
    }
    const dificiles = palabrasDificiles().slice(0, 12);
    const ganadas = Object.entries(E.palabras).filter(([, p]) => conquistada(p)).sort((a, b) => b[1].u - a[1].u);
    const rec = recomendacionNivel();
    const tendencia = s.primera == null || s.primeraAnt == null ? ''
      : s.primera > s.primeraAnt ? `<span class="tendencia sube">▲ ${s.primera - s.primeraAnt} puntos</span>`
        : s.primera < s.primeraAnt ? `<span class="tendencia baja">▼ ${s.primeraAnt - s.primera} puntos</span>` : '<span class="tendencia">igual</span>';
    const fmt = (v, suf = '') => (v == null ? '—' : v + suf);
    const nivelDe = (id) => NIVELES.find((n) => n.id === id) || NIVELES[0];
    const vacio = !R.length;

    app.innerHTML = `
      ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Volver</button>')}
      <section class="informe">
        <div class="informe-titulo">
          <div><p class="sobretitulo">Últimos 7 días</p><h1 class="titulo-grande">Así lee ${esc(N.lectora)}</h1></div>
          <button class="boton boton-suave" id="copiar" ${vacio ? 'disabled' : ''}>📋 Copiar resumen</button>
        </div>
        ${vacio ? `<div class="vacio-informe"><p>${esc(`Todavía no hay partidas. Cuando ${N.lectora} juegue, aquí verás cuántas frases lee, cuáles le salen a la primera y qué palabras le cuestan.`)}</p></div>` : ''}
        <div class="cifras">
          <div class="cifra"><b>${s.frases}</b><span>frases leídas en voz alta</span></div>
          <div class="cifra"><b>${fmt(s.primera, ' %')}</b><span>frases a la primera ${tendencia}</span></div>
          <div class="cifra"><b>${fmt(s.preguntas, ' %')}</b><span>preguntas acertadas a la primera</span></div>
          <div class="cifra"><b>${fmt(s.retos, ' %')}</b><span>cerraduras (b/d, p/q…) a la primera</span></div>
          <div class="cifra"><b>${s.minutos}</b><span>minutos leyendo · ${s.capitulos} capítulos</span></div>
        </div>
        <div class="recomendacion rec-${rec.tipo}">
          <span class="rec-etiqueta">${{ subir: '⬆ Subir de nivel', bajar: '⬇ Bajar de nivel', mantener: '✓ Mantener nivel', neutro: 'Nivel' }[rec.tipo]}</span>
          <p>${esc(rec.texto)}</p>
          ${rec.nivel ? `<button class="boton boton-suave boton-chico" id="aplicar-nivel">Cambiar a ${rec.nivel.icono} ${esc(rec.nivel.nombre)}</button>` : ''}
        </div>
        <div class="tarjeta-informe">
          <h2 class="titulo">Frases leídas cada día</h2>
          <div class="leyenda"><span><i class="l-primera"></i>A la primera</span><span><i class="l-resto"></i>Repitiendo o sin micro</span></div>
          <div class="grafico-sitio">${graficoDias(dias)}</div>
        </div>
        <div class="dos-columnas">
          <div class="tarjeta-informe">
            <h2 class="titulo">Palabras que le cuestan</h2>
            <p class="nota">Salen como «palabras mágicas» al empezar cada capítulo hasta que las conquista (acertarlas 2 veces más de las que las ha fallado).</p>
            ${dificiles.length ? `<ul class="lista-palabras">${dificiles.map(([w, p]) => `
              <li><button class="palabra-informe" data-oir="${esc(w)}" aria-label="Escuchar ${esc(w)}">🔊 ${esc(w)}</button>
              <span class="marcador">${'●'.repeat(Math.min(p.a, 8))}<span class="falta-marca">${'○'.repeat(Math.max(0, Math.min(8, p.f + 2 - p.a)))}</span></span>
              <span class="nota">falla ${p.f} · acierta ${p.a}</span>
              ${window.Grabaciones && Grabaciones.soportado() ? `<button class="boton boton-suave boton-chico" data-grabar="${esc(w)}">🎙️ ${Grabaciones.tiene(w) ? 'Regrabar tu voz' : 'Grabar tu voz'}</button>` : ''}</li>`).join('')}</ul>`
              : '<p class="nota">Aún no hay palabras difíciles. Necesita jugar con el micro para detectarlas.</p>'}
          </div>
          <div class="tarjeta-informe">
            <h2 class="titulo">Palabras conquistadas</h2>
            ${ganadas.length ? `<div class="chips">${ganadas.map(([w]) => `<span class="chip chip-ganada">✓ ${esc(w)}</span>`).join('')}</div>` : '<p class="nota">Cuando acierte varias veces una palabra difícil, aparecerá aquí.</p>'}
          </div>
        </div>
        <div class="tarjeta-informe">
          <h2 class="titulo">Últimas partidas</h2>
          ${R.length ? `<div class="tabla-sitio"><table class="tabla">
            <thead><tr><th>Fecha</th><th>Capítulo</th><th>Nivel</th><th class="num">Frases</th><th class="num">A la primera</th><th class="num">Preguntas</th><th class="num">Minutos</th><th>Estado</th></tr></thead>
            <tbody>${R.slice(-12).reverse().map((r) => `<tr>
              <td>${fechaCorta(r.fecha)} ${new Date(r.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${esc(r.titulo)}</td><td>${nivelDe(r.nivel).icono} ${nivelDe(r.nivel).nombre}</td>
              <td class="num">${r.frases}</td>
              <td class="num">${r.micro ? fmt(porcentaje(r.frasesPrimera, r.frases), ' %') : 'sin micro'}</td>
              <td class="num">${r.preguntas ? `${r.preguntasPrimera}/${r.preguntas}` : '—'}</td>
              <td class="num">${Math.max(1, Math.round(r.seg / 60))}</td>
              <td>${r.terminado ? '<span class="estado est-ok">Terminado</span>' : '<span class="estado est-pausa">A medias</span>'}</td></tr>`).join('')}</tbody>
          </table></div>` : '<p class="nota">Sin partidas todavía.</p>'}
        </div>
      </section>`;

    $('#volver').onclick = pantallaAjustes;
    $$('[data-oir]').forEach((b) => b.onclick = () => decir(b.dataset.oir));
    activarGrabaciones(pantallaInforme);
    if (rec.nivel) $('#aplicar-nivel').onclick = () => { E.nivel = rec.nivel.id; guardar(); aviso(`Nivel cambiado a ${rec.nivel.nombre}.`); pantallaInforme(); };
    const copiar = $('#copiar');
    copiar.onclick = () => {
      const texto = [
        `Informe de lectura de ${N.lectora} · ${fechaCorta(hoy - 6 * DIA)} – ${fechaCorta(hoy)}`,
        `Nivel: ${nivelDe(E.nivel).nombre}`,
        `Capítulos terminados: ${s.capitulos} · Frases leídas: ${s.frases} · Minutos: ${s.minutos}`,
        `Frases a la primera: ${fmt(s.primera, ' %')}${s.primeraAnt != null ? ` (semana anterior: ${s.primeraAnt} %)` : ''}`,
        `Preguntas a la primera: ${fmt(s.preguntas, ' %')}`,
        `Cerraduras de letras (b/d, p/q, m/n, sílabas) a la primera: ${fmt(s.retos, ' %')}`,
        `Palabras que le cuestan: ${dificiles.map(([w]) => w).join(', ') || '—'}`,
        `Palabras conquistadas: ${ganadas.map(([w]) => w).join(', ') || '—'}`,
        `Recomendación: ${rec.texto}`
      ].join('\n');
      const exito = () => aviso('Resumen copiado. Puedes pegarlo en un mensaje.');
      const respaldo = () => {
        abrirCapa(`<div class="cuaderno"><h2 class="titulo">Resumen</h2><textarea class="resumen-copia" id="resumen-copia" rows="9">${esc(texto)}</textarea>
          <p class="nota">Selecciona el texto y cópialo.</p><button class="boton boton-principal" data-cerrar>Cerrar</button></div>`);
        const t = $('#resumen-copia'); t.focus(); t.select();
      };
      try { navigator.clipboard.writeText(texto).then(exito, respaldo); } catch (e) { respaldo(); }
    };
  }

  // ───────── Arranque ─────────
  async function iniciar() {
    aplicarAjustes();
    if (window.Grabaciones) Grabaciones.iniciar();
    // Pide al navegador que no borre el progreso aunque falte espacio o pase tiempo sin abrir la web
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then((ok) => { almacenPersistente = ok; }); } catch (e) { /* no disponible */ }
    app.innerHTML = '<p class="cargando">Abriendo el libro…</p>';
    try {
      CAT = await Datos.cargarCatalogo();
    } catch (err) {
      console.error(err);
      app.innerHTML = `<div class="error"><h1 class="titulo">No se han podido cargar las historias</h1>
        <p>${esc(err.message)}</p><p class="nota">Si has abierto el archivo con doble clic, hace falta un servidor (por ejemplo, GitHub Pages).</p></div>`;
      return;
    }
    if (!E.perfil) pantallaBienvenida(); else pantallaInicio();
    // Instalable y sin internet (solo en la web publicada, no en la versión de un solo archivo)
    if ('serviceWorker' in navigator && !window.__EMBEBIDO__ && /^(https:|http:\/\/localhost)/.test(location.href)) {
      navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Sin modo offline:', e));
    }
  }

  // Para pruebas desde la consola
  window.Juego = { get estado() { return E; }, get catalogo() { return CAT; }, prepararPartida };
  iniciar();
})();
