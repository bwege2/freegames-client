// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// After `vite build`: the page "Licenses & source" (dist/licenses.html) and every license as plain text
// (dist/licenses/). The source of what the site sends to browsers is in the public repository (source-paths.mjs),
// one tag per release: the page links the tag of the release being built ($RELEASE_TAG, set by tools/deploy.sh;
// without it "main"), and each game's folder in it.
//   node scripts/legal.mjs          (part of npm run build)
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_PATHS, SOURCE_REPO, SOURCE_URL } from './source-paths.mjs';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('run vite build first');
const tag = process.env.RELEASE_TAG || 'main';
if (!/^(main|release-\d{4}-\d{2}-\d{2}(\.\d+)?)$/.test(tag)) throw new Error(`RELEASE_TAG is no release tag: ${tag}`);
const tree = (path) => `${SOURCE_URL}/tree/${tag}${path ? `/${path}` : ''}`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---- the license files, as text
const out = join(dist, 'licenses');
mkdirSync(out, { recursive: true });
copyFileSync(join(web, 'LICENSE.md'), join(out, 'freegames.txt'));
copyFileSync(join(web, 'node_modules', 'capnp-es', 'LICENSE'), join(out, 'capnp-es.txt'));
const games = readdirSync(join(web, 'games'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(web, 'games', d.name, 'game.json')))
  .map((d) => ({ id: d.name, m: JSON.parse(readFileSync(join(web, 'games', d.name, 'game.json'), 'utf8')) }))
  .filter((g) => g.m.listed !== false)
  .sort((a, b) => a.m.title.localeCompare(b.m.title));
for (const g of games) {
  const f = join(web, 'games', g.id, 'LICENSE.md');
  if (!existsSync(f)) throw new Error(`games/${g.id} has no LICENSE.md`);
  copyFileSync(f, join(out, `${g.id}.txt`));
}

// ---- the page
const LICENSE_TEXTS = [['GPL-2.0', 'GNU General Public License, version 2'], ['GPL-3.0', 'GNU General Public License, version 3'],
  ['LGPL-3.0', 'GNU Lesser General Public License, version 3']];
const rows = games.map(({ id, m }) => `<tr><td><strong>${esc(m.title)}</strong><br><span class="muted">${esc(m.original.author)}, ${esc(m.original.year)}</span></td>
<td>${esc(m.original.license)}</td>
<td><a href="licenses/${esc(id)}.txt">License and credits</a><br><a href="${esc(m.original.url)}" rel="noopener">The original</a><br>
<a href="${tree(`web/games/${esc(id)}`)}" rel="noopener">Source</a>${SOURCE_PATHS.includes(`re/${id}`) ? `, <a href="${tree(`re/${esc(id)}`)}" rel="noopener">how it was made</a>` : ''}</td></tr>`).join('\n');
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Licenses &amp; source · freegames</title>
<link rel="stylesheet" href="legal.css">
</head>
<body>
<main>
<a class="back" href="./">← freegames</a>
<h1>Licenses &amp; source code</h1>
<p class="muted" lang="de">Lizenzen und Quellcode. Die Spiele sind Portierungen freier Originale; hier stehen ihre Lizenzen und die
Links zum Quellcode dieser Website, Version für Version.</p>

<h2>Source code</h2>
<div class="box">
<p>The complete source code of everything this site sends to your browser, as it runs here:
<a class="download" href="${tree('')}" rel="noopener">${SOURCE_REPO} at ${tag}</a>. It holds the website, the game SDK, every game
port with its assets, the build files, the Cap'n Proto schemas the browser code is generated from, and XPilot's maps, which
the game server sends to the browser; each game's folder is linked below. How to build it: <code>README.md</code> there. Every
release is one commit and tag there, so earlier versions stay available too.</p>
<p>On request we send you the complete source code of every version this site served in the last three years, free of
charge (contact: <a href="impressum.html">Impressum</a>).</p>
<p class="muted">The game server, which runs only on our machine and is not distributed, is not part of it.</p>
</div>

<h2>The website and the game SDK</h2>
<p>Copyright © 2026 Bernhard Wege. Free software under the GNU General Public License, version 3 or (at your option) any
later version, with an additional permission under its section 7 to combine them with game ports under the NetHack
General Public License or GPL-2.0-only (NetHack, Frozen Bubble): <a href="licenses/freegames.txt">notice</a>,
<a href="licenses/GPL-3.0.txt">GPL-3.0</a>. It comes with ABSOLUTELY NO WARRANTY. Source: <a href="${tree('web/src')}" rel="noopener">web/src</a>.</p>
<p>Based on freegames.stream (<a href="https://freegames.stream/">https://freegames.stream/</a>). Additional terms under section 7
of the GPL-3.0 (in the notice): copies keep this line, modified versions are marked as such and are not presented as
freegames.stream, and no rights to the name are granted.</p>

<h2>The games</h2>
<p>Each port keeps its original's license; its file names the authors, the original's license and what the port changed.</p>
<table>
<thead><tr><th>Game</th><th>License</th><th></th></tr></thead>
<tbody>
${rows}
</tbody>
</table>

<h2>Libraries in your browser</h2>
<p><a href="https://github.com/unjs/capnp-es" rel="noopener">capnp-es</a> 0.0.16 (Cap'n Proto for JavaScript): MIT,
<a href="licenses/capnp-es.txt">license</a>.</p>

<h2>License texts</h2>
<ul>
${LICENSE_TEXTS.map(([f, name]) => `<li><a href="licenses/${f}.txt">${name}</a></li>`).join('\n')}
</ul>
<p>The MIT, BSD and zlib licenses are in the files of the games that use them.</p>

<h2>Trademarks</h2>
<p>Names of games, companies and computers are trademarks of their owners; no affiliation or endorsement is implied.
Pinball Construction Set was originally published by Electronic Arts (1983); this port is not affiliated with or endorsed by
Electronic Arts. Worms? is David S. Maynard's game of 1983 and not affiliated with Team17's Worms™ series.</p>

<nav class="legal">
<a href="./">All games</a>
<a href="impressum.html">Impressum / Legal notice</a>
<a href="datenschutz.html">Datenschutz / Privacy</a>
<a href="nutzungsbedingungen.html">Nutzungsbedingungen / Terms of use</a>
<a href="licenses.html">Lizenzen &amp; Quellcode / Licenses &amp; source</a>
</nav>
</main>
</body>
</html>
`;
writeFileSync(join(dist, 'licenses.html'), page);
console.log(`legal: licenses.html with ${games.length} games, source links to ${tree('')}`);
