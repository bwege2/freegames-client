// score.cpp: the score in the strip above the world, right-aligned, 3x4 numerals with a 1-pixel gap.
import { GraphicContainer } from './World.ts';

const NUMERAL_W = 3, NUMERAL_H = 4;
export const SCORE_HEIGHT = NUMERAL_H;

export class Score {
  private readonly argb: Uint32Array;

  constructor(numerals: GraphicContainer) {
    const n = numerals.w * numerals.h;
    this.argb = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      const r = Math.trunc(numerals.red[i]) & 0xff, g = Math.trunc(numerals.green[i]) & 0xff, b = Math.trunc(numerals.blue[i]) & 0xff;
      this.argb[i] = (r << 16) | (g << 8) | b;
    }
  }

  draw(image: Uint32Array, width: number, score: number): void {
    const digits = String(score);
    let xPosition = width - digits.length * (NUMERAL_W + 1);
    for (const d of digits) {
      const n = d.charCodeAt(0) - 48;
      for (let y = 0; y < NUMERAL_H; y++) {
        const ny = y + n * (NUMERAL_H + 1);
        for (let x = 0; x < NUMERAL_W; x++) image[y * width + x + xPosition] = this.argb[ny * NUMERAL_W + x];
      }
      xPosition += NUMERAL_W + 1;
    }
  }
}
