// Tux, of Math Command: the original lesson files, the math-card generator and the arcade rules.
// The math options and formulas are from src/mathcards.c and the five arcade lesson files; the
// arcade simulation is from src/game.c. The original C program was not built as an oracle (SDL
// dependencies, see NOTES.md); these tests pin the data and the translated behaviour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLesson, generateCard, generateList, type LessonOptions } from '../src/math.ts';
import { ArcadeGame, type Resources } from '../src/arcade.ts';

const assets = join(import.meta.dirname, '..', 'assets');
const levels = ['space_cadet', 'scout', 'ranger', 'ace', 'commando'];
const lessonFile = (name: string) => readFileSync(join(assets, 'missions', 'arcade', name), 'utf8');

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Checks that filling the question mark with answer makes the card's equation true. */
function formulaHolds(formula: string, answer: number): boolean {
  const sides = formula.split(' = ');
  assert.equal(sides.length, 2, formula);
  const tokens = sides[0].split(' ');
  assert.ok(formula.includes('?'), formula);
  const number = (t: string) => t === '?' ? answer : Number(t);
  let value = number(tokens[0]);
  for (let i = 1; i + 1 < tokens.length; i += 2) {
    const op = tokens[i], n = number(tokens[i + 1]);
    value = op === '+' ? value + n : op === '-' ? value - n : op === 'x' ? value * n : value / n;
  }
  // the original evaluates mixed formulas strictly left to right, without parentheses
  const right = sides[1] === '?' ? answer : Number(sides[1]);
  return Math.abs(value - right) < 1e-9;
}

test('the five arcade lesson files keep their operations and ranges', () => {
  const cadet = parseLesson(lessonFile('space_cadet'));
  assert.equal(cadet.addition, true);
  assert.equal(cadet.subtraction, false);
  assert.equal(cadet.maxAugend, 10);
  assert.equal(cadet.maxAnswer, 10);
  const ace = parseLesson(lessonFile('ace'));
  assert.equal(ace.allowNegatives, true);
  assert.equal(ace.minAugend, -20);
  const ranger = parseLesson(lessonFile('ranger'));
  assert.equal(ranger.multiplication, true);
  for (const name of levels) {
    const o = parseLesson(lessonFile(name));
    const cards = generateList(o, seeded(42));
    assert.ok(cards.length >= 1, name);
    for (const c of cards) {
      assert.ok(c.answer >= -999 && c.answer <= 999, `${name}: answer ${c.answer}`);
      if (!o.allowNegatives) assert.ok(c.answer >= 0, `${name}: no negative answer`);
      assert.ok(['+', '-', 'x', '÷'].some((op) => c.formula.includes(op)), `${name}: ${c.formula}`);
    }
  }
});

test('every generated one-operation card has the answer its formula asks for', () => {
  let missingFormats = 0;
  for (const name of levels) {
    const o = parseLesson(lessonFile(name));
    for (const c of generateList(o, seeded(7))) {
      const lhs = c.formula.split(' = ')[0].split(' ');
      // Commando also makes 3- and 4-number formulas; the original evaluates those left to
      // right but writes them without parentheses, so their text does not always match their
      // answer (mathcards.c:1740-1855, a known original quirk).
      if (lhs.length === 3) assert.ok(formulaHolds(c.formula, c.answer), `${c.formula} with answer ${c.answer}`);
      if (!c.formula.endsWith('= ?')) missingFormats++;
    }
  }
  assert.ok(missingFormats > 0, 'the lesson files also produce missing-number cards');
});

test('Commando makes the original\'s three- and four-number formulas', () => {
  const o = parseLesson(lessonFile('commando'));
  const cards = generateList(o, seeded(11));
  const lengths = new Set(cards.map((c) => (c.formula.split(' = ')[0].match(/\d+/g) ?? []).length));
  assert.ok(lengths.has(3), `three-number formulas (${[...lengths].join(',')})`);
  assert.ok(lengths.has(4), `four-number formulas (${[...lengths].join(',')})`);
});

test('the formats put the question mark where the answer was, as reformat_arithmetic does', () => {
  const base = parseLesson(lessonFile('space_cadet'));
  const first: LessonOptions = {
    ...base, formatAnswerLast: false, formatAddLast: false, formatAddMiddle: false, formatAddFirst: true,
  };
  const c = generateCard(first, seeded(1));
  assert.ok(c.formula.startsWith('? + '), c.formula);
  assert.ok(formulaHolds(c.formula, c.answer), c.formula);

  const middle: LessonOptions = {
    ...base, formatAnswerLast: false, formatAddLast: false, formatAddFirst: false, formatAddMiddle: true,
  };
  const m = generateCard(middle, seeded(2));
  assert.match(m.formula, /^\d+ \+ \? = \d+$/, m.formula);
  assert.ok(formulaHolds(m.formula, m.answer), m.formula);
});

class StubRes implements Resources {
  font = 'sans-serif';
  img(path: string): HTMLImageElement {
    const sizes: Record<string, [number, number]> = {
      'images/cities/city-blue.png': [70, 85],
      'images/igloos/intact.png': [101, 68],
      'images/penguins/flapdown.png': [40, 40],
    };
    const [width, height] = sizes[path] ?? [1, 1];
    return { width, height } as HTMLImageElement;
  }
  sound(): void { /* silent */ }
}

test('the arcade game spawns comets, scores a correct answer and ends when the igloos are gone', () => {
  const lesson = parseLesson(lessonFile('space_cadet'));
  let ended: { score: number; wave: number; won: boolean } | null = null;
  const game = new ArcadeGame(null as unknown as CanvasRenderingContext2D, lesson, 0, new StubRes(), {
    onEnd: (r) => { ended = r; },
    onQuit: () => {},
  }, seeded(3));
  for (let i = 0; i < 40; i++) game.update();
  const comets = (game as unknown as { comets: { alive: boolean; card: { answer: number } }[] }).comets;
  const first = comets.find((c) => c.alive);
  assert.ok(first, 'a comet is in the air');
  const answer = String(first.card.answer);
  for (const ch of answer) game.key(ch);
  game.key('Enter');
  assert.ok(game.currentScore > 0, `scored (${game.currentScore})`);
  const cities = (game as unknown as { cities: { hits: number }[] }).cities;
  for (const c of cities) c.hits = 0;
  for (let i = 0; i < 50; i++) game.update();
  assert.ok(ended, 'the game ended');
  assert.ok(game.isOver, 'over');
});
