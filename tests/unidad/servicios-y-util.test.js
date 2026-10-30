/**
 * @file Pruebas de la comparación de voz y de las utilidades.
 * Ejecutar: node --test tests/unidad/
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, comparar, parecido, distancia } from '../../src/servicios/voz/comparar.js';
import { azar, barajar } from '../../src/util/azar.js';
import { claveDia, lunesDe, DIA_MS } from '../../src/util/fechas.js';
import { sumar, porcentaje, redondear1 } from '../../src/util/numeros.js';
import { escuchar, emitir } from '../../src/util/eventos.js';
import { aBase64, deBase64 } from '../../src/util/base64.js';

describe('comparar lo leído', () => {
  test('normaliza tildes, mayúsculas, signos y cifras', () => {
    assert.deepEqual(normalizar('¡Él tenía 3 PIÑAS!'), ['el', 'tenia', 'tres', 'pinas']);
  });
  test('distancia y parecido', () => {
    assert.equal(distancia('gato', 'pato'), 1);
    assert.equal(parecido('casa', 'casa'), 1);
  });
  test('acepta una lectura con pequeños fallos', () => {
    const r = comparar(normalizar('la mariposa azul vuela'), normalizar('la mariposa asul buela'), 0.62);
    assert.deepEqual(r, [true, true, true, true]);
  });
  test('marca lo que no se ha leído', () => {
    const r = comparar(normalizar('el búho mira la luna'), normalizar('el búho'), 0.62);
    assert.deepEqual(r, [true, true, false, false, false]);
  });
  test('entiende dos palabras pegadas por el reconocedor', () => {
    const r = comparar(['alaia', 'y', 'lucia'], ['alaiay', 'lucia'], 0.62);
    assert.deepEqual(r, [true, true, true]);
  });
});

describe('utilidades', () => {
  test('barajar no pierde ni cambia la original', () => {
    const a = [1, 2, 3, 4, 5], b = barajar(a);
    assert.deepEqual([...b].sort(), a);
    assert.deepEqual(a, [1, 2, 3, 4, 5]);
    assert.ok(a.includes(azar(a)));
  });
  test('fechas en hora local', () => {
    const t = new Date(2026, 9, 30, 15).getTime();       // jueves 30 oct 2026
    assert.equal(claveDia(t), '2026-10-30');
    assert.equal(claveDia(lunesDe(t)), '2026-10-26');
    assert.equal(claveDia(lunesDe(t) + 6 * DIA_MS), '2026-11-01');
  });
  test('cuentas', () => {
    assert.equal(sumar([{ a: 1 }, { a: 2 }, {}], (x) => x.a), 3);
    assert.equal(porcentaje(1, 3), 33);
    assert.equal(porcentaje(1, 0), null);
    assert.equal(redondear1(1.26), 1.3);
  });
  test('eventos: un oyente que falla no impide a los demás', () => {
    const oidos = [];
    const baja = escuchar('prueba', (d) => oidos.push(d));
    escuchar('prueba', () => { throw new Error('a propósito'); });
    const errorOriginal = console.error; console.error = () => {};
    emitir('prueba', 1); baja(); emitir('prueba', 2);
    console.error = errorOriginal;
    assert.deepEqual(oidos, [1]);
  });
  test('base64 ida y vuelta', () => {
    const bytes = new TextEncoder().encode('¡Hola, Alaia! 🦉');
    assert.deepEqual(deBase64(aBase64(bytes)), bytes);
  });
});
