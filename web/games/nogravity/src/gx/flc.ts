// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the Autodesk FLI/FLC animations (rlx32/src/gx_flc.c):
// explosions, lens flares, the menu cursors and the ships of the mission map. A decoder of the
// standard chunk types: COLOR_256 (4), DELTA_FLC (7), COLOR_64 (11), DELTA_FLI (12), BLACK (13),
// BYTE_RUN (15), FLI_COPY (16).

export interface FlcFrame {
  /** palette indices */
  pixels: Uint8Array;
  /** the palette in force for this frame (256 x RGB) */
  palette: Uint8Array;
}
export interface Flc {
  width: number;
  height: number;
  /** FLC: milliseconds per frame (the header's speed) */
  speed: number;
  frames: FlcFrame[];
}

export function decodeFlc(b: Uint8Array): Flc {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const magic = dv.getUint16(4, true);
  const numFrames = dv.getUint16(6, true);
  const width = dv.getUint16(8, true), height = dv.getUint16(10, true);
  const speed = dv.getInt32(16, true);
  const isFli = magic === 0xaf11;
  const pixels = new Uint8Array(width * height);
  const palette = new Uint8Array(768);
  const frames: FlcFrame[] = [];
  let at = isFli ? 128 : (dv.getInt32(80, true) || 128);
  for (let f = 0; f < numFrames && at + 16 <= b.length; f++) {
    const size = dv.getUint32(at, true), type = dv.getUint16(at + 4, true), chunks = dv.getUint16(at + 6, true);
    if (type === 0xf1fa) {
      let c = at + 16;
      for (let k = 0; k < chunks; k++) {
        const csize = dv.getUint32(c, true), ctype = dv.getUint16(c + 4, true);
        decodeChunk(b, dv, c + 6, ctype, width, height, pixels, palette);
        c += csize;
      }
      frames.push({ pixels: pixels.slice(), palette: palette.slice() });
    }
    at += size;
  }
  return { width, height, speed: isFli ? speed * 14 : speed, frames };
}

function decodeChunk(b: Uint8Array, dv: DataView, p: number, type: number, w: number, h: number, px: Uint8Array, pal: Uint8Array): void {
  switch (type) {
    case 4: case 11: {
      const scale = type === 11 ? 4 : 1;
      const packets = dv.getUint16(p, true); p += 2;
      let idx = 0;
      for (let i = 0; i < packets; i++) {
        idx += b[p++];
        let n = b[p++]; if (n === 0) n = 256;
        for (let j = 0; j < n && idx < 256; j++, idx++) {
          pal[3 * idx] = Math.min(255, b[p++] * scale); pal[3 * idx + 1] = Math.min(255, b[p++] * scale); pal[3 * idx + 2] = Math.min(255, b[p++] * scale);
        }
      }
      break;
    }
    case 13: px.fill(0); break;
    case 16: px.set(b.subarray(p, p + w * h)); break;
    case 15: {
      for (let y = 0; y < h; y++) {
        let x = 0; p++; // packet count (ignored, as most players do)
        while (x < w) {
          const n = (b[p++] << 24) >> 24;
          if (n < 0) { for (let i = 0; i < -n && x < w; i++) px[y * w + x++] = b[p++]; }
          else { const v = b[p++]; for (let i = 0; i < n && x < w; i++) px[y * w + x++] = v; }
        }
      }
      break;
    }
    case 12: {
      let y = dv.getUint16(p, true); p += 2;
      const lines = dv.getUint16(p, true); p += 2;
      for (let l = 0; l < lines; l++, y++) {
        let x = 0;
        const packets = b[p++];
        for (let k = 0; k < packets; k++) {
          x += b[p++];
          const n = (b[p++] << 24) >> 24;
          if (n > 0) { for (let i = 0; i < n; i++) px[y * w + x++] = b[p++]; }
          else { const v = b[p++]; for (let i = 0; i < -n; i++) px[y * w + x++] = v; }
        }
      }
      break;
    }
    case 7: {
      let lines = dv.getUint16(p, true); p += 2;
      let y = 0;
      while (lines > 0) {
        let word = dv.getInt16(p, true); p += 2;
        if ((word & 0xc000) === 0xc000) { y -= word; continue; } // skip -word lines
        if ((word & 0xc000) === 0x8000) { // last pixel of the line, then the packet count follows
          px[y * w + w - 1] = word & 0xff;
          word = dv.getInt16(p, true); p += 2;
        }
        let x = 0;
        for (let k = 0; k < word; k++) {
          x += b[p++];
          const n = (b[p++] << 24) >> 24;
          if (n > 0) { for (let i = 0; i < n; i++) { px[y * w + x++] = b[p++]; px[y * w + x++] = b[p++]; } }
          else { const v0 = b[p++], v1 = b[p++]; for (let i = 0; i < -n; i++) { px[y * w + x++] = v0; px[y * w + x++] = v1; } }
        }
        y++; lines--;
      }
      break;
    }
    default: break;
  }
}
