/**
 * @file Fachada de todo lo relacionado con la voz.
 *
 * Capa: servicios. El resto del juego importa de aquí:
 *   import * as Voz from '../servicios/voz/index.js';
 *   Voz.escuchar({...}); Voz.hablar('hola'); Voz.comparar(...)
 */
export { normalizar, comparar, parecido, distancia } from './comparar.js';
export { soportado, disponible, estaBloqueado, escuchando, escuchar, parar, ERRORES_SIN_MICRO } from './reconocimiento.js';
export { voces, configurar, nombreAutomatica, hablar, callar } from './sintesis.js';
