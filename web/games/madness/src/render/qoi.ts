// Madness Interactive Reloaded port (GPL-3.0). A decoder for the QOI images MIR keeps its backgrounds and
// decals in (the "Quite OK Image" format, qoiformat.org, public domain specification): RGBA bytes, rows top to bottom.
export function decodeQoi(b: Uint8Array): { width: number; height: number; data: Uint8Array } {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (dv.getUint32(0) !== 0x716f6966) throw new Error('not a QOI image');
  const width = dv.getUint32(4);
  const height = dv.getUint32(8);
  const out = new Uint8Array(width * height * 4);
  const index = new Uint8Array(64 * 4);
  let r = 0, g = 0, bl = 0, a = 255;
  let p = 14;
  let run = 0;
  const end = b.length - 8;
  for (let o = 0; o < out.length; o += 4) {
    if (run > 0) run--;
    else if (p < end) {
      const b1 = b[p++];
      if (b1 === 0xfe) { r = b[p++]; g = b[p++]; bl = b[p++]; }
      else if (b1 === 0xff) { r = b[p++]; g = b[p++]; bl = b[p++]; a = b[p++]; }
      else if ((b1 & 0xc0) === 0x00) { const i = b1 * 4; r = index[i]; g = index[i + 1]; bl = index[i + 2]; a = index[i + 3]; }
      else if ((b1 & 0xc0) === 0x40) { r = (r + ((b1 >> 4) & 3) - 2) & 255; g = (g + ((b1 >> 2) & 3) - 2) & 255; bl = (bl + (b1 & 3) - 2) & 255; }
      else if ((b1 & 0xc0) === 0x80) {
        const b2 = b[p++];
        const vg = (b1 & 0x3f) - 32;
        r = (r + vg - 8 + ((b2 >> 4) & 0x0f)) & 255;
        g = (g + vg) & 255;
        bl = (bl + vg - 8 + (b2 & 0x0f)) & 255;
      } else run = b1 & 0x3f;
      const h = ((r * 3 + g * 5 + bl * 7 + a * 11) % 64) * 4;
      index[h] = r; index[h + 1] = g; index[h + 2] = bl; index[h + 3] = a;
    }
    out[o] = r; out[o + 1] = g; out[o + 2] = bl; out[o + 3] = a;
  }
  return { width, height, data: out };
}
