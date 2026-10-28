// Xlib's C API as COW calls it (x11window.c, x11sprite.c, camera.c), over the X server of ../xlib/xlib.ts:
// the functions take and fill the C structs of the translated code (XEvent, XGCValues, XColor,
// XSizeHints, ...) and its pointers (Ptr), and behave as the client oracle's recording Xlib
// (re/netrek/oracle/client/xstub.c) does, which XServer reproduces call for call. Waiting (XNextEvent,
// XPeekEvent) goes through select() on the X connection, as libX11 and the oracle's lockstep wrappers do.
import { Ptr, $sarrOf } from './ptr.ts';
import { jstr } from './cstring.ts';
import { fsRead } from './fs.ts';
import { platform } from './platform.ts';
import { select } from './sys.ts';
import {
  XServer, type GC, type XEv, KeyPress, KeyRelease, ButtonPress, ButtonRelease, MotionNotify, EnterNotify, LeaveNotify,
  Expose, GraphicsExpose, NoExpose, MapNotify, ClientMessage, ShiftMask, ControlMask, QueuedAlready, XValue, YValue,
  WidthValue, HeightValue, XNegative, YNegative, DoRed, DoGreen, DoBlue, KeyPressMask, KeyReleaseMask,
  ButtonPressMask, ButtonReleaseMask, PointerMotionMask, ButtonMotionMask, Button1MotionMask, Button2MotionMask,
  Button3MotionMask, ExposureMask, StructureNotifyMask, EnterWindowMask, LeaveWindowMask, FocusChangeMask,
} from '../xlib/xlib.ts';

const X = (): XServer => platform().x;

// ---------------------------------------------------------------- C values

/** n bytes of a C string (or array) */
function bytesOf(p: Ptr | null, n: number): number[] {
  const out: number[] = [];
  if (!p) return out;
  for (let i = 0; i < n; i++) out.push(p.a[p.o + i] & 255);
  return out;
}

/** a NUL-terminated C string's bytes */
function cbytes(p: Ptr | null): number[] {
  const out: number[] = [];
  if (!p) return out;
  for (let i = p.o; ; i++) {
    const c = p.a[i] & 255;
    if (!c) break;
    out.push(c);
  }
  return out;
}

/** *p = v */
function out(p: Ptr | null, v: any): void {
  if (p) p.a[p.o] = v;
}

/** the i-th element of a C array of structs (the pointer is its first element) */
function elem(p: any, i: number): any {
  return i === 0 ? p : p.$a[p.$i + i];
}

/** a C unsigned long (pixels, masks) as a number of its low 32 bits */
const ul32 = (v: number) => Number(BigInt.asUintN(32, BigInt(Math.trunc(v))));

// ---------------------------------------------------------------- the display

let display: any = null;
let screen: any = null;
let visual: any = null;
let defaultGCobj: GC | null = null;

/** a new display for a new run of COW */
export function resetX11(): void {
  display = null;
  screen = null;
  visual = null;
  defaultGCobj = null;
}

export function XOpenDisplay(_name: Ptr | null): any {
  if (display) return display;
  const x = X();
  visual = { ext_data: null, visualid: 0x21, class: 4, red_mask: 0xff0000, green_mask: 0x00ff00, blue_mask: 0x0000ff, bits_per_rgb: 8, map_entries: 256 };
  defaultGCobj = x.defaultGC;
  screen = {
    ext_data: null, display: null, root: x.root, width: 1280, height: 1024, mwidth: 361, mheight: 289, ndepths: 1,
    depths: { depth: 24, nvisuals: 1, visuals: visual }, root_depth: 24, root_visual: visual, default_gc: defaultGCobj,
    cmap: x.cmap, white_pixel: 0xffffff, black_pixel: 0, max_maps: 1, min_maps: 1, backing_store: 0, save_unders: 0,
    root_input_mask: 0,
  };
  $sarrOf([screen]);
  display = {
    ext_data: null, private1: null, fd: x.fd, private2: 0, proto_major_version: 11, proto_minor_version: 0,
    vendor: null, private3: 0, private4: 0, private5: 0, private6: 0, resource_alloc: null, byte_order: 0,
    bitmap_unit: 32, bitmap_pad: 32, bitmap_bit_order: 0, nformats: 0, pixmap_format: null, private8: 0, release: 1,
    private9: null, private10: null, max_request_size: 65535, db: null, private15: null, display_name: null,
    default_screen: 0, nscreens: 1, screens: screen, motion_buffer: 0, private16: 0, min_keycode: 8, max_keycode: 255,
    private17: null, private18: null, private19: 0, xdefaults: null,
  };
  Object.defineProperty(display, 'qlen', { get: () => X().qlen, set: () => {} });
  screen.display = display;
  x.openDisplay();
  return display;
}

export function XCloseDisplay(_d: any): number { X().closeDisplay(); return 0; }
export function XFlush(_d: any): number { X().xread(); return 0; }
export function XSync(_d: any, discard: number): number {
  const x = X();
  x.xread();
  if (discard) while (x.pop());
  return 0;
}
export function XBell(_d: any, percent: number): number { X().bell(percent); return 0; }
export function XFree(_p: any): number { return 0; }
export function XScreenNumberOfScreen(_s: any): number { return 0; }
export function XSetErrorHandler(_h: any): any { return null; }
export function XSetIOErrorHandler(_h: any): any { return null; }
export function XSynchronize(_d: any, _on: number): any { return null; }

// ---------------------------------------------------------------- events

/** an event of the server copied into C's XEvent (the union's bytes) */
function toC(e: XEv, ev: any): void {
  ev.$m.u8.fill(0, ev.$o, ev.$o + 192);
  for (const k of [...ev.$m.refs.keys()]) if (k >= ev.$o && k < ev.$o + 192) ev.$m.refs.delete(k);
  const a = ev.xany;
  a.type = e.type;
  a.serial = 0;
  a.send_event = e.send_event ? 1 : 0;
  a.display = display;
  switch (e.type) {
    case KeyPress:
    case KeyRelease:
    case ButtonPress:
    case ButtonRelease:
    case MotionNotify: {
      const k = e.type === MotionNotify ? ev.xmotion : e.type === KeyPress || e.type === KeyRelease ? ev.xkey : ev.xbutton;
      k.window = e.window;
      k.root = e.root;
      k.subwindow = e.subwindow;
      k.time = e.time;
      k.x = e.x;
      k.y = e.y;
      k.x_root = e.x_root;
      k.y_root = e.y_root;
      k.state = e.state;
      if (e.type === KeyPress || e.type === KeyRelease) k.keycode = e.keycode;
      else if (e.type === MotionNotify) k.is_hint = 0;
      else k.button = e.button;
      k.same_screen = e.same_screen ? 1 : 0;
      break;
    }
    case EnterNotify:
    case LeaveNotify: {
      const c = ev.xcrossing;
      c.window = e.window;
      c.root = e.root;
      c.subwindow = e.subwindow;
      c.time = e.time;
      c.x = e.x;
      c.y = e.y;
      c.x_root = e.x_root;
      c.y_root = e.y_root;
      c.mode = e.mode;
      c.detail = e.detail;
      c.same_screen = e.same_screen ? 1 : 0;
      c.state = e.state;
      break;
    }
    case Expose: {
      const x = ev.xexpose;
      x.window = e.window;
      x.x = e.x;
      x.y = e.y;
      x.width = e.width;
      x.height = e.height;
      x.count = e.count;
      break;
    }
    case GraphicsExpose: {
      const g = ev.xgraphicsexpose;
      g.drawable = e.window;
      g.x = e.x;
      g.y = e.y;
      g.width = e.width;
      g.height = e.height;
      g.count = e.count;
      g.major_code = e.major_code;
      break;
    }
    case NoExpose: {
      const g = ev.xnoexpose;
      g.drawable = e.window;
      g.major_code = e.major_code;
      break;
    }
    case MapNotify: {
      const m = ev.xmap;
      m.event = e.event;
      m.window = e.window;
      break;
    }
    case ClientMessage: {
      const c = ev.xclient;
      c.window = e.window;
      c.message_type = e.message_type;
      c.format = e.format;
      const l = c.data.l;
      for (let i = 0; i < 5; i++) l[i] = e.data[i];
      break;
    }
    default:
      a.window = e.window;
  }
}

/** a C XEvent as the server's (XSendEvent) */
function fromC(ev: any): XEv {
  const a = ev.xany;
  const e: XEv = {
    type: a.type, send_event: !!a.send_event, window: a.window, root: 0, subwindow: 0, time: 0, x: 0, y: 0, x_root: 0,
    y_root: 0, state: 0, keycode: 0, button: 0, same_screen: false, mode: 0, detail: 0, width: 0, height: 0, count: 0,
    major_code: 0, event: 0, message_type: 0, format: 0, data: [0, 0, 0, 0, 0],
  };
  if (e.type === ClientMessage) {
    const c = ev.xclient;
    e.message_type = c.message_type;
    e.format = c.format;
    for (let i = 0; i < 5; i++) e.data[i] = c.data.l[i];
  }
  return e;
}

/** wait until something is in the connection (xstub.c wait_connection: select() on the X descriptor) */
async function waitConnection(): Promise<void> {
  const x = X();
  while (!x.connReadable()) {
    const fds = { __fds_bits: new Float64Array(16) };
    fds.__fds_bits[0] = 2 ** x.fd;
    await select(x.fd + 1, fds, null, null, null);
    x.pump();
  }
}

export async function XNextEvent(_d: any, ev: any): Promise<number> {
  const x = X();
  if (!x.qlen) x.xread();
  while (!x.qlen) {
    await waitConnection();
    x.xread();
  }
  toC(x.pop()!, ev);
  return 0;
}

export async function XPeekEvent(_d: any, ev: any): Promise<number> {
  const x = X();
  if (!x.qlen) x.xread();
  while (!x.qlen) {
    await waitConnection();
    x.xread();
  }
  toC(x.peek()!, ev);
  return 0;
}

export function XEventsQueued(_d: any, mode: number): number {
  const x = X();
  if (x.qlen || mode === QueuedAlready) return x.qlen;
  x.xread();
  return x.qlen;
}

export function XPending(_d: any): number {
  const x = X();
  if (x.qlen) return x.qlen;
  x.xread();
  return x.qlen;
}

function eventMaskOf(type: number): number {
  switch (type) {
    case KeyPress: return KeyPressMask;
    case KeyRelease: return KeyReleaseMask;
    case ButtonPress: return ButtonPressMask;
    case ButtonRelease: return ButtonReleaseMask;
    case MotionNotify: return PointerMotionMask | ButtonMotionMask | Button1MotionMask | Button2MotionMask | Button3MotionMask;
    case Expose: return ExposureMask;
    case MapNotify: case 18: case 22: return StructureNotifyMask;
    case EnterNotify: return EnterWindowMask;
    case LeaveNotify: return LeaveWindowMask;
    case 9: case 10: return FocusChangeMask;
  }
  return 0;
}

export function XCheckMaskEvent(_d: any, mask: number, ev: any): number {
  const x = X();
  const take = (): XEv | null => x.takeMatch((e: XEv) => (eventMaskOf(e.type) & mask) !== 0);
  let e = take();
  if (!e) {
    x.xread();
    e = take();
  }
  if (!e) return 0;
  toC(e, ev);
  return 1;
}

export function XSendEvent(_d: any, w: number, prop: number, mask: number, ev: any): number {
  X().sendEvent(w, prop, mask, fromC(ev));
  return 1;
}

export function XRefreshKeyboardMapping(_e: any): number { return 0; }

export function XLookupKeysym(e: any, index: number): number {
  let ks = X().keysymOf(e.keycode);
  if (!ks) return 0;
  if (index === 1 && ks >= 0x61 && ks <= 0x7a) ks -= 0x20;
  return ks;
}

const SHIFT_FROM = "1234567890-=[]\\;',./`", SHIFT_TO = '!@#$%^&*()_+{}|:"<>?~';

/** XLookupString: Shift, Control and Latin-1 (a US keyboard) */
export function XLookupString(e: any, buf: Ptr | null, n: number, ksRet: Ptr | null, _cs: any): number {
  let ks = XLookupKeysym(e, 0);
  const shift = (e.state & ShiftMask) !== 0;
  if (shift && ks >= 0x61 && ks <= 0x7a) ks -= 0x20;
  else if (shift && ks < 0x80) {
    const i = SHIFT_FROM.indexOf(String.fromCharCode(ks));
    if (i >= 0 && ks) ks = SHIFT_TO.charCodeAt(i);
  }
  out(ksRet, ks);
  let c = 0;
  if (ks >= 0x20 && ks < 0x7f) c = ks;
  else if (ks >= 0xa0 && ks <= 0xff) c = ks;
  else if (ks === 0xff0d || ks === 0xff8d) c = 13;
  else if (ks === 0xff08) c = 8;
  else if (ks === 0xff09) c = 9;
  else if (ks === 0xff1b) c = 27;
  else if (ks === 0xffff) c = 127;
  if (c && e.state & ControlMask && ((c >= 0x40 && c <= 0x5f) || (c >= 0x61 && c <= 0x7a))) c &= 0x1f;
  if (c && n > 0 && buf) {
    buf.a[buf.o] = buf.a instanceof Int8Array ? (c << 24) >> 24 : c;
    return 1;
  }
  return 0;
}

// ---------------------------------------------------------------- windows

export function XCreateWindow(_d: any, parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number,
                              cls: number, _v: any, mask: number, a: any): number {
  return X().createWindow(parent, x, y, w, h, bw, depth, cls, mask, a ?? { background_pixel: 0, border_pixel: 0, event_mask: 0 });
}

export function XCreateSimpleWindow(_d: any, parent: number, x: number, y: number, w: number, h: number, bw: number, border: number, bg: number): number {
  return X().createSimpleWindow(parent, x, y, w, h, bw, border, bg);
}

export function XDestroyWindow(_d: any, w: number): number { X().destroyWindow(w); return 0; }
export function XMapWindow(_d: any, w: number): number { X().mapWindow(w); return 0; }
export function XMapRaised(_d: any, w: number): number { X().mapRaised(w); return 0; }
export function XMapSubwindows(_d: any, w: number): number { X().mapSubwindows(w); return 0; }
export function XRaiseWindow(_d: any, w: number): number { X().raiseWindow(w); return 0; }
export function XUnmapWindow(_d: any, w: number): number { X().unmapWindow(w); return 0; }
export function XMoveWindow(_d: any, w: number, x: number, y: number): number { X().moveWindow(w, x, y); return 0; }
export function XResizeWindow(_d: any, w: number, wd: number, ht: number): number { X().resizeWindow(w, wd, ht); return 0; }
export function XMoveResizeWindow(_d: any, w: number, x: number, y: number, wd: number, ht: number): number {
  X().moveResizeWindow(w, x, y, wd, ht);
  return 0;
}
export function XClearWindow(_d: any, w: number): number { X().clearWindow(w); return 0; }
export function XClearArea(_d: any, w: number, x: number, y: number, wd: number, ht: number, exp: number): number {
  X().clearArea(w, x, y, wd, ht, exp);
  return 0;
}
export function XSetWindowBackground(_d: any, w: number, bg: number): number { X().setWindowBackground(w, bg); return 0; }
export function XSetWindowBackgroundPixmap(_d: any, w: number, p: number): number { X().setWindowBackgroundPixmap(w, p); return 0; }
export function XSetWindowBorder(_d: any, w: number, px: number): number { X().setWindowBorder(w, px); return 0; }
export function XSetWindowBorderPixmap(_d: any, w: number, p: number): number { X().setWindowBorderPixmap(w, p); return 0; }
export function XSetWindowColormap(_d: any, _w: number, _c: number): number { return 0; }
export function XChangeWindowAttributes(_d: any, w: number, mask: number, a: any): number { X().changeWindowAttributes(w, mask, a); return 0; }
export function XSelectInput(_d: any, w: number, mask: number): number { X().selectInput(w, mask); return 0; }
export function XDefineCursor(_d: any, w: number, c: number): number { X().defineCursor(w, c); return 0; }
export function XStoreName(_d: any, w: number, name: Ptr): number { X().storeName(w, cbytes(name)); return 0; }
export function XSetIconName(_d: any, w: number, name: Ptr): number { X().setIconName(w, cbytes(name)); return 0; }
export function XSetClassHint(_d: any, w: number, ch: any): number { X().setClassHint(w, cbytes(ch.res_name), cbytes(ch.res_class)); return 1; }

export function XAllocSizeHints(): any {
  return {
    flags: 0, x: 0, y: 0, width: 0, height: 0, min_width: 0, min_height: 0, max_width: 0, max_height: 0, width_inc: 0,
    height_inc: 0, min_aspect: { x: 0, y: 0 }, max_aspect: { x: 0, y: 0 }, base_width: 0, base_height: 0, win_gravity: 0,
  };
}

export function XSetWMNormalHints(_d: any, w: number, h: any): void { X().setWMNormalHints(w, h); }
export function XSetWMHints(_d: any, w: number, h: any): number { X().setWMHints(w, h); return 1; }

export function XSetCommand(_d: any, w: number, argv: Ptr, argc: number): number {
  const args: number[][] = [];
  for (let i = 0; i < argc; i++) args.push(cbytes(argv.a[argv.o + i]));
  X().setCommand(w, args);
  return 1;
}

export function XSetWMProtocols(..._a: any[]): number { return 1; }
export function XSetTransientForHint(..._a: any[]): number { return 0; }
export function XChangeProperty(_d: any, w: number, prop: number, type: number, format: number, mode: number, _data: any, n: number): number {
  X().changeProperty(w, prop, type, format, mode, n);
  return 0;
}
export function XDeleteProperty(_d: any, w: number, prop: number): number { X().deleteProperty(w, prop); return 0; }

export function XInternAtom(_d: any, name: Ptr, onlyIfExists: number): number {
  return X().internAtom(jstr(name), !!onlyIfExists);
}

export function XGetWindowAttributes(_d: any, w: number, a: any): number {
  const r = X().getWindowAttributes(w);
  for (const k of Object.keys(a)) if (typeof a[k] === 'number') a[k] = 0;
  a.visual = null;
  a.screen = null;
  if (!r) return 0;
  a.x = r.x; a.y = r.y; a.width = r.width; a.height = r.height; a.border_width = r.border_width;
  a.depth = r.depth; a.visual = visual; a.root = X().root; a.class = 1;
  a.colormap = X().cmap; a.map_installed = 1; a.map_state = r.map_state;
  a.your_event_mask = r.mask; a.all_event_masks = r.mask;
  a.screen = screen;
  return 1;
}

export function XTranslateCoordinates(_d: any, src: number, dst: number, sx: number, sy: number, dx: Ptr, dy: Ptr, child: Ptr): number {
  const r = X().translateCoordinates(src, dst, sx, sy);
  out(dx, r.x);
  out(dy, r.y);
  out(child, r.child);
  return 1;
}

export function XSetInputFocus(_d: any, w: number, _r: number, _t: number): number { X().setInputFocus(w); return 0; }

export function XWarpPointer(_d: any, _src: number, dst: number, _sx: number, _sy: number, _sw: number, _sh: number, dx: number, dy: number): number {
  X().warpPointer(dst, dx, dy);
  return 0;
}

export function XQueryPointer(_d: any, w: number, rr: Ptr, cr: Ptr, rx: Ptr, ry: Ptr, wx: Ptr, wy: Ptr, mask: Ptr): number {
  const r = X().queryPointer(w);
  out(rr, r.root); out(cr, r.child); out(rx, r.rx); out(ry, r.ry); out(wx, r.wx); out(wy, r.wy); out(mask, r.mask);
  return 1;
}

export function XGrabPointer(_d: any, w: number, oe: number, em: number, _pm: number, _km: number, confine: number, cursor: number, _t: number): number {
  return X().grabPointer(w, oe, em, confine, cursor);
}
export function XUngrabPointer(_d: any, _t: number): number { X().ungrabPointer(); return 0; }
export function XGrabKeyboard(_d: any, w: number, oe: number, _pm: number, _km: number, _t: number): number { return X().grabKeyboard(w, oe); }
export function XUngrabKeyboard(_d: any, _t: number): number { X().ungrabKeyboard(); return 0; }
export function XAutoRepeatOn(_d: any): number { X().autoRepeatOn(); return 0; }
export function XAutoRepeatOff(_d: any): number { X().autoRepeatOff(); return 0; }

/** the cut buffer is empty */
export function XFetchBuffer(_d: any, n: Ptr, _buffer: number): any {
  X().xread();
  out(n, 0);
  return null;
}

export function XCreatePixmapCursor(_d: any, s: number, m: number, fg: any, bg: any, x: number, y: number): number {
  return X().createPixmapCursor(s, m, fg, bg, x, y);
}
export function XCreateFontCursor(_d: any, shape: number): number { return X().createFontCursor(shape); }
export function XRecolorCursor(_d: any, c: number, fg: any, bg: any): number { X().recolorCursor(c, fg, bg); return 0; }
export function XFreeCursor(_d: any, c: number): number { X().freeCursor(c); return 0; }

/** XParseGeometry as in Xlib: [=][<w>{xX}<h>][{+-}<x>{+-}<y>] */
export function XParseGeometry(sp: Ptr | null, x: Ptr, y: Ptr, w: Ptr, h: Ptr): number {
  if (!sp) return 0;
  const s = jstr(sp);
  if (!s) return 0;
  let i = 0, mask = 0;
  const readInt = (): number | null => {
    let sign = 1, r = 0;
    if (s[i] === '+') i++;
    else if (s[i] === '-') { sign = -1; i++; }
    if (!(s[i] >= '0' && s[i] <= '9')) return null;
    while (s[i] >= '0' && s[i] <= '9') r = r * 10 + (s.charCodeAt(i++) - 48);
    return sign * r;
  };
  if (s[i] === '=') i++;
  if (s[i] >= '0' && s[i] <= '9') {
    let v = readInt();
    if (v === null) return 0;
    out(w, v >>> 0);
    mask |= WidthValue;
    if (s[i] !== 'x' && s[i] !== 'X') return 0;
    i++;
    v = readInt();
    if (v === null) return 0;
    out(h, v >>> 0);
    mask |= HeightValue;
  }
  if (s[i] === '+' || s[i] === '-') {
    if (s[i] === '-') mask |= XNegative;
    let v = readInt();
    if (v === null) return 0;
    out(x, v);
    mask |= XValue;
    if (s[i] !== '+' && s[i] !== '-') return 0;
    if (s[i] === '-') mask |= YNegative;
    v = readInt();
    if (v === null) return 0;
    out(y, v);
    mask |= YValue;
  }
  if (i < s.length) return 0;
  return mask;
}

// ---------------------------------------------------------------- colours

export function XParseColor(_d: any, _cm: number, spec: Ptr | null, c: any): number {
  if (!spec) return 0;
  const r = X().parseColor(jstr(spec));
  if (!r) return 0;
  c.red = r[0]; c.green = r[1]; c.blue = r[2];
  c.flags = DoRed | DoGreen | DoBlue;
  return 1;
}

export function XAllocColor(_d: any, _cm: number, c: any): number {
  const [pixel, r, g, b] = X().allocColor(c.red, c.green, c.blue);
  c.pixel = pixel; c.red = r; c.green = g; c.blue = b;
  return 1;
}

export function XAllocColorCells(..._a: any[]): number { return X().allocColorCells(); }
export function XFreeColors(..._a: any[]): number { return 0; }
export function XStoreColors(..._a: any[]): number { return 0; }
export function XStoreColor(_d: any, cm: number, c: any): number { X().storeColor(cm, c.pixel, c); return 0; }

export function XQueryColor(_d: any, _cm: number, c: any): number {
  const [r, g, b] = X().queryColor(c.pixel);
  c.red = r; c.green = g; c.blue = b;
  c.flags = DoRed | DoGreen | DoBlue;
  return 0;
}

export function XCreateColormap(..._a: any[]): number { return X().createColormap(); }
export function XFreeColormap(..._a: any[]): number { return 0; }

// ---------------------------------------------------------------- pixmaps

export function XCreatePixmap(_d: any, dr: number, w: number, h: number, depth: number): number { return X().createPixmap(dr, w, h, depth); }
export function XFreePixmap(_d: any, p: number): number { X().freePixmap(p); return 0; }

export function XCreateBitmapFromData(_d: any, dr: number, data: Ptr, w: number, h: number): number {
  return X().createBitmapFromData(dr, bytesOf(data, (((w >>> 0) + 7) >> 3) * (h >>> 0)), w, h);
}

export function XCreatePixmapFromBitmapData(_d: any, dr: number, data: Ptr, w: number, h: number, fg: number, bg: number, depth: number): number {
  return X().createPixmapFromBitmapData(dr, bytesOf(data, (((w >>> 0) + 7) >> 3) * (h >>> 0)), w, h, fg, bg, depth);
}

export function XReadBitmapFile(_d: any, dr: number, file: Ptr, w: Ptr, h: Ptr, p: Ptr, xh: Ptr | null, yh: Ptr | null): number {
  const bytes = fsRead(jstr(file));
  const r = X().readBitmapFile(dr, cbytes(file), bytes ? String.fromCharCode(...bytes) : null);
  if (r.status !== 0) return r.status;
  out(w, r.w); out(h, r.h); out(p, r.pixmap);
  out(xh, r.xhot); out(yh, r.yhot);
  return 0;
}

export function XGetImage(..._a: any[]): any { return null; }

// ---------------------------------------------------------------- GCs

/** XGCValues (a C struct) as the server's values */
function gcValues(v: any): any {
  if (!v) return null;
  return {
    function: v.function, plane_mask: v.plane_mask, foreground: v.foreground, background: v.background,
    line_width: v.line_width, line_style: v.line_style, cap_style: v.cap_style, join_style: v.join_style,
    fill_style: v.fill_style, fill_rule: v.fill_rule, arc_mode: v.arc_mode, tile: v.tile, stipple: v.stipple,
    ts_x_origin: v.ts_x_origin, ts_y_origin: v.ts_y_origin, font: v.font, subwindow_mode: v.subwindow_mode,
    graphics_exposures: v.graphics_exposures, clip_x_origin: v.clip_x_origin, clip_y_origin: v.clip_y_origin,
    clip_mask: v.clip_mask, dash_offset: v.dash_offset, dashes: v.dashes,
  };
}

export function XCreateGC(_d: any, _dr: number, mask: number, v: any): GC { return X().createGC(ul32(mask), gcValues(v)); }
export function XFreeGC(_d: any, gc: GC): number { X().freeGC(gc); return 0; }
export function XChangeGC(_d: any, gc: GC, mask: number, v: any): number { X().gcApply(gc, ul32(mask), gcValues(v)); return 0; }
export function XGContextFromGC(gc: GC): number { return gc.gid; }
export function XSetForeground(_d: any, gc: GC, p: number): number { gc.v.foreground = p; return 0; }
export function XSetBackground(_d: any, gc: GC, p: number): number { gc.v.background = p; return 0; }
export function XSetFunction(_d: any, gc: GC, f: number): number { gc.v.function = f; return 0; }
export function XSetPlaneMask(_d: any, gc: GC, pm: number): number { gc.v.plane_mask = pm; return 0; }
export function XSetGraphicsExposures(_d: any, gc: GC, b: number): number { gc.v.graphics_exposures = b; return 0; }
export function XSetLineAttributes(_d: any, gc: GC, lw: number, ls: number, cs: number, js: number): number {
  gc.v.line_width = lw | 0; gc.v.line_style = ls; gc.v.cap_style = cs; gc.v.join_style = js;
  return 0;
}
export function XSetDashes(_d: any, gc: GC, off: number, list: Ptr, n: number): number {
  X().setDashes(gc, off, bytesOf(list, n));
  return 0;
}
export function XSetFillStyle(_d: any, gc: GC, fs: number): number { gc.v.fill_style = fs; return 0; }
export function XSetFont(_d: any, gc: GC, f: number): number { gc.v.font = f; return 0; }
export function XSetTile(_d: any, gc: GC, t: number): number { gc.v.tile = t; return 0; }
export function XSetClipMask(_d: any, gc: GC, p: number): number { gc.v.clip_mask = p; return 0; }
export function XSetClipOrigin(_d: any, gc: GC, x: number, y: number): number { gc.v.clip_x_origin = x; gc.v.clip_y_origin = y; return 0; }

// ---------------------------------------------------------------- fonts

function fontStruct(f: { fid: number; width: number; ascent: number; descent: number }): any {
  const cs = () => ({ lbearing: 0, rbearing: f.width, width: f.width, ascent: f.ascent, descent: f.descent, attributes: 0 });
  const min = cs();
  min.rbearing = 0;
  return {
    ext_data: null, fid: f.fid, direction: 0, min_char_or_byte2: 0, max_char_or_byte2: 255, min_byte1: 0, max_byte1: 0,
    all_chars_exist: 1, default_char: 32, n_properties: 0, properties: null, min_bounds: min, max_bounds: cs(),
    per_char: null, ascent: f.ascent, descent: f.descent,
  };
}

export function XLoadQueryFont(_d: any, name: Ptr): any {
  const f = X().loadQueryFont(jstr(name), cbytes(name));
  return f ? fontStruct(f) : null;
}

export function XQueryFont(_d: any, id: number): any {
  const f = X().queryFont(id);
  return f ? fontStruct(f) : null;
}

export function XFreeFont(_d: any, f: any): number {
  if (f) X().freeFont(f.fid);
  return 0;
}

export function XTextWidth(f: any, _s: Ptr, n: number): number {
  return n * f.max_bounds.width;
}

// ---------------------------------------------------------------- drawing

function points(p: any, n: number): { x: number; y: number }[] {
  const o = [];
  for (let i = 0; i < n; i++) { const q = elem(p, i); o.push({ x: q.x, y: q.y }); }
  return o;
}

export function XDrawLine(_d: any, dr: number, gc: GC, x1: number, y1: number, x2: number, y2: number): number {
  X().drawLine(dr, gc, x1, y1, x2, y2);
  return 0;
}
export function XDrawLines(_d: any, dr: number, gc: GC, p: any, n: number, mode: number): number {
  X().drawLines(dr, gc, points(p, n), mode);
  return 0;
}
export function XDrawPoint(_d: any, dr: number, gc: GC, x: number, y: number): number { X().drawPoint(dr, gc, x, y); return 0; }
export function XDrawPoints(_d: any, dr: number, gc: GC, p: any, n: number, mode: number): number {
  X().drawPoints(dr, gc, points(p, n), mode);
  return 0;
}
export function XDrawSegments(_d: any, dr: number, gc: GC, s: any, n: number): number {
  const sg = [];
  for (let i = 0; i < n; i++) { const q = elem(s, i); sg.push({ x1: q.x1, y1: q.y1, x2: q.x2, y2: q.y2 }); }
  X().drawSegments(dr, gc, sg);
  return 0;
}
export function XDrawRectangle(_d: any, dr: number, gc: GC, x: number, y: number, w: number, h: number): number {
  X().drawRectangle(dr, gc, x, y, w, h);
  return 0;
}
export function XFillRectangle(_d: any, dr: number, gc: GC, x: number, y: number, w: number, h: number): number {
  X().fillRectangle(dr, gc, x, y, w, h);
  return 0;
}
export function XFillRectangles(_d: any, dr: number, gc: GC, r: any, n: number): number {
  const rs = [];
  for (let i = 0; i < n; i++) { const q = elem(r, i); rs.push({ x: q.x, y: q.y, width: q.width, height: q.height }); }
  X().fillRectangles(dr, gc, rs);
  return 0;
}
export function XFillPolygon(_d: any, dr: number, gc: GC, p: any, n: number, shape: number, mode: number): number {
  X().fillPolygon(dr, gc, points(p, n), shape, mode);
  return 0;
}
export function XDrawArc(_d: any, dr: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): number {
  X().drawArc(dr, gc, x, y, w, h, a1, a2);
  return 0;
}
export function XDrawArcs(_d: any, dr: number, gc: GC, a: any, n: number): number {
  const as = [];
  for (let i = 0; i < n; i++) { const q = elem(a, i); as.push({ x: q.x, y: q.y, width: q.width, height: q.height, angle1: q.angle1, angle2: q.angle2 }); }
  X().drawArcs(dr, gc, as);
  return 0;
}
export function XFillArc(_d: any, dr: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): number {
  X().fillArc(dr, gc, x, y, w, h, a1, a2);
  return 0;
}
export function XDrawString(_d: any, dr: number, gc: GC, x: number, y: number, s: Ptr, n: number): number {
  X().drawString(dr, gc, x, y, bytesOf(s, n > 0 ? n : 0), false);
  return 0;
}
export function XDrawImageString(_d: any, dr: number, gc: GC, x: number, y: number, s: Ptr, n: number): number {
  X().drawString(dr, gc, x, y, bytesOf(s, n > 0 ? n : 0), true);
  return 0;
}
export function XCopyArea(_d: any, src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number): number {
  X().copyArea(src, dst, gc, sx, sy, w, h, dx, dy);
  return 0;
}
export function XCopyPlane(_d: any, src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number, plane: number): number {
  X().copyPlane(src, dst, gc, sx, sy, w, h, dx, dy, plane);
  return 0;
}

// ---------------------------------------------------------------- XFree86-VidMode: absent

export function XF86VidModeQueryVersion(..._a: any[]): number { return 0; }
export function XF86VidModeGetModeLine(..._a: any[]): number { return 0; }
export function XF86VidModeGetAllModeLines(_d: any, _s: number, n: Ptr, modes: Ptr): number {
  out(n, 0);
  out(modes, null);
  return 0;
}
export function XF86VidModeSwitchToMode(..._a: any[]): number { return 0; }
export function XF86VidModeSetViewPort(..._a: any[]): number { return 0; }
