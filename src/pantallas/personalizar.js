/**
 * @file Elegir y vestir a las protagonistas y a la mascota, paso a paso.
 *
 * Capa: pantallas. Navega a: inicio.
 *
 * Pasos: «quien» (una o dos niñas y sus nombres) → «lectora» → «hermana»
 * (solo si son dos) → «mascota». Los cambios se hacen sobre un borrador que
 * solo se guarda al pulsar «¡Listo!»; «Cancelar» lo descarta.
 */
import { estado, catalogo, guardar } from '../estado/sesion.js';
import { APARIENCIA, ESTAMPADO_LISO, NOMBRES_MASCOTA, LARGO_NOMBRE, perfilPorDefecto } from '../config/index.js';
import * as Arte from '../arte/index.js';
import * as Sonido from '../servicios/sonido.js';
import { $, $$, esc } from '../util/dom.js';
import { mascotaDisponible } from '../dominio/tienda.js';
import { app, ir, registrarPantalla } from '../ui/navegacion.js';
import { palabras } from '../ui/palabras.js';
import { aviso, confeti } from '../ui/avisos.js';
import { muestras, chipsConTienda } from '../ui/componentes/opciones.js';

/** Perfil que se está editando (copia; no se guarda hasta «¡Listo!»). @type {import('../estado/almacen.js').Perfil|null} */
let borrador = null;
let primeraVez = false;

/** Solo letras, espacios, apóstrofo y guion; sin espacios al principio; con el largo máximo. */
const limpiarNombre = (t) => String(t || '').replace(/[^\p{L}\s'-]/gu, '').replace(/\s+/g, ' ').trimStart().slice(0, LARGO_NOMBRE.nina);
const conMayuscula = (t) => { t = String(t || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };

/** Pasos según haya una o dos niñas. */
const pasosDe = (dos) => (dos ? ['quien', 'lectora', 'hermana', 'mascota'] : ['quien', 'lectora', 'mascota']);

// ───────── Contenido de cada paso ─────────

function pasoQuien(dos) {
  const nom = borrador.nombres;
  return {
    titulo: '¿Quién protagoniza los cuentos?',
    vista: `<div class="vista-quien">
      <div class="mini-nina">${Arte.nina(borrador.alaya, 'largo')}<span class="nombre-mascota" id="vista-lectora">${esc(nom.lectora || '…')}</span></div>
      ${dos ? `<div class="mini-nina peque">${Arte.nina(borrador.lucia, 'coletas')}<span class="nombre-mascota" id="vista-hermana">${esc(nom.hermana || '…')}</span></div>` : ''}
    </div>`,
    opciones: `
      <div class="fila-opcion"><span class="etiqueta-opcion">¿Cuántas niñas?</span><div class="chips">
        <button class="chip chip-grande${!dos ? ' elegida' : ''}" data-ninas="1" aria-pressed="${!dos}">👧 Una</button>
        <button class="chip chip-grande${dos ? ' elegida' : ''}" data-ninas="2" aria-pressed="${dos}">👧👧 Dos hermanas</button></div></div>
      <div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-lectora">${dos ? 'La que lee (la mayor)' : 'Se llama'}</label>
        <input id="nombre-lectora" class="campo-nombre" maxlength="${LARGO_NOMBRE.nina}" autocomplete="off" value="${esc(nom.lectora)}"></div>
      ${dos ? `<div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-hermana">Su hermana pequeña</label>
        <input id="nombre-hermana" class="campo-nombre" maxlength="${LARGO_NOMBRE.nina}" autocomplete="off" value="${esc(nom.hermana)}"></div>` : ''}
      <p class="nota">Los cuentos usarán estos nombres. ${dos ? '' : 'Con una sola niña, los cuentos se cuentan solo con ella.'}</p>`
  };
}

/** @param {'lectora'|'hermana'} tipo */
function pasoNina(tipo) {
  const quien = tipo === 'lectora' ? 'alaya' : 'lucia';
  const c = borrador[quien];
  const pelos = Object.entries(APARIENCIA.pelo);
  return {
    titulo: `¿Cómo es ${borrador.nombres[tipo]}?`,
    vista: `<div class="vista-nina">${Arte.nina(c, quien === 'alaya' ? 'largo' : 'coletas')}</div>`,
    opciones: `
      <div class="fila-opcion"><span class="etiqueta-opcion">Piel</span><div class="muestras">${muestras('piel', APARIENCIA.piel, c.piel)}</div></div>
      <div class="fila-opcion"><span class="etiqueta-opcion">Pelo</span><div class="muestras">${muestras('pelo', pelos.map((p) => p[1]), c.pelo, pelos.map((p) => p[0]))}</div></div>
      <div class="fila-opcion"><span class="etiqueta-opcion">Ropa</span><div class="muestras">${muestras('vestido', APARIENCIA.vestido, c.vestido)}</div></div>
      <div class="fila-opcion"><span class="etiqueta-opcion">Estampado</span><div class="chips">${chipsConTienda('estampado', ESTAMPADO_LISO, c.estampado || 'liso')}</div></div>
      <div class="fila-opcion"><span class="etiqueta-opcion">Complemento</span><div class="chips">${chipsConTienda('accesorio', APARIENCIA.accesorio, c.accesorio)}</div></div>`
  };
}

function pasoMascota(dos) {
  const m = borrador.mascota;
  const esp = catalogo.mascotas[m.especie] || Object.values(catalogo.mascotas)[0];
  const chip = ([k, e]) => {
    const texto = `<span class="emoji">${e.emoji}</span>${esc(m.genero === 'chica' ? e.chica : e.chico)}`;
    return mascotaDisponible(k)
      ? `<button class="chip chip-animal${m.especie === k ? ' elegida' : ''}" data-campo="especie" data-valor="${k}" aria-pressed="${m.especie === k}">${texto}</button>`
      : `<button class="chip chip-animal chip-bloqueada" data-bloqueado="${e.precio}">${texto}<span class="candado">🔒 ${e.precio}</span></button>`;
  };
  return {
    titulo: dos ? '¿Cómo es vuestra mascota?' : '¿Cómo es tu mascota?',
    vista: `<div class="vista-mascota"><span class="emoji-grande">${esp.emoji}</span><span class="nombre-mascota">${esc(m.nombre || '…')}</span></div>`,
    opciones: `
      <div class="fila-opcion"><span class="etiqueta-opcion">Animal</span><div class="chips">${Object.entries(catalogo.mascotas).map(chip).join('')}</div></div>
      <div class="fila-opcion"><span class="etiqueta-opcion">¿Chico o chica?</span><div class="chips">
        <button class="chip${m.genero === 'chico' ? ' elegida' : ''}" data-campo="genero" data-valor="chico">Chico</button>
        <button class="chip${m.genero === 'chica' ? ' elegida' : ''}" data-campo="genero" data-valor="chica">Chica</button></div></div>
      <div class="fila-opcion"><label class="etiqueta-opcion" for="nombre-mascota">¿Cómo se llama?</label>
        <input id="nombre-mascota" class="campo-nombre" maxlength="${LARGO_NOMBRE.mascota}" autocomplete="off" value="${esc(m.nombre)}">
        <div class="chips chips-nombres">${NOMBRES_MASCOTA.map((nm) => `<button class="chip chip-peque" data-campo="nombre" data-valor="${nm}">${nm}</button>`).join('')}</div></div>`
  };
}

// ───────── Validación al pasar de paso ─────────

/** @returns {boolean} true si los nombres son válidos (y los deja con mayúscula). */
function validarNombres(dos) {
  const l = conMayuscula(borrador.nombres.lectora), h = conMayuscula(borrador.nombres.hermana);
  if (!l) { aviso('Escribe el nombre de la niña que lee.'); $('#nombre-lectora').focus(); return false; }
  if (dos && !h) { aviso('Escribe el nombre de su hermana.'); $('#nombre-hermana').focus(); return false; }
  if (dos && l.toLowerCase() === h.toLowerCase()) { aviso('Las dos niñas necesitan nombres distintos.'); return false; }
  borrador.nombres.lectora = l;
  if (h) borrador.nombres.hermana = h;
  return true;
}

/** Guarda el perfil y vuelve a casa. */
function terminar() {
  const nombre = (borrador.mascota.nombre || '').trim();
  if (!nombre) { aviso('Escribe un nombre para la mascota.'); $('#nombre-mascota')?.focus(); return; }
  borrador.mascota.nombre = conMayuscula(nombre);
  estado.perfil = borrador; borrador = null; guardar();
  Sonido.tocar('bien'); confeti(30);
  ir('inicio');
}

// ───────── Pintar un paso ─────────

/** @param {number} paso */
function pintarPaso(paso) {
  const dos = borrador.ninas !== 1;
  const pasos = pasosDe(dos);
  paso = Math.max(0, Math.min(paso, pasos.length - 1));
  const tipo = pasos[paso], ultimo = paso === pasos.length - 1;
  const { titulo, vista, opciones } = tipo === 'quien' ? pasoQuien(dos) : tipo === 'mascota' ? pasoMascota(dos) : pasoNina(tipo);

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
    borrador.ninas = +b.dataset.ninas; Sonido.tocar('pagina'); pintarPaso(0);
  }));
  $$('[data-campo]').forEach((b) => b.addEventListener('click', () => {
    const { campo, valor } = b.dataset;
    if (tipo === 'lectora') borrador.alaya[campo] = valor;
    else if (tipo === 'hermana') borrador.lucia[campo] = valor;
    else borrador.mascota[campo] = valor;
    Sonido.tocar('pagina');
    pintarPaso(paso);
    if (campo === 'nombre') $('#nombre-mascota')?.focus();
  }));
  for (const [id, clave, vistaId] of [['#nombre-lectora', 'lectora', '#vista-lectora'], ['#nombre-hermana', 'hermana', '#vista-hermana']]) {
    const campo = $(id);
    campo?.addEventListener('input', () => {
      const limpio = limpiarNombre(campo.value);
      if (limpio !== campo.value) campo.value = limpio;
      borrador.nombres[clave] = limpio;
      const v = $(vistaId); if (v) v.textContent = limpio || '…';
    });
  }
  const campoMascota = $('#nombre-mascota');
  campoMascota?.addEventListener('input', () => {
    borrador.mascota.nombre = campoMascota.value.replace(/[^\p{L}\s-]/gu, '').slice(0, LARGO_NOMBRE.mascota);
    $('.nombre-mascota').textContent = borrador.mascota.nombre || '…';
  });
  const atras = $('#atras'); if (atras) atras.onclick = () => pintarPaso(paso - 1);
  const cancelar = $('#cancelar'); if (cancelar) cancelar.onclick = () => { borrador = null; ir('inicio'); };
  $('#siguiente').onclick = () => {
    if (tipo === 'quien' && !validarNombres(dos)) return;
    if (!ultimo) return pintarPaso(paso + 1);
    terminar();
  };
}

/**
 * @param {object} [opciones]
 * @param {boolean} [opciones.primeraVez=false]  Sin botón «Cancelar» (aún no hay perfil al que volver).
 */
function pantallaPersonalizar({ primeraVez: esPrimera = false } = {}) {
  primeraVez = esPrimera;
  borrador = JSON.parse(JSON.stringify(estado.perfil || perfilPorDefecto(catalogo.protagonistas)));
  const def = perfilPorDefecto(catalogo.protagonistas);
  borrador.ninas = borrador.ninas === 1 ? 1 : 2;
  borrador.nombres = Object.assign({}, def.nombres, borrador.nombres || {});
  pintarPaso(0);
}

registrarPantalla('personalizar', pantallaPersonalizar);
