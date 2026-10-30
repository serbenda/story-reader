/**
 * @file La voz de la familia para las palabras difíciles.
 *
 * Capa: servicios. Los mayores graban cómo dicen una palabra; cuando la niña
 * la toca, suena esa grabación en vez de la voz del dispositivo. Se guardan
 * en este dispositivo (IndexedDB «biblioteca-voces») y no salen de él.
 *
 * Al arrancar ({@link iniciar}) se preparan todas las grabaciones como URLs
 * de objeto, para que {@link reproducirYa} suene dentro del mismo toque
 * (Safari no deja reproducir audio fuera de un gesto de la persona).
 */

const BASE_DE_DATOS = 'biblioteca-voces';
const ALMACEN = 'voces';
/** Duración por defecto de una grabación. */
const DURACION_MS = 3500;
/** Formatos que se prueban, en orden de preferencia. */
const FORMATOS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];

/** @type {IDBDatabase|null} */
let bd = null;
/** palabra → URL del audio, ya cargada para sonar al instante */
const urls = new Map();
/** @type {HTMLAudioElement|null} */
let audio = null;

/** Convierte una petición de IndexedDB en promesa. */
const pedir = (r) => new Promise((ok, mal) => { r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });

function abrir() {
  if (bd) return Promise.resolve(bd);
  return new Promise((ok, mal) => {
    try {
      const r = indexedDB.open(BASE_DE_DATOS, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(ALMACEN);
      r.onsuccess = () => { bd = r.result; ok(bd); };
      r.onerror = () => mal(r.error);
    } catch (e) { mal(e); }
  });
}
/** @param {IDBTransactionMode} modo */
const almacen = (modo) => abrir().then((d) => d.transaction(ALMACEN, modo).objectStore(ALMACEN));

/** ¿Puede este navegador grabar y guardar audio? */
export const soportado = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && window.indexedDB);

/** Carga todas las grabaciones al empezar, para que suenen sin esperas. Nunca falla. */
export async function iniciar() {
  try {
    const claves = await pedir((await almacen('readonly')).getAllKeys());
    const blobs = await Promise.all(claves.map(async (k) => [k, await pedir((await almacen('readonly')).get(k))]));
    for (const [k, b] of blobs) if (b) urls.set(k, URL.createObjectURL(b));
  } catch (e) { /* sin grabaciones en este navegador */ }
}

/**
 * Guarda (o sustituye) la grabación de una palabra.
 * @param {string} clave  Palabra en minúsculas y sin signos.
 * @param {Blob} blob
 */
export async function guardar(clave, blob) {
  await pedir((await almacen('readwrite')).put(blob, clave));
  if (urls.has(clave)) URL.revokeObjectURL(urls.get(clave));
  urls.set(clave, URL.createObjectURL(blob));
}

/** @param {string} clave */
export async function borrar(clave) {
  await pedir((await almacen('readwrite')).delete(clave));
  if (urls.has(clave)) { URL.revokeObjectURL(urls.get(clave)); urls.delete(clave); }
}

/**
 * Hace sonar la grabación ya (de forma síncrona, dentro del mismo toque).
 * @param {string} clave
 * @returns {boolean} false si no hay grabación de esa palabra.
 */
export function reproducirYa(clave) {
  const u = urls.get(clave);
  if (!u) return false;
  try {
    if (audio) audio.pause();
    audio = new Audio(u);
    audio.play()?.catch?.(() => {});
    return true;
  } catch (e) { return false; }
}

/** @param {string} clave @returns {boolean} */
export const tiene = (clave) => urls.has(clave);

/** Palabras grabadas, en orden alfabético. @returns {string[]} */
export const lista = () => [...urls.keys()].sort((a, b) => a.localeCompare(b, 'es'));

/**
 * Graba del micrófono.
 * @param {object} [opciones]
 * @param {number} [opciones.maxMs]  Se para sola al llegar a este tiempo.
 * @param {(parar: () => void) => void} [opciones.alEmpezar]  Recibe una función para parar antes.
 * @returns {Promise<Blob>} El audio grabado.
 */
export async function grabar({ maxMs = DURACION_MS, alEmpezar } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const tipo = (MediaRecorder.isTypeSupported && FORMATOS.find((t) => MediaRecorder.isTypeSupported(t))) || '';
  const rec = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
  const trozos = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) trozos.push(e.data); };
  const terminado = new Promise((ok) => {
    rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); ok(new Blob(trozos, { type: rec.mimeType || tipo || 'audio/webm' })); };
  });
  const parar = () => { if (rec.state === 'recording') rec.stop(); };
  rec.start();
  if (alEmpezar) alEmpezar(parar);
  setTimeout(parar, maxMs);
  return terminado;
}
