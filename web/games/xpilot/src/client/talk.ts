// x11/talk.c: the talk window (typing, cursor, history), pasting into it, and cutting text from the
// talk window or from the talk messages on the playing field.
import { G } from './G.ts';
import {
  BLACK, WHITE, DRAW_EMPHASIZED, MAX_CHARS, MAX_MSGS, MSG_LEN, SEL_NONE, SEL_PENDING, SEL_SELECTED, SEL_EMPHASIZED,
  KEY_DUMMY, KEY_TALK_CURSOR_LEFT, KEY_TALK_CURSOR_RIGHT, KEY_TALK_CURSOR_UP, KEY_TALK_CURSOR_DOWN,
} from './consts.ts';
import { onReset } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import type { XEvent } from '../xlib/xlib.ts';
import { Generic_lookup_key } from './option.ts';
import { Net_talk } from './netclient.ts';
import { Add_pending_messages } from './messages.ts';

const TALK_OUTSIDE_BORDER = 2;
const TALK_INSIDE_BORDER = 3;
const TALK_TEXT_HEIGHT = () => G.talkFont.ascent + G.talkFont.descent;
const TALK_WINDOW_HEIGHT = () => (TALK_TEXT_HEIGHT() + 2 * TALK_INSIDE_BORDER) >>> 0;
const TALK_WINDOW_X = 50 - TALK_OUTSIDE_BORDER;
const TALK_WINDOW_Y = () => Math.trunc((G.draw_height * 3) / 4 - Math.trunc(TALK_WINDOW_HEIGHT() / 2)) | 0;
const TALK_WINDOW_WIDTH = () => (G.draw_width - 2 * (TALK_WINDOW_X + TALK_OUTSIDE_BORDER)) >>> 0;
const CTRL = (c: string) => c.charCodeAt(0) & 0x1f;
const CRS_START_HOPPING = 7;
const CRS_HOP = 4;

const T = {
  talk_created: false,
  talk_str: '',
  cursor: { visible: false, offset: 0, point: 0 },
  history_pos: 0,
  root: 0, root_x: 0, root_y: 0,
  talk_crs_repeat_count: 0,
  c1: { x: 0, y: 0, pixel_len: 0, str_index: 0, x_off: 0 },
  last_msg_index: 0,
};
onReset(() => Object.assign(T, {
  talk_created: false, talk_str: '', cursor: { visible: false, offset: 0, point: 0 }, history_pos: 0, root: 0, root_x: 0,
  root_y: 0, talk_crs_repeat_count: 0, c1: { x: 0, y: 0, pixel_len: 0, str_index: 0, x_off: 0 }, last_msg_index: 0,
}));

/** C isprint() of a (signed) char */
const isprint = (c: number) => c >= 0x20 && c < 0x7f;
const cut79 = (s: string) => s.slice(0, MAX_CHARS - 1);

function Talk_create_window(): void {
  G.talkWindow = X.XCreateSimpleWindow(G.dpy, G.drawWindow, TALK_WINDOW_X, TALK_WINDOW_Y(), TALK_WINDOW_WIDTH(), TALK_WINDOW_HEIGHT(),
    TALK_OUTSIDE_BORDER, G.colors[WHITE].pixel, G.colors[BLACK].pixel);
  X.XSelectInput(G.dpy, G.talkWindow, X.ButtonPressMask | X.ButtonReleaseMask | X.KeyPressMask | X.KeyReleaseMask | X.ExposureMask);
}

export function Talk_cursor(visible: boolean): void {
  const c = T.cursor;
  const sel = G.selection.talk;
  const ty = G.talkFont.ascent + TALK_INSIDE_BORDER;
  if (G.clData.talking === false || visible === c.visible) return;
  if (visible === false) {
    X.XSetForeground(G.dpy, G.talkGC, G.colors[BLACK].pixel);
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, c.offset + TALK_INSIDE_BORDER, ty, '_', 1);
    X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
    if (c.point < T.talk_str.length) {
      if (sel.state === SEL_EMPHASIZED && c.point >= sel.x1 && c.point < sel.x2) X.XSetForeground(G.dpy, G.talkGC, G.colors[DRAW_EMPHASIZED].pixel);
      X.XDrawString(G.dpy, G.talkWindow, G.talkGC, c.offset + TALK_INSIDE_BORDER, ty, T.talk_str.slice(c.point), 1);
      X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
    }
    c.visible = false;
  } else {
    c.offset = X.XTextWidth(G.talkFont, T.talk_str, c.point);
    if (c.point < T.talk_str.length && T.talk_str[c.point] === '_' && (sel.state !== SEL_EMPHASIZED || c.point < sel.x1 || c.point >= sel.x2)) {
      X.XSetForeground(G.dpy, G.talkGC, G.colors[DRAW_EMPHASIZED].pixel);
    }
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, c.offset + TALK_INSIDE_BORDER, ty, '_', 1);
    c.visible = true;
  }
}

export function Talk_map_window(map: boolean): void {
  if (map) {
    if (T.talk_created === false) {
      Talk_create_window();
      T.talk_created = true;
    }
    X.XMapWindow(G.dpy, G.talkWindow);
    G.clData.talking = true;
    T.root = X.DefaultRootWindow(G.dpy);
    const q = X.XQueryPointer(G.dpy, X.DefaultRootWindow(G.dpy));
    T.root_x = q.root_x;
    T.root_y = q.root_y;
    X.XWarpPointer(G.dpy, X.None, G.talkWindow, 0, 0, 0, 0, (TALK_WINDOW_WIDTH() - Math.trunc(TALK_WINDOW_HEIGHT() / 2)) | 0,
      Math.trunc(TALK_WINDOW_HEIGHT() / 2));
    X.XFlush(G.dpy);
  } else if (T.talk_created) {
    X.XUnmapWindow(G.dpy, G.talkWindow);
    X.XWarpPointer(G.dpy, X.None, T.root, 0, 0, 0, 0, T.root_x, T.root_y);
    X.XFlush(G.dpy);
    G.clData.talking = false;
    T.history_pos = -1;
  }
  T.cursor.visible = false;
}

function Talk_refresh(): void {
  if (!G.clData.talking) return;
  const sel = G.selection.talk;
  const len = T.talk_str.length;
  if (sel.x1 > len || sel.x2 > len) return;
  if (len === 0) {
    X.XClearWindow(G.dpy, G.talkWindow);
    return;
  }
  X.XSetForeground(G.dpy, G.talkGC, G.colors[sel.state === SEL_EMPHASIZED ? DRAW_EMPHASIZED : WHITE].pixel);
  X.XDrawString(G.dpy, G.talkWindow, G.talkGC, X.XTextWidth(G.talkFont, T.talk_str, sel.x1) + TALK_INSIDE_BORDER,
    G.talkFont.ascent + TALK_INSIDE_BORDER, T.talk_str.slice(sel.x1), sel.x2 - sel.x1);
  X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
}

function Add_msg_to_history(message: string): void {
  G.save_talk_str = false;
  if (message.length === 0) return;
  const h = G.HistoryMsg;
  for (let i = G.maxLinesInHistory - 1; i > 0; i--) h[i] = h[i - 1];
  h[0] = message.slice(0, MAX_CHARS - 1);
  T.history_pos = 0;
}

function Get_msg_from_history(message: string, direction: number): string | null {
  if (direction !== KEY_TALK_CURSOR_UP && direction !== KEY_TALK_CURSOR_DOWN && direction !== KEY_DUMMY) return null;
  if (direction === KEY_DUMMY && (T.history_pos < 0 || T.history_pos > G.maxLinesInHistory - 1)) T.history_pos = 0;
  if (G.save_talk_str) {
    if (message.length > 0) Add_msg_to_history(message);
    G.save_talk_str = false;
    return null;
  }
  for (let i = 0; i < G.maxLinesInHistory; i++) {
    if (direction === KEY_TALK_CURSOR_UP) {
      T.history_pos++;
      if (T.history_pos >= G.maxLinesInHistory) T.history_pos = 0;
    } else if (direction === KEY_TALK_CURSOR_DOWN) {
      T.history_pos--;
      if (T.history_pos < 0) T.history_pos = G.maxLinesInHistory - 1;
    }
    const m = G.HistoryMsg[T.history_pos];
    if (m && m.length > 0) return m;
  }
  return null;
}

function Talk_delete_emphasized_text(): void {
  const sel = G.selection.talk;
  if (sel.state !== SEL_EMPHASIZED) return;
  Talk_cursor(false);
  const talk_str = T.talk_str;
  let new_str = talk_str;
  const oldlen = talk_str.length;
  let newlen = oldlen;
  if (oldlen > 0 && oldlen >= sel.x2) {
    new_str = talk_str.slice(0, sel.x1) + talk_str.slice(sel.x2);
    T.cursor.point = sel.x1;
    newlen -= sel.x2 - sel.x1;
    sel.state = SEL_NONE;
    if (T.cursor.point > newlen) T.cursor.point = newlen;
  }
  new_str = new_str.slice(0, newlen);
  const width = X.XTextWidth(G.talkFont, talk_str, sel.x1);
  const ty = G.talkFont.ascent + TALK_INSIDE_BORDER;
  if (newlen < oldlen) {
    X.XSetForeground(G.dpy, G.talkGC, G.colors[BLACK].pixel);
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, width + TALK_INSIDE_BORDER, ty, talk_str.slice(T.cursor.point), oldlen - T.cursor.point);
    X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
  }
  if (T.cursor.point < newlen) {
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, width + TALK_INSIDE_BORDER, ty, new_str.slice(T.cursor.point), newlen - T.cursor.point);
  }
  Talk_cursor(true);
  T.talk_str = cut79(new_str);
}

/** xevent.c Lookup_key */
export function Lookup_key(_event: XEvent | null, ks: number, reset: boolean): number {
  return Generic_lookup_key(ks, reset);
}

/** false when talking ends */
export function Talk_do_event(event: XEvent): boolean {
  const cursor_visible = T.cursor.visible;
  const c = T.cursor;
  const sel = G.selection;
  let result = true;
  const ty = () => G.talkFont.ascent + TALK_INSIDE_BORDER;
  switch (event.type) {
    case X.Expose:
      X.XClearWindow(G.dpy, G.talkWindow);
      X.XDrawString(G.dpy, G.talkWindow, G.talkGC, TALK_INSIDE_BORDER, ty(), T.talk_str, T.talk_str.length);
      if (sel.talk.state === SEL_EMPHASIZED) Talk_refresh();
      if (cursor_visible) {
        c.visible = false;
        Talk_cursor(cursor_visible);
      }
      break;
    case X.KeyRelease:
      T.talk_crs_repeat_count = 0;
      break;
    case X.KeyPress: {
      if (X.XLookupKeysym(G.dpy, event, 0) === X.NoSymbol) break;
      const [chars, keysym] = X.XLookupString(G.dpy, event);
      if (chars.length === 0) {
        for (let key = Lookup_key(event, keysym, true); key !== KEY_DUMMY; key = Lookup_key(event, keysym, false)) {
          switch (key) {
            case KEY_TALK_CURSOR_RIGHT:
              Talk_cursor(false);
              if (T.talk_crs_repeat_count > CRS_START_HOPPING) {
                const len = T.talk_str.length;
                // size_t: strlen - CRS_HOP wraps around for short strings
                if (len < CRS_HOP || c.point < len - CRS_HOP) c.point += CRS_HOP;
                else c.point = len;
              } else if (c.point < T.talk_str.length) {
                c.point++;
                T.talk_crs_repeat_count++;
              }
              Talk_cursor(true);
              break;
            case KEY_TALK_CURSOR_LEFT:
              Talk_cursor(false);
              if (T.talk_crs_repeat_count > CRS_START_HOPPING) {
                if (c.point > CRS_HOP) c.point -= CRS_HOP;
                else c.point = 0;
              } else if (c.point > 0) {
                c.point--;
                T.talk_crs_repeat_count++;
              }
              Talk_cursor(true);
              break;
            case KEY_TALK_CURSOR_UP:
            case KEY_TALK_CURSOR_DOWN: {
              const tmp = Get_msg_from_history(T.talk_str, key);
              if (tmp && tmp.length > 0) Talk_paste(tmp, tmp.length, true);
              else {
                T.talk_str = '';
                Talk_cursor(false);
                c.point = 0;
                Talk_cursor(true);
                X.XClearWindow(G.dpy, G.talkWindow);
              }
              break;
            }
            default:
              break;
          }
        }
        break;
      }
      let ch = chars.charCodeAt(0);
      if (ch >= 0x80) ch -= 0x100;
      switch (ch) {
        case CTRL('A'): case CTRL('E'): case CTRL('B'): case CTRL('F'): case 13: case 10: case 27:
          break;
        default:
          if (isprint(ch)) {
            G.save_talk_str = true;
            if (sel.talk.state === SEL_EMPHASIZED) Talk_delete_emphasized_text();
          }
          break;
      }
      switch (ch) {
        case 0:
          break;
        case 13:
        case 10:
          if (T.talk_str !== '') {
            if (sel.talk.state === SEL_EMPHASIZED) {
              sel.talk.state = SEL_SELECTED;
              sel.keep_emphasizing = true;
              sel.draw.x1 = sel.talk.x1;
              sel.draw.x2 = sel.talk.x2;
            }
            if (G.save_talk_str) Add_msg_to_history(T.talk_str);
            Net_talk(T.talk_str);
            c.point = 0;
            T.talk_str = '';
          } else {
            G.save_talk_str = false;
            T.history_pos = 0;
          }
          result = false;
          break;
        case 27:
          T.talk_str = '';
          c.point = 0;
          G.save_talk_str = false;
          sel.talk.state = SEL_NONE;
          result = false;
          break;
        case CTRL('A'):
          Talk_cursor(false);
          c.point = 0;
          Talk_cursor(true);
          break;
        case CTRL('E'):
          Talk_cursor(false);
          c.point = T.talk_str.length;
          Talk_cursor(true);
          break;
        case CTRL('B'):
          if (c.point > 0) {
            Talk_cursor(false);
            c.point--;
            Talk_cursor(true);
          }
          break;
        case CTRL('F'):
          if (c.point < T.talk_str.length) {
            Talk_cursor(false);
            c.point++;
            Talk_cursor(true);
          }
          break;
        case 8: case 127: case CTRL('D'): case CTRL('W'): case CTRL('U'): case CTRL('K'): {
          Talk_cursor(false);
          const talk_str = T.talk_str;
          let new_str = talk_str;
          const oldlen = talk_str.length;
          let newlen = oldlen;
          if (ch === CTRL('W')) {
            while (newlen > 0 && talk_str[newlen - 1] === ' ') newlen--;
            while (newlen > 0 && talk_str[newlen - 1] !== ' ') newlen--;
          } else if (ch === CTRL('U')) newlen = 0;
          else if (ch === CTRL('K')) newlen = c.point;
          else if (oldlen > 0) {
            if (sel.talk.state === SEL_EMPHASIZED) {
              new_str = new_str.slice(0, sel.talk.x1) + new_str.slice(sel.talk.x2, oldlen);
              c.point = sel.talk.x1;
              newlen -= sel.talk.x2 - sel.talk.x1;
              sel.talk.state = SEL_NONE;
            } else if (T.talk_crs_repeat_count > CRS_START_HOPPING) {
              if (c.point > CRS_HOP) {
                newlen -= CRS_HOP;
                if (ch !== CTRL('D') || c.point >= newlen) c.point -= CRS_HOP;
                new_str = new_str.slice(0, c.point) + talk_str.slice(c.point + CRS_HOP);
              } else {
                const old_point = c.point;
                newlen -= c.point;
                if (ch !== CTRL('D') || c.point >= newlen) c.point = 0;
                new_str = talk_str.slice(old_point);
              }
            } else if (c.point > 0) {
              newlen--;
              if (ch !== CTRL('D') || c.point >= newlen) c.point--;
              T.talk_crs_repeat_count++;
              new_str = new_str.slice(0, c.point) + talk_str.slice(c.point + 1);
            }
          }
          new_str = new_str.slice(0, newlen);
          if (c.point > newlen) c.point = newlen;
          const x = X.XTextWidth(G.talkFont, talk_str, c.point) + TALK_INSIDE_BORDER;
          if (newlen < oldlen) {
            X.XSetForeground(G.dpy, G.talkGC, G.colors[BLACK].pixel);
            X.XDrawString(G.dpy, G.talkWindow, G.talkGC, x, ty(), talk_str.slice(c.point), oldlen - c.point);
            X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
          }
          if (c.point < newlen) X.XDrawString(G.dpy, G.talkWindow, G.talkGC, x, ty(), new_str.slice(c.point), newlen - c.point);
          Talk_cursor(cursor_visible);
          T.talk_str = cut79(new_str);
          break;
        }
        default: {
          if ((ch & 0x7f) === ch && !isprint(ch)) break;
          const talk_str = T.talk_str;
          const oldlen = talk_str.length;
          let oldwidth = X.XTextWidth(G.talkFont, talk_str, oldlen);
          const limit = TALK_WINDOW_WIDTH() - 2 * TALK_INSIDE_BORDER - 5;
          if (oldlen >= MAX_CHARS - 2 || (limit >= 0 && oldwidth >= limit)) {
            X.XBell(G.dpy, 100);
            break;
          }
          oldwidth = X.XTextWidth(G.talkFont, talk_str, c.point);
          const point = Math.min(c.point, oldlen);
          const chs = String.fromCharCode(ch & 0xff);
          const new_str = cut79(talk_str.slice(0, point) + chs + talk_str.slice(point));
          const newlen = oldlen + 1;
          Talk_cursor(false);
          if (c.point < oldlen) {
            X.XSetForeground(G.dpy, G.talkGC, G.colors[BLACK].pixel);
            X.XDrawString(G.dpy, G.talkWindow, G.talkGC, oldwidth + TALK_INSIDE_BORDER, ty(), talk_str.slice(c.point), oldlen - c.point);
            X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
          }
          X.XDrawString(G.dpy, G.talkWindow, G.talkGC, oldwidth + TALK_INSIDE_BORDER, ty(), new_str.slice(c.point), newlen - c.point);
          c.point++;
          T.talk_str = new_str;
          Talk_cursor(cursor_visible);
          break;
        }
      }
      X.XFlush(G.dpy);
      break;
    }
    default:
      break;
  }
  return result;
}

/** pastes text at the cursor (or replaces the line); returns the number of characters pasted */
export function Talk_paste(data: string | null, data_len: number, overwrite: boolean): number {
  const max_len = MAX_CHARS - 2;
  let char_width = X.XTextWidth(G.talkFont, T.talk_str, 1);
  const max_width = (TALK_WINDOW_WIDTH() - 2 * TALK_INSIDE_BORDER - 5) >>> 0;
  if (!data || data_len === 0 || data.length === 0) return 0;
  let str_len, talk_backup = '';
  if (overwrite) str_len = 0;
  else {
    str_len = T.talk_str.length;
    talk_backup = T.talk_str;
  }
  if (char_width === 0) char_width = 1;
  const fit = Math.trunc(max_width / char_width);
  let accept_len = fit - str_len + 1;
  // size_t arithmetic: accept_len + str_len is fit + 1 even when accept_len wrapped
  if (fit + 1 > max_len) accept_len = max_len - str_len;
  if (accept_len === 0) {
    X.XBell(G.dpy, 100);
    return 0;
  }
  const huge = accept_len < 0;
  if (!huge && data_len > accept_len) X.XBell(G.dpy, 100);
  else if (huge || data_len < accept_len) accept_len = data_len;
  let paste_buf = data.slice(0, accept_len);
  if (paste_buf[accept_len - 1] === '\n' || paste_buf[accept_len - 1] === '\r') {
    paste_buf = paste_buf.slice(0, accept_len - 1);
    accept_len--;
  }
  let pb = '';
  for (let i = 0; i < paste_buf.length; i++) {
    const u = paste_buf.charCodeAt(i) & 0xff;
    pb += u < 33 || (u > 126 && u < 161) ? ' ' : paste_buf[i];
  }
  paste_buf = pb;
  const c = T.cursor;
  let tmp_str, new_len;
  if (overwrite) {
    tmp_str = paste_buf.slice(0, accept_len);
    new_len = accept_len;
  } else {
    tmp_str = cut79(talk_backup.slice(0, c.point) + paste_buf + talk_backup.slice(c.point));
    new_len = str_len + accept_len;
  }
  const ty = G.talkFont.ascent + TALK_INSIDE_BORDER;
  if (overwrite) {
    X.XClearWindow(G.dpy, G.talkWindow);
    X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, TALK_INSIDE_BORDER, ty, tmp_str, accept_len);
  } else {
    if (G.selection.talk.state === SEL_EMPHASIZED) {
      G.selection.talk.state = SEL_SELECTED;
      Talk_refresh();
    }
    if (c.point < str_len) {
      X.XSetForeground(G.dpy, G.talkGC, G.colors[BLACK].pixel);
      X.XDrawString(G.dpy, G.talkWindow, G.talkGC, X.XTextWidth(G.talkFont, talk_backup, c.point) + TALK_INSIDE_BORDER, ty,
        talk_backup.slice(c.point), str_len - c.point);
      X.XSetForeground(G.dpy, G.talkGC, G.colors[WHITE].pixel);
    }
    X.XDrawString(G.dpy, G.talkWindow, G.talkGC, X.XTextWidth(G.talkFont, talk_backup, c.point) + TALK_INSIDE_BORDER, ty,
      tmp_str.slice(c.point), new_len - c.point);
  }
  T.talk_str = cut79(tmp_str);
  const cursor_visible = c.visible;
  Talk_cursor(false);
  if (overwrite) c.point = new_len;
  else c.point += accept_len;
  Talk_cursor(cursor_visible);
  return accept_len;
}

export function Talk_resize(): void {
  if (T.talk_created) X.XMoveResizeWindow(G.dpy, G.talkWindow, TALK_WINDOW_X, TALK_WINDOW_Y(), TALK_WINDOW_WIDTH(), TALK_WINDOW_HEIGHT());
}

function Text_width_to_pos(font: X.XFontStruct, text: string, len: number, width: number): number {
  let i;
  for (i = 0; i <= len; i++) if (X.XTextWidth(font, text, i) >= width) break;
  return i;
}

export function Talk_place_cursor(xbutton: XEvent, pending: boolean): number {
  const Button = xbutton.button;
  const sel = G.selection.talk;
  let x = xbutton.x;
  const y = xbutton.y;
  x -= TALK_INSIDE_BORDER + 1;
  let cursor_pos = Text_width_to_pos(G.talkFont, T.talk_str, T.talk_str.length, x) - 1;
  if (cursor_pos < 0 || x > (TALK_WINDOW_WIDTH() | 0) || y < 0 || y >= (TALK_WINDOW_HEIGHT() | 0)) {
    if (Button === 1 && pending) {
      if (cursor_pos < sel.x1) cursor_pos = 0;
      else {
        cursor_pos = T.talk_str.length;
        sel.incl_nl = true;
      }
    } else cursor_pos = 0;
  }
  if (cursor_pos > T.talk_str.length) {
    if (Button === 1) sel.incl_nl = true;
    cursor_pos = T.talk_str.length;
  }
  Talk_cursor(false);
  T.cursor.point = cursor_pos;
  Talk_cursor(true);
  return cursor_pos;
}

function Clear_talk_selection(): void {
  const t = G.selection.talk;
  t.x1 = t.x2 = 0;
  t.state = SEL_NONE;
  t.incl_nl = false;
}

function Clear_draw_selection(): void {
  const d = G.selection.draw;
  d.x1 = d.x2 = d.y1 = d.y2 = 0;
  d.state = SEL_NONE;
}

function Selection_set_state(): void {
  G.selection.draw.state = G.selection.len > 0 ? SEL_SELECTED : SEL_NONE;
}

export function Clear_selection(): void {
  if (G.clData.talking && G.selection.talk.state === SEL_EMPHASIZED) {
    G.selection.talk.state = SEL_SELECTED;
    Talk_refresh();
  }
  Clear_draw_selection();
  Clear_talk_selection();
  G.selection.txt = null;
  G.selection.txt_size = 0;
  G.selection.len = 0;
}

export function Talk_window_cut(xbutton: XEvent): void {
  const sel = G.selection;
  const ButtonState = xbutton.type;
  const Button = xbutton.button;
  let was_pending = false;
  if (sel.talk.state === SEL_PENDING && ButtonState === X.ButtonRelease && Button === X.Button1) was_pending = true;
  const cursor_pos = Talk_place_cursor(xbutton, was_pending);
  if (ButtonState === X.ButtonPress) {
    sel.talk.state = SEL_PENDING;
    Talk_refresh();
    sel.talk.x1 = cursor_pos;
    sel.talk.incl_nl = false;
  } else if (ButtonState === X.ButtonRelease) {
    if (sel.talk.state !== SEL_PENDING) return;
    sel.talk.x2 = cursor_pos;
    if (sel.talk.x1 === sel.talk.x2) {
      sel.talk.state = SEL_NONE;
      return;
    }
    Clear_draw_selection();
    sel.txt_size = MAX_MSGS * MSG_LEN;
    if (sel.talk.x1 > sel.talk.x2) [sel.talk.x1, sel.talk.x2] = [sel.talk.x2, sel.talk.x1];
    let tmp = T.talk_str.slice(sel.talk.x1, sel.talk.x2);
    if (sel.talk.incl_nl) {
      // strlcat with the size of the copy: the newline fits only if the copy was cut short
      if (tmp.length < sel.talk.x2 - sel.talk.x1) tmp += '\n';
      sel.talk.incl_nl = false;
    }
    sel.txt = tmp;
    sel.len = tmp.length;
    sel.talk.state = SEL_EMPHASIZED;
    sel.draw.state = SEL_NONE;
    Talk_refresh();
  }
}

export function Talk_cut_area_hit(xbutton: XEvent): boolean {
  const BORDER = 10;
  const SPACING = G.messageFont.ascent + G.messageFont.descent + 1;
  let y = xbutton.y - BORDER;
  if (y < 0) y = -1;
  else y = Math.trunc(y / SPACING);
  return y < G.maxMessages;
}

interface cut_position { x: number; y: number; pixel_len: number; str_index: number; x_off: number }

export function Talk_cut_from_messages(xbutton: XEvent): void {
  const BORDER = 10;
  const mf = G.messageFont;
  const SPACING = mf.ascent + mf.descent + 1;
  const sel = G.selection;
  if (G.TalkMsg[0].len === 0) {
    Selection_set_state();
    return;
  }
  const x = xbutton.x - BORDER;
  let y = xbutton.y - BORDER;
  if (y < 0) y = -1;
  else y = Math.trunc(y / SPACING);
  const place = (c: cut_position) => {
    if (c.y < 0) {
      c.x = -1;
      c.y = 0;
    } else if (c.y > T.last_msg_index) {
      c.x_off = 1;
      c.y = T.last_msg_index;
      c.x = 0;
    } else if (c.x < 0) c.x = -1;
  };
  if (xbutton.type === X.ButtonPress) {
    T.last_msg_index = 0;
    while (T.last_msg_index < G.maxMessages && G.TalkMsg[T.last_msg_index].len !== 0) T.last_msg_index++;
    T.last_msg_index--;
    T.c1 = { x, y, x_off: 0, str_index: 0, pixel_len: 0 };
    place(T.c1);
    sel.draw.state = SEL_PENDING;
    return;
  } else if (xbutton.type === X.ButtonRelease) {
    if (sel.draw.state !== SEL_PENDING) {
      Selection_set_state();
      return;
    }
    let c1 = T.c1;
    let c2: cut_position = { x, y, x_off: 0, str_index: 0, pixel_len: 0 };
    place(c2);
    if (c2.y < c1.y || (c2.y === c1.y && (c2.x_off - c1.x_off < 0 || (c2.x < c1.x && c2.x_off - c1.x_off === 0)))) {
      const backup = c1;
      c1 = c2;
      c2 = backup;
      T.c1 = c1;
    }
    if (c2.x === -1 && c1.y < c2.y) {
      c2.y -= 1;
      c2.x_off = 1;
      c2.x = 0;
    }
    let ptr = G.TalkMsg[c1.y];
    if ((c1.x > X.XTextWidth(mf, ptr.txt, ptr.len) || c1.x_off === 1) && c1.y < c2.y) {
      c1.x = 0;
      c1.y += 1;
    }
    if (c1.x === -1) c1.x = 0;
    c1.str_index = c1.x_off === 1 ? ptr.len - 1 : Text_width_to_pos(mf, ptr.txt, ptr.len, c1.x);
    ptr = G.TalkMsg[c2.y];
    c2.str_index = c2.x_off === 1 ? ptr.len - 1 : Text_width_to_pos(mf, ptr.txt, ptr.len, c2.x);
    if (c1.y === c2.y && (c1.str_index > c2.str_index || (c1.str_index === c2.str_index && c1.x_off === c2.x_off))) {
      Add_pending_messages();
      Selection_set_state();
      return;
    }
    if (c2.str_index === 0) {
      if (c1.y === c2.y) {
        Add_pending_messages();
        Selection_set_state();
        return;
      }
      c2.y--;
      c2.x_off = 1;
      c2.str_index = G.TalkMsg[c2.y].len - 1;
      if (c1.y === c2.y && c1.str_index >= c2.str_index && c1.x_off === 1) {
        Add_pending_messages();
        Selection_set_state();
        return;
      }
    } else if (c2.str_index === G.TalkMsg[c2.y].len) {
      c2.str_index = G.TalkMsg[c2.y].len - 1;
      c2.x_off = 0;
    } else if (c2.str_index > 0 && c2.x_off === 0) c2.str_index--;
    if (c1.str_index === G.TalkMsg[c1.y].len) c1.str_index = G.TalkMsg[c1.y].len - 1;
    sel.txt_size = MAX_MSGS * MSG_LEN;
    sel.draw.x1 = c1.str_index;
    sel.draw.x2 = c2.str_index;
    sel.draw.y1 = c1.y;
    sel.draw.y2 = c2.y;
    let current_line = sel.draw.y1;
    let cut_str = G.TalkMsg[current_line].txt.slice(0, MSG_LEN - 1);
    let cut_str_len = G.TalkMsg[current_line].len;
    current_line++;
    let txt;
    if (sel.draw.y1 === sel.draw.y2) {
      txt = cut_str.slice(sel.draw.x1, sel.draw.x2 + 1);
      if (c2.x_off === 1) txt += '\n';
    } else {
      txt = cut_str.slice(sel.draw.x1, cut_str_len) + '\n';
      for (let i = sel.draw.y1 + 1; i < sel.draw.y2; i++) {
        cut_str = G.TalkMsg[current_line].txt.slice(0, MSG_LEN - 1);
        cut_str_len = G.TalkMsg[current_line].len;
        current_line++;
        txt += cut_str + '\n';
      }
      cut_str = G.TalkMsg[current_line].txt.slice(0, MSG_LEN - 1);
      current_line++;
      txt += cut_str.slice(0, sel.draw.x2 + 1);
      if (c2.x_off === 1) txt += '\n';
    }
    sel.txt = txt.slice(0, sel.txt_size - 1);
    sel.len = sel.txt.length;
    sel.draw.state = SEL_EMPHASIZED;
    sel.talk.state = SEL_SELECTED;
    Talk_refresh();
    Clear_talk_selection();
    Add_pending_messages();
  }
}
