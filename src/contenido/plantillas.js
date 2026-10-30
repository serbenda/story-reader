/**
 * @file Rellena las plantillas de los cuentos.
 *
 * Capa: contenido (solo texto, sin DOM). Sintaxis que entiende:
 *
 *   {mascota}            → valor de la variable «mascota» («Toby»)
 *   {Mascota}            → lo mismo con la primera letra en mayúscula
 *   {{con dos|con una}}  → un texto u otro según haya una o dos protagonistas.
 *                          Dentro puede haber variables. Si la parte de «una»
 *                          queda vacía, la línea entera desaparece.
 *
 * Después de rellenar, cada frase empieza con mayúscula.
 * La lista completa de variables está en stories/GUIA-ESCRITURA.md.
 */

/** Variable especial: `false` si solo hay una protagonista. */
export const VAR_DOS = '__dos';

/**
 * Pone en mayúscula la primera letra, saltando signos de apertura (¡ ¿ « " —).
 * @param {string} s
 * @returns {string}
 */
export const capitalizar = (s) => s.replace(/^([\s¡¿«"“—]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());

/**
 * Pone mayúscula al empezar cada frase de una línea: al principio (también tras
 * las marcas «> », «? », «* », «- »), tras . ! ? y tras «: «».
 * @param {string} linea
 * @returns {string}
 */
export function mayusculasDeFrase(linea) {
  return linea
    .replace(/^(\s*(?:[>?*-]\s+)?[¡¿«"“]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase())
    .replace(/([.!?]["»”]?\s+[¡¿«"“]*)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase())
    .replace(/(:\s+[«"“][¡¿]?)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
}

/**
 * Resuelve las alternativas {{con dos|con una}}.
 * Las llaves simples de dentro ({lectora}) se respetan. Una alternativa sin
 * cerrar se deja tal cual. Las líneas que quedan vacías por una alternativa
 * desaparecen (así «{{Lucía se ríe.|}}» no deja un hueco).
 * @param {string} texto
 * @param {boolean} dos  ¿Hay dos protagonistas?
 * @returns {string}
 */
export function alternativas(texto, dos) {
  let out = '', i = 0;
  while (i < texto.length) {
    const ini = texto.indexOf('{{', i);
    if (ini < 0) { out += texto.slice(i); break; }
    out += texto.slice(i, ini);
    let j = ini + 2, prof = 0, barra = -1;
    for (; j < texto.length; j++) {
      const c = texto[j];
      if (c === '{') prof++;
      else if (c === '}') { if (prof === 0 && texto[j + 1] === '}') break; prof = Math.max(0, prof - 1); }
      else if (c === '|' && prof === 0 && barra < 0) barra = j;
    }
    if (j >= texto.length) { out += texto.slice(ini); break; }   // sin cerrar: se deja tal cual
    const dentro = texto.slice(ini + 2, j);
    const [conDos, conUna] = barra < 0 ? [dentro, ''] : [texto.slice(ini + 2, barra), texto.slice(barra + 1, j)];
    out += dos ? conDos : conUna;
    i = j + 2;
  }
  const original = texto.split('\n');
  return out.split('\n').filter((l, k) => l.trim() || !/\{\{/.test(original[k] || '')).join('\n');
}

/** Vueltas máximas de sustitución (una variable puede contener otras). */
const MAX_VUELTAS = 4;

/**
 * Rellena una plantilla con variables y alternativas, y pone las mayúsculas.
 * Las variables desconocidas se dejan como están y se avisa en la consola
 * (el validador de cuentos las detecta como error).
 * @param {string} plantilla
 * @param {Record<string, unknown>} vars  Debe incluir {@link VAR_DOS} (si falta, se asume que son dos).
 * @returns {string}
 */
export function rellenar(plantilla, vars) {
  const dos = vars[VAR_DOS] !== false;
  let s = alternativas(plantilla, dos);
  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const antes = s;
    s = s.replace(/\{([\p{L}\d_]+)\}/gu, (m, k) => {
      if (k in vars && vars[k] != null) return String(vars[k]);
      const kl = k.charAt(0).toLowerCase() + k.slice(1);
      if (kl in vars && vars[kl] != null) return capitalizar(String(vars[kl]));
      return m;
    });
    // Las piezas que vienen de libro.md (gracias, pistas…) también pueden llevar alternativas
    s = alternativas(s, dos);
    if (s === antes) break;
  }
  const sobra = s.match(/\{[\p{L}\d_]+\}/gu);
  if (sobra) console.warn('Variables sin rellenar:', sobra.join(', '));
  return s.split('\n').map(mayusculasDeFrase).join('\n');
}
