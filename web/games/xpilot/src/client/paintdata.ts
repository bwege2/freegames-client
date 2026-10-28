// x11/paintdata.c: rectangles, arcs and segments collected per colour and drawn together.
import { G } from './G.ts';
import { MAX_COLORS } from './consts.ts';
import { s16, u16, onReset } from './cutil.ts';
import type { XArc, XRectangle, XSegment } from '../xlib/xlib.ts';
import { rd } from './record.ts';
import { WINSCALE } from './paint.ts';

const P = {
  rect: Array.from({ length: MAX_COLORS }, () => [] as XRectangle[]),
  num_rect: new Int32Array(MAX_COLORS),
  arc: Array.from({ length: MAX_COLORS }, () => [] as XArc[]),
  num_arc: new Int32Array(MAX_COLORS),
  seg: Array.from({ length: MAX_COLORS }, () => [] as XSegment[]),
  num_seg: new Int32Array(MAX_COLORS),
  rgb_arc: [] as { color: number; arc: XArc }[],
  num_rgb_arc: 0,
};
onReset(() => Object.assign(P, {
  rect: Array.from({ length: MAX_COLORS }, () => [] as XRectangle[]), num_rect: new Int32Array(MAX_COLORS),
  arc: Array.from({ length: MAX_COLORS }, () => [] as XArc[]), num_arc: new Int32Array(MAX_COLORS),
  seg: Array.from({ length: MAX_COLORS }, () => [] as XSegment[]), num_seg: new Int32Array(MAX_COLORS),
  rgb_arc: [], num_rgb_arc: 0,
}));

/** xpaint.h SET_FG: the GC's foreground, unless it is already the remembered one */
export function SET_FG(fg: number): void {
  if (fg !== G.current_foreground) {
    G.current_foreground = fg;
    G.gameGC.foreground = fg;
  }
}

export function Rectangle_start(): void {
  for (let i = 0; i < G.maxColors; i++) P.num_rect[i] = 0;
}

export function Rectangle_end(): void {
  for (let i = 0; i < G.maxColors; i++) {
    if (P.num_rect[i] > 0) {
      SET_FG(G.colors[i].pixel);
      rd.fillRectangles(G.dpy, G.drawPixmap, G.gameGC, P.rect[i], P.num_rect[i]);
      P.num_rect[i] = 0;
    }
  }
}

export function Rectangle_add(color: number, x: number, y: number, width: number, height: number): number {
  P.rect[color][P.num_rect[color]++] = { x: s16(WINSCALE(x)), y: s16(WINSCALE(y)), width: u16(WINSCALE(width)), height: u16(WINSCALE(height)) };
  return 0;
}

export function Arc_start(): void {
  for (let i = 0; i < G.maxColors; i++) P.num_arc[i] = 0;
  P.num_rgb_arc = 0;
}

export function Arc_end(): void {
  for (let i = 0; i < G.maxColors; i++) {
    if (P.num_arc[i] > 0) {
      SET_FG(G.colors[i].pixel);
      rd.drawArcs(G.dpy, G.drawPixmap, G.gameGC, P.arc[i], P.num_arc[i]);
      P.num_arc[i] = 0;
    }
  }
  for (let i = 0; i < P.num_rgb_arc; i++) {
    const p = P.rgb_arc[i];
    SET_FG(p.color);
    rd.drawArc(G.dpy, G.drawPixmap, G.gameGC, p.arc.x, p.arc.y, p.arc.width, p.arc.height, p.arc.angle1, p.arc.angle2);
  }
  P.num_rgb_arc = 0;
}

function mkArc(x: number, y: number, width: number, height: number, angle1: number, angle2: number): XArc {
  const ax = s16(WINSCALE(x)), ay = s16(WINSCALE(y));
  return { x: ax, y: ay, width: u16(WINSCALE(width + x) - ax), height: u16(WINSCALE(height + y) - ay), angle1: s16(angle1), angle2: s16(angle2) };
}

export function Arc_add(color: number, x: number, y: number, width: number, height: number, angle1: number, angle2: number): number {
  P.arc[color][P.num_arc[color]++] = mkArc(x, y, width, height, angle1, angle2);
  return 0;
}

export function Arc_add_rgb(color: number, fallback_color: number, x: number, y: number, width: number, height: number, angle1: number, angle2: number): number {
  if (!G.fullColor) return Arc_add(fallback_color, x, y, width, height, angle1, angle2);
  P.rgb_arc[P.num_rgb_arc++] = { color, arc: mkArc(x, y, width, height, angle1, angle2) };
  return 0;
}

export function Segment_start(): void {
  for (let i = 0; i < G.maxColors; i++) P.num_seg[i] = 0;
}

export function Segment_end(): void {
  for (let i = 0; i < G.maxColors; i++) {
    if (P.num_seg[i] > 0) {
      SET_FG(G.colors[i].pixel);
      rd.drawSegments(G.dpy, G.drawPixmap, G.gameGC, P.seg[i], P.num_seg[i]);
      P.num_seg[i] = 0;
    }
  }
}

export function Segment_add(color: number, x1: number, y1: number, x2: number, y2: number): number {
  P.seg[color][P.num_seg[color]++] = { x1: s16(WINSCALE(x1)), y1: s16(WINSCALE(y1)), x2: s16(WINSCALE(x2)), y2: s16(WINSCALE(y2)) };
  return 0;
}

export function paintdataCleanup(): void { /* garbage collected */ }
