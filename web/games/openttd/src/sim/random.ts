// OpenTTD's random number generator, exactly as src/core/random_func.cpp
// and src/core/random_func.hpp define it. The game is deterministic: every
// map, vehicle and town draws from this generator in a fixed order.

export const GENERATE_NEW_SEED = 0xffffffff;

export function rotr32(value: number, count: number): number {
  return ((value >>> count) | (value << (32 - count))) >>> 0;
}

/** ScaleToLimit: (uint64_t)value * (uint64_t)limit >> 32. */
export function scaleToLimit(value: number, limit: number): number {
  return Number((BigInt(value >>> 0) * BigInt(limit >>> 0)) >> 32n);
}

export class Randomizer {
  state0 = 0;
  state1 = 0;

  setSeed(seed: number): void {
    this.state0 = seed >>> 0;
    this.state1 = seed >>> 0;
  }

  /** Randomizer::Next() */
  next(): number {
    const s = this.state0;
    const t = this.state1;
    this.state0 = (s + rotr32((t ^ 0x1234567f) >>> 0, 7) + 1) >>> 0;
    this.state1 = (rotr32(s, 3) - 1) >>> 0;
    return this.state1;
  }

  /** RandomRange(limit): a value in [0, limit). */
  nextRange(limit: number): number {
    return scaleToLimit(this.next(), limit);
  }
}

/** The game's Random(), with the same state as _random in the original. */
export class RandomContext {
  random = new Randomizer();
  interactiveRandom = new Randomizer();

  setSeed(seed: number): void {
    this.random.setSeed(seed);
    this.interactiveRandom.setSeed((Math.imul(seed, 0x1234567) >>> 0));
  }

  next(): number {
    return this.random.next();
  }

  nextRange(limit: number): number {
    return scaleToLimit(this.random.next(), limit);
  }

  interactive(): number {
    return this.interactiveRandom.next();
  }
}
