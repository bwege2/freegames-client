// The original as a scenario Target: the assembled listings in the test's Apple II (apple2.ts).
// Memory as the construction set has it after booting (BOOT2.S, SWAP.S): CDRAW.S with the bitmap
// tables at $0800-$177F, the bitmaps at $7000, RUN.S, PPAK.S and EDIT.S; RUN2.S comes in over
// $8554 for the game (SWAPUSER).
import { Apple2, loadAll, type Script } from './apple2.ts';
import { bitmapPattern } from './bitmaps.ts';
import type { Assembly } from './merlin.ts';
import type { FileKey, InputScript, Inputs, Regs, Target } from './scenario.ts';


let cache: Record<string, Assembly> | null = null;
export function assemblies(): Record<string, Assembly> {
  cache ??= loadAll();
  return cache;
}

/** the address of the first line after `label`'s line whose text matches `re` */
export function lineAfter(asm: Assembly, label: string, re: RegExp): number {
  const i = asm.lines.findIndex((l) => l.label === label);
  if (i < 0) throw new Error(`no label ${label}`);
  for (let j = i + 1; j < asm.lines.length; j++) if (re.test(asm.lines[j].text)) return asm.lines[j].addr;
  throw new Error(`no line /${re.source}/ after ${label}`);
}

/** the machine's view of the target's script and hooks */
class Adapter implements Script {
  private readonly o: Original;
  constructor(o: Original) {
    this.o = o;
  }
  get inputs(): Inputs {
    return this.o.script?.inputs ?? { btn0: 0, btn1: 0, pdl0: 0, pdl1: 0 };
  }
  get key(): number {
    return this.o.script?.key ?? 0;
  }
  set key(v: number) {
    if (this.o.script) this.o.script.key = v;
  }
  wait(n: number): void {
    this.o.script?.wait(n);
    this.o.onWait?.(n);
  }
  poll(p: number, w: number): void {
    this.o.script?.poll(p, w);
  }
}

export class Original implements Target {
  readonly m = new Apple2();
  readonly ram = this.m.ram;
  readonly A = assemblies();
  script: InputScript | null = null;
  onWait: ((waits: number) => void) | null = null;
  onHit: (() => void) | null = null;
  private clickFrom = 0;

  constructor() {
    const A = this.A;
    // the tables at $0800-$177F (SHFRSLT, SHFOUT, DIV7, MOD7, LO, HI) as RUN2.S MAKETBLS makes them
    this.m.load(A.RUN2);
    const c = this.m.cpu;
    c.s = 0xff;
    c.pc = A.RUN2.symbols.get('MAKETBLS')!;
    this.m.run(lineAfter(A.RUN2, 'MAKT7', /LDA #<SLEEPERS/), 10_000_000);
    const keep = this.ram.slice(0x0800, 0x1780);
    this.ram.fill(0);
    this.ram.set(keep, 0x0800);
    for (const k of ['CDRAW', 'SWAP', 'RUN', 'PPAK', 'EDIT'] as const) this.m.load(A[k]);
    bitmapPattern(this.ram);
    const dohit = A.RUN.symbols.get('DOHIT')!;
    this.m.onStep = (pc) => {
      if (pc === dohit) this.onHit?.();
    };
    this.m.script = new Adapter(this);
  }

  sym(file: FileKey, name: string): number {
    const v = this.A[file].symbols.get(name);
    if (v === undefined) throw new Error(`${file} has no ${name}`);
    return v;
  }

  call(file: FileKey, routine: string, regs: Regs = {}): void {
    this.m.call(this.sym(file, routine), regs, 2_000_000_000);
  }

  loadGame(): void {
    this.m.load(this.A.RUN2);
  }

  playGame(): void {
    this.call('PPAK', 'MAKEHOLE', { y: 191 });
    this.loadGame();
    const c = this.m.cpu;
    c.s = 0xff;
    c.pc = this.sym('RUN2', 'DISKPLAY');
    this.m.run(this.A.SWAP.symbols.get('RELOAD')!, 2_000_000_000);
  }

  takeClicks(): number[] {
    const s = this.m.speaker;
    const out: number[] = [];
    for (let i = this.clickFrom + 1; i < s.length; i++) out.push(s[i] - s[i - 1]);
    this.clickFrom = s.length;
    return out;
  }
}
