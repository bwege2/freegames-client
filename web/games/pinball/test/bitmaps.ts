// The fill the comparisons with the original use for the part bitmaps at $7000-$76FF: the original's
// bitmaps are not published, and the drawing code is the same whatever the bytes are.
export function bitmapPattern(ram: Uint8Array): void {
  for (let a = 0x7000; a < 0x7700; a++) ram[a] = (((a * 37) >> 3) & 0x7f) | ((a & 0x20) << 2);
}
