# servicios/ · el navegador

Envoltorios pequeños de las APIs del navegador, para que el resto del juego no dependa de sus rarezas:

| Módulo | API |
|---|---|
| [`voz/`](voz) | Reconocimiento de voz, síntesis de voz y comparación de lo leído (fachada en [`voz/index.js`](voz/index.js)) |
| [`grabaciones.js`](grabaciones.js) | MediaRecorder + IndexedDB: la voz de la familia |
| [`sonido.js`](sonido.js) | Web Audio: melodías de premio |
| [`contador.js`](contador.js) | GoatCounter: partidas empezadas, sin datos personales |
| [`plataforma.js`](plataforma.js) | Almacenamiento persistente, instalación, iOS, service worker, portapapeles |

No saben nada del estado del juego: lo que necesitan se les pasa (por ejemplo, `configurarSonido(() => …)`).
Pueden importar `util/` y `config/`.
