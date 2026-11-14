// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The course of a layout: lessons that build up key by key, the home row first (the index fingers'
// keys, then outwards), then the upper and the lower row, the remaining letters, capitals,
// punctuation, digits and, where the layout has them, levels 3 and 4. The course is built from the
// layout's data, so every layout gets the same course with its own characters.
import { DEAD, ROWS, type Layout } from './layouts.ts';
import { someWords, wordsOf } from './words.ts';

export interface Lesson {
  /** its number in the course, from 0 (kept in the profile) */
  index: number;
  /** the section it belongs to, for the course page's headings */
  section: 'home' | 'top' | 'bottom' | 'more' | 'shift' | 'symbols' | 'digits' | 'level3' | 'level4' | 'words';
  kind: 'keys' | 'review' | 'words';
  /** the characters it introduces */
  fresh: string[];
  /** every character known by the end of it */
  known: string[];
}

const isChar = (c: string | undefined): c is string => !!c && !c.startsWith(DEAD) && c.length === 1;
const isLetter = (c: string): boolean => c.toLowerCase() !== c.toUpperCase();

/** pairs of keys, index fingers first, as positions in a row of ten */
const PAIRS = [[3, 6], [2, 7], [1, 8], [0, 9], [4, 5]];

export function courseOf(l: Layout): Lesson[] {
  const out: Lesson[] = [];
  const known: string[] = [];
  const add = (section: Lesson['section'], kind: Lesson['kind'], fresh: string[]) => {
    const f = fresh.filter((c) => !known.includes(c));
    if (kind === 'keys' && !f.length) return;
    known.push(...f);
    out.push({ index: out.length, section, kind, fresh: f, known: [...known] });
  };
  const level = (code: string, n: number) => l.keys[code]?.[n];

  const rows: [Lesson['section'], string[]][] = [['home', ROWS[2]], ['top', ROWS[1]], ['bottom', ROWS[3]]];
  for (const [section, row] of rows) {
    const before = out.length;
    for (const pair of PAIRS) add(section, 'keys', pair.map((i) => level(row[i], 0)).filter(isChar));
    if (out.length > before) add(section, 'review', []);
  }
  // what is left on level 1: the keys beside the ten columns (German: ü ö ä ß) and the outer keys
  const rest: string[] = [];
  for (const code of [...ROWS[2].slice(10), ...ROWS[1].slice(10), 'Backslash', 'IntlBackslash', 'Minus', 'Equal', 'Backquote']) {
    const c = level(code, 0);
    if (isChar(c) && !known.includes(c)) rest.push(c);
  }
  const restLetters = rest.filter(isLetter), restOther = rest.filter((c) => !isLetter(c));
  for (let i = 0; i < restLetters.length; i += 2) add('more', 'keys', restLetters.slice(i, i + 2));
  // capitals: the letters known so far, by Shift
  const capitals = known.filter(isLetter).map((c) => l.keys[l.where.get(c)!.code]?.[1]).filter(isChar).filter((c) => isLetter(c));
  for (let i = 0; i < capitals.length; i += 10) add('shift', 'keys', capitals.slice(i, i + 10));
  // punctuation of levels 1 and 2
  const marks: string[] = [...restOther];
  for (const row of ROWS) {
    for (const code of [...row, 'Backslash', 'IntlBackslash']) {
      for (const n of [0, 1]) {
        const c = level(code, n);
        if (isChar(c) && !isLetter(c) && !/[0-9]/.test(c) && !known.includes(c) && !marks.includes(c)) marks.push(c);
      }
    }
  }
  const common = '.,;:!?-\'"()/';
  marks.sort((a, b) => (common.includes(a) ? common.indexOf(a) : 99) - (common.includes(b) ? common.indexOf(b) : 99));
  for (let i = 0; i < Math.min(marks.length, 16); i += 4) add('symbols', 'keys', marks.slice(i, i + 4));
  // digits, wherever the layout has them on levels 1 and 2
  const digits = '1234567890'.split('').filter((d) => (l.where.get(d)?.level ?? 9) <= 1);
  for (let i = 0; i < digits.length; i += 5) add('digits', 'keys', digits.slice(i, i + 5));
  // levels 3 and 4 of the Neo family: brackets and signs under the home position, the number block
  if (l.family === 'neo') {
    for (const [section, n] of [['level3', 2], ['level4', 3]] as const) {
      for (const row of [ROWS[2], ROWS[1], ROWS[3]]) {
        const cs = row.map((code) => level(code, n)).filter(isChar).filter((c) => !known.includes(c) && l.where.get(c)?.level === n);
        for (let i = 0; i < cs.length; i += 5) add(section, 'keys', cs.slice(i, i + 5));
      }
    }
  }
  add('words', 'words', []);
  add('words', 'words', []);
  return out;
}

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** the words of a language that need only these characters */
function wordsFrom(lang: 'en' | 'de', known: string[], must: string[] = []): string[] {
  const set = new Set(known);
  return wordsOf(lang).filter((w) => [...w].every((c) => set.has(c)) && (!must.length || must.some((c) => w.includes(c))));
}

function line(parts: string[], max = 38): string {
  let s = '';
  for (const p of parts) {
    if (s.length + p.length + 1 > max) break;
    s += (s ? ' ' : '') + p;
  }
  return s;
}

/** groups of two to four characters, the fresh ones in most of them */
function groups(fresh: string[], known: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    let g = '';
    const len = 2 + Math.floor(Math.random() * 3);
    for (let k = 0; k < len; k++) g += Math.random() < 0.6 && fresh.length ? pick(fresh) : pick(known);
    out.push(g);
  }
  return out;
}

/**
 * The lines of one run of a lesson. A key lesson: the new keys alone, then mixed with the known
 * ones, then words made of known characters when the language has enough of them. A review: groups
 * and words of everything so far. The word lessons: plain words.
 */
export function linesOf(lesson: Lesson, lang: 'en' | 'de'): string[] {
  const { fresh, known } = lesson;
  const lower = known.filter((c) => isLetter(c) && c === c.toLowerCase());
  if (lesson.kind === 'words') {
    const words = wordsFrom(lang, known);
    const list = words.length >= 20 ? words : wordsOf(lang);
    return [0, 1, 2, 3, 4].map(() => line(someWords(list, 12)));
  }
  if (lesson.kind === 'review') {
    const words = wordsFrom(lang, known);
    const out = [line(groups([], lower.length ? lower : known, 12)), line(groups([], lower.length ? lower : known, 12))];
    for (let i = 0; i < 3; i++) out.push(line(words.length >= 8 ? someWords(words, 12) : groups([], known, 12)));
    return out;
  }
  const out: string[] = [];
  // 1: the new keys by themselves
  const solo: string[] = [];
  for (const c of fresh) solo.push(c.repeat(3));
  for (let i = 0; i < 8; i++) solo.push(fresh.length > 1 ? pick(fresh) + pick(fresh) + (Math.random() < 0.5 ? pick(fresh) : '') : fresh[0].repeat(2));
  out.push(line(solo));
  const capitals = lesson.section === 'shift';
  const symbols = lesson.section === 'symbols' || lesson.section === 'digits' || lesson.section === 'level3' || lesson.section === 'level4';
  if (capitals) {
    // capitals lead words
    const words = wordsFrom(lang, known.map((c) => c.toLowerCase()));
    const cap = (w: string) => {
      const up = w[0].toUpperCase();
      return known.includes(up) && up.length === 1 ? up + w.slice(1) : w;
    };
    const wanted = words.filter((w) => fresh.includes(w[0].toUpperCase()));
    for (let i = 0; i < 3; i++) out.push(line(someWords(wanted.length >= 6 ? wanted : words, 12).map(cap)));
    return out;
  }
  if (symbols) {
    // signs go with words, as they do in writing
    const words = wordsFrom(lang, lower);
    const list = words.length >= 8 ? words : groups([], lower.length ? lower : known, 20);
    for (let i = 0; i < 3; i++) {
      const parts: string[] = [];
      for (let k = 0; k < 10; k++) {
        const c = pick(fresh);
        const w = pick(list);
        parts.push(/[0-9]/.test(c) ? `${c}${pick(fresh)} ${w}` : '([{<'.includes(c) ? `${c}${w}` : `${w}${c}`);
      }
      out.push(line(parts));
    }
    return out;
  }
  // 2: mixed with what is known
  out.push(line(groups(fresh, known, 12)));
  // 3 and 4: words with the new keys, or more groups
  const words = wordsFrom(lang, known, fresh);
  const all = wordsFrom(lang, known);
  out.push(line(words.length >= 5 ? someWords(words, 12) : groups(fresh, known, 12)));
  out.push(line(all.length >= 8 ? someWords(all, 12) : groups(fresh, known, 12)));
  return out;
}

/** words a minute from correct characters and ms */
export const wpmOf = (chars: number, ms: number): number => (ms < 500 ? 0 : chars / 5 / (ms / 60000));

/** What a finished run of a lesson shows: words a minute, accuracy (correct keys of all keys), stars. */
export function lessonResult(chars: number, errors: number, ms: number): { wpm: number; accuracy: number; stars: number } {
  const wpm = wpmOf(chars, ms), accuracy = chars / (chars + errors);
  return { wpm, accuracy, stars: starsFor(accuracy, wpm) };
}

/** Stars of a run: by accuracy, and the fifth for speed as well. */
export function starsFor(accuracy: number, wpm: number): number {
  if (accuracy >= 0.98 && wpm >= 20) return 5;
  if (accuracy >= 0.95) return 4;
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.8) return 2;
  return 1;
}
