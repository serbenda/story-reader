/**
 * @file Fachada del arte: todo lo que se dibuja con código, sin archivos de imagen.
 *
 * Capa: arte (solo depende de util). Uso:
 *   import * as Arte from '../arte/index.js';
 *   Arte.paisaje('faro', { noche: true, semilla: 7 });
 *   Arte.nina({ piel, pelo, vestido, accesorio: 'tiara' }, 'coletas');
 */
export { PAISAJES, paisaje } from './paisajes/index.js';
export { nina } from './personajes/nina.js';
export { aleatorio } from './aleatorio.js';
