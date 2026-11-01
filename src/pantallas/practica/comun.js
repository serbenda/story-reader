/**
 * @file Piezas comunes de las actividades de «Practicar»: cabecera, progreso,
 * sesión (para el informe y la meta del día) y pantalla final.
 *
 * Capa: pantallas (practica). Cada actividad abre una sesión al empezar y la
 * cierra al terminar o al salir; así el tiempo cuenta para la meta del día
 * aunque no se acabe.
 */
import { ESTRELLAS } from '../../config/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { $ } from '../../util/dom.js';
import { empezarSesion, marcarSesionAbierta, terminarSesion } from '../../dominio/practica.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { app, ir, irA } from '../../ui/navegacion.js';
import { cabecera } from '../../ui/cabecera.js';
import { palabras } from '../../ui/palabras.js';
import { confeti } from '../../ui/avisos.js';
import { comprobarYCelebrarMeta } from '../../ui/componentes/meta.js';

/**
 * Abre una sesión de práctica y la marca como abierta (cuenta para la meta en vivo).
 * @param {import('../../estado/almacen.js').Practica['tipo']} tipo
 * @returns {import('../../dominio/practica.js').SesionPractica}
 */
export function abrirSesion(tipo) {
  const s = empezarSesion(tipo);
  marcarSesionAbierta(s);
  return s;
}

/**
 * Cierra la sesión (la guarda si se hizo algo) y comprueba la meta del día.
 * @param {import('../../dominio/practica.js').SesionPractica} s
 */
export function cerrarSesion(s) {
  terminarSesion(s);
  comprobarYCelebrarMeta();
}

/**
 * Apunta un ejercicio hecho; si fue a la primera, estrella. No guarda (guarda cerrarSesion).
 * @param {import('../../dominio/practica.js').SesionPractica} s
 * @param {boolean} aLaPrimera
 */
export function contarEjercicio(s, aLaPrimera) {
  s.total++;
  if (aLaPrimera) { s.primera++; ganarEstrellas(ESTRELLAS.practica); }
}

/**
 * Pinta el marco de una actividad y devuelve el contenedor del ejercicio.
 * El botón «← Practicar» cierra la sesión y vuelve al menú.
 * @param {object} o
 * @param {string} o.titulo
 * @param {string} o.icono
 * @param {import('../../dominio/practica.js').SesionPractica} o.sesion
 * @param {string} [o.extra]  HTML bajo el título (por ejemplo, un interruptor).
 * @returns {HTMLElement}
 */
export function marcoActividad({ titulo, icono, sesion, extra = '' }) {
  app.innerHTML = `
    ${cabecera('<button class="boton boton-suave boton-chico" id="volver">← Practicar</button>')}
    <section class="practica-actividad">
      <h1 class="titulo-grande"><span aria-hidden="true">${icono}</span> ${palabras(titulo)}</h1>
      ${extra}
      <div class="pasos" id="pasos-practica" aria-hidden="true"></div>
      <div id="ejercicio" class="ejercicio texto"></div>
    </section>`;
  $('#volver').onclick = () => { cerrarSesion(sesion); ir('practica'); };
  return $('#ejercicio');
}

/**
 * Marca el progreso (puntos) de la sesión.
 * @param {number} hechos
 * @param {number} total
 */
export function pintarProgreso(hechos, total) {
  const p = $('#pasos-practica');
  if (p) p.innerHTML = Array.from({ length: total }, (_, i) => `<span class="${i < hechos ? 'hecho' : i === hechos ? 'activo' : ''}"></span>`).join('');
}

/**
 * Pantalla de fin de sesión con lo conseguido.
 * @param {object} o
 * @param {import('../../dominio/practica.js').SesionPractica} o.sesion
 * @param {string} o.mensaje
 * @param {string} o.otraVez   Nombre de la pantalla para repetir.
 * @param {string} [o.detalle] HTML extra (por ejemplo, la gráfica de velocidad).
 */
export function pintarFinSesion({ sesion, mensaje, otraVez, detalle = '' }) {
  cerrarSesion(sesion);
  Sonido.tocar('fin'); confeti(60);
  const cont = $('#ejercicio');
  cont.innerHTML = `
    <div class="fin-practica">
      <div class="pegatina-grande nueva" aria-hidden="true">🌟</div>
      <p class="linea">${palabras(mensaje)}</p>
      ${sesion.total ? `<div class="resumen-final"><div><b>${sesion.primera}</b><span>⭐ a la primera</span></div><div><b>${sesion.total}</b><span>✍️ hechos</span></div></div>` : ''}
      ${detalle}
      <div class="barra-botones centrada">
        <button class="boton boton-principal boton-grande" id="otra-vez">🔁 Otra vez</button>
        <button class="boton boton-suave" id="a-practicar">🪄 Practicar otra cosa</button>
      </div>
    </div>`;
  $('#otra-vez').onclick = irA(otraVez);
  $('#a-practicar').onclick = irA('practica');
  const p = $('#pasos-practica'); if (p) p.hidden = true;
}
