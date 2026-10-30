/**
 * @file Bytes ⇄ base64 y compresión gzip con las APIs del navegador.
 *
 * Capa: util. Se usa para el código de «pasar el progreso a otro dispositivo».
 */

/**
 * Bytes → texto base64. Va por trozos para no desbordar la pila con datos grandes.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function aBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/**
 * Texto base64 → bytes.
 * @param {string} b64
 * @returns {Uint8Array}
 */
export const deBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** ¿Sabe este navegador comprimir? */
export const hayCompresion = () => typeof window.CompressionStream === 'function';

/**
 * Pasa los bytes por un CompressionStream o DecompressionStream en formato gzip.
 * @param {Uint8Array} bytes
 * @param {typeof CompressionStream | typeof DecompressionStream} Clase
 * @returns {Promise<Uint8Array>}
 */
export async function transformarGzip(bytes, Clase) {
  const flujo = new Blob([bytes]).stream().pipeThrough(new Clase('gzip'));
  return new Uint8Array(await new Response(flujo).arrayBuffer());
}
