# Cómo contribuir

Gracias por querer mejorar **La biblioteca mágica**. Esta guía cuenta cómo se trabaja en el proyecto, qué
reglas sigue el código y, sobre todo, **recetas paso a paso** para ampliarlo. Antes de tocar código, echa
un vistazo a **[docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)** (cómo está hecho) y, si vas a escribir
cuentos, a la **[guía de escritura](stories/GUIA-ESCRITURA.md)**.

## Índice

- [Preparar el entorno](#preparar-el-entorno)
- [Ramas y pull requests](#ramas-y-pull-requests)
- [Comprobaciones](#comprobaciones)
- [Convenciones de código](#convenciones-de-código)
- [Recetas](#recetas)
  - [Un libro nuevo](#un-libro-nuevo) · [Un paisaje nuevo](#un-paisaje-nuevo) · [Una pantalla nueva](#una-pantalla-nueva)
  - [Algo nuevo en la tienda](#algo-nuevo-en-la-tienda) · [Una mascota nueva](#una-mascota-nueva) · [Un ajuste para mayores](#un-ajuste-para-mayores)
  - [Un tipo de bloque nuevo](#un-tipo-de-bloque-nuevo) · [Un nivel nuevo](#un-nivel-nuevo) · [Un campo nuevo en el progreso](#un-campo-nuevo-en-el-progreso)
  - [Un evento nuevo](#un-evento-nuevo) · [Un sonido nuevo](#un-sonido-nuevo) · [Una hoja de estilos nueva](#una-hoja-de-estilos-nueva)
- [Lista para el pull request](#lista-para-el-pull-request)

## Preparar el entorno

Solo hace falta **Node 20 o más** y **Python 3**. No hay `npm install`: el proyecto no tiene dependencias.

```bash
git clone https://github.com/serbenda/story-reader.git
cd story-reader
git checkout development
npm run servir                  # = python3 -m http.server 8000 → abre http://localhost:8000
```

Para las pruebas en navegador (validador de cuentos y partidas), una sola vez:

```bash
pip install playwright==1.48.0 && python -m playwright install chromium
```

Abrir `index.html` con doble clic **no funciona**: los módulos ES y la carga de cuentos necesitan un servidor.

## Ramas y pull requests

| Rama | Para qué | Cómo se cambia |
|---|---|---|
| `main` | Producción: lo que publica GitHub Pages. | **Solo por pull request desde `development`**, con la comprobación «Validar los cuentos» en verde. Protegida. |
| `development` | Integración: donde se juntan los cambios. | Por PR desde ramas de trabajo (o subida directa del mantenedor). Protegida contra borrado y `force push`. |
| `mejora/…`, `arreglo/…`, `cuento/…` | Ramas de trabajo. | Libre. Abre PR hacia `development`. |

Mensajes de commit en español, en presente y explicando el **para qué**: «Cerraduras también en la
penúltima escena desde Novatilla», no «cambios en partida».

## Comprobaciones

```bash
npm run comprobar   # arquitectura + documentación + lista sin conexión + unitarias   (segundos)
npm run validar     # todos los cuentos, cientos de partidas al azar                   (~1 min)
npm run partidas    # partidas completas en navegador con micro simulado               (~2 min)
npm run preparar    # regenera la lista de archivos sin conexión de sw.js (tras añadir o cambiar archivos)
```

Sin conexión a internet, el validador y las partidas pueden usar una copia local de js-yaml:
`JSYAML_LOCAL=/ruta/js-yaml.min.js npm run validar`.

La CI ejecuta todo esto en cada PR. Si `npm run comprobar` falla, el mensaje dice exactamente qué archivo y
qué regla.

## Convenciones de código

**Generales**

- **Español en todo**: archivos, funciones, variables, comentarios, mensajes. Sin tildes ni «ñ» en
  identificadores (`tamano`, `ninas`), sí en textos y comentarios.
- **Una responsabilidad por archivo** y archivos pequeños. Si un archivo pasa de ~200 líneas, probablemente
  hace dos cosas.
- **Respeta las capas** ([tabla](docs/ARQUITECTURA.md#3-las-capas)). Si necesitas algo de una capa superior,
  lo normal es pasar una función como parámetro (como `alTerminar` en las tarjetas) o emitir un evento.
- **Sin efectos al importar**, salvo dos excepciones documentadas: `estado/sesion.js` carga el progreso y
  cada pantalla se registra en la navegación. Lo demás se activa desde `main.js`.
- **La lógica no toca el DOM**: lo que calcula o decide va en `dominio/`; lo que pinta, en `ui/` o `pantallas/`.
- **Sin números mágicos**: constantes con nombre al principio del archivo (`DOBLE_TOQUE_MS`,
  `INTENTOS_PARA_SEGUIR`) o en `config/` si son ajustes del juego.
- **Sin dependencias nuevas** salvo que sea imprescindible (ver [decisiones](docs/DECISIONES.md)). Si hace
  falta una, desde cdnjs, con versión fija, y añadida a `EXTERNOS` en la herramienta de recursos.

**JavaScript**

- Módulos ES, `const` por defecto, funciones pequeñas con nombre.
- Importaciones con nombre (`import { saldo } from …`). Los servicios grandes se importan como espacio de
  nombres (`import * as Voz from '../servicios/voz/index.js'`).
- Todo el HTML que lleve datos del usuario o de un cuento pasa por `esc()`.
- Nada de `alert()`, `confirm()` ni `prompt()`: para confirmar, `confirmarConSegundoToque()`.

**Documentación (obligatoria, la vigila la CI)**

- Cada archivo empieza con `/** @file … */`: qué hace, en qué capa está y, si se amplía, **cómo**.
- Cada exportación lleva su JSDoc con `@param`, `@returns` y, si procede, `@throws` o `@example`.
- Si una función modifica el estado sin guardar, su JSDoc lo dice: «No guarda».
- Los tipos compartidos se definen con `@typedef` donde nacen (`Estado` en `estado/almacen.js`,
  `PartidaEnCurso` en `dominio/partida.js`…) y se referencian con `import('…').Tipo`.
- Un módulo nuevo de `src/` se añade al [catálogo de la arquitectura](docs/ARQUITECTURA.md#14-catálogo-de-módulos).

**Para la niña (no negociable)**

- Nunca un mensaje de error ni un sonido de fallo: siempre ánimo («¡Casi!»). Ver `config/mensajes.js`.
- Todo lo que se lee debe pasar por `palabras()` para que se pueda tocar y oír.
- Botones grandes (mínimo 44 px), contraste alto y que funcione sin micro y con «menos movimiento».

## Recetas

### Un libro nuevo

No hace falta tocar código.

1. Lee la [guía de escritura](stories/GUIA-ESCRITURA.md).
2. Copia `stories/bosque-susurros/` con otro nombre y escribe el mundo (`libro.md`) y los capítulos.
3. Añádelo a `stories/index.json` → `libros`.
4. `python herramientas/validar.py mi-libro --muestras` hasta que no haya fallos.
5. `npm run preparar` (cambia la versión sin conexión para que llegue a las tablets).

### Un paisaje nuevo

1. Elige el mundo en `src/arte/paisajes/` (o crea `mi-mundo.js` con su `@file`).
2. Escribe `export function volcan(r, noche, defs) { … }` devolviendo el SVG de 800×500. Usa `r()` para el
   azar (nunca `Math.random`), `P.*` de `../piezas.js` y `cielo`/`astros`/`velo` de `../cielo.js`.
   Termina con `+ velo(r, noche)` para que tenga versión de noche.
3. Regístralo en `PAISAJES` de `src/arte/paisajes/index.js`.
4. Ya se puede usar en un cuento (`@fondo: volcan`). `npm run comprobar` prueba que se dibuja de día y de
   noche y que es repetible.

### Una pantalla nueva

1. Crea `src/pantallas/mi-pantalla.js` con su `@file` (qué muestra y a qué pantallas navega).
2. Escribe la función que pinta en `app` y conecta los botones, y regístrala:
   `registrarPantalla('mi-pantalla', pantallaMia)`.
3. Impórtala en `src/pantallas/index.js`.
4. Ábrela desde otra pantalla con `ir('mi-pantalla')` o `irA('mi-pantalla')`.
5. Si necesita estilos, crea `css/pantallas/mi-pantalla.css` ([receta](#una-hoja-de-estilos-nueva)).
6. Añádela al catálogo y a la tabla de navegación de `docs/ARQUITECTURA.md`, y `npm run preparar`.

### Algo nuevo en la tienda

- **Complemento**: añádelo a `ARTICULOS_TIENDA` en `src/config/tienda.js` (`tipo: 'accesorio'`) y dibuja su
  `case` en `src/arte/personajes/complementos.js` con el mismo `valor`.
- **Estampado**: igual con `tipo: 'estampado'` y su patrón en `src/arte/personajes/estampados.js`.

Las pruebas unitarias comprueban que todo lo que se vende tiene dibujo.

### Una mascota nueva

Añádela en `stories/index.json` → `mascotas` con `emoji`, `chico` y `chica`. Con `precio`, se compra en la
tienda; sin él, es gratis.

### Un ajuste para mayores

1. Dale valor por defecto en `estadoInicial()` (`src/estado/almacen.js`) y documéntalo en el `@typedef Ajustes`.
2. Añade el control en un bloque de `src/pantallas/ajustes.js`: `chipsAjuste()` o `interruptor()` ya lo
   guardan y aplican solos.
3. Si cambia algo visual, aplícalo en `src/ui/ajustes-visuales.js` (normalmente una clase en `<body>`).

### Un tipo de bloque nuevo

1. Decide su marca en el Markdown y reconócela en `bloques()` (`src/contenido/bloques.js`).
2. Crea su tarjeta en `src/pantallas/partida/tarjeta-…js` con la firma `(bloque, { alTerminar }) → HTMLElement`.
3. Añádela a `TARJETAS` y a `bloqueaAvance()` en `src/pantallas/partida/index.js`.
4. Documenta la marca en la guía de escritura y en el README, y añade su comprobación al validador.

### Un nivel nuevo

1. Añádelo a `NIVELES` (`src/config/niveles.js`) en su sitio de dificultad.
2. Añade su id a `NIVELES_DE_TEXTO` (`src/contenido/escenas.js`).
3. Escribe sus textos (`### minivel`) en los cuentos y en la tabla de la guía de escritura.
4. Revisa las reglas que dependen del nivel: calentamiento (`dominio/repaso.js`), cerraduras
   (`dominio/partida.js`) y el validador.

### Un campo nuevo en el progreso

1. Valor por defecto en `estadoInicial()` y su línea en el `@typedef Estado`.
2. Si debe viajar entre dispositivos, decide cómo se junta en `fusionarProgreso()`
   (`src/dominio/transferencia.js`): máximo, unión… nunca perder datos.
3. No cambies `CLAVE_GUARDADO`: haría que todas las familias perdieran su progreso.

### Un evento nuevo

Emítelo desde el dominio con `emitir('nombre', datos)`, escúchalo en la interfaz con `escuchar()` y
añádelo a la lista de `src/util/eventos.js` y a la tabla de la sección 7 de la arquitectura.

### Un sonido nuevo

Añade su melodía a `MELODIAS` en `src/servicios/sonido.js` y tócalo con `Sonido.tocar('nombre')`. Que sea
corto y alegre: no hay sonidos de error.

### Una hoja de estilos nueva

Crea el archivo en `css/componentes/` o `css/pantallas/` empezando con un comentario que diga qué módulo
pinta ese HTML, enlázalo en `css/estilos.css` en su sitio de la cascada y ejecuta `npm run preparar`.

## Lista para el pull request

- [ ] `npm run comprobar`, `npm run validar` y `npm run partidas` pasan.
- [ ] `npm run preparar` ejecutado si has añadido o cambiado archivos.
- [ ] Documentación al día: `@file`, JSDoc, catálogo y, si cambia el comportamiento, README / guía / arquitectura.
- [ ] Probado en una tablet o en el modo móvil del navegador, con y sin micro.
- [ ] Nada que pueda frustrar a la niña: sin errores visibles, todo se puede tocar y oír.
- [ ] Anotado en [CHANGELOG.md](CHANGELOG.md).
