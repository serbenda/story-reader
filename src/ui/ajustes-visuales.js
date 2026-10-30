/**
 * @file Aplica los ajustes de los mayores a la página y a la voz.
 *
 * Capa: ui. Los ajustes visuales se aplican con clases en <body> y una
 * variable CSS (ver css/base/accesibilidad.css), así no hay que redibujar.
 */
import { estado } from '../estado/sesion.js';
import { TAMANOS_LETRA, VELOCIDADES_VOZ } from '../config/index.js';
import * as Voz from '../servicios/voz/index.js';

/** Aplica tamaño de letra, resaltado, sílabas, regla, voz y velocidad. */
export function aplicarAjustes() {
  const a = estado.ajustes;
  document.documentElement.style.setProperty('--tam-lectura', TAMANOS_LETRA[a.tamano] || TAMANOS_LETRA.normal);
  document.body.classList.toggle('con-resaltado', !!a.resaltar || !!a.regla);
  document.body.classList.toggle('con-silabas', !!a.silabas);
  document.body.classList.toggle('con-regla', !!a.regla);
  Voz.configurar({ voz: a.voz, factor: VELOCIDADES_VOZ[a.velocidad] || 1 });
}
