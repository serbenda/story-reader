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

  window.Texto = { rellenar, bloques, capitalizar, limpiarPistas, pistasDe };
})();
