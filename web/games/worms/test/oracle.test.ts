// The port against the original. The original is the source disk's EA FORTH screens, compiled in the
// order of the disk's load screen by the rebuilt EA FORTH (eaforth.ts, kernel.fth.ts) and run on a 6502
// core (cpu6502.ts) in a C64 (c64.ts); the port is src/worms.ts. Both play the same scenario: the same
// raster sequence (RAND's input), the same keys at the same points of the program. At every MAKEMOVE
// (and where a scenario stops) the grid, the four worms' 88 bytes, the scores, SEED, KEYPOT, the
// screen and its colours, the sprite registers and data, and every SID write since must be the same.
// Needs the original: re/worms/fetch.sh downloads it (the tests skip without it).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runOriginal, runPort, compare, KEY, type Step, type Scenario, type Run } from './scenario.ts';
import { missing, compileOriginal } from './original.ts';
import { MAPMASK, CRMAP, SCALE, VALFN, VBIMASKT, SPMEM, SP_PTR, SPCOLR, MAPCLR, NMOVE, XINCE, XINCO, YINC } from '../src/data.ts';
import { IOBUF_ADDR } from '../src/worms.ts';

const skip = missing();

/** a person's answers: the k-th question gets (k*7 mod 4) spaces, then RETURN */
function decisions(n: number, from = 0): Step[] {
  const keys: Step[] = [];
  for (let d = from; d < from + n; d++) {
    for (let k = 0; k < (d * 7) % 4; k++) keys.push({ after: 'GPOT', key: KEY.SPACE });
    keys.push({ after: 'GPOT', key: KEY.RETURN });
  }
  return keys;
}

const ch = (s: string): Step[] => [...s].map((c) => ({ after: '?CH', key: c.charCodeAt(0) }));
const menu = (k: number): Step => ({ after: '?START', key: k });

async function both(s: Scenario): Promise<{ a: Run; b: Run }> {
  const a = runOriginal(s);
  const b = await runPort(s);
  const n = Math.max(a.snaps.length, b.snaps.length);
  const d = compare(a, b, n);
  assert.equal(d, null, d ?? '');
  assert.equal(a.snaps.length, b.snaps.length, 'as many snapshots');
  if (s.stopAt) {
    assert.ok(a.stopped, `the original reached the end of the scenario (${a.frames} frames)`);
    assert.ok(b.stopped, 'the port reached the end of the scenario');
  }
  return { a, b };
}

test('the attract mode: three demonstration games, move by move', { skip: skip ?? false, timeout: 600000 }, async () => {
  const { a } = await both({ seed: 99, keys: [], snapshots: 3000 });
  assert.equal(a.snaps.length, 3000);
  const resets = a.snaps.filter((s, i) => i > 0 && s.grid.filter((x) => x).length < a.snaps[i - 1].grid.filter((x) => x).length).length;
  assert.ok(resets >= 2, 'the demonstration started again at least twice');
});

test('a game: a taught worm, the computer\'s, a wild one, from F7 to the scores', { skip: skip ?? false, timeout: 600000 }, async () => {
  const keys: Step[] = [{ after: 'MAKEMOVE', key: KEY.F7 }, menu(KEY.F7), ...decisions(300)];
  const { a } = await both({ seed: 7, keys, snapshots: 100000, maxFrames: 120000, stopAt: { word: '?WAITTERM', count: 1, after: 'PLAYGAME' } });
  const last = a.snaps[a.snaps.length - 1];
  assert.deepEqual(last.worms.map((w) => w[0x4b]), [1, 2, 3, 0], 'NEW, AUTO, WILD, none');
  assert.deepEqual(last.worms.map((w) => w[6]), [0, 0, 0, 0], 'every worm dead');
  assert.ok(last.wscr.reduce((x, y) => x + y) > 100, `scores ${last.wscr}`);
  const taught = last.worms[0].slice(0x0b, 0x4b).filter((m) => m < 6).length;
  assert.ok(taught > 12, `the person taught ${taught - 6} moves`);
});

test('the menu: kinds, speed, files (save, load, update, a missing one), then a game of two taught worms', { skip: skip ?? false, timeout: 600000 }, async () => {
  const keys: Step[] = [
    { after: 'MAKEMOVE', key: KEY.F7 },
    menu(0x53), ...ch('\rAB\r'), // S: worm 0 saved as "AB"
    menu(KEY.F5), menu(0x4c), ...ch('\rAB\r'), // F5 L: worm 1 loads "AB"
    menu(0x55), ...ch('\r'), // U: worm 1 updates "AB"
    menu(KEY.F5), menu(0x4c), ...ch('\rZ\r'), // F5 L "Z": not on the disk
    menu(0x3f), menu(0x47), menu(0x39), // ? G 9
    menu(KEY.F3), menu(KEY.F3), menu(KEY.F3), // worm 2: WILD → SAME → none → NEW
    menu(KEY.F7), ...decisions(400),
  ];
  const { a, b } = await both({ seed: 31337, keys, snapshots: 100000, maxFrames: 150000, stopAt: { word: '?WAITTERM', count: 1, after: 'PLAYGAME' } });
  const first = a.snaps.find((s) => s.worms[0][0x4b] === 4)!;
  assert.ok(first, 'a game of the named worms');
  assert.deepEqual(first.worms.map((w) => w[0x4b]), [4, 4, 1, 0], 'two named worms, a new one, none');
  assert.deepEqual([...first.worms[1].slice(0x4e, 0x52)], [0x41, 0x42, 0x20, 0x20], 'worm 1 is AB');
  assert.equal(first.sto, 2, 'speed 9');
  assert.deepEqual([...a.disk.keys()], ['AB  .WRM']);
  assert.deepEqual([...b.disk.get('AB  .WRM')!], [...a.disk.get('AB  .WRM')!], 'the same file');
  const f = a.disk.get('AB  .WRM')!;
  assert.equal(f.length, 66);
  assert.equal(f[0] | (f[1] << 8), IOBUF_ADDR, 'saved from PAD');
});

// RUN/STOP and the speed keys go in while the computer's worms play: while a person's worm is being
// taught, the original's GETNEWMOVE loop takes about a frame a round, and such a key is either a pause
// or speed change (?PAUSE, ?SPEED) or the answer (?NOTSP), depending on the cycle it comes in at
// (re/worms/NOTES.md "Timing"). The port takes it as the pause or the speed change.
test('pause, speed keys, and F1 starting over', { skip: skip ?? false, timeout: 600000 }, async () => {
  const mk = (k: number): Step => ({ after: 'MAKEMOVE', key: k });
  const keys: Step[] = [
    mk(KEY.F7), menu(KEY.F3), menu(KEY.F3), menu(KEY.F5), menu(KEY.F3), // worm 0: NEW → AUTO → WILD; worm 1: AUTO → WILD
    menu(KEY.F7),
    mk(KEY.STOP), { after: '?CH', key: 0x41 }, { after: '?CH', key: KEY.STOP }, // RUN/STOP, a key, RUN/STOP
    mk(0x35), mk(0x30), mk(0x39), mk(0x32), mk(0x37),
    mk(KEY.F1), // QUIT: GRIDGLIDERS again
    mk(KEY.F7), menu(KEY.F7), ...decisions(600, 11),
  ];
  const { a } = await both({ seed: 4242, keys, snapshots: 100000, maxFrames: 150000, stopAt: { word: '?WAITTERM', count: 1, after: 'PLAYGAME', afterCount: 2 } });
  const last = a.snaps[a.snaps.length - 1];
  assert.deepEqual(last.worms.map((w) => w[0x4b]), [1, 2, 3, 0], 'the kinds of a new start');
  assert.deepEqual(last.worms.map((w) => w[6]), [0, 0, 0, 0], 'the second game ended');
});

test('the port\'s tables are the ones the screens lay down', { skip: skip ?? false }, () => {
  const { f, m } = compileOriginal(1);
  const bytes = (name: string, n: number) => [...m.ram.subarray(f.constant(name), f.constant(name) + n)];
  const words = (name: string, n: number) => Array.from({ length: n }, (_, i) => f.r16(f.constant(name) + 2 * i));
  assert.deepEqual(bytes('MAPMASK', 192), MAPMASK);
  assert.deepEqual(bytes('CRMAP', 192), CRMAP);
  assert.deepEqual(words('SCALE', 25), SCALE);
  assert.deepEqual(bytes('VALFN', 6), VALFN);
  assert.deepEqual(bytes('VBIMASKT', 20), VBIMASKT);
  assert.deepEqual(words('SPMEM', 4), SPMEM);
  assert.deepEqual(bytes('SP-PTR', 4), SP_PTR);
  assert.deepEqual(bytes('SPCOLR', 4), SPCOLR);
  assert.deepEqual(bytes('MAPCLR', 4), MAPCLR);
  assert.deepEqual(bytes('NMOVE', 6), NMOVE);
  const signed = (v: number) => (v & 0x8000 ? v - 0x10000 : v);
  assert.deepEqual(words('XINCE', 6).map(signed), XINCE);
  assert.deepEqual(words('XINCO', 6).map(signed), XINCO);
  assert.deepEqual(words('YINC', 6).map(signed), YINC);
  assert.equal(f.r16(0xc000) + 0x44, IOBUF_ADDR, 'PAD after the load');
});

test('the rebuilt kernel counts as fig-FORTH does', { skip: skip ?? false }, () => {
  const { f } = compileOriginal(1);
  const run = (src: string): number[] => {
    while (f.stackDepth()) f.pop();
    for (const w of src.trim().split(/\s+/)) {
      const word = f.find(w);
      if (word) f.execute(word);
      else f.push(parseInt(w, 10) & 0xffff);
    }
    const out: number[] = [];
    while (f.stackDepth()) out.unshift(f.pops());
    return out;
  };
  assert.deepEqual(run('7 3 /MOD'), [1, 2]);
  assert.deepEqual(run('-7 3 /MOD'), [-1, -2], 'symmetric division');
  assert.deepEqual(run('100 7 MOD'), [2]);
  assert.deepEqual(run('-300 7 *'), [-2100]);
  assert.deepEqual(run('-5 3 >'), [0], 'the kernel compares signed');
  assert.deepEqual(run('3 -5 >'), [1]);
  assert.deepEqual(run('-5 3 <'), [0], 'the game makes < unsigned (screen 2: : < U< ;)');
  assert.deepEqual(run('-5 3 U<'), [0]);
  assert.deepEqual(run('3 -5 MAX'), [3]);
  assert.deepEqual(run('1 2 3 4 4 ROLL'), [2, 3, 4, 1], '79-standard ROLL');
  assert.deepEqual(run('25600 ><'), [100]);
  assert.deepEqual(run('5 28*'), [200]);
  assert.deepEqual(run('2 40*'), [128]);
  assert.deepEqual(run('5 5 ='), [1], 'true is 1');
});
