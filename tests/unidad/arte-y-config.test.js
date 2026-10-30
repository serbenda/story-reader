/**
 * @file Pruebas del arte y de la coherencia de la configuración.
 * Ejecutar: node --test tests/unidad/
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAISAJES, paisaje, nina } from '../../src/arte/index.js';
import { aleatorio } from '../../src/arte/aleatorio.js';
import { accesorio } from '../../src/arte/personajes/complementos.js';
import { estampado } from '../../src/arte/personajes/estampados.js';
import { NIVELES, TOLERANCIAS, ARTICULOS_TIENDA, APARIENCIA, METAS, posicionDeNivel, nivelPorId } from '../../src/config/index.js';
import { NIVELES_DE_TEXTO } from '../../src/contenido/escenas.js';

const sinIds = (s) => s.replace(/\b(g|b|est)\d+\b/g, '$1#');

describe('arte', () => {
  test('el azar con semilla es repetible', () => {
    const a = aleatorio(42), b = aleatorio(42);
    for (let i = 0; i < 5; i++) assert.equal(a(), b());
    assert.notEqual(aleatorio(1)(), aleatorio(2)());
  });
  for (const tipo of Object.keys(PAISAJES)) {
    test(`paisaje «${tipo}» de día y de noche, igual con la misma semilla`, () => {
      for (const noche of [false, true]) {
        const svg = paisaje(tipo, { noche, semilla: 7 });
        assert.match(svg, /^<svg class="fondo"[\s\S]*<\/svg>$/);
        assert.equal(sinIds(svg), sinIds(paisaje(tipo, { noche, semilla: 7 })));
      }
    });
  }
  test('todos los complementos y estampados de la configuración se dibujan', () => {
    for (const a of Object.keys(APARIENCIA.accesorio).filter((k) => k !== 'ninguno')) assert.ok(accesorio(a, '#000'), a);
    for (const art of ARTICULOS_TIENDA) {
      if (art.tipo === 'accesorio') assert.ok(accesorio(art.valor, '#000'), art.id);
      if (art.tipo === 'estampado') assert.ok(estampado(art.valor), art.id);
    }
  });
  test('una niña es un SVG completo', () => {
    assert.match(nina({ piel: '#fff', pelo: '#000', vestido: '#f00', accesorio: 'tiara', estampado: 'rayas' }, 'coletas'), /^<svg[\s\S]*<\/svg>$/);
  });
});

describe('configuración', () => {
  test('los niveles de la configuración y los de los cuentos coinciden', () => {
    assert.deepEqual(NIVELES.map((n) => n.id), NIVELES_DE_TEXTO.filter((n) => n !== 'todos'));
    assert.equal(posicionDeNivel('lectora'), 2);
    assert.equal(nivelPorId('no-existe').id, NIVELES[0].id);
  });
  test('las tolerancias van de más a menos permisiva', () => {
    const t = Object.values(TOLERANCIAS);
    for (let i = 1; i < t.length; i++) assert.ok(t[i].umbral > t[i - 1].umbral && t[i].pasa > t[i - 1].pasa);
  });
  test('los artículos de la tienda tienen id único y precio', () => {
    const ids = ARTICULOS_TIENDA.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const a of ARTICULOS_TIENDA) assert.ok(a.precio > 0, a.id);
  });
  test('las metas por minutos son números positivos', () => {
    for (const m of Object.values(METAS)) assert.ok(m.min === undefined || m.min > 0);
  });
  test('las mascotas de stories/index.json tienen emoji y nombres', () => {
    const idx = JSON.parse(readFileSync(new URL('../../stories/index.json', import.meta.url)));
    for (const [k, m] of Object.entries(idx.mascotas)) assert.ok(m.emoji && m.chico && m.chica, k);
  });
});
