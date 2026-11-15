// lw/alleg2.ts: src/alleg2.c: Liquid War's own versions of Allegro's dialog procedures (text box with
// word wrap, button, text, slider, edit field, list box) and my_create_bitmap.

import { create_bitmap, draw_sprite, hline, putpixel, rect, rectfill, vline } from '../al/bitmap.ts';
import { fixdiv, fixtoi, itofix } from '../al/fixed.ts';
import { font, text_height, text_length, textout_ex } from '../al/font.ts';
import {
  _draw_scrollable_frame, broadcast_dialog_message, D_CLOSE, D_DIRTY, D_DISABLED, D_EXIT, D_GOTFOCUS, D_INTERNAL,
  D_O_K, D_SELECTED, D_USED_CHAR, D_WANTFOCUS, type Dialog, gui_get_screen, gui_mg_color, gui_textout_ex, MSG_CHAR,
  MSG_CLICK, MSG_DCLICK, MSG_DRAW, MSG_GOTFOCUS, MSG_IDLE, MSG_KEY, MSG_LOSTFOCUS, MSG_START, MSG_UCHAR, MSG_WANTFOCUS,
  MSG_WHEEL, object_message,
} from '../al/gui.ts';
import {
  KB_CTRL_FLAG, KB_SHIFT_FLAG, KEY_BACKSPACE, KEY_DEL, KEY_DOWN, KEY_END, KEY_ENTER, KEY_HOME, KEY_LEFT, KEY_PGDN, KEY_PGUP,
  KEY_RIGHT, KEY_TAB, KEY_UP, key_shifts,
} from '../al/keyboard.ts';
import { gui_mouse_b, gui_mouse_x, gui_mouse_y } from '../al/mouse.ts';
import { makecol } from '../al/palette.ts';
import { screenRef } from '../al/screen.ts';


/** a C char buffer that dialogs edit in place (dp of an edit field) */
export class CharBuf {
  private readonly getter: () => string;
  private readonly setter: (s: string) => void;
  constructor(getter: () => string, setter: (s: string) => void) {
    this.getter = getter;
    this.setter = setter;
  }
  get s(): string {
    return this.getter();
  }
  set s(v: string) {
    this.setter(v);
  }
  static of(init = ''): CharBuf {
    let v = init;
    return new CharBuf(() => v, (s) => {
      v = s;
    });
  }
}

/** a pointer to an int (dp3 of a slider) */
export interface IntRef {
  get(): number;
  set(v: number): void;
}

export function refOf<T extends object, K extends keyof T>(o: T, k: K): IntRef {
  return {
    get: () => o[k] as unknown as number,
    set: (v: number) => {
      (o as Record<K, unknown>)[k] = v;
    },
  };
}

export function str(dp: unknown): string {
  if (dp == null) return '';
  if (dp instanceof CharBuf) return dp.s;
  return String(dp);
}

function isspace(c: number): boolean {
  return c === 32 || c === 9 || c === 13 || c === 10 || c === 12 || c === 11;
}

function my_dotted_rect(x1: number, y1: number, x2: number, y2: number, fg: number, bg: number): void {
  const gui_bmp = gui_get_screen();
  const x = (x1 + y1) & 1 ? 1 : 0;
  for (let c = x1; c <= x2; c++) putpixel(gui_bmp, c, y1, ((c + y1) & 1) === x ? fg : bg);
  for (let c = x1; c <= x2; c++) putpixel(gui_bmp, c, y2, ((c + y2) & 1) === x ? fg : bg);
  for (let c = y1 + 1; c < y2; c++) {
    putpixel(gui_bmp, x1, c, ((c + x1) & 1) === x ? fg : bg);
    putpixel(gui_bmp, x2, c, ((c + x2) & 1) === x ? fg : bg);
  }
}

/** my_draw_textbox: returns the number of lines (listsize) */
function my_draw_textbox(thetext: string | null, draw: boolean, offset: number, wword: boolean, tabsize: number,
  x: number, y: number, w: number, h: number, disabled: boolean, fore: number, deselect: number, disable: number): number {
  void fore;
  void disabled;
  void disable;
  const gui_bmp = gui_get_screen();
  let y1 = y + 4;
  const ww = w - 6;
  const text = thetext ?? ' ';
  const at = (i: number): number => (i < text.length ? text.charCodeAt(i) : 0);
  let printed = 0;
  let scanned = 0;
  let oldscan = 0;
  let ignore = -1;
  let line = 0;
  if (draw) rectfill(gui_bmp, x + 2, y + 2, x + w - 3, y1 - 1, deselect);
  for (;;) {
    let width = 0;
    while (at(scanned)) {
      if (at(scanned) === 10) {
        scanned++;
        break;
      }
      const s = String.fromCharCode(at(scanned));
      let len = text_length(font, s);
      if (at(scanned) === 9) len = tabsize * text_length(font, ' ');
      if (width + len >= ww) {
        if (wword) {
          oldscan = scanned;
          let noignore = false;
          while (!isspace(at(scanned))) {
            if (scanned === printed) {
              let tmp = scanned, ptmp = scanned;
              while (ptmp !== oldscan) {
                ptmp = tmp;
                tmp += 1;
              }
              scanned = ptmp;
              noignore = true;
              break;
            }
            let tmp = printed, ptmp = printed;
            while (tmp < scanned) {
              ptmp = tmp;
              tmp += 1;
            }
            scanned = ptmp;
          }
          if (!noignore) {
            ignore = scanned;
            scanned += 1;
          } else ignore = -1;
          if (at(scanned) === 10) scanned += 1;
        }
        break;
      }
      scanned += 1;
      width += len;
    }
    if (draw && line >= offset && (y1 + text_height(font) < y + h - 3 || line === 0)) {
      let x1 = x + 4;
      rectfill(gui_bmp, x + 2, y1, x1 - 1, y1 + text_height(font), deselect);
      while (printed !== scanned) {
        const c = at(printed);
        switch (c) {
          case 13:
          case 10:
            break;
          case 9:
            for (let i = 0; i < tabsize; i++) {
              textout_ex(gui_bmp, font, ' ', x1, y1, -1, deselect);
              x1 += text_length(font, ' ');
            }
            break;
          default:
            if (printed !== ignore) {
              const s = String.fromCharCode(c);
              textout_ex(gui_bmp, font, s, x1, y1, -1, deselect);
              x1 += text_length(font, s);
            }
        }
        printed += 1;
      }
      if (x1 <= x + w - 3) rectfill(gui_bmp, x1, y1, x + w - 3, y1 + text_height(font) - 1, deselect);
      y1 += text_height(font);
    }
    printed = scanned;
    line++;
    if (!at(printed)) {
      if (draw) rectfill(gui_bmp, x + 1, y1, x + w - 3, y + h - 1, deselect);
      return line;
    }
  }
}

export async function my_textbox_proc(msg: number, d: Dialog, c: number): Promise<number> {
  let ret = D_O_K;
  const fg_color = d.flags & D_DISABLED ? gui_mg_color : d.fg;
  const height = Math.trunc((d.h - 8) / text_height(font));
  const text = d.dp == null ? null : str(d.dp);
  switch (msg) {
    case MSG_START:
      d.d1 = my_draw_textbox(text, false, d.d2, !(d.flags & D_SELECTED), 8, d.x, d.y, d.w, d.h, !!(d.flags & D_DISABLED), 0, 0, 0);
      break;
    case MSG_DRAW: {
      d.d1 = my_draw_textbox(text, false, d.d2, !(d.flags & D_SELECTED), 8, d.x, d.y, d.w, d.h, !!(d.flags & D_DISABLED), 0, 0, 0);
      let bar;
      if (d.d1 > height && d.d1 > 1) bar = 12;
      else {
        bar = 0;
        d.d2 = 0;
      }
      const screen = screenRef.screen;
      if (d.d1 <= 1) rectfill(screen, d.x, d.y, d.x + d.w, d.y + d.h, d.bg);
      d.d1 = my_draw_textbox(text, true, d.d2, !(d.flags & D_SELECTED), 8, d.x, d.y, d.w - bar, d.h,
        !!(d.flags & D_DISABLED), fg_color, d.bg, gui_mg_color);
      if (d.d1 <= 1) rect(screen, d.x, d.y, d.x + d.w, d.y + d.h, fg_color);
      else _draw_scrollable_frame(d, d.d1, d.d2, height, fg_color, d.bg);
      break;
    }
    case MSG_CLICK: {
      const bar = d.d1 > height;
      if (!bar || gui_mouse_x() < d.x + d.w - 13) ret = D_O_K;
      else {
        const off = { v: d.d2 };
        await my_handle_scrollable_scroll_click(d, d.d1, off, height);
        d.d2 = off.v;
      }
      break;
    }
    case MSG_CHAR: {
      const start = d.d2;
      let used = D_USED_CHAR;
      if (d.d1 > 0) {
        const top = d.d2 > 0 ? d.d2 + 1 : 0;
        const l = Math.trunc((d.h - 8) / text_height(font));
        let bottom = d.d2 + l - 1;
        if (bottom >= d.d1 - 1) bottom = d.d1 - 1;
        else bottom--;
        const k = c >> 8;
        if (k === KEY_UP) d.d2--;
        else if (k === KEY_DOWN) d.d2++;
        else if (k === KEY_HOME) d.d2 = 0;
        else if (k === KEY_END) d.d2 = d.d1 - l;
        else if (k === KEY_PGUP) d.d2 -= bottom - top ? bottom - top : 1;
        else if (k === KEY_PGDN) d.d2 += bottom - top ? bottom - top : 1;
        else used = D_O_K;
        if (d.d2 > d.d1 - l) d.d2 = d.d1 - l;
        if (d.d2 < 0) d.d2 = 0;
      } else used = D_O_K;
      if (d.d2 !== start) d.flags |= D_DIRTY;
      ret = used;
      break;
    }
    case MSG_WHEEL: {
      const l = Math.trunc((d.h - 8) / text_height(font));
      const delta = l > 3 ? 3 : 1;
      const start = d.d2;
      d.d2 = c > 0 ? Math.max(0, d.d2 - delta) : Math.min(d.d1 - l, d.d2 + delta);
      if (d.d2 !== start) d.flags |= D_DIRTY;
      ret = D_O_K;
      break;
    }
    case MSG_WANTFOCUS:
      if (d.d1 > height) ret = D_WANTFOCUS;
      break;
    default:
      ret = D_O_K;
  }
  return ret;
}

export async function my_button_proc(msg: number, d: Dialog, c: number): Promise<number> {
  void c;
  const gui_bmp = gui_get_screen();
  switch (msg) {
    case MSG_DRAW: {
      let g, state1, state2;
      if (d.flags & D_SELECTED) {
        g = 1;
        state1 = d.bg;
        state2 = d.flags & D_DISABLED ? gui_mg_color : d.fg;
      } else {
        g = 0;
        state1 = d.flags & D_DISABLED ? gui_mg_color : d.fg;
        state2 = d.bg;
      }
      rectfill(gui_bmp, d.x + 1 + g, d.y + 1 + g, d.x + d.w - 3 + g, d.y + d.h - 3 + g, state2);
      rect(gui_bmp, d.x + g, d.y + g, d.x + d.w - 2 + g, d.y + d.h - 2 + g, state1);
      gui_textout_ex(gui_bmp, str(d.dp), d.x + Math.trunc(d.w / 2) + g, d.y + Math.trunc(d.h / 2) - Math.trunc(text_height(font) / 2) + g, -1, -1, true);
      if (d.flags & D_SELECTED) {
        vline(gui_bmp, d.x, d.y, d.y + d.h - 2, d.bg);
        hline(gui_bmp, d.x, d.y, d.x + d.w - 2, d.bg);
      } else {
        const black = makecol(0, 0, 0);
        vline(gui_bmp, d.x + d.w - 1, d.y + 1, d.y + d.h - 2, black);
        hline(gui_bmp, d.x + 1, d.y + d.h - 1, d.x + d.w - 1, black);
      }
      if (d.flags & D_GOTFOCUS && (!(d.flags & D_SELECTED) || !(d.flags & D_EXIT))) {
        my_dotted_rect(d.x + 1 + g, d.y + 1 + g, d.x + d.w - 3 + g, d.y + d.h - 3 + g, state1, state2);
      }
      break;
    }
    case MSG_WANTFOCUS:
      return D_WANTFOCUS;
    case MSG_KEY:
      if (d.flags & D_EXIT) return D_CLOSE;
      d.flags ^= D_SELECTED;
      await object_message(d, MSG_DRAW, 0);
      break;
    case MSG_CLICK: {
      let state1 = d.flags & D_SELECTED;
      const swap = d.flags & D_EXIT ? 0 : state1;
      while (await gui_mouse_b()) {
        let state2 = gui_mouse_x() >= d.x && gui_mouse_y() >= d.y && gui_mouse_x() < d.x + d.w && gui_mouse_y() < d.y + d.h ? 1 : 0;
        if (swap) state2 = state2 ? 0 : 1;
        if ((state1 && !state2) || (state2 && !state1)) {
          d.flags ^= D_SELECTED;
          state1 = d.flags & D_SELECTED;
          await object_message(d, MSG_DRAW, 0);
        }
        await broadcast_dialog_message(MSG_IDLE, 0);
      }
      if (d.flags & D_SELECTED && d.flags & D_EXIT) {
        d.flags ^= D_SELECTED;
        return D_CLOSE;
      }
      break;
    }
  }
  return D_O_K;
}

export function my_text_proc(msg: number, d: Dialog): number {
  if (msg === MSG_DRAW) gui_textout_ex(gui_get_screen(), str(d.dp), d.x, d.y, -1, d.bg, false);
  return D_O_K;
}

export function my_ctext_proc(msg: number, d: Dialog): number {
  if (msg === MSG_DRAW) gui_textout_ex(gui_get_screen(), str(d.dp), d.x + Math.trunc(d.w / 2), d.y, -1, d.bg, true);
  return D_O_K;
}

export type SliderCallback = (dp3: unknown, d2: number) => number | Promise<number>;

export async function my_slider_proc(msg: number, d: Dialog, c: number): Promise<number> {
  const gui_bmp = gui_get_screen();
  let vert = true;
  let hh = 7;
  if (d.h < d.w) vert = false;
  const slhan = d.dp as import('../al/bitmap.ts').Bitmap | null;
  if (slhan) hh = vert ? slhan.h : slhan.w;
  const hmar = Math.trunc(hh / 2);
  const irange = vert ? d.h : d.w;
  let slmax = itofix(irange - hh);
  const slratio = Math.trunc(slmax / d.d1);
  let slpos = Math.imul(slratio, d.d2);
  let slp = fixtoi(slpos);
  let retval = D_O_K;
  switch (msg) {
    case MSG_DRAW: {
      const sfg = d.flags & D_DISABLED ? gui_mg_color : d.fg;
      if (vert) {
        rectfill(gui_bmp, d.x, d.y, d.x + Math.trunc(d.w / 2) - 2, d.y + d.h - 1, d.bg);
        rectfill(gui_bmp, d.x + Math.trunc(d.w / 2) - 1, d.y, d.x + Math.trunc(d.w / 2) + 1, d.y + d.h - 1, sfg);
        rectfill(gui_bmp, d.x + Math.trunc(d.w / 2) + 2, d.y, d.x + d.w - 1, d.y + d.h - 1, d.bg);
      } else {
        rectfill(gui_bmp, d.x, d.y, d.x + d.w - 1, d.y + Math.trunc(d.h / 2) - 2, d.bg);
        rectfill(gui_bmp, d.x, d.y + Math.trunc(d.h / 2) - 1, d.x + d.w - 1, d.y + Math.trunc(d.h / 2) + 1, sfg);
        rectfill(gui_bmp, d.x, d.y + Math.trunc(d.h / 2) + 2, d.x + d.w - 1, d.y + d.h - 1, d.bg);
      }
      rect(screenRef.screen, d.x, d.y, d.x + d.w, d.y + d.h, sfg);
      if (slhan) {
        let slx, sly;
        if (vert) {
          slx = d.x + Math.trunc(d.w / 2) - Math.trunc(slhan.w / 2);
          sly = d.y + (d.h - 1) - (hh + slp);
        } else {
          slx = d.x + slp;
          sly = d.y + Math.trunc(d.h / 2) - Math.trunc(slhan.h / 2);
        }
        draw_sprite(gui_bmp, slhan, slx, sly);
      } else {
        let slx, sly, slw, slh;
        if (vert) {
          slx = d.x;
          sly = d.y + d.h - (hh + slp);
          slw = d.w - 1;
          slh = hh - 1;
        } else {
          slx = d.x + slp;
          sly = d.y;
          slw = hh - 1;
          slh = d.h - 1;
        }
        rectfill(gui_bmp, slx + 2, sly, slx + (slw - 2), sly + slh, sfg);
        vline(gui_bmp, slx + 1, sly + 1, sly + slh - 1, sfg);
        vline(gui_bmp, slx + slw - 1, sly + 1, sly + slh - 1, sfg);
        vline(gui_bmp, slx, sly + 2, sly + slh - 2, sfg);
        vline(gui_bmp, slx + slw, sly + 2, sly + slh - 2, sfg);
        vline(gui_bmp, slx + 1, sly + 2, sly + slh - 2, d.bg);
        hline(gui_bmp, slx + 2, sly + 1, slx + slw - 2, d.bg);
        putpixel(gui_bmp, slx + 2, sly + 2, d.bg);
      }
      if (d.flags & D_GOTFOCUS) my_dotted_rect(d.x + 1, d.y + 1, d.x + d.w - 1, d.y + d.h - 1, sfg, d.bg);
      break;
    }
    case MSG_WANTFOCUS:
    case MSG_LOSTFOCUS:
      return D_WANTFOCUS;
    case MSG_KEY:
      if (!(d.flags & D_GOTFOCUS)) return D_WANTFOCUS;
      return D_O_K;
    case MSG_CHAR: {
      const k = c >> 8;
      let upkey, downkey, pgupkey, pgdnkey, homekey, endkey;
      if (vert) {
        upkey = KEY_UP;
        downkey = KEY_DOWN;
        pgupkey = KEY_PGUP;
        pgdnkey = KEY_PGDN;
        homekey = KEY_END;
        endkey = KEY_HOME;
      } else {
        upkey = KEY_RIGHT;
        downkey = KEY_LEFT;
        pgupkey = KEY_PGDN;
        pgdnkey = KEY_PGUP;
        homekey = KEY_HOME;
        endkey = KEY_END;
      }
      let delta;
      if (k === upkey) delta = 1;
      else if (k === downkey) delta = -1;
      else if (k === pgdnkey) delta = -Math.trunc(d.d1 / 16);
      else if (k === pgupkey) delta = Math.trunc(d.d1 / 16);
      else if (k === homekey) delta = -d.d2;
      else if (k === endkey) delta = d.d1 - d.d2;
      else delta = 0;
      if (delta) {
        const oldpos = slp;
        const oldval = d.d2;
        for (;;) {
          d.d2 = d.d2 + delta;
          slpos = Math.imul(slratio, d.d2);
          slp = fixtoi(slpos);
          if (slp !== oldpos || d.d2 <= 0 || d.d2 >= d.d1) break;
        }
        if (d.d2 < 0) d.d2 = 0;
        if (d.d2 > d.d1) d.d2 = d.d1;
        retval = D_USED_CHAR;
        if (d.d2 !== oldval) {
          if (d.dp2) retval |= await (d.dp2 as SliderCallback)(d.dp3, d.d2);
          await object_message(d, MSG_DRAW, 0);
        }
      }
      break;
    }
    case MSG_WHEEL: {
      const oldval = d.d2;
      d.d2 = Math.max(0, Math.min(d.d2 + c, d.d1));
      if (d.d2 !== oldval) {
        if (d.dp2) retval |= await (d.dp2 as SliderCallback)(d.dp3, d.d2);
        await object_message(d, MSG_DRAW, 0);
      }
      break;
    }
    case MSG_CLICK: {
      while (await gui_mouse_b()) {
        const msx = gui_mouse_x();
        const msy = gui_mouse_y();
        const oldval = d.d2;
        let mp = vert ? d.y + d.h - hmar - msy : msx - (d.x + hmar);
        if (mp < 0) mp = 0;
        if (mp > irange - hh) mp = irange - hh;
        slpos = itofix(mp);
        slmax = fixdiv(slpos, slratio);
        const newpos = fixtoi(slmax);
        if (newpos !== oldval) {
          d.d2 = newpos;
          if (d.dp2) retval |= await (d.dp2 as SliderCallback)(d.dp3, d.d2);
          await object_message(d, MSG_DRAW, 0);
        }
        await broadcast_dialog_message(MSG_IDLE, 0);
      }
      break;
    }
  }
  return retval;
}

let ignore_next_uchar = false;

export async function my_edit_proc(msg: number, d: Dialog, c: number): Promise<number> {
  const gui_bmp = gui_get_screen();
  const buf = d.dp as CharBuf;
  let s = buf.s;
  const l = s.length;
  if (d.d2 > l) d.d2 = l;
  let x;
  if (d.d2 === l) x = text_length(font, ' ');
  else x = 0;
  let b = 0;
  let p;
  const ch = (i: number): number => (i < s.length ? s.charCodeAt(i) : 0);
  const cs = (code: number): string => (code ? String.fromCharCode(code) : '');
  for (p = d.d2; p >= 0; p--) {
    x += text_length(font, cs(ch(p)));
    b++;
    if (x > d.w) break;
  }
  let scroll;
  if (x <= d.w) {
    b = l;
    scroll = false;
  } else {
    b--;
    scroll = true;
  }
  switch (msg) {
    case MSG_START:
      d.d2 = l;
      break;
    case MSG_DRAW: {
      x = 0;
      if (scroll) {
        p = d.d2 - b + 1;
        b = d.d2;
      } else p = 0;
      for (; p <= b; p++) {
        const f = ch(p);
        const t = String.fromCharCode(f ? f : 32);
        const w = text_length(font, t);
        if (x + w > d.w) break;
        const sel = p === d.d2 && d.flags & D_GOTFOCUS;
        textout_ex(gui_bmp, font, t, d.x + x, d.y, -1, sel ? d.fg : d.bg);
        x += w;
      }
      if (x < d.w) rectfill(gui_bmp, d.x + x, d.y, d.x + d.w - 1, d.y + text_height(font) - 1, d.bg);
      break;
    }
    case MSG_CLICK: {
      x = d.x;
      if (scroll) {
        p = d.d2 - b + 1;
        b = d.d2;
      } else p = 0;
      for (; p < b; p++) {
        x += text_length(font, cs(ch(p)));
        if (x > gui_mouse_x()) break;
      }
      d.d2 = Math.max(0, Math.min(p, l));
      await object_message(d, MSG_DRAW, 0);
      break;
    }
    case MSG_WANTFOCUS:
    case MSG_LOSTFOCUS:
    case MSG_KEY:
      return D_WANTFOCUS;
    case MSG_CHAR: {
      ignore_next_uchar = false;
      const k = c >> 8;
      if (k === KEY_LEFT) {
        if (d.d2 > 0) {
          if (key_shifts & KB_CTRL_FLAG) {
            let last_was_space = true;
            let new_pos = 0;
            for (let i = 0; i < d.d2; i++) {
              const kc = ch(i);
              if (isspace(kc)) last_was_space = true;
              else if (last_was_space) {
                last_was_space = false;
                new_pos = i;
              }
            }
            d.d2 = new_pos;
          } else d.d2--;
        }
      } else if (k === KEY_RIGHT) {
        if (d.d2 < l) {
          if (key_shifts & KB_CTRL_FLAG) {
            let t = d.d2;
            let kc;
            for (kc = ch(t++); isspace(kc); kc = ch(t++)) d.d2++;
            for (; kc && !isspace(kc); kc = ch(t++)) d.d2++;
          } else d.d2++;
        }
      } else if (k === KEY_HOME) d.d2 = 0;
      else if (k === KEY_END) d.d2 = l;
      else if (k === KEY_DEL) {
        if (d.d2 < l) {
          s = s.slice(0, d.d2) + s.slice(d.d2 + 1);
          buf.s = s;
        }
      } else if (k === KEY_BACKSPACE) {
        if (d.d2 > 0) {
          d.d2--;
          s = s.slice(0, d.d2) + s.slice(d.d2 + 1);
          buf.s = s;
        }
      } else if (k === KEY_ENTER) {
        if (d.flags & D_EXIT) {
          await object_message(d, MSG_DRAW, 0);
          return D_CLOSE;
        }
        return D_O_K;
      } else if (k === KEY_TAB) {
        ignore_next_uchar = true;
        return D_O_K;
      } else break;
      await object_message(d, MSG_DRAW, 0);
      return D_USED_CHAR;
    }
    case MSG_UCHAR:
      if (c >= 32 && c < 128 && !ignore_next_uchar) {
        if (l < d.d1) {
          s = s.slice(0, d.d2) + String.fromCharCode(c) + s.slice(d.d2);
          buf.s = s;
          d.d2++;
          await object_message(d, MSG_DRAW, 0);
        }
        return D_USED_CHAR;
      }
      break;
  }
  return D_O_K;
}

async function my_handle_scrollable_scroll_click(d: Dialog, listsize: number, offset: { v: number }, height: number): Promise<void> {
  const hh = d.h - 5;
  while (await gui_mouse_b()) {
    const i = Math.trunc((hh * height + Math.trunc(listsize / 2)) / listsize);
    const len = Math.trunc((hh * offset.v + Math.trunc(listsize / 2)) / listsize) + 2;
    if (gui_mouse_y() >= d.y + len && gui_mouse_y() <= d.y + len + i) {
      const xx = gui_mouse_y() - len + 2;
      while (await gui_mouse_b()) {
        let yy = Math.trunc((listsize * (gui_mouse_y() - xx) + Math.trunc(hh / 2)) / hh);
        if (yy > listsize - height) yy = listsize - height;
        if (yy < 0) yy = 0;
        if (yy !== offset.v) {
          offset.v = yy;
          await object_message(d, MSG_DRAW, 0);
        }
        await broadcast_dialog_message(MSG_IDLE, 0);
      }
    } else {
      let yy;
      if (gui_mouse_y() <= d.y + len) yy = offset.v - height;
      else yy = offset.v + height;
      if (yy > listsize - height) yy = listsize - height;
      if (yy < 0) yy = 0;
      if (yy !== offset.v) {
        offset.v = yy;
        await object_message(d, MSG_DRAW, 0);
      }
    }
    await broadcast_dialog_message(MSG_IDLE, 0);
  }
}

export function my_create_bitmap(w: number, h: number): import('../al/bitmap.ts').Bitmap {
  return create_bitmap(w, h);
}

void D_INTERNAL;
void MSG_DCLICK;
void MSG_GOTFOCUS;
void KB_SHIFT_FLAG;
