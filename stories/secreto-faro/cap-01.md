---
titulo: "La noche sin luz"
resumen: "Primera noche en la isla: la luz del viejo faro está apagada y, a la mañana siguiente, {mascota} desaparece."
buscamos: mascota
lugares: [playa, charca, cueva, duna]
pegatina: "🏝️"
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

## llegada
@fondo: faro
@con: mascota
@noche

### aprendiz
¡Por fin, vacaciones en la isla!
{{{lectora}, {hermana} y {mascota} miran el mar.|{lectora} y {mascota} miran el mar.}}
> En la isla hay un faro muy viejo.
Pero el faro no tiene luz.
¡Está apagado!
---
Es de noche en la isla.
{{Las niñas miran por la ventana.|{lectora} mira por la ventana.}}
> El faro viejo está a oscuras.
{{—¿Por qué no hay luz? —pregunta {hermana}.|—¿Por qué no hay luz? —se pregunta {lectora}.}}
Nadie lo sabe.

### novatilla
{{{lectora}, {hermana} y {mascota} acaban de llegar a la isla para pasar las vacaciones.|{lectora} y {mascota} acaban de llegar a la isla para pasar las vacaciones.}}
Desde la ventana de la casita se ve el mar y, al fondo, un faro viejo de rayas rojas.
> Los faros dan luz por la noche para que los barcos no se choquen.
Pero esta noche el faro está apagado y el mar está muy oscuro.
—Mañana lo investigamos —dice {lectora}.
---
{{Es la primera noche en la isla y las niñas no se pueden dormir.|Es la primera noche en la isla y {lectora} no se puede dormir.}}
{{{hermana} se asoma a la ventana con su peluche y {mascota} se asoma con ella.|Se asoma a la ventana con su peluche y {mascota} se asoma con ella.}}
> Al fondo está el faro de rayas rojas, pero su luz está apagada.
—Los faros no se duermen —dice {lectora}, muy seria—. Aquí pasa algo raro.
{{Y deciden que mañana empezarán a investigar.|Y decide que mañana empezará a investigar.}}

### lectora
{{Después de un viaje larguísimo en barco, {lectora}, {hermana} y {mascota} llegan por fin a la isla donde van a pasar las vacaciones.|Después de un viaje larguísimo en barco, {lectora} y {mascota} llegan por fin a la isla donde van a pasar las vacaciones.}}
La casita tiene las ventanas azules y huele a mar. Desde la terraza se ve una playa enorme y, encima de unas rocas, un faro de rayas rojas y blancas.
{{{hermana} se ha comido tres helados en el barco y todavía tiene hambre.|}}
> Cuando se hace de noche, {lectora} se da cuenta de algo muy extraño: la luz del faro no se enciende.
—Sin luz, los barcos no saben por dónde ir —explica {lectora}.
{mascota} mira el faro con los ojos muy abiertos, como si también estuviera preocupad{mo}.
—Mañana seremos detectives de la isla —decide {lectora}.
---
{{La primera noche en la isla, las niñas cenan en la terraza tortilla de patatas y sandía.|La primera noche en la isla, {lectora} cena en la terraza tortilla de patatas y sandía.}}
El mar está tranquilo y se oyen las olas, chas, chas, chas, como si alguien barriera la playa.
Encima de las rocas está el faro viejo, con sus rayas rojas y blancas.
> Pero algo no va bien: la lámpara del faro está apagada y el mar está completamente oscuro.
{{—¿Los faros también se van de vacaciones? —pregunta {hermana} con la boca llena de sandía.|—¿Los faros también se van de vacaciones? —se pregunta {lectora} en voz alta, con la boca llena de sandía.}}
{{—No —contesta {lectora}—. Un faro tiene que estar siempre encendido. Aquí hay un misterio.|—Pues no —se contesta a sí misma—. Un faro tiene que estar siempre encendido. Aquí hay un misterio.}}
{mascota} no le quita ojo al faro en toda la noche.

### superlectora
{{Las vacaciones empiezan con un viaje en barco, un mareo pequeñito de {hermana} y muchísimas ganas de playa.|Las vacaciones empiezan con un viaje en barco, un mareo pequeñito de {mascota} y muchísimas ganas de playa.}}
La casita de la isla tiene las ventanas azules, una hamaca en la terraza y un olor a sal que se mete por todas partes.
Desde allí se ve el viejo faro, de rayas rojas y blancas, encima de las rocas.
> Al llegar la noche, {lectora} espera ver girar su luz sobre el mar, pero el faro sigue apagado, oscuro como una vela sin encender.
—Si el faro no da luz, los barcos pueden perderse —dice {lectora}, muy preocupada.
{{{hermana} se pone su gorro de detective. En realidad es un cubo de playa, pero le queda estupendamente.|{lectora} se pone su gorro de detective. En realidad es un cubo de playa, pero le queda estupendamente.}}
{mascota} se sienta junto a la ventana, muy quiet{mo}, mirando el faro.
{lectora} abre su cuaderno y escribe: «Caso número uno: la noche sin luz».

## desaparece
@fondo: casa

### aprendiz
Por la mañana hace mucho sol.
> {mascota} ve algo que brilla.
¡Sale corriendo!
¡Se ha ido sin avisar!
---
Es por la mañana.
{{{hermana} busca a {mascota}.|{lectora} busca a {mascota}.}}
> {mascota} no está en la casa.
¿Dónde se habrá metido?

### novatilla
{{A la mañana siguiente, el sol entra por la ventana y las niñas se despiertan con ganas de investigar.|A la mañana siguiente, el sol entra por la ventana y {lectora} se despierta con ganas de investigar.}}
{{Pero cuando van a desayunar, el cojín de {mascota} está vacío.|Pero cuando va a desayunar, el cojín de {mascota} está vacío.}}
> Encima del cojín solo hay un poco de arena y una huella pequeñita.
{{—¡{mascota} se ha ido a investigar sin nosotras! —dice {hermana}.|—¡{mascota} se ha ido a investigar sin mí! —dice {lectora}.}}
---
{{Por la mañana, {lectora} prepara su cuaderno y {hermana} prepara su cubo.|Por la mañana, {lectora} prepara su cuaderno y su cubo de playa.}}
{{Entonces ven a {mascota} correr hacia la puerta detrás de una lucecita.|Entonces ve a {mascota} correr hacia la puerta detrás de una lucecita.}}
> La lucecita brilla un momento en la arena y luego desaparece.
{mascota} sale disparad{mo} detrás de ella y se pierde de vista.

### lectora
A la mañana siguiente, {lectora} se despierta con un rayo de sol en la cara.
{{{hermana} ya está desayunando galletas con forma de pez, pero le falta algo: {mascota} no está en su cojín.|Va a desayunar galletas con forma de pez, pero le falta algo: {mascota} no está en su cojín.}}
> En la puerta de la casita hay huellas pequeñas en la arena que se alejan a toda prisa.
—Anoche {mascota} no dejaba de mirar el faro —recuerda {lectora}—. Seguro que ha salido a investigar.
{{{hermana} coge una galleta para el camino. Por si acaso, coge tres.|{lectora} coge una galleta para el camino. Por si acaso, coge tres.}}

### superlectora
A la mañana siguiente, el cojín de {mascota} está vacío y la puerta de la casita está abierta.
En el escalón de la entrada, {lectora} encuentra un rastro: [[unas huellas pequeñas que van hacia la costa]].
{{> —Anoche vi una lucecita moverse por la playa —dice {hermana}, con la boca llena de galleta—, y {mascota} también la vio.|> —Anoche vi una lucecita moverse por la playa —recuerda—, y {mascota} también la vio.}}
{lectora} frunce el ceño. Una luz que se mueve, un faro apagado y {un_animal} desaparecid{mo}.
—Esto no es una casualidad —dice, y guarda el cuaderno en la mochila.

## pista
@fondo: playa
@con: ayudante

### aprendiz
{{Las niñas van a la playa.|{lectora} va a la playa.}}
Allí está {ayudante}.
Es {ayudante_desc}.
> {ayudante_nombre} dice que {mascota} fue {hacia_lugar}.
? ¿A dónde fue {mascota}?
---
En la arena está {ayudante}.
{{Las niñas le dicen hola.|{lectora} le dice hola.}}
> «{mascota} fue {hacia_lugar}», dice {ayudante_nombre}.
{{? ¿A dónde tienen que ir {lectora} y {hermana}?|? ¿A dónde tiene que ir {lectora}?}}

### novatilla
{{En la orilla, las niñas se encuentran con {ayudante}, {ayudante_desc}.|En la orilla, {lectora} se encuentra con {ayudante}, {ayudante_desc}.}}
{{Nada más ver a las niñas, {gracia}.|Nada más verla, {gracia}.}}
{{{hermana} se ríe tanto que tiene que sentarse.|{lectora} se ríe tanto que tiene que sentarse.}}
—Vi a {mascota} —dice {ayudante_nombre}—. Iba corriendo detrás de una lucecita.
> «Primero fue {al_falso}, pero luego se fue {al_lugar}.»
? ¿Dónde está {mascota} ahora?
---
Junto a una sombrilla rota está {ayudante}, {ayudante_desc}.
{{—¿Buscáis a {mascota}? —pregunta. Y justo entonces, {gracia}.|—¿Buscas a {mascota}? —pregunta. Y justo entonces, {gracia}.}}
{ayudante_nombre} se rasca la cabeza y explica:
> «No fue {al_falso} ni {al_otro}. Fue {al_lugar}.»
? ¿A dónde se fue {mascota}?

### lectora
La playa está casi vacía. Solo hay gaviotas, olas y un castillo de arena medio derrumbado.
{{De repente, una voz dice desde la orilla: «¡Eh, vosotras!». Es {ayudante}, {ayudante_desc}.|De repente, una voz dice desde la orilla: «¡Eh, tú!». Es {ayudante}, {ayudante_desc}.}}
{{—¿Habéis perdido algo? —pregunta. Y justo en ese momento, {gracia}.|—¿Has perdido algo? —pregunta. Y justo en ese momento, {gracia}.}}
{{> Cuando por fin dejan de reírse, {lectora} le pregunta si ha visto pasar a {mascota}.|> Cuando por fin se le pasa la risa, {lectora} le pregunta si ha visto pasar a {mascota}.}}
—Sí, pasó por aquí corriendo detrás de una lucecita. No vi a dónde iba, pero me fijé en que {mascota} {pista1}.
{{{lectora} piensa con mucha atención. {hermana} también piensa, aunque sobre todo piensa en helados.|{lectora} piensa con mucha atención. Seguro que la respuesta está en esa pista.}}
? ¿Dónde crees que está {mascota}?
---
El sol calienta la arena y las olas hacen espuma en la orilla.
Al lado de un cubo olvidado, alguien carraspea. Es {ayudante}, {ayudante_desc}.
—Buenos días —saluda muy educadamente. Y nada más decirlo, {gracia}.
> {lectora} le explica que {mascota} ha desaparecido esta mañana.
—Pasó por aquí hace un rato —contesta {ayudante_nombre}—. Iba muy deprisa, pero me di cuenta de que {mascota} {pista1}.
? ¿A qué sitio fue {mascota}?

### superlectora
{{Las detectives siguen las huellas hasta la orilla, donde las olas ya han borrado casi todas.|{lectora} sigue las huellas hasta la orilla, donde las olas ya han borrado casi todas.}}
Allí está {ayudante}, {ayudante_desc}.
{{—Buenos días, señoras detectives —saluda. Y nada más decirlo, {gracia}.|—Buenos días, señora detective —saluda. Y nada más decirlo, {gracia}.}}
> {lectora} saca su cuaderno y pregunta: «¿Ha visto pasar a {mascota} detrás de una lucecita?».
—Pues sí, pero iba tan deprisa que no sé a dónde iba. Eso sí, de dos cosas me acuerdo muy bien.
—La primera: [[{mascota} no fue {al_falso}]]. Vi cómo daba la vuelta antes de llegar.
—La segunda: [[{mascota} {pista1}]].
{{{lectora} lo apunta todo en su cuaderno. {hermana} también apunta, aunque ella solo dibuja un helado.|{lectora} lo apunta todo en su cuaderno, con letra muy clara.}}

## pista2
@fondo: playa
@con: ayudante2

### superlectora
Un poco más adelante, tomando el sol encima de una toalla de rayas, está {ayudante2}, {ayudante2_desc}.
{{—¿Buscáis a {mascota}? —pregunta antes de que {lectora} pueda abrir la boca—. Lo sé todo. Bueno, casi todo.|—¿Buscas a {mascota}? —pregunta antes de que {lectora} pueda abrir la boca—. Lo sé todo. Bueno, casi todo.}}
{{Entonces {gracia2}, y las niñas tienen que esperar un ratito.|Entonces {gracia2}, y {lectora} tiene que esperar un ratito.}}
> Por fin, {ayudante2_nombre} dice: «Cuando volvió a pasar por aquí, [[{mascota} {pista2}]]».
{lectora} repasa su cuaderno. Ya tiene tres pistas: ha llegado el momento de juntarlas.
? Lee tu cuaderno de detective. ¿Dónde está {mascota}?

## encuentro
@fondo: $lugar
@con: mascota

### aprendiz
{{{lectora} y {hermana} van {al_lugar}.|{lectora} va {al_lugar}.}}
> ¡Allí está {mascota}!
{{{hermana} le da un abrazo muy fuerte.|{lectora} le da un abrazo muy fuerte.}}
{mascota} tiene algo que brilla.
¡Es un cristal mágico!
---
{{Las niñas corren {hacia_lugar}.|{lectora} corre {hacia_lugar}.}}
> Detrás de una piedra está {mascota}.
¡Qué alegría!
{mascota} ha encontrado un cristal que brilla.

### novatilla
{{Las niñas corren {hacia_lugar} todo lo deprisa que pueden.|{lectora} corre {hacia_lugar} todo lo deprisa que puede.}}
Y allí está {mascota}, sentad{mo} tan tranquil{mo}, como si no hubiera pasado nada.
{{> {hermana} le da un abrazo tan fuerte que a {mascota} se le escapa un ruidito muy raro.|> {lectora} le da un abrazo tan fuerte que a {mascota} se le escapa un ruidito muy raro.}}
Entonces {lectora} ve que {el_animal} tiene algo brillante a su lado.
Es un trocito de cristal que da una luz suave, como una linterna pequeña.

### lectora
{{Cuando llegan {al_lugar}, al principio no ven a nadie.|Cuando llega {al_lugar}, al principio no ve a nadie.}}
{{Pero entonces oyen un ruidito detrás de una piedra… ¡Es {mascota}!|Pero entonces oye un ruidito detrás de una piedra… ¡Es {mascota}!}}
{{> {hermana} le da tantos besos que {mascota} acaba con la cara llena de arena.|> {lectora} le da tantos besos que {mascota} acaba con la cara llena de arena.}}
? ¿Por qué {mascota} {pista1}?
* Porque había estado {en_lugar}.
- Porque había estado {en_falso}.
- Porque se había dado un baño de espuma en la bañera.
¡Exacto! Las pistas tenían todo el sentido del mundo.
A los pies de {mascota} hay algo que brilla: un trocito de cristal que da una luz dorada.

### superlectora
{{Las detectives llegan {al_lugar} y se esconden detrás de una roca para observar.|{lectora} llega {al_lugar} y se esconde detrás de una roca para observar.}}
Allí, muy concentrad{mo}, está {mascota}, escarbando en la arena.
{{> —¡Caso resuelto! —susurra {lectora}, y {hermana} aplaude tan fuerte que {mascota} da un brinco.|> —¡Caso resuelto! —susurra {lectora}, y aplaude tan fuerte que {mascota} da un brinco.}}
{{? ¿Qué pistas os han traído hasta aquí?|? ¿Qué pistas te han traído hasta aquí?}}
* Que no fue {al_falso} y que {pista1}.
- Que {pista_falsa}.
- Que tenía muchas ganas de comer churros.
{mascota} ha desenterrado algo. Es un trocito de cristal curvo que brilla con una luz dorada, como si guardara un poco de sol.
{lectora} lo apunta en el cuaderno: [[un cristal que brilla con luz dorada]].

## final
@final
@fondo: $lugar
@con: mascota

### aprendiz
{lectora} mira el cristal.
Es un trozo de la lámpara del faro.
Pero… ¿quién lo ha traído aquí?

### novatilla
De camino a casa, {lectora} mira el cristal con mucha atención.
Tiene la misma forma que la lámpara del faro, como un trocito de su ventana redonda.
De pronto, una gaviota pasa volando muy bajito y lo mira con mucho interés.
¿Qué sabrá esa gaviota?

### lectora
{{De vuelta a casa, las tres van muy contentas por la orilla.|De vuelta a casa, {lectora} y {mascota} van muy content{mo}s por la orilla.}}
{lectora} gira el cristal entre los dedos. Es curvo, como un trocito de la lámpara del faro.
{{—¿Quién lo habrá traído hasta aquí? —pregunta {hermana}.|—¿Quién lo habrá traído hasta aquí? —se pregunta {lectora}.}}
{{Nadie lo sabe todavía. Pero en lo alto de un poste, una gaviota con un pañuelo rojo las está mirando…|Nadie lo sabe todavía. Pero en lo alto de un poste, una gaviota con un pañuelo rojo la está mirando…}}

### superlectora
{{Ya es por la tarde cuando las detectives vuelven a casa con {mascota}.|Ya es por la tarde cuando la detective vuelve a casa con {mascota}.}}
{lectora} no deja de mirar el cristal. Es curvo y tiene el borde dorado, igual que la lámpara del faro.
{{—Los cristales no andan solos —dice {hermana}, muy segura.|}}
{{—Este no —responde {lectora}—. Alguien lo ha traído desde el faro. Y vamos a averiguar quién.|—Los cristales no andan solos —dice {lectora}, muy segura—. Alguien lo ha traído desde el faro. Y vamos a averiguar quién.}}
{{Lo que ninguna de las dos ve es una gaviota con un pañuelo rojo en el cuello que las sigue en silencio, de poste en poste, sin quitarle ojo al cristal.|Lo que {lectora} no ve es una gaviota con un pañuelo rojo en el cuello que la sigue en silencio, de poste en poste, sin quitarle ojo al cristal.}}
