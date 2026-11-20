// The licence check as a test: web/games/madness/LICENSE.md and ASSET-MANIFEST.csv must cover every file the
// port ships, with a free licence, and the hashes must still be those of the reference files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { localeTable } from '../src/data/locale.ts';

const GAME = join(import.meta.dirname, '..');
const ASSETS = join(GAME, 'assets');
const MANIFEST = join(GAME, 'ASSET-MANIFEST.csv');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(relative(ASSETS, p).split('\\').join('/'));
  }
  return out.sort();
}

/** a CSV line with quoted fields (the source column contains commas) */
function csv(line: string): string[] {
  const out: string[] = [];
  let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') quoted = false; else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}

test('every asset file is in the licence manifest, with a free licence and its reference hash', () => {
  const lines = readFileSync(MANIFEST, 'utf8').trim().split('\n');
  assert.deepEqual(csv(lines[0]), ['path', 'bytes', 'sha256', 'source', 'licence']);
  const rows = new Map<string, { bytes: number; sha256: string; source: string; licence: string }>();
  for (const line of lines.slice(1)) {
    const [path, bytes, sha256, source, licence] = csv(line);
    assert.ok(path && !rows.has(path), `one row for ${path}`);
    rows.set(path, { bytes: Number(bytes), sha256, source, licence });
  }
  const files = walk(ASSETS);
  assert.equal(rows.size, files.length, 'the manifest lists every file and no other');
  for (const f of files) {
    const r = rows.get(f);
    assert.ok(r, `${f} is in the manifest`);
    assert.ok(['GPL-3.0', 'SIL Open Font License 1.1'].includes(r.licence), `${f}: free licence (${r.licence})`);
    assert.ok(!/NC|ND|non-?commercial|no-?deriv/i.test(r.licence), `${f}: not NC/ND`);
    const data = readFileSync(join(ASSETS, f));
    assert.equal(r.bytes, data.length, `${f}: size`);
    assert.equal(r.sha256, createHash('sha256').update(data).digest('hex'), `${f}: SHA-256 unchanged`);
    assert.ok(r.source.length > 10, `${f}: a source`);
  }
  // the two fonts that MIR ships under a proprietary licence are replaced, under the OFL
  for (const f of ['fonts/impact.wf', 'fonts/toxigenesis.wf']) {
    const r = rows.get(f)!;
    assert.equal(r.licence, 'SIL Open Font License 1.1', f);
    assert.match(r.source, /Anton-Regular\.ttf|RussoOne-Regular\.ttf/, `${f}: made from the free font`);
  }
  // every other file comes from the reference repository
  for (const [f, r] of rows) if (!f.startsWith('fonts/')) assert.match(r.source, /Madness Interactive Reloaded 0\.51\.1-beta.*base\//, `${f}: source`);
});

test("MIR's locale file is a LocalisationFile: the game reads its Table, not its top level", () => {
  const text = readFileSync(join(ASSETS, 'locale', 'en-GB.json'), 'utf8');
  const table = localeTable(text);
  assert.equal(table['tut-move'], 'Hold <color=#ffffff>[{0}]</color> or <color=#ffffff>[{1}]</color> to move around');
  assert.equal(table['tut-proceed'], 'Get to the right side of the room to proceed.');
  assert.equal(table['main-menu-campaigns'], 'Campaigns');
  assert.equal(localeTable('{"a":"b"}')['a'], 'b', 'a flat table still works');
  // every key the port looks up in the locale exists in the file (the fallback text hides a typo otherwise)
  const used = new Set<string>();
  for (const f of ['app.ts', 'game/tutorial.ts', 'game/incident.ts']) {
    const src = readFileSync(join(GAME, 'src', f), 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) used.add(m[1]);
    for (const m of src.matchAll(/\bsay\(\s*'([^']+)'/g)) used.add(m[1]);
  }
  assert.ok(used.size > 20, 'the UI uses the locale');
  for (const k of used) assert.ok(k in table, `locale key ${k}`);
});
