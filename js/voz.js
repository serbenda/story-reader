/* ──────────────────────────────────────────────────────────────
   VOZ · Escuchar a la niña (reconocimiento de voz del navegador)
         y leerle palabras en voz alta (síntesis de voz).
   Funciona en Chrome y Edge, y en Safari del iPad. En Firefox no hay
   reconocimiento: el juego pasa al modo «¡Ya lo he leído!».
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let bloqueado = false;
  let actual = null;

  const NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];

  /** Texto → lista de palabras sin tildes, mayúsculas ni signos */
  function normalizar(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\d+/g, (d) => NUMEROS[+d] || d)
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/).filter(Boolean);
  }

  function distancia(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  const parecido = (a, b) => 1 - distancia(a, b) / Math.max(a.length, b.length, 1);

  /**
   * Compara palabra a palabra lo que había que leer con lo que se ha oído.
   * Devuelve [true/false] por cada palabra objetivo.
   */
  function comparar(objetivo, oidas, umbral) {
    const res = objetivo.map(() => false);
    let p = 0;
    for (let i = 0; i < objetivo.length; i++) {
      let mejor = -1, sim = 0;
      for (let j = p; j < Math.min(oidas.length, p + 4); j++) {
        const s = parecido(objetivo[i], oidas[j]);
        if (s > sim) { sim = s; mejor = j; }
      }
      // A veces el reconocedor junta dos palabras en una («alaya y» → «alayay»)
      if (sim < umbral && i + 1 < objetivo.length) {
        for (let j = p; j < Math.min(oidas.length, p + 4); j++) {
          if (parecido(objetivo[i] + objetivo[i + 1], oidas[j]) >= umbral) { sim = 1; mejor = j - 1; res[i + 1] = true; break; }
        }
      }
      if (mejor >= -1 && sim >= umbral) { res[i] = true; p = Math.max(p, mejor + 1); }
    }
    return res;
  }

  function disponible() { return !!SR && !bloqueado; }

  /**
   * Escucha una vez. cb: { parcial(texto), final([alternativas]), error(tipo), fin() }
   */
  function escuchar(cb) {
    let rec;
    try { rec = new SR(); } catch (e) { bloqueado = true; cb.error && cb.error('not-allowed'); cb.fin && cb.fin(); return; }
    actual = rec;
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.maxAlternatives = 4;
    rec.continuous = false;
    let dadoFinal = false, ultimoParcial = '';
    rec.onresult = (ev) => {
      let parcial = '';
      const alts = [];
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) for (let a = 0; a < r.length; a++) alts.push(r[a].transcript);
        else parcial += r[0].transcript;
      }
      if (parcial) { ultimoParcial = parcial; cb.parcial && cb.parcial(parcial); }
      if (alts.length) { dadoFinal = true; cb.final(alts); }
    };
    rec.onerror = (ev) => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(ev.error)) bloqueado = true;
      cb.error && cb.error(ev.error);
    };
    rec.onend = () => {
      actual = null;
      if (!dadoFinal && ultimoParcial) cb.final([ultimoParcial]);
      cb.fin && cb.fin();
    };
    try { rec.start(); } catch (e) { actual = null; cb.error && cb.error('aborted'); cb.fin && cb.fin(); }
  }

  function parar() { if (actual) try { actual.stop(); } catch (e) { /* nada */ } }

  // ───── Leer en voz alta ─────
  let vozES = null;
  function buscarVoz() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    vozES = vs.find((v) => /^es[-_]ES/i.test(v.lang) && /google|monica|paulina|lucia|helena/i.test(v.name))
      || vs.find((v) => /^es[-_]ES/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { buscarVoz(); speechSynthesis.addEventListener?.('voiceschanged', buscarVoz); }

  function hablar(texto, velocidad = 0.85) {
    if (!('speechSynthesis' in window)) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'es-ES'; u.rate = velocidad; u.pitch = 1.05;
      if (vozES) u.voice = vozES;
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  window.Voz = {
    soportado: !!SR,
    disponible, escuchar, parar, hablar, normalizar, comparar, parecido,
    get escuchando() { return !!actual; },
    get bloqueado() { return bloqueado; }
  };
})();
