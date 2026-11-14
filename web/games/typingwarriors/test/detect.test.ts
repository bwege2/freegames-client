// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// What the game sees of the layout: a key press (KeyboardEvent.code and .key) fits a layout or not; of two layouts
// it says which one typed it, and a key both type the same decides nothing; the detector over the last keys names
// every layout they fit and never one a key does not fit; keys without a code (a phone) say nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEAD, LAYOUTS, LayoutDetector, fits, layoutById, whichOf, type Key, type Layout } from '../src/layouts.ts';

const L = (id: string): Layout => layoutById(id)!;
/** the keydown events of typing a text with a layout */
const typed = (l: Layout, text: string): Key[] => [...text].map((char) => ({ char, code: l.where.get(char)!.code }));
/** every key press a layout can make: each character key on each level */
const presses = (l: Layout): Key[] => Object.entries(l.keys).flatMap(([code, chars]) =>
  chars.filter((c) => c && !c.startsWith(DEAD)).map((char) => ({ code, char })));
const ids = (ls: Layout[]) => ls.map((l) => l.id);

test('fits: a key fits a layout when that key types that character on one of its levels', () => {
  const de = L('qwertz'), us = L('qwerty'), neo = L('neo2');
  assert.equal(fits(de, { code: 'KeyY', char: 'z' }), true);
  assert.equal(fits(de, { code: 'KeyY', char: 'Z' }), true); // Shift
  assert.equal(fits(de, { code: 'KeyQ', char: '@' }), true); // AltGr
  assert.equal(fits(de, { code: 'KeyY', char: 'y' }), false);
  assert.equal(fits(us, { code: 'KeyY', char: 'y' }), true);
  assert.equal(fits(neo, { code: 'KeyD', char: 'a' }), true);
  assert.equal(fits(neo, { code: 'KeyD', char: '{' }), true); // Mod3
  assert.equal(fits(de, { code: 'KeyD', char: 'a' }), false);
  // nothing to go by: no code (a phone, an input method), or a key the data does not cover
  assert.equal(fits(de, { code: '', char: 'a' }), null);
  assert.equal(fits(de, { code: 'Numpad1', char: '1' }), null);
  assert.equal(fits(de, { code: 'Space', char: ' ' }), null);
  assert.equal(fits(de, { code: 'Space', char: 'x' }), false);
  // every key press a layout makes fits it
  for (const l of LAYOUTS) for (const k of presses(l)) assert.equal(fits(l, k), true, `${l.id} ${k.code} ${k.char}`);
});

test('of two layouts: the one whose key it is; a key both type the same decides nothing', () => {
  const de = L('qwertz'), us = L('qwerty');
  assert.equal(whichOf(de, us, { code: 'KeyY', char: 'z' }), 'a');
  assert.equal(whichOf(de, us, { code: 'KeyY', char: 'y' }), 'b');
  assert.equal(whichOf(de, us, { code: 'KeyZ', char: 'y' }), 'a');
  assert.equal(whichOf(de, us, { code: 'KeyA', char: 'a' }), 'both');
  assert.equal(whichOf(de, us, { code: 'KeyQ', char: 'ä' }), 'neither');
  assert.equal(whichOf(de, us, { code: '', char: 'z' }), 'unknown');
  const neo = L('neo2'), nq = L('neoqwertz');
  assert.equal(whichOf(neo, nq, { code: 'KeyF', char: 'e' }), 'a');
  assert.equal(whichOf(neo, nq, { code: 'KeyE', char: 'e' }), 'b');
  // Mod3 + D is { on both: nothing to tell
  assert.equal(whichOf(neo, nq, { code: 'KeyD', char: '{' }), 'both');
  // # on QWERTZ is Neo's Mod3 key, < its Mod4 key: a character from them is not Neo
  assert.equal(fits(neo, { code: 'Backslash', char: '#' }), false);
  assert.equal(fits(neo, { code: 'IntlBackslash', char: '<' }), false);
  assert.equal(whichOf(de, neo, { code: 'Backslash', char: '#' }), 'a');
  // for every pair: 'a' only when it fits a and not b, 'both' only when it fits both
  for (const a of LAYOUTS) {
    for (const b of LAYOUTS) {
      for (const k of [...presses(a), ...presses(b)]) {
        const w = whichOf(a, b, k), fa = fits(a, k), fb = fits(b, k);
        assert.equal(w, fa && fb ? 'both' : fa ? 'a' : fb ? 'b' : 'neither', `${a.id}/${b.id} ${k.code} ${k.char}`);
      }
    }
  }
});

test('the detector names every layout the keys fit: QWERTZ typing fits QWERTZ, NeoQwertz and the Swiss layout', () => {
  const d = new LayoutDetector();
  assert.equal(d.candidates().length, LAYOUTS.length, 'before the first key: all of them');
  assert.equal(d.verdict(L('qwertz')), 'open');
  for (const k of typed(L('qwertz'), 'zwei zebras')) d.add(k);
  assert.equal(d.seen, 10, 'the space says nothing');
  const c = ids(d.candidates());
  assert.ok(c.includes('qwertz') && c.includes('neoqwertz') && c.includes('qwertz-ch'), c.join());
  assert.ok(!c.includes('qwerty') && !c.includes('neo2') && !c.includes('dvorak'), c.join());
  assert.equal(d.verdict(L('qwertz')), 'yes');
  assert.equal(d.verdict(L('qwerty')), 'no');
  assert.equal(d.verdict(L('neo2')), 'no');
});

test('keys that fit both layouts do not decide between them', () => {
  const d = new LayoutDetector();
  // a s d f j k l: the same keys on QWERTZ and QWERTY
  for (const k of typed(L('qwertz'), 'falls das klappt')) d.add(k);
  const c = ids(d.candidates());
  assert.ok(c.includes('qwertz') && c.includes('qwerty') && c.includes('qwerty-uk'), c.join());
  assert.equal(d.verdict(L('qwertz')), 'yes');
  assert.equal(d.verdict(L('qwerty')), 'yes');
  // one Z decides
  d.add({ code: 'KeyY', char: 'z' });
  assert.ok(ids(d.candidates()).includes('qwertz'));
  assert.ok(!ids(d.candidates()).includes('qwerty'));
});

test('the detector never claims a layout for a key that does not fit it', () => {
  for (const by of LAYOUTS) {
    for (const k of presses(by)) {
      const d = new LayoutDetector();
      d.add(k);
      d.add(k);
      d.add(k);
      for (const l of LAYOUTS) {
        if (fits(l, k) !== false) continue;
        assert.ok(!d.candidates().includes(l), `${k.code} ${k.char} (${by.id}) is not ${l.id}`);
        assert.notEqual(d.verdict(l), 'yes', `${k.code} ${k.char} (${by.id}): ${l.id}`);
      }
    }
  }
});

test('the detector: a window of 12 keys; one miss among many is open, two say no; keys without a code say nothing', () => {
  const de = L('qwertz'), us = L('qwerty');
  const d = new LayoutDetector();
  for (const k of typed(us, 'yay')) d.add(k);
  assert.equal(d.verdict(de), 'no', 'three keys, two of them no Z of QWERTZ');
  d.reset();
  assert.equal(d.seen, 0);
  for (const k of typed(de, 'hallo')) d.add(k);
  d.add({ code: 'KeyZ', char: 'z' }); // one stray key of QWERTY
  assert.equal(d.verdict(de), 'open');
  d.add({ code: 'KeyZ', char: 'z' });
  assert.equal(d.verdict(de), 'no');
  // after 12 more keys of QWERTZ, the QWERTY keys have left the window
  for (const k of typed(de, 'hallo wiese hallo')) d.add(k);
  assert.equal(d.seen, LayoutDetector.WINDOW);
  assert.equal(d.verdict(de), 'yes');
  // a phone sends no code, an input method a whole word: not counted
  const p = new LayoutDetector();
  for (const char of 'zzzzz') p.add({ code: '', char });
  p.add({ code: 'KeyA', char: 'abc' });
  p.add({ code: 'Numpad5', char: '5' });
  assert.equal(p.seen, 0);
  assert.equal(p.candidates().length, LAYOUTS.length);
});
