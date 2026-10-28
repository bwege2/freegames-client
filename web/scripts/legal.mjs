// After `vite build`: the page "Licenses & source" (dist/licenses.html), every license as plain text
// (dist/licenses/), and the source code of what the site sends to browsers as one archive
// (dist/source/freegames-client-source.tar.gz): the website, the SDK, every game port, the build files,
// the protocol schemas and XPilot's maps. The game server is not distributed and must never be in it:
// the archive is made from an explicit list of paths and checked against it.
//   node scripts/legal.mjs          (part of npm run build)
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(web, '..');
const dist = join(web, 'dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('run vite build first');

/**
 * what the source archive holds (paths in the repository). re/nethack: NetHack's port is TypeScript
 * translated from the C source by its tools, and its data (assets/nhdat) is built by the original's
 * tools from the pinned upstream source; the scripts that do both belong to its source. re/abuse: the
 * scripts that build Abuse's data pack (assets/abuse-data.bin) and fonts (src/fontdata.ts) from the
 * pinned release. re/frozenbubble: the script that packs Frozen Bubble's data (assets/fb-data.bin) from the pinned
 * release, and its test oracle.
 */
export const SOURCE_PATHS = ['web', 'protocol', 'tools/gen-protocol.sh', 'docs/GAME-INTEGRATION.md', 'server/src/main/resources/xpilot/lib/maps',
  're/nethack', 're/abuse', 're/teeworlds', 're/frozenbubble'];
/** what it may never hold: the game server and the operations files */
const NEVER = [/^server\/(?!src\/main\/resources\/xpilot\/lib\/maps\/)/, /^slipstream\//, /^tools\/deploy/, /^docs\/(SERVER|DEPLOY)\.md$/, /^pom\.xml$/,
  /^re\/(?!nethack\/|abuse\/|teeworlds\/|frozenbubble\/)/];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' });

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

// ---- the source archive, from git (the files as committed)
let commit = '', archive = null, dirty = false;
try {
  commit = git('rev-parse', '--short=12', 'HEAD').trim();
  const files = git('ls-tree', '-r', '--name-only', 'HEAD', '--', ...SOURCE_PATHS).split('\n').filter(Boolean);
  const bad = files.filter((f) => NEVER.some((r) => r.test(f)));
  if (bad.length) throw new Error(`the source archive would hold files it must not: ${bad.slice(0, 5).join(', ')}`);
  if (!files.some((f) => f.startsWith('web/src/')) || !files.includes('web/package.json')) throw new Error('the source archive misses the website');
  dirty = git('status', '--porcelain', '--', ...SOURCE_PATHS).trim() !== '';
  mkdirSync(join(dist, 'source'), { recursive: true });
  archive = join(dist, 'source', 'freegames-client-source.tar.gz');
  // the readme on top, then the paths
  execFileSync('git', ['archive', '--format=tar.gz', `--prefix=freegames-client-${commit}/`, `--add-file=${join(web, 'SOURCE.md')}`,
    '-o', archive, 'HEAD', '--', ...SOURCE_PATHS], { cwd: repo });
  console.log(`legal: source archive ${(statSync(archive).size / 1e6).toFixed(1)} MB, ${files.length} files, commit ${commit}${dirty ? ' (WARNING: uncommitted changes are not in it)' : ''}`);
} catch (e) {
  if (e.message?.startsWith('the source archive')) throw e;
  console.warn(`legal: no source archive (${e.message?.split('\n')[0] ?? e}); a deploy needs one`);
  archive = null;
}

// ---- the page
const LICENSE_TEXTS = [['GPL-2.0', 'GNU General Public License, version 2'], ['GPL-3.0', 'GNU General Public License, version 3'],
  ['LGPL-3.0', 'GNU Lesser General Public License, version 3']];
const rows = games.map(({ id, m }) => `<tr><td><strong>${esc(m.title)}</strong><br><span class="muted">${esc(m.original.author)}, ${esc(m.original.year)}</span></td>
<td>${esc(m.original.license)}</td>
<td><a href="licenses/${esc(id)}.txt">License and credits</a><br><a href="${esc(m.original.url)}" rel="noopener">The original</a></td></tr>`).join('\n');
const size = archive ? `${(statSync(archive).size / 1e6).toFixed(1)} MB` : '';
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
<p class="muted" lang="de">Lizenzen und Quellcode. Die Spiele sind Portierungen freier Originale; hier stehen ihre Lizenzen und der
Quellcode dieser Website zum Herunterladen.</p>

<h2>Source code</h2>
<div class="box">
${archive ? `<p><a class="download" href="source/freegames-client-source.tar.gz" download>Download the source code (${size})</a></p>
<p>The complete source code of everything this site sends to your browser, as it runs here (commit <code>${esc(commit)}</code>):
the website, the game SDK, every game port with its assets, the build files, the Cap'n Proto schemas the browser code is
generated from, and XPilot's maps, which the game server sends to the browser. How to build it: <code>SOURCE.md</code> in the archive.</p>`
    : '<p>The source archive is missing from this build.</p>'}
<p class="muted">The game server, which runs only on our machine and is not distributed, is not part of it.</p>
</div>

<h2>The website and the game SDK</h2>
<p>Copyright © 2026 Bernhard Wege. Free software under the GNU General Public License, version 3 or (at your option) any
later version, with an additional permission under its section 7 to combine them with game ports under the NetHack
General Public License or GPL-2.0-only (NetHack, Frozen Bubble): <a href="licenses/freegames.txt">notice</a>,
<a href="licenses/GPL-3.0.txt">GPL-3.0</a>. It comes with ABSOLUTELY NO WARRANTY.</p>

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
<a href="licenses.html">Lizenzen &amp; Quellcode / Licenses &amp; source</a>
</nav>
</main>
</body>
</html>
`;
writeFileSync(join(dist, 'licenses.html'), page);
console.log(`legal: licenses.html with ${games.length} games`);
