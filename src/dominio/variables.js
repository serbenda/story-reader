/**
 * @file Variables con las que se rellenan los cuentos en cada partida.
 *
 * Capa: dominio. Cada partida sortea lugares, ayudantes, pistas y señales del
 * mundo del libro (libro.md), para que la historia sea distinta cada vez y no
 * se pueda resolver de memoria. La lista completa de variables, con ejemplos,
 * está en stories/GUIA-ESCRITURA.md.
 */
import { estado, catalogo } from '../estado/sesion.js';
import { rellenar, VAR_DOS } from '../contenido/plantillas.js';
import { azar, barajar } from '../util/azar.js';
import { protagonistas, sonDosNinas } from './protagonistas.js';

/**
 * @typedef {object} Lugar  Un lugar de libro.md.
 * @property {string} articulo  «el» o «la».
 * @property {string} nombre
 * @property {string} [fondo]   Paisaje.
 * @property {string} [icono]
 * @property {string[]} [pistas]   Lo que se encuentra si el buscado está allí.
 * @property {string[]} [senales]  Cómo se reconoce el lugar.
 */

/**
 * @typedef {object} Ayudante  Un ayudante de libro.md.
 * @property {string} articulo
 * @property {string} especie
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} emoji
 * @property {string[]} [gracias]
 */

/**
 * Variables de un lugar con sus contracciones correctas (al / del).
 * @example varsLugar('lugar', {articulo:'el', nombre:'río'})
 *   // { lugar:'el río', al_lugar:'al río', del_lugar:'del río', en_lugar:'en el río', hacia_lugar:'hacia el río' }
 * @param {string} prefijo
 * @param {Lugar} L
 * @returns {Record<string, string>}
 */
export function varsLugar(prefijo, L) {
  const base = `${L.articulo} ${L.nombre}`;
  const el = L.articulo === 'el';
  return {
    [prefijo]: base,
    ['al_' + prefijo]: el ? `al ${L.nombre}` : `a ${base}`,
    ['del_' + prefijo]: el ? `del ${L.nombre}` : `de ${base}`,
    ['en_' + prefijo]: `en ${base}`,
    ['hacia_' + prefijo]: `hacia ${base}`
  };
}

/**
 * Variables de un ayudante («el búho Ulises», «al búho Ulises», su nombre, descripción y una gracia).
 * @param {string} prefijo
 * @param {Ayudante} A
 * @param {string} gracia  Nombre de la variable para su gracia.
 * @returns {Record<string, string>}
 */
export function varsAyudante(prefijo, A, gracia) {
  const base = `${A.articulo} ${A.especie} ${A.nombre}`;
  return {
    [prefijo]: base,
    ['al_' + prefijo]: A.articulo === 'el' ? `al ${A.especie} ${A.nombre}` : `a ${base}`,
    ['del_' + prefijo]: A.articulo === 'el' ? `del ${A.especie} ${A.nombre}` : `de ${base}`,
    [prefijo + '_nombre']: A.nombre,
    [prefijo + '_desc']: A.descripcion,
    [gracia]: azar(A.gracias || ['se ríe un montón'])
  };
}

/**
 * Variables que valen fuera de una partida: protagonistas y mascota.
 * (Para títulos, resúmenes y el álbum.)
 * @returns {Record<string, string|boolean>}
 */
export function varsBasicas() {
  const m = estado.perfil.mascota, esp = catalogo.mascotas[m.especie] || Object.values(catalogo.mascotas)[0];
  const chica = m.genero === 'chica', animal = chica ? esp.chica : esp.chico;
  const nom = protagonistas(), dos = sonDosNinas();
  return {
    lectora: nom.lectora, hermana: nom.hermana, [VAR_DOS]: dos, las_ninas: dos ? `${nom.lectora} y ${nom.hermana}` : nom.lectora,
    mascota: m.nombre, animal, el_animal: (chica ? 'la ' : 'el ') + animal, un_animal: (chica ? 'una ' : 'un ') + animal, mo: chica ? 'a' : 'o'
  };
}

/**
 * Título de un capítulo con nombres y alternativas resueltos.
 * @param {import('../contenido/catalogo.js').Capitulo} cap
 * @returns {string}
 */
export const tituloCapitulo = (cap) => rellenar(cap.meta.titulo || cap.id, varsBasicas());

/**
 * @typedef {object} SorteoPartida
 * @property {Record<string, any>} vars  Todas las variables del capítulo.
 * @property {{lugar: Lugar & {clave: string}, falso: Lugar & {clave: string}, otro: Lugar & {clave: string}}} lugares
 *           lugar = donde está lo buscado; falso = el que parece pero no; otro = un tercero.
 * @property {[string, string]} ayudantes  Claves de los dos ayudantes.
 */

/**
 * Sortea todo lo de una partida de un capítulo.
 * El capítulo puede limitar los lugares y ayudantes (cabecera «lugares» y «ayudantes»)
 * y decir qué se busca («buscamos»: la mascota u otra cosa).
 * @param {import('../contenido/catalogo.js').Libro} libro
 * @param {import('../contenido/catalogo.js').Capitulo} cap
 * @returns {SorteoPartida}
 */
export function prepararPartida(libro, cap) {
  const mundo = libro.meta, cm = cap.meta;
  const claves = barajar((cm.lugares && cm.lugares.length ? cm.lugares : Object.keys(mundo.lugares)).filter((k) => mundo.lugares[k]));
  while (claves.length < 3) claves.push(claves[0]);
  const [kl, kf, ko] = claves;
  const L = mundo.lugares[kl], F = mundo.lugares[kf], O = mundo.lugares[ko];
  const ka = barajar(cm.ayudantes || Object.keys(mundo.ayudantes));
  const a1 = mundo.ayudantes[ka[0]], a2 = mundo.ayudantes[ka[1] || ka[0]];

  const v = Object.assign({}, varsBasicas(),
    varsLugar('lugar', L), varsLugar('falso', F), varsLugar('otro', O),
    varsAyudante('ayudante', a1, 'gracia'), varsAyudante('ayudante2', a2, 'gracia2'));
  const pistas = barajar(L.pistas || ['dejó huellas']);
  v.pista1 = pistas[0]; v.pista2 = pistas[1] || pistas[0]; v.pista3 = pistas[2] || pistas[0];
  v.pista_falsa = azar(F.pistas || ['dejó huellas']);
  const senales = barajar(L.senales || ['hay muchos árboles']);
  v.senal1 = senales[0]; v.senal2 = senales[1] || senales[0];
  v.senal_falsa = azar(F.senales || ['hay muchos árboles']);
  v.o2 = a1.articulo === 'la' ? 'a' : 'o';
  if (!cm.buscamos || cm.buscamos === 'mascota') { v.buscado = v.mascota; v.o = v.mo; }
  else { v.buscado = cm.buscamos.nombre; v.o = cm.buscamos.genero === 'f' ? 'a' : 'o'; }

  return { vars: v, lugares: { lugar: { clave: kl, ...L }, falso: { clave: kf, ...F }, otro: { clave: ko, ...O } }, ayudantes: [ka[0], ka[1] || ka[0]] };
}
