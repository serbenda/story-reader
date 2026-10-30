/**
 * @file Comprar y ponerse cosas de la tienda.
 *
 * Capa: dominio. Lo que se vende viene de dos sitios: complementos y
 * estampados (src/config/tienda.js) y mascotas con «precio» (stories/index.json).
 */
import { estado, catalogo } from '../estado/sesion.js';
import { ARTICULOS_TIENDA, PREFIJO_MASCOTA } from '../config/index.js';
import { gastarEstrellas } from './estrellas.js';

/**
 * Todo lo que se vende, mascotas incluidas.
 * @returns {import('../config/tienda.js').Articulo[]}
 */
export function articulosTienda() {
  const mascotas = Object.entries(catalogo.mascotas).filter(([, m]) => m.precio)
    .map(([k, m]) => ({ id: PREFIJO_MASCOTA + k, tipo: 'mascota', valor: k, nombre: m.chico.charAt(0).toUpperCase() + m.chico.slice(1), precio: m.precio, emoji: m.emoji }));
  return ARTICULOS_TIENDA.concat(mascotas);
}

/** @param {string} id @returns {boolean} */
export const comprado = (id) => !!estado.desbloqueado[id];

/** ¿Se puede elegir esta especie de mascota (gratis o comprada)? @param {string} especie */
export const mascotaDisponible = (especie) => !catalogo.mascotas[especie].precio || comprado(PREFIJO_MASCOTA + especie);

/**
 * Compra un artículo. No guarda.
 * @param {import('../config/tienda.js').Articulo} articulo
 * @returns {boolean} false si no hay estrellas suficientes.
 */
export function comprar(articulo) {
  if (!gastarEstrellas(articulo.precio)) return false;
  estado.desbloqueado[articulo.id] = true;
  return true;
}

/**
 * Se pone un artículo comprado. No guarda.
 * @param {import('../config/tienda.js').Articulo} articulo
 * @param {'alaya'|'lucia'|'mascota'} quien  'alaya' es la que lee; 'lucia', la hermana.
 */
export function ponerArticulo(articulo, quien) {
  if (articulo.tipo === 'mascota') estado.perfil.mascota.especie = articulo.valor;
  else estado.perfil[quien][articulo.tipo === 'accesorio' ? 'accesorio' : 'estampado'] = articulo.valor;
}
