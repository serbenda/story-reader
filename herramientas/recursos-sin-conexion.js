#!/usr/bin/env node
/**
 * @file Genera la lista de archivos que el service worker guarda para jugar sin internet.
 *
 * Uso:
 *   node herramientas/recursos-sin-conexion.js              → actualiza sw.js
 *   node herramientas/recursos-sin-conexion.js --comprobar  → falla si sw.js no está al día (CI)
 *
 * Incluye: index.html, el manifiesto, los iconos, todo src/**.js, todo
 * css/**.css, stories/index.json y js-yaml. Los cuentos (.md) los añade el
 * propio service worker leyendo stories/index.json.
 *
 * La VERSION es un resumen (SHA-256) del contenido de esos archivos y de los
 * cuentos: si cambia cualquier cosa, cambia la versión y los dispositivos
 * descargan lo nuevo.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SW = join(RAIZ, 'sw.js');
const FIJOS = ['./', 'index.html', 'manifest.webmanifest', 'icono.svg', 'icono-192.png', 'icono-512.png', 'stories/index.json'];
const EXTERNOS = ['https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js'];

/** Archivos con cierta extensión dentro de una carpeta, con rutas relativas y «/». */
function buscar(carpeta, extension) {
  const dir = join(RAIZ, carpeta);
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return buscar(relative(RAIZ, p), extension);
    return p.endsWith(extension) ? [relative(RAIZ, p).split(sep).join('/')] : [];
  }).sort();
}

const locales = [...FIJOS, ...buscar('css', '.css'), ...buscar('src', '.js')];
const huella = createHash('sha256');
for (const r of [...locales.filter((r) => r !== './'), ...buscar('stories', '.md')]) huella.update(r).update(readFileSync(join(RAIZ, r)));
const version = 'biblioteca-' + huella.digest('hex').slice(0, 12);

const bloque = `// <recursos> (generado por herramientas/recursos-sin-conexion.js)
const VERSION = '${version}';
const RECURSOS = [
${[...locales, ...EXTERNOS].map((r) => `  '${r}'`).join(',\n')}
];
// </recursos>`;

const actual = readFileSync(SW, 'utf8');
const nuevo = actual.replace(/\/\/ <recursos>[\s\S]*?\/\/ <\/recursos>/, bloque);
if (process.argv.includes('--comprobar')) {
  if (nuevo !== actual) {
    console.error('✗ sw.js no está al día. Ejecuta: node herramientas/recursos-sin-conexion.js');
    process.exit(1);
  }
  console.log(`✓ sw.js al día (${locales.length + EXTERNOS.length} recursos, ${version}).`);
} else {
  writeFileSync(SW, nuevo);
  console.log(`sw.js actualizado: ${locales.length + EXTERNOS.length} recursos, ${version}.`);
}
