// The port's 6502 translation against the original 6502 code, frame by frame.
//
// test/golden/*.txt.gz were recorded (record.ts) by running Bill Budge's listings, assembled by
// merlin.ts, in the test's 6502 core (cpu6502.ts, apple2.ts): tables built from the parts library as
// the construction set builds them, balls with start states, the buttons, paddles and keys of each
// scenario (scenarios.ts). Every frame (each WAIT of the main loop) has the balls' states, the hits
// (object, surface angle THETA, direction), the score bytes and digits, the speaker's clicks and a
// hash of all RAM below $B000 but the stack: screen, table, span tables, every part's bytes, the
// players' states. The port (src/, on src/machine.ts) runs the same scenarios and must give the same
// lines. With re/pinball/orig present (re/pinball/fetch.sh) the original is run live as well and must
// still give the recorded lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { ORIG } from './apple2.ts';
import { Port } from './port.ts';
import { runScenario } from './run-scenario.ts';
import { SCENARIOS } from './scenarios.ts';

const golden = join(import.meta.dirname, 'golden');
const live = existsSync(ORIG);

function same(got: string[], want: string[], who: string): void {
  for (let i = 0; i < Math.min(got.length, want.length); i++) {
    if (got[i] !== want[i]) assert.fail(`${who}, frame ${i + 1}:\n  original: ${want[i].slice(0, 240)}\n  ${who}: ${got[i].slice(0, 240)}`);
  }
  assert.equal(got.length, want.length, `${who}: as many frames`);
}

for (const sc of SCENARIOS) {
  test(`the original's frames: ${sc.name}`, async () => {
    const want = gunzipSync(readFileSync(join(golden, `${sc.name}.txt.gz`))).toString('utf8').trimEnd().split('\n');
    same(runScenario(new Port(), sc), want, 'port');
    if (live) {
      const { Original } = await import('./original.ts');
      same(runScenario(new Original(), sc), want, 'original (live)');
    }
  });
}

test('the scenarios cover every part type, the flippers moving and all world settings', () => {
  const parts = new Set<string>();
  for (const sc of SCENARIOS) for (const o of sc.spec.objects) if ('part' in o) parts.add(o.part);
  for (const p of ['LAUNCHER', 'LEFTFLIPPER', 'RIGHTFLIPPER', 'BALL', 'BMP1', 'BMP2', 'BMP3', 'BMP4', 'BMP5', 'BMP6', 'LKICK', 'RKICK', 'KICK1', 'KICK2', 'ROLL1', 'ROLL2', 'ROLL3', 'TARG1', 'TARG2', 'TARG3', 'TARG4', 'TARG5', 'TARG6', 'LFLIPPER2', 'RFLIPPER2', 'POLY', 'POLY1', 'POLY2', 'POLY3', 'POLY4', 'LANE1', 'LANE2', 'LANE3', 'GATE1', 'GATE2', 'GATE3', 'GATE4', 'DROP1', 'DROP2', 'CATCH1', 'CATCH2', 'SPIN1', 'MAG1']) {
    assert.ok(parts.has(p), p);
  }
  for (let k = 0; k < 4; k++) {
    const seen = new Set(SCENARIOS.map((s) => s.spec.wset[k]));
    assert.equal(seen.size, 8, `world setting ${k}: all eight values`);
  }
  assert.ok(SCENARIOS.some((s) => s.events.some((e) => e.btn0 || e.btn1)), 'buttons pressed');
  for (const n of [1, 2, 3, 4]) assert.ok(SCENARIOS.some((s) => s.mode === 'game' && s.name.startsWith(`game-${n}`)), `a game of ${n}`);
});
