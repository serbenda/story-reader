/**
 * @file Pantalla de bienvenida: solo se ve la primera vez (cuando aún no hay perfil).
 *
 * Capa: pantallas. Navega a: personalizar.
 */
import { $ } from '../util/dom.js';
import * as Sonido from '../servicios/sonido.js';
import { app, ir, registrarPantalla } from '../ui/navegacion.js';
import { palabras } from '../ui/palabras.js';

function pantallaBienvenida() {
  app.innerHTML = `
    <section class="portada">
      <p class="sobretitulo">Un juego para leer</p>
      <h1 class="titulo-grande">La biblioteca mágica</h1>
      <div class="texto texto-portada">
        <p class="linea">${palabras('¡Hola! Hoy empieza una aventura muy especial.')}</p>
        <p class="linea">${palabras('Primero vamos a elegir a las protagonistas y a su mascota.')}</p>
      </div>
      <button class="boton boton-principal boton-grande" id="empezar">¡Vamos!</button>
      <p class="pista-pequena">Toca cualquier palabra para oírla.</p>
    </section>`;
  $('#empezar').onclick = () => { Sonido.tocar('pagina'); ir('personalizar', { primeraVez: true }); };
}

registrarPantalla('bienvenida', pantallaBienvenida);
