// Madness Interactive Reloaded port (GPL-3.0). Walgelijk's Noise (Walgelijk/Shared/Noise.cs) on
// FastNoiseLite (Walgelijk/Shared/FastNoiseLite.cs, MIT, Jordan Peck): the two noises the game uses,
// ValueCubic (Noise.GetValue) and OpenSimplex2S FBm (Noise.GetFractal), both at frequency 20 and seed
// 1337, translated with 32-bit integer hashing (Math.imul) and float rounding where C# keeps floats.
const f = Math.fround;
const PrimeX = 501125321;
const PrimeY = 1136930381;
const PrimeZ = 1720413743;
const FREQ = 20;
const SEED = 1337;

const fastFloor = (v: number): number => (v >= 0 ? Math.trunc(v) : Math.trunc(v) - 1) | 0;

function hash3(seed: number, x: number, y: number, z: number): number {
  return Math.imul(seed ^ x ^ y ^ z, 0x27d4eb2d);
}

function valCoord(seed: number, x: number, y: number, z: number): number {
  let h = hash3(seed, x, y, z);
  h = Math.imul(h, h);
  h ^= h << 19;
  return f(h * f(1 / 2147483648.0));
}

function cubicLerp(a: number, b: number, c: number, d: number, t: number): number {
  const p = f(f(d - c) - f(a - b));
  return f(f(f(f(t * t) * t) * p) + f(f(f(t * t) * f(f(a - b) - p)) + f(f(t * f(c - a)) + b)));
}

function singleValueCubic(seed: number, x: number, y: number, z: number): number {
  let x1 = fastFloor(x);
  let y1 = fastFloor(y);
  let z1 = fastFloor(z);
  const xs = f(x - x1);
  const ys = f(y - y1);
  const zs = f(z - z1);
  x1 = Math.imul(x1, PrimeX);
  y1 = Math.imul(y1, PrimeY);
  z1 = Math.imul(z1, PrimeZ);
  const xa = [(x1 - PrimeX) | 0, x1, (x1 + PrimeX) | 0, (x1 + Math.imul(PrimeX, 2)) | 0];
  const ya = [(y1 - PrimeY) | 0, y1, (y1 + PrimeY) | 0, (y1 + Math.imul(PrimeY, 2)) | 0];
  const za = [(z1 - PrimeZ) | 0, z1, (z1 + PrimeZ) | 0, (z1 + Math.imul(PrimeZ, 2)) | 0];
  const zr: number[] = [];
  for (let k = 0; k < 4; k++) {
    const yr: number[] = [];
    for (let j = 0; j < 4; j++) {
      yr.push(cubicLerp(valCoord(seed, xa[0], ya[j], za[k]), valCoord(seed, xa[1], ya[j], za[k]),
        valCoord(seed, xa[2], ya[j], za[k]), valCoord(seed, xa[3], ya[j], za[k]), xs));
    }
    zr.push(cubicLerp(yr[0], yr[1], yr[2], yr[3], ys));
  }
  return f(cubicLerp(zr[0], zr[1], zr[2], zr[3], zs) * f(1 / (1.5 * 1.5 * 1.5)));
}

const GRAD3: number[] = (() => {
  const row = [0, 1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 0, 0, -1, -1, 0, 1, 0, 1, 0, -1, 0, 1, 0, 1, 0, -1, 0, -1, 0, -1, 0,
    1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 0, 0, -1, -1, 0, 0];
  const g: number[] = [];
  for (let i = 0; i < 5; i++) g.push(...row);
  g.push(1, 1, 0, 0, 0, -1, 1, 0, -1, 1, 0, 0, 0, -1, -1, 0);
  return g;
})();

function gradCoord(seed: number, x: number, y: number, z: number, xd: number, yd: number, zd: number): number {
  let h = hash3(seed, x, y, z);
  h ^= h >> 15;
  h &= 63 << 2;
  return f(f(f(xd * GRAD3[h]) + f(yd * GRAD3[h | 1])) + f(zd * GRAD3[h | 2]));
}

function singleOpenSimplex2S(seed: number, x: number, y: number, z: number): number {
  let i = fastFloor(x);
  let j = fastFloor(y);
  let k = fastFloor(z);
  const xi = f(x - i);
  const yi = f(y - j);
  const zi = f(z - k);
  i = Math.imul(i, PrimeX);
  j = Math.imul(j, PrimeY);
  k = Math.imul(k, PrimeZ);
  const seed2 = (seed + 1293373) | 0;
  const xN = Math.trunc(f(-0.5 - xi)) | 0;
  const yN = Math.trunc(f(-0.5 - yi)) | 0;
  const zN = Math.trunc(f(-0.5 - zi)) | 0;
  const x0 = f(xi + xN);
  const y0 = f(yi + yN);
  const z0 = f(zi + zN);
  const a0 = f(0.75 - x0 * x0 - y0 * y0 - z0 * z0);
  const q = (a: number): number => f(f(a * a) * f(a * a));
  let value = f(q(a0) * gradCoord(seed, (i + (xN & PrimeX)) | 0, (j + (yN & PrimeY)) | 0, (k + (zN & PrimeZ)) | 0, x0, y0, z0));
  const x1 = f(xi - 0.5);
  const y1 = f(yi - 0.5);
  const z1 = f(zi - 0.5);
  const a1 = f(0.75 - x1 * x1 - y1 * y1 - z1 * z1);
  value = f(value + q(a1) * gradCoord(seed2, (i + PrimeX) | 0, (j + PrimeY) | 0, (k + PrimeZ) | 0, x1, y1, z1));
  const xF0 = f(((xN | 1) << 1) * x1);
  const yF0 = f(((yN | 1) << 1) * y1);
  const zF0 = f(((zN | 1) << 1) * z1);
  const xF1 = f((-2 - (xN << 2)) * x1 - 1);
  const yF1 = f((-2 - (yN << 2)) * y1 - 1);
  const zF1 = f((-2 - (zN << 2)) * z1 - 1);
  const add = (s: number, a: number, ii: number, jj: number, kk: number, xx: number, yy: number, zz: number): void => {
    value = f(value + q(a) * gradCoord(s, ii | 0, jj | 0, kk | 0, f(xx), f(yy), f(zz)));
  };
  const PX2 = Math.imul(PrimeX, 2);
  const PY2 = PrimeY << 1;
  const PZ2 = PrimeZ << 1;
  let skip5 = false;
  const a2 = f(xF0 + a0);
  if (a2 > 0) add(seed, a2, i + (~xN & PrimeX), j + (yN & PrimeY), k + (zN & PrimeZ), x0 - (xN | 1), y0, z0);
  else {
    const a3 = f(yF0 + zF0 + a0);
    if (a3 > 0) add(seed, a3, i + (xN & PrimeX), j + (~yN & PrimeY), k + (~zN & PrimeZ), x0, y0 - (yN | 1), z0 - (zN | 1));
    const a4 = f(xF1 + a1);
    if (a4 > 0) { add(seed2, a4, i + (xN & PX2), j + PrimeY, k + PrimeZ, (xN | 1) + x1, y1, z1); skip5 = true; }
  }
  let skip9 = false;
  const a6 = f(yF0 + a0);
  if (a6 > 0) add(seed, a6, i + (xN & PrimeX), j + (~yN & PrimeY), k + (zN & PrimeZ), x0, y0 - (yN | 1), z0);
  else {
    const a7 = f(xF0 + zF0 + a0);
    if (a7 > 0) add(seed, a7, i + (~xN & PrimeX), j + (yN & PrimeY), k + (~zN & PrimeZ), x0 - (xN | 1), y0, z0 - (zN | 1));
    const a8 = f(yF1 + a1);
    if (a8 > 0) { add(seed2, a8, i + PrimeX, j + (yN & PY2), k + PrimeZ, x1, (yN | 1) + y1, z1); skip9 = true; }
  }
  let skipD = false;
  const aA = f(zF0 + a0);
  if (aA > 0) add(seed, aA, i + (xN & PrimeX), j + (yN & PrimeY), k + (~zN & PrimeZ), x0, y0, z0 - (zN | 1));
  else {
    const aB = f(xF0 + yF0 + a0);
    if (aB > 0) add(seed, aB, i + (~xN & PrimeX), j + (~yN & PrimeY), k + (zN & PrimeZ), x0 - (xN | 1), y0 - (yN | 1), z0);
    const aC = f(zF1 + a1);
    if (aC > 0) { add(seed2, aC, i + PrimeX, j + PrimeY, k + (zN & PZ2), x1, y1, (zN | 1) + z1); skipD = true; }
  }
  if (!skip5) {
    const a5 = f(yF1 + zF1 + a1);
    if (a5 > 0) add(seed2, a5, i + PrimeX, j + (yN & PY2), k + (zN & PZ2), x1, (yN | 1) + y1, (zN | 1) + z1);
  }
  if (!skip9) {
    const a9 = f(xF1 + zF1 + a1);
    if (a9 > 0) add(seed2, a9, i + (xN & PX2), j + PrimeY, k + (zN & PZ2), (xN | 1) + x1, y1, (zN | 1) + z1);
  }
  if (!skipD) {
    const aD = f(xF1 + yF1 + a1);
    if (aD > 0) add(seed2, aD, i + (xN & (PrimeX << 1)), j + (yN & PY2), k + PrimeZ, (xN | 1) + x1, (yN | 1) + y1, z1);
  }
  return f(value * f(9.046026385208288));
}

/** Noise.GetValue: FastNoiseLite ValueCubic, no 3D transform */
export function noiseValue(x: number, y: number, z: number): number {
  return singleValueCubic(SEED, f(x * FREQ), f(y * FREQ), f(z * FREQ));
}

/** Noise.GetPerlin: FastNoiseLite Perlin, no 3D transform */
export function noisePerlin(x: number, y: number, z: number): number {
  x = f(x * FREQ); y = f(y * FREQ); z = f(z * FREQ);
  let x0 = fastFloor(x), y0 = fastFloor(y), z0 = fastFloor(z);
  const xd0 = f(x - x0), yd0 = f(y - y0), zd0 = f(z - z0);
  const xd1 = f(xd0 - 1), yd1 = f(yd0 - 1), zd1 = f(zd0 - 1);
  const q = (t: number): number => f(f(f(t * t) * t) * f(f(t * f(f(t * 6) - 15)) + 10));
  const xs = q(xd0), ys = q(yd0), zs = q(zd0);
  x0 = Math.imul(x0, PrimeX); y0 = Math.imul(y0, PrimeY); z0 = Math.imul(z0, PrimeZ);
  const x1 = (x0 + PrimeX) | 0, y1 = (y0 + PrimeY) | 0, z1 = (z0 + PrimeZ) | 0;
  const l = (a: number, b: number, t: number): number => f(a + f(t * f(b - a)));
  const g = (xx: number, yy: number, zz: number, a: number, b: number, c: number): number => gradCoord(SEED, xx, yy, zz, a, b, c);
  const xf00 = l(g(x0, y0, z0, xd0, yd0, zd0), g(x1, y0, z0, xd1, yd0, zd0), xs);
  const xf10 = l(g(x0, y1, z0, xd0, yd1, zd0), g(x1, y1, z0, xd1, yd1, zd0), xs);
  const xf01 = l(g(x0, y0, z1, xd0, yd0, zd1), g(x1, y0, z1, xd1, yd0, zd1), xs);
  const xf11 = l(g(x0, y1, z1, xd0, yd1, zd1), g(x1, y1, z1, xd1, yd1, zd1), xs);
  return f(l(l(xf00, xf10, ys), l(xf01, xf11, ys), zs) * f(0.964921414852142333984375));
}

/** Noise.GetSimplex:OpenSimplex2S, one octave, rotated with DefaultOpenSimplex2 */
export function noiseSimplex(x: number, y: number, z: number): number {
  x = f(x * FREQ); y = f(y * FREQ); z = f(z * FREQ);
  const r = f(f(f(x + y) + z) * f(2 / 3));
  return singleOpenSimplex2S(SEED, f(r - x), f(r - y), f(r - z));
}

/** Noise.GetFractal:OpenSimplex2S FBm (lacunarity 2, gain 0.5), rotated with DefaultOpenSimplex2 */
export function noiseFractal(x: number, y: number, z: number, octaves: number): number {
  x = f(x * FREQ); y = f(y * FREQ); z = f(z * FREQ);
  const r = f(f(f(x + y) + z) * f(2 / 3));
  x = f(r - x); y = f(r - y); z = f(r - z);
  let ampFractal = 1;
  let amp0 = 0.5;
  for (let i = 1; i < octaves; i++) { ampFractal = f(ampFractal + amp0); amp0 = f(amp0 * 0.5); }
  let seed = SEED;
  let sum = 0;
  let amp = f(1 / ampFractal);
  for (let i = 0; i < octaves; i++) {
    const n = singleOpenSimplex2S(seed++, x, y, z);
    sum = f(sum + f(n * amp));
    x = f(x * 2); y = f(y * 2); z = f(z * 2);
    amp = f(amp * 0.5);
  }
  return sum;
}
