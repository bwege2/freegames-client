// @ts-nocheck
// Brogue CE 1.15.1 Math.c, translated to TypeScript by re/brogue/tools/c2ts (do not edit).
import { struct_pcell, struct_pos, struct_ranctx, struct_randomRange, struct_tcell, struct_windowpos } from './structs.ts';
import { $mul64, $sarr, $sat, $shl64, $shr64, $ta, $u64, G, time } from '../rt/index.ts';
import { COLS, DCOLS, DROWS, FP_BASE, FP_FACTOR, MESSAGE_LINES, RAND_MAX_COMBO, RNG_COSMETIC, RNG_SUBSTANTIVE, ROWS, STAT_BAR_WIDTH } from './consts.ts';

let RNGState: any;
let fp_sqrt$SQUARE_ROOTS: any;

function signum(x: number): number {
  if (x === 0) {
    return 0;
  }
  return x > 0 ? 1 : -1;
}

function posEq(a: struct_pos, b: struct_pos): number {
  return (a.x === b.x && a.y === b.y ? 1 : 0) << 24 >> 24;
}

function coordinatesAreInMap(x: number, y: number): number {
  return (x >= 0 && DCOLS > x && y >= 0 && DROWS > y ? 1 : 0) << 24 >> 24;
}

function isPosInMap(p: struct_pos): number {
  return (p.x >= 0 && DCOLS > p.x && p.y >= 0 && DROWS > p.y ? 1 : 0) << 24 >> 24;
}

function locIsInWindow(w: struct_windowpos): number {
  return (w.window_x >= 0 && COLS > w.window_x && w.window_y >= 0 && ROWS > w.window_y ? 1 : 0) << 24 >> 24;
}

function windowToMap(w: struct_windowpos): struct_pos {
  return struct_pos.$of(w.window_x - STAT_BAR_WIDTH - 1 << 16 >> 16, w.window_y - MESSAGE_LINES << 16 >> 16);
}

function mapToWindow(p: struct_pos): struct_windowpos {
  return struct_windowpos.$of(p.x + STAT_BAR_WIDTH + 1 << 16 >> 16, p.y + MESSAGE_LINES << 16 >> 16);
}

function tmapAt(p: struct_pos): struct_tcell | null {
  ;
  return $sat(G.tmap[p.x], p.y);
}

function pmapAt(p: struct_pos): struct_pcell | null {
  ;
  return $sat(G.pmap[p.x], p.y);
}

function posNeighborInDirection(p: struct_pos, direction_to_step: number): struct_pos {
  ;
  return struct_pos.$of(p.x + G.nbDirs[direction_to_step][0] << 16 >> 16, p.y + G.nbDirs[direction_to_step][1] << 16 >> 16);
}

export function randClump(theRange: struct_randomRange): number {
  return randClumpedRange(theRange.lowerBound, theRange.upperBound, theRange.clumpFactor);
}

export function randClumpedRange(lowerBound: number, upperBound: number, clumpFactor: number): number {
  if (lowerBound >= upperBound) {
    return lowerBound;
  }
  if (1 >= clumpFactor) {
    return rand_range(lowerBound, upperBound) << 16 >> 16;
  }
  let i = 0;
  let total = 0;
  let numSides = ((upperBound - lowerBound) / clumpFactor | 0) << 16 >> 16;
  for (i = 0; (upperBound - lowerBound) % clumpFactor > i; i = i + 1 << 16 >> 16) {
    total = total + rand_range(0, numSides + 1) << 16 >> 16;
  }
  for (; clumpFactor > i; i = i + 1 << 16 >> 16) {
    total = total + rand_range(0, numSides) << 16 >> 16;
  }
  return total + lowerBound << 16 >> 16;
}

export function rand_percent(percent: number): number {
  return (rand_range(0, 99) < ((percent > 0 ? percent : 0) > 100 ? 100 : percent > 0 ? percent : 0) ? 1 : 0) << 24 >> 24;
}

export function shuffleList(list: Ptr | null, listLength: number): void {
  for (let i = 0; listLength - 1 > i; ++i) {
    let r = rand_range(i, listLength - 1) | 0;
    if (i !== r) {
      let buf = list.a[list.o + r];
      list.a[list.o + r] = list.a[list.o + i];
      list.a[list.o + i] = buf;
    }
  }
}

export function fillSequentialList(list: Ptr | null, listLength: number): void {
  let i = 0;
  for (i = 0; listLength > i; i = i + 1 << 16 >> 16) {
    list.a[list.o + i] = i;
  }
}

function ranval(x: struct_ranctx | null): number {
  let e = x.a - ((x.b << 27 >>> 0 | x.b >>> 32 - 27) >>> 0) >>> 0;
  x.a = (x.b ^ (x.c << 17 >>> 0 | x.c >>> 32 - 17) >>> 0) >>> 0;
  x.b = x.c + x.d >>> 0;
  x.c = x.d + e >>> 0;
  x.d = e + x.a >>> 0;
  return x.d;
}

function raninit(x: struct_ranctx | null, seed: bigint): void {
  let i = 0;
  x.a = 4058668781, x.b = x.c = x.d = Number(BigInt.asUintN(32, seed));
  x.c = (x.c ^ Number(BigInt.asUintN(32, seed >> 32n))) >>> 0;
  for (i = 0; 20 > i; i = i + 1 >>> 0) {
    ranval(x);
  }
}

function range(n: number, RNG: number): number {
  let div = 0;
  let r = 0;
  div = Math.trunc(RAND_MAX_COMBO / $u64(n));
  do {
    r = Math.trunc(ranval($sat(RNGState, RNG)) / div);
  } while (r >= n);
  return r;
}

export function rand_range(lowerBound: number, upperBound: number): number {
  if (lowerBound >= upperBound) {
    return lowerBound;
  }
  if (G.rogue.RNG === RNG_SUBSTANTIVE) {
    G.randomNumbersGenerated = $u64(G.randomNumbersGenerated + 1);
  }
  let interval = upperBound - lowerBound + 1;
  ;
  return lowerBound + range(interval, G.rogue.RNG);
}

export function rand_64bits(): bigint {
  if (G.rogue.RNG === RNG_SUBSTANTIVE) {
    G.randomNumbersGenerated = $u64(G.randomNumbersGenerated + 1);
  }
  let hi = BigInt.asUintN(64, BigInt(ranval($sat(RNGState, G.rogue.RNG))));
  let lo = BigInt.asUintN(64, BigInt(ranval($sat(RNGState, G.rogue.RNG))));
  return BigInt.asUintN(64, hi << 32n) | lo;
}

export function seedRandomGenerator(seed: bigint): bigint {
  if (seed === 0n) {
    seed = BigInt.asUintN(64, BigInt.asUintN(64, BigInt(time(null))) - 1352700000n);
  }
  raninit(RNGState[RNG_SUBSTANTIVE], seed);
  raninit(RNGState[RNG_COSMETIC], seed);
  return seed;
}

export function fp_round(x: number): number {
  let div = Math.trunc(x / FP_FACTOR);
  let rem = x % FP_FACTOR;
  let sign = (x >= 0 ? 1 : 0) - (0 > x ? 1 : 0);
  if (rem >= Math.trunc(FP_FACTOR / 2) || Math.trunc(-FP_FACTOR / 2) >= rem) {
    return div + sign;
  } else {
    return div;
  }
}

function msbpos(x: bigint): number {
  if (x === 0n) {
    return 0;
  }
  let n = 0;
  do {
    n += 1;
  } while (x = x >> 1n);
  return n;
}

function fp_exp2(n: number): number {
  return n >= 0 ? $shl64(FP_FACTOR, n) : $shr64(FP_FACTOR, -n);
}

export function fp_sqrt(u: number): number {
  if (0 > u) {
    return -fp_sqrt(-u);
  }
  if ((u & 8323072) === u) {
    return fp_sqrt$SQUARE_ROOTS[$shr64(u, FP_BASE)];
  }
  let k = msbpos(BigInt.asUintN(64, BigInt(u))) - FP_BASE;
  let x = 0;
  let fx = 0;
  let upper = 0;
  let lower = 0;
  upper = fp_exp2((k + (k > 0 ? 1 : 0)) / 2 | 0);
  lower = Math.trunc(upper / 2);
  while (upper !== lower + 1) {
    x = Math.trunc((upper + lower) / 2);
    fx = Math.trunc($mul64(x, x) / 65536) - u;
    if (fx === 0) {
      break;
    } else if (fx > 0) {
      upper = x;
    } else {
      lower = x;
    }
  }
  return x;
}

export function fp_pow(base: number, expn: number): number {
  if (base === 0) {
    return 0;
  }
  if (0 > expn) {
    base = Math.trunc(4294967296 / base);
    expn = -expn;
  }
  let res = FP_FACTOR;
  let err = 0;
  while (expn--) {
    res = $mul64(res, base) + Math.trunc($mul64(err, base) / FP_FACTOR);
    err = res % FP_FACTOR;
    res = Math.trunc(res / FP_FACTOR);
  }
  return res + fp_round(err);
}

export function $init(): void {
  RNGState = $sarr(struct_ranctx, 2);
  fp_sqrt$SQUARE_ROOTS = $ta(Float64Array, 128, [0, 65536, 92682, 113511, 131073, 146543, 160529, 173392, 185363, 196608, 207243, 217359, 227023, 236293, 245213, 253819, 262145, 270211, 278045, 285665, 293086, 300323, 307391, 314299, 321059, 327680, 334169, 340535, 346784, 352923, 358955, 364889, 370727, 376475, 382137, 387717, 393216, 398640, 403991, 409273, 414487, 419635, 424721, 429749, 434717, 439629, 444487, 449293, 454047, 458752, 463409, 468021, 472587, 477109, 481589, 486028, 490427, 494786, 499107, 503391, 507639, 511853, 516031, 520175, 524289, 528369, 532417, 536435, 540423, 544383, 548313, 552217, 556091, 559939, 563762, 567559, 571329, 575077, 578799, 582497, 586171, 589824, 593453, 597061, 600647, 604213, 607755, 611279, 614783, 618265, 621729, 625173, 628599, 632007, 635395, 638765, 642119, 645455, 648773, 652075, 655360, 658629, 661881, 665117, 668339, 671545, 674735, 677909, 681071, 684215, 687347, 690465, 693567, 696657, 699733, 702795, 705845, 708881, 711903, 714913, 717911, 720896, 723869, 726829, 729779, 732715, 735639, 738553]);
}
