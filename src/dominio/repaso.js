/**
 * @file Calentamiento de «palabras mágicas» al empezar un capítulo.
 *
 * Capa: dominio. Si hay palabras que le cuestan, el capítulo empieza con una
 * escena extra para leerlas, adaptada al nivel:
 *   Aprendiz     → 2–3 palabras sueltas
 *   Novatilla    → 3–4 palabras sueltas
 *   Lectora      → una frase de los cuentos que contiene una de ellas
 *   Superlectora → dos frases
 * Si no se encuentra una frase adecuada, se usan palabras sueltas.
 */
import { estado, catalogo } from '../estado/sesion.js';
import { rellenar, capitalizar } from '../contenido/plantillas.js';
import { limpiarPistas } from '../contenido/bloques.js';
import { azar, barajar } from '../util/azar.js';
import { claveDePalabra, palabrasDificiles } from './registro-lectura.js';

/** Hacen falta al menos estas palabras difíciles para que haya calentamiento. */
const MINIMO_PALABRAS = 2;
/** Se eligen entre las más difíciles. */
const CANDIDATAS = 8;
/** Largo máximo (en palabras) de las frases del calentamiento por nivel. */
const LARGO_FRASE = { lectora: 14, superlectora: 20 };
const LARGO_MINIMO_FRASE = 4;

/**
 * Frases de todos los cuentos que contienen la palabra, rellenadas con las
 * variables de esta partida. Se descartan diálogos, opciones y frases muy cortas o largas.
 * @param {string} palabra  Clave de la palabra.
 * @param {Record<string, any>} vars
 * @param {number} maxPalabras
 * @returns {string[]} Sin repetidas.
 */
export function frasesConPalabra(palabra, vars, maxPalabras) {
  const encontradas = [];
  for (const libro of catalogo.libros) for (const cap of libro.capitulos) for (const e of cap.escenas) for (const versiones of Object.values(e.niveles)) for (const v of versiones) {
    if (!v.toLowerCase().includes(palabra)) continue;
    const texto = limpiarPistas(rellenar(v, vars));
    for (const linea of texto.split('\n')) {
      if (/^\s*[?*-]/.test(linea) || /\{/.test(linea)) continue;
      const limpia = linea.replace(/^>\s?/, '').replace(/^—\s?/, '').trim();
      for (const frase of limpia.match(/[^.!?…]+[.!?…]+[»"”]?|[^.!?…]+$/g) || []) {
        const f = frase.trim().replace(/^[»"”]\s*/, '');
        const n = f.split(/\s+/).length;
        if (n < LARGO_MINIMO_FRASE || n > maxPalabras || /[«»—]/.test(f)) continue;
        if (f.split(/\s+/).some((w) => claveDePalabra(w) === palabra)) encontradas.push(capitalizar(f));
      }
    }
  }
  return [...new Set(encontradas)];
}

/**
 * Construye la escena de calentamiento, o null si no hay palabras suficientes.
 * @param {Record<string, any>} vars  Variables de la partida.
 * @returns {import('../contenido/escenas.js').Escena|null}
 */
export function escenaRepaso(vars) {
  const lista = palabrasDificiles().slice(0, CANDIDATAS);
  if (lista.length < MINIMO_PALABRAS) return null;
  const nivel = estado.nivel;
  const intro = '{ayudante} ha escrito unas palabras mágicas en una hoja.';
  let lineas, palabrasUsadas;
  if (nivel in LARGO_FRASE) {
    const cuantas = nivel === 'superlectora' ? 2 : 1;
    const frases = [];
    palabrasUsadas = [];
    for (const [w] of barajar(lista)) {
      const opciones = frasesConPalabra(w, vars, LARGO_FRASE[nivel]).filter((f) => !frases.includes(f));
      if (!opciones.length) continue;
      frases.push(azar(opciones)); palabrasUsadas.push(w);
      if (frases.length === cuantas) break;
    }
    if (frases.length) {
      lineas = [intro, cuantas > 1 && frases.length > 1 ? 'Para abrir el capítulo, hay que leer estas frases en voz alta.' : 'Para abrir el capítulo, hay que leer esta frase en voz alta.',
        ...frases.map((f) => '> ' + f), '¡El libro empieza a brillar!'];
    }
  }
  if (!lineas) {
    palabrasUsadas = barajar(lista).slice(0, nivel === 'aprendiz' ? 3 : Math.min(4, lista.length)).map(([k]) => k);
    lineas = [intro, 'Para abrir el capítulo, hay que leerlas en voz alta.', '> ' + palabrasUsadas.join('  ·  '), '¡El libro empieza a brillar!'];
  }
  return { id: 'repaso', repaso: true, palabras: palabrasUsadas, props: { fondo: 'bosque', con: ['ayudante'] }, niveles: { todos: [lineas.join('\n')] } };
}
