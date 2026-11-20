// Madness Interactive Reloaded port (GPL-3.0). System.Random with a seed, as .NET 9 implements it
// (Net5CompatSeedImpl: Knuth's subtractive generator from Numerical Recipes), with Next, NextSingle, GetItems and
// Shuffle; IncidentConfig.CreateCampaign draws an incident's levels and enemies from it.
export class DotNetRandom {
  private seedArray = new Int32Array(56);
  private inext = 0;
  private inextp = 21;
  constructor(seed: number) {
    const MBIG = 2147483647;
    let subtraction = seed === -2147483648 ? MBIG : Math.abs(seed);
    let mj = 161803398 - subtraction;
    this.seedArray[55] = mj;
    let mk = 1;
    let ii = 0;
    for (let i = 1; i < 55; i++) {
      if ((ii += 21) >= 55) ii -= 55;
      this.seedArray[ii] = mk;
      mk = mj - mk;
      if (mk < 0) mk += MBIG;
      mj = this.seedArray[ii];
    }
    for (let k = 1; k < 5; k++) {
      for (let i = 1; i < 56; i++) {
        let n = i + 30;
        if (n >= 55) n -= 55;
        let v = this.seedArray[i] - this.seedArray[1 + n];
        if (v < 0) v += MBIG;
        this.seedArray[i] = v;
      }
    }
  }
  private internalSample(): number {
    let locINext = this.inext;
    let locINextp = this.inextp;
    if (++locINext >= 56) locINext = 1;
    if (++locINextp >= 56) locINextp = 1;
    let ret = this.seedArray[locINext] - this.seedArray[locINextp];
    if (ret === 2147483647) ret--;
    if (ret < 0) ret += 2147483647;
    this.seedArray[locINext] = ret;
    this.inext = locINext;
    this.inextp = locINextp;
    return ret;
  }
  /** Sample(): [0, 1) */
  sample(): number { return this.internalSample() * (1.0 / 2147483647); }
  /** Next(maxValue) */
  nextMax(max: number): number { return Math.trunc(this.sample() * max); }
  /** Next(minValue, maxValue) */
  next(min: number, max: number): number {
    const range = max - min;
    if (range <= 2147483647) return Math.trunc(this.sample() * range) + min;
    return Math.trunc(this.largeSample() * range) + min;
  }
  private largeSample(): number {
    let result = this.internalSample();
    if (this.internalSample() % 2 === 0) result = -result;
    let d = result;
    d += 2147483647 - 1;
    d /= 2 * 2147483647 - 1;
    return d;
  }
  /** NextSingle() */
  nextSingle(): number { return Math.fround(this.sample()); }
  /** GetItems(choices, length) */
  getItems<T>(choices: readonly T[], length: number): T[] {
    const out: T[] = [];
    for (let i = 0; i < length; i++) out.push(choices[this.nextMax(choices.length)]);
    return out;
  }
  /** Shuffle(values), in place */
  shuffle<T>(values: T[]): void {
    const n = values.length;
    for (let i = 0; i < n - 1; i++) {
      const j = this.next(i, n);
      if (j !== i) { const t = values[i]; values[i] = values[j]; values[j] = t; }
    }
  }
}
