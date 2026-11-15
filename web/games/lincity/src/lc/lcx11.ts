// lcx11.c: the X11 front end. Every drawing call writes the pixmap (pixmap.c), which is what the window
// shows; the X protocol calls themselves are gone. Events come from the platform as XEvents.
import { G, display } from './g.ts';
import { PX, pixmap_index, pixmap_getpixel, pixmap_hline, pixmap_vline, pixmap_fillbox, pixmap_putbox,
  icon_pixmap } from './pixmap.ts';
import { platform, KeyPress, ButtonPress, ButtonRelease, MotionNotify, Expose, ConfigureNotify, ShiftMask,
  ControlMask, Button2Mask, type XEv } from './platform.ts';
import { ExitProgram, toInt } from './c.ts';
import { fopen } from './stdio.ts';
import { PATHS } from './g.ts';
import * as C from './consts.ts';
import { cs_mouse_handler, drag_screen } from './mouse.ts';
import { resize_geometry } from './geometry.ts';
import { main_font } from './screen.ts';
import { lc_usleep } from './timer.ts';

export const WINWIDTH = 640;
export const WINHEIGHT = 480;

/** XK_ values HandleEvent looks at */
export const XK_Left = 0xff51, XK_Up = 0xff52, XK_Right = 0xff53, XK_Down = 0xff54;
export const XK_BackSpace = 0xff08, XK_Delete = 0xffff;

export const X: { open_font: Uint8Array } = { open_font: new Uint8Array(0) };

/** the colours the window has now (0..63 per component) */
export const palette = new Uint8Array(768);

export function setcustompalette(): void {
  const flag = new Int32Array(256);
  const pal = new Float64Array(768);
  const inf = fopen(PATHS.colour_pal_file, 'r');
  if (!inf) { HandleError("Can't find the colour pallet file", C.FATAL); return; }
  while (!inf.feof()) {
    const s = inf.fgets(99);
    if (s === null) break;
    const m = /^\s*([+-]?\d+)\s+([+-]?\d+)\s+([+-]?\d+)\s+([+-]?\d+)/.exec(s);
    if (m) {
      const n = parseInt(m[1], 10);
      pal[n * 3] = parseInt(m[2], 10);
      pal[n * 3 + 1] = parseInt(m[3], 10);
      pal[n * 3 + 2] = parseInt(m[4], 10);
      flag[n] = 1;
    }
  }
  for (let i = 0; i < 256; i++) {
    if (flag[i] === 0) HandleError("Can't continue", C.FATAL);
    // (unsigned char)((v * (1 - gamma)) + (64 * sin ((float) v * M_PI / 128)) * gamma), gamma 0 unless -w/-R/-G/-B
    const g = [G.gamma_correct_red, G.gamma_correct_green, G.gamma_correct_blue];
    for (let c = 0; c < 3; c++) {
      const v = pal[i * 3 + c];
      pal[i * 3 + c] = toInt((v * (1 - g[c])) + (64 * Math.sin(Math.fround(v) * Math.PI / 128)) * g[c]) & 0xff;
    }
  }
  do_setcustompalette(pal);
}

export function open_setcustompalette(inpal: ArrayLike<number>): void { do_setcustompalette(inpal); }

/** XColor's red/green/blue are unsigned shorts: values above 0xffff >> 10 wrap */
function do_setcustompalette(inpal: ArrayLike<number>): void {
  for (let n = 0; n < 768; n++) palette[n] = ((inpal[n] << 10) & 0xffff) >> 10;
  platform().setPalette(palette);
}

export function Fgl_setfontcolors(bg: number, fg: number): void {
  G.text_fg = fg;
  G.text_bg = bg;
}

export function Fgl_setfont(_fw: number, fh: number, fp: Uint8Array): void {
  X.open_font = fp;
  G.open_font_height = fh;
}

export function HandleError(description: string, degree: number): void {
  console.error(`An error has occurred.  The description is below...\n${description}`);
  if (degree === C.FATAL) throw new ExitProgram(-1);
}

export function Fgl_setpixel(x: number, y: number, col: number): void {
  if (G.clipping_flag) {
    if (x < G.xclip_x1 || x > G.xclip_x2 || y < G.xclip_y1 || y > G.xclip_y2) return;
  }
  col &= 0xff;
  PX.pixmap[pixmap_index(x, y)] = col;
}

export function Fgl_getpixel(x: number, y: number): number { return pixmap_getpixel(x, y); }

export function Fgl_hline(x1: number, y1: number, x2: number, col: number): void {
  col &= 0xff;
  pixmap_hline(x1, y1, x2, col);
}

/** vertical lines only */
export function Fgl_line(x1: number, y1: number, _dummy: number, y2: number, col: number): void {
  col &= 0xff;
  pixmap_vline(x1, y1, y2, col);
}

export function Fgl_write(x: number, y: number, s: string): void {
  for (let i = 0; i < s.length; i++) my_x_putchar(x + i * 8, y, s.charCodeAt(i) & 0xff);
}

export function open_write(x: number, y: number, s: string): void {
  for (let i = 0; i < s.length; i++) open_x_putchar(x + i * 8, y, s.charCodeAt(i) & 0xff);
}

export function my_x_putchar(xx: number, yy: number, c: number): void {
  for (let y = 0; y < 8; y++) {
    let b = main_font[c * 8 + y];
    for (let x = 0; x < 8; x++) {
      Fgl_setpixel(xx + x, yy + y, (b & 0x80) === 0 ? G.text_bg : G.text_fg);
      b <<= 1;
    }
  }
}

export function open_x_putchar(xx: number, yy: number, c: number): void {
  const f = X.open_font;
  for (let y = 0; y < G.open_font_height; y++) {
    let b = f[c * G.open_font_height + y];
    for (let x = 0; x < 8; x++) {
      Fgl_setpixel(xx + x, yy + y, (b & 0x80) === 0 ? G.text_bg : G.text_fg);
      b <<= 1;
    }
  }
}

export function Fgl_fillbox(x1: number, y1: number, w: number, h: number, col: number): void {
  if (G.clipping_flag) {
    if (x1 < G.xclip_x1) x1 = G.xclip_x1;
    if (x1 + w - 1 > G.xclip_x2) w = G.xclip_x2 - x1 + 1;
    if (y1 < G.xclip_y1) y1 = G.xclip_y1;
    if (y1 + h - 1 > G.xclip_y2) h = G.xclip_y2 - y1 + 1;
  }
  col &= 0xff;
  pixmap_fillbox(x1, y1, w, h, col);
}

const clamp = (x: number, low: number, high: number): number => (x < low ? low : x > high ? high : x);

/** Fgl_putbox_low for the window: the sub-image (src_x, src_y, w, h) of src (bpl wide) to (x1, y1) */
function Fgl_putbox_low(x1: number, y1: number, w: number, h: number, src: Uint8Array, bpl: number,
  src_x: number, src_y: number): void {
  pixmap_putbox(src, src_x + src_y * bpl, 0, 0, bpl, x1, y1, w, h);
}

export function Fgl_putbox(x: number, y: number, w: number, h: number, buf: Uint8Array): void {
  const c_x0 = G.clipping_flag ? G.xclip_x1 : 0;
  const c_x1 = G.clipping_flag ? G.xclip_x2 : display.winW - 1;
  const c_y0 = G.clipping_flag ? G.xclip_y1 : 0;
  const c_y1 = G.clipping_flag ? G.xclip_y2 : display.winH - 1;
  const x1 = clamp(x, c_x0, c_x1);
  const y1 = clamp(y, c_y0, c_y1);
  const x2 = clamp(x + w, c_x0, c_x1 + 1);
  const y2 = clamp(y + h, c_y0, c_y1 + 1);
  if (x2 > x1 && y2 > y1) Fgl_putbox_low(x1, y1, x2 - x1, y2 - y1, buf, w, x1 - x, y1 - y);
}

export function Fgl_getbox(x1: number, y1: number, w: number, h: number, buf: Uint8Array): void {
  let b = 0;
  for (let y = y1; y < y1 + h; y++) {
    for (let x = x1; x < x1 + w; x++) buf[b++] = Fgl_getpixel(x, y) & 0xff;
  }
}

export function HandleEvent(event: XEv): void {
  switch (event.type) {
    case KeyPress: {
      G.x_key_shifted = (event.state ?? 0) & ShiftMask;
      G.x_key_value = event.ch ?? 0;
      switch (event.keysym) {
        case XK_Left: G.x_key_value = 1; break;
        case XK_Down: G.x_key_value = 2; break;
        case XK_Up: G.x_key_value = 3; break;
        case XK_Right: G.x_key_value = 4; break;
        case XK_BackSpace:
        case XK_Delete: G.x_key_value = 127; break;
      }
      // x_key_value is an int holding buf[0], a (signed) char
      G.x_key_value = (G.x_key_value << 24) >> 24;
      break;
    }
    case MotionNotify:
      if ((event.state ?? 0) & Button2Mask) drag_screen();
      break;
    case ButtonPress: {
      G.cs_mouse_shifted = ((event.state ?? 0) & ShiftMask) !== 0 ? 1 : 0;
      switch (event.button) {
        case 1: G.mouse_button = C.LC_MOUSE_LEFTBUTTON | C.LC_MOUSE_PRESS; break;
        case 2: G.mouse_button = C.LC_MOUSE_MIDDLEBUTTON | C.LC_MOUSE_PRESS; break;
        case 3: G.mouse_button = C.LC_MOUSE_RIGHTBUTTON | C.LC_MOUSE_PRESS; break;
        case 4:
          G.x_key_shifted = (event.state ?? 0) & ShiftMask;
          G.x_key_value = ((event.state ?? 0) & ControlMask) ? 1 : 3;
          break;
        case 5:
          G.x_key_shifted = (event.state ?? 0) & ShiftMask;
          G.x_key_value = ((event.state ?? 0) & ControlMask) ? 4 : 2;
          break;
      }
      cs_mouse_handler(G.mouse_button, 0, 0);
      G.mouse_button = 0;
      break;
    }
    case ButtonRelease: {
      G.mouse_button = event.button ?? 0;
      switch (event.button) {
        case 1: G.mouse_button = C.LC_MOUSE_LEFTBUTTON | C.LC_MOUSE_RELEASE; break;
        case 2: G.mouse_button = C.LC_MOUSE_MIDDLEBUTTON | C.LC_MOUSE_RELEASE; break;
        case 3: G.mouse_button = C.LC_MOUSE_RIGHTBUTTON | C.LC_MOUSE_RELEASE; break;
      }
      cs_mouse_handler(G.mouse_button, 0, 0);
      G.mouse_button = 0;
      break;
    }
    case Expose:
      if (G.suppress_next_expose) {
        G.suppress_next_expose = 0;
        break;
      }
      // refresh_screen() copies the pixmap to the window: the page always shows the pixmap
      platform().dirty();
      break;
    case ConfigureNotify:
      resize_geometry(event.width ?? display.winW, event.height ?? display.winH);
      break;
  }
}

export function Fgl_enableclipping(): void { G.clipping_flag = 1; }
export function Fgl_setclippingwindow(x1: number, y1: number, x2: number, y2: number): void {
  G.xclip_x1 = x1;
  G.xclip_y1 = y1;
  G.xclip_x2 = x2;
  G.xclip_y2 = y2;
}
export function Fgl_disableclipping(): void { G.clipping_flag = 0; }

export function do_call_event(wait: number): void {
  const p = platform();
  if (p.pending()) {
    HandleEvent(p.nextEvent());
  } else if (wait) lc_usleep(1000);
  let [x, y] = p.pointer();
  if (G.pix_double) {
    x = toInt(x / 2);
    y = toInt(y / 2);
  } else {
    x -= G.borderx;
    y -= G.bordery;
  }
  if (x !== G.cs_mouse_x || y !== G.cs_mouse_y) cs_mouse_handler(0, x - G.cs_mouse_x, y - G.cs_mouse_y);
  p.dirty();
}

export function call_event(): void { do_call_event(0); }
export function call_wait_event(): void { do_call_event(1); }

export function lc_get_keystroke(): number {
  call_event();
  const q = G.x_key_value;
  G.x_key_value = 0;
  return q;
}

/** the X window's border (borderx, bordery: 0 unless -r) is not part of the pixmap */
export function draw_border(): void { /* nothing to draw without a border */ }

export function init_icon_pixmap(type: number): void { icon_pixmap[type] = 1; }

export function unlock_window_size(): void { /* the window manager's size hints */ }
