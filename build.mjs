#!/usr/bin/env node
// Genera il sito statico in docs/ (servito da GitHub Pages: branch main, cartella /docs).
// Uso: node build.mjs
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { site, languages, routes } from './src/site.mjs';
import * as templates from './src/templates.mjs';
import it from './src/content/it.mjs';
import en from './src/content/en.mjs';
import de from './src/content/de.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'docs');
const all = { it, en, de };
const pages = ['home', 'book', 'faq', 'privacy'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'src/assets'), join(OUT, 'assets'), { recursive: true });

const hashes = new Map();
const hashOf = (path) => {
  if (!hashes.has(path)) {
    hashes.set(path, createHash('md5').update(readFileSync(join(OUT, path))).digest('hex').slice(0, 8));
  }
  return hashes.get(path);
};

const basePath = new URL(`${site.url}/`).pathname;

function context(lang, pageKey, route, { rootRelative = false } = {}) {
  // Link relativi: dalla cartella della pagina si risale alla radice e si scende verso la destinazione,
  // così il sito funziona sia sotto /metronecustoza-site/ che sul dominio definitivo.
  const up = rootRelative ? '' : '../'.repeat(route.split('/').filter(Boolean).length);
  const rel = (to) => (up + to) || './';
  return {
    lang, pageKey, route, site, languages, routes, all, basePath,
    t: all[lang],
    year: new Date().getFullYear(),
    rel,
    asset: (path) => `${rel(path)}?v=${hashOf(path)}`,
    abs: (to) => `${site.url}/${to}`,
  };
}

function write(route, html) {
  const dir = join(OUT, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

for (const { code } of languages) {
  for (const pageKey of pages) {
    const route = routes[code][pageKey];
    write(route, templates[pageKey](context(code, pageKey, route)));
  }
}

// 404 di GitHub Pages: servita su qualsiasi percorso, quindi link relativi alla radice con <base>.
writeFileSync(join(OUT, '404.html'), templates.notFound(context('it', 'notFound', '', { rootRelative: true })));

// sitemap.xml con le alternative linguistiche
const urls = pages.flatMap((pageKey) => languages.map(({ code }) => {
  const alts = languages
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${site.url}/${routes[l.code][pageKey]}"/>`)
    .join('\n');
  return `  <url>\n    <loc>${site.url}/${routes[code][pageKey]}</loc>\n${alts}\n  </url>`;
}));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);

writeFileSync(join(OUT, 'robots.txt'), site.indexable
  ? `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
writeFileSync(join(OUT, '.nojekyll'), '');
if (site.cname) writeFileSync(join(OUT, 'CNAME'), `${site.cname}\n`);

console.log(`Sito generato in docs/ (${languages.length} lingue × ${pages.length} pagine + 404).`);
