// The glyphs of Brogue CE's SDL platform (src/platform/tiles.c), in TypeScript: tiles.png (2048x5568, 16x24
// tiles of 128x232) downscaled to the window's cell size as tiles.c does it (in linear light with gamma 2,
// in 16 parts with the sub-pixel shifts of tiles.bin, text aligned on its x-height, wall tops as sine waves)
// into alpha masks, and the screen drawn from them as SDL's renderer draws it (background colour, then the
// glyph's mask tinted with the foreground colour, alpha-blended). The screen is painted into an RGBA buffer;
// screen.ts puts it on a canvas.
import type { GrayImage } from './png.ts';

export const PNG_WIDTH = 2048;
export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 232;
export const TILE_ROWS = 24;
export const TILE_COLS = 16;
const TEXT_X_HEIGHT = 100;
const TEXT_BASELINE = 46;
export const MAX_TILE_SIZE = 64;
export const COLS = 100;
export const ROWS = 34;

// How each tile is processed (tiles.c TileProcessing): s stretch, f fit, t text, # symbols
const TileProcessing = [
  'ffffffffffffffff', 'ssssssssssssssss', '#t##########t#t#', 'tttttttttttt###t',
  '#ttttttttttttttt', 'ttttttttttt#####', '#ttttttttttttttt', 'ttttttttttt#####',
  '################', '################', '################', '################',
  'tttttttttttttttt', 'ttttttt#tttttttt', 'tttttttttttttttt', 'ttttttt#tttttttt',
  'ffsfsfsffsssssss', 'ssfsfsffffffffff', 'fffffffffffffsff', 'ffffffffffffffff',
  'fsssfffffffffffs', 'fsffffffffffffff', 'ffffssssffssffff', 'ffffsfffffssssff',
];

/** C's round(): half away from zero */
const cround = (x: number) => (x < 0 ? -Math.round(-x) : Math.round(x));
/** C's conversion of a double to int: towards zero */
const trunc = (x: number) => Math.trunc(x);
/** C's int division */
const idiv = (a: number, b: number) => Math.trunc(a / b);

export class TileSheet {
  readonly png: GrayImage;
  /** tileShifts[24][16][2][64][3] (tiles.bin) */
  readonly shifts: Int8Array;
  readonly padding = new Int8Array(TILE_ROWS * TILE_COLS);
  readonly empty = new Uint8Array(TILE_ROWS * TILE_COLS);

  constructor(png: GrayImage, tilesBin: Uint8Array) {
    if (png.width !== PNG_WIDTH || png.height !== TILE_HEIGHT * TILE_ROWS) throw new Error('tiles.png: wrong size');
    this.png = png;
    this.shifts = new Int8Array(tilesBin.buffer, tilesBin.byteOffset, TILE_ROWS * TILE_COLS * 2 * MAX_TILE_SIZE * 3);
    // initTiles(): empty tiles and the padding of fitted ones
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let column = 0; column < TILE_COLS; column++) {
        this.empty[row * TILE_COLS + column] = this.isTileEmpty(row, column) ? 1 : 0;
        this.padding[row * TILE_COLS + column] = TileProcessing[row][column] === 'f' ? this.getPadding(row, column) : 0;
      }
    }
  }

  private px(x: number, y: number): number {
    return this.png.gray[x + y * PNG_WIDTH];
  }

  private getPadding(row: number, column: number): number {
    let padding;
    for (padding = 0; padding < TILE_HEIGHT / 4; padding++) {
      for (let x = 0; x < TILE_WIDTH; x++) {
        const y1 = padding, y2 = TILE_HEIGHT - padding - 1;
        if (this.px(x + column * TILE_WIDTH, y1 + row * TILE_HEIGHT) || this.px(x + column * TILE_WIDTH, y2 + row * TILE_HEIGHT)) return padding;
      }
    }
    return padding;
  }

  private isTileEmpty(row: number, column: number): boolean {
    for (let y = 0; y < TILE_HEIGHT; y++) {
      for (let x = 0; x < TILE_WIDTH; x++) {
        if (this.px(x + column * TILE_WIDTH, y + row * TILE_HEIGHT)) return false;
      }
    }
    return true;
  }

  isEmpty(row: number, column: number): boolean {
    return !!this.empty[row * TILE_COLS + column];
  }

  private shiftsOf(row: number, column: number, axis: number, size: number): number[] {
    const o = ((((row * TILE_COLS + column) * 2 + axis) * MAX_TILE_SIZE) + size - 1) * 3;
    return [this.shifts[o], this.shifts[o + 1], this.shifts[o + 2]];
  }

  /**
   * downscaleTile(): the tile (row, column) at tileWidth x tileHeight into the mask `out` (one alpha byte per
   * pixel, `outWidth` wide, the tile at column * tileWidth, row * tileHeight); baseTileWidth/Height are the
   * smallest texture's tile size, which the glyph must fit into.
   */
  downscaleTile(out: Uint8Array, outWidth: number, tileWidth: number, tileHeight: number, row: number, column: number,
    baseTileWidth: number, baseTileHeight: number): void {
    const noShifts = [0, 0, 0];
    const padding = this.padding[row * TILE_COLS + column];
    const processing = TileProcessing[row][column];
    let fitWidth = Math.max(1, baseTileWidth);
    let fitHeight = Math.max(1, baseTileHeight);
    const numHorizWaves = Math.max(2, Math.min(6, cround(fitWidth * 0.25)));
    const numVertWaves = Math.max(2, Math.min(11, cround(fitHeight * 0.25)));
    let glyphWidth = 0, glyphHeight = 0;
    // the accumulator: sums of squares and counts
    const sums = new Float64Array(tileWidth * tileHeight);
    const counts = new Float64Array(tileWidth * tileHeight);

    if (!this.isEmpty(row, column)) {
      if (processing === 's') {
        glyphWidth = fitWidth = tileWidth;
        glyphHeight = fitHeight = tileHeight;
      } else if (processing === 'f') {
        const hi = idiv(fitHeight * TILE_HEIGHT, TILE_HEIGHT - 2 * padding);
        const lo = Math.max(1, Math.min(fitHeight, cround(1.2 * fitWidth * TILE_HEIGHT / TILE_WIDTH)));
        glyphHeight = trunc(Math.max(lo, Math.min(hi, cround(fitWidth * TILE_HEIGHT / TILE_WIDTH))));
        glyphWidth = trunc(Math.max(1, Math.min(fitWidth, cround(1.2 * glyphHeight * TILE_WIDTH / TILE_HEIGHT))));
      } else {
        glyphWidth = trunc(Math.max(1, Math.min(fitWidth, cround(1.4 * fitHeight * TILE_WIDTH / TILE_HEIGHT))));
        glyphHeight = trunc(Math.max(1, Math.min(fitHeight, cround(1.4 * fitWidth * TILE_HEIGHT / TILE_WIDTH))));
      }

      const scaledX = new Int32Array(TILE_WIDTH);
      const scaledY = new Int32Array(TILE_HEIGHT);
      // horizontally
      let stop0 = 0, stop1 = idiv(TILE_WIDTH, 5), stop2 = idiv(TILE_WIDTH, 2), stop3 = idiv(TILE_WIDTH * 4, 5), stop4 = TILE_WIDTH;
      let shifts = glyphWidth > MAX_TILE_SIZE ? noShifts : this.shiftsOf(row, column, 0, glyphWidth);
      let map0 = idiv(fitWidth - glyphWidth + (shifts[0] + shifts[1] < 0 ? 1 : 0), 2);
      let map1 = map0 + glyphWidth * (stop1 - stop0) / (stop4 - stop0) + shifts[0] * 0.1;
      let map2 = map0 + glyphWidth * (stop2 - stop0) / (stop4 - stop0) + shifts[2] * 0.1;
      let map3 = map0 + glyphWidth * (stop3 - stop0) / (stop4 - stop0) + shifts[1] * 0.1;
      let map4 = map0 + glyphWidth;
      for (let x = stop0; x < stop1; x++) scaledX[x] = trunc(map0 + (map1 - map0) * (x - stop0) / (stop1 - stop0));
      for (let x = stop1; x < stop2; x++) scaledX[x] = trunc(map1 + (map2 - map1) * (x - stop1) / (stop2 - stop1));
      for (let x = stop2; x < stop3; x++) scaledX[x] = trunc(map2 + (map3 - map2) * (x - stop2) / (stop3 - stop2));
      for (let x = stop3; x < stop4; x++) scaledX[x] = trunc(map3 + (map4 - map3) * (x - stop3) / (stop4 - stop3));
      // vertically
      if (processing === 't') {
        stop4 = TILE_HEIGHT;
        stop3 = stop4 - TEXT_BASELINE;
        stop2 = stop3 - TEXT_X_HEIGHT;
        stop1 = idiv(stop2, 3);
        stop0 = 0;
      } else {
        stop0 = 0;
        stop1 = idiv(TILE_HEIGHT, 5);
        stop2 = idiv(TILE_HEIGHT, 2);
        stop3 = idiv(TILE_HEIGHT * 4, 5);
        stop4 = TILE_HEIGHT;
      }
      map0 = idiv(fitHeight - glyphHeight, 2);
      map1 = map0 + glyphHeight * (stop1 - stop0) / (stop4 - stop0);
      map2 = map0 + glyphHeight * (stop2 - stop0) / (stop4 - stop0);
      map3 = map0 + glyphHeight * (stop3 - stop0) / (stop4 - stop0);
      map4 = map0 + glyphHeight;
      if (processing === 't') {
        map3 += cround(map2) - map2;
        map2 = cround(map2);
        map3 = Math.max(map2 + 1, cround(map3));
        map1 = map0 + (map2 - map0) / 3;
      }
      shifts = glyphHeight > MAX_TILE_SIZE ? noShifts : this.shiftsOf(row, column, 1, glyphHeight);
      map1 += shifts[0] * 0.1;
      map2 += shifts[2] * 0.1;
      map3 += shifts[1] * 0.1;
      for (let y = 0; y < stop0; y++) scaledY[y] = -1;
      for (let y = stop0; y < stop1; y++) scaledY[y] = trunc(map0 + (map1 - map0) * (y - stop0) / (stop1 - stop0));
      for (let y = stop1; y < stop2; y++) scaledY[y] = trunc(map1 + (map2 - map1) * (y - stop1) / (stop2 - stop1));
      for (let y = stop2; y < stop3; y++) scaledY[y] = trunc(map2 + (map3 - map2) * (y - stop2) / (stop3 - stop2));
      for (let y = stop3; y < stop4; y++) scaledY[y] = trunc(map3 + (map4 - map3) * (y - stop3) / (stop4 - stop3));
      for (let y = stop4; y < TILE_HEIGHT; y++) scaledY[y] = -1;

      // downscale the source tile into the accumulator
      const n = tileWidth * tileHeight;
      const gray = this.png.gray;
      for (let y0 = 0; y0 < TILE_HEIGHT; y0++) {
        const y1 = scaledY[y0];
        if (y1 < 0 || y1 >= tileHeight) continue;
        const dst = y1 * tileWidth;
        const src = column * TILE_WIDTH + (row * TILE_HEIGHT + y0) * PNG_WIDTH;
        for (let x0 = 0; x0 < TILE_WIDTH; x0++) {
          const value = gray[src + x0];
          const i = dst + scaledX[x0];
          if (i >= 0 && i < n) {
            sums[i] += value * value;
            counts[i] += 1;
          }
        }
        // interpolate a skipped line
        if (y1 >= 2 && y0 >= 1 && scaledY[y0 - 1] === y1 - 2) {
          for (let x1 = 0; x1 < tileWidth; x1++) {
            sums[dst + x1 - tileWidth] = sums[dst + x1 - 2 * tileWidth] + sums[dst + x1];
            counts[dst + x1 - tileWidth] = counts[dst + x1 - 2 * tileWidth] + counts[dst + x1];
          }
        }
      }
    }

    // procedural wall tops: diagonal sine waves
    if ((row === 16 && column === 2) || (row === 21 && column === 1) || (row === 22 && column === 4)) {
      for (let y = 0; y < tileHeight; y++) {
        if (row !== 21 && (y > idiv(tileHeight, 2) || sums[y * tileWidth])) break;
        for (let x = 0; x < tileWidth; x++) {
          const value = Math.sin(2 * Math.PI * (x / tileWidth * numHorizWaves + y / tileHeight * numVertWaves)) / 2 + 0.5;
          sums[y * tileWidth + x] = cround(255 * 255 * value * value);
          counts[y * tileWidth + x] = 1;
        }
      }
    }

    // the accumulator as transparency
    for (let y = 0; y < tileHeight; y++) {
      let o = column * tileWidth + (row * tileHeight + y) * outWidth;
      for (let x = 0; x < tileWidth; x++) {
        const i = y * tileWidth + x;
        let value = counts[i] ? Math.floor(sums[i] / counts[i]) : 0;
        if (processing === 't' || processing === '#') {
          value = value < 32512 ? Math.floor(value / 2) : Math.floor(value * 3 / 2) - 32512;
        }
        out[o++] = value === 0 ? 0 : value > 64770 ? 255 : cround(Math.sqrt(value));
      }
    }
  }
}

/** one texture of createTextures(): every tile at one size, as alpha masks */
export interface Texture {
  tileWidth: number;
  tileHeight: number;
  width: number;
  alpha: Uint8Array;
}

/** createTextures(): the tile size for an output size, and the (up to) 4 textures */
export function createTextures(sheet: TileSheet, outputWidth: number, outputHeight: number): { baseTileWidth: number; baseTileHeight: number; textures: Texture[] } {
  const tileAspectRatio = (outputWidth * ROWS) / (outputHeight * COLS);
  let baseTileWidth = Math.max(1, idiv(outputWidth, COLS));
  let baseTileHeight = Math.max(1, idiv(outputHeight, ROWS));
  if (baseTileWidth >= MAX_TILE_SIZE || baseTileHeight >= MAX_TILE_SIZE) {
    baseTileWidth = trunc(Math.max(1, Math.min(TILE_WIDTH, cround(TILE_HEIGHT * tileAspectRatio))));
    baseTileHeight = trunc(Math.max(1, Math.min(TILE_HEIGHT, cround(TILE_WIDTH / tileAspectRatio))));
  }
  const n = baseTileWidth >= MAX_TILE_SIZE || baseTileHeight >= MAX_TILE_SIZE ? 1 : 4;
  const textures: Texture[] = [];
  for (let i = 0; i < n; i++) {
    const tileWidth = baseTileWidth + (i === 1 || i === 3 ? 1 : 0);
    const tileHeight = baseTileHeight + (i === 2 || i === 3 ? 1 : 0);
    const width = tileWidth * TILE_COLS;
    const alpha = new Uint8Array(width * tileHeight * TILE_ROWS);
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let column = 0; column < TILE_COLS; column++) {
        sheet.downscaleTile(alpha, width, tileWidth, tileHeight, row, column, baseTileWidth, baseTileHeight);
      }
    }
    textures.push({ tileWidth, tileHeight, width, alpha });
  }
  return { baseTileWidth, baseTileHeight, textures };
}

/** a cell of the screen (tiles.c ScreenTile) */
export interface Cell {
  fr: number; fg: number; fb: number;
  br: number; bg: number; bb: number;
  charIndex: number;
}

/**
 * updateScreen(): paints the cells into `rgba` (outputWidth x outputHeight, RGBA): each cell's rectangle
 * (x * outputWidth / COLS ...) filled with its background colour, then its glyph from the texture of its
 * size, tinted with the foreground colour and blended by the mask's alpha. Only the cells in `dirty`
 * (indices y * COLS + x) are painted (all when null).
 */
export function paintCells(sheet: TileSheet, tex: { baseTileWidth: number; baseTileHeight: number; textures: Texture[] },
  cells: Cell[], rgba: Uint8ClampedArray, outputWidth: number, outputHeight: number, dirty: Iterable<number> | null): void {
  const paint = (idx: number) => {
    const x = idx % COLS, y = (idx - x) / COLS;
    const x0 = idiv(x * outputWidth, COLS), x1 = idiv((x + 1) * outputWidth, COLS);
    const y0 = idiv(y * outputHeight, ROWS), y1 = idiv((y + 1) * outputHeight, ROWS);
    const tileWidth = x1 - x0, tileHeight = y1 - y0;
    if (tileWidth === 0 || tileHeight === 0) return;
    const c = cells[idx];
    const br = cround(2.55 * c.br), bg = cround(2.55 * c.bg), bb = cround(2.55 * c.bb);
    for (let py = y0; py < y1; py++) {
      let o = (py * outputWidth + x0) * 4;
      for (let px = x0; px < x1; px++) {
        rgba[o] = br;
        rgba[o + 1] = bg;
        rgba[o + 2] = bb;
        rgba[o + 3] = 255;
        o += 4;
      }
    }
    const tileRow = c.charIndex >> 4, tileColumn = c.charIndex & 15;
    if (tileRow >= TILE_ROWS || (sheet.isEmpty(tileRow, tileColumn) && !(tileRow === 21 && tileColumn === 1))) return;
    const fr = cround(2.55 * c.fr), fg = cround(2.55 * c.fg), fb = cround(2.55 * c.fb);
    let t: Texture;
    if (tex.textures.length < 4) t = tex.textures[0];
    else t = tex.textures[(tileWidth > tex.baseTileWidth ? 1 : 0) + (tileHeight > tex.baseTileHeight ? 2 : 0)];
    for (let py = 0; py < tileHeight; py++) {
      // the texture's pixel for this one (nearest; scaled when the single large texture is used)
      const sy = t.tileHeight === tileHeight ? py : Math.min(t.tileHeight - 1, Math.floor((py + 0.5) * t.tileHeight / tileHeight));
      let o = ((y0 + py) * outputWidth + x0) * 4;
      const srow = (tileRow * t.tileHeight + sy) * t.width + tileColumn * t.tileWidth;
      for (let px = 0; px < tileWidth; px++) {
        const sx = t.tileWidth === tileWidth ? px : Math.min(t.tileWidth - 1, Math.floor((px + 0.5) * t.tileWidth / tileWidth));
        const a = t.alpha[srow + sx];
        if (a) {
          const ia = 255 - a;
          rgba[o] = (fr * a + rgba[o] * ia + 127) / 255;
          rgba[o + 1] = (fg * a + rgba[o + 1] * ia + 127) / 255;
          rgba[o + 2] = (fb * a + rgba[o + 2] * ia + 127) / 255;
        }
        o += 4;
      }
    }
  };
  if (dirty) for (const i of dirty) paint(i);
  else for (let i = 0; i < COLS * ROWS; i++) paint(i);
}
