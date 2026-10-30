# Guía para escribir cuentos

Esta guía complementa el README (que explica el formato de los archivos). Aquí está **cómo escribir**
para que el cuento funcione bien con el juego y ayude a leer a una niña de 7 años con dislexia.

Usa `stories/bosque-susurros/` como modelo: copia su estructura y cambia el mundo y la historia.

## Las protagonistas

- **Alaia** (7 años): la lectora y detective. Lista, valiente, piensa antes de actuar.
- **Lucía** (3 años): su hermana pequeña. Graciosa, impulsiva, piensa mucho en comida, todavía no sabe
  leer (dibuja galletas en vez de apuntar pistas). Nunca la ridiculices: es entrañable.
- **{mascota}**: la mascota que eligió la niña (perro, gato, conejo, hámster, pato o zorro).
  No uses sonidos de una especie concreta (ladrar, maullar) ni partes que no tengan todas
  (bigotes, pico). Para su masculino/femenino usa `{mo}`: `content{mo}` → contento / contenta.

## La mecánica de cada capítulo

Cada capítulo es un pequeño caso: algo o alguien se pierde (`buscamos:`) y hay que averiguar
**dónde está** leyendo pistas. El sitio correcto se sortea en cada partida entre los `lugares:`
del capítulo, así que el texto nunca puede dar por hecho cuál es: siempre se nombra con variables
(`{lugar}`, `{al_lugar}`, `{en_lugar}`…). Los sitios equivocados son `{falso}` y `{otro}`.

Estructura recomendada (5 escenas; la Superlectora tiene una más):

1. **Inicio**: qué pasa y qué se pierde. Fondo fijo.
2. **pista**: un ayudante da la pista. Termina con `?` sin opciones → se elige entre 3 lugares.
3. **pista2** (solo Superlectora): un segundo ayudante (`{ayudante2}`) da otra pista y aquí va la pregunta de lugar.
4. **Encuentro**: `@fondo: $lugar`. En Lectora y Superlectora, pregunta de comprensión con `*` y `-`.
5. **final** (`@final`): cierre con intriga para el capítulo siguiente. El último capítulo del libro cierra la historia.

## Qué cambia en cada nivel

| Nivel | Líneas por escena | Frase `>` de voz | Pista | Preguntas |
|---|---|---|---|---|
| aprendiz | 3-5, cortas | 4-9 palabras, palabras corrientes | directa: «fue {hacia_lugar}» | ¿A dónde fue…? |
| novatilla | 4-6 | hasta ~16 palabras | con trampa: «primero fue {hacia_falso}, pero luego…», «no fue {al_falso} ni {al_otro}» | de lugar |
| lectora | 6-9, vocabulario más rico | hasta ~22 palabras | indirecta: `{pista1}` o `{senal1}`, hay que deducir el sitio | de lugar + «¿Por qué…?» con `*`/`-` |
| superlectora | 6-10 | hasta ~28 palabras | repartida: `[[…]]` al cuaderno, una negativa con `{al_falso}`/`{en_falso}` + `{pista1}` y `{pista2}` en dos escenas | juntar pistas + «¿Qué pistas…?» |

Cada nivel de cada capítulo necesita **al menos una frase `>`** y **al menos una pregunta `?`**.
Pon una frase `>` en casi todas las escenas (es la lectura en voz alta) y escribe dos versiones
(separadas por `---`) en las escenas de aprendiz y novatilla, para que cambie más entre partidas.

## Reglas de gramática para que las piezas encajen

- **pistas** (en `libro.md`): se leen detrás de un nombre, sin sujeto: «tenía las patas mojadas».
  Funcionan en frases como «{buscado} {pista1}», «¿Por qué {buscado} {pista1}?» y «Que {pista_falsa}».
  Para masculino/femenino de quien se busca usa `{o}`: «estaba llen{o} de arena».
  Tienen que poder decirse de un animal o de la mascota, y apuntar claramente a su lugar.
- **senales**: describen el sitio y se leen detrás de «es un sitio donde…»: «se oyen las olas».
- **ayudantes**: `descripcion` empieza por «un/una…». Cada `gracias` es una frase completa con el
  nombre del ayudante como sujeto («Paco se tira un pedo…»), porque se lee como «Y entonces, {gracia}.».
  Para «a/de + ayudante» usa `{al_ayudante}` y `{del_ayudante}` (nunca «a {ayudante}»).
  Si necesitas un adjetivo para el ayudante, usa `{o2}`.
- **lugares**: para «a/de/en/hacia» usa siempre las variables (`{al_lugar}`, `{del_lugar}`…).
- Un `buscamos` que no sea la mascota lleva `nombre` con artículo («la urraca Pepa»), `genero` y `emoji`.
- En YAML, pon **todas las frases entre comillas dobles**.
- Las líneas de diálogo empiezan por `—`. Ninguna línea de narración puede empezar por `- ` o `* `
  (solo las opciones justo debajo de una pregunta).

## Para que ayude a leer

- Frases cortas en los niveles bajos, una idea por línea.
- Nada de faltas a propósito ni juegos con palabras mal escritas: confunden a quien tiene dislexia.
- Humor amable (pedos, despistes, comida, animales torpes), nada de miedo de verdad ni violencia.
- Los nombres de los ayudantes cortos y fáciles de leer (Paco, Tula, Rita).
- Personajes y mundos propios: nada de personajes de películas o series.

## Comprobar el cuento

El comprobador sortea cientos de partidas y avisa de variables sin rellenar, escenas sin pregunta
o sin frase de voz, opciones mal marcadas, fondos que no existen y frases de voz demasiado largas.

## Mascotas nuevas

Las mascotas están en `stories/index.json`. Cada una necesita `chico`, `chica` y `emoji`; si lleva
`precio`, se compra en la tienda con estrellas. Elige animales con masculino y femenino claros
(pingüinito / pingüinita), porque los cuentos dicen «la gatita» o «el perrito».
