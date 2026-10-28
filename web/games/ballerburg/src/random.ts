// The game's rand() and srand(): glibc's generator (glibcRand.ts), and how many numbers were drawn (the
// tests compare that count with the original's).
import { GlibcRand } from './glibcRand.ts';

let r = new GlibcRand(1);
let count = 0;

/** srand(seed); the original never calls it: it starts with glibc's seed 1 */
export function srand(seed: number): void {
  r = new GlibcRand(seed >>> 0);
  count = 0;
}

export function rand(): number {
  count++;
  return r.next();
}

export function randCount(): number {
  return count;
}
