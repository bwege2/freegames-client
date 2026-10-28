// An Xlib for the browser: the Xlib calls xpilot-ng-x11 makes (the same 111 the client oracle's
// recording Xlib, re/xpilot/oracle/client/xstub.c, implements), on an emulated X server with the
// oracle's choices: one 1280x1024 screen, 24-bit TrueColor (a pixel is 0xRRGGBB), no window manager,
// the misc-fixed bold fonts (13 px: 7 wide, ascent 11, descent 2; 15 px: 9, 12, 3), keycodes handed
// out per keysym, events as xstub delivers them (a pressed button grabs the pointer, Enter/Leave when
// the window under the pointer changes, MapNotify and Expose when a window is mapped, device input
// one event at a time).
//
// Every call can be logged in the oracle's draw log format (web/games/xpilot/test/golden/README in
// re/xpilot/oracle/README.md): the same resource numbers, GC state and coordinates, so a test
// compares the port's calls with the original's line by line. Drawing goes to raster.ts: every
// window and pixmap keeps its pixels, and composite() puts the visible windows on a canvas.
import { KEYSYMS } from './keysyms.ts';
import { FIXED_BOLD_13, FIXED_BOLD_15 } from './fonts.ts';
import * as R from './raster.ts';

// ---------------------------------------------------------------- constants (X.h, Xlib.h)

export const None = 0;
export const KeyPress = 2, KeyRelease = 3, ButtonPress = 4, ButtonRelease = 5, MotionNotify = 6, EnterNotify = 7,
  LeaveNotify = 8, FocusIn = 9, FocusOut = 10, KeymapNotify = 11, Expose = 12, GraphicsExpose = 13, NoExpose = 14,
  VisibilityNotify = 15, CreateNotify = 16, DestroyNotify = 17, UnmapNotify = 18, MapNotify = 19, MapRequest = 20,
  ReparentNotify = 21, ConfigureNotify = 22, ConfigureRequest = 23, GravityNotify = 24, ResizeRequest = 25,
  CirculateNotify = 26, CirculateRequest = 27, PropertyNotify = 28, SelectionClear = 29, SelectionRequest = 30,
  SelectionNotify = 31, ColormapNotify = 32, ClientMessage = 33, MappingNotify = 34;

export const NoEventMask = 0, KeyPressMask = 1 << 0, KeyReleaseMask = 1 << 1, ButtonPressMask = 1 << 2,
  ButtonReleaseMask = 1 << 3, EnterWindowMask = 1 << 4, LeaveWindowMask = 1 << 5, PointerMotionMask = 1 << 6,
  PointerMotionHintMask = 1 << 7, Button1MotionMask = 1 << 8, ButtonMotionMask = 1 << 13, KeymapStateMask = 1 << 14,
  ExposureMask = 1 << 15, VisibilityChangeMask = 1 << 16, StructureNotifyMask = 1 << 17, SubstructureNotifyMask = 1 << 19,
  FocusChangeMask = 1 << 21, PropertyChangeMask = 1 << 22, OwnerGrabButtonMask = 1 << 24;

export const ShiftMask = 1, LockMask = 2, ControlMask = 4, Mod1Mask = 8, Mod2Mask = 16, Mod3Mask = 32, Mod4Mask = 64,
  Mod5Mask = 128, Button1Mask = 1 << 8, Button2Mask = 1 << 9, Button3Mask = 1 << 10, Button4Mask = 1 << 11, Button5Mask = 1 << 12;
export const Button1 = 1, Button2 = 2, Button3 = 3, Button4 = 4, Button5 = 5;

export const GCFunction = 1 << 0, GCPlaneMask = 1 << 1, GCForeground = 1 << 2, GCBackground = 1 << 3, GCLineWidth = 1 << 4,
  GCLineStyle = 1 << 5, GCCapStyle = 1 << 6, GCJoinStyle = 1 << 7, GCFillStyle = 1 << 8, GCFillRule = 1 << 9, GCTile = 1 << 10,
  GCStipple = 1 << 11, GCTileStipXOrigin = 1 << 12, GCTileStipYOrigin = 1 << 13, GCFont = 1 << 14, GCSubwindowMode = 1 << 15,
  GCGraphicsExposures = 1 << 16, GCClipXOrigin = 1 << 17, GCClipYOrigin = 1 << 18, GCClipMask = 1 << 19, GCDashOffset = 1 << 20,
  GCDashList = 1 << 21, GCArcMode = 1 << 22;

export const CWBackPixmap = 1 << 0, CWBackPixel = 1 << 1, CWBorderPixmap = 1 << 2, CWBorderPixel = 1 << 3, CWBitGravity = 1 << 4,
  CWWinGravity = 1 << 5, CWBackingStore = 1 << 6, CWBackingPlanes = 1 << 7, CWBackingPixel = 1 << 8, CWOverrideRedirect = 1 << 9,
  CWSaveUnder = 1 << 10, CWEventMask = 1 << 11, CWDontPropagate = 1 << 12, CWColormap = 1 << 13, CWCursor = 1 << 14;

export const GXclear = 0, GXand = 1, GXandReverse = 2, GXcopy = 3, GXandInverted = 4, GXnoop = 5, GXxor = 6, GXor = 7,
  GXnor = 8, GXequiv = 9, GXinvert = 10, GXorReverse = 11, GXcopyInverted = 12, GXorInverted = 13, GXnand = 14, GXset = 15;
export const LineSolid = 0, LineOnOffDash = 1, LineDoubleDash = 2;
export const CapNotLast = 0, CapButt = 1, CapRound = 2, CapProjecting = 3;
export const JoinMiter = 0, JoinRound = 1, JoinBevel = 2;
export const FillSolid = 0, FillTiled = 1, FillStippled = 2, FillOpaqueStippled = 3;
export const EvenOddRule = 0, WindingRule = 1;
export const ClipByChildren = 0, IncludeInferiors = 1;
export const ArcChord = 0, ArcPieSlice = 1;
export const Complex = 0, Nonconvex = 1, Convex = 2;
export const CoordModeOrigin = 0, CoordModePrevious = 1;
export const InputOutput = 1, InputOnly = 2;
export const AllPlanes = 0xffffffff;
export const ForgetGravity = 0, NorthWestGravity = 1, NorthGravity = 2, NorthEastGravity = 3, WestGravity = 4,
  CenterGravity = 5, EastGravity = 6, SouthWestGravity = 7, SouthGravity = 8, SouthEastGravity = 9, StaticGravity = 10;
export const NotUseful = 0, WhenMapped = 1, Always = 2;
export const IsUnmapped = 0, IsUnviewable = 1, IsViewable = 2;
export const NotifyNormal = 0, NotifyAncestor = 0;
export const RevertToParent = 2, RevertToPointerRoot = 1, RevertToNone = 0, PointerRoot = 1;
export const GrabModeAsync = 1, GrabSuccess = 0, CurrentTime = 0;
export const QueuedAlready = 0, QueuedAfterReading = 1, QueuedAfterFlush = 2;
export const DoRed = 1, DoGreen = 2, DoBlue = 4;
export const NoValue = 0, XValue = 1, YValue = 2, WidthValue = 4, HeightValue = 8, XNegative = 16, YNegative = 32;
export const TrueColor = 4, PseudoColor = 3, StaticColor = 2, DirectColor = 5;

export const XK = Object.fromEntries(KEYSYMS) as Record<string, number>;
export const NoSymbol = 0;

// ---------------------------------------------------------------- types

export interface XEvent {
  type: number;
  /** the event window (xany.window; xmap.event = xmap.window) */
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
  /** Expose, ConfigureNotify */
  width: number;
  height: number;
  count: number;
  mode: number;
  detail: number;
  /** ClientMessage: data.l[0] */
  message: number;
}

export function newEvent(type = 0): XEvent {
  return {
    type, window: 0, root: 0, subwindow: 0, time: 0, x: 0, y: 0, x_root: 0, y_root: 0, state: 0, keycode: 0, button: 0,
    same_screen: true, width: 0, height: 0, count: 0, mode: 0, detail: 0, message: 0,
  };
}

export interface XPoint { x: number; y: number }
export interface XSegment { x1: number; y1: number; x2: number; y2: number }
export interface XRectangle { x: number; y: number; width: number; height: number }
export interface XArc { x: number; y: number; width: number; height: number; angle1: number; angle2: number }
export interface XColor { pixel: number; red: number; green: number; blue: number; flags: number }

export interface XCharStruct { width: number; ascent: number; descent: number; lbearing: number; rbearing: number }
export interface XFontStruct {
  fid: number;
  ascent: number;
  descent: number;
  min_bounds: XCharStruct;
  max_bounds: XCharStruct;
  /** the glyphs the rasterizer draws */
  glyphs: R.Glyphs;
  name: string;
}

/** XGCValues: the fields XCreateGC/XChangeGC take (only those named by the mask are read) */
export interface XGCValues {
  function?: number;
  plane_mask?: number;
  foreground?: number;
  background?: number;
  line_width?: number;
  line_style?: number;
  cap_style?: number;
  join_style?: number;
  fill_style?: number;
  fill_rule?: number;
  arc_mode?: number;
  tile?: number;
  stipple?: number;
  ts_x_origin?: number;
  ts_y_origin?: number;
  font?: number;
  subwindow_mode?: number;
  graphics_exposures?: boolean;
  clip_x_origin?: number;
  clip_y_origin?: number;
  clip_mask?: number;
  dash_offset?: number;
  dashes?: number;
}

export interface GC {
  gid: number;
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
  graphics_exposures: boolean;
  clip_x_origin: number;
  clip_y_origin: number;
  clip_mask: number;
  dash_offset: number;
  dashes: number[];
}

export interface XSetWindowAttributes {
  background_pixel?: number;
  border_pixel?: number;
  bit_gravity?: number;
  win_gravity?: number;
  backing_store?: number;
  save_under?: boolean;
  event_mask?: number;
  override_redirect?: boolean;
  colormap?: number;
  cursor?: number;
}

export interface XWindowAttributes {
  x: number; y: number; width: number; height: number; border_width: number; depth: number;
  map_state: number; your_event_mask: number; all_event_masks: number; root: number; colormap: number;
}

/** What the log goes to: drawing and window calls (hashed by the golden), notes ("# " lines, not hashed). */
export interface DrawSink {
  call(line: string): void;
  note(line: string): void;
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
  border: number;
  name: string;
  surf: R.Surface | null;
}

interface Input { kind: number; press: boolean; a: number; b: number; name: string }
const IN_KEY = 0, IN_BUTTON = 1, IN_REL = 2, IN_ABS = 3;

const s16 = (v: number) => (v << 16) >> 16;
const u16 = (v: number) => v & 0xffff;
const u32 = (v: number) => v >>> 0;
const hex6 = (v: number) => (v & 0xffffff).toString(16).padStart(6, '0');

/** C's string argument as the draw log writes it: JSON with \u00XX below 0x20 and from 0x7f */
function jstr(s: string): string {
  let out = '"';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i) & 0xff;
    if (c === 0x22 || c === 0x5c) out += '\\' + String.fromCharCode(c);
    else if (c < 0x20 || c >= 0x7f) out += '\\u' + c.toString(16).padStart(4, '0');
    else out += String.fromCharCode(c);
  }
  return out + '"';
}

// misc-fixed cell metrics by pixel size (xstub.c font_metrics)
function fontMetrics(px: number): [number, number, number] {
  switch (px) {
    case 10: return [6, 8, 2];
    case 12: return [6, 10, 2];
    case 13: return [7, 11, 2];
    case 14: return [7, 11, 3];
    case 15: return [9, 12, 3];
    case 18: return [9, 14, 4];
    case 20: return [10, 16, 4];
  }
  const a = Math.trunc((px * 4 + 2) / 5);
  return [Math.trunc((px * 11 + 10) / 20), a, px - a];
}

/** pixel size from an XLFD name (field 7, else point size field 8 / 10), "fixed" = 13 */
function fontPx(name: string): number {
  if (name[0] !== '-') return 13;
  let field = 0;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === '-') {
      field++;
      const rest = name.slice(i + 1);
      if (field === 7 && /^\d/.test(rest)) return parseInt(rest, 10);
      if (field === 8 && /^\d/.test(rest)) return Math.trunc((parseInt(rest, 10) + 5) / 10);
    }
  }
  return 13;
}

const GLYPHS_13 = R.glyphsOf(FIXED_BOLD_13);
const GLYPHS_15 = R.glyphsOf(FIXED_BOLD_15);

const NAMED_COLORS: Record<string, [number, number, number]> = {
  black: [0, 0, 0], white: [255, 255, 255], red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255], yellow: [255, 255, 0],
  cyan: [0, 255, 255], magenta: [255, 0, 255], gray: [190, 190, 190], grey: [190, 190, 190], orange: [255, 165, 0],
};

const SHIFTED_FROM = "1234567890-=[]\\;',./`", SHIFTED_TO = '!@#$%^&*()_+{}|:"<>?~';

/**
 * The display: one X server and its single client. `sink` receives the draw log, `render` keeps the
 * pixels (off in fast tests), `onChange` is told when something visible may have changed.
 */
export class Display {
  sink: DrawSink | null = null;
  render = true;
  onChange: (() => void) | null = null;
  /** XNextEvent and friends call this when the queue is empty (the test harness advances its clock) */
  waitHook: (() => void) | null = null;

  readonly root: number;
  readonly defaultFont: number;
  readonly defaultGC: GC;
  readonly defaultColormap: number;
  readonly width: number;
  readonly height: number;
  readonly depth = 24;
  readonly fd = 100;

  private res: Res[] = [];
  private stackCounter = 0;
  private fonts = new Map<number, XFontStruct>();
  private atoms: string[] = [];

  private queue: XEvent[] = [];
  private inputs: Input[] = [];
  ptrX = 640;
  ptrY = 512;
  private modState = 0;
  private focusWindow = 0;
  private grabWin = 0;
  private ptrWindow = 0;
  private keycodes: number[] = [];
  private afterFunction: (() => void) | null = null;

  /** the screen: the oracle's is 1280x1024 */
  constructor(width = 1280, height = 1024) {
    this.width = width;
    this.height = height;
    this.res.push(this.blank(R_FREE));       // XID 0 is None
    this.root = this.newRes(R_WINDOW);
    const r = this.res[this.root];
    r.w = width; r.h = height; r.depth = 24; r.mapped = true; r.name = 'root';
    this.defaultFont = this.newRes(R_FONT);
    this.defaultGC = this.gcDefaults(this.newRes(R_GC));
    this.defaultGC.background = 1;
    this.defaultGC.font = this.defaultFont;
    this.defaultColormap = this.newRes(R_CMAP);
  }

  // ---------------------------------------------------------------- resources

  private blank(kind: number): Res {
    return { kind, parent: 0, x: 0, y: 0, w: 0, h: 0, bw: 0, depth: 0, cls: 0, mapped: false, stack: 0, mask: 0, bg: 0, border: 0, name: '', surf: null };
  }

  private newRes(kind: number): number {
    const r = this.blank(kind);
    r.stack = ++this.stackCounter;
    this.res.push(r);
    return this.res.length - 1;
  }

  private R(id: number): Res | null {
    return id > 0 && id < this.res.length ? this.res[id] : null;
  }

  dname(id: number): string {
    const r = this.R(id);
    if (!r) return 'none';
    const k = r.kind === R_WINDOW ? 'w' : r.kind === R_PIXMAP ? 'p' : r.kind === R_FONT ? 'f' : r.kind === R_CURSOR ? 'c' : r.kind === R_CMAP ? 'm' : 'r';
    return k + id;
  }

  private surf(id: number): R.Surface | null {
    const r = this.R(id);
    if (!r || (r.kind !== R_WINDOW && r.kind !== R_PIXMAP) || id === this.root) return null;
    if (!r.surf) r.surf = R.newSurface(r.w, r.h, r.depth, r.kind === R_WINDOW ? r.bg & 0xffffff : 0);
    return r.surf;
  }

  private resize(r: Res, w: number, h: number): void {
    if (r.surf && (r.surf.w !== w || r.surf.h !== h)) {
      const old = r.surf;
      const s = R.newSurface(w, h, old.depth, r.kind === R_WINDOW ? r.bg & 0xffffff : 0);
      for (let y = 0; y < Math.min(h, old.h); y++) s.data.set(old.data.subarray(y * old.w, y * old.w + Math.min(w, old.w)), y * w);
      r.surf = s;
    }
    r.w = w;
    r.h = h;
  }

  private changed(): void {
    if (this.onChange) this.onChange();
  }

  // ---------------------------------------------------------------- the log

  private gcText(gc: GC): string {
    let t = ` gc${gc.gid}{fg=${hex6(gc.foreground)} bg=${hex6(gc.background)} lw=${gc.line_width} ls=${gc.line_style} font=${this.dname(gc.font)}`;
    if (gc.cap_style !== CapButt) t += ` cap=${gc.cap_style}`;
    if (gc.join_style !== JoinMiter) t += ` join=${gc.join_style}`;
    if (gc.fill_style !== FillSolid) t += ` fill=${gc.fill_style} tile=${this.dname(gc.tile)} stipple=${this.dname(gc.stipple)} ts=${gc.ts_x_origin},${gc.ts_y_origin}`;
    if (gc.function !== GXcopy) t += ` func=${gc.function}`;
    if ((gc.plane_mask & 0xffffff) !== 0xffffff) t += ` pm=${hex6(gc.plane_mask)}`;
    if (gc.clip_mask !== None) t += ` clip=${this.dname(gc.clip_mask)}@${gc.clip_x_origin},${gc.clip_y_origin}`;
    if (gc.line_style !== LineSolid) t += ` dash=${gc.dash_offset}:${gc.dashes.map((d) => d & 0xff).join(',')}`;
    return t + '}';
  }

  private call(line: string): void {
    if (this.sink) this.sink.call(line);
  }

  note(text: string): void {
    if (this.sink) this.sink.note(text);
  }

  // ---------------------------------------------------------------- GCs

  private gcDefaults(gid: number): GC {
    return {
      gid, function: GXcopy, plane_mask: AllPlanes, foreground: 0, background: 1, line_width: 0, line_style: LineSolid,
      cap_style: CapButt, join_style: JoinMiter, fill_style: FillSolid, fill_rule: EvenOddRule, arc_mode: ArcPieSlice,
      tile: 0, stipple: 0, ts_x_origin: 0, ts_y_origin: 0, font: this.defaultFont, subwindow_mode: ClipByChildren,
      graphics_exposures: true, clip_x_origin: 0, clip_y_origin: 0, clip_mask: None, dash_offset: 0, dashes: [4, 4],
    };
  }

  private gcApply(gc: GC, mask: number, v: XGCValues): void {
    if (mask & GCFunction) gc.function = v.function!;
    if (mask & GCPlaneMask) gc.plane_mask = v.plane_mask!;
    if (mask & GCForeground) gc.foreground = v.foreground!;
    if (mask & GCBackground) gc.background = v.background!;
    if (mask & GCLineWidth) gc.line_width = v.line_width!;
    if (mask & GCLineStyle) gc.line_style = v.line_style!;
    if (mask & GCCapStyle) gc.cap_style = v.cap_style!;
    if (mask & GCJoinStyle) gc.join_style = v.join_style!;
    if (mask & GCFillStyle) gc.fill_style = v.fill_style!;
    if (mask & GCFillRule) gc.fill_rule = v.fill_rule!;
    if (mask & GCTile) gc.tile = v.tile!;
    if (mask & GCStipple) gc.stipple = v.stipple!;
    if (mask & GCTileStipXOrigin) gc.ts_x_origin = v.ts_x_origin!;
    if (mask & GCTileStipYOrigin) gc.ts_y_origin = v.ts_y_origin!;
    if (mask & GCFont) gc.font = v.font!;
    if (mask & GCSubwindowMode) gc.subwindow_mode = v.subwindow_mode!;
    if (mask & GCGraphicsExposures) gc.graphics_exposures = v.graphics_exposures!;
    if (mask & GCClipXOrigin) gc.clip_x_origin = v.clip_x_origin!;
    if (mask & GCClipYOrigin) gc.clip_y_origin = v.clip_y_origin!;
    if (mask & GCClipMask) gc.clip_mask = v.clip_mask!;
    if (mask & GCDashOffset) gc.dash_offset = v.dash_offset!;
    if (mask & GCDashList) gc.dashes = [v.dashes!, v.dashes!];
    if (mask & GCArcMode) gc.arc_mode = v.arc_mode!;
  }

  createGC(_d: number, mask: number, v: XGCValues | null): GC {
    const gc = this.gcDefaults(this.newRes(R_GC));
    if (v) this.gcApply(gc, mask, v);
    return gc;
  }

  changeGC(gc: GC, mask: number, v: XGCValues): void {
    this.gcApply(gc, mask, v);
  }

  private scratch: R.RasterGC = {
    function: 0, plane_mask: 0, foreground: 0, background: 0, line_width: 0, line_style: 0, cap_style: 0, join_style: 0,
    fill_style: 0, fill_rule: 0, arc_mode: 0, ts_x_origin: 0, ts_y_origin: 0, clip_x_origin: 0, clip_y_origin: 0,
    dash_offset: 0, dashes: [], tile: null, stipple: null, clip: null,
  };

  private rgc(gc: GC): R.RasterGC {
    const s = this.scratch;
    s.function = gc.function; s.plane_mask = gc.plane_mask; s.foreground = gc.foreground; s.background = gc.background;
    s.line_width = gc.line_width; s.line_style = gc.line_style; s.cap_style = gc.cap_style; s.join_style = gc.join_style;
    s.fill_style = gc.fill_style; s.fill_rule = gc.fill_rule; s.arc_mode = gc.arc_mode; s.ts_x_origin = gc.ts_x_origin;
    s.ts_y_origin = gc.ts_y_origin; s.clip_x_origin = gc.clip_x_origin; s.clip_y_origin = gc.clip_y_origin;
    s.dash_offset = gc.dash_offset; s.dashes = gc.dashes;
    s.tile = gc.tile ? this.surf(gc.tile) : null;
    s.stipple = gc.stipple ? this.surf(gc.stipple) : null;
    s.clip = gc.clip_mask ? this.surf(gc.clip_mask) : null;
    return s;
  }

  /** the surface to draw on, or null when not rendering */
  private target(d: number): R.Surface | null {
    if (!this.render) return null;
    const s = this.surf(d);
    if (s && this.R(d)!.kind === R_WINDOW) this.changed();
    return s;
  }

  // ---------------------------------------------------------------- drawing

  drawLine(d: number, gc: GC, x1: number, y1: number, x2: number, y2: number): void {
    this.call(`XDrawLine ${this.dname(d)}${this.gcText(gc)} ${x1 | 0},${y1 | 0} ${x2 | 0},${y2 | 0}`);
    const s = this.target(d);
    if (s) R.drawLines(s, this.rgc(gc), [[x1 | 0, y1 | 0], [x2 | 0, y2 | 0]], true);
  }

  private pointsText(p: XPoint[], n: number): string {
    let t = '';
    for (let i = 0; i < n; i++) t += ` ${s16(p[i].x)},${s16(p[i].y)}`;
    return t;
  }

  private absPoints(p: XPoint[], n: number, mode: number): R.Pt[] {
    const out: R.Pt[] = [];
    let x = 0, y = 0;
    for (let i = 0; i < n; i++) {
      if (mode === CoordModePrevious && i > 0) { x += s16(p[i].x); y += s16(p[i].y); } else { x = s16(p[i].x); y = s16(p[i].y); }
      out.push([x, y]);
    }
    return out;
  }

  drawLines(d: number, gc: GC, p: XPoint[], n: number, mode: number): void {
    this.call(`XDrawLines ${this.dname(d)}${this.gcText(gc)} mode=${mode} n=${n}${this.pointsText(p, n)}`);
    const s = this.target(d);
    if (s) R.drawLines(s, this.rgc(gc), this.absPoints(p, n, mode), false);
  }

  drawPoint(d: number, gc: GC, x: number, y: number): void {
    this.call(`XDrawPoint ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0}`);
    const s = this.target(d);
    if (s) R.point(s, this.rgc(gc), x | 0, y | 0);
  }

  drawPoints(d: number, gc: GC, p: XPoint[], n: number, mode: number): void {
    this.call(`XDrawPoints ${this.dname(d)}${this.gcText(gc)} mode=${mode} n=${n}${this.pointsText(p, n)}`);
    const s = this.target(d);
    if (s) { const g = this.rgc(gc); for (const [x, y] of this.absPoints(p, n, mode)) R.point(s, g, x, y); }
  }

  drawSegments(d: number, gc: GC, sg: XSegment[], n: number): void {
    let t = `XDrawSegments ${this.dname(d)}${this.gcText(gc)} n=${n}`;
    for (let i = 0; i < n; i++) t += ` ${s16(sg[i].x1)},${s16(sg[i].y1)},${s16(sg[i].x2)},${s16(sg[i].y2)}`;
    this.call(t);
    const s = this.target(d);
    if (s) {
      const pts: R.Pt[] = [];
      for (let i = 0; i < n; i++) pts.push([s16(sg[i].x1), s16(sg[i].y1)], [s16(sg[i].x2), s16(sg[i].y2)]);
      R.drawLines(s, this.rgc(gc), pts, true);
    }
  }

  drawRectangle(d: number, gc: GC, x: number, y: number, w: number, h: number): void {
    this.call(`XDrawRectangle ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0} ${u32(w)}x${u32(h)}`);
    const s = this.target(d);
    if (s) {
      x |= 0; y |= 0; w = u32(w); h = u32(h);
      if (w > 0x7fffffff || h > 0x7fffffff) return;
      R.drawLines(s, this.rgc(gc), [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], false);
    }
  }

  fillRectangle(d: number, gc: GC, x: number, y: number, w: number, h: number): void {
    this.call(`XFillRectangle ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0} ${u32(w)}x${u32(h)}`);
    const s = this.target(d);
    if (s) { w = u32(w); h = u32(h); if (w <= 0x7fffffff && h <= 0x7fffffff) R.fillRect(s, this.rgc(gc), x | 0, y | 0, w, h); }
  }

  fillRectangles(d: number, gc: GC, r: XRectangle[], n: number): void {
    let t = `XFillRectangles ${this.dname(d)}${this.gcText(gc)} n=${n}`;
    for (let i = 0; i < n; i++) t += ` ${s16(r[i].x)},${s16(r[i].y)},${u16(r[i].width)}x${u16(r[i].height)}`;
    this.call(t);
    const s = this.target(d);
    if (s) { const g = this.rgc(gc); for (let i = 0; i < n; i++) R.fillRect(s, g, s16(r[i].x), s16(r[i].y), u16(r[i].width), u16(r[i].height)); }
  }

  fillPolygon(d: number, gc: GC, p: XPoint[], n: number, shape: number, mode: number): void {
    this.call(`XFillPolygon ${this.dname(d)}${this.gcText(gc)} shape=${shape} mode=${mode} n=${n}${this.pointsText(p, n)}`);
    const s = this.target(d);
    if (s) R.fillPolys(s, this.rgc(gc), [this.absPoints(p, n, mode)], gc.fill_rule);
  }

  drawArc(d: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
    this.call(`XDrawArc ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0} ${u32(w)}x${u32(h)} ${a1 | 0} ${a2 | 0}`);
    const s = this.target(d);
    if (s && u32(w) <= 0xffff && u32(h) <= 0xffff) R.drawArc(s, this.rgc(gc), x | 0, y | 0, u32(w), u32(h), a1 | 0, a2 | 0);
  }

  drawArcs(d: number, gc: GC, a: XArc[], n: number): void {
    let t = `XDrawArcs ${this.dname(d)}${this.gcText(gc)} n=${n}`;
    for (let i = 0; i < n; i++) t += ` ${s16(a[i].x)},${s16(a[i].y)},${u16(a[i].width)}x${u16(a[i].height)},${s16(a[i].angle1)},${s16(a[i].angle2)}`;
    this.call(t);
    const s = this.target(d);
    if (s) {
      const g = this.rgc(gc);
      for (let i = 0; i < n; i++) R.drawArc(s, g, s16(a[i].x), s16(a[i].y), u16(a[i].width), u16(a[i].height), s16(a[i].angle1), s16(a[i].angle2));
    }
  }

  fillArc(d: number, gc: GC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
    this.call(`XFillArc ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0} ${u32(w)}x${u32(h)} ${a1 | 0} ${a2 | 0}`);
    const s = this.target(d);
    if (s && u32(w) <= 0xffff && u32(h) <= 0xffff) R.fillArc(s, this.rgc(gc), x | 0, y | 0, u32(w), u32(h), a1 | 0, a2 | 0);
  }

  /** XDrawString: `s` holds the original's bytes as characters 0..255; n bytes of it are drawn */
  drawString(d: number, gc: GC, x: number, y: number, str: string, n: number): void {
    const text = n > 0 ? str.slice(0, n) : '';
    this.call(`XDrawString ${this.dname(d)}${this.gcText(gc)} ${x | 0},${y | 0} ${jstr(text)}`);
    const s = this.target(d);
    if (s && text) {
      const f = this.fonts.get(gc.font);
      const glyphs = f ? f.glyphs : GLYPHS_13;
      const codes: number[] = [];
      for (let i = 0; i < text.length; i++) codes.push(text.charCodeAt(i));
      R.drawText(s, this.rgc(gc), glyphs, x | 0, y | 0, codes);
    }
  }

  copyArea(src: number, dst: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number): void {
    this.call(`XCopyArea ${this.dname(src)} ${this.dname(dst)}${this.gcText(gc)} ${sx | 0},${sy | 0} ${u32(w)}x${u32(h)} ${dx | 0},${dy | 0}`);
    const t = this.target(dst);
    const s = this.render ? this.surf(src) : null;
    if (t && s && s.depth === t.depth && u32(w) <= 0xffff && u32(h) <= 0xffff) R.copyArea(s, t, this.rgc(gc), sx | 0, sy | 0, u32(w), u32(h), dx | 0, dy | 0);
  }

  clearWindow(w: number): void {
    const r = this.R(w);
    this.call(`XClearWindow ${this.dname(w)} bg=${hex6(r ? r.bg : 0)}`);
    if (r && this.render && r.kind === R_WINDOW && w !== this.root) {
      this.surf(w)!.data.fill(r.bg & 0xffffff);
      this.changed();
    }
  }

  bell(percent: number): void {
    this.call(`XBell ${percent | 0}`);
  }

  // ---------------------------------------------------------------- pixmaps

  createPixmap(d: number, w: number, h: number, depth: number): number {
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = u32(w); r.h = u32(h); r.depth = depth;
    this.call(`XCreatePixmap ${this.dname(id)} for=${this.dname(d)} ${u32(w)}x${u32(h)} depth=${depth}`);
    return id;
  }

  freePixmap(p: number): void {
    this.call(`XFreePixmap ${this.dname(p)}`);
    const r = this.R(p);
    if (r) { r.kind = R_FREE; r.surf = null; }
  }

  /** XCreateBitmapFromData: data is ((w+7)/8)*h bytes, LSB first (X bitmap order) */
  createBitmapFromData(d: number, data: Uint8Array, w: number, h: number): number {
    const id = this.newRes(R_PIXMAP);
    const r = this.res[id];
    r.w = w; r.h = h; r.depth = 1;
    const n = ((w + 7) >> 3) * h;
    let hex = '';
    for (let i = 0; i < n; i++) hex += (data[i] ?? 0).toString(16).padStart(2, '0');
    this.call(`XCreateBitmapFromData ${this.dname(id)} for=${this.dname(d)} ${w}x${h} ${hex}`);
    const s = R.newSurface(w, h, 1);
    const bpr = (w + 7) >> 3;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) s.data[y * w + x] = (data[y * bpr + (x >> 3)] >> (x & 7)) & 1;
    r.surf = s;
    return id;
  }

  // ---------------------------------------------------------------- fonts

  loadQueryFont(name: string): XFontStruct {
    const id = this.newRes(R_FONT);
    const px = fontPx(name);
    const [w, a, dsc] = fontMetrics(px);
    const cs = (): XCharStruct => ({ width: w, ascent: a, descent: dsc, lbearing: 0, rbearing: w });
    const f: XFontStruct = { fid: id, ascent: a, descent: dsc, min_bounds: cs(), max_bounds: cs(), glyphs: px >= 15 ? GLYPHS_15 : GLYPHS_13, name };
    this.fonts.set(id, f);
    this.call(`XLoadQueryFont ${this.dname(id)} "${name}" width=${w} ascent=${a} descent=${dsc}`);
    return f;
  }

  queryFont(id: number): XFontStruct {
    const f = this.fonts.get(id);
    if (f) return f;
    for (const v of this.fonts.values()) return v;
    return this.loadQueryFont('fixed');
  }

  // ---------------------------------------------------------------- windows

  private mkwin(parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number, bg: number, cls: number): number {
    const id = this.newRes(R_WINDOW);
    const r = this.res[id];
    r.parent = parent; r.x = x; r.y = y; r.w = u32(w); r.h = u32(h); r.bw = u32(bw);
    r.depth = depth || 24; r.bg = bg; r.cls = cls;
    return id;
  }

  createWindow(parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number, cls: number, mask: number, a: XSetWindowAttributes): number {
    const id = this.mkwin(parent, x, y, w, h, bw, depth, mask & CWBackPixel ? a.background_pixel! : 0, cls);
    const r = this.res[id];
    if (mask & CWEventMask) r.mask = a.event_mask!;
    if (mask & CWBorderPixel) r.border = a.border_pixel!;
    let t = `XCreateWindow ${this.dname(id)} parent=${this.dname(parent)} ${x},${y} ${u32(w)}x${u32(h)} bw=${u32(bw)}`;
    if (mask & CWBackPixel) t += ` bg=${hex6(a.background_pixel!)}`;
    this.call(t);
    return id;
  }

  createSimpleWindow(parent: number, x: number, y: number, w: number, h: number, bw: number, border: number, bg: number): number {
    const id = this.mkwin(parent, x, y, w, h, bw, 24, bg, InputOutput);
    this.res[id].border = border;
    this.call(`XCreateSimpleWindow ${this.dname(id)} parent=${this.dname(parent)} ${x},${y} ${u32(w)}x${u32(h)} bw=${u32(bw)} border=${hex6(border)} bg=${hex6(bg)}`);
    return id;
  }

  destroyWindow(w: number): void {
    this.call(`XDestroyWindow ${this.dname(w)}`);
    for (let i = 1; i < this.res.length; i++) if (this.res[i].kind === R_WINDOW && this.res[i].parent === w) this.destroyWindow(i);
    const r = this.R(w);
    if (r) { r.kind = R_FREE; r.mapped = false; r.surf = null; }
    if (this.ptrWindow === w) this.ptrWindow = 0;
    this.crossing();
    this.changed();
  }

  private doMap(w: number, raised: boolean): void {
    const r = this.R(w);
    if (!r || r.kind !== R_WINDOW) return;
    this.call(`${raised ? 'XMapRaised' : 'XMapWindow'} ${this.dname(w)}`);
    if (raised) r.stack = ++this.stackCounter;
    this.changed();
    if (r.mapped) return;
    r.mapped = true;
    this.paintBackground(w);
    this.mapNotify(w);
    this.exposeTree(w);
    this.crossing();
  }

  /** a window that becomes visible shows its background (the X server paints it before Expose) */
  private paintBackground(w: number): void {
    const r = this.R(w);
    if (!r || !this.render || w === this.root) return;
    this.surf(w)!.data.fill(r.bg & 0xffffff);
  }

  mapWindow(w: number): void { this.doMap(w, false); }
  mapRaised(w: number): void { this.doMap(w, true); }

  mapSubwindows(w: number): void {
    this.call(`XMapSubwindows ${this.dname(w)}`);
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === w && !r.mapped) {
        r.mapped = true;
        this.paintBackground(i);
        this.mapNotify(i);
        this.exposeTree(i);
      }
    }
    this.crossing();
    this.changed();
  }

  unmapWindow(w: number): void {
    this.call(`XUnmapWindow ${this.dname(w)}`);
    const r = this.R(w);
    if (r) r.mapped = false;
    this.crossing();
    this.changed();
  }

  moveWindow(w: number, x: number, y: number): void {
    this.call(`XMoveWindow ${this.dname(w)} ${x},${y}`);
    const r = this.R(w);
    if (r) { r.x = x; r.y = y; }
    this.crossing();
    this.changed();
  }

  resizeWindow(w: number, width: number, height: number): void {
    this.call(`XResizeWindow ${this.dname(w)} ${u32(width)}x${u32(height)}`);
    const r = this.R(w);
    if (r) this.resize(r, u32(width), u32(height));
    this.changed();
  }

  moveResizeWindow(w: number, x: number, y: number, width: number, height: number): void {
    this.call(`XMoveResizeWindow ${this.dname(w)} ${x},${y} ${u32(width)}x${u32(height)}`);
    const r = this.R(w);
    if (r) { r.x = x; r.y = y; this.resize(r, u32(width), u32(height)); }
    this.crossing();
    this.changed();
  }

  setWindowBackground(w: number, bg: number): void {
    this.call(`XSetWindowBackground ${this.dname(w)} ${hex6(bg)}`);
    const r = this.R(w);
    if (r) r.bg = bg;
  }

  changeWindowAttributes(w: number, mask: number, a: XSetWindowAttributes): void {
    const r = this.R(w);
    if (!r) return;
    if (mask & CWBackPixel) r.bg = a.background_pixel!;
    if (mask & CWEventMask) r.mask = a.event_mask!;
    if (mask & CWBorderPixel) r.border = a.border_pixel!;
    let t = `XChangeWindowAttributes ${this.dname(w)} mask=${mask.toString(16)}`;
    if (mask & CWBackPixel) t += ` bg=${hex6(a.background_pixel!)}`;
    this.call(t);
  }

  selectInput(w: number, mask: number): void {
    const r = this.R(w);
    if (r) r.mask = mask;
  }

  storeName(w: number, name: string): void {
    const r = this.R(w);
    if (r) r.name = name.slice(0, 63);
  }

  getWindowAttributes(w: number): XWindowAttributes | null {
    const r = this.R(w);
    if (!r) return null;
    return {
      x: r.x, y: r.y, width: r.w, height: r.h, border_width: r.bw, depth: r.depth,
      map_state: this.viewable(w) ? IsViewable : r.mapped ? IsUnviewable : IsUnmapped,
      your_event_mask: r.mask, all_event_masks: r.mask, root: this.root, colormap: this.defaultColormap,
    };
  }

  getGeometry(d: number): { root: number; x: number; y: number; width: number; height: number; border: number; depth: number } | null {
    const r = this.R(d);
    if (!r) return null;
    return { root: this.root, x: r.x, y: r.y, width: r.w, height: r.h, border: r.bw, depth: r.depth };
  }

  setInputFocus(w: number): void { this.focusWindow = w; }

  warpPointer(dst: number, dx: number, dy: number): void {
    if (dst) { const [ax, ay] = this.absPos(dst); this.ptrX = ax + dx; this.ptrY = ay + dy; } else { this.ptrX += dx; this.ptrY += dy; }
    this.call(`XWarpPointer ${this.ptrX},${this.ptrY}`);
    this.motion();
  }

  queryPointer(w: number): { root_x: number; root_y: number; win_x: number; win_y: number; mask: number } {
    const [ax, ay] = this.absPos(w);
    return { root_x: this.ptrX, root_y: this.ptrY, win_x: this.ptrX - ax, win_y: this.ptrY - ay, mask: this.modState };
  }

  createPixmapCursor(): number { return this.newRes(R_CURSOR); }
  createColormap(): number { return this.newRes(R_CMAP); }

  internAtom(name: string): number {
    const i = this.atoms.indexOf(name);
    if (i >= 0) return 100 + i;
    if (this.atoms.length < 64) this.atoms.push(name);
    return 100 + this.atoms.length - 1;
  }

  setAfterFunction(f: (() => void) | null): void { this.afterFunction = f; }
  sync(): void { if (this.afterFunction) this.afterFunction(); }

  // ---------------------------------------------------------------- colours

  parseColor(spec: string): XColor | null {
    if (!spec) return null;
    if (spec[0] === '#') {
      const body = spec.slice(1);
      const n = body.length;
      if (n === 0 || n % 3 || n > 12) return null;
      const k = n / 3;
      const v: number[] = [];
      for (let i = 0; i < 3; i++) {
        const part = body.slice(i * k, (i + 1) * k);
        if (!/^[0-9a-fA-F]+$/.test(part)) return null;
        v.push((parseInt(part, 16) << (16 - 4 * k)) & 0xffff);
      }
      return { pixel: 0, red: v[0], green: v[1], blue: v[2], flags: DoRed | DoGreen | DoBlue };
    }
    const c = NAMED_COLORS[spec.toLowerCase()];
    if (!c) return null;
    return { pixel: 0, red: c[0] * 0x101, green: c[1] * 0x101, blue: c[2] * 0x101, flags: DoRed | DoGreen | DoBlue };
  }

  allocColor(c: XColor): boolean {
    const r = c.red >> 8, g = c.green >> 8, b = c.blue >> 8;
    c.pixel = (r << 16) | (g << 8) | b;
    c.red = r * 0x101; c.green = g * 0x101; c.blue = b * 0x101;
    return true;
  }

  // ---------------------------------------------------------------- events

  private absPos(w: number): [number, number] {
    let x = 0, y = 0;
    for (let r = this.R(w); r && w !== this.root; w = r.parent, r = this.R(w)) { x += r.x + r.bw; y += r.y + r.bw; }
    return [x, y];
  }

  private viewable(w: number): boolean {
    for (let r = this.R(w); r && w !== this.root; w = r.parent, r = this.R(w)) if (!r.mapped) return false;
    return true;
  }

  /** the deepest viewable window containing the root point (children created later are on top) */
  private windowAt(x: number, y: number): number {
    let w = this.root;
    for (;;) {
      let best = 0;
      for (let i = 1; i < this.res.length; i++) {
        const r = this.res[i];
        if (r.kind !== R_WINDOW || r.parent !== w || !r.mapped) continue;
        const [ax, ay] = this.absPos(i);
        if (x >= ax && y >= ay && x < ax + r.w && y < ay + r.h && (!best || r.stack > this.res[best].stack)) best = i;
      }
      if (!best) return w;
      w = best;
    }
  }

  private eventWindow(w: number, mask: number): number {
    while (w && w !== this.root) {
      const r = this.R(w);
      if (!r) return 0;
      if (r.mask & mask) return w;
      w = r.parent;
    }
    return 0;
  }

  private topWindow(): number {
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === this.root && r.mapped) return i;
    }
    return 0;
  }

  private push(e: XEvent): void {
    this.queue.push(e);
  }

  private keycodeOf(ks: number): number {
    if (ks >= 0x41 && ks <= 0x5a) ks += 0x20;
    const i = this.keycodes.indexOf(ks);
    if (i >= 0) return 8 + i;
    if (this.keycodes.length === 248) return 8;
    this.keycodes.push(ks);
    return 8 + this.keycodes.length - 1;
  }

  private modOf(ks: number): number {
    switch (ks) {
      case XK.Shift_L: case XK.Shift_R: return ShiftMask;
      case XK.Control_L: case XK.Control_R: return ControlMask;
      case XK.Meta_L: case XK.Meta_R: case XK.Alt_L: case XK.Alt_R: return Mod1Mask;
      case XK.Caps_Lock: return LockMask;
    }
    return 0;
  }

  private deliverKey(press: boolean, name: string): void {
    const ks = XStringToKeysym(name);
    let w = this.focusWindow && this.viewable(this.focusWindow) ? this.focusWindow : this.windowAt(this.ptrX, this.ptrY);
    w = this.eventWindow(w, press ? KeyPressMask : KeyReleaseMask);
    this.note(`${press ? 'KeyPress' : 'KeyRelease'} ${name} ${this.dname(w)}`);
    if (w) {
      const e = newEvent(press ? KeyPress : KeyRelease);
      e.window = w; e.root = this.root;
      const [ax, ay] = this.absPos(w);
      e.x = this.ptrX - ax; e.y = this.ptrY - ay; e.x_root = this.ptrX; e.y_root = this.ptrY;
      e.state = this.modState;
      e.keycode = this.keycodeOf(ks);
      this.push(e);
    }
    if (press) this.modState |= this.modOf(ks); else this.modState &= ~this.modOf(ks);
  }

  private pointerTarget(mask: number): number {
    let w = this.eventWindow(this.windowAt(this.ptrX, this.ptrY), mask);
    if (!w && this.grabWin && this.R(this.grabWin) && this.res[this.grabWin].mask & mask) w = this.grabWin;
    return w;
  }

  private crossingEvent(type: number, w: number): void {
    const r = this.R(w);
    if (!r || !(r.mask & (type === EnterNotify ? EnterWindowMask : LeaveWindowMask))) return;
    const e = newEvent(type);
    e.window = w; e.root = this.root;
    const [ax, ay] = this.absPos(w);
    e.x = this.ptrX - ax; e.y = this.ptrY - ay; e.x_root = this.ptrX; e.y_root = this.ptrY;
    e.mode = NotifyNormal; e.detail = NotifyAncestor; e.state = this.modState;
    this.push(e);
  }

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
    const w = this.pointerTarget(press ? ButtonPressMask : ButtonReleaseMask);
    this.note(`${press ? 'ButtonPress' : 'ButtonRelease'} ${button} at ${this.ptrX},${this.ptrY} ${this.dname(w)}`);
    if (w) {
      const e = newEvent(press ? ButtonPress : ButtonRelease);
      e.window = w; e.root = this.root;
      const [ax, ay] = this.absPos(w);
      e.x = this.ptrX - ax; e.y = this.ptrY - ay; e.x_root = this.ptrX; e.y_root = this.ptrY;
      e.state = this.modState; e.button = button;
      this.push(e);
    }
    const m = button === 1 ? Button1Mask : button === 2 ? Button2Mask : button === 3 ? Button3Mask : 0;
    if (press) this.modState |= m; else this.modState &= ~m;
    if (press && w && !this.grabWin) this.grabWin = w;
    if (!(this.modState & (Button1Mask | Button2Mask | Button3Mask))) this.grabWin = 0;
  }

  private motion(): void {
    this.crossing();
    const w = this.pointerTarget(PointerMotionMask | (this.modState & (Button1Mask | Button2Mask | Button3Mask) ? ButtonMotionMask : 0));
    this.note(`MotionNotify ${this.ptrX},${this.ptrY} ${this.dname(w)}`);
    if (!w) return;
    const e = newEvent(MotionNotify);
    e.window = w; e.root = this.root;
    const [ax, ay] = this.absPos(w);
    e.x = this.ptrX - ax; e.y = this.ptrY - ay; e.x_root = this.ptrX; e.y_root = this.ptrY;
    e.state = this.modState;
    this.push(e);
  }

  private expose(w: number): void {
    const r = this.R(w);
    if (!r || !(r.mask & ExposureMask)) return;
    const e = newEvent(Expose);
    e.window = w; e.width = r.w; e.height = r.h;
    this.push(e);
  }

  private mapNotify(w: number): void {
    const r = this.R(w);
    if (!r || !(r.mask & StructureNotifyMask)) return;
    const e = newEvent(MapNotify);
    e.window = w;
    this.push(e);
  }

  private exposeTree(w: number): void {
    if (!this.viewable(w)) return;
    this.expose(w);
    for (let i = 1; i < this.res.length; i++) {
      const r = this.res[i];
      if (r.kind === R_WINDOW && r.parent === w && r.mapped) this.exposeTree(i);
    }
  }

  // device input: one event becomes an X event only when the client has taken everything queued

  inputKey(press: boolean, name: string): void {
    if (XStringToKeysym(name) === NoSymbol) throw new Error(`xlib: unknown keysym ${name}`);
    this.inputs.push({ kind: IN_KEY, press, a: 0, b: 0, name });
  }
  inputButton(press: boolean, button: number): void { this.inputs.push({ kind: IN_BUTTON, press, a: button, b: 0, name: '' }); }
  inputMotionRel(dx: number, dy: number): void { this.inputs.push({ kind: IN_REL, press: false, a: dx, b: dy, name: '' }); }
  /** a pointer position in the top-level window's coordinates */
  inputMotionAbs(x: number, y: number): void { this.inputs.push({ kind: IN_ABS, press: false, a: x, b: y, name: '' }); }
  /** device input not yet taken (the browser: what is still to come) */
  inputPending(): number { return this.inputs.length; }

  private promote(): number {
    while (!this.queue.length && this.inputs.length) {
      const i = this.inputs.shift()!;
      switch (i.kind) {
        case IN_KEY: this.deliverKey(i.press, i.name); break;
        case IN_BUTTON: this.deliverButton(i.press, i.a); break;
        case IN_REL: this.ptrX += i.a; this.ptrY += i.b; this.motion(); break;
        case IN_ABS: {
          const t = this.topWindow();
          const [ax, ay] = t ? this.absPos(t) : [0, 0];
          this.ptrX = ax + i.a; this.ptrY = ay + i.b;
          this.motion();
          break;
        }
      }
    }
    return this.queue.length;
  }

  pending(): number { return this.promote(); }

  /** XNextEvent: the next event; with an empty queue it waits through waitHook (or returns null) */
  nextEvent(): XEvent | null {
    while (!this.promote()) {
      if (!this.waitHook) return null;
      this.waitHook();
    }
    return this.queue.shift()!;
  }

  checkMaskEvent(mask: number): XEvent | null {
    this.promote();
    for (let i = 0; i < this.queue.length; i++) {
      const t = this.queue[i].type;
      const m = t === KeyPress ? KeyPressMask : t === KeyRelease ? KeyReleaseMask : t === ButtonPress ? ButtonPressMask
        : t === ButtonRelease ? ButtonReleaseMask : t === MotionNotify ? PointerMotionMask | ButtonMotionMask
          : t === Expose ? ExposureMask : t === MapNotify || t === UnmapNotify || t === ConfigureNotify ? StructureNotifyMask
            : t === EnterNotify ? EnterWindowMask : t === LeaveNotify ? LeaveWindowMask : t === FocusIn || t === FocusOut ? FocusChangeMask : 0;
      if (m & mask) return this.queue.splice(i, 1)[0];
    }
    return null;
  }

  checkIfEvent(pred: (e: XEvent) => boolean): XEvent | null {
    this.promote();
    for (let i = 0; i < this.queue.length; i++) if (pred(this.queue[i])) return this.queue.splice(i, 1)[0];
    return null;
  }

  lookupKeysym(e: XEvent, index: number): number {
    if (e.keycode < 8 || e.keycode >= 8 + this.keycodes.length) return NoSymbol;
    let ks = this.keycodes[e.keycode - 8];
    if (index === 1 && ks >= 0x61 && ks <= 0x7a) ks -= 0x20;
    return ks;
  }

  /** XLookupString: [the characters, the keysym] */
  lookupString(e: XEvent): [string, number] {
    let ks = this.lookupKeysym(e, 0);
    const shift = (e.state & ShiftMask) !== 0;
    if (shift && ks >= 0x61 && ks <= 0x7a) ks -= 0x20;
    else if (shift && ks < 0x80 && ks) {
      const p = SHIFTED_FROM.indexOf(String.fromCharCode(ks));
      if (p >= 0) ks = SHIFTED_TO.charCodeAt(p);
    }
    let c = 0;
    if (ks >= 0x20 && ks < 0x7f) c = ks;
    else if (ks >= 0xa0 && ks <= 0xff) c = ks;
    else if (ks === XK.Return || ks === XK.KP_Enter) c = 13;
    else if (ks === XK.BackSpace) c = 8;
    else if (ks === XK.Tab) c = 9;
    else if (ks === XK.Escape) c = 27;
    else if (ks === XK.Delete) c = 127;
    if (c && e.state & ControlMask && ((c >= 0x40 && c <= 0x5f) || (c >= 0x61 && c <= 0x7a))) c &= 0x1f;
    return [c ? String.fromCharCode(c) : '', ks];
  }

  // ---------------------------------------------------------------- the screen

  /**
   * Composites the viewable windows inside the root rectangle (rx, ry, w, h) into `out` (0xAABBGGRR
   * per pixel, as canvas ImageData on little-endian machines): windows with their borders, children
   * above parents, later or raised siblings above earlier ones.
   */
  composite(out: Uint32Array, rx: number, ry: number, w: number, h: number): void {
    out.fill(0xff000000);
    const paint = (id: number, ox: number, oy: number, cx0: number, cy0: number, cx1: number, cy1: number) => {
      const r = this.res[id];
      const x0 = ox + r.x, y0 = oy + r.y;
      // border
      if (r.bw > 0) {
        const bx0 = Math.max(cx0, x0), by0 = Math.max(cy0, y0);
        const bx1 = Math.min(cx1, x0 + r.w + 2 * r.bw), by1 = Math.min(cy1, y0 + r.h + 2 * r.bw);
        const c = abgr(r.border);
        for (let y = by0; y < by1; y++) out.fill(c, (y - ry) * w + (bx0 - rx), (y - ry) * w + (bx1 - rx));
      }
      const ix = x0 + r.bw, iy = y0 + r.bw;
      const ax0 = Math.max(cx0, ix), ay0 = Math.max(cy0, iy), ax1 = Math.min(cx1, ix + r.w), ay1 = Math.min(cy1, iy + r.h);
      if (ax0 >= ax1 || ay0 >= ay1) return;
      const s = this.surf(id);
      if (s && s.data.length) {
        for (let y = ay0; y < ay1; y++) {
          const so = (y - iy) * s.w - ix, o = (y - ry) * w - rx;
          for (let x = ax0; x < ax1; x++) out[o + x] = abgr(s.data[so + x]);
        }
      }
      const kids: number[] = [];
      for (let i = 1; i < this.res.length; i++) if (this.res[i].kind === R_WINDOW && this.res[i].parent === id && this.res[i].mapped) kids.push(i);
      kids.sort((a, b) => this.res[a].stack - this.res[b].stack);
      for (const k of kids) paint(k, ix, iy, ax0, ay0, ax1, ay1);
    };
    const tops: number[] = [];
    for (let i = 1; i < this.res.length; i++) if (this.res[i].kind === R_WINDOW && this.res[i].parent === this.root && this.res[i].mapped) tops.push(i);
    tops.sort((a, b) => this.res[a].stack - this.res[b].stack);
    for (const t of tops) paint(t, 0, 0, rx, ry, rx + w, ry + h);
  }
}

const abgr = (p: number) => (0xff000000 | ((p & 0xff) << 16) | (p & 0xff00) | ((p >> 16) & 0xff)) >>> 0;

// ---------------------------------------------------------------- Xlib's functions

export function XStringToKeysym(s: string): number {
  for (const [n, v] of KEYSYMS) if (n === s) return v;
  if (s.length === 1) {
    const c = s.charCodeAt(0);
    if ((c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) return c;
  }
  return NoSymbol;
}

export function XKeysymToString(ks: number): string | null {
  for (const [n, v] of KEYSYMS) if (v === ks) return n;
  if ((ks >= 0x30 && ks <= 0x39) || (ks >= 0x41 && ks <= 0x5a) || (ks >= 0x61 && ks <= 0x7a)) return String.fromCharCode(ks);
  return null;
}

/** XParseGeometry: [=][<w>{xX}<h>][{+-}<x>{+-}<y>] */
export function XParseGeometry(s: string): { mask: number; x: number; y: number; w: number; h: number } {
  const out = { mask: NoValue, x: 0, y: 0, w: 0, h: 0 };
  if (!s) return out;
  let p = 0;
  const readInt = (): number | null => {
    let sign = 1;
    if (s[p] === '+') p++;
    else if (s[p] === '-') { sign = -1; p++; }
    if (!/[0-9]/.test(s[p] ?? '')) return null;
    let r = 0;
    while (/[0-9]/.test(s[p] ?? '')) r = r * 10 + (s.charCodeAt(p++) - 48);
    return sign * r;
  };
  if (s[p] === '=') p++;
  if (/[0-9]/.test(s[p] ?? '')) {
    const w = readInt();
    if (w === null) return { ...out, mask: 0 };
    out.w = w; out.mask |= WidthValue;
    if (s[p] !== 'x' && s[p] !== 'X') return { ...out, mask: 0 };
    p++;
    const h = readInt();
    if (h === null) return { ...out, mask: 0 };
    out.h = h; out.mask |= HeightValue;
  }
  if (s[p] === '+' || s[p] === '-') {
    if (s[p] === '-') out.mask |= XNegative;
    const x = readInt();
    if (x === null) return { ...out, mask: 0 };
    out.x = x; out.mask |= XValue;
    if (s[p] !== '+' && s[p] !== '-') return { ...out, mask: 0 };
    if (s[p] === '-') out.mask |= YNegative;
    const y = readInt();
    if (y === null) return { ...out, mask: 0 };
    out.y = y; out.mask |= YValue;
  }
  if (p < s.length) return { ...out, mask: 0 };
  return out;
}

export const XDrawLine = (d: Display, w: number, gc: GC, x1: number, y1: number, x2: number, y2: number) => d.drawLine(w, gc, x1, y1, x2, y2);
export const XDrawLines = (d: Display, w: number, gc: GC, p: XPoint[], n: number, mode: number) => d.drawLines(w, gc, p, n, mode);
export const XDrawPoint = (d: Display, w: number, gc: GC, x: number, y: number) => d.drawPoint(w, gc, x, y);
export const XDrawPoints = (d: Display, w: number, gc: GC, p: XPoint[], n: number, mode: number) => d.drawPoints(w, gc, p, n, mode);
export const XDrawSegments = (d: Display, w: number, gc: GC, s: XSegment[], n: number) => d.drawSegments(w, gc, s, n);
export const XDrawRectangle = (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number) => d.drawRectangle(w, gc, x, y, wd, h);
export const XFillRectangle = (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number) => d.fillRectangle(w, gc, x, y, wd, h);
export const XFillRectangles = (d: Display, w: number, gc: GC, r: XRectangle[], n: number) => d.fillRectangles(w, gc, r, n);
export const XFillPolygon = (d: Display, w: number, gc: GC, p: XPoint[], n: number, shape: number, mode: number) => d.fillPolygon(w, gc, p, n, shape, mode);
export const XDrawArc = (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number, a1: number, a2: number) => d.drawArc(w, gc, x, y, wd, h, a1, a2);
export const XDrawArcs = (d: Display, w: number, gc: GC, a: XArc[], n: number) => d.drawArcs(w, gc, a, n);
export const XFillArc = (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number, a1: number, a2: number) => d.fillArc(w, gc, x, y, wd, h, a1, a2);
export const XDrawString = (d: Display, w: number, gc: GC, x: number, y: number, s: string, n: number) => d.drawString(w, gc, x, y, s, n);
export const XCopyArea = (d: Display, s: number, t: number, gc: GC, sx: number, sy: number, w: number, h: number, dx: number, dy: number) => d.copyArea(s, t, gc, sx, sy, w, h, dx, dy);
export const XClearWindow = (d: Display, w: number) => d.clearWindow(w);
export const XBell = (d: Display, p: number) => d.bell(p);
export const XFlush = (_d: Display) => 0;
export const XSync = (d: Display, _discard: boolean) => d.sync();

export const XCreatePixmap = (d: Display, dr: number, w: number, h: number, depth: number) => d.createPixmap(dr, w, h, depth);
export const XFreePixmap = (d: Display, p: number) => d.freePixmap(p);
export const XCreateBitmapFromData = (d: Display, dr: number, data: Uint8Array, w: number, h: number) => d.createBitmapFromData(dr, data, w, h);
export const XLoadQueryFont = (d: Display, name: string) => d.loadQueryFont(name);
export const XQueryFont = (d: Display, id: number) => d.queryFont(id);
export const XTextWidth = (f: XFontStruct, _s: string, n: number) => n * f.max_bounds.width;

export const XCreateGC = (d: Display, dr: number, mask: number, v: XGCValues | null) => d.createGC(dr, mask, v);
export const XChangeGC = (d: Display, gc: GC, mask: number, v: XGCValues) => d.changeGC(gc, mask, v);
export const XFreeGC = (_d: Display, _gc: GC) => 0;
export const XGContextFromGC = (gc: GC) => gc.gid;
export function XSetForeground(_d: Display, gc: GC, p: number) { gc.foreground = p; }
export function XSetBackground(_d: Display, gc: GC, p: number) { gc.background = p; }
export function XSetFunction(_d: Display, gc: GC, f: number) { gc.function = f; }
export function XSetPlaneMask(_d: Display, gc: GC, pm: number) { gc.plane_mask = pm; }
export function XSetState(_d: Display, gc: GC, fg: number, bg: number, f: number, pm: number) {
  gc.foreground = fg; gc.background = bg; gc.function = f; gc.plane_mask = pm;
}
export function XSetLineAttributes(_d: Display, gc: GC, lw: number, ls: number, cs: number, js: number) {
  gc.line_width = lw | 0; gc.line_style = ls; gc.cap_style = cs; gc.join_style = js;
}
export function XSetDashes(_d: Display, gc: GC, off: number, list: number[], n: number) {
  gc.dash_offset = off;
  gc.dashes = list.slice(0, Math.min(n, 16)).map((v) => v & 0xff);
}
export function XSetFillStyle(_d: Display, gc: GC, fs: number) { gc.fill_style = fs; }
export function XSetFont(_d: Display, gc: GC, f: number) { gc.font = f; }
export function XSetTile(_d: Display, gc: GC, t: number) { gc.tile = t; }
export function XSetTSOrigin(_d: Display, gc: GC, x: number, y: number) { gc.ts_x_origin = x; gc.ts_y_origin = y; }
export function XSetClipMask(_d: Display, gc: GC, p: number) { gc.clip_mask = p; }
export function XSetClipOrigin(_d: Display, gc: GC, x: number, y: number) { gc.clip_x_origin = x; gc.clip_y_origin = y; }

export const XCreateWindow = (d: Display, parent: number, x: number, y: number, w: number, h: number, bw: number, depth: number, cls: number, mask: number, a: XSetWindowAttributes) =>
  d.createWindow(parent, x, y, w, h, bw, depth, cls, mask, a);
export const XCreateSimpleWindow = (d: Display, parent: number, x: number, y: number, w: number, h: number, bw: number, border: number, bg: number) =>
  d.createSimpleWindow(parent, x, y, w, h, bw, border, bg);
export const XDestroyWindow = (d: Display, w: number) => d.destroyWindow(w);
export const XMapWindow = (d: Display, w: number) => d.mapWindow(w);
export const XMapRaised = (d: Display, w: number) => d.mapRaised(w);
export const XMapSubwindows = (d: Display, w: number) => d.mapSubwindows(w);
export const XUnmapWindow = (d: Display, w: number) => d.unmapWindow(w);
export const XMoveWindow = (d: Display, w: number, x: number, y: number) => d.moveWindow(w, x, y);
export const XResizeWindow = (d: Display, w: number, width: number, height: number) => d.resizeWindow(w, width, height);
export const XMoveResizeWindow = (d: Display, w: number, x: number, y: number, width: number, height: number) => d.moveResizeWindow(w, x, y, width, height);
export const XSetWindowBackground = (d: Display, w: number, bg: number) => d.setWindowBackground(w, bg);
export const XChangeWindowAttributes = (d: Display, w: number, mask: number, a: XSetWindowAttributes) => d.changeWindowAttributes(w, mask, a);
export const XSelectInput = (d: Display, w: number, mask: number) => d.selectInput(w, mask);
export const XStoreName = (d: Display, w: number, n: string) => d.storeName(w, n);
export const XSetInputFocus = (d: Display, w: number, _revert: number, _t: number) => d.setInputFocus(w);
export const XWarpPointer = (d: Display, _src: number, dst: number, _sx: number, _sy: number, _sw: number, _sh: number, dx: number, dy: number) => d.warpPointer(dst, dx, dy);
export const XPending = (d: Display) => d.pending();
export const XEventsQueued = (d: Display, _mode: number) => d.pending();
export const XNextEvent = (d: Display) => d.nextEvent();
export const XCheckMaskEvent = (d: Display, mask: number) => d.checkMaskEvent(mask);
export const XCheckIfEvent = (d: Display, pred: (e: XEvent) => boolean) => d.checkIfEvent(pred);
export const XLookupKeysym = (d: Display, e: XEvent, index: number) => d.lookupKeysym(e, index);
export const XLookupString = (d: Display, e: XEvent) => d.lookupString(e);
export const XParseColor = (d: Display, _cm: number, spec: string) => d.parseColor(spec);
export const XAllocColor = (d: Display, _cm: number, c: XColor) => d.allocColor(c);
export const XInternAtom = (d: Display, name: string, _only: boolean) => d.internAtom(name);
export const XCreatePixmapCursor = (d: Display) => d.createPixmapCursor();
export const XGetWindowAttributes = (d: Display, w: number) => d.getWindowAttributes(w);
export const XQueryPointer = (d: Display, w: number) => d.queryPointer(w);
export const DisplayWidth = (d: Display, _s: number) => d.width;
export const DisplayHeight = (d: Display, _s: number) => d.height;
export const DefaultRootWindow = (d: Display) => d.root;
export const WhitePixel = (_d: Display, _s: number) => 0xffffff;
export const BlackPixel = (_d: Display, _s: number) => 0;
export const ConnectionNumber = (d: Display) => d.fd;
