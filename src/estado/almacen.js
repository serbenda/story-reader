/**
 * @file Forma del progreso guardado y lectura/escritura en localStorage.
 *
 * Capa: estado. Todo el progreso de la niña es un único objeto JSON
 * ({@link Estado}) guardado en localStorage bajo CLAVE_GUARDADO. Es
 * deliberadamente simple: no hay servidor, nada sale del dispositivo (salvo
 * que los mayores hagan una copia o pasen el código a otro dispositivo).
 *
 * Compatibilidad: si añades un campo nuevo, ponle valor en {@link estadoInicial}.
 * Al cargar un guardado antiguo, los campos que falten se completan con esos
 * valores, así nadie pierde su progreso al actualizar el juego.
 */
import { CLAVE_GUARDADO, NIVEL_INICIAL, META_INICIAL } from '../config/index.js';

/**
 * @typedef {object} Mascota
 * @property {string} especie  Clave de stories/index.json → mascotas.
 * @property {'chico'|'chica'} genero
 * @property {string} nombre
 */

/**
 * @typedef {object} Perfil
 * @property {1|2} ninas  Cuántas protagonistas hay.
 * @property {{lectora: string, hermana: string}} nombres
 * @property {import('../arte/personajes/nina.js').AspectoNina} alaya  Aspecto de la que lee (nombre histórico).
 * @property {import('../arte/personajes/nina.js').AspectoNina} lucia  Aspecto de la hermana (nombre histórico).
 * @property {Mascota} mascota
 */

/**
 * @typedef {object} Ajustes
 * @property {'normal'|'grande'|'enorme'} tamano
 * @property {'facil'|'normal'|'exigente'} tolerancia
 * @property {boolean} sinMicro   Jugar con el botón «¡Ya lo he leído!».
 * @property {boolean} resaltar   Resaltar la línea al tocar una palabra.
 * @property {boolean} sonido
 * @property {boolean} silabas    Sílabas de colores.
 * @property {boolean} regla      Regla de lectura (atenúa las demás líneas).
 * @property {string} meta        Clave de METAS.
 * @property {string} [voz]       Nombre de la voz elegida ('' = automática).
 * @property {string} [velocidad] Clave de VELOCIDADES_VOZ.
 */

/**
 * @typedef {object} PalabraRegistrada
 * @property {number} f  Veces fallada (en el primer intento).
 * @property {number} a  Veces acertada.
 * @property {number} u  Última vez (ms).
 */

/**
 * @typedef {object} Partida  Una entrada del registro de lectura (ver src/dominio/registro-lectura.js).
 * @property {number} fecha
 * @property {string} libro
 * @property {string} cap
 * @property {string} titulo
 * @property {string} nivel
 * @property {boolean} micro      ¿Se jugó con micrófono?
 * @property {number} frases      Frases leídas en voz alta.
 * @property {number} frasesPrimera
 * @property {number} intentos
 * @property {number} preguntas
 * @property {number} preguntasPrimera
 * @property {number} retos       Cerraduras abiertas.
 * @property {number} retosPrimera
 * @property {string[]} repaso    Palabras del calentamiento.
 * @property {{id: string, seg: number}[]} escenas
 * @property {number} seg         Segundos leyendo.
 * @property {boolean} terminado
 */

/**
 * @typedef {object} Estado
 * @property {Perfil|null} perfil
 * @property {string} nivel
 * @property {Record<string, Record<string, Record<string, number>>>} progreso  libro → capítulo → nivel → veces terminado.
 * @property {number} estrellas   Ganadas en total (nunca baja).
 * @property {number} gastadas    Gastadas en la tienda. El saldo es estrellas − gastadas.
 * @property {Record<string, boolean>} ofrecidos  Niveles en los que ya se ofreció subir.
 * @property {{amigos: Record<string, boolean>, tesoros: Record<string, number>, pegatinas: Record<string, string>}} album
 * @property {Ajustes} ajustes
 * @property {Record<string, boolean>} desbloqueado  Artículos comprados.
 * @property {Record<string, boolean>} metaDias      Días con la meta cumplida («2026-10-30»).
 * @property {Record<string, boolean>} cofres        Lunes de las semanas con el cofre abierto.
 * @property {Partida[]} registro
 * @property {Record<string, PalabraRegistrada>} palabras
 * @property {string} [ultimoLibro]
 * @property {number} [ultimaCopia]  Fecha de la última copia de seguridad.
 */

/**
 * Estado de una partida nueva. Es la fuente de verdad de qué campos existen.
 * @returns {Estado}
 */
export const estadoInicial = () => ({
  perfil: null, nivel: NIVEL_INICIAL, progreso: {}, estrellas: 0, ofrecidos: {},
  album: { amigos: {}, tesoros: {}, pegatinas: {} },
  ajustes: { tamano: 'normal', tolerancia: 'normal', sinMicro: false, resaltar: true, sonido: true, silabas: false, regla: false, meta: META_INICIAL },
  gastadas: 0,
  desbloqueado: {},
  metaDias: {},
  cofres: {},
  registro: [],
  palabras: {}
});

/**
 * Lee el progreso guardado, completando lo que falte. Si no hay o está roto, empieza de cero.
 * @returns {Estado}
 */
export function cargarEstado() {
  const base = estadoInicial();
  try {
    const t = localStorage.getItem(CLAVE_GUARDADO);
    if (t) {
      const d = JSON.parse(t);
      return Object.assign(base, d, {
        ajustes: Object.assign(base.ajustes, d.ajustes || {}),
        album: Object.assign(base.album, d.album || {})
      });
    }
  } catch (e) { /* sin guardado */ }
  return base;
}

/**
 * Guarda el progreso. Si el navegador no deja (modo privado lleno…), no pasa nada.
 * @param {Estado} estado
 */
export function guardarEstado(estado) {
  try { localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado)); } catch (e) { /* sin guardado */ }
}
