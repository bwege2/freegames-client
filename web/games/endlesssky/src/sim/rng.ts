// A small deterministic random number generator for the simulation. The
// original uses std::mt19937_64 with libstdc++ distributions; this generator is
// not bit-identical (documented in README), but a seed gives the same game
// every time in this port.

export class Random {
  private state: number;
  private spare: number | null = null;

  constructor(seed = 1) {
    // splitmix32 to spread a string-derived seed.
    let x = seed >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    this.state = (x || 0x9e3779b9) >>> 0;
  }

  /** uniform in [0, 1), xorshift128 style */
  real(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** uniform integer in [0, upperBound), or a full uint32 when no bound */
  int(upperBound = 0x100000000): number {
    return Math.floor(this.real() * upperBound);
  }

  range(low: number, high: number): number {
    return low + this.real() * (high - low);
  }

  /** normal distribution, mean 0, sigma 1 (Box-Muller with a spare) */
  normal(mean = 0, sigma = 1): number {
    if (this.spare !== null) {
      const value = this.spare;
      this.spare = null;
      return mean + sigma * value;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = this.real();
    v = this.real();
    const radius = Math.sqrt(-2 * Math.log(u));
    this.spare = radius * Math.sin(2 * Math.PI * v);
    return mean + sigma * radius * Math.cos(2 * Math.PI * v);
  }

  chance(probability: number): boolean {
    return this.real() < probability;
  }

  pick<T>(list: readonly T[]): T {
    return list[Math.floor(this.real() * list.length)];
  }
}

export function seedFromText(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; ++i) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
