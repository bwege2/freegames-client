// x11/widget.c: the client's widgets (forms, labels, buttons, menus, arrows, number inputs, the text
// viewer with sliders), drawn with Xlib into their own windows. A callback may wait (the welcome
// screen's room list), so the event dispatch is async.
import { G } from './G.ts';
import { BLACK, WHITE } from './consts.ts';
import { LIMIT, MAX, MIN, sprintf, strlcpy } from './cutil.ts';
import { warn } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { XEvent, XFontStruct } from '../xlib/xlib.ts';
import { ShadowDrawString } from './xpaint.ts';
import { sys } from './sys.ts';

export const NO_WIDGET = 0;

const WIDGET_DUMMY = 0, WIDGET_FORM = 1, WIDGET_LABEL = 2, WIDGET_BUTTON_BOOL = 3, WIDGET_BUTTON_ACTIVATE = 4,
  WIDGET_BUTTON_MENU = 5, WIDGET_BUTTON_ENTRY = 6, WIDGET_BUTTON_ARROW_LEFT = 7, WIDGET_BUTTON_ARROW_RIGHT = 8,
  WIDGET_INPUT_INT = 9, WIDGET_INPUT_COLOR = 10, WIDGET_INPUT_DOUBLE = 11, WIDGET_VIEWER = 13, WIDGET_SLIDER_HORI = 14,
  WIDGET_SLIDER_VERT = 15;

export type Callback = (widget: number, data: unknown, str: { value: string }) => number | Promise<number>;
export type BoolCallback = (widget: number, data: unknown, val: { value: boolean }) => number;
export type IntCallback = (widget: number, data: unknown, val: { get(): number; set(v: number): void }) => number;
export type DoubleCallback = (widget: number, data: unknown, val: { get(): number; set(v: number): void }) => number;

interface Ptr<T> { get(): T; set(v: T): void }

interface FormSub { children: number[] }
interface LabelSub { str: string; x_offset: number; y_offset: number }
interface BoolSub { pressed: boolean; inside: boolean; state: boolean; callback: BoolCallback | null; user_data: unknown }
interface MenuSub { pressed: boolean; str: string; pulldown_desc: number }
interface EntrySub { inside: boolean; str: { value: string }; callback: Callback | null; user_data: unknown }
interface ActivateSub { pressed: boolean; inside: boolean; str: { value: string }; callback: Callback | null; user_data: unknown }
interface ArrowSub { pressed: boolean; inside: boolean; widget_desc: number }
interface IntSub { val: Ptr<number>; min: number; max: number; callback: IntCallback | null; user_data: unknown }
interface DoubleSub { val: Ptr<number>; min: number; max: number; callback: DoubleCallback | null; user_data: unknown }
interface ViewerLine { txt: number; len: number; txt_width: number }
interface ViewerSub {
  overlay: number; buf: string; len: number; vert_slider_desc: number; hori_slider_desc: number; save_button_desc: number;
  close_button_desc: number; visible_x: number; visible_y: number; real_width: number; real_height: number; max_width: number;
  num_lines: number; line: ViewerLine[]; font: XFontStruct;
}
interface SliderSub { pressed: boolean; inside: boolean; viewer_desc: number }

type Sub = FormSub | LabelSub | BoolSub | MenuSub | EntrySub | ActivateSub | ArrowSub | IntSub | DoubleSub | ViewerSub | SliderSub | null;

interface widget_t {
  type: number;
  name: string | null;
  parent_desc: number;
  window: number;
  width: number;
  height: number;
  border: number;
  sub: Sub;
}

const W = { widgets: [] as widget_t[], max_widgets: 0 };
import { onReset } from './cutil.ts';
onReset(() => Object.assign(W, { widgets: [], max_widgets: 0 }));

function Widget_validate(d: number): number {
  if (d <= NO_WIDGET || d >= W.widgets.length) return NO_WIDGET;
  if (W.widgets[d].type === WIDGET_DUMMY) return NO_WIDGET;
  return d;
}

function Widget_pointer(d: number): widget_t | null {
  return Widget_validate(d) === NO_WIDGET ? null : W.widgets[d];
}

export function Widget_window(d: number): number {
  const w = Widget_pointer(d);
  return w ? w.window : 0;
}

function Widget_window_gravity(w: number, gravity: number): void {
  X.XChangeWindowAttributes(G.dpy, w, X.CWWinGravity, { win_gravity: gravity });
}

function Widget_bit_gravity(w: number, gravity: number): void {
  X.XChangeWindowAttributes(G.dpy, w, X.CWBitGravity, { bit_gravity: gravity });
}

export function Widget_destroy_children(d: number): void {
  const w = Widget_pointer(d);
  if (w && w.type === WIDGET_FORM && w.sub) {
    const form = w.sub as FormSub;
    if (form.children.length) {
      const kids = form.children;
      for (let i = 0; i < kids.length; i++) Widget_destroy(kids[i]);
      form.children = [];
    }
  }
}

export function Widget_destroy(d: number): void {
  const w = Widget_pointer(d);
  if (!w) return;
  w.name = null;
  const t = w.type;
  w.type = WIDGET_DUMMY;
  if (w.sub) {
    if (t === WIDGET_FORM) {
      const form = w.sub as FormSub;
      const kids = form.children;
      for (let i = 0; i < kids.length; i++) Widget_destroy(kids[i]);
      form.children = [];
    }
    w.sub = null;
  }
  if (w.window !== 0) {
    X.XDestroyWindow(G.dpy, w.window);
    w.window = 0;
  }
  if (w.parent_desc !== NO_WIDGET) {
    const parent = Widget_pointer(w.parent_desc);
    if (parent && parent.type === WIDGET_FORM) {
      const form = parent.sub as FormSub;
      for (let i = 0; i < form.children.length; i++) if (form.children[i] === d) form.children[i] = NO_WIDGET;
    }
    w.parent_desc = NO_WIDGET;
  }
}

/** Widget_new: the first DUMMY slot after the array is full (widgets[0] is a dummy) */
function Widget_new(): number {
  if (W.widgets.length > 0 && W.max_widgets > 0) {
    if (W.widgets.length < W.max_widgets) {
      W.widgets.push(blankWidget());
      return W.widgets.length - 1;
    }
    for (let i = 1; i < W.widgets.length; i++) if (W.widgets[i].type === WIDGET_DUMMY) return i;
  }
  if (W.widgets.length === 0 || W.max_widgets <= 0) {
    W.max_widgets = 10;
    W.widgets = [blankWidget()];
  } else W.max_widgets = 10 + Math.trunc((12 * W.max_widgets) / 8);
  W.widgets.push(blankWidget());
  return W.widgets.length - 1;
}

const blankWidget = (): widget_t => ({ type: WIDGET_DUMMY, name: null, parent_desc: NO_WIDGET, window: 0, width: 0, height: 0, border: 0, sub: null });

function Widget_create(type: number, name: string, window: number, width: number, height: number, sub: Sub): number {
  const d = Widget_new();
  const w = W.widgets[d];
  w.type = type;
  w.name = name;
  w.parent_desc = NO_WIDGET;
  w.window = window;
  w.width = width;
  w.height = height;
  w.sub = sub;
  return d;
}

function Widget_add_child(parent_desc: number, child_desc: number): number {
  const parent = Widget_pointer(parent_desc), child = Widget_pointer(child_desc);
  if (!parent || !child) {
    warn("Can't add child widget to parent");
    return NO_WIDGET;
  }
  if (parent.type !== WIDGET_FORM || !parent.sub) {
    warn('Not a form widget');
    return NO_WIDGET;
  }
  if (child.parent_desc !== NO_WIDGET) {
    warn('Widget parent non-zero');
    child.parent_desc = NO_WIDGET;
  }
  const form = parent.sub as FormSub;
  for (let i = 0; i < form.children.length; i++) {
    if (W.widgets[form.children[i]].type === WIDGET_DUMMY) {
      form.children[i] = child_desc;
      child.parent_desc = parent_desc;
      return child_desc;
    }
  }
  form.children.push(child_desc);
  child.parent_desc = parent_desc;
  return child_desc;
}

function Widget_resize(d: number, width: number, height: number): number {
  const w = Widget_pointer(d);
  if (!w) return NO_WIDGET;
  X.XResizeWindow(G.dpy, w.window, width, height);
  w.width = width;
  w.height = height;
  return d;
}

function Widget_draw_button(w: widget_t, inverse: boolean, label: string): void {
  const bg = inverse ? G.colors[BLACK].pixel : G.colors[G.buttonColor].pixel;
  X.XSetForeground(G.dpy, G.buttonGC, bg);
  X.XFillRectangle(G.dpy, w.window, G.buttonGC, 0, 0, w.width, w.height);
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[G.buttonColor].pixel);
  const fg = G.colors[WHITE].pixel, bg2 = G.colors[BLACK].pixel;
  const y = Math.trunc((w.height - (G.buttonFont.ascent + G.buttonFont.descent)) / 2);
  const x = Math.trunc((w.width - X.XTextWidth(G.buttonFont, label, label.length)) / 2);
  ShadowDrawString(G.dpy, w.window, G.buttonGC, x, G.buttonFont.ascent + y, label, fg, bg2);
}

function Widget_draw_input(w: widget_t, str: string): void {
  X.XClearWindow(G.dpy, w.window);
  X.XDrawString(G.dpy, w.window, G.textGC, Math.trunc((w.width - X.XTextWidth(G.textFont, str, str.length)) / 2),
    G.textFont.ascent + Math.trunc((w.height - (G.textFont.ascent + G.textFont.descent)) / 2), str, str.length);
}

function Widget_draw_color(w: widget_t, str: string, color: number): void {
  X.XSetWindowBackground(G.dpy, w.window, G.colors[color].pixel);
  X.XSetForeground(G.dpy, G.textGC, G.colors[color].pixel === G.colors[WHITE].pixel ? G.colors[BLACK].pixel : G.colors[WHITE].pixel);
  X.XClearWindow(G.dpy, w.window);
  X.XDrawString(G.dpy, w.window, G.textGC, Math.trunc((w.width - X.XTextWidth(G.textFont, str, str.length)) / 2),
    G.textFont.ascent + Math.trunc((w.height - (G.textFont.ascent + G.textFont.descent)) / 2), str, str.length);
}

function Widget_draw_arrow(w: widget_t): void {
  const a = w.sub as ArrowSub;
  let left = Math.trunc(w.width / 4), right = w.width - left;
  const top = Math.trunc(w.height / 4), bottom = w.height - top;
  if (w.type === WIDGET_BUTTON_ARROW_RIGHT) [left, right] = [right, left];
  const [fg, bg] = a.pressed && a.inside ? [BLACK, G.buttonColor] : [G.buttonColor, BLACK];
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[bg].pixel);
  X.XFillRectangle(G.dpy, w.window, G.buttonGC, 0, 0, w.width, w.height);
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[fg].pixel);
  const pts = [{ x: left, y: Math.trunc(w.height / 2) }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: Math.trunc(w.height / 2) }];
  X.XFillPolygon(G.dpy, w.window, G.buttonGC, pts, 4, X.Convex, X.CoordModeOrigin);
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[WHITE].pixel);
}

function Widget_draw_slider(w: widget_t): void {
  const s = w.sub as SliderSub;
  const vw = Widget_pointer(s.viewer_desc)!;
  const v = vw.sub as ViewerSub;
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[G.buttonColor].pixel);
  const q = (n: number) => Math.trunc(n / 4);
  if (w.type === WIDGET_SLIDER_HORI) {
    const unit = w.height;
    const pts = [{ x: q(unit), y: Math.trunc(unit / 2) }, { x: q(unit) * 3, y: q(unit) }, { x: q(unit) * 3, y: q(unit) * 3 }, { x: q(unit), y: Math.trunc(unit / 2) }];
    X.XFillPolygon(G.dpy, w.window, G.buttonGC, pts, 4, X.Convex, X.CoordModeOrigin);
    for (const p of pts) p.x = w.width - p.x;
    X.XFillPolygon(G.dpy, w.window, G.buttonGC, pts, 4, X.Convex, X.CoordModeOrigin);
    const off = unit, max = w.width - 2 * off;
    const size = Math.trunc((max * vw.width) / v.real_width), start = Math.trunc((max * v.visible_x) / v.real_width);
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, off + start, q(unit), size, Math.trunc(unit / 2));
    X.XSetForeground(G.dpy, G.buttonGC, G.colors[BLACK].pixel);
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, off, q(unit), start, Math.trunc(unit / 2));
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, off + start + size, q(unit), max - (start + size), Math.trunc(unit / 2));
  } else if (w.type === WIDGET_SLIDER_VERT) {
    const unit = w.width;
    const pts = [{ x: Math.trunc(unit / 2), y: q(unit) }, { x: q(unit), y: q(unit) * 3 }, { x: q(unit) * 3, y: q(unit) * 3 }, { x: Math.trunc(unit / 2), y: q(unit) }];
    X.XFillPolygon(G.dpy, w.window, G.buttonGC, pts, 4, X.Convex, X.CoordModeOrigin);
    for (const p of pts) p.y = w.height - p.y;
    X.XFillPolygon(G.dpy, w.window, G.buttonGC, pts, 4, X.Convex, X.CoordModeOrigin);
    const off = unit, max = w.height - 2 * off;
    const size = Math.trunc((max * vw.height) / v.real_height), start = Math.trunc((max * v.visible_y) / v.real_height);
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, q(unit), off + start, Math.trunc(unit / 2), size);
    X.XSetForeground(G.dpy, G.buttonGC, G.colors[BLACK].pixel);
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, q(unit), off, Math.trunc(unit / 2), start);
    X.XFillRectangle(G.dpy, w.window, G.buttonGC, q(unit), off + start + size, Math.trunc(unit / 2), max - (start + size));
  }
  X.XSetForeground(G.dpy, G.buttonGC, G.colors[WHITE].pixel);
}

function Widget_viewer_draw_lines(w: widget_t, start: number, end: number): void {
  const v = w.sub as ViewerSub;
  const th = v.font.ascent + v.font.descent;
  const x = 20;
  let y = 20 + v.font.ascent + start * th;
  for (let i = start; i < end; i++) {
    const txt = v.buf.substr(v.line[i].txt, v.line[i].len);
    X.XSetForeground(G.dpy, G.motdGC, G.colors[BLACK].pixel);
    X.XDrawString(G.dpy, w.window, G.motdGC, x + 1, y + 1, txt, v.line[i].len);
    X.XSetForeground(G.dpy, G.motdGC, G.colors[WHITE].pixel);
    X.XDrawString(G.dpy, w.window, G.motdGC, x - 1, y - 1, txt, v.line[i].len);
    y += th;
  }
  X.XSetForeground(G.dpy, G.motdGC, G.colors[WHITE].pixel);
}

function Widget_draw_viewer(w: widget_t, expose: XEvent | null): void {
  const v = w.sub as ViewerSub;
  const th = v.font.ascent + v.font.descent;
  let y0 = v.visible_y, y1 = v.real_height;
  if (expose) {
    y0 = MAX(y0, expose.y);
    y1 = MIN(y1, expose.y + expose.height);
  } else y1 = MIN(y1, v.visible_y + w.height);
  let start = Math.trunc((y0 - 20) / th), end = Math.trunc((y1 - 20) / th) + 1;
  if (start < 0) start = 0;
  if (end > v.num_lines) end = v.num_lines;
  if (start < end) Widget_viewer_draw_lines(w, start, end);
}

function Widget_draw_expose(d: number, expose: XEvent | null): void {
  const w = Widget_pointer(d);
  if (!w) {
    warn('Widget draw invalid');
    return;
  }
  const skip = expose !== null && expose.count > 0;
  switch (w.type) {
    case WIDGET_FORM:
      if (!skip) X.XClearWindow(G.dpy, w.window);
      break;
    case WIDGET_LABEL: {
      if (skip) break;
      const l = w.sub as LabelSub;
      ShadowDrawString(G.dpy, w.window, G.textGC, l.x_offset, G.textFont.ascent + l.y_offset, l.str, G.colors[WHITE].pixel, G.colors[BLACK].pixel);
      break;
    }
    case WIDGET_BUTTON_BOOL: {
      if (skip) break;
      const b = w.sub as BoolSub;
      Widget_draw_button(w, b.pressed && b.inside, b.state ? 'Yes' : 'No');
      break;
    }
    case WIDGET_BUTTON_MENU:
      if (!skip) Widget_draw_button(w, false, (w.sub as MenuSub).str);
      break;
    case WIDGET_BUTTON_ACTIVATE: {
      if (skip) break;
      const a = w.sub as ActivateSub;
      Widget_draw_button(w, a.pressed && a.inside, a.str.value);
      break;
    }
    case WIDGET_BUTTON_ENTRY: {
      if (skip) break;
      const e = w.sub as EntrySub;
      Widget_draw_button(w, e.inside, e.str.value);
      break;
    }
    case WIDGET_INPUT_INT:
      if (!skip) Widget_draw_input(w, sprintf('%d', (w.sub as IntSub).val.get()));
      break;
    case WIDGET_INPUT_COLOR: {
      if (skip) break;
      const c = w.sub as IntSub;
      Widget_draw_color(w, sprintf('%d', c.val.get()), c.val.get());
      break;
    }
    case WIDGET_INPUT_DOUBLE: {
      if (skip) break;
      const v = (w.sub as DoubleSub).val.get();
      Widget_draw_input(w, strlcpy(v < 10.0 ? sprintf('%.2f', v) : v < 100.0 ? sprintf('%.1f', v) : sprintf('%d', Math.trunc(v)), 16));
      break;
    }
    case WIDGET_BUTTON_ARROW_LEFT: case WIDGET_BUTTON_ARROW_RIGHT:
      if (!skip) Widget_draw_arrow(w);
      break;
    case WIDGET_SLIDER_HORI: case WIDGET_SLIDER_VERT:
      if (!skip) Widget_draw_slider(w);
      break;
    case WIDGET_VIEWER:
      Widget_draw_viewer(w, expose);
      break;
    default:
      break;
  }
}

export function Widget_draw(d: number): void {
  Widget_draw_expose(d, null);
}

function Widget_button_slider(event: XEvent, w: widget_t, pressed: boolean): void {
  const s = w.sub as SliderSub;
  const vw = Widget_pointer(s.viewer_desc)!;
  const v = vw.sub as ViewerSub;
  if (!s.pressed && !pressed) {
    warn('Slider widget not pressed');
    return;
  }
  s.pressed = pressed;
  if (!pressed) return;
  if (w.type === WIDGET_SLIDER_VERT) {
    const unit = w.width, off = unit, max = w.height - 2 * off;
    const size = Math.trunc((max * vw.height) / v.real_height);
    const start = off + Math.trunc((max * v.visible_y) / v.real_height);
    let ns: number;
    if (event.y < unit) ns = start - size;
    else if (event.y >= off + max) ns = start + size;
    else ns = event.y - Math.trunc(size / 2);
    if (ns < off) ns = off;
    else if (ns + size > off + max) ns = off + max - size;
    if (ns !== start) {
      v.visible_y = Math.trunc((v.real_height * (ns - off)) / max);
      X.XMoveWindow(G.dpy, vw.window, -v.visible_x, -v.visible_y);
      Widget_draw_slider(w);
    }
  } else if (w.type === WIDGET_SLIDER_HORI) {
    const unit = w.height, off = unit, max = w.width - 2 * off;
    const size = Math.trunc((max * vw.width) / v.real_width);
    const start = off + Math.trunc((max * v.visible_x) / v.real_width);
    let ns: number;
    if (event.x < unit) ns = start - size;
    else if (event.x >= off + max) ns = start + size;
    else ns = event.x - Math.trunc(size / 2);
    if (ns < off) ns = off;
    else if (ns + size > off + max) ns = off + max - size;
    if (ns !== start) {
      v.visible_x = Math.trunc((v.real_width * (ns - off)) / max);
      X.XMoveWindow(G.dpy, vw.window, -v.visible_x, -v.visible_y);
      Widget_draw_slider(w);
    }
  }
}

function Widget_button_motion(event: XEvent, d: number): void {
  const w = Widget_pointer(d);
  if (!w) {
    warn('Widget button motion invalid');
    return;
  }
  if (w.type === WIDGET_SLIDER_HORI || w.type === WIDGET_SLIDER_VERT) {
    let found = 0;
    X.XCheckIfEvent(G.dpy, (e) => {
      if (e.window === w.window && e.type === X.MotionNotify) found++;
      return false;
    });
    if (found > 0) return;
    Widget_button_slider(event, w, true);
  }
}

async function Widget_button(event: XEvent, d: number, pressed: boolean): Promise<void> {
  const w = Widget_pointer(d);
  if (!w) {
    warn('Widget button invalid');
    return;
  }
  switch (w.type) {
    case WIDGET_BUTTON_BOOL: {
      const b = w.sub as BoolSub;
      if (!b.pressed && !pressed) { warn('Bool widget not pressed'); break; }
      b.pressed = pressed;
      if (!b.inside) break;
      if (!pressed) b.state = !b.state;
      Widget_draw(d);
      if (!pressed && b.callback) {
        const box = { value: b.state };
        const r = b.callback(d, b.user_data, box);
        b.state = box.value;
        if (r === 1) Widget_draw(d);
      }
      break;
    }
    case WIDGET_BUTTON_MENU: {
      const m = w.sub as MenuSub;
      if (!m.pressed && !pressed) { warn('Menu widget not pressed'); break; }
      m.pressed = pressed;
      Widget_draw(d);
      const pull = Widget_pointer(m.pulldown_desc);
      if (!pull) { warn('No pulldown widget'); break; }
      if (pull.type !== WIDGET_FORM) { warn('Pulldown not a form'); break; }
      if (pressed) {
        X.XMoveWindow(G.dpy, pull.window, event.x_root - event.x - 1, event.y_root - event.y + w.height);
        X.XMapRaised(G.dpy, pull.window);
        X.XFlush(G.dpy);
      } else {
        X.XUnmapWindow(G.dpy, pull.window);
        const form = pull.sub as FormSub;
        for (let i = 0; i < form.children.length; i++) {
          const ew = Widget_pointer(form.children[i]);
          if (!ew) continue;
          const e = ew.sub as EntrySub;
          if (!e.inside) continue;
          e.inside = false;
          if (e.callback) await e.callback(form.children[i], e.user_data, e.str);
        }
      }
      break;
    }
    case WIDGET_BUTTON_ACTIVATE: {
      const a = w.sub as ActivateSub;
      if (!a.pressed && !pressed) { warn('Activate widget not pressed'); break; }
      a.pressed = pressed;
      if (!a.inside) break;
      Widget_draw(d);
      if (!pressed && a.callback) {
        if ((await a.callback(d, a.user_data, a.str)) === 1) Widget_draw(d);
      }
      break;
    }
    case WIDGET_BUTTON_ARROW_LEFT: case WIDGET_BUTTON_ARROW_RIGHT: {
      const a = w.sub as ArrowSub;
      if (!a.pressed && !pressed) { warn('Arrow widget not pressed'); break; }
      a.pressed = pressed;
      if (!a.inside) break;
      Widget_draw(d);
      const sd = a.widget_desc;
      const sw = pressed || sd === NO_WIDGET ? null : Widget_pointer(sd);
      if (!sw) break;
      const right = w.type === WIDGET_BUTTON_ARROW_RIGHT;
      if (sw.type === WIDGET_INPUT_INT) {
        const s = sw.sub as IntSub;
        let ival = LIMIT(s.val.get(), s.min, s.max);
        if (right) {
          ival = Math.trunc(s.val.get() * 1.05 + 0.5);
          if (ival === s.val.get()) ival++;
        } else {
          ival = Math.trunc(s.val.get() * 0.95);
          if (ival === s.val.get()) ival--;
        }
        ival = LIMIT(ival, s.min, s.max);
        if (ival !== s.val.get()) {
          s.val.set(ival);
          Widget_draw(sd);
          if (s.callback && s.callback(sd, s.user_data, s.val) === 1) Widget_draw(sd);
        }
      } else if (sw.type === WIDGET_INPUT_COLOR) {
        const s = sw.sub as IntSub;
        let cval = LIMIT(s.val.get(), s.min, s.max);
        if (right && cval === s.val.get()) cval++;
        if (!right && cval === s.val.get()) cval--;
        cval = LIMIT(cval, s.min, s.max);
        if (cval !== s.val.get()) {
          s.val.set(cval);
          Widget_draw(sd);
          if (s.callback && s.callback(sd, s.user_data, s.val) === 1) Widget_draw(sd);
        }
      } else if (sw.type === WIDGET_INPUT_DOUBLE) {
        const s = sw.sub as DoubleSub;
        let dval = LIMIT(s.val.get(), s.min, s.max);
        const delta = s.max - s.min;
        let dmin: number, offset: number;
        if (dval >= 0) {
          dmin = s.min < 0 ? 0 : s.min;
          offset = dval - dmin;
        } else {
          dmin = s.max > 0 ? 0 : s.max;
          offset = -dval + dmin;
        }
        let newoffset: number;
        if (right === dval >= 0) {
          newoffset = offset * 1.05;
          if (newoffset - offset < delta / 100.0) newoffset = offset + delta / 100.0;
        } else {
          newoffset = offset * 0.95;
          if (newoffset - offset > -delta / 100.0) newoffset = offset - delta / 100.0;
          if (newoffset < 0 && offset > 0) newoffset = 0;
        }
        dval = dval >= 0 ? dmin + newoffset : dmin - newoffset;
        dval = LIMIT(dval, s.min, s.max);
        if (dval !== s.val.get()) {
          s.val.set(dval);
          Widget_draw(sd);
          if (s.callback && s.callback(sd, s.user_data, s.val) === 1) Widget_draw(sd);
        }
      }
      break;
    }
    case WIDGET_SLIDER_HORI: case WIDGET_SLIDER_VERT:
      Widget_button_slider(event, w, pressed);
      break;
    default:
      break;
  }
}

function Widget_inside(d: number, inside: boolean): void {
  const w = Widget_pointer(d);
  if (!w) {
    warn('Widget inside invalid');
    return;
  }
  switch (w.type) {
    case WIDGET_BUTTON_MENU:
      break;
    case WIDGET_BUTTON_ENTRY:
      (w.sub as EntrySub).inside = inside;
      Widget_draw(d);
      break;
    case WIDGET_BUTTON_BOOL: {
      const b = w.sub as BoolSub;
      b.inside = inside;
      if (b.pressed) Widget_draw(d);
      break;
    }
    case WIDGET_BUTTON_ACTIVATE: {
      const a = w.sub as ActivateSub;
      a.inside = inside;
      if (a.pressed) Widget_draw(d);
      break;
    }
    case WIDGET_BUTTON_ARROW_RIGHT: case WIDGET_BUTTON_ARROW_LEFT: {
      const a = w.sub as ArrowSub;
      a.inside = inside;
      if (a.pressed) Widget_draw(d);
      break;
    }
    default:
      break;
  }
}

export async function Widget_event(event: XEvent): Promise<number> {
  if (!W.widgets.length) return 0;
  if (event.type === X.ButtonRelease) {
    if (event.button === X.Button1) {
      let count = 0;
      for (let i = 1; i < W.widgets.length; i++) {
        const w = Widget_pointer(i);
        if (!w) continue;
        switch (w.type) {
          case WIDGET_BUTTON_BOOL: case WIDGET_BUTTON_ACTIVATE: case WIDGET_BUTTON_MENU:
          case WIDGET_BUTTON_ARROW_RIGHT: case WIDGET_BUTTON_ARROW_LEFT: case WIDGET_SLIDER_HORI: case WIDGET_SLIDER_VERT:
            if ((w.sub as { pressed: boolean }).pressed) {
              count++;
              await Widget_button(event, i, false);
            }
            break;
          default:
            break;
        }
      }
      if (count > 0) return 1;
    }
  } else {
    for (let i = 1; i < W.widgets.length; i++) {
      if (W.widgets[i].type === WIDGET_DUMMY) continue;
      if (W.widgets[i].window === event.window) {
        switch (event.type) {
          case X.Expose: Widget_draw_expose(i, event); break;
          case X.ButtonPress: if (event.button === X.Button1) await Widget_button(event, i, true); break;
          case X.MotionNotify: Widget_button_motion(event, i); break;
          case X.EnterNotify: Widget_inside(i, true); break;
          case X.LeaveNotify: Widget_inside(i, false); break;
          case X.ConfigureNotify: {
            const n = W.widgets[i].name;
            if (n !== null && n.startsWith('popup') && n === 'popup_viewer') Widget_resize_viewer(event, i);
            break;
          }
          default:
            warn(`Unknown event type (${event.type}) in Widget_event()`);
            break;
        }
        return 1;
      }
    }
  }
  return 0;
}

function Widget_form_window(window: number, parent_desc: number, width: number, height: number): number {
  if (parent_desc !== NO_WIDGET && !Widget_pointer(parent_desc)) {
    warn('Widget_form_window: Invalid parent widget');
    X.XDestroyWindow(G.dpy, window);
    return NO_WIDGET;
  }
  const d = Widget_create(WIDGET_FORM, 'form', window, width, height, { children: [] });
  if (parent_desc !== NO_WIDGET && Widget_add_child(parent_desc, d) === NO_WIDGET) {
    Widget_destroy(d);
    return NO_WIDGET;
  }
  return d;
}

export function Widget_create_form(parent_desc: number, parent_window: number, x: number, y: number, width: number, height: number, border: number): number {
  if (parent_desc !== NO_WIDGET) {
    const p = Widget_pointer(parent_desc);
    if (!p) {
      warn('Widget_create_form: Invalid parent widget');
      return NO_WIDGET;
    }
    parent_window = p.window;
  }
  const window = X.XCreateSimpleWindow(G.dpy, parent_window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[G.windowColor].pixel);
  X.XSelectInput(G.dpy, window, 0);
  return Widget_form_window(window, parent_desc, width, height);
}

function formParent(parent_desc: number, who: string): widget_t | null {
  const p = Widget_pointer(parent_desc);
  if (!p || p.type !== WIDGET_FORM) {
    warn(`${who}: Invalid parent widget`);
    return null;
  }
  return p;
}

const BUTTON_MASK = X.ExposureMask | X.ButtonPressMask | X.ButtonReleaseMask | X.OwnerGrabButtonMask | X.EnterWindowMask | X.LeaveWindowMask;

function add(parent_desc: number, d: number): number {
  if (Widget_add_child(parent_desc, d) === NO_WIDGET) {
    Widget_destroy(d);
    return NO_WIDGET;
  }
  return d;
}

export function Widget_create_activate(parent_desc: number, x: number, y: number, width: number, height: number, border: number,
  str: string, callback: Callback | null, user_data: unknown): number {
  const p = formParent(parent_desc, 'Widget_create_activate');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[G.buttonColor].pixel);
  X.XSelectInput(G.dpy, window, BUTTON_MASK);
  const d = Widget_create(WIDGET_BUTTON_ACTIVATE, 'activate', window, width, height,
    { pressed: false, inside: false, str: { value: str }, callback, user_data } as ActivateSub);
  return add(parent_desc, d);
}

export function Widget_create_bool(parent_desc: number, x: number, y: number, width: number, height: number, border: number,
  val: boolean, callback: BoolCallback | null, user_data: unknown): number {
  const p = formParent(parent_desc, 'Widget_create_bool');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[G.buttonColor].pixel);
  X.XSelectInput(G.dpy, window, BUTTON_MASK);
  const d = Widget_create(WIDGET_BUTTON_BOOL, 'bool', window, width, height,
    { pressed: false, inside: false, state: val, callback, user_data } as BoolSub);
  return add(parent_desc, d);
}

export function Widget_add_pulldown_entry(menu_desc: number, str: string, callback: Callback | null, user_data: unknown): number {
  const mw = Widget_pointer(menu_desc);
  if (!mw || mw.type !== WIDGET_BUTTON_MENU) {
    warn('Widget_add_pulldown_entry: Invalid menu');
    return NO_WIDGET;
  }
  const m = mw.sub as MenuSub;
  let pull: widget_t | null;
  if (m.pulldown_desc === NO_WIDGET) {
    const mask = X.CWBackPixel | X.CWBorderPixel | X.CWBitGravity | X.CWSaveUnder | X.CWEventMask | X.CWOverrideRedirect;
    const window = X.XCreateWindow(G.dpy, X.DefaultRootWindow(G.dpy), 0, 0, mw.width + 2, mw.height + 2, 0, G.dispDepth, X.InputOutput, mask, {
      background_pixel: G.colors[G.windowColor].pixel, border_pixel: G.colors[G.borderColor].pixel, bit_gravity: X.NorthWestGravity,
      save_under: true, event_mask: X.NoEventMask, override_redirect: true,
    });
    const pd = Widget_form_window(window, NO_WIDGET, mw.width + 2, mw.height + 2);
    pull = Widget_pointer(pd);
    if (!pull) {
      warn("Can't create pulldown");
      return NO_WIDGET;
    }
    m.pulldown_desc = pd;
  } else if (!(pull = Widget_pointer(m.pulldown_desc))) {
    warn('Not a pulldown');
    return NO_WIDGET;
  }
  const form = pull.sub as FormSub;
  const height = mw.height;
  let width = X.XTextWidth(G.buttonFont, str, str.length) + (height - (G.buttonFont.ascent + G.buttonFont.descent));
  if (width < pull.width - 2) width = pull.width - 2;
  const pull_height = (form.children.length + 1) * (mw.height + 1) + 1;
  let pull_width = pull.width;
  if (pull_width < width + 2) pull_width = width + 2;
  Widget_resize(m.pulldown_desc, pull_width, pull_height);
  const window = X.XCreateSimpleWindow(G.dpy, pull.window, 0, form.children.length * (mw.height + 1), width, height, 1,
    G.colors[G.borderColor].pixel, G.colors[G.buttonColor].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask | X.EnterWindowMask | X.LeaveWindowMask);
  const ed = Widget_create(WIDGET_BUTTON_ENTRY, 'entry', window, width, height, { inside: false, str: { value: str }, callback, user_data } as EntrySub);
  if (Widget_add_child(m.pulldown_desc, ed) === NO_WIDGET) {
    warn("Can't create pulldown entry");
    Widget_destroy(ed);
    return NO_WIDGET;
  }
  Widget_map(ed);
  return menu_desc;
}

export function Widget_create_menu(parent_desc: number, x: number, y: number, width: number, height: number, border: number, str: string): number {
  const p = formParent(parent_desc, 'Widget_create_menu');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[G.buttonColor].pixel);
  X.XSelectInput(G.dpy, window, BUTTON_MASK);
  const d = Widget_create(WIDGET_BUTTON_MENU, 'menu', window, width, height, { pressed: false, str, pulldown_desc: NO_WIDGET } as MenuSub);
  return add(parent_desc, d);
}

export function Widget_create_int(parent_desc: number, x: number, y: number, width: number, height: number, border: number,
  val: Ptr<number>, min: number, max: number, callback: IntCallback | null, user_data: unknown): number {
  const p = formParent(parent_desc, 'Widget_create_int');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[BLACK].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask);
  const d = Widget_create(WIDGET_INPUT_INT, 'input_int', window, width, height, { val, min, max, callback, user_data } as IntSub);
  return add(parent_desc, d);
}

export function Widget_create_color(parent_desc: number, color: number, x: number, y: number, width: number, height: number, border: number,
  val: Ptr<number>, min: number, max: number, callback: IntCallback | null, user_data: unknown): number {
  const p = formParent(parent_desc, 'Widget_create_int');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[color].pixel, G.colors[color].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask);
  const d = Widget_create(WIDGET_INPUT_COLOR, 'input_color', window, width, height, { val, min, max, callback, user_data } as IntSub);
  return add(parent_desc, d);
}

export function Widget_create_double(parent_desc: number, x: number, y: number, width: number, height: number, border: number,
  val: Ptr<number>, min: number, max: number, callback: DoubleCallback | null, user_data: unknown): number {
  const p = formParent(parent_desc, 'Widget_create_double');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[BLACK].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask);
  const d = Widget_create(WIDGET_INPUT_DOUBLE, 'input_double', window, width, height, { val, min, max, callback, user_data } as DoubleSub);
  return add(parent_desc, d);
}

function label(parent_desc: number, x: number, y: number, width: number, height: number, centered: boolean, border: number,
  bg: number, bord: number, str: string): number {
  const p = formParent(parent_desc, 'Widget_create_label');
  if (!p) return NO_WIDGET;
  const sub: LabelSub = {
    str,
    x_offset: centered ? Math.trunc((width - X.XTextWidth(G.textFont, str, str.length)) / 2) : 5,
    y_offset: Math.trunc((height - (G.textFont.ascent + G.textFont.descent)) / 2),
  };
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, bord, bg);
  X.XSelectInput(G.dpy, window, X.ExposureMask);
  const d = Widget_create(WIDGET_LABEL, 'label', window, width, height, sub);
  return add(parent_desc, d);
}

export function Widget_create_label(parent_desc: number, x: number, y: number, width: number, height: number, centered: boolean, border: number, str: string): number {
  return label(parent_desc, x, y, width, height, centered, border, G.colors[G.windowColor].pixel, G.colors[G.borderColor].pixel, str);
}

export function Widget_create_colored_label(parent_desc: number, x: number, y: number, width: number, height: number, centered: boolean,
  border: number, bg: number, bord: number, str: string): number {
  return label(parent_desc, x, y, width, height, centered, border, G.colors[bg].pixel, G.colors[bord].pixel, str);
}

function Widget_create_arrow(type: number, parent_desc: number, x: number, y: number, width: number, height: number, border: number, related_desc: number): number {
  const p = formParent(parent_desc, 'Widget_create_arrow');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[BLACK].pixel);
  X.XSelectInput(G.dpy, window, BUTTON_MASK);
  const d = Widget_create(type, 'arrow', window, width, height, { pressed: false, inside: false, widget_desc: related_desc } as ArrowSub);
  return add(parent_desc, d);
}

export const Widget_create_arrow_right = (p: number, x: number, y: number, w: number, h: number, b: number, rel: number): number =>
  Widget_create_arrow(WIDGET_BUTTON_ARROW_RIGHT, p, x, y, w, h, b, rel);
export const Widget_create_arrow_left = (p: number, x: number, y: number, w: number, h: number, b: number, rel: number): number =>
  Widget_create_arrow(WIDGET_BUTTON_ARROW_LEFT, p, x, y, w, h, b, rel);

export function Widget_create_popup(width: number, height: number, border: number, window_name: string, _icon_name: string): number {
  const dw = X.DisplayWidth(G.dpy, 0), dh = X.DisplayHeight(G.dpy, 0);
  const x = dw > width ? Math.trunc((dw - width) / 2) : 0;
  const y = dh > height ? Math.trunc((dh - height) / 2) : 0;
  const mask = X.CWBackPixel | X.CWBorderPixel | X.CWBitGravity | X.CWEventMask;
  const window = X.XCreateWindow(G.dpy, X.DefaultRootWindow(G.dpy), x, y, width, height, border, G.dispDepth, X.InputOutput, mask, {
    background_pixel: G.colors[G.windowColor].pixel, border_pixel: G.colors[G.borderColor].pixel, bit_gravity: X.NorthWestGravity,
    event_mask: X.StructureNotifyMask,
  });
  const d = Widget_form_window(window, NO_WIDGET, width, height);
  const w = Widget_pointer(d);
  if (!w) return NO_WIDGET;
  w.name = 'popup';
  X.XStoreName(G.dpy, w.window, window_name);
  return d;
}

export function Widget_create_confirm(confirm_str: string, callback: Callback): number {
  const button_str = 'CLOSE';
  const label_height = G.textFont.ascent + G.textFont.descent;
  const button_height = Math.trunc((3 * (G.buttonFont.ascent + G.buttonFont.descent)) / 2);
  const label_width = 10 + X.XTextWidth(G.textFont, confirm_str, confirm_str.length);
  const button_width = 2 * button_height + X.XTextWidth(G.buttonFont, button_str, button_str.length);
  const label_space = 2 * label_height, button_space = button_height;
  const popup_height = 2 * label_space + label_height + 2 * button_space + button_height;
  const popup_width = MAX(label_width + 2 * label_space, button_width + 2 * button_space);
  const popup_desc = Widget_create_popup(popup_width, popup_height, 1, 'Confirm', 'Confirm');
  if (popup_desc === NO_WIDGET) return NO_WIDGET;
  const label_desc = Widget_create_label(popup_desc, Math.trunc((popup_width - label_width) / 2), label_space, label_width, label_height, true, 0, confirm_str);
  if (label_desc === NO_WIDGET) {
    Widget_destroy(popup_desc);
    return NO_WIDGET;
  }
  const button_desc = Widget_create_activate(popup_desc, Math.trunc((popup_width - button_width) / 2), popup_height - button_height - button_space,
    button_width, button_height, 0, button_str, callback, popup_desc);
  if (button_desc === NO_WIDGET) {
    Widget_destroy(popup_desc);
    Widget_destroy(label_desc);
    return NO_WIDGET;
  }
  Widget_map_sub(popup_desc);
  return popup_desc;
}

export function Widget_backing_store(d: number, mode: number): number {
  const w = Widget_pointer(d);
  if (!w) return NO_WIDGET;
  X.XChangeWindowAttributes(G.dpy, w.window, X.CWBackingStore, { backing_store: mode });
  return d;
}

export function Widget_set_background(d: number, bgcolor: number): number {
  const w = Widget_pointer(d);
  if (!w) return NO_WIDGET;
  X.XChangeWindowAttributes(G.dpy, w.window, X.CWBackPixel, { background_pixel: G.colors[bgcolor].pixel });
  return d;
}

export function Widget_map_sub(d: number): number {
  const w = Widget_pointer(d);
  if (w) X.XMapSubwindows(G.dpy, w.window);
  else {
    warn('Widget_map_sub: Invalid widget');
    return NO_WIDGET;
  }
  return d;
}

export function Widget_map(d: number): number {
  const w = Widget_pointer(d);
  if (w) X.XMapWindow(G.dpy, w.window);
  else {
    warn(`Widget_map: Invalid widget ${d}`);
    return NO_WIDGET;
  }
  return d;
}

export function Widget_unmap(d: number): number {
  const w = Widget_pointer(d);
  if (w) X.XUnmapWindow(G.dpy, w.window);
  else {
    warn('Widget_unmap: Invalid widget');
    return NO_WIDGET;
  }
  return d;
}

export function Widget_raise(d: number): number {
  const w = Widget_pointer(d);
  if (w) X.XMapRaised(G.dpy, w.window);
  else {
    warn('Widget_raise: Invalid widget');
    return NO_WIDGET;
  }
  return d;
}

export function Widget_get_dimensions(d: number): { width: number; height: number } | null {
  const w = Widget_pointer(d);
  return w ? { width: w.width, height: w.height } : null;
}

function Widget_create_slider(parent_desc: number, type: number, x: number, y: number, width: number, height: number, border: number, viewer_desc: number): number {
  const p = formParent(parent_desc, 'Widget_create_slider');
  if (!p) return NO_WIDGET;
  const window = X.XCreateSimpleWindow(G.dpy, p.window, x, y, width, height, border, G.colors[G.borderColor].pixel, G.colors[BLACK].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask | X.ButtonPressMask | X.ButtonReleaseMask | X.ButtonMotionMask | X.OwnerGrabButtonMask);
  const d = Widget_create(type, 'slider', window, width, height, { pressed: false, inside: false, viewer_desc } as SliderSub);
  return add(parent_desc, d);
}

function Widget_viewer_calculate_view(viewer_desc: number): number {
  const w = Widget_pointer(viewer_desc)!;
  const v = w.sub as ViewerSub;
  let new_width = 2 * 20 + v.max_width;
  let new_height = 2 * 20 + v.num_lines * (v.font.ascent + v.font.descent);
  if (new_width < w.width) new_width = w.width;
  if (new_height < w.height) new_height = w.height;
  let new_x = v.real_width <= w.width ? 0 : Math.trunc((v.visible_x * (new_width - w.width)) / (v.real_width - w.width));
  if (new_x > 0 && -new_x + v.real_width < w.width) new_x = v.real_width - w.width;
  let new_y = v.real_height <= w.height ? 0 : Math.trunc((v.visible_y * (new_height - w.height)) / (v.real_height - w.height));
  if (new_y > 0 && -new_y + v.real_height < w.height) new_y = v.real_height - w.height;
  X.XResizeWindow(G.dpy, w.window, new_width, new_height);
  X.XMoveWindow(G.dpy, w.window, new_x, new_y);
  v.visible_x = new_x;
  v.visible_y = new_y;
  v.real_width = new_width;
  v.real_height = new_height;
  X.XFlush(G.dpy);
  return 0;
}

function Widget_viewer_calculate_text(viewer_desc: number): number {
  const w = Widget_pointer(viewer_desc)!;
  const v = w.sub as ViewerSub;
  v.line = [];
  v.num_lines = 0;
  v.max_width = 0;
  let count = 0;
  for (let i = 0; i < v.len; i++) if (v.buf[i] === '\n') count++;
  if (v.len > 0 && v.buf[v.len - 1] !== '\n') count++;
  if (!count) return 0;
  v.num_lines = count;
  let i = 0;
  for (let c = 0; c < v.num_lines; c++, i++) {
    const start = i;
    while (v.buf[i] !== '\n') if (++i >= v.len) break;
    const len = i - start;
    const tw = X.XTextWidth(v.font, v.buf.substr(start, len), len);
    v.line.push({ txt: start, len, txt_width: tw });
    if (tw > v.max_width) v.max_width = tw;
  }
  Widget_viewer_calculate_view(viewer_desc);
  return 0;
}

function viewerGeometry(width: number, height: number, font: XFontStruct) {
  const save_width = 2 * 8 + X.XTextWidth(font, 'SAVE', 5), save_height = 6 + font.ascent + font.descent;
  const close_width = 2 * 8 + X.XTextWidth(font, 'CLOSE', 5), close_height = 6 + font.ascent + font.descent;
  const close_spaced_height = close_height + 2 * 5;
  return {
    save_width, save_height, save_x_offset: Math.trunc(width / 3) - Math.trunc(save_width / 2), save_y_offset: 5,
    close_width, close_height, close_x_offset: Math.trunc((2 * width) / 3) - Math.trunc(close_width / 2), close_y_offset: 5,
    hori_slider_height: 20, vert_slider_width: 20, hori_slider_width: width - 20,
    vert_slider_height: height - close_spaced_height - 20, viewer_width: width - 20, viewer_height: height - close_spaced_height,
    hori_slider_x: 0, hori_slider_y: height - 20 - close_spaced_height, vert_slider_x: width - 20, vert_slider_y: 0,
  };
}

function Widget_resize_viewer(event: XEvent, ind: number): void {
  const width = event.width, height = event.height;
  const popup = Widget_pointer(ind)!;
  const form = popup.sub as FormSub;
  const vw = Widget_pointer(form.children[0])!;
  const v = vw.sub as ViewerSub;
  const g = viewerGeometry(width, height, v.font);
  if (width === popup.width && height === popup.height) return;
  X.XResizeWindow(G.dpy, v.overlay, g.viewer_width, g.viewer_height);
  Widget_resize(form.children[1], g.hori_slider_width, g.hori_slider_height);
  X.XMoveWindow(G.dpy, Widget_pointer(form.children[1])!.window, g.hori_slider_x, g.hori_slider_y);
  Widget_resize(form.children[2], g.vert_slider_width, g.vert_slider_height);
  X.XMoveWindow(G.dpy, Widget_pointer(form.children[2])!.window, g.vert_slider_x, g.vert_slider_y);
  Widget_resize(form.children[3], g.save_width, g.save_height);
  X.XMoveWindow(G.dpy, Widget_pointer(form.children[3])!.window, g.save_x_offset, g.viewer_height + g.save_y_offset);
  Widget_resize(form.children[4], g.close_width, g.close_height);
  X.XMoveWindow(G.dpy, Widget_pointer(form.children[4])!.window, g.close_x_offset, g.viewer_height + g.close_y_offset);
  popup.width = width;
  popup.height = height;
  vw.width = g.viewer_width;
  vw.height = g.viewer_height;
  v.visible_x = 0;
  v.visible_y = 0;
  Widget_viewer_calculate_view(form.children[0]);
}

export function Widget_create_viewer(buf: string, len: number, width: number, height: number, border: number, window_name: string,
  icon_name: string, font: XFontStruct): number {
  const g = viewerGeometry(width, height, font);
  const popup_desc = Widget_create_popup(width, height, border, window_name, icon_name);
  const popup = Widget_pointer(popup_desc);
  if (popup_desc === NO_WIDGET || !popup || popup.type !== WIDGET_FORM) {
    warn('Widget_create_viewer: No popup');
    return NO_WIDGET;
  }
  popup.name = 'popup_viewer';
  const v: ViewerSub = {
    overlay: 0, buf, len, vert_slider_desc: NO_WIDGET, hori_slider_desc: NO_WIDGET, save_button_desc: NO_WIDGET,
    close_button_desc: NO_WIDGET, visible_x: 0, visible_y: 0, real_width: width, real_height: height, max_width: 0, num_lines: 0, line: [], font,
  };
  v.overlay = X.XCreateSimpleWindow(G.dpy, popup.window, 0, 0, g.viewer_width, g.viewer_height, 0, G.colors[G.borderColor].pixel, G.colors[G.windowColor].pixel);
  X.XSelectInput(G.dpy, v.overlay, 0);
  Widget_bit_gravity(v.overlay, X.NorthWestGravity);
  const window = X.XCreateSimpleWindow(G.dpy, v.overlay, 0, 0, g.viewer_width, g.viewer_height, 0, G.colors[G.borderColor].pixel, G.colors[G.windowColor].pixel);
  X.XSelectInput(G.dpy, window, X.ExposureMask);
  Widget_bit_gravity(window, X.NorthWestGravity);
  Widget_window_gravity(window, X.NorthWestGravity);
  X.XMapWindow(G.dpy, window);
  const viewer_desc = Widget_create(WIDGET_VIEWER, 'viewer', window, g.viewer_width, g.viewer_height, v);
  if (Widget_add_child(popup_desc, viewer_desc) === NO_WIDGET) {
    Widget_destroy(viewer_desc);
    Widget_destroy(popup_desc);
    return NO_WIDGET;
  }
  v.hori_slider_desc = Widget_create_slider(popup_desc, WIDGET_SLIDER_HORI, g.hori_slider_x, g.hori_slider_y, g.hori_slider_width, g.hori_slider_height, 0, viewer_desc);
  if (v.hori_slider_desc === NO_WIDGET) { Widget_destroy(popup_desc); return NO_WIDGET; }
  Widget_window_gravity(Widget_pointer(v.hori_slider_desc)!.window, X.SouthWestGravity);
  v.vert_slider_desc = Widget_create_slider(popup_desc, WIDGET_SLIDER_VERT, g.vert_slider_x, g.vert_slider_y, g.vert_slider_width, g.vert_slider_height, 0, viewer_desc);
  if (v.vert_slider_desc === NO_WIDGET) { Widget_destroy(popup_desc); return NO_WIDGET; }
  Widget_window_gravity(Widget_pointer(v.vert_slider_desc)!.window, X.NorthEastGravity);
  v.save_button_desc = Widget_create_activate(popup_desc, g.save_x_offset, g.viewer_height + g.save_y_offset, g.save_width, g.save_height, 0, 'SAVE',
    () => { void sys.writeFile('xpilot.motd', v.buf.slice(0, v.len)); return 0; }, popup_desc);
  if (v.save_button_desc === NO_WIDGET) { Widget_destroy(popup_desc); return NO_WIDGET; }
  Widget_window_gravity(Widget_pointer(v.save_button_desc)!.window, X.SouthGravity);
  v.close_button_desc = Widget_create_activate(popup_desc, g.close_x_offset, g.viewer_height + g.close_y_offset, g.close_width, g.close_height, 0, 'CLOSE',
    (_w, data) => { Widget_unmap(data as number); return 0; }, popup_desc);
  if (v.close_button_desc === NO_WIDGET) { Widget_destroy(popup_desc); return NO_WIDGET; }
  Widget_window_gravity(Widget_pointer(v.close_button_desc)!.window, X.SouthGravity);
  Widget_map_sub(popup_desc);
  Widget_map(popup_desc);
  X.XFlush(G.dpy);
  Widget_viewer_calculate_text(viewer_desc);
  return popup_desc;
}

export function Widget_update_viewer(popup_desc: number, buf: string, len: number): number {
  const popup = Widget_pointer(popup_desc);
  if (!popup || popup.type !== WIDGET_FORM || !popup.name || popup.name !== 'popup_viewer') {
    warn('Widget_update_viewer: not a popup viewer');
    return -1;
  }
  const form = popup.sub as FormSub;
  const vd = form.children[0];
  const vw = Widget_pointer(vd)!;
  const v = vw.sub as ViewerSub;
  v.buf = buf;
  v.len = len;
  const th = v.font.ascent + v.font.descent;
  const first_visible = Math.trunc((v.visible_y - 20) / th);
  const last_visible = Math.trunc((v.visible_y + vw.height - 20) / th);
  let start = MAX(0, v.num_lines - 1);
  Widget_viewer_calculate_text(vd);
  let end = v.num_lines;
  start = MAX(first_visible, start);
  end = MIN(last_visible + 1, end);
  if (start < end) Widget_viewer_draw_lines(vw, start, end);
  Widget_draw(form.children[1]);
  Widget_draw(form.children[2]);
  return 0;
}

export function Widget_cleanup(): void {
  W.widgets = [];
  W.max_widgets = 0;
}
