// dialogs.cpp of HyperRogue 13.1o: the dialog system (namespace dialog: items, layout, display, navigation) and
// the generic dialogs (numbers, booleans, colours, matrices, files, strings, confirmations). Stage 2, package U1.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The port: a dialog is built anew every frame (dialog_init, addItem..., dialog_display) as in C++. The dialogs
// that are objects (struct extdialog: number_dialog, bool_dialog, color_dialog, matrix_dialog, file_dialog,
// string_dialog) are pushed as a screen function carrying the object as `target` (screens.back().target_base()
// with dynamic_cast in C++: dialog_get_ne/get_di check `instanceof`). What C++ edits through a pointer or
// reference (ld& x, int& x, bool& b, string& s, color_t& col, transmatrix& T) is a Ref ({ v }): callers pass an
// object whose `v` reads and writes their variable.
// Names (PORTING.md): dialog::x -> dialog_x; overloads: dialog_editNumber (ld&) / dialog_editNumber_n (int&),
// dialog_init (no arguments) / dialog_init_t (title, ...); dialog::zoom::displayfr -> dialog_zoom_displayfr.
// Not here: parameter animations (anims::, CAP_ANIMATIONS: no animations of parameters in stage 2, so the
// formulas are never animations); the virtual keyboard is kept (onscreen_keyboard, off on the desktop).
import { G, type screen_t } from './globals.ts';
import { among, isize, callhooks, hr_exception, NotPorted, PPR } from './hyper.ts';
import { idiv, itrunc, type Ref } from './cpp.ts';
import { type flagtype } from './content.ts';
import { sm, gamescreen, emptyscreen, popScreen } from './graph.ts';
import { pushScreen } from './control.ts';
import { doexiton, handlePanning, get_direction_key, interpret_as_direction, is_joy_index, deck } from './control.ts';
import { displayfr as hr_displayfr, displayColorButton, textwidth, utfsize, utfsize_before, clearMessages, addMessage } from './basegraph.ts';
import { XLAT, XLATN } from './language.ts';
import { its, fts, format, itsh } from './hprint.ts';
import { exp_parser, hr_parse_exception, ilerp, lerp } from './util.ts';
import { S7, GDIM } from './classes.ts';
import { initquickqueue, quickqueue, curvepoint, queuecurve } from './drawing.ts';
import { atscreenpos, flat_model_enabler } from './hypgraph.ts';
import { type transmatrix, type hyperpoint, eupoint, point31, Hypc, Id, C0, eqmatrix, cspin, tmulh, tmul, TAU, degree, hpt } from './hyperpoint.ts';
import { spin } from './embeddings.ts';
import { part } from './colors.ts';
import { needConfirmationEvenIfSaved } from './quit.ts';
import { cfs } from './cfile.ts';
import {
  SDLK_RETURN, SDLK_ESCAPE, SDLK_BACKSPACE, SDLK_F1, SDLK_F2, SDLK_F3, SDLK_F4, SDLK_F5, SDLK_F6, SDLK_F7, SDLK_F8,
  SDLK_F9, SDLK_F10, SDLK_HOME, SDLK_PAGEDOWN, SDLK_PAGEUP, SDLK_UP, SDLK_DOWN, SDLK_LEFT, SDLK_RIGHT, SDLK_KP5,
  SDLK_KP_ENTER, PSEUDOKEY_SELECT, PSEUDOKEY_LIST_SLIDER, PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELDOWN,
  PSEUDOKEY_ONSCREEN_KEYBOARD,
} from './sdl.ts';

/** isize of a string (the port's strings are UTF-16: the code units; see dialog_displayLong) */
const slen = (s: string): number => s.length;

/** const char* COLORBAR = "###" */
export const COLORBAR = '###';

/** inline string ONOFF(bool b) (hprint.cpp) */
export function ONOFF(b: boolean): string { return b ? XLAT('ON') : XLAT('OFF'); }

/** #define IFM(x) (dialog::actual_display_keys()?(x):"") */
export function IFM(x: string): string { return dialog_actual_display_keys() ? x : ''; }

/** #define DKEY (get_direction_key(sym, uni)) */
const DKEY = (sym: number, uni: number): number => get_direction_key(sym, uni);
/** #define DIRECTIONKEY (interpret_as_direction(sym, uni) ? uni : 0) */
const DIRECTIONKEY = (sym: number, uni: number): number => interpret_as_direction(sym, uni) ? uni : 0;

/** static constexpr int DONT_SHOW = 16 */
export const dialog_DONT_SHOW = 16;

/** enum tDialogItem */
export const diTitle = 0, diItem = 1, diBreak = 2, diHelp = 3, diInfo = 4, diIntSlider = 5, diSlider = 6,
  diBigItem = 7, diKeyboard = 8, diCustom = 9, diColorItem = 10, diListStart = 11, diListEnd = 12, diMatrixItem = 13;

/** struct dialog::item */
export class dialog_item {
  type: number;
  body = '';
  value = '';
  key = 0;
  color: number; colorv: number; colork: number; colors: number; colorc: number;
  scale: number;
  param = 0;
  p1 = 0; p2 = 0; p3 = 0;
  position = 0;
  /** void *ptr (a matrix item's matrix) */
  ptr: Ref<transmatrix> | null = null;
  customfun: (() => void) | null = null;
  /** item::item(tDialogItem t = diBreak) */
  constructor(t = diBreak) {
    this.type = t;
    this.color = G.dialog_dialogcolor;
    this.colorc = G.dialog_dialogcolor_clicked;
    this.colors = G.dialog_dialogcolor_selected;
    this.colork = G.dialog_dialogcolor_key;
    this.colorv = G.dialog_dialogcolor_value;
    this.scale = 100;
  }
  clone(): dialog_item {
    const it = new dialog_item(this.type);
    Object.assign(it, this);
    return it;
  }
}

/** struct dialog::scaler */
export interface dialog_scaler {
  direct: (x: number) => number;
  inverse: (x: number) => number;
  positive: boolean; int_slider: boolean; zerify: boolean;
}

const identity_f = (x: number): number => x;

export const dialog_identity: dialog_scaler = { direct: identity_f, inverse: identity_f, positive: false, int_slider: true, zerify: true };
export const dialog_logarithmic: dialog_scaler = { direct: Math.log, inverse: Math.exp, positive: true, int_slider: false, zerify: false };
export const dialog_asinhic: dialog_scaler = { direct: Math.asinh, inverse: Math.sinh, positive: false, int_slider: false, zerify: false };
export const dialog_asinhic100: dialog_scaler = { direct: (x) => Math.asinh(x * 100), inverse: (x) => Math.sinh(x) / 100, positive: false, int_slider: false, zerify: false };
export const dialog_asinhic_big: dialog_scaler = { direct: (x) => Math.asinh(x * 1e15), inverse: (x) => Math.sinh(x) / 1e15, positive: false, int_slider: false, zerify: false };

/** struct dialog::extdialog: an extendable dialog (a screen object) */
export abstract class dialog_extdialog {
  title = '';
  help = '';
  dialogflags: flagtype = 0n;
  reaction: (() => void) | null = null;
  reaction_final: (() => void) | null = null;
  extra_options: (() => void) | null = null;
  abstract draw(): void;
  closed = false;
  /** void operator() () */
  call(): void { if (this.closed) this.popfinal(); else this.draw(); }
  /** extdialog::extdialog() */
  constructor() {
    this.closed = false;
    this.dialogflags = 0n;
    if (G.cmode & sm.SIDE) this.dialogflags |= sm.MAYDARK | sm.SIDE;
    this.reaction = null;
    this.reaction_final = null;
    this.extra_options = null;
  }
  /** Pop screen, then call the final reaction. A bit more complex because it eeds to backup reaction_final due
   *  to popScreen */
  popfinal(): void { const rf = this.reaction_final; this.reaction_final = null; popScreen(); if (rf) rf(); }
}

/** a screen entry for an extdialog (pushScreen(ne) in C++) */
function as_screen(d: dialog_extdialog | { call(): void }): screen_t {
  const f = (): void => d.call();
  return Object.assign(f, { target: d });
}

/** struct dialog::number_dialog */
export class dialog_number_dialog extends dialog_extdialog {
  editwhat: Ref<number> = { v: 0 };
  s = '';
  vmin = 0; vmax = 0; step = 0; dft = 0;
  sc: dialog_scaler = dialog_identity;
  intval: Ref<number> | null = null;
  intbuf = 0;
  animatable = false;
  boolval: Ref<boolean> | null = null;
  draw(): void { number_dialog_draw(this); }
  apply_edit(): void { number_dialog_apply_edit(this); }
  apply_slider(): void { number_dialog_apply_slider(this); }
  disp(x: number): string { return number_dialog_disp(this, x); }
  reset_str(): void { this.s = this.disp(this.editwhat.v); }
}

/** struct dialog::bool_dialog */
export class dialog_bool_dialog extends dialog_extdialog {
  editwhat: Ref<boolean> = { v: false };
  dft = false;
  switcher: () => void = () => { };
  draw(): void { bool_dialog_draw(this); }
}

const top_target = (): unknown => G.screens.length ? G.screens[G.screens.length - 1].target : undefined;

export function dialog_get_ne(): dialog_number_dialog {
  const ptr = top_target();
  if (!(ptr instanceof dialog_number_dialog)) throw new hr_exception('get_ne() called without number dialog');
  return ptr;
}

export function dialog_get_di(): dialog_extdialog {
  const ptr = top_target();
  if (!(ptr instanceof dialog_extdialog)) throw new hr_exception('get_di() called without extdialog');
  return ptr;
}

export function dialog_scaleLog(): void { dialog_get_ne().sc = dialog_logarithmic; }
export function dialog_scaleSinh(): void { dialog_get_ne().sc = dialog_asinhic; }
export function dialog_scaleSinh100(): void { dialog_get_ne().sc = dialog_asinhic100; }
export function dialog_scaleSinh_big(): void { dialog_get_ne().sc = dialog_asinhic_big; }

export function dialog_scale_given(v: number[]): void {
  dialog_get_ne().vmin = v[0];
  dialog_get_ne().vmax = v[v.length - 1];
  dialog_get_ne().sc = { ...dialog_identity };
  dialog_get_ne().sc.direct = (val: number): number => {
    let last = 0; let id = 0;
    for (const x of v) {
      if (val === x) return id;
      if (val < x) return id - 0.75 + 0.5 * ilerp(last, x, val);
      last = x; id++;
    }
    return (val / last) + id - 2;
  };
  dialog_get_ne().sc.inverse = (val: number): number => {
    if (val > isize(v) - 1) return (val - isize(v) + 2) * v[v.length - 1];
    if (val < 0) return v[0];
    const f = val - Math.floor(val);
    if (f < .25) return v[Math.floor(val)];
    if (f > .75) return v[Math.ceil(val)];
    return lerp(v[Math.floor(val)], v[Math.ceil(val)], (f - 0.25) * 2);
  };
}

/** pick the correct dialogcolor, based on whether mouse is over */
export function dialog_dialogcolor_over(b: boolean): number {
  if (!b) return G.dialog_dialogcolor;
  if (G.actonrelease) return G.dialog_dialogcolor_clicked;
  return G.dialog_dialogcolor_selected;
}

export function dialog_addBack(): void {
  dialog_addItem(XLAT('go back'),
    (G.cmode & sm.NUMBER) ? SDLK_RETURN :
    // ISWEB ? SDLK_BACKSPACE :
    SDLK_ESCAPE);
}

export function dialog_addHelp(): void {
  dialog_addItem(XLAT('help'), SDLK_F1);
}

// namespace zoom (CAP_MENUSCALING: the zoom of a pressed menu, mobile only)
const zoom = { zoomf: 1, shiftx: 0, shifty: 0, zoomoff: false };

function zoom_nozoom(): void {
  zoom.zoomf = 1; zoom.shiftx = 0; zoom.shifty = 0; zoom.zoomoff = false;
}

function zoom_initzoom(): void {
  zoom.zoomf = 3;
  zoom.shiftx = -2 * G.mousex;
  if (G.mousex < idiv(G.vid.xres, 6)) zoom.shiftx = 0;
  if (G.mousex > idiv(G.vid.xres * 5, 6)) zoom.shiftx = -2 * G.vid.xres;
  zoom.shifty = -2 * G.mousey;
  if (G.mousey < idiv(G.vid.yres, 6)) zoom.shifty = 0;
  if (G.mousey > idiv(G.vid.yres * 5, 6)) zoom.shifty = -2 * G.vid.yres;
}

function zoom_stopzoom(): void { zoom.zoomoff = true; }

export function dialog_zoom_displayfr(x: number, y: number, b: number, size: number, s: string, color: number, align: number): boolean {
  return hr_displayfr(x * zoom.zoomf + zoom.shiftx, y * zoom.zoomf + zoom.shifty, b, size * zoom.zoomf, s, color, align);
}

export function dialog_zoom_displayfr_highlight(x: number, y: number, b: number, size: number, s: string, color: number, align: number, hicolor = 0xFFFF00): boolean {
  const clicked = hr_displayfr(x * zoom.zoomf + zoom.shiftx, y * zoom.zoomf + zoom.shifty, b, size * zoom.zoomf, s, color, align);
  if (clicked) hr_displayfr(x * zoom.zoomf + zoom.shiftx, y * zoom.zoomf + zoom.shifty, b, size * zoom.zoomf, s, hicolor, align);
  return clicked;
}

/** #define displayfrZH dialog::zoom::displayfr_highlight */
export const displayfrZH = dialog_zoom_displayfr_highlight;

/** void handleZooming(SDL_Event &ev): CAP_MENUSCALING && CAP_SDL (the event's type: SDL_MOUSEBUTTONDOWN 0x401,
 *  SDL_MOUSEBUTTONUP 0x402) */
export function dialog_handleZooming(ev: { type: number }): void {
  if (zoom.zoomoff || !(G.cmode & sm.ZOOMABLE)) {
    zoom_nozoom(); return;
  }
  if (ev.type === 0x401) zoom_initzoom();
  if (ev.type === 0x402 && zoom.zoomf > 1) zoom_stopzoom();
}

export function dialog_lastItem(): dialog_item { return G.dialog_items[G.dialog_items.length - 1]; }

export function dialog_titleItem(): dialog_item { return G.dialog_items[0]; }

export function dialog_add_key_action(key: number, action: () => void): void {
  G.dialog_key_actions.set(key, action);
}

/** void add_key_action_adjust(key_type& key, const reaction_t& action): returns the adjusted key */
export function dialog_add_key_action_adjust(key: number, action: () => void): number {
  while (G.dialog_key_actions.has(key)) key++;
  dialog_add_key_action(key, action);
  return key;
}

export function dialog_extend(): void {
  G.dialog_items[G.dialog_items.length - 1].key = G.dialog_items[isize(G.dialog_items) - 2].key;
}

export function dialog_add_action(action: () => void): void {
  const it = dialog_lastItem();
  it.key = dialog_add_key_action_adjust(it.key, action);
}

export function dialog_add_action_push(action: screen_t): void { dialog_add_action(() => { pushScreen(action); }); }

export function dialog_add_action_push_clear(action: screen_t): void { dialog_add_action(() => { clearMessages(); pushScreen(action); }); }

export function dialog_handler(sym: number, uni: number): void {
  if (G.cmode & sm.PANNING) handlePanning(sym, uni);
  const k = { sym, uni };
  dialog_handleNavigation(k);
  if (doexiton(k.sym, k.uni) && !(G.cmode & sm.NO_EXIT)) popScreen();
}

export const dialog_first_list_fake_key = 10000;

/** void init() */
export function dialog_init(): void {
  G.dialog_list_size_min = G.dialog_list_size_max = 0;
  G.dialog_list_fake_key = dialog_first_list_fake_key;
  G.dialog_items.length = 0;
  G.dialog_key_actions.clear();
  G.keyhandler = dialog_handler;
}

export function dialog_keyname(k: number): string {
  if (k === 0) return '';
  if (k === SDLK_ESCAPE) return 'Esc';
  if (k === SDLK_F1) return 'F1';
  if (k === SDLK_F2) return 'F2';
  if (k === SDLK_F3) return 'F3';
  if (k === SDLK_F4) return 'F4';
  if (k === SDLK_F5) return 'F5';
  if (k === SDLK_F6) return 'F6';
  if (k === SDLK_F7) return 'F7';
  if (k === SDLK_F8) return 'F8';
  if (k === SDLK_F9) return 'F9';
  if (k === SDLK_F10) return 'F10';
  if (k >= 10000 && k < 10500) return '';
  if (k === SDLK_HOME) return 'Home';
  if (k === SDLK_BACKSPACE) return 'Backspace';
  if (k === SDLK_RETURN) return 'Enter';
  if (k === 32) return 'space';
  if (k >= 1 && k <= 26) { let s = 'Ctrl+'; s += String.fromCharCode(k + 64); return s; }
  if (k < 128) { let s = ''; s += String.fromCharCode(k); return s; }
  if (k === 508) return 'Alt+8';
  if (is_joy_index(k, 0)) return 'Ⓐ';
  if (is_joy_index(k, 1)) return 'Ⓑ';
  if (is_joy_index(k, 2)) return 'Ⓧ';
  if (is_joy_index(k, 3)) return 'Ⓨ';
  if (is_joy_index(k, 0)) return 'Ⓐ';
  if (is_joy_index(k, 9)) return 'Ⓛ';
  if (is_joy_index(k, 10)) return 'Ⓡ';

  return '?';
}

export function dialog_addSlider(d1: number, d2: number, d3: number, key: number): void {
  const it = new dialog_item(diSlider);
  it.key = key;
  it.param = (d2 - d1) / (d3 - d1);
  G.dialog_items.push(it);
}

export function dialog_addIntSlider(d1: number, d2: number, d3: number, key: number): void {
  const it = new dialog_item(diIntSlider);
  it.key = key;
  it.p1 = itrunc(d2 - d1);
  it.param = (d2 - d1) / (d3 - d1);
  it.p2 = (d3 - d1);
  G.dialog_items.push(it);
}

export function dialog_addSelItem(body: string, value: string, key: number): void {
  const it = new dialog_item(diItem);
  it.body = body;
  it.value = value;
  it.key = key;
  if (value === ONOFF(true)) it.colorv = G.dialog_dialogcolor_off;
  if (value === ONOFF(false)) it.colorv = G.dialog_dialogcolor_on;
  G.dialog_items.push(it);
}

export function dialog_addBoolItem(body: string, value: boolean, key: number): void {
  dialog_addSelItem(body, ONOFF(value), key);
}

export function dialog_displaycolor(col: number): number {
  const c = col >>> 8;
  if (!c) return 0x181818;
  return c;
}

export function dialog_addKeyboardItem(keys: string): void {
  const it = new dialog_item(diKeyboard);
  it.body = keys;
  it.scale = 150;
  G.dialog_items.push(it);
}

export function dialog_addCustom(size: number, custom: () => void): void {
  const it = new dialog_item(diCustom);
  it.scale = size;
  it.customfun = custom;
  G.dialog_items.push(it);
}

export function dialog_addColorItem(body: string, value: number, key: number): void {
  dialog_addSelItem(body, COLORBAR, key);
  const it = G.dialog_items[G.dialog_items.length - 1];
  it.type = diColorItem;
  it.colorv = dialog_displaycolor(value);
  it.param = value & 0xFF;
}

function as_degrees(T: transmatrix): number {
  const h = tmulh(T, point31(1, 0, 0));
  let alpha = Math.atan2(-h[1], h[0]);
  if (alpha === 0) alpha = 0;
  return alpha / degree;
}

export function dialog_addMatrixItem(body: string, value: Ref<transmatrix>, key: number, dim = GDIM()): void {
  dialog_addSelItem(body, COLORBAR, key);
  const it = G.dialog_items[G.dialog_items.length - 1];
  it.type = diMatrixItem;
  it.ptr = value;
  it.value = '';
  if (dim === 2) it.value = fts(as_degrees(value.v)) + '°';
  if (dim === 3) {
    for (let k = 0; k < 3; k++) {
      if (value.v[k][k] !== 1) continue;
      let i = (k + 1) % 3;
      let j = (i + 1) % 3;
      if (i > j) { const t = i; i = j; j = t; }
      let h: hyperpoint = [...Hypc]; h[i] = 1;
      h = tmulh(value.v, h);
      let alpha = Math.atan2(-h[j], h[i]);
      if (alpha === 0) alpha = 0;
      it.value = fts(alpha / degree) + '° ';
      it.value += String.fromCharCode('X'.charCodeAt(0) + i);
      it.value += String.fromCharCode('X'.charCodeAt(0) + j);
    }
    if (eqmatrix(value.v, Id)) it.value = 'Id';
  }
  it.p1 = dim;
}

/** void addHelp(string body) (the overload with a text) */
export function dialog_addHelp_s(body: string): void {
  const it = new dialog_item(diHelp);
  it.body = body;

  if (utf8_size(body) >= 500) it.scale = 70;

  G.dialog_items.push(it);
}

/** isize of a C++ string: its UTF-8 bytes */
function utf8_size(s: string): number {
  let n = 0;
  for (const c of s) { const u = c.codePointAt(0)!; n += u < 0x80 ? 1 : u < 0x800 ? 2 : u < 0x10000 ? 3 : 4; }
  return n;
}

export function dialog_addInfo(body: string, color = G.dialog_dialogcolor): void {
  const it = new dialog_item(diInfo);
  it.body = body;
  it.color = color;
  G.dialog_items.push(it);
}

export function dialog_addItem(body: string, key: number): void {
  const it = new dialog_item(diItem);
  it.body = body;
  it.key = key;
  G.dialog_items.push(it);
}

export function dialog_addBigItem(body: string, key: number): void {
  const it = new dialog_item(diBigItem);
  it.body = body;
  it.key = key;
  it.color = G.dialog_dialogcolor_big;
  it.scale = 150;
  G.dialog_items.push(it);
}

export function dialog_addBreak(val: number): number {
  const it = new dialog_item(diBreak);
  it.scale = val;
  G.dialog_items.push(it);
  return G.dialog_items.length - 1;
}

export function dialog_start_list(size_min: number, size_max: number, key_start = 0): void {
  const it = new dialog_item(diListStart);
  it.key = key_start;
  it.scale = 0;
  it.param = size_min;
  G.dialog_list_size_min = size_min;
  G.dialog_list_size_max = size_max;
  G.dialog_items.push(it);
}

export function dialog_end_list(): void {
  const it = new dialog_item(diListEnd);
  it.scale = 0;
  G.dialog_items.push(it);
}

export function dialog_addTitle(body: string, color: number, scale: number): void {
  const it = new dialog_item(diTitle);
  it.body = body;
  it.color = color;
  it.scale = scale;
  G.dialog_items.push(it);
}

/** void init(string title, color_t color IS(0xE8E8E8), int scale IS(150), int brk IS(60)) */
export function dialog_init_t(title: string, color = 0xE8E8E8, scale = 150, brk = 60): void {
  dialog_init();
  dialog_addTitle(title, color, scale);
  dialog_addBreak(brk);
}

/** int displayLong(string str, int siz, int y, bool measure). The C++ walks the UTF-8 bytes and skips the
 *  continuation bytes; the port walks the UTF-16 code units and skips the low surrogates (the same places) */
export function dialog_displayLong(str: string, siz: number, y: number, measure: boolean): number {

  let last = 0;
  let lastspace = 0;

  let xs: number, xo: number;
  if (G.current_display.sidescreen)
    xs = G.dialog_dwidth - G.vid.fsize * 2, xo = G.vid.yres + G.vid.fsize;
  else
    xs = idiv(G.vid.xres * 618, 1000), xo = idiv(G.vid.xres * 186, 1000);

  let last_i = 0;
  for (let i = 0; i <= slen(str); i++) {
    let ls = 0;
    const prev = last;
    if (str[i] === ' ') lastspace = i;
    const ch = i < str.length ? str.charCodeAt(i) : 0;
    if (ch >= 0xDC00 && ch < 0xE000) continue;
    if (i < slen(str)) {
      if (str[i] === ')') continue;
      if (str[i] === '）') continue;
    }
    if (i > 0) {
      const c = str[i - utfsize_before(str, i)];
      if (c === '(') continue;
      if (c === '（') continue;
    }
    if (textwidth(siz, str.substring(last, i)) > xs) {
      if (lastspace === last) ls = last_i, last = last_i;
      else ls = lastspace, last = ls + 1;
    }
    if (str[i] === '\n' || i === slen(str)) ls = i, last = i + 1;
    if (ls) {
      if (!measure) hr_displayfr(xo, y, 2, siz, str.substring(prev, ls), G.dialog_dialogcolor, 0);
      if (ls === prev) y += idiv(siz, 2);
      else y += siz;
      lastspace = last;
    }
    last_i = i;
  }

  y += idiv(siz, 2);
  return y;
}

export function dialog_is_highlight(I: dialog_item): boolean { return I.body === G.dialog_highlight_text && among(G.dialog_highlight_key, I.key, PSEUDOKEY_SELECT); }
export function dialog_set_highlight(I: dialog_item): void { G.dialog_highlight_text = I.body; G.dialog_highlight_key = I.key; }
export function dialog_find_highlight(s: string): void {
  // println(hlog, "highlight_text set to ", s);
  G.dialog_highlight_text = s; G.dialog_highlight_key = PSEUDOKEY_SELECT;
}

export function dialog_measure(): void {
  G.dialog_tothei = 0;
  G.dialog_dialogwidth = 0;
  G.dialog_innerwidth = 0;
  const items = G.dialog_items;
  const N = items.length;
  G.dialog_list_starts_at = G.dialog_list_ends_at = G.dialog_list_actual_size = 0;
  const dfsize = G.dialog_dfsize;

  const autoval = (G.cmode & sm.AUTO_VALUES) !== 0n;
  G.dialog_rightwidth = 0;
  if (!autoval) G.dialog_rightwidth = textwidth(dfsize, 'MMMMMMMM') + idiv(dfsize, 2);
  if (G.cmode & sm.DIALOG_WIDE)
    G.dialog_innerwidth = textwidth(dfsize, 'MMMMM') * 7;

  for (let i = 0; i < N; i++) {
    if (items[i].type === diListStart)
      G.dialog_list_starts_at = G.dialog_tothei;
    else if (items[i].type === diListEnd) {
      G.dialog_list_full_size = G.dialog_tothei - G.dialog_list_starts_at;
      G.dialog_list_actual_size = Math.min(idiv(G.dialog_odfspace * G.dialog_list_size_max, 100), Math.max(idiv(G.dialog_odfspace * G.dialog_list_size_min, 100), G.dialog_list_full_size));
      if (G.dialog_list_full_size < G.dialog_list_actual_size) G.dialog_list_full_size = G.dialog_list_actual_size;
      G.dialog_tothei = G.dialog_list_ends_at = G.dialog_list_starts_at + G.dialog_list_actual_size;
    }
    else if (items[i].type === diHelp)
      G.dialog_tothei += dialog_displayLong(items[i].body, idiv(dfsize * items[i].scale, 100), 0, true);
    else {
      G.dialog_tothei += idiv(G.dialog_dfspace * items[i].scale, 100);
      if (among(items[i].type, diItem, diColorItem))
        G.dialog_innerwidth = Math.max(G.dialog_innerwidth, textwidth(idiv(dfsize * items[i].scale, 100), items[i].body));
      if (among(items[i].type, diItem))
        G.dialog_rightwidth = Math.max(G.dialog_rightwidth, textwidth(idiv(dfsize * items[i].scale, 100), items[i].value) + dfsize);
      if (items[i].type === diTitle || items[i].type === diInfo || items[i].type === diBigItem)
        G.dialog_dialogwidth = Math.max(G.dialog_dialogwidth, idiv(textwidth(idiv(dfsize * items[i].scale, 100), items[i].body) * 10, 9));
    }
  }

  G.dialog_leftwidth = dialog_never_keys() ? 0 : textwidth(dfsize, 'MMMMM') + idiv(dfsize, 2);

  G.dialog_fwidth = G.dialog_innerwidth + G.dialog_leftwidth + G.dialog_rightwidth;
  if (G.dialog_list_actual_size) G.dialog_fwidth += dfsize;
  G.dialog_dialogwidth = Math.max(G.dialog_dialogwidth, G.dialog_fwidth);
  G.dialog_itemx = G.dialog_dcenter - idiv(G.dialog_fwidth, 2) + G.dialog_leftwidth;
  G.dialog_keyx = G.dialog_dcenter - idiv(G.dialog_fwidth, 2) + G.dialog_leftwidth - idiv(dfsize, 2);
  G.dialog_valuex = G.dialog_dcenter - idiv(G.dialog_fwidth, 2) + G.dialog_leftwidth + G.dialog_innerwidth + idiv(dfsize, 2);
}

export function dialog_queue_key(key: number): void { G.dialog_key_queue.push(key); }

export function dialog_uishape(): number {
  let a = S7();
  if (a < 3) a = 3;
  if (a > 36) a = 36;
  return a;
}

/** color_t addalpha(color_t c) (config.cpp) */
const addalpha = (c: number): number => ((c << 8) | 0xFF) >>> 0;

export function dialog_draw_list_slider(x: number, yt: number): void {
  const a = dialog_uishape();

  const fme = flat_model_enabler();
  try {
    initquickqueue();
    const ASP = atscreenpos(0, 0);

    const col = 0xFFFFFFFF;

    const siz = idiv(G.dialog_dfsize, 2);
    const si = siz / 2;

    const yb = yt + G.dialog_list_actual_size;

    curvepoint(eupoint(x - si, yt));
    for (let i = 0; i <= idiv(a, 2); i++)
      curvepoint(eupoint(x - si * Math.cos(i * TAU / a), yb + si * Math.sin(i * TAU / a)));
    for (let i = idiv(a + 1, 2); i <= a; i++)
      curvepoint(eupoint(x - si * Math.cos(i * TAU / a), yt + si * Math.sin(i * TAU / a)));
    queuecurve(ASP, col, 0x80, PPR.LINE);

    const yt1 = yt + idiv(G.dialog_list_actual_size * G.dialog_list_skip, G.dialog_list_full_size);
    const yb1 = yt + idiv(G.dialog_list_actual_size * (G.dialog_list_skip + G.dialog_list_actual_size), G.dialog_list_full_size);

    curvepoint(eupoint(x - siz, yt1));
    for (let i = 0; i <= idiv(a, 2); i++)
      curvepoint(eupoint(x - siz * Math.cos(i * TAU / a), yb1 + siz * Math.sin(i * TAU / a)));
    for (let i = idiv(a + 1, 2); i <= a; i++)
      curvepoint(eupoint(x - siz * Math.cos(i * TAU / a), yt1 + siz * Math.sin(i * TAU / a)));
    queuecurve(ASP, col, 0x80, PPR.LINE);

    quickqueue();
  }
  finally { fme.restore(); }
}

export function dialog_draw_slider(sl: number, sr: number, y: number, I: dialog_item): void {
  const sw = sr - sl;
  const mid = y;
  const dfsize = G.dialog_dfsize;

  if (!G.wmascii) {
    const a = dialog_uishape();

    const fme = flat_model_enabler();
    try {
      initquickqueue();
      const ASP = atscreenpos(0, 0);

      const col = addalpha(I.color);

      const siz = idiv(dfsize * I.scale, 150);
      const si = siz / 2;
      if (I.type === diIntSlider && I.p2 < sw / 4) {
        for (let a = 0; a <= I.p2; a++) {
          const x = sl + sw * a * 1. / I.p2;
          curvepoint(eupoint(x, y - si));
          curvepoint(eupoint(x, y + si));
          queuecurve(ASP, col, 0, PPR.LINE);
        }
      }

      curvepoint(eupoint(sl, y - si));
      for (let i = 0; i <= idiv(a, 2); i++)
        curvepoint(eupoint(sr + si * Math.sin(i * TAU / a), y - si * Math.cos(i * TAU / a)));
      for (let i = idiv(a + 1, 2); i <= a; i++)
        curvepoint(eupoint(sl + si * Math.sin(i * TAU / a), y - si * Math.cos(i * TAU / a)));
      queuecurve(ASP, col, 0x80, PPR.LINE);
      quickqueue();

      const x = sl + sw * I.param;
      if (x < sl - si) {
        curvepoint(eupoint(sl - si, y));
        curvepoint(eupoint(x, y));
        queuecurve(ASP, col, 0x80, PPR.LINE);
        quickqueue();
      }
      if (x > sr + si) {
        curvepoint(eupoint(sr + si, y));
        curvepoint(eupoint(x, y));
        queuecurve(ASP, col, 0x80, PPR.LINE);
        quickqueue();
      }
      for (let i = 0; i <= a; i++) curvepoint(eupoint(x + siz * Math.sin(i * TAU / a), y - siz * Math.cos(i * TAU / a)));
      queuecurve(ASP, col, col, PPR.LINE);
      quickqueue();
    }
    finally { fme.restore(); }
  }
  else if (I.type === diSlider) {
    hr_displayfr(sl, mid, 2, idiv(dfsize * I.scale, 100), '(', I.color, 16);
    hr_displayfr(itrunc(sl + sw * I.param), mid, 2, idiv(dfsize * I.scale, 100), '#', I.color, 8);
    hr_displayfr(sr, mid, 2, idiv(dfsize * I.scale, 100), ')', I.color, 0);
  }
  else {
    hr_displayfr(sl, mid, 2, idiv(dfsize * I.scale, 100), '{', I.color, 16);
    if (I.p2 < idiv(sw, 4)) for (let a = 0; a <= I.p2; a++) if (a !== I.p1)
      hr_displayfr(itrunc(sl + idiv(sw * a, I.p2)), mid, 2, idiv(dfsize * I.scale, 100), a === I.p1 ? '#' : '.', I.color, 8);
    hr_displayfr(itrunc(sl + sw * I.param), mid, 2, idiv(dfsize * I.scale, 100), '#', I.color, 8);
    hr_displayfr(sr, mid, 2, idiv(dfsize * I.scale, 100), '}', I.color, 0);
  }
}

/** void visualize_matrix(const trans23& T, ld x, ld y, ld r, int dim, ld tsize): T is the matrix (2D: get()) */
export function dialog_visualize_matrix(T: transmatrix, x: number, y: number, r: number, dim: number, tsize: number): void {
  const pts: hyperpoint[] = [];
  for (let a = 0; a < dim; a++) {
    const h: hyperpoint = [...C0()]; h[a] = r;
    pts.push(tmulh(T, h));
  }

  const fme = flat_model_enabler();
  try {
    initquickqueue();
    const ASP = atscreenpos(x, y);

    for (let i = 0; i <= 360; i++)
      curvepoint(eupoint(r * Math.sin(i * degree), r * Math.cos(i * degree)));
    queuecurve(ASP, 0xFFFFFFFF, 0x202020FF, PPR.LINE);

    const cols = [0xFF8080FF, 0x80FF80FF, 0x8080FFFF];
    for (let a = 0; a < dim; a++) {
      const pt = [...pts[a]]; pt[2] = 1; pt[3] = 1;
      curvepoint(eupoint(0, 0));
      curvepoint(pt);
      // queueline(V * hyperpoint(0,0,1,1), V * pt, cols[a], 0);
      queuecurve(ASP, cols[a], 0, PPR.LINE);
    }
    if (dim === 3) for (let a = 0; a < dim; a++) {
      const pt = pts[a]; const val = -pt[2] * tsize / r / 5;
      curvepoint(eupoint(pt[0], pt[1] + val));
      curvepoint(eupoint(pt[0] - val, pt[1] - val * Math.sqrt(3) / 2));
      curvepoint(eupoint(pt[0] + val, pt[1] - val * Math.sqrt(3) / 2));
      curvepoint(eupoint(pt[0], pt[1] + val));
      queuecurve(ASP, cols[a], (cols[a] & 0xFFFFFF80) >>> 0, PPR.LINE);
    }
    quickqueue();
  }
  finally { fme.restore(); }
}

export function dialog_draw_side_shade(): void {
  const steps = G.menu_darkening - G.darken;

  const col = ((G.backcolor << 8) | (255 - (255 >> steps))) >>> 0;

  if (G.svg_in || !(G.auraNOGL || G.vid.usingGL)) {
    const fme = flat_model_enabler();
    try {
      initquickqueue();
      curvepoint(eupoint(G.vid.xres - G.dialog_dwidth, -10));
      curvepoint(eupoint(G.vid.xres + 10, -10));
      curvepoint(eupoint(G.vid.xres + 10, G.vid.yres + 10));
      curvepoint(eupoint(G.vid.xres - G.dialog_dwidth, G.vid.yres + 10));
      curvepoint(eupoint(G.vid.xres - G.dialog_dwidth, -10));
      queuecurve(atscreenpos(0, 0), 0, col, PPR.LINE);
      quickqueue();
    }
    finally { fme.restore(); }
  }

  // CAP_GL: the GL shade (auravertices) is not reached (vid.usingGL stays false)
  else throw new NotPorted('draw_side_shade (GL)'); // STAGE2-STUB (GL)
}

/** dialog::actual_display_keys() */
export function dialog_actual_display_keys(): boolean {
  if (G.dialog_display_keys === 2) return true;
  if (G.dialog_display_keys === 1) return !G.mousing;
  return false;
}

/** dialog::never_keys(): ISMOBILE || among(display_keys, 0, 3) */
export function dialog_never_keys(): boolean {
  return among(G.dialog_display_keys, 0, 3);
}

export function dialog_display(): void {

  callhooks(G.hooks_display_dialog);
  if (G.just_refreshing === 1) return;
  const items = G.dialog_items;
  const N = items.length;
  const vid = G.vid, cd = G.current_display;
  G.dialog_dfsize = itrunc(vid.fsize * G.dialog_dialog_font_scale);
  // ISMOBILE || ISPANDORA: dfsize *= 3;
  G.dialog_dfspace = idiv(G.dialog_dfsize * 5, 4);
  G.dialog_odfspace = G.dialog_dfspace;

  G.dialog_dcenter = idiv(vid.xres, 2);
  G.dialog_dwidth = vid.xres;

  if (cd.sidescreen) {
    G.dialog_dwidth = vid.xres - vid.yres;
    G.dialog_dcenter = vid.xres - idiv(G.dialog_dwidth, 2);
  }
  else if (G.cmode & sm.DIALOG_OFFMAP) {
    G.dialog_dwidth = idiv(vid.xres, 3);
    G.dialog_dcenter = idiv(vid.xres * 5, 6);
  }

  dialog_measure();

  while (G.dialog_tothei > vid.yres - 5 * vid.fsize) {
    const adfsize = itrunc(G.dialog_dfsize * Math.sqrt((vid.yres - 5. * vid.fsize) / G.dialog_tothei));
    if (adfsize < G.dialog_dfsize - 1) G.dialog_dfsize = adfsize + 1;
    else G.dialog_dfsize--;
    G.dialog_odfspace = G.dialog_dfspace = idiv(G.dialog_dfsize * 5, 4);
    dialog_measure();
  }
  while (G.dialog_dialogwidth > G.dialog_dwidth) {
    const adfsize = itrunc(G.dialog_dfsize * Math.sqrt(vid.xres * 1. / G.dialog_dialogwidth));
    if (adfsize < G.dialog_dfsize - 1) G.dialog_dfsize = adfsize + 1;
    else G.dialog_dfsize--;
    // usually we want to keep dfspace, but with NARROW_LINES, just odfspace
    if (G.cmode & sm.NARROW_LINES)
      G.dialog_dfspace = idiv((G.dialog_dfsize + 3) * 5, 4);
    dialog_measure();
  }

  G.dialog_tothei = idiv(vid.yres - G.dialog_tothei, 2);
  let list_left = G.dialog_list_actual_size;
  let list_next_key = 0;
  if (!G.dialog_list_actual_size) {
    // if(list_skip) println(hlog, "list_skip reset");
    G.dialog_list_skip = 0;
  }

  if (cd.sidescreen && G.darken < G.menu_darkening) dialog_draw_side_shade();

  let inlist = false;
  let need_to_skip = 0;
  let list_more_skip = G.dialog_list_skip;
  const dfsize = (): number => G.dialog_dfsize;

  for (let i = 0; i < N; i++) {
    const I = items[i];

    if (I.type === diHelp) {
      G.dialog_tothei = dialog_displayLong(items[i].body, idiv(dfsize() * items[i].scale, 100), G.dialog_tothei, false);
      continue;
    }

    let size = idiv(G.dialog_dfspace * I.scale, 100);
    const dkb_backup = I.key; // dynamicval<int> dkb(I.key)
    try {
      let to_highlight = dialog_is_highlight(I);

      if (I.type === diListStart) {
        list_left = G.dialog_list_actual_size;
        inlist = true;
        list_next_key = I.key;
        G.dialog_list_starts_at = G.dialog_tothei;
        continue;
      }

      if (I.type === diListEnd) {
        G.dialog_tothei += list_left;
        inlist = false;
        G.dialog_list_ends_at = G.dialog_tothei;
        dialog_draw_list_slider(G.dialog_dcenter + idiv(G.dialog_fwidth, 2) - idiv(dfsize(), 2), G.dialog_list_starts_at);
        if (G.mousex >= G.dialog_dcenter + idiv(G.dialog_fwidth, 2) - dfsize() && G.mousey >= G.dialog_list_starts_at && G.mousey < G.dialog_list_ends_at)
          G.getcstat = PSEUDOKEY_LIST_SLIDER;
        if (list_left > 0) {
          G.dialog_list_skip -= list_left;
          G.dialog_list_skip -= list_more_skip;
          if (G.dialog_list_skip < 0) G.dialog_list_skip = 0;
        }
        continue;
      }

      if (inlist && list_more_skip > 0) {
        if (to_highlight) {
          G.dialog_list_skip -= list_more_skip;
          list_more_skip = 0;
        }
        else {
          list_more_skip -= size;
          if (list_more_skip < 0) { G.dialog_tothei -= list_more_skip; list_left += list_more_skip; list_more_skip = 0; }
          continue;
        }
      }

      if (inlist) {
        if (list_left < size) {
          G.dialog_tothei += list_left; size -= list_left; need_to_skip += size; list_left = 0;
          if (to_highlight) G.dialog_list_skip += need_to_skip;
          continue;
        }
        else list_left -= size;
        if (list_next_key) { if (G.dialog_key_actions.has(I.key)) G.dialog_key_actions.set(list_next_key, G.dialog_key_actions.get(I.key)!); I.key = list_next_key++; }
      }

      G.dialog_top = G.dialog_tothei;
      G.dialog_tothei += size;
      const top = G.dialog_top, tothei = G.dialog_tothei;
      const mid = idiv(top + tothei, 2);
      I.position = mid;
      if (I.type === diTitle || I.type === diInfo) {
        let xthis = (G.mousey >= top && G.mousey < tothei && I.key !== 0);
        if (G.cmode & sm.DIALOG_STRICT_X)
          xthis = xthis && (G.mousex >= G.dialog_dcenter - idiv(G.dialog_dialogwidth, 2) && G.mousex <= G.dialog_dcenter + idiv(G.dialog_dialogwidth, 2));
        hr_displayfr(G.dialog_dcenter, mid, 2, idiv(dfsize() * I.scale, 100), I.body, I.color, 8);
        if (xthis) G.getcstat = I.key;
      }
      else if (among(I.type, diItem, diBigItem, diColorItem, diMatrixItem)) {
        let xthis = (G.mousey >= top && G.mousey < tothei);
        if (G.cmode & sm.DIALOG_STRICT_X)
          xthis = xthis && (G.mousex >= G.dialog_dcenter - idiv(G.dialog_dialogwidth, 2) && G.mousex <= G.dialog_dcenter + idiv(G.dialog_dialogwidth, 2));
        // !ISMOBILE
        if (xthis && G.mousemoved) {
          dialog_set_highlight(I);
          G.dialog_highlight_key = dkb_backup;
          G.mousemoved = false;
          to_highlight = true;
        }
        if (to_highlight) {
          I.color = (xthis && G.mousepressed && G.actonrelease) ? I.colorc : I.colors;
        }

        if (I.type === diBigItem) {
          hr_displayfr(G.dialog_dcenter, mid, 2, idiv(dfsize() * I.scale, 100), I.body, I.color, 8);
        }
        else {
          if (dialog_actual_display_keys())
            hr_displayfr(G.dialog_keyx, mid, 2, idiv(dfsize() * I.scale, 100), dialog_keyname(I.key), I.colork, 16);
          hr_displayfr(G.dialog_itemx, mid, 2, idiv(dfsize() * I.scale, 100), I.body, I.color, 0);

          if (I.type === diColorItem && !G.wmascii) {
            const a = dialog_uishape();
            const fme = flat_model_enabler();
            try {
              initquickqueue();
              const col = addalpha(I.color);
              const sizf = idiv(dfsize() * I.scale, 150);
              const siz = sizf * Math.sqrt(0.15 + 0.85 * I.param / 255.);
              for (let i = 0; i <= a; i++) curvepoint(hpt(siz * Math.sin(i * TAU / a), -siz * Math.cos(i * TAU / a), 1, 1));
              queuecurve(atscreenpos(G.dialog_valuex + sizf, mid), col, ((I.colorv << 8) | 0xFF) >>> 0, PPR.LINE);
              quickqueue();
            }
            finally { fme.restore(); }
          }
          else {
            let siz = idiv(dfsize() * I.scale, 100);
            while (siz > 6 && textwidth(siz, I.value) + (I.type === diMatrixItem ? idiv(siz * 3, 2) : 0) >= vid.xres - G.dialog_valuex) siz--;
            hr_displayfr(G.dialog_valuex + (I.type === diMatrixItem ? idiv(siz * 3, 2) : 0), mid, 2, siz, I.value, I.colorv, 0);

            if (I.type === diMatrixItem) dialog_visualize_matrix(I.ptr!.v, G.dialog_valuex + idiv(siz, 2), mid, idiv(siz, 2), I.p1, vid.fsize);
          }
        }
        if (xthis) G.getcstat = I.key;
      }
      else if (among(I.type, diSlider, diIntSlider)) {
        const xthis = (G.mousey >= top && G.mousey < tothei);
        let sl: number, sr: number;
        if (cd.sidescreen)
          sl = vid.yres + vid.fsize * 2, sr = vid.xres - vid.fsize * 2;
        else
          sl = idiv(vid.xres, 4), sr = idiv(vid.xres * 3, 4);
        dialog_draw_slider(sl, sr, mid, I);
        if (xthis) G.getcstat = I.key, G.inslider = true, G.slider_x = G.mousex;
      }
      else if (I.type === diCustom) {
        I.customfun!();
      }
      else if (I.type === diKeyboard) {
        let len = 0;
        for (const c of I.body)
          if (c === ' ' || c === '\t') len += 3;
          else len++;
        let sl: number, sr: number;
        if (cd.sidescreen)
          sl = vid.yres + vid.fsize * 2, sr = vid.xres - vid.fsize * 2;
        else
          sl = idiv(vid.xres, 4), sr = idiv(vid.xres * 3, 4);
        let pos = 0;
        for (const c of I.body) {
          let s = '';
          s += c;
          let nlen = 1;
          if (c === ' ') s = 'SPACE', nlen = 3;
          if (c === '\b') s = '⌫', nlen = 1;
          if (c === '\r' || c === '\n') s = '⏎', nlen = 1;
          if (c === '\x01') s = '←', nlen = 1;
          if (c === '\x02') s = '→', nlen = 1;
          if (c === '\x03') s = 'π';
          if (c === '\t') s = 'CLEAR', nlen = 3;
          const left = sl + idiv((sr - sl) * pos, len);
          pos += nlen;
          const right = sl + idiv((sr - sl) * pos, len);
          const inside = (G.mousex >= left && G.mousex <= right && G.mousey >= top && G.mousey < tothei);
          const xpos = idiv(left + right, 2);
          const cc = c.charCodeAt(0);
          if (inside) {
            if (cc === 1) G.getcstat = SDLK_LEFT;
            else if (cc === 2) G.getcstat = SDLK_RIGHT;
            else if (cc === 3) {
              G.getcstat = PSEUDOKEY_ONSCREEN_KEYBOARD;
              G.dialog_keyboard_what = 'pi';
            }
            else if (cc >= 32) {
              G.getcstat = PSEUDOKEY_ONSCREEN_KEYBOARD;
              G.dialog_keyboard_what = ''; G.dialog_keyboard_what += c;
            }
            else G.getcstat = cc;
          }
          hr_displayfr(xpos, mid, 2, idiv(dfsize() * I.scale, 100), s, dialog_dialogcolor_over(inside), 8);
        }
      }
    }
    finally { I.key = dkb_backup; }
  }
}

function isitem(it: dialog_item): boolean {
  return among(it.type, diItem, diBigItem, diColorItem, diMatrixItem);
}

/** void handle_actions(int &sym, int &uni) */
export function dialog_handle_actions(k: { sym: number; uni: number }): void {
  const ka = G.dialog_key_actions;
  if (ka.has(k.uni)) {
    ka.get(k.uni)!();
    if (k.uni >= 32 && k.uni <= 127) G.ignore_textinput = true;
    k.sym = k.uni = 0;
    return;
  }
  if (ka.has(k.sym)) {
    if (k.sym >= 32 && k.sym <= 127) G.ignore_textinput = true;
    ka.get(k.sym)!();
    k.sym = k.uni = 0;
    return;
  }
}

/** void handleNavigation(int &sym, int &uni) */
export function dialog_handleNavigation(k: { sym: number; uni: number }): void {
  const items = G.dialog_items;
  if (k.sym === PSEUDOKEY_LIST_SLIDER) G.invslider = true;
  if (G.invslider) {
    k.uni = k.sym = 0;
    const max = G.dialog_list_full_size - G.dialog_list_actual_size;
    G.dialog_list_skip = idiv(max * (G.mousey - G.dialog_list_starts_at), G.dialog_list_actual_size);
    if (G.dialog_list_skip < 0) G.dialog_list_skip = 0;
    if (G.dialog_list_skip > max) G.dialog_list_skip = max;
    G.dialog_highlight_text = '//missing';
    return;
  }
  if (k.uni === 10 || k.uni === 13 || DIRECTIONKEY(k.sym, k.uni) === SDLK_KP5 || k.uni === 96 /* '`' */ || is_joy_index(k.sym, deck.enter) || is_joy_index(k.sym, deck.alt_enter)) {
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i]))
        if (dialog_is_highlight(items[i])) {
          k.uni = k.sym = items[i].key;
          dialog_handle_actions(k);
          return;
        }
  }
  if (k.sym === PSEUDOKEY_WHEELUP && G.dialog_list_actual_size) {
    k.sym = 0;
    G.dialog_list_skip -= 30;
    G.dialog_highlight_text = '//missing';
  }
  if (k.sym === PSEUDOKEY_WHEELDOWN && G.dialog_list_actual_size) {
    k.sym = 0;
    G.dialog_list_skip += 30;
    G.dialog_highlight_text = '//missing';
  }
  if (DKEY(k.sym, k.uni) === SDLK_PAGEDOWN || is_joy_index(k.sym, deck.key_pagedown)) {
    k.uni = k.sym = 0;
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        dialog_set_highlight(items[i]);
      }
  }
  if (DKEY(k.sym, k.uni) === SDLK_PAGEUP || is_joy_index(k.sym, deck.key_pageup)) {
    k.uni = k.sym = 0;
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        dialog_set_highlight(items[i]);
        break;
      }
  }
  if (DKEY(k.sym, k.uni) === SDLK_UP) {
    k.uni = k.sym = 0;
    let last: dialog_item | null = null;
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        last = items[i];
      }
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        if (dialog_is_highlight(items[i])) {
          dialog_set_highlight(last!);
          return;
        }
        else {
          last = items[i];
        }
      }
    if (last)
      dialog_set_highlight(last);
  }
  if (DKEY(k.sym, k.uni) === SDLK_DOWN) {
    k.uni = k.sym = 0;
    let state = 0;
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        if (state) { dialog_set_highlight(items[i]); return; }
        else if (dialog_is_highlight(items[i])) state = 1;
      }
    for (let i = 0; i < isize(items); i++)
      if (isitem(items[i])) {
        dialog_set_highlight(items[i]);
        break;
      }
  }
  dialog_handle_actions(k);
}

const colorhistory: number[] = [
  0x202020FF, 0x800000FF, 0x008000FF, 0x000080FF,
  0x404040FF, 0xC0C0C0FF, 0x804000FF, 0xC0C000FF,
  0x408040FF, 0xFFD500FF,
];
let lch = 0;

let colorp = 0;

let colorPointer: Ref<number> = { v: 0 };

/** struct color_dialog */
class dialog_color_dialog extends dialog_extdialog {
  draw(): void { color_dialog_draw(this); }
}

/** the byte p of an unsigned color, set to v (part(color, p) = v; also unsigned char* pts[colorp] += ...) */
function set_part(c: number, p: number, v: number): number {
  return ((c & ~(0xFF << (8 * p))) | ((v & 0xFF) << (8 * p))) >>> 0;
}

export function dialog_handleKeyColor(sym: number, uni: number, ne: dialog_color_dialog): void {
  const color = colorPointer;
  const shift = G.dialog_colorAlpha ? 0 : 8;

  if (uni >= 65 /* 'A' */ && uni <= 68 /* 'D' */) {
    let x = idiv((G.slider_x - (G.dialog_dcenter - idiv(G.dialog_dwidth, 4))) * 510, G.dialog_dwidth);
    if (x < 0) x = 0;
    if (x > 255) x = 255;
    color.v = set_part(color.v, uni - 65, x);
  }
  else if (uni === 32 || uni === 10 || uni === 13 || is_joy_index(sym, deck.enter) || is_joy_index(sym, deck.alt_enter)) {
    let inHistory = false;
    for (let i = 0; i < 10; i++) if (colorhistory[i] === ((color.v << shift) >>> 0))
      inHistory = true;
    if (!inHistory) { colorhistory[lch] = (color.v << shift) >>> 0; lch++; lch %= 10; }
    if (ne.reaction) ne.reaction();
    ne.popfinal();
  }
  else if (uni >= 48 && uni <= 57) {
    color.v = colorhistory[uni - 48] >>> shift;
  }
  else if (G.dialog_palette && uni >= 97 && uni < 97 + G.dialog_palette[0]) {
    color.v = G.dialog_palette[1 + uni - 97] >>> shift;
  }
  else if (DKEY(sym, uni) === SDLK_DOWN) {
    colorp = (colorp - 1) & 3;
  }
  else if (DKEY(sym, uni) === SDLK_UP) {
    colorp = (colorp + 1) & 3;
  }
  else if (DKEY(sym, uni) === SDLK_LEFT) {
    color.v = set_part(color.v, colorp, part(color.v, colorp) - (Math.abs(G.shiftmul) < .6 ? 1 : 17));
  }
  else if (DKEY(sym, uni) === SDLK_RIGHT) {
    color.v = set_part(color.v, colorp, part(color.v, colorp) + (Math.abs(G.shiftmul) < .6 ? 1 : 17));
  }
  else if (doexiton(sym, uni)) ne.popfinal();
}

function color_dialog_draw(self: dialog_color_dialog): void {
  const vid = G.vid;
  G.cmode = sm.NUMBER | self.dialogflags;
  if (G.cmode & sm.SIDE) gamescreen();
  else G.stillscreen = true, emptyscreen();

  G.dialog_dcenter = idiv(vid.xres, 2);
  G.dialog_dwidth = vid.xres;

  if (G.current_display.sidescreen) {
    G.dialog_dwidth = vid.xres - vid.yres;
    G.dialog_dcenter = vid.xres - idiv(G.dialog_dwidth, 2);
  }
  const dcenter = G.dialog_dcenter, dwidth = G.dialog_dwidth;

  const color = colorPointer.v;

  const ash = 8;

  for (let j = 0; j < 10; j++) {
    const x = dcenter + vid.fsize * 2 * (j - 5);
    const y = idiv(vid.yres, 2) - 5 * vid.fsize;

    let s0 = ''; s0 += String.fromCharCode(48 + j);

    vid.fsize *= 2;
    displayColorButton(x, y, s0, 48 + j, 0, 0, colorhistory[j] >>> ash);
    vid.fsize = idiv(vid.fsize, 2);
  }

  const palette = G.dialog_palette;
  if (palette) {
    const q = palette[0];
    for (let i = 0; i < q; i++) {
      const x = dcenter + vid.fsize * (2 * i - q);
      const y = idiv(vid.yres, 2) - 7 * vid.fsize;
      let s0 = ''; s0 += String.fromCharCode(97 + i);
      vid.fsize *= 2;
      displayColorButton(x, y, s0, 97 + i, 0, 0, palette[i + 1] >>> ash);
      vid.fsize = idiv(vid.fsize, 2);
    }
  }

  const it = new dialog_item(diSlider);

  for (let i = 0; i < 4; i++) {
    const y = idiv(vid.yres, 2) + (2 - i) * vid.fsize * 2;
    if (i === 3 && !G.dialog_colorAlpha) continue;
    const inn = 3 - i - (G.dialog_colorAlpha ? 0 : 1);

    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFFFF];
    it.color = colors[inn];
    it.param = part(color, i) / 255.;
    dialog_draw_slider(dcenter - idiv(dwidth, 4), dcenter + idiv(dwidth, 4), y, it);

    const col = ((i === colorp) && !G.mousing) ? G.dialog_dialogcolor_selected : G.dialog_dialogcolor;
    let rgt = ''; rgt += 'RGBA'[inn];
    displayColorButton(dcenter + idiv(dwidth, 4) + vid.fsize, y, rgt, 0, 0, 0, col);
    if (G.mousey >= y - vid.fsize && G.mousey < y + vid.fsize)
      G.getcstat = 65 + i, G.inslider = true, G.slider_x = G.mousex;
  }

  displayColorButton(dcenter, idiv(vid.yres, 2) + vid.fsize * 6, XLAT('select this color') + ' : ' + format(G.dialog_colorAlpha ? '%08X' : '%06X', color), 32, 8, 0, color >>> (G.dialog_colorAlpha ? ash : 0));

  if (self.extra_options) self.extra_options();

  G.keyhandler = (sym: number, uni: number) => { dialog_handleKeyColor(sym, uni, self); };
}

/** void openColorDialog(unsigned int& col, unsigned int *pal IS(palette)) */
export function dialog_openColorDialog(col: Ref<number>, pal: number[] | null = G.dialog_palette): void {
  const cd = new dialog_color_dialog();
  colorPointer = col; G.dialog_palette = pal;
  G.dialog_colorAlpha = true;
  pushScreen(as_screen(cd));
}

/** struct matrix_dialog */
export class dialog_matrix_dialog extends dialog_extdialog {
  edit_matrix: Ref<transmatrix> = { v: Id };
  dim = 2;
  draw(): void { matrix_dialog_draw(this); }
  large_viz(): void {
    dialog_addCustom(500, () => {
      const siz = G.dialog_dfsize * 5;
      const mid = idiv(G.dialog_top + G.dialog_tothei, 2);
      G.vid.linewidth *= 3;
      dialog_visualize_matrix(this.edit_matrix.v, G.dialog_dcenter, mid, idiv(siz, 2), this.dim, G.vid.fsize * 2);
      G.vid.linewidth /= 3;
    });
  }
}

const matrix_angle: Ref<number> = { v: 0 };
const matrix_formula: Ref<string> = { v: '' };

function matrix_dialog_draw(self: dialog_matrix_dialog): void {
  G.cmode = self.dialogflags;
  gamescreen();
  dialog_init_t(self.title);
  dialog_addHelp_s(self.help);
  self.large_viz();
  dialog_addBreak(100);
  dialog_addItem('reset', 'r'.charCodeAt(0));
  dialog_add_action(() => { self.edit_matrix.v = Id; });
  if (self.dim === 2) {
    matrix_angle.v = as_degrees(self.edit_matrix.v);
    dialog_addSelItem('enter angle', fts(matrix_angle.v) + '°', 'a'.charCodeAt(0));
    dialog_add_action(() => {
      dialog_editNumber(matrix_angle, -180, 180, 90, 0, self.title, self.help);
      const ne = dialog_get_ne();
      const re = self.reaction;
      ne.extra_options = () => { self.large_viz(); };
      ne.reaction = () => { self.edit_matrix.v = spin(matrix_angle.v * degree); if (re) re(); };
      ne.reaction_final = self.reaction;
      ne.animatable = false;
      ne.dialogflags |= self.dialogflags;
    });
  }
  if (self.dim === 3) {
    const cur = self.edit_matrix.v;
    const rot_but = (i: number, j: number, title: string, key: string): void => {
      dialog_addItem(title, key.charCodeAt(0));
      dialog_add_action(() => {
        const angle: Ref<number> = { v: 0 }; // static ld angle; angle = 0;
        dialog_editNumber(angle, -180, 180, 90, 0, title, XLAT('Angle to rotate by.'));
        const ne = dialog_get_ne();
        const re = self.reaction;
        ne.extra_options = () => { self.large_viz(); };
        ne.reaction = () => { self.edit_matrix.v = tmul(cspin(i, j, angle.v * degree), cur); if (re) re(); };
        ne.reaction_final = self.reaction;
        ne.animatable = false;
        ne.dialogflags |= self.dialogflags;
      });
    };
    rot_but(0, 2, 'rotate in XZ', 'x');
    rot_but(1, 2, 'rotate in YZ', 'y');
    rot_but(0, 1, 'rotate in XY', 'z');
  }

  // !ISMOBILE
  dialog_addBoolItem('mouse control', (self.dialogflags & sm.MOUSEAIM) !== 0n, 'm'.charCodeAt(0));
  dialog_add_action(() => { self.dialogflags ^= sm.MOUSEAIM; });
  if (self.dialogflags & sm.MOUSEAIM) {
    self.edit_matrix.v = tmul(cspin(0, 2, G.mouseaim_x), self.edit_matrix.v);
    self.edit_matrix.v = tmul(cspin(1, 2, G.mouseaim_y), self.edit_matrix.v);
    G.mouseaim_x = G.mouseaim_y = 0;
  }

  matrix_formula.v = '?';
  // anims::get_parameter_animation(anims::find_param(edit_matrix), formula): no parameter animations (stage 2)
  dialog_addSelItem('enter formula', matrix_formula.v, 'f'.charCodeAt(0));
  dialog_add_action(() => {
    if (matrix_formula.v === '?') matrix_formula.v = 'id';
    dialog_edit_string(matrix_formula, 'formula', XLAT('dxy(n) = rotate n degrees from x to y\n\nd-degree, r-radian, t-turn\n\nexample: dxy(30)*dyz(45)'));
    dialog_get_di().extra_options = () => { self.large_viz(); };
    dialog_get_di().reaction = () => {
      // *edit_matrix = parsematrix(formula) (exp_parser::parsematrix: not ported)
      throw new NotPorted('matrix_dialog: parsematrix'); // STAGE2-STUB
    };
    dialog_get_di().dialogflags |= self.dialogflags;
  });
  if (self.extra_options) self.extra_options();
  dialog_addBack();
  dialog_display();
}

export function dialog_editMatrix(T: Ref<transmatrix>, t: string, h: string, dim: number): void {
  const m = new dialog_matrix_dialog();
  m.edit_matrix = T;
  m.title = t;
  m.help = h;
  m.dim = dim;
  pushScreen(as_screen(m));
}

/** bool editingDetail(): whether the number dialog edits vid.highdetail or vid.middetail (C++ compares the
 *  pointers: the Refs of those two carry field: 'vid.highdetail' / 'vid.middetail') */
export function dialog_editingDetail(): boolean {
  const ptr = top_target();
  if (!(ptr instanceof dialog_number_dialog)) return false;
  const ne = dialog_get_ne();
  return (ne.editwhat as Ref<number> & { field?: string }).field === 'vid.highdetail' ||
    (ne.editwhat as Ref<number> & { field?: string }).field === 'vid.middetail';
}

function ldtoint(x: number): number {
  if (x > 0) return itrunc(x + .5);
  else return itrunc(x - .5);
}

function number_dialog_disp(self: dialog_number_dialog, x: number): string {
  if (self.dialogflags & sm.HEXEDIT) return '0x' + itsh(Number(BigInt.asUintN(64, BigInt(Math.trunc(x)))));
  if (self.intval) return its(ldtoint(x));
  return fts(x);
}

function number_dialog_apply_slider(ne: dialog_number_dialog): void {
  if (ne.intval) ne.intval.v = ldtoint(ne.editwhat.v);
  if (ne.reaction) ne.reaction();
  if (ne.intval) ne.editwhat.v = ne.intval.v;
  ne.reset_str();
  // CAP_ANIMATIONS: anims::deanimate(anims::find_param(ne.editwhat)) (no parameter animations)
}

export function dialog_use_hexeditor(): void {
  const ne = dialog_get_ne();
  ne.dialogflags |= sm.HEXEDIT;
  ne.reset_str();
}

function number_dialog_apply_edit(ne: dialog_number_dialog): void {
  try {
    const ep = new exp_parser();
    ep.s = ne.s;
    const x = ep.rparse();
    if (ne.sc.positive && x <= 0) return;
    ne.editwhat.v = x;
    if (ne.intval) ne.intval.v = ldtoint(ne.editwhat.v);
    // CAP_ANIMATIONS (U4: the parameters of config.cpp; the Ref is a config.ts pref when it is a parameter's)
    if (ne.animatable) {
      const r = ne.intval ? ne.intval : ne.editwhat;
      const p = r instanceof pref ? anims_find_param(r) : null;
      if (p) p.load_as_animation(ne.s);
    }
    if (ne.reaction) ne.reaction();
  }
  catch (e) {
    if (e instanceof hr_parse_exception) { }
    else if (e instanceof param_exception) { }
    else throw e;
  }
}

export function dialog_bound_low(val: number): void {
  const ne = dialog_get_ne();
  const r = ne.reaction;
  ne.reaction = () => {
    if (ne.editwhat.v < val) {
      ne.editwhat.v = val;
      if (ne.intval) ne.intval.v = ldtoint(ne.editwhat.v);
    }
    if (r) r();
  };
}

export function dialog_bound_up(val: number): void {
  const ne = dialog_get_ne();
  const r = ne.reaction;
  ne.reaction = () => {
    if (ne.editwhat.v > val) {
      ne.editwhat.v = val;
      if (ne.intval) ne.intval.v = ldtoint(ne.editwhat.v);
    }
    if (r) r();
  };
}

export function dialog_formula_keyboard(lr: boolean): void {
  dialog_addKeyboardItem('1234567890');
  dialog_addKeyboardItem('=+-*/^()\x03');
  dialog_addKeyboardItem('qwertyuiop');
  dialog_addKeyboardItem('asdfghjkl');
  dialog_addKeyboardItem('zxcvbnm,.\b');
  dialog_addKeyboardItem(lr ? ' \t\x01\x02' : ' \t');
}

export function dialog_setting_keyboard(): void {
  dialog_addKeyboardItem('1234567890');
  dialog_addKeyboardItem('QWERTYUIOP');
  dialog_addKeyboardItem('ASDFGHJKL');
  dialog_addKeyboardItem('ZXCVBNM_\b');
}

/** add_edit(dialog::onscreen_keyboard) (config.cpp's parameter "onscreen_keyboard", key F6; real since U4) */
function add_edit_onscreen_keyboard(): void {
  add_edit(P('dialog_onscreen_keyboard'));
}
import { add_edit, P, pref, anims_find_param, param_exception } from './config.ts';

/** struct number_dialog_help */
class number_dialog_help {
  ptr: dialog_number_dialog | null = null;
  call(): void {
    dialog_init_t('number dialog help');
    dialog_addBreak(100);
    dialog_addHelp_s(XLAT('You can enter formulas in this dialog.'));

    dialog_addBreak(150);

    dialog_addItem('functions and constants', 'f'.charCodeAt(0));
    dialog_add_action_push(() => {
      dialog_init_t('functions and constants');
      dialog_addHelp_s(XLAT('Functions available:'));
      dialog_addHelp_s(available_functions());
      dialog_addBreak(100);
      dialog_addHelp_s(XLAT('Constants available:'));
      dialog_addHelp_s(available_constants());
      dialog_addBreak(100);
      dialog_addBack();
      dialog_display();
    });

    dialog_addItem('variables', 'v'.charCodeAt(0));
    dialog_add_action_push(() => {
      dialog_init_t('variables');
      dialog_addHelp_s(available_variables());
      dialog_addBreak(100);
      dialog_addBack();
      dialog_display();
    });

    // CAP_ANIMATIONS: the parameter names (find_edit: config.cpp's parameters, package U4)
    dialog_addItem(XLAT('parameter names'), 'p'.charCodeAt(0));
    dialog_add_action_push(() => {
      dialog_init_t('parameter names');
      // for(auto& ap: anims::aps) dialog::addInfo(ap.par->name + " = " + ap.formula); (no animations)
      dialog_addBreak(100);
      dialog_addBack();
      dialog_display();
    });

    if (this.ptr && this.ptr.animatable) {
      dialog_addItem('animations', 'a'.charCodeAt(0));
      dialog_add_action_push(() => {
        dialog_init_t('Animations:');
        dialog_addHelp_s(XLAT('a..b -- animate linearly from a to b'));
        dialog_addHelp_s(XLAT('a..b..|c..d -- animate from a to b, then from c to d'));
        dialog_addHelp_s(XLAT('a../x..b../y -- change smoothly, x and y are derivatives'));
        dialog_addBreak(100);
        dialog_addBack();
        dialog_display();
      });
    }

    dialog_addBreak(150);
    dialog_addHelp_s(XLAT('These can be combined, e.g. %1', 'projection*sin(0..2*pi)'));
    dialog_display();
  }
}

/** util.cpp */
function available_functions(): string {
  return '(a)sin(h), (a)cos(h), (a)tan(h), exp, log, abs, re, im, conj, let(t=...,...t...), floor, frac, sqrt, to01, random, edge(7,3), regradius(7,3), ifp(a,v,w) [if positive]';
}
function available_constants(): string {
  return 'e, i, pi, tau, phi, deg [degree]';
}
function available_variables(): string {
  return 'Keyboard and mouse:\n\n' +
    'mousex, mousey, mousez, lshift, rshift, lctrl, rctrl, capslock, numlock, scrolllock, holdmouse, random, mousexs, mouseys\n\n' +
    'Time:\n\n' +
    's [seconds], ms [milliseconds], turncount, framecount, gametime\n\n' +
    'Other:\n\nshot [1 if taking screenshot/animation], illegal_moves';
}

export function dialog_parser_help(): void {
  const ndh = new number_dialog_help();
  ndh.ptr = null;
  dialog_addItem('help', SDLK_F1);
  dialog_add_action_push(as_screen(ndh));
}

/** sscanf(s, "%lf", &x): the longest prefix that is a number, if any */
function sscanf_lf(s: string, x: Ref<number>): void {
  const m = /^\s*[+-]?((\d+\.?\d*|\.\d+)([eE][+-]?\d+)?|inf(inity)?|nan)/i.exec(s);
  if (m) x.v = parseFloat(m[0].replace(/inf(inity)?/i, 'Infinity'));
}

function number_dialog_draw(self: dialog_number_dialog): void {
  const vid = G.vid;
  G.cmode = sm.NUMBER | self.dialogflags;
  gamescreen();
  dialog_init_t(self.title);
  dialog_addInfo(self.s);
  const ne = self;
  if (ne.intval && ne.sc.int_slider) {
    dialog_addIntSlider(itrunc(ne.sc.direct(ne.vmin)), ne.sc.direct(ne.editwhat.v), itrunc(ne.sc.direct(ne.vmax)), 500);
  }
  else
    dialog_addSlider(ne.sc.direct(ne.vmin), ne.sc.direct(ne.editwhat.v), ne.sc.direct(ne.vmax), 500);
  dialog_addBreak(100);

  if (!dialog_never_keys()) {
    if (dialog_actual_display_keys()) dialog_addHelp_s(XLAT('You can scroll with arrow keys -- Ctrl to fine-tune'));
    else dialog_addBreak(100);
    dialog_addBreak(100);
  }

  dialog_addBack();
  dialog_addSelItem(XLAT('default value'), self.disp(ne.dft), SDLK_HOME);
  add_edit_onscreen_keyboard();
  dialog_addItem('help', SDLK_F1);
  dialog_add_action(() => { const ndh = new number_dialog_help(); ndh.ptr = self; pushScreen(as_screen(ndh)); });

  dialog_addBreak(100);

  if (ne.help !== '') {
    dialog_addHelp_s(ne.help);
    // bool scal = !ISMOBILE && !ISPANDORA && isize(ne.help) > 160;
    // if(scal) lastItem().scale = 30;
  }

  if (self.extra_options) self.extra_options();

  if (G.dialog_onscreen_keyboard) {
    dialog_addBreak(100);
    dialog_formula_keyboard(false);
  }

  dialog_display();

  // SDLVER >= 2
  G.texthandler = (text: string) => {
    if (G.dialog_key_actions.has(text.charCodeAt(0))) return;
    ne.s += text;
    ne.apply_edit();
  };

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
    if (uni === 8 || uni === 9 || is_joy_index(sym, deck.key_pageup)) {
      ne.s = ne.s.substring(0, slen(ne.s) - utfsize_before(ne.s, slen(ne.s)));
      sscanf_lf(ne.s, ne.editwhat);
      self.apply_edit();
    }
    // !ISMOBILE
    else if (DKEY(sym, uni) === SDLK_RIGHT) {
      if (ne.intval && Math.abs(G.shiftmul) < .6)
        ne.editwhat.v++;
      else
        ne.editwhat.v = ne.sc.inverse(ne.sc.direct(ne.editwhat.v) + G.shiftmul * ne.step);
      if (Math.abs(ne.editwhat.v) < ne.step * 1e-6 && !ne.intval && ne.sc.zerify) ne.editwhat.v = 0;
      self.apply_slider();
    }
    else if (DKEY(sym, uni) === SDLK_LEFT) {
      if (ne.intval && Math.abs(G.shiftmul) < .6)
        ne.editwhat.v--;
      else
        ne.editwhat.v = ne.sc.inverse(ne.sc.direct(ne.editwhat.v) - G.shiftmul * ne.step);
      if (Math.abs(ne.editwhat.v) < ne.step * 1e-6 && !ne.intval && ne.sc.zerify) ne.editwhat.v = 0;
      self.apply_slider();
    }
    else if (sym === SDLK_HOME || is_joy_index(sym, deck.space)) {
      ne.editwhat.v = ne.dft;
      self.apply_slider();
    }
    else if (uni === 500) {
      let sl: number, sr: number;
      if (G.current_display.sidescreen)
        sl = vid.yres + vid.fsize * 2, sr = vid.xres - vid.fsize * 2;
      else
        sl = idiv(vid.xres, 4), sr = idiv(vid.xres * 3, 4);
      const d = (G.slider_x - sl + .0) / (sr - sl);
      let val = ne.sc.inverse(d * (ne.sc.direct(ne.vmax) - ne.sc.direct(ne.vmin)) + ne.sc.direct(ne.vmin));
      const nextval = ne.sc.inverse((G.mousex + 1. - sl) / (sr - sl) * (ne.sc.direct(ne.vmax) - ne.sc.direct(ne.vmin)) + ne.sc.direct(ne.vmin));
      let dif = Math.abs(val - nextval);
      if (dif > 1e-6) {
        let mul = 1;
        while (dif < 10) dif *= 10, mul *= 10;
        val *= mul;
        val = Math.floor(val + 0.5);
        val /= mul;
      }
      ne.editwhat.v = val;

      self.apply_slider();
    }
    else if (is_joy_index(sym, deck.show_keyboard)) {
      G.dialog_onscreen_keyboard = !G.dialog_onscreen_keyboard;
    }
    else if (uni === PSEUDOKEY_ONSCREEN_KEYBOARD) {
      ne.s += G.dialog_keyboard_what;
      self.apply_edit();
    }
    else if (uni >= 32 && uni < 128) {
      // SDLVER < 2 only: the text arrives as SDL_TEXTINPUT (texthandler)
    }
    else if (doexiton(sym, uni)) ne.popfinal();
  };
}

function bool_dialog_draw(self: dialog_bool_dialog): void {
  G.cmode = self.dialogflags;
  gamescreen();
  dialog_init_t(self.title);

  dialog_addBreak(100);

  const switch_to = (b: boolean): void => {
    const do_switch = (self.editwhat.v !== b);
    const sw = self.switcher;
    const re = self.reaction;
    popScreen();
    if (do_switch) { sw(); if (re) re(); }
  };

  dialog_addBoolItem(XLAT('disable'), false, '0'.charCodeAt(0));
  dialog_add_action(() => { switch_to(false); });

  dialog_addBoolItem(XLAT('enable'), true, '1'.charCodeAt(0));
  dialog_add_action(() => { switch_to(true); });

  dialog_addBoolItem(XLAT('switch'), !self.editwhat.v, 's'.charCodeAt(0));
  dialog_add_action(() => { switch_to(!self.editwhat.v); });

  dialog_addBoolItem(XLAT('set default'), self.dft, 'd'.charCodeAt(0));
  dialog_add_action(() => { switch_to(self.dft); });

  dialog_addBreak(100);

  if (self.help !== '') dialog_addHelp_s(self.help);

  if (self.extra_options) self.extra_options();

  dialog_display();
}

let nlpage = 1;
let wheelshift = 0;

/** int handlePage(int& nl, int& nlm, int perpage, int maxpage IS(2)): returns [ret, nl, nlm] */
export function dialog_handlePage(nl: number, perpage: number, maxpage = 2): { ret: number; nl: number; nlm: number } {
  let nlm = nl;
  const onl = nl;
  let ret = 0;
  if (nlpage) {
    nl = nlm = perpage;
    if (nlpage > maxpage) nlpage = maxpage;
    if (nlpage > 1) ret = nlm * (nlpage - 1);
    let w = wheelshift;
    let realw = 0;
    while (w < 0 && ret) {
      ret--; w++; realw--;
    }
    while (w > 0 && ret + perpage < onl) {
      ret++; w--; realw++;
    }
    wheelshift = realw;
    if (ret + nl > onl) nl = onl - ret;
  }
  return { ret, nl, nlm };
}

export const DB_BACK = 1n, DB_HELP = 2n, DB_EXIT = 4n, DB_PLAIN = 8n, DB_ACTIVATE = 16n, DB_EXPLAIN = 32n,
  DB_MINIMAL = 64n, DB_MINIMAL_OFF = 128n;

export function dialog_display_bottom_buttons(numpages: number, flags: bigint): void {

  interface button { key: number; text: string; col: number; width: number; digits: boolean }
  const buttons: button[] = [];
  const add_button = (k: number, t: string, c: number): void => {
    buttons.push({ key: k, text: t, col: c, width: 0, digits: false });
  };
  const dialogcolor = G.dialog_dialogcolor;
  const ch = (c: string): number => c.charCodeAt(0);

  if (numpages === 2) {
    add_button(ch('1'), XLAT('page') + ' 1', nlpage === 1 ? 0xD8D8C0 : dialogcolor);
    add_button(ch('2'), XLAT('page') + ' 2', nlpage === 2 ? 0xD8D8C0 : dialogcolor);
    add_button(ch('3'), XLAT('all'), nlpage === 0 ? 0xD8D8C0 : dialogcolor);
  }
  else if (numpages > 2) {
    add_button(ch('1'), XLAT('last page'), nlpage === 1 ? 0xD8D8C0 : dialogcolor);
    add_button(ch('2'), XLAT('next page'), nlpage === numpages ? 0xD8D8C0 : dialogcolor);
    add_button(ch('3'), nlpage ? its(nlpage) + '/' + its(numpages) : XLAT('all'), nlpage === 0 ? 0xD8D8C0 : dialogcolor);
    buttons[buttons.length - 1].digits = true;
  }
  else if (numpages === 0) {
    if (flags & DB_PLAIN) add_button(ch('1'), XLAT('plain'), dialogcolor);
    if (flags & DB_ACTIVATE) add_button(ch('2'), XLAT('touch to activate'), dialogcolor);
    if (flags & DB_EXPLAIN) add_button(ch('2'), XLAT('touch to explain'), dialogcolor);
  }
  if (flags & DB_MINIMAL) add_button(ch('4'), XLAT('minimal OFF'), dialogcolor);
  if (flags & DB_MINIMAL_OFF) add_button(ch('4'), XLAT('minimal ON'), dialogcolor);
  if (flags & DB_BACK) add_button(SDLK_ESCAPE, XLAT('go back'), dialogcolor);
  if (flags & DB_HELP) add_button(SDLK_F1, XLAT('help'), dialogcolor);
  if (flags & DB_EXIT) add_button(ch('0'), XLAT('exit mode'), dialogcolor);

  let total_w = 0;

  for (const b of buttons) {
    const t = dialog_keyname(b.key) + ' - ' + b.text;
    total_w += b.width = textwidth(G.vid.fsize, t);
  }

  const hole = idiv(G.vid.xres - total_w, isize(buttons) + 1);

  const i0 = G.vid.yres - G.vid.fsize;
  let x = 0;
  for (const b of buttons) {
    const t = IFM(dialog_keyname(b.key) + ' - ') + b.text;
    x += b.width + hole;
    if (displayfrZH(x, i0, 1, G.vid.fsize, t, b.col, 16))
      G.getcstat = b.key;
  }
}

export function dialog_handlePageButtons(sym: number, uni: number, dkeys: boolean, _numpages: number): boolean {
  if (uni === 49) nlpage = Math.max(nlpage - 1, 1), wheelshift = 0;
  else if (uni === 50) nlpage++, wheelshift = 0;
  else if (uni === 51) nlpage = 0, wheelshift = 0;
  else if (uni === PSEUDOKEY_WHEELUP) wheelshift--;
  else if (uni === PSEUDOKEY_WHEELDOWN) wheelshift++;
  else if (dkeys && DKEY(sym, uni) === SDLK_UP && nlpage > 1) nlpage--;
  else if (dkeys && DKEY(sym, uni) === SDLK_DOWN) nlpage++;
  else return false;
  return true;
}

/** number_dialog& editNumber(ld& x, ld vmin, ld vmax, ld step, ld dft, string title, string help) */
export function dialog_editNumber(x: Ref<number>, vmin: number, vmax: number, step: number, dft: number, title: string, help: string): dialog_number_dialog {
  const ne = new dialog_number_dialog();
  ne.editwhat = x;
  ne.vmin = vmin;
  ne.vmax = vmax;
  ne.step = step;
  ne.dft = dft;
  ne.title = title;
  ne.help = help;
  ne.sc = dialog_identity;
  ne.intval = null;
  ne.animatable = true;
  // CAP_ANIMATIONS: anims::get_parameter_animation(anims::find_param(&x), ne.s) (no parameter animations)
  ne.reset_str();
  pushScreen(as_screen(ne));
  return dialog_get_ne();
}

/** extdialog& editBool(bool& b, bool dft, string title, string help, const reaction_t& switcher) */
export function dialog_editBool(b: Ref<boolean>, dft: boolean, title: string, help: string, switcher: () => void): dialog_extdialog {
  const be = new dialog_bool_dialog();
  be.editwhat = b;
  be.dft = dft;
  be.title = title;
  be.help = help;
  be.switcher = switcher;
  pushScreen(as_screen(be));
  return dialog_get_di();
}

/** number_dialog& editNumber(int& x, int vmin, int vmax, ld step, int dft, string title, string help) */
export function dialog_editNumber_n(x: Ref<number>, vmin: number, vmax: number, step: number, dft: number, title: string, help: string): dialog_number_dialog {
  const tmp: Ref<number> = { v: 0 };
  const ne = dialog_editNumber(tmp, vmin, vmax, step, dft, title, help);
  ne.editwhat = { get v() { return ne.intbuf; }, set v(a: number) { ne.intbuf = a; } }; ne.intbuf = x.v; ne.intval = x; ne.s = its(x.v);
  // anims::get_parameter_animation(anims::find_param(&x), ne.s) (no parameter animations)
  return ne;
}

export function dialog_helpToEdit(x: Ref<number>, vmin: number, vmax: number, step: number, dft: number): void {
  popScreen();
  let title = 'help';
  if (G.help[0] === '@') {
    const iv = G.help.indexOf('\t');
    const id = G.help.indexOf('\n');
    title = G.help.substring(iv + 1, id);
    G.help = G.help.substring(id + 1);
  }
  dialog_editNumber_n(x, vmin, vmax, step, dft, title, G.help);
}

//-- choose file dialog--
// The files are cfs.files (the browser's: account storage, src/cfile.ts); the directories of the original are
// paths with '/', listed as the original lists a directory.

const CDIR = (): number => G.dialog_dialogcolor;
const CFILE = (): number => G.forecolor;

function filecmp(f1: [string, number], f2: [string, number]): boolean {
  if (f1[0] === '../') return true;
  if (f2[0] === '../') return false;
  if (f1[1] !== f2[1])
    return f1[1] === CDIR();
  return f1[0] < f2[0];
}

let filecaption = '', cfileext = '';
let cfileptr: Ref<string> = { v: '' };
const editext: Ref<boolean> = { v: false };

let file_action: () => boolean = () => false;

const search_mode: Ref<boolean> = { v: false };

/** struct file_dialog */
class dialog_file_dialog extends dialog_extdialog {
  draw(): void { file_dialog_draw(this); }
  handleKey(sym: number, uni: number): void { file_dialog_handleKey(this, sym, uni); }
}

/** opendir/readdir of `where` over cfs.files: the entries [name, is a directory] */
function list_directory(where: string): [string, boolean][] {
  const prefix = where === '.' ? '' : where.replace(/^\.\//, '');
  const res = new Map<string, boolean>();
  res.set('.', true); res.set('..', true);
  for (const name of cfs.files.keys()) {
    if (!name.startsWith(prefix)) continue;
    const rest = name.substring(prefix.length);
    const k = rest.indexOf('/');
    if (k < 0) res.set(rest, false);
    else res.set(rest.substring(0, k), true);
  }
  return [...res];
}

function file_dialog_draw(self: dialog_file_dialog): void {
  G.cmode = sm.NUMBER | self.dialogflags | sm.DIALOG_WIDE;
  gamescreen();
  dialog_init_t(filecaption);

  const cfile = cfileptr.v;
  dialog_addItem(cfile, 0);

  dialog_addBreak(100);

  const v = G.dialog_v;
  v.length = 0;

  let where = '.';
  let what = cfile;
  for (let i = 0; i < slen(cfile); i++)
    if (cfile[i] === '/' || cfile[i] === '\\') {
      where = cfile.substring(0, i + 1);
      what = cfile.substring(i + 1);
    }

  for (const [s, isdir] of list_directory(where)) {
    if (s !== '..' && s[0] === '.') { }
    else if (search_mode.v) {
      if (dialog_has_substring(dialog_human_simplify(s, true), dialog_human_simplify(what, true)))
        v.push([s, CFILE()]);
    }
    else if (slen(s) > 4 && s.substring(slen(s) - 4) === cfileext)
      v.push([s, CFILE()]);
    else if (isdir)
      v.push([s + '/', CDIR()]);
  }
  v.sort((a, b) => filecmp(a, b) ? -1 : filecmp(b, a) ? 1 : 0);

  dialog_start_list(2000, 2000);
  for (const vv of v) {
    dialog_addItem(vv[0], G.dialog_list_fake_key++);
    dialog_lastItem().color = vv[1];
    const vf = vv[0];
    const dir = vv[1] === CDIR();
    dialog_add_action(() => {
      let s = cfileptr.v;
      let where = '', what = s, whereparent = '../';
      let last = '';
      for (let i = 0; i < slen(s); i++)
        if (s[i] === '/') {
          if (i >= 2 && s.substring(i - 2, i + 1) === '../') {
            whereparent = s.substring(0, i + 1) + '../';
            last = '';
          }
          else {
            last = s.substring(slen(where), i + 1);
            whereparent = where;
          }
          where = s.substring(0, i + 1), what = s.substring(i + 1);
        }
      let str1: string;
      if (vf === '../') {
        s = whereparent + what;
        dialog_find_highlight(last);
        G.dialog_list_skip = 0;
      }
      else if (dir) {
        s = where + vf + what;
        dialog_find_highlight('../');
        G.dialog_list_skip = 0;
      }
      else {
        str1 = where + vf;
        if (s === str1) {
          cfileptr.v = s;
          const ac = file_action();
          if (ac) self.closed = true;
          s = cfileptr.v;
        }
        s = str1;
      }
      cfileptr.v = s;
    });
  }
  dialog_end_list();

  dialog_addBreak(100);

  dialog_addBoolItem_action('extension', editext, SDLK_F4);
  dialog_addBoolItem_action('search mode', search_mode, SDLK_F3);
  dialog_addItem('choose', SDLK_RETURN);
  dialog_addItem('cancel', SDLK_ESCAPE);
  dialog_display();

  // SDLVER >= 2
  G.texthandler = (text: string) => {
    const i = slen(cfileptr.v) - (editext.v ? 0 : 4);
    cfileptr.v = cfileptr.v.substring(0, i) + text + cfileptr.v.substring(i);
  };

  G.keyhandler = (sym: number, uni: number) => { self.handleKey(sym, uni); };
}

function file_dialog_handleKey(self: dialog_file_dialog, sym: number, uni: number): void {
  const k = { sym, uni };
  dialog_handleNavigation(k);
  sym = k.sym; uni = k.uni;
  const s = cfileptr.v;
  const i = slen(s) - (editext.v ? 0 : 4);

  if (sym === SDLK_ESCAPE || is_joy_index(sym, deck.escape)) {
    popScreen();
  }
  else if (sym === SDLK_RETURN || sym === SDLK_KP_ENTER || is_joy_index(sym, deck.enter)) {
    const ac = file_action();
    if (ac) self.closed = true;
  }
  else if ((sym === SDLK_BACKSPACE || is_joy_index(sym, deck.space) || is_joy_index(sym, deck.key_pageup)) && i) {
    const len = utfsize_before(s, i);
    cfileptr.v = s.substring(0, i - len) + s.substring(i);
    G.dialog_highlight_text = '//missing';
    G.dialog_list_skip = 0;
  }
  // SDLVER == 1: the typed characters (SDL2: texthandler)
  return;
}

/** void openFileDialog(string& filename, string fcap, string ext, bool_reaction_t action) */
export function dialog_openFileDialog(filename: Ref<string>, fcap: string, ext: string, action: () => boolean): void {
  const fd = new dialog_file_dialog();
  cfileptr = filename;
  filecaption = fcap;
  cfileext = ext;
  file_action = action;
  pushScreen(as_screen(fd));
}

// infix/v/vpush

export const dialog_foreign_letters = 'ÁÄÇÈÉÍÎÖÚÜßàáâãäçèéêìíîïòóôõöøùúüýąćČčĎďĘęĚěğİıŁłńňŘřŚśŞşŠšŤťůŹźŻżŽž';
export const dialog_latin_letters = 'AACEEIIOUUsAAAAACEEEIIIIOOOOOOUUUYACCCDDEEEEGIILLNNRRSSSSSSTTUZZZZZZ';

/** string human_simplify(const string &s, bool include_symbols). The C++ compares two UTF-8 bytes with the
 *  foreign letters (all of them 2 bytes); the port compares the character */
export function dialog_human_simplify(s: string, include_symbols: boolean): string {
  let t = '';
  for (let i = 0; i < slen(s); i++) {
    const c = s[i];
    const cc = s.charCodeAt(i);
    let tt = '';
    if (c >= 'a' && c <= 'z') tt += String.fromCharCode(cc - 32);
    else if (c >= 'A' && c <= 'Z') tt += c;
    else if (c === '@') tt += c;
    else if (include_symbols && cc > 0 && cc < 128) tt += c;

    if (tt === '') for (let k = 0; k < slen(dialog_latin_letters); k++) {
      if (s[i] === dialog_foreign_letters[k]) {
        if (dialog_latin_letters[k] === 's') t += 'SS';
        else tt += dialog_latin_letters[k];
      }
    }

    if (tt) t += tt;
  }
  return t;
}

export function dialog_hasInfix(s: string): boolean {
  if (G.dialog_infix === '') return true;
  return dialog_human_simplify(s, false).indexOf(G.dialog_infix) !== -1;
}

export function dialog_has_substring(s: string, needle: string): boolean {
  let spos = 0, npos = 0;
  while (true) {
    if (npos === slen(needle)) return true;
    if (spos === slen(s)) return false;
    if (s[spos++] === needle[npos]) npos++;
  }
}

export function dialog_editInfix(sym: number, uni: number): boolean {
  if (uni >= 65 && uni <= 90) G.dialog_infix += String.fromCharCode(uni);
  else if (uni >= 97 && uni <= 122) G.dialog_infix += String.fromCharCode(uni - 32);
  else if (G.dialog_infix !== '' && (uni === 8 || is_joy_index(sym, deck.space) || is_joy_index(sym, deck.key_pageup))) G.dialog_infix = G.dialog_infix.substring(0, slen(G.dialog_infix) - 1);
  else if (uni === PSEUDOKEY_ONSCREEN_KEYBOARD) {
    G.dialog_infix += G.dialog_keyboard_what;
  }
  else if (is_joy_index(sym, deck.show_keyboard)) {
    G.dialog_onscreen_keyboard = !G.dialog_onscreen_keyboard;
  }
  else if (G.dialog_infix !== '' && uni !== 0) G.dialog_infix = '';
  else return false;
  return true;
}

export function dialog_vpush(color: number, name: string): void {
  const s = XLATN(name);
  if (!dialog_hasInfix(s)) return;
  G.dialog_v.push([s, color]);
}

export function dialog_vpush2(color: number, name: string, extra: string): void {
  if (!dialog_hasInfix(extra)) return;
  G.dialog_v.push([name, color]);
}

export function dialog_editchecker(_sym: number, uni: number): string {
  if (uni >= 32 && uni < 127) return '' + String.fromCharCode(uni);
  return '';
}

/** struct string_dialog */
export class dialog_string_dialog extends dialog_extdialog {
  editpos = 0;
  edited_string: Ref<string> = { v: '' };
  view_edited_string(): string {
    let cs = this.edited_string.v;
    if (this.editpos < 0) this.editpos = 0;
    if (this.editpos > slen(cs)) this.editpos = slen(cs);
    cs = cs.substring(0, this.editpos) + '°' + cs.substring(this.editpos);
    return cs;
  }
  draw(): void { string_dialog_draw(this); }
  start_editing(s: Ref<string>): void {
    this.edited_string = s;
    this.editpos = slen(s.v);
  }
  handle_edit_string(sym: number, uni: number, checker: (sym: number, uni: number) => string = dialog_editchecker): boolean {
    const es = this.edited_string;
    if (DKEY(sym, uni) === SDLK_LEFT) this.editpos -= utfsize_before(es.v, this.editpos);
    else if (DKEY(sym, uni) === SDLK_RIGHT) this.editpos += utfsize(es.v, this.editpos);
    else if (uni === 9 || is_joy_index(sym, deck.key_t) || is_joy_index(sym, deck.key_pagedown)) {
      es.v = ''; this.editpos = 0;
    }
    else if (uni === 8 || is_joy_index(sym, deck.key_f) || is_joy_index(sym, deck.key_pageup)) {
      if (this.editpos === 0) return true;
      const len = utfsize_before(es.v, this.editpos);
      es.v = es.v.substring(0, this.editpos - len) + es.v.substring(this.editpos);
      this.editpos -= len;
      if (this.reaction) this.reaction();
    }
    else if (checker(sym, uni) !== '') { // (string u2: SDLVER == 1 inserts it)
      // SDLVER == 1: the characters are inserted here (SDL2: handle_textinput)
      if (this.reaction) this.reaction();
    }
    else return false;
    return true;
  }
  handle_textinput(): void {
    // SDLVER >= 2
    G.texthandler = (text: string) => {
      const es = this.edited_string;
      es.v = es.v.substring(0, this.editpos) + text + es.v.substring(this.editpos);
      this.editpos += slen(text);
      if (this.reaction) this.reaction();
    };
  }
}

function string_dialog_draw(self: dialog_string_dialog): void {
  G.cmode = sm.NUMBER | self.dialogflags;
  gamescreen();
  dialog_init_t(self.title);
  dialog_addInfo(self.view_edited_string());
  dialog_addBreak(100);
  dialog_formula_keyboard(true);
  dialog_addBreak(100);
  dialog_addBack();
  dialog_addBreak(100);

  if (self.help !== '') {
    dialog_addHelp_s(self.help);
  }

  if (self.extra_options) self.extra_options();

  dialog_display();

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    if (self.handle_edit_string(k.sym, k.uni)) { }
    else if (doexiton(k.sym, k.uni)) self.popfinal();
  };

  self.handle_textinput();
}

export function dialog_edit_string(s: Ref<string>, title: string, help: string): void {
  const ne = new dialog_string_dialog();
  ne.title = title;
  ne.help = help;
  ne.start_editing(s);
  pushScreen(as_screen(ne));
}

export function dialog_confirm_dialog(text: string, act: () => void): void {
  G.cmode = sm.DARKEN;
  gamescreen();
  dialog_addBreak(250);
  dialog_init_t(XLAT('WARNING'), 0xFF0000, 150, 100);
  dialog_addHelp_s(text);
  dialog_addItem(XLAT('YES'), 'y'.charCodeAt(0));
  const yes = (): void => { popScreen(); act(); };
  dialog_add_action(yes);
  dialog_add_key_action(SDLK_RETURN, yes);
  dialog_addItem(XLAT('NO'), 'n'.charCodeAt(0));
  dialog_add_action(() => { popScreen(); });
  dialog_display();
}

export function dialog_addBoolItem_action(s: string, b: Ref<boolean>, c: number): void {
  dialog_addBoolItem(s, b.v, c);
  dialog_add_action(() => { b.v = !b.v; });
}

export function dialog_addBoolItem_action_neg(s: string, b: Ref<boolean>, c: number): void {
  dialog_addBoolItem(s, !b.v, c);
  dialog_add_action(() => { b.v = !b.v; });
}

export function dialog_addItem_mouse(s: string, c: number): void {
  dialog_addBoolItem(s, G.mousekey === c, c);
}

export function dialog_cheat_forbidden(): boolean {
  if (G.tactic_on && !G.cheater) {
    addMessage(XLAT('Not available in the pure tactics mode!'));
    return true;
  }
  if (G.daily_on) {
    addMessage(XLAT('Not available in the daily challenge!'));
    return true;
  }
  return false;
}

export function dialog_add_action_confirmed(act: () => void): void {
  dialog_add_action(dialog_add_confirmation(act));
}

/** template<class T> void addBoolItem_choice(const string& s, T& b, T val, char c) */
export function dialog_addBoolItem_choice<T>(s: string, b: Ref<T>, val: T, c: number): void {
  dialog_addBoolItem(s, b.v === val, c);
  dialog_add_action(() => { b.v = val; });
}

export function dialog_cheat_if_confirmed(act: () => void): void {
  if (dialog_cheat_forbidden())
    return;
  if (needConfirmationEvenIfSaved()) pushScreen(() => { dialog_confirm_dialog(XLAT('This will enable the cheat mode, making this game ineligible for scoring. Are you sure?'), act); });
  else act();
}

export function dialog_do_if_confirmed(act: () => void): void {
  if (needConfirmationEvenIfSaved()) pushScreen(() => { dialog_confirm_dialog(XLAT('This will end your current game and start a new one. Are you sure?'), act); });
  else act();
}

export function dialog_push_confirm_dialog(act: () => void, s: string): void {
  pushScreen(() => { dialog_confirm_dialog(s, act); });
}

export function dialog_add_confirmation(act: () => void): () => void {
  return () => { dialog_do_if_confirmed(act); };
}
