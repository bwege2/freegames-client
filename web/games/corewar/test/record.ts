// The tests' X display: records what the simulator shows, line for line as the oracle's display
// re/corewar/oracle/xwinrec.c does, and keeps the text panel's output (cdb). Plus a process host that
// reads warriors from disk and cdb's input from a script.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { XDisplay } from '../src/display.ts';
import { layout, window_size, font_metrics } from '../src/display.ts';
import type { Host } from '../src/host.ts';
import { g } from '../src/global.ts';
import { pressAnyKey } from '../src/str_eng.ts';
import { main } from '../src/pmars.ts';
import { set_host } from '../src/host.ts';
import { bstr } from '../src/libc.ts';

const fnv = (h: number, s: string): number => {
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return Math.imul(h ^ 10, 16777619) >>> 0;
};
const hex = (n: number): string => n.toString(16).padStart(8, '0');

export class Recorder implements XDisplay {
  trace: string[] = [];
  win = '';
  /** -1: write every cycle in full; n: the first n cycles of each round */
  traceCycles: number;
  private roundCycles = 0;
  private inRound = 0;
  private roundHash = 0;
  private line: string | null = null;
  private input: string[];
  textLines = 0;
  constructor(traceCycles = -1, input: string[] = []) {
    this.traceCycles = traceCycles;
    this.input = input.slice();
  }
  private flush(): void {
    if (this.line === null) return;
    this.roundHash = fnv(this.roundHash, this.line);
    if (this.traceCycles < 0 || this.roundCycles <= this.traceCycles) this.trace.push(this.line);
    this.line = null;
  }
  private ev(s: string): void {
    if (this.line !== null) this.line += s;
  }
  private endRound(): void {
    this.flush();
    if (this.inRound) this.trace.push(`H ${this.inRound} ${this.roundCycles} ${hex(this.roundHash)}`);
    this.inRound = 0;
  }
  async open_graphics(): Promise<void> {
    const [x, y] = window_size(g.displayMode);
    this.textLines = layout(x, y, font_metrics(x), g.warriors, g.coreSize, g.cycles, g.taskNum).textLines;
  }
  display_clear(): void {
    this.endRound();
    let h = 2166136261;
    const m = g.memory;
    const b = (v: number) => { h = Math.imul(h ^ (v & 255), 16777619) >>> 0; };
    for (let i = 0; i < g.coreSize; i++) {
      b(m.op[i]); b(m.am[i]); b(m.bm[i]);
      for (let j = 0; j < 4; j++) b(m.A[i] >> (8 * j));
      for (let j = 0; j < 4; j++) b(m.B[i] >> (8 * j));
    }
    this.roundHash = 2166136261;
    this.roundCycles = 0;
    this.inRound = g.round_num;
    let l = `R ${g.round_num}`;
    for (let i = 0; i < g.warriors; i++) l += ` ${g.warrior[i].position}`;
    l += ` ${hex(h)}`;
    this.roundHash = fnv(this.roundHash, l);
    this.trace.push(l);
    this.line = null;
  }
  display_cycle(): boolean {
    this.flush();
    ++this.roundCycles;
    this.line = `${g.W}`;
    return false;
  }
  async pause(): Promise<void> {}
  display_read(a: number): void { this.ev(` r${a}`); }
  display_dec(a: number): void { this.ev(` d${a}`); }
  display_inc(a: number): void { this.ev(` i${a}`); }
  display_write(a: number): void { this.ev(` w${a}`); }
  display_exec(a: number): void { this.ev(` x${a}`); }
  display_spl(_w: number, tasks: number): void { this.ev(` s${tasks}`); }
  display_dat(a: number, _w: number, tasks: number): void { this.ev(` k${a}/${tasks}`); }
  async display_close(wait: boolean): Promise<void> {
    this.endRound();
    if (wait) this.puts(pressAnyKey);
  }
  puts(s: string): void { this.win += s; }
  async gets(): Promise<string | null> {
    const l = this.input.shift();
    if (l === undefined) return null;
    this.puts(l);
    return l;
  }
  write_menu(): void {}
  clear(): void {}
  update(panel: number): void { g.curPanel = panel; }
  resize(): void {}
}

export interface Run {
  stdout: string;
  stderr: string;
  status: number;
  trace: string[];
  win: string;
}

/**
 * Runs the port as the oracle is run: `pmars args` in directory `cwd`, time() = time, cdb input lines,
 * stdin not a terminal.
 */
export async function run(args: string[], o: { cwd: string; time?: number; cycles?: number; input?: string[]; files?: Record<string, string> }): Promise<Run> {
  let stdout = '', stderr = '';
  const rec = new Recorder(o.cycles ?? -1, o.input ?? []);
  const host: Host = {
    stdout: (s) => { stdout += s; },
    stderr: (s) => { stderr += s; },
    async readFile(name) {
      if (o.files && name in o.files) return o.files[name];
      const p = join(o.cwd, name);
      return existsSync(p) ? bstr(readFileSync(p)) : null;
    },
    async appendFile() { return true; },
    async readStdin() { return null; },
    stdinIsTty: false,
    time: () => o.time ?? 0,
    display: rec,
  };
  set_host(host);
  const status = await main(args);
  return { stdout, stderr, status, trace: rec.trace, win: rec.win };
}
