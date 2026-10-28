// landscape.cpp: the integer noise behind the maze, the chests and their gems. C's unsigned 32-bit
// arithmetic is kept exactly (Math.imul, >>> 0), so the same seed gives the same world as the original.

/** C's (unsigned int) of a double holding an integer: wraps modulo 2^32 (as x86-64 does). */
export const toUint = (d: number): number => d >>> 0;

/** random32(): linear-congruential mixing of a 32-bit seed */
export function random32(seed: number): number {
  const num1 = (Math.imul(seed, 0xfea09b9d) + 1) >>> 0;
  const num2 = (Math.imul((seed ^ num1) >>> 0, 0x9c129511) + 1) >>> 0;
  const num3 = (Math.imul(seed, 0x2512cfb8) + 1) >>> 0;
  const num4 = (Math.imul((seed ^ num3) >>> 0, 0xb89c8895) + 1) >>> 0;
  const num5 = (Math.imul(seed, 0x6bf962c1) + 1) >>> 0;
  const num6 = (Math.imul((seed ^ num5) >>> 0, 0x4bf962c1) + 1) >>> 0;
  return (num2 ^ (num4 >>> 11) ^ (num6 >>> 22)) >>> 0;
}

const INV_HALF_MAX_INT = 4.65661287416e-10; // invHalfMaxIntAsDouble

/** mixFour( x, y, z, t ) */
export const mixFour = (x: number, y: number, z: number, t: number): number =>
  (x ^ Math.imul(y, 57) ^ Math.imul(z, 131) ^ Math.imul(t, 2383)) >>> 0;

/** noise1dInt32( precomputedMix ): [-1..1] */
export const noise1dInt32 = (mix: number): number => random32(mix) * INV_HALF_MAX_INT - 1;

function blendNoise1d(x: number, y: number, z: number, t: number): number {
  const floorX = Math.floor(x);
  const floorIntX = toUint(floorX);
  if (floorX === x) return noise1dInt32(mixFour(floorIntX, y, z, t));
  const ceilIntX = (floorIntX + 1) >>> 0;
  const f = (1 - Math.cos((x - floorX) * Math.PI)) * 0.5;
  const valueAtFloor = noise1dInt32(mixFour(floorIntX, y, z, t));
  const valueAtCeiling = noise1dInt32(mixFour(ceilIntX, y, z, t));
  return valueAtFloor + f * (valueAtCeiling - valueAtFloor);
}

function blendNoise2d(x: number, y: number, z: number, t: number): number {
  const floorY = Math.floor(y);
  const floorIntY = toUint(floorY);
  if (floorY === y) return blendNoise1d(x, floorIntY, z, t);
  const ceilIntY = (floorIntY + 1) >>> 0;
  const f = (1 - Math.cos((y - floorY) * Math.PI)) * 0.5;
  return f * blendNoise1d(x, ceilIntY, z, t) + (1 - f) * blendNoise1d(x, floorIntY, z, t);
}

function blendNoise3d(x: number, y: number, z: number, t: number): number {
  const floorZ = Math.floor(z);
  const floorIntZ = toUint(floorZ);
  if (floorZ === z) return blendNoise2d(x, y, floorIntZ, t);
  const ceilIntZ = (floorIntZ + 1) >>> 0;
  const f = (1 - Math.cos((z - floorZ) * Math.PI)) * 0.5;
  return f * blendNoise2d(x, y, ceilIntZ, t) + (1 - f) * blendNoise2d(x, y, floorIntZ, t);
}

/** noise3d( x, y, z ): [-1..1] */
export const noise3d = (x: number, y: number, z: number): number => blendNoise3d(x, y, z, 0);
