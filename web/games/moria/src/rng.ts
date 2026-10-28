// rng.cpp: Random number generator
//
// A prime modulus multiplicative congruential generator (PMMLCG), also known as a Lehmer Grammer,
// with Schrage's method (Stephen K. Park and Keith W. Miller, "Random Number Generators: Good ones
// are hard to find", Communications of the ACM, October 1988, vol 31, number 10, pp. 1192-1201).
// Has a full period of 2^31 - 1. Returns integers in the range 1 to 2^31-1.
import { onReset } from './reset.ts';

const RNG_M = 2147483647; // m = 2^31 - 1
const RNG_A = 16807;
const RNG_Q = 127773; // m div a
const RNG_R = 2836; // m mod a

// 32 bit seed
let rnd_seed = 0;

onReset(() => {
  rnd_seed = 0;
});

export function getRandomSeed(): number {
  return rnd_seed;
}

export function setRandomSeed(seed: number): void {
  // set seed to value between 1 and m-1
  rnd_seed = (((seed >>> 0) % (RNG_M - 1)) + 1) >>> 0;
}

// returns a pseudo-random number from set 1, 2, ..., RNG_M - 1
export function rnd(): number {
  const high = Math.trunc(rnd_seed / RNG_Q);
  const low = rnd_seed % RNG_Q;
  const test = RNG_A * low - RNG_R * high;

  if (test > 0) {
    rnd_seed = test;
  } else {
    rnd_seed = test + RNG_M;
  }
  return rnd_seed;
}
