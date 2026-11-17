// gengine/Random.cpp: the program's one C library rand(), shared by the engine (sound choice, the
// disintegration mask, the ZX effect) and Lua's math.random.
import { GlibcRand, RAND_MAX } from '../glibcRand.ts';

class Random {
  rand = new GlibcRand(1);
  randArray = new Uint8Array(255);

  /** Random::init(): srand(time(NULL)), then 255 bytes for the disintegration mask */
  init(seed: number): void {
    this.rand.seed(seed);
    for (let i = 0; i < 255; i++) this.randArray[i] = this.randomInt(256);
  }

  randomInt(bound: number): number {
    if (bound === 0) return 0;
    return this.rand.next() % bound;
  }

  randomReal(bound: number): number {
    return (bound * this.rand.next()) / (RAND_MAX + 1.0);
  }

  aByte(index: number): number {
    return this.randArray[index % 255];
  }
}

export const rng = new Random();
