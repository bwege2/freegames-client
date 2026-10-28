// The port as a scenario Target: the TypeScript translation (src/) on its machine (src/machine.ts),
// set up as the original's test machine (original.ts) is, so the scenarios run the same on both.
import { INIT, SETMODE } from '../src/cdraw.ts';
import { SYM } from '../src/image.ts';
import { io, load, m, reset, type Wait } from '../src/machine.ts';
import { DRAWDISPLAY, MAKEHOLE } from '../src/ppak.ts';
import { PLAY } from '../src/run.ts';
import { DISKPLAY, MAKETABLES, Reload } from '../src/run2.ts';
import { bitmapPattern } from './bitmaps.ts';
import type { FileKey, InputScript, Regs, Target } from './scenario.ts';

type Callable = (regs: Regs) => void | Wait;

const ROUTINES: Record<string, Callable> = {
  'CDRAW.INIT': () => INIT(),
  'CDRAW.SETMODE': (r) => SETMODE(r.y ?? 0),
  'PPAK.DRAWDISPLAY': () => DRAWDISPLAY(),
  'PPAK.MAKEHOLE': (r) => MAKEHOLE(r.y ?? 0),
  'RUN.PLAY': () => PLAY(),
};

export class Port implements Target {
  readonly ram = m;
  script: InputScript | null = null;
  onWait: ((waits: number) => void) | null = null;
  onHit: (() => void) | null = null;
  private clickFrom = 0;

  constructor() {
    reset();
    MAKETABLES();
    const keep = m.slice(0x0800, 0x1780);
    m.fill(0);
    m.set(keep, 0x0800);
    for (const k of ['CDRAW', 'SWAP', 'RUN', 'PPAK', 'EDIT'] as const) load(k);
    bitmapPattern(m);
    const sync = () => {
      const s = this.script;
      if (!s) return;
      if (s.key) {
        io.key = s.key | 0x80;
        s.key = 0;
      }
      io.btn = [s.inputs.btn0, s.inputs.btn1];
      io.pdl = [s.inputs.pdl0, s.inputs.pdl1];
    };
    io.onPoll = () => {
      this.script?.poll(io.polls, io.waits);
      sync();
    };
    io.onWait = () => {
      this.script?.wait(io.waits);
      sync();
      this.onWait?.(io.waits);
    };
    io.onHit = () => this.onHit?.();
  }

  sym(file: FileKey, name: string): number {
    const v = (SYM[file] as Record<string, number>)[name];
    if (v === undefined) throw new Error(`${file} has no ${name}`);
    return v;
  }

  call(file: FileKey, routine: string, regs: Regs = {}): void {
    const f = ROUTINES[`${file}.${routine}`];
    if (!f) throw new Error(`the port's test target has no ${file}.${routine}`);
    const r = f(regs);
    if (r) for (const _ of r) void _;
  }

  loadGame(): void {
    load('RUN2');
  }

  playGame(): void {
    MAKEHOLE(191);
    this.loadGame();
    try {
      for (const _ of DISKPLAY()) void _;
    } catch (e) {
      if (!(e instanceof Reload)) throw e;
    }
  }

  takeClicks(): number[] {
    const s = io.clicks;
    const out: number[] = [];
    for (let i = this.clickFrom + 1; i < s.length; i++) out.push(s[i] - s[i - 1]);
    this.clickFrom = s.length;
    return out;
  }
}
