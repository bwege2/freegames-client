// al/palette.ts: Allegro 4.4's 256-colour palette (6 bits per component) and colour functions
// (src/gfx.c set_palette/get_palette/fade_*, src/color.c bestfit_color, makecol8, hsv_to_rgb with the
// single-precision float arithmetic of the x86_64 build).

/** a palette: 256 x (r, g, b), each 0..63 */
export type Palette = Uint8Array;

export function newPalette(): Palette {
  return new Uint8Array(768);
}

export const black_palette: Palette = newPalette();

/** _current_palette */
export const current_palette: Palette = newPalette();

/** set when the palette changes (the page redraws) */
let paletteSerial = 0;
export function paletteVersion(): number {
  return paletteSerial;
}

export function set_palette(p: Palette): void {
  current_palette.set(p.subarray(0, 768));
  paletteSerial++;
}

export function set_palette_range(p: Palette, from: number, to: number): void {
  current_palette.set(p.subarray(from * 3, to * 3 + 3), from * 3);
  paletteSerial++;
}

export function get_palette(p: Palette): void {
  p.set(current_palette);
}

/** fade_in/fade_out: the result is the final palette (the original's intermediate steps happen in real
 * time inside one call, without the game's clock moving; the page shows them as an animation) */
export let onFade: ((from: Palette, to: Palette) => void) | null = null;
export function setOnFade(f: ((from: Palette, to: Palette) => void) | null): void {
  onFade = f;
}

export function fade_in(p: Palette): void {
  onFade?.(black_palette, p);
  set_palette(p);
}

export function fade_out(): void {
  const from = current_palette.slice();
  onFade?.(from, black_palette);
  set_palette(black_palette);
}

const colDiff = new Int32Array(3 * 128);
for (let i = 1; i < 64; i++) {
  const k = i * i;
  colDiff[0 + i] = colDiff[0 + 128 - i] = k * (59 * 59);
  colDiff[128 + i] = colDiff[128 + 128 - i] = k * (30 * 30);
  colDiff[256 + i] = colDiff[256 + 128 - i] = k * (11 * 11);
}

export function bestfit_color(pal: Palette, r: number, g: number, b: number): number {
  let bestfit = 0;
  let lowest = 0x7fffffff;
  let i = r === 63 && g === 0 && b === 63 ? 0 : 1;
  for (; i < 256; i++) {
    let coldiff = colDiff[(pal[i * 3 + 1]! - g) & 0x7f]!;
    if (coldiff < lowest) {
      coldiff += colDiff[128 + ((pal[i * 3]! - r) & 0x7f)]!;
      if (coldiff < lowest) {
        coldiff += colDiff[256 + ((pal[i * 3 + 2]! - b) & 0x7f)]!;
        if (coldiff < lowest) {
          bestfit = i;
          if (coldiff === 0) return bestfit;
          lowest = coldiff;
        }
      }
    }
  }
  return bestfit;
}

/** makecol in 8-bit mode (no rgb_map) */
export function makecol(r: number, g: number, b: number): number {
  return bestfit_color(current_palette, r >> 2, g >> 2, b >> 2);
}

const f = Math.fround;

/** hsv_to_rgb with float arithmetic; h, s, v are floats */
export function hsv_to_rgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  v = f(v * f(255.0));
  if (s === 0) {
    r = g = b = Math.trunc(f(v + f(0.5)));
  } else {
    h = f((h % 360.0) / 60.0);
    if (h < 0) h = f(h + 6.0);
    const i = Math.trunc(h);
    const fr = f(h - i);
    const x = f(v * s);
    const y = f(x * fr);
    v = f(v + f(0.5));
    const z = f(v - x);
    switch (i) {
      case 6:
      case 0:
        r = Math.trunc(v);
        g = Math.trunc(f(z + y));
        b = Math.trunc(z);
        break;
      case 1:
        r = Math.trunc(f(v - y));
        g = Math.trunc(v);
        b = Math.trunc(z);
        break;
      case 2:
        r = Math.trunc(z);
        g = Math.trunc(v);
        b = Math.trunc(f(z + y));
        break;
      case 3:
        r = Math.trunc(z);
        g = Math.trunc(f(v - y));
        b = Math.trunc(v);
        break;
      case 4:
        r = Math.trunc(f(z + y));
        g = Math.trunc(z);
        b = Math.trunc(v);
        break;
      case 5:
        r = Math.trunc(v);
        g = Math.trunc(z);
        b = Math.trunc(f(v - y));
        break;
    }
  }
  return [r, g, b];
}

/** _rgb_scale_6 (graphics.c): 6-bit components to 8 bits, as the screen shows them */
export const RGB_SCALE_6 = new Uint8Array([
  0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60,
  65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125,
  130, 134, 138, 142, 146, 150, 154, 158, 162, 166, 170, 174, 178, 182, 186, 190,
  195, 199, 203, 207, 211, 215, 219, 223, 227, 231, 235, 239, 243, 247, 251, 255,
]);
