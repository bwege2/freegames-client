// OpenClonk port: the engine's random numbers, src/lib/C4Random.cpp and C4RandomRecord.cpp, with the generator
// they use, pcg32 of thirdparty/pcg (pcg_detail::engine<uint32_t, uint64_t, xsh_rr_mixin, true,
// specific_stream, default_multiplier>), written by hand on bigints (the translator keeps 64-bit integers
// that are not written as int64_t as numbers). Checked against the original by test/math.test.ts.
import { $ } from './registry.ts';

const M64 = (1n << 64n) - 1n;
const MULT = 0x5851f42d4c957f2dn;
const INC = 0x14057b7ef767814fn;

function rotr(value: number, rot: number): number {
  return ((value >>> rot) | (value << ((-rot) & 31))) >>> 0;
}

/** pcg32 */
export class pcg32 {
  state_ = 0n;
  inc_ = INC;

  /** engine(itype state = 0xcafef00dd15ea5e5) */
  init$u64(state: bigint = 0xcafef00dd15ea5e5n): this {
    this.state_ = this.bump((state + this.inc_) & M64);
    return this;
  }

  /** engine(itype state, itype stream): the stream selects the increment (stream << 1 | 1) */
  init$u64$u64(state: bigint, stream: bigint): this {
    this.inc_ = ((stream << 1n) | 1n) & M64;
    this.state_ = this.bump((state + this.inc_) & M64);
    return this;
  }

  bump(state: bigint): bigint {
    return (state * MULT + this.inc_) & M64;
  }

  /** xsh_rr_mixin::output */
  static output(internal: bigint): number {
    const rot = Number(internal >> 59n) & 31;
    internal ^= internal >> 18n;
    return rotr(Number((internal >> 27n) & 0xffffffffn), rot);
  }

  /** operator()(): output of the state before the step (output_previous) */
  op_call$v(): number {
    const old = this.state_;
    this.state_ = this.bump(this.state_);
    return pcg32.output(old);
  }

  /** operator()(upper_bound): pcg_extras::bounded_rand */
  op_call$u32(bound: number): number {
    const threshold = ((0x100000000 - bound) >>> 0) % bound;
    for (;;) {
      const r = this.op_call$v();
      if (r >= threshold) return r % bound;
    }
  }

  seed(s: bigint): void {
    this.inc_ = INC;
    this.init$u64(s);
  }

  // what the particles use (landscape/C4Particles.cpp: a pcg32 per value provider)
  /** engine() */
  init(): this { return this.init$u64(); }
  /** seed(int &): the engine's seed from a value */
  seed$ri32(p: { a: any; o: any }): void { this.seed(BigInt.asUintN(64, BigInt(p.a[p.o] | 0))); }
  seed$mu32(v: number): void { this.seed(BigInt(v >>> 0)); }
  seed$u64(v: bigint | number): void { this.seed(BigInt.asUintN(64, BigInt(v))); }
  /** set_stream (specific_stream): the increment (stream << 1 | 1); the state stays */
  set_stream(stream: bigint | number): void { this.inc_ = ((BigInt.asUintN(64, BigInt(stream)) << 1n) | 1n) & M64; }
  /** advance(delta): the state delta steps on (pcg's jump-ahead of the LCG) */
  advance$u64(delta: bigint | number): void {
    let d = BigInt.asUintN(64, BigInt(delta));
    let curMult = MULT, curPlus = this.inc_, accMult = 1n, accPlus = 0n;
    while (d > 0n) {
      if (d & 1n) {
        accMult = (accMult * curMult) & M64;
        accPlus = (accPlus * curMult + curPlus) & M64;
      }
      curPlus = ((curMult + 1n) * curPlus) & M64;
      curMult = (curMult * curMult) & M64;
      d >>= 1n;
    }
    this.state_ = (accMult * this.state_ + accPlus) & M64;
  }
  $assign(o: pcg32): this {
    this.state_ = o.state_;
    this.inc_ = o.inc_;
    return this;
  }

  $clone(): pcg32 {
    const r = new pcg32();
    r.state_ = this.state_;
    r.inc_ = this.inc_;
    return r;
  }
}

const RandomRng = new pcg32().init$u64();
const UnsyncedRandomRng = (() => {
  const w = new Uint32Array(4);
  globalThis.crypto.getRandomValues(w);
  return new pcg32().init$u64$u64((BigInt(w[0]) << 32n) | BigInt(w[1]), (BigInt(w[2]) << 32n) | BigInt(w[3]));
})();

$.RandomCount = 0;

/** a listener for every synchronized random number (the debug record) */
let recorder: ((range: number, val: number) => void) | null = null;
export function setRandomRecorder(f: ((range: number, val: number) => void) | null): void {
  recorder = f;
}

/** C4RandomRecord.cpp RecordRandom */
export function RecordRandom(range: number, val: number): void {
  $.RandomCount = ($.RandomCount + 1) | 0;
  // C4GameControl::DbgRec skips recording inside C4DebugRecOff blocks
  if (recorder && (($.DoNoDebugRec as number) | 0) <= 0) recorder(range, val);
  if ($.Config?.General?.DebugRec) $.AddDbgRec(0x85 /*RCT_Random*/, { Cnt: $.RandomCount, Range: range >>> 0, Val: val >>> 0 }, 12);
}

/** FixedRandom(uint64_t seed) */
export function FixedRandom(seed: bigint): void {
  RandomRng.seed(BigInt.asUintN(64, seed));
  $.RandomCount = 0;
}

export function Random$v(): number {
  const result = RandomRng.op_call$v();
  RecordRandom(0xffffffff, result);
  return result;
}

export function Random$u32(iRange: number): number {
  if (!iRange) return 0;
  const result = RandomRng.op_call$u32(iRange);
  RecordRandom(iRange, result);
  return result;
}

export function UnsyncedRandom$v(): number {
  return UnsyncedRandomRng.op_call$v();
}

export function UnsyncedRandom$u32(iRange: number): number {
  if (!iRange) return 0;
  return UnsyncedRandomRng.op_call$u32(iRange);
}

export function SeededRandom(iSeed: bigint, iRange: number): number {
  if (!iRange) return 0;
  const rng = new pcg32().init$u64(BigInt.asUintN(64, iSeed));
  return rng.op_call$u32(iRange);
}
