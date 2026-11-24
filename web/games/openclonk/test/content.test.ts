// The page's content loader (src/content.ts) read as Vite reads it, for both states of NONCOMMERCIAL_FILES
// (src/settings.ts): web/scripts/build-if.mjs removes the loader's reference to the four non-commercial files before
// Vite looks at the code when the setting is off, so they are not built; with it on the loader names them. No other
// module of the game names them. Plus: the groups Play waits for and game.json's lazyAssets agree, and pack.sh packs
// every group the page names. (`npm run build` in both states: re/openclonk/NOTES.md, "Milestone 2".)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyBuildIf, settingValue } from '../../../scripts/build-if.mjs';
import { NONCOMMERCIAL_FILES, NONCOMMERCIAL_PATHS } from '../src/settings.ts';
import { ALL_GROUPS, LAZY_GROUPS, START_GROUPS, SCENARIO_FOLDERS, MUSIC_GROUP } from '../src/groups.ts';

const game = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(game, 'src');
const loaderFile = path.join(src, 'content.ts');
const settingsFile = path.join(src, 'settings.ts');
const loader = fs.readFileSync(loaderFile, 'utf8');

/** settings.ts with NONCOMMERCIAL_FILES set to `on` */
function settingsWith(on: boolean): string {
  const text = fs.readFileSync(settingsFile, 'utf8');
  const out = text.replace(/^(export const NONCOMMERCIAL_FILES: boolean = )(true|false);/m, `$1${on};`);
  assert.notEqual(out.match(/^export const NONCOMMERCIAL_FILES: boolean = (true|false);/m), null);
  return out;
}

/** the loader as Vite gets it in one state of the setting */
function loaderAsBuilt(on: boolean): string {
  const read = (p: string) => (path.resolve(p) === settingsFile ? settingsWith(on) : fs.readFileSync(p, 'utf8'));
  return applyBuildIf(loader, loaderFile, read) ?? loader;
}

/** what the code hands to Vite to resolve: import.meta.glob patterns, import specifiers, new URL(...) */
function references(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(/import\.meta\.glob\(\s*(['"`])([^'"`]+)\1/g)) out.push(m[2]);
  for (const m of code.matchAll(/\bimport\s*(?:[^'"`;]*?\bfrom\s*)?(['"])([^'"]+)\1/g)) out.push(m[2]);
  for (const m of code.matchAll(/\bimport\(\s*(['"`])([^'"`]+)\1/g)) out.push(m[2]);
  for (const m of code.matchAll(/new URL\(\s*(['"`])([^'"`]+)\1\s*,\s*import\.meta\.url/g)) out.push(m[2]);
  return out;
}

/** a glob of import.meta.glob (relative to src/) as a test of a path relative to src/ */
function globTest(glob: string): (p: string) => boolean {
  const braces = glob.replace(/\{([^}]+)\}/g, (_, alts: string) => `\u0000${alts.split(',').join('\u0001')}\u0002`);
  const re = braces
    .split('**').map((part) => part.split('*').map((s) => s.replace(/[.+?^$()|[\]\\]/g, '\\$&')).join('[^/]*')).join('.*')
    .replace(/\u0000/g, '(?:').replace(/\u0001/g, '|').replace(/\u0002/g, ')');
  const r = new RegExp(`^${re}$`);
  return (p) => r.test(p);
}

/** the files of the four as paths relative to src/, where pack.sh puts them */
const NC_FILES = NONCOMMERCIAL_PATHS.map((p) => `../assets/noncommercial/${p}`);

test('the setting is read by build-if.mjs as settings.ts says', () => {
  assert.equal(settingValue(settingsFile, 'NONCOMMERCIAL_FILES'), NONCOMMERCIAL_FILES);
  assert.equal(settingValue(settingsFile, 'NONCOMMERCIAL_FILES', () => settingsWith(false)), false);
  assert.equal(settingValue(settingsFile, 'NONCOMMERCIAL_FILES', () => settingsWith(true)), true);
});

test('NONCOMMERCIAL_FILES off: the built loader names none of the four files', () => {
  const code = loaderAsBuilt(false);
  assert.ok(!/noncommercial\//.test(code.replace(/\/\/.*$/gm, '')), 'no path into assets/noncommercial outside comments');
  const refs = references(code);
  assert.ok(refs.includes('../assets/*.{ocg,ocd,ocf}'), 'the groups are still loaded');
  for (const f of NC_FILES) {
    for (const r of refs) assert.ok(!globTest(r)(f), `${r} does not match ${f}`);
  }
  for (const name of ['WindLoop', 'GlassShatter', 'StartupDlgPaper', 'StartupPlrPropBG']) {
    assert.ok(!code.includes(name), `${name} is not named`);
  }
});

test('NONCOMMERCIAL_FILES on: the built loader names exactly the four files besides the groups', () => {
  const code = loaderAsBuilt(true);
  const refs = references(code).filter((r) => r.startsWith('../assets/'));
  assert.deepEqual(refs.sort(), ['../assets/*.{ocg,ocd,ocf}', '../assets/noncommercial/**/*'].sort());
  const nc = globTest('../assets/noncommercial/**/*');
  for (const f of NC_FILES) assert.ok(nc(f), `${f} is loaded`);
  // the groups' glob takes the packed groups, never a file of noncommercial/
  const groups = globTest('../assets/*.{ocg,ocd,ocf}');
  for (const f of NC_FILES) assert.ok(!groups(f), `the groups' glob does not take ${f}`);
  for (const g of ALL_GROUPS) assert.ok(groups(`../assets/${g}`), `the groups' glob takes ${g}`);
  // the shipped assets are licence-clean: with the setting off (the shipped build) there is no noncommercial/ beside
  // the groups; with it on, what pack.sh wrote is there and nothing else
  const ncDir = path.join(game, 'assets/noncommercial');
  if (!NONCOMMERCIAL_FILES) {
    assert.equal(fs.existsSync(ncDir), false, 'the shipped assets hold none of the four non-commercial files');
  } else if (fs.existsSync(ncDir)) {
    const onDisk = (fs.readdirSync(ncDir, { recursive: true }) as string[])
      .map((p) => p.split(path.sep).join('/'))
      .filter((p) => fs.statSync(path.join(ncDir, p)).isFile())
      .sort();
    assert.deepEqual(onDisk, [...NONCOMMERCIAL_PATHS].sort(), 'assets/noncommercial holds the four files');
  }
});

test('no other module of the game names the non-commercial files', () => {
  const files = (fs.readdirSync(src, { recursive: true }) as string[]).filter((f) => /\.[cm]?[jt]s$/.test(f));
  assert.ok(files.length > 100);
  for (const f of files) {
    const file = path.join(src, f);
    if (file === loaderFile) continue;
    const code = fs.readFileSync(file, 'utf8');
    for (const r of references(code)) {
      assert.ok(!/noncommercial|WindLoop|GlassShatter|StartupDlgPaper|StartupPlrPropBG/.test(r), `${f} imports ${r}`);
    }
    assert.ok(!code.includes('build-if'), `${f}: only the loader has build-time switches`);
  }
});

test('Play waits for the start groups and milestone 2\'s scenario folders; game.json lazyAssets has the rest', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(game, 'game.json'), 'utf8'));
  assert.deepEqual([...manifest.lazyAssets].sort(), LAZY_GROUPS.map((g) => `assets/${g}`).sort());
  assert.ok(LAZY_GROUPS.includes(MUSIC_GROUP));
  for (const g of START_GROUPS) assert.ok(!(LAZY_GROUPS as readonly string[]).includes(g), `${g} is there at the start`);
  const atStart = SCENARIO_FOLDERS.filter((f) => !(LAZY_GROUPS as readonly string[]).includes(f));
  assert.deepEqual(atStart, ['Tutorials.ocf', 'Parkour.ocf']);
  // the game is live: listed, with the day it went live, at least four screenshots of the port, the original's
  // controls and an honest caveat; it is not marked broken
  assert.notEqual(manifest.listed, false, 'listed');
  assert.equal(manifest.added, '2026-11-23', 'the day it went live');
  assert.equal(manifest.broken, undefined, 'not marked broken: the start menu, all 58 scenarios and Tutorial01 play');
  assert.ok(manifest.screenshots.length >= 4 && manifest.controls.length > 0, 'at least four screenshots and the original\'s controls');
  assert.ok(typeof manifest.caveat === 'string' && manifest.caveat.length > 0, 'the caveat says what is not shipped and what is not offered');
  assert.ok(Array.isArray(manifest.links) && manifest.links.length > 0, 'links to the original');
  for (const s of manifest.screenshots) assert.ok(fs.existsSync(path.join(game, 'screenshots', s.file)), s.file);
});

test('pack.sh packs every group the page names', () => {
  const pack = fs.readFileSync(path.resolve(game, '../../../re/openclonk/tools/pack.sh'), 'utf8');
  const list = /groups=\(([^)]*)\)/.exec(pack);
  assert.ok(list);
  const packed = list[1].split(/\s+/).filter(Boolean);
  for (const g of ALL_GROUPS) assert.ok(packed.includes(g), `pack.sh packs ${g}`);
});
