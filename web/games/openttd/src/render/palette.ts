// The OpenTTD DOS palette and its animated ranges, exactly as
// src/palette.cpp: DoPaletteAnimations fills the 28 entries at 227.
import paletteData from '../../assets/palette.json';

export interface PaletteFile {
  animStart: number;
  animSize: number;
  palette: number[][];
  animation: {
    darkWater: number[][];
    darkWaterToyland: number[][];
    lighthouse: number[][];
    oilRefinery: number[][];
    fizzyDrink: number[][];
    glitterWater: number[][];
    glitterWaterToyland: number[][];
  };
}

const EXTR = (counter: number, p: number, q: number): number => ((((counter * p) & 0xffff) * q) >> 16);
const EXTR2 = (counter: number, p: number, q: number): number => (((((~counter) >>> 0) * p) & 0xffff) * q >> 16);

export class Palette {
  readonly data: PaletteFile;
  readonly rgba = new Uint8Array(256 * 4);
  private counter = 0;
  private toyland: boolean;

  constructor(data: PaletteFile = paletteData as PaletteFile, toyland = false) {
    this.data = data;
    this.toyland = toyland;
    this.reset();
  }

  reset(): void {
    for (let i = 0; i < 256; i++) {
      const c = this.data.palette[i];
      this.rgba[i * 4] = c[0];
      this.rgba[i * 4 + 1] = c[1];
      this.rgba[i * 4 + 2] = c[2];
      this.rgba[i * 4 + 3] = i === 0 ? 0 : c[3] ?? 255;
    }
    this.animate();
  }

  /** DoPaletteAnimations: one call per drawn frame, like the original. */
  animate(): void {
    this.counter += 8;
    const start = this.data.animStart;
    const A = this.data.animation;
    let p = start;
    const put = (c: number[]): void => {
      this.rgba[p * 4] = c[0];
      this.rgba[p * 4 + 1] = c[1];
      this.rgba[p * 4 + 2] = c[2];
      this.rgba[p * 4 + 3] = 255;
      p++;
    };

    // Fizzy drink bubbles.
    {
      const s = A.fizzyDrink;
      let j = EXTR2(this.counter, 512, s.length);
      for (let i = 0; i < s.length; i++) { put(s[j]); if (++j === s.length) j = 0; }
    }
    // Oil refinery fire.
    {
      const s = A.oilRefinery;
      let j = EXTR2(this.counter, 512, s.length);
      for (let i = 0; i < s.length; i++) { put(s[j]); if (++j === s.length) j = 0; }
    }
    // Radio tower blinking (two entries).
    {
      for (let k = 0; k < 2; k++) {
        let i = (this.counter >> 1) & 0x7f;
        if (k === 1) i ^= 0x40;
        const v = i < 0x3f ? 255 : (i < 0x4a || i >= 0x75) ? 128 : 20;
        put([v, 0, 0]);
      }
    }
    // Lighthouse and stadium.
    {
      const s = A.lighthouse;
      let j = EXTR(this.counter, 256, s.length);
      for (let i = 0; i < s.length; i++) { put(s[j]); if (++j === s.length) j = 0; }
    }
    // Dark blue water.
    {
      const s = this.toyland ? A.darkWaterToyland : A.darkWater;
      let j = EXTR(this.counter, 320, s.length);
      for (let i = 0; i < s.length; i++) { put(s[j]); if (++j === s.length) j = 0; }
    }
    // Glittery water (5 entries, every third of 15).
    {
      const s = this.toyland ? A.glitterWaterToyland : A.glitterWater;
      let j = EXTR(this.counter, 128, s.length);
      for (let i = 0; i < s.length / 3; i++) {
        put(s[j]);
        j += 3;
        if (j >= s.length) j -= s.length;
      }
    }
  }
}
