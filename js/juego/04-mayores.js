/* ──────────────────────────────────────────────────────────────
   MAYORES · Álbum, pasar el progreso, grabar la voz de la familia,
   ajustes e informe de lectura
   Los archivos de js/juego/ comparten nombres entre sí (E, J, CAT, aviso,
   palabras…): se cargan en orden desde index.html y forman un solo juego.
   ────────────────────────────────────────────────────────────── */
'use strict';

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
      pegatinas.push(`<li class="pegatina${p ? '' : ' oculta'}"><span class="emoji">${p || '❔'}</span><span class="ficha-nombre">${p ? esc(tituloCap(c)) : `Capítulo ${i + 1}`}</span></li>`);
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
