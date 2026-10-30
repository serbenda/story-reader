/* ──────────────────────────────────────────────────────────────
   PORTADA · Bienvenida, elegir y vestir a las protagonistas, meta del día,
   tienda, estantería y pantalla de cada libro
   Los archivos de js/juego/ comparten nombres entre sí (E, J, CAT, aviso,
   palabras…): se cargan en orden desde index.html y forman un solo juego.
   ────────────────────────────────────────────────────────────── */
'use strict';

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
        <span class="cap-texto"><span class="cap-titulo">${esc(tituloCap(cap))}</span>
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
