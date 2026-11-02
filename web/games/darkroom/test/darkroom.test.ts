// A Dark Room: the generated original-code factory, its data and the scoped CSS.
// The game itself is the original's browser code translated in legacy.ts; the C-style oracle here is
// the pinned 1.4 source, so these tests guard the parts a wrong regeneration would break.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { translate } from '../src/text.ts';

const here = import.meta.dirname;
const game = join(here, '..');
const legacy = readFileSync(join(game, 'src', 'legacy.ts'), 'utf8');

test('the generated factory keeps the original modules and starts no game of its own', () => {
  for (const module of ['Engine', 'Room', 'Outside', 'World', 'Path', 'Ship', 'Space', 'Fabricator',
    'Prestige', 'Score', 'Events', 'AudioEngine', 'AudioLibrary', 'StateManager']) {
    assert.match(legacy, new RegExp(`\\b(?:var|let|const) ${module}\\b`), module);
  }
  assert.match(legacy, /VERSION: 1\.3,/);
  assert.match(legacy, /RADIUS: 30,/);
  assert.match(legacy, /FIGHT_CHANCE: 0,/);
  assert.doesNotMatch(legacy, /localStorage/);
  assert.doesNotMatch(legacy, /window\.(Engine|State)\b/);
  assert.doesNotMatch(legacy, /^\$\(function\(\) \{$/m);
});

test('every audio file the original library names exists in the assets', () => {
  const names = [...new Set([...legacy.matchAll(/audio\/[a-z0-9-]+\.flac/g)].map((m) => m[0]))];
  assert.ok(names.length >= 80, `${names.length} audio files named`);
  const have = new Set(readdirSync(join(game, 'assets', 'audio')));
  const missing = names.filter((n) => !have.has(n.replace('audio/', '')));
  assert.deepEqual(missing, []);
});

test('the CSS is the original, scoped, with the dark theme behind a class', () => {
  const css = readFileSync(join(game, 'src', 'adr.css'), 'utf8');
  assert.doesNotMatch(css, /(^|\n)\s*(body|html)\s*[,{]/);
  assert.match(css, /\.adr-root\s*,/);
  assert.match(css, /\.adr-root\.dark\s*\{/);
  assert.match(css, /@keyframes spin/);
  assert.match(css, /@keyframes exploding/);
});

test('English translation fills the original placeholders', () => {
  assert.equal(translate('the fire is {0}', 'burning'), 'the fire is burning');
  assert.equal(translate('{0} per {1}s', '+2', 10), '+2 per 10s');
  assert.equal(translate('no arguments'), 'no arguments');
});

test('the manifest has two screenshots of the port and the original facts', () => {
  const m = JSON.parse(readFileSync(join(game, 'game.json'), 'utf8')) as {
    screenshots: { file: string }[]; original: { version: string; license: string };
  };
  assert.equal(m.original.version, '1.4');
  assert.equal(m.original.license, 'MPL-2.0');
  assert.ok(m.screenshots.length >= 2);
  for (const s of m.screenshots) assert.ok(existsSync(join(game, 'screenshots', s.file)), s.file);
});
