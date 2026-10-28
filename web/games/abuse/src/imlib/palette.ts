// imlib/palette.cpp: palettes (r, g, b bytes) and the used-colour bits; load() is the video layer's
// (sdlport/video.ts)
import { linked_node } from './linked.ts';
import type { bFILE, spec_entry } from './specs.ts';

export class palette extends linked_node {
  /** r, g, b per colour */
  pal: Uint8Array;
  usd: Uint8Array;
  ncolors: number;
  bg = 0;

  constructor(number_colors = 256, init = true) {
    super();
    this.ncolors = (number_colors << 16) >> 16;
    this.pal = new Uint8Array(this.ncolors * 3);
    this.usd = new Uint8Array(((this.ncolors / 8) | 0) + 1);
    if (init) this.defaults();
  }

  static fromFile(fp: bFILE, e: spec_entry | null = null): palette {
    if (e) fp.seek(e.offset, 0);
    const n = fp.read_uint16();
    const p = new palette(n, false);
    p.set_all_unused();
    fp.read(p.pal, n * 3);
    return p;
  }

  size(): number { return this.ncolors * 3 + 2; }
  write(fp: bFILE): number {
    fp.write_uint16(this.ncolors);
    return fp.write(this.pal, this.ncolors * 3) === this.ncolors ? 1 : 0;
  }

  red(x: number): number { return this.pal[x * 3]; }
  green(x: number): number { return this.pal[x * 3 + 1]; }
  blue(x: number): number { return this.pal[x * 3 + 2]; }
  addr(): Uint8Array { return this.pal; }
  pal_size(): number { return this.ncolors; }

  set(x: number, r: number, g: number, b: number): void {
    this.pal[x * 3] = r;
    this.pal[x * 3 + 1] = g;
    this.pal[x * 3 + 2] = b;
  }
  get(x: number): [number, number, number] {
    return [this.pal[x * 3], this.pal[x * 3 + 1], this.pal[x * 3 + 2]];
  }

  find_closest(r: number, g: number, b: number): number {
    r &= 0xff; g &= 0xff; b &= 0xff;
    const cl = this.pal;
    let c = 0, d = 0x100000;
    for (let i = 0, o = 0; i < 256; i++, o += 3) {
      const dr = r - cl[o], dg = g - cl[o + 1], db = b - cl[o + 2];
      const nd = dr * dr + dg * dg + db * db;
      if (nd < d) {
        c = i;
        d = nd;
      }
    }
    return c;
  }

  find_closest_non0(r: number, g: number, b: number): number {
    r &= 0xff; g &= 0xff; b &= 0xff;
    const cl = this.pal;
    let c = 1, d = 0x7fffffff;
    for (let i = 1, o = 3; i < 256; i++, o += 3) {
      const dr = r - cl[o], dg = g - cl[o + 1], db = b - cl[o + 2];
      const nd = dr * dr + dg * dg + db * db;
      if (nd < d) {
        c = i;
        d = nd;
      }
    }
    return c;
  }

  find_color(r: number, g: number, b: number): number {
    let find = -1;
    for (let i = 0, ub = 0, mask = 128; i < this.ncolors && find < 0; i++) {
      if (this.usd[ub] & mask) if (r === this.red(i) && b === this.blue(i) && g === this.green(i)) find = i;
      mask >>= 1;
      if (mask === 0) {
        mask = 128;
        ub++;
      }
    }
    return find;
  }

  set_used(c: number): void { this.usd[c >> 3] |= 128 >> (c & 7); }
  set_unused(c: number): void { this.usd[c >> 3] &= 0xff ^ (128 >> (c & 7)); }
  used(c: number): number { return this.usd[c >> 3] & (128 >> (c & 7)); }
  set_all_used(): void { for (let i = 0; i < this.ncolors; i++) this.set_used(i); }
  set_all_unused(): void { for (let i = 0; i < this.ncolors; i++) this.set_unused(i); }

  copy(): palette {
    const p = new palette(this.ncolors);
    for (let i = 0; i < this.ncolors; i++) {
      if (this.used(i)) p.set_used(i);
      else p.set_unused(i);
      p.set(i, this.red(i), this.green(i), this.blue(i));
    }
    return p;
  }

  defaults(): void {
    this.set(0, 0, 0, 0);
    this.set_used(0);
    for (let i = 1; i < this.ncolors; i++) this.set_unused(i);
    if (this.ncolors === 256) {
      for (let i = 0; i < this.ncolors; i++)
        this.set(i, (((i & (7 << 5)) >> 5) * 255 / 7) | 0, (((i & (7 << 2)) >> 2) * 255 / 7) | 0, ((i & 3) * 255 / 3) | 0);
    } else if (this.ncolors === 16) {
      for (let i = 0; i < this.ncolors; i++) this.set(i, 255 - (i & 3), 255 - ((i & 4) >> 2), 255 - ((i & 8) >> 3));
    } else {
      for (let i = 0; i < this.ncolors; i++) this.set(i, 255 - (i % 3), 255 - ((i + 1) % 3), 255 - ((i + 2) % 3));
    }
  }

  shift(amount: number): void {
    if (amount < 0) {
      const m = -amount & 0xff;
      for (let i = 0; i < this.ncolors * 3; i++) this.pal[i] >>= m;
    } else if (amount > 0) {
      const m = amount & 0xff;
      for (let i = 0; i < this.ncolors * 3; i++) this.pal[i] = (this.pal[i] << m) & 0xff;
    }
  }

  add_color(r: number, g: number, b: number, closest_only = 0): number {
    let f = -1, u = -1;
    if (!closest_only) {
      for (let i = this.ncolors - 1; i >= 0 && f < 0; i--) {
        if (this.used(i)) {
          if (this.red(i) === r && this.green(i) === g && this.blue(i) === b) f = i;
        } else u = i;
      }
    }
    if (f < 0) {
      if (u >= 0) {
        this.set(u, r, g, b);
        this.set_used(u);
        f = u;
      } else {
        f = 0;
        u = 10000;
        for (let i = 0; i < this.ncolors; i++) {
          // unsigned arithmetic of the original
          const c = (Math.imul(this.red(i) - r, this.red(i) - r) + Math.imul(this.green(i) - g, this.green(i) - g) +
            Math.imul(this.blue(i) - b, this.blue(i) - b)) >>> 0;
          if (c < u) {
            f = i;
            u = c;
          }
        }
      }
    }
    return f;
  }

  brightest(all = 0): number {
    let brv = 0, bri = 0;
    for (let i = 0; i < this.ncolors; i++) {
      if (all || this.used(i)) {
        const v = this.red(i) * this.green(i) * this.blue(i);
        if (v > brv) {
          brv = v;
          bri = i & 0xff;
        }
      }
    }
    return bri;
  }

  darkest(all = 0, noblack = 1): number {
    let brv = 258 * 258 * 258, bri = 0;
    for (let i = 0; i < this.ncolors; i++) {
      if (all || this.used(i)) {
        const x = this.red(i) * this.green(i) * this.blue(i);
        if (x < brv && (x || !noblack)) {
          brv = x;
          bri = i & 0xff;
        }
      }
    }
    return bri;
  }

  fade_to(total_fades: number, fade_on: number, dr: number, dg: number, db: number): void {
    const sl = this.pal;
    for (let i = 0, o = 0; i < this.ncolors; i++) {
      sl[o] = (((dr - sl[o]) * fade_on / total_fades) | 0) + sl[o]; o++;
      sl[o] = (((dg - sl[o]) * fade_on / total_fades) | 0) + sl[o]; o++;
      sl[o] = (((db - sl[o]) * fade_on / total_fades) | 0) + sl[o]; o++;
    }
  }
}
