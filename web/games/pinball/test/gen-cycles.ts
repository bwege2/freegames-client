// The time the original's code takes, for the port's clock: writes src/cycles.ts and
// test/golden/timing.txt.gz from the 6502 code (needs re/pinball/orig):
//   node games/pinball/test/gen-cycles.ts
//
// The port does not count the cycles of every 6502 instruction it translates. It counts exactly what
// is timing by construction (WAIT, PREAD, the speaker's loops) and charges, for the rest, a number of
// cycles at routine entries and loop heads (CHARGES below, each one label or the same label in
// several listings). Here the frame scenarios (scenarios.ts) and the construction set's sessions
// (editor-sessions.ts) run on the test's 6502: each charge label owns the cycles from where the code
// reaches it to where it reaches the next charge label in the same subroutine call (a subroutine
// without charges of its own counts to its caller's), and its charge is what it owns per time it is
// reached. test/timing.test.ts checks the port's clock against the original's (timing.txt.gz: the
// original's cycles per frame, and how often each charge label was reached).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Original, lineAfter } from './original.ts';
import type { Assembly } from './merlin.ts';
import { runOriginal } from './editor.ts';
import { SESSIONS } from './editor-sessions.ts';
import { runScenario } from './run-scenario.ts';
import { SCENARIOS } from './scenarios.ts';

/** charge name: the labels (listing.label) where it is charged */
export const CHARGES: Record<string, string[]> = {
  // CDRAW.S: bitmaps
  GETBITS: ['CDRAW.GETBITS'],
  XOFFDRW2: ['CDRAW.XOFFDRW2'],
  XOFFDRW3: ['CDRAW.XOFFDRW3'],
  /** a row's end: the byte left of it, the next row */
  XOFFROW: ['CDRAW.XOFFDRW3/DEC BASE1\\+1'],
  DRAWBTS2: ['CDRAW.DRAWBTS2'],
  DRAWBTS3: ['CDRAW.DRAWBTS3'],
  STORE: ['CDRAW.STORE'],
  GRAB: ['CDRAW.GRAB'],
  XOR: ['CDRAW.XOR'],
  PRCHAR: ['RUN.PRCHAR', 'RUN2.PRCHAR'],
  // RUN.S: the ball
  MOVEBALL: ['RUN.MOVEBALL'],
  /** a ball on the table (not out or asleep) */
  MOVEBALLON: ['RUN.MOVEBALL/STA BST'],
  MOVEB2: ['RUN.MOVEB2'],
  MOVEB9: ['RUN.MOVEB9'],
  MOVEB10: ['RUN.MOVEB10'],
  CHECKVERT: ['RUN.CHECKVERT'],
  PCHECKV: ['RUN.PCHECKV'],
  BCHECKV: ['RUN.BCHECKV'],
  CHECKHORIZ: ['RUN.CHECKHORIZ'],
  CHECKHZ2: ['RUN.CHECKHZ2'],
  HITLEFT: ['RUN.HITLEFT'],
  HITRIGHT: ['RUN.HITRIGHT'],
  FIXLEFT: ['RUN.FIXLEFT'],
  FIXRIGHT: ['RUN.FIXRIGHT'],
  BALLUP: ['RUN.BALLUP'],
  BALLDOWN: ['RUN.BALLDOWN'],
  BALLLEFT: ['RUN.BALLLEFT'],
  BALLRIGHT: ['RUN.BALLRIGHT'],
  DOHIT: ['RUN.DOHIT'],
  DOVHIT: ['RUN.DOVHIT'],
  ROTATE: ['RUN.ROTATE'],
  PBOUNCE: ['RUN.PBOUNCE'],
  DRAWBALL: ['RUN.DRAWBALL', 'RUN2.DRAWBALL'],
  // RUN.S: the parts
  GETST: ['RUN.GETST', 'RUN2.GETST'],
  WIRING: ['RUN.WIRING', 'RUN2.WIRING'],
  ADVANCE: ['RUN.ADVANCE', 'RUN2.ADVANCE'],
  RETREAT: ['RUN.RETREAT'],
  SCORE: ['RUN.SCORE', 'RUN2.SCORE'],
  DOSCORE: ['RUN.DOSCORE', 'RUN2.DOSCORE'],
  DOSCORE2: ['RUN.DOSCORE2', 'RUN2.DOSCORE2'],
  // the parts' routines (RUN.S: each part's run, hit and init routine, reached through its
  // descriptor): charged where the port dispatches to them
  ...Object.fromEntries([
    'LAUNCHRUN', 'LFLIPRUN', 'RFLIPRUN', 'LFLIP2RUN', 'RFLIP2RUN', 'FLIPRUN', 'BUMPRUN', 'KNOCKRUN', 'CATCH2RUN',
    'DROPRUN', 'DROP1RUN', 'DROP2RUN', 'FLASHRUN', 'SPINRUN',
    'LAUNCHHIT', 'LFLIPHIT', 'RFLIPHIT', 'LFLIP2HIT', 'RFLIP2HIT', 'FLIPHIT', 'BUMPHIT', 'KNOCK1HIT', 'KNOCK2HIT', 'KICKHIT',
    'CATCH1HIT', 'CATCH2HIT', 'DROP1HIT', 'DROP2HIT', 'FLASHHIT', 'GATEHIT', 'GATE2HIT', 'GATE3HIT', 'ROLLHIT', 'SPINHIT', 'MAGHIT',
    'BUMPINIT', 'CATCH1INIT', 'DROPINIT', 'DROP1INIT', 'DROP2INIT', 'FLIPINIT', 'FLIP2INIT', 'SPININIT',
  ].map((k) => [k, [`RUN.${k}`]])),
  PLAY11: ['RUN.PLAY11'],
  MOVEB11: ['RUN.MOVEB11'],
  // the main loops: RUN.S PLAY (the test play), RUN2.S PLAY and SLEEP (the game)
  PLAY7: ['RUN.PLAY7'],
  PLAY10: ['RUN.PLAY10'],
  /** an object's turn this jiffy: its routine called */
  PLAYRUN: ['RUN.PLAY10/LDA VLO'],
  /** back from it: was it a ball, is it out */
  PLAYBACK: ['RUN.PLAY10/^\\s+LDY NOBJ'],
  PLAYBALL: ['RUN.PLAY10/LDY #16'],
  PLAY12: ['RUN.PLAY12'],
  GAMEPLAY: ['RUN2.PLAY'],
  GAMEPLAY4: ['RUN2.PLAY4'],
  GAMERUN: ['RUN2.PLAY4/LDA VECTLO'],
  GAMEBACK: ['RUN2.PLAY4/^\\s+LDY NEXTOBJ'],
  GAMEBALL: ['RUN2.PLAY4/LDY #16'],
  PLAY9: ['RUN2.PLAY9'],
  GAMEPLAY10: ['RUN2.PLAY10'],
  SLEEP: ['RUN2.SLEEP'],
  SLEEP2: ['RUN2.SLEEP2'],
  SLEEPRUN: ['RUN2.SLEEP2/LDA SLEEPLO'],
  SLEEPBACK: ['RUN2.SLEEP2/LDA BSTAT'],
  SLEEP6: ['RUN2.SLEEP6'],
  DOBALL: ['RUN2.DOBALL'],
  INITBALL: ['RUN.INITBALL'],
  /** (RUN2.S's INITBALL is this) */
  INITB2: ['RUN.INITB2'],
  // PPAK.S: polygons, scan converted row by row (SCANPOLY), each row's bars drawn (DOSCAN, DOBAR)
  // and its spans merged into the table's
  DRAWOBJ: ['PPAK.DRAWOBJ'],
  SCANPOLY: ['PPAK.SCANPOLY'],
  SETCOLOR: ['PPAK.SETCOLOR'],
  GETMINY: ['PPAK.GETMINY'],
  MAKEHOLE: ['PPAK.MAKEHOLE'],
  PROCESSPOLY: ['PPAK.PROCESSPOLY'],
  PROCESSVERTEX: ['PPAK.PROCESSVERTEX'],
  DIVIDE: ['PPAK.DIVIDE'],
  QDIV: ['PPAK.QDIV'],
  SORTSTARTS: ['PPAK.SORTSTARTS'],
  ADDSTARTS: ['PPAK.ADDSTARTS'],
  ADDSTARTS2: ['PPAK.ADDSTARTS2'],
  ADDSTARTS3: ['PPAK.ADDSTARTS3'],
  SCANPLY2: ['PPAK.SCANPLY2'],
  SCANPLY3: ['PPAK.SCANPLY3'],
  SCANPLY6: ['PPAK.SCANPLY6'],
  DOSCAN: ['PPAK.DOSCAN'],
  DOSCN2: ['PPAK.DOSCN2'],
  DOSCN3: ['PPAK.DOSCN3'],
  DOSCN4: ['PPAK.DOSCN4'],
  DOSCN5: ['PPAK.DOSCN5'],
  DOSCN6: ['PPAK.DOSCN6'],
  DOBAR: ['PPAK.DOBAR'],
  DOBAR3: ['PPAK.DOBAR3'],
  DOBAR4: ['PPAK.DOBAR4'],
  // EDIT.S: the magnifier's rows (DOROW: black and white dots, or colour pairs)
  DOROW: ['EDIT.DOROW'],
  DOROWBW: ['EDIT.DOROWBW'],
  DOROWCLR: ['EDIT.DOROWCLR'],
  INITROW: ['EDIT.INITROW'],
  DODOTBW: ['EDIT.DODOTBW'],
  DODOTCLR: ['EDIT.DODOTCLR'],
  // CDRAW.S: the screen cleared, lines (rectangles, menus), block moves
  INIT: ['CDRAW.INIT'],
  HLINE: ['CDRAW.HLINE'],
  XOR2: ['CDRAW.XOR2'],
  CLR2: ['CDRAW.CLR2'],
  OR2: ['CDRAW.OR2'],
  MOVEUP: ['CDRAW.MOVEUP'],
  MOVUP2: ['CDRAW.MOVUP2'],
  MOVUP4: ['CDRAW.MOVUP4'],
  MOVUP7: ['CDRAW.MOVUP7'],
  MOVEDOWN: ['CDRAW.MOVEDOWN'],
  MOVDN2: ['CDRAW.MOVDN2'],
  MOVDN4: ['CDRAW.MOVDN4'],
  MOVDN7: ['CDRAW.MOVDN7'],
};

/** code the port counts exactly: [listing, from label, to label) */
const EXACT: [string, string, string][] = [
  ['RUN', 'SND', 'SND4'],
  ['RUN2', 'SOUND', 'SOUND4'],
  ['RUN2', 'GETPLAYERCNT', 'QUIT'],
  ['WIRE', 'SOUND', 'SOUND4'],
];

interface Row { hits: Float64Array; cycles: number; sc: string }

/** "LISTING.LABEL", or "LISTING.LABEL/re": the first line after the label whose text matches re */
export function address(A: Record<string, Assembly>, q: string): number {
  const dot = q.indexOf('.');
  const f = q.slice(0, dot);
  const [l, re] = q.slice(dot + 1).split('/');
  if (re) return lineAfter(A[f], l, new RegExp(re));
  const a = A[f].symbols.get(l);
  if (a === undefined) throw new Error(`no label ${q}`);
  return a;
}

/** what is in memory: CDRAW.S, PPAK.S, RUN.S (its top replaced by RUN2.S's in a game), an overlay at $9500 */
interface Loaded { run2: boolean; overlay: 'EDIT' | 'WIRE' | 'DISK' | null }

/** the charge at each address, and the code the port counts exactly, for what is loaded */
function maps(A: Record<string, Assembly>, keys: string[], l: Loaded): { at: Int16Array; exact: Uint8Array } {
  const files = ['CDRAW', 'PPAK', 'RUN', ...(l.run2 ? ['RUN2'] : []), ...(l.overlay ? [l.overlay] : [])];
  const loaded = (f: string, a: number) => files.includes(f) && !(l.run2 && f === 'RUN' && a >= 0x8554);
  const at = new Int16Array(0x10000).fill(-1);
  keys.forEach((k, i) => {
    for (const q of CHARGES[k]) {
      const a = address(A, q);
      if (loaded(q.split('.')[0], a)) at[a] = i;
    }
  });
  const exact = new Uint8Array(0x10000);
  for (const [f, from, to] of EXACT) if (files.includes(f)) exact.fill(1, A[f].symbols.get(from)!, A[f].symbols.get(to)!);
  return { at, exact };
}

/** which listing a block of memory holds now (compared with what each assembles to there) */
function holds(A: Record<string, Assembly>, ram: Uint8Array, f: string, from: number): boolean {
  let n = 0;
  for (let a = from; a < from + 0x200 && n < 24; a++) {
    if (!A[f].written[a]) continue;
    if (ram[a] !== A[f].mem[a]) return false;
    n++;
  }
  return n > 0;
}

/**
 * Follows the original's code: each charge label owns the cycles from where the code reaches it to
 * where it reaches the next one in the same subroutine call (a subroutine without charges of its own
 * counts to its caller's). `row` takes what was reached and spent since the last call.
 */
function follow(o: Original, keys: string[], owned: Float64Array, reached: Float64Array, l: Loaded, overlays: boolean): { row: () => { hits: Float64Array; cycles: number }; unowned: () => number } {
  const A = o.A as unknown as Record<string, Assembly>;
  const cache = new Map<string, ReturnType<typeof maps>>();
  const get = (x: Loaded) => {
    const key = `${x.run2}${x.overlay}`;
    let v = cache.get(key);
    if (!v) cache.set(key, (v = maps(A, keys, x)));
    return v;
  };
  let { at, exact } = get(l);
  const c = o.m.cpu;
  const ram = o.ram;
  let last = c.cycles;
  let prevPc = -1;
  let hits = new Float64Array(keys.length);
  let cycles = 0;
  let unowned = 0;
  let cur = -1;
  const stack: { s: number; cur: number }[] = [];
  // the overlays come and go (SWAP.S SWAPSECTORS): what is loaded is looked at again after each
  const swap = A.SWAP.symbols.get('SWAPSECTORS')!;
  let look = false;
  // (the test machine does SWAPSECTORS itself, in its trap: no step reaches it)
  const trap = o.m.trap;
  o.m.trap = (pc) => {
    if (pc === swap) look = true;
    return trap?.(pc) ?? false;
  };
  const prev = o.m.onStep;
  o.m.onStep = (pc) => {
    prev?.(pc);
    if (overlays && look && (pc < 0x1e00 || pc >= 0x1f00)) {
      look = false;
      const ov = (['EDIT', 'WIRE', 'DISK'] as const).find((f) => holds(A, ram, f, 0x9500)) ?? null;
      ({ at, exact } = get({ run2: holds(A, ram, 'RUN2', 0x8554), overlay: ov }));
    }
    const now = c.cycles;
    const d = now - last;
    last = now;
    let jsr = false;
    if (prevPc >= 0) {
      const target = ram[prevPc + 1] | (ram[prevPc + 2] << 8);
      jsr = ram[prevPc] === 0x20 && target === pc;
      const rom = ram[prevPc] === 0x20 && target >= 0xf800;
      if (!rom && !exact[prevPc]) {
        cycles += d;
        if (cur >= 0) owned[cur] += d;
        else unowned += d;
      }
    }
    while (stack.length && c.s > stack[stack.length - 1].s) cur = stack.pop()!.cur;
    if (jsr) stack.push({ s: c.s, cur });
    const i = at[pc];
    if (i >= 0) {
      hits[i]++;
      reached[i]++;
      cur = i;
    }
    prevPc = pc;
  };
  return {
    row: () => {
      const r = { hits, cycles };
      hits = new Float64Array(keys.length);
      cycles = 0;
      return r;
    },
    unowned: () => unowned,
  };
}

/**
 * Runs the frame scenarios and the construction set's sessions on the original: the charges, and per
 * frame (each WAIT) what was reached and spent; per scenario or session the original's cycles per frame.
 */
export function measure(names?: string[]): { keys: string[]; rows: Row[]; charges: number[]; unowned: number; frames: Map<string, number[]> } {
  const keys = Object.keys(CHARGES);
  const rows: Row[] = [];
  const frames = new Map<string, number[]>();
  const owned = new Float64Array(keys.length);
  const reached = new Float64Array(keys.length);
  let unowned = 0;
  for (const sc of SCENARIOS) {
    if (names && !names.includes(sc.name)) continue;
    const o = new Original();
    const f = follow(o, keys, owned, reached, { run2: sc.mode === 'game', overlay: null }, false);
    const per: number[] = [];
    let mark = o.m.cpu.cycles;
    runScenario(o, sc, () => {
      rows.push({ ...f.row(), sc: sc.name });
      per.push(o.m.cpu.cycles - mark);
      mark = o.m.cpu.cycles;
    });
    frames.set(sc.name, per);
    unowned += f.unowned();
  }
  for (const s of SESSIONS) {
    const name = `editor-${s.name}`;
    if (names && !names.includes(name)) continue;
    const per: number[] = [];
    let u = () => 0;
    runOriginal(s, 2_000_000_000, (robot, o) => {
      const f = follow(o, keys, owned, reached, { run2: false, overlay: 'EDIT' }, true);
      u = f.unowned;
      let mark = o.m.cpu.cycles;
      const w = robot.wait.bind(robot);
      robot.wait = (n: number) => {
        rows.push({ ...f.row(), sc: name });
        per.push(o.m.cpu.cycles - mark);
        mark = o.m.cpu.cycles;
        w(n);
      };
    });
    frames.set(name, per);
    unowned += u();
  }
  const charges = keys.map((_, i) => (reached[i] ? owned[i] / reached[i] : 0));
  return { keys, rows, charges, unowned, frames };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { keys, rows, charges, unowned, frames } = measure();
  const k = charges.map((v) => Math.round(v));
  let err = 0;
  let tot = 0;
  let pred = 0;
  for (const r of rows) {
    const p = keys.reduce((t, _, i) => t + k[i] * r.hits[i], 0);
    err += Math.abs(p - r.cycles);
    tot += r.cycles;
    pred += p;
  }
  console.log(`frames ${rows.length}: charges/original ${(pred / tot).toFixed(4)}, off by ${((err / tot) * 100).toFixed(1)}% per frame; unowned ${((unowned / tot) * 100).toFixed(2)}%`);
  const by = new Map<string, { e: number; t: number; p: number }>();
  for (const r of rows) {
    const p = keys.reduce((t, _, i) => t + k[i] * r.hits[i], 0);
    const b = by.get(r.sc) ?? { e: 0, t: 0, p: 0 };
    b.e += Math.abs(p - r.cycles);
    b.t += r.cycles;
    b.p += p;
    by.set(r.sc, b);
  }
  for (const [n, b] of by) console.log(`  ${n.padEnd(26)} charges/original ${(b.p / b.t).toFixed(3)}, off by ${((b.e / b.t) * 100).toFixed(1)}% per frame`);
  for (let i = 0; i < keys.length; i++) {
    const n = rows.reduce((t, r) => t + r.hits[i], 0);
    console.log(`${keys[i].padEnd(12)} ${String(k[i]).padStart(6)} x ${n}`);
  }
  let s = '// Generated by test/gen-cycles.ts from the original 6502 code: do not edit. The cycles the\n';
  s += '// original spends, charged where the port reaches these labels (gen-cycles.ts CHARGES), besides\n';
  s += "// what it counts exactly (WAIT, PREAD, the speaker's and the polling loops).\n\n";
  s += 'export const CY = {\n';
  keys.forEach((key, i) => (s += `  ${key}: ${k[i]},\n`));
  s += '} as const;\n';
  writeFileSync(join(import.meta.dirname, '../src/cycles.ts'), s);
  // per scenario and session: the original's cycles per frame, and how often each charge was reached
  let t = '';
  for (const [name, per] of frames) {
    t += `frames ${name} ${per.join(' ')}\n`;
    const n = keys.map((_, i) => rows.reduce((a, r) => a + (r.sc === name ? r.hits[i] : 0), 0));
    t += `reached ${name} ${keys.map((key, i) => (n[i] ? `${key}=${n[i]}` : '')).filter(Boolean).join(' ')}\n`;
  }
  writeFileSync(join(import.meta.dirname, 'golden/timing.txt.gz'), gzipSync(t, { level: 9 }));
}
