/**
 * @file Preguntas de comprensión al final del capítulo, sin el texto delante.
 *
 * Capa: dominio. Se generan solas a partir de lo que la niña ha leído en la
 * partida (`partida.leidos`), así funcionan con todos los libros sin escribir
 * nada nuevo en los cuentos:
 *   - Ordenar lo que ha pasado: tres frases del capítulo, en el orden en que salieron.
 *   - ¿Quién lo dijo?: una frase de un diálogo («…», dice Bruno) y tres personajes.
 *   - ¿Qué pista encontrasteis?: la pista buena frente a dos que no salieron.
 * Solo se pregunta lo que de verdad ha aparecido en lo leído.
 */
import { rellenar, capitalizar } from '../contenido/plantillas.js';
import { partirFrases, fraseApta, extraerDialogos } from '../contenido/frases.js';
import { barajar, azar } from '../util/azar.js';
import { sonDosNinas } from './protagonistas.js';

/**
 * @typedef {object} PreguntaOrdenar
 * @property {'ordenar'} tipo
 * @property {string} texto
 * @property {string[]} pasos   En el orden correcto.
 */

/**
 * @typedef {object} PreguntaOpciones
 * @property {'opciones'} tipo
 * @property {string} texto
 * @property {{texto: string, correcta: boolean}[]} opciones  Barajadas.
 */

/** @typedef {PreguntaOrdenar|PreguntaOpciones} PreguntaComprension */

/** Primera frase narrativa (sin diálogos) de un texto. */
function primeraFrase(texto) {
  const lineas = texto.split('\n').filter((l) => l.trim() && !/^\s*[>?*-]\s/.test(l));
  return partirFrases(lineas.join('\n')).find((f) => fraseApta(f, { min: 4, max: 16 })) || null;
}

/** @param {import('./partida.js').PartidaEnCurso} p @returns {PreguntaOrdenar|null} */
function preguntaOrdenar(p) {
  const frases = p.leidos.filter((l) => !l.repaso).map((l) => primeraFrase(l.texto)).filter(Boolean);
  const unicas = frases.filter((f, i) => frases.indexOf(f) === i);
  if (unicas.length < 3) return null;
  const pasos = [unicas[0], unicas[Math.floor((unicas.length - 1) / 2)], unicas[unicas.length - 1]];
  if (new Set(pasos).size < 3) return null;
  return { tipo: 'ordenar', texto: '¿En qué orden pasaron estas cosas? Toca primero lo que pasó antes.', pasos };
}

/** @param {import('./partida.js').PartidaEnCurso} p @returns {PreguntaOpciones|null} */
function preguntaQuien(p) {
  const v = p.vars;
  const nombres = [v.ayudante_nombre, v.ayudante2_nombre, v.lectora, sonDosNinas() ? v.hermana : null, v.mascota].filter(Boolean);
  const conocidos = new Set(nombres);
  const dialogos = extraerDialogos(p.leidos.map((l) => l.texto)).filter((d) => conocidos.has(d.quien));
  if (!dialogos.length) return null;
  const d = azar(dialogos);
  const otros = barajar([...conocidos].filter((n) => n !== d.quien)).slice(0, 2);
  if (!otros.length) return null;
  return {
    tipo: 'opciones',
    texto: `¿Quién dijo esto? «${d.cita}»`,
    opciones: barajar([{ texto: d.quien, correcta: true }, ...otros.map((n) => ({ texto: n, correcta: false }))])
  };
}

/** @param {import('./partida.js').PartidaEnCurso} p @returns {PreguntaOpciones|null} */
function preguntaPista(p) {
  const v = p.vars, leido = p.leidos.map((l) => l.texto.toLowerCase()).join('\n');
  const frase = (pista) => capitalizar(rellenar(`{buscado} ${pista}.`, v));
  const aparece = (pista) => leido.includes(rellenar(pista, v).toLowerCase());
  if (!v.pista1 || !aparece(v.pista1)) return null;
  const falsas = [v.pista_falsa, ...(p.lugares.otro.pistas || [])]
    .filter((x) => x && x !== v.pista1 && !aparece(x));
  const trampas = barajar([...new Set(falsas)]).slice(0, 2);
  if (trampas.length < 1) return null;
  return {
    tipo: 'opciones',
    texto: rellenar(`¿Qué pista {{encontrasteis|encontraste}} sobre {buscado}?`, v),
    opciones: barajar([{ texto: frase(v.pista1), correcta: true }, ...trampas.map((t) => ({ texto: frase(t), correcta: false }))])
  };
}

/**
 * Preguntas para el final de la partida (entre 0 y 3).
 * @param {import('./partida.js').PartidaEnCurso} p
 * @returns {PreguntaComprension[]}
 */
export function preguntasComprension(p) {
  if (!p || !p.leidos || !p.leidos.length) return [];
  return [preguntaOrdenar(p), preguntaQuien(p), preguntaPista(p)].filter(Boolean);
}
