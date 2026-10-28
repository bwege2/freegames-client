// imlib/scroller.cpp: scroll bars and item pickers (spicker; the gamma dialog's grey picker)
import { ifield, InputManager } from './jwindow.ts';
import type { image } from './image.ts';
import { event, EV_KEY, EV_MOUSE_BUTTON, EV_MOUSE_MOVE } from './event.ts';
import { JK_DOWN, JK_LEFT, JK_RIGHT, JK_UP } from './keys.ts';
import { G } from '../globals.ts';
import { frame_bottom, frame_left } from './jwindow.ts';

const hs_left_arrow = [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 1, 2, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0];
const hs_right_arrow = [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 2, 1, 1, 0,
  0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0];
const vs_up_arrow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 1, 2, 1, 1, 2, 1, 2,
  0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0,
  0, 0, 0, 0, 0, 2, 2, 0, 0];
const vs_down_arrow = [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0,
  0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 1, 2, 1, 1, 2, 1, 2, 0, 0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 1, 1, 2, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0];

export function show_icon(screen: image, x: number, y: number, icw: number, ich: number, buf: number[]): void {
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  const remap = [G.wm.medium_color(), G.wm.bright_color(), G.wm.dark_color()];
  let b = 0;
  for (let yc = ich; yc; yc--, y++) {
    if (y >= cy1 && y < cy2) {
      let sl = y * screen.w + x;
      for (let xc = icw, xo = x; xc; xc--, xo++, sl++, b++) if (xo >= cx1 && xo < cx2) screen.m_data[sl] = remap[buf[b]] ?? 0;
    }
  }
  screen.AddDirty(x, y, x + icw, y + ich);
}

/** The icons are drawn (bw()-4) x (bh()-4) = 10x9 or 8x11 bytes from 80-byte arrays, so the original
 *  reads on into whatever follows in memory: the four arrays lie one after another (clang's data
 *  layout, checked in the oracle with nm), and after the last come jwindow.cpp's ints jw_bottom and
 *  jw_left. The values past the 3-entry remap table that those ints index are stack bytes of the
 *  original; the port uses 0 there (show_icon). */
function arrow_memory(offset: number): number[] {
  const tail = [frame_bottom(), 0, 0, 0, frame_left(), 0, 0, 0];
  return [...hs_left_arrow, ...hs_right_arrow, ...vs_up_arrow, ...vs_down_arrow, ...tail].slice(offset);
}

export class scroller extends ifield {
  l: number;
  h: number;
  drag = -1;
  vert: number;
  last_click = -1;
  t: number;
  sx = 0;

  constructor(X: number, Y: number, ID: number, L: number, H: number, Vert: number, Total: number, Next: ifield | null) {
    super();
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.next = Next;
    this.l = L;
    this.h = H;
    this.t = Total;
    this.vert = Vert;
  }

  bh(): number { return this.vert ? 15 : 13; }
  bw(): number { return this.vert ? 12 : 14; }
  b1x(): number { return this.vert ? this.x + this.l : this.x; }
  b1y(): number { return this.vert ? this.y : this.y + this.h; }
  b2x(): number { return this.vert ? this.x + this.l : this.x + this.l - this.bw(); }
  b2y(): number { return this.vert ? this.y + this.h - this.bh() : this.y + this.h; }
  b1(): number[] { return arrow_memory(this.vert ? 160 : 0); }
  b2(): number[] { return arrow_memory(this.vert ? 240 : 80); }
  area_config(): void {}
  activate_on_mouse_move(): number { return 1; }
  handle_inside_event(_ev: event, _screen: image, _inm: InputManager): void {}
  read(): unknown { return this.sx; }

  area(): [number, number, number, number] {
    this.area_config();
    if (this.vert) return [this.x - 1, this.y - 1, this.x + this.l + this.bw(), this.y + this.h];
    return [this.x - 1, this.y - 1, this.x + this.l, this.y + this.h + this.bh()];
  }

  dragger_area(): [number, number, number, number] {
    if (this.vert) return [this.x + this.l, this.y + this.bh(), this.x + this.l + this.bw() - 1, this.y + this.h - this.bh() - 1];
    return [this.x + this.bw(), this.y + this.h, this.x + this.l - this.bw(), this.y + this.h + this.bh() - 1];
  }

  draw_first(screen: image): void {
    const wm = G.wm;
    if (this.sx >= this.t) this.sx = this.t - 1;
    this.draw(0, screen);
    screen.widget_bar(this.b1x(), this.b1y(), this.b1x() + this.bw() - 1, this.b1y() + this.bh() - 1, wm.bright_color(), wm.medium_color(), wm.dark_color());
    screen.widget_bar(this.b2x(), this.b2y(), this.b2x() + this.bw() - 1, this.b2y() + this.bh() - 1, wm.bright_color(), wm.medium_color(), wm.dark_color());
    show_icon(screen, this.b1x() + 2, this.b1y() + 2, this.bw() - 4, this.bh() - 4, this.b1());
    show_icon(screen, this.b2x() + 2, this.b2y() + 2, this.bw() - 4, this.bh() - 4, this.b2());
    const [x1, y1, x2, y2] = this.dragger_area();
    screen.bar(x1, y1, x2, y2, wm.black());
    screen.bar(x1 + 1, y1 + 1, x2 - 1, y2 - 1, wm.medium_color());
    this.draw_widget(screen, 0);
    this.scroll_event(this.sx, screen);
  }

  wig_area(): [number, number, number, number] {
    const [, sy1, , sy2] = this.dragger_area();
    const [sx1, , sx2] = this.dragger_area();
    let x1: number, y1: number;
    if (this.vert) {
      x1 = this.x + this.l + 1;
      if (this.t < 2) y1 = this.y + this.bh() + 1;
      else y1 = this.y + this.bh() + 1 + ((this.sx * (sy2 - sy1 + 1 - this.bh())) / (this.t - 1) | 0);
    } else {
      if (this.t < 2) x1 = this.x + this.bw() + 1;
      else x1 = this.x + this.bw() + 1 + ((this.sx * (sx2 - sx1 + 1 - this.bw())) / (this.t - 1) | 0);
      y1 = this.y + this.h + 1;
    }
    return [x1, y1, x1 + this.bw() - 3, y1 + this.bh() - 3];
  }

  draw_widget(screen: image, erase: number): void {
    const [x1, y1, x2, y2] = this.wig_area();
    const wm = G.wm;
    if (erase) screen.bar(x1, y1, x2, y2, wm.medium_color());
    else screen.widget_bar(x1, y1, x2, y2, wm.bright_color(), wm.medium_color(), wm.dark_color());
  }

  draw(active: number, screen: image): void {
    const [x1, y1, x2, y2] = this.area();
    screen.rectangle(x1, y1, x2, y2, active ? G.wm.bright_color() : G.wm.dark_color());
  }

  private step(screen: image, nx: number): void {
    this.draw_widget(screen, 1);
    this.sx = nx;
    this.draw_widget(screen, 0);
    this.scroll_event(this.sx, screen);
  }

  handle_event(ev: event, screen: image, inm: InputManager): void {
    const mx = ev.mouse_move.x, my = ev.mouse_move.y;
    switch (ev.type) {
      case EV_MOUSE_BUTTON:
        if (ev.mouse_button && this.drag === -1) {
          if (mx >= this.b1x() && mx < this.b1x() + this.bw() && my >= this.b1y() - 2 && my < this.b1y() + this.bh()) {
            if (this.sx > 0) this.step(screen, this.sx - 1);
          } else if (mx >= this.b2x() && mx < this.b2x() + this.bw() && my >= this.b2y() && my <= this.b2y() + this.bh()) {
            if (this.sx < this.t - 1) this.step(screen, this.sx + 1);
          } else {
            const [dx1, dy1, dx2, dy2] = this.dragger_area();
            if (mx >= dx1 && mx <= dx2 && my >= dy1 && my <= dy2) {
              const [x1, y1, x2, y2] = this.wig_area();
              if (mx >= x1 && mx <= x2 && my >= y1 && my <= y2) {
                this.drag = this.sx;
                inm.grab_focus(this);
              } else if (this.t > 1) {
                const nx = this.mouse_to_drag(mx, my);
                if (nx !== this.sx && nx >= 0 && nx < this.t) this.step(screen, nx);
              }
            } else this.handle_inside_event(ev, screen, inm);
          }
        } else if (!ev.mouse_button && this.drag !== -1) {
          inm.release_focus();
          this.drag = -1;
        }
        break;
      case EV_MOUSE_MOVE:
        if (this.drag !== -1) {
          let nx = this.mouse_to_drag(mx, my);
          if (nx < 0) nx = 0;
          else if (nx >= this.t) nx = this.t - 1;
          if (nx !== this.sx) this.step(screen, nx);
        } else if (this.activate_on_mouse_move()) {
          if (mx >= this.x && mx <= this.x + this.l - 1 && my >= this.y && my <= this.y + this.h - 1) this.handle_inside_event(ev, screen, inm);
        }
        break;
      case EV_KEY:
        switch (ev.key) {
          case JK_LEFT: this.handle_left(screen, inm); break;
          case JK_RIGHT: this.handle_right(screen, inm); break;
          case JK_UP: this.handle_up(screen, inm); break;
          case JK_DOWN: this.handle_down(screen, inm); break;
          default: this.handle_inside_event(ev, screen, inm);
        }
        break;
    }
  }

  handle_right(screen: image, _inm: InputManager): void { if (!this.vert && this.sx < this.t - 1) this.step(screen, this.sx + 1); }
  handle_left(screen: image, _inm: InputManager): void { if (!this.vert && this.sx > 1) this.step(screen, this.sx - 1); }
  handle_up(screen: image, _inm: InputManager): void { if (this.vert && this.sx > 1) this.step(screen, this.sx - 1); }
  handle_down(screen: image, _inm: InputManager): void { if (this.vert && this.sx < this.t - 1) this.step(screen, this.sx + 1); }

  set_x(x: number, screen: image): void {
    if (x < 0) x = 0;
    if (x >= this.t) x = this.t - 1;
    if (x !== this.sx) this.step(screen, x);
  }

  mouse_to_drag(mx: number, my: number): number {
    const [x1, y1, x2, y2] = this.dragger_area();
    if (this.vert) {
      const h = y2 - y1 + 1 - this.bh();
      return h ? (((my - this.y - this.bh() - ((this.bh() / 2) | 0)) * (this.t - 1)) / h) | 0 : 0;
    }
    const w = x2 - x1 + 1 - this.bw();
    return w ? (((mx - this.x - this.bw() - ((this.bw() / 2) | 0)) * (this.t - 1)) / w) | 0 : 0;
  }

  scroll_event(newx: number, screen: image): void {
    screen.bar(this.x, this.y, this.x + this.l - 1, this.y + this.h - 1, G.wm.black());
    let xa: number, ya: number, xo = 0, yo: number;
    if (this.vert) { xa = 0; ya = 30; yo = this.y + 5; } else { xa = 30; ya = 0; xo = this.x + 5; yo = this.y + 5; }
    for (let i = newx, c = 0; c < 30 && i < 100; i++, c++) {
      G.wm.font().put_string(screen, xo, yo, String(i), G.wm.bright_color());
      xo += xa;
      yo += ya;
    }
  }
}

export abstract class spicker extends scroller {
  r: number;
  c: number;
  m: number;
  last_sel = 0;
  cur_sel = 0;
  select: Uint8Array | null = null;

  constructor(X: number, Y: number, ID: number, Rows: number, Cols: number, Vert: number, MultiSelect: number, Next: ifield | null) {
    super(X, Y, ID, 2, 2, Vert, 0, Next);
    this.l = -1;
    this.last_click = -1;
    this.r = Rows;
    this.c = Cols;
    this.m = MultiSelect;
  }

  abstract draw_item(screen: image, x: number, y: number, num: number, active: number): void;
  abstract total(): number;
  abstract item_width(): number;
  abstract item_height(): number;
  note_selection(_screen: image, _inm: InputManager, _x: number): void {}
  note_new_current(_screen: image, _inm: InputManager, _x: number): void {}
  ok_to_select(_num: number): number { return 1; }

  vis(): number { return this.vert ? this.r : this.c; }

  set_select(x: number, on: number): void {
    if (this.m) {
      if (on) this.select![x >> 3] |= 1 << (x & 7);
      else this.select![x >> 3] &= 0xff - (1 << (x & 7));
    } else this.cur_sel = x;
  }
  get_select(x: number): number {
    if (this.m) return this.select![x >> 3] & (1 << (x & 7));
    return x === this.cur_sel ? 1 : 0;
  }
  first_selected(): number {
    if (this.m) {
      for (let i = 0; i < this.t; i++) if (this.get_select(i)) return i;
      return -1;
    }
    return this.cur_sel;
  }

  reconfigure(): void {
    this.select = null;
    this.t = this.total();
    if (this.sx > this.t) this.sx = this.t - 1;
    if (this.m) this.select = new Uint8Array((this.t + 7) >> 3);
    else this.cur_sel = 0;
  }

  draw_background(screen: image): void {
    screen.bar(this.x, this.y, this.x + this.l - 1, this.y + this.h - 1, G.wm.dark_color());
  }

  area_config(): void {
    this.l = this.vert ? this.item_width() + 4 : this.item_width() * this.c + 4;
    this.h = this.vert ? this.item_height() * this.r + 4 : this.item_height() + 4;
  }

  set_x(x: number, screen: image): void {
    this.cur_sel = x;
    this.sx = x;
    this.scroll_event(x, screen);
  }

  scroll_event(newx: number, screen: image): void {
    this.last_sel = newx;
    let xo = this.x + 2, yo = this.y + 2;
    const xa = this.vert ? 0 : this.item_width(), ya = this.vert ? this.item_height() : 0;
    this.draw_background(screen);
    for (let i = newx; i < newx + this.vis(); i++) {
      if (i < this.t) {
        if (this.m) this.draw_item(screen, xo, yo, i, this.get_select(i));
        else this.draw_item(screen, xo, yo, i, i === this.cur_sel ? 1 : 0);
      }
      xo += xa;
      yo += ya;
    }
  }

  handle_inside_event(ev: event, screen: image, inm: InputManager): void {
    const me = (): number => this.vert ? this.last_sel + (((ev.mouse_move.y - this.y) / this.item_height()) | 0)
      : this.last_sel + (((ev.mouse_move.x - this.x) / this.item_width()) | 0);
    switch (ev.type) {
      case EV_MOUSE_MOVE:
        if (this.activate_on_mouse_move()) {
          const m = me();
          if (m < this.t && m >= 0 && this.cur_sel !== m) {
            this.cur_sel = m;
            this.scroll_event(this.last_sel, screen);
            this.note_new_current(screen, inm, m);
          }
        }
        break;
      case EV_MOUSE_BUTTON: {
        const m = me();
        if (m < this.t && m >= 0) {
          if (this.m) {
            if (ev.mouse_button) {
              if (this.ok_to_select(m)) {
                this.set_select(m, this.get_select(m) ? 0 : 1);
                this.scroll_event(this.last_sel, screen);
                inm.grab_focus(this);
              }
            } else this.last_click = -1;
          } else if (this.ok_to_select(m)) {
            if (this.cur_sel === m) this.note_selection(screen, inm, m);
            else {
              this.cur_sel = m;
              this.scroll_event(this.last_sel, screen);
              this.note_new_current(screen, inm, m);
            }
          }
        }
        break;
      }
    }
  }

  handle_up(screen: image, inm: InputManager): void {
    if (this.vert && this.cur_sel > 0) {
      this.cur_sel--;
      if (this.cur_sel < this.sx) {
        this.draw_widget(screen, 1);
        this.last_sel = this.sx = this.cur_sel;
        this.draw_widget(screen, 0);
      }
      this.scroll_event(this.last_sel, screen);
      this.note_new_current(screen, inm, this.cur_sel);
    }
  }

  handle_down(screen: image, inm: InputManager): void {
    if (this.vert && this.cur_sel < this.t - 1) this.cur_sel++;
    else return;
    if (this.cur_sel > this.sx + this.r - 1) {
      this.draw_widget(screen, 1);
      this.last_sel = this.sx = this.cur_sel - this.r + 1;
      this.draw_widget(screen, 0);
    }
    this.scroll_event(this.sx, screen);
    this.note_new_current(screen, inm, this.cur_sel);
  }

  handle_left(): void {}
  handle_right(): void {}
}
