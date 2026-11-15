// The port against the original: re/pingus/oracle/ builds Pingus 0.7.6's own game logic (World, Pingu, the
// actions, the traps, the collision and ground maps) and plays every demo file of the release with it
// (golden.mjs). Each golden file holds a running hash of the original's state after every tick (all pingus'
// positions, velocities, actions and directions, the counters, the collision map) at every 250th tick and the
// end. The port plays the same level with the same events and must give the same hashes, tick for tick.
// The levels and demos come from the shipped data (assets/) and test/data/ (original files the game does not ship).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DirSource, runDemo } from './harness.ts';
import { parseDemo } from '../src/world.ts';

const dir = join(import.meta.dirname, '..');
const goldenDir = join(dir, 'test', 'golden');
const shipped = JSON.parse(readFileSync(join(dir, 'assets', 'text-files.json'), 'utf-8')) as Record<string, string>;

/** the shipped files: images and sounds in assets/data, the text files from text-files.json, then test/data */
class TestSource extends DirSource {
  text(path: string) { return shipped[path] ?? super.text(path); }
  exists(path: string) { return shipped[path] !== undefined || super.exists(path); }
}
const source = new TestSource([join(dir, 'assets', 'data'), join(dir, 'test', 'data')]);

function fnv(h: number, s: string) {
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return Math.imul(h ^ 10, 16777619) >>> 0;
}

const files = readdirSync(goldenDir).filter((f) => f.endsWith('.txt')).sort();

test('there are golden files for the demos', () => assert.ok(files.length >= 150));

for (const f of files) {
  test(`demo ${f.replace(/\.txt$/, '')} plays as in the original`, () => {
    const g = readFileSync(join(goldenDir, f), 'utf-8').trim().split('\n');
    const level = g[0].replace(/^level /, ''), demo = g[1].replace(/^demo /, '');
    const want = g.slice(2);
    const got: string[] = [];
    let h = 2166136261;
    const end = runDemo(source, source.text(level)!, parseDemo(source.text(demo)!).events, 30000, (l) => {
      h = fnv(h, l);
      const t = +l.split(' ')[1];
      if (t % 250 === 0) got.push(`C ${t} ${h.toString(16).padStart(8, '0')}`);
    });
    got.push(`H ${h.toString(16).padStart(8, '0')}`, end);
    for (let i = 0; i < Math.max(want.length, got.length); i++) assert.equal(got[i], want[i], `${f}: line ${i + 3}`);
  });
}
