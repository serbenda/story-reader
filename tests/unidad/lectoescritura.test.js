/**
 * @file Pruebas de la lectoescritura: frases (ordenar, completar, diálogos,
 * velocidad) y dictado (fichas de sílabas y corrección con teclado).
 * Ejecutar: node --test "tests/unidad/*.test.js"
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { partirFrases, contarPalabras, fraseApta, prepararOrdenar, comprobarOrden, montarFrase, prepararHueco, extraerDialogos, palabrasPorMinuto } from '../../src/contenido/frases.js';
import { fichasDeDictado, silabasParecidas, corregirEscrito } from '../../src/contenido/dictado.js';

describe('frases', () => {
  test('parte en frases y quita marcas de voz y pistas, sin preguntas ni opciones', () => {
    assert.deepEqual(partirFrases('Hola. ¿Vamos?\n> Lee [[esto]] ya.\n? ¿Adónde?\n* Al río'), ['Hola.', '¿Vamos?', 'Lee esto ya.']);
  });
  test('cuenta palabras', () => assert.equal(contarPalabras('El búho, Bruno, mira 3 lunas.'), 6));
  test('solo valen frases completas sin diálogos y del largo pedido', () => {
    assert.ok(fraseApta('El perro corre por el parque.', { min: 3, max: 8 }));
    assert.ok(!fraseApta('«Ven», dice Bruno.', { min: 1, max: 8 }));
    assert.ok(!fraseApta('Sin punto final', { min: 1, max: 8 }));
    assert.ok(!fraseApta('Muy corta.', { min: 3, max: 8 }));
  });
  test('ordenar: quita mayúscula y punto, baraja y se puede comprobar', () => {
    const e = prepararOrdenar('El perro corre por el parque.');
    assert.deepEqual(e.correcta, ['el', 'perro', 'corre', 'por', 'el', 'parque']);
    assert.equal(e.final, '.');
    assert.notDeepEqual(e.piezas, e.correcta);
    assert.deepEqual([...e.piezas].sort(), [...e.correcta].sort());
    assert.ok(comprobarOrden(e.correcta, e.correcta).every(Boolean));
    assert.equal(montarFrase(e.correcta, { mayuscula: true, final: '.' }), 'El perro corre por el parque.');
  });
  test('ordenar: los nombres propios conservan la mayúscula', () => {
    assert.equal(prepararOrdenar('Toby salta muy alto.').correcta[0], 'Toby');
  });
  test('completar: quita una palabra y da tres opciones con la buena', () => {
    const h = prepararHueco('La mariposa vuela sobre el jardín.', ['montaña', 'bicicleta', 'castillo', 'nube']);
    assert.ok(h);
    assert.equal(h.opciones.length, 3);
    assert.ok(h.opciones.includes(h.correcta));
    assert.equal(`${h.antes} ${h.correcta}${h.despues}`, 'La mariposa vuela sobre el jardín.');
  });
  test('completar: sin palabras adecuadas no hay hueco', () => {
    assert.equal(prepararHueco('Yo sí.', ['casa', 'mesa']), null);
  });
  test('encuentra quién dice cada cosa', () => {
    assert.deepEqual(extraerDialogos(['«Toby fue hacia el río», dice Bruno. «Vale», responde Alaia.']),
      [{ cita: 'Toby fue hacia el río', quien: 'Bruno' }]);
  });
  test('palabras por minuto, descartando medidas imposibles', () => {
    assert.equal(palabrasPorMinuto(30, 60000), 30);
    assert.equal(palabrasPorMinuto(10, 15000), 40);
    assert.equal(palabrasPorMinuto(40, 1000), null);    // 2400 ppm: no se ha leído
    assert.equal(palabrasPorMinuto(0, 5000), null);
  });
});

describe('dictado', () => {
  test('sílabas parecidas para las trampas (b/d, p/q, inversiones)', () => {
    const p = silabasParecidas('bra');
    assert.ok(p.includes('dra'));
    assert.ok(p.includes('bar'));
    assert.ok(!p.includes('bra'));
  });
  test('fichas: las sílabas de la palabra más las trampas, barajadas', () => {
    const f = fichasDeDictado('mariposa', 2);
    assert.deepEqual(f.silabas, ['ma', 'ri', 'po', 'sa']);
    assert.equal(f.fichas.length, 6);
    for (const s of f.silabas) assert.ok(f.fichas.includes(s));
  });
  test('corrige lo escrito: bien, solo tildes o mal', () => {
    assert.ok(corregirEscrito('El Búho canta', 'el búho canta.').bien);
    const t = corregirEscrito('el buho canta', 'el búho canta');
    assert.ok(!t.bien && t.soloTildes);
    const m = corregirEscrito('el bubo canta', 'el búho canta');
    assert.ok(!m.bien && !m.soloTildes);
    assert.deepEqual(m.palabras, [true, false, true]);
  });
});
