/**
 * @file Separa palabras en sílabas según las reglas del español.
 *
 * Capa: contenido. Ejemplos: ma-ri-po-sa, bri-llan-te, cons-truir, a-ho-ra,
 * dí-a, pin-güi-no, guie-ro, buey, at-le-ta.
 *
 * Cómo funciona:
 *   1. Se agrupan letras que suenan como una (ch, ll, rr, qu, gu+e/i).
 *   2. Se buscan los núcleos vocálicos: diptongos (débil+fuerte, débil+débil),
 *      hiatos (fuerte+fuerte o débil con tilde) y triptongos (débil-fuerte-débil).
 *   3. Las consonantes entre dos núcleos se reparten: una va con la siguiente;
 *      dos se separan salvo los grupos inseparables (bl, br, cl, cr, dr, fl…);
 *      con tres o cuatro, el grupo inseparable va con la sílaba siguiente.
 */

const VOCAL = /[aeiouáéíóúü]/;
/** Vocales fuertes (las débiles con tilde, í ú, también rompen el diptongo). */
const FUERTE = /[aeoáéóíú]/;
/** Pares de consonantes que no se separan («at-le-ta»: tl sí se separa). */
const INSEPARABLES = /^[bcfgkp][lr]$|^[dt]r$/;

/**
 * @typedef {object} Unidad
 * @property {string} t  Letras (una o dos).
 * @property {boolean} v ¿Es vocal?
 */

/**
 * Agrupa las letras en unidades de sonido.
 * La «y» es vocal al final de palabra o entre consonantes («rey», «y»).
 * @param {string} w
 * @returns {Unidad[]}
 */
function unidades(w) {
  const l = w.toLowerCase(), u = [];
  for (let i = 0; i < w.length;) {
    const dos = l.substr(i, 2);
    if (dos === 'ch' || dos === 'll' || dos === 'rr') { u.push({ t: w.substr(i, 2), v: false }); i += 2; continue; }
    if (dos === 'qu' || (dos === 'gu' && /[eéií]/.test(l[i + 2] || ''))) { u.push({ t: w.substr(i, 2), v: false }); i += 2; continue; }
    const c = l[i];
    let v = VOCAL.test(c);
    if (c === 'y') v = i > 0 && (i === w.length - 1 || !VOCAL.test(l[i + 1] || ''));
    u.push({ t: w[i], v }); i++;
  }
  return u;
}

/**
 * Separa una palabra (solo letras) en sílabas.
 * @param {string} palabra
 * @returns {string[]} Si no son solo letras o tiene una sílaba, devuelve [palabra].
 */
export function silabas(palabra) {
  if (!/^[\p{L}]+$/u.test(palabra)) return [palabra];
  const u = unidades(palabra);

  // Núcleos: vocales seguidas que forman diptongo o triptongo
  const nucleos = [];
  for (let i = 0; i < u.length; i++) {
    if (!u[i].v) continue;
    const ult = nucleos[nucleos.length - 1];
    const anterior = u[i - 1];
    if (ult && ult.fin === i - 1 && anterior.v) {
      const a = anterior.t.toLowerCase(), b = u[i].t.toLowerCase();
      const hiato = (FUERTE.test(a) && FUERTE.test(b)) || /[íú]/.test(a) || /[íú]/.test(b) || a === b;
      // Tres vocales juntas solo son triptongo si son débil-fuerte-débil (buey, guau)
      const tresVocales = ult.fin > ult.ini;
      const triptongo = tresVocales && !FUERTE.test(u[ult.ini].t.toLowerCase()) && FUERTE.test(a) && !FUERTE.test(b);
      if (!hiato && (!tresVocales || triptongo)) { ult.fin = i; continue; }
    }
    nucleos.push({ ini: i, fin: i });
  }
  if (nucleos.length < 2) return [palabra];

  // Reparto de las consonantes entre núcleos
  const par = (x, y) => INSEPARABLES.test((u[x].t + u[y].t).toLowerCase());
  const cortes = [];
  for (let k = 0; k < nucleos.length - 1; k++) {
    const a = nucleos[k].fin + 1, b = nucleos[k + 1].ini;
    const n = b - a;
    let corte;
    if (n <= 1) corte = a;
    else if (n === 2) corte = par(a, a + 1) ? a : a + 1;
    else if (n === 3) corte = par(a + 1, a + 2) ? a + 1 : a + 2;
    else corte = par(b - 2, b - 1) ? b - 2 : b - 1;
    cortes.push(corte);
  }
  const out = [];
  let desde = 0;
  for (const c of cortes) { out.push(u.slice(desde, c).map((x) => x.t).join('')); desde = c; }
  out.push(u.slice(desde).map((x) => x.t).join(''));
  return out.filter(Boolean);
}

/**
 * Separa una palabra con signos en sus tres partes.
 * @example partesDePalabra('¡Hola!') // ['¡', 'Hola', '!']
 * @param {string} token
 * @returns {[string, string, string]} [signos de antes, letras, signos de después]
 */
export function partesDePalabra(token) {
  const m = String(token).match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*)([^\p{L}\p{N}]*)$/u);
  return m ? [m[1], m[2], m[3]] : [token, '', ''];
}
