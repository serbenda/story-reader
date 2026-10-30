"""Comprobador de cuentos de La biblioteca mágica.

Uso (desde la carpeta del repo):
    pip install playwright && python -m playwright install chromium   # solo la primera vez
    python herramientas/validar.py mi-libro            # un libro
    python herramientas/validar.py todos               # todos los libros
    python herramientas/validar.py mi-libro --muestras # además, imprime un ejemplo de cada escena

Abre el juego en un navegador sin ventana, sortea 60 partidas por capítulo y nivel, y avisa de:
variables sin rellenar, escenas sin pregunta o sin frase de voz, opciones mal marcadas, fondos que
no existen, artículos mal unidos («a el»), líneas que empiezan por «- » fuera de una pregunta y
frases de voz demasiado largas para el nivel.
"""
import asyncio, json, os, socket, subprocess, sys, time

try:
    from playwright.async_api import async_playwright
except ImportError:
    sys.exit('Falta Playwright: pip install playwright && python -m playwright install chromium')

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if len(sys.argv) < 2:
    sys.exit(__doc__)
objetivo, muestras = sys.argv[1], '--muestras' in sys.argv
indice = json.load(open(os.path.join(RAIZ, 'stories', 'index.json'), encoding='utf-8'))
ids = [l['id'] for l in indice['libros']] if objetivo == 'todos' else [objetivo]
for i in ids:
    if i not in [l['id'] for l in indice['libros']]:
        sys.exit(f'El libro «{i}» no está en stories/index.json')

COMPROBAR = r"""
(muestras) => {
  const { texto: Texto, voz: Voz, arte: Arte } = Juego.modulos;
  const CAT = Juego.catalogo, fallos = [], avisos = [], ejemplos = [];
  const niveles = ['aprendiz','novatilla','lectora','superlectora'];
  const libro = CAT.libros[0];
  const L = libro.meta.lugares || {}, A = libro.meta.ayudantes || {};
  const fondoOk = (f) => !f || f === '$lugar' || f === '$falso' || /\.(png|jpe?g|svg|webp)$/i.test(f) || Arte.PAISAJES[f];
  if (Object.keys(L).length < 3) fallos.push('libro.md: hacen falta al menos 3 lugares');
  if (Object.keys(A).length < 2) fallos.push('libro.md: hacen falta al menos 2 ayudantes');
  for (const [k, l] of Object.entries(L)) {
    if (!l.nombre || !l.articulo) fallos.push(`lugar ${k}: falta nombre o articulo`);
    if (!fondoOk(l.fondo)) fallos.push(`lugar ${k}: el fondo «${l.fondo}» no existe`);
    if (!(l.pistas || []).length) fallos.push(`lugar ${k}: sin pistas`);
    if (!(l.senales || []).length) avisos.push(`lugar ${k}: sin senales`);
  }
  for (const [k, a] of Object.entries(A)) {
    for (const c of ['nombre','especie','articulo','emoji','descripcion']) if (!a[c]) fallos.push(`ayudante ${k}: falta ${c}`);
    for (const g of a.gracias || []) if (!g.includes(a.nombre)) avisos.push(`ayudante ${k}: la gracia «${g}» no nombra a ${a.nombre}`);
  }
  if (!(libro.meta.equivocado || []).length) fallos.push('libro.md: falta equivocado');
  if (!(libro.meta.tesoros || []).length) fallos.push('libro.md: faltan tesoros');
  let total = 0;
  for (const cap of libro.capitulos) {
    if (!cap.meta.titulo) fallos.push(`${cap.id}: falta titulo`);
    for (const k of cap.meta.lugares || []) if (!L[k]) fallos.push(`${cap.id}: el lugar «${k}» no está en libro.md`);
    if ((cap.meta.lugares || Object.keys(L)).length < 3) fallos.push(`${cap.id}: hacen falta 3 lugares o más`);
    if (!cap.escenas.some(e => e.props.final)) fallos.push(`${cap.id}: ninguna escena tiene @final`);
    for (const e of cap.escenas) if (!fondoOk(e.props.fondo)) fallos.push(`${cap.id}/${e.id}: el fondo «${e.props.fondo}» no existe`);
    for (const nv of niveles) {
      const escenas = cap.escenas.filter(e => (e.niveles[nv] || e.niveles.todos || []).length);
      if (!escenas.length) { fallos.push(`${cap.id}/${nv}: sin escenas`); continue; }
      const preguntas = [0, 0], voces = [0, 0];   // [dos niñas, una niña]
      for (let it = 0; it < 60; it++) {
        const d = Juego.prepararPartida(libro, cap);
        // Las partidas impares se juegan con una sola protagonista
        const una = it % 2 === 1;
        d.vars.__dos = !una;
        d.vars.las_ninas = una ? d.vars.lectora : `${d.vars.lectora} y ${d.vars.hermana}`;
        const modo = una ? ' [una niña]' : '';
        for (const e of escenas) (e.niveles[nv] || e.niveles.todos).forEach((v, vi) => {
          const t = Texto.rellenar(v, d.vars); total++;
          if (una) {
            const plano = t.replace(/\n/g, ' ');
            const lineaCon = (re) => (t.split('\n').find((x) => re.test(x)) || '').trim();
            if (plano.includes(d.vars.hermana)) fallos.push(`${cap.id}/${e.id}/${nv}${modo}: sale la hermana: «${lineaCon(new RegExp(d.vars.hermana))}»`);
            for (const re of [/\blas niñas\b/i, /\blas detectives\b/i, /\bhermanas\b/i, /\blas dos niñas\b/i])
              if (re.test(plano)) fallos.push(`${cap.id}/${e.id}/${nv}${modo}: plural con una sola niña: «${lineaCon(re)}»`);
            for (const re of [/\bellas\b/i, /\bambas\b/i, /\bvosotras\b/i, /\bnosotras\b/i, /\bvuestr[oa]s?\b/i, /\blas dos\b/i])
              if (re.test(plano)) avisos.push(`${cap.id}/${e.id}/${nv}${modo}: revisa «${plano.match(re)[0]}» en «${lineaCon(re)}»`);
          }
          const m = t.match(/\{[^}]*\}/g); if (m) fallos.push(`${cap.id}/${e.id}/${nv}: sin rellenar ${m.join(',')}`);
          if (/undefined|null|NaN/.test(t)) fallos.push(`${cap.id}/${e.id}/${nv}: aparece undefined`);
          const mm = t.match(/(?:^|[\s¡¿«"—(])(el el|la la|a el|de el|en en)(?=[\s,.!?»])/iu);
          if (mm) fallos.push(`${cap.id}/${e.id}/${nv}: «${mm[1]}» en «${t.split('\n').find(x => x.includes(mm[1]))}»`);
          for (const b of Texto.bloques(t)) {
            if (b.tipo === 'pregunta') { if (it < 2) preguntas[it]++; if (b.opciones.length && b.opciones.filter(o => o.correcta).length !== 1) fallos.push(`${cap.id}/${e.id}/${nv}: la pregunta no tiene exactamente una respuesta * correcta`); if (b.opciones.length === 1) fallos.push(`${cap.id}/${e.id}/${nv}: solo una opción`); }
            if (b.tipo === 'voz') { if (it < 2) voces[it]++; const nw = Voz.normalizar(b.texto).length; if (nw < 3) avisos.push(`${cap.id}/${e.id}/${nv}: frase de voz muy corta`); if (nw > (nv === 'aprendiz' ? 12 : nv === 'novatilla' ? 22 : 32)) avisos.push(`${cap.id}/${e.id}/${nv}: frase de voz larga (${nw} palabras)`); }
            if (b.tipo === 'texto' && /^[*-]\s/.test(b.texto)) fallos.push(`${cap.id}/${e.id}/${nv}: línea que empieza por «${b.texto[0]} » fuera de una pregunta`);
          }
          if (muestras && it < 2) ejemplos.push(`── ${cap.id} · ${e.id} · ${nv} · versión ${vi + 1}${modo}\n${t}`);
        });
      }
      ['', ' [una niña]'].forEach((m, k) => {
        if (!preguntas[k]) fallos.push(`${cap.id}/${nv}${m}: no hay ninguna pregunta`);
        if (!voces[k]) fallos.push(`${cap.id}/${nv}${m}: no hay ninguna frase > de voz`);
      });
      // El título del capítulo también puede llevar nombres y alternativas
      if (nv === 'aprendiz') for (const dos of [true, false]) {
        const t = Texto.rellenar(cap.meta.titulo || '', { lectora: 'Alaia', hermana: 'Lucía', __dos: dos });
        if (/[{}]/.test(t)) fallos.push(`${cap.id}: el título tiene llaves sin resolver: «${t}»`);
        if (!dos && /Lucía|Bienvenidas|\blas niñas\b/.test(t)) avisos.push(`${cap.id} [una niña]: revisa el título «${t}»`);
      }
    }
  }
  return { total, fallos: [...new Set(fallos)], avisos: [...new Set(avisos)].slice(0, 60), ejemplos };
}
"""

PERFIL = """try { localStorage.setItem('biblioteca-magica-v1', JSON.stringify({ perfil: {
  alaya: { piel: '#EDBB91', pelo: '#6B3E26', vestido: '#8A62C4', accesorio: 'sombrero' },
  lucia: { piel: '#EDBB91', pelo: '#6B3E26', vestido: '#F2B33D', accesorio: 'lazo' },
  mascota: { especie: 'gato', genero: 'chica', nombre: 'Luna' } } })); } catch (e) {}"""


async def comprobar(navegador, puerto, libro_id):
    entrada = next(l for l in indice['libros'] if l['id'] == libro_id)
    solo = dict(indice, libros=[entrada])
    ctx = await navegador.new_context(service_workers='block')
    await ctx.add_init_script(PERFIL)
    await ctx.route('**/stories/index.json', lambda r: r.fulfill(body=json.dumps(solo, ensure_ascii=False), content_type='application/json'))
    if os.environ.get('JSYAML_LOCAL'):  # para entornos sin acceso a cdnjs
        await ctx.route('**/cdnjs.cloudflare.com/**', lambda r: r.fulfill(path=os.environ['JSYAML_LOCAL'], content_type='application/javascript'))
    pg = await ctx.new_page()
    errores = []
    pg.on('pageerror', lambda e: errores.append(str(e)))
    pg.on('console', lambda m: errores.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    await pg.goto(f'http://localhost:{puerto}/index.html')
    try:
        await pg.wait_for_function('window.Juego && window.Juego.catalogo && window.Juego.catalogo.libros.length', timeout=15000)
    except Exception:
        print(f'\n■ {libro_id}: NO CARGA'); [print('  ✗', e[:300]) for e in errores]
        await ctx.close(); return False
    r = await pg.evaluate(COMPROBAR, muestras)
    await ctx.close()
    print(f"\n■ {libro_id}: {r['total']} textos generados")
    print('  FALLOS: ninguno' if not r['fallos'] else '  FALLOS:')
    for f in r['fallos'][:200]: print('   ✗', f)
    for a in r['avisos']: print('   · aviso:', a)
    for e in errores[:5]: print('   ✗ error de página:', e[:300])
    if muestras: print('\n' + '\n\n'.join(r['ejemplos']))
    return not r['fallos'] and not errores


async def main():
    s = socket.socket(); s.bind(('', 0)); puerto = s.getsockname()[1]; s.close()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(puerto), '--directory', RAIZ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    try:
        async with async_playwright() as p:
            nav = await p.chromium.launch()
            ok = [await comprobar(nav, puerto, i) for i in ids]
            await nav.close()
    finally:
        srv.terminate()
    print('\nTodo correcto ✓' if all(ok) else '\nHay cosas que corregir ✗')
    sys.exit(0 if all(ok) else 1)

asyncio.run(main())
