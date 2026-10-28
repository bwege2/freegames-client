// items.cpp: tiles (foretile, backtile), character frames (figure), tints, boundaries; load_image of loader2.cpp
import { image } from './imlib/image.ts';
import { TransImage } from './imlib/transimage.ts';
import { palette } from './imlib/palette.ts';
import { SPEC_CHARACTER, type bFILE, type spec_entry } from './imlib/specs.ts';
import { point_list, scaling } from './points.ts';
import { G } from './globals.ts';
import { lbreak } from './lisp/lisp.ts';
import { fatal } from './imlib/dprint.ts';

export const AUTOTILE_WIDTH = 6, AUTOTILE_HEIGHT = 3;

export function load_image(fp: bFILE, e: spec_entry | null = null): image {
  const im = image.load(fp, e);
  if (scaling.scale_mult !== 1 || scaling.scale_div !== 1)
    im.Scale(((im.w * scaling.scale_mult) / scaling.scale_div) | 0, ((im.h * scaling.scale_mult) / scaling.scale_div) | 0);
  return im;
}

/** which side of each segment is inside (both constructors of boundary) */
function compute_inside(b: boundary, flipped: boolean): void {
  const data = b.data, tot = b.tot;
  b.inside = new Uint8Array(tot);
  for (let i = 0, po = 0; i < tot - 1; i++) {
    const x1 = data[po++], y1 = data[po++], x2 = data[po], y2 = data[po + 1];
    const checkx = ((x1 + x2) / 2) | 0, checky = ((y1 + y2) / 2) | 0;
    let segs_left = 0, segs_right = 0, segs_down = 0;
    let skip_next = 0;
    let check_left = 0, check_right = 0, check_down = 0;
    if (y1 === y2) check_down = 1;
    else if (x1 === x2) {
      if (flipped) check_right = 1;
      else check_left = 1;
    } else {
      check_down = 1;
      if (x1 < x2) {
        if (y1 < y2) check_left = 1;
        else check_right = 1;
      } else if (y1 < y2) check_right = 1;
      else check_left = 1;
    }
    const maxx = Math.max(x1, x2), minx = Math.min(x1, x2), miny = Math.min(y1, y2);
    for (let j = 0, p2 = 0; j < tot - 1; j++, p2 += 2) {
      if (skip_next) skip_next = 0;
      else if (j !== i) {
        const xp1 = data[p2], yp1 = data[p2 + 1], xp2 = data[p2 + 2], yp2 = data[p2 + 3];
        if ((checkx >= xp1 && checkx <= xp2) || (checkx >= xp2 && checkx <= xp1)) {
          if (check_down && yp1 > miny && yp2 > miny) segs_down = (segs_down + 1) & 0xff;
          if (checkx === xp2) skip_next = 1;
        } else if ((checky >= yp1 && checky <= yp2) || (checky >= yp2 && checky <= yp1)) {
          if (check_left && xp1 < maxx && xp2 < maxx) segs_left = (segs_left + 1) & 0xff;
          if (check_right && xp1 > minx && xp2 > minx) segs_right = (segs_right + 1) & 0xff;
          if (checky === yp2) skip_next = 1;
        }
      }
    }
    if (!check_down) segs_down = 1;
    if (!check_right) segs_right = 1;
    if (!check_left) segs_left = 1;
    b.inside[i] = (segs_left & 1) && (segs_right & 1) && (segs_down & 1) ? 0 : 1;
  }
}

export class boundary extends point_list {
  inside: Uint8Array = new Uint8Array(0);

  static read(fp: bFILE, er_name: string): boundary {
    const p = point_list.load(fp);
    const b = new boundary(p.tot, p.data);
    if (b.tot) {
      if (!(b.data[0] === b.data[(b.tot - 1) * 2] && b.data[1] === b.data[b.tot * 2 - 1]))
        fatal(`${er_name} : Endpoints of foretile do not match start points`);
    }
    compute_inside(b, false);
    return b;
  }

  /** boundary(boundary *p): the same points, inside computed again (with the original's left/right swap) */
  static flipped(p: boundary): boundary {
    const b = new boundary(p.tot, p.data);
    compute_inside(b, true);
    return b;
  }
}

export class backtile {
  next: number;
  im: image;
  constructor(fp: bFILE, e: spec_entry | null = null) {
    this.im = load_image(fp, e);
    this.next = fp.read_uint16();
  }
  size(): number { return 2 + 4 + this.im.w * this.im.h; }
}

export class foretile {
  im: TransImage;
  next: number;
  damage: number;
  /** never set by the original (uninitialised memory); unused */
  ylevel = 0;
  points: boundary;
  micro_image: image;

  constructor(fp: bFILE) {
    const img = load_image(fp);
    const w = img.w, h = img.h;
    const n = AUTOTILE_WIDTH * AUTOTILE_HEIGHT;
    const r = new Int32Array(n), g = new Int32Array(n), b = new Int32Array(n), t = new Int32Array(n);
    const pal = G.pal, ct = G.color_table;
    if (!pal) lbreak('Palette has no been defined\nuse load_palette before load_tiles');
    if (!ct) lbreak('color filter has no been defined\nuse load_color_filter before load_tiles');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = img.m_data[y * w + x];
        const l = (((y * AUTOTILE_HEIGHT) / h) | 0) * AUTOTILE_WIDTH + (((x * AUTOTILE_WIDTH) / w) | 0);
        r[l] += pal.red(c);
        g[l] += pal.green(c);
        b[l] += pal.blue(c);
        t[l]++;
      }
    }
    this.micro_image = new image(AUTOTILE_WIDTH, AUTOTILE_HEIGHT);
    for (let l = 0; l < n; l++) {
      const d = ((t[l] * 4) / 5) | 0;
      this.micro_image.PutPixel(l % AUTOTILE_WIDTH, (l / AUTOTILE_WIDTH) | 0,
        ct.Lookup(((r[l] / d) | 0) >> 3, ((g[l] / d) | 0) >> 3, ((b[l] / d) | 0) >> 3));
    }
    this.im = new TransImage(img, 'foretile');
    this.next = fp.read_uint16();
    this.damage = fp.read_uint8();
    this.points = boundary.read(fp, 'foretile boundry');
  }
}

export class figure {
  forward: TransImage;
  backward: TransImage;
  hit_damage: number;
  xcfg: number;
  advance: number;
  hit: point_list;
  f_damage: boundary;
  b_damage: boundary;

  constructor(fp: bFILE, type: number) {
    const im = load_image(fp);
    this.forward = new TransImage(im, 'figure data');
    im.FlipX();
    this.backward = new TransImage(im, 'figure backward data');
    this.hit_damage = fp.read_uint8();
    this.xcfg = fp.read_uint8();
    this.xcfg = ((this.xcfg * scaling.scale_mult) / scaling.scale_div) & 0xff;
    if (type === SPEC_CHARACTER) {
      point_list.load(fp);
      this.advance = 0;
    } else this.advance = (fp.read_uint8() << 24) >> 24;
    this.f_damage = boundary.read(fp, 'fig bound');
    this.b_damage = boundary.flipped(this.f_damage);
    this.hit = point_list.load(fp);
  }

  width(): number { return this.forward.w; }
  height(): number { return this.forward.h; }
}

export class char_tint {
  data = new Uint8Array(256);
  constructor(fp: bFILE) {
    const p = palette.fromFile(fp);
    const a = p.addr();
    for (let i = 0; i < 256; i++) this.data[i] = G.pal.find_closest(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
  }
}
