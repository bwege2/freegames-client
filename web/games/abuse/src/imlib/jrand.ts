// imlib/jrand.cpp: the random table (always the same) and the index into it, set from the clock at start
import { platform } from '../rt/platform.ts';

export const RAND_TABLE_SIZE = 1024;
export const rtable = new Uint16Array(RAND_TABLE_SIZE);
export const R = { rand_on: 0 };

export function jrand_init(): void {
  // unsigned long rseed (64 bits): only the low 32 bits reach (rseed >> 16) & 0xffff
  let rseed = ((70 << 24) | (85 << 16) | (67 << 8) | 75) >>> 0; // 'F','U','C','K'
  for (let i = 0; i < RAND_TABLE_SIZE; i++) {
    rseed = (Math.imul(rseed, 0x41c64e6d) + 12345) >>> 0;
    rtable[i] = (rseed >>> 16) & 0xffff;
  }
  R.rand_on = (platform().time() % RAND_TABLE_SIZE) & 0xffff;
}

/** jrand(): the next table entry; rand_on is an unsigned short */
export function jrand(): number {
  const v = rtable[R.rand_on & (RAND_TABLE_SIZE - 1)];
  R.rand_on = (R.rand_on + 1) & 0xffff;
  return v;
}

export function jrandom(x: number): number {
  return jrand() % x;
}
