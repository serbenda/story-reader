---
titulo: "La mariposa azul"
resumen: "Una mariposa azul cruza el jardín y {mascota} sale corriendo detrás de ella."
buscamos: mascota
lugares: [rio, cueva, puente, prado]
pegatina: "🦋"
---

<!--
CÓMO SE LEE ESTE ARCHIVO
  ## nombre      → empieza una escena
  @fondo: casa  → dibujo de fondo ($lugar = el sitio que ha tocado en esta partida)
  @con: …       → quién sale en el dibujo (mascota, ayudante, ayudante2, buscado)
  @final        → la última escena del capítulo
  ### nivel     → aprendiz, novatilla, lectora o superlectora
  ---           → separa versiones distintas del mismo texto (sale una al azar)
  > frase       → hay que leerla en voz alta con el micro
  ? pregunta    → pregunta. Sin opciones debajo, se eligen lugares.
  * opción      → respuesta correcta     - opción → respuesta incorrecta
  [[texto]]     → pista que se guarda en el cuaderno de detective
  {variable}    → se cambia por una pieza al azar ({mascota}, {lugar}, {pista1}…)
-->

## jardin
@fondo: casa
@con: mascota

### aprendiz
Es sábado.
Alaia y Lucía juegan en el jardín con {mascota}.
> De pronto, pasa una mariposa azul.
¡{mascota} sale corriendo detrás de ella!
¡Se va al bosque!
---
Hace sol en el jardín.
Alaia, Lucía y {mascota} juegan con la pelota.
> Una mariposa azul pasa volando.
{mascota} salta la valla.
¡Se ha ido al bosque!

### novatilla
Es sábado por la mañana y el jardín huele a hierba recién cortada.
Alaia y Lucía juegan a la pelota con {mascota}.
> De pronto, una mariposa azul pasa volando muy cerca de su nariz.
{mascota} da un salto enorme y sale corriendo detrás de ella.
Cuando las niñas se dan cuenta, {el_animal} ya ha cruzado la valla del bosque.
---
Lucía está haciendo un castillo de arena y Alaia le ayuda con las torres.
{mascota} vigila muy seri{mo}, como si fuera el guardia del castillo.
> Entonces, una mariposa azul se posa en la torre más alta.
{mascota} pega un brinco y… ¡el castillo se derrumba!
La mariposa se escapa hacia el bosque y {mascota} corre detrás de ella sin mirar atrás.

### lectora
Es sábado por la mañana. El sol calienta el jardín y las abejas zumban entre las flores.
Alaia y Lucía están tumbadas en la hierba, buscando formas en las nubes: un dragón, una tarta y un calcetín gigante.
{mascota} dormita a su lado con la tripa al sol.
> De repente, una mariposa azul y brillante aterriza en la punta de su nariz.
{mascota} abre un ojo, luego el otro, y pega un salto tan grande que asusta a las abejas.
La mariposa revolotea hacia la valla del fondo, y {el_animal} la persigue sin pensarlo dos veces.
—¡{mascota}, vuelve! —grita Alaia.
Pero {mascota} ya ha desaparecido entre los árboles del bosque.
---
Es la hora del desayuno y en la mesa del jardín hay tostadas, zumo de naranja y un tarro de mermelada de fresa.
Lucía intenta untar la mermelada, pero se la pone en la nariz.
Alaia se ríe tanto que casi se cae de la silla.
> En ese momento, una mariposa azul se acerca volando, atraída por el olor a fresa.
{mascota} la ve, se pone en guardia y salta por encima de la mesa.
¡Las tostadas vuelan por los aires!
Cuando las niñas consiguen levantarse, {mascota} ya ha cruzado la valla y se ha perdido en el bosque.

### superlectora
Es sábado y en el jardín de casa todo parece tranquilo.
Alaia lee un libro de detectives en la hamaca, y Lucía colecciona piedras de colores en un cubo.
{mascota}, como siempre, lo vigila todo desde su cojín favorito.
> De pronto, una mariposa azul con puntitos dorados cruza el jardín a toda velocidad.
{mascota} se levanta de un salto, tira el cubo de Lucía y sale disparad{mo} detrás de ella.
Las piedras ruedan por el césped, la hamaca se balancea y, cuando Alaia consigue ponerse de pie, {el_animal} ya ha cruzado la valla.
—Lucía —dice Alaia muy seria, cerrando el libro—, esto es un caso para las detectives del bosque.
Lucía asiente y se pone su gorro de detective. En realidad es un colador, pero le queda estupendamente.

## pista
@fondo: bosque
@con: ayudante

### aprendiz
Alaia y Lucía entran en el bosque.
Allí está {ayudante}.
Es {ayudante_desc}.
> {ayudante_nombre} dice que {mascota} fue {hacia_lugar}.
? ¿A dónde fue {mascota}?
---
En el bosque hay muchos árboles.
Encima de una piedra está {ayudante}.
> «{mascota} fue {hacia_lugar}», dice {ayudante_nombre}.
? ¿A dónde tienen que ir Alaia y Lucía?

### novatilla
Entre los árboles aparece {ayudante}, {ayudante_desc}.
Nada más ver a las niñas, {gracia}.
Lucía se ríe tanto que tiene que sentarse en el suelo.
—Vi a {mascota} —dice {ayudante_nombre}—. Y me fijé muy bien.
> «Primero fue {hacia_falso}, pero luego se dio la vuelta y se fue {hacia_lugar}.»
? ¿Dónde está {mascota} ahora?
---
Las niñas siguen el sendero y se encuentran con {ayudante}, {ayudante_desc}.
—¿Buscáis a {mascota}? —pregunta. Y justo entonces, {gracia}.
{ayudante_nombre} se lo explica muy despacio:
> «No fue {al_falso} ni {al_otro}. Se fue {hacia_lugar}.»
? ¿A dónde se fue {mascota}?

### lectora
Las niñas siguen el camino hasta que oyen una voz: «¡Eh, vosotras!».
Es {ayudante}, {ayudante_desc}.
—¿Habéis perdido algo? —pregunta. Y justo en ese momento, {gracia}.
Cuando por fin dejan de reírse, Alaia le cuenta lo que ha pasado.
> «Sí, {mascota} pasó por aquí corriendo», recuerda {ayudante_nombre}.
—No vi hacia dónde iba, pero me fijé en una cosa: {mascota} {pista1}.
Alaia piensa con mucha atención. Lucía también piensa, aunque sobre todo piensa en galletas.
? ¿Dónde crees que está {mascota}?
---
El bosque está tan silencioso que se oye estornudar a una hormiga.
De repente, alguien carraspea desde lo alto de un tronco. Es {ayudante}, {ayudante_desc}.
—Buenos días —saluda muy educadamente. Y nada más decirlo, {gracia}.
> Alaia le pregunta si ha visto a {mascota}.
—Pasó por aquí hace un rato —contesta {ayudante_nombre}—. Iba muy deprisa, pero me di cuenta de que {mascota} {pista1}.
? ¿A qué sitio fue {mascota}?

### superlectora
Las detectives siguen unas huellas por el sendero hasta llegar a un claro.
Allí está {ayudante}, {ayudante_desc}.
—Buenos días, señoras detectives —saluda. Y nada más decirlo, {gracia}.
> Alaia saca su cuaderno y pregunta: «¿Ha visto pasar a {mascota}?».
—Pues sí, pero iba tan deprisa que no sé a dónde iba. Eso sí, de dos cosas me acuerdo muy bien.
—La primera: [[{mascota} no fue {al_falso}]]. Lo vi dar la vuelta en el cruce.
—La segunda: [[{mascota} {pista1}]].
Alaia lo apunta todo en su cuaderno. Lucía también apunta, aunque ella solo dibuja una galleta.

## pista2
@fondo: bosque
@con: ayudante2

### superlectora
Un poco más adelante, sobre una piedra cubierta de musgo, está {ayudante2}, {ayudante2_desc}.
—¿Buscáis a {mascota}? —pregunta antes de que Alaia pueda abrir la boca—. Lo sé todo. Bueno, casi todo.
Entonces {gracia2}, y las niñas tienen que esperar un ratito.
> Por fin, {ayudante2_nombre} dice: «Cuando pasó por aquí, [[{mascota} {pista2}]]».
Alaia repasa su cuaderno. Ya tiene tres pistas: ha llegado el momento de juntarlas.
? Lee tu cuaderno de detective. ¿Dónde está {mascota}?

## encuentro
@fondo: $lugar
@con: mascota

### aprendiz
Alaia y Lucía van {al_lugar}.
> ¡Allí está {mascota}!
Lucía le da un abrazo muy fuerte.
{mascota} tiene algo en la boca.
¡Es una llave dorada!
---
Las niñas corren {hacia_lugar}.
> Detrás de unas ramas está {mascota}.
¡Qué alegría!
{mascota} tiene una llave pequeña y dorada.

### novatilla
Las niñas corren {hacia_lugar} todo lo deprisa que pueden.
Y allí está {mascota}, sentad{mo} tan tranquil{mo}, como si no hubiera pasado nada.
> Lucía le da un abrazo tan fuerte que a {mascota} se le escapa un ruidito muy raro.
Entonces Alaia ve que {el_animal} tiene algo brillante entre las patas.
Es una llave pequeña y dorada, con un dibujo grabado.

### lectora
Cuando llegan {al_lugar}, al principio no ven a nadie.
Pero entonces oyen un ruidito detrás de unas ramas… ¡Es {mascota}!
> Lucía le da tantos besos que {mascota} acaba con la cara llena de babas.
? ¿Por qué {mascota} {pista1}?
* Porque había estado {en_lugar}.
- Porque había estado {en_falso}.
- Porque se había dado un baño de espuma en casa.
¡Exacto! Las pistas tenían todo el sentido del mundo.
Junto a {mascota} hay algo que brilla entre la hierba: una llave pequeña y dorada.

### superlectora
Las detectives llegan {al_lugar} y se esconden detrás de un arbusto para observar.
Allí, muy concentrad{mo}, está {mascota}, escarbando en el suelo.
> —¡Caso resuelto! —susurra Alaia, y Lucía aplaude tan fuerte que {mascota} da un brinco.
? ¿Qué pistas os han traído hasta aquí?
* Que no fue {al_falso} y que {pista1}.
- Que {pista_falsa}.
- Que tenía muchas ganas de comer helado.
{mascota} ha desenterrado algo. Es una llave antigua y dorada, con un árbol grabado.
Alaia la apunta en el cuaderno: [[una llave dorada con un árbol grabado]].

## final
@final
@fondo: $lugar
@con: mascota

### aprendiz
Alaia, Lucía y {mascota} vuelven a casa.
La llave tiene el dibujo de un árbol.
¿Qué abrirá esta llave?

### novatilla
De camino a casa, Alaia mira la llave con mucha atención.
Tiene grabado un árbol muy viejo con una puertecita en el tronco.
¿Qué secreto guardará?

### lectora
De vuelta a casa, las tres van muy contentas por el sendero.
Alaia gira la llave entre los dedos. Tiene grabado un árbol enorme con una puerta diminuta en el tronco.
—¿Qué abrirá? —pregunta Lucía.
Nadie lo sabe todavía. Pero desde una rama muy alta, alguien las está mirando…

### superlectora
Ya es por la tarde cuando las detectives vuelven a casa con {mascota}.
Alaia no deja de mirar la llave. Es demasiado bonita para ser una llave cualquiera.
—Los árboles no tienen puertas —dice Lucía, muy segura.
—Este sí —responde Alaia—. Y vamos a encontrarlo.
Lo que ninguna de las dos ve es un pájaro blanco y negro que las sigue en silencio, de rama en rama, sin quitarle ojo a la llave.
