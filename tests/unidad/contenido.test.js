/**
 * @file Pruebas de src/contenido: plantillas, alternativas, bloques, escenas y sílabas.
 * Ejecutar: node --test tests/unidad/
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rellenar, alternativas, capitalizar, mayusculasDeFrase, VAR_DOS } from '../../src/contenido/plantillas.js';
import { bloques, limpiarPistas, pistasDe } from '../../src/contenido/bloques.js';
import { parsearEscenas, separarCabecera, versionesPara } from '../../src/contenido/escenas.js';
import { silabas, partesDePalabra } from '../../src/contenido/silabas.js';

describe('plantillas', () => {
  test('rellena variables y respeta la mayúscula pedida', () => {
    assert.equal(rellenar('{mascota} corre. {Ayudante} mira.', { mascota: 'Toby', ayudante: 'el búho' }), 'Toby corre. El búho mira.');
  });
  test('deja las variables desconocidas tal cual', () => {
    assert.equal(rellenar('Hola {nadie}', {}), 'Hola {nadie}');
  });
  test('una variable puede contener otras', () => {
    assert.equal(rellenar('{a}', { a: '{b}', b: 'fin' }), 'Fin');
  });
  test('alternativas para dos o una niña', () => {
    const t = '{{Las niñas corren|La niña corre}} al río.';
    assert.equal(alternativas(t, true), 'Las niñas corren al río.');
    assert.equal(alternativas(t, false), 'La niña corre al río.');
  });
  test('una alternativa vacía para una niña quita la línea', () => {
    assert.equal(alternativas('Uno\n{{Lucía se ríe.|}}\nDos', false), 'Uno\nDos');
  });
  test('las alternativas admiten variables dentro', () => {
    assert.equal(rellenar('{{{lectora} y {hermana}|{lectora}}} leen.', { lectora: 'Alaia', hermana: 'Lucía', [VAR_DOS]: false }), 'Alaia leen.');
    assert.equal(rellenar('{{{lectora} y {hermana}|{lectora}}} leen.', { lectora: 'Alaia', hermana: 'Lucía' }), 'Alaia y Lucía leen.');
  });
  test('una alternativa sin cerrar se deja como está', () => {
    assert.equal(alternativas('Hola {{sin cerrar', true), 'Hola {{sin cerrar');
  });
  test('mayúsculas al empezar frase, tras signos y en citas', () => {
    assert.equal(capitalizar('¡hola!'), '¡Hola!');
    assert.equal(mayusculasDeFrase('> hola. adiós: «ven»'), '> Hola. Adiós: «Ven»');
  });
});

describe('bloques', () => {
  test('distingue texto, voz y pregunta con opciones', () => {
    const b = bloques('Había una vez.\n> Lee esto.\n? ¿Adónde?\n* al río\n- a la cueva');
    assert.deepEqual(b.map((x) => x.tipo), ['texto', 'voz', 'pregunta']);
    assert.deepEqual(b[2].opciones, [{ texto: 'Al río', correcta: true }, { texto: 'A la cueva', correcta: false }]);
  });
  test('las pistas se encuentran y se limpian', () => {
    assert.deepEqual(pistasDe('Vio [[huellas de barro]] y [[una pluma]].'), ['Huellas de barro', 'Una pluma']);
    assert.equal(limpiarPistas('Vio [[huellas]].'), 'Vio huellas.');
  });
});

describe('escenas', () => {
  const md = `<!-- comentario -->
## inicio
@fondo: bosque
@con: mascota, ayudante
### Aprendiz
Texto corto.
---
Otra versión.
### Todos
Para todos.
## final
@final
### Novatilla
Fin.`;
  const escenas = parsearEscenas(md, 'prueba.md');
  test('lee escenas, propiedades y versiones', () => {
    assert.equal(escenas.length, 2);
    assert.deepEqual(escenas[0].props, { fondo: 'bosque', con: ['mascota', 'ayudante'] });
    assert.deepEqual(escenas[0].niveles.aprendiz, ['Texto corto.', 'Otra versión.']);
    assert.equal(escenas[1].props.final, true);
  });
  test('usa «todos» si el nivel no tiene texto propio', () => {
    assert.deepEqual(versionesPara(escenas[0], 'lectora'), ['Para todos.']);
    assert.equal(versionesPara(escenas[1], 'aprendiz'), null);
  });
  test('separa la cabecera YAML del cuerpo', () => {
    globalThis.window = { jsyaml: { load: (t) => ({ crudo: t }) } };
    const { meta, cuerpo } = separarCabecera('---\ntitulo: Hola\n---\n## escena\n');
    assert.deepEqual(meta, { crudo: 'titulo: Hola' });
    assert.equal(cuerpo, '## escena\n');
    assert.deepEqual(separarCabecera('sin cabecera').meta, {});
  });
});

describe('sílabas', () => {
  const casos = {
    mariposa: 'ma-ri-po-sa', brillante: 'bri-llan-te', construir: 'cons-truir', ahora: 'a-ho-ra',
    dia: 'dia', 'día': 'dí-a', pingüino: 'pin-güi-no', atleta: 'at-le-ta', buey: 'buey', guerra: 'gue-rra',
    queso: 'que-so', perro: 'pe-rro', chocolate: 'cho-co-la-te', aire: 'ai-re', leer: 'le-er', rey: 'rey'
  };
  for (const [palabra, esperado] of Object.entries(casos)) {
    test(`${palabra} → ${esperado}`, () => assert.equal(silabas(palabra).join('-'), esperado));
  }
  test('lo que no son solo letras no se separa', () => assert.deepEqual(silabas('3D'), ['3D']));
  test('separa los signos de una palabra', () => assert.deepEqual(partesDePalabra('¡Hola!'), ['¡', 'Hola', '!']));
});
