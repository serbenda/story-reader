/**
 * @file Bus de eventos mínimo (publicar / suscribirse).
 *
 * Capa: util. Sirve para que la lógica del juego (src/dominio) avise de cosas
 * sin saber nada de la pantalla: por ejemplo, el dominio emite
 * «estrellas-cambiadas» y la cabecera (src/ui) se suscribe para animar el
 * contador. Así la lógica se puede probar sin DOM.
 *
 * Eventos que existen hoy (busca `emitir(` para ver quién los lanza):
 *   - 'estrellas-cambiadas' → { saldo: number }
 */

/** @type {Map<string, Set<(datos: any) => void>>} */
const oyentes = new Map();

/**
 * Se suscribe a un evento.
 * @param {string} nombre
 * @param {(datos: any) => void} fn
 * @returns {() => void} Función para darse de baja.
 */
export function escuchar(nombre, fn) {
  if (!oyentes.has(nombre)) oyentes.set(nombre, new Set());
  oyentes.get(nombre).add(fn);
  return () => oyentes.get(nombre).delete(fn);
}

/**
 * Avisa a todos los suscritos. Un oyente que falla no impide que lo oigan los demás.
 * @param {string} nombre
 * @param {any} [datos]
 */
export function emitir(nombre, datos) {
  for (const fn of oyentes.get(nombre) || []) {
    try { fn(datos); } catch (e) { console.error(`Error al atender «${nombre}»:`, e); }
  }
}
