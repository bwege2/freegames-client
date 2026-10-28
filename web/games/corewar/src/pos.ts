// pos.c: the random number generator and the placement of the warriors.
// rng(): the "minimal standard" generator (Park & Miller, CACM 31:10, 1988), or with a non-numeric -F
// argument RC5-32/8/12 in counter mode keyed by that argument. pMARS's ROL/ROR macros shift both ways
// by the same amount (x << n | x >> n), not a true rotation: kept as they are, since they decide the
// positions.
import { g } from './global.ts';
import { u32 } from './libc.ts';

let counter = 0;
const schedule = new Uint32Array(2 * (12 + 1));

export function reset_pos(): void {
  counter = 0;
  schedule.fill(0);
}

export function rng(seed: number): number {
  let temp = seed | 0;
  if (!g.useExtRNG) {
    temp = 16807 * (temp % 127773) - 2836 * Math.trunc(temp / 127773);
    if (temp < 0) temp += 2147483647;
    return temp | 0;
  }
  if (!counter) init_rc5(schedule);
  const ab = rc5_crypt(0, counter, schedule, 12);
  counter = u32(counter + 1);
  return ab[1] & 0x7fffffff;
}

const RETRIES1 = 20; /* how many times to try generating one position */
const RETRIES2 = 4; /* how many times to start backtracking */

/** returns 1 if no placement was found (then npos() places them) */
export function posit(): number {
  let pos = 1, i: number, retries1 = RETRIES1, retries2 = RETRIES2;
  let diff: number;
  const warrior = g.warrior;
  do {
    /* generate */
    warrior[pos].position = ((g.seed = rng(g.seed)) % (g.coreSize - 2 * g.separation + 1)) + g.separation;
    /* test for overlap */
    for (i = 1; i < pos; ++i) {
      /* calculate positive difference */
      diff = warrior[pos].position - warrior[i].position;
      if (diff < 0) diff = -diff;
      if (diff < g.separation) break; /* overlap! */
    }
    if (i === pos) ++pos; /* no overlap, generate next number */
    else { /* overlap */
      if (!retries2) return 1; /* exceeded attempts, fail */
      if (!retries1) { /* backtrack: generate new sequence starting at an arbitrary position (last conflict) */
        pos = i;
        --retries2;
        retries1 = RETRIES1;
      } else --retries1; /* generate new current number (pos not incremented) */
    }
  } while (pos < g.warriors);
  return 0;
}

export function npos(): void {
  let i: number, j: number;
  let temp: number;
  const warrior = g.warrior;
  const room = u32(g.coreSize - g.separation * g.warriors + 1);
  for (i = 1; i < g.warriors; i++) {
    temp = u32(g.seed = rng(g.seed)) % room;
    for (j = i - 1; j > 0; j--) {
      if (temp > u32(warrior[j].position)) break;
      warrior[j + 1].position = warrior[j].position;
    }
    warrior[j + 1].position = temp | 0;
  }
  temp = g.separation;
  for (i = 1; i < g.warriors; i++) {
    warrior[i].position += temp;
    temp += g.separation;
  }
  for (i = 1; i < g.warriors; i++) {
    j = ((g.seed = rng(g.seed)) % (g.warriors - i)) + i;
    temp = warrior[j].position;
    warrior[j].position = warrior[i].position;
    warrior[i].position = temp;
  }
}

function init_rc5(s: Uint32Array): void {
  let a = 0, b = 0;
  const p = g.SWITCH_F ?? '';
  let k = 0;
  while (k < p.length) {
    for (let i = 0; k < p.length && i < 4; i++, k++) a = u32(a ^ (p.charCodeAt(k) << (i * 8)));
    for (let i = 0; k < p.length && i < 4; i++, k++) b = u32(b ^ (p.charCodeAt(k) << (i * 8)));
  }
  rc5_schedule(s, a, b, 12);
}

/* pos.c's ROL/ROR: (x << (y&31)) | (x >> (y&31)) */
const ROL = (x: number, y: number): number => u32((x << (y & 31)) | (x >>> (y & 31)));

const _P = 0xb7e15163, _Q = 0x9e3779b9;

function rc5_crypt(a: number, b: number, C: Uint32Array, rounds: number): [number, number] {
  let A = u32(a + C[0]);
  let B = u32(b + C[1]);
  for (let k = 2; k < 2 * rounds + 2;) {
    A = u32(A ^ B);
    A = ROL(A, B);
    A = u32(A + C[k]);
    B = u32(A ^ B);
    B = ROL(B, A);
    B = u32(B + C[k + 1]);
    k = k + 2;
  }
  return [A, B];
}

function rc5_schedule(S: Uint32Array, LA: number, LB: number, r: number): void {
  const NKEYS = 2 * (r + 1);
  let A = 0;
  let i: number, k: number;
  A = S[0] = ROL(_P, 3);
  LA = ROL(u32(LA + A), A);
  A = S[1] = ROL(u32(_P + _Q + A + LA), 3);
  LB = ROL(u32(LB + A + LA), u32(A + LA));
  for (S[2] = u32(_P + 2 * _Q), i = 3; i < NKEYS; i++) S[i] = u32(S[i - 1] + _Q);
  k = 0;
  i = 2;
  do {
    do {
      A = S[i] = ROL(u32(S[i] + A + LB), 3);
      LA = ROL(u32(LA + A + LB), u32(A + LB));
      A = S[i + 1] = ROL(u32(S[i + 1] + A + LA), 3);
      LB = ROL(u32(LB + A + LA), u32(A + LA));
      i += 2;
    } while (i < NKEYS);
    k++;
    i = 0;
  } while (k < 3);
}
