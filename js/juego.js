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
  const NOMBRES_MASCOTA = ['Toby', 'Luna', 'Coco', 'Nala', 'Bolita', 'Pipo', 'Kiwi', 'Lola'];
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
    ajustes: { tamano: 'normal', tolerancia: 'normal', sinMicro: false, resaltar: true, sonido: true }
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
    document.body.classList.toggle('con-resaltado', !!E.ajustes.resaltar);
  }

  let CAT = null;   // catálogo de libros
  let J = null;     // partida en curso

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
  function palabras(texto) {
    return String(texto).split(/\[\[(.+?)\]\]/).map((trozo, i) => {
      const html = trozo.split(/(\s+)/).map((t) => (!t || /^\s+$/.test(t)) ? t : `<span class="palabra">${esc(t)}</span>`).join('');
      return i % 2 ? `<mark class="pista"><span class="lupa" aria-hidden="true">🔎</span>${html}</mark>` : html;
    }).join('');
  }
  document.addEventListener('click', (ev) => {
    const p = ev.target.closest('.palabra');
    if (!p) return;
    const limpia = p.textContent.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    if (limpia) Voz.hablar(limpia, 0.75);
    p.classList.remove('sonando'); void p.offsetWidth; p.classList.add('sonando');
    if (E.ajustes.resaltar) {
      $$('.linea-activa').forEach((x) => x.classList.remove('linea-activa'));
      const linea = p.closest('.linea');
      linea && linea.classList.add('linea-activa');
    }
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
    return {
      [prefijo]: `${A.articulo} ${A.especie} ${A.nombre}`,
      [prefijo + '_nombre']: A.nombre,
      [prefijo + '_desc']: A.descripcion,
      [gracia]: azar(A.gracias || ['se ríe un montón'])
    };
  }
  function varsMascota() {
    const m = E.perfil.mascota, esp = CAT.mascotas[m.especie] || Object.values(CAT.mascotas)[0];
    const chica = m.genero === 'chica', animal = chica ? esp.chica : esp.chico;
    return { mascota: m.nombre, animal, el_animal: (chica ? 'la ' : 'el ') + animal, un_animal: (chica ? 'una ' : 'un ') + animal, mo: chica ? 'a' : 'o' };
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
      pj.push(`<div class="pj pj-alaya" title="${esc(CAT.protagonistas.lectora)}">${Arte.nina(E.perfil.alaya, 'largo')}<span class="etiqueta">${esc(CAT.protagonistas.lectora)}</span></div>`);
      pj.push(`<div class="pj pj-lucia" title="${esc(CAT.protagonistas.hermana)}">${Arte.nina(E.perfil.lucia, 'coletas')}<span class="etiqueta">${esc(CAT.protagonistas.hermana)}</span></div>`);
    }
    const emojiPj = (emoji, clase, nombre) => `<div class="pj pj-emoji ${clase}"><span class="emoji">${emoji}</span>${nombre ? `<span class="etiqueta">${esc(nombre)}</span>` : ''}</div>`;
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

  // Lucía encuentra tesoros escondidos en el dibujo
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('.tesoro');
    if (!t) return;
    const emoji = t.dataset.emoji, nombre = t.dataset.nombre;
    E.album.tesoros[emoji] = (E.album.tesoros[emoji] || 0) + 1; guardar();
    t.classList.add('encontrado');
    setTimeout(() => t.remove(), 600);
    Sonido.tocar('tesoro'); confeti(18);
    const frase = `¡${CAT.protagonistas.hermana} ha encontrado ${nombre}!`;
    aviso(`${emoji} ${frase}`);
    Voz.hablar(frase, 0.95);
  });

  // ───────── Pantalla: bienvenida ─────────
  function pantallaBienvenida() {
    const P = CAT.protagonistas;
    app.innerHTML = `
      <section class="portada">
        <p class="sobretitulo">Un juego para leer</p>
        <h1 class="titulo-grande">La biblioteca mágica</h1>
        <div class="texto texto-portada">
          <p class="linea">${palabras(`¡Hola, ${P.lectora}! Hoy empieza una aventura muy especial.`)}</p>
          <p class="linea">${palabras(`Primero vamos a preparar a las protagonistas: tú, ${P.hermana} y vuestra mascota.`)}</p>
        </div>
        <button class="boton boton-principal boton-grande" id="empezar">¡Vamos!</button>
        <p class="pista-pequena">Toca cualquier palabra para oírla.</p>
      </section>`;
    $('#empezar').onclick = () => { Sonido.tocar('pagina'); pantallaPersonalizar(0, true); };
  }

  // ───────── Pantalla: personalizar ─────────
  const perfilPorDefecto = () => ({
    alaya: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#C9476B', accesorio: 'sombrero' },
    lucia: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#F2B33D', accesorio: 'lazo' },
    mascota: { especie: 'perro', genero: 'chico', nombre: 'Toby' }
  });
  let borrador = null;

  function pantallaPersonalizar(paso, primeraVez) {
    if (paso === 0 || !borrador) borrador = JSON.parse(JSON.stringify(E.perfil || perfilPorDefecto()));
    const P = CAT.protagonistas;
    const quien = paso === 0 ? 'alaya' : 'lucia';
    let opciones = '', vista = '', titulo = '';

    const muestras = (campo, valores, actual, nombres) => valores.map((v, i) =>
      `<button class="muestra${v === actual ? ' elegida' : ''}" data-campo="${campo}" data-valor="${esc(v)}" style="--c:${esc(v)}" aria-label="${esc(nombres ? nombres[i] : v)}" aria-pressed="${v === actual}"></button>`).join('');

    if (paso < 2) {
      const c = borrador[quien];
      titulo = paso === 0 ? `¿Cómo es ${P.lectora}?` : `¿Cómo es ${P.hermana}?`;
      vista = `<div class="vista-nina">${Arte.nina(c, paso === 0 ? 'largo' : 'coletas')}</div>`;
      const pelos = Object.entries(APARIENCIA.pelo);
      opciones = `
        <div class="fila-opcion"><span class="etiqueta-opcion">Piel</span><div class="muestras">${muestras('piel', APARIENCIA.piel, c.piel)}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Pelo</span><div class="muestras">${muestras('pelo', pelos.map((p) => p[1]), c.pelo, pelos.map((p) => p[0]))}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Ropa</span><div class="muestras">${muestras('vestido', APARIENCIA.vestido, c.vestido)}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">Complemento</span><div class="chips">${Object.entries(APARIENCIA.accesorio).map(([k, nom]) =>
          `<button class="chip${c.accesorio === k ? ' elegida' : ''}" data-campo="accesorio" data-valor="${k}" aria-pressed="${c.accesorio === k}">${palabras(nom)}</button>`).join('')}</div></div>`;
    } else {
      const m = borrador.mascota;
      titulo = '¿Cómo es vuestra mascota?';
      const esp = CAT.mascotas[m.especie] || Object.values(CAT.mascotas)[0];
      vista = `<div class="vista-mascota"><span class="emoji-grande">${esp.emoji}</span><span class="nombre-mascota">${esc(m.nombre || '…')}</span></div>`;
      opciones = `
        <div class="fila-opcion"><span class="etiqueta-opcion">Animal</span><div class="chips">${Object.entries(CAT.mascotas).map(([k, e]) =>
          `<button class="chip chip-animal${m.especie === k ? ' elegida' : ''}" data-campo="especie" data-valor="${k}" aria-pressed="${m.especie === k}"><span class="emoji">${e.emoji}</span>${esc(m.genero === 'chica' ? e.chica : e.chico)}</button>`).join('')}</div></div>
        <div class="fila-opcion"><span class="etiqueta-opcion">¿Chico o chica?</span><div class="chips">
          <button class="chip${m.genero === 'chico' ? ' elegida' : ''}" data-campo="genero" data-valor="chico">Chico</button>
          <button class="chip${m.genero === 'chica' ? ' elegida' : ''}" data-campo="genero" data-valor="chica">Chica</button></div></div>
        <div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-mascota">¿Cómo se llama?</label>
          <input id="nombre-mascota" class="campo-nombre" maxlength="12" autocomplete="off" value="${esc(m.nombre)}">
          <div class="chips chips-nombres">${NOMBRES_MASCOTA.map((nm) => `<button class="chip chip-peque" data-campo="nombre" data-valor="${nm}">${nm}</button>`).join('')}</div></div>`;
    }

    app.innerHTML = `
      <section class="personalizar">
        <div class="pasos" aria-label="Paso ${paso + 1} de 3">${[0, 1, 2].map((i) => `<span class="${i === paso ? 'activo' : i < paso ? 'hecho' : ''}"></span>`).join('')}</div>
        <h1 class="titulo">${palabras(titulo)}</h1>
        <div class="personalizar-cuerpo">
          <div class="personalizar-vista">${vista}</div>
          <div class="personalizar-opciones">${opciones}</div>
        </div>
        <div class="barra-botones">
          ${paso > 0 ? '<button class="boton boton-suave" id="atras">← Atrás</button>' : (!primeraVez ? '<button class="boton boton-suave" id="cancelar">Cancelar</button>' : '<span></span>')}
          <button class="boton boton-principal" id="siguiente">${paso < 2 ? 'Siguiente →' : '¡Listo!'}</button>
        </div>
      </section>`;

    $$('[data-campo]').forEach((b) => b.addEventListener('click', () => {
      const campo = b.dataset.campo, valor = b.dataset.valor;
      if (paso < 2) borrador[quien][campo] = valor; else borrador.mascota[campo] = valor;
      Sonido.tocar('pagina');
      pantallaPersonalizar(paso, primeraVez);
      if (campo === 'nombre') $('#nombre-mascota')?.focus();
    }));
    const campoNombre = $('#nombre-mascota');
    if (campoNombre) campoNombre.addEventListener('input', () => {
      borrador.mascota.nombre = campoNombre.value.replace(/[^\p{L}\s-]/gu, '').slice(0, 12);
      $('.nombre-mascota').textContent = borrador.mascota.nombre || '…';
    });
    $('#atras') && ($('#atras').onclick = () => pantallaPersonalizar(paso - 1, primeraVez));
    $('#cancelar') && ($('#cancelar').onclick = () => { borrador = null; pantallaInicio(); });
    $('#siguiente').onclick = () => {
      if (paso < 2) return pantallaPersonalizar(paso + 1, primeraVez);
      const nombre = (borrador.mascota.nombre || '').trim();
      if (!nombre) { aviso('Escribe un nombre para la mascota.'); campoNombre && campoNombre.focus(); return; }
      borrador.mascota.nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
      E.perfil = borrador; borrador = null; guardar();
      Sonido.tocar('bien'); confeti(30);
      pantallaInicio();
    };
  }

  // ───────── Pantalla: inicio ─────────
  const capituloHecho = (libroId, capId) => !!(E.progreso[libroId] && E.progreso[libroId][capId] && Object.keys(E.progreso[libroId][capId]).length);
  const nivelActual = () => NIVELES.find((n) => n.id === E.nivel) || NIVELES[0];

  function cabecera(extraIzq = '') {
    return `<header class="cabecera">
      <div class="cabecera-izq">${extraIzq || '<span class="marca">La biblioteca mágica</span>'}</div>
      <div class="cabecera-der">
        <span class="contador-estrellas" aria-label="Estrellas"><span aria-hidden="true">⭐</span> <b id="total-estrellas">${E.estrellas}</b></span>
      </div>
    </header>`;
  }

  function pantallaInicio() {
    J = null;
    cerrarCapa();
    const n = nivelActual(), vm = varsMascota();
    app.innerHTML = `
      ${cabecera()}
      <section class="inicio-hero">
        <div class="hero-escena">${escenario({ fondo: 'casa', con: ['mascota'] })}</div>
        <div class="hero-info">
          <h1 class="titulo-grande">${palabras(`${CAT.protagonistas.lectora}, ${CAT.protagonistas.hermana} y ${vm.mascota}`)}</h1>
          <p class="nivel-actual"><span class="insignia-nivel">${n.icono}</span> Nivel <b>${n.nombre}</b></p>
          <div class="acciones-hero">
            <button class="boton boton-suave" id="album">📒 Álbum</button>
            <button class="boton boton-suave" id="vestir">🎨 Vestir</button>
            <button class="boton boton-suave boton-mayores" id="mayores" aria-describedby="ayuda-mayores"><span class="carga" aria-hidden="true"></span>⚙️ Mayores</button>
          </div>
          <p class="pista-pequena" id="ayuda-mayores" hidden>Mantén pulsado el botón para entrar.</p>
        </div>
      </section>
      ${CAT.libros.map((libro) => htmlLibro(libro, vm)).join('')}`;

    $('#album').onclick = pantallaAlbum;
    $('#vestir').onclick = () => pantallaPersonalizar(0, false);
    puertaMayores($('#mayores'), pantallaAjustes);
    $$('[data-capitulo]').forEach((b) => b.addEventListener('click', () => {
      const libro = CAT.libros.find((l) => l.id === b.dataset.libro);
      empezarCapitulo(libro, +b.dataset.capitulo);
    }));
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
        <p class="libro-resumen">${esc(libro.meta.resumen || '')}</p></div>
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
    J = { libro, cap, capIndex, escenas, i: 0, ...datos, semilla: Math.floor(Math.random() * 1e6), estrellas: 0, leidas: 0, cuaderno: [] };
    Sonido.tocar('pagina');
    mostrarEscena();
  }

  function mostrarEscena() {
    const e = J.escenas[J.i];
    const plantilla = azar(versionesPara(e, E.nivel));
    const texto = Texto.rellenar(plantilla, J.vars);
    J.escena = { e, bloques: Texto.bloques(texto), k: 0 };

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
      Voz.parar(); pantallaInicio();
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
      if (s.k > 0) requestAnimationFrame(() => el.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'nearest' }));
      for (const p of Texto.pistasDe(b.texto)) if (!J.cuaderno.includes(p)) { J.cuaderno.push(p); actualizarCuaderno(); }
      s.k++;
      if ((b.tipo === 'voz' && !b.superado) || (b.tipo === 'pregunta' && !b.resuelta)) return;
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
    return tarjetaPregunta(b);
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
    b.objetivo = []; b.intentos = 0;
    const html = limpio.split(/\s+/).filter(Boolean).map((t) => {
      const nrm = Voz.normalizar(t).join('');
      if (!nrm) return `<span class="signo">${esc(t)}</span>`;
      const k = b.objetivo.length; b.objetivo.push(nrm);
      return `<span class="palabra" data-k="${k}">${esc(t)}</span>`;
    }).join(' ');
    b.marcadas = b.objetivo.map(() => false);
    const sinMicro = E.ajustes.sinMicro || !Voz.disponible();

    const el = document.createElement('div');
    el.className = 'tarjeta-voz aparece';
    el.innerHTML = `
      <div class="voz-cabecera"><span class="voz-icono" aria-hidden="true">🎤</span> Lee en voz alta</div>
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
      J.estrellas++; J.leidas++; E.estrellas++; guardar(); $('#total-estrellas').textContent = E.estrellas;
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
        <button class="opcion" data-i="${i}">${o.icono ? `<span class="opcion-icono" aria-hidden="true">${o.icono}</span>` : ''}<span class="opcion-texto">${esc(o.texto)}</span></button>`).join('')}</div>
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
        if (fallos === 0) { J.estrellas++; E.estrellas++; guardar(); $('#total-estrellas').textContent = E.estrellas; msg.textContent = '⭐ ' + azar(ELOGIOS); }
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
          ${conocido ? `<span class="ficha-desc">${palabras(Texto.capitalizar(A.descripcion))}</span>` : ''}</li>`);
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
        <h2 class="titulo">Amigos del bosque</h2><ul class="rejilla rejilla-amigos">${amigos.join('')}</ul>
        <h2 class="titulo">Tesoros de ${esc(CAT.protagonistas.hermana)}</h2>
        <p class="pista-pequena">${esc(CAT.protagonistas.hermana)} encuentra cosas escondidas en los dibujos. ¡Hay que tocarlas!</p>
        <ul class="rejilla rejilla-tesoros">${tesoros.join('')}</ul>
      </section>`;
    $('#volver').onclick = pantallaInicio;
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
          <h2 class="titulo">Progreso</h2>
          <p class="nota">${E.estrellas} estrellas · ${Object.keys(E.album.pegatinas).length} pegatinas · ${Object.values(E.album.tesoros).reduce((x, y) => x + y, 0)} tesoros encontrados.</p>
          <button class="boton boton-peligro" id="borrar">Borrar todo el progreso</button>
        </div>
      </section>`;
    $('#volver').onclick = pantallaInicio;
    $$('[data-nivel]').forEach((b) => b.onclick = () => { E.nivel = b.dataset.nivel; guardar(); pantallaAjustes(); });
    $$('[data-ajuste]').forEach((b) => b.onclick = () => { a[b.dataset.ajuste] = b.dataset.valor; guardar(); aplicarAjustes(); pantallaAjustes(); });
    $$('[data-interruptor]').forEach((i) => i.onchange = () => { a[i.dataset.interruptor] = i.checked; guardar(); aplicarAjustes(); });
    let confirmar = false;
    $('#borrar').onclick = (ev) => {
      if (!confirmar) { confirmar = true; ev.currentTarget.textContent = 'Seguro: toca otra vez para borrarlo'; return; }
      const perfil = E.perfil; E = estadoInicial(); E.perfil = perfil; guardar(); aplicarAjustes();
      aviso('Progreso borrado. La ropa y la mascota se quedan igual.');
      pantallaAjustes();
    };
  }

  // ───────── Arranque ─────────
  async function iniciar() {
    aplicarAjustes();
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
  }

  // Para pruebas desde la consola
  window.Juego = { get estado() { return E; }, get catalogo() { return CAT; }, prepararPartida };
  iniciar();
})();
