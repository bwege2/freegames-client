// imlib/filter.cpp: colour remapping tables (Filter) and the RGB cube to palette table (ColorFilter)
import type { image } from './image.ts';
import type { palette } from './palette.ts';
import type { bFILE, spec_entry } from './specs.ts';

export class Filter {
  m_size: number;
  m_table: Uint8Array;

  constructor(colors = 256) {
    this.m_size = colors;
    this.m_table = new Uint8Array(colors);
  }

  /** a conversion filter from one palette to another */
  static between(from: palette, to: palette): Filter {
    const f = new Filter(Math.max(from.pal_size(), to.pal_size()));
    const src = from.addr();
    const dk = to.darkest(1);
    for (let i = 0, s = 0; i < f.m_size; i++) {
      const r = src[s++] ?? 0, g = src[s++] ?? 0, b = src[s++] ?? 0;
      let color = to.find_closest(r, g, b);
      if ((r || g || b) && to.red(color) === 0 && to.green(color) === 0 && to.blue(color) === 0) color = dk;
      f.m_table[i] = color;
    }
    return f;
  }

  Set(color_num: number, change_to: number): void { this.m_table[color_num] = change_to; }
  GetMapping(color_num: number): number { return this.m_table[color_num]; }

  Apply(im: image): void {
    const d = im.m_data;
    const n = im.w * im.h;
    for (let i = 0; i < n; i++) d[i] = this.m_table[d[i]];
  }

  PutImage(screen: image, im: image, px: number, py: number): void {
    const [cx1, cy1, cx2, cy2] = screen.GetClip();
    let x1 = 0, y1 = 0, x2 = im.w, y2 = im.h;
    if (px >= cx2 || py >= cy2 || px + (x2 - x1) <= cx1 || py + (y2 - y1) <= cy1) return;
    x1 += Math.max(cx1 - px, 0);
    y1 += Math.max(cy1 - py, 0);
    px = Math.max(px, cx1);
    py = Math.max(py, cy1);
    x2 = Math.min(x2, cx2 - px + x1);
    y2 = Math.min(y2, cy2 - py + y1);
    if (x1 >= x2 || y1 >= y2) return;
    const xl = x2 - x1, yl = y2 - y1;
    screen.AddDirty(px, py, px + xl, py + yl);
    for (let j = 0; j < yl; j++) {
      let s = (y1 + j) * im.w + x1, d = (py + j) * screen.w + px;
      for (let i = 0; i < xl; i++, s++, d++) if (im.m_data[s]) screen.m_data[d] = this.m_table[im.m_data[s]];
    }
  }
}

export class ColorFilter {
  m_size: number;
  m_table: Uint8Array;

  constructor(size: number, table: Uint8Array) {
    this.m_size = size;
    this.m_table = table;
  }

  static fromPalette(pal: palette, color_bits: number): ColorFilter {
    const max = pal.pal_size();
    const mul = 1 << (8 - color_bits);
    const n = 1 << color_bits;
    const t = new Uint8Array(n * n * n);
    const pp = pal.addr();
    for (let r = 0; r < n; r++)
      for (let g = 0; g < n; g++)
        for (let b = 0; b < n; b++) {
          let best = 256 * 256 * 3, color = 0;
          for (let i = 0, o = 0; i < max; i++, o += 3) {
            const rd = pp[o] - r * mul, gd = pp[o + 1] - g * mul, bd = pp[o + 2] - b * mul;
            const dist = rd * rd + bd * bd + gd * gd;
            if (dist < best) {
              best = dist;
              color = i;
            }
          }
          t[(r * n + g) * n + b] = color;
        }
    return new ColorFilter(n, t);
  }

  static fromFile(e: spec_entry, fp: bFILE): ColorFilter {
    fp.seek(e.offset, 0);
    const n = fp.read_uint16();
    const t = new Uint8Array(n * n * n);
    fp.read(t, n * n * n);
    return new ColorFilter(n, t);
  }

  Lookup(r: number, g: number, b: number): number {
    return this.m_table[(r * this.m_size + g) * this.m_size + b];
  }

  Write(fp: bFILE): number {
    fp.write_uint16(this.m_size);
    const bytes = this.m_size ** 3;
    return fp.write(this.m_table, bytes) === bytes ? 1 : 0;
  }
}
