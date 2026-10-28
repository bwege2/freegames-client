// imlib/image.cpp: 8-bit images, their clipping and dirty rectangles. Parameters the original declares
// int16_t are truncated to 16 bits (s16) as the call would.
import { linked_list, linked_node } from './linked.ts';
import type { bFILE, spec_entry } from './specs.ts';
import type { palette } from './palette.ts';

export const s16 = (v: number): number => (v << 16) >> 16;
export const u8 = (v: number): number => v & 0xff;
const Min = (a: number, b: number): number => (a < b ? a : b);
const Max = (a: number, b: number): number => (a > b ? a : b);

export const MAX_DIRTY = 200;

export class dirty_rect extends linked_node {
  dx1: number;
  dy1: number;
  dx2: number;
  dy2: number;
  constructor(x1: number, y1: number, x2: number, y2: number) {
    super();
    this.dx1 = s16(x1);
    this.dy1 = s16(y1);
    this.dx2 = s16(x2);
    this.dy2 = s16(y2);
  }
}

export class image_descriptor {
  private m_l: number;
  private m_h: number;
  private m_clipx1 = 0;
  private m_clipy1 = 0;
  private m_clipx2: number;
  private m_clipy2: number;
  keep_dirt: number;
  static_mem: number;
  dirties = new linked_list<dirty_rect>();

  constructor(w: number, h: number, keep_dirties = 1, static_memory = 0) {
    this.m_l = w;
    this.m_h = h;
    this.m_clipx2 = w;
    this.m_clipy2 = h;
    this.keep_dirt = keep_dirties & 0xff;
    this.static_mem = static_memory & 0xff;
  }

  bound_x1(x1: number): number { return x1 < this.m_clipx1 ? this.m_clipx1 : x1; }
  bound_y1(y1: number): number { return y1 < this.m_clipy1 ? this.m_clipy1 : y1; }
  bound_x2(x2: number): number { return x2 > this.m_clipx2 ? this.m_clipx2 : x2; }
  bound_y2(y2: number): number { return y2 > this.m_clipy2 ? this.m_clipy2 : y2; }
  x1_clip(): number { return this.m_clipx1; }
  y1_clip(): number { return this.m_clipy1; }
  x2_clip(): number { return this.m_clipx2; }
  y2_clip(): number { return this.m_clipy2; }

  GetClip(): [number, number, number, number] {
    return [this.m_clipx1, this.m_clipy1, this.m_clipx2, this.m_clipy2];
  }
  SetClip(x1: number, y1: number, x2: number, y2: number): void {
    if (x2 < x1 + 1) x2 = x1 + 1;
    if (y2 < y1 + 1) y2 = y1 + 1;
    this.m_clipx1 = Max(x1, 0);
    this.m_clipy1 = Max(y1, 0);
    this.m_clipx2 = Min(x2, this.m_l);
    this.m_clipy2 = Min(y2, this.m_h);
  }
  Resize(w: number, h: number): void {
    this.m_l = w;
    this.m_h = h;
    this.m_clipx1 = 0;
    this.m_clipy1 = 0;
    this.m_clipx2 = w;
    this.m_clipy2 = h;
  }

  ClearDirties(): void {
    let dr = this.dirties.first();
    while (dr) {
      this.dirties.unlink(dr);
      dr = this.dirties.first();
    }
  }

  ReduceDirties(): void {
    let p = this.dirties.first()!;
    let x1 = 6000, y1 = 6000, x2 = -1, y2 = -1;
    for (let i = this.dirties.Count(); i--;) {
      x1 = Min(x1, p.dx1);
      y1 = Min(y1, p.dy1);
      x2 = Max(x1, p.dx1);
      y2 = Max(y1, p.dy1);
      const tmp = p.Next() as dirty_rect;
      this.dirties.unlink(p);
      p = tmp;
    }
    this.dirties.add_front(new dirty_rect(x1, y1, x2, y2));
  }

  delete_dirty(x1: number, y1: number, x2: number, y2: number): void {
    let ax1: number, ay1: number, ax2: number, ay2: number;
    if (!this.keep_dirt) return;
    x1 = Max(0, x1);
    x2 = Min(this.m_l, x2);
    y1 = Max(0, y1);
    y2 = Min(this.m_h, y2);
    if (x1 >= x2 || y1 >= y2) return;
    let i = this.dirties.Count();
    if (!i) return;
    const D = (a: number, b: number, c: number, d: number): void => this.dirties.add_front(new dirty_rect(a, b, c, d));
    for (let p = this.dirties.first()!, next: dirty_rect; i; i--, p = next) {
      next = p.Next() as dirty_rect;
      if (x2 <= p.dx1 || y2 <= p.dy1 || x1 > p.dx2 || y1 > p.dy2) continue;
      if (x2 >= p.dx2 + 1 && x1 <= p.dx1) {
        if (y2 >= p.dy2 + 1 && y1 <= p.dy1) this.dirties.unlink(p);
        else if (y2 >= p.dy2 + 1) p.dy2 = s16(y1 - 1);
        else if (y1 <= p.dy1) p.dy1 = s16(y2);
        else {
          D(p.dx1, p.dy1, p.dx2, y1 - 1);
          p.dy1 = s16(y2);
        }
      } else if (y2 - 1 >= p.dy2 && y1 <= p.dy1) {
        if (x2 - 1 >= p.dx2) p.dx2 = s16(x1 - 1);
        else if (x1 <= p.dx1) p.dx1 = s16(x2);
        else {
          D(p.dx1, p.dy1, x1 - 1, p.dy2);
          p.dx1 = s16(x2);
        }
      } else {
        if (x2 - 1 >= p.dx2) { ax1 = p.dx1; ax2 = x1; }
        else if (x1 <= p.dx1) { ax1 = x2; ax2 = p.dx2 + 1; }
        else { ax1 = p.dx1; ax2 = x1; }
        if (y2 - 1 >= p.dy2) { ay1 = y1; ay2 = p.dy2 + 1; }
        else if (y1 <= p.dy1) { ay1 = p.dy1; ay2 = y2; }
        else { ay1 = y1; ay2 = y2; }
        D(ax1, ay1, ax2 - 1, ay2 - 1);

        if (x2 - 1 >= p.dx2 || x1 <= p.dx1) { ax1 = p.dx1; ax2 = p.dx2 + 1; }
        else { ax1 = x2; ax2 = p.dx2 + 1; }

        if (y2 - 1 >= p.dy2) {
          if (ax1 === p.dx1) { ay1 = p.dy1; ay2 = y1; }
          else { ay1 = y1; ay2 = p.dy2 + 1; }
        } else if (y1 <= p.dy1) {
          if (ax1 === p.dx1) { ay1 = y2; ay2 = p.dy2 + 1; }
          else { ay1 = p.dy1; ay2 = y2; }
        } else {
          if (ax1 === p.dx1) { ay1 = p.dy1; ay2 = y1; }
          else { ay1 = y1; ay2 = y2; }
        }
        D(ax1, ay1, ax2 - 1, ay2 - 1);

        if (x1 > p.dx1 && x2 - 1 < p.dx2) {
          if (y1 > p.dy1 && y2 - 1 < p.dy2) {
            D(p.dx1, p.dy1, p.dx2, y1 - 1);
            D(p.dx1, y2, p.dx2, p.dy2);
          } else if (y1 <= p.dy1) D(p.dx1, y2, p.dx2, p.dy2);
          else D(p.dx1, p.dy1, p.dx2, y1 - 1);
        } else if (y1 > p.dy1 && y2 - 1 < p.dy2) D(p.dx1, y2, p.dx2, p.dy2);
        this.dirties.unlink(p);
      }
    }
  }

  AddDirty(x1: number, y1: number, x2: number, y2: number): void {
    if (!this.keep_dirt) return;
    x1 = Max(0, x1);
    x2 = Min(this.m_l, x2);
    y1 = Max(0, y1);
    y2 = Min(this.m_h, y2);
    if (x1 >= x2 || y1 >= y2) return;
    let i = this.dirties.Count();
    if (!i) this.dirties.add_front(new dirty_rect(x1, y1, x2 - 1, y2 - 1));
    else if (i >= MAX_DIRTY) {
      this.dirties.add_front(new dirty_rect(x1, y1, x2 - 1, y2 - 1));
      this.ReduceDirties();
    } else {
      for (let p = this.dirties.first()!; i > 0; i--) {
        if (x1 <= p.dx1 && y1 <= p.dy1 && x2 >= p.dx2 + 1 && y2 >= p.dy2 + 1) {
          const tmp = p.Next() as dirty_rect;
          this.dirties.unlink(p);
          if (!this.dirties.first()) i = 0;
          else p = tmp;
        } else if (!(x2 - 1 < p.dx1 || y2 - 1 < p.dy1 || x1 > p.dx2 || y1 > p.dy2)) {
          if (x1 < p.dx1) this.AddDirty(x1, Max(y1, p.dy1), p.dx1, Min(y2, p.dy2 + 1));
          if (x2 > p.dx2 + 1) this.AddDirty(p.dx2 + 1, Max(y1, p.dy1), x2, Min(y2, p.dy2 + 1));
          if (y1 < p.dy1) this.AddDirty(x1, y1, x2, p.dy1);
          if (y2 - 1 > p.dy2) this.AddDirty(x1, p.dy2 + 1, x2, y2);
          return;
        } else p = p.Next() as dirty_rect;
      }
      this.dirties.add_end(new dirty_rect(x1, y1, x2 - 1, y2 - 1));
    }
  }
}

export class image extends linked_node {
  m_data: Uint8Array;
  w: number;
  h: number;
  m_special: image_descriptor | null = null;

  constructor(w: number, h: number, page_buffer: Uint8Array | null = null, create_descriptor = 0) {
    super();
    this.w = w;
    this.h = h;
    if (create_descriptor || page_buffer)
      this.m_special = new image_descriptor(w, h, create_descriptor === 2 ? 1 : 0, page_buffer ? 1 : 0);
    this.m_data = page_buffer ?? new Uint8Array(w * h);
  }

  /** image::image(bFILE *fp, spec_entry *e) */
  static load(fp: bFILE, e: spec_entry | null = null): image {
    if (e) fp.seek(e.offset, 0);
    const w = fp.read_uint16();
    const h = fp.read_uint16();
    const im = new image(w, h);
    for (let i = 0; i < h; i++) fp.read(im.m_data, w, i * w);
    return im;
  }

  Size(): { x: number; y: number } { return { x: this.w, y: this.h }; }
  scan_line(y: number): number { return s16(y) * this.w; }

  Pixel(x: number, y: number): number {
    return this.m_data[y * this.w + x];
  }

  PutPixel(x: number, y: number, color: number): void {
    const sp = this.m_special;
    if (sp && x >= sp.x1_clip() && x < sp.x2_clip() && y >= sp.y1_clip() && y < sp.y2_clip()) return;
    this.m_data[y * this.w + x] = color;
  }

  copy(): image {
    const im = new image(this.w, this.h);
    im.m_data.set(this.m_data);
    return im;
  }

  clear(color = -1): void {
    color = s16(color);
    if (color === -1) color = 0;
    const sp = this.m_special;
    if (sp) {
      if (sp.x1_clip() < sp.x2_clip())
        for (let j = sp.y1_clip(); j < sp.y2_clip(); j++)
          this.m_data.fill(color & 0xff, j * this.w + sp.x1_clip(), j * this.w + sp.x2_clip());
    } else this.m_data.fill(color & 0xff);
    this.AddDirty(0, 0, this.w, this.h);
  }

  GetClip(): [number, number, number, number] {
    if (this.m_special) return this.m_special.GetClip();
    return [0, 0, this.w, this.h];
  }

  SetClip(x1: number, y1: number, x2: number, y2: number): void {
    // the original creates the descriptor as image_descriptor(m_size.x, m_size.y, 0): vec2i(x) is a
    // square of the width, and m_size.y lands in keep_dirties (as a uint8_t)
    if (!this.m_special) this.m_special = new image_descriptor(this.w, this.w, this.h & 0xff, 0);
    this.m_special.SetClip(x1, y1, x2, y2);
  }

  InClip(x1: number, y1: number, x2: number, y2: number): void {
    const sp = this.m_special;
    if (sp) {
      x1 = Min(x1, sp.x1_clip());
      y1 = Min(y1, sp.y1_clip());
      x2 = Max(x2, sp.x2_clip());
      y2 = Max(y2, sp.y2_clip());
    }
    this.SetClip(x1, y1, x2, y2);
  }

  dirt_off(): void { if (this.m_special && this.m_special.keep_dirt) this.m_special.keep_dirt = 0; }
  dirt_on(): void { if (this.m_special) this.m_special.keep_dirt = 1; }
  AddDirty(x1: number, y1: number, x2: number, y2: number): void { if (this.m_special) this.m_special.AddDirty(x1, y1, x2, y2); }
  delete_dirty(x1: number, y1: number, x2: number, y2: number): void { if (this.m_special) this.m_special.delete_dirty(x1, y1, x2, y2); }
  ClearDirties(): void { if (this.m_special) this.m_special.ClearDirties(); }

  line(x1: number, y1: number, x2: number, y2: number, color: number): void {
    x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    let i: number;
    const [cx1, cy1, cx2, cy2] = this.GetClip();
    if ((x1 < cx1 && x2 < cx1) || (x1 >= cx2 && x2 >= cx2) || (y1 < cy1 && y2 < cy1) || (y1 >= cy2 && y2 >= cy2)) return;
    if (x1 > x2) {
      i = x1; x1 = x2; x2 = i;
      i = y1; y1 = y2; y2 = i;
    }
    const idiv = (a: number, b: number): number => (a / b) | 0;
    if (x1 < cx1) {
      const my = y2 - y1, mx = x2 - x1;
      if (!mx) return;
      if (my) {
        const b = y1 - idiv(Math.imul(y2 - y1, x1), mx);
        y1 = s16(idiv(Math.imul(my, cx1), mx) + b);
        x1 = s16(cx1);
      } else x1 = s16(cx1);
    }
    if (x2 >= cx2) {
      const my = y2 - y1, mx = x2 - x1;
      if (!mx) return;
      if (my) {
        const b = y1 - idiv(Math.imul(y2 - y1, x1), mx);
        y2 = s16(idiv(Math.imul(my, cx2 - 1), mx) + b);
        x2 = s16(cx2 - 1);
      } else x2 = s16(cx2 - 1);
    }
    if (y1 > y2) {
      i = x1; x1 = x2; x2 = i;
      i = y1; y1 = y2; y2 = i;
    }
    if (y2 >= cy2) {
      const mx = x2 - x1, my = y2 - y1;
      if (!my) return;
      if (mx) {
        const b = y1 - idiv(Math.imul(y2 - y1, x1), mx);
        x2 = s16(idiv(Math.imul(cy2 - 1 - b, mx), my));
        y2 = s16(cy2 - 1);
      } else y2 = s16(cy2 - 1);
    }
    if (y1 < cy1) {
      const mx = x2 - x1, my = y2 - y1;
      if (!my) return;
      if (mx) {
        const b = y1 - idiv(Math.imul(y2 - y1, x1), mx);
        x1 = s16(idiv(Math.imul(cy1 - b, mx), my));
        y1 = s16(cy1);
      } else y1 = s16(cy1);
    }
    if (x1 < cx1 || x2 < cx1 || x1 >= cx2 || x2 >= cx2 || y1 < cy1 || y2 < cy1 || y1 >= cy2 || y2 >= cy2) return;
    let xc: number, yc: number, xi: number, yi: number;
    if (x1 > x2) { xc = x2; xi = x1; } else { xi = x2; xc = x1; }
    yi = y2; yc = y1;
    this.AddDirty(xc, yc, xi + 1, yi + 1);
    let dcx = x1, dcy = y1;
    xc = s16(x2 - x1); yc = s16(y2 - y1);
    xi = xc < 0 ? -1 : 1;
    yi = yc < 0 ? -1 : 1;
    const n = Math.abs(xc), m = Math.abs(yc);
    const ycyi = s16(Math.abs(2 * yc * xi));
    let er = 0;
    const d = this.m_data, w = this.w;
    if (n > m) {
      const xcxi = s16(Math.abs(2 * xc * xi));
      for (i = 0; i <= n; i++) {
        d[dcy * w + dcx] = color;
        if (er > 0) {
          dcy += yi;
          er = s16(er - xcxi);
        }
        er = s16(er + ycyi);
        dcx += xi;
      }
    } else {
      const xcyi = s16(Math.abs(2 * xc * yi));
      for (i = 0; i <= m; i++) {
        d[dcy * w + dcx] = color;
        if (er > 0) {
          dcx += xi;
          er = s16(er - ycyi);
        }
        er = s16(er + xcyi);
        dcy += yi;
      }
    }
  }

  put_image(screen: image, x: number, y: number, transparent = 0): void {
    x = s16(x); y = s16(y);
    if (screen.m_special) {
      this.put_part(screen, x, y, 0, 0, this.w - 1, this.h - 1, transparent);
      return;
    }
    if (x < screen.w && y < screen.h) {
      let xl = this.w;
      if (x + xl > screen.w) xl = screen.w - x;
      let yl = this.h;
      if (y + yl > screen.h) yl = screen.h - y;
      let startx = 0, starty = 0;
      if (x < 0) { startx = -x; x = 0; }
      if (y < 0) { starty = -y; y = 0; }
      if (xl < 0 || yl < 0) return;
      screen.AddDirty(x, y, x + xl, y + yl);
      const sd = screen.m_data, md = this.m_data;
      for (let j = starty; j < yl; j++, y++) {
        const pg1 = y * screen.w, pg2 = j * this.w;
        if (transparent) {
          for (let i = startx, s = pg2 + startx, dd = pg1 + x; i < xl; i++, s++, dd++) if (md[s]) sd[dd] = md[s];
        } else {
          const end = Math.min(pg1 + x + xl, sd.length);
          sd.set(md.subarray(pg2, pg2 + (end - (pg1 + x))), pg1 + x);
        }
      }
    }
  }

  fill_image(screen: image, x1: number, y1: number, x2: number, y2: number, align = 1): void {
    x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    const sp = screen.m_special;
    if (sp) {
      x1 = s16(sp.bound_x1(x1));
      y1 = s16(sp.bound_y1(y1));
      x2 = s16(sp.bound_x2(x2 + 1) - 1);
      y2 = s16(sp.bound_y2(y2 + 1) - 1);
    } else {
      if (x1 < 0) x1 = 0;
      if (y2 < 0) y1 = 0;
      if (x2 >= screen.w) x2 = screen.w - 1;
      if (y2 >= screen.h) y2 = screen.h - 1;
    }
    if (x2 < 0 || y2 < 0 || x1 >= screen.w || y1 >= screen.h) return;
    screen.AddDirty(x1, y1, x2 + 1, y2 + 1);
    const w = this.w;
    let start: number, starty: number;
    if (align) {
      start = x1 % w;
      starty = y1 % this.h;
    } else {
      start = 0;
      starty = 0;
    }
    for (let j = y1; j <= y2; j++) {
      const pg1 = j * screen.w;
      const pg2 = starty++ * w;
      if (starty >= this.h) starty = 0;
      let i = x1, xx = start;
      while (i <= x2) {
        const xl = Min(w - xx, x2 - i + 1);
        screen.m_data.set(this.m_data.subarray(pg2 + xx, pg2 + xx + xl), pg1 + i);
        xx = 0;
        i += xl;
      }
    }
  }

  put_part(screen: image, x: number, y: number, x1: number, y1: number, x2: number, y2: number, transparent = 0): void {
    x = s16(x); y = s16(y); x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    const [cx1, cy1, cx2, cy2] = screen.GetClip();
    if (x1 < 0) { x = s16(x - x1); x1 = 0; }
    if (y1 < 0) { y = s16(y - y1); y1 = 0; }
    if (x2 >= this.w) x2 = this.w - 1;
    if (y2 >= this.h) y2 = this.h - 1;
    if (x1 > x2 || y1 > y2) return;
    if (x >= cx2 || y >= cy2 || x + (x2 - x1) < cx1 || y + (y2 - y1) < cy1) return;
    if (x < cx1) { x1 = s16(x1 + (cx1 - x)); x = s16(cx1); }
    if (y < cy1) { y1 = s16(y1 + (cy1 - y)); y = s16(cy1); }
    if (x + x2 - x1 + 1 >= cx2) x2 = s16(cx2 - 1 - x + x1);
    if (y + y2 - y1 + 1 >= cy2) y2 = s16(cy2 - 1 - y + y1);
    if (x1 > x2 || y1 > y2) return;
    const xlen = x2 - x1 + 1, ylen = y2 - y1 + 1;
    screen.AddDirty(x, y, x + xlen, y + ylen);
    const sd = screen.m_data, md = this.m_data;
    let pg1 = y * screen.w, pg2 = y1 * this.w;
    if (transparent) {
      for (let j = 0; j < ylen; j++) {
        for (let i = 0, s = pg2 + x1, d = pg1 + x; i < xlen; i++, s++, d++) if (md[s]) sd[d] = md[s];
        pg1 += screen.w;
        pg2 += this.w;
      }
    } else {
      for (let j = 0; j < ylen; j++) {
        sd.set(md.subarray(pg2 + x1, pg2 + x1 + xlen), pg1 + x);
        pg1 += screen.w;
        pg2 += this.w;
      }
    }
  }

  put_part_xrev(screen: image, x: number, y: number, x1: number, y1: number, x2: number, y2: number, transparent = 0): void {
    x = s16(x); y = s16(y); x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    let i = x1;
    x1 = s16(this.w - x2 - 1);
    x2 = s16(this.w - i - 1);
    if (x1 < 0) { x = s16(x - x1); x1 = 0; }
    if (y1 < 0) { y = s16(y - y1); y1 = 0; }
    if (screen.m_special) {
      const [cx1, cy1, cx2, cy2] = screen.m_special.GetClip();
      if (x >= cx2 || y >= cy2 || x + (x2 - x1) < 0 || y + (y2 - y1) < 0) return;
      if (x < cx1) { x1 = s16(x1 + (cx1 - x)); x = s16(cx1); }
      if (y < cy1) { y1 = s16(y1 + (cy1 - y)); y = s16(cy1); }
      if (x + x2 - x1 + 1 >= cx2) x2 = s16(cx2 - 1 - x + x1);
      if (y + y2 - y1 + 1 >= cy2) y2 = s16(cy2 - 1 - y + y1);
    } else if (x > screen.w || y > screen.h || x + x2 < 0 || y + y2 < 0) return;
    if (x < screen.w && y < screen.h && x1 < this.w && y1 < this.h && x1 <= x2 && y1 <= y2) {
      if (x2 >= this.w) x2 = this.w - 1;
      if (y2 >= this.h) y2 = this.h - 1;
      let xl = x2 - x1 + 1;
      if (x + xl > screen.w) xl = screen.w - x;
      let yl = y2 - y1 + 1;
      if (y + yl > screen.h) yl = screen.h - y;
      screen.AddDirty(x, y, x + xl, y + yl);
      const sd = screen.m_data, md = this.m_data;
      for (let j = 0; j < yl; j++) {
        const pg1 = (y + j) * screen.w, pg2 = (y1 + j) * this.w;
        if (transparent) {
          let s = pg2 + x1, d = pg1 + x + xl - 1;
          for (i = 0; i < xl; i++, s++, d--) if (md[s]) sd[d] = md[s];
        } else {
          // the original walks dest forward here (dest++), not backward
          let s = pg2 + x1, d = pg1 + x + xl - 1;
          for (i = 0; i < xl; i++, s++, d++) if (d < sd.length) sd[d] = md[s];
        }
      }
    }
  }

  put_part_masked(screen: image, mask: image, x: number, y: number, maskx: number, masky: number,
    x1: number, y1: number, x2: number, y2: number): void {
    x = s16(x); y = s16(y); maskx = s16(maskx); masky = s16(masky); x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    if (screen.m_special) {
      const [cx1, cy1, cx2, cy2] = screen.m_special.GetClip();
      if (x >= cx2 || y >= cy2 || x + (x2 - x1) < 0 || y + (y2 - y1) < 0) return;
      if (x < cx1) { x1 = s16(x1 + (cx1 - x)); x = s16(cx1); }
      if (y < cy1) { y1 = s16(y1 + (cy1 - y)); y = s16(cy1); }
      if (x + x2 - x1 >= cx2) x2 = s16(cx2 - 1 + x1 - x);
      if (y + y2 - y1 >= cy2) y2 = s16(cy2 - 1 + y1 - y);
    } else if (x > screen.w || y > screen.h || x + x1 < 0 || y + y1 < 0) return;
    const ml = mask.w, mh = mask.h;
    if (x < screen.w && y < screen.h && x1 < this.w && y1 < this.h && maskx < ml && masky < mh && x1 <= x2 && y1 <= y2) {
      if (x2 >= this.w) x2 = this.w - 1;
      if (y2 >= this.h) y2 = this.h - 1;
      let xl = x2 - x1 + 1;
      if (x + xl > screen.w) xl = screen.w - x - 1;
      let yl = y2 - y1 + 1;
      if (y + yl > screen.h) yl = screen.h - y - 1;
      screen.AddDirty(x, y, x + xl, y + yl);
      for (let j = 0; j < yl; j++) {
        const pg1 = (y + j) * screen.w, pg2 = (y1 + j) * this.w, pg3 = masky++ * mask.w;
        if (masky >= mh) masky = 0;
        for (let i = 0; i < xl; i++) {
          if (mask.m_data[pg3 + maskx + i]) screen.m_data[pg1 + x + i] = this.m_data[pg2 + x1 + i];
          if (maskx >= ml) maskx = 0;
        }
      }
    }
  }

  rectangle(x1: number, y1: number, x2: number, y2: number, color: number): void {
    this.line(x1, y1, x2, y1, color);
    this.line(x2, y1, x2, y2, color);
    this.line(x1, y2, x2, y2, color);
    this.line(x1, y1, x1, y2, color);
  }

  bar(x1: number, y1: number, x2: number, y2: number, color: number): void {
    x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    if (x1 > x2 || y1 > y2) return;
    const sp = this.m_special;
    if (sp) {
      x1 = s16(sp.bound_x1(x1));
      y1 = s16(sp.bound_y1(y1));
      x2 = s16(sp.bound_x2(x2 + 1) - 1);
      y2 = s16(sp.bound_y2(y2 + 1) - 1);
    } else {
      if (x1 < 0) x1 = 0;
      if (y1 < 0) y1 = 0;
      if (x2 >= this.w) x2 = this.w - 1;
      if (y2 >= this.h) y2 = this.h - 1;
    }
    if (x2 < 0 || y2 < 0 || x1 >= this.w || y1 >= this.h || x2 < x1 || y2 < y1) return;
    for (let y = y1; y <= y2; y++) this.m_data.fill(color & 0xff, y * this.w + x1, y * this.w + x2 + 1);
    this.AddDirty(x1, y1, x2 + 1, y2 + 1);
  }

  xor_bar(x1: number, y1: number, x2: number, y2: number, color: number): void {
    x1 = s16(x1); y1 = s16(y1); x2 = s16(x2); y2 = s16(y2);
    if (x1 > x2 || y1 > y2) return;
    const sp = this.m_special;
    if (sp) {
      x1 = s16(sp.bound_x1(x1));
      y1 = s16(sp.bound_y1(y1));
      x2 = s16(sp.bound_x2(x2 + 1) - 1);
      y2 = s16(sp.bound_y2(y2 + 1) - 1);
    } else {
      if (x1 < 0) x1 = 0;
      if (y1 < 0) y1 = 0;
      if (x2 >= this.w) x2 = this.w - 1;
      if (y2 >= this.h) y2 = this.h - 1;
    }
    if (x2 < 0 || y2 < 0 || x1 >= this.w || y1 >= this.h || x2 < x1 || y2 < y1) return;
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) this.m_data[y * this.w + x] ^= color;
    this.AddDirty(x1, y1, x2 + 1, y2 + 1);
  }

  widget_bar(x1: number, y1: number, x2: number, y2: number, light: number, med: number, dark: number): void {
    this.line(x1, y1, x2, y1, light);
    this.line(x1, y1, x1, y2, light);
    this.line(x2, y1 + 1, x2, y2, dark);
    this.line(x1 + 1, y2, x2 - 1, y2, dark);
    this.bar(x1 + 1, y1 + 1, x2 - 1, y2 - 1, med);
  }

  burn_led(x: number, y: number, num: number, color: number, scale = 1): void {
    const ledx = [1, 2, 1, 2, 3, 3, 3, 3, 1, 2, 0, 0, 0, 0];
    const ledy = [3, 3, 0, 0, 1, 2, 4, 6, 7, 7, 4, 6, 1, 2];
    const dig = [2 + 4 + 8 + 16 + 32 + 64, 4 + 8, 2 + 4 + 1 + 32 + 16, 2 + 4 + 1 + 8 + 16, 64 + 1 + 4 + 8,
      2 + 64 + 1 + 8 + 16, 64 + 32 + 1 + 8 + 16, 2 + 4 + 8, 1 + 2 + 4 + 8 + 16 + 32 + 64, 64 + 2 + 4 + 1 + 8, 1];
    const st = String(num).padStart(8, ' ');
    for (let xx = 0; xx < 8; xx++) {
      if (st[xx] !== ' ') {
        const zz = st[xx] === '-' ? 10 : st.charCodeAt(xx) - 48;
        for (let yy = 0; yy < 7; yy++)
          if ((1 << yy) & dig[zz])
            this.line(x + ledx[yy * 2] * scale, y + ledy[yy * 2] * scale, x + ledx[yy * 2 + 1] * scale, y + ledy[yy * 2 + 1] * scale, color);
      }
      x += 6 * scale;
    }
  }

  scroll(x1: number, y1: number, x2: number, y2: number, xd: number, yd: number): void {
    if (this.m_special) {
      const [cx1, cy1, cx2, cy2] = this.m_special.GetClip();
      x1 = Max(x1, cx1); y1 = Max(cy1, y1); x2 = Min(x2, cx2 - 1); y2 = Min(y2, cy2 - 1);
    }
    const xtot = x2 - x1 - Math.abs(xd) + 1;
    let xsrc: number, ysrc: number, xdst: number, ydst: number;
    if (xd < 0) { xsrc = x1 - xd; xdst = x1; } else { xsrc = x2 - xd; xdst = x2; }
    if (yd < 0) { ysrc = y1 - yd; ydst = y1; } else { ysrc = y2 - yd; ydst = y2; }
    const d = this.m_data;
    for (let ytot = y2 - y1 - Math.abs(yd) + 1; ytot; ytot--) {
      let src = ysrc * this.w + xsrc, dst = ydst * this.w + xdst;
      if (xd < 0) for (let xt = 0; xt < xtot; xt++) d[dst++] = d[src++];
      else for (let xt = 0; xt < xtot; xt++) d[dst--] = d[src--];
      if (yd < 0) { ysrc++; ydst++; } else { ysrc--; ydst--; }
    }
    this.AddDirty(x1, y1, x2 + 1, y2 + 1);
  }

  Scale(nw: number, nh: number): void {
    const ow = this.w, oh = this.h;
    const im = this.m_data.slice(0, ow * oh);
    this.m_data = new Uint8Array(nw * nh);
    this.w = nw;
    this.h = nh;
    const yc = oh / nh, xc = ow / nw;
    let yd = 0;
    for (let y2 = 0; y2 < nh; yd += yc, y2++) {
      const sl1 = Math.trunc(yd) * ow, sl2 = y2 * nw;
      let xd = 0;
      for (let x2 = 0; x2 < nw; xd += xc, x2++) this.m_data[sl2 + x2] = im[sl1 + Math.trunc(xd)];
    }
    if (this.m_special) this.m_special.Resize(nw, nh);
  }

  SetSize(w: number, h: number, page: Uint8Array | null = null): void {
    this.w = w;
    this.h = h;
    this.m_data = page ?? new Uint8Array(w * h);
  }

  FlipX(): void {
    for (let y = 0; y < this.h; y++) this.m_data.subarray(y * this.w, (y + 1) * this.w).reverse();
  }

  FlipY(): void {
    for (let y = 0; y < this.h >> 1; y++) {
      const a = this.m_data.slice(y * this.w, (y + 1) * this.w);
      const o = (this.h - 1 - y) * this.w;
      this.m_data.copyWithin(y * this.w, o, o + this.w);
      this.m_data.set(a, o);
    }
  }

  dither(pal: palette): void {
    const dt = [0, 136, 24, 170, 68, 204, 102, 238, 51, 187, 17, 153, 119, 255, 85, 221];
    for (let y = 0; y < this.h; y++) {
      const j = y % 4;
      for (let x = 0; x < this.w; x++) {
        const o = y * this.w + x;
        this.m_data[o] = pal.red(this.m_data[o]) > dt[j * 4 + (x & 3)] ? 255 : 0;
      }
    }
  }
}
