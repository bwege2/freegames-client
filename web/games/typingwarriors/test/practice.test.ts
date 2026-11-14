// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The practice area: the course of QWERTY and Neo 2 starts with the home row's index-finger keys and ends with two
// lessons of words, in the README's order; every layout's course teaches only what it can type, a lesson's lines use
// only the characters known by then; a run's result (words a minute, accuracy, one to five stars) is computed as the
// README says; the profile keeps the best run of a lesson.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUTS, layoutById, type Layout } from '../src/layouts.ts';
import { courseOf, lessonResult, linesOf, starsFor, wpmOf, type Lesson } from '../src/lessons.ts';
import { lessonDone, recordLesson, recordSwitch, type Profile } from '../src/profile.ts';

const L = (id: string): Layout => layoutById(id)!;
const ORDER: Lesson['section'][] = ['home', 'top', 'bottom', 'more', 'shift', 'symbols', 'digits', 'level3', 'level4', 'words'];

/** Math.random, seeded (the lines are drawn at random) */
function seeded<T>(seed: number, f: () => T): T {
  const saved = Math.random;
  let s = seed >>> 0;
  Math.random = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  try {
    return f();
  } finally {
    Math.random = saved;
  }
}

test('QWERTY: the home row from the index fingers outwards, the upper and lower row, ..., two lessons of words', () => {
  const c = courseOf(L('qwerty'));
  assert.deepEqual(c.slice(0, 6).map((l) => l.fresh.join('')), ['fj', 'dk', 'sl', 'a;', 'gh', '']);
  assert.deepEqual(c.slice(0, 6).map((l) => l.section), ['home', 'home', 'home', 'home', 'home', 'home']);
  assert.equal(c[5].kind, 'review');
  assert.deepEqual(c.slice(6, 11).map((l) => l.fresh.join('')), ['ru', 'ei', 'wo', 'qp', 'ty']);
  assert.deepEqual(c.slice(12, 17).map((l) => l.fresh.join('')), ['vm', 'c,', 'x.', 'z/', 'bn']);
  assert.deepEqual(c.slice(-2).map((l) => [l.section, l.kind]), [['words', 'words'], ['words', 'words']]);
  assert.equal(c.length, 29);
  assert.ok(c.some((l) => l.section === 'shift') && c.some((l) => l.section === 'digits'));
  assert.ok(!c.some((l) => l.section === 'level3'), 'no levels 3 and 4 outside the Neo family');
});

test('Neo 2: the home row (e n, a r, i t, u d, o s), ..., levels 3 and 4, two lessons of words', () => {
  const c = courseOf(L('neo2'));
  assert.deepEqual(c.slice(0, 5).map((l) => l.fresh.join('')), ['en', 'ar', 'it', 'ud', 'os']);
  assert.equal(c[5].kind, 'review');
  assert.deepEqual(c.find((l) => l.section === 'more')?.fresh, ['y', 'ß']);
  assert.ok(c.some((l) => l.section === 'level3') && c.some((l) => l.section === 'level4'));
  assert.deepEqual(c.find((l) => l.section === 'level3')?.fresh, ['\\', '/', '{', '}', '*']);
  assert.deepEqual(c.slice(-2).map((l) => l.kind), ['words', 'words']);
  assert.equal(c.length, 39);
});

test('every layout\'s course: sections in order, new keys each time, only what the layout types', () => {
  for (const l of LAYOUTS) {
    const c = courseOf(l);
    assert.equal(c[0].section, 'home', l.id);
    assert.equal(c[0].fresh.length, 2, `${l.id}: the two index fingers first`);
    assert.deepEqual(c.slice(-2).map((x) => x.kind), ['words', 'words'], l.id);
    const known = new Set<string>();
    c.forEach((x, i) => {
      assert.equal(x.index, i, l.id);
      if (i) assert.ok(ORDER.indexOf(x.section) >= ORDER.indexOf(c[i - 1].section), `${l.id}: ${c[i - 1].section} before ${x.section}`);
      if (x.kind === 'keys') assert.ok(x.fresh.length >= 1 && x.fresh.length <= 10, `${l.id} ${i}`);
      else assert.deepEqual(x.fresh, [], `${l.id} ${i}`);
      for (const ch of x.fresh) {
        assert.ok(!known.has(ch), `${l.id}: ${ch} taught twice`);
        assert.ok(l.where.has(ch), `${l.id} types ${ch}`);
        known.add(ch);
      }
      assert.deepEqual(x.known, [...known], `${l.id} ${i}`);
    });
    // every lower-case letter of the alphabet is taught
    for (const ch of 'abcdefghijklmnopqrstuvwxyz') assert.ok(known.has(ch), `${l.id} teaches ${ch}`);
  }
});

test('a lesson\'s lines: four or five, at most 38 characters, made of the characters known by then', () => {
  for (const l of LAYOUTS) {
    for (const lang of ['en', 'de'] as const) {
      courseOf(l).forEach((lesson, i) => {
        const lines = seeded(i * 31 + lang.length, () => linesOf(lesson, lang));
        assert.ok(lines.length === 4 || lines.length === 5, `${l.id} ${lang} ${i}: ${lines.length} lines`);
        const allowed = new Set([...lesson.known, ' ']);
        for (const line of lines) {
          assert.ok(line.length > 0 && line.length <= 38, `${l.id} ${lang} ${i}: "${line}"`);
          if (lesson.kind === 'words') continue; // plain words: the whole alphabet is known by then (checked below)
          for (const ch of line) assert.ok(allowed.has(ch), `${l.id} ${lang} lesson ${i} (${lesson.section}): "${ch}" in "${line}"`);
        }
        if (lesson.kind === 'words') {
          for (const line of lines) for (const ch of line.replace(/ /g, '')) assert.ok(l.where.has(ch) || lang === 'de', `${l.id}: ${ch}`);
        }
        if (lesson.kind === 'keys' && lesson.section !== 'shift') {
          // the first line: the new keys alone
          for (const ch of lines[0].replace(/ /g, '')) assert.ok(lesson.fresh.includes(ch), `${l.id} ${i}: ${lines[0]}`);
        }
      });
    }
  }
});

test('a run\'s result: words a minute (five characters a word), accuracy (right of all keys), stars', () => {
  assert.equal(wpmOf(100, 60_000), 20);
  assert.equal(wpmOf(250, 30_000), 100);
  assert.equal(wpmOf(10, 499), 0, 'under half a second: no speed');
  let r = lessonResult(200, 0, 60_000);
  assert.deepEqual(r, { wpm: 40, accuracy: 1, stars: 5 });
  r = lessonResult(98, 2, 60_000);
  assert.equal(r.accuracy, 0.98);
  assert.equal(r.wpm, 98 / 5);
  assert.equal(r.stars, 4, '98 % but under 20 words a minute');
  r = lessonResult(100, 2, 60_000);
  assert.equal(r.stars, 5, '98.04 % at 20 words a minute');
  assert.equal(lessonResult(95, 5, 30_000).stars, 4);
  assert.equal(lessonResult(90, 10, 30_000).stars, 3);
  assert.equal(lessonResult(80, 20, 30_000).stars, 2);
  assert.equal(lessonResult(79, 21, 30_000).stars, 1);
  assert.equal(lessonResult(1, 99, 30_000).stars, 1);
  // the thresholds of the README: 2 from 80 %, 3 from 90 %, 4 from 95 %, 5 from 98 % at 20 wpm or more
  assert.deepEqual([0, 0.5, 0.79, 0.8, 0.89, 0.9, 0.94, 0.95, 0.979, 0.98, 1].map((a) => starsFor(a, 25)), [1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  assert.deepEqual([0, 10, 19.9, 20, 200].map((w) => starsFor(1, w)), [4, 4, 4, 5, 5]);
  for (let a = 0; a <= 1; a += 0.01) for (const w of [0, 15, 20, 60]) {
    const s = starsFor(a, w);
    assert.ok(s >= 1 && s <= 5);
  }
});

test('the profile keeps a lesson\'s best run (stars, then speed) and counts the runs; switching times per direction', () => {
  const p: Profile = { layout: 'qwerty', layout2: 'neo2', lang: 'en', uiLang: '', helper: true, trustLayout: false, sound: true,
    lessons: [], ratings: [], history: [], switchStats: [] };
  recordLesson(p, 'qwerty', 3, 3, 30.4, 0.912);
  recordLesson(p, 'qwerty', 3, 2, 50, 0.85);
  assert.deepEqual(lessonDone(p, 'qwerty', 3), { layout: 'qwerty', lesson: 3, stars: 3, wpm: 30, accuracy: 912, runs: 2 });
  recordLesson(p, 'qwerty', 3, 3, 35.6, 0.93);
  assert.deepEqual(lessonDone(p, 'qwerty', 3), { layout: 'qwerty', lesson: 3, stars: 3, wpm: 36, accuracy: 930, runs: 3 });
  recordLesson(p, 'neo2', 3, 5, 20, 1);
  assert.equal(lessonDone(p, 'qwerty', 3)?.stars, 3, 'per layout');
  assert.equal(p.lessons.length, 2);
  recordSwitch(p, 'qwerty', 'neo2', 1500.4);
  recordSwitch(p, 'qwerty', 'neo2', 900);
  recordSwitch(p, 'neo2', 'qwerty', 2000);
  assert.deepEqual(p.switchStats, [
    { from: 'qwerty', to: 'neo2', switches: 2, totalMs: 2400, bestMs: 900 },
    { from: 'neo2', to: 'qwerty', switches: 1, totalMs: 2000, bestMs: 2000 },
  ]);
});
