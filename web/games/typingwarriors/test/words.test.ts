// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The word lists exist twice, src/words.ts for the practice area and Words.java for the server's rounds: they are
// the same, word for word and in the same order; English is a to z, German adds ä ö ü ß; no word twice.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORDS_DE, WORDS_EN, someWords, wordsOf } from '../src/words.ts';

const here = dirname(fileURLToPath(import.meta.url));
const java = readFileSync(join(here, '../../../../server/src/main/java/net/slop/freegames/games/typingwarriors/Words.java'), 'utf8');
const javaList = (name: string): string[] => {
  const m = new RegExp(`static final String\\[\\] ${name} = split\\("""([^]*?)"""\\);`).exec(java);
  assert.ok(m, name);
  return m[1].trim().split(/\s+/);
};

test('Words.java and src/words.ts: the same words in the same order', () => {
  assert.deepEqual(javaList('EN'), WORDS_EN);
  assert.deepEqual(javaList('DE'), WORDS_DE);
  assert.equal(wordsOf('en'), WORDS_EN);
  assert.equal(wordsOf('de'), WORDS_DE);
});

test('the lists: lower case, English a to z, German with ä ö ü ß, no word twice, long enough for a round', () => {
  for (const w of WORDS_EN) assert.match(w, /^[a-z]+$/, w);
  for (const w of WORDS_DE) assert.match(w, /^[a-zäöüß]+$/, w);
  assert.equal(new Set(WORDS_EN).size, WORDS_EN.length);
  assert.equal(new Set(WORDS_DE).size, WORDS_DE.length);
  assert.ok(WORDS_EN.length >= 400 && WORDS_DE.length >= 400, `${WORDS_EN.length} / ${WORDS_DE.length}`);
  // Word Loot needs ten different first letters among its words of 3 to 8 letters
  for (const list of [WORDS_EN, WORDS_DE]) assert.ok(new Set(list.filter((w) => w.length >= 3 && w.length <= 8).map((w) => w[0])).size >= 10);
  // the longest words (Last One Typing's late waves take them; TypingwarriorsModuleTest checks the waves)
  assert.equal(Math.max(...WORDS_EN.map((w) => w.length)), 9);
  assert.equal(Math.max(...WORDS_DE.map((w) => w.length)), 11);
});

test('someWords: n words of the list, never one twice in a row', () => {
  let s = 7;
  const rnd = () => ((s = (s * 48271) % 2147483647) / 2147483647);
  const w = someWords(WORDS_EN, 500, rnd);
  assert.equal(w.length, 500);
  for (let i = 1; i < w.length; i++) assert.notEqual(w[i], w[i - 1]);
  for (const x of w) assert.ok(WORDS_EN.includes(x));
  assert.deepEqual(someWords([], 3), []);
  assert.deepEqual(someWords(['a'], 3), ['a', 'a', 'a']);
});
