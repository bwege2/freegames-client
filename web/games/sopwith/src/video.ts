// Sopwith's 320x200 indexed screen: the original XOR sprite blitter, the 8x8 font, the four-colour
// palettes, normal/solid ground and the status-bar primitives from src/video.c and src/swstbar.c.
import { FONT_DATA } from './assets/font.ts';
import { SPRITE_TEXT } from './assets/sprites.ts';

export const W = 320;
export const H = 200;

export interface Sym { w: number; h: number; data: Uint8Array }
export interface SymSet { sym: Sym[] } // 0..3 rotations, 4..7 mirrored rotations

const COLOR_INDEX: Record<string, number> = { ' ': 0, '*': 1, '-': 2, '#': 3 };

function parseSprite(text: string): Sym {
  const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n');
  const w = Math.max(...lines.map((l) => Math.ceil(l.length / 2)));
  const h = lines.length;
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const line = lines[y];
    for (let x = 0; x < w; x++) {
      const ch = line[x * 2] ?? ' ';
      data[y * w + x] = COLOR_INDEX[ch] ?? 0;
    }
  }
  return { w, h, data };
}

function rotate(s: Sym, r: number, mirror: boolean): Sym {
  let cur = s;
  for (let i = 0; i < r; i++) {
    const out: Sym = { w: cur.h, h: cur.w, data: new Uint8Array(cur.w * cur.h) };
    for (let y = 0; y < cur.h; y++) for (let x = 0; x < cur.w; x++) {
      // 90 degrees counter-clockwise
      out.data[(cur.w - 1 - x) * out.w + y] = cur.data[y * cur.w + x];
    }
    cur = out;
  }
  if (mirror) {
    const out: Sym = { w: cur.w, h: cur.h, data: new Uint8Array(cur.w * cur.h) };
    for (let y = 0; y < cur.h; y++) for (let x = 0; x < cur.w; x++) {
      out.data[(cur.h - 1 - y) * cur.w + x] = cur.data[y * cur.w + x];
    }
    cur = out;
  }
  return cur;
}

export function makeSymSet(text: string): SymSet {
  const base = parseSprite(text);
  const sym: Sym[] = [];
  for (let r = 0; r < 4; r++) sym.push(rotate(base, r, false));
  for (let r = 0; r < 4; r++) sym.push(rotate(base, r, true));
  return { sym };
}

export type Sprites = Record<string, SymSet[]>;

export const BASE_SPRITES = Object.fromEntries(
  Object.entries(SPRITE_TEXT).map(([k, frames]) => [k, frames.map(makeSymSet)]),
) as Sprites;

/** The sprite set names in `.sop` `symbols` sections (src/swsymbol.c). */
export const SYMSET_KEYS: Record<string, string> = {
  swplnsym: 'plane', swhitsym: 'planeHit', swwinsym: 'planeWin', swbmbsym: 'bomb',
  swtrgsym: 'target', swhtrsym: 'targetHit', swballoonsym: 'balloon', swexpsym: 'debris',
  swflksym: 'flock', swbrdsym: 'bird', swoxsym: 'ox', swshtsym: 'shotWindow',
  swsplsym: 'birdsplat', swmscsym: 'missile', swbstsym: 'burst', swmedalsym: 'medal',
  swribbonsym: 'ribbon',
};

/** The built-in sprites, with the mission's `symbols` frames applied. */
export function makeSprites(overrides?: Record<string, Record<number, string>>): Sprites {
  const out: Sprites = {};
  for (const [key, frames] of Object.entries(BASE_SPRITES)) out[key] = frames.slice();
  if (overrides) {
    for (const [name, frames] of Object.entries(overrides)) {
      const key = SYMSET_KEYS[name];
      if (!key) continue;
      const set = (out[key] ??= []);
      for (const [n, text] of Object.entries(frames)) {
        const i = Number(n);
        if (i < 0 || i >= 256) continue;
        while (set.length <= i) set.push(makeSymSet('                                \n'.repeat(16)));
        set[i] = makeSymSet(text);
      }
    }
  }
  return out;
}

/** The original graphics (mission files replace frames on top of this). */
export const SPRITES = BASE_SPRITES;

export const PIXEL: Sym = { w: 1, h: 1, data: Uint8Array.from([3]) };

/** color_mappings[faction] from src/video.c; faction 0 NONE, 1 P1, 2 P2, ... */
export const COLOR_MAPPINGS = [
  [0, 3, 3, 3], [0, 1, 2, 3], [0, 2, 1, 3], [0, 1, 3, 2], [0, 2, 3, 1],
  [0, 3, 1, 2], [0, 3, 2, 1], [0, 1, 1, 3], [0, 2, 2, 3],
];

export const PALETTES: [number, number, number][][] = [
  [[0, 0, 0], [0, 255, 255], [255, 0, 255], [255, 255, 255]],
  [[0, 0, 0], [0, 255, 0], [255, 0, 0], [255, 255, 0]],
  [[0, 0, 0], [0, 255, 255], [255, 0, 0], [255, 255, 255]],
  [[0, 0, 0], [255, 170, 16], [242, 125, 0], [255, 226, 52]],
  [[0, 0, 0], [12, 238, 56], [8, 202, 48], [49, 253, 90]],
  [[0, 0, 0], [222, 222, 210], [182, 186, 182], [255, 255, 255]],
  [[213, 226, 138], [150, 160, 150], [120, 120, 160], [0, 20, 200]],
  [[0, 20, 200], [120, 120, 160], [150, 160, 150], [213, 226, 138]],
  [[114, 136, 121], [75, 110, 117], [66, 90, 117], [39, 70, 109]],
  [[107, 133, 136], [86, 107, 110], [66, 82, 84], [46, 57, 59]],
  [[72, 173, 104], [54, 140, 97], [36, 108, 90], [19, 74, 84]],
  [[125, 27, 2], [211, 65, 0], [168, 46, 1], [254, 84, 0]],
  [[0, 0, 0], [0, 119, 255], [255, 0, 0], [255, 255, 255]],
  [[0, 0, 0], [120, 195, 214], [197, 81, 197], [199, 199, 199]],
];

export class Video {
  readonly buf = new Uint8Array(W * H);
  private readonly image: ImageData;
  private readonly ctx: CanvasRenderingContext2D;
  palette = 0;
  clipTop = 0;
  clipBottom = H - 1;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.image = ctx.createImageData(W, H);
  }

  clear(): void { this.buf.fill(0); }

  /** Vid_PlotPixel: batches? no, direct index write; overwrite. */
  plotWorld(x: number, y: number, c: number): void {
    x |= 0; y |= 0;
    const row = H - 1 - y;
    if (x < 0 || x >= W || y < 0 || y >= H || row < this.clipTop || row > this.clipBottom) return;
    this.buf[row * W + x] = c & 3;
  }

  xorWorld(x: number, y: number, c: number): void {
    x |= 0; y |= 0;
    const row = H - 1 - y;
    if (x < 0 || x >= W || y < 0 || y >= H || row < this.clipTop || row > this.clipBottom) return;
    this.buf[row * W + x] ^= c & 3;
  }

  boxWorld(x: number, y: number, w: number, h: number, c: number): void {
    for (let yy = 0; yy <= h; yy++) for (let xx = 0; xx < w; xx++) this.plotWorld(x + xx, y - yy, c);
  }

  /** Vid_DispSymbol: nonzero sprite values XOR through the faction colour mapping. */
  dispSymbol(x: number, y: number, sym: Sym, faction: number): void {
    if (sym.w === 1 && sym.h === 1) { this.xorWorld(x, y, faction); return; }
    const map = COLOR_MAPPINGS[faction] ?? COLOR_MAPPINGS[0];
    for (let sy = 0; sy < sym.h; sy++) {
      const py = y - sy;
      const row = H - 1 - py;
      if (py < 0 || py >= H || row < this.clipTop || row > this.clipBottom) continue;
      for (let sx = 0; sx < sym.w; sx++) {
        const v = sym.data[sy * sym.w + sx];
        if (v) {
          const px = x + sx;
          if (px >= 0 && px < W) this.buf[row * W + px] ^= map[v];
        }
      }
    }
  }

  /** Fill screen rows [top, bottom] with colour 0 (the original's clrprmpt). */
  clearRows(top: number, bottom: number): void {
    for (let row = Math.max(0, top); row <= Math.min(H - 1, bottom); row++) {
      this.buf.fill(0, row * W, (row + 1) * W);
    }
  }

  /** The normal ground renderer from src/video.c. */
  ground(ground: Int16Array, displx: number): void {
    let hc = Math.min(ground[displx] ?? 199, 199);
    let hl = hc;
    let y = 199;
    for (let x = 0; x < W; x++) {
      const hr = Math.min(ground[displx + x + 1] ?? 199, 199);
      if (y > hl) y = hl;
      if (y > hr) y = hr;
      if (y >= hc) y = hc - 1;
      while (y < hc) {
        y++;
        const row = H - 1 - y;
        if (row >= 0 && row < H && row >= this.clipTop && row <= this.clipBottom) this.buf[row * W + x] ^= 3;
      }
      hl = hc;
      hc = hr;
    }
  }

  solidGround(ground: Int16Array, displx: number): void {
    for (let x = 0; x < W; x++) {
      const top = 199 - Math.min(ground[displx + x] ?? 199, 199);
      for (let row = top; row <= 180; row++) if (row >= 0 && row < H && row >= this.clipTop && row <= this.clipBottom) this.buf[row * W + x] ^= 3;
    }
  }

  /** Text: column/row in 8x8 cells, top-down; overwrite, color 0..3. */
  text(col: number, row: number, s: string, color: number): void {
    let x = col * 8, y = row * 8;
    for (const ch of s) {
      if (ch === '\n') { x = col * 8; y += 8; continue; }
      const code = ch.charCodeAt(0) & 0xff;
      if (code >= 32 || (code >= 16 && code <= 31)) {
        for (let gy = 0; gy < 8; gy++) {
          const bits = FONT_DATA[code * 8 + gy];
          for (let gx = 0; gx < 8; gx++) if (bits & (0x80 >> gx)) {
            const px = x + gx, py = y + gy;
            if (px >= 0 && px < W && py >= 0 && py < H) this.buf[py * W + px] = color & 3;
          }
        }
      }
      x += 8;
    }
  }

  /** Render the index buffer through the selected palette. */
  present(): void {
    const pal = PALETTES[this.palette] ?? PALETTES[0];
    const d = this.image.data;
    for (let i = 0; i < W * H; i++) {
      const c = pal[this.buf[i] & 3];
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = 255;
    }
    this.ctx.putImageData(this.image, 0, 0);
  }
}
