// particle.cpp: particle animations (def_particle, add_panim) and the scattered lines of lasers
import { bFILE, open_file, spec_directory, SPEC_PARTICLE } from './imlib/specs.ts';
import type { image } from './imlib/image.ts';
import { jrand } from './imlib/jrand.ts';
import { fatal } from './imlib/dprint.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { item_type, L_SYMBOL, lcar, lcdr, lstring_value, print, set_number, type LObj, type LSymbol } from './lisp/lisp.ts';
import type { view } from './view.ts';

export class part_frame {
  t: number;
  x1 = 100000;
  y1 = 100000;
  x2 = -100000;
  y2 = -100000;
  xs: Int16Array;
  ys: Int16Array;
  color: Uint8Array;

  constructor(fp: bFILE) {
    this.t = fp.read_uint32() | 0;
    this.xs = new Int16Array(this.t);
    this.ys = new Int16Array(this.t);
    this.color = new Uint8Array(this.t);
    for (let i = 0; i < this.t; i++) {
      const x = (fp.read_uint16() << 16) >> 16;
      const y = (fp.read_uint16() << 16) >> 16;
      if (x < this.x1) this.x1 = x;
      if (y < this.y1) this.y1 = y;
      if (x > this.x2) this.x2 = x;
      if (y > this.y2) this.y2 = x; // sic
      this.xs[i] = x;
      this.ys[i] = y;
      this.color[i] = fp.read_uint8();
    }
  }

  draw(screen: image, x: number, y: number, dir: number): void {
    let [cx1, cy1, cx2, cy2] = screen.GetClip();
    if (x + this.x1 >= cx2 || x + this.x2 < cx1 || y + this.y1 >= cy2 || y + this.y2 < cy1) return;
    let p = 0;
    cy1 -= y;
    cy2 -= y;
    let i = this.t;
    while (i && this.ys[p] < cy1) {
      p++;
      i--;
    }
    if (!i) return;
    const d = screen.m_data, w = screen.w;
    while (i && this.ys[p] < cy2) {
      const dx = dir > 0 ? x - this.xs[p] : this.xs[p] + x;
      if (dx >= cx1 && dx < cx2) d[(this.ys[p] + y) * w + dx] = this.color[p];
      i--;
      p++;
    }
  }
}

class part_sequence {
  tframes = 0;
  frames: number[] = [];
  constructor(args: LObj) {
    const fn = lstring_value(lcar(args));
    const fp = open_file(fn, 'rb');
    if (fp.open_failure()) {
      fp.close();
      print(args);
      fatal(`particle sequence : Unable to open ${fn} for reading`);
    }
    const sd = new spec_directory(fp);
    fp.close();
    for (const e of sd.entries) if (e.type === SPEC_PARTICLE) this.tframes++;
    for (const e of sd.entries) if (e.type === SPEC_PARTICLE) this.frames.push(cache.reg(fn, e.name, SPEC_PARTICLE, 1));
  }
}

class part_animation {
  next: part_animation | null;
  seq: part_sequence;
  frame = 0;
  dir: number;
  x: number;
  y: number;
  constructor(s: part_sequence, X: number, Y: number, Dir: number, Next: part_animation | null) {
    this.x = X;
    this.y = Y;
    this.seq = s;
    this.next = Next;
    this.dir = Dir;
  }
}

let pseqs: part_sequence[] = [];
let first_anim: part_animation | null = null, last_anim: part_animation | null = null;

export function particle_reset(): void {
  pseqs = [];
  first_anim = last_anim = null;
}

export function free_pframes(): void { pseqs = []; }

export function add_panim(id: number, x: number, y: number, dir: number): void {
  const pan = new part_animation(pseqs[id], x, y, dir, null);
  if (!first_anim) first_anim = last_anim = pan;
  else {
    last_anim!.next = pan;
    last_anim = pan;
  }
}

export function delete_panims(): void {
  first_anim = null;
  last_anim = null;
}

export function defun_pseq(args: LObj): number {
  const sym = lcar(args);
  if (item_type(sym) !== L_SYMBOL) {
    print(args);
    fatal('expecting first arg to def-particle to be a symbol!');
  }
  set_number(sym as LSymbol, pseqs.length);
  pseqs.push(new part_sequence(lcdr(args)));
  return pseqs.length;
}

export function tick_panims(): void {
  let last: part_animation | null = null;
  for (let p = first_anim; p;) {
    p.frame++;
    if (p.frame >= p.seq.tframes) {
      if (last) last.next = p.next;
      else first_anim = first_anim!.next;
      if (last_anim === p) last_anim = last;
      p = p.next;
    } else {
      last = p;
      p = p.next;
    }
  }
}

export function draw_panims(v: view): void {
  for (let p = first_anim; p; p = p.next)
    cache.part(p.seq.frames[p.frame]).draw(G.screen, p.x - v.xoff() + v.cx1, p.y - v.yoff() + v.cy1, p.dir);
}

export function scatter_line(x1: number, y1: number, x2: number, y2: number, c: number, s: number): void {
  const screen = G.screen;
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  let t = Math.abs(x2 - x1) > Math.abs(y2 - y1) ? Math.abs(x2 - x1) + 1 : Math.abs(y2 - y1) + 1;
  let xo = x1 << 16, yo = y1 << 16;
  const dx = (((x2 - x1) << 16) / t) | 0, dy = (((y2 - y1) << 16) / t) | 0;
  const xm = 1 << s, ym = 1 << s;
  s = 15 - s;
  while (t--) {
    const x = (xo >> 16) + (jrand() >> s) - xm;
    const y = (yo >> 16) + (jrand() >> s) - ym;
    if (!(x < cx1 || y < cy1 || x >= cx2 || y >= cy2)) screen.m_data[y * screen.w + x] = c;
    xo = (xo + dx) | 0;
    yo = (yo + dy) | 0;
  }
}

export function ascatter_line(x1: number, y1: number, x2: number, y2: number, c1: number, c2: number, s: number): void {
  const screen = G.screen;
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  let t = Math.abs(x2 - x1) > Math.abs(y2 - y1) ? Math.abs(x2 - x1) + 1 : Math.abs(y2 - y1) + 1;
  let xo = x1 << 16, yo = y1 << 16;
  const dx = (((x2 - x1) << 16) / t) | 0, dy = (((y2 - y1) << 16) / t) | 0;
  const xm = 1 << s, ym = 1 << s;
  s = 15 - s;
  const w = screen.w, d = screen.m_data;
  while (t--) {
    const x = (xo >> 16) + (jrand() >> s) - xm;
    const y = (yo >> 16) + (jrand() >> s) - ym;
    if (!(x <= cx1 || y <= cy1 || x >= cx2 - 1 || y >= cy2 - 1)) {
      const a = y * w + x;
      d[a] = c1;
      d[a + w] = c2;
      d[a - w] = c2;
      d[a - 1] = c2;
      d[a + 1] = c2;
    }
    xo = (xo + dx) | 0;
    yo = (yo + dy) | 0;
  }
}
