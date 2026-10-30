---
# ─────────────────────────────────────────────────────────────
#  LIBRO: El bosque de los susurros
#  Aquí se define el "mundo" que comparten todos los capítulos:
#  lugares, animales que ayudan, tesoros de {hermana} y frases de humor.
#  Los capítulos (cap-01.md, cap-02.md…) usan estas piezas al azar.
# ─────────────────────────────────────────────────────────────
titulo: "El bosque de los susurros"
resumen: "{{{lectora} y {hermana} se convierten en detectives en un bosque donde los animales hablan.|{lectora} se convierte en detective en un bosque donde los animales hablan.}}"
portada: bosque

# Cada lugar necesita:
#   nombre y articulo (el / la) → el juego construye «al río», «a la cueva», «en el río»…
#   fondo  → nombre del dibujo en assets/fondos (sin .svg)
#   pistas → cosas que le pasan a quien ha estado allí. Se leen como
#            «{buscado} tenía las patas mojadas». {o} se cambia por o/a.
#   senales → cómo es el sitio. Se leen como «es un sitio donde hay eco».
lugares:
  rio:
    nombre: "río"
    articulo: "el"
    fondo: rio
    icono: "🌊"
    pistas:
      - "tenía las patas mojadas"
      - "olía a peces y a algas"
      - "llevaba un junco enredado en la cola"
      - "iba dejando gotitas de agua por el camino"
    senales:
      - "se oye cantar el agua entre las piedras"
      - "las ranas croan sin parar"
      - "hay piedras redondas y resbaladizas"
  cueva:
    nombre: "cueva"
    articulo: "la"
    fondo: cueva
    icono: "🪨"
    pistas:
      - "tenía telarañas pegadas por todas partes"
      - "estaba llen{o} de polvo gris"
      - "temblaba de frío, como si viniera de un sitio muy oscuro"
      - "repetía las cosas tres veces, como si todavía oyera el eco"
    senales:
      - "todo lo que dices se repite tres veces"
      - "nunca entra la luz del sol"
      - "cuelgan piedras puntiagudas del techo"
  puente:
    nombre: "puente de madera"
    articulo: "el"
    fondo: puente
    icono: "🌉"
    pistas:
      - "tenía astillas de madera enganchadas"
      - "llevaba un trocito de cuerda enredado en una pata"
      - "estaba un poco mareadill{o}, como si hubiera cruzado algo que se balancea"
      - "hacía toc, toc, toc al andar, igual que al pisar tablas de madera"
    senales:
      - "las tablas de madera crujen bajo los pies"
      - "se puede cruzar de un lado al otro sin mojarse"
      - "hay cuerdas para agarrarse y no caerse"
  prado:
    nombre: "prado de las margaritas"
    articulo: "el"
    fondo: prado
    icono: "🌼"
    pistas:
      - "tenía polen amarillo por todas partes"
      - "olía muchísimo a margaritas"
      - "no paraba de estornudar por culpa de las flores"
      - "llevaba una mariquita de paseo en la espalda"
    senales:
      - "hay flores blancas y amarillas por todas partes"
      - "las abejas trabajan sin descanso"
      - "la hierba te llega hasta las rodillas"
  arbol:
    nombre: "árbol hueco"
    articulo: "el"
    fondo: arbol
    icono: "🌳"
    pistas:
      - "tenía hojas secas enredadas"
      - "llevaba una bellota escondida"
      - "estaba llen{o} de serrín"
      - "tenía la cola pegajosa de resina"
    senales:
      - "hay un tronco tan gordo que no se puede abrazar"
      - "las ardillas guardan sus nueces"
      - "caen hojas secas todo el rato"

# Animales que ayudan. «gracias» son cosas graciosas que hacen.
ayudantes:
  buho:
    nombre: "Bruno"
    especie: "búho"
    articulo: "el"
    emoji: "🦉"
    descripcion: "un búho muy despistado que lleva las gafas al revés"
    gracias:
      - "a Bruno se le caen las gafas dentro de un nido vacío"
      - "{{Bruno confunde a {hermana} con una lechuza y le da las buenas noches, aunque es de día|Bruno confunde a {lectora} con una lechuza y le da las buenas noches, aunque es de día}}"
      - "Bruno se pone a contar estrellas, aunque todavía no ha salido ninguna"
  sapo:
    nombre: "Paco"
    especie: "sapo"
    articulo: "el"
    emoji: "🐸"
    descripcion: "un sapo gordito que se tira pedos cuando se pone nervioso"
    gracias:
      - "Paco se tira un pedo que suena como una trompeta: ¡prrrrr!"
      - "Paco se tira un pedo tan fuerte que sale volando hasta una hoja"
      - "Paco se tira un pedito y dice «perdón» muy serio"
  ardilla:
    nombre: "Rita"
    especie: "ardilla"
    articulo: "la"
    emoji: "🐿️"
    descripcion: "una ardilla que habla rapidísimo porque ha comido demasiadas nueces"
    gracias:
      - "a Rita se le escapan tres nueces de la boca, una detrás de otra"
      - "Rita habla tan deprisa que se le hace un nudo en la lengua"
      - "Rita intenta guardar una nuez en el bolsillo de {lectora}"
  erizo:
    nombre: "Pincho"
    especie: "erizo"
    articulo: "el"
    emoji: "🦔"
    descripcion: "un erizo que se hace una bola cada vez que alguien estornuda"
    gracias:
      - "{{{hermana} estornuda y Pincho se hace una bola y rueda cuesta abajo|{lectora} estornuda y Pincho se hace una bola y rueda cuesta abajo}}"
      - "a Pincho se le queda una manzana pinchada en la espalda"
      - "Pincho intenta peinarse los pinchos con una piña"
  tortuga:
    nombre: "Tula"
    especie: "tortuga"
    articulo: "la"
    emoji: "🐢"
    descripcion: "una tortuga lentísima que tarda un minuto entero en decir hola"
    gracias:
      - "{{Tula dice «hoooooolaaaaa» tan despacio que a {hermana} le da tiempo a comerse una galleta|Tula dice «hoooooolaaaaa» tan despacio que a {lectora} le da tiempo a comerse una galleta}}"
      - "Tula se queda dormida a mitad de una frase"
      - "Tula estornuda y se esconde dentro de su caparazón del susto"

# Cuando se elige un camino equivocado. Variables: {elegido}, {al_elegido}, {en_elegido}, {buscado}
equivocado:
  - "{{{lectora} y {hermana} van {al_elegido}.|{lectora} va {al_elegido}.}} Allí solo hay una rana que dice: «Croac, aquí no ha venido nadie»."
  - "{{En {elegido} solo encuentran un caracol dormido.|En {elegido}, {lectora} solo encuentra un caracol dormido.}} Ronca muy fuerte, pero no ha visto a {buscado}."
  - "{{Llegan {al_elegido} y buscan por todas partes. Solo encuentran|{lectora} llega {al_elegido} y busca por todas partes. Solo encuentra}} un calcetín perdido que no es de nadie."
  - "{{{hermana}|{lectora}}} busca {en_elegido} debajo de cada piedra. Solo encuentra un escarabajo que le saca la lengua."

# Cuando se falla una pregunta de comprensión.
equivocado_pregunta:
  - "¡Casi! Vuelve a leer el texto despacito. La respuesta está escondida ahí."
  - "Esa no es. {{{hermana} dice que ella tampoco lo sabía.|Pero no pasa nada: equivocarse también es aprender.}} ¡Prueba otra vez!"
  - "¡Inténtalo de nuevo! Las buenas detectives siempre leen dos veces."

# Tesoros que {hermana} puede encontrar escondidos en los dibujos.
tesoros:
  - { emoji: "🌰", nombre: "una bellota" }
  - { emoji: "🍄", nombre: "una seta roja" }
  - { emoji: "🐞", nombre: "una mariquita" }
  - { emoji: "🐌", nombre: "un caracol" }
  - { emoji: "🌼", nombre: "una margarita" }
  - { emoji: "💎", nombre: "una piedra brillante" }
  - { emoji: "🦋", nombre: "una mariposa" }
  - { emoji: "🍓", nombre: "una fresa salvaje" }
  - { emoji: "⭐", nombre: "una estrella de papel" }
  - { emoji: "🐚", nombre: "una concha" }
---

En este bosque los animales hablan bajito, como si contaran secretos.
{{{lectora} y {hermana} descubren que son unas detectives estupendas.|{lectora} descubre que es una detective estupenda.}}
