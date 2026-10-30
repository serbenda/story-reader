/**
 * @file Punto único de acceso a la configuración.
 *
 * Capa: config. Permite `import { NIVELES, METAS } from '../config/index.js'`
 * sin recordar en qué archivo está cada cosa.
 */
export * from './niveles.js';
export * from './mensajes.js';
export * from './apariencia.js';
export * from './tienda.js';
export * from './recompensas.js';

/** Clave de localStorage donde se guarda todo el progreso. Cambiarla «olvida» los progresos. */
export const CLAVE_GUARDADO = 'biblioteca-magica-v1';

/** Identificador de las copias de seguridad en archivo. */
export const APP_COPIA = 'biblioteca-magica';
