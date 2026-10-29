/* ──────────────────────────────────────────────────────────────
   DATOS · Carga los libros desde la carpeta stories/
   - stories/index.json   → lista de libros y capítulos
   - <libro>/libro.md     → el mundo: lugares, ayudantes, tesoros…
   - <libro>/cap-XX.md    → escenas del capítulo
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const NIVELES_VALIDOS = ['aprendiz', 'novatilla', 'lectora', 'superlectora', 'todos'];
  const sinTildes = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const Datos = {
    // Si la página trae los archivos dentro (versión de un solo archivo), se usan esos
    embebido: window.__EMBEBIDO__ || null,

    async texto(ruta) {
      if (this.embebido && ruta in this.embebido) return this.embebido[ruta];
      const r = await fetch(ruta, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`No encuentro el archivo ${ruta} (${r.status})`);
      return r.text();
    },

    separarCabecera(txt) {
      const m = txt.match(/^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
      if (!m) return { meta: {}, cuerpo: txt };
      return { meta: window.jsyaml.load(m[1]) || {}, cuerpo: m[2] };
    },

    /** Convierte el cuerpo de un capítulo en escenas → niveles → versiones */
    parsearEscenas(cuerpo, archivo) {
      const escenas = [];
      let esc = null, nivel = null;
      const lineas = cuerpo.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/);
      for (const l of lineas) {
        let m;
        if ((m = l.match(/^##\s+(.+?)\s*$/))) {
          esc = { id: m[1].trim(), props: {}, niveles: {} };
          escenas.push(esc); nivel = null; continue;
        }
        if (!esc) continue;
        if ((m = l.match(/^###\s+(.+?)\s*$/))) {
          nivel = sinTildes(m[1]);
          if (!NIVELES_VALIDOS.includes(nivel)) console.warn(`${archivo}: nivel desconocido «${m[1]}» en la escena ${esc.id}`);
          esc.niveles[nivel] = [[]];
          continue;
        }
        if (!nivel) {
          if ((m = l.match(/^@([\wáéíóúñ]+)\s*:?\s*(.*)$/i))) esc.props[sinTildes(m[1])] = m[2].trim() || true;
          continue;
        }
        if (/^-{3,}\s*$/.test(l)) { esc.niveles[nivel].push([]); continue; }
        const versiones = esc.niveles[nivel];
        versiones[versiones.length - 1].push(l);
      }
      for (const e of escenas) {
        for (const k in e.niveles) e.niveles[k] = e.niveles[k].map((v) => v.join('\n').trim()).filter(Boolean);
        e.props.con = typeof e.props.con === 'string' ? e.props.con.split(/[,\s]+/).filter(Boolean) : [];
      }
      return escenas;
    },

    async cargarCatalogo() {
      const index = JSON.parse(await this.texto('stories/index.json'));
      // Si un libro tiene un error, se avisa en la consola y se cargan los demás
      const resultados = await Promise.allSettled(index.libros.map(async (L) => {
        const base = `stories/${L.carpeta || L.id}/`;
        const libro = this.separarCabecera(await this.texto(base + 'libro.md'));
        const capitulos = await Promise.all(L.capitulos.map(async (archivo) => {
          const c = this.separarCabecera(await this.texto(base + archivo));
          return { id: archivo.replace(/\.md$/, ''), archivo, meta: c.meta, escenas: this.parsearEscenas(c.cuerpo, archivo) };
        }));
        return { id: L.id, meta: libro.meta, descripcion: libro.cuerpo.trim(), capitulos };
      }));
      const libros = [];
      resultados.forEach((r, i) => {
        if (r.status === 'fulfilled') libros.push(r.value);
        else console.error(`No se ha podido cargar el libro «${index.libros[i].id}»:`, r.reason);
      });
      if (!libros.length) throw new Error('No se ha podido cargar ningún libro.');
      return { protagonistas: index.protagonistas || { lectora: 'Alaia', hermana: 'Lucía' }, mascotas: index.mascotas, libros };
    }
  };

  window.Datos = Datos;
})();
