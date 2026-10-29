/* Service worker: guarda el juego y los cuentos para poder jugar sin internet
   (el micrófono sí necesita conexión). Al cambiar algo, sube VERSION. */
const VERSION = 'biblioteca-v2';
const BASE = ['./', 'index.html', 'css/estilos.css', 'js/datos.js', 'js/texto.js', 'js/voz.js', 'js/arte.js', 'js/juego.js',
  'manifest.webmanifest', 'icono.svg', 'icono-192.png', 'icono-512.png', 'stories/index.json',
  'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js'];

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(BASE);
    // También todos los libros que haya en el índice
    try {
      const idx = await (await fetch('stories/index.json', { cache: 'no-cache' })).json();
      const rutas = [];
      for (const l of idx.libros) {
        const base = `stories/${l.carpeta || l.id}/`;
        rutas.push(base + 'libro.md', ...l.capitulos.map((c) => base + c));
      }
      await cache.addAll(rutas);
    } catch (e) { /* se guardarán al abrirlos */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Primero lo guardado (rápido y sin internet) y, por detrás, se actualiza desde la red
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const permitido = propio || /(^|\.)(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname);
  if (!permitido) return;
  ev.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const guardado = await cache.match(req, { ignoreSearch: propio });
    const red = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (guardado) { ev.waitUntil(red); return guardado; }
    const res = await red;
    return res || new Response('Sin conexión', { status: 503, statusText: 'Sin conexión' });
  })());
});
