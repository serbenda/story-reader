---
# ─────────────────────────────────────────────────────────────
#  LIBRO: El secreto del faro
#  Vacaciones en una isla con playa. La luz del viejo faro se ha
#  apagado y {lectora}, {hermana} y la mascota averiguan por qué.
#  Los capítulos (cap-01.md, cap-02.md…) usan estas piezas al azar.
# ─────────────────────────────────────────────────────────────
titulo: "El secreto del faro"
resumen: "{{De vacaciones en una isla, {lectora} y {hermana} descubren que la luz del viejo faro se ha apagado.|De vacaciones en una isla, {lectora} descubre que la luz del viejo faro se ha apagado.}}"
portada: faro

# Las pistas se leen detrás de un nombre: «{buscado} olía a pescado».
# Sirven para la mascota, para la gaviota Fina y para la estrella de mar Lumi,
# así que no hablan de patas, colas ni picos. {o} se cambia por o/a.
# Las senales se leen como «es un sitio donde hay redes por todas partes».
lugares:
  playa:
    nombre: "playa de las conchas"
    articulo: "la"
    fondo: playa
    icono: "🏖️"
    pistas:
      - "llevaba una concha pequeña enganchada"
      - "estaba calentit{o}, como si hubiera tomado el sol"
      - "olía a crema de sol"
      - "tenía un poco de helado de vainilla pegado"
    senales:
      - "hay conchas de todos los colores en la arena"
      - "la gente toma el sol debajo de las sombrillas"
      - "las olas llegan despacito a la orilla"
  charca:
    nombre: "charca de las rocas"
    articulo: "la"
    fondo: playa
    icono: "🪨"
    pistas:
      - "tenía un trocito de alga verde enredado"
      - "estaba empapad{o} de agua salada"
      - "llevaba un caracolillo pegado"
      - "olía a algas y a sal"
    senales:
      - "hay charcos pequeños entre las piedras"
      - "las piedras están cubiertas de algas resbaladizas"
      - "los cangrejos se esconden debajo de las rocas"
  cueva:
    nombre: "cueva de los ecos"
    articulo: "la"
    fondo: cueva
    icono: "🕳️"
    pistas:
      - "estaba frí{o}, como si viniera de un sitio sin sol"
      - "estaba llen{o} de gotitas de agua fría"
      - "repetía las cosas dos veces, como si todavía oyera el eco"
      - "tenía polvo gris de roca por todas partes"
    senales:
      - "todo lo que dices se repite dos veces"
      - "nunca entra la luz del sol"
      - "caen gotas de agua del techo"
  barco:
    nombre: "barco de pesca"
    articulo: "el"
    fondo: barco
    icono: "⛵"
    pistas:
      - "olía muchísimo a pescado"
      - "estaba un poco mareadill{o}, como si viniera de algo que se mueve"
      - "llevaba un trozo de red enredado"
      - "tenía manchas de pintura azul, como la de un barco recién pintado"
    senales:
      - "hay redes y cuerdas por todas partes"
      - "el suelo de madera se mueve con las olas"
      - "los pescadores guardan cajas llenas de peces"
  cabana:
    nombre: "cabaña del pescador"
    articulo: "la"
    fondo: casa
    icono: "🏠"
    pistas:
      - "estaba llen{o} de migas de pan"
      - "olía a sopa de pescado recién hecha"
      - "llevaba un hilo de lana enredado, como los de una manta"
      - "estaba pringos{o} de mermelada de fresa"
    senales:
      - "sale humo por la chimenea"
      - "hay una mecedora en la puerta"
      - "huele a sopa caliente"
  duna:
    nombre: "duna grande"
    articulo: "la"
    fondo: playa
    icono: "🏜️"
    pistas:
      - "llevaba una espiga de hierba seca enganchada"
      - "estaba cansadísim{o}, como si hubiera subido una montaña de arena"
      - "venía resoplando, como si hubiera luchado contra el viento"
      - "había bajado rodando por una cuesta de arena"
    senales:
      - "el viento sopla muy fuerte"
      - "hay una montaña de arena altísima"
      - "crece una hierba seca que pincha"

# Animales del mar que ayudan. «gracias» son cosas graciosas que hacen.
ayudantes:
  cangrejo:
    nombre: "Tito"
    especie: "cangrejo"
    articulo: "el"
    emoji: "🦀"
    descripcion: "un cangrejo que solo sabe andar de lado y siempre llega tarde"
    gracias:
      - "Tito quiere saludar, pero anda de lado y pasa de largo"
      - "{{Tito se engancha una pinza en el cubo de {hermana} y no se la puede sacar|Tito se engancha una pinza en el cubo de {lectora} y no se la puede sacar}}"
      - "Tito intenta andar recto y acaba dando vueltas en círculo"
  pulpo:
    nombre: "Toño"
    especie: "pulpo"
    articulo: "el"
    emoji: "🐙"
    descripcion: "un pulpo cariñoso que da abrazos con sus ocho brazos a la vez"
    gracias:
      - "{{Toño abraza a todos a la vez y a {hermana} le dan muchas cosquillas|Toño abraza a todos a la vez y a {lectora} le dan muchas cosquillas}}"
      - "Toño se pone tan contento que cambia de color, como un semáforo"
      - "Toño intenta peinarse con los ocho brazos y se hace un nudo"
  delfin:
    nombre: "Lino"
    especie: "delfín"
    articulo: "el"
    emoji: "🐬"
    descripcion: "un delfín que cuenta chistes malísimos y se ríe él solo"
    gracias:
      - "Lino cuenta un chiste de sardinas y se ríe tanto que salpica a todos"
      - "Lino da un salto enorme y cae de tripa con un plaf tremendo"
      - "Lino estornuda por el agujerito de la cabeza y moja a {lectora}"
  foca:
    nombre: "Bola"
    especie: "foca"
    articulo: "la"
    emoji: "🦭"
    descripcion: "una foca gordita que aplaude cada vez que está contenta"
    gracias:
      - "Bola aplaude tan fuerte que se resbala y rueda por la arena"
      - "Bola se tira un pedo que hace burbujas en el agua"
      - "Bola intenta sujetar una pelota con la nariz y se le cae en la cabeza"
  tortuga:
    nombre: "Tina"
    especie: "tortuga marina"
    articulo: "la"
    emoji: "🐢"
    descripcion: "una tortuga marina muy viajera que se duerme en cualquier sitio"
    gracias:
      - "Tina se queda dormida a mitad de una palabra y ronca como un barco"
      - "Tina se esconde dentro del caparazón porque le da vergüenza saludar"
      - "{{Tina tarda tanto en sonreír que a {hermana} le da tiempo a hacer un castillo de arena|Tina tarda tanto en sonreír que a {lectora} le da tiempo a hacer un castillo de arena}}"

# Cuando se elige un camino equivocado. Variables: {elegido}, {al_elegido}, {en_elegido}, {buscado}
equivocado:
  - "{{{lectora} y {hermana} van {al_elegido}. Allí solo hay una almeja dormida que dice: «Aquí no ha venido nadie».|{lectora} va {al_elegido}. Allí solo hay una almeja dormida que dice: «Aquí no ha venido nadie».}}"
  - "{{En {elegido} solo encuentran un cubo olvidado lleno de agua. Ni rastro de {buscado}.|En {elegido} solo encuentra un cubo olvidado lleno de agua. Ni rastro de {buscado}.}}"
  - "{{Llegan {al_elegido} y buscan por todas partes. Solo encuentran una chancla perdida que no es de nadie.|{lectora} llega {al_elegido} y busca por todas partes. Solo encuentra una chancla perdida que no es de nadie.}}"
  - "{{{hermana} busca {en_elegido} debajo de cada piedra. Solo encuentra un mejillón que no tiene ganas de hablar.|{lectora} busca {en_elegido} debajo de cada piedra. Solo encuentra un mejillón que no tiene ganas de hablar.}}"

# Cuando se falla una pregunta de comprensión.
equivocado_pregunta:
  - "¡Casi! Vuelve a leer el texto despacito. La respuesta está escondida ahí."
  - "{{Esa no es. {hermana} dice que ella tampoco lo sabía. ¡Prueba otra vez!|Esa no es, pero no pasa nada. ¡Prueba otra vez!}}"
  - "¡Inténtalo de nuevo! Las buenas detectives siempre leen dos veces."

# Tesoros que {hermana} puede encontrar escondidos en los dibujos.
tesoros:
  - { emoji: "🐚", nombre: "una caracola" }
  - { emoji: "🐡", nombre: "un pez globo" }
  - { emoji: "🐠", nombre: "un pez de colores" }
  - { emoji: "🦀", nombre: "un cangrejito" }
  - { emoji: "⚓", nombre: "un ancla diminuta" }
  - { emoji: "🍦", nombre: "un helado de vainilla" }
  - { emoji: "🕶️", nombre: "unas gafas de sol" }
  - { emoji: "💎", nombre: "un cristal de mar" }
  - { emoji: "🍉", nombre: "una tajada de sandía" }
---

En esta isla las olas cuentan secretos y los animales del mar hablan con quien sabe escuchar.
{{{lectora} y {hermana} tienen que descubrir por qué se ha apagado la luz del viejo faro.|{lectora} tiene que descubrir por qué se ha apagado la luz del viejo faro.}}
