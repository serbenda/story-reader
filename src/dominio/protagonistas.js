/**
 * @file Quiénes protagonizan los cuentos.
 *
 * Capa: dominio. Por defecto son dos hermanas (Alaia, que lee, y Lucía, la
 * pequeña), pero la familia puede cambiar los nombres o elegir una sola niña.
 * Los cuentos se adaptan con las alternativas {{dos|una}}.
 */
import { estado, catalogo } from '../estado/sesion.js';

/**
 * Nombres de las protagonistas: los elegidos al vestirlas o, si no, los de stories/index.json.
 * @returns {{lectora: string, hermana: string}}
 */
export function protagonistas() {
  const n = (estado.perfil && estado.perfil.nombres) || {};
  return { lectora: n.lectora || catalogo.protagonistas.lectora, hermana: n.hermana || catalogo.protagonistas.hermana };
}

/** ¿Hay dos protagonistas? (también cuando todavía no hay perfil) */
export const sonDosNinas = () => !(estado.perfil && estado.perfil.ninas === 1);

/**
 * Quién encuentra los tesoros escondidos: la hermana pequeña o, si no hay, la que lee.
 * @returns {string}
 */
export const buscadoraDeTesoros = () => (sonDosNinas() ? protagonistas().hermana : protagonistas().lectora);
