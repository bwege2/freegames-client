// The port's own parts, headless: the SID renderer, the keyboard, the worm files' names, the online
// round's messages and decisions, and that the server module's test data is what the port plays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Sid, SidPlayer, SID_CLOCK } from '../src/sid.ts';
import { petscii } from '../src/keys.ts';
import { storageName } from '../src/files.ts';
import { OnlineRound, encodeDecision, encodeStart, encodeWorm, packOptions, readOptions, wormOf, type RoundSetup } from '../src/onlinegame.ts';
import { packGame } from '../../../src/sdk/index.ts';
import { Msg } from '../src/proto/worms.ts';
import { Raster, seed32 } from '../src/raster.ts';
import { allFixtures, javaFixtures } from './fixtures.ts';
import { JAVA_FIXTURES } from './gen-java-fixtures.ts';

test('the SID plays a triangle note at its frequency, attack then decay (C64SOUND)', () => {
  const rate = 48000;
  const sid = new Sid(rate);
  const f = 0x1cd6; // SCALE's tenth note
  const hz = (f * SID_CLOCK) / 16777216;
  sid.write(0x18, 0x0a);
  sid.write(0x04, 0);
  sid.write(0x00, f & 0xff);
  sid.write(0x01, f >> 8);
  sid.write(0x05, 0x19);
  sid.write(0x06, 0x00);
  sid.write(0x04, 0x11);
  const out = new Float32Array(rate / 2);
  sid.render(out);
  let crossings = 0;
  for (let i = 1; i < out.length; i++) if (out[i - 1] < 0 && out[i] >= 0) crossings++;
  assert.ok(Math.abs(crossings - hz / 2) <= 3, `${crossings} periods in 0.5 s, ${hz.toFixed(1)} Hz expected`);
  const peak = (a: number, b: number) => Math.max(...out.subarray(a, b).map(Math.abs));
  assert.ok(peak(0, 480) > peak(rate / 2 - 480, rate / 2), 'decays (sustain 0)');
  assert.ok(peak(400, 900) > 0.05, 'audible after the 8 ms attack');
});

test('the SID player applies writes at their 6502 time', () => {
  const p = new SidPlayer(48000, 0.01);
  p.push([{ cycles: 0, reg: 0x18, value: 0x0f }, { cycles: 0, reg: 0x01, value: 0x40 }, { cycles: 0, reg: 0x06, value: 0xf0 }, { cycles: 0, reg: 0x04, value: 0x11 }]);
  p.push([{ cycles: SID_CLOCK / 10, reg: 0x04, value: 0x10 }]); // gate off 100 ms later
  const out = new Float32Array(4800 * 3);
  p.render(out);
  assert.ok(Math.max(...out.subarray(0, 480).map(Math.abs)) < 1e-6, 'silent before the latency');
  assert.ok(Math.max(...out.subarray(1000, 4000).map(Math.abs)) > 0.1, 'playing');
});

test('PC keys as the C64 keyboard gives them', () => {
  const k = (key: string, shiftKey = false) => petscii({ key, shiftKey, ctrlKey: false, altKey: false, metaKey: false });
  assert.equal(k('F7'), 0x88);
  assert.equal(k('F1'), 0x85);
  assert.equal(k('F2'), 0x89, 'shift F1');
  assert.equal(k('Escape'), 0x03, 'RUN/STOP');
  assert.equal(k('Enter'), 0x0d);
  assert.equal(k('Backspace'), 0x14, 'INST/DEL');
  assert.equal(k(' '), 0x20);
  assert.equal(k('a'), 0x41);
  assert.equal(k('A', true), 0xc1, 'shifted letters are graphics characters');
  assert.equal(k('7'), 0x37);
  assert.equal(k('?', true), 0x3f);
  assert.equal(petscii({ key: 'c', shiftKey: false, ctrlKey: true, altKey: false, metaKey: false }), null, 'browser shortcuts stay the browser\'s');
});

test('worm files keep their C64 names, readable by the server', () => {
  assert.equal(storageName('@0:AB  .WRM'), 'AB_20_20.WRM');
  assert.equal(storageName('@0:WRM2.WRM'), 'WRM2.WRM');
  assert.equal(storageName('@0:A+B!.WRM'), 'A_2BB_21.WRM');
  assert.match(storageName('@0:"$%&.WRM'), /^[A-Za-z0-9._-]{1,64}$/);
});

test('the raster sequence and the 32-bit seed (as the server computes them)', () => {
  const r = new Raster(1);
  const a = [r.d012(), r.d012(), r.d012()];
  assert.ok(a.every((v) => v >= 0 && v < 256));
  const counts = new Array(256).fill(0);
  const q = new Raster(7);
  for (let i = 0; i < 263000; i++) counts[q.d012()]++;
  assert.ok(counts[3] > 1600 && counts[3] < 2400, 'lines 256-262 fold onto 0-6: twice as often');
  assert.ok(counts[100] > 800 && counts[100] < 1200);
  assert.equal(seed32(0x0000000100000002n), 3);
});

test('an online round: decisions in the server\'s order, a departed player\'s worm, a resync', () => {
  const sent: Uint8Array[] = [];
  const round = new OnlineRound(1, 99n, (d) => sent.push(d));
  const setup: RoundSetup = {
    worms: [0, 1, 2, 3].map(() => wormOf(1, [0x53, 0x41, 0x4d, 0x45], [])),
    owners: [0, 1, 255, 255],
  };
  let started: RoundSetup | null = null;
  round.onStart = (s) => { started = s; };
  round.receive(0, encodeStart(setup)); // from a seat: ignored
  assert.equal(started, null);
  round.receive(255, encodeStart(setup));
  assert.deepEqual(started!.owners, [0, 1, 255, 255]);
  round.begin();
  assert.equal(round.seats.decider(2, 0), 'ai', 'a computer\'s worm');
  const d0 = round.seats.decider(0, 0);
  assert.ok(d0 && d0 !== 'ai' && !d0.local, 'worm 0 is another player\'s');
  assert.equal(d0.poll(), null, 'not decided yet');
  round.receive(0, encodeDecision({ step: 0, worm: 0, situation: 0, move: 3 }));
  assert.equal(d0.poll(), 3);
  const d1 = round.seats.decider(1, 0x08);
  assert.ok(d1 && d1 !== 'ai' && d1.local, 'worm 1 is ours');
  d1.send(2);
  assert.equal(sent.length, 1, 'our decision went out');
  assert.equal(d1.poll(), null, 'and counts when the server relays it');
  round.receive(1, sent[0]);
  assert.equal(d1.poll(), 2);
  // the other player leaves: the computer chooses for worm 0 from step 2 on
  round.receive(255, packGame(Msg, (m) => { const t = m._initTakeover(); t.worm = 0; t.step = 2; }));
  assert.equal(round.seats.decider(0, 0x01), 'ai');
  // garbage, and a move that is no path, are ignored
  round.receive(0, new Uint8Array([1, 2, 3]));
  round.receive(0, encodeDecision({ step: 3, worm: 1, situation: 0, move: 9 }));
  assert.equal(round.ahead, 0);
  // the server sends the round again (we came back): the game starts over
  round.receive(255, packGame(Msg, (m) => {
    const h = m._initHistory();
    h.start = (packGame(Msg, () => {}), h._initStart());
    const s = h.start;
    s._initWorms(4);
    const o = s._initOwners(4);
    [0, 1, 255, 255].forEach((v, i) => o.set(i, v));
    const l = s.worms;
    for (let i = 0; i < 4; i++) {
      l.get(i).kind = 1;
      l.get(i)._initName(4);
      l.get(i)._initMoves(64);
    }
  }));
  assert.throws(() => round.seats.decider(1, 0), /resync/);
});

test('options and worms in the schema', () => {
  assert.equal(readOptions(packOptions(3)), 3);
  assert.equal(readOptions(new Uint8Array(0)), 2, 'the computer by default');
  assert.equal(readOptions(new Uint8Array([7, 7, 7])), 2);
  assert.ok(encodeWorm(wormOf(4, [0x41, 0x42, 0x20, 0x20], new Array(64).fill(0xf2))).length < 200);
});

test('the server module\'s test data is what the port plays (regenerate: node games/worms/test/gen-java-fixtures.ts)', { timeout: 300000 }, async () => {
  const fs = await allFixtures();
  assert.equal(readFileSync(JAVA_FIXTURES, 'utf8'), javaFixtures(fs));
});
