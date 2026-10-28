// The VIC-II as Worms? uses it: standard text mode (40x25 characters from screen RAM at $0400, the
// character set the program builds at $0800, colour RAM), and four double-size sprites (the cursors
// over the worms' heads). This draws what the chip would show from its registers and the memory it
// reads; it does not run any program. DOM-free, so the tests can render too.

/** C64 colours (the "Colodore" palette by Philip "Pepto" Timmermann) */
export const PALETTE = [
  0x000000, 0xffffff, 0x813338, 0x75cec8, 0x8e3c97, 0x56ac4d, 0x2e2c9b, 0xedf171,
  0x8e5029, 0x553800, 0xc46c71, 0x4a4a4a, 0x7b7b7b, 0xa9ff9f, 0x706deb, 0xb2b2b2,
];

/** what the VIC reads: the 64 KiB it can see (bank 0), the character ROM, colour RAM, its registers */
export interface VicView {
  ram: Uint8Array;
  chargen: Uint8Array;
  color: Uint8Array;
  vic: Uint8Array;
}

/** the visible frame: the 320x200 display window and some border around it */
export const BORDER_X = 24;
export const BORDER_Y = 20;
export const FRAME_W = 320 + 2 * BORDER_X;
export const FRAME_H = 200 + 2 * BORDER_Y;
/** NTSC C64 pixels are narrower than they are high */
export const PIXEL_ASPECT = 0.75;

/** Draws one frame into `out` (RGBA, FRAME_W x FRAME_H). */
export function renderFrame(v: VicView, out: Uint8ClampedArray): void {
  const reg = v.vic;
  const border = PALETTE[reg[0x20] & 15];
  const bg = PALETTE[reg[0x21] & 15];
  const px = new Uint32Array(FRAME_W * FRAME_H); // 0xRRGGBB
  px.fill(border);
  const screen = ((reg[0x18] >> 4) & 15) * 0x400;
  const charBase = ((reg[0x18] >> 1) & 7) * 0x800;
  const glyph = (code: number, row: number): number => {
    const a = charBase + code * 8 + row;
    // in VIC bank 0 the character ROM appears at $1000-$1FFF
    if (charBase === 0x1000 || charBase === 0x1800) return v.chargen[(a - 0x1000) & 0xfff];
    return v.ram[a & 0xffff];
  };
  for (let cy = 0; cy < 25; cy++) {
    for (let cx = 0; cx < 40; cx++) {
      const i = cy * 40 + cx;
      const code = v.ram[screen + i];
      const fg = PALETTE[v.color[i] & 15];
      for (let r = 0; r < 8; r++) {
        const bits = glyph(code, r);
        const o = (BORDER_Y + cy * 8 + r) * FRAME_W + BORDER_X + cx * 8;
        for (let b = 0; b < 8; b++) px[o + b] = bits & (0x80 >> b) ? fg : bg;
      }
    }
  }
  // sprites: sprite 0 in front of 1 and so on, all in front of the characters (priority register 0)
  for (let s = 7; s >= 0; s--) {
    if (!(reg[0x15] & (1 << s))) continue;
    const x = reg[s * 2] | (reg[0x10] & (1 << s) ? 0x100 : 0);
    const y = reg[s * 2 + 1];
    const ptr = v.ram[screen + 0x3f8 + s];
    const data = ptr * 64;
    const xw = reg[0x1d] & (1 << s) ? 2 : 1;
    const yh = reg[0x17] & (1 << s) ? 2 : 1;
    const col = PALETTE[reg[0x27 + s] & 15];
    for (let r = 0; r < 21; r++) {
      for (let b = 0; b < 24; b++) {
        const byte = v.ram[(data + r * 3 + (b >> 3)) & 0xffff];
        if (!(byte & (0x80 >> (b & 7)))) continue;
        for (let dy = 0; dy < yh; dy++) {
          const fy = y + r * yh + dy - 50 + BORDER_Y;
          if (fy < 0 || fy >= FRAME_H) continue;
          for (let dx = 0; dx < xw; dx++) {
            const fx = x + b * xw + dx - 24 + BORDER_X;
            if (fx >= 0 && fx < FRAME_W) px[fy * FRAME_W + fx] = col;
          }
        }
      }
    }
  }
  for (let i = 0; i < px.length; i++) {
    const c = px[i];
    out[i * 4] = c >> 16;
    out[i * 4 + 1] = (c >> 8) & 0xff;
    out[i * 4 + 2] = c & 0xff;
    out[i * 4 + 3] = 255;
  }
}
