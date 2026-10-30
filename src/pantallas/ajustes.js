/**
 * @file «Para mayores»: nivel, letra, micrófono, meta, voces, pasar el progreso,
 * copia de seguridad y borrar.
 *
 * Capa: pantallas. Navega a: inicio, informe. Se entra manteniendo pulsado el
 * botón «Mayores» de la casa.
 *
 * Cada bloque de ajustes es una función que devuelve su HTML; los eventos se
 * conectan al final en {@link conectar}. Para añadir un ajuste nuevo:
 *   1. Dale valor por defecto en estadoInicial() (src/estado/almacen.js).
 *   2. Añade su control aquí (chipsAjuste o interruptor ya guardan solos).
 *   3. Si cambia algo visual, aplícalo en src/ui/ajustes-visuales.js.
 */
import { estado, guardar, reemplazarEstado } from '../estado/sesion.js';
import { estadoInicial } from '../estado/almacen.js';
import { NIVELES, TOLERANCIAS, METAS, META_INICIAL, NOMBRES_TAMANO, NOMBRES_VELOCIDAD } from '../config/index.js';
import * as Voz from '../servicios/voz/index.js';
import * as Grabaciones from '../servicios/grabaciones.js';
import { almacenamientoPersistente, instalada, esIOS } from '../servicios/plataforma.js';
import { $, $$, esc, descargar, confirmarConSegundoToque } from '../util/dom.js';
import { fechaLarga } from '../util/fechas.js';
import { protagonistas } from '../dominio/protagonistas.js';
import { codificarProgreso, decodificarProgreso, fusionarProgreso, crearCopiaDeSeguridad, recuperarCopiaDeSeguridad } from '../dominio/transferencia.js';
import { app, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera, botonVolver } from '../ui/cabecera.js';
import { palabras } from '../ui/palabras.js';
import { aviso } from '../ui/avisos.js';
import { aplicarAjustes } from '../ui/ajustes-visuales.js';
import { chipsAjuste, interruptor } from '../ui/componentes/opciones.js';
import { htmlGrabaciones, htmlSugerenciasGrabar, activarGrabaciones } from '../ui/componentes/grabaciones.js';
import { copiarOMostrar } from '../ui/componentes/copiar.js';

/** Convierte {clave: {nombre}} en {clave: nombre} para los chips. */
const nombresDe = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v.nombre]));

/** Explica si el progreso puede borrarse solo en este navegador. */
function estadoGuardado() {
  if (esIOS() && !instalada()) return 'En iPad, Safari puede borrarlo si pasan unas semanas sin abrir la web: instálala en la pantalla de inicio (Compartir → «Añadir a pantalla de inicio») para que no ocurra.';
  if (almacenamientoPersistente()) return 'Este navegador ha prometido no borrarlo.';
  return 'No se borra salvo que se limpien los datos del navegador.';
}

function textoMicro() {
  if (!Voz.soportado) return 'Este navegador no reconoce la voz. En el portátil usad Chrome o Edge; en el iPad, Safari. Mientras tanto, el juego usa el botón «¡Ya lo he leído!».';
  if (Voz.estaBloqueado()) return 'El micro está bloqueado en esta página. Dale permiso en el candado de la barra de direcciones.';
  return 'El micro funciona en este navegador. La primera vez pedirá permiso.';
}

function opcionesDeVoz() {
  const voces = Voz.voces();
  if (!voces.length) return '<option value="">La del dispositivo</option>';
  const actual = estado.ajustes.voz || '', auto = Voz.nombreAutomatica();
  return `<option value="">Automática${auto ? ` (${esc(auto)})` : ''}</option>` +
    voces.map((v) => `<option value="${esc(v.name)}"${v.name === actual ? ' selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('');
}

// ───────── Bloques ─────────

const bloque = (titulo, cuerpo) => `<div class="ajuste-bloque"><h2 class="titulo">${titulo}</h2>${cuerpo}</div>`;
const filaBotones = (html) => `<div class="barra-botones" style="justify-content:flex-start;margin-top:0">${html}</div>`;

const bloqueNivel = () => bloque('Nivel de lectura', `<div class="niveles">${NIVELES.map((n) => `<button class="nivel-carta${n.id === estado.nivel ? ' elegida' : ''}" data-nivel="${n.id}" aria-pressed="${n.id === estado.nivel}">
  <span class="insignia-nivel">${n.icono}</span><b>${n.nombre}</b><span>${n.desc}</span></button>`).join('')}</div>`);

const bloqueLetra = (a) => bloque('Letra', `
  <div class="chips">${chipsAjuste('tamano', NOMBRES_TAMANO, a.tamano)}</div>
  <p class="texto muestra-texto linea">${palabras('Así se verán los textos del cuento.')}</p>
  ${interruptor('resaltar', 'Resaltar la línea al tocar una palabra', a.resaltar)}
  ${interruptor('silabas', 'Sílabas de colores (ma·ri·po·sa)', a.silabas)}
  ${interruptor('regla', 'Regla de lectura: atenuar las demás líneas', a.regla)}
  <p class="nota">Tocar una palabra la lee. Tocarla otra vez enseguida la lee <b>por sílabas</b>.</p>`);

const bloqueMicro = (a) => bloque('Micrófono', `
  <p class="nota">${esc(textoMicro())}</p>
  <p class="etiqueta-opcion">Cuánto perdona los errores</p>
  <div class="chips">${chipsAjuste('tolerancia', nombresDe(TOLERANCIAS), a.tolerancia)}</div>
  ${interruptor('sinMicro', 'Jugar sin micrófono (botón «¡Ya lo he leído!»)', a.sinMicro)}
  ${interruptor('sonido', 'Sonidos del juego', a.sonido)}`);

const bloqueMeta = (a) => bloque('Meta de cada día', `
  <p class="nota">Al cumplirla gana 3 estrellas. Si la cumple 5 días en una semana, abre un cofre con 15 más. Saltarse un día no rompe la racha.</p>
  <div class="chips">${chipsAjuste('meta', nombresDe(METAS), a.meta || META_INICIAL)}</div>`);

const bloqueGrabaciones = () => bloque('Tu voz para las palabras difíciles', `
  <p class="nota">Graba cómo dices una palabra y, cuando ${esc(protagonistas().lectora)} la toque, sonará con tu voz. Las grabaciones se quedan en este dispositivo.</p>
  ${Grabaciones.soportado() ? `
  <div class="fila-voz">
    <label class="etiqueta-opcion" for="palabra-grabar">Palabra</label>
    <input id="palabra-grabar" class="selector" maxlength="20" autocomplete="off" placeholder="mariposa">
    <button class="boton boton-principal boton-chico" id="grabar-nueva">🎙️ Grabar</button>
  </div>
  ${htmlSugerenciasGrabar()}
  <div id="lista-grabaciones">${htmlGrabaciones()}</div>` : '<p class="nota">Este navegador no permite grabar. Prueba con Chrome, Edge o Safari actualizados.</p>'}`);

const bloqueVoz = (a) => bloque('Voz que lee las palabras', `
  <p class="nota">Es la voz que suena al tocar una palabra o al pulsar «Escuchar». Cada dispositivo tiene sus propias voces: elige la que suene más natural.</p>
  <div class="fila-voz">
    <label class="etiqueta-opcion" for="aj-voz">Voz</label>
    <select id="aj-voz" class="selector">${opcionesDeVoz()}</select>
    <button class="boton boton-suave boton-chico" id="probar-voz">🔊 Probar</button>
  </div>
  <p class="etiqueta-opcion">Velocidad</p>
  <div class="chips">${chipsAjuste('velocidad', NOMBRES_VELOCIDAD, a.velocidad || 'normal')}</div>`);

const bloqueTransferencia = () => bloque('Pasar el progreso a otro dispositivo', `
  <p class="nota">Si juega en la tablet y en el portátil, copia aquí el código y pégalo en el otro. Se juntan los dos progresos (estrellas, capítulos, álbum, informe y palabras), no se borra nada.</p>
  ${filaBotones('<button class="boton boton-suave" id="copiar-codigo">📋 Copiar el código de este dispositivo</button>')}
  <label class="etiqueta-opcion" for="pegar-codigo">Pegar el código del otro dispositivo</label>
  <textarea id="pegar-codigo" class="resumen-copia" rows="3" placeholder="BM1:…" spellcheck="false"></textarea>
  <div><button class="boton boton-principal" id="juntar">Juntar progresos</button></div>`);

const bloqueCopia = () => bloque('Copia de seguridad', `
  <p class="nota">El progreso se guarda solo en este navegador. ${estadoGuardado()} Guarda de vez en cuando una copia en un archivo (en Drive, iCloud o el ordenador) por si se borra.</p>
  <p class="nota"><b>Última copia:</b> ${estado.ultimaCopia ? fechaLarga(estado.ultimaCopia) : 'nunca'}</p>
  ${filaBotones(`<button class="boton boton-principal" id="descargar-copia">💾 Guardar copia en un archivo</button>
    <label class="boton boton-suave" for="cargar-copia">📂 Recuperar desde un archivo</label>
    <input type="file" id="cargar-copia" accept=".json,application/json" hidden>`)}`);

const bloqueBorrar = () => bloque('Progreso', `
  <p class="nota">${estado.estrellas} estrellas · ${Object.keys(estado.album.pegatinas).length} pegatinas · ${Object.values(estado.album.tesoros).reduce((x, y) => x + y, 0)} tesoros encontrados.</p>
  <button class="boton boton-peligro" id="borrar">Borrar todo el progreso</button>`);

// ───────── Eventos ─────────

/** Junta un progreso de fuera, guarda, avisa y repinta. */
function juntarYAvisar(otro, mensaje, ms) {
  fusionarProgreso(otro); guardar(); aplicarAjustes();
  aviso(mensaje, ms);
  pantallaAjustes();
}

function conectar() {
  const a = estado.ajustes;
  $('#volver').onclick = irA('inicio');
  $('#ver-informe').onclick = irA('informe');
  $$('[data-nivel]').forEach((b) => { b.onclick = () => { estado.nivel = b.dataset.nivel; guardar(); pantallaAjustes(); }; });
  $$('[data-ajuste]').forEach((b) => { b.onclick = () => { a[b.dataset.ajuste] = b.dataset.valor; guardar(); aplicarAjustes(); pantallaAjustes(); }; });
  $$('[data-interruptor]').forEach((i) => { i.onchange = () => { a[i.dataset.interruptor] = i.checked; guardar(); aplicarAjustes(); }; });
  activarGrabaciones(pantallaAjustes);
  $('#aj-voz').onchange = (ev) => { a.voz = ev.target.value; guardar(); aplicarAjustes(); Voz.hablar('¡Hola! Así sueno yo.'); };
  $('#probar-voz').onclick = () => Voz.hablar(`${protagonistas().lectora} busca una mariposa azul.`);

  $('#copiar-codigo').onclick = async () => copiarOMostrar(await codificarProgreso(), {
    titulo: 'Código de progreso', idCaja: 'codigo-copia', exito: 'Código copiado. Pégalo en el otro dispositivo.', soloLectura: true
  });
  $('#juntar').onclick = async () => {
    const txt = $('#pegar-codigo').value.trim();
    if (!txt) { aviso('Primero pega el código del otro dispositivo.'); return; }
    try { juntarYAvisar(await decodificarProgreso(txt), '¡Progresos juntados!'); } catch (e) { console.error(e); aviso('Ese código no es válido. Cópialo entero otra vez.', 5000); }
  };

  $('#descargar-copia').onclick = () => {
    const { blob, nombre } = crearCopiaDeSeguridad();
    descargar(blob, nombre);
    guardar();
    aviso('💾 Copia guardada. Búscala en Descargas.'); pantallaAjustes();
  };
  $('#cargar-copia').onchange = async (ev) => {
    const archivo = ev.target.files && ev.target.files[0];
    if (!archivo) return;
    try { recuperarCopiaDeSeguridad(await archivo.text()); } catch (e) { console.error(e); aviso('Ese archivo no es una copia de La biblioteca mágica.', 5000); return; }
    guardar(); aplicarAjustes();
    aviso('📂 Copia recuperada. Se ha juntado con el progreso de este dispositivo.', 5000);
    pantallaAjustes();
  };

  confirmarConSegundoToque($('#borrar'), {
    pregunta: 'Seguro: toca otra vez para borrarlo',
    restaurar: false,
    alConfirmar: () => {
      const perfil = estado.perfil;
      reemplazarEstado(estadoInicial());
      estado.perfil = perfil; guardar(); aplicarAjustes();
      aviso('Progreso borrado. La ropa y la mascota se quedan igual.');
      pantallaAjustes();
    }
  });
}

function pantallaAjustes() {
  const a = estado.ajustes;
  app.innerHTML = `
    ${cabecera(botonVolver())}
    <section class="ajustes">
      <h1 class="titulo-grande">Para mayores</h1>
      <button class="boton boton-principal boton-informe" id="ver-informe">📊 Ver el informe de lectura</button>
      ${bloqueNivel()}${bloqueLetra(a)}${bloqueMicro(a)}${bloqueMeta(a)}${bloqueGrabaciones()}${bloqueVoz(a)}${bloqueTransferencia()}${bloqueCopia()}${bloqueBorrar()}
    </section>`;
  conectar();
}

registrarPantalla('ajustes', pantallaAjustes);
