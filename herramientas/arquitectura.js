#!/usr/bin/env node
/**
 * @file Comprueba que el código respeta la arquitectura del proyecto.
 *
 * Uso:  node herramientas/arquitectura.js        (sale con código 1 si hay fallos)
 *
 * Comprueba, en todos los módulos de src/:
 *   1. Que cada `import` apunta a un archivo que existe y que los nombres
 *      importados se exportan de verdad.
 *   2. Las reglas de capas (quién puede importar a quién), ver CAPAS abajo y
 *      docs/ARQUITECTURA.md.
 *   3. Que no hay dependencias circulares.
 *   4. Que cada archivo empieza con un comentario @file y que cada función o
 *      constante exportada tiene su comentario /** … *\/ justo encima.
 *   5. Que cada hoja de css/ está enlazada en css/estilos.css, tiene sus llaves
 *      equilibradas y empieza con un comentario.
 *   6. Que cada módulo aparece en el catálogo de docs/ARQUITECTURA.md.
 *
 * No necesita instalar nada: solo Node.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RAIZ, 'src');

/**
 * Capas y a qué capas puede importar cada una. Una capa siempre puede
 * importarse a sí misma, salvo «pantallas» (las pantallas no se importan
 * entre sí: navegan con ir()). La raíz de src/ (main.js, depuracion.js) puede todo.
 */
const CAPAS = {
  config: [],
  util: [],
  contenido: ['util'],
  servicios: ['util', 'config'],
  arte: ['util'],
  estado: ['config', 'util'],
  dominio: ['estado', 'contenido', 'config', 'util'],
  ui: ['dominio', 'estado', 'contenido', 'servicios', 'arte', 'config', 'util'],
  pantallas: ['ui', 'dominio', 'estado', 'contenido', 'servicios', 'arte', 'config', 'util']
};

/** @param {string} dir @returns {string[]} */
function archivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : p.endsWith('.js') ? [p] : [];
  });
}

const rel = (p) => relative(RAIZ, p).split(sep).join('/');
const capaDe = (p) => { const partes = relative(SRC, p).split(sep); return partes.length > 1 ? partes[0] : 'raiz'; };

/** Exportaciones directas y reexportaciones de un módulo. */
function leerModulo(ruta) {
  const codigo = readFileSync(ruta, 'utf8');
  const nombres = new Set();
  for (const m of codigo.matchAll(/^export (?:async )?(?:function\*?|const|let|class) ([\w$]+)/gm)) nombres.add(m[1]);
  const reexporta = [];
  for (const m of codigo.matchAll(/^export \{([^}]*)\} from '([^']+)'/gm)) {
    for (const n of m[1].split(',').map((x) => x.trim()).filter(Boolean)) nombres.add(n.split(/\s+as\s+/).pop());
    reexporta.push(normalize(join(dirname(ruta), m[2])));
  }
  const todo = [...codigo.matchAll(/^export \* from '([^']+)'/gm)].map((m) => normalize(join(dirname(ruta), m[1])));
  const imports = [];
  for (const m of codigo.matchAll(/^import\s+(?:(\{[^}]*\})|\*\s+as\s+[\w$]+)?\s*(?:from\s+)?'([^']+)'/gm)) {
    const nombresImp = m[1] ? m[1].slice(1, -1).split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean) : [];
    imports.push({ destino: normalize(join(dirname(ruta), m[2])), texto: m[2], nombres: nombresImp });
  }
  for (const r of reexporta) imports.push({ destino: r, texto: rel(r), nombres: [] });
  for (const r of todo) imports.push({ destino: r, texto: rel(r), nombres: [] });
  return { codigo, nombres, todo, imports };
}

const modulos = new Map(archivos(SRC).map((f) => [normalize(f), leerModulo(f)]));
const fallos = [];

/** Todo lo que exporta un módulo, incluidas las reexportaciones con «export *». */
function exportados(ruta, vistos = new Set()) {
  if (vistos.has(ruta)) return new Set();
  vistos.add(ruta);
  const m = modulos.get(ruta);
  const n = new Set(m.nombres);
  for (const t of m.todo) for (const x of exportados(t, vistos)) n.add(x);
  return n;
}

for (const [ruta, m] of modulos) {
  const capa = capaDe(ruta);
  // 1. Importaciones que existen
  for (const imp of m.imports) {
    if (!modulos.has(imp.destino)) { fallos.push(`${rel(ruta)}: importa «${imp.texto}», que no existe`); continue; }
    const disponibles = exportados(imp.destino);
    for (const n of imp.nombres) if (!disponibles.has(n)) fallos.push(`${rel(ruta)}: «${n}» no lo exporta ${rel(imp.destino)}`);
    // 2. Capas
    const destino = capaDe(imp.destino);
    if (capa === 'raiz') continue;
    const permitido = CAPAS[capa];
    if (!permitido) { fallos.push(`${rel(ruta)}: la carpeta «${capa}» no es una capa conocida (añádela a CAPAS)`); continue; }
    if (destino === capa) {
      const indicePantallas = rel(ruta) === 'src/pantallas/index.js';
      const mismaCarpeta = dirname(ruta) === dirname(imp.destino);
      if (capa === 'pantallas' && !indicePantallas && !mismaCarpeta) fallos.push(`${rel(ruta)}: una pantalla no importa otra (${rel(imp.destino)}); usa ir('nombre')`);
      continue;
    }
    if (!permitido.includes(destino)) fallos.push(`${rel(ruta)}: la capa «${capa}» no puede importar de «${destino}» (${rel(imp.destino)})`);
  }
  // 4. Documentación
  if (!/^(#!.*\n)?\/\*\*[\s\S]*?@file/.test(m.codigo)) fallos.push(`${rel(ruta)}: falta el comentario /** @file … */ al principio`);
  const lineas = m.codigo.split('\n');
  lineas.forEach((l, i) => {
    if (!/^export (?:async )?(?:function|const|let|class) /.test(l)) return;
    let j = i - 1;
    while (j >= 0 && lineas[j].trim() === '') j--;
    if (j < 0 || !/\*\/\s*$/.test(lineas[j])) fallos.push(`${rel(ruta)}:${i + 1}: «${l.slice(0, 60)}…» no tiene comentario JSDoc encima`);
  });
}

// 3. Ciclos (búsqueda en profundidad)
const estadoVisita = new Map();
const pila = [];
function visitar(ruta) {
  estadoVisita.set(ruta, 'visitando'); pila.push(ruta);
  for (const imp of modulos.get(ruta).imports) {
    if (!modulos.has(imp.destino)) continue;
    const e = estadoVisita.get(imp.destino);
    if (e === 'visitando') fallos.push(`Dependencia circular: ${pila.slice(pila.indexOf(imp.destino)).concat(imp.destino).map(rel).join(' → ')}`);
    else if (!e) visitar(imp.destino);
  }
  pila.pop(); estadoVisita.set(ruta, 'hecho');
}
for (const r of modulos.keys()) if (!estadoVisita.has(r)) visitar(r);

// 5. Hojas de estilo: todas enlazadas desde css/estilos.css, con llaves equilibradas y comentario inicial
const CSS = join(RAIZ, 'css');
const hojas = (function listar(dir) {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? listar(p) : p.endsWith('.css') ? [p] : []; });
})(CSS);
const indiceCss = readFileSync(join(CSS, 'estilos.css'), 'utf8');
const importadas = new Set([...indiceCss.matchAll(/@import url\("([^"]+)"\)/g)].map((m) => normalize(join(CSS, m[1]))));
for (const h of hojas) {
  const css = readFileSync(h, 'utf8');
  if (h !== join(CSS, 'estilos.css') && !importadas.has(normalize(h))) fallos.push(`${rel(h)}: no está enlazada desde css/estilos.css`);
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
  if ((sinComentarios.match(/\{/g) || []).length !== (sinComentarios.match(/\}/g) || []).length) fallos.push(`${rel(h)}: las llaves { } no están equilibradas`);
  if (!/^\/\*/.test(css)) fallos.push(`${rel(h)}: falta el comentario inicial que explica qué estila`);
}
for (const i of importadas) if (!hojas.map(normalize).includes(i)) fallos.push(`css/estilos.css: importa ${rel(i)}, que no existe`);

// 6. Cada módulo aparece en el catálogo de docs/ARQUITECTURA.md (la documentación no se queda atrás)
const documento = readFileSync(join(RAIZ, 'docs', 'ARQUITECTURA.md'), 'utf8');
for (const r of modulos.keys()) if (!documento.includes(`(../${rel(r)})`)) fallos.push(`${rel(r)}: falta en el catálogo de docs/ARQUITECTURA.md (sección 14)`);

if (fallos.length) {
  console.error(`✗ ${fallos.length} problemas de arquitectura:\n  - ${fallos.join('\n  - ')}`);
  process.exit(1);
}
const porCapa = {};
for (const r of modulos.keys()) porCapa[capaDe(r)] = (porCapa[capaDe(r)] || 0) + 1;
console.log(`✓ Arquitectura correcta: ${modulos.size} módulos, sin ciclos, capas respetadas y todo documentado.`);
console.log('  ' + Object.entries(porCapa).map(([c, n]) => `${c}: ${n}`).join(' · '));
