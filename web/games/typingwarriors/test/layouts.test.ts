// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The layouts: every layout covers the 48 character keys of a keyboard (the Neo family's modifier keys on two
// of them), its letters are unique per level, QWERTZ and QWERTY swap Z and Y, Neo 2 and NeoQwertz differ in the
// letters and share the rest, a character is placed on a key the layout's keyboard has, the server knows every
// layout id, and the committed data is what the generator makes of the definitions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEAD, LAYOUTS, ROWS, differingKeys, layoutById, strokeFor, untypeable } from '../src/layouts.ts';

const here = dirname(fileURLToPath(import.meta.url));
const isLetter = (c: string): boolean => c.toLowerCase() !== c.toUpperCase();
const isChar = (c: string | undefined): c is string => !!c && !c.startsWith(DEAD);
const L = (id: string) => {
  const l = layoutById(id);
  assert.ok(l, id);
  return l;
};

/** the 48 character keys of an ISO keyboard (an ANSI keyboard has 47: no key next to left Shift) */
const CHAR_KEYS = [...ROWS.flat(), 'Backslash', 'IntlBackslash'];

test('the list: 21 layouts, unique ids, the README\'s names', () => {
  assert.equal(CHAR_KEYS.length, 48);
  assert.deepEqual(LAYOUTS.map((l) => l.id), ['qwertz', 'qwertz-ch', 'qwerty', 'qwerty-uk', 'azerty', 'dvorak', 'colemak', 'colemak-dh',
    'colemak-dh-iso', 'workman', 'norman', 'bepo', 'neo2', 'neoqwertz', 'neoqwerty', 'bone', 'mine', 'noted', 'adnw', 'koy', '3l']);
  for (const l of LAYOUTS) {
    assert.equal(l.levels.length, 4, l.id);
    assert.ok(l.family === 'neo' ? l.mod3.length && l.mod4.length : l.mod3.join() === 'AltRight' && !l.mod4.length, `${l.id}: its modifiers`);
    for (const [code, chars] of Object.entries(l.keys)) {
      assert.ok(CHAR_KEYS.includes(code), `${l.id}: ${code} is a character key`);
      assert.ok(chars.length >= 1 && chars.length <= 4, `${l.id} ${code}: 1 to 4 levels`);
      for (const c of chars) assert.ok(c === '' || c.startsWith(DEAD) || [...c].length === 1, `${l.id} ${code}: "${c}" is one character`);
    }
  }
});

test('every layout has 48 or more keys: characters, and in the Neo family the Mod3 and Mod4 keys on character keys', () => {
  for (const l of LAYOUTS) {
    const keys = Object.keys(l.keys).length;
    const mods = [...l.mod3, ...l.mod4].filter((c) => CHAR_KEYS.includes(c) && !(c in l.keys));
    if (l.family === 'standard') assert.ok(keys >= 48, `${l.id}: ${keys} keys`);
    else assert.ok(keys + mods.length >= 48, `${l.id}: ${keys} keys + ${mods.join(' ')}`);
    // a key a modifier sits on types nothing itself
    for (const m of mods) assert.equal(l.keys[m], undefined, `${l.id}: ${m} is a modifier`);
    // the letters of the alphabet and every digit are there
    for (const c of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,') {
      assert.ok(l.where.has(c), `${l.id} types ${c}`);
    }
  }
});

test('the German letters: every layout but the English ones types ä ö ü ß', () => {
  const english = LAYOUTS.filter((l) => untypeable(l, 'äöüß').length).map((l) => l.id);
  // the README warns of the US layouts; the British, French and Bépo layouts reach no umlaut without a dead key either
  assert.deepEqual(english, ['qwerty', 'qwerty-uk', 'azerty', 'dvorak', 'workman', 'norman', 'bepo', '3l']);
  for (const id of ['qwertz', 'qwertz-ch', 'neo2', 'bone', 'koy', 'colemak']) assert.deepEqual(untypeable(L(id), 'äöüß'), [], id);
});

test('letters are unique per level; on levels 3 and 4 only the doubles xkeyboard-config itself defines', () => {
  const doubles: string[] = [];
  for (const l of LAYOUTS) {
    for (let level = 0; level < 4; level++) {
      const seen = new Map<string, string>();
      for (const [code, chars] of Object.entries(l.keys)) {
        // an ANSI keyboard has no IntlBackslash (xkb defines it anyway)
        if (l.form === 'ansi' && code === 'IntlBackslash') continue;
        const c = chars[level];
        if (!isChar(c) || !isLetter(c)) continue;
        if (seen.has(c)) doubles.push(`${l.id} level ${level + 1}: ${c} on ${seen.get(c)} and ${code}`);
        else seen.set(c, code);
      }
    }
  }
  assert.deepEqual(doubles, [
    'qwertz level 3: ſ on KeyW and KeyS',
    'azerty level 3: ł on KeyL and KeyZ',
    'azerty level 4: Ł on KeyL and KeyZ',
  ]);
  // the plain and Shift levels: every letter on one key only
  assert.ok(doubles.every((d) => / level [34]:/.test(d)));
});

test('a character is placed on a key the layout\'s keyboard has (an ANSI layout never on IntlBackslash)', () => {
  for (const l of LAYOUTS) {
    for (const [c, w] of l.where) {
      if (l.form === 'ansi') assert.notEqual(w.code, 'IntlBackslash', `${l.id}: ${c}`);
      if (c !== ' ') assert.equal(l.keys[w.code][w.level], c, `${l.id}: ${c}`);
      // the lowest level that has it
      for (const [code, chars] of Object.entries(l.keys)) {
        if (l.form === 'ansi' && code === 'IntlBackslash') continue;
        const at = chars.indexOf(c);
        if (at >= 0) assert.ok(at >= w.level, `${l.id}: ${c} is on level ${at + 1} of ${code}`);
      }
    }
  }
  // the cases that were wrong: Colemak-DH (ANSI) has z on B, the US layouts > on the period key, 3l < on U
  assert.equal(L('colemak-dh').where.get('z')?.code, 'KeyB');
  for (const id of ['qwerty', 'dvorak', 'workman', 'norman']) assert.notEqual(L(id).where.get('>')?.code, 'IntlBackslash', id);
  assert.equal(L('3l').where.get('<')?.code, 'KeyU');
  // the finger for it: the left index finger, not the little one
  assert.equal(strokeFor(L('colemak-dh'), 'z')?.code, 'KeyB');
});

test('QWERTZ and QWERTY: Z and Y swapped, the other letters in place', () => {
  const de = L('qwertz'), us = L('qwerty');
  assert.deepEqual(de.keys.KeyY.slice(0, 2), ['z', 'Z']);
  assert.deepEqual(de.keys.KeyZ.slice(0, 2), ['y', 'Y']);
  assert.deepEqual(us.keys.KeyY.slice(0, 2), ['y', 'Y']);
  assert.deepEqual(us.keys.KeyZ.slice(0, 2), ['z', 'Z']);
  for (const code of ROWS.slice(1).flat()) {
    const a = de.keys[code][0], b = us.keys[code][0];
    if (!isLetter(a) || !isLetter(b) || code === 'KeyY' || code === 'KeyZ') continue;
    assert.equal(a, b, code);
  }
  // the differing letter keys: Y and Z, and the German ü ö ä ß against [ ; ' -
  const letters = ROWS.slice(1).flat().filter((c) => de.keys[c][0] !== us.keys[c][0]);
  assert.deepEqual(letters, ['KeyY', 'BracketLeft', 'BracketRight', 'Semicolon', 'Quote', 'KeyZ', 'Slash']);
  assert.equal(differingKeys(de, us), 7);
  // the Swiss layout has Z where QWERTZ has it, and the UK layout Y where QWERTY has it
  assert.equal(L('qwertz-ch').keys.KeyY[0], 'z');
  assert.equal(L('qwerty-uk').keys.KeyY[0], 'y');
});

test('Neo 2 and NeoQwertz: other letters, the same levels 3 and 4; NeoQwertz has the QWERTZ letters', () => {
  const neo = L('neo2'), nq = L('neoqwertz'), de = L('qwertz');
  assert.ok(differingKeys(neo, nq) >= 25, `${differingKeys(neo, nq)} keys differ`);
  // the home row of Neo 2
  assert.equal(ROWS[2].map((c) => neo.keys[c][0]).join(''), 'uiaeosnrtdy');
  assert.equal(ROWS[2].slice(0, 9).map((c) => nq.keys[c][0]).join(''), 'asdfghjkl');
  // NeoQwertz types every letter of QWERTZ on its key
  for (const code of ROWS.slice(1).flat()) {
    const c = de.keys[code][0];
    if (isLetter(c)) assert.equal(nq.keys[code][0], c, code);
  }
  // of the letter rows only the key right of Ü differs (Neo's dead key for accents, QWERTZ's +)
  assert.equal(differingKeys(nq, de), 1);
  assert.equal(nq.keys.BracketRight[0], `${DEAD}´`);
  // levels 3 and 4 are Neo's: the same on most letter keys of the two
  let same = 0, all = 0;
  for (const code of ROWS.slice(1).flat()) {
    all++;
    if (neo.keys[code]?.[2] === nq.keys[code]?.[2] && neo.keys[code]?.[3] === nq.keys[code]?.[3]) same++;
  }
  assert.ok(same >= all - 3, `${same} of ${all}`);
  assert.equal(neo.keys.KeyD[2], '{'); // Mod3 + D: the left brace on Neo 2
  assert.deepEqual(strokeFor(neo, '{'), { code: 'KeyD', level: 2, hold: ['Backslash'] });
  assert.deepEqual(neo.mod3, ['Backslash', 'CapsLock']);
  assert.deepEqual(nq.mod4, ['IntlBackslash', 'AltRight']);
});

test('the server knows every layout id (TypingwarriorsModule.LAYOUTS)', () => {
  const java = readFileSync(join(here, '../../../../server/src/main/java/net/slop/freegames/games/typingwarriors/TypingwarriorsModule.java'), 'utf8');
  const list = /LAYOUTS = List\.of\(([^)]*)\)/.exec(java)?.[1];
  assert.ok(list);
  const ids = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, LAYOUTS.map((l) => l.id));
  const max = Number(/LAYOUT_MAX = (\d+)/.exec(java)?.[1]);
  for (const id of ids) assert.ok(id.length <= max, id);
});

test('the committed data is what tools/gen-layouts.mjs generates (needs xkbcomp and keysymdef.h)', (t) => {
  const gen = join(here, '../tools/gen-layouts.mjs');
  if (!existsSync('/usr/include/X11/keysymdef.h') || spawnSync('xkbcomp', ['-help']).error) {
    t.skip('xkbcomp or keysymdef.h missing');
    return;
  }
  const r = spawnSync(process.execPath, [gen, '--check'], { encoding: 'utf8' });
  if (r.status !== 0 && /curl/.test(r.stderr)) {
    t.skip('the Mine file could not be downloaded');
    return;
  }
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /21 layouts: src\/layouts\.data\.ts is up to date/);
  // the header names what it was generated from
  const head = readFileSync(join(here, '../src/layouts.data.ts'), 'utf8').split('\n')[1];
  const version = execFileSync('sh', ['-c', 'rpm -q xkeyboard-config 2>/dev/null || echo unknown']).toString().trim();
  if (version !== 'unknown') assert.ok(head.includes(version), head);
});
