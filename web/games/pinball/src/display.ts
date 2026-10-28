// The Apple II hi-res screen (page 1, $2000-$3FFF) as the colour monitor showed it: 280 x 192
// pixels, 7 a byte (bit 0 leftmost), the byte's bit 7 choosing the colour pair. Colour comes from the
// NTSC signal: a lone pixel shows violet or green (bit 7 clear) or blue or orange (set), by its column;
// two lit pixels side by side show white; a dark pixel between two lit ones of a colour takes it.
import { m } from './machine.ts';

const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const VIOLET = [255, 68, 253];
const GREEN = [20, 245, 60];
const BLUE = [20, 207, 253];
const ORANGE = [255, 106, 60];

/** the address of row y on hi-res page 1 (interleaved by thirds and eighths) */
export function hiresRow(y: number): number {
  return 0x2000 + ((y & 7) << 10) + (((y >> 3) & 7) << 7) + (y >> 6) * 40;
}

const bits = new Uint8Array(282);
const group = new Uint8Array(282);

function colour(x: number, g: number): number[] {
  if (g) return x & 1 ? ORANGE : BLUE;
  return x & 1 ? GREEN : VIOLET;
}

/** draws page 1 into an ImageData of 280 x 192 */
export function renderHires(out: Uint8ClampedArray, mono = false): void {
  for (let y = 0; y < 192; y++) {
    const base = hiresRow(y);
    for (let b = 0; b < 40; b++) {
      const v = m[base + b];
      const g = v >> 7;
      for (let k = 0; k < 7; k++) {
        bits[1 + b * 7 + k] = (v >> k) & 1;
        group[1 + b * 7 + k] = g;
      }
    }
    let o = y * 280 * 4;
    for (let x = 0; x < 280; x++) {
      const on = bits[x + 1];
      const l = bits[x];
      const r = bits[x + 2];
      let c: number[];
      if (mono) c = on ? WHITE : BLACK;
      else if (on) c = l || r ? WHITE : colour(x, group[x + 1]);
      else if (l && r) c = colour(x - 1, group[x]);
      else c = BLACK;
      out[o++] = c[0];
      out[o++] = c[1];
      out[o++] = c[2];
      out[o++] = 255;
    }
  }
}
