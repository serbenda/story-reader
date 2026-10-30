/**
 * @file Carga todos los libros desde la carpeta stories/.
 *
 * Capa: contenido. Estructura:
 *   stories/index.json        → protagonistas, mascotas y lista de libros
 *   stories/<libro>/libro.md  → el mundo: lugares, ayudantes, tesoros…
 *   stories/<libro>/cap-XX.md → escenas del capítulo (ver ./escenas.js)
 *
 * Si la página trae los archivos dentro (`window.__EMBEBIDO__`, la versión de
 * un solo archivo), se usan esos en vez de pedirlos a la red.
 */
import { separarCabecera, parsearEscenas } from './escenas.js';

/** Carpeta de los cuentos, relativa a index.html. */
export const CARPETA_CUENTOS = 'stories/';

/** Nombres por defecto si index.json no trae «protagonistas». */
const PROTAGONISTAS_POR_DEFECTO = Object.freeze({ lectora: 'Alaia', hermana: 'Lucía' });

/**
 * @typedef {object} Capitulo
 * @property {string} id       Nombre del archivo sin «.md» («cap-01»).
 * @property {string} archivo
 * @property {Record<string, any>} meta  Cabecera YAML: titulo, resumen, pegatina, lugares, ayudantes, buscamos…
 * @property {import('./escenas.js').Escena[]} escenas
 */

/**
 * @typedef {object} Libro
 * @property {string} id
 * @property {Record<string, any>} meta  Cabecera de libro.md: titulo, portada, lugares, ayudantes, tesoros…
 * @property {string} descripcion        Cuerpo de libro.md.
 * @property {Capitulo[]} capitulos
 */

/**
 * @typedef {object} Especie
 * @property {string} emoji
 * @property {string} chico  «perro»
 * @property {string} chica  «perra»
 * @property {number} [precio]  Si tiene precio, se compra en la tienda.
 */

/**
 * @typedef {object} Catalogo
 * @property {{lectora: string, hermana: string}} protagonistas  Nombres por defecto.
 * @property {Record<string, Especie>} mascotas
 * @property {Libro[]} libros
 */

/**
 * Lee un archivo de texto (de la versión embebida o de la red, sin caché HTTP).
 * @param {string} ruta
 * @returns {Promise<string>}
 */
export async function leerTexto(ruta) {
  const embebido = window.__EMBEBIDO__;
  if (embebido && ruta in embebido) return embebido[ruta];
  const r = await fetch(ruta, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No encuentro el archivo ${ruta} (${r.status})`);
  return r.text();
}

/**
 * Carga un libro con todos sus capítulos.
 * @param {{id: string, carpeta?: string, capitulos: string[]}} entrada  Entrada de index.json.
 * @returns {Promise<Libro>}
 */
async function cargarLibro(entrada) {
  const base = `${CARPETA_CUENTOS}${entrada.carpeta || entrada.id}/`;
  const libro = separarCabecera(await leerTexto(base + 'libro.md'));
  const capitulos = await Promise.all(entrada.capitulos.map(async (archivo) => {
    const c = separarCabecera(await leerTexto(base + archivo));
    return { id: archivo.replace(/\.md$/, ''), archivo, meta: c.meta, escenas: parsearEscenas(c.cuerpo, archivo) };
  }));
  return { id: entrada.id, meta: libro.meta, descripcion: libro.cuerpo.trim(), capitulos };
}

/**
 * Carga el catálogo completo. Un libro con errores se salta (se avisa en la
 * consola) para que los demás sigan funcionando.
 * @returns {Promise<Catalogo>}
 * @throws {Error} Si no se puede cargar ningún libro.
 */
export async function cargarCatalogo() {
  const index = JSON.parse(await leerTexto(CARPETA_CUENTOS + 'index.json'));
  const resultados = await Promise.allSettled(index.libros.map(cargarLibro));
  const libros = [];
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') libros.push(r.value);
    else console.error(`No se ha podido cargar el libro «${index.libros[i].id}»:`, r.reason);
  });
  if (!libros.length) throw new Error('No se ha podido cargar ningún libro.');
  return { protagonistas: index.protagonistas || { ...PROTAGONISTAS_POR_DEFECTO }, mascotas: index.mascotas, libros };
}
