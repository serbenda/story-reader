/**
 * @file Navegación entre pantallas.
 *
 * Capa: ui. Cada pantalla (src/pantallas/) se registra con un nombre y las
 * demás la abren con `ir('nombre', ...argumentos)`. Así las pantallas no se
 * importan entre sí (no hay dependencias circulares) y añadir una pantalla
 * nueva es: crear el archivo, registrarla y añadirla a src/pantallas/index.js.
 *
 * Nombres registrados hoy: bienvenida, personalizar, inicio, libro, tienda,
 * album, ajustes, informe, partida.
 */

/** Contenedor donde se pinta la pantalla actual (<main id="app">). */
export const app = /** @type {HTMLElement} */ (document.getElementById('app'));

/** @type {Map<string, (...args: any[]) => void>} */
const pantallas = new Map();
let actual = '';

/**
 * Registra una pantalla.
 * @param {string} nombre
 * @param {(...args: any[]) => void} mostrar  Pinta la pantalla en {@link app}.
 */
export function registrarPantalla(nombre, mostrar) {
  if (pantallas.has(nombre)) throw new Error(`La pantalla «${nombre}» ya está registrada.`);
  pantallas.set(nombre, mostrar);
}

/**
 * Abre una pantalla.
 * @param {string} nombre
 * @param {...any} args  Se pasan tal cual a la pantalla.
 */
export function ir(nombre, ...args) {
  const mostrar = pantallas.get(nombre);
  if (!mostrar) throw new Error(`No existe la pantalla «${nombre}».`);
  actual = nombre;
  mostrar(...args);
}

/**
 * Atajo para botones: `boton.onclick = irA('inicio')`.
 * @param {string} nombre
 * @param {...any} args
 * @returns {() => void}
 */
export const irA = (nombre, ...args) => () => ir(nombre, ...args);

/** Nombre de la pantalla que se ve ahora. */
export const pantallaActual = () => actual;
