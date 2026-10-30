/* ──────────────────────────────────────────────────────────────
   ARRANQUE · Carga los libros y abre la primera pantalla. Va el último.
   Los archivos de js/juego/ comparten nombres entre sí (E, J, CAT, aviso,
   palabras…): se cargan en orden desde index.html y forman un solo juego.
   ────────────────────────────────────────────────────────────── */
'use strict';

// ───────── Arranque ─────────
async function iniciar() {
  aplicarAjustes();
  if (window.Grabaciones) Grabaciones.iniciar();
  // Pide al navegador que no borre el progreso aunque falte espacio o pase tiempo sin abrir la web
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then((ok) => { almacenPersistente = ok; }); } catch (e) { /* no disponible */ }
  app.innerHTML = '<p class="cargando">Abriendo el libro…</p>';
  try {
    CAT = await Datos.cargarCatalogo();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="error"><h1 class="titulo">No se han podido cargar las historias</h1>
      <p>${esc(err.message)}</p><p class="nota">Si has abierto el archivo con doble clic, hace falta un servidor (por ejemplo, GitHub Pages).</p></div>`;
    return;
  }
  if (!E.perfil) pantallaBienvenida(); else pantallaInicio();
  // Instalable y sin internet (solo en la web publicada, no en la versión de un solo archivo)
  if ('serviceWorker' in navigator && !window.__EMBEBIDO__ && /^(https:|http:\/\/localhost)/.test(location.href)) {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Sin modo offline:', e));
  }
}

// Para pruebas desde la consola
window.Juego = { get estado() { return E; }, get catalogo() { return CAT; }, prepararPartida };
iniciar();
