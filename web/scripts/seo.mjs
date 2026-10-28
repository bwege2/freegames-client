// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// After `vite build`: what search engines read (the game pages use paths from the root: /<id> and /<id>/ both work). The site routes with #/…, and search engines index no page
// behind a "#", so this writes plain pages they can:
//   dist/<id>/index.html   a page per listed game at https://freegames.stream/<id>/: its title, summary,
//                          screenshots (copied next to it), controls and original, with a Play link into the site
//   dist/index.html        the game list as plain links inside #app (the site replaces it when it starts), and
//                          the preview image for links shared elsewhere
//   dist/robots.txt, dist/sitemap.xml
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://freegames.stream/';
const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('run vite build first');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const games = readdirSync(join(web, 'games'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(web, 'games', d.name, 'game.json')))
  .map((d) => ({ id: d.name, m: JSON.parse(readFileSync(join(web, 'games', d.name, 'game.json'), 'utf8')) }))
  .filter((g) => g.m.listed !== false)
  .sort((a, b) => a.m.title.localeCompare(b.m.title));

const ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' rx='3' fill='%232f6fdf'/%3E%3Cpath d='M6 4.5v7l5.5-3.5z' fill='white'/%3E%3C/svg%3E`;
const LEGAL = `<nav class="legal">
<a href="/">All games</a>
<a href="/impressum.html">Impressum / Legal notice</a>
<a href="/datenschutz.html">Datenschutz / Privacy</a>
<a href="/nutzungsbedingungen.html">Nutzungsbedingungen / Terms of use</a>
<a href="/licenses.html">Lizenzen &amp; Quellcode / Licenses &amp; source</a>
</nav>`;
const STYLE = `<style>
.tagline { font-size: 1.1rem; }
a.play { display: inline-block; padding: .5rem 1.1rem; border-radius: 8px; background: #2f6fdf; color: #fff; text-decoration: none; font-weight: 600; }
.shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
.shots figure { margin: 0; }
.shots img { width: 100%; height: auto; border-radius: 6px; }
.shots figcaption { font-size: .9rem; color: #5b6570; }
table.controls td { padding: .2rem .8rem .2rem 0; vertical-align: top; }
</style>`;

/** a sentence or two for the search result: the tagline, then the first summary sentence if it fits */
function description(m) {
  const first = (m.summary?.[0] ?? '').match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? '';
  const d = `${m.tagline} ${first}`.trim();
  return d.length <= 200 ? d : m.tagline;
}

function gamePage(g, others) {
  const { id, m } = g;
  const url = `${SITE}${id}/`;
  const shots = m.screenshots ?? [];
  const desc = description(m);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: m.title,
    description: desc,
    url,
    image: shots.map((s) => `${url}${s.file}`),
    genre: m.genres,
    gamePlatform: 'Web browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any (web browser)',
    playMode: [...(m.modes?.includes('single') ? ['SinglePlayer'] : []), ...(m.modes?.some((x) => x !== 'single') ? ['MultiPlayer'] : [])],
    author: m.original?.author ? { '@type': 'Organization', name: m.original.author } : undefined,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  const o = m.original ?? {};
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}: play free in your browser · freegames</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="freegames">
<meta property="og:title" content="${esc(m.title)}: play free in your browser">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
${shots[0] ? `<meta property="og:image" content="${url}${esc(shots[0].file)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="icon" href="${ICON}">
<link rel="stylesheet" href="/legal.css">
${STYLE}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<main>
<a class="back" href="/">← freegames</a>
<h1>${esc(m.title)}</h1>
<p class="tagline">${esc(m.tagline)}</p>
<p><a class="play" href="/#/${id}/play">▶ Play ${esc(m.title)}</a> <span class="muted">free, in your browser, nothing to install</span></p>
${(m.summary ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n')}
${shots.length ? `<h2>Screenshots</h2>\n<div class="shots">\n${shots.map((s) => `<figure><img src="/${id}/${esc(s.file)}" alt="${esc(s.caption)}" loading="lazy"><figcaption>${esc(s.caption)}</figcaption></figure>`).join('\n')}\n</div>` : ''}
${m.controls?.length ? `<h2>Controls</h2>\n<table class="controls">\n${m.controls.map((c) => `<tr><td><b>${esc(c.input)}</b></td><td>${esc(c.action)}</td></tr>`).join('\n')}\n</table>` : ''}
<h2>The original</h2>
<p>${esc(m.title)}${o.year ? ` (${esc(o.year)})` : ''}${o.author ? ` by ${esc(o.author)}` : ''}${o.platform ? `; ${esc(o.platform)}` : ''}.
${o.version ? `This port follows ${esc(o.version)}, the same rules, levels, graphics and sounds, running natively in the browser.` : ''}
${o.license ? `License: ${esc(o.license)} (<a href="/licenses.html">Licenses &amp; source</a>).` : ''}
Players: ${esc(m.players ?? '1')}.</p>
<h2>More free games</h2>
<ul>
${others.map((x) => `<li><a href="/${x.id}/">${esc(x.m.title)}</a>: ${esc(x.m.tagline)}</li>`).join('\n')}
</ul>
${LEGAL}
</main>
</body>
</html>
`;
}

// ---- a page per game
const RESERVED = new Set(readdirSync(dist));
for (const g of games) {
  if (RESERVED.has(g.id)) throw new Error(`dist/${g.id} exists already: the game's page would clash with it`);
  const dir = join(dist, g.id);
  mkdirSync(dir, { recursive: true });
  for (const s of g.m.screenshots ?? []) copyFileSync(join(web, 'games', g.id, 'screenshots', s.file), join(dir, s.file));
  writeFileSync(join(dir, 'index.html'), gamePage(g, games.filter((x) => x !== g)));
}

// ---- the list as plain links in the site's page, and its preview image
const indexFile = join(dist, 'index.html');
let index = readFileSync(indexFile, 'utf8');
const list = `<div id="app"><main class="seo-list"><h1>freegames</h1>
<p>A free games collection, browser-ported to run in 2 clicks.</p>
<ul>
${games.map((g) => `<li><a href="${g.id}/">${esc(g.m.title)}</a>: ${esc(g.m.tagline)}</li>`).join('\n')}
</ul></main></div>`;
if (!index.includes('<div id="app"></div>')) throw new Error('dist/index.html has no empty #app');
index = index.replace('<div id="app"></div>', list);
const preview = games.find((g) => g.id === 'teeworlds' && g.m.screenshots?.length) ?? games.find((g) => g.m.screenshots?.length);
if (preview) {
  index = index.replace('</head>', `  <meta property="og:image" content="${SITE}${preview.id}/${esc(preview.m.screenshots[0].file)}">\n  <meta name="twitter:card" content="summary_large_image">\n</head>`);
}
writeFileSync(indexFile, index);

// ---- robots.txt and sitemap.xml
// Yandex's robots (all of them answer to "Yandex") do not crawl the site, so Yandex does not list it, also when
// IndexNow (tools/deploy/indexnow.mjs), which shares every report with all its engines, tells it of the pages
writeFileSync(join(dist, 'robots.txt'), `User-agent: Yandex
Disallow: /

User-agent: *
Allow: /
Disallow: /admin/
Sitemap: ${SITE}sitemap.xml
`);
const urls = [SITE, ...games.map((g) => `${SITE}${g.id}/`), `${SITE}licenses.html`];
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`seo: ${games.length} game pages, the list in index.html, robots.txt, sitemap.xml (${urls.length} URLs)`);
