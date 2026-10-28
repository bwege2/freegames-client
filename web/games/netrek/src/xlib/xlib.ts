// An X server for COW, the Netrek client: the one the client oracle's recording Xlib pretends to be
// (re/netrek/oracle/client/xstub.c, "the X server it pretends to be"), ported call for call so that the
// port's draw log is the oracle's line for line: the same resource numbers, GC state, coordinates,
// events (exposures from visible regions, crossings, the implicit grab of a pressed button, keycodes
// handed out per keysym) and log sections. Origin: web/games/xpilot/src/xlib/xlib.ts (the XPilot port's
// Xlib, itself a port of the XPilot oracle's xstub.c), rewritten for the Netrek oracle's xstub.c, which
// differs in its event model (the connection, below), its fonts, its exposures and the calls COW makes.
//
// The screen: 1280x1024, 24-bit TrueColor (pixel = 0xRRGGBB), no window manager, no backing store,
// ForgetGravity. Fonts: the misc and schumacher bitmap fonts by name (FONTS); other names do not load.
//
// The connection: device input (keys, buttons, pointer motion) arrives as lines ("k <keysym>",
// "K <keysym>", "b <n>", "B <n>", "m <x> <y> <window>"), as the coordinator writes them into the oracle's X
// socket; pump() turns the lines written so far into events "in the connection" (srv), with the windows,
// pointer, grab and focus of that moment, as do the events the server makes in answer to requests. Xlib's
// queue is filled from the connection where libX11 reads (xread()). Waiting is the C API's business
// (rt/x11.ts): it waits in select() for the connection to become readable.
//
// Drawing: every call is logged (when a log is attached) and, when `render` is on, also drawn into the
// drawables' pixels (raster.ts, from the XPilot port), so that the browser can show the windows.
import { KEYSYMS } from './keysyms.ts';
import * as Rs from './raster.ts';
import { glyphsFor } from './fonts.ts';

// ---------------------------------------------------------------- constants (X.h)

export const None = 0, ParentRelative = 1, CopyFromParent = 0, PointerRoot = 1;
export const KeyPress = 2, KeyRelease = 3, ButtonPress = 4, ButtonRelease = 5, MotionNotify = 6, EnterNotify = 7,
  LeaveNotify = 8, FocusIn = 9, FocusOut = 10, Expose = 12, GraphicsExpose = 13, NoExpose = 14, UnmapNotify = 18,
  MapNotify = 19, ConfigureNotify = 22, ClientMessage = 33;
export const NoEventMask = 0, KeyPressMask = 1 << 0, KeyReleaseMask = 1 << 1, ButtonPressMask = 1 << 2,
  ButtonReleaseMask = 1 << 3, EnterWindowMask = 1 << 4, LeaveWindowMask = 1 << 5, PointerMotionMask = 1 << 6,
  Button1MotionMask = 1 << 8, Button2MotionMask = 1 << 9, Button3MotionMask = 1 << 10, ButtonMotionMask = 1 << 13,
  ExposureMask = 1 << 15, StructureNotifyMask = 1 << 17, FocusChangeMask = 1 << 21;
export const ShiftMask = 1, LockMask = 2, ControlMask = 4, Mod1Mask = 8, Button1Mask = 1 << 8, Button2Mask = 1 << 9,
  Button3Mask = 1 << 10, Button4Mask = 1 << 11, Button5Mask = 1 << 12;
const ANY_BUTTON = Button1Mask | Button2Mask | Button3Mask | Button4Mask | Button5Mask;
export const GCFunction = 1 << 0, GCPlaneMask = 1 << 1, GCForeground = 1 << 2, GCBackground = 1 << 3,
  GCLineWidth = 1 << 4, GCLineStyle = 1 << 5, GCCapStyle = 1 << 6, GCJoinStyle = 1 << 7, GCFillStyle = 1 << 8,
  GCFillRule = 1 << 9, GCTile = 1 << 10, GCStipple = 1 << 11, GCTileStipXOrigin = 1 << 12,
  GCTileStipYOrigin = 1 << 13, GCFont = 1 << 14, GCSubwindowMode = 1 << 15, GCGraphicsExposures = 1 << 16,
  GCClipXOrigin = 1 << 17, GCClipYOrigin = 1 << 18, GCClipMask = 1 << 19, GCDashOffset = 1 << 20,
  GCDashList = 1 << 21, GCArcMode = 1 << 22;
export const CWBackPixel = 1 << 1, CWBorderPixel = 1 << 3, CWEventMask = 1 << 11;
export const GXcopy = 3, LineSolid = 0, CapButt = 1, JoinMiter = 0, FillSolid = 0, EvenOddRule = 0, ArcPieSlice = 1,
  ClipByChildren = 0, InputOutput = 1, TrueColor = 4;
export const IsUnmapped = 0, IsUnviewable = 1, IsViewable = 2;
export const NotifyNormal = 0, NotifyAncestor = 0;
export const PMinSize = 1 << 4, PMaxSize = 1 << 5;
export const InputHint = 1 << 0, StateHint = 1 << 1, IconWindowHint = 1 << 3, WindowGroupHint = 1 << 6;
export const NoValue = 0, XValue = 1, YValue = 2, WidthValue = 4, HeightValue = 8, XNegative = 16, YNegative = 32;
export const DoRed = 1, DoGreen = 2, DoBlue = 4;
export const QueuedAlready = 0;
export const BitmapSuccess = 0, BitmapOpenFailed = 1, BitmapFileInvalid = 2;

const KS: Record<string, number> = Object.fromEntries(KEYSYMS);
const KS_NAME = new Map<number, string>();
for (const [n, v] of KEYSYMS) if (!KS_NAME.has(v)) KS_NAME.set(v, n);
const XK_Shift_L = 0xffe1, XK_Shift_R = 0xffe2, XK_Control_L = 0xffe3, XK_Control_R = 0xffe4, XK_Caps_Lock = 0xffe5,
  XK_Meta_L = 0xffe7, XK_Meta_R = 0xffe8, XK_Alt_L = 0xffe9, XK_Alt_R = 0xffea;

/** the oracle's virtual clock starts at 2010-01-01 00:00:00 UTC (coord.h ORACLE_T0) */
export const ORACLE_T0 = 1262304000;

// ---------------------------------------------------------------- types

/** an event as the server makes it: the fields of the XEvent members (rt/x11.ts copies them into C's) */
export interface XEv {
  type: number;
  send_event: boolean;
  window: number;
  root: number;
  subwindow: number;
  time: number;
  x: number;
  y: number;
  x_root: number;
  y_root: number;
  state: number;
  keycode: number;
  button: number;
  same_screen: boolean;
  mode: number;
  detail: number;
  width: number;
  height: number;
  count: number;
  major_code: number;
  /** MapNotify: the event window (xmap.event); window is xmap.window */
  event: number;
  /** ClientMessage */
  message_type: number;
  format: number;
  data: number[];
}

function newEv(type: number): XEv {
  return {
    type, send_event: false, window: 0, root: 0, subwindow: 0, time: 0, x: 0, y: 0, x_root: 0, y_root: 0, state: 0,
    keycode: 0, button: 0, same_screen: false, mode: 0, detail: 0, width: 0, height: 0, count: 0, major_code: 0,
    event: 0, message_type: 0, format: 0, data: [0, 0, 0, 0, 0],
  };
}

/** XGCValues, as far as the server keeps them */
export interface GCValues {
  function: number;
  plane_mask: number;
  foreground: number;
  background: number;
  line_width: number;
  line_style: number;
  cap_style: number;
  join_style: number;
  fill_style: number;
  fill_rule: number;
  arc_mode: number;
  tile: number;
  stipple: number;
  ts_x_origin: number;
  ts_y_origin: number;
  font: number;
  subwindow_mode: number;
  graphics_exposures: number;
  clip_x_origin: number;
  clip_y_origin: number;
  clip_mask: number;
  dash_offset: number;
  dashes: number;
}

/** a GC (struct _XGC of xstub.c): its resource number, values and dash list */
export interface GC {
  gid: number;
  v: GCValues;
  dashes: number[];
}

export interface FontInfo {
  fid: number;
  name: string;
  width: number;
  ascent: number;
  descent: number;
}

export interface Pt { x: number; y: number }
export interface Seg { x1: number; y1: number; x2: number; y2: number }
export interface Rect { x: number; y: number; width: number; height: number }
export interface ArcSpec { x: number; y: number; width: number; height: number; angle1: number; angle2: number }

/** where the draw log goes: the lines of the draw file (sections, calls, notes) and of the index */
export interface DrawLog {
  full(line: string): void;
  index(line: string): void;
}

const R_FREE = 0, R_WINDOW = 1, R_PIXMAP = 2, R_FONT = 3, R_CURSOR = 4, R_CMAP = 5, R_GC = 6;

interface Res {
  kind: number;
  parent: number;
  x: number; y: number; w: number; h: number; bw: number; depth: number; cls: number;
  mapped: boolean;
  stack: number;
  mask: number;
  bg: number;
  bgpix: number;
  border: number;
  name: string;
  wmname: string;
  surf: Rs.Surface | null;
}

/** a region: rectangles (root coordinates) */
interface Rct { x: number; y: number; w: number; h: number }
type Rgn = Rct[];

function rgnAdd(g: Rgn, x: number, y: number, w: number, h: number): void {
  if (w <= 0 || h <= 0) return;
  g.push({ x, y, w, h });
}

/** g minus the rectangle */
function rgnSub(g: Rgn, x: number, y: number, w: number, h: number): Rgn {
  const out: Rgn = [];
  for (const a of g) {
    const x1 = x > a.x ? x : a.x, y1 = y > a.y ? y : a.y;
    const x2 = x + w < a.x + a.w ? x + w : a.x + a.w, y2 = y + h < a.y + a.h ? y + h : a.y + a.h;
    if (x1 >= x2 || y1 >= y2) { rgnAdd(out, a.x, a.y, a.w, a.h); continue; }
    rgnAdd(out, a.x, a.y, a.w, y1 - a.y);
    rgnAdd(out, a.x, y2, a.w, a.y + a.h - y2);
    rgnAdd(out, a.x, y1, x1 - a.x, y2 - y1);
    rgnAdd(out, x2, y1, a.x + a.w - x2, y2 - y1);
  }
  return out;
}

function rgnClip(g: Rgn, x: number, y: number, w: number, h: number): Rgn {
  const out: Rgn = [];
  for (const a of g) {
    const x1 = x > a.x ? x : a.x, y1 = y > a.y ? y : a.y;
    const x2 = x + w < a.x + a.w ? x + w : a.x + a.w, y2 = y + h < a.y + a.h ? y + h : a.y + a.h;
    rgnAdd(out, x1, y1, x2 - x1, y2 - y1);
  }
  return out;
}

// ---------------------------------------------------------------- formatting as xstub's printf

const u32 = (v: number) => v >>> 0;
const i32 = (v: number) => v | 0;
const hex6 = (v: number) => (Number(BigInt.asUintN(64, BigInt(Math.trunc(v)))) % 0x1000000).toString(16).padStart(6, '0');
/** %lx of a long */
const lhex = (v: number) => BigInt.asUintN(64, BigInt(Math.trunc(v))).toString(16);
/** %x of an unsigned int */
const xhex = (v: number) => (v >>> 0).toString(16);

/** jb_str: "..." with JSON escapes, bytes from 0x7f and below 0x20 as \u00XX */
export function jstrLog(bytes: number[]): string {
  let out = '"';
  for (const b of bytes) {
    const c = b & 255;
    if (c === 0x22 || c === 0x5c) out += '\\' + String.fromCharCode(c);
    else if (c < 0x20 || c >= 0x7f) out += '\\u' + c.toString(16).padStart(4, '0');
    else out += String.fromCharCode(c);
  }
  return out + '"';
}

// FNV-1a 64 over the section's lines, in two 32-bit halves
class Fnv64 {
  hi = 0xcbf29ce4;
  lo = 0x84222325;
  reset(): void {
    this.hi = 0xcbf29ce4;
    this.lo = 0x84222325;
  }
  add(s: string): void {
    let hi = this.hi, lo = this.lo;
    for (let i = 0; i < s.length; i++) {
      lo = (lo ^ (s.charCodeAt(i) & 255)) >>> 0;
      // (hi:lo) * (2^40 + 0x1b3) mod 2^64
      const l0 = lo & 0xffff, l1 = lo >>> 16;
      const a0 = l0 * 0x1b3, a1 = l1 * 0x1b3 + (a0 >>> 16);
      const nlo = ((a1 & 0xffff) << 16 | (a0 & 0xffff)) >>> 0;
      const carry = Math.floor(a1 / 65536);
      hi = (Math.imul(hi, 0x1b3) + carry + (lo << 8)) >>> 0;
      lo = nlo;
    }
    this.hi = hi;
    this.lo = lo;
  }
  hex(): string {
    return this.hi.toString(16).padStart(8, '0') + this.lo.toString(16).padStart(8, '0');
  }
}

// ---------------------------------------------------------------- fonts

/** The bitmap fonts of a standard X installation that COW asks for (xstub.c font_table): name -> cell
 * width, ascent, descent. Other names do not load. */
export const FONTS: [string, number, number, number][] = [
  ['fixed', 6, 11, 2],
  ['6x10', 6, 8, 2],
  ['5x7', 5, 6, 1],
  ['6x13', 6, 11, 2],
  ['7x13', 7, 11, 2],
  ['8x13', 8, 11, 2],
  ['9x15', 9, 12, 3],
  ['10x20', 10, 16, 4],
  ['-*-clean-bold-r-normal--10-100-75-75-c-60-*', 6, 8, 2],
  ['-*-clean-medium-r-normal--10-100-75-75-c-60-*', 6, 8, 2],
];

// rgb.txt's values of the colour names COW and its defaults use (xstub.c named_colors)
const NAMED_COLORS: [string, number, number, number][] = [
  ['black', 0, 0, 0], ['white', 255, 255, 255], ['red', 255, 0, 0], ['green', 0, 255, 0],
  ['blue', 0, 0, 255], ['yellow', 255, 255, 0], ['cyan', 0, 255, 255], ['magenta', 255, 0, 255],
  ['gray', 190, 190, 190], ['grey', 190, 190, 190], ['orange', 255, 165, 0],
  ['dark grey', 169, 169, 169], ['dark gray', 169, 169, 169], ['darkgrey', 169, 169, 169],
  ['darkgray', 169, 169, 169], ['light grey', 211, 211, 211], ['light gray', 211, 211, 211],
  ['dim grey', 105, 105, 105], ['dim gray', 105, 105, 105], ['pink', 255, 192, 203],
  ['purple', 160, 32, 240], ['brown', 165, 42, 42], ['gold', 255, 215, 0],
  ['light blue', 173, 216, 230], ['dark green', 0, 100, 0], ['navy', 0, 0, 128],
];

export interface XServerOptions {
  /** the clock (microseconds since 1970), the oracle's ls_time_us() */
  clock: () => number;
  /** the length of a log section (the coordinator's tick) */
  tickUs?: number;
  /** keep the drawables' pixels (the browser); off in the tests */
  render?: boolean;
  /** the X connection's descriptor (ConnectionNumber) */
  fd?: number;
}

/** The X server and the client's end of the connection (Xlib's queue). */
export class XServer {
  log: DrawLog | null = null;
  render: boolean;
  /** told when something visible may have changed */
  onChange: (() => void) | null = null;
  readonly clock: () => number;
  readonly tickUs: number;
  readonly fd: number;

  readonly root: number;
  readonly defaultFont: number;
  readonly defaultGC: GC;
  readonly cmap: number;
  readonly width = 1280;
  readonly height = 1024;

  private res: Res[] = [];
  private stackCounter = 0;
  private fonts = new Map<number, FontInfo>();
  private atomNames: string[] = [];

  // the log's section
  private secTick = -1;
  private secCalls = 0;
  private secWritten = false;
  private secHash = new Fnv64();

  // events
  private queue: XEv[] = [];
  private srv: XEv[] = [];
  private inbuf: string[] = [];
  ptrX = 640;
  ptrY = 512;
  private modState = 0;
  private focusWindow = PointerRoot;
  private grabWin = 0;
  private ptrWindow = 0;
  private keycodes: number[] = [];
  /** the images Imlib loaded, by their pixmaps: the browser draws their pixels (rt/imlib.ts) */
  readonly images = new Map<number, Rs.Surface>();

  constructor(o: XServerOptions) {
    this.clock = o.clock;
    this.tickUs = o.tickUs ?? 20000;
    this.render = !!o.render;
    this.fd = o.fd ?? 3;
    this.res.push(this.blank(R_FREE));
    this.root = this.newRes(R_WINDOW);
    const r = this.res[this.root];
    r.w = 1280; r.h = 1024; r.depth = 24; r.mapped = true; r.name = 'root';
    this.defaultFont = this.newRes(R_FONT);
    this.defaultGC = { gid: this.newRes(R_GC), v: this.gcDefaults(), dashes: [4, 4] };
    this.defaultGC.v.background = 1;
    this.cmap = this.newRes(R_CMAP);
    this.ptrWindow = this.root;
  }

  // ---------------------------------------------------------------- resources

  private blank(kind: number): Res {
    return {
      kind, parent: 0, x: 0, y: 0, w: 0, h: 0, bw: 0, depth: 0, cls: 0, mapped: false, stack: 0, mask: 0, bg: 0,
      bgpix: None, border: 0, name: '', wmname: '', surf: null,
    };
  }

  private newRes(kind: number): number {
    if (this.res.length >= 8192) throw new Error('xstub: out of resources');
    const r = this.blank(kind);
    r.stack = ++this.stackCounter;
    this.res.push(r);
    return this.res.length - 1;
  }

  private R(id: number): Res | null {
    return id > 0 && id < this.res.length ? this.res[id] : null;
  }

  private isWindow(id: number): boolean {
    const r = this.R(id);
    return !!r && r.kind === R_WINDOW;
  }

  dname(id: number): string {
    const r = this.R(id);
    if (!r) return 'none';
    const k = r.kind === R_WINDOW ? 'w' : r.kind === R_PIXMAP ? 'p' : r.kind === R_FONT ? 'f' : r.kind === R_CURSOR ? 'c'
      : r.kind === R_CMAP ? 'm' : r.kind === R_GC ? 'g' : 'r';
    return k + id;
  }

  // ---------------------------------------------------------------- the draw log

  private curTick(): number {
    return Math.floor((this.clock() - ORACLE_T0 * 1e6) / this.tickUs);
  }

  private secEnd(): void {
    if (this.secTick < 0) return;
    if (this.log && (this.secCalls > 0 || this.secWritten)) this.log.index(`T ${this.secTick} ${this.secCalls} ${this.secHash.hex()}`);
    this.secTick = -1;
  }

  private secCheck(): void {
    const t = this.curTick();
    if (t === this.secTick) return;
    this.secEnd();
    this.secTick = t;
    this.secHash.reset();
    this.secCalls = 0;
    this.secWritten = false;
  }

  private secHead(): void {
    if (this.log && !this.secWritten) this.log.full(`S T ${this.secTick}`);
    this.secWritten = true;
  }

  /** the end of the log (exit: the last section's index line) */
  logClose(): void {
    this.secEnd();
  }

  /** a logged call */
  private call(line: string): void {
    if (!this.log) return;
    this.secCheck();
    this.secHash.add(line + '\n');
    this.secCalls++;
    this.secHead();
    this.log.full(line);
  }

  /** a logged line of the Imlib2 stub */
  logLine(line: string): void {
    this.call(line);
  }

  /** a note ("# " line: not hashed) */
  note(text: string): void {
    if (!this.log) return;
    this.secCheck();
    this.secHead();
    this.log.full('# ' + text);
  }

  private gcText(gc: GC): string {
    const v = gc.v;
    let t = ` gc${gc.gid}{fg=${hex6(v.foreground)} bg=${hex6(v.background)} lw=${i32(v.line_width)} ls=${i32(v.line_style)} font=${this.dname(v.font)}`;
    if (v.cap_style !== CapButt) t += ` cap=${i32(v.cap_style)}`;
    if (v.join_style !== JoinMiter) t += ` join=${i32(v.join_style)}`;
    if (v.fill_style !== FillSolid) t += ` fill=${i32(v.fill_style)} tile=${this.dname(v.tile)} stipple=${this.dname(v.stipple)} ts=${i32(v.ts_x_origin)},${i32(v.ts_y_origin)}`;
    if (v.function !== GXcopy) t += ` func=${i32(v.function)}`;
    if ((v.plane_mask & 0xffffff) !== 0xffffff) t += ` pm=${hex6(v.plane_mask)}`;
    if (v.clip_mask !== None) t += ` clip=${this.dname(v.clip_mask)}@${i32(v.clip_x_origin)},${i32(v.clip_y_origin)}`;
    if (!v.graphics_exposures) t += ' gx=0';
    if (v.line_style !== LineSolid) t += ` dash=${i32(v.dash_offset)}:${gc.dashes.map((d) => d & 255).join(',')}`;
    return t + '}';
  }

  // ---------------------------------------------------------------- events

  private serverTime(): number {
    return Math.floor(this.clock() / 1000) % 4294967296;
  }

  /** an event the server sends: into the connection */
  private push(e: XEv): void {
    this.srv.push(e);
  }

  /** Xlib reads the connection: everything in it goes into the queue */
  xread(): void {
    if (!this.srv.length) return;
    for (const e of this.srv) this.queue.push(e);
    this.srv = [];
  }

  /** events waiting in the connection (the X descriptor is readable) */
  connReadable(): boolean {
    return this.srv.length > 0;
  }

  /** device input written into the connection and not read yet (the socket is readable for the kernel) */
  inputPending(): boolean {
    return this.inbuf.length > 0;
  }

  get qlen(): number {
    return this.queue.length;
  }

  pop(): XEv | null {
    return this.queue.shift() ?? null;
  }

  peek(): XEv | null {
    return this.queue[0] ?? null;
  }

  /** the first queued event that matches, taken out of the queue */
  takeMatch(match: (e: XEv) => boolean): XEv | null {
    const i = this.queue.findIndex(match);
    if (i < 0) return null;
    return this.queue.splice(i, 1)[0];
  }

  private absPos(w: number): [number, number] {
    let x = 0, y = 0;
    for (let r = this.R(w); r && w !== this.root; w = r.parent, r = this.R(w)) {
      x += r.x + r.bw;
      y += r.y + r.bw;
    }
    return [x, y];
  }

  private viewable(w: number): boolean {
    let r = this.R(w);
    for (; r && w !== this.root; w = r.parent, r = this.R(w)) if (r.kind !== R_WINDOW || !r.mapped) return false;
    return this.R(w) !== null;
  }

  /** the deepest viewable window containing the root point (higher in the stack is on top) */
  private windowAt(x: number, y: number): number {
    let w = this.root, found: boolean;
    do {
      found = false;
      let best = 0;
      for (let i = 1; i < this.res.length; i++) {
        const r = this.res[i];
        if (r.kind !== R_WINDOW || r.parent !== w || !r.mapped) continue;
        const [ax, ay] = this.absPos(i);
        const b = r.bw;
        if (x >= ax - b && y >= ay - b && x < ax + r.w + b && y < ay + r.h + b && (!best || r.stack > this.res[best].stack)) best = i;
      }
      if (best) { w = best; found = true; }
    } while (found);
    return w;
  }

  /** the window that gets an event of this mask: w or its first ancestor that selected it */
  private eventWindow(w: number, mask: number): number {
    while (w && w !== this.root) {
      const r = this.R(w);
      if (!r) return 0;
      if (r.mask & mask) return w;
      w = r.parent;
    }
    return 0;
  }

  private windowNamed(name: string): number {
    if (name === '-') return this.root;
    for (let i = this.res.length - 1; i >= 1; i--) if (this.res[i].kind === R_WINDOW && this.res[i].wmname === name) return i;
    return 0;
  }

  /** keycodes: 8 + index in this list (a keycode for every keysym used) */
  private keycodeOf(ks: number): number {
    if (ks >= 0x41 && ks <= 0x5a) ks += 0x20;
    const i = this.keycodes.indexOf(ks);
    if (i >= 0) return 8 + i;
    if (this.keycodes.length === 248) return 8;
    this.keycodes.push(ks);
    return 8 + this.keycodes.length - 1;
  }

  /** the keysym of a keycode (XLookupKeysym's index 0), 0 if none */
  keysymOf(keycode: number): number {
    if (keycode < 8 || keycode >= 8 + this.keycodes.length) return 0;
    return this.keycodes[keycode - 8];
  }

  static keysym(name: string): number {
    return KS[name] ?? 0;
  }

  static keysymName(ks: number): string | null {
    return KS_NAME.get(ks) ?? null;
  }

  private static modOf(ks: number): number {
    switch (ks) {
      case XK_Shift_L: case XK_Shift_R: return ShiftMask;
      case XK_Control_L: case XK_Control_R: return ControlMask;
      case XK_Meta_L: case XK_Meta_R: case XK_Alt_L: case XK_Alt_R: return Mod1Mask;
      case XK_Caps_Lock: return LockMask;
    }
    return 0;
  }

  private deliverKey(press: boolean, name: string): void {
    const ks = KS[name];
    if (ks === undefined) throw new Error(`xstub: unknown keysym ${name}`);
    let w = this.focusWindow !== PointerRoot && this.focusWindow !== None && this.viewable(this.focusWindow)
      ? this.focusWindow : this.windowAt(this.ptrX, this.ptrY);
    w = this.eventWindow(w, press ? KeyPressMask : KeyReleaseMask);
    this.note(`${press ? 'KeyPress' : 'KeyRelease'} ${name} ${this.dname(w)}`);
    if (w) {
      const e = newEv(press ? KeyPress : KeyRelease);
      e.window = w;
      e.root = this.root;
      e.time = this.serverTime();
      const [ax, ay] = this.absPos(w);
      e.x = this.ptrX - ax;
      e.y = this.ptrY - ay;
      e.x_root = this.ptrX;
      e.y_root = this.ptrY;
      e.state = this.modState;
      e.keycode = this.keycodeOf(ks);
      e.same_screen = true;
      this.push(e);
    }
    if (press) this.modState |= XServer.modOf(ks);
    else this.modState &= ~XServer.modOf(ks);
  }

  private motionMask(): number {
    let m = PointerMotionMask;
    if (this.modState & ANY_BUTTON) m |= ButtonMotionMask;
    if (this.modState & Button1Mask) m |= Button1MotionMask;
    if (this.modState & Button2Mask) m |= Button2MotionMask;
    if (this.modState & Button3Mask) m |= Button3MotionMask;
    return m;
  }

  private crossingEvent(type: number, w: number): void {
    const r = this.R(w);
    if (!r || r.kind !== R_WINDOW || !(r.mask & (type === EnterNotify ? EnterWindowMask : LeaveWindowMask))) return;
    const e = newEv(type);
    e.window = w;
    e.root = this.root;
    e.time = this.serverTime();
    const [ax, ay] = this.absPos(w);
    e.x = this.ptrX - ax;
    e.y = this.ptrY - ay;
    e.x_root = this.ptrX;
    e.y_root = this.ptrY;
    e.mode = NotifyNormal;
    e.detail = NotifyAncestor;
    e.same_screen = true;
    e.state = this.modState;
    this.push(e);
  }

  /** a is w or above it */
  private isAncestor(a: number, w: number): boolean {
    for (; w; w = this.R(w) ? this.res[w].parent : 0) if (w === a) return true;
    return false;
  }

  private crossing(): void {
    const now = this.windowAt(this.ptrX, this.ptrY);
    if (now === this.ptrWindow) return;
    for (let w = this.ptrWindow; w && this.R(w) && !this.isAncestor(w, now); w = this.res[w].parent) this.crossingEvent(LeaveNotify, w);
    const chain: number[] = [];
    for (let w = now; w && this.R(w) && !this.isAncestor(w, this.ptrWindow) && chain.length < 64; w = this.res[w].parent) chain.push(w);
    for (let i = chain.length - 1; i >= 0; i--) this.crossingEvent(EnterNotify, chain[i]);
    this.ptrWindow = now;
  }

  private deliverButton(press: boolean, button: number): void {
    const m = press ? ButtonPressMask : ButtonReleaseMask;
    const bm = button === 1 ? Button1Mask : button === 2 ? Button2Mask : button === 3 ? Button3Mask
      : button === 4 ? Button4Mask : button === 5 ? Button5Mask : 0;
    let w: number;
    if (this.grabWin && this.R(this.grabWin) && this.res[this.grabWin].kind === R_WINDOW) w = this.res[this.grabWin].mask & m ? this.grabWin : 0;
    else {
      this.grabWin = 0;
      w = this.eventWindow(this.windowAt(this.ptrX, this.ptrY), m);
    }
    this.note(`${press ? 'ButtonPress' : 'ButtonRelease'} ${button} at ${this.ptrX},${this.ptrY} ${this.dname(w)}`);
    if (w) {
      const e = newEv(press ? ButtonPress : ButtonRelease);
      e.window = w;
      e.root = this.root;
      e.time = this.serverTime();
      const [ax, ay] = this.absPos(w);
      e.x = this.ptrX - ax;
      e.y = this.ptrY - ay;
      e.x_root = this.ptrX;
      e.y_root = this.ptrY;
      e.state = this.modState;
      e.button = button;
      e.same_screen = true;
      this.push(e);
    }
    if (press) {
      if (!this.grabWin && w) this.grabWin = w;
      this.modState |= bm;
    } else {
      this.modState &= ~bm;
      if (!(this.modState & ANY_BUTTON)) {
        this.grabWin = 0;
        this.crossing();
      }
    }
  }

  private motion(): void {
    const m = this.motionMask();
    this.crossing();
    let w: number;
    if (this.grabWin && this.R(this.grabWin) && this.res[this.grabWin].kind === R_WINDOW) w = this.res[this.grabWin].mask & m ? this.grabWin : 0;
    else w = this.eventWindow(this.windowAt(this.ptrX, this.ptrY), m);
    this.note(`MotionNotify ${this.ptrX},${this.ptrY} ${this.dname(w)}`);
    if (!w) return;
    const e = newEv(MotionNotify);
    e.window = w;
    e.root = this.root;
    e.time = this.serverTime();
    const [ax, ay] = this.absPos(w);
    e.x = this.ptrX - ax;
    e.y = this.ptrY - ay;
    e.x_root = this.ptrX;
    e.y_root = this.ptrY;
    e.state = this.modState;
    e.same_screen = true;
    this.push(e);
  }

  private deliverMotion(x: number, y: number, wname: string): void {
    const w = this.windowNamed(wname);
    if (!w) {
      this.note(`motion: no window ${wname}`);
      return;
    }
    let ax = 0, ay = 0;
    if (w !== this.root) [ax, ay] = this.absPos(w);
    this.ptrX = ax + x;
    this.ptrY = ay + y;
    this.motion();
  }

  /** the window COW named so (XSetClassHint) and its interior's place on the root, for the browser */
  windowPlace(name: string): { x: number; y: number; w: number; h: number } | null {
    const w = this.windowNamed(name);
    if (!w || w === this.root) return null;
    const [x, y] = this.absPos(w);
    return { x, y, w: this.res[w].w, h: this.res[w].h };
  }

  /** device input: a line as the coordinator writes it into the X connection */
  input(line: string): void {
    this.inbuf.push(line);
  }

  private inputLine(l: string): void {
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^k (\S+)/))) this.deliverKey(true, m[1]);
    else if ((m = l.match(/^K (\S+)/))) this.deliverKey(false, m[1]);
    else if ((m = l.match(/^b (-?\d+)/))) this.deliverButton(true, Number(m[1]));
    else if ((m = l.match(/^B (-?\d+)/))) this.deliverButton(false, Number(m[1]));
    else if ((m = l.match(/^m (-?\d+) (-?\d+) (\S+)/))) this.deliverMotion(Number(m[1]), Number(m[2]), m[3]);
    else throw new Error(`xstub: bad input line: ${l}`);
  }

  /** the device input written so far becomes X events (in the connection): xstub's pump(), run when the
   * client is woken and after it waited for the connection */
  pump(): void {
    while (this.inbuf.length) this.inputLine(this.inbuf.shift()!);
  }

  // ---------------------------------------------------------------- regions and exposures

  private outerRect(w: number): [number, number, number, number] {
    const [ax, ay] = this.absPos(w);
    const r = this.res[w];
    return [ax - r.bw, ay - r.bw, r.w + 2 * r.bw, r.h + 2 * r.bw];
  }

  /** the part of w's interior that shows, in root coordinates */
  private visible(w: number): Rgn {
    let g: Rgn = [];
    if (!this.isWindow(w) || w === this.root || !this.viewable(w)) return g;
    let [x, y] = this.absPos(w);
    rgnAdd(g, x, y, this.res[w].w, this.res[w].h);
    for (let a = this.res[w].parent; a && a !== this.root; a = this.res[a].parent) {
      [x, y] = this.absPos(a);
      g = rgnClip(g, x, y, this.res[a].w, this.res[a].h);
    }
    g = rgnClip(g, 0, 0, this.res[this.root].w, this.res[this.root].h);
    for (let i = 1; i < this.res.length && g.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.mapped && r.parent === w) {
        const [ox, oy, ow, oh] = this.outerRect(i);
        g = rgnSub(g, ox, oy, ow, oh);
      }
    }
    for (let a = w; a && a !== this.root && g.length; a = this.res[a].parent) {
      for (let i = 1; i < this.res.length && g.length; i++) {
        const r = this.res[i];
        if (i !== a && r.kind === R_WINDOW && r.mapped && r.parent === this.res[a].parent && r.stack > this.res[a].stack) {
          const [ox, oy, ow, oh] = this.outerRect(i);
          g = rgnSub(g, ox, oy, ow, oh);
        }
      }
    }
    return g;
  }

  private before: Rgn[] | null = null;
  private nbefore = 0;

  private snapBegin(): void {
    this.nbefore = this.res.length;
    this.before = new Array(this.res.length);
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      this.before[i] = r.kind === R_WINDOW && i !== this.root && r.mask & ExposureMask ? this.visible(i) : [];
    }
  }

  private exposeRect(w: number, x: number, y: number, wd: number, ht: number): void {
    const e = newEv(Expose);
    e.window = w;
    e.x = x;
    e.y = y;
    e.width = wd;
    e.height = ht;
    e.count = 0;
    this.push(e);
  }

  /** one Expose with the bounding box of g (root coordinates), if g is not empty */
  private exposeRegion(w: number, g: Rgn): void {
    if (!g.length) return;
    let x1 = 1 << 30, y1 = 1 << 30, x2 = -(1 << 30), y2 = -(1 << 30);
    for (const r of g) {
      if (r.x < x1) x1 = r.x;
      if (r.y < y1) y1 = r.y;
      if (r.x + r.w > x2) x2 = r.x + r.w;
      if (r.y + r.h > y2) y2 = r.y + r.h;
    }
    const [ax, ay] = this.absPos(w);
    this.exposeRect(w, x1 - ax, y1 - ay, x2 - x1, y2 - y1);
  }

  private snapTree(w: number): void {
    if (w !== this.root && w < this.res.length && this.res[w].kind === R_WINDOW && this.res[w].mask & ExposureMask) {
      let now = this.visible(w);
      if (w < this.nbefore) for (const b of this.before![w]) now = rgnSub(now, b.x, b.y, b.w, b.h);
      this.exposeRegion(w, now);
    }
    const kids: number[] = [];
    for (let i = 1; i < this.res.length && kids.length < 512; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === w && r.mapped) kids.push(i);
    }
    while (kids.length > 0) {
      let b = 0;
      for (let k = 1; k < kids.length; k++) if (this.res[kids[k]].stack > this.res[kids[b]].stack) b = k;
      this.snapTree(kids[b]);
      kids[b] = kids[kids.length - 1];
      kids.pop();
    }
  }

  private snapEnd(): void {
    this.snapTree(this.root);
    this.before = null;
    this.nbefore = 0;
    this.crossing();
    this.changed();
  }

  /** moving a window moves its contents: its subtree's old visible regions move along */
  private snapMove(w: number, dx: number, dy: number): void {
    for (let i = 1; i < this.nbefore; i++) {
      if (this.before![i].length && this.isAncestor(w, i)) for (const r of this.before![i]) { r.x += dx; r.y += dy; }
    }
  }

  /** ForgetGravity: a resized window's contents are lost */
  private snapForget(w: number): void {
    if (w < this.nbefore) this.before![w] = [];
  }

  // ---------------------------------------------------------------- display

  openDisplay(): void {
    this.call(`XOpenDisplay fd=${this.fd}`);
  }

  closeDisplay(): void {
    this.call('XCloseDisplay');
  }

  bell(percent: number): void {
    this.call(`XBell ${i32(percent)}`);
  }

  /** XSendEvent: an empty mask sends the event to the client that made the window, this one */
  sendEvent(w: number, prop: number, mask: number, ev: XEv): void {
    this.call(`XSendEvent ${this.dname(w)} prop=${i32(prop)} mask=${lhex(mask)} type=${i32(ev.type)}`);
    if (mask === NoEventMask && this.isWindow(w)) {
      const e: XEv = { ...ev, data: ev.data.slice() };
      e.send_event = true;
      e.window = w;
      if (e.type === ClientMessage && e.format === 32) {
        // the wire carries 32 bits; Xlib sign-extends them back into longs
        for (let i = 0; i < 5; i++) e.data[i] = Number(BigInt.asIntN(32, BigInt.asUintN(64, BigInt(Math.trunc(e.data[i])))));
      }
      this.push(e);
    }
  }

  // ---------------------------------------------------------------- windows

  private mkwin(parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number, bg: number, cls: number): number {
    const id = this.newRes(R_WINDOW);
    const r = this.res[id];
    r.parent = parent;
    r.x = i32(x); r.y = i32(y); r.w = i32(w); r.h = i32(h); r.bw = i32(bw);
    r.depth = depth || 24;
    r.bg = bg;
    r.cls = cls;
    return id;
  }

  createWindow(parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number, cls: number,
               mask: number, a: { background_pixel: number; border_pixel: number; event_mask: number }): number {
    const id = this.mkwin(parent, x, y, w, h, bw, depth, mask & CWBackPixel ? a.background_pixel : 0, cls);
    if (mask & CWEventMask) this.res[id].mask = a.event_mask;
    if (mask & CWBorderPixel) this.res[id].border = a.border_pixel;
    let t = `XCreateWindow ${this.dname(id)} parent=${this.dname(parent)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)} bw=${u32(bw)}`;
    if (mask & CWBackPixel) t += ` bg=${hex6(a.background_pixel)}`;
    if (mask & CWBorderPixel) t += ` border=${hex6(a.border_pixel)}`;
    if (mask & CWEventMask) t += ` events=${lhex(a.event_mask)}`;
    this.call(t);
    return id;
  }

  createSimpleWindow(parent: number, x: number, y: number, w: number, h: number, bw: number, border: number, bg: number): number {
    const id = this.mkwin(parent, x, y, w, h, bw, 24, bg, InputOutput);
    this.res[id].border = border;
    this.call(`XCreateSimpleWindow ${this.dname(id)} parent=${this.dname(parent)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)} bw=${u32(bw)} border=${hex6(border)} bg=${hex6(bg)}`);
    return id;
  }

  private destroyTree(w: number): void {
    for (let i = 1; i < this.res.length; i++) if (this.res[i].kind === R_WINDOW && this.res[i].parent === w) this.destroyTree(i);
    const r = this.R(w);
    if (r) { r.kind = R_FREE; r.mapped = false; r.surf = null; }
    if (this.grabWin === w) this.grabWin = 0;
    if (this.focusWindow === w) this.focusWindow = PointerRoot;
  }

  destroyWindow(w: number): void {
    this.call(`XDestroyWindow ${this.dname(w)}`);
    if (!this.isWindow(w) || w === this.root) return;
    this.snapBegin();
    this.destroyTree(w);
    if (!this.isWindow(this.ptrWindow)) this.ptrWindow = this.windowAt(this.ptrX, this.ptrY);
    this.snapEnd();
  }

  private doMap(w: number, raised: boolean): void {
    const r = this.R(w);
    this.call(`${raised ? 'XMapRaised' : 'XMapWindow'} ${this.dname(w)}`);
    if (!r || r.kind !== R_WINDOW) return;
    if (r.mapped && !raised) return;
    this.snapBegin();
    if (raised) r.stack = ++this.stackCounter;
    if (!r.mapped && r.mask & StructureNotifyMask) {
      const e = newEv(MapNotify);
      e.event = w;
      e.window = w;
      this.push(e);
    }
    r.mapped = true;
    this.snapEnd();
  }

  mapWindow(w: number): void { this.doMap(w, false); }
  mapRaised(w: number): void { this.doMap(w, true); }

  raiseWindow(w: number): void {
    this.call(`XRaiseWindow ${this.dname(w)}`);
    if (!this.isWindow(w)) return;
    this.snapBegin();
    this.res[w].stack = ++this.stackCounter;
    this.snapEnd();
  }

  mapSubwindows(w: number): void {
    this.call(`XMapSubwindows ${this.dname(w)}`);
    this.snapBegin();
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === w && !r.mapped) r.mapped = true;
    }
    this.snapEnd();
  }

  unmapWindow(w: number): void {
    this.call(`XUnmapWindow ${this.dname(w)}`);
    if (!this.isWindow(w) || !this.res[w].mapped) return;
    this.snapBegin();
    this.res[w].mapped = false;
    if (this.grabWin && this.isAncestor(w, this.grabWin)) this.grabWin = 0;
    this.snapEnd();
  }

  private moveResize(w: number, x: number, y: number, width: number, height: number, move: boolean, resize: boolean): void {
    const r = this.R(w);
    if (!r || r.kind !== R_WINDOW) return;
    this.snapBegin();
    const dx = move ? x - r.x : 0, dy = move ? y - r.y : 0;
    if (move) { r.x = x; r.y = y; this.snapMove(w, dx, dy); }
    if (resize && (width !== r.w || height !== r.h)) {
      r.w = width;
      r.h = height;
      r.surf = null;
      this.snapForget(w);
    }
    this.snapEnd();
  }

  moveWindow(w: number, x: number, y: number): void {
    this.call(`XMoveWindow ${this.dname(w)} ${i32(x)},${i32(y)}`);
    this.moveResize(w, i32(x), i32(y), 0, 0, true, false);
  }

  resizeWindow(w: number, width: number, height: number): void {
    this.call(`XResizeWindow ${this.dname(w)} ${u32(width)}x${u32(height)}`);
    this.moveResize(w, 0, 0, i32(width), i32(height), false, true);
  }

  moveResizeWindow(w: number, x: number, y: number, width: number, height: number): void {
    this.call(`XMoveResizeWindow ${this.dname(w)} ${i32(x)},${i32(y)} ${u32(width)}x${u32(height)}`);
    this.moveResize(w, i32(x), i32(y), i32(width), i32(height), true, true);
  }

  private bgText(w: number): string {
    const r = this.R(w);
    if (!r) return '';
    if (r.bgpix === ParentRelative) return ' bg=parent';
    if (r.bgpix !== None) return ` bgpix=${this.dname(r.bgpix)}`;
    return ` bg=${hex6(r.bg)}`;
  }

  clearWindow(w: number): void {
    this.call(`XClearWindow ${this.dname(w)}${this.bgText(w)}`);
    if (this.render) this.paintBackground(w, 0, 0, 0, 0);
  }

  clearArea(w: number, x: number, y: number, width: number, height: number, exposures: number): void {
    x = i32(x); y = i32(y);
    this.call(`XClearArea ${this.dname(w)} ${x},${y} ${u32(width)}x${u32(height)} exposures=${i32(exposures)}${this.bgText(w)}`);
    if (this.render) this.paintBackground(w, x, y, u32(width), u32(height));
    if (exposures && this.isWindow(w) && this.res[w].mask & ExposureMask) {
      // a width or height of 0: to the window's edge
      const wd = width ? i32(width) : this.res[w].w - x, ht = height ? i32(height) : this.res[w].h - y;
      let g = this.visible(w);
      const [ax, ay] = this.absPos(w);
      g = rgnClip(g, ax + x, ay + y, wd, ht);
      this.exposeRegion(w, g);
    }
  }

  setWindowBackground(w: number, bg: number): void {
    this.call(`XSetWindowBackground ${this.dname(w)} ${hex6(bg)}`);
    const r = this.R(w);
    if (r) { r.bg = bg; r.bgpix = None; }
  }

  setWindowBackgroundPixmap(w: number, p: number): void {
    this.call(`XSetWindowBackgroundPixmap ${this.dname(w)} ${p === ParentRelative ? 'parent' : p === None ? 'none' : this.dname(p)}`);
    const r = this.R(w);
    if (r) r.bgpix = p;
  }

  setWindowBorder(w: number, pixel: number): void {
    this.call(`XSetWindowBorder ${this.dname(w)} ${hex6(pixel)}`);
    const r = this.R(w);
    if (r) { r.border = pixel; this.changed(); }
  }

  setWindowBorderPixmap(w: number, p: number): void {
    this.call(`XSetWindowBorderPixmap ${this.dname(w)} ${p === CopyFromParent ? 'parent' : this.dname(p)}`);
  }

  changeWindowAttributes(w: number, mask: number, a: { background_pixel: number; event_mask: number }): void {
    const r = this.R(w);
    if (!r) return;
    if (mask & CWBackPixel) { r.bg = a.background_pixel; r.bgpix = None; }
    if (mask & CWEventMask) r.mask = a.event_mask;
    let t = `XChangeWindowAttributes ${this.dname(w)} mask=${lhex(mask)}`;
    if (mask & CWBackPixel) t += ` bg=${hex6(a.background_pixel)}`;
    if (mask & CWEventMask) t += ` events=${lhex(a.event_mask)}`;
    this.call(t);
  }

  selectInput(w: number, mask: number): void {
    this.call(`XSelectInput ${this.dname(w)} ${lhex(mask)}`);
    const r = this.R(w);
    if (r) r.mask = mask;
  }

  defineCursor(w: number, c: number): void {
    this.call(`XDefineCursor ${this.dname(w)} ${this.dname(c)}`);
  }

  storeName(w: number, name: number[]): void {
    this.call(`XStoreName ${this.dname(w)} ${jstrLog(name)}`);
    const r = this.R(w);
    if (r) r.name = String.fromCharCode(...name.slice(0, 63));
  }

  setIconName(w: number, name: number[]): void {
    this.call(`XSetIconName ${this.dname(w)} ${jstrLog(name)}`);
  }

  setClassHint(w: number, resName: number[], resClass: number[]): void {
    this.call(`XSetClassHint ${this.dname(w)} ${jstrLog(resName)} ${jstrLog(resClass)}`);
    const r = this.R(w);
    if (r) r.wmname = String.fromCharCode(...resName.slice(0, 63));
  }

  setWMNormalHints(w: number, h: { flags: number; min_width: number; min_height: number; max_width: number; max_height: number }): void {
    let t = `XSetWMNormalHints ${this.dname(w)} flags=${lhex(h.flags)}`;
    if (h.flags & PMinSize) t += ` min=${i32(h.min_width)}x${i32(h.min_height)}`;
    if (h.flags & PMaxSize) t += ` max=${i32(h.max_width)}x${i32(h.max_height)}`;
    this.call(t);
  }

  setWMHints(w: number, h: { flags: number; input: number; initial_state: number; icon_window: number; window_group: number }): void {
    let t = `XSetWMHints ${this.dname(w)} flags=${lhex(h.flags)}`;
    if (h.flags & InputHint) t += ` input=${i32(h.input)}`;
    if (h.flags & StateHint) t += ` state=${i32(h.initial_state)}`;
    if (h.flags & IconWindowHint) t += ` iconwin=${this.dname(h.icon_window)}`;
    if (h.flags & WindowGroupHint) t += ` group=${this.dname(h.window_group)}`;
    this.call(t);
  }

  setCommand(w: number, argv: number[][]): void {
    this.call(`XSetCommand ${this.dname(w)}${argv.map((a) => ' ' + jstrLog(a)).join('')}`);
  }

  changeProperty(w: number, prop: number, type: number, format: number, mode: number, n: number): void {
    this.call(`XChangeProperty ${this.dname(w)} prop=${prop} type=${type} format=${i32(format)} mode=${i32(mode)} n=${i32(n)}`);
  }

  deleteProperty(w: number, prop: number): void {
    this.call(`XDeleteProperty ${this.dname(w)} prop=${prop}`);
  }

  /** no atoms exist but the predefined ones and those the client interned (no window manager) */
  internAtom(name: string, onlyIfExists: boolean): number {
    this.xread();
    const i = this.atomNames.indexOf(name);
    if (i >= 0) return 100 + i;
    if (onlyIfExists) return None;
    if (this.atomNames.length < 64) this.atomNames.push(name);
    else this.atomNames.length++;
    return 100 + this.atomNames.length - 1;
  }

  getWindowAttributes(w: number): { x: number; y: number; width: number; height: number; border_width: number; depth: number; map_state: number; mask: number } | null {
    this.xread();
    const r = this.R(w);
    if (!r) return null;
    return {
      x: r.x, y: r.y, width: r.w, height: r.h, border_width: r.bw, depth: r.depth,
      map_state: this.viewable(w) ? IsViewable : r.mapped ? IsUnviewable : IsUnmapped, mask: r.mask,
    };
  }

  getGeometry(d: number): { x: number; y: number; w: number; h: number; bw: number; depth: number } | null {
    this.xread();
    const r = this.R(d);
    if (!r) return null;
    return { x: r.x, y: r.y, w: r.w, h: r.h, bw: r.bw, depth: r.depth };
  }

  translateCoordinates(src: number, dst: number, sx: number, sy: number): { x: number; y: number; child: number } {
    this.xread();
    const [ax, ay] = this.absPos(src);
    const [bx, by] = this.absPos(dst);
    let child = None;
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind !== R_WINDOW || r.parent !== dst || !r.mapped) continue;
      const [cx, cy, cw, ch] = this.outerRect(i);
      if (sx + ax >= cx && sy + ay >= cy && sx + ax < cx + cw && sy + ay < cy + ch && (child === None || r.stack > this.res[child].stack)) child = i;
    }
    return { x: sx + ax - bx, y: sy + ay - by, child };
  }

  setInputFocus(w: number): void {
    this.call(`XSetInputFocus ${this.dname(w)}`);
    this.focusWindow = w;
  }

  warpPointer(dst: number, dx: number, dy: number): void {
    dx = i32(dx); dy = i32(dy);
    if (dst) {
      const [ax, ay] = this.absPos(dst);
      this.ptrX = ax + dx;
      this.ptrY = ay + dy;
    } else {
      this.ptrX += dx;
      this.ptrY += dy;
    }
    this.call(`XWarpPointer ${this.dname(dst)} ${dx},${dy} -> ${this.ptrX},${this.ptrY}`);
    this.motion();
  }

  queryPointer(w: number): { root: number; child: number; rx: number; ry: number; wx: number; wy: number; mask: number } {
    this.xread();
    const [ax, ay] = this.absPos(w);
    let child = None;
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind !== R_WINDOW || r.parent !== w || !r.mapped) continue;
      const [cx, cy, cw, ch] = this.outerRect(i);
      if (this.ptrX >= cx && this.ptrY >= cy && this.ptrX < cx + cw && this.ptrY < cy + ch && (child === None || r.stack > this.res[child].stack)) child = i;
    }
    return { root: this.root, child, rx: this.ptrX, ry: this.ptrY, wx: this.ptrX - ax, wy: this.ptrY - ay, mask: this.modState };
  }

  grabPointer(w: number, ownerEvents: number, events: number, confine: number, cursor: number): number {
    this.xread();
    this.call(`XGrabPointer ${this.dname(w)} owner=${i32(ownerEvents)} events=${xhex(events)} confine=${this.dname(confine)} cursor=${this.dname(cursor)}`);
    return 0;
  }

  ungrabPointer(): void { this.call('XUngrabPointer'); }

  grabKeyboard(w: number, ownerEvents: number): number {
    this.xread();
    this.call(`XGrabKeyboard ${this.dname(w)} owner=${i32(ownerEvents)}`);
    return 0;
  }

  ungrabKeyboard(): void { this.call('XUngrabKeyboard'); }
  autoRepeatOn(): void { this.call('XAutoRepeatOn'); }
  autoRepeatOff(): void { this.call('XAutoRepeatOff'); }

  private colorText(k: string, c: { red: number; green: number; blue: number }): string {
    const h4 = (v: number) => (v & 0xffff).toString(16).padStart(4, '0');
    return ` ${k}=${h4(c.red)},${h4(c.green)},${h4(c.blue)}`;
  }

  createPixmapCursor(s: number, m: number, fg: { red: number; green: number; blue: number }, bg: { red: number; green: number; blue: number }, x: number, y: number): number {
    const id = this.newRes(R_CURSOR);
    this.call(`XCreatePixmapCursor ${this.dname(id)} src=${this.dname(s)} mask=${this.dname(m)}${this.colorText('fg', fg)}${this.colorText('bg', bg)} hot=${u32(x)},${u32(y)}`);
    return id;
  }

  createFontCursor(shape: number): number {
    const id = this.newRes(R_CURSOR);
    this.call(`XCreateFontCursor ${this.dname(id)} shape=${u32(shape)}`);
    return id;
  }

  recolorCursor(c: number, fg: { red: number; green: number; blue: number }, bg: { red: number; green: number; blue: number }): void {
    this.call(`XRecolorCursor ${this.dname(c)}${this.colorText('fg', fg)}${this.colorText('bg', bg)}`);
  }

  freeCursor(c: number): void {
    this.call(`XFreeCursor ${this.dname(c)}`);
    const r = this.R(c);
    if (r && r.kind === R_CURSOR) r.kind = R_FREE;
  }

  // ---------------------------------------------------------------- colours

  /** a named colour (a LookupColor round trip) or #rgb: [r, g, b] in 16 bits, or null */
  parseColor(spec: string): [number, number, number] | null {
    if (spec[0] === '#') {
      let n = spec.length - 1;
      if (n === 0 || n % 3 || n > 12) return null;
      n /= 3;
      const v: number[] = [];
      for (let i = 0; i < 3; i++) {
        const part = spec.substr(1 + i * n, n);
        if (!/^[0-9a-fA-F]+$/.test(part)) return null;
        v.push((parseInt(part, 16) * 2 ** (16 - 4 * n)) & 0xffff);
      }
      return [v[0], v[1], v[2]];
    }
    this.xread();
    const lc = spec.toLowerCase();
    for (const [name, r, g, b] of NAMED_COLORS) if (name === lc) return [r * 0x101, g * 0x101, b * 0x101];
    return null;
  }

  /** XAllocColor: rounds to 8 bits per channel; the pixel is 0xRRGGBB */
  allocColor(red: number, green: number, blue: number): [number, number, number, number] {
    this.xread();
    const r = (red & 0xffff) >> 8, g = (green & 0xffff) >> 8, b = (blue & 0xffff) >> 8;
    return [(r << 16) | (g << 8) | b, r * 0x101, g * 0x101, b * 0x101];
  }

  allocColorCells(): number {
    this.xread();
    return 0;
  }

  storeColor(cm: number, pixel: number, c: { red: number; green: number; blue: number }): void {
    this.call(`XStoreColor ${this.dname(cm)} pixel=${hex6(pixel)}${this.colorText('rgb', c)}`);
  }

  queryColor(pixel: number): [number, number, number] {
    this.xread();
    const p = Number(BigInt.asUintN(64, BigInt(Math.trunc(pixel))) & 0xffffffn);
    return [((p >> 16) & 255) * 0x101, ((p >> 8) & 255) * 0x101, (p & 255) * 0x101];
  }

  createColormap(): number {
    return this.newRes(R_CMAP);
  }

  // ---------------------------------------------------------------- pixmaps

  /** a pixmap the "X server" holds, made without a log line (the Imlib2 stub) */
  newPixmap(w: number, h: number, depth: number): number {
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = w; r.h = h; r.depth = depth;
    return id;
  }

  createPixmap(d: number, w: number, h: number, depth: number): number {
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = i32(w); r.h = i32(h); r.depth = i32(depth);
    this.call(`XCreatePixmap ${this.dname(id)} for=${this.dname(d)} ${u32(w)}x${u32(h)} depth=${u32(depth)}`);
    return id;
  }

  freePixmap(p: number): void {
    this.call(`XFreePixmap ${this.dname(p)}`);
    const r = this.R(p);
    if (r && r.kind === R_PIXMAP) { r.kind = R_FREE; r.surf = null; }
  }

  private hexBytes(data: number[], n: number): string {
    let t = '';
    for (let i = 0; i < n; i++) t += ((data[i] ?? 0) & 255).toString(16).padStart(2, '0');
    return t;
  }

  /** the bits of an X bitmap (rows of (w+7)/8 bytes, LSB first) as a surface of 0/1, or fg/bg pixels */
  private bitmapSurface(data: number[], w: number, h: number, depth: number, fg = 1, bg = 0): Rs.Surface {
    const s = Rs.newSurface(w, h, depth);
    const bpr = (w + 7) >> 3;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const bit = ((data[y * bpr + (x >> 3)] ?? 0) >> (x & 7)) & 1;
        s.data[y * w + x] = depth === 1 ? bit : bit ? fg & 0xffffff : bg & 0xffffff;
      }
    }
    return s;
  }

  createBitmapFromData(d: number, data: number[], w: number, h: number): number {
    w = u32(w); h = u32(h);
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = w; r.h = h; r.depth = 1;
    this.call(`XCreateBitmapFromData ${this.dname(id)} for=${this.dname(d)} ${w}x${h} ${this.hexBytes(data, ((w + 7) >> 3) * h)}`);
    if (this.render) r.surf = this.bitmapSurface(data, w, h, 1);
    return id;
  }

  createPixmapFromBitmapData(d: number, data: number[], w: number, h: number, fg: number, bg: number, depth: number): number {
    w = u32(w); h = u32(h);
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = w; r.h = h; r.depth = i32(depth);
    this.call(`XCreatePixmapFromBitmapData ${this.dname(id)} for=${this.dname(d)} ${w}x${h} fg=${hex6(fg)} bg=${hex6(bg)} depth=${u32(depth)} ${this.hexBytes(data, ((w + 7) >> 3) * h)}`);
    if (this.render) r.surf = this.bitmapSurface(data, w, h, r.depth === 1 ? 1 : 24, Number(BigInt.asUintN(64, BigInt(Math.trunc(fg))) & 0xffffffn), Number(BigInt.asUintN(64, BigInt(Math.trunc(bg))) & 0xffffffn));
    return id;
  }

  /** XReadBitmapFile of the file's text (null: it does not exist) */
  readBitmapFile(d: number, file: number[], text: string | null): { status: number; w?: number; h?: number; pixmap?: number; xhot?: number; yhot?: number } {
    const fname = jstrLog(file);
    if (text === null) {
      this.call(`XReadBitmapFile ${fname} BitmapOpenFailed`);
      return { status: BitmapOpenFailed };
    }
    let width = 0, height = 0, xhot = -1, yhot = -1, inbits = false;
    const data: number[] = [];
    for (const line of text.split(/(?<=\n)/)) {
      const m = line.match(/^#define\s+(\S+)\s+([-+]?\d+)/);
      if (m) {
        const name = m[1], v = parseInt(m[2], 10);
        if (name.endsWith('_width')) width = v;
        else if (name.endsWith('_height')) height = v;
        else if (name.endsWith('_x_hot')) xhot = v;
        else if (name.endsWith('_y_hot')) yhot = v;
        continue;
      }
      if (!inbits && line.includes('{')) inbits = true;
      if (inbits) {
        let s = line.includes('{') ? line.slice(line.indexOf('{') + 1) : line;
        for (;;) {
          const k = s.search(/[0-9a-fA-F}]/);
          if (k < 0 || s[k] === '}') break;
          s = s.slice(k);
          const n = s.match(/^(0[xX][0-9a-fA-F]+|0[0-7]*|[1-9]\d*)/);
          if (!n) break;
          data.push(Number(n[1].startsWith('0x') || n[1].startsWith('0X') ? parseInt(n[1], 16) : n[1].length > 1 && n[1][0] === '0' ? parseInt(n[1], 8) : parseInt(n[1], 10)) & 255);
          s = s.slice(n[1].length);
        }
      }
    }
    if (width <= 0 || height <= 0 || data.length < ((width + 7) >> 3) * height) {
      this.call(`XReadBitmapFile ${fname} BitmapFileInvalid`);
      return { status: BitmapFileInvalid };
    }
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = width; r.h = height; r.depth = 1;
    this.call(`XReadBitmapFile ${fname} ${this.dname(id)} for=${this.dname(d)} ${width}x${height} hot=${xhot},${yhot} ${this.hexBytes(data, ((width + 7) >> 3) * height)}`);
    if (this.render) r.surf = this.bitmapSurface(data, width, height, 1);
    return { status: BitmapSuccess, w: width, h: height, pixmap: id, xhot, yhot };
  }

  /** the size of a drawable (Imlib2's stub renders images for one) */
  size(d: number): [number, number, number] {
    const r = this.R(d);
    return r ? [r.w, r.h, r.depth] : [0, 0, 0];
  }

  // ---------------------------------------------------------------- GCs

  private gcDefaults(): GCValues {
    return {
      function: GXcopy, plane_mask: 0xffffffff, foreground: 0, background: 1, line_width: 0, line_style: LineSolid,
      cap_style: CapButt, join_style: JoinMiter, fill_style: FillSolid, fill_rule: EvenOddRule, arc_mode: ArcPieSlice,
      tile: 0, stipple: 0, ts_x_origin: 0, ts_y_origin: 0, font: this.defaultFont, subwindow_mode: ClipByChildren,
      graphics_exposures: 1, clip_x_origin: 0, clip_y_origin: 0, clip_mask: None, dash_offset: 0, dashes: 4,
    };
  }

  gcApply(gc: GC, mask: number, v: Partial<GCValues>): void {
    const g = gc.v;
    if (mask & GCFunction) g.function = v.function!;
    if (mask & GCPlaneMask) g.plane_mask = v.plane_mask!;
    if (mask & GCForeground) g.foreground = v.foreground!;
    if (mask & GCBackground) g.background = v.background!;
    if (mask & GCLineWidth) g.line_width = v.line_width!;
    if (mask & GCLineStyle) g.line_style = v.line_style!;
    if (mask & GCCapStyle) g.cap_style = v.cap_style!;
    if (mask & GCJoinStyle) g.join_style = v.join_style!;
    if (mask & GCFillStyle) g.fill_style = v.fill_style!;
    if (mask & GCFillRule) g.fill_rule = v.fill_rule!;
    if (mask & GCTile) g.tile = v.tile!;
    if (mask & GCStipple) g.stipple = v.stipple!;
    if (mask & GCTileStipXOrigin) g.ts_x_origin = v.ts_x_origin!;
    if (mask & GCTileStipYOrigin) g.ts_y_origin = v.ts_y_origin!;
    if (mask & GCFont) g.font = v.font!;
    if (mask & GCSubwindowMode) g.subwindow_mode = v.subwindow_mode!;
    if (mask & GCGraphicsExposures) g.graphics_exposures = v.graphics_exposures!;
    if (mask & GCClipXOrigin) g.clip_x_origin = v.clip_x_origin!;
    if (mask & GCClipYOrigin) g.clip_y_origin = v.clip_y_origin!;
    if (mask & GCClipMask) g.clip_mask = v.clip_mask!;
    if (mask & GCDashOffset) g.dash_offset = v.dash_offset!;
    if (mask & GCDashList) { g.dashes = v.dashes!; gc.dashes = [v.dashes! & 255, v.dashes! & 255]; }
    if (mask & GCArcMode) g.arc_mode = v.arc_mode!;
  }

  createGC(mask: number, v: Partial<GCValues> | null): GC {
    const gc: GC = { gid: this.newRes(R_GC), v: this.gcDefaults(), dashes: [4, 4] };
    if (v) this.gcApply(gc, mask, v);
    return gc;
  }

  freeGC(gc: GC): void {
    const r = this.R(gc.gid);
    if (r) r.kind = R_FREE;
  }

  setDashes(gc: GC, off: number, list: number[]): void {
    gc.v.dash_offset = off;
    gc.dashes = list.slice(0, 16);
  }

  // ---------------------------------------------------------------- fonts

  loadQueryFont(name: string, nameBytes: number[]): FontInfo | null {
    this.xread();
    const lc = name.toLowerCase();
    const f = FONTS.find((x) => x[0].toLowerCase() === lc);
    if (!f) {
      this.call(`XLoadQueryFont ${jstrLog(nameBytes)} none`);
      return null;
    }
    const id = this.newRes(R_FONT);
    const fi: FontInfo = { fid: id, name, width: f[1], ascent: f[2], descent: f[3] };
    this.fonts.set(id, fi);
    this.call(`XLoadQueryFont ${jstrLog(nameBytes)} ${this.dname(id)} width=${f[1]} ascent=${f[2]} descent=${f[3]}`);
    return fi;
  }

  queryFont(id: number): FontInfo | null {
    this.xread();
    return this.fonts.get(id) ?? null;
  }

  freeFont(fid: number): void {
    this.call(`XFreeFont ${this.dname(fid)}`);
  }

  // ---------------------------------------------------------------- drawing

  private pointsText(p: Pt[]): string {
    let t = '';
    for (const q of p) t += ` ${q.x << 16 >> 16},${q.y << 16 >> 16}`;
    return t;
  }

  drawLine(d: number, gc: GC, x1: number, y1: number, x2: number, y2: number): void {
    this.call(`XDrawLine ${this.dname(d)}${this.gcText(gc)} ${i32(x1)},${i32(y1)} ${i32(x2)},${i32(y2)}`);
    const s = this.target(d);
    if (s) Rs.drawLines(s, this.rgc(gc), [[i32(x1), i32(y1)], [i32(x2), i32(y2)]], true);
  }

  drawLines(d: number, gc: GC, p: Pt[], mode: number): void {
    this.call(`XDrawLines ${this.dname(d)}${this.gcText(gc)} mode=${i32(mode)} n=${p.length}${this.pointsText(p)}`);
    const s = this.target(d);
    if (s) Rs.drawLines(s, this.rgc(gc), this.absPoints(p, mode), false);
  }

  drawPoint(d: number, gc: GC, x: number, y: number): void {
    this.call(`XDrawPoint ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)}`);
    const s = this.target(d);
    if (s) Rs.point(s, this.rgc(gc), i32(x), i32(y));
  }

  drawPoints(d: number, gc: GC, p: Pt[], mode: number): void {
    this.call(`XDrawPoints ${this.dname(d)}${this.gcText(gc)} mode=${i32(mode)} n=${p.length}${this.pointsText(p)}`);
    const s = this.target(d);
    if (s) { const g = this.rgc(gc); for (const [x, y] of this.absPoints(p, mode)) Rs.point(s, g, x, y); }
  }

  drawSegments(d: number, gc: GC, sg: Seg[]): void {
    const s16 = (v: number) => v << 16 >> 16;
    let t = `XDrawSegments ${this.dname(d)}${this.gcText(gc)} n=${sg.length}`;
    for (const q of sg) t += ` ${s16(q.x1)},${s16(q.y1)},${s16(q.x2)},${s16(q.y2)}`;
    this.call(t);
    const s = this.target(d);
    if (s) {
      const pts: Rs.Pt[] = [];
      for (const q of sg) pts.push([s16(q.x1), s16(q.y1)], [s16(q.x2), s16(q.y2)]);
      Rs.drawLines(s, this.rgc(gc), pts, true);
    }
  }

  drawRectangle(d: number, gc: GC, x: number, y: number, w: number, h: number): void {
    this.call(`XDrawRectangle ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)}`);
    const s = this.target(d);
    if (s && u32(w) <= 0x7fffffff && u32(h) <= 0x7fffffff) {
      x = i32(x); y = i32(y); w = u32(w); h = u32(h);
      Rs.drawLines(s, this.rgc(gc), [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], false);
    }
  }

  fillRectangle(d: number, gc: GC, x: number, y: number, w: number, h: number): void {
    this.call(`XFillRectangle ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)}`);
    const s = this.target(d);
    if (s && u32(w) <= 0x7fffffff && u32(h) <= 0x7fffffff) Rs.fillRect(s, this.rgc(gc), i32(x), i32(y), u32(w), u32(h));
  }

  fillRectangles(d: number, gc: GC, r: Rect[]): void {
    const s16 = (v: number) => v << 16 >> 16, u16 = (v: number) => v & 0xffff;
    let t = `XFillRectangles ${this.dname(d)}${this.gcText(gc)} n=${r.length}`;
    for (const q of r) t += ` ${s16(q.x)},${s16(q.y)},${u16(q.width)}x${u16(q.height)}`;
    this.call(t);
    const s = this.target(d);
    if (s) { const g = this.rgc(gc); for (const q of r) Rs.fillRect(s, g, s16(q.x), s16(q.y), u16(q.width), u16(q.height)); }
  }

  fillPolygon(d: number, gc: GC, p: Pt[], shape: number, mode: number): void {
    this.call(`XFillPolygon ${this.dname(d)}${this.gcText(gc)} shape=${i32(shape)} mode=${i32(mode)} n=${p.length}${this.pointsText(p)}`);
    const s = this.target(d);
    if (s) Rs.fillPolys(s, this.rgc(gc), [this.absPoints(p, mode)], gc.v.fill_rule);
  }

  drawArc(d: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
    this.call(`XDrawArc ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)} ${i32(a1)} ${i32(a2)}`);
    const s = this.target(d);
    if (s && u32(w) <= 0xffff && u32(h) <= 0xffff) Rs.drawArc(s, this.rgc(gc), i32(x), i32(y), u32(w), u32(h), i32(a1), i32(a2));
  }

  drawArcs(d: number, gc: GC, a: ArcSpec[]): void {
    const s16 = (v: number) => v << 16 >> 16, u16 = (v: number) => v & 0xffff;
    let t = `XDrawArcs ${this.dname(d)}${this.gcText(gc)} n=${a.length}`;
    for (const q of a) t += ` ${s16(q.x)},${s16(q.y)},${u16(q.width)}x${u16(q.height)},${s16(q.angle1)},${s16(q.angle2)}`;
    this.call(t);
    const s = this.target(d);
    if (s) { const g = this.rgc(gc); for (const q of a) Rs.drawArc(s, g, s16(q.x), s16(q.y), u16(q.width), u16(q.height), s16(q.angle1), s16(q.angle2)); }
  }

  fillArc(d: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
    this.call(`XFillArc ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)} ${u32(w)}x${u32(h)} ${i32(a1)} ${i32(a2)}`);
    const s = this.target(d);
    if (s && u32(w) <= 0xffff && u32(h) <= 0xffff) Rs.fillArc(s, this.rgc(gc), i32(x), i32(y), u32(w), u32(h), i32(a1), i32(a2));
  }

  drawString(d: number, gc: GC, x: number, y: number, bytes: number[], image: boolean): void {
    this.call(`${image ? 'XDrawImageString' : 'XDrawString'} ${this.dname(d)}${this.gcText(gc)} ${i32(x)},${i32(y)} ${jstrLog(bytes)}`);
    const s = this.target(d);
    if (s && bytes.length) {
      const f = this.fonts.get(gc.v.font);
      const g = glyphsFor(f ? f.name : 'fixed');
      const rg = this.rgc(gc);
      if (image) {
        // the cell boxes in the background colour first
        const fi = f ?? { width: 6, ascent: 11, descent: 2 };
        const save = rg.function, fill = rg.fill_style;
        rg.function = GXcopy;
        rg.fill_style = FillSolid;
        for (let r = 0; r < fi.ascent + fi.descent; r++) Rs.span(s, rg, i32(y) - fi.ascent + r, i32(x), i32(x) + bytes.length * fi.width, true);
        rg.function = save;
        rg.fill_style = fill;
      }
      Rs.drawText(s, rg, g, i32(x), i32(y), bytes);
    }
  }

  /** CopyArea and CopyPlane with graphics-exposures on: the destination region whose source is not
   * available comes back as a GraphicsExpose (one, the bounding box), else a NoExpose */
  private copyExposures(src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number, major: number): void {
    if (!gc.v.graphics_exposures || !this.R(src) || !this.R(dst)) return;
    let miss: Rgn = [];
    rgnAdd(miss, sx, sy, w, h);
    if (this.res[src].kind === R_WINDOW) {
      const vis = this.visible(src);
      const [ax, ay] = this.absPos(src);
      for (const v of vis) miss = rgnSub(miss, v.x - ax, v.y - ay, v.w, v.h);
    } else miss = rgnSub(miss, 0, 0, this.res[src].w, this.res[src].h);
    if (miss.length) {
      let dg: Rgn = [];
      for (const m of miss) rgnAdd(dg, m.x - sx + dx, m.y - sy + dy, m.w, m.h);
      dg = rgnClip(dg, 0, 0, this.res[dst].w, this.res[dst].h);
      if (dg.length) {
        let x1 = 1 << 30, y1 = 1 << 30, x2 = -(1 << 30), y2 = -(1 << 30);
        for (const r of dg) {
          if (r.x < x1) x1 = r.x;
          if (r.y < y1) y1 = r.y;
          if (r.x + r.w > x2) x2 = r.x + r.w;
          if (r.y + r.h > y2) y2 = r.y + r.h;
        }
        const e = newEv(GraphicsExpose);
        e.window = dst;
        e.x = x1; e.y = y1; e.width = x2 - x1; e.height = y2 - y1;
        e.count = 0;
        e.major_code = major;
        this.push(e);
        return;
      }
    }
    const e = newEv(NoExpose);
    e.window = dst;
    e.major_code = major;
    this.push(e);
  }

  copyArea(src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number): void {
    sx = i32(sx); sy = i32(sy); dx = i32(dx); dy = i32(dy);
    this.call(`XCopyArea ${this.dname(src)} ${this.dname(dst)}${this.gcText(gc)} ${sx},${sy} ${u32(w)}x${u32(h)} ${dx},${dy}`);
    const t = this.target(dst);
    const s = this.render ? this.surf(src) : null;
    if (t && s && s.depth === t.depth && u32(w) <= 0xffff && u32(h) <= 0xffff) Rs.copyArea(s, t, this.rgc(gc), sx, sy, u32(w), u32(h), dx, dy);
    this.copyExposures(src, dst, gc, sx, sy, i32(w), i32(h), dx, dy, 62);
  }

  copyPlane(src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number, plane: number): void {
    sx = i32(sx); sy = i32(sy); dx = i32(dx); dy = i32(dy);
    this.call(`XCopyPlane ${this.dname(src)} ${this.dname(dst)}${this.gcText(gc)} ${sx},${sy} ${u32(w)}x${u32(h)} ${dx},${dy} plane=${lhex(plane)}`);
    const t = this.target(dst);
    const s = this.render ? this.surf(src) : null;
    if (t && s && u32(w) <= 0xffff && u32(h) <= 0xffff) {
      // the plane's bits: 1 in the foreground, 0 in the background, through the GC
      const g = this.rgc(gc);
      const bit = Number(BigInt.asUintN(64, BigInt(Math.trunc(plane))) & 0xffffffn);
      for (let r = 0; r < u32(h); r++) {
        for (let c = 0; c < u32(w); c++) {
          const x = sx + c, y = sy + r;
          if (x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
          Rs.point(t, g, dx + c, dy + r, !(s.data[y * s.w + x] & bit));
        }
      }
    }
    this.copyExposures(src, dst, gc, sx, sy, i32(w), i32(h), dx, dy, 63);
  }

  // ---------------------------------------------------------------- pixels (the browser)

  private changed(): void {
    if (this.onChange) this.onChange();
  }

  /** the pixels of a window or pixmap (made when first needed) */
  surf(id: number): Rs.Surface | null {
    const r = this.R(id);
    if (!r || (r.kind !== R_WINDOW && r.kind !== R_PIXMAP) || id === this.root) return null;
    if (!r.surf) {
      const img = this.images.get(id);
      r.surf = img ?? Rs.newSurface(r.w, r.h, r.depth === 1 ? 1 : 24, r.kind === R_WINDOW ? r.bg & 0xffffff : 0);
    }
    return r.surf;
  }

  private target(d: number): Rs.Surface | null {
    if (!this.render) return null;
    const s = this.surf(d);
    if (s && this.res[d].kind === R_WINDOW) this.changed();
    return s;
  }

  private scratch: Rs.RasterGC = {
    function: 0, plane_mask: 0, foreground: 0, background: 0, line_width: 0, line_style: 0, cap_style: 0, join_style: 0,
    fill_style: 0, fill_rule: 0, arc_mode: 0, ts_x_origin: 0, ts_y_origin: 0, clip_x_origin: 0, clip_y_origin: 0,
    dash_offset: 0, dashes: [], tile: null, stipple: null, clip: null,
  };

  private rgc(gc: GC): Rs.RasterGC {
    const s = this.scratch, v = gc.v;
    const px = (p: number) => Number(BigInt.asUintN(64, BigInt(Math.trunc(p))) & 0xffffffffn);
    s.function = v.function; s.plane_mask = px(v.plane_mask); s.foreground = px(v.foreground); s.background = px(v.background);
    s.line_width = v.line_width; s.line_style = v.line_style; s.cap_style = v.cap_style; s.join_style = v.join_style;
    s.fill_style = v.fill_style; s.fill_rule = v.fill_rule; s.arc_mode = v.arc_mode; s.ts_x_origin = v.ts_x_origin;
    s.ts_y_origin = v.ts_y_origin; s.clip_x_origin = v.clip_x_origin; s.clip_y_origin = v.clip_y_origin;
    s.dash_offset = v.dash_offset; s.dashes = gc.dashes;
    s.tile = v.tile ? this.surf(v.tile) : null;
    s.stipple = v.stipple ? this.surf(v.stipple) : null;
    s.clip = v.clip_mask ? this.surf(v.clip_mask) : null;
    return s;
  }

  private absPoints(p: Pt[], mode: number): Rs.Pt[] {
    const out: Rs.Pt[] = [];
    let x = 0, y = 0;
    for (let i = 0; i < p.length; i++) {
      const px = p[i].x << 16 >> 16, py = p[i].y << 16 >> 16;
      if (mode === 1 && i > 0) { x += px; y += py; } else { x = px; y = py; }
      out.push([x, y]);
    }
    return out;
  }

  /** a window's background in the area (0 width or height: to the edge) */
  private paintBackground(w: number, x: number, y: number, width: number, height: number): void {
    const r = this.R(w);
    if (!r || r.kind !== R_WINDOW || w === this.root) return;
    const s = this.surf(w)!;
    if (!width) width = r.w - x;
    if (!height) height = r.h - y;
    const tile = r.bgpix !== None && r.bgpix !== ParentRelative ? this.surf(r.bgpix) : null;
    for (let yy = Math.max(0, y); yy < Math.min(s.h, y + height); yy++) {
      for (let xx = Math.max(0, x); xx < Math.min(s.w, x + width); xx++) {
        s.data[yy * s.w + xx] = tile && tile.w && tile.h ? tile.data[(yy % tile.h) * tile.w + (xx % tile.w)] & 0xffffff : r.bg & 0xffffff;
      }
    }
    this.changed();
  }

  /** the top-level windows that show, bottom first, with their place (outer rectangle) on the root */
  topWindows(): { id: number; x: number; y: number; w: number; h: number; bw: number; border: number }[] {
    const out: { id: number; x: number; y: number; w: number; h: number; bw: number; border: number; stack: number }[] = [];
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === this.root && r.mapped) out.push({ id: i, x: r.x, y: r.y, w: r.w, h: r.h, bw: r.bw, border: r.border, stack: r.stack });
    }
    return out.sort((a, b) => a.stack - b.stack);
  }

  /** composites the window w and its mapped children (bottom first) into dst (0xRRGGBB, dw wide) */
  composite(w: number, dst: Uint32Array, dw: number, dh: number, ox: number, oy: number): void {
    const r = this.res[w];
    if (!r || r.kind !== R_WINDOW || !r.mapped) return;
    // border
    if (r.bw > 0) {
      const c = r.border & 0xffffff;
      for (let y = oy - r.bw; y < oy + r.h + r.bw; y++) {
        if (y < 0 || y >= dh) continue;
        for (let x = ox - r.bw; x < ox + r.w + r.bw; x++) {
          if (x < 0 || x >= dw) continue;
          if (x >= ox && x < ox + r.w && y >= oy && y < oy + r.h) continue;
          dst[y * dw + x] = c;
        }
      }
    }
    const s = this.surf(w);
    if (s) {
      for (let y = 0; y < Math.min(r.h, s.h); y++) {
        const dy = oy + y;
        if (dy < 0 || dy >= dh) continue;
        for (let x = 0; x < Math.min(r.w, s.w); x++) {
          const dx = ox + x;
          if (dx < 0 || dx >= dw) continue;
          dst[dy * dw + dx] = s.data[y * s.w + x];
        }
      }
    }
    const kids: number[] = [];
    for (let i = 1; i < this.res.length; i++) if (this.res[i].kind === R_WINDOW && this.res[i].parent === w && this.res[i].mapped) kids.push(i);
    kids.sort((a, b) => this.res[a].stack - this.res[b].stack);
    for (const k of kids) {
      const c = this.res[k];
      this.composite(k, dst, dw, dh, ox + c.x + c.bw, oy + c.y + c.bw);
    }
  }
}
