/**
 * @file Service worker: guarda el juego y los cuentos para jugar sin internet
 * (el micrófono sí necesita conexión en Chrome) y permite instalarlo.
 *
 * Estrategia: primero lo guardado (rápido y sin red) y, por detrás, se
 * actualiza desde la red para la próxima vez.
 *
 * La lista RECURSOS y la VERSION se generan solas: NO las edites a mano.
 *   node herramientas/recursos-sin-conexion.js
 * La VERSION es un resumen del contenido de los archivos: cualquier cambio
 * crea una versión nueva y los dispositivos se actualizan. En CI se comprueba
 * que esté al día.
 */

// <recursos> (generado por herramientas/recursos-sin-conexion.js)
const VERSION = 'biblioteca-966c2b343619';
const RECURSOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icono.svg',
  'icono-192.png',
  'icono-512.png',
  'stories/index.json',
  'css/base/adaptable.css',
  'css/base/documento.css',
  'css/base/lectura-accesible.css',
  'css/base/variables.css',
  'css/componentes/avisos.css',
  'css/componentes/botones.css',
  'css/componentes/cabecera.css',
  'css/componentes/capas.css',
  'css/componentes/cerraduras.css',
  'css/componentes/escenario.css',
  'css/componentes/grabaciones.css',
  'css/componentes/meta.css',
  'css/componentes/opciones.css',
  'css/componentes/preguntas.css',
  'css/componentes/tarjeta-voz.css',
  'css/estilos.css',
  'css/pantallas/ajustes.css',
  'css/pantallas/album.css',
  'css/pantallas/final-capitulo.css',
  'css/pantallas/informe.css',
  'css/pantallas/inicio.css',
  'css/pantallas/partida.css',
  'css/pantallas/personalizar.css',
  'css/pantallas/portada.css',
  'css/pantallas/tienda.css',
  'src/arte/aleatorio.js',
  'src/arte/cielo.js',
  'src/arte/index.js',
  'src/arte/paisajes/bosque.js',
  'src/arte/paisajes/castillo.js',
  'src/arte/paisajes/espacio.js',
  'src/arte/paisajes/granja.js',
  'src/arte/paisajes/hogar.js',
  'src/arte/paisajes/index.js',
  'src/arte/paisajes/mar.js',
  'src/arte/paisajes/nieve.js',
  'src/arte/personajes/adornos.js',
  'src/arte/personajes/complementos.js',
  'src/arte/personajes/estampados.js',
  'src/arte/personajes/nina.js',
  'src/arte/piezas.js',
  'src/config/apariencia.js',
  'src/config/index.js',
  'src/config/mensajes.js',
  'src/config/niveles.js',
  'src/config/recompensas.js',
  'src/config/tienda.js',
  'src/contenido/bloques.js',
  'src/contenido/catalogo.js',
  'src/contenido/escenas.js',
  'src/contenido/plantillas.js',
  'src/contenido/silabas.js',
  'src/depuracion.js',
  'src/dominio/cerraduras.js',
  'src/dominio/estrellas.js',
  'src/dominio/informe.js',
  'src/dominio/meta-diaria.js',
  'src/dominio/partida.js',
  'src/dominio/progreso.js',
  'src/dominio/protagonistas.js',
  'src/dominio/registro-lectura.js',
  'src/dominio/repaso.js',
  'src/dominio/tienda.js',
  'src/dominio/transferencia.js',
  'src/dominio/variables.js',
  'src/estado/almacen.js',
  'src/estado/sesion.js',
  'src/main.js',
  'src/pantallas/ajustes.js',
  'src/pantallas/album.js',
  'src/pantallas/bienvenida.js',
  'src/pantallas/index.js',
  'src/pantallas/informe.js',
  'src/pantallas/inicio.js',
  'src/pantallas/libro.js',
  'src/pantallas/partida/cuaderno.js',
  'src/pantallas/partida/fin-capitulo.js',
  'src/pantallas/partida/index.js',
  'src/pantallas/partida/tarjeta-pregunta.js',
  'src/pantallas/partida/tarjeta-reto.js',
  'src/pantallas/partida/tarjeta-voz.js',
  'src/pantallas/personalizar.js',
  'src/pantallas/tienda.js',
  'src/servicios/contador.js',
  'src/servicios/grabaciones.js',
  'src/servicios/plataforma.js',
  'src/servicios/sonido.js',
  'src/servicios/voz/comparar.js',
  'src/servicios/voz/index.js',
  'src/servicios/voz/reconocimiento.js',
  'src/servicios/voz/sintesis.js',
  'src/ui/ajustes-visuales.js',
  'src/ui/avisos.js',
  'src/ui/cabecera.js',
  'src/ui/componentes/copiar.js',
  'src/ui/componentes/grabaciones.js',
  'src/ui/componentes/grafico-dias.js',
  'src/ui/componentes/meta.js',
  'src/ui/componentes/opciones.js',
  'src/ui/componentes/puerta-mayores.js',
  'src/ui/escenario.js',
  'src/ui/interacciones.js',
  'src/ui/navegacion.js',
  'src/ui/palabras.js',
  'src/ui/voz-alta.js',
  'src/util/azar.js',
  'src/util/base64.js',
  'src/util/dom.js',
  'src/util/eventos.js',
  'src/util/fechas.js',
  'src/util/numeros.js',
  'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js'
];
// </recursos>

/** Servidores externos cuyas respuestas también se guardan. */
const EXTERNOS = /(^|\.)(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(RECURSOS);
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

// Al activarse una versión nueva, se borran las cachés antiguas
self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  if (!propio && !EXTERNOS.test(url.hostname)) return;
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
