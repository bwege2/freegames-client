// x11/record.c: the drawing table `rd` the painters call. The original can record a game into a file
// (recordFile, the record key); this port draws only (the record key and options do nothing, README.md).
import * as X from '../xlib/xlib.ts';
import type { Display, GC, XArc, XPoint, XRectangle, XSegment } from '../xlib/xlib.ts';
import { G } from './G.ts';
import { STORE_OPTIONS, XP_STRING_OPTION } from './option.ts';
import { XP_OPTFLAG_DEFAULT } from './consts.ts';
import { onReset } from './cutil.ts';

export const rd = {
  newFrame(): void { /* recording only */ },
  endFrame(): void { /* recording only */ },
  drawArc: (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number, a1: number, a2: number) => X.XDrawArc(d, w, gc, x, y, wd, h, a1, a2),
  drawLines: (d: Display, w: number, gc: GC, p: XPoint[], n: number, mode: number) => X.XDrawLines(d, w, gc, p, n, mode),
  drawLine: (d: Display, w: number, gc: GC, x1: number, y1: number, x2: number, y2: number) => X.XDrawLine(d, w, gc, x1, y1, x2, y2),
  drawRectangle: (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number) => X.XDrawRectangle(d, w, gc, x, y, wd, h),
  drawString: (d: Display, w: number, gc: GC, x: number, y: number, s: string, n: number) => X.XDrawString(d, w, gc, x, y, s, n),
  fillArc: (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number, a1: number, a2: number) => X.XFillArc(d, w, gc, x, y, wd, h, a1, a2),
  fillPolygon: (d: Display, w: number, gc: GC, p: XPoint[], n: number, shape: number, mode: number) => X.XFillPolygon(d, w, gc, p, n, shape, mode),
  paintItemSymbol(_type: number, _d: number, _gc: GC, _x: number, _y: number, _c: number): void { /* recording only */ },
  fillRectangle: (d: Display, w: number, gc: GC, x: number, y: number, wd: number, h: number) => X.XFillRectangle(d, w, gc, x, y, wd, h),
  fillRectangles: (d: Display, w: number, gc: GC, r: XRectangle[], n: number) => X.XFillRectangles(d, w, gc, r, n),
  drawArcs: (d: Display, w: number, gc: GC, a: XArc[], n: number) => X.XDrawArcs(d, w, gc, a, n),
  drawSegments: (d: Display, w: number, gc: GC, s: XSegment[], n: number) => X.XDrawSegments(d, w, gc, s, n),
  setDashes: (d: Display, gc: GC, off: number, list: number[], n: number) => X.XSetDashes(d, gc, off, list, n),
};

const RC = { recordFile: '' };
onReset(() => { RC.recordFile = ''; });

export function Record_toggle(): void { G.recording = false; }
export function Record_size(): number { return 0; }
export function Record_cleanup(): void { /* nothing recorded */ }

export function Store_record_options(): void {
  STORE_OPTIONS([
    XP_STRING_OPTION('recordFile', '', { get: () => RC.recordFile, set: (v) => { RC.recordFile = v; } }, 256, null, null, null, XP_OPTFLAG_DEFAULT,
      'An optional file where a recording of a game can be made.\nIf this file is undefined then recording isn\'t possible.\n'),
  ]);
}
