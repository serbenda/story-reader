/**
 * @file La tienda: complementos, vestidos y mascotas que se compran con estrellas.
 *
 * Capa: pantallas. Navega a: inicio. Para comprar hay que tocar dos veces
 * («¿Seguro? Toca otra vez»), así no se gastan estrellas sin querer.
 */
import { estado, guardar, fijarPartida } from '../estado/sesion.js';
import { SECCIONES_TIENDA } from '../config/index.js';
import * as Arte from '../arte/index.js';
import * as Sonido from '../servicios/sonido.js';
import { $, $$, esc, confirmarConSegundoToque } from '../util/dom.js';
import { saldo } from '../dominio/estrellas.js';
import { protagonistas, sonDosNinas } from '../dominio/protagonistas.js';
import { articulosTienda, comprado, comprar, ponerArticulo } from '../dominio/tienda.js';
import { app, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera, botonVolver } from '../ui/cabecera.js';
import { palabras } from '../ui/palabras.js';
import { aviso, confeti } from '../ui/avisos.js';

/** Cómo se ve el artículo: la niña con él puesto, o el emoji de la mascota. */
function vistaPrevia(a) {
  if (a.tipo === 'mascota') return `<span class="emoji tienda-emoji">${a.emoji}</span>`;
  const cfg = Object.assign({}, estado.perfil.alaya, a.tipo === 'accesorio' ? { accesorio: a.valor } : { estampado: a.valor });
  return Arte.nina(cfg, 'largo');
}

/** Pie de la tarjeta: ponérselo, comprarlo o cuántas estrellas faltan. */
function pieArticulo(a) {
  if (comprado(a.id)) {
    if (a.tipo === 'mascota') return `<button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="mascota">Elegir como mascota</button>`;
    const n = protagonistas();
    return `<div class="poner"><button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="alaya">Para ${esc(n.lectora)}</button>${sonDosNinas() ? `<button class="boton boton-suave boton-chico" data-poner="${a.id}" data-quien="lucia">Para ${esc(n.hermana)}</button>` : ''}</div>`;
  }
  const falta = a.precio - saldo();
  if (falta > 0) return `<button class="boton boton-chico boton-falta" disabled>Te faltan ${falta} ⭐</button>`;
  return `<button class="boton boton-principal boton-chico" data-comprar="${a.id}">Comprar · ${a.precio} ⭐</button>`;
}

function tarjeta(a) {
  const tiene = comprado(a.id);
  return `<li class="articulo${tiene ? ' comprado' : ''}">
    <div class="articulo-vista">${vistaPrevia(a)}</div>
    <div class="articulo-texto"><b>${esc(a.nombre)}</b>${tiene ? '<span class="sello-tuyo">✓ ¡Es tuyo!</span>' : `<span class="precio">${a.precio} ⭐</span>`}</div>
    ${pieArticulo(a)}</li>`;
}

function pantallaTienda() {
  fijarPartida(null);
  const arts = articulosTienda();
  const porId = (id) => arts.find((x) => x.id === id);
  app.innerHTML = `
    ${cabecera(botonVolver())}
    <section class="tienda">
      <div class="tienda-cabecera">
        <h1 class="titulo-grande">La tienda</h1>
        <p class="saldo-grande"><span aria-hidden="true">⭐</span> <b>${saldo()}</b> <span>estrellas para gastar</span></p>
      </div>
      <p class="pista-pequena">${palabras('Las estrellas se ganan leyendo en voz alta, acertando preguntas, abriendo cerraduras y cumpliendo la meta del día.')}</p>
      ${SECCIONES_TIENDA.map(([tipo, titulo]) => `<h2 class="titulo">${titulo}</h2><ul class="rejilla-tienda">${arts.filter((a) => a.tipo === tipo).map(tarjeta).join('')}</ul>`).join('')}
    </section>`;
  $('#volver').onclick = irA('inicio');

  $$('[data-comprar]').forEach((b) => confirmarConSegundoToque(b, {
    pregunta: '¿Seguro? Toca otra vez',
    clase: 'seguro',
    alConfirmar: () => {
      const a = porId(b.dataset.comprar);
      if (!comprar(a)) return;
      guardar();
      Sonido.tocar('tesoro'); confeti(70);
      aviso(`🎉 ¡${a.nombre} ya es tuyo!`);
      pantallaTienda();
    }
  }));
  $$('[data-poner]').forEach((b) => {
    b.onclick = () => {
      const a = porId(b.dataset.poner);
      ponerArticulo(a, b.dataset.quien);
      guardar(); Sonido.tocar('bien');
      aviso(a.tipo === 'mascota' ? `${a.emoji} ¡Ahora ${estado.perfil.mascota.nombre} es ${a.nombre.toLowerCase()}!` : '✨ ¡Listo! Mira qué guapa.');
      pantallaTienda();
    };
  });
}

registrarPantalla('tienda', pantallaTienda);
