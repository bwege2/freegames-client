// graphics/Pixel.h (RGB as a packed 0xRRGGBB number), graphics/Gradient.cpp, the renderer's colour tables
// (Renderer::PopulateTables) and Probability.cpp.
import { f, itrunc } from './cpp.ts';

export function Red(c: number): number { return (c >>> 16) & 0xFF; }
export function Green(c: number): number { return (c >>> 8) & 0xFF; }
export function Blue(c: number): number { return c & 0xFF; }
/** RGB(r, g, b).Pack(): the constructor keeps the low 8 bits of each */
export function rgb(r: number, g: number, b: number): number { return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF); }

/** RGB::Blend(RGBA other) with other = (r, g, b, a) */
export function blend(c: number, r: number, g: number, b: number, a: number): number {
  if (a === 0xFF) return rgb(r, g, b);
  return rgb(
    (((a * r + (0xFF - a) * Red(c)) & 0xFFFF) / 0xFF) | 0,
    (((a * g + (0xFF - a) * Green(c)) & 0xFFFF) / 0xFF) | 0,
    (((a * b + (0xFF - a) * Blue(c)) & 0xFFFF) / 0xFF) | 0,
  );
}

/** Gradient(stops, resolution): stops are [colour, point] with float points */
export function Gradient(stops: [number, number][], resolution: number): number[] {
  const table = new Array<number>(resolution).fill(0);
  if (stops.length >= 2) {
    const s = stops.map(([c, p]) => [c, f(p)] as [number, number]).sort((a, b) => a[1] - b[1]);
    let stop = -1;
    for (let i = 0; i < resolution; ++i) {
      const point = f(i / f(resolution));
      while (stop < s.length - 1 && s[stop + 1][1] <= point) ++stop;
      if (stop < 0 || stop >= s.length - 1) continue;
      const left = s[stop], right = s[stop + 1];
      const ff = f(f(point - left[1]) / f(right[1] - left[1]));
      const a = itrunc(f(ff * 0xFF)) & 0xFF;
      table[i] = blend(left[0], Red(right[0]), Green(right[0]), Blue(right[0]), a);
    }
  }
  return table;
}

export const flameTable = Gradient([[0x000000, 0.00], [0x60300F, 0.50], [0xDFBF6F, 0.90], [0xAF9F0F, 1.00]], 200);
export const plasmaTable = Gradient([[0x000000, 0.00], [0x301040, 0.25], [0x301060, 0.50], [0xAFFFFF, 0.90], [0xAFFFFF, 1.00]], 200);
export const heatTable = Gradient([[0x2B00FF, 0.00], [0x003CFF, 0.01], [0x00C0FF, 0.05], [0x00FFEB, 0.08], [0x00FF14, 0.19],
  [0x4BFF00, 0.25], [0xC8FF00, 0.37], [0xFFDC00, 0.45], [0xFF0000, 0.71], [0xFF00DC, 1.00]], 1024);
export const clfmTable = Gradient([[0x000000, 0.00], [0x0A0917, 0.10], [0x19163C, 0.20], [0x28285E, 0.30], [0x343E77, 0.40],
  [0x49769A, 0.60], [0x57A0B4, 0.80], [0x5EC4C6, 1.00]], 200);
export const firwTable = Gradient([[0xFF00FF, 0.00], [0x0000FF, 0.20], [0x00FFFF, 0.40], [0x00FF00, 0.60], [0xFFFF00, 0.80],
  [0xFF0000, 1.00]], 200);

function at(table: number[], index: number): number {
  const size = table.length;
  if (index < 0) index = 0;
  if (index > size - 1) index = size - 1;
  return table[index];
}
/** Renderer::flameTableAt(i) etc.: packed RGB */
export const flameTableAt = (i: number): number => at(flameTable, i);
export const plasmaTableAt = (i: number): number => at(plasmaTable, i);
export const heatTableAt = (i: number): number => at(heatTable, i);
export const clfmTableAt = (i: number): number => at(clfmTable, i);
export const firwTableAt = (i: number): number => at(firwTable, i);

// Probability.cpp

/** Probability::binomial_gte1(n, p): 1.0f - std::pow(1.0f-p, n) (std::pow(float, int) computes in double) */
export function binomial_gte1(n: number, p: number): number {
  return f(1.0 - Math.pow(f(1.0 - p), n));
}

/** Probability::SmallKBinomialGenerator */
export class SmallKBinomialGenerator {
  private cdf: Float32Array;
  private maxK: number;
  constructor(n: number, p: number, maxK: number) {
    this.maxK = maxK;
    this.cdf = new Float32Array(maxK);
    const pdf = new Float32Array(maxK);
    let pTerm = f(Math.pow(f(1.0 - p), n));
    let coeffN = 1, coeffD = 1;
    for (let k = 0; k < maxK; k++) {
      pdf[k] = f(pTerm * f(f(coeffN) / f(coeffD)));
      pTerm = f(pTerm * f(p / f(1.0 - p)));
      coeffN = Math.imul(coeffN, (n - k) >>> 0) >>> 0;
      coeffD = Math.imul(coeffD, k + 1) >>> 0;
    }
    let sum = 0;
    for (let k = 0; k < maxK; k++) { sum = f(sum + pdf[k]); this.cdf[k] = sum; }
  }
  calc(randFloat: number): number {
    for (let k = 0; k < this.maxK; k++) if (randFloat < this.cdf[k]) return k;
    return this.maxK;
  }
}
