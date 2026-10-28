// How long the original's words take on the 6502: cycles from a colon word's DOCOL to its (;S),
// measured on the original running a scenario. The port spends these as time (COST in src/worms.ts).
import { runOriginal, type Scenario } from './scenario.ts';
import { compileOriginal } from './original.ts';

export interface Timing {
  calls: number;
  /** cycles from entry to exit, nested words included */
  total: number;
}

export function measure(s: Scenario, words: string[]): Map<string, Timing> {
  const o = compileOriginal(s.seed);
  const { m, f } = o;
  const out = new Map<string, Timing>(words.map((w) => [w, { calls: 0, total: 0 }]));
  const open: { word: string; s: number; c: number }[] = [];
  for (const w of words) {
    const prev = f.onEnter.get(f.cfa(w));
    f.onEnter.set(f.cfa(w), () => {
      prev?.();
      open.push({ word: w, s: m.cpu.s, c: m.cpu.cycles });
    });
  }
  const exit = f.word('(;S)').pfa;
  m.watchPc(exit, () => {
    const top = open[open.length - 1];
    if (top && m.cpu.s === ((top.s - 2) & 0xff)) {
      open.pop();
      const t = out.get(top.word)!;
      t.calls++;
      t.total += m.cpu.cycles - top.c;
    }
  });
  // runOriginal installs its own hooks; ours were installed first and are kept (prev)
  const r = runOriginal(s, o);
  void r;
  return out;
}
