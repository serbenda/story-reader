# dominio/ · las reglas del juego

Lo que decide cómo funciona el juego, **sin tocar la pantalla** (no hay `document` aquí):

| Módulo | Reglas |
|---|---|
| [`partida.js`](partida.js) | Crear una partida, elegir el texto de cada escena, cuaderno de pistas |
| [`variables.js`](variables.js) | Sorteo de lugares, ayudantes, pistas y señales; variables de los cuentos |
| [`repaso.js`](repaso.js) | Calentamiento de palabras mágicas según el nivel |
| [`cerraduras.js`](cerraduras.js) | Minijuegos de letras que se confunden |
| [`registro-lectura.js`](registro-lectura.js) | Registro de partidas y de palabras difíciles |
| [`meta-diaria.js`](meta-diaria.js) | Meta, racha y cofre |
| [`progreso.js`](progreso.js) | Capítulos terminados, pegatinas, subir de nivel |
| [`estrellas.js`](estrellas.js) · [`tienda.js`](tienda.js) | Ganar, gastar y comprar |
| [`informe.js`](informe.js) | Cifras y recomendación para mayores |
| [`transferencia.js`](transferencia.js) | Copias de seguridad y código entre dispositivos |
| [`protagonistas.js`](protagonistas.js) | Una o dos niñas y sus nombres |

Importa de `estado/`, `contenido/`, `config/` y `util/`. Para avisar a la interfaz, emite eventos
(`util/eventos.js`). Las funciones que modifican sin guardar lo dicen: «No guarda».
