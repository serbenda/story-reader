/**
 * @file De dónde salen las palabras y frases de la zona «Practicar».
 *
 * Capa: dominio. Prioridad en todos los ejercicios:
 *   1. los deberes del cole (src/dominio/deberes.js),
 *   2. lo que le cuesta (palabras que falla al escribir o al leer),
 *   3. palabras y frases de los propios cuentos, adaptadas al nivel.
 * Las frases de los cuentos se rellenan con un sorteo de cada capítulo, así
 * salen con sus personajes y nombres (Alaia, Toby, el búho Bruno…).
 */
import { estado, catalogo } from '../estado/sesion.js';
import { DICTADO_POR_NIVEL, FRASES_POR_NIVEL, LECTURA_REPETIDA_POR_NIVEL } from '../config/index.js';
import { rellenar } from '../contenido/plantillas.js';
import { versionesPara } from '../contenido/escenas.js';
import { silabas } from '../contenido/silabas.js';
import { partirFrases, fraseApta, contarPalabras, prepararOrdenar, prepararHueco } from '../contenido/frases.js';
import { barajar, azar } from '../util/azar.js';
import { prepararPartida, varsBasicas } from './variables.js';
import { nombresPropios, palabrasDificiles } from './registro-lectura.js';
import { palabrasDeDeberes, frasesDeDeberes } from './deberes.js';
import { palabrasDificilesDeEscribir } from './practica.js';

/**
 * @typedef {object} Corpus
 * @property {string[][]} textos   Frases de cada versión de escena, en orden.
 * @property {string[]} frases     Todas las frases.
 * @property {Map<string, number>} palabras  Palabra (minúsculas) → veces que aparece.
 */

/** @type {{clave: string, corpus: Corpus}|null} */
let cache = null;

/**
 * Frases y palabras de todos los cuentos para el nivel actual (se calcula una vez por nivel y perfil).
 * @returns {Corpus}
 */
export function corpus() {
  const clave = `${estado.nivel}|${JSON.stringify(estado.perfil && estado.perfil.nombres)}|${estado.perfil && estado.perfil.ninas}`;
  if (cache && cache.clave === clave) return cache.corpus;
  const textos = [], palabras = new Map(), propios = nombresPropios();
  for (const libro of catalogo.libros) for (const cap of libro.capitulos) {
    const { vars } = prepararPartida(libro, cap);
    for (const e of cap.escenas) for (const v of versionesPara(e, estado.nivel) || []) {
      const frases = partirFrases(rellenar(v, vars));
      textos.push(frases);
      for (const f of frases) for (const w of f.toLowerCase().match(/\p{L}+/gu) || []) if (!propios.has(w)) palabras.set(w, (palabras.get(w) || 0) + 1);
    }
  }
  const resultado = { textos, frases: textos.flat(), palabras };
  cache = { clave, corpus: resultado };
  return resultado;
}

/** Sin duplicados, conservando el orden. */
const unicos = (lista) => [...new Set(lista)];

/**
 * Palabras para dictar: deberes, después las que le cuesta escribir o leer,
 * y el resto de los cuentos con el número de sílabas del nivel.
 * @param {number} n
 * @returns {string[]}
 */
export function palabrasParaDictado(n) {
  const cfg = DICTADO_POR_NIVEL[estado.nivel] || DICTADO_POR_NIVEL.aprendiz;
  const valeParaNivel = (w) => {
    const s = silabas(w).length;
    return /^\p{L}+$/u.test(w) && s >= cfg.silabas[0] && s <= cfg.silabas[1] && w.length >= cfg.letras[0] && w.length <= cfg.letras[1];
  };
  const deberes = barajar(palabrasDeDeberes());
  const cuestan = barajar(unicos([...palabrasDificilesDeEscribir().map(([w]) => w), ...palabrasDificiles().map(([w]) => w)]).filter(valeParaNivel)).slice(0, Math.ceil(n / 2));
  const comunes = barajar([...corpus().palabras].filter(([w, veces]) => veces >= 2 && valeParaNivel(w)).map(([w]) => w));
  return unicos([...deberes, ...cuestan, ...comunes]).slice(0, n);
}

/**
 * Frases cortas para dictar con teclado (Superlectora): deberes primero.
 * @param {number} n
 * @returns {string[]}
 */
export function frasesParaDictado(n) {
  const cortas = (f) => fraseApta(f, { min: 3, max: 6 });
  return unicos([...barajar(frasesDeDeberes()).filter((f) => contarPalabras(f) <= 8), ...barajar(corpus().frases.filter(cortas))]).slice(0, n);
}

/**
 * Frases para el taller: las de los deberes y las de los cuentos del largo del nivel.
 * @param {number} n
 * @returns {string[]}
 */
export function frasesParaTaller(n) {
  const largo = FRASES_POR_NIVEL[estado.nivel] || FRASES_POR_NIVEL.aprendiz;
  const deberes = barajar(frasesDeDeberes()).filter((f) => contarPalabras(f) >= 3 && contarPalabras(f) <= largo.max + 3);
  return unicos([...deberes, ...barajar(corpus().frases.filter((f) => fraseApta(f, largo)))]).slice(0, n);
}

/**
 * @typedef {{tipo: 'ordenar'} & import('../contenido/frases.js').FraseParaOrdenar
 *         | {tipo: 'completar'} & import('../contenido/frases.js').FraseConHueco} EjercicioTaller
 */

/**
 * Ejercicios del taller, alternando ordenar y completar.
 * @param {number} n
 * @returns {EjercicioTaller[]}
 */
export function ejerciciosTaller(n) {
  const evitar = new Set([...nombresPropios(), ...Object.values(varsBasicas()).filter((v) => typeof v === 'string').map((v) => v.toLowerCase())]);
  const otras = [...corpus().palabras.keys()].filter((w) => w.length >= 4);
  return frasesParaTaller(n).map((frase, i) => {
    if (i % 2 === 1) {
      const hueco = prepararHueco(frase, barajar(otras).slice(0, 30), evitar);
      if (hueco) return { tipo: 'completar', ...hueco };
    }
    return { tipo: 'ordenar', ...prepararOrdenar(frase) };
  });
}

/**
 * Texto para la lectura repetida: los deberes si llegan al largo del nivel; si
 * no, frases seguidas de una escena de los cuentos.
 * @returns {string}
 */
export function textoLecturaRepetida() {
  const largo = LECTURA_REPETIDA_POR_NIVEL[estado.nivel] || LECTURA_REPETIDA_POR_NIVEL.aprendiz;
  const deberes = frasesDeDeberes();
  if (deberes.length && contarPalabras(deberes.join(' ')) >= Math.min(8, largo.min)) return recortar(deberes, largo.max);
  const limpias = (frases) => frases.filter((f) => !/[«»—{}]/.test(f));
  for (const frases of barajar(corpus().textos)) {
    const lista = limpias(frases);
    for (let ini = 0; ini < lista.length; ini++) {
      const texto = recortar(lista.slice(ini), largo.max);
      if (contarPalabras(texto) >= largo.min) return texto;
    }
  }
  return recortar(barajar(limpias(corpus().frases)), largo.max);
}

/** Junta frases enteras hasta el máximo de palabras. */
function recortar(frases, max) {
  const out = [];
  for (const f of frases) {
    if (out.length && contarPalabras([...out, f].join(' ')) > max) break;
    out.push(f);
  }
  return out.join(' ');
}

/**
 * Propuesta para «Mi frase»: sobre el último capítulo leído o un tema del juego.
 * @returns {{titulo: string, tema: string}}
 */
export function propuestaParaEscribir() {
  const ultima = [...estado.registro].reverse().find((r) => r.titulo);
  const v = varsBasicas();
  const temas = [
    ultima && { titulo: `Escribe una frase sobre «${ultima.titulo}».`, tema: ultima.titulo },
    { titulo: `¿Cómo es ${v.mascota}? Escribe una frase.`, tema: v.mascota },
    { titulo: '¿Qué te gustaría investigar como detective? Escribe una frase.', tema: 'detective' },
    { titulo: '¿Qué has hecho hoy en el cole? Escribe una frase.', tema: 'el cole' }
  ].filter(Boolean);
  return ultima && Math.random() < 0.6 ? temas[0] : azar(temas);
}
