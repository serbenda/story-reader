/**
 * @file Lo que se compra con estrellas.
 *
 * Capa: config. Para añadir un complemento nuevo: añádelo aquí y dibújalo en
 * src/arte/personajes/complementos.js con el mismo «valor». Para un estampado,
 * en src/arte/personajes/estampados.js. Las mascotas de pago se declaran en
 * stories/index.json con «precio».
 */

/**
 * @typedef {object} Articulo
 * @property {string} id      Identificador único (se guarda en «desbloqueado»).
 * @property {'accesorio'|'estampado'|'mascota'} tipo
 * @property {string} valor   Lo que se pone en el perfil (p. ej. «tiara»).
 * @property {string} nombre  Texto en la tienda.
 * @property {number} precio  Estrellas que cuesta.
 * @property {string} [emoji] Solo las mascotas.
 */

/** @type {readonly Articulo[]} */
export const ARTICULOS_TIENDA = Object.freeze([
  { id: 'acc-flores', tipo: 'accesorio', valor: 'flores', nombre: 'Corona de flores', precio: 15 },
  { id: 'acc-orejas', tipo: 'accesorio', valor: 'orejas', nombre: 'Orejas de gato', precio: 15 },
  { id: 'acc-gorro', tipo: 'accesorio', valor: 'gorro', nombre: 'Gorro de lana', precio: 20 },
  { id: 'acc-tiara', tipo: 'accesorio', valor: 'tiara', nombre: 'Tiara de estrellas', precio: 25 },
  { id: 'acc-pirata', tipo: 'accesorio', valor: 'pirata', nombre: 'Pañuelo pirata', precio: 25 },
  { id: 'acc-casco', tipo: 'accesorio', valor: 'casco', nombre: 'Casco de astronauta', precio: 35 },
  { id: 'est-lunares', tipo: 'estampado', valor: 'lunares', nombre: 'Vestido de lunares', precio: 15 },
  { id: 'est-rayas', tipo: 'estampado', valor: 'rayas', nombre: 'Vestido de rayas', precio: 15 },
  { id: 'est-flores', tipo: 'estampado', valor: 'flores', nombre: 'Vestido de flores', precio: 20 },
  { id: 'est-estrellas', tipo: 'estampado', valor: 'estrellas', nombre: 'Vestido de estrellas', precio: 25 }
]);

/** Prefijo del id de las mascotas compradas («mas-dragon»). */
export const PREFIJO_MASCOTA = 'mas-';

/** Secciones de la tienda, en orden. */
export const SECCIONES_TIENDA = Object.freeze([
  ['accesorio', '👑 Complementos'],
  ['estampado', '👗 Vestidos'],
  ['mascota', '🐾 Mascotas']
]);
