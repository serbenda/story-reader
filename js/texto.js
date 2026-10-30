/* ──────────────────────────────────────────────────────────────
   TEXTO · Rellena las plantillas y las parte en bloques
   {mascota} → «Toby»     {Ayudante} → igual pero con mayúscula
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const capitalizar = (s) => s.replace(/^([\s¡¿«"“—]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());

  /** Pone mayúscula al empezar cada frase */
  function mayusculasDeFrase(linea) {
    return linea
      .replace(/^(\s*(?:[>?*-]\s+)?[¡¿«"“]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase())
      .replace(/([.!?]["»”]?\s+[¡¿«"“]*)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase())
      .replace(/(:\s+[«"“][¡¿]?)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  }

  function rellenar(plantilla, vars) {
    let s = plantilla;
    for (let vuelta = 0; vuelta < 4; vuelta++) {
      const antes = s;
      s = s.replace(/\{([\p{L}\d_]+)\}/gu, (m, k) => {
        if (k in vars && vars[k] != null) return String(vars[k]);
        const kl = k.charAt(0).toLowerCase() + k.slice(1);
        if (kl in vars && vars[kl] != null) return capitalizar(String(vars[kl]));
        return m;
      });
      if (s === antes) break;
    }
    const sobra = s.match(/\{[\p{L}\d_]+\}/gu);
    if (sobra) console.warn('Variables sin rellenar:', sobra.join(', '));
    return s.split('\n').map(mayusculasDeFrase).join('\n');
  }

  /**
   * Cada línea se convierte en un bloque:
   *  texto · voz (> …) · pregunta (? …) con opciones (* bien / - mal)
   */
  function bloques(texto) {
    const out = [];
    for (const raw of texto.split('\n')) {
      const l = raw.trim();
      if (!l) continue;
      if (/^>\s?/.test(l)) { out.push({ tipo: 'voz', texto: l.replace(/^>\s?/, '') }); continue; }
      if (/^\?\s+/.test(l)) { out.push({ tipo: 'pregunta', texto: l.replace(/^\?\s+/, ''), opciones: [] }); continue; }
      const ultimo = out[out.length - 1];
      if (/^[*-]\s+/.test(l) && ultimo && ultimo.tipo === 'pregunta') {
        ultimo.opciones.push({ texto: capitalizar(l.replace(/^[*-]\s+/, '')), correcta: l[0] === '*' });
        continue;
      }
      out.push({ tipo: 'texto', texto: l });
    }
    return out;
  }

  /** Quita las marcas de pista [[ ]] */
  const limpiarPistas = (t) => t.replace(/\[\[|\]\]/g, '');
  /** Devuelve las pistas marcadas con [[ ]] */
  const pistasDe = (t) => [...t.matchAll(/\[\[(.+?)\]\]/g)].map((m) => capitalizar(m[1]));

  // ───────── Separar en sílabas (español) ─────────
  // ma-ri-po-sa, bri-llan-te, cons-truir, a-ho-ra, dí-a, pin-güi-no, guie-ro…
  const VOCAL = /[aeiouáéíóúü]/;
  const FUERTE = /[aeoáéóíú]/;            // las débiles con tilde (í, ú) rompen el diptongo
  const INSEPARABLES = /^[bcfgkp][lr]$|^[dt]r$/;   // «at-le-ta»: tl se separa

  function unidades(w) {
    const l = w.toLowerCase(), u = [];
    for (let i = 0; i < w.length;) {
      const dos = l.substr(i, 2);
      if (dos === 'ch' || dos === 'll' || dos === 'rr') { u.push({ t: w.substr(i, 2), v: false }); i += 2; continue; }
      if (dos === 'qu' || (dos === 'gu' && /[eéií]/.test(l[i + 2] || ''))) { u.push({ t: w.substr(i, 2), v: false }); i += 2; continue; }
      const c = l[i];
      let v = VOCAL.test(c);
      if (c === 'y') v = i > 0 && (i === w.length - 1 || !VOCAL.test(l[i + 1] || ''));
      u.push({ t: w[i], v, c }); i++;
    }
    return u;
  }

  function silabas(palabra) {
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
    const cortes = [];
    for (let k = 0; k < nucleos.length - 1; k++) {
      const a = nucleos[k].fin + 1, b = nucleos[k + 1].ini;
      const n = b - a;
      const par = (x, y) => INSEPARABLES.test((u[x].t + u[y].t).toLowerCase());
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

  /** Separa una palabra con signos («¡Hola!») en [antes, letras, después] */
  function partesDePalabra(token) {
    const m = String(token).match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*)([^\p{L}\p{N}]*)$/u);
    return m ? [m[1], m[2], m[3]] : [token, '', ''];
  }

  window.Texto = { rellenar, bloques, capitalizar, limpiarPistas, pistasDe, silabas, partesDePalabra };
})();
