// imlib/jwindow.cpp: windows, their fields (ifield) and the window manager
import { image } from './image.ts';
import { event, EV_CLOSE_WINDOW, EV_DRAG_WINDOW, EV_KEY, EV_KEYRELEASE, EV_MOUSE_BUTTON, EV_MOUSE_MOVE, EV_REDRAW, EV_SPURIOUS } from './event.ts';
import { JK_ESC, JK_TAB } from './keys.ts';
import type { Filter } from './filter.ts';
import type { JCFont } from './fonts.ts';
import type { palette } from './palette.ts';
import { event_handler } from '../sdlport/event.ts';
import { update_dirty } from '../sdlport/video.ts';
import { G } from '../globals.ts';

let jw_left = 3, jw_right = 3, jw_top = 2, jw_bottom = 3;
export function frame_top(): number { return jw_top; }
export function frame_bottom(): number { return jw_bottom; }
export function frame_left(): number { return jw_left; }
export function frame_right(): number { return jw_right; }
export function set_frame_size(x: number): void {
  if (x < 1) x = 1;
  jw_left = x;
  jw_right = x;
  jw_top = 2;
  jw_bottom = x;
}

export abstract class ifield {
  owner: Jwindow | null = null;
  x = 0;
  y = 0;
  id = 0;
  next: ifield | null = null;

  set_owner(newowner: Jwindow | null): void {
    if (this.owner) this.move(this.x - this.owner.x1(), this.y - this.owner.y1());
    this.owner = newowner;
    if (this.owner) this.move(this.x + this.owner.x1(), this.y + this.owner.y1());
  }
  move(newx: number, newy: number): void {
    this.x = newx;
    this.y = newy;
  }
  abstract area(): [number, number, number, number];
  abstract draw_first(screen: image): void;
  abstract draw(active: number, screen: image): void;
  abstract handle_event(ev: event, screen: image, im: InputManager): void;
  selectable(): number { return 1; }
  remap(_f: Filter): void {}
  abstract read(): unknown;
  find(search_id: number): ifield | null { return this.id === search_id ? this : null; }
  unlink(_id: number): ifield | null { return null; }
}

export class InputManager {
  screen: image | null;
  first: ifield | null;
  active: ifield | null;
  grab: ifield | null = null;
  cur: Jwindow | null = null;
  owner: Jwindow | null = null;
  no_selections_allowed = 0;

  constructor(screen: image | null, First: ifield | null, owner: Jwindow | null = null, ownerForm = false) {
    this.owner = owner;
    this.screen = ownerForm ? null : screen;
    this.active = this.first = First;
    while (this.active && !this.active.selectable()) this.active = this.active.next;
    if (!ownerForm && this.screen) this.redraw();
  }

  unlink(id: number): ifield | null {
    for (let i = this.first, last: ifield | null = null; i; i = i.next) {
      if (i.id === id) {
        if (i === this.first) this.first = this.first.next;
        else last!.next = i.next;
        if (this.active === i) this.active = this.first;
        return i;
      }
      const x = i.unlink(id);
      if (x) return x;
      last = i;
    }
    return null;
  }

  clear_current(): void {
    if (this.owner) this.screen = this.owner.screen;
    if (this.active) this.active.draw(0, this.screen!);
    this.active = null;
  }

  handle_event(ev: event, j: Jwindow | null): void {
    let in_area: ifield | null = null;
    if (this.owner) this.screen = this.owner.screen;
    if (j) {
      ev.mouse_move.x -= j.x;
      ev.mouse_move.y -= j.y;
      this.cur = j;
    }
    if (!this.grab) {
      if ((ev.type === EV_MOUSE_BUTTON && ev.mouse_button === 1) || ev.type === EV_MOUSE_MOVE) {
        for (let i = this.first; i; i = i.next) {
          const [x1, y1, x2, y2] = i.area();
          if (ev.mouse_move.x >= x1 && ev.mouse_move.y >= y1 && ev.mouse_move.x <= x2 && ev.mouse_move.y <= y2) in_area = i;
        }
        if (in_area !== this.active && (this.no_selections_allowed || (in_area && in_area.selectable()))) {
          if (this.active) this.active.draw(0, this.screen!);
          this.active = in_area;
          if (this.active) this.active.draw(1, this.screen!);
        }
      }
      if (ev.type === EV_KEY && ev.key === JK_TAB && this.active) {
        this.active.draw(0, this.screen!);
        do {
          this.active = this.active!.next;
          if (!this.active) this.active = this.first;
        } while (this.active && !this.active.selectable());
        this.active!.draw(1, this.screen!);
      }
    } else this.active = this.grab;
    if (this.active) {
      if (ev.type !== EV_MOUSE_MOVE && ev.type !== EV_MOUSE_BUTTON) this.active.handle_event(ev, this.screen!, this);
      else {
        const [x1, y1, x2, y2] = this.active.area();
        if (this.grab || (ev.mouse_move.x >= x1 && ev.mouse_move.y >= y1 && ev.mouse_move.x <= x2 && ev.mouse_move.y <= y2)) {
          if (j) this.active.handle_event(ev, this.screen!, j.inm);
          else this.active.handle_event(ev, this.screen!, this);
        }
      }
    }
    if (j) {
      ev.mouse_move.x += j.x;
      ev.mouse_move.y += j.y;
    }
  }

  allow_no_selections(): void { this.no_selections_allowed = 1; }

  redraw(): void {
    if (this.owner) this.screen = this.owner.screen;
    for (let i = this.first; i; i = i.next) i.draw_first(this.screen!);
    if (this.active) this.active.draw(1, this.screen!);
  }

  grab_focus(i: ifield): void {
    this.grab = i;
    if (this.cur) G.wm.grab_focus(this.cur);
  }
  release_focus(): void {
    this.grab = null;
    if (this.cur) G.wm.release_focus();
  }

  remap(f: Filter): void {
    for (let i = this.first; i; i = i.next) i.remap(f);
    this.redraw();
  }

  add(i: ifield): void {
    let f = this.first;
    if (i.selectable()) {
      if (!f) this.first = i;
      else {
        while (f.next) f = f.next;
        f.next = i;
      }
    }
  }

  get(id: number): ifield | null {
    for (let f = this.first; f; f = f.next) {
      const ret = f.find(id);
      if (ret) return ret;
    }
    return null;
  }
}

export class Jwindow {
  _name: string | null = null;
  _hidden = true;
  _moveable = true;
  owner: Jwindow | null = null;
  _x1 = 0;
  _y1 = 0;
  _x2 = 0;
  _y2 = 0;
  next: Jwindow | null = null;
  x = 0;
  y = 0;
  l = 0;
  h = 0;
  backg = 0;
  screen: image = null as unknown as image;
  inm: InputManager;
  local_info: unknown = null;

  /** Jwindow(char const *name): a window without fields, hidden */
  static named(name: string | null): Jwindow {
    const j = Object.create(Jwindow.prototype) as Jwindow;
    j.init_named(name);
    return j;
  }

  private init_named(name: string | null): void {
    this._name = null;
    this._hidden = true;
    this._moveable = true;
    this.owner = null;
    this.next = null;
    this.x = this.y = this.l = this.h = this.backg = 0;
    this.local_info = null;
    this._x1 = Jwindow.left_border();
    this._y1 = jw_top + 5;
    this._x2 = this._y2 = 0;
    this.inm = new InputManager(null, null, this, true);
    this.reconfigure();
    this.screen = null as unknown as image;
    this.next = null;
    if (name) this._name = name;
    G.wm.add_window(this);
  }

  constructor(X: number, Y: number, L: number, H: number, f: ifield | null, name: string | null = null) {
    this.l = 0;
    this.h = 0;
    this._hidden = false;
    this._moveable = true;
    this._x1 = Jwindow.left_border();
    this._y1 = name ? Jwindow.top_border() : jw_top + 5;
    this.screen = null as unknown as image;
    this.inm = new InputManager(null, f);
    this.reconfigure();
    this.l = L >= 0 ? L + Jwindow.left_border() : this.l - L;
    this.h = H >= 0 ? H + Jwindow.top_border() : this.h - H;
    this.y = Y >= 0 ? Y : G.yres - this.h + Y - Jwindow.top_border() - Jwindow.bottom_border() - 1;
    this.x = X >= 0 ? X : G.xres - this.l + X - Jwindow.left_border() - Jwindow.right_border() - 1;
    this.backg = G.wm.medium_color();
    this._x2 = this.l - 1;
    this._y2 = this.h - 1;
    this.l += Jwindow.right_border();
    this.h += Jwindow.bottom_border();
    if (L === -1) if (this.l < 15 + Jwindow.left_border() + Jwindow.right_border()) this.l = 15 + Jwindow.left_border() + Jwindow.right_border();
    if (H === -1) if (this.h < Jwindow.top_border() + Jwindow.bottom_border()) this.h = Jwindow.top_border() + Jwindow.bottom_border();
    this.screen = new image(this.l, this.h, null, 2);
    this.screen.clear(this.backg);
    this.inm.screen = this.screen;
    this.next = null;
    this._name = name ?? null;
    G.wm.add_window(this);
    if (!G.wm.frame_suppress) this.redraw();
  }

  /** ~Jwindow */
  destroy(): void {
    G.wm.remove_window(this);
  }

  private reconfigure(): void {
    this.l = 2;
    this.h = 2;
    for (let i = this.inm.first; i; i = i.next) {
      i.set_owner(this);
      const [, , x2, y2] = i.area();
      if (y2 > this.h) this.h = y2;
      if (x2 > this.l) this.l = x2;
    }
  }

  resize(L: number, H: number): void {
    this.screen.SetSize(L, H);
    this.l = L;
    this.h = H;
  }

  clear(color = 0): void { this.screen.bar(this.x1(), this.y1(), this.x2(), this.y2(), color); }
  show(): void { this._hidden = false; }
  hide(): void { this._hidden = true; }
  is_hidden(): boolean { return this._hidden; }
  freeze(): void { this._moveable = false; }
  thaw(): void { this._moveable = true; }
  is_moveable(): boolean { return this._moveable; }
  x1(): number { return this._x1; }
  y1(): number { return this._y1; }
  x2(): number { return this._x2; }
  y2(): number { return this._y2; }
  clip_in(): void { this.screen.SetClip(this.x1(), this.y1(), this.x2() + 1, this.y2() + 1); }
  clip_out(): void { this.screen.SetClip(0, 0, this.l, this.h); }
  read(id: number): unknown { return this.inm.get(id)!.read(); }

  redraw(): void {
    const wm = G.wm;
    const hi = wm.bright_color(), med = wm.medium_color(), low = wm.dark_color();
    const fnt = wm.frame_font();
    const s = this.screen;
    if (this._name !== null) {
      if (Jwindow.right_border() >= 1) {
        s.widget_bar(0, 0, this.l - 1, this.h - 1, hi, med, low);
        if (Jwindow.right_border() >= 3)
          s.widget_bar(Jwindow.right_border() - 1, Jwindow.top_border() - 1, this.l - Jwindow.left_border(), this.h - Jwindow.bottom_border(), low, med, hi);
        else s.line(Jwindow.left_border() - 1, Jwindow.top_border() - 1, Jwindow.right_border() - 1, Jwindow.top_border() - 1, low);
      }
      s.rectangle(2, 2, Jwindow.top_border() - 2, Jwindow.top_border() - 3, wm.black());
      s.widget_bar(3, 3, Jwindow.top_border() - 3, Jwindow.top_border() - 4, hi, med, low);
    } else {
      if (Jwindow.right_border() >= 1) {
        s.widget_bar(0, 0, this.l - 1, this.h - 1, hi, med, low);
        if (Jwindow.right_border() >= 3)
          s.widget_bar(Jwindow.right_border() - 1, jw_top + 4, this.l - Jwindow.left_border(), this.h - Jwindow.bottom_border(), low, med, hi);
        else s.line(Jwindow.left_border() - 1, jw_top + 4, Jwindow.right_border() - 1, jw_top + 4, low);
      }
      s.rectangle(1, 1, 4, 4, wm.black());
      s.widget_bar(2, 2, 3, 3, hi, med, low);
    }
    if (this._name) {
      s.bar(Jwindow.top_border(), 1, Jwindow.top_border() + fnt.width() * this._name.length + 1, Jwindow.top_border() - 2, med);
      fnt.put_string(s, Jwindow.top_border() + 1, 1, this._name, low);
    }
    s.bar(this.x1(), this.y1(), this.x2(), this.y2(), this.backg);
    this.inm.redraw();
  }

  static left_border(): number { return frame_left(); }
  static right_border(): number { return frame_right(); }
  static top_border(): number { return G.wm.font().height() + frame_top(); }
  static bottom_border(): number { return frame_bottom(); }
}

export class WindowManager {
  eh: event_handler;
  first: Jwindow | null = null;
  grab: Jwindow | null = null;
  screen: image;
  pal: palette;
  hi: number;
  med: number;
  low: number;
  bk: number;
  key_state = new Int32Array(512);
  state: 'inputing' | 'dragging' = 'inputing';
  drag_mousex = 0;
  drag_mousey = 0;
  frame_suppress = 0;
  drag_window: Jwindow | null = null;
  fnt: JCFont;
  wframe_fnt: JCFont;

  constructor(Screen: image, Pal: palette, Hi: number, Med: number, Low: number, Font: JCFont) {
    G.wm = this;
    this.screen = Screen;
    this.hi = Hi;
    this.low = Low;
    this.med = Med;
    this.pal = Pal;
    this.bk = Pal.find_closest(0, 0, 0);
    this.fnt = Font;
    this.wframe_fnt = Font;
    this.eh = new event_handler(Screen, Pal);
  }

  set_frame_font(f: JCFont): void { this.wframe_fnt = f; }
  frame_font(): JCFont { return this.wframe_fnt; }
  bright_color(): number { return this.hi; }
  medium_color(): number { return this.med; }
  dark_color(): number { return this.low; }
  black(): number { return this.bk; }
  set_colors(Hi: number, Med: number, Low: number): void {
    this.hi = Hi;
    this.med = Med;
    this.low = Low;
  }
  font(): JCFont { return this.fnt; }
  has_mouse(): number { return this.eh.has_mouse(); }
  mouse_status(): [number, number, number] { return this.eh.mouse_status(); }
  set_mouse_shape(im: image, cx: number, cy: number): void { this.eh.set_mouse_shape(im, cx, cy); }
  set_mouse_position(mx: number, my: number): void { this.eh.set_mouse_position(mx, my); }
  key_pressed(x: number): number { return this.key_state[x]; }
  set_frame_suppress(x: number): void { this.frame_suppress = x; }
  push_event(ev: event): void { this.eh.push_event(ev); }
  event_waiting(): number { return this.eh.event_waiting(); }
  grab_focus(j: Jwindow): void { this.grab = j; }
  release_focus(): void { this.grab = null; }

  window_in_area(x1: number, y1: number, x2: number, y2: number): number {
    for (let f = this.first; f; f = f.next)
      if (f.x <= x2 && f.y <= y2 && f.x + f.l - 1 >= x1 && f.y + f.h - 1 >= y1) return 1;
    return 0;
  }

  close_window(j: Jwindow): void { j.destroy(); }

  hide_windows(): void {
    for (let p = this.first; p; p = p.next) {
      if (!p.is_hidden()) {
        p.hide();
        this.screen.AddDirty(p.x, p.y, p.x + p.l, p.y + p.h);
      }
    }
  }

  show_windows(): void {
    for (let p = this.first; p; p = p.next) if (p.is_hidden()) this.show_window(p);
  }

  hide_window(j: Jwindow): void {
    if (j === this.first) this.first = this.first.next;
    else {
      let k = this.first!;
      for (; k.next !== j; k = k.next!) k.screen.AddDirty(j.x - k.x, j.y - k.y, j.x + j.l - k.x, j.y + j.h - k.y);
      k.screen.AddDirty(j.x - k.x, j.y - k.y, j.x + j.l - k.x, j.y + j.h - k.y);
      k.next = j.next;
    }
    this.screen.AddDirty(j.x, j.y, j.x + j.l, j.y + j.h);
    j.hide();
  }

  show_window(j: Jwindow): void {
    if (j.is_hidden()) {
      j.show();
      j.screen.AddDirty(0, 0, j.l, j.h);
    }
  }

  async get_event(ev: event): Promise<void> {
    await this.eh.get_event(ev);
    if (ev.type === EV_KEY) this.key_state[ev.key & 511] = 1;
    else if (ev.type === EV_KEYRELEASE) this.key_state[ev.key & 511] = 0;
    if (this.state === 'inputing') {
      ev.window = null;
      for (let j = this.first; j; j = j.next)
        if (!j.is_hidden() && ev.mouse_move.x >= j.x && ev.mouse_move.y >= j.y && ev.mouse_move.x < j.x + j.l && ev.mouse_move.y < j.y + j.h)
          ev.window = j;
      if (!ev.window && this.grab) ev.window = this.grab;
      if (ev.window) {
        let closew = 0, movew = 0;
        const w = ev.window;
        if (ev.type === EV_MOUSE_BUTTON && ev.mouse_button === 1 && ev.mouse_move.x >= w.x && ev.mouse_move.y >= w.y &&
            ev.mouse_move.x < w.x + w.l && ev.mouse_move.y < w.y + w.y1()) {
          if (ev.mouse_move.x - w.x < 11) closew = 1;
          else if (w.is_moveable()) movew = 1;
        } else if (this.grab) ev.window = this.grab;
        if (ev.type === EV_KEY && ev.key === JK_ESC) closew = 1;
        if (closew) ev.type = EV_CLOSE_WINDOW;
        else if (movew) {
          let red = 0;
          const win = ev.window!;
          if (win === this.first) {
            this.first = this.first.next;
            if (this.first) red = 1;
          } else {
            let last = this.first!;
            for (; last.next !== win; last = last.next!);
            if (win.next) red = 1;
            last.next = win.next;
          }
          if (!this.first) this.first = win;
          else {
            let last = this.first;
            for (; last.next; last = last.next);
            last.next = win;
          }
          win.next = null;
          if (red) {
            win.screen.AddDirty(0, 0, win.l, win.h);
            this.flush_screen();
          }
          this.state = 'dragging';
          this.drag_window = win;
          this.drag_mousex = win.x - ev.mouse_move.x;
          this.drag_mousey = win.y - ev.mouse_move.y;
          ev.type = EV_SPURIOUS;
        } else if (ev.window) ev.window.inm.handle_event(ev, ev.window);
      }
    } else if (this.state === 'dragging') {
      ev.window = this.drag_window;
      if (ev.type === EV_MOUSE_BUTTON && ev.mouse_button === 0) {
        this.state = 'inputing';
        ev.type = EV_SPURIOUS;
      } else if (ev.type === EV_MOUSE_MOVE) {
        this.move_window(this.drag_window!, ev.mouse_move.x + this.drag_mousex, ev.mouse_move.y + this.drag_mousey);
        this.flush_screen();
        ev.type = EV_DRAG_WINDOW;
        ev.window_position.x = ev.mouse_move.x + this.drag_mousex;
        ev.window_position.y = ev.mouse_move.y + this.drag_mousey;
      }
    }
    if (ev.type === EV_REDRAW) {
      for (let j = this.first; j; j = j.next)
        j.screen.AddDirty(ev.redraw.x1 - j.x, ev.redraw.y1 - j.y, ev.redraw.x2 + 1 - j.x, ev.redraw.y2 + 1 - j.y);
      this.screen.AddDirty(ev.redraw.x1, ev.redraw.y1, ev.redraw.x2 + 1, ev.redraw.y2 + 1);
      this.flush_screen();
      ev.type = EV_SPURIOUS;
    }
  }

  resize_window(j: Jwindow, l: number, h: number): void {
    this.screen.AddDirty(j.x, j.y, j.x + j.l, j.y + j.h);
    for (let p = this.first; p !== j; p = p!.next) p!.screen.AddDirty(j.x - p!.x, j.y - p!.y, j.x + j.l - p!.x, j.y + j.h - p!.y);
    j.resize(l, h);
    if (!this.frame_suppress) j.redraw();
  }

  move_window(j: Jwindow, x: number, y: number): void {
    this.screen.AddDirty(j.x, j.y, j.x + j.l, j.y + j.h);
    for (let p = this.first; p !== j; p = p!.next) p!.screen.AddDirty(j.x - p!.x, j.y - p!.y, j.x + j.l - p!.x, j.y + j.h - p!.y);
    j.x = x;
    j.y = y;
    j.screen.AddDirty(0, 0, j.l, j.h);
  }

  add_window(win: Jwindow): void {
    if (!this.first) this.first = win;
    else {
      let tmp = this.first;
      while (tmp.next) tmp = tmp.next;
      tmp.next = win;
      win.next = null;
    }
  }

  remove_window(win: Jwindow): void {
    if (this.grab === win) this.grab = null;
    if (this.state === 'dragging' && win === this.drag_window) this.state = 'inputing';
    if (this.first === win) this.first = this.first.next;
    else {
      let s = this.first!;
      for (; s.next !== win; s = s.next!) s.screen.AddDirty(win.x - s.x, win.y - s.y, win.x + win.l - s.x, win.y + win.h - s.y);
      s.screen.AddDirty(win.x - s.x, win.y - s.y, win.x + win.l - s.x, win.y + win.h - s.y);
      s.next = win.next;
    }
    this.screen.AddDirty(win.x, win.y, win.x + win.l, win.y + win.h);
  }

  new_window(x: number, y: number, l: number, h: number, fields: ifield | null = null, name: string | null = null): Jwindow {
    if (x > this.screen.w - 4) x = this.screen.w - 25;
    if (y > this.screen.h - 4) y = this.screen.h - 10;
    const j = new Jwindow(x, y, l, h, fields, name);
    j.show();
    return j;
  }

  flush_screen(): void {
    let mx = 0, my = 0;
    let mouse_pic: image | null = null, mouse_save: image | null = null;
    const screen = this.screen;
    if (this.has_mouse()) {
      mouse_pic = this.eh.mouse_sprite().visual;
      mouse_save = this.eh.mouse_sprite().save;
      mx = this.eh.mouse.drawx();
      my = this.eh.mouse.drawy();
      screen.put_part(mouse_save, 0, 0, mx, my, mx + mouse_pic.w - 1, my + mouse_pic.h - 1);
      mouse_pic.put_image(screen, mx, my, 1);
    }
    for (let p = this.first; p; p = p.next) if (!p.is_hidden()) screen.delete_dirty(p.x, p.y, p.x + p.l, p.y + p.h);
    update_dirty(screen);
    if (this.has_mouse()) mouse_save!.put_image(screen, mx, my);
    for (let p = this.first; p; p = p.next) {
      if (p.is_hidden()) continue;
      if (this.has_mouse()) {
        p.screen.put_part(mouse_save!, 0, 0, mx - p.x, my - p.y, mx - p.x + mouse_pic!.w - 1, my - p.y + mouse_pic!.h - 1);
        mouse_pic!.put_image(p.screen, mx - p.x, my - p.y, 1);
      }
      for (let q = p.next; q; q = q.next)
        if (!q.is_hidden()) p.screen.delete_dirty(q.x - p.x, q.y - p.y, q.x + q.l - p.x, q.y + q.h - p.y);
      update_dirty(p.screen, p.x, p.y);
      if (this.has_mouse()) mouse_save!.put_image(p.screen, mx - p.x, my - p.y, 0);
    }
  }
}
