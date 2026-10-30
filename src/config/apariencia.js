/**
 * @file Opciones para vestir a las protagonistas y elegir mascota.
 *
 * Capa: config. Los complementos y estampados que se compran están en
 * src/config/tienda.js; las mascotas, en stories/index.json.
 */

/** Colores y complementos gratuitos. */
export const APARIENCIA = Object.freeze({
  piel: ['#F7D7BA', '#EDBB91', '#C98D61', '#8E5B3C'],
  pelo: { 'castaño': '#6B3E26', rubio: '#E2B04A', negro: '#2A2024', pelirrojo: '#C4532E' },
  vestido: ['#C9476B', '#3F7D4E', '#5FA8CF', '#8A62C4', '#F2B33D', '#E9775A'],
  accesorio: { ninguno: 'Nada', sombrero: 'Sombrero', corona: 'Corona', lazo: 'Lazo', gorra: 'Gorra', gafas: 'Gafas' }
});

/** Estampado gratuito del vestido (los demás se compran). */
export const ESTAMPADO_LISO = Object.freeze({ liso: 'Liso' });

/** Nombres que se proponen para la mascota. */
export const NOMBRES_MASCOTA = Object.freeze(['Toby', 'Luna', 'Coco', 'Nala', 'Bolita', 'Pipo', 'Kiwi', 'Lola']);

/** Colores de las tapas de los libros en la estantería (se repiten en ciclo). */
export const COLORES_TAPA = Object.freeze(['#3F7D4E', '#2F7FB3', '#C2453B', '#8A62C4', '#2E3A70', '#5F8FA8', '#C9763A']);

/** Colores del confeti. */
export const COLORES_CONFETI = Object.freeze(['#C9476B', '#F2B33D', '#3F7D4E', '#5FA8CF', '#8A62C4']);

/** Longitud máxima de los nombres de las niñas y de la mascota. */
export const LARGO_NOMBRE = Object.freeze({ nina: 14, mascota: 12 });

/**
 * Perfil con el que empieza el juego si nunca se ha vestido a nadie.
 * Los nombres salen de stories/index.json («protagonistas»).
 * @param {{lectora: string, hermana: string}} nombres
 * @returns {import('../estado/almacen.js').Perfil}
 */
export const perfilPorDefecto = (nombres) => ({
  ninas: 2,
  nombres: { lectora: nombres.lectora, hermana: nombres.hermana },
  alaya: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#C9476B', accesorio: 'sombrero' },
  lucia: { piel: APARIENCIA.piel[0], pelo: APARIENCIA.pelo['castaño'], vestido: '#F2B33D', accesorio: 'lazo' },
  mascota: { especie: 'perro', genero: 'chico', nombre: 'Toby' }
});
