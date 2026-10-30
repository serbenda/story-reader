/**
 * @file Registro de lectura: qué partidas se juegan y qué palabras cuestan.
 *
 * Capa: dominio. Alimenta el informe para mayores, el calentamiento de
 * «palabras mágicas» y las cerraduras.
 *
 * Palabras: solo cuenta el PRIMER intento de cada frase leída con micro
 * (así se ve lo que de verdad cuesta, no la repetición). Una palabra está
 * «conquistada» cuando se ha acertado dos veces más de las que se ha fallado.
 * Los nombres propios no cuentan: el reconocedor de voz se equivoca mucho con ellos.
 */
import { estado, catalogo, partida, guardar } from '../estado/sesion.js';
import { MAX_PARTIDAS_REGISTRO, MAX_SEGUNDOS_ESCENA } from '../config/index.js';
import { protagonistas } from './protagonistas.js';

/** Longitud mínima de una palabra para registrarla («el», «y»… no cuentan). */
const LARGO_MINIMO = 3;
/** Aciertos de más sobre los fallos para conquistar una palabra. */
const MARGEN_CONQUISTA = 2;

/**
 * Clave con la que se guarda una palabra: minúsculas y solo letras.
 * @param {string} t
 * @returns {string}
 */
export const claveDePalabra = (t) => String(t).toLowerCase().replace(/[^\p{L}]/gu, '');

/**
 * Nombres propios que no se registran: protagonistas, mascota y ayudantes de todos los libros.
 * @returns {Set<string>}
 */
export function nombresPropios() {
  const s = new Set([protagonistas().lectora, protagonistas().hermana, estado.perfil.mascota.nombre].map(claveDePalabra));
  for (const l of catalogo.libros) for (const a of Object.values(l.meta.ayudantes || {})) s.add(claveDePalabra(a.nombre));
  return s;
}

/**
 * Apunta un acierto o un fallo de una palabra. No guarda.
 * @param {string} clave  De {@link claveDePalabra}.
 * @param {boolean} bien
 */
export function anotarPalabra(clave, bien) {
  if (!clave || clave.length < LARGO_MINIMO) return;
  const p = estado.palabras[clave] || (estado.palabras[clave] = { f: 0, a: 0, u: 0 });
  if (bien) p.a++; else p.f++;
  p.u = Date.now();
}

/**
 * @param {import('../estado/almacen.js').PalabraRegistrada} p
 * @returns {boolean}
 */
export const conquistada = (p) => p.f > 0 && p.a >= p.f + MARGEN_CONQUISTA;

/**
 * Palabras que cuestan, de la que más a la que menos (y las recientes antes).
 * @returns {[string, import('../estado/almacen.js').PalabraRegistrada][]}
 */
export function palabrasDificiles() {
  return Object.entries(estado.palabras)
    .filter(([, p]) => p.f > 0 && !conquistada(p))
    .sort((x, y) => (y[1].f - y[1].a) - (x[1].f - x[1].a) || y[1].u - x[1].u);
}

/**
 * Palabras conquistadas, las más recientes primero.
 * @returns {[string, import('../estado/almacen.js').PalabraRegistrada][]}
 */
export const palabrasConquistadas = () =>
  Object.entries(estado.palabras).filter(([, p]) => conquistada(p)).sort((a, b) => b[1].u - a[1].u);

/**
 * Entrada de registro vacía para un capítulo que empieza.
 * @param {object} datos
 * @param {string} datos.libro
 * @param {string} datos.cap
 * @param {string} datos.titulo
 * @param {boolean} datos.micro
 * @param {string[]} datos.repaso
 * @returns {import('../estado/almacen.js').Partida & {guardado?: boolean}}
 */
export const nuevoRegistro = ({ libro, cap, titulo, micro, repaso }) => ({
  fecha: Date.now(), libro, cap, titulo, nivel: estado.nivel, micro,
  frases: 0, frasesPrimera: 0, intentos: 0, preguntas: 0, preguntasPrimera: 0, retos: 0, retosPrimera: 0,
  repaso, escenas: [], seg: 0
});

/** Suma al registro el tiempo de la escena que se estaba leyendo. */
export function cerrarEscenaRegistro() {
  if (!partida || !partida.reg || partida.tEscena == null) return;
  const seg = Math.min(MAX_SEGUNDOS_ESCENA, Math.round((Date.now() - partida.tEscena) / 1000));
  partida.reg.escenas.push({ id: partida.escena.e.id, seg });
  partida.reg.seg += seg;
  partida.tEscena = null;
}

/**
 * Pasa la partida en curso al registro y guarda. Solo la primera vez (salir y terminar no la duplican).
 * @param {boolean} terminado  ¿Se terminó el capítulo?
 */
export function guardarRegistro(terminado) {
  if (!partida || !partida.reg || partida.reg.guardado) return;
  cerrarEscenaRegistro();
  partida.reg.guardado = true;
  const { guardado, ...r } = partida.reg;
  r.terminado = terminado;
  estado.registro.push(r);
  if (estado.registro.length > MAX_PARTIDAS_REGISTRO) estado.registro = estado.registro.slice(-MAX_PARTIDAS_REGISTRO);
  guardar();
}

/**
 * Segundos leídos en la partida en curso que aún no están en el registro.
 * @returns {number}
 */
export function segundosSinGuardar() {
  if (!partida || !partida.reg || partida.reg.guardado) return 0;
  return partida.reg.seg + (partida.tEscena ? Math.min(MAX_SEGUNDOS_ESCENA, (Date.now() - partida.tEscena) / 1000) : 0);
}
