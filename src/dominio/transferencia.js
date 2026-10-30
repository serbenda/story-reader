/**
 * @file Copias de seguridad y paso del progreso entre dispositivos.
 *
 * Capa: dominio. Dos formas de sacar el progreso del navegador:
 *   - Archivo JSON (copia de seguridad): {app, version, fecha, datos}.
 *   - Código de texto para pegar en otro dispositivo: «BM1:» + gzip + base64
 *     («BM0:» sin comprimir si el navegador no sabe comprimir).
 * Los ajustes no viajan (cada dispositivo tiene su letra, su voz…).
 *
 * Al recuperar, los progresos se JUNTAN, nunca se pisan: se queda el máximo
 * de cada cifra y la unión de lo conseguido. Así no se pierde nada aunque se
 * haya jugado en los dos dispositivos.
 */
import { estado } from '../estado/sesion.js';
import { APP_COPIA, MAX_PARTIDAS_REGISTRO, posicionDeNivel } from '../config/index.js';
import { aBase64, deBase64, hayCompresion, transformarGzip } from '../util/base64.js';
import { claveDia } from '../util/fechas.js';
import { claveDePalabra } from './registro-lectura.js';
import { protagonistas } from './protagonistas.js';

const VERSION_COPIA = 1;
const PREFIJO_COMPRIMIDO = 'BM1:';
const PREFIJO_PLANO = 'BM0:';

/** El progreso sin los ajustes del dispositivo. */
function datosParaViajar() {
  const { ajustes, ...datos } = estado;
  return datos;
}

/**
 * Código de texto con todo el progreso.
 * @returns {Promise<string>}
 */
export async function codificarProgreso() {
  const bytes = new TextEncoder().encode(JSON.stringify(datosParaViajar()));
  if (hayCompresion()) { try { return PREFIJO_COMPRIMIDO + aBase64(await transformarGzip(bytes, CompressionStream)); } catch (e) { /* sin comprimir */ } }
  return PREFIJO_PLANO + aBase64(bytes);
}

/**
 * Lee un código de {@link codificarProgreso}. Admite espacios y saltos de línea en medio.
 * @param {string} codigo
 * @returns {Promise<object>}
 * @throws {Error} Si no es un código válido.
 */
export async function decodificarProgreso(codigo) {
  const limpio = codigo.replace(/\s+/g, '');
  const m = limpio.match(/^BM([01]):(.+)$/);
  if (!m) throw new Error('formato');
  let bytes = deBase64(m[2]);
  if (m[1] === '1') bytes = await transformarGzip(bytes, DecompressionStream);
  const datos = JSON.parse(new TextDecoder().decode(bytes));
  if (!datos || typeof datos !== 'object') throw new Error('contenido');
  return datos;
}

/**
 * Junta otro progreso con el de este dispositivo. No guarda.
 * @param {Partial<import('../estado/almacen.js').Estado>} o
 */
export function fusionarProgreso(o) {
  const E = estado;
  const max = (a, b) => Math.max(a || 0, b || 0);
  if (!E.perfil && o.perfil) E.perfil = o.perfil;
  if (posicionDeNivel(o.nivel) > posicionDeNivel(E.nivel)) E.nivel = o.nivel;
  E.estrellas = max(E.estrellas, o.estrellas);
  E.gastadas = max(E.gastadas, o.gastadas);
  Object.assign(E.desbloqueado, o.desbloqueado || {});
  Object.assign(E.metaDias, o.metaDias || {});
  Object.assign(E.cofres, o.cofres || {});
  for (const [lib, caps] of Object.entries(o.progreso || {})) {
    const dl = (E.progreso[lib] = E.progreso[lib] || {});
    for (const [cap, niv] of Object.entries(caps)) {
      const dc = (dl[cap] = dl[cap] || {});
      for (const [nv, n] of Object.entries(niv)) dc[nv] = max(dc[nv], n);
    }
  }
  Object.assign(E.ofrecidos, o.ofrecidos || {});
  const al = o.album || {};
  Object.assign(E.album.amigos, al.amigos || {});
  Object.assign(E.album.pegatinas, al.pegatinas || {});
  for (const [k, n] of Object.entries(al.tesoros || {})) E.album.tesoros[k] = max(E.album.tesoros[k], n);
  // Registro: una partida es la misma si coincide fecha y capítulo
  const vistos = new Set(E.registro.map((r) => `${r.fecha}|${r.cap}`));
  for (const r of o.registro || []) if (!vistos.has(`${r.fecha}|${r.cap}`)) E.registro.push(r);
  E.registro.sort((x, y) => x.fecha - y.fecha);
  if (E.registro.length > MAX_PARTIDAS_REGISTRO) E.registro = E.registro.slice(-MAX_PARTIDAS_REGISTRO);
  for (const [w, p] of Object.entries(o.palabras || {})) {
    const q = E.palabras[w];
    E.palabras[w] = q ? { f: max(q.f, p.f), a: max(q.a, p.a), u: max(q.u, p.u) } : p;
  }
  if (!E.ultimoLibro && o.ultimoLibro) E.ultimoLibro = o.ultimoLibro;
}

/**
 * Archivo de copia de seguridad. Apunta la fecha de la copia (no guarda).
 * @returns {{blob: Blob, nombre: string}}
 */
export function crearCopiaDeSeguridad() {
  const copia = { app: APP_COPIA, version: VERSION_COPIA, fecha: new Date().toISOString(), datos: datosParaViajar() };
  const nombre = `biblioteca-${claveDePalabra(protagonistas().lectora)}-${claveDia(Date.now())}.json`;
  estado.ultimaCopia = Date.now();
  return { blob: new Blob([JSON.stringify(copia)], { type: 'application/json' }), nombre };
}

/**
 * Recupera una copia de seguridad juntándola con el progreso actual. No guarda.
 * @param {string} texto  Contenido del archivo.
 * @throws {Error} Si no es una copia de La biblioteca mágica.
 */
export function recuperarCopiaDeSeguridad(texto) {
  const copia = JSON.parse(texto);
  if (!copia || copia.app !== APP_COPIA || !copia.datos) throw new Error('formato');
  fusionarProgreso(copia.datos);
}
