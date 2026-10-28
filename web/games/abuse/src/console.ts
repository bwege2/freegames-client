// console.cpp, chat.cpp: text consoles in windows (the developer console dprintf writes to, the chat)
import type { JCFont } from './imlib/fonts.ts';
import type { Jwindow } from './imlib/jwindow.ts';
import { event, EV_KEY } from './imlib/event.ts';
import { JK_BACKSPACE, JK_ENTER } from './imlib/keys.ts';
import { G } from './globals.ts';

export class console {
  lastx: number;
  lasty: number;
  w: number;
  h: number;
  cx = 0;
  cy = 0;
  fnt: JCFont;
  screen: Uint8Array;
  con_win: Jwindow | null = null;
  name: string;

  constructor(font: JCFont, width: number, height: number, Name: string) {
    this.w = width;
    this.h = height;
    this.screen = new Uint8Array(this.w * this.h).fill(32);
    this.fnt = font;
    this.lastx = ((G.xres / 2) | 0) - ((this.screen_w() / 2) | 0);
    this.lasty = ((G.yres / 2) | 0) - ((this.screen_h() / 2) | 0);
    this.name = Name;
  }

  showing(): boolean { return this.con_win !== null; }
  screen_w(): number { return this.w * this.fnt.width(); }
  screen_h(): number { return this.h * this.fnt.height(); }
  wx(): number { return this.con_win!.x1(); }
  wy(): number { return this.con_win!.y1(); }
  toggle(): void { if (this.con_win) this.hide(); else this.show(); }

  put_string(st: string): void { for (let i = 0; i < st.length; i++) this.put_char(st.charCodeAt(i) & 0xff); }

  redraw(): void {
    if (this.con_win) {
      this.con_win.clear();
      const xa = this.fnt.width(), ya = this.fnt.height();
      let s = 0;
      for (let j = 0, dy = this.wy(); j < this.h; j++, dy += ya)
        for (let i = 0, dx = this.wx(); i < this.w; i++, s++, dx += xa) if (this.screen[s]) this.fnt.put_char(this.con_win.screen, dx, dy, this.screen[s]);
      this.fnt.put_char(this.con_win.screen, this.wx() + this.cx * xa, this.wy() + this.cy * ya, 95);
    }
  }

  show(): void {
    if (!this.con_win) {
      this.con_win = G.wm.new_window(this.lastx, this.lasty, this.screen_w(), this.screen_h(), null, this.name);
      this.redraw();
      this.con_win.screen.SetClip(this.con_win.x1(), this.con_win.y1(), this.con_win.x2() + 1, this.con_win.y2() + 1);
    }
  }

  hide(): void {
    if (this.con_win) {
      this.lastx = this.con_win.x;
      this.lasty = this.con_win.y;
      G.wm.close_window(this.con_win);
      this.con_win = null;
    }
  }

  draw_cursor(): void {
    if (this.con_win) this.fnt.put_char(this.con_win.screen, this.cx * this.fnt.width() + this.wx(), this.cy * this.fnt.height() + this.wy(), 95);
  }

  draw_char(x: number, y: number, ch: number): void {
    if (this.con_win) {
      const fw = this.fnt.width(), fh = this.fnt.height();
      const dx = this.wx() + x * fw, dy = this.wy() + y * fh;
      this.con_win.screen.bar(dx, dy, dx + fw - 1, dy + fh - 1, G.wm.black());
      this.fnt.put_char(this.con_win.screen, dx, dy, ch);
    }
  }

  do_cr(): void {
    if (this.cx < this.w && this.cy < this.h) this.draw_char(this.cx, this.cy, this.screen[this.cy * this.w + this.cx]);
    this.cx = 0;
    this.cy++;
    if (this.cy >= this.h) {
      this.cy = this.h - 1;
      if (this.con_win) {
        this.screen.copyWithin(0, this.w, this.w * this.h);
        this.screen.fill(32, this.w * (this.h - 1));
        this.redraw();
        G.wm.flush_screen();
      }
    } else this.draw_cursor();
  }

  put_char(ch: number): void {
    switch (ch) {
      case JK_BACKSPACE:
        if (this.cx) {
          if (this.con_win) this.draw_char(this.cx, this.cy, this.screen[this.cy * this.w + this.cx]);
          this.cx--;
          if (this.con_win) this.draw_cursor();
        }
        break;
      case 10:
      case JK_ENTER:
        this.do_cr();
        break;
      default:
        this.screen[this.cy * this.w + this.cx] = ch;
        if (this.con_win) this.draw_char(this.cx, this.cy, ch);
        this.cx++;
        if (this.cx >= this.w) this.do_cr();
        else if (this.con_win) this.draw_cursor();
    }
  }

  print_f(s: string): void { this.put_string(s); }
}

export class shell_term extends console {
  shcmd = '';

  constructor(font: JCFont, width: number, height: number, Name: string) {
    super(font, width, height, Name);
    this.prompt();
  }

  prompt(): void { this.put_string('(?=help)>'); }

  execute(st: string): void {
    this.put_string(st);
    this.put_string(' : unhandled\n');
  }

  handle_event(ev: event): number {
    if (ev.window === this.con_win && this.con_win) {
      if (ev.type === EV_KEY) {
        switch (ev.key) {
          case JK_BACKSPACE:
            if (this.shcmd.length) {
              this.shcmd = this.shcmd.slice(0, -1);
              this.put_char(ev.key);
            }
            break;
          case JK_ENTER:
            this.put_char(ev.key);
            this.execute(this.shcmd);
            this.prompt();
            this.shcmd = '';
            break;
          default:
            if (ev.key < 256 && ev.key >= 32 && ev.key < 127) {
              this.shcmd += String.fromCharCode(ev.key);
              this.put_char(ev.key);
            }
        }
      }
      return 1;
    }
    return 0;
  }
}

export class chat_console extends console {
  constructor(font: JCFont, width: number, height: number, name: string) {
    super(font, width, height < 4 ? 4 : height, name);
    this.hide();
    this.clear();
    this.cx = 0;
    this.cy = this.h - 1;
    this.lastx = ((G.xres / 2) | 0) - ((this.screen_w() / 2) | 0);
    this.lasty = G.yres - this.h;
  }

  chat_event(ev: event): number { return this.con_win ? (this.con_win === ev.window ? 1 : 0) : 0; }

  clear(): void {
    this.screen.fill(32);
    this.screen.fill(45, this.w * (this.h - 2), this.w * (this.h - 1));
    this.redraw();
  }

  put_all(st: string): void {
    this.screen.copyWithin(0, this.w, this.w * (this.h - 2));
    this.screen.fill(32, this.w * (this.h - 3), this.w * (this.h - 2));
    for (let i = 0; i < st.length; i++) this.screen[this.w * (this.h - 3) + i] = st.charCodeAt(i) & 0xff;
    this.redraw();
  }

  draw_user(st: string): void {
    this.screen.fill(32, this.w * (this.h - 1), this.w * this.h);
    for (let i = 0; i < st.length; i++) this.screen[this.w * (this.h - 1) + i] = st.charCodeAt(i) & 0xff;
    this.cx = st.length;
    this.cy = this.h - 1;
    this.redraw();
  }
}
