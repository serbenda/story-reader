/**
 * @file `window.Juego`: puerta de entrada para las pruebas automáticas y la consola.
 *
 * Las pruebas (herramientas/validar.py y tests/partidas.py) se ejecutan en un
 * navegador real y necesitan leer el estado y llamar a algunas funciones. Con
 * módulos ES no hay variables globales, así que se exponen aquí, en un solo
 * sitio y solo lectura (los getters devuelven siempre el valor actual).
 *
 * Desde la consola del navegador también sirve para investigar:
 *   Juego.estado.palabras        → palabras registradas
 *   Juego.modulos.texto.silabas('mariposa')
 */
import { estado, catalogo } from './estado/sesion.js';
import { prepararPartida } from './dominio/variables.js';
import * as plantillas from './contenido/plantillas.js';
import * as bloques from './contenido/bloques.js';
import * as silabas from './contenido/silabas.js';
import * as Voz from './servicios/voz/index.js';
import * as Grabaciones from './servicios/grabaciones.js';
import * as Arte from './arte/index.js';

/** Publica `window.Juego`. */
export function exponerParaPruebas() {
  window.Juego = Object.freeze({
    get estado() { return estado; },
    get catalogo() { return catalogo; },
    prepararPartida,
    modulos: Object.freeze({
      texto: Object.freeze({ ...plantillas, ...bloques, ...silabas }),
      voz: Voz,
      grabaciones: Grabaciones,
      arte: Arte
    })
  });
}
