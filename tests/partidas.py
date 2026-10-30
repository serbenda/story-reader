"""Pruebas de La biblioteca mágica en un navegador de verdad (sin ventana).

Uso (desde la carpeta del repo):
    pip install playwright && python -m playwright install chromium   # solo la primera vez
    python tests/partidas.py            # todo (unos minutos)
    python tests/partidas.py --rapido   # solo un libro

Qué hace:
  1. Funciones: elegir nombres y una o dos niñas, tienda, meta del día y racha,
     sílabas de colores y regla, tu voz grabada, copia de seguridad, pasar el
     progreso a otro dispositivo e informe.
  2. Partidas completas con un micrófono simulado (a veces «lee» mal alguna palabra):
     de cada libro, el capítulo 1 en Superlectora con dos niñas y el capítulo 2 en
     Aprendiz con una sola niña de nombre inventado. Con una niña comprueba que
     nunca salen la hermana, «las niñas» ni los nombres por defecto.
Termina con código 1 si algo falla.
"""
import asyncio, json, os, socket, subprocess, sys, tempfile, time

try:
    from playwright.async_api import async_playwright
except ImportError:
    sys.exit('Falta Playwright: pip install playwright && python -m playwright install chromium')

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RAPIDO = '--rapido' in sys.argv
CLAVE = 'biblioteca-magica-v1'
fallos, errores_pagina = [], []


def ok(cond, msg):
    print(('  ✓ ' if cond else '  ✗ ') + msg)
    if not cond:
        fallos.append(msg)


# Micrófono simulado: en el primer intento de cada frase «se equivoca» en alguna palabra larga
MICRO = r"""
(() => {
  class MicroFalso {
    start() {
      setTimeout(() => {
        const tarjeta = [...document.querySelectorAll('.tarjeta-voz:not(.superada)')].pop();
        let palabras = tarjeta ? [...tarjeta.querySelectorAll('.frase-voz .palabra')].map((s) => s.textContent) : [];
        const primera = tarjeta && !tarjeta.dataset.intentado;
        if (tarjeta) tarjeta.dataset.intentado = '1';
        if (primera) palabras = palabras.map((w) => (w.replace(/[^\p{L}]/gu, '').length > 6 && Math.random() < 0.25 ? 'eh' : w));
        const alternativa = { transcript: palabras.join(' '), confidence: 0.9 };
        const resultado = [alternativa]; resultado.isFinal = true;
        this.onresult && this.onresult({ resultIndex: 0, results: [resultado] });
        this.onend && this.onend();
      }, 100);
    }
    stop() {}
  }
  window.SpeechRecognition = window.webkitSpeechRecognition = MicroFalso;
  if (window.speechSynthesis) speechSynthesis.speak = () => {};
})();
"""

PERFIL_DOS = {"ninas": 2, "nombres": {"lectora": "Alaia", "hermana": "Lucía"},
              "alaya": {"piel": "#EDBB91", "pelo": "#6B3E26", "vestido": "#8A62C4", "accesorio": "sombrero"},
              "lucia": {"piel": "#EDBB91", "pelo": "#6B3E26", "vestido": "#F2B33D", "accesorio": "lazo"},
              "mascota": {"especie": "conejo", "genero": "chica", "nombre": "Kiwi"}}
PERFIL_UNA = dict(PERFIL_DOS, ninas=1, nombres={"lectora": "Martina", "hermana": "Vera"})
PROHIBIDO_UNA = ['Vera', 'Lucía', 'Alaia', 'las niñas', 'Las niñas', 'las detectives', 'Las detectives']


async def contexto(nav, **kw):
    ctx = await nav.new_context(viewport={'width': 1180, 'height': 860}, service_workers='block', **kw)
    await ctx.add_init_script(MICRO)
    if os.environ.get('JSYAML_LOCAL'):  # para entornos sin acceso a cdnjs
        await ctx.route('**/cdnjs.cloudflare.com/**', lambda r: r.fulfill(path=os.environ['JSYAML_LOCAL'], content_type='application/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    return ctx


async def pagina(ctx, url, perfil=None, extra='{}'):
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errores_pagina.append(str(e)))
    pg.on('console', lambda m: errores_pagina.append(m.text) if m.type == 'error' and 'Failed to load' not in m.text else None)
    await pg.goto(url)
    await pg.wait_for_function('window.Juego && Juego.catalogo')
    if perfil:
        await pg.evaluate("""([p, extra, clave]) => { const e = Juego.estado; e.perfil = p; e.ajustes.sonido = false; Object.assign(e, extra);
          localStorage.setItem(clave, JSON.stringify(e)); }""", [perfil, json.loads(extra), CLAVE])
        await pg.reload()
        await pg.wait_for_selector('.estanteria')
    return pg


async def jugar(pg, comprobar_una=False):
    """Juega el capítulo abierto hasta el final. Devuelve lo que ha visto."""
    vistos = set()
    for _ in range(200):
        await pg.wait_for_timeout(150)
        if comprobar_una:
            texto = await pg.inner_text('#app')
            for malo in PROHIBIDO_UNA:
                if malo in texto:
                    vistos.add('PROHIBIDO: ' + malo)
        if await pg.locator('.final-capitulo').count():
            return vistos
        for sel, nombre in [('.tarjeta-repaso', 'palabras mágicas'), ('.tarjeta-reto', 'cerradura'), ('.tarjeta-pregunta', 'pregunta'), ('.tarjeta-voz', 'voz')]:
            if await pg.locator(sel).count():
                vistos.add(nombre)
        if await pg.locator('.capa [data-cerrar]').count():
            await pg.click('.capa [data-cerrar]'); continue
        for sel in ['.tarjeta-voz:not(.superada) .boton-ya:visible', '.tarjeta-voz:not(.superada) .boton-mic:visible',
                    '.tarjeta-reto:not(.abierta) .reto-opcion:not([disabled])']:
            loc = pg.locator(sel)
            if await loc.count():
                await loc.first.click(); await pg.wait_for_timeout(700); break
        else:
            ops = pg.locator('.tarjeta-pregunta:last-of-type .opcion:not([disabled])')
            if await ops.count() and not await pg.locator('.tarjeta-pregunta:last-of-type .opcion.correcta').count():
                await ops.first.click(); await pg.wait_for_timeout(800); continue
            if await pg.locator('#seguir').count():
                await pg.click('#seguir')
    raise RuntimeError('el capítulo no ha terminado')


async def abrir_mayores(pg):
    await pg.dispatch_event('#mayores', 'pointerdown')
    await pg.wait_for_selector('.ajustes', timeout=5000)


async def pruebas_funciones(nav, url):
    print('\n▶ Funciones')
    ctx = await contexto(nav, accept_downloads=True)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errores_pagina.append(str(e)))
    await pg.goto(url); await pg.wait_for_selector('#empezar')

    # Nombres y una o dos niñas
    await pg.click('#empezar'); await pg.wait_for_selector('#nombre-lectora')
    ok(await pg.input_value('#nombre-lectora') == 'Alaia' and await pg.input_value('#nombre-hermana') == 'Lucía', 'por defecto, Alaia y Lucía')
    await pg.fill('#nombre-lectora', 'martina'); await pg.click('[data-ninas="1"]')
    ok(await pg.locator('#nombre-hermana').count() == 0, 'con una niña no se pide el nombre de la hermana')
    for _ in range(3):
        await pg.click('#siguiente'); await pg.wait_for_timeout(150)
    await pg.wait_for_selector('.estanteria')
    ok(await pg.inner_text('.hero-info h1') == 'Martina y Toby', 'la portada usa el nombre elegido')
    ok(await pg.locator('.pj-lucia').count() == 0, 'con una niña no se dibuja a la hermana')

    # Tienda
    await pg.evaluate("c => { const e = Juego.estado; e.ajustes.sonido = false; e.estrellas = 100; localStorage.setItem(c, JSON.stringify(e)); }", CLAVE)
    await pg.reload(); await pg.wait_for_selector('.estanteria')
    await pg.click('#tienda'); await pg.wait_for_selector('.tienda')
    await pg.click('[data-comprar="acc-tiara"]'); await pg.click('[data-comprar="acc-tiara"]'); await pg.wait_for_timeout(200)
    ok(await pg.evaluate("Juego.estado.desbloqueado['acc-tiara'] && Juego.estado.gastadas === 25"), 'comprar en la tienda gasta estrellas y desbloquea')
    await pg.click('[data-poner="acc-tiara"][data-quien="alaya"]')
    ok(await pg.evaluate("Juego.estado.perfil.alaya.accesorio === 'tiara'"), 'lo comprado se puede poner')
    await pg.click('#volver'); await pg.wait_for_selector('.estanteria')

    # Sílabas de colores, regla y lectura por sílabas
    await pg.evaluate("c => { const a = Juego.estado.ajustes; a.silabas = true; a.regla = true; a.sinMicro = true; a.meta = 'm5'; localStorage.setItem(c, JSON.stringify(Juego.estado)); }", CLAVE)
    await pg.reload(); await pg.wait_for_selector('.estanteria')
    await pg.click('[data-libro-abrir="bosque-susurros"]'); await pg.click('[data-capitulo="0"]'); await pg.wait_for_selector('.bloques .linea')
    await pg.wait_for_timeout(500)
    ok(await pg.locator('.bloques .sil.s1').count() > 3, 'sílabas de colores')
    ok(await pg.locator('.con-regla .bloques > p.linea.linea-activa').count() == 1, 'regla de lectura')
    larga = pg.locator('.bloques > p.linea .palabra').filter(has_text='jardín')
    if not await larga.count():
        larga = pg.locator('.bloques > p.linea .palabra').nth(1)
    await larga.first.click(); await pg.wait_for_timeout(300); await larga.first.click(); await pg.wait_for_timeout(400)
    ok(await pg.locator('.palabra.silabeando').count() == 1, 'tocar dos veces una palabra la lee por sílabas')
    await pg.wait_for_timeout(3000)

    # Meta del día: casi 5 minutos leídos hoy y un día ayer → al avanzar se cumple y la racha es 2
    await pg.evaluate("""() => { const e = Juego.estado, k = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      e.registro.push({ fecha: Date.now() - 60000, libro: 'x', cap: 'x', titulo: 'x', nivel: 'aprendiz', micro: false, frases: 1, frasesPrimera: 0, intentos: 1, preguntas: 0, preguntasPrimera: 0, retos: 0, retosPrimera: 0, repaso: [], escenas: [], seg: 299, terminado: false });
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1); e.metaDias[k(ayer)] = true; }""")
    estrellas = await pg.evaluate("Juego.estado.estrellas")
    await pg.click('#salir'); await pg.click('#salir'); await pg.wait_for_selector('.estanteria')
    ok(await pg.evaluate(f"Juego.estado.estrellas === {estrellas} + 3"), 'cumplir la meta del día da 3 estrellas')
    ok('2 días' in await pg.inner_text('.meta-hoy'), 'la racha cuenta los días seguidos')

    # Tu voz: una grabación guardada suena al tocar la palabra
    await pg.evaluate("""async () => { const n = 4000, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      await Juego.modulos.grabaciones.guardar('mariposa', new Blob([b], { type: 'audio/wav' })); }""")
    ok(await pg.evaluate("Juego.modulos.grabaciones.reproducirYa('mariposa')"), 'una palabra grabada suena con tu voz')

    # Copia de seguridad en archivo y recuperarla en otro navegador
    await abrir_mayores(pg)
    async with pg.expect_download() as d:
        await pg.click('#descargar-copia')
    copia = os.path.join(tempfile.mkdtemp(), 'copia.json')
    await (await d.value).save_as(copia)
    await pg.click('#copiar-codigo'); await pg.wait_for_timeout(400)
    codigo = await pg.evaluate("() => (document.querySelector('#codigo-copia') || {}).value || null")
    if await pg.locator('.capa [data-cerrar]').count():
        await pg.click('.capa [data-cerrar]')
    await pg.click('#ver-informe'); await pg.wait_for_selector('.informe')
    ok(await pg.locator('.cifra').count() >= 4, 'el informe se abre con sus cifras')

    otro = await contexto(nav)
    p2 = await pagina(otro, url, PERFIL_DOS)
    await abrir_mayores(p2)
    await p2.set_input_files('#cargar-copia', copia); await p2.wait_for_timeout(500)
    ok(await p2.evaluate("Juego.estado.desbloqueado['acc-tiara'] === true && Juego.estado.estrellas >= 100"), 'la copia de seguridad se recupera en otro navegador')
    if codigo:
        p3 = await pagina(await contexto(nav), url, PERFIL_DOS)
        await abrir_mayores(p3)
        await p3.fill('#pegar-codigo', codigo); await p3.click('#juntar'); await p3.wait_for_timeout(500)
        ok(await p3.evaluate("Juego.estado.gastadas === 25"), 'el código pasa el progreso a otro dispositivo')
    await ctx.close(); await otro.close()


async def pruebas_partidas(nav, url):
    libros = json.load(open(os.path.join(RAIZ, 'stories', 'index.json'), encoding='utf-8'))['libros']
    if RAPIDO:
        libros = libros[:1]
    print(f'\n▶ Partidas ({len(libros)} libros)')
    ctx = await contexto(nav)
    pg = await pagina(ctx, url, PERFIL_DOS, json.dumps({'nivel': 'superlectora'}))
    for libro in libros:
        await pg.click(f'[data-libro-abrir="{libro["id"]}"]'); await pg.click('[data-capitulo="0"]')
        v = await jugar(pg)
        ok({'voz', 'pregunta', 'cerradura'} <= v, f'{libro["id"]} · cap. 1 · Superlectora · dos niñas ({", ".join(sorted(v))})')
        await pg.click('#a-casa'); await pg.wait_for_selector('.estanteria')
    await ctx.close()

    ctx = await contexto(nav)
    progreso = {l['id']: {'cap-01': {'aprendiz': 1}} for l in libros}
    pg = await pagina(ctx, url, PERFIL_UNA, json.dumps({'nivel': 'aprendiz', 'progreso': progreso}))
    for libro in libros:
        await pg.click(f'[data-libro-abrir="{libro["id"]}"]'); await pg.click('[data-capitulo="1"]')
        v = await jugar(pg, comprobar_una=True)
        malos = [x for x in v if x.startswith('PROHIBIDO')]
        ok(not malos and 'voz' in v, f'{libro["id"]} · cap. 2 · Aprendiz · una niña (Martina){" → " + ", ".join(malos) if malos else ""}')
        await pg.click('#a-casa'); await pg.wait_for_selector('.estanteria')
    await ctx.close()


async def main():
    s = socket.socket(); s.bind(('', 0)); puerto = s.getsockname()[1]; s.close()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(puerto), '--directory', RAIZ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    url = f'http://localhost:{puerto}/index.html'
    try:
        async with async_playwright() as p:
            nav = await p.chromium.launch()
            await pruebas_funciones(nav, url)
            await pruebas_partidas(nav, url)
            await nav.close()
    finally:
        srv.terminate()
    if errores_pagina:
        print('\n✗ Errores en la página:'); [print('   ', e[:300]) for e in sorted(set(errores_pagina))[:10]]
    print(f'\n{"Todo correcto ✓" if not fallos and not errores_pagina else f"Hay {len(fallos) + len(set(errores_pagina))} problemas ✗"}')
    sys.exit(0 if not fallos and not errores_pagina else 1)

asyncio.run(main())
