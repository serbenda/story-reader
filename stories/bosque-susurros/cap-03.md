---
titulo: "La puerta del árbol viejo"
resumen: "Noche de luna llena. La llave dorada por fin va a abrir algo."
buscamos: mascota
lugares: [rio, cueva, puente, prado]
pegatina: "🎉"
---

## puerta
@fondo: arbol
@con: mascota
@noche

### aprendiz
Es de noche y hay luna llena.
Alaia, Lucía y {mascota} van al árbol viejo.
En el tronco hay una puerta pequeña.
> Alaia mete la llave y la puerta se abre.
Dentro hay una carta.
¡Y {mascota} se va corriendo otra vez!
---
La luna está redonda y brilla mucho.
Las niñas llegan al árbol viejo.
> Alaia abre la puerta con la llave dorada.
Dentro hay una carta que dice: «Fiesta esta noche».
Pero… ¿dónde está {mascota}? ¡Se ha ido!

### novatilla
La luna llena ilumina el bosque como una lámpara gigante.
Alaia, Lucía y {mascota} caminan de puntillas hasta el árbol más viejo.
En la base del tronco hay una puertecita verde, del tamaño de un libro.
> Alaia mete la llave dorada, la gira despacio… ¡y la puerta se abre con un clic!
Dentro hay una carta enrollada con un lazo rojo. Dice: «Os esperamos en la fiesta. Preguntad a los animales dónde es».
Cuando Alaia levanta la vista, {mascota} ya no está. Solo se oyen unos pasitos que se alejan.

### lectora
Esa noche, la luna llena brilla tanto que el bosque parece hecho de plata.
Alaia lleva la llave dorada colgada del cuello, y Lucía lleva una linterna, aunque no le hace falta.
{mascota} va delante, muy decidid{mo}, como si supiera exactamente adónde van.
Por fin llegan al árbol más viejo del bosque. Entre sus raíces hay una puertecita verde con un picaporte dorado.
> Alaia mete la llave en la cerradura, la gira una vez, la gira dos veces… y la puerta se abre con un clic.
Dentro, sobre un cojín de musgo, hay una carta enrollada con un lazo rojo.
«Queridas detectives: esta noche hay una fiesta y vosotras sois las invitadas de honor. Preguntad a los animales dónde es.»
Alaia se da la vuelta para enseñársela a {mascota}… pero {mascota} ha desaparecido otra vez.

### superlectora
A medianoche, las detectives salen de casa de puntillas. La luna llena es tan grande que parece que se va a caer encima del bosque.
Alaia lleva la llave dorada y su cuaderno. Lucía lleva una linterna, un bocadillo y el colador en la cabeza, por si acaso.
{mascota} camina delante, con la cola muy tiesa. Parece que sabe algo que ellas no saben.
Al pie del árbol más viejo encuentran una puertecita verde, medio escondida entre las raíces.
> Alaia mete la llave, contiene la respiración y la gira despacio. ¡Clic!
Dentro hay una carta con letras doradas: «Queridas detectives: esta noche se celebra una fiesta en vuestro honor. Para encontrarla, tendréis que resolver un último caso».
Alaia se gira para leérsela a {mascota}, pero {mascota} ya no está. Solo queda una pista en el suelo: [[unas huellas que se alejan del árbol]].

## pista
@fondo: bosque
@con: ayudante
@noche

### aprendiz
En el bosque está {ayudante}.
Lleva un gorro de fiesta.
> {ayudante_nombre} dice: «La fiesta es {en_lugar}».
? ¿Dónde es la fiesta?
---
Las niñas ven {al_ayudante}.
Va muy content{o2}… ¡lleva un globo!
> «¡Id {al_lugar}!», dice {ayudante_nombre}.
? ¿A dónde tienen que ir?

### novatilla
Entre los árboles aparece {ayudante}, con un gorro de fiesta en la cabeza.
—¡Uy! Vosotras no deberíais verme todavía —dice. Y del susto, {gracia}.
{ayudante_nombre} se acerca y susurra:
> «La fiesta no es {en_falso}. Es {en_lugar}.»
—Pero no digáis que os lo he dicho yo.
? ¿Dónde es la fiesta?
---
Junto al sendero está {ayudante}, {ayudante_desc}. Lleva un regalo envuelto en hojas.
—Os voy a contar un secreto —dice {ayudante_nombre}.
> «Muchos creen que la fiesta es {en_falso}, pero se equivocan. Es {en_lugar}.»
? ¿Adónde tienen que ir Alaia y Lucía?

### lectora
En mitad del sendero se encuentran con {ayudante}, {ayudante_desc}. Lleva un gorro de fiesta torcido y un regalo debajo del brazo.
—¡Ay, me habéis pillado! —exclama. Y del susto, {gracia}.
Alaia le enseña la carta y le pregunta dónde es la fiesta.
> «No puedo decíroslo», contesta {ayudante_nombre}, «es una sorpresa. Pero os daré una pista».
—La fiesta es en un sitio donde {senal1}.
Alaia cierra los ojos y piensa en todos los sitios del bosque.
? ¿Dónde es la fiesta?

### superlectora
Siguiendo las huellas, las detectives se encuentran con {ayudante}, {ayudante_desc}, que lleva un gorro de fiesta y mucha prisa.
—¡No he visto nada! ¡No sé nada! —dice antes de que nadie le pregunte. Y entonces {gracia}.
> Alaia le enseña la carta y dice: «Somos detectives. Solo queremos una pista».
{ayudante_nombre} mira a un lado y a otro, y por fin susurra:
—Os diré dos cosas. Una: [[la fiesta no es {en_falso}]]. Dos: [[es un sitio donde {senal1}]].
Alaia lo apunta todo. Lucía se come medio bocadillo, porque investigar da mucha hambre.

## pista2
@fondo: bosque
@con: ayudante2
@noche

### superlectora
Un poco más allá, colgando farolillos de una rama, está {ayudante2}, {ayudante2_desc}.
—¡Las invitadas de honor! —exclama, y del susto {gracia2}.
> «Yo solo os diré una cosa», dice {ayudante2_nombre}, guiñando un ojo: «[[en el sitio de la fiesta {senal2}]]».
Alaia repasa el cuaderno a la luz de la linterna. Cuatro pistas. Un solo sitio.
? Lee tu cuaderno. ¿Dónde es la fiesta?

## fiesta
@fondo: $lugar
@con: mascota, ayudante, ayudante2
@noche

### aprendiz
Alaia y Lucía llegan {al_lugar}.
> ¡Sorpresa! ¡Es una fiesta!
Están todos los animales del bosque.
Y también está {mascota}.
¡Hay una tarta enorme!
---
Las niñas llegan {al_lugar}.
Hay luces y música.
> ¡Todos gritan: «Sorpresa»!
{mascota} está allí.
¡La fiesta es para Alaia y Lucía!

### novatilla
Cuando llegan {al_lugar}, se encienden de golpe cien farolillos de colores.
—¡SORPRESA! —gritan todos los animales del bosque.
Allí están {ayudante}, {ayudante2}, la urraca Pepa… y en el centro, con un gorro de fiesta, {mascota}.
> Hay una tarta de fresa enorme con dos velas y un cartel que dice: «Para las mejores detectives».
Lucía da saltos de alegría. Alaia se ríe tanto que se le escapa una lagrimita.

### lectora
Al llegar {al_lugar}, todo está oscuro y en silencio. Demasiado silencio.
De repente, se encienden cien farolillos de colores y suena una música alegre.
—¡SORPRESA!
Todos los animales del bosque están allí: {ayudante}, {ayudante2}, la urraca Pepa con su horquilla de purpurina… y en el centro, con un gorro de fiesta, {mascota}.
> {mascota} lo había organizado todo para dar las gracias a las niñas por buscarle siempre que se pierde.
? ¿Quién había preparado la fiesta sorpresa?
* {mascota} y los animales del bosque.
- La urraca Pepa ella sola.
- Los papás de Alaia y Lucía.
Hay tarta de fresa, zumo de moras y un baile en el que el sapo Paco no para de tirarse pedos al ritmo de la música.

### superlectora
Las detectives llegan {al_lugar} sin hacer ruido. Todo está oscuro.
Alaia levanta la linterna… y en ese instante se encienden cien farolillos de colores.
—¡SORPRESA! —gritan todos a la vez.
Allí están {ayudante}, {ayudante2}, la urraca Pepa y muchísimos animales más. En el centro, con un gorro de fiesta ladeado, está {mascota}.
> Sobre una mesa de piedra hay una tarta de fresa con un cartel: «Para Alaia y Lucía, las mejores detectives del bosque».
? ¿Por qué supiste que la fiesta era {en_lugar}?
* Porque es un sitio donde {senal1}.
- Porque es un sitio donde {senal_falsa}.
- Porque allí venden churros.
Alaia cierra el cuaderno. Es el caso más bonito que han resuelto nunca.

## final
@final
@fondo: $lugar
@con: mascota
@noche

### aprendiz
La fiesta dura hasta muy tarde.
Alaia y Lucía bailan con {mascota}.
¡Qué noche tan bonita!
Fin del libro.

### novatilla
Bailan, cantan y comen tarta hasta que la luna empieza a esconderse.
De vuelta a casa, Lucía se queda dormida en la espalda de Alaia.
Y en lo alto de un árbol, la mariposa azul las mira… y lleva un mensaje atado a una pata.
Fin del primer libro.

### lectora
La fiesta dura hasta que el cielo empieza a ponerse rosa.
Volviendo a casa, Lucía bosteza tanto que casi se traga una polilla.
Alaia lleva la llave dorada en la mano. Cree que ya no abrirá nada más… pero, de pronto, la llave se pone calentita.
Encima de ella, la mariposa azul revolotea en círculos. Lleva atado un papelito diminuto.
Continuará en el próximo libro.

### superlectora
Cuando la fiesta termina, los animales acompañan a las detectives hasta la valla del jardín.
Alaia escribe la última línea del cuaderno: «Caso cerrado».
Pero justo cuando va a cerrarlo, una mariposa azul con puntitos dorados se posa sobre la página. Lleva atado a la pata un papel enrollado, más pequeño que una uña.
Alaia lo desenrolla con mucho cuidado. Solo tiene tres palabras: «Necesitamos vuestra ayuda».
Continuará en el próximo libro.
