// The translated fixed-point math (C4Real.h, C4Real.cpp, translated) and random generators (C4Random.cpp, pcg32: rt/random.ts) against
// the original: the same commands go to the oracle (re/openclonk/oracle/harness.cpp, the original code
// compiled with the original's flags) and to src/sim; every answer must be the same. Then the mutation
// check: a copy of the translation with one constant changed must fail the same comparison.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inputs, oracleMissing, runOracle } from './oracle.ts';

type Real = typeof import('../src/sim/lib/C4Real.ts');
type Rand = typeof import('../src/rt/random.ts') & { $: { RandomCount: number } };

const missing = oracleMissing();
const skip = missing ? `the oracle is missing: ${missing}` : false;

/** the commands of harness.cpp: inputs chosen so that the C++ has no undefined behaviour */
function commands(): string[] {
  const g = inputs(20261030);
  const out: string[] = [];
  const fixed = () => g.pick([
    () => g.i32(),                                   // anything
    () => g.int(-1000, 1000) * 65536,                // whole numbers
    () => g.int(-65536 * 50, 65536 * 50),            // small values with fractions
    () => g.int(-70000, 70000),
    () => g.pick([0, 1, -1, 65536, -65536, 32768, -32768, 2147483647, -2147483648, 65535, -65535]),
  ])();
  const small = () => g.int(-32767, 32767);
  const nonzero = (f: () => number) => { let v = 0; while (v === 0) v = f(); return v; };
  const flt = () => String(Math.fround(g.pick([
    () => g.int(-100000, 100000) / 1000,
    () => (g.i32() / 65536),
    () => g.int(-30000, 30000) + g.int(0, 999) / 1000,
  ])()));
  const ranges = [1, 2, 3, 7, 10, 100, 360, 1000, 65536, 0x7fffffff, 0x80000000, 0xffffffff];
  const seeds = [0n, 1n, 42n, 0xffffffffn, 0x100000000n, (1n << 63n) + 12345n, (1n << 64n) - 1n];
  for (let i = 0; i < 13; i++) seeds.push(g.u64());
  for (const s of seeds) {
    out.push(`seed ${s}`);
    for (let i = 0; i < 150; i++) {
      const k = g.int(0, 9);
      if (k === 0) out.push('rand0');
      else if (k < 5) out.push(`rand ${g.pick(ranges)}`);
      else out.push(`rand ${g.int(0, 5000)}`);
    }
    for (let i = 0; i < 20; i++) out.push(`seeded ${g.pick([s, g.u64(), BigInt(g.u32())])} ${g.pick([0, ...ranges, g.u32()])}`);
  }
  for (let i = 0; i < 400; i++) {
    const a = fixed(), b = fixed();
    out.push(`itofix ${small()}`);
    out.push(`itofix2 ${g.int(-30000, 30000)} ${g.pick([1, 2, 3, 7, 10, 100, 256, 1000])}`);
    out.push(`itofix2 ${g.i32()} ${g.int(65536, 0x7fffffff)}`);
    out.push(`ftofix ${flt()}`);
    out.push(`fixtoi ${a}`);
    out.push(`fixtoi2 ${a} ${g.int(-100000, 100000)}`);
    out.push(`fixtof ${a}`);
    const h = g.int(-(1 << 30), 1 << 30), k = g.int(-(1 << 30), 1 << 30);
    out.push(`add ${h} ${k}`, `sub ${h} ${k}`);
    out.push(`mul ${a} ${b}`);
    out.push(`div ${g.int(-(1 << 24), 1 << 24) * 64} ${nonzero(fixed)}`);
    out.push(`addi ${g.int(-(1 << 29), 1 << 29)} ${g.int(-8000, 8000)}`, `subi ${g.int(-(1 << 29), 1 << 29)} ${g.int(-8000, 8000)}`);
    out.push(`muli ${g.int(-(1 << 20), 1 << 20)} ${g.int(-2000, 2000)}`);
    out.push(`divi ${a} ${nonzero(() => g.int(-100000, 100000))}`);
    out.push(`addf ${g.int(-(1 << 29), 1 << 29)} ${g.int(-8000, 8000) + 0.25}`, `subf ${g.int(-(1 << 29), 1 << 29)} ${-g.int(1, 8000) - 0.75}`);
    out.push(`mulf ${g.int(-(1 << 20), 1 << 20)} ${g.int(-2000, 2000) + 0.5}`);
    out.push(`divf ${a} ${g.pick([1, -1]) * (g.int(1, 100000) + 0.5)}`);
    out.push(`cmp ${a} ${g.pick([a, b, a + 1, a - 1])}`);
    out.push(`cmpi ${g.pick([a, g.int(-100, 100) * 65536])} ${g.int(-100, 100)}`);
    out.push(`cmpf ${g.pick([a, 98304, -98304])} ${g.pick([flt(), '1.5', '-1.5'])}`);
    out.push(`neg ${a === -2147483648 ? 0 : a}`, `not ${g.pick([a, 0])}`);
    out.push(`sin ${a}`, `cos ${b}`, `sin ${g.int(-720, 720) * 65536}`, `cos ${g.int(-36000, 36000) * 655}`);
    out.push(`real100 ${small()}`, `real256 ${small()}`, `real10 ${small()}`);
    out.push(`seta ${a} ${small()}`);
    out.push(`compound ${g.int(-(1 << 20), 1 << 20)} ${g.int(1, 1 << 18)}`);
  }
  // every entry of the sine table, through Sin and Cos, at angles from -360 to 360 degrees
  for (let v = -36000; v <= 36000; v++) {
    const val = v >= 0 ? Math.ceil((v * 65536) / 100) : -Math.ceil((-v * 65536) / 100);
    out.push(`sin ${val}`, `cos ${val}`);
  }
  return out;
}

/** what the translation answers to the commands (Real/Rand: the modules under test) */
function answers(real: Real, rand: Rand, cmds: string[]): string[] {
  const { C4Fixed } = real;
  const fx = (v: string) => { const f = new C4Fixed(); f.val = Number(v) | 0; return f; };
  const b = (x: boolean) => (x ? '1' : '0');
  const f32 = (s: string) => Math.fround(Number(s));
  return cmds.map((line) => {
    const [op, x = '0', y = '0'] = line.split(' ');
    switch (op) {
      case 'seed': rand.FixedRandom(BigInt(x)); return String(rand.$.RandomCount);
      case 'rand': return String(rand.Random$u32(Number(x)));
      case 'rand0': return String(rand.Random$v());
      case 'seeded': return String(rand.SeededRandom(BigInt(x), Number(y)));
      case 'itofix': return String(real.itofix$i32(Number(x)).val);
      case 'itofix2': return String(real.itofix$i32$i32(Number(x), Number(y)).val);
      case 'ftofix': return String(real.ftofix(f32(x)).val);
      case 'fixtoi': return String(real.fixtoi$C4Fixed(fx(x)));
      case 'fixtoi2': return String(real.fixtoi$C4Fixed$i32(fx(x), Number(y)));
      case 'fixtof': return String(real.fixtof(fx(x)));
      case 'add': return String(fx(x).op_add$C4Fixed(fx(y)).val);
      case 'sub': return String(fx(x).op_sub$C4Fixed(fx(y)).val);
      case 'mul': return String(fx(x).op_mul$C4Fixed(fx(y)).val);
      case 'div': return String(fx(x).op_div$C4Fixed(fx(y)).val);
      case 'addi': return String(fx(x).op_add$i32(Number(y)).val);
      case 'subi': return String(fx(x).op_sub$i32(Number(y)).val);
      case 'muli': return String(fx(x).op_mul$i32(Number(y)).val);
      case 'divi': return String(fx(x).op_div$i32(Number(y)).val);
      case 'addf': return String(fx(x).op_add$f32(f32(y)).val);
      case 'subf': return String(fx(x).op_sub$f32(f32(y)).val);
      case 'mulf': return String(fx(x).op_mul$f32(f32(y)).val);
      case 'divf': return String(fx(x).op_div$f32(f32(y)).val);
      case 'cmp': { const p = fx(x), q = fx(y);
        return [p.op_eq$C4Fixed(q), p.op_lt$C4Fixed(q), p.op_gt$C4Fixed(q), p.op_le$C4Fixed(q), p.op_ge$C4Fixed(q), p.op_ne$C4Fixed(q)].map(b).join(''); }
      case 'cmpi': { const p = fx(x), q = Number(y);
        return [p.op_eq$i32(q), p.op_lt$i32(q), p.op_gt$i32(q), p.op_le$i32(q), p.op_ge$i32(q), p.op_ne$i32(q)].map(b).join(''); }
      case 'cmpf': { const p = fx(x), q = f32(y);
        return [p.op_eq$f32(q), p.op_lt$f32(q), p.op_gt$f32(q), p.op_le$f32(q), p.op_ge$f32(q), p.op_ne$f32(q)].map(b).join(''); }
      case 'neg': return String(fx(x).op_neg().val);
      case 'not': return b(fx(x).op_not()) + b(fx(x).op_bool());
      case 'sin': return String(real.Sin(fx(x)).val);
      case 'cos': return String(real.Cos(fx(x)).val);
      case 'real100': return String(real.C4REAL100(Number(x)).val);
      case 'real256': return String(real.C4REAL256(Number(x)).val);
      case 'real10': return String(real.C4REAL10(Number(x)).val);
      case 'seta': { const p = fx(x); p.op_assign(Number(y)); return String(p.val); }
      case 'compound': { const fr = fx(x), fb = fx(y);
        fr.op_addAssign$C4Fixed(fb); fr.op_mulAssign$C4Fixed(fb); fr.op_subAssign$C4Fixed(fx(x));
        fr.op_divAssign$C4Fixed(fx(String(Number(y) | 1))); fr.op_addAssign$i32(3); fr.op_subAssign$i32(2); return String(fr.val); }
      default: return '?';
    }
  });
}

/** the commands whose answers differ (fixtof: the oracle prints the float with %.9g) */
function differences(cmds: string[], mine: string[], theirs: string[]): string[] {
  const bad: string[] = [];
  for (let i = 0; i < cmds.length; i++) {
    const same = cmds[i].startsWith('fixtof ') ? Math.fround(Number(theirs[i])) === Number(mine[i]) : mine[i] === theirs[i];
    if (!same) bad.push(`${cmds[i]}: port ${mine[i]}, original ${theirs[i]}`);
  }
  return bad;
}

let cache: { cmds: string[]; theirs: string[] } | null = null;
function oracle() {
  if (!cache) {
    const cmds = commands();
    cache = { cmds, theirs: runOracle(cmds) };
  }
  return cache;
}

test('fixed-point math and random numbers are the original\'s', { skip }, async () => {
  const { cmds, theirs } = oracle();
  assert.equal(theirs.length, cmds.length);
  (await import('../src/sim/index.ts')).initGlobals();
  const real = await import('../src/sim/lib/C4Real.ts');
  const rand = { ...(await import('../src/rt/random.ts')), ...(await import('../src/rt/registry.ts')) };
  const bad = differences(cmds, answers(real, rand, cmds), theirs);
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} of ${cmds.length} answers differ`);
});

/** a copy of src/ (sim and rt) with one change in one module (a path below src/) */
async function mutant(file: string, find: RegExp, replace: string): Promise<Real & Rand> {
  const src = path.resolve(import.meta.dirname, '../src');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openclonk-mutant-'));
  // the copied modules import web dependencies (fflate); make the project's node_modules visible
  fs.symlinkSync(path.join(import.meta.dirname, '../../../node_modules'), path.join(dir, 'node_modules'), 'dir');
  for (const sub of ['sim', 'rt']) fs.cpSync(path.join(src, sub), path.join(dir, sub), { recursive: true });
  const f = path.join(dir, file);
  const text = fs.readFileSync(f, 'utf8');
  assert.match(text, find, 'the constant to change is in the translation');
  fs.writeFileSync(f, text.replace(find, replace));
  (await import(path.join(dir, 'sim/index.ts'))).initGlobals();
  const real = await import(path.join(dir, 'sim/lib/C4Real.ts'));
  const rand = await import(path.join(dir, 'rt/random.ts'));
  const reg = await import(path.join(dir, 'rt/registry.ts'));
  return { ...real, ...rand, ...reg };
}

for (const [what, file, find, replace] of [
  ['FIXED_FPF in itofix', 'sim/lib/C4Real.ts', /this\.val = Math\.imul\(iVal, 65536\);/, 'this.val = Math.imul(iVal, 65537);'],
  ['one value of the sine table', 'sim/lib/C4Real.ts', /\b571, 583\b/, '571, 584'],
  ['the rounding shift of fixtoi', 'sim/lib/C4Real.ts', /r >>= 15;/, 'r >>= 14;'],
  ['the multiplier of pcg32', 'rt/random.ts', /0x5851f42d4c957f2dn/, '0x5851f42d4c957f2fn'],
] as const) {
  test(`mutation check: changing ${what} fails the comparison`, { skip }, async () => {
    const { cmds, theirs } = oracle();
    const m = await mutant(file, find, replace);
    const bad = differences(cmds, answers(m, m, cmds), theirs);
    assert.ok(bad.length > 0, 'the mutant must give other answers than the original');
  });
}
