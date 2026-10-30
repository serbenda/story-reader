/* ──────────────────────────────────────────────────────────────
   GRABACIONES · La voz de la familia para las palabras difíciles.
   Se graban desde el menú de mayores y se guardan en este dispositivo
   (IndexedDB). Al tocar una palabra grabada, suena la grabación en vez
   de la voz del dispositivo.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const BD = 'biblioteca-voces', ALMACEN = 'voces';
  let bd = null;
  const urls = new Map();   // palabra → URL del audio, ya cargada para sonar al instante
  let audio = null;

  const pedir = (r) => new Promise((ok, mal) => { r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); });
  function abrir() {
    if (bd) return Promise.resolve(bd);
    return new Promise((ok, mal) => {
      try {
        const r = indexedDB.open(BD, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(ALMACEN);
        r.onsuccess = () => { bd = r.result; ok(bd); };
        r.onerror = () => mal(r.error);
      } catch (e) { mal(e); }
    });
  }
  const almacen = (modo) => abrir().then((d) => d.transaction(ALMACEN, modo).objectStore(ALMACEN));

  /** Carga todas las grabaciones al empezar, para que suenen sin esperas */
  async function iniciar() {
    try {
      const st = await almacen('readonly');
      const claves = await pedir(st.getAllKeys());
      const blobs = await Promise.all(claves.map(async (k) => [k, await pedir((await almacen('readonly')).get(k))]));
      for (const [k, b] of blobs) if (b) urls.set(k, URL.createObjectURL(b));
    } catch (e) { /* sin grabaciones en este navegador */ }
  }

  async function guardar(clave, blob) {
    await pedir((await almacen('readwrite')).put(blob, clave));
    if (urls.has(clave)) URL.revokeObjectURL(urls.get(clave));
    urls.set(clave, URL.createObjectURL(blob));
  }

  async function borrar(clave) {
    await pedir((await almacen('readwrite')).delete(clave));
    if (urls.has(clave)) { URL.revokeObjectURL(urls.get(clave)); urls.delete(clave); }
  }

  /** Suena ya (dentro del mismo toque). Devuelve false si no hay grabación. */
  function reproducirYa(clave) {
    const u = urls.get(clave);
    if (!u) return false;
    try {
      if (audio) audio.pause();
      audio = new Audio(u);
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
      return true;
    } catch (e) { return false; }
  }

  const soportado = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder && window.indexedDB);

  /**
   * Graba hasta maxMs milisegundos. alEmpezar recibe una función para parar antes.
   * Devuelve el audio grabado (Blob).
   */
  async function grabar({ maxMs = 3500, alEmpezar } = {}) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    const tipo = (MediaRecorder.isTypeSupported && tipos.find((t) => MediaRecorder.isTypeSupported(t))) || '';
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

  window.Grabaciones = {
    iniciar, guardar, borrar, reproducirYa, soportado, grabar,
    tiene: (clave) => urls.has(clave),
    lista: () => [...urls.keys()].sort((a, b) => a.localeCompare(b, 'es'))
  };
})();
