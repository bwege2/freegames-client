// The group reader (src/rt/group.ts) against the original's c4group tool: groups packed by the original
// (re/openclonk/tools/pack.sh) are read by the port, and every group and child group lists the same entries
// in the same order with the same sizes as `c4group <group> -l` says; every file's bytes are those of the
// original's planet/ folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { c4groupBin, c4groupMissing, planet, re } from './oracle.ts';
import { C4Group, MemScramble } from '../src/rt/group.ts';
import { StdStrBuf } from '../src/rt/StdBuf.ts';

const missing = c4groupMissing();
const skip = missing ? `the c4group tool is missing: ${missing}` : false;
const pack = path.join(re, 'work/pack');

function packed(name: string): string {
  const f = path.join(pack, name);
  if (!fs.existsSync(f)) execFileSync('bash', [path.join(re, 'tools/pack.sh'), name], { stdio: 'ignore' });
  return f;
}

/** c4group's listing of a group (a file, or a path into it): name, size, child group */
function listing(groupPath: string): { name: string; size: number; group: boolean; exe: boolean }[] {
  const out = execFileSync(c4groupBin, [groupPath, '-l'], { encoding: 'latin1', stdio: ['ignore', 'pipe', 'ignore'] });
  const r: { name: string; size: number; group: boolean; exe: boolean }[] = [];
  for (const line of out.split('\n')) {
    if (/^\d+ Entries, \d+ Bytes$/.test(line.trim())) continue;
    const m = /^\s*(.+?)\s+(\d+) Bytes( \(Group\))?( \(Executable\))?$/.exec(line);
    if (m) r.push({ name: Buffer.from(m[1], 'latin1').toString('utf8'), size: Number(m[2]), group: !!m[3], exe: !!m[4] });
  }
  return r;
}

function compare(g: C4Group, file: string, inner: string[], counts: { groups: number; files: number }) {
  const where = [path.basename(file), ...inner].join('/');
  const theirs = listing(path.join(file, ...inner));
  const mine = g.entries.filter((e) => !e.deleted).map((e) => ({ name: e.name, size: e.Size, group: e.ChildGroup, exe: e.Executable }));
  assert.deepEqual(mine, theirs, `entries of ${where}`);
  counts.groups++;
  for (const e of mine) {
    if (e.group) {
      compare(g.OpenAsChild(e.name)!, file, [...inner, e.name], counts);
    } else {
      const orig = fs.readFileSync(path.join(planet, path.basename(file), ...inner, e.name));
      assert.ok(Buffer.from(g.LoadEntry(e.name)!).equals(orig), `${where}/${e.name}: the bytes of planet/`);
      counts.files++;
    }
  }
}

for (const name of ['System.ocg', 'Material.ocg', 'Arena.ocf', 'Parkour.ocf']) {
  test(`${name} as the original packs it`, { skip, timeout: 300000 }, (t) => {
    const file = packed(name);
    const g = C4Group.open(name, new Uint8Array(fs.readFileSync(file)));
    const counts = { groups: 0, files: 0 };
    compare(g, file, [], counts);
    assert.ok(counts.files > 10);
    t.diagnostic(`${counts.groups} groups, ${counts.files} files`);
  });
}

test('finding entries with wildcards, loading them as text', { skip }, () => {
  const g = C4Group.open('System.ocg', new Uint8Array(fs.readFileSync(packed('System.ocg'))));
  const name = new StdStrBuf();
  const found: string[] = [];
  const out = { name, size: 0 };
  if (g.FindEntry('StringTbl*.txt', out)) do found.push(name.toString()); while (g.FindNextEntry('StringTbl*.txt', out));
  assert.deepEqual(found, ['StringTblDE.txt', 'StringTblUS.txt']);
  assert.equal(g.EntryCount('*.c'), fs.readdirSync(path.join(planet, 'System.ocg')).filter((f) => f.endsWith('.c')).length);
  const t = g.LoadEntryString('LanguageUS.txt')!;
  assert.equal(t.toString(), fs.readFileSync(path.join(planet, 'System.ocg/LanguageUS.txt'), 'utf8'));
});

test('MemScramble is its own inverse', () => {
  const b = Uint8Array.from({ length: 204 }, (_, i) => (i * 7) & 0xff);
  const c = b.slice();
  MemScramble(c);
  assert.notDeepEqual(c, b);
  MemScramble(c);
  assert.deepEqual(c, b);
});
