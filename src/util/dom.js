/**
 * @file Ayudas pequeñas para trabajar con el DOM.
 *
 * Capa: util (no importa nada del juego). Todo el HTML del juego se genera
 * con plantillas de texto: cualquier dato que venga del usuario o de un cuento
 * debe pasar por {@link esc} antes de meterse en una plantilla.
 */

/**
 * Primer elemento que encaja con el selector.
 * @param {string} selector
 * @param {ParentNode} [raiz=document]
 * @returns {HTMLElement|null}
 */
export const $ = (selector, raiz = document) => raiz.querySelector(selector);

/**
 * Todos los elementos que encajan con el selector, como array.
 * @param {string} selector
 * @param {ParentNode} [raiz=document]
 * @returns {HTMLElement[]}
 */
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapa un texto para meterlo sin peligro en HTML (contenido o atributo).
 * @param {unknown} texto
 * @returns {string}
 */
export const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c]);

/**
 * ¿Ha pedido la persona menos animaciones en su sistema?
 * @returns {boolean}
 */
export const movimientoReducido = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * Vuelve a lanzar una animación CSS quitando y poniendo la clase.
 * (Leer offsetWidth obliga al navegador a «olvidar» la animación anterior.)
 * @param {HTMLElement} el
 * @param {string} clase
 */
export function reanimar(el, clase) {
  el.classList.remove(clase);
  void el.offsetWidth;
  el.classList.add(clase);
}

/**
 * Lleva un elemento a la vista con suavidad (o de golpe si hay movimiento reducido).
 * @param {HTMLElement} el
 */
export const mostrarEnPantalla = (el) =>
  requestAnimationFrame(() => el.scrollIntoView({ behavior: movimientoReducido() ? 'auto' : 'smooth', block: 'nearest' }));

/**
 * Botón que pide un segundo toque para confirmar (en vez de un diálogo del navegador).
 * El primer toque cambia el texto; si no se vuelve a tocar en `ms`, se restaura.
 * @param {HTMLElement} boton
 * @param {object} opciones
 * @param {string} opciones.pregunta    HTML que se muestra tras el primer toque.
 * @param {() => void} opciones.alConfirmar
 * @param {number} [opciones.ms=3000]
 * @param {string} [opciones.clase]     Clase que se añade mientras espera confirmación.
 * @param {boolean} [opciones.restaurar=true] Si es false, el texto no vuelve solo.
 */
export function confirmarConSegundoToque(boton, { pregunta, alConfirmar, ms = 3000, clase, restaurar = true }) {
  let esperando = false, temporizador = null;
  boton.onclick = () => {
    if (esperando) { clearTimeout(temporizador); alConfirmar(); return; }
    esperando = true;
    const original = boton.innerHTML;
    boton.innerHTML = pregunta;
    if (clase) boton.classList.add(clase);
    if (!restaurar) return;
    temporizador = setTimeout(() => {
      esperando = false;
      if (!boton.isConnected) return;
      boton.innerHTML = original;
      if (clase) boton.classList.remove(clase);
    }, ms);
  };
}

/**
 * Ofrece un archivo para descargar.
 * @param {Blob} blob
 * @param {string} nombre  Nombre del archivo.
 */
export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
