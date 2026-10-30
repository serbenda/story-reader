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
{{{lectora} y {hermana} juegan en el jardín con {mascota}.|{lectora} juega en el jardín con {mascota}.}}
> De pronto, pasa una mariposa azul.
¡{mascota} sale corriendo detrás de ella!
¡Se va al bosque!
---
Hace sol en el jardín.
{{{lectora}, {hermana} y {mascota} juegan con la pelota.|{lectora} y {mascota} juegan con la pelota.}}
> Una mariposa azul pasa volando.
{mascota} salta la valla.
¡Se ha ido al bosque!

### novatilla
Es sábado por la mañana y el jardín huele a hierba recién cortada.
{{{lectora} y {hermana} juegan a la pelota con {mascota}.|{lectora} juega a la pelota con {mascota}.}}
> De pronto, una mariposa azul pasa volando muy cerca de su nariz.
{mascota} da un salto enorme y sale corriendo detrás de ella.
{{Cuando las niñas se dan cuenta, {el_animal} ya ha cruzado la valla del bosque.|Cuando {lectora} se da cuenta, {el_animal} ya ha cruzado la valla del bosque.}}
---
{{{hermana} está haciendo un castillo de arena y {lectora} le ayuda con las torres.|{lectora} está haciendo un castillo de arena con muchas torres.}}
{mascota} vigila muy seri{mo}, como si fuera el guardia del castillo.
> Entonces, una mariposa azul se posa en la torre más alta.
{mascota} pega un brinco y… ¡el castillo se derrumba!
La mariposa se escapa hacia el bosque y {mascota} corre detrás de ella sin mirar atrás.

### lectora
Es sábado por la mañana. El sol calienta el jardín y las abejas zumban entre las flores.
{{{lectora} y {hermana} están tumbadas en la hierba, buscando formas en las nubes: un dragón, una tarta y un calcetín gigante.|{lectora} está tumbada en la hierba, buscando formas en las nubes: un dragón, una tarta y un calcetín gigante.}}
{mascota} dormita a su lado con la tripa al sol.
> De repente, una mariposa azul y brillante aterriza en la punta de su nariz.
{mascota} abre un ojo, luego el otro, y pega un salto tan grande que asusta a las abejas.
La mariposa revolotea hacia la valla del fondo, y {el_animal} la persigue sin pensarlo dos veces.
—¡{mascota}, vuelve! —grita {lectora}.
Pero {mascota} ya ha desaparecido entre los árboles del bosque.
---
Es la hora del desayuno y en la mesa del jardín hay tostadas, zumo de naranja y un tarro de mermelada de fresa.
{{{hermana} intenta untar la mermelada, pero se la pone en la nariz.|{lectora} intenta untar la mermelada, pero se la pone en la nariz.}}
{{{lectora} se ríe tanto que casi se cae de la silla.|Se ríe tanto de sí misma que casi se cae de la silla.}}
> En ese momento, una mariposa azul se acerca volando, atraída por el olor a fresa.
{mascota} la ve, se pone en guardia y salta por encima de la mesa.
¡Las tostadas vuelan por los aires!
{{Cuando las niñas consiguen levantarse, {mascota} ya ha cruzado la valla y se ha perdido en el bosque.|Cuando {lectora} consigue levantarse, {mascota} ya ha cruzado la valla y se ha perdido en el bosque.}}

### superlectora
Es sábado y en el jardín de casa todo parece tranquilo.
{{{lectora} lee un libro de detectives en la hamaca, y {hermana} colecciona piedras de colores en un cubo.|{lectora} lee un libro de detectives en la hamaca, con un cubo lleno de piedras de colores a su lado.}}
{mascota}, como siempre, lo vigila todo desde su cojín favorito.
> De pronto, una mariposa azul con puntitos dorados cruza el jardín a toda velocidad.
{{{mascota} se levanta de un salto, tira el cubo de {hermana} y sale disparad{mo} detrás de ella.|{mascota} se levanta de un salto, tira el cubo de piedras y sale disparad{mo} detrás de ella.}}
Las piedras ruedan por el césped, la hamaca se balancea y, cuando {lectora} consigue ponerse de pie, {el_animal} ya ha cruzado la valla.
{{—{hermana} —dice {lectora} muy seria, cerrando el libro—, esto es un caso para las detectives del bosque.|—Esto es un caso para una detective —dice {lectora} muy seria, cerrando el libro.}}
{{{hermana} asiente y se pone su gorro de detective. En realidad es un colador, pero le queda estupendamente.|Luego se pone su gorro de detective. En realidad es un colador, pero le queda estupendamente.}}

## pista
@fondo: bosque
@con: ayudante

### aprendiz
{{{lectora} y {hermana} entran en el bosque.|{lectora} entra en el bosque.}}
Allí está {ayudante}.
Es {ayudante_desc}.
> {ayudante_nombre} dice que {mascota} fue {hacia_lugar}.
? ¿A dónde fue {mascota}?
---
En el bosque hay muchos árboles.
Encima de una piedra está {ayudante}.
> «{mascota} fue {hacia_lugar}», dice {ayudante_nombre}.
{{? ¿A dónde tienen que ir {lectora} y {hermana}?|? ¿A dónde tiene que ir {lectora}?}}

### novatilla
Entre los árboles aparece {ayudante}, {ayudante_desc}.
{{Nada más ver a las niñas, {gracia}.|Nada más ver a {lectora}, {gracia}.}}
{{{hermana} se ríe tanto que tiene que sentarse en el suelo.|{lectora} se ríe tanto que tiene que sentarse en el suelo.}}
—Vi a {mascota} —dice {ayudante_nombre}—. Y me fijé muy bien.
> «Primero fue {hacia_falso}, pero luego se dio la vuelta y se fue {hacia_lugar}.»
? ¿Dónde está {mascota} ahora?
---
{{Las niñas siguen el sendero y se encuentran con {ayudante}, {ayudante_desc}.|{lectora} sigue el sendero y se encuentra con {ayudante}, {ayudante_desc}.}}
{{—¿Buscáis a {mascota}? —pregunta. Y justo entonces, {gracia}.|—¿Buscas a {mascota}? —pregunta. Y justo entonces, {gracia}.}}
{ayudante_nombre} se lo explica muy despacio:
> «No fue {al_falso} ni {al_otro}. Se fue {hacia_lugar}.»
? ¿A dónde se fue {mascota}?

### lectora
{{Las niñas siguen el camino hasta que oyen una voz: «¡Eh, vosotras!».|{lectora} sigue el camino hasta que oye una voz: «¡Eh, tú!».}}
Es {ayudante}, {ayudante_desc}.
{{—¿Habéis perdido algo? —pregunta. Y justo en ese momento, {gracia}.|—¿Has perdido algo? —pregunta. Y justo en ese momento, {gracia}.}}
{{Cuando por fin dejan de reírse, {lectora} le cuenta lo que ha pasado.|Cuando por fin deja de reírse, {lectora} le cuenta lo que ha pasado.}}
> «Sí, {mascota} pasó por aquí corriendo», recuerda {ayudante_nombre}.
—No vi hacia dónde iba, pero me fijé en una cosa: {mascota} {pista1}.
{{{lectora} piensa con mucha atención. {hermana} también piensa, aunque sobre todo piensa en galletas.|{lectora} piensa con mucha atención. Tanto, que se le arruga la nariz.}}
? ¿Dónde crees que está {mascota}?
---
El bosque está tan silencioso que se oye estornudar a una hormiga.
De repente, alguien carraspea desde lo alto de un tronco. Es {ayudante}, {ayudante_desc}.
—Buenos días —saluda muy educadamente. Y nada más decirlo, {gracia}.
> {lectora} le pregunta si ha visto a {mascota}.
—Pasó por aquí hace un rato —contesta {ayudante_nombre}—. Iba muy deprisa, pero me di cuenta de que {mascota} {pista1}.
? ¿A qué sitio fue {mascota}?

### superlectora
{{Las detectives siguen unas huellas por el sendero hasta llegar a un claro.|{lectora} sigue unas huellas por el sendero hasta llegar a un claro.}}
Allí está {ayudante}, {ayudante_desc}.
{{—Buenos días, señoras detectives —saluda. Y nada más decirlo, {gracia}.|—Buenos días, señora detective —saluda. Y nada más decirlo, {gracia}.}}
> {lectora} saca su cuaderno y pregunta: «¿Ha visto pasar a {mascota}?».
—Pues sí, pero iba tan deprisa que no sé a dónde iba. Eso sí, de dos cosas me acuerdo muy bien.
—La primera: [[{mascota} no fue {al_falso}]]. Lo vi dar la vuelta en el cruce.
—La segunda: [[{mascota} {pista1}]].
{{{lectora} lo apunta todo en su cuaderno. {hermana} también apunta, aunque ella solo dibuja una galleta.|{lectora} lo apunta todo en su cuaderno y subraya cada palabra dos veces.}}

## pista2
@fondo: bosque
@con: ayudante2

### superlectora
Un poco más adelante, sobre una piedra cubierta de musgo, está {ayudante2}, {ayudante2_desc}.
{{—¿Buscáis a {mascota}? —pregunta antes de que {lectora} pueda abrir la boca—. Lo sé todo. Bueno, casi todo.|—¿Buscas a {mascota}? —pregunta antes de que {lectora} pueda abrir la boca—. Lo sé todo. Bueno, casi todo.}}
{{Entonces {gracia2}, y las niñas tienen que esperar un ratito.|Entonces {gracia2}, y {lectora} tiene que esperar un ratito.}}
> Por fin, {ayudante2_nombre} dice: «Cuando pasó por aquí, [[{mascota} {pista2}]]».
{lectora} repasa su cuaderno. Ya tiene tres pistas: ha llegado el momento de juntarlas.
? Lee tu cuaderno de detective. ¿Dónde está {mascota}?

## encuentro
@fondo: $lugar
@con: mascota

### aprendiz
{{{lectora} y {hermana} van {al_lugar}.|{lectora} va {al_lugar}.}}
> ¡Allí está {mascota}!
{{{hermana} le da un abrazo muy fuerte.|{lectora} le da un abrazo muy fuerte.}}
{mascota} tiene algo en la boca.
¡Es una llave dorada!
---
{{Las niñas corren {hacia_lugar}.|{lectora} corre {hacia_lugar}.}}
> Detrás de unas ramas está {mascota}.
¡Qué alegría!
{mascota} tiene una llave pequeña y dorada.

### novatilla
{{Las niñas corren {hacia_lugar} todo lo deprisa que pueden.|{lectora} corre {hacia_lugar} todo lo deprisa que puede.}}
Y allí está {mascota}, sentad{mo} tan tranquil{mo}, como si no hubiera pasado nada.
{{> {hermana} le da un abrazo tan fuerte que a {mascota} se le escapa un ruidito muy raro.|> {lectora} le da un abrazo tan fuerte que a {mascota} se le escapa un ruidito muy raro.}}
{{Entonces {lectora} ve que {el_animal} tiene algo brillante entre las patas.|Entonces ve que {el_animal} tiene algo brillante entre las patas.}}
Es una llave pequeña y dorada, con un dibujo grabado.

### lectora
{{Cuando llegan {al_lugar}, al principio no ven a nadie.|Cuando {lectora} llega {al_lugar}, al principio no ve a nadie.}}
{{Pero entonces oyen un ruidito detrás de unas ramas… ¡Es {mascota}!|Pero entonces oye un ruidito detrás de unas ramas… ¡Es {mascota}!}}
{{> {hermana} le da tantos besos que {mascota} acaba con la cara llena de babas.|> {lectora} le da tantos besos que {mascota} acaba un poco mareadit{mo}.}}
? ¿Por qué {mascota} {pista1}?
* Porque había estado {en_lugar}.
- Porque había estado {en_falso}.
- Porque se había dado un baño de espuma en casa.
¡Exacto! Las pistas tenían todo el sentido del mundo.
Junto a {mascota} hay algo que brilla entre la hierba: una llave pequeña y dorada.

### superlectora
{{Las detectives llegan {al_lugar} y se esconden detrás de un arbusto para observar.|{lectora} llega {al_lugar} y se esconde detrás de un arbusto para observar.}}
Allí, muy concentrad{mo}, está {mascota}, escarbando en el suelo.
{{> —¡Caso resuelto! —susurra {lectora}, y {hermana} aplaude tan fuerte que {mascota} da un brinco.|> —¡Caso resuelto! —susurra {lectora}, y da una palmada tan fuerte que {mascota} pega un brinco.}}
{{? ¿Qué pistas os han traído hasta aquí?|? ¿Qué pistas te han traído hasta aquí?}}
* Que no fue {al_falso} y que {pista1}.
- Que {pista_falsa}.
- Que tenía muchas ganas de comer helado.
{mascota} ha desenterrado algo. Es una llave antigua y dorada, con un árbol grabado.
{lectora} la apunta en el cuaderno: [[una llave dorada con un árbol grabado]].

## final
@final
@fondo: $lugar
@con: mascota

### aprendiz
{{{lectora}, {hermana} y {mascota} vuelven a casa.|{lectora} y {mascota} vuelven a casa.}}
La llave tiene el dibujo de un árbol.
¿Qué abrirá esta llave?

### novatilla
De camino a casa, {lectora} mira la llave con mucha atención.
Tiene grabado un árbol muy viejo con una puertecita en el tronco.
¿Qué secreto guardará?

### lectora
{{De vuelta a casa, las tres van muy contentas por el sendero.|De vuelta a casa, {lectora} va muy contenta por el sendero con {mascota}.}}
{lectora} gira la llave entre los dedos. Tiene grabado un árbol enorme con una puerta diminuta en el tronco.
{{—¿Qué abrirá? —pregunta {hermana}.|—¿Qué abrirá? —se pregunta en voz alta.}}
{{Nadie lo sabe todavía. Pero desde una rama muy alta, alguien las está mirando…|Nadie lo sabe todavía. Pero desde una rama muy alta, alguien la está mirando…}}

### superlectora
{{Ya es por la tarde cuando las detectives vuelven a casa con {mascota}.|Ya es por la tarde cuando {lectora} vuelve a casa con {mascota}.}}
{{{lectora} no deja de mirar la llave. Es demasiado bonita para ser una llave cualquiera.|No deja de mirar la llave. Es demasiado bonita para ser una llave cualquiera.}}
{{—Los árboles no tienen puertas —dice {hermana}, muy segura.|—Los árboles no suelen tener puertas —le dice a {mascota}—. Pero este sí. Y vamos a encontrarlo.}}
{{—Este sí —responde {lectora}—. Y vamos a encontrarlo.|}}
{{Lo que ninguna de las dos ve es un pájaro blanco y negro que las sigue en silencio, de rama en rama, sin quitarle ojo a la llave.|Lo que {lectora} no ve es un pájaro blanco y negro que la sigue en silencio, de rama en rama, sin quitarle ojo a la llave.}}
