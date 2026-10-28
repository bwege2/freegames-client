// One scenario, played twice: by the original (the disk's screens compiled by the rebuilt EA FORTH and
// run on the 6502 core) and by the port (src/worms.ts on src/machine.ts). Both read the same raster
// sequence (seed), get the same keys at the same points of the program, and are snapshotted every time
// MAKEMOVE begins: the grid, the four worms (all 88 bytes), the scores, SEED, KEYPOT, the screen and
// its colours, the sprite registers, and the SID register writes since the last snapshot.
import { readFileSync } from 'node:fs';
import * as K from '../src/kernal.ts';
import { Machine } from '../src/machine.ts';
import { Worms, WDATA } from '../src/worms.ts';
import { compileOriginal, boot, CHARGEN, type Original } from './original.ts';

export interface Step {
  /** deliver the key after the program has begun this word (since the last key) */
  after: string;
  /** PETSCII */
  key: number;
}

export interface Scenario {
  seed: number;
  keys: Step[];
  /** stop after this many snapshots */
  snapshots: number;
  /** and give up after this many frames */
  maxFrames?: number;
  /** the worm files on the disk at the start (name "ABCD.WRM" → PRG bytes) */
  disk?: Record<string, Uint8Array>;
  /** stop (with a last snapshot) when this word has begun this often (counting after `after` has begun) */
  stopAt?: { word: string; count: number; after?: string; afterCount?: number };
}

export interface Snapshot {
  frame: number;
  worms: number[][];
  grid: number[];
  wscr: number[];
  seed: number;
  keypot: number;
  wNum: number;
  w2Num: number;
  sto: number;
  screen: number[];
  color: number[];
  sprites: number[];
  sid: string;
  /** the cursor sprites' data where their reveal has finished on both sides (mapcdt = 0) */
  spriteData: number[][];
  mapcdt: number[];
}

export interface Run {
  snaps: Snapshot[];
  disk: Map<string, Uint8Array>;
  frames: number;
  /** the scenario's stopAt was reached */
  stopped: boolean;
}

/** the words both sides report when they begin (the keys' and the snapshots' points) */
const WORDS = ['MAKEMOVE', 'GETNEWMOVE', 'GPOT', 'GAME', 'PLAYGAME', 'SCORE2', 'INTROGAME', '?WAITTERM', '?START', '?CH', 'GRIDGLIDERS'];

const SPRITE_REGS = [...Array(0x11).keys(), 0x15, 0x17, 0x1d, 0x27, 0x28, 0x29, 0x2a];
const SPMEM = [0x340, 0x380, 0x3c0, 0x2040];

/** delivers the scenario's keys: one at a time, when the program has reached the step's word */
class Keys {
  private i = 0;
  /** how often the step's word began since the last key went in */
  private count = 0;
  private readonly steps: Step[];
  /** the program has taken every key it got (none in the buffer, CHCUR and FNCUR empty) */
  private readonly idle: () => boolean;
  constructor(steps: Step[], idle: () => boolean) {
    this.steps = steps;
    this.idle = idle;
  }
  /** the step's word counts when it begins with every key taken */
  entered(word: string): void {
    if (this.i < this.steps.length && this.steps[this.i].after === word && this.idle()) this.count++;
  }
  /**
   * At the keyboard scan: the next key, once the program is polling at its word (begun twice since
   * the last key was taken) and has taken every key it got.
   */
  scan(bus: K.Bus): void {
    if (this.count < 2 || !this.idle()) return;
    K.keyIn(bus, this.steps[this.i].key);
    this.i++;
    this.count = 0;
  }
  get done(): boolean {
    return this.i >= this.steps.length;
  }
}

export function runOriginal(s: Scenario, o: Original = compileOriginal(s.seed)): Run {
  const { m, f } = o;
  for (const [k, v] of Object.entries(s.disk ?? {})) m.disk.set(k, v);
  const keys = new Keys(s.keys, () => m.ram[v('CHCUR')] === 0 && m.ram[v('FNCUR')] === 0 && m.ram[K.NDX] === 0);
  const snaps: Snapshot[] = [];
  const cfa = new Map<number, string>();
  for (const name of WORDS) {
    cfa.set(f.cfa(name), name);
  }
  const v = (name: string) => f.pfa(name);
  const W = [1, 2, 3, 4].map((i) => f.constant(`W${i}`));
  let stops = 0;
  let stopped = false;
  let armed = false;
  let afters = 0;
  let sidFrom = 0;
  const snap = () => {
    const ram = m.ram;
    const sid = m.sidLog.slice(sidFrom).map((x) => `${x.reg.toString(16)}=${x.value.toString(16)}`).join(' ');
    sidFrom = m.sidLog.length;
    const mapcdt = [0, 1, 2, 3].map((i) => ram[f.constant('MAPCDT') + 2 * i]);
    snaps.push({
      frame: m.frames,
      worms: W.map((a) => [...ram.subarray(a, a + 0x58)]),
      grid: [...ram.subarray(WDATA, WDATA + 440)],
      wscr: [0, 1, 2, 3].map((i) => f.r16(v('WSCR') + 2 * i)),
      seed: f.r16(v('SEED')),
      keypot: f.r16(v('KEYPOT')),
      wNum: f.constant('W#'),
      w2Num: f.constant('2*W#'),
      sto: f.r16(v('STO')),
      screen: [...ram.subarray(0x400, 0x400 + 1000)],
      color: [...m.color.subarray(0, 1000)],
      sprites: SPRITE_REGS.map((r) => m.vic[r]),
      sid,
      spriteData: SPMEM.map((a) => [...ram.subarray(a, a + 24)]),
      mapcdt,
    });
  };
  for (const [c, name] of cfa) {
    const prev = f.onEnter.get(c);
    f.onEnter.set(c, () => {
      keys.entered(name);
      if (name === 'MAKEMOVE') snap();
      if (s.stopAt && name === s.stopAt.after) armed = ++afters >= (s.stopAt.afterCount ?? 1);
      if (s.stopAt && name === s.stopAt.word && (armed || !s.stopAt.after) && ++stops === s.stopAt.count) {
        snap();
        stopped = true;
      }
      prev?.();
    });
  }
  m.onKeyScan = () => keys.scan(m);
  boot(o);
  const limit = s.maxFrames ?? 200000;
  m.run(() => stopped || snaps.length >= s.snapshots || m.frames >= limit);
  return { snaps, disk: m.disk, frames: m.frames, stopped };
}

/** the port, headless */
export function portMachine(seed: number): { m: Machine; g: Worms } {
  const m = new Machine(new Uint8Array(readFileSync(CHARGEN)), seed);
  return { m, g: new Worms(m) };
}

export async function runPort(s: Scenario): Promise<Run> {
  const { m, g } = portMachine(s.seed);
  const disk = new Map<string, Uint8Array>(Object.entries(s.disk ?? {}));
  const key = (name: string) => name.replace(/^@/, '').replace(/^[0-9]?:/, '');
  g.disk = {
    read: async (name) => disk.get(key(name)) ?? null,
    write: async (name, data) => { disk.set(key(name), data); },
  };
  const keys = new Keys(s.keys, () => g.chcur === 0 && g.fncur === 0 && m.ram[K.NDX] === 0);
  const snaps: Snapshot[] = [];
  let sid: string[] = [];
  m.onSid = (reg, value) => sid.push(`${reg.toString(16)}=${value.toString(16)}`);
  const snap = () => {
    snaps.push({
      frame: m.frames,
      worms: g.w.map((b) => [...b]),
      grid: [...m.ram.subarray(WDATA, WDATA + 440)],
      wscr: [...g.wscr],
      seed: g.seed,
      keypot: g.keypot,
      wNum: g.wNum,
      w2Num: g.w2Num,
      sto: g.sto,
      screen: [...m.ram.subarray(0x400, 0x400 + 1000)],
      color: [...m.color.subarray(0, 1000)],
      sprites: SPRITE_REGS.map((r) => m.vic[r]),
      sid: sid.join(' '),
      spriteData: SPMEM.map((a) => [...m.ram.subarray(a, a + 24)]),
      mapcdt: [0, 1, 2, 3].map((i) => g.mapcdt[2 * i]),
    });
    sid = [];
  };
  let stops = 0;
  let stopped = false;
  let armed = false;
  let afters = 0;
  g.hooks.enter = (word) => {
    keys.entered(word);
    if (word === 'MAKEMOVE') snap();
    if (s.stopAt && word === s.stopAt.after) armed = ++afters >= (s.stopAt.afterCount ?? 1);
    if (s.stopAt && word === s.stopAt.word && (armed || !s.stopAt.after) && ++stops === s.stopAt.count) {
      snap();
      stopped = true;
    }
  };
  m.onKeyScan = () => keys.scan(m);
  let failed: unknown = null;
  void g.run().catch((e) => { failed = e; m.release(); });
  const limit = s.maxFrames ?? 200000;
  while (!stopped && snaps.length < s.snapshots && m.frames < limit) {
    await m.frame();
    if (failed) throw failed;
  }
  m.stop();
  return { snaps, disk, frames: m.frames, stopped };
}

/** The first difference between two runs, described; null if they agree. */
export function compare(a: Run, b: Run, n: number): string | null {
  for (let i = 0; i < n; i++) {
    const x = a.snaps[i], y = b.snaps[i];
    if (!x || !y) return `snapshot ${i}: original has ${a.snaps.length}, port ${b.snaps.length}`;
    const diff = (what: string, p: unknown, q: unknown) => `snapshot ${i} (MAKEMOVE #${i}): ${what} differs\n  original: ${JSON.stringify(p)}\n  port:     ${JSON.stringify(q)}`;
    for (let w = 0; w < 4; w++) {
      const d = x.worms[w].findIndex((v, k) => v !== y.worms[w][k]);
      if (d >= 0) return diff(`worm ${w} byte ${d.toString(16)}`, x.worms[w], y.worms[w]);
    }
    const g = x.grid.findIndex((v, k) => v !== y.grid[k]);
    if (g >= 0) return diff(`grid at x ${g % 20} y ${Math.floor(g / 20)}`, x.grid[g], y.grid[g]);
    for (const k of ['wscr', 'seed', 'keypot', 'wNum', 'w2Num', 'sto', 'sid', 'sprites'] as const) {
      if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) return diff(k, x[k], y[k]);
    }
    const sc = x.screen.findIndex((v, k) => v !== y.screen[k]);
    if (sc >= 0) return diff(`screen at column ${sc % 40} row ${Math.floor(sc / 40)}`, x.screen.slice(sc - (sc % 40), sc - (sc % 40) + 40), y.screen.slice(sc - (sc % 40), sc - (sc % 40) + 40));
    const co = x.color.findIndex((v, k) => v !== y.color[k]);
    if (co >= 0) return diff(`colour at column ${co % 40} row ${Math.floor(co / 40)}`, x.color[co], y.color[co]);
    for (let s = 0; s < 4; s++) {
      if (x.mapcdt[s] === 0 && y.mapcdt[s] === 0 && JSON.stringify(x.spriteData[s]) !== JSON.stringify(y.spriteData[s])) {
        return diff(`sprite ${s} data`, x.spriteData[s], y.spriteData[s]);
      }
    }
  }
  return null;
}

/** keys */
export const KEY = { F1: 0x85, F3: 0x86, F5: 0x87, F7: 0x88, RETURN: 0x0d, SPACE: 0x20, STOP: 0x03, DEL: 0x14 } as const;
