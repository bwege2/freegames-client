// imlib/input.cpp: buttons, button boxes, text fields, info fields
import { ifield, InputManager } from './jwindow.ts';
import type { image } from './image.ts';
import { event, EV_KEY, EV_MOUSE_BUTTON } from './event.ts';
import { JK_BACKSPACE, JK_END, JK_HOME, JK_LEFT, JK_RIGHT } from './keys.ts';
import type { Filter } from './filter.ts';
import type { JCFont } from './fonts.ts';
import { G } from '../globals.ts';
import { fmt_g } from '../lisp/lisp.ts';

export class button extends ifield {
  up = 1;
  act = 0;
  text: string | null;
  visual: image | null;
  pressed: image | null;
  act_pict: image | null = null;
  act_id = -1;

  constructor(X: number, Y: number, ID: number, Text: string | image | null, Next: ifield | null, Pressed: image | null = null, active: image | null = null) {
    super();
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.next = Next;
    if (typeof Text === 'string') {
      this.text = Text;
      this.visual = null;
    } else {
      this.text = null;
      this.visual = Text;
    }
    this.pressed = Pressed;
    this.act_pict = active;
  }

  remap(f: Filter): void {
    if (this.visual) {
      f.Apply(this.visual);
      if (this.pressed) f.Apply(this.pressed);
    }
  }

  change_visual(v: image): void { this.visual = v; }

  area(): [number, number, number, number] {
    const x1 = this.x, y1 = this.y;
    if (this.pressed) return [x1, y1, this.x + this.pressed.w - 1, this.y + this.pressed.h - 1];
    if (this.text !== null) return [x1, y1, this.x + G.wm.font().width() * this.text.length + 6, this.y + G.wm.font().height() + 6];
    return [x1, y1, this.x + 6 + this.visual!.w, this.y + 6 + this.visual!.h];
  }

  push(): void { this.up = this.up ? 0 : 1; }
  read(): unknown { return this; }
  status(): number { return this.up; }
  set_act_id(id: number): void { this.act_id = id; }

  handle_event(ev: event, screen: image, _im: InputManager): void {
    if ((ev.type === EV_KEY && ev.key === 13) || (ev.type === EV_MOUSE_BUTTON && ev.mouse_button)) {
      this.up = this.up ? 0 : 1;
      this.draw_first(screen);
      this.draw(this.act, screen);
      G.wm.push_event(event.msg(this.id, this));
    }
  }

  draw(active: number, screen: image): void {
    const color = active ? G.wm.bright_color() : G.wm.medium_color();
    const [x1, y1, x2, y2] = this.area();
    if (active !== this.act && this.act_id !== -1 && active) G.wm.push_event(event.msg(this.act_id, null));
    if (this.pressed) {
      if (this.up) {
        if (!active) this.visual!.put_image(screen, this.x, this.y);
        else this.pressed.put_image(screen, this.x, this.y);
      } else this.act_pict!.put_image(screen, this.x, this.y);
    } else {
      screen.rectangle(x1 + 2, y1 + 2, x2 - 2, y2 - 2, color);
      this.act = active;
    }
  }

  draw_first(screen: image): void {
    if (this.pressed) this.draw(0, screen);
    else {
      const wm = G.wm;
      const [x1, y1, x2, y2] = this.area();
      if (this.up) {
        screen.rectangle(x1, y1, x2, y2, wm.black());
        screen.widget_bar(x1 + 1, y1 + 1, x2 - 1, y2 - 1, wm.bright_color(), wm.medium_color(), wm.dark_color());
        if (this.text !== null) {
          wm.font().put_string(screen, this.x + 4, this.y + 5, this.text, wm.black());
          wm.font().put_string(screen, this.x + 3, this.y + 4, this.text);
        } else this.visual!.put_image(screen, this.x + 3, this.y + 3, 1);
      } else {
        screen.line(x1, y1, x2, y1, wm.dark_color());
        screen.line(x1, y1, x1, y2, wm.dark_color());
        screen.line(x2, y1 + 1, x2, y2, wm.bright_color());
        screen.line(x1 + 1, y2, x2, y2, wm.bright_color());
        screen.bar(x1 + 1, y1 + 1, x2 - 1, y2 - 1, wm.medium_color());
        if (this.visual) this.visual.put_image(screen, x1 + 3, y1 + 3, 1);
        else {
          wm.font().put_string(screen, this.x + 4, this.y + 5, this.text!, wm.black());
          wm.font().put_string(screen, this.x + 3, this.y + 4, this.text!);
        }
      }
    }
  }
}

export class button_box extends ifield {
  buttons: button | null;
  maxdown: number;

  constructor(X: number, Y: number, ID: number, MaxDown: number, Buttons: button | null, Next: ifield | null) {
    super();
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.next = Next;
    this.buttons = Buttons;
    this.maxdown = MaxDown;
    if (this.buttons && this.maxdown) this.buttons.push();
  }

  press_button(_id: number): void {}
  remap(f: Filter): void { for (let b = this.buttons; b; b = b.next as button) b.remap(f); }

  find(search_id: number): ifield | null {
    if (search_id === this.id) return this;
    for (let i: ifield | null = this.buttons; i; i = i.next) if (search_id === i.id) return i;
    return null;
  }

  area(): [number, number, number, number] {
    let b = this.buttons;
    if (!b) return [0, 0, 0, 0];
    let [x1, y1, x2, y2] = b.area();
    for (b = b.next as button; b; b = b.next as button) {
      const [xp1, yp1, xp2, yp2] = b.area();
      if (xp1 < x1) x1 = xp1;
      if (xp2 > x2) x2 = xp2;
      if (yp1 < y1) y1 = yp1;
      if (yp2 > y2) y2 = yp2;
    }
    return [x1, y1, x2, y2];
  }

  draw_first(screen: image): void { for (let b = this.buttons; b; b = b.next as button) b.draw_first(screen); }
  draw(): void {}

  move(newx: number, newy: number): void {
    for (let b = this.buttons; b; b = b.next as button) b.move(newx + b.x, newy + b.y);
    this.x = newx;
    this.y = newy;
  }

  read(): unknown {
    for (let b = this.buttons; b; b = b.next as button) if (b.status() === 0) return b;
    return null;
  }

  handle_event(ev: event, screen: image, im: InputManager): void {
    if (ev.type !== EV_MOUSE_BUTTON) return;
    let found = 0;
    for (let b = this.buttons; !found && b; b = b.next as button) {
      const [x1, y1, x2, y2] = b.area();
      if (ev.mouse_move.x >= x1 && ev.mouse_move.x <= x2 && ev.mouse_move.y >= y1 && ev.mouse_move.y <= y2) {
        b.handle_event(ev, screen, im);
        let total = 0;
        for (let b2 = this.buttons; b2; b2 = b2.next as button) if (b2.status() === 0) total++;
        if (b.status() === 0) {
          if (total > this.maxdown) {
            for (let b2 = this.buttons; total > this.maxdown && b2; b2 = b2.next as button)
              if ((b !== b2 || this.maxdown === 0) && b2.status() === 0) {
                total--;
                b2.push();
                b2.draw_first(screen);
              }
          }
          b.draw_first(screen);
        } else if (total === 0 && this.maxdown) b.push();
        found = 1;
      }
    }
  }

  add_button(b: button): void {
    b.next = this.buttons;
    this.buttons = b;
  }

  arrange_left_right(): void {
    let x_on = this.x;
    for (let b = this.buttons; b; b = b.next as button) {
      const [x1, , x2] = b.area();
      b.x = x_on;
      b.y = this.y;
      x_on += x2 - x1 + 1 + 1;
    }
  }

  arrange_up_down(): void {
    let y_on = this.y;
    for (let b = this.buttons; b; b = b.next as button) {
      const [, y1, , y2] = b.area();
      b.y = y_on;
      b.x = this.x;
      y_on += y2 - y1 + 1 + 1;
    }
  }
}

export class text_field extends ifield {
  cur: number;
  prompt: string;
  /** the text as a byte array of the format's length (the original edits it in place) */
  data: number[];
  format: string;

  constructor(X: number, Y: number, ID: number, Prompt: string, Format: string, Data: string | number, Next: ifield | null) {
    super();
    const d = typeof Data === 'number' ? fmt_g(Data) : Data;
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.prompt = Prompt;
    this.format = Format;
    this.data = [...d].map((c) => c.charCodeAt(0));
    this.cur = d.length;
    while (this.cur && this.data[this.cur - 1] === 32) this.cur--;
    this.next = Next;
  }

  private str(): string {
    let s = '';
    for (const c of this.data) {
      if (!c) break;
      s += String.fromCharCode(c);
    }
    return s;
  }
  private xstart(): number { return this.x + G.wm.font().width() * (this.prompt.length + 1) + 3; }
  private xend(): number { return this.x + G.wm.font().width() * (this.prompt.length + 1 + this.format.length) + 7; }
  private yend(): number { return this.y + G.wm.font().height() + 5; }
  private last_spot(): number {
    let x = this.str().length;
    while (x && this.data[x - 1] === 32) x--;
    return x;
  }
  private draw_text(screen: image): void {
    screen.bar(this.xstart() + 1, this.y + 1, this.xend() - 1, this.yend() - 1, G.wm.dark_color());
    G.wm.font().put_string(screen, this.xstart() + 1, this.y + 3, this.str());
  }
  private draw_cur(color: number, screen: image): void {
    const fw = G.wm.font().width();
    screen.bar(this.xstart() + this.cur * fw + 1, this.yend() - 2, this.xstart() + (this.cur + 1) * fw, this.yend() - 1, color);
  }

  change_data(new_data: string, new_cursor: number, active: number, screen: image): void {
    this.data = [...new_data].map((c) => c.charCodeAt(0));
    if (new_cursor !== -1) this.cur = new_cursor;
    this.draw_first(screen);
    this.draw(active, screen);
  }

  read(): string {
    let s = this.str();
    while (s.length && s[s.length - 1] === ' ') s = s.slice(0, -1);
    this.data = [...s].map((c) => c.charCodeAt(0));
    return s;
  }

  handle_event(ev: event, screen: image, _im: InputManager): void {
    if (ev.type !== EV_KEY) return;
    const wm = G.wm;
    const fl = this.format.length;
    const d = this.data;
    while (d.length <= fl) d.push(0);
    switch (ev.key) {
      case JK_LEFT:
        if (this.cur) {
          this.draw_cur(wm.dark_color(), screen);
          this.cur--;
          this.draw_cur(wm.bright_color(), screen);
        }
        break;
      case JK_RIGHT:
        if (this.cur < fl - 1) {
          this.draw_cur(wm.dark_color(), screen);
          this.cur++;
          this.draw_cur(wm.bright_color(), screen);
        }
        break;
      case JK_END:
        if (this.cur !== this.last_spot()) {
          this.draw_cur(wm.dark_color(), screen);
          this.cur = this.last_spot();
          if (this.cur === fl - 1) this.cur--;
          this.draw_cur(wm.bright_color(), screen);
        }
        break;
      case JK_HOME:
        if (this.cur) {
          this.draw_cur(wm.dark_color(), screen);
          this.cur = 0;
          this.draw_cur(wm.bright_color(), screen);
        }
        break;
      case JK_BACKSPACE:
        if (this.cur) {
          this.draw_cur(wm.dark_color(), screen);
          this.cur--;
          for (let xx = this.cur; xx < fl - 1; xx++) d[xx] = d[xx + 1];
          d[fl - 1] = 32;
          this.draw_text(screen);
          this.draw_cur(wm.bright_color(), screen);
          wm.push_event(event.msg(this.id, this));
        }
        break;
      default:
        if (ev.key >= 32 && ev.key <= 126) {
          this.draw_cur(wm.dark_color(), screen);
          for (let xx = fl - 1; xx > this.cur && xx > 0; xx--) d[xx] = d[xx - 1];
          d[this.cur] = ev.key;
          if (this.cur < fl - 1) this.cur++;
          d[fl] = 0;
          this.draw_text(screen);
          this.draw_cur(wm.bright_color(), screen);
          wm.push_event(event.msg(this.id, this));
        }
    }
  }

  draw(active: number, screen: image): void {
    const wm = G.wm;
    if (active) {
      screen.rectangle(this.xstart(), this.y, this.xend(), this.yend(), wm.bright_color());
      this.draw_cur(wm.bright_color(), screen);
    } else {
      screen.rectangle(this.xstart(), this.y, this.xend(), this.yend(), wm.dark_color());
      this.draw_cur(wm.dark_color(), screen);
    }
  }

  area(): [number, number, number, number] { return [this.x, this.y, this.xend(), this.yend()]; }

  draw_first(screen: image): void {
    G.wm.font().put_string(screen, this.x, this.y + 3, this.prompt);
    screen.bar(this.xstart(), this.y, this.xend(), this.yend(), G.wm.dark_color());
    G.wm.font().put_string(screen, this.xstart() + 1, this.y + 3, this.str());
  }
}

export class info_field extends ifield {
  text: string;
  w = -1;
  h = 0;

  constructor(X: number, Y: number, ID: number, info: string, Next: ifield | null) {
    super();
    this.x = X;
    this.y = Y;
    this.id = ID;
    this.next = Next;
    this.text = info;
  }

  area(): [number, number, number, number] {
    if (this.w === -1) {
      const fw = G.wm.font().width(), fh = G.wm.font().height();
      let maxw = 0;
      this.w = fw;
      this.h = fh + 1;
      for (const c of this.text) {
        if (this.w > maxw) maxw = this.w;
        if (c === '\n') {
          this.h += fh + 1;
          this.w = 1;
        } else this.w += fw;
      }
      this.w = maxw;
    }
    return [this.x, this.y, this.x + this.w, this.y + this.h];
  }

  private put_para(screen: image, st: string, dx: number, dy: number, xspace: number, yspace: number, font: JCFont, color: number): void {
    const ox = dx;
    for (const c of st) {
      if (c === '\n') {
        dx = ox;
        dy += yspace;
      } else {
        font.put_char(screen, dx, dy, c.charCodeAt(0), color);
        dx += xspace;
      }
    }
  }

  draw_first(screen: image): void {
    const wm = G.wm;
    this.put_para(screen, this.text, this.x + 1, this.y + 1, wm.font().width(), wm.font().height(), wm.font(), wm.black());
    this.put_para(screen, this.text, this.x, this.y, wm.font().width(), wm.font().height(), wm.font(), wm.bright_color());
  }
  draw(): void {}
  handle_event(): void {}
  read(): unknown { return this.text; }
  selectable(): number { return 0; }
}
