/**
 * @file Menú de «Practicar»: dictado, taller de frases, lectura repetida y mi frase.
 *
 * Capa: pantallas (practica). Navega a: inicio, dictado, taller,
 * lectura-repetida, mi-frase. Refuerza lo que pide el cole en lectoescritura:
 * dictados, elaboración de oraciones, comprensión y velocidad lectora. Si los
 * mayores han puesto los deberes de la semana, se usan primero.
 */
import { $, $$, esc } from '../../util/dom.js';
import { fijarPartida } from '../../estado/sesion.js';
import { deberes, hayDeberes } from '../../dominio/deberes.js';
import { app, ir, irA, registrarPantalla } from '../../ui/navegacion.js';
import { cabecera, botonVolver } from '../../ui/cabecera.js';
import { palabras } from '../../ui/palabras.js';

/** Actividades del menú, en orden. Para añadir una: su pantalla y una línea aquí. */
const ACTIVIDADES = [
  { id: 'dictado', icono: '✍️', titulo: 'Dictado mágico', desc: 'Escucha la palabra y escríbela con sílabas.' },
  { id: 'taller', icono: '🧩', titulo: 'Taller de frases', desc: 'Ordena las palabras y completa frases.' },
  { id: 'lectura-repetida', icono: '⚡', titulo: 'Lectura relámpago', desc: 'Lee el mismo texto tres veces. ¡Cada vez más rápido!' },
  { id: 'mi-frase', icono: '📝', titulo: 'Mi frase', desc: 'Escribe tu propia frase y escúchala.' }
];

/** «1 palabra», «3 palabras». */
const cuantas = (n, una, varias) => `${n} ${n === 1 ? una : varias}`;

function pantallaPractica() {
  fijarPartida(null);
  const d = deberes();
  app.innerHTML = `
    ${cabecera(botonVolver('← Casa'))}
    <section class="practica">
      <h1 class="titulo-grande">${palabras('🪄 Practicar')}</h1>
      ${hayDeberes() ? `<p class="aviso-deberes">📚 ${esc(`Con los deberes del cole: ${cuantas(d.palabras.length, 'palabra', 'palabras')} y ${cuantas(d.frases.length, 'frase', 'frases')}.`)}</p>` : ''}
      <ul class="rejilla-practica">${ACTIVIDADES.map((a) => `
        <li><button class="tarjeta-practica" data-actividad="${a.id}">
          <span class="practica-icono emoji" aria-hidden="true">${a.icono}</span>
          <b>${esc(a.titulo)}</b><span>${esc(a.desc)}</span></button></li>`).join('')}</ul>
    </section>`;
  $('#volver').onclick = irA('inicio');
  $$('[data-actividad]').forEach((b) => { b.onclick = () => ir(b.dataset.actividad); });
}

registrarPantalla('practica', pantallaPractica);
