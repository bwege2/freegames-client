// al/gui.ts: Allegro 4.4's dialog manager (src/gui.c: init_dialog, update_dialog, shutdown_dialog,
// object_message, dialog_message, offer_focus, move_focus with its distance rules) and the helpers of
// src/guiproc.c that Liquid War uses (d_box_proc, gui_textout_ex, dotted_rect, _draw_scrollable_frame).
// Dialog procedures may wait (a held mouse button), so the engine is async. Liquid War runs without a
// joystick, so update_dialog's joystick part only sleeps (in real time, outside the game's clock).

import {
  type Bitmap, create_bitmap, DRAW_MODE_COPY_PATTERN, drawing_mode, hline, putpixel, rect, rectfill,
  set_clip_rect, solid_mode, vline,
} from './bitmap.ts';
import { font, text_height, text_length, textout_ex } from './font.ts';
import { KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_TAB, KEY_UP, keypressedRaw, ureadkey } from './keyboard.ts';
import { gui_mouse_b, gui_mouse_x, gui_mouse_y, gui_mouse_z } from './mouse.ts';
import { screenRef } from './screen.ts';
import { sys } from './sys.ts';

export const D_EXIT = 1, D_SELECTED = 2, D_GOTFOCUS = 4, D_GOTMOUSE = 8, D_HIDDEN = 16, D_DISABLED = 32,
  D_DIRTY = 64, D_INTERNAL = 128;
export const D_O_K = 0, D_CLOSE = 1, D_REDRAW = 2, D_REDRAWME = 4, D_WANTFOCUS = 8, D_USED_CHAR = 16,
  D_REDRAW_ALL = 32, D_DONTWANTMOUSE = 64;
export const MSG_START = 1, MSG_END = 2, MSG_DRAW = 3, MSG_CLICK = 4, MSG_DCLICK = 5, MSG_KEY = 6,
  MSG_CHAR = 7, MSG_UCHAR = 8, MSG_XCHAR = 9, MSG_WANTFOCUS = 10, MSG_GOTFOCUS = 11, MSG_LOSTFOCUS = 12,
  MSG_GOTMOUSE = 13, MSG_LOSTMOUSE = 14, MSG_IDLE = 15, MSG_RADIO = 16, MSG_WHEEL = 17, MSG_LPRESS = 18,
  MSG_LRELEASE = 19, MSG_MPRESS = 20, MSG_MRELEASE = 21, MSG_RPRESS = 22, MSG_RRELEASE = 23,
  MSG_WANTMOUSE = 24, MSG_USER = 25;

export const gui_fg_color = 255;
export const gui_mg_color = 8;
export const gui_bg_color = 0;
export const gui_font_baseline = 0;
const gui_mouse_focus = true;

export type DialogProc = (msg: number, d: Dialog, c: number) => number | Promise<number>;

export interface Dialog {
  proc: DialogProc | null;
  x: number;
  y: number;
  w: number;
  h: number;
  fg: number;
  bg: number;
  key: number;
  flags: number;
  d1: number;
  d2: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dp: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dp2: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dp3: any;
}

/** a zeroed DIALOG (memset 0) */
export function emptyDialog(): Dialog {
  return { proc: null, x: 0, y: 0, w: 0, h: 0, fg: 0, bg: 0, key: 0, flags: 0, d1: 0, d2: 0, dp: null, dp2: null, dp3: null };
}

export function dialogArray(n: number): Dialog[] {
  const a: Dialog[] = [];
  for (let i = 0; i < n; i++) a.push(emptyDialog());
  return a;
}

export interface DialogPlayer {
  obj: number;
  res: number;
  mouse_obj: number;
  focus_obj: number;
  joy_on: boolean;
  click_wait: boolean;
  mouse_ox: number;
  mouse_oy: number;
  mouse_oz: number;
  mouse_b: number;
  dialog: Dialog[];
}

const players: DialogPlayer[] = [];
let active_dialog: Dialog[] | null = null;

export function gui_get_screen(): Bitmap {
  return screenRef.screen;
}

export async function object_message(d: Dialog, msg: number, c: number): Promise<number> {
  if (msg === MSG_DRAW && d.flags & D_HIDDEN) return D_O_K;
  let ret = await d.proc!(msg, d, c);
  if (ret & D_REDRAWME) {
    d.flags |= D_DIRTY;
    ret &= ~D_REDRAWME;
  }
  return ret;
}

export async function dialog_message(dialog: Dialog[], msg: number, c: number, obj: { v: number } | null): Promise<number> {
  const force = msg === MSG_START || msg === MSG_END || msg >= MSG_USER;
  let res = D_O_K;
  for (let count = 0; dialog[count]!.proc; count++) {
    const d = dialog[count]!;
    if (force || !(d.flags & D_HIDDEN)) {
      const r = await object_message(d, msg, c);
      if (r !== D_O_K) {
        res |= r;
        if (obj) obj.v = count;
      }
      if (msg === MSG_IDLE && (d.flags & (D_DIRTY | D_HIDDEN)) === D_DIRTY) {
        d.flags &= ~D_DIRTY;
        await object_message(d, MSG_DRAW, 0);
      }
    }
  }
  return res;
}

export async function broadcast_dialog_message(msg: number, c: number): Promise<number> {
  if (active_dialog) return dialog_message(active_dialog, msg, c, { v: 0 });
  return D_O_K;
}

async function find_mouse_object(d: Dialog[]): Promise<number> {
  let mouse_object = -1;
  for (let c = 0; d[c]!.proc; c++) {
    const o = d[c]!;
    if (gui_mouse_x() >= o.x && gui_mouse_y() >= o.y && gui_mouse_x() < o.x + o.w && gui_mouse_y() < o.y + o.h &&
      !(o.flags & (D_HIDDEN | D_DISABLED))) {
      const res = await object_message(o, MSG_WANTMOUSE, 0);
      if (!(res & D_DONTWANTMOUSE)) mouse_object = c;
    }
  }
  return mouse_object;
}

export async function offer_focus(dialog: Dialog[], obj: number, focus: { v: number }, force: boolean): Promise<number> {
  let res = D_O_K;
  if (obj === focus.v || (obj >= 0 && dialog[obj]!.flags & (D_HIDDEN | D_DISABLED))) return D_O_K;
  if (obj >= 0) {
    res = await object_message(dialog[obj]!, MSG_WANTFOCUS, 0);
    if (res & D_WANTFOCUS) res ^= D_WANTFOCUS;
    else obj = -1;
  }
  if (obj >= 0 || force) {
    if (focus.v >= 0) {
      res |= await object_message(dialog[focus.v]!, MSG_LOSTFOCUS, 0);
      if (res & D_WANTFOCUS) {
        if (obj < 0) return D_O_K;
        res &= ~D_WANTFOCUS;
      }
      dialog[focus.v]!.flags &= ~D_GOTFOCUS;
      res |= await object_message(dialog[focus.v]!, MSG_DRAW, 0);
    }
    focus.v = obj;
    if (obj >= 0) {
      dialog[obj]!.flags |= D_GOTFOCUS;
      res |= await object_message(dialog[obj]!, MSG_GOTFOCUS, 0);
      res |= await object_message(dialog[obj]!, MSG_DRAW, 0);
    }
  }
  return res;
}

const DISTANCE_RATIO = 8;
const MAX_SIZE = 0x10000;
/** sizeof(DIALOG) on x86_64: cmp_tab compares the objects' addresses */
const SIZEOF_DIALOG = 72;

function min_dist(d1: Dialog, d2: Dialog, xAxis: boolean, bias: number): number {
  let x_left = d1.x - d2.x - d2.w + 1;
  let x_right = d2.x - d1.x - d1.w + 1;
  let y_top = d1.y - d2.y - d2.h + 1;
  let y_bottom = d2.y - d1.y - d1.h + 1;
  if (xAxis) {
    x_left -= bias;
    x_right += bias;
    y_top *= DISTANCE_RATIO;
    y_bottom *= DISTANCE_RATIO;
  } else {
    x_left *= DISTANCE_RATIO;
    x_right *= DISTANCE_RATIO;
    y_top -= bias;
    y_bottom += bias;
  }
  if (x_left > 0) {
    if (y_top > 0) return x_left + y_top;
    if (y_bottom > 0) return x_left + y_bottom;
    return x_left;
  } else if (x_right > 0) {
    if (y_top > 0) return x_right + y_top;
    if (y_bottom > 0) return x_right + y_bottom;
    return x_right;
  } else if (y_top > 0) return y_top;
  else if (y_bottom > 0) return y_bottom;
  return 0;
}

async function move_focus(d: Dialog[], ascii: number, scan: number, focus: { v: number }): Promise<number> {
  const SW = screenRef.screen.w;
  const SH = screenRef.screen.h;
  let cmp: (i1: number, i2: number) => number;
  switch (scan) {
    case KEY_TAB:
      cmp = ascii === 9
        ? (i1, i2) => {
          let r = (i2 - i1) * SIZEOF_DIALOG;
          if (r < 0) r += MAX_SIZE;
          return r;
        }
        : (i1, i2) => {
          let r = (i1 - i2) * SIZEOF_DIALOG;
          if (r < 0) r += MAX_SIZE;
          return r;
        };
      break;
    case KEY_RIGHT:
      cmp = (i1, i2) => {
        const d1 = d[i1]!, d2 = d[i2]!;
        return min_dist(d1, d2, true, d2.x < d1.x + d1.w ? SW : 0);
      };
      break;
    case KEY_LEFT:
      cmp = (i1, i2) => {
        const d1 = d[i1]!, d2 = d[i2]!;
        return min_dist(d1, d2, true, d2.x + d2.w > d1.x ? -SW : 0);
      };
      break;
    case KEY_DOWN:
      cmp = (i1, i2) => {
        const d1 = d[i1]!, d2 = d[i2]!;
        return min_dist(d1, d2, false, d2.y < d1.y + d1.h ? SH : 0);
      };
      break;
    case KEY_UP:
      cmp = (i1, i2) => {
        const d1 = d[i1]!, d2 = d[i2]!;
        return min_dist(d1, d2, false, d2.y + d2.h > d1.y ? -SH : 0);
      };
      break;
    default:
      return D_O_K;
  }
  const obj: { index: number; diff: number }[] = [];
  for (let c = 0; d[c]!.proc; c++) {
    if ((focus.v < 0 || c !== focus.v) && !(d[c]!.flags & (D_DISABLED | D_HIDDEN))) {
      obj.push({ index: c, diff: focus.v >= 0 ? cmp(focus.v, c) : c });
      if (obj.length >= 512) break;
    }
  }
  // glibc's qsort is a merge sort here: stable
  obj.sort((a, b) => a.diff - b.diff);
  let res = D_O_K;
  const fobj = focus.v;
  for (const o of obj) {
    res |= await offer_focus(d, o.index, focus, false);
    if (fobj !== focus.v) break;
  }
  return res;
}

// double clicks: dclick_check every 20 ms of the clock (the original's runs on Allegro's timer thread)
const DCLICK_START = 0, DCLICK_RELEASE = 1, DCLICK_AGAIN = 2, DCLICK_NOT = 3;
let dclick_status = DCLICK_NOT;
let dclick_time = 0;
let gui_install_count = 0;
function dclick_check(): void {
  if (dclick_status === DCLICK_START) {
    if (!require_mouse_b()) {
      dclick_status = DCLICK_RELEASE;
      dclick_time = 0;
      return;
    }
  } else if (dclick_status === DCLICK_RELEASE) {
    if (require_mouse_b()) {
      dclick_status = DCLICK_AGAIN;
      dclick_time = 0;
      return;
    }
  } else return;
  if (dclick_time++ > 10) dclick_status = DCLICK_NOT;
}
import { mouse } from './mouse.ts';
function require_mouse_b(): number {
  return mouse.b;
}

export async function init_dialog(dialog: Dialog[], focus_obj: number): Promise<DialogPlayer> {
  const player: DialogPlayer = {
    obj: -1, res: D_REDRAW, mouse_obj: -1, focus_obj: -1, joy_on: true, click_wait: false,
    mouse_ox: 0, mouse_oy: 0, mouse_oz: gui_mouse_z(), mouse_b: 0, dialog,
  };
  player.mouse_b = await gui_mouse_b();
  players.push(player);
  active_dialog = dialog;
  if (gui_install_count <= 0) {
    sys.installTimer(dclick_check, 20000);
    gui_install_count = 1;
  } else gui_install_count++;
  const gui_bmp = gui_get_screen();
  set_clip_rect(gui_bmp, 0, 0, gui_bmp.w - 1, gui_bmp.h - 1);
  gui_bmp.clip = true;
  const o = { v: player.obj };
  player.res |= await dialog_message(dialog, MSG_START, 0, o);
  player.obj = o.v;
  player.mouse_obj = await find_mouse_object(dialog);
  if (player.mouse_obj >= 0) dialog[player.mouse_obj]!.flags |= D_GOTMOUSE;
  for (let c = 0; dialog[c]!.proc; c++) dialog[c]!.flags &= ~D_GOTFOCUS;
  const c = focus_obj >= 0 ? focus_obj : player.mouse_obj;
  if (c >= 0 && (await object_message(dialog[c]!, MSG_WANTFOCUS, 0)) & D_WANTFOCUS) {
    dialog[c]!.flags |= D_GOTFOCUS;
    player.focus_obj = c;
  } else player.focus_obj = -1;
  return player;
}

async function check_for_redraw(player: DialogPlayer): Promise<void> {
  if (player.res & D_REDRAW_ALL) {
    for (const p of players) if (p !== players[players.length - 1]) await dialog_message(p.dialog, MSG_DRAW, 0, null);
    player.res &= ~D_REDRAW_ALL;
    player.res |= D_REDRAW;
  }
  if (player.res & D_REDRAW) {
    player.res ^= D_REDRAW;
    const o = { v: player.obj };
    player.res |= await dialog_message(player.dialog, MSG_DRAW, 0, o);
    player.obj = o.v;
  }
  for (let c = 0; player.dialog[c]!.proc; c++) {
    const d = player.dialog[c]!;
    if ((d.flags & (D_DIRTY | D_HIDDEN)) === D_DIRTY) {
      d.flags &= ~D_DIRTY;
      await message(player, c, MSG_DRAW, 0);
    }
  }
}

async function message(player: DialogPlayer, i: number, msg: number, c: number): Promise<void> {
  const r = await object_message(player.dialog[i]!, msg, c);
  if (r !== D_O_K) {
    player.res |= r;
    player.obj = i;
  }
}

export async function update_dialog(player: DialogPlayer): Promise<boolean> {
  if (player.res & D_CLOSE) return false;
  const focus = { v: player.focus_obj };
  const nowhere = { v: 0 };
  const done = (): boolean => {
    const ret = !(player.res & D_CLOSE);
    player.res &= ~D_CLOSE;
    return ret;
  };

  const new_mouse_b = await gui_mouse_b();
  if (new_mouse_b !== player.mouse_b) {
    focus.v = player.focus_obj;
    player.res |= await offer_focus(player.dialog, player.mouse_obj, focus, false);
    player.focus_obj = focus.v;
    if (player.mouse_obj >= 0) {
      if (new_mouse_b & 1 && !(player.mouse_b & 1)) await message(player, player.mouse_obj, MSG_LPRESS, new_mouse_b);
      if (!(new_mouse_b & 1) && player.mouse_b & 1) await message(player, player.mouse_obj, MSG_LRELEASE, new_mouse_b);
      if (new_mouse_b & 4 && !(player.mouse_b & 4)) await message(player, player.mouse_obj, MSG_MPRESS, new_mouse_b);
      if (!(new_mouse_b & 4) && player.mouse_b & 4) await message(player, player.mouse_obj, MSG_MRELEASE, new_mouse_b);
      if (new_mouse_b & 2 && !(player.mouse_b & 2)) await message(player, player.mouse_obj, MSG_RPRESS, new_mouse_b);
      if (!(new_mouse_b & 2) && player.mouse_b & 2) await message(player, player.mouse_obj, MSG_RRELEASE, new_mouse_b);
      player.mouse_b = new_mouse_b;
    } else player.res |= await dialog_message(player.dialog, MSG_IDLE, 0, nowhere);
  }

  if (player.click_wait) {
    if (Math.abs(player.mouse_ox - gui_mouse_x()) > 8 || Math.abs(player.mouse_oy - gui_mouse_y()) > 8) dclick_status = DCLICK_NOT;
    if (dclick_status !== DCLICK_AGAIN && dclick_status !== DCLICK_NOT) {
      player.res |= await dialog_message(player.dialog, MSG_IDLE, 0, nowhere);
      await check_for_redraw(player);
      return true;
    }
    player.click_wait = false;
    const m = player.dialog[player.mouse_obj];
    if (dclick_status === DCLICK_AGAIN && m && gui_mouse_x() >= m.x && gui_mouse_y() >= m.y &&
      gui_mouse_x() <= m.x + m.w && gui_mouse_y() <= m.y + m.h) {
      await message(player, player.mouse_obj, MSG_DCLICK, 0);
    }
    return done();
  }

  player.res &= ~D_USED_CHAR;

  if (player.res & D_WANTFOCUS) {
    player.res ^= D_WANTFOCUS;
    focus.v = player.focus_obj;
    player.res |= await offer_focus(player.dialog, player.obj, focus, false);
    player.focus_obj = focus.v;
  }

  const c0 = await find_mouse_object(player.dialog);
  if (c0 !== player.mouse_obj) {
    if (player.mouse_obj >= 0) {
      player.dialog[player.mouse_obj]!.flags &= ~D_GOTMOUSE;
      await message(player, player.mouse_obj, MSG_LOSTMOUSE, 0);
    }
    if (c0 >= 0) {
      player.dialog[c0]!.flags |= D_GOTMOUSE;
      await message(player, c0, MSG_GOTMOUSE, 0);
    }
    player.mouse_obj = c0;
    if (gui_mouse_focus && player.mouse_obj !== player.focus_obj) {
      focus.v = player.focus_obj;
      player.res |= await offer_focus(player.dialog, player.mouse_obj, focus, true);
      player.focus_obj = focus.v;
    }
  }

  if (new_mouse_b) {
    focus.v = player.focus_obj;
    player.res |= await offer_focus(player.dialog, player.mouse_obj, focus, false);
    player.focus_obj = focus.v;
    if (player.mouse_obj >= 0) {
      dclick_time = 0;
      dclick_status = DCLICK_START;
      player.mouse_ox = gui_mouse_x();
      player.mouse_oy = gui_mouse_y();
      await message(player, player.mouse_obj, MSG_CLICK, new_mouse_b);
      if (player.res === D_O_K) player.click_wait = true;
    } else player.res |= await dialog_message(player.dialog, MSG_IDLE, 0, nowhere);
  }

  const z = gui_mouse_z();
  if (z !== player.mouse_oz) {
    focus.v = player.focus_obj;
    player.res |= await offer_focus(player.dialog, player.mouse_obj, focus, false);
    player.focus_obj = focus.v;
    if (player.mouse_obj >= 0) await message(player, player.mouse_obj, MSG_WHEEL, z - player.mouse_oz);
    else player.res |= await dialog_message(player.dialog, MSG_IDLE, 0, nowhere);
    player.mouse_oz = z;
  }

  // no joystick: the first call only rests (real time) and turns joy_on off
  if (player.joy_on) player.joy_on = false;

  if (keypressedRaw()) {
    const { ascii: cascii, scan: cscan } = ureadkey();
    const ccombo = (cscan << 8) | (cascii <= 255 ? cascii : 0x5e);
    if (player.focus_obj >= 0) {
      await message(player, player.focus_obj, MSG_CHAR, ccombo);
      if (player.res & (D_USED_CHAR | D_CLOSE)) return done();
      await message(player, player.focus_obj, MSG_UCHAR, cascii);
      if (player.res & (D_USED_CHAR | D_CLOSE)) return done();
    }
    for (let c = 0; player.dialog[c]!.proc; c++) {
      const d = player.dialog[c]!;
      if (((cascii > 0 && cascii <= 255 && lower(d.key) === lower(cascii)) || (!cascii && d.key === cscan << 8)) &&
        !(d.flags & (D_HIDDEN | D_DISABLED))) {
        await message(player, c, MSG_KEY, ccombo);
        return done();
      }
    }
    for (let c = 0; player.dialog[c]!.proc; c++) {
      if (!(player.dialog[c]!.flags & (D_HIDDEN | D_DISABLED))) {
        await message(player, c, MSG_XCHAR, ccombo);
        if (player.res & D_USED_CHAR) return done();
      }
    }
    if ((cascii === 13 || cascii === 10 || cascii === 32) && player.focus_obj >= 0) {
      await message(player, player.focus_obj, MSG_KEY, ccombo);
      return done();
    }
    if (cascii === 27) {
      player.res |= D_CLOSE;
      player.obj = -1;
      return done();
    }
    focus.v = player.focus_obj;
    player.res |= await move_focus(player.dialog, cascii, cscan, focus);
    player.focus_obj = focus.v;
  }

  await check_for_redraw(player);
  const o = { v: player.obj };
  player.res |= await dialog_message(player.dialog, MSG_IDLE, 0, o);
  player.obj = o.v;
  return done();
}

function lower(c: number): number {
  return c >= 65 && c <= 90 ? c + 32 : c;
}

export async function shutdown_dialog(player: DialogPlayer): Promise<number> {
  const o = { v: player.obj };
  await dialog_message(player.dialog, MSG_END, 0, o);
  player.obj = o.v;
  gui_install_count--;
  if (gui_install_count <= 0) sys.removeTimer(dclick_check);
  if (player.mouse_obj >= 0) player.dialog[player.mouse_obj]!.flags &= ~D_GOTMOUSE;
  const i = players.indexOf(player);
  if (i >= 0) players.splice(i, 1);
  active_dialog = players.length ? players[players.length - 1]!.dialog : null;
  return player.obj;
}

export function find_dialog_focus(dialog: Dialog[]): number {
  for (let c = 0; dialog[c]!.proc; c++) if (dialog[c]!.flags & D_GOTFOCUS) return c;
  return -1;
}

// ---- guiproc.c ----

export function gui_textout_ex(bmp: Bitmap | null, s: string, x: number, y: number, color: number, bg: number, centre: boolean): number {
  let tmp = '';
  let hline_pos = -1;
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c === 0x26) {
      i++;
      c = i < s.length ? s.charCodeAt(i) : 0;
      if (c === 0x26) tmp += '&';
      else {
        hline_pos = tmp.length;
        i--;
      }
    } else tmp += String.fromCharCode(c);
  }
  const pix_len = text_length(font, tmp);
  if (centre) x -= Math.trunc(pix_len / 2);
  if (bmp) {
    textout_ex(bmp, font, tmp, x, y, color, bg);
    if (hline_pos >= 0) {
      const before = text_length(font, tmp.slice(0, hline_pos));
      const cw = text_length(font, tmp.charAt(hline_pos));
      hline(bmp, x + before, y + text_height(font) - gui_font_baseline, x + before + cw - 1, color);
    }
  }
  return pix_len;
}

export function gui_strlen(s: string): number {
  return gui_textout_ex(null, s, 0, 0, 0, 0, false);
}

export function dotted_rect(x1: number, y1: number, x2: number, y2: number, fg: number, bg: number): void {
  const gui_bmp = gui_get_screen();
  const x = (x1 + y1) & 1 ? 1 : 0;
  for (let c = x1; c <= x2; c++) putpixel(gui_bmp, c, y1, ((c + y1) & 1) === x ? fg : bg);
  for (let c = x1; c <= x2; c++) putpixel(gui_bmp, c, y2, ((c + y2) & 1) === x ? fg : bg);
  for (let c = y1 + 1; c < y2; c++) {
    putpixel(gui_bmp, x1, c, ((c + x1) & 1) === x ? fg : bg);
    putpixel(gui_bmp, x2, c, ((c + x2) & 1) === x ? fg : bg);
  }
}

export function _draw_scrollable_frame(d: Dialog, listsize: number, offset: number, height: number, fg_color: number, bg: number): void {
  const gui_bmp = gui_get_screen();
  rect(gui_bmp, d.x, d.y, d.x + d.w - 1, d.y + d.h - 1, fg_color);
  if (listsize > height) {
    vline(gui_bmp, d.x + d.w - 13, d.y + 1, d.y + d.h - 2, fg_color);
    if (d.flags & D_GOTFOCUS) {
      dotted_rect(d.x + 1, d.y + 1, d.x + d.w - 14, d.y + d.h - 2, fg_color, bg);
      dotted_rect(d.x + d.w - 12, d.y + 1, d.x + d.w - 2, d.y + d.h - 2, fg_color, bg);
    } else {
      rect(gui_bmp, d.x + 1, d.y + 1, d.x + d.w - 14, d.y + d.h - 2, bg);
      rect(gui_bmp, d.x + d.w - 12, d.y + 1, d.x + d.w - 2, d.y + d.h - 2, bg);
    }
    const pattern = create_bitmap(2, 2);
    const i = Math.trunc(((d.h - 5) * height + Math.trunc(listsize / 2)) / listsize);
    const xx = d.x + d.w - 11;
    let yy = d.y + 2;
    putpixel(pattern, 0, 1, bg);
    putpixel(pattern, 1, 0, bg);
    putpixel(pattern, 0, 0, fg_color);
    putpixel(pattern, 1, 1, fg_color);
    if (offset > 0) {
      const len = Math.trunc(((d.h - 5) * offset + Math.trunc(listsize / 2)) / listsize);
      rectfill(gui_bmp, xx, yy, xx + 8, yy + len, bg);
      yy += len;
    }
    if (yy + i < d.y + d.h - 3) {
      drawing_mode(DRAW_MODE_COPY_PATTERN, pattern, 0, 0);
      rectfill(gui_bmp, xx, yy, xx + 8, yy + i, 0);
      solid_mode();
      yy += i + 1;
      rectfill(gui_bmp, xx, yy, xx + 8, d.y + d.h - 3, bg);
    } else {
      drawing_mode(DRAW_MODE_COPY_PATTERN, pattern, 0, 0);
      rectfill(gui_bmp, xx, yy, xx + 8, d.y + d.h - 3, 0);
      solid_mode();
    }
  } else if (d.flags & D_GOTFOCUS) dotted_rect(d.x + 1, d.y + 1, d.x + d.w - 2, d.y + d.h - 2, fg_color, bg);
  else rect(gui_bmp, d.x + 1, d.y + 1, d.x + d.w - 2, d.y + d.h - 2, bg);
}

export function d_box_proc(msg: number, d: Dialog): number {
  if (msg === MSG_DRAW) {
    const fg = d.flags & D_DISABLED ? gui_mg_color : d.fg;
    const gui_bmp = gui_get_screen();
    rectfill(gui_bmp, d.x + 1, d.y + 1, d.x + d.w - 2, d.y + d.h - 2, d.bg);
    rect(gui_bmp, d.x, d.y, d.x + d.w - 1, d.y + d.h - 1, fg);
  }
  return D_O_K;
}
