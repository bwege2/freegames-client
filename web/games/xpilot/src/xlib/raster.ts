// The pixels behind the Xlib emulation (xlib.ts): a software rasterizer for X11 drawables, crisp and
// without antialiasing, following the X11 protocol's rules as closely as practical:
// * thin lines (line width 0) are Bresenham lines with both end points, ties broken by octant as the
//   X sample server does (mi's default zero-line bias: octants 2-5);
// * wide lines are filled polygons of the line's width with butt, projecting or round caps and miter,
//   round or bevel joins; dashes run along the line (thin lines count pixels along the major axis);
// * polygons, rectangles and arcs are filled by pixel centres (a centre on an edge belongs to the
//   shape when the shape lies to its right or below), even-odd or winding;
// * arcs follow the ellipse of their bounding box, angles in 64ths of a degree in the ellipse's own
//   (skewed) coordinates; thin arcs are traced point by point;
// * every pixel goes through the GC: fill style (solid, tiled, stippled, opaque stippled), function
//   (GXcopy, GXxor, ...), plane mask and clip mask.
// Deviations from a real X server are pixel-level only (ties and end points of arcs and wide lines).

/** A drawable's pixels: 0xRRGGBB for depth 24, 0/1 for depth 1. */
export interface Surface {
  w: number;
  h: number;
  depth: number;
  data: Uint32Array;
}

export function newSurface(w: number, h: number, depth: number, fill = 0): Surface {
  const s: Surface = { w: Math.max(0, w), h: Math.max(0, h), depth, data: new Uint32Array(Math.max(0, w) * Math.max(0, h)) };
  if (fill) s.data.fill(fill);
  return s;
}

/** The GC state the rasterizer needs (xlib.ts keeps it in its GC objects). */
export interface RasterGC {
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
  ts_x_origin: number;
  ts_y_origin: number;
  clip_x_origin: number;
  clip_y_origin: number;
  dash_offset: number;
  dashes: number[];
  tile: Surface | null;
  stipple: Surface | null;
  clip: Surface | null;
}

export const LineSolid = 0, LineOnOffDash = 1, LineDoubleDash = 2;
export const CapNotLast = 0, CapButt = 1, CapRound = 2, CapProjecting = 3;
export const JoinMiter = 0, JoinRound = 1, JoinBevel = 2;
export const FillSolid = 0, FillTiled = 1, FillStippled = 2, FillOpaqueStippled = 3;
export const EvenOddRule = 0, WindingRule = 1;
export const ArcChord = 0, ArcPieSlice = 1;
export const GXcopy = 3;

function combine(fn: number, s: number, d: number): number {
  switch (fn) {
    case 0: return 0;
    case 1: return s & d;
    case 2: return s & ~d;
    case 3: return s;
    case 4: return ~s & d;
    case 5: return d;
    case 6: return s ^ d;
    case 7: return s | d;
    case 8: return ~(s | d);
    case 9: return ~(s ^ d);
    case 10: return ~d;
    case 11: return s | ~d;
    case 12: return ~s;
    case 13: return ~s | d;
    case 14: return ~(s & d);
    default: return -1;
  }
}

const mod = (a: number, b: number) => ((a % b) + b) % b;

/** Paints the pixels [x0, x1) of row y through the GC; `fg` overrides the source colour (double dashes). */
export function span(s: Surface, gc: RasterGC, y: number, x0: number, x1: number, useBg = false): void {
  if (y < 0 || y >= s.h) return;
  if (x0 < 0) x0 = 0;
  if (x1 > s.w) x1 = s.w;
  if (x0 >= x1) return;
  const mask = s.depth === 1 ? 1 : 0xffffff;
  const pm = gc.plane_mask & mask;
  const row = y * s.w;
  const solid = gc.fill_style === FillSolid || (gc.fill_style === FillTiled && !gc.tile)
    || ((gc.fill_style === FillStippled || gc.fill_style === FillOpaqueStippled) && !gc.stipple);
  const color = (useBg ? gc.background : gc.foreground) & mask;
  if (solid && gc.function === GXcopy && pm === mask && !gc.clip) {
    s.data.fill(color, row + x0, row + x1);
    return;
  }
  const clip = gc.clip;
  for (let x = x0; x < x1; x++) {
    if (clip) {
      const cx = x - gc.clip_x_origin, cy = y - gc.clip_y_origin;
      if (cx < 0 || cy < 0 || cx >= clip.w || cy >= clip.h || !clip.data[cy * clip.w + cx]) continue;
    }
    let src = color;
    if (!solid) {
      if (gc.fill_style === FillTiled) {
        const t = gc.tile!;
        src = t.data[mod(y - gc.ts_y_origin, t.h) * t.w + mod(x - gc.ts_x_origin, t.w)] & mask;
        if (t.depth === 1) src = src ? gc.foreground & mask : gc.background & mask;
      } else {
        const t = gc.stipple!;
        const bit = t.data[mod(y - gc.ts_y_origin, t.h) * t.w + mod(x - gc.ts_x_origin, t.w)];
        if (bit) src = gc.foreground & mask;
        else if (gc.fill_style === FillOpaqueStippled) src = gc.background & mask;
        else continue;
      }
    }
    const i = row + x;
    const d = s.data[i];
    const r = combine(gc.function, src, d);
    s.data[i] = ((d & ~pm) | (r & pm)) & mask;
  }
}

export function point(s: Surface, gc: RasterGC, x: number, y: number, useBg = false): void {
  span(s, gc, y, x, x + 1, useBg);
}

// ---------------------------------------------------------------- dashes

/** Where a dash pattern stands: the dash index and how far into it. */
interface DashState { i: number; left: number }

function dashStart(gc: RasterGC): DashState {
  const d = gc.dashes.length ? gc.dashes : [4, 4];
  let total = 0;
  for (const v of d) total += v;
  let off = total > 0 ? mod(gc.dash_offset, total) : 0;
  let i = 0;
  while (off >= d[i]) {
    off -= d[i];
    i = (i + 1) % d.length;
  }
  return { i, left: d[i] - off };
}

/** One unit along a dashed line: true = "on" (even dash), then advances. */
function dashStep(gc: RasterGC, st: DashState): boolean {
  const d = gc.dashes.length ? gc.dashes : [4, 4];
  const on = st.i % 2 === 0;
  if (--st.left <= 0) {
    st.i = (st.i + 1) % d.length;
    st.left = d[st.i] || 1;
  }
  return on;
}

// ---------------------------------------------------------------- thin lines

// mi's octant bits (miline.h): YMAJOR 1, XDECREASING 2, YDECREASING 4; the default zero line bias has
// octants 2, 3, 4 and 5 (OCTANT2 = YDECREASING|YMAJOR, OCTANT3 = XDECREASING|YDECREASING|YMAJOR,
// OCTANT4 = XDECREASING|YDECREASING, OCTANT5 = XDECREASING).
const ZERO_LINE_BIAS = (1 << 5) | (1 << 7) | (1 << 6) | (1 << 2);

/** The pixels of a thin line from (x1,y1) to (x2,y2), both ends included (CapNotLast: without the last). */
function thinLinePixels(x1: number, y1: number, x2: number, y2: number, last: boolean, out: (x: number, y: number) => void): void {
  let dx = x2 - x1, dy = y2 - y1;
  const sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
  dx = Math.abs(dx);
  dy = Math.abs(dy);
  let octant = 0;
  if (sx < 0) octant |= 2;
  if (sy < 0) octant |= 4;
  let x = x1, y = y1;
  if (dx >= dy) {
    const e1 = dy << 1, e2 = e1 - (dx << 1);
    let e = e1 - dx;
    e -= (ZERO_LINE_BIAS >> octant) & 1;
    const n = last ? dx + 1 : dx;
    for (let k = 0; k < n; k++) {
      out(x, y);
      if (e >= 0) { y += sy; e += e2; } else e += e1;
      x += sx;
    }
  } else {
    octant |= 1;
    const e1 = dx << 1, e2 = e1 - (dy << 1);
    let e = e1 - dy;
    e -= (ZERO_LINE_BIAS >> octant) & 1;
    const n = last ? dy + 1 : dy;
    for (let k = 0; k < n; k++) {
      out(x, y);
      if (e >= 0) { x += sx; e += e2; } else e += e1;
      y += sy;
    }
  }
  if (!last && dx === 0 && dy === 0) return;
}

// ---------------------------------------------------------------- polygons

export type Pt = [number, number];

/** Fills polygons (each a closed list of points, doubles allowed) by pixel centres. */
export function fillPolys(s: Surface, gc: RasterGC, polys: Pt[][], rule: number, useBg = false): void {
  let ymin = Infinity, ymax = -Infinity;
  const edges: { x0: number; y0: number; x1: number; y1: number; dir: number }[] = [];
  for (const p of polys) {
    const n = p.length;
    if (n < 2) continue;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      if (a[1] === b[1]) continue;
      const dir = a[1] < b[1] ? 1 : -1;
      const e = dir > 0 ? { x0: a[0], y0: a[1], x1: b[0], y1: b[1], dir } : { x0: b[0], y0: b[1], x1: a[0], y1: a[1], dir };
      edges.push(e);
      if (e.y0 < ymin) ymin = e.y0;
      if (e.y1 > ymax) ymax = e.y1;
    }
  }
  if (!edges.length) return;
  // rows whose centre y + 0.5 is in [ymin, ymax)
  let r0 = Math.ceil(ymin - 0.5), r1 = Math.ceil(ymax - 0.5) - 1;
  if (r0 < 0) r0 = 0;
  if (r1 > s.h - 1) r1 = s.h - 1;
  const xs: { x: number; dir: number }[] = [];
  for (let y = r0; y <= r1; y++) {
    const yc = y + 0.5;
    xs.length = 0;
    for (const e of edges) {
      if (yc >= e.y0 && yc < e.y1) xs.push({ x: e.x0 + ((yc - e.y0) * (e.x1 - e.x0)) / (e.y1 - e.y0), dir: e.dir });
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a.x - b.x);
    if (rule === WindingRule) {
      let w = 0;
      for (let i = 0; i < xs.length - 1; i++) {
        w += xs[i].dir;
        if (w !== 0) span(s, gc, y, Math.ceil(xs[i].x - 0.5), Math.ceil(xs[i + 1].x - 0.5), useBg);
      }
    } else {
      for (let i = 0; i + 1 < xs.length; i += 2) span(s, gc, y, Math.ceil(xs[i].x - 0.5), Math.ceil(xs[i + 1].x - 0.5), useBg);
    }
  }
}

export function fillRect(s: Surface, gc: RasterGC, x: number, y: number, w: number, h: number): void {
  if (w <= 0 || h <= 0) return;
  const y0 = Math.max(0, y), y1 = Math.min(s.h, y + h);
  for (let r = y0; r < y1; r++) span(s, gc, r, x, x + w);
}

// ---------------------------------------------------------------- wide lines

function segmentPoly(x1: number, y1: number, x2: number, y2: number, lw: number, cap: number): Pt[] | null {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const h = lw / 2;
  if (len === 0) {
    if (cap === CapProjecting) return [[x1 - h, y1 - h], [x1 + h, y1 - h], [x1 + h, y1 + h], [x1 - h, y1 + h]];
    return null;
  }
  const ux = dx / len, uy = dy / len;
  const nx = -uy * h, ny = ux * h;
  let ax = x1, ay = y1, bx = x2, by = y2;
  if (cap === CapProjecting) {
    ax -= ux * h; ay -= uy * h;
    bx += ux * h; by += uy * h;
  }
  return [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]];
}

function circlePoly(cx: number, cy: number, r: number): Pt[] {
  const n = Math.max(8, Math.ceil(r * 8));
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * Math.PI;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  return out;
}

/** A wide polyline (line_width >= 1): segments, caps and joins as filled polygons (pixel centres). */
function wideLines(s: Surface, gc: RasterGC, pts: Pt[], closed: boolean, useBg = false): void {
  const lw = gc.line_width;
  const polys: Pt[][] = [];
  const n = pts.length;
  for (let i = 0; i + 1 < n; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const capStart = i === 0 && !closed ? gc.cap_style : CapButt;
    const capEnd = i === n - 2 && !closed ? gc.cap_style : CapButt;
    const p = segmentPoly(x1, y1, x2, y2, lw, capStart === CapProjecting || capEnd === CapProjecting ? CapProjecting : CapButt);
    if (p) polys.push(p);
    if (gc.cap_style === CapRound && !closed) {
      if (i === 0) polys.push(circlePoly(x1, y1, lw / 2));
      if (i === n - 2) polys.push(circlePoly(x2, y2, lw / 2));
    }
  }
  // joins
  const joinAt = (a: Pt, b: Pt, c: Pt) => {
    if (gc.join_style === JoinRound) { polys.push(circlePoly(b[0], b[1], lw / 2)); return; }
    const d1x = b[0] - a[0], d1y = b[1] - a[1], d2x = c[0] - b[0], d2y = c[1] - b[1];
    const l1 = Math.hypot(d1x, d1y), l2 = Math.hypot(d2x, d2y);
    if (!l1 || !l2) return;
    const h = lw / 2;
    const cross = d1x * d2y - d1y * d2x;
    if (cross === 0) return;
    const side = cross > 0 ? -1 : 1;
    const o1: Pt = [b[0] + (-d1y / l1) * h * side, b[1] + (d1x / l1) * h * side];
    const o2: Pt = [b[0] + (-d2y / l2) * h * side, b[1] + (d2x / l2) * h * side];
    const cos = (d1x * d2x + d1y * d2y) / (l1 * l2);
    const angle = Math.PI - Math.acos(Math.max(-1, Math.min(1, cos)));
    if (gc.join_style === JoinMiter && angle > (11 * Math.PI) / 180) {
      // the miter point: where the two outer edges meet
      const t = ((o2[0] - o1[0]) * d2y - (o2[1] - o1[1]) * d2x) / (d1x * d2y - d1y * d2x);
      polys.push([[b[0], b[1]], o1, [o1[0] + d1x * t, o1[1] + d1y * t], o2]);
    } else polys.push([[b[0], b[1]], o1, o2]);
  };
  for (let i = 1; i + 1 < n; i++) joinAt(pts[i - 1], pts[i], pts[i + 1]);
  if (closed && n > 2) joinAt(pts[n - 2], pts[0], pts[1]);
  // each piece on its own (overlaps are painted twice, which only GXxor would show)
  for (const p of polys) fillPolys(s, gc, [p], WindingRule, useBg);
}

/** A polyline (or separate segments when `segments`), thin or wide, solid or dashed. */
export function drawLines(s: Surface, gc: RasterGC, pts: Pt[], segments: boolean): void {
  if (!pts.length) return;
  const dashed = gc.line_style !== LineSolid;
  if (gc.line_width === 0) {
    const last = gc.cap_style !== CapNotLast;
    let st = dashed ? dashStart(gc) : null;
    const step = segments ? 2 : 1;
    for (let i = 0; i + 1 < pts.length; i += step) {
      if (segments && dashed) st = dashStart(gc);
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      // within a polyline, every segment but the last leaves out its end point (the next one starts there)
      const withLast = segments || i + 2 >= pts.length ? last : false;
      if (x1 === x2 && y1 === y2) {
        if (withLast || segments) {
          if (!st) point(s, gc, x1, y1);
          else if (dashStep(gc, st)) point(s, gc, x1, y1);
          else if (gc.line_style === LineDoubleDash) point(s, gc, x1, y1, true);
        }
        continue;
      }
      thinLinePixels(x1, y1, x2, y2, withLast, (x, y) => {
        if (!st) point(s, gc, x, y);
        else if (dashStep(gc, st)) point(s, gc, x, y);
        else if (gc.line_style === LineDoubleDash) point(s, gc, x, y, true);
      });
    }
    if (pts.length === 1) point(s, gc, pts[0][0], pts[0][1]);
    return;
  }
  if (!dashed) {
    if (segments) for (let i = 0; i + 1 < pts.length; i += 2) wideLines(s, gc, [pts[i], pts[i + 1]], false);
    else {
      const closed = pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
      wideLines(s, gc, closed ? pts.slice(0, -1).concat([pts[0]]) : pts, closed);
    }
    return;
  }
  // wide dashed lines: cut the path into dashes along its length
  const d = gc.dashes.length ? gc.dashes : [4, 4];
  const cut = (path: Pt[]) => {
    const st = dashStart(gc);
    let on = st.i % 2 === 0, left = st.left, idx = st.i;
    let cur: Pt[] = [path[0]];
    for (let i = 0; i + 1 < path.length; i++) {
      let [ax, ay] = path[i];
      const [bx, by] = path[i + 1];
      let segLen = Math.hypot(bx - ax, by - ay);
      while (segLen > 0) {
        const take = Math.min(left, segLen);
        const t = take / segLen;
        const nx = ax + (bx - ax) * t, ny = ay + (by - ay) * t;
        cur.push([nx, ny]);
        segLen -= take;
        left -= take;
        ax = nx; ay = ny;
        if (left <= 1e-9) {
          if (on) wideLines(s, gc, cur, false);
          else if (gc.line_style === LineDoubleDash) wideLines(s, gc, cur, false, true);
          idx = (idx + 1) % d.length;
          left = d[idx] || 1;
          on = !on;
          cur = [[ax, ay]];
        }
      }
    }
    if (cur.length > 1) {
      if (on) wideLines(s, gc, cur, false);
      else if (gc.line_style === LineDoubleDash) wideLines(s, gc, cur, false, true);
    }
  };
  if (segments) for (let i = 0; i + 1 < pts.length; i += 2) cut([pts[i], pts[i + 1]]);
  else cut(pts);
}

// ---------------------------------------------------------------- arcs

const ARC_FULL = 360 * 64;

/** The parametric angle t (radians) is inside the arc [a1, a1 + a2] (64ths of a degree)? */
function inArc(t: number, a1: number, a2: number): boolean {
  if (Math.abs(a2) >= ARC_FULL) return true;
  let s = a1, e = a1 + a2;
  if (a2 < 0) [s, e] = [e, s];
  const deg = (t * 180 * 64) / Math.PI;
  const rel = mod(deg - s, ARC_FULL);
  return rel <= e - s;
}

/** A thin or wide arc outline of the ellipse in the box (x, y, w, h). */
export function drawArc(s: Surface, gc: RasterGC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  if (gc.line_width > 1) {
    // a ring of the line's width, filled by pixel centres (dashes are not applied to wide arcs)
    const hw = gc.line_width / 2;
    const ox = rx + hw, oy = ry + hw, ix = rx - hw, iy = ry - hw;
    for (let py = Math.floor(cy - oy); py <= Math.ceil(cy + oy); py++) {
      for (let px = Math.floor(cx - ox); px <= Math.ceil(cx + ox); px++) {
        const dx = px + 0.5 - cx, dy = py + 0.5 - cy;
        const outer = (dx * dx) / (ox * ox) + (dy * dy) / (oy * oy) <= 1;
        const inner = ix > 0 && iy > 0 && (dx * dx) / (ix * ix) + (dy * dy) / (iy * iy) < 1;
        if (!outer || inner) continue;
        if (!inArc(Math.atan2(-dy / (ry || 1), dx / (rx || 1)), a1, a2)) continue;
        point(s, gc, px, py);
      }
    }
    return;
  }
  if (w === 0 && h === 0) {
    point(s, gc, x, y);
    return;
  }
  // thin: trace the ellipse from a1 over a2, one pixel at a time
  const steps = Math.max(16, Math.ceil((Math.PI * (rx + ry) * 4 * Math.min(Math.abs(a2), ARC_FULL)) / ARC_FULL));
  const t0 = (a1 / 64) * (Math.PI / 180);
  const span_ = (Math.max(-ARC_FULL, Math.min(ARC_FULL, a2)) / 64) * (Math.PI / 180);
  const st = gc.line_style !== LineSolid ? dashStart(gc) : null;
  let lx = NaN, ly = NaN;
  const first: Pt = [NaN, NaN];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + (span_ * i) / steps;
    const px = Math.floor(cx + rx * Math.cos(t)), py = Math.floor(cy - ry * Math.sin(t));
    const fx = Math.min(px, x + w), fy = Math.min(py, y + h);
    if (fx === lx && fy === ly) continue;
    if (i === steps && Math.abs(a2) >= ARC_FULL && fx === first[0] && fy === first[1]) break;
    if (i === 0) { first[0] = fx; first[1] = fy; }
    lx = fx; ly = fy;
    if (!st) point(s, gc, fx, fy);
    else if (dashStep(gc, st)) point(s, gc, fx, fy);
    else if (gc.line_style === LineDoubleDash) point(s, gc, fx, fy, true);
  }
}

/** A filled arc: the pie slice (or chord) of the ellipse in the box (x, y, w, h), by pixel centres. */
export function fillArc(s: Surface, gc: RasterGC, x: number, y: number, w: number, h: number, a1: number, a2: number): void {
  if (w <= 0 || h <= 0) return;
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  const full = Math.abs(a2) >= ARC_FULL;
  // the chord's line, for ArcChord
  const ta = (a1 / 64) * (Math.PI / 180), tb = ((a1 + a2) / 64) * (Math.PI / 180);
  const pa: Pt = [cx + rx * Math.cos(ta), cy - ry * Math.sin(ta)], pb: Pt = [cx + rx * Math.cos(tb), cy - ry * Math.sin(tb)];
  const y0 = Math.max(0, y), y1 = Math.min(s.h, y + h);
  for (let py = y0; py < y1; py++) {
    const dy = py + 0.5 - cy;
    const k = 1 - (dy * dy) / (ry * ry);
    if (k < 0) continue;
    const half = rx * Math.sqrt(k);
    const xa = Math.ceil(cx - half - 0.5), xb = Math.ceil(cx + half - 0.5);
    if (full) { span(s, gc, py, xa, xb); continue; }
    for (let px = xa; px < xb; px++) {
      const dx = px + 0.5 - cx;
      let inside: boolean;
      if (gc.arc_mode === ArcChord) {
        const side = (pb[0] - pa[0]) * (py + 0.5 - pa[1]) - (pb[1] - pa[1]) * (px + 0.5 - pa[0]);
        inside = a2 > 0 ? side <= 0 : side >= 0;
      } else inside = inArc(Math.atan2(-dy / ry, dx / rx), a1, a2);
      if (inside) point(s, gc, px, py);
    }
  }
}

// ---------------------------------------------------------------- text

export interface Glyphs {
  width: number;
  ascent: number;
  descent: number;
  bytesPerRow: number;
  bits: Uint8Array;
}

export function glyphsOf(f: { width: number; ascent: number; descent: number; bytesPerRow: number; glyphs: string }): Glyphs {
  const bits = new Uint8Array(f.glyphs.length / 2);
  for (let i = 0; i < bits.length; i++) bits[i] = parseInt(f.glyphs.substr(2 * i, 2), 16);
  return { width: f.width, ascent: f.ascent, descent: f.descent, bytesPerRow: f.bytesPerRow, bits };
}

/** XDrawString: the glyphs' foreground pixels, the baseline at y. */
export function drawText(s: Surface, gc: RasterGC, g: Glyphs, x: number, y: number, codes: number[]): void {
  const hgt = g.ascent + g.descent;
  const stride = hgt * g.bytesPerRow;
  for (let i = 0; i < codes.length; i++) {
    const base = (codes[i] & 0xff) * stride;
    const gx = x + i * g.width;
    if (gx >= s.w || gx + g.width <= 0) continue;
    for (let r = 0; r < hgt; r++) {
      const py = y - g.ascent + r;
      if (py < 0 || py >= s.h) continue;
      let bits = 0;
      for (let k = 0; k < g.bytesPerRow; k++) bits |= g.bits[base + r * g.bytesPerRow + k] << (8 * k);
      if (!bits) continue;
      let c = 0;
      while (c < g.width) {
        if (!(bits & (1 << c))) { c++; continue; }
        const start = c;
        while (c < g.width && bits & (1 << c)) c++;
        span(s, gc, py, gx + start, gx + c);
      }
    }
  }
}

// ---------------------------------------------------------------- copying

/** XCopyArea between drawables of the same depth, through the GC's function, plane mask and clip. */
export function copyArea(src: Surface, dst: Surface, gc: RasterGC, sx: number, sy: number, w: number, h: number, dx: number, dy: number): void {
  // only the part inside the source is copied (the rest would be exposures)
  if (sx < 0) { dx -= sx; w += sx; sx = 0; }
  if (sy < 0) { dy -= sy; h += sy; sy = 0; }
  if (sx + w > src.w) w = src.w - sx;
  if (sy + h > src.h) h = src.h - sy;
  if (dx < 0) { sx -= dx; w += dx; dx = 0; }
  if (dy < 0) { sy -= dy; h += dy; dy = 0; }
  if (dx + w > dst.w) w = dst.w - dx;
  if (dy + h > dst.h) h = dst.h - dy;
  if (w <= 0 || h <= 0) return;
  const mask = dst.depth === 1 ? 1 : 0xffffff;
  const pm = gc.plane_mask & mask;
  const fast = gc.function === GXcopy && pm === mask && !gc.clip;
  // overlapping copies within one drawable: go in the safe direction
  const rows = Array.from({ length: h }, (_, i) => i);
  if (src === dst && dy > sy) rows.reverse();
  for (const r of rows) {
    const so = (sy + r) * src.w + sx, d0 = (dy + r) * dst.w + dx;
    if (fast) {
      if (src === dst) dst.data.copyWithin(d0, so, so + w);
      else dst.data.set(src.data.subarray(so, so + w), d0);
      continue;
    }
    for (let c = 0; c < w; c++) {
      const x = dx + c, y = dy + r;
      if (gc.clip) {
        const cx = x - gc.clip_x_origin, cy = y - gc.clip_y_origin;
        if (cx < 0 || cy < 0 || cx >= gc.clip.w || cy >= gc.clip.h || !gc.clip.data[cy * gc.clip.w + cx]) continue;
      }
      const i = y * dst.w + x;
      const d = dst.data[i];
      const v = combine(gc.function, src.data[so + c] & mask, d);
      dst.data[i] = ((d & ~pm) | (v & pm)) & mask;
    }
  }
}
