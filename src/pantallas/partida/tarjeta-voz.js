/**
 * @file Tarjeta «Lee en voz alta»: la niña lee la frase al micrófono y las
 * palabras se van poniendo verdes según las dice.
 *
 * Capa: pantallas (partida). Reglas:
 *   - Se supera cuando se leen bien suficientes palabras «significativas»
 *     (las de más de 2 letras), según la tolerancia de los ajustes.
 *   - Las palabras acertadas se quedan marcadas entre intentos: solo hay que
 *     repetir las que faltan (subrayadas).
 *   - «Escuchar» se activa después de intentarlo, para que primero lo intente sola.
 *   - Tras 3 intentos aparece «Seguir adelante»: nunca se queda atascada.
 *   - Sin micro (o si falla), se lee en voz alta y se pulsa «¡Ya lo he leído!».
 */
import { estado, partida, guardar } from '../../estado/sesion.js';
import { TOLERANCIAS, ELOGIOS, ANIMOS, ESTRELLAS } from '../../config/index.js';
import * as Voz from '../../servicios/voz/index.js';
import * as Sonido from '../../servicios/sonido.js';
import { limpiarPistas } from '../../contenido/bloques.js';
import { $, $$, esc } from '../../util/dom.js';
import { azar } from '../../util/azar.js';
import { ganarEstrellas } from '../../dominio/estrellas.js';
import { claveDePalabra, nombresPropios, anotarPalabra } from '../../dominio/registro-lectura.js';
import { htmlPalabra } from '../../ui/palabras.js';
import { aviso, confeti } from '../../ui/avisos.js';

/** Intentos tras los que se ofrece seguir sin leerla bien. */
const INTENTOS_PARA_SEGUIR = 3;
/** Sin micro, «Escuchar» se activa tras este tiempo (para que lo intente primero). */
const ESPERA_ESCUCHAR_MS = 4000;
/** Palabras de este largo o menos no cuentan para aprobar («el», «de»…). */
const LARGO_NO_SIGNIFICATIVO = 2;

/**
 * @param {Record<string, any>} b  Bloque de tipo «voz». Guarda en sí mismo su progreso
 *        (objetivo, claves, marcadas, intentos, superado).
 * @param {{alTerminar: () => void}} opciones  Se llama al superarla.
 * @returns {HTMLElement}
 */
export function tarjetaVoz(b, { alTerminar }) {
  const tol = TOLERANCIAS[estado.ajustes.tolerancia] || TOLERANCIAS.normal;
  const limpio = limpiarPistas(b.texto);
  b.objetivo = []; b.claves = []; b.intentos = 0;
  const repaso = !!(partida.escena && partida.escena.e.repaso);
  const html = limpio.split(/\s+/).filter(Boolean).map((t) => {
    const nrm = Voz.normalizar(t).join('');
    if (!nrm) return `<span class="signo">${esc(t)}</span>`;
    const k = b.objetivo.length; b.objetivo.push(nrm); b.claves.push(claveDePalabra(t));
    return `<span class="palabra" data-k="${k}">${htmlPalabra(t)}</span>`;
  }).join(' ');
  b.marcadas = b.objetivo.map(() => false);
  const sinMicro = estado.ajustes.sinMicro || !Voz.disponible();

  const el = document.createElement('div');
  el.className = 'tarjeta-voz aparece' + (repaso ? ' tarjeta-repaso' : '');
  el.innerHTML = `
    <div class="voz-cabecera"><span class="voz-icono" aria-hidden="true">${repaso ? '✨' : '🎤'}</span> ${repaso ? 'Palabras mágicas' : 'Lee en voz alta'}</div>
    <p class="frase-voz linea">${html}</p>
    <div class="voz-controles">
      <button class="boton boton-mic" ${sinMicro ? 'hidden' : ''}><span class="anillos" aria-hidden="true"></span>🎤 <span class="txt">Leer</span></button>
      <button class="boton boton-principal boton-ya" ${sinMicro ? '' : 'hidden'}>✅ ¡Ya lo he leído!</button>
      <button class="boton boton-suave boton-oir" disabled title="Se activa después de intentarlo">🔊 Escuchar</button>
    </div>
    <p class="estado-voz" role="status">${sinMicro ? 'Léela en voz alta y luego pulsa el botón verde.' : 'Pulsa el micro y lee la frase.'}</p>`;

  const mic = $('.boton-mic', el), ya = $('.boton-ya', el), oir = $('.boton-oir', el), mensaje = $('.estado-voz', el);
  const spans = $$('.palabra[data-k]', el);

  /** Pinta en verde lo acertado y en «oyendo» lo que se está entendiendo ahora. */
  const pintar = (temporal) => spans.forEach((s) => {
    const k = +s.dataset.k;
    s.classList.toggle('ok', b.marcadas[k]);
    s.classList.toggle('oyendo', !!(temporal && temporal[k] && !b.marcadas[k]));
  });
  const significativas = () => {
    const idx = b.objetivo.map((w, i) => (w.length > LARGO_NO_SIGNIFICATIVO ? i : -1)).filter((i) => i >= 0);
    return idx.length ? idx : b.objetivo.map((_, i) => i);
  };
  const aprobado = () => { const idx = significativas(); return idx.filter((i) => b.marcadas[i]).length / idx.length >= tol.pasa; };

  function superar(conAyuda) {
    if (b.superado) return;
    b.superado = true;
    b.marcadas = b.marcadas.map(() => true); pintar();
    spans.forEach((s) => s.classList.remove('falta'));
    el.classList.add('superada');
    mic.hidden = true; ya.hidden = true; oir.disabled = false;
    mensaje.textContent = conAyuda ? '¡Lo has intentado muy bien! Seguimos.' : azar(ELOGIOS);
    partida.leidas++; ganarEstrellas(ESTRELLAS.frase);
    partida.reg.frases++; partida.reg.intentos += Math.max(1, b.intentos);
    if (b.intentos === 1 && !conAyuda) partida.reg.frasesPrimera++;
    guardar();
    Sonido.tocar('bien'); confeti(16);
    setTimeout(alTerminar, 650);
  }

  /** @param {string[]} alternativas  Posibles frases entendidas por el reconocedor. */
  function evaluar(alternativas) {
    let mejor = null, mejorN = -1;
    for (const alt of alternativas) {
      const r = Voz.comparar(b.objetivo, Voz.normalizar(alt), tol.umbral);
      const cuenta = r.filter(Boolean).length;
      if (cuenta > mejorN) { mejorN = cuenta; mejor = r; }
    }
    if (mejor) b.marcadas = b.marcadas.map((m, i) => m || mejor[i]);
    // Solo cuenta el primer intento: así se ve qué palabras le cuestan de verdad
    if (b.intentos === 0) {
      const propios = nombresPropios();
      for (const i of significativas()) if (!propios.has(b.claves[i])) anotarPalabra(b.claves[i], !!(mejor && mejor[i]));
    }
    b.intentos++; oir.disabled = false;
    pintar();
    if (aprobado()) return superar(false);
    const sig = significativas();
    spans.forEach((s) => s.classList.toggle('falta', sig.includes(+s.dataset.k) && !b.marcadas[+s.dataset.k]));
    mensaje.textContent = azar(ANIMOS);
    if (b.intentos >= INTENTOS_PARA_SEGUIR) {
      ya.hidden = false; ya.textContent = 'Seguir adelante →';
      mensaje.textContent = '¡Lo estás haciendo genial! Si quieres, escucha la frase y sigue.';
    }
  }

  function pasarASinMicro(motivo) {
    mic.hidden = true; ya.hidden = false;
    mensaje.textContent = 'Léela en voz alta y luego pulsa el botón verde.';
    if (motivo) aviso(motivo, 5000);
    setTimeout(() => { oir.disabled = false; }, ESPERA_ESCUCHAR_MS);
  }

  mic.addEventListener('click', () => {
    if (Voz.escuchando()) { Voz.parar(); return; }
    if (!Voz.disponible()) return pasarASinMicro();
    Voz.callar();
    el.classList.add('escuchando'); mic.querySelector('.txt').textContent = 'Te escucho…';
    mensaje.textContent = 'Te escucho. Lee la frase con calma.';
    Voz.escuchar({
      parcial: (t) => pintar(Voz.comparar(b.objetivo, Voz.normalizar(t), tol.umbral)),
      final: evaluar,
      error: (tipo) => {
        if (Voz.ERRORES_SIN_MICRO.includes(tipo)) pasarASinMicro('El micro no está disponible aquí. Lee en voz alta y pulsa «¡Ya lo he leído!».');
        else if (tipo === 'no-speech') mensaje.textContent = 'No te he oído. Pulsa el micro y lee un poco más alto.';
        else if (tipo === 'network') mensaje.textContent = 'No hay internet para escuchar. Prueba otra vez en un momento.';
      },
      fin: () => { el.classList.remove('escuchando'); if (!b.superado) mic.querySelector('.txt').textContent = 'Leer otra vez'; pintar(); }
    });
  });
  ya.addEventListener('click', () => superar(b.intentos >= INTENTOS_PARA_SEGUIR));
  oir.addEventListener('click', () => Voz.hablar(limpio, 0.8));
  if (sinMicro) setTimeout(() => { oir.disabled = false; }, ESPERA_ESCUCHAR_MS);
  return el;
}
