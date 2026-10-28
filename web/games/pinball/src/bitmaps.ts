// The parts' bitmaps at $7000-$76F3 (RUN.S: BITMAPS, LAUNCHERB ... BALLB): Bill Budge's original
// bitmaps, from his Atari 800 repository (BITMAPS.OBJ: the same blocks, part for part, in the Atari's
// bit order), put into the Apple's (test/gen-assets.ts). As in the original, a part's frame 0 is its
// picture and each further frame what changes from the one before (ADVANCE draws it over the last,
// exclusive-or; RETREAT draws it again).
import { BITMAPS, START, TITLE } from './assets.ts';
import { m } from './machine.ts';

function decode(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

let bitmaps: Uint8Array | null = null;
let title: Uint8Array | null = null;
let start: Uint8Array | null = null;

/** the tests' comparisons with the original load a fixed fill instead (test/bitmaps.ts) */
export const bitmapOverride: { load: ((ram: Uint8Array) => void) | null } = { load: null };

/** the bitmaps into RAM at $7000 */
export function loadBitmaps(): void {
  if (bitmapOverride.load) {
    bitmapOverride.load(m);
    return;
  }
  bitmaps ??= decode(BITMAPS);
  m.set(bitmaps, 0x7000);
}

/** the title picture into hi-res page 1 (BOOT2.S reads it from the disk) */
export function loadTitle(): void {
  title ??= decode(TITLE);
  m.set(title, 0x2000);
}

/** the starting table's bytes, $4000 on (shell.ts startTable) */
export function startBytes(): Uint8Array {
  start ??= decode(START);
  return start;
}

/** the bitmap bytes (for the tests) */
export function bitmapBytes(): Uint8Array {
  bitmaps ??= decode(BITMAPS);
  return bitmaps;
}
