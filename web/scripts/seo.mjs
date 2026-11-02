// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// After `vite build`: what search engines read. The site routes with #/…, and search engines index no page
// behind a "#", so this writes plain pages they can. Every listed game has its own host, its page's address:
// https://<id>.freegames.stream/ (the server's GameHosts serves dist/<id>/index.html there and redirects the old
// https://freegames.stream/<id>/ to it; the website forwards the old #/<id>). Play stays on the site itself
// (https://freegames.stream/#/<id>/play): the player's account lives in the site's storage.
//   dist/<id>/index.html   a page per listed game: the website with the game's head (title, description, canonical
//                          address, its own icon, structured data) and its page as plain content inside #app (title,
//                          summary, screenshots copied next to it, controls, original, a Play link into the site);
//                          the website shows the game's page there when it starts (src/site/hosts.ts)
//   dist/<id>/icon.*       the game's icon (game.json "icon": a PNG from the original's data) or a letter icon (SVG)
//   dist/game-hosts.txt    the games with a host of their own, one id per line (for the server)
//   dist/index.html        the game list as plain links inside #app (the site replaces it when it starts), and
//                          the preview image for links shared elsewhere
//   dist/robots.txt, dist/sitemap.xml (the site and every game's host: robots.txt on each game host is this
//                          file too, which names the sitemap, so the sitemap may list the game hosts' pages)
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_HOST = 'freegames.stream';
const SITE = `https://${SITE_HOST}/`;
/** a game's page: its own host */
const gameUrl = (id) => `https://${id}.${SITE_HOST}/`;
const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('run vite build first');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const games = readdirSync(join(web, 'games'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(web, 'games', d.name, 'game.json')))
  .map((d) => ({ id: d.name, m: JSON.parse(readFileSync(join(web, 'games', d.name, 'game.json'), 'utf8')) }))
  .filter((g) => g.m.listed !== false)
  .sort((a, b) => a.m.title.localeCompare(b.m.title));

/** a link to a page of the site (a game's page is at another host; the website fixes the links up where it runs elsewhere) */
const siteLink = (path, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${SITE}${path.replace(/^\//, '')}">${text}</a>`;
const LEGAL = `<nav class="legal">
${siteLink('/', 'All games')}
${siteLink('/impressum.html', 'Impressum / Legal notice')}
${siteLink('/datenschutz.html', 'Datenschutz / Privacy')}
${siteLink('/nutzungsbedingungen.html', 'Nutzungsbedingungen / Terms of use')}
${siteLink('/licenses.html', 'Lizenzen &amp; Quellcode / Licenses &amp; source')}
</nav>`;
// a letter icon for a game without an icon of its own: its title's first letter on a colour of its own (our work,
// under the website's license)
const COLOURS = ['#2f6fdf', '#c0392b', '#16a085', '#8e44ad', '#d35400', '#2c3e50', '#27ae60', '#b03a7a'];
function letterIcon(id, title) {
  const letter = esc((title.match(/[A-Za-z0-9]/)?.[0] ?? '?').toUpperCase());
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="${COLOURS[h % COLOURS.length]}"/>`
    + `<text x="24" y="34" text-anchor="middle" font-family="DejaVu Sans,Verdana,Arial,Helvetica,sans-serif" font-size="29" font-weight="700" fill="#fff">${letter}</text></svg>\n`;
}
/** writes the game's icon next to its page; returns its file name and type */
function writeIcon(g, dir) {
  if (g.m.icon) {
    const src = join(web, 'games', g.id, g.m.icon);
    if (!/\.png$/i.test(src) || !existsSync(src)) throw new Error(`${g.id}: game.json "icon" must be a PNG file of its folder (${g.m.icon})`);
    copyFileSync(src, join(dir, 'icon.png'));
    const b = readFileSync(src);
    const w = b.readUInt32BE(16), hgt = b.readUInt32BE(20);
    if (w !== hgt || w % 48 !== 0) throw new Error(`${g.id}: its icon is ${w}x${hgt}; it must be square, 48 px or a multiple (what search engines show)`);
    return { file: 'icon.png', type: 'image/png', sizes: `${w}x${hgt}` };
  }
  writeFileSync(join(dir, 'icon.svg'), letterIcon(g.id, g.m.title));
  return { file: 'icon.svg', type: 'image/svg+xml', sizes: 'any' };
}
// for the plain content, which shows until the website's script replaces it (and to whoever has no script)
const STYLE = `<style>
.seo-page { max-width: 60rem; margin: 0 auto; padding: 1rem; }
.seo-page a.play { display: inline-block; padding: .5rem 1.1rem; border-radius: 8px; background: #2f6fdf; color: #fff; text-decoration: none; font-weight: 600; }
.seo-page .seo-shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
.seo-page figure { margin: 0; }
.seo-page figure img { width: 100%; height: auto; border-radius: 6px; }
</style>`;


/** a sentence or two for the search result: the tagline, then the first summary sentence if it fits */
function description(m) {
  const first = (m.summary?.[0] ?? '').match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? '';
  const d = `${m.tagline} ${first}`.trim();
  return d.length <= 200 ? d : m.tagline;
}

/**
 * A game's page at its own host: the website itself (the built dist/index.html, its scripts from /assets/), with the
 * game's title, description, canonical address, icon and structured data in its head, and the game's page as plain
 * content in #app for search engines. When the website starts there, it shows the game's page (hosts.ts, main.ts).
 */
function gamePage(shell, g, others, icon) {
  const { id, m } = g;
  const url = gameUrl(id);
  const shots = m.screenshots ?? [];
  const desc = description(m);
  const title = `${m.title}: play free in your browser`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: m.title,
    description: desc,
    url,
    image: shots.map((s) => `${url}${id}/${s.file}`),
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
  const body = `<div id="app"><main class="seo-page">
${siteLink('/', '← freegames', 'back')}
<h1>${esc(m.title)}</h1>
<p class="tagline">${esc(m.tagline)}</p>
<p>${siteLink(`/#/${id}/play`, `▶ Play ${esc(m.title)}`, 'play')} <span class="muted">free, in your browser, nothing to install</span></p>
${(m.summary ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n')}
${shots.length ? `<h2>Screenshots</h2>\n<div class="seo-shots">\n${shots.map((s) => `<figure><img src="/${id}/${esc(s.file)}" alt="${esc(s.caption)}" loading="lazy"><figcaption>${esc(s.caption)}</figcaption></figure>`).join('\n')}\n</div>` : ''}
${m.controls?.length ? `<h2>Controls</h2>\n<table class="seo-controls">\n${m.controls.map((c) => `<tr><td><b>${esc(c.input)}</b></td><td>${esc(c.action)}</td></tr>`).join('\n')}\n</table>` : ''}
<h2>The original</h2>
<p>${esc(m.title)}${o.year ? ` (${esc(o.year)})` : ''}${o.author ? ` by ${esc(o.author)}` : ''}${o.platform ? `; ${esc(o.platform)}` : ''}.
${o.version ? `This port follows ${esc(o.version)}, the same rules, levels, graphics and sounds, running natively in the browser.` : ''}
${o.license ? `License: ${esc(o.license)} (${siteLink('/licenses.html', 'Licenses &amp; source')}).` : ''}
Players: ${esc(m.players ?? '1')}.</p>
<h2>More free games</h2>
<ul>
${others.map((x) => `<li><a href="${gameUrl(x.id)}">${esc(x.m.title)}</a>: ${esc(x.m.tagline)}</li>`).join('\n')}
</ul>
${LEGAL}
</main></div>`;
  const swap = (html, re, to) => {
    if (!re.test(html)) throw new Error(`dist/index.html has no ${re}`);
    return html.replace(re, () => to);
  };
  let html = shell;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(title)} · freegames</title>`);
  html = swap(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  html = swap(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  html = swap(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
  html = swap(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  html = swap(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  html = swap(html, /<link rel="icon" href="[^"]*">/, `<link rel="icon" href="/${id}/${icon.file}" type="${icon.type}" sizes="${icon.sizes}">`
    + (icon.type === 'image/png' ? `\n  <link rel="apple-touch-icon" href="/${id}/${icon.file}">` : ''));
  // the page is at "/" of its host and at /<id>/ elsewhere: the website's files from the root
  html = html.replace(/(src|href)="\.\/(assets\/[^"]+)"/g, '$1="/$2"');
  html = swap(html, /<\/head>/, `${shots[0] ? `  <meta property="og:image" content="${url}${id}/${esc(shots[0].file)}">\n  <meta name="twitter:card" content="summary_large_image">\n` : ''}`
    + `  ${STYLE}\n  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n</head>`);
  return swap(html, /<div id="app"><\/div>/, body);
}

// ---- a page per game
const indexFile = join(dist, 'index.html');
const shell = readFileSync(indexFile, 'utf8');
const RESERVED = new Set(readdirSync(dist));
for (const g of games) {
  if (RESERVED.has(g.id)) throw new Error(`dist/${g.id} exists already: the game's page would clash with it`);
  const dir = join(dist, g.id);
  mkdirSync(dir, { recursive: true });
  for (const s of g.m.screenshots ?? []) copyFileSync(join(web, 'games', g.id, 'screenshots', s.file), join(dir, s.file));
  writeFileSync(join(dir, 'index.html'), gamePage(shell, g, games.filter((x) => x !== g), writeIcon(g, dir)));
}
writeFileSync(join(dist, 'game-hosts.txt'), games.map((g) => `${g.id}\n`).join(''));

// ---- the list as plain links in the site's page, and its preview image
let index = shell;
const list = `<div id="app"><main class="seo-list"><h1>freegames</h1>
<p>A free games collection, browser-ported to run in 2 clicks.</p>
<ul>
${games.map((g) => `<li><a href="${gameUrl(g.id)}">${esc(g.m.title)}</a>: ${esc(g.m.tagline)}</li>`).join('\n')}
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
const urls = [SITE, ...games.map((g) => gameUrl(g.id)), `${SITE}licenses.html`];
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`seo: ${games.length} game pages at their own hosts with their icons, the list in index.html, robots.txt, sitemap.xml (${urls.length} URLs)`);
