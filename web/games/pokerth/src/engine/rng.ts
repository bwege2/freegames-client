// PokerTH 1.1.2's engine/local_engine/tools.cpp draws from boost::random_device: GetRand is uniform over
// [min, max], ShuffleArrayNonDeterministic is std::random_shuffle. It is not deterministic, so the port
// draws from a seeded stream instead (the online round's seed, or the browser's random numbers for a local
// game): xorshift32 (13, 17, 5); getRand(min, max) = min + next() % (max - min + 1); the shuffle is
// Fisher-Yates from the top with j = next() % (i + 1). The test oracle's tools.cpp (re/pokerth/oracle/)
// is the same stream, so a seed gives the same game in the original engine and in the port.

export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next(): number {
    let x = this.s;
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    this.s = x;
    return x;
  }
  /** Tools::GetRand(minValue, maxValue, 1, &out) */
  getRand(minValue: number, maxValue: number): number {
    return minValue + (this.next() % ((maxValue - minValue + 1) >>> 0));
  }
  /** Tools::GetRand(minValue, maxValue, count, out) */
  getRandArray(minValue: number, maxValue: number, count: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < count; i++) out.push(this.getRand(minValue, maxValue));
    return out;
  }
  /** Tools::ShuffleArrayNonDeterministic */
  shuffle(a: number[]): void {
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.next() % (i + 1);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
  }
}
