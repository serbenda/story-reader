# La biblioteca mágica

Un juego de aventuras para practicar la lectura, pensado para niñas y niños con dislexia.
Una colección de cuentos interactivos protagonizados por Alaia y su hermana Lucía. Para avanzar hay que leer las pistas,
leer frases en voz alta con el micrófono y elegir el camino correcto.

Cada libro es una historia distinta con su propio mundo (lugares, animales, tesoros). El primero
es **El bosque de los susurros**; se pueden añadir más sin tocar el código.

- **Cada partida es distinta**: el lugar, el animal que ayuda, las pistas y los textos se
  combinan al azar, así que no se puede jugar de memoria.
- **Cuatro niveles**: 🌱 Aprendiz, 🌼 Novatilla, 📖 Lectora y 🔎 Superlectora.
- **Lectura en voz alta**: el juego escucha y colorea en verde las palabras bien leídas.
  Perdona los errores pequeños y solo pide repetir las que faltan.
- **Ayudas**: tocar cualquier palabra la lee en voz alta, sin castigo.
- **Pensado para la dislexia**: letra Lexend grande, letras y palabras espaciadas, fondo crema,
  texto alineado a la izquierda y opción de resaltar la línea.
- **Para que enganche**: se puede vestir a las protagonistas y elegir la mascota, hay álbum de
  pegatinas y amigos, humor, y tesoros escondidos que encuentra Lucía tocando el dibujo.
- **Sin imágenes**: todos los paisajes y personajes se dibujan con código, distintos en cada partida.

## Publicarlo en GitHub Pages

1. Sube esta carpeta a un repositorio (por ejemplo `story-reader`).
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En un par de minutos estará en `https://<tu-usuario>.github.io/story-reader/`.

El archivo `.nojekyll` es importante: sin él, GitHub convierte los `.md` en páginas y el juego no
encuentra las historias.

Para probarlo en tu ordenador hace falta un servidor (abrir el `index.html` con doble clic no vale):

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

### Micrófono

- Portátil: **Chrome o Edge**. Tablet: **Chrome en Android** o **Safari en iPad**.
- La primera vez el navegador pide permiso para usar el micro.
- Firefox no tiene reconocimiento de voz: el juego cambia solo al botón «¡Ya lo he leído!».
- El reconocimiento de voz del navegador necesita internet.

### Menú para mayores

En la pantalla de inicio, **mantén pulsado** el botón «⚙️ Mayores» dos segundos. Ahí se cambia el
nivel, el tamaño de letra, cuánto perdona el micro, el modo sin micro y se puede borrar el progreso.
El progreso se guarda en el propio navegador.

### Informe de lectura

Desde el menú para mayores, **📊 Ver el informe de lectura** muestra:

- Lo de los últimos 7 días: frases leídas en voz alta, porcentaje a la primera (comparado con la
  semana anterior), preguntas acertadas a la primera, minutos y capítulos.
- Un gráfico de las dos últimas semanas con las frases leídas cada día.
- **Palabras que le cuestan**: las que falla en el primer intento con el micro. Se pueden escuchar.
- **Palabras conquistadas**: las que ya acierta (dos aciertos más que fallos).
- Las últimas partidas, incluidas las que dejó a medias.
- Una **recomendación de nivel** (subir, mantener o bajar) a partir de sus últimos capítulos,
  con un botón para aplicarla.
- **Copiar resumen**, para pegarlo en un mensaje (por ejemplo, a su profesora o logopeda).

Los nombres propios no cuentan como palabras difíciles, porque el reconocedor de voz se equivoca
mucho con ellos. Las partidas sin micro cuentan para las frases y los minutos, pero no para los
porcentajes.

### Palabras mágicas

Al empezar cada capítulo, si hay al menos dos palabras que le cuestan, un animal del bosque le
pide leer tres de ellas en voz alta para abrir el libro. Así repasa justo lo que necesita.

## Estructura

```
index.html
css/estilos.css
js/
  datos.js    carga los libros de stories/
  texto.js    rellena las plantillas {variable} y separa los bloques
  voz.js      reconocimiento de voz y lectura en voz alta
  arte.js     paisajes y personajes dibujados con código
  juego.js    pantallas, partida, niveles, álbum y ajustes
stories/
  index.json              lista de libros, mascotas y nombres de las protagonistas
  bosque-susurros/
    libro.md              el mundo: lugares, ayudantes, tesoros, frases de humor
    cap-01.md, cap-02.md, cap-03.md
```

## Añadir historias

### Un libro nuevo

1. Crea una carpeta en `stories/`, por ejemplo `stories/castillo-niebla/`.
2. Copia dentro un `libro.md` y adapta los lugares, ayudantes y tesoros.
3. Escribe los capítulos (`cap-01.md`…).
4. Apúntalo en `stories/index.json`:

```json
{ "id": "castillo-niebla", "carpeta": "castillo-niebla", "capitulos": ["cap-01.md", "cap-02.md"] }
```

No hay que tocar el código.

### libro.md: el mundo

Es la cabecera YAML (entre `---`). Cada **lugar** tiene:

| Campo | Para qué sirve |
|---|---|
| `nombre`, `articulo` | «río» + «el» → el juego construye *el río*, *al río*, *en el río*, *hacia el río* |
| `fondo` | Paisaje que se dibuja: `casa`, `bosque`, `rio`, `cueva`, `puente`, `prado`, `arbol` (o la ruta a una imagen) |
| `icono` | Emoji que sale en el botón de elegir camino |
| `pistas` | Cosas que le pasan a quien ha estado allí: «tenía las patas mojadas» |
| `senales` | Cómo es el sitio: «se oye cantar el agua entre las piedras» |

Las pistas se leen detrás de un nombre («Luna tenía las patas mojadas»), así que se escriben sin
sujeto. Para el masculino y el femenino se usa `{o}`: `estaba llen{o} de polvo` → *lleno* o *llena*.

Los **ayudantes** llevan `nombre`, `especie`, `articulo`, `emoji`, `descripcion` y `gracias`
(cosas graciosas que hacen). También están `equivocado` (cuando se elige mal el camino),
`equivocado_pregunta` y `tesoros`.

### cap-XX.md: un capítulo

```markdown
---
titulo: "La mariposa azul"
resumen: "Una mariposa azul cruza el jardín y {mascota} sale corriendo detrás de ella."
buscamos: mascota            # o { nombre: "la urraca Pepa", genero: f, emoji: "🐦" }
lugares: [rio, cueva, puente, prado]   # entre cuáles se sortea el sitio correcto
pegatina: "🦋"
---

## pista                     ← una escena
@fondo: bosque               ← paisaje ($lugar = el sitio sorteado en esta partida)
@con: ayudante               ← quién sale: mascota, ayudante, ayudante2, buscado
@noche                       ← (opcional) el paisaje se pinta de noche

### aprendiz                 ← texto para este nivel
En el bosque está {ayudante}.
> {ayudante_nombre} dice que {mascota} fue {hacia_lugar}.
? ¿A dónde fue {mascota}?
---                          ← otra versión del mismo texto (sale una al azar)
Encima de una piedra está {ayudante}.
> «{mascota} fue {hacia_lugar}», dice {ayudante_nombre}.
? ¿A dónde tienen que ir Alaia y Lucía?

### lectora
…
? ¿Por qué {mascota} {pista1}?
* Porque había estado {en_lugar}.        ← respuesta correcta
- Porque había estado {en_falso}.        ← respuestas incorrectas
- Porque se había dado un baño de espuma.
```

| Marca | Qué hace |
|---|---|
| `> frase` | Hay que leerla en voz alta con el micro para seguir |
| `? pregunta` | Pregunta. Si no lleva opciones debajo, se elige entre tres lugares |
| `* opción` / `- opción` | Respuesta correcta / incorrecta (se barajan) |
| `[[texto]]` | Pista que se guarda en el cuaderno de detective |
| `@final` | Última escena del capítulo |
| `### todos` | Texto que vale para cualquier nivel que no tenga el suyo |

Una escena que no tiene texto para un nivel se salta en ese nivel. Así, la Superlectora puede
tener escenas de más (por ejemplo, un segundo ayudante con otra pista).

El texto se va mostrando poco a poco: se para en cada frase para leer en voz alta y en cada
pregunta, y continúa cuando se completa.

### Variables disponibles

| Variable | Ejemplo |
|---|---|
| `{mascota}` `{animal}` `{el_animal}` `{un_animal}` | Luna · perrita · la perrita · una perrita |
| `{mo}` | o / a según la mascota |
| `{buscado}` `{o}` | a quién se busca en el capítulo, y su o/a |
| `{lugar}` `{al_lugar}` `{del_lugar}` `{en_lugar}` `{hacia_lugar}` | el sitio correcto |
| `{falso}`, `{otro}` (con los mismos prefijos) | dos sitios equivocados, para pistas trampa |
| `{pista1}` `{pista2}` `{pista3}` `{pista_falsa}` | pistas del sitio correcto y de uno falso |
| `{senal1}` `{senal2}` `{senal_falsa}` | cómo es el sitio correcto y uno falso |
| `{ayudante}` `{ayudante_nombre}` `{ayudante_desc}` `{gracia}` | el búho Bruno · Bruno · … |
| `{ayudante2}` … `{gracia2}` | un segundo ayudante distinto |
| `{o2}` | o / a según el primer ayudante |

Si una variable empieza por mayúscula (`{Ayudante}`), se escribe con mayúscula. Las frases
empiezan siempre con mayúscula automáticamente.

## Paisajes nuevos

Los paisajes están en `js/arte.js`, dentro de `PAISAJES`. Cada uno es una función que devuelve
un dibujo SVG usando piezas sencillas (árboles, flores, piedras, nubes…) colocadas al azar.
Para añadir uno, copia una función, cámbiale el nombre y úsalo en `libro.md` con `fondo: nombre`.
