/* ──────────────────────────────────────────────────────────────
   PARTIDA · Escenas, cerraduras mágicas, lectura en voz alta, preguntas
   y final del capítulo
   Los archivos de js/juego/ comparten nombres entre sí (E, J, CAT, aviso,
   palabras…): se cargan en orden desde index.html y forman un solo juego.
   ────────────────────────────────────────────────────────────── */
'use strict';

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
      fecha: Date.now(), libro: libro.id, cap: cap.id, titulo: tituloCap(cap), nivel: E.nivel,
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
      <div class="titulo-cap"><span class="sobretitulo">Capítulo ${J.capIndex + 1}</span><span class="nombre-cap">${esc(tituloCap(J.cap))}</span></div>`)}
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
