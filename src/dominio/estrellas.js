/**
 * @file Estrellas: se ganan leyendo y se gastan en la tienda.
 *
 * Capa: dominio. `estado.estrellas` es lo ganado en total (para el informe) y
 * `estado.gastadas` lo gastado; el saldo es la resta. Cada cambio emite
 * 'estrellas-cambiadas' para que la cabecera lo anime.
 */
import { estado, partida } from '../estado/sesion.js';
import { emitir } from '../util/eventos.js';

/** Estrellas disponibles para gastar. @returns {number} */
export const saldo = () => Math.max(0, (estado.estrellas || 0) - (estado.gastadas || 0));

/**
 * Suma estrellas (también al contador de la partida en curso). No guarda: guarda quien llama.
 * @param {number} n
 */
export function ganarEstrellas(n) {
  estado.estrellas = (estado.estrellas || 0) + n;
  if (partida) partida.estrellas = (partida.estrellas || 0) + n;
  emitir('estrellas-cambiadas', { saldo: saldo() });
}

/**
 * Gasta estrellas si hay suficientes. No guarda.
 * @param {number} n
 * @returns {boolean} false si no llega el saldo.
 */
export function gastarEstrellas(n) {
  if (saldo() < n) return false;
  estado.gastadas = (estado.gastadas || 0) + n;
  emitir('estrellas-cambiadas', { saldo: saldo() });
  return true;
}
