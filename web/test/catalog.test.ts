// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Every game folder is complete enough for the website: a valid game.json, its screenshots exist,
// and a game with code exports `start`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GENRES, MADE_WITH, PLAY_MODES } from '../src/sdk/game.ts';

/** `madeWith` is absent (an original) or one of MADE_WITH */
function checkMadeWith(m: { madeWith?: unknown }): void {
  if (m.madeWith !== undefined) assert.ok((MADE_WITH as readonly unknown[]).includes(m.madeWith), `madeWith is ${MADE_WITH.join(' or ')} (${String(m.madeWith)})`);
}

const GAMES = join(import.meta.dirname, '..', 'games');
const dirs = readdirSync(GAMES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

test('there are game folders', () => {
  assert.ok(dirs.length >= 1);
});

test('madeWith: absent, "human" or "ai"; anything else is refused', () => {
  for (const v of [undefined, 'human', 'ai']) assert.doesNotThrow(() => checkMadeWith({ madeWith: v }), String(v));
  for (const v of ['robot', 'AI', '', true, 1]) assert.throws(() => checkMadeWith({ madeWith: v }), String(v));
});

for (const dir of dirs) {
  test(`games/${dir}/game.json`, () => {
    const file = join(GAMES, dir, 'game.json');
    assert.ok(existsSync(file), 'game.json exists');
    const m = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(m.id, dir, 'id = folder name');
    assert.match(m.id, /^[a-z0-9]{1,32}$/, 'id is a server game id');
    for (const k of ['title', 'tagline', 'players']) assert.ok(typeof m[k] === 'string' && m[k].trim(), `${k} is text`);
    assert.ok(Array.isArray(m.summary) && m.summary.length > 0 && m.summary.every((p: unknown) => typeof p === 'string' && p.trim()), 'summary paragraphs');
    const o = m.original;
    for (const k of ['author', 'platform', 'version', 'license', 'url']) assert.ok(typeof o?.[k] === 'string' && o[k].trim(), `original.${k}`);
    assert.ok(Number.isInteger(o.year) && o.year > 1950, 'original.year');
    assert.ok(Number.isInteger(o.packageBytes) && o.packageBytes >= 0, 'original.packageBytes');
    assert.ok(Array.isArray(m.controls) && m.controls.every((c: { input?: string; action?: string }) => c.input && c.action), 'controls');
    assert.ok(Array.isArray(m.screenshots), 'screenshots');
    for (const s of m.screenshots) {
      assert.ok(s.file && s.caption, 'screenshot file + caption');
      assert.match(s.file, /\.(png|jpe?g|webp|gif)$/, 'screenshot type');
      assert.ok(existsSync(join(GAMES, dir, 'screenshots', s.file)), `screenshots/${s.file} exists`);
    }
    if (m.listed !== undefined) assert.equal(typeof m.listed, 'boolean');
    assert.ok(Array.isArray(m.genres) && m.genres.every((g: string) => (GENRES as readonly string[]).includes(g)), `genres from the vocabulary in src/sdk/game.ts (${m.genres})`);
    assert.ok(Array.isArray(m.modes) && m.modes.length > 0 && m.modes.every((x: string) => (PLAY_MODES as readonly string[]).includes(x)), `modes are ${PLAY_MODES.join('/')}`);
    if (m.listed !== false) assert.ok(m.genres.length > 0, 'a listed game has a genre');
    checkMadeWith(m);
    if (m.added !== undefined) assert.match(m.added, /^\d{4}-\d{2}-\d{2}$/, 'added is YYYY-MM-DD');
    if (m.remake !== undefined) {
      assert.equal(typeof m.remake, 'boolean', 'remake is true or false');
      if (m.remake) assert.ok(typeof m.caveat === 'string' && m.caveat.trim(), 'a remake says in its caveat what comes from the original');
    }
    if (m.links !== undefined) {
      assert.ok(Array.isArray(m.links) && m.links.length > 0, 'links: a list');
      for (const l of m.links) {
        assert.ok(typeof l.label === 'string' && l.label.trim(), 'a link has a label');
        assert.match(l.url, /^https:\/\/[^\s"<>]+$/, `a link is an https address (${l.url})`);
      }
    }
    const code = join(GAMES, dir, 'src', 'index.ts');
    if (existsSync(code)) {
      assert.match(readFileSync(code, 'utf8'), /export\s+(const|async function|function)\s+start\b/, 'src/index.ts exports start');
      if (m.listed !== false) assert.ok(m.screenshots.length >= 2, 'a playable listed game shows at least 2 screenshots of the port');
      if (m.listed !== false) assert.ok(m.added, 'a playable listed game says when it went live (added)');
    }
  });
}
