/**
 * @file Informe de lectura para mayores: cifras de la semana, lectoescritura
 * (velocidad, comprensión, dictado, taller), recomendación de nivel, gráficos,
 * palabras difíciles de leer y de escribir, sus frases y últimas partidas.
 * Se puede imprimir o guardar en PDF para el cole (css/base/impresion.css).
 *
 * Capa: pantallas. Navega a: ajustes. Los cálculos están en src/dominio/informe.js.
 */
import { estado, guardar } from '../estado/sesion.js';
import { nivelPorId } from '../config/index.js';
import * as Grabaciones from '../servicios/grabaciones.js';
import { $, $$, esc } from '../util/dom.js';
import { fechaCorta, hora } from '../util/fechas.js';
import { porcentaje } from '../util/numeros.js';
import { protagonistas } from '../dominio/protagonistas.js';
import { palabrasDificiles, palabrasConquistadas } from '../dominio/registro-lectura.js';
import { recomendacionNivel, resumenSemana, frasesPorDia, velocidadPorDia, ultimosEscritos, formatear, textoResumen } from '../dominio/informe.js';
import { palabrasDificilesDeEscribir } from '../dominio/practica.js';
import { app, irA, registrarPantalla } from '../ui/navegacion.js';
import { cabecera, botonVolver } from '../ui/cabecera.js';
import { aviso } from '../ui/avisos.js';
import { decir } from '../ui/voz-alta.js';
import { graficoDias } from '../ui/componentes/grafico-dias.js';
import { graficoVelocidad } from '../ui/componentes/grafico-velocidad.js';
import { activarGrabaciones } from '../ui/componentes/grabaciones.js';
import { copiarOMostrar } from '../ui/componentes/copiar.js';

/** Palabras difíciles que se enseñan. */
const MAX_DIFICILES = 12;
/** Partidas de la tabla. */
const MAX_PARTIDAS = 12;
/** Puntos de los marcadores de palabras. */
const MAX_PUNTOS = 8;
const ETIQUETAS_RECOMENDACION = { subir: '⬆ Subir de nivel', bajar: '⬇ Bajar de nivel', mantener: '✓ Mantener nivel', neutro: 'Nivel' };

/** «▲ 5 puntos», «▼ 3 puntos», «igual» o nada. */
function tendencia(s) {
  if (s.primera == null || s.primeraAnt == null) return '';
  if (s.primera > s.primeraAnt) return `<span class="tendencia sube">▲ ${s.primera - s.primeraAnt} puntos</span>`;
  if (s.primera < s.primeraAnt) return `<span class="tendencia baja">▼ ${s.primeraAnt - s.primera} puntos</span>`;
  return '<span class="tendencia">igual</span>';
}

const cifras = (s) => `<div class="cifras">
  <div class="cifra"><b>${s.frases}</b><span>frases leídas en voz alta</span></div>
  <div class="cifra"><b>${formatear(s.primera, ' %')}</b><span>frases a la primera ${tendencia(s)}</span></div>
  <div class="cifra"><b>${formatear(s.preguntas, ' %')}</b><span>preguntas acertadas a la primera</span></div>
  <div class="cifra"><b>${formatear(s.retos, ' %')}</b><span>cerraduras (b/d, p/q…) a la primera</span></div>
  <div class="cifra"><b>${s.minutos}</b><span>minutos leyendo · ${s.capitulos} capítulos</span></div>
</div>
<h2 class="titulo">Lectoescritura</h2>
<div class="cifras">
  <div class="cifra"><b>${formatear(s.ppm)}</b><span>palabras por minuto leyendo en voz alta ${tendenciaVelocidad(s)}</span></div>
  <div class="cifra"><b>${formatear(s.comprension, ' %')}</b><span>comprensión al final del capítulo, sin el texto delante</span></div>
  <div class="cifra"><b>${formatear(s.dictado, ' %')}</b><span>dictado: palabras bien a la primera</span></div>
  <div class="cifra"><b>${formatear(s.taller, ' %')}</b><span>taller de frases a la primera</span></div>
  <div class="cifra"><b>${s.mejora == null ? '—' : (s.mejora > 0 ? '+' : '') + s.mejora + ' %'}</b><span>lectura relámpago: de la 1.ª a la 3.ª lectura</span></div>
</div>`;

/** «▲ 6 ppm» frente a la semana anterior. */
function tendenciaVelocidad(s) {
  if (s.ppm == null || s.ppmAnt == null || s.ppm === s.ppmAnt) return '';
  return s.ppm > s.ppmAnt ? `<span class="tendencia sube">▲ ${s.ppm - s.ppmAnt}</span>` : `<span class="tendencia baja">▼ ${s.ppmAnt - s.ppm}</span>`;
}

function listaDificilesEscribir() {
  const lista = palabrasDificilesDeEscribir().slice(0, MAX_DIFICILES);
  if (!lista.length) return '<p class="nota">Aún no hay datos. Salen al hacer el dictado mágico en «Practicar».</p>';
  return `<div class="chips">${lista.map(([w, p]) => `<button class="chip palabra-informe" data-oir="${esc(w)}">🔊 ${esc(w)} <small>falla ${p.f}</small></button>`).join('')}</div>`;
}

function listaEscritos() {
  const escritos = ultimosEscritos(8);
  if (!escritos.length) return '<p class="nota">Cuando escriba en «Mi frase», sus frases aparecerán aquí para que las repaséis juntos.</p>';
  return `<ul class="lista-escritos">${escritos.map((e) => `<li><span class="nota">${fechaCorta(e.fecha)}</span> «${esc(e.texto)}»</li>`).join('')}</ul>`;
}

const recomendacion = (rec) => `<div class="recomendacion rec-${rec.tipo}">
  <span class="rec-etiqueta">${ETIQUETAS_RECOMENDACION[rec.tipo]}</span>
  <p>${esc(rec.texto)}</p>
  ${rec.nivel ? `<button class="boton boton-suave boton-chico" id="aplicar-nivel">Cambiar a ${rec.nivel.icono} ${esc(rec.nivel.nombre)}</button>` : ''}
</div>`;

function listaDificiles() {
  const dificiles = palabrasDificiles().slice(0, MAX_DIFICILES);
  if (!dificiles.length) return '<p class="nota">Aún no hay palabras difíciles. Necesita jugar con el micro para detectarlas.</p>';
  return `<ul class="lista-palabras">${dificiles.map(([w, p]) => `
    <li><button class="palabra-informe" data-oir="${esc(w)}" aria-label="Escuchar ${esc(w)}">🔊 ${esc(w)}</button>
    <span class="marcador">${'●'.repeat(Math.min(p.a, MAX_PUNTOS))}<span class="falta-marca">${'○'.repeat(Math.max(0, Math.min(MAX_PUNTOS, p.f + 2 - p.a)))}</span></span>
    <span class="nota">falla ${p.f} · acierta ${p.a}</span>
    ${Grabaciones.soportado() ? `<button class="boton boton-suave boton-chico" data-grabar="${esc(w)}">🎙️ ${Grabaciones.tiene(w) ? 'Regrabar tu voz' : 'Grabar tu voz'}</button>` : ''}</li>`).join('')}</ul>`;
}

function listaConquistadas() {
  const ganadas = palabrasConquistadas();
  if (!ganadas.length) return '<p class="nota">Cuando acierte varias veces una palabra difícil, aparecerá aquí.</p>';
  return `<div class="chips">${ganadas.map(([w]) => `<span class="chip chip-ganada">✓ ${esc(w)}</span>`).join('')}</div>`;
}

function tablaPartidas() {
  const R = estado.registro;
  if (!R.length) return '<p class="nota">Sin partidas todavía.</p>';
  return `<div class="tabla-sitio"><table class="tabla">
    <thead><tr><th>Fecha</th><th>Capítulo</th><th>Nivel</th><th class="num">Frases</th><th class="num">A la primera</th><th class="num">Preguntas</th><th class="num">Minutos</th><th>Estado</th></tr></thead>
    <tbody>${R.slice(-MAX_PARTIDAS).reverse().map((r) => {
      const nv = nivelPorId(r.nivel);
      return `<tr>
      <td>${fechaCorta(r.fecha)} ${hora(r.fecha)}</td>
      <td>${esc(r.titulo)}</td><td>${nv.icono} ${nv.nombre}</td>
      <td class="num">${r.frases}</td>
      <td class="num">${r.micro ? formatear(porcentaje(r.frasesPrimera, r.frases), ' %') : 'sin micro'}</td>
      <td class="num">${r.preguntas ? `${r.preguntasPrimera}/${r.preguntas}` : '—'}</td>
      <td class="num">${Math.max(1, Math.round(r.seg / 60))}</td>
      <td>${r.terminado ? '<span class="estado est-ok">Terminado</span>' : '<span class="estado est-pausa">A medias</span>'}</td></tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function pantallaInforme() {
  const lectora = protagonistas().lectora, vacio = !estado.registro.length;
  const s = resumenSemana(), rec = recomendacionNivel();
  app.innerHTML = `
    ${cabecera(botonVolver())}
    <section class="informe">
      <div class="informe-titulo">
        <div><p class="sobretitulo">Últimos 7 días</p><h1 class="titulo-grande">Así lee ${esc(lectora)}</h1></div>
        <div class="acciones-informe">
          <button class="boton boton-suave" id="copiar" ${vacio ? 'disabled' : ''}>📋 Copiar resumen</button>
          <button class="boton boton-suave" id="imprimir" ${vacio ? 'disabled' : ''}>🖨️ Imprimir para el cole</button>
        </div>
      </div>
      ${vacio ? `<div class="vacio-informe"><p>${esc(`Todavía no hay partidas. Cuando ${lectora} juegue, aquí verás cuántas frases lee, cuáles le salen a la primera y qué palabras le cuestan.`)}</p></div>` : ''}
      ${cifras(s)}
      ${recomendacion(rec)}
      <div class="tarjeta-informe">
        <h2 class="titulo">Frases leídas cada día</h2>
        <div class="leyenda"><span><i class="l-primera"></i>A la primera</span><span><i class="l-resto"></i>Repitiendo o sin micro</span></div>
        <div class="grafico-sitio">${graficoDias(frasesPorDia())}</div>
      </div>
      <div class="tarjeta-informe">
        <h2 class="titulo">Velocidad lectora</h2>
        <p class="nota">Palabras por minuto al leer en voz alta con el micro (cada día que juega). Lo importante es la tendencia, no el número de un día.</p>
        <div class="grafico-sitio">${graficoVelocidad(velocidadPorDia())}</div>
      </div>
      <div class="dos-columnas">
        <div class="tarjeta-informe">
          <h2 class="titulo">Palabras que le cuesta escribir</h2>
          ${listaDificilesEscribir()}
        </div>
        <div class="tarjeta-informe">
          <h2 class="titulo">Lo que ha escrito ella</h2>
          ${listaEscritos()}
        </div>
      </div>
      <div class="dos-columnas">
        <div class="tarjeta-informe">
          <h2 class="titulo">Palabras que le cuesta leer</h2>
          <p class="nota">Salen como «palabras mágicas» al empezar cada capítulo hasta que las conquista (acertarlas 2 veces más de las que las ha fallado).</p>
          ${listaDificiles()}
        </div>
        <div class="tarjeta-informe">
          <h2 class="titulo">Palabras conquistadas</h2>
          ${listaConquistadas()}
        </div>
      </div>
      <div class="tarjeta-informe">
        <h2 class="titulo">Últimas partidas</h2>
        ${tablaPartidas()}
      </div>
    </section>`;

  $('#volver').onclick = irA('ajustes');
  $$('[data-oir]').forEach((b) => { b.onclick = () => decir(b.dataset.oir); });
  activarGrabaciones(pantallaInforme);
  if (rec.nivel) $('#aplicar-nivel').onclick = () => { estado.nivel = rec.nivel.id; guardar(); aviso(`Nivel cambiado a ${rec.nivel.nombre}.`); pantallaInforme(); };
  $('#imprimir').onclick = () => window.print();
  const resumen = textoResumen();   // con las cifras de cuando se abrió la pantalla
  $('#copiar').onclick = () => copiarOMostrar(resumen, {
    titulo: 'Resumen', idCaja: 'resumen-copia', exito: 'Resumen copiado. Puedes pegarlo en un mensaje.', filas: 9
  });
}

registrarPantalla('informe', pantallaInforme);
