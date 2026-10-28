// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// After `vite build`: what each game downloads when it starts, for the player's progress bar (dist/downloads.json):
//   { "<id>": { "bytes": <total>, "files": [["assets/<file>", <bytes>], ...] } }
// From Vite's manifest: the game's chunk and the chunks it imports (not those the site has loaded already), the
// assets they reference, and every file of dist/assets their code names (workers and what workers load). A game
// lists in game.json "lazyAssets" (globs in its folder, "assets/music/**") what it loads only later, while playing.
// The manifest is removed afterwards.
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(web, 'dist');
const manifestFile = join(dist, '.vite', 'manifest.json');
if (!existsSync(manifestFile)) throw new Error('run vite build first (with build.manifest)');
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
const outputs = new Set(readdirSync(join(dist, 'assets')).map((f) => `assets/${f}`));
const bytes = (file) => statSync(join(dist, file)).size;

/** the chunks an entry imports statically, itself included (manifest keys) */
function closure(key, seen = new Set()) {
  if (seen.has(key) || !manifest[key]) return seen;
  seen.add(key);
  for (const k of manifest[key].imports ?? []) closure(k, seen);
  return seen;
}
const site = new Set([...closure('index.html')].flatMap((k) => [manifest[k].file, ...(manifest[k].css ?? []), ...(manifest[k].assets ?? [])]));

/** "assets/music/**" -> a test of a path in the game's folder */
const glob = (g) => new RegExp(`^${g.split('**').map((p) => p.split('*').map((q) => q.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')}$`);

const result = {};
for (const id of readdirSync(join(web, 'games')).sort()) {
  const key = `games/${id}/src/index.ts`;
  if (!manifest[key]) continue;
  const game = JSON.parse(readFileSync(join(web, 'games', id, 'game.json'), 'utf8'));
  const lazyTests = (game.lazyAssets ?? []).map(glob);
  const lazy = new Set(Object.entries(manifest)
    .filter(([k]) => k.startsWith(`games/${id}/`) && lazyTests.some((t) => t.test(k.slice(`games/${id}/`.length))))
    .map(([, e]) => e.file));
  const files = new Set();
  const add = (f) => {
    if (!f || files.has(f) || site.has(f) || lazy.has(f) || !outputs.has(f)) return;
    files.add(f);
    // code names further files: workers, and what they load
    if (/\.(js|mjs|css)$/.test(f)) {
      const text = readFileSync(join(dist, f), 'utf8');
      for (const m of text.matchAll(/[\w.-]+-[\w-]{8}\.[a-z0-9]+/g)) if (outputs.has(`assets/${m[0]}`)) add(`assets/${m[0]}`);
    }
  };
  for (const k of closure(key)) {
    const e = manifest[k];
    add(e.file);
    for (const f of [...(e.css ?? []), ...(e.assets ?? [])]) add(f);
  }
  const list = [...files].sort().map((f) => [f, bytes(f)]);
  result[id] = { bytes: list.reduce((s, [, b]) => s + b, 0), files: list };
}
writeFileSync(join(dist, 'downloads.json'), JSON.stringify(result));
rmSync(join(dist, '.vite'), { recursive: true, force: true });
const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;
console.log(`downloads: ${Object.entries(result).map(([id, r]) => `${id} ${mb(r.bytes)}`).join(', ')}`);
