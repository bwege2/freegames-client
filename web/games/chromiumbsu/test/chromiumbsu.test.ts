// Chromium B.S.U.'s port against the original: re/chromiumbsu/oracle runs the original 0.9.16.1 game
// code with recording GL/SDL/OpenAL stubs on the scripts in test/scripts/ and wrote, every 10 frames,
// a hash chained over the full game state and every drawing, text and sound call of every frame
// (test/golden/, re/chromiumbsu/oracle/golden.sh). The port runs the same scripts (test/trace.ts) and
// must write the same lines, and the same config and high-score files at the end.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runScript } from './trace.ts';
import { GlibcRand, RandTables } from '../src/rand.ts';
import { sin, cos } from '../src/libm.ts';
import { fmtG } from '../src/game/global.ts';

const dir = import.meta.dirname;

for (const name of readdirSync(join(dir, 'scripts')).filter((f) => f.endsWith('.txt')).sort()) {
  test(`the original's trace: ${name}`, () => {
    const want = readFileSync(join(dir, 'golden', name), 'utf8').replace(/\n$/, '').split('\n');
    const got = runScript(readFileSync(join(dir, 'scripts', name), 'utf8'));
    for (let i = 0; i < Math.max(want.length, got.length); i++) {
      if (want[i] !== got[i]) assert.fail(`line ${i + 1}: original "${want[i]}", port "${got[i]}"`);
    }
  });
}

test('rand() is glibc\'s', () => {
  const r = new GlibcRand(1);
  assert.deepEqual([r.next(), r.next(), r.next()], [1804289383, 846930886, 1681692777]);
  assert.equal(new GlibcRand(12345).next(), 383100999);
  const t = new RandTables();
  t.generate(null);
  assert.equal(t.randI[0], 248102004);
});

test('sin and cos are glibc\'s, not Math\'s', () => {
  // values of glibc's generic sin/cos (re/chromiumbsu/oracle/stub/sincos.c) where V8's Math.sin/Math.cos
  // differ in the last bit (re/chromiumbsu/NOTES.md)
  assert.equal(sin(2.5), 0.5984721441039565);
  assert.equal(sin(18), -0.750987246771676);
  assert.equal(cos(1.9000000000000001), -0.3232895668635036);
  assert.equal(cos(2.35), -0.702713076773554);
});

test('printf %g', () => {
  assert.equal(fmtG(Math.fround(0.6)), '0.6');
  assert.equal(fmtG(Math.fround(0.03)), '0.03');
  assert.equal(fmtG(1.1), '1.1');
  assert.equal(fmtG(Math.fround(0.035)), '0.035');
});
