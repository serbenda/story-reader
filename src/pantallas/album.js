/**
 * @file Álbum: pegatinas de capítulos, amigos de los cuentos y tesoros encontrados.
 *
 * Capa: pantallas. Navega a: inicio. Lo que aún no se ha conseguido sale
 * como «❔» para dar ganas de buscarlo.
 */
import { estado, catalogo } from '../estado/sesion.js';
import * as Arte from '../arte/index.js';
import { rellenar, capitalizar } from '../contenido/plantillas.js';
import { $, esc } from '../util/dom.js';
import { protagonistas, sonDosNinas, buscadoraDeTesoros } from '../dominio/protagonistas.js';
import { varsBasicas, tituloCapitulo } from '../dominio/variables.js';
import { clavePegatina } from '../dominio/progreso.js';
import { app, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera, botonVolver } from '../ui/cabecera.js';
import { palabras } from '../ui/palabras.js';

/** Fichas de todos los libros: amigos, tesoros (sin repetir) y pegatinas. */
function fichas() {
  const amigos = [], tesoros = [], pegatinas = [], vistos = new Set();
  for (const libro of catalogo.libros) {
    for (const [k, A] of Object.entries(libro.meta.ayudantes || {})) {
      const conocido = estado.album.amigos[k];
      amigos.push(`<li class="ficha${conocido ? '' : ' oculta'}"><span class="emoji">${conocido ? A.emoji : '❔'}</span>
        <span class="ficha-nombre">${conocido ? esc(A.nombre) : '???'}</span>
        ${conocido ? `<span class="ficha-desc">${palabras(capitalizar(rellenar(A.descripcion, varsBasicas())))}</span>` : ''}</li>`);
    }
    for (const t of libro.meta.tesoros || []) {
      if (vistos.has(t.emoji)) continue;
      vistos.add(t.emoji);
      const n = estado.album.tesoros[t.emoji] || 0;
      tesoros.push(`<li class="tesoro-album${n ? '' : ' oculta'}" title="${esc(t.nombre)}"><span class="emoji">${n ? t.emoji : '❔'}</span>${n > 1 ? `<span class="cuenta">×${n}</span>` : ''}</li>`);
    }
    libro.capitulos.forEach((c, i) => {
      const p = estado.album.pegatinas[clavePegatina(libro.id, c.id)];
      pegatinas.push(`<li class="pegatina${p ? '' : ' oculta'}"><span class="emoji">${p || '❔'}</span><span class="ficha-nombre">${p ? esc(tituloCapitulo(c)) : `Capítulo ${i + 1}`}</span></li>`);
    });
  }
  return { amigos, tesoros, pegatinas };
}

function pantallaAlbum() {
  const { amigos, tesoros, pegatinas } = fichas();
  const m = estado.perfil.mascota, esp = catalogo.mascotas[m.especie] || {};
  app.innerHTML = `
    ${cabecera(botonVolver())}
    <section class="album">
      <h1 class="titulo-grande">Mi álbum</h1>
      <div class="album-equipo">
        <div class="mini-nina">${Arte.nina(estado.perfil.alaya, 'largo')}</div>
        ${sonDosNinas() ? `<div class="mini-nina peque">${Arte.nina(estado.perfil.lucia, 'coletas')}</div>` : ''}
        <div class="mini-mascota"><span class="emoji">${esp.emoji || '🐶'}</span><span class="ficha-nombre">${esc(m.nombre)}</span></div>
      </div>
      <h2 class="titulo">Pegatinas</h2><ul class="rejilla rejilla-pegatinas">${pegatinas.join('')}</ul>
      <h2 class="titulo">Amigos de los cuentos</h2><ul class="rejilla rejilla-amigos">${amigos.join('')}</ul>
      <h2 class="titulo">${sonDosNinas() ? `Tesoros de ${esc(protagonistas().hermana)}` : 'Tesoros escondidos'}</h2>
      <p class="pista-pequena">${esc(buscadoraDeTesoros())} encuentra cosas escondidas en los dibujos. ¡Hay que tocarlas!</p>
      <ul class="rejilla rejilla-tesoros">${tesoros.join('')}</ul>
    </section>`;
  $('#volver').onclick = irA('inicio');
}

registrarPantalla('album', pantallaAlbum);
