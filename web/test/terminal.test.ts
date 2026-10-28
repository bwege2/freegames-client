// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The terminals' buffer logic without a DOM: printing, wrapping, scrolling, cursor addressing,
// attributes, line editing, key sequences; and the pixel screen's scaling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TeletypeBuffer, TextGrid, LineEditor, keyInput, REVERSE, BOLD, CURSOR } from '../src/sdk/terminal.ts';
import { fitScale } from '../src/sdk/screen.ts';

type Mods = Partial<{ ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean; altGraph: boolean; mac: boolean }>;
const key = (k: string, mods: Mods = {}) => {
  const { altGraph, mac, ...m } = mods;
  return keyInput({ key: k, code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...m, getModifierState: (s) => s === 'AltGraph' && !!altGraph }, { mac: !!mac });
};

test('teletype: lines, hard wrap, carriage return, backspace, tabs', () => {
  const t = new TeletypeBuffer(10);
  t.write('HELLO\nWORLD');
  assert.deepEqual(t.lines, ['HELLO', 'WORLD']);
  t.write('\n' + 'X'.repeat(25));
  assert.deepEqual(t.lines.slice(2), ['XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXX']);
  const u = new TeletypeBuffer(20);
  u.write('ABC\rX');
  assert.equal(u.lines[0], 'XBC', 'CR prints over the line');
  u.write('\nAB\bC');
  assert.equal(u.lines[1], 'AC');
  u.write('\nA\tB');
  assert.equal(u.lines[2], 'A       B');
  u.write('\n\x01\x7fok');
  assert.equal(u.lines[3], 'ok', 'other control characters print nothing');
});

test('teletype: scrollback limit and dirty tracking', () => {
  const t = new TeletypeBuffer(10, 3);
  t.takeDirty();
  t.write('1\n2\n3\n4\n5');
  assert.deepEqual(t.lines, ['3', '4', '5']);
  const d = t.takeDirty();
  assert.equal(d.dropped, 2);
  assert.equal(d.from, 0);
  t.write('!');
  assert.deepEqual(t.takeDirty(), { dropped: 0, from: 2 }, 'only the last line changed');
  let bells = 0;
  t.onBell = () => bells++;
  t.write('\x07\x07');
  assert.equal(bells, 2);
});

test('grid: cursor addressing, wrapping, scrolling, clearing', () => {
  const g = new TextGrid(10, 3, { scroll: true });
  g.writeAt(1, 2, 'hi');
  assert.equal(g.rowText(1), '  hi      ');
  assert.deepEqual([g.row, g.col], [1, 4]);
  g.writeAt(0, 8, 'abcd');
  assert.equal(g.rowText(0).slice(8), 'ab');
  assert.equal(g.rowText(1).slice(0, 2), 'cd', 'wraps to the next row');
  g.moveTo(1, 3);
  g.clearToEol();
  assert.equal(g.rowText(1), 'cdh       ');
  g.writeAt(2, 0, 'last\nnew');
  assert.equal(g.rowText(2), 'new       ', 'a newline on the last row scrolls up');
  assert.equal(g.rowText(1), 'last      ');
  g.moveTo(1, 2);
  g.clearToBottom();
  assert.equal(g.rowText(1), 'la        ');
  assert.equal(g.rowText(2), '          ');
  g.clear();
  assert.deepEqual([g.row, g.col, g.rowText(0)], [0, 0, '          ']);
  g.moveTo(99, -5);
  assert.deepEqual([g.row, g.col], [2, 0], 'moves are clamped');
});

test('grid: curses semantics without scrolling (the default)', () => {
  const g = new TextGrid(10, 3);
  g.writeAt(2, 0, 'bottom');
  g.writeAt(2, 9, 'X');
  assert.equal(g.rowText(2), 'bottom   X', 'the bottom-right cell is written');
  assert.deepEqual([g.row, g.col], [2, 9], 'and the cursor stays there: no scroll');
  g.writeAt(0, 0, 'top');
  g.writeAt(2, 0, '\nmore');
  assert.equal(g.rowText(0), 'top       ', 'a newline on the last row does not scroll');
  assert.equal(g.rowText(2).slice(0, 4), 'more');
  g.writeAt(0, 8, 'abc');
  assert.equal(g.rowText(1).slice(0, 1), 'c', 'the end of a row still wraps to the next');
  let changes = 0;
  g.onChange = () => changes++;
  g.writeAt(1, 1, 'z');
  g.clearToEol();
  assert.ok(changes >= 3, 'every change is reported (TextScreen redraws on it)');
  const snap = g.snapshot();
  g.clear();
  g.restore(snap);
  assert.equal(g.rowText(2).slice(0, 4), 'more', 'snapshot and restore');
  assert.deepEqual([g.row, g.col], [snap.row, snap.col]);
});

test('grid: attributes and runs', () => {
  const g = new TextGrid(8, 2);
  g.write('ab');
  g.attr = REVERSE;
  g.write('CD');
  g.attr = BOLD | REVERSE;
  g.write('e');
  g.attr = 0;
  assert.deepEqual(g.runs(0), [{ text: 'ab', attr: 0 }, { text: 'CD', attr: REVERSE }, { text: 'e', attr: BOLD | REVERSE }, { text: '   ', attr: 0 }]);
  g.moveTo(0, 1);
  assert.deepEqual(g.runs(0, true).slice(0, 3), [{ text: 'a', attr: 0 }, { text: 'b', attr: CURSOR }, { text: 'CD', attr: REVERSE }]);
  assert.equal(g.attrAt(0, 2), REVERSE);
  g.dirty.clear();
  g.writeAt(1, 0, 'x');
  assert.deepEqual([...g.dirty], [1]);
});

test('line editor', () => {
  const e = new LineEditor(5, (s) => s.toUpperCase());
  for (const k of ['g', 'o', ' ', 'n']) assert.equal(e.key(key(k)!), null);
  assert.equal(e.text, 'GO N');
  e.key(key('Backspace')!);
  e.type('orthward');
  assert.equal(e.text, 'GO OR', 'at most 5 characters');
  e.key(key('u', { ctrlKey: true })!);
  assert.equal(e.text, '');
  e.type('a\tb\u0007');
  assert.equal(e.key(key('Enter')!), 'AB');
});

test('key sequences', () => {
  assert.equal(key('a')!.seq, 'a');
  assert.equal(key('A', { shiftKey: true })!.seq, 'A');
  assert.equal(key('r', { ctrlKey: true })!.seq, '\x12');
  assert.equal(key('[', { ctrlKey: true })!.seq, '\x1b');
  assert.equal(key('Enter')!.seq, '\r');
  assert.equal(key('Backspace')!.seq, '\x7f');
  assert.equal(key('Escape')!.seq, '\x1b');
  assert.equal(key('ArrowUp')!.seq, '\x1b[A');
  assert.equal(key('x', { altKey: true })!.seq, '\x1bx');
  assert.equal(key('F1')!.seq, '\x1bOP');
  assert.equal(key('Shift'), null);
  assert.equal(key('F5'), null);
  assert.equal(key('Tab', { shiftKey: true })!.seq, '\x1b[Z');
  // AltGr: Windows reports Ctrl+Alt; Linux has the AltGraph state: the character, not a control key
  assert.equal(key('@', { ctrlKey: true, altKey: true })!.seq, '@');
  assert.equal(key('\\', { ctrlKey: true, altKey: true })!.seq, '\\');
  assert.equal(key('€', { altGraph: true, ctrlKey: true, altKey: true })!.seq, '€');
  assert.equal(key('x', { ctrlKey: true, altKey: true })!.seq, '\x1b\x18', 'Ctrl+Alt+letter stays a meta control key');
  // macOS Option types characters
  assert.equal(key('@', { altKey: true, mac: true })!.seq, '@');
  assert.equal(key('x', { altKey: true })!.seq, '\x1bx', 'Alt elsewhere is meta');
});

test('pixel screen scaling', () => {
  assert.deepEqual(fitScale(1100, 700, 280, 192), { scale: 3, cssWidth: 840, cssHeight: 576 }, 'whole numbers when it fits');
  const small = fitScale(200, 150, 280, 192);
  assert.ok(small.scale < 1 && small.cssWidth <= 200 && small.cssHeight <= 150, 'best fit when it does not');
  const wide = fitScale(1000, 1000, 160, 200, 2); // C64 multicolour: double-wide pixels
  assert.deepEqual(wide, { scale: 3, cssWidth: 960, cssHeight: 600 });
});
