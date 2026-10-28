// director.cpp: the scene director (the Lisp scenes' panning and scrolling text) and text_draw
import { EV_KEY, event } from './imlib/event.ts';
import { JK_DOWN, JK_ENTER, JK_ESC, JK_LEFT, JK_RIGHT, JK_UP } from './imlib/keys.ts';
import type { JCFont } from './imlib/fonts.ts';
import { time_marker } from './rt/platform.ts';
import { find_or_create, type LObj } from './lisp/lisp.ts';
import { LG } from './light.ts';
import { G } from './globals.ts';

/** The original spins on the clock in a few places (the scenes, the end sequence) without waiting
 *  or reading events in between. The browser has to get control back now and then to show the
 *  frames and take input: spin() is called once per turn of such a loop and returns a promise to
 *  wait for (rt/browser.ts, without reading the program's clock) or null (the tests: no yielding). */
export const busy_hooks = {
  spin: (): Promise<void> | null => null,
};

export class director { // the director controlls the scene
  tleft = 0;
  ttop = 0;
  tright = 0;
  tbottom = 0;
  text_y = 0;
  text_step = 0;
  pan_xv = 0;
  pan_yv = 0;
  pan_steps = 0;
  frame_speed = 0;
  scroll_speed = 0;
  pan_speed = 0;
  scene_abort = 0;
  text: string | null = null;
  pan_time: time_marker | null = null;
  frame_time: time_marker | null = null;
  text_time: time_marker | null = null;

  constructor() {
    this.tleft = this.ttop = this.tright = this.tbottom = this.pan_xv = this.pan_yv = 0;
    this.text_step = -2;
    this.frame_speed = 100;
    this.scroll_speed = 60;
    this.pan_speed = 60;
    this.scene_abort = 0;
  }

  set_text_region(left: number, top: number, right: number, bottom: number): void {
    this.tleft = left;
    this.ttop = top;
    this.tright = right;
    this.tbottom = bottom;
  }
  set_frame_speed(speed: number): void { this.frame_speed = speed; }
  set_scroll_speed(speed: number): void { this.scroll_speed = speed; }
  set_pan_speed(speed: number): void { this.pan_speed = speed; }
  set_pan(xv: number, yv: number, steps: number): void {
    this.pan_xv = xv;
    this.pan_yv = yv;
    this.pan_steps = steps;
  }
  set_abort(x: number): void { this.scene_abort = x; }

  scroll_text(Text: string | null): void {
    this.text = Text;
    const v = G.the_game.first_view!;
    this.text_y = v.cy2 - v.cy1 + 1;
  }

  async wait(arg: LObj): Promise<void> {
    if (this.scene_abort) return;
    this.pan_time = this.frame_time = this.text_time = null;
    let done = 0;
    const pan_symbol = find_or_create('pan'), text_symbol = find_or_create('text');

    const font = G.wm.font();

    do {
      const the_game = G.the_game;
      the_game.draw_map(the_game.first_view!);
      const cur_time = new time_marker();

      if (this.pan_steps) {
        if (this.pan_time) {
          if (Math.trunc(cur_time.diff_time(this.pan_time) * 1000) > this.pan_speed) {
            the_game.pan(this.pan_xv, this.pan_yv);
            this.pan_steps--;
            if (this.pan_steps) this.pan_time = new time_marker();
            else this.pan_time = null;
          }
        } else this.pan_time = new time_marker();
      } else if (arg === pan_symbol) done = 1;

      if (this.text) {
        const v = the_game.first_view!;
        if (text_draw(this.text_y, v.cx1 + this.tleft, v.cy1 + this.ttop, v.cx2 - this.tright, v.cy2 - this.tbottom, this.text, font,
          LG.white_light.subarray(32 * 256), G.wm.bright_color())) this.text = null;
        if (this.text_time) {
          if (Math.trunc(cur_time.diff_time(this.text_time) * 1000) > this.scroll_speed) {
            this.text_y += this.text_step;
            if (this.text) this.text_time = new time_marker();
            else this.text_time = null;
          }
        } else this.text_time = new time_marker();
      } else if (arg === text_symbol) done = 1;

      G.wm.flush_screen();
      while (G.wm.event_waiting()) {
        const ev = new event();
        await G.wm.get_event(ev);
        if (ev.type === EV_KEY) {
          switch (ev.key) {
            case JK_UP:
            case JK_LEFT:
              if (this.scroll_speed >= 20) this.scroll_speed -= 20;
              else this.text_step--;
              break;
            case JK_RIGHT:
            case JK_DOWN:
              if (this.text_step < -2) this.text_step++;
              else if (this.scroll_speed < 200) this.scroll_speed += 20;
              break;
            // in the original these two labels sit inside the braces of the case above, after its
            // break: they are reached from the switch as usual
            case JK_ESC:
              this.set_abort(1);
              done = 1;
              break;
            case JK_ENTER:
              done = 1;
              break;
          }
        }
      }
      const y = busy_hooks.spin();
      if (y) await y;
    } while (!done);
    this.pan_time = this.frame_time = this.text_time = null;
  }
}

export const scene_director = new director();

/** C's *buf: the character at p, 0 at the end of the string */
const ch = (s: string, p: number): number => (p < s.length ? s.charCodeAt(p) : 0);
const isspc = (c: number): boolean => c === 32 || c === 13 || c === 10 || c === 9;

/** Draws text (words wrapped at x2, "\n" written as backslash-n starts a paragraph) scrolled to y
 *  into the clip x1..y2 of the screen, each word in the cmap colour for its distance to the
 *  top or bottom edge. Returns 1 when the text has gone past the top. */
export function text_draw(y: number, x1: number, y1: number, x2: number, y2: number, buf: string | null, font: JCFont,
  cmap: Uint8Array, _color: number): number {
  const screen = G.screen;
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  screen.InClip(x1, y1, x2 + 1, y2 + 1);
  const h = font.height() + 2, w = font.width();
  let x = x1, dist: number;
  y += y1;
  let word_start = 0, word_size: number, word_len = 0;
  let p = 0;
  let live = buf !== null;
  const s = buf ?? '';

  while (live && ch(s, p)) {
    do {
      if (ch(s, p) === 92 /* '\\' */ && ch(s, p + 1) === 110 /* 'n' */) {
        x = x1;
        y += h * 2;
        p += 2;
      }

      // skip space
      if (isspc(ch(s, p))) {
        x += w;
        while (isspc(ch(s, p))) p++; // skip space until next word
      }

      word_start = p;
      for (word_len = 0, word_start = p, word_size = 0; ch(s, p) && !isspc(ch(s, p)) && (ch(s, p) !== 92 || ch(s, p + 1) !== 110);
        p++, word_size += w, word_len++);

      if (word_size < x2 - x1) { // make sure the word can fit on the screen
        if (word_size + x > x2) { // does word not fit on line?
          y += h; // go to next line
          x = x1;
        }
      }

      if (y + h < y1) // word on screen yet?
        x += word_size;
    } while (ch(s, p) && y + h < y1); // if not on screen yet, fetch next word

    dist = 31;
    if (y - y1 < dist) {
      if (y - y1 < 1) dist = 0;
      else dist = y - y1;
    }

    if (y2 - y < dist) {
      if (y2 - y < 1) dist = 0;
      else dist = y2 - y;
    }

    const c = cmap[dist];
    if (y > y2) live = false;
    else {
      while (word_len--) {
        font.put_char(screen, x + 1, y + 1, ch(s, word_start), 0);
        font.put_char(screen, x, y, ch(s, word_start), c);
        word_start++;
        x += w;
      }
    }
  }
  screen.SetClip(cx1, cy1, cx2, cy2);
  return y <= y1 ? 1 : 0;
}
