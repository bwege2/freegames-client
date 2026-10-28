// The construction set (EDIT.S, WIRE.S, DISK.S, and RUN2.S from the disk menu) against the original.
//
// test/golden/editor-*.txt.gz were recorded (record-editor.ts) by running Bill Budge's listings in
// the test's 6502 machine from EDIT.S START, steered by a robot that moves the joystick, presses the
// buttons and types keys from what it reads of the cursor in RAM (robot.ts), through the sessions of
// editor-sessions.ts: parts out of the box, moved and deleted; corners dragged, cut and added; paint;
// the world settings; the magnifier; play; the wiring kit; the disk menu (save, load, a missing file,
// play game, quit). Each WAIT has the cursor and a hash of all RAM below $B000 but the stack; the
// files left on the disk follow. The port must give the same lines; with re/pinball/orig present the
// original is run live as well and must still give them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { ORIG } from './apple2.ts';
import { editorLines, runOriginal, runPort } from './editor.ts';
import { SESSIONS } from './editor-sessions.ts';

const golden = join(import.meta.dirname, 'golden');
const live = existsSync(ORIG);

function same(got: string[], want: string[], who: string): void {
  for (let i = 0; i < Math.min(got.length, want.length); i++) {
    if (got[i] !== want[i]) assert.fail(`${who}, line ${i + 1}:\n  original: ${want[i].slice(0, 240)}\n  ${who}: ${got[i].slice(0, 240)}`);
  }
  assert.equal(got.length, want.length, `${who}: as many lines`);
}

for (const s of SESSIONS) {
  test(`the original's construction set: ${s.name}`, () => {
    const want = gunzipSync(readFileSync(join(golden, `editor-${s.name}.txt.gz`))).toString('utf8').trimEnd().split('\n');
    same(editorLines(runPort(s)), want, 'port');
    if (live) same(editorLines(runOriginal(s)), want, 'original (live)');
  });
}

test('the sessions use every tool of the kit, and a game is left by Esc', () => {
  const all = JSON.stringify(SESSIONS.map((s) => s.acts));
  // the kit's tool column (x 262): hand, arrow, scissors, hammer, brush, the five colours, play,
  // magnifier, world, wiring, disk
  for (const y of [7, 19, 31, 45, 57, 68, 78, 88, 98, 108, 120, 135, 149, 163, 177]) assert.ok(all.includes(`{"to":[262,${y}]}`), `tool at y ${y}`);
  const disk = SESSIONS.find((s) => s.name === 'disk')!;
  assert.ok(disk.acts.some((a) => 'key' in a && a.key === 0x9b), 'Esc out of a game');
});
