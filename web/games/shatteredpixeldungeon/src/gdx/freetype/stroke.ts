// FreeType 2.13's stroker, as FT_Glyph_StrokeBorder(glyph, stroker, inside = false) uses it for gdx-freetype's
// glyph borders: the outline parsed into lines and conics (FT_Stroker_ParseOutline), each side's border made
// of offset segments, round or miter joins (arcs as cubic Béziers) and the inside corners, then the outside
// border exported (FT_Outline_GetOutsideBorder). The glyph's bitmap is the box of that outline's points
// (control points included), so its size and offsets are exact only if every point is FreeType's: the
// arithmetic is FreeType's, with its CORDIC trigonometry (fttrigon.c), its fixed-point rounding (ftcalc.c) and
// C's integer division and shifts. Translated for the port from FreeType 2.13.2's ftstroke.c, fttrigon.c and
// ftoutln.c (FT_Outline_Get_Orientation); FreeType is under the FreeType License (see LICENSE.md). Cubic
// curves in the input (not in TrueType fonts) are not supported.
import type { Outline } from './ft.ts';
import { mulFix, divFix, mulDiv } from './ft.ts';

/* ------------------------------------------------------------------ fttrigon.c */

const ANGLE_PI = 180 * 65536, ANGLE_2PI = 2 * ANGLE_PI, ANGLE_PI2 = ANGLE_PI / 2, ANGLE_PI4 = ANGLE_PI / 4;
const TRIG_SCALE = 0xdbd95b16n;
const TRIG_SAFE_MSB = 29;
const TRIG_MAX_ITERS = 23;
const ARCTAN = [1740967, 919879, 466945, 234379, 117304, 58666, 29335, 14668, 7334, 3667, 1833, 917, 458, 229, 115, 57, 29, 14, 7, 4, 2, 1];

/** C's arithmetic shift right of a (64-bit) value. */
const sar = (v: number, n: number) => Math.floor(v / 2 ** n);
/** C's integer division (truncating). */
const cdiv = (a: number, b: number) => Math.trunc(a / b);
const msb = (x: number) => 31 - Math.clz32(x);

type Vec = { x: number; y: number };

function downscale(val: number): number {
  const s = val < 0 ? -1 : 1;
  const v = Number((BigInt(Math.abs(val)) * TRIG_SCALE + 0x40000000n) >> 32n);
  return s < 0 ? -v : v;
}

function prenorm(v: Vec): number {
  const x = v.x, y = v.y;
  let shift = msb((Math.abs(x) | Math.abs(y)) >>> 0);
  if (shift <= TRIG_SAFE_MSB) {
    shift = TRIG_SAFE_MSB - shift;
    v.x = x * 2 ** shift;
    v.y = y * 2 ** shift;
  } else {
    shift -= TRIG_SAFE_MSB;
    v.x = sar(x, shift);
    v.y = sar(y, shift);
    shift = -shift;
  }
  return shift;
}

function pseudoRotate(v: Vec, theta: number) {
  let x = v.x, y = v.y, xt: number;
  while (theta < -ANGLE_PI4) { xt = y; y = -x; x = xt; theta += ANGLE_PI2; }
  while (theta > ANGLE_PI4) { xt = -y; y = x; x = xt; theta -= ANGLE_PI2; }
  for (let i = 1, b = 1; i < TRIG_MAX_ITERS; b *= 2, i++) {
    if (theta < 0) {
      xt = x + sar(y + b, i);
      y = y - sar(x + b, i);
      x = xt;
      theta += ARCTAN[i - 1];
    } else {
      xt = x - sar(y + b, i);
      y = y + sar(x + b, i);
      x = xt;
      theta -= ARCTAN[i - 1];
    }
  }
  v.x = x;
  v.y = y;
}

function pseudoPolarize(v: Vec) {
  let x = v.x, y = v.y, xt: number, theta: number;
  if (y > x) {
    if (y > -x) { theta = ANGLE_PI2; xt = y; y = -x; x = xt; } else { theta = y > 0 ? ANGLE_PI : -ANGLE_PI; x = -x; y = -y; }
  } else if (y < -x) { theta = -ANGLE_PI2; xt = -y; y = x; x = xt; } else theta = 0;
  for (let i = 1, b = 1; i < TRIG_MAX_ITERS; b *= 2, i++) {
    if (y > 0) {
      xt = x + sar(y + b, i);
      y = y - sar(x + b, i);
      x = xt;
      theta += ARCTAN[i - 1];
    } else {
      xt = x - sar(y + b, i);
      y = y + sar(x + b, i);
      x = xt;
      theta -= ARCTAN[i - 1];
    }
  }
  // FT_PAD_ROUND(theta, 16)
  theta = theta >= 0 ? Math.floor((theta + 8) / 16) * 16 : -Math.floor((-theta + 8) / 16) * 16;
  v.x = x;
  v.y = theta;
}

function vectorUnit(angle: number): Vec {
  const v = { x: Number(TRIG_SCALE >> 8n), y: 0 };
  pseudoRotate(v, angle);
  return { x: sar(v.x + 0x80, 8), y: sar(v.y + 0x80, 8) };
}
const ftCos = (a: number) => vectorUnit(a).x;
const ftSin = (a: number) => vectorUnit(a).y;
function ftTan(angle: number): number {
  const v = { x: 1 << 24, y: 0 };
  pseudoRotate(v, angle);
  return divFix(v.y, v.x);
}
function atan2(dx: number, dy: number): number {
  if (dx === 0 && dy === 0) return 0;
  const v = { x: dx, y: dy };
  prenorm(v);
  pseudoPolarize(v);
  return v.y;
}
function vectorRotate(vec: Vec, angle: number) {
  if (!angle) return;
  const v = { x: vec.x, y: vec.y };
  if (v.x === 0 && v.y === 0) return;
  let shift = prenorm(v);
  pseudoRotate(v, angle);
  v.x = downscale(v.x);
  v.y = downscale(v.y);
  if (shift > 0) {
    const half = 2 ** (shift - 1);
    vec.x = sar(v.x + half - (v.x < 0 ? 1 : 0), shift);
    vec.y = sar(v.y + half - (v.y < 0 ? 1 : 0), shift);
  } else {
    shift = -shift;
    vec.x = v.x * 2 ** shift;
    vec.y = v.y * 2 ** shift;
  }
}
function vectorLength(vec: Vec): number {
  const v = { x: vec.x, y: vec.y };
  if (v.x === 0) return Math.abs(v.y);
  if (v.y === 0) return Math.abs(v.x);
  const shift = prenorm(v);
  pseudoPolarize(v);
  v.x = downscale(v.x);
  if (shift > 0) return sar(v.x + 2 ** (shift - 1), shift);
  return v.x * 2 ** -shift;
}
function fromPolar(length: number, angle: number): Vec {
  const v = { x: length, y: 0 };
  vectorRotate(v, angle);
  return v;
}
function angleDiff(a1: number, a2: number): number {
  let d = a2 - a1;
  while (d <= -ANGLE_PI) d += ANGLE_2PI;
  while (d > ANGLE_PI) d -= ANGLE_2PI;
  return d;
}

/* ------------------------------------------------------------------ ftstroke.c */

const SMALL_CONIC_THRESHOLD = ANGLE_PI / 6;
const EPSILON = 2;
const isSmall = (x: number) => x > -EPSILON && x < EPSILON;
const TAG_ON = 1, TAG_CUBIC = 2, TAG_BEGIN = 4, TAG_END = 8;
const LINECAP_BUTT = 0, LINECAP_ROUND = 1, LINECAP_SQUARE = 2;
const LINEJOIN_ROUND = 0, LINEJOIN_BEVEL = 1, LINEJOIN_MITER_VARIABLE = 2;
const ARC_CUBIC_ANGLE = ANGLE_PI / 2;
const sideToRotate = (s: number) => ANGLE_PI2 - s * ANGLE_PI;

class Border {
  pts: Vec[] = [];
  tags: number[] = [];
  movable = false;
  start = -1;
  valid = false;
  get n() { return this.pts.length; }
  close(reverse: boolean) {
    const start = this.start;
    let count = this.n;
    if (count <= start + 1) {
      this.pts.length = start;
      this.tags.length = start;
    } else {
      count--;
      this.pts[start] = this.pts[count];
      this.tags[start] = this.tags[count];
      this.pts.length = count;
      this.tags.length = count;
      if (reverse) {
        for (let i = start + 1, j = count - 1; i < j; i++, j--) {
          [this.pts[i], this.pts[j]] = [this.pts[j], this.pts[i]];
          [this.tags[i], this.tags[j]] = [this.tags[j], this.tags[i]];
        }
      }
      this.tags[start] |= TAG_BEGIN;
      this.tags[count - 1] |= TAG_END;
    }
    this.start = -1;
    this.movable = false;
  }
  lineto(to: Vec, movable: boolean) {
    if (this.movable) {
      this.pts[this.n - 1] = { x: to.x, y: to.y };
    } else {
      if (this.n > this.start && isSmall(this.pts[this.n - 1].x - to.x) && isSmall(this.pts[this.n - 1].y - to.y)) return;
      this.pts.push({ x: to.x, y: to.y });
      this.tags.push(TAG_ON);
    }
    this.movable = movable;
  }
  conicto(control: Vec, to: Vec) {
    this.pts.push({ x: control.x, y: control.y }, { x: to.x, y: to.y });
    this.tags.push(0, TAG_ON);
    this.movable = false;
  }
  cubicto(c1: Vec, c2: Vec, to: Vec) {
    this.pts.push({ x: c1.x, y: c1.y }, { x: c2.x, y: c2.y }, { x: to.x, y: to.y });
    this.tags.push(TAG_CUBIC, TAG_CUBIC, TAG_ON);
    this.movable = false;
  }
  arcto(center: Vec, radius: number, angleStart: number, angleDiff_: number) {
    let arcs = 1;
    while (angleDiff_ > ARC_CUBIC_ANGLE * arcs || -angleDiff_ > ARC_CUBIC_ANGLE * arcs) arcs++;
    let coef = ftTan(cdiv(angleDiff_, 4 * arcs));
    coef += cdiv(coef, 3);
    const a0 = fromPolar(radius, angleStart);
    const a1 = { x: mulFix(-a0.y, coef), y: mulFix(a0.x, coef) };
    a0.x += center.x;
    a0.y += center.y;
    a1.x += a0.x;
    a1.y += a0.y;
    for (let i = 1; i <= arcs; i++) {
      const a3 = fromPolar(radius, angleStart + cdiv(i * angleDiff_, arcs));
      const a2 = { x: mulFix(a3.y, coef), y: mulFix(-a3.x, coef) };
      a3.x += center.x;
      a3.y += center.y;
      a2.x += a3.x;
      a2.y += a3.y;
      this.cubicto(a1, a2, a3);
      a1.x = a3.x - a2.x + a3.x;
      a1.y = a3.y - a2.y + a3.y;
    }
  }
  moveto(to: Vec) {
    if (this.start >= 0) this.close(false);
    this.start = this.n;
    this.movable = false;
    this.lineto(to, false);
  }
  counts(): boolean {
    let inContour = false;
    for (const t of this.tags) {
      if (t & TAG_BEGIN) {
        if (inContour) return false;
        inContour = true;
      } else if (!inContour) return false;
      if (t & TAG_END) inContour = false;
    }
    if (inContour) return false;
    this.valid = true;
    return true;
  }
}

class Stroker {
  angleIn = 0;
  angleOut = 0;
  center: Vec = { x: 0, y: 0 };
  lineLength = 0;
  firstPoint = false;
  subpathOpen = false;
  subpathAngle = 0;
  subpathStart: Vec = { x: 0, y: 0 };
  subpathLineLength = 0;
  handleWideStrokes = false;
  lineCap: number;
  lineJoin: number;
  lineJoinSaved: number;
  miterLimit: number;
  radius: number;
  borders = [new Border(), new Border()];
  constructor(radius: number, lineCap: number, lineJoin: number, miterLimit: number) {
    this.radius = radius;
    this.lineCap = lineCap;
    this.lineJoin = lineJoin;
    this.miterLimit = miterLimit < 0x10000 ? 0x10000 : miterLimit;
    this.lineJoinSaved = lineJoin;
  }

  arcto(side: number) {
    const rotate = sideToRotate(side);
    let total = angleDiff(this.angleIn, this.angleOut);
    if (total === ANGLE_PI) total = -rotate * 2;
    const border = this.borders[side];
    border.arcto(this.center, this.radius, this.angleIn + rotate, total);
    border.movable = false;
  }

  cap(angle: number, side: number) {
    if (this.lineCap === LINECAP_ROUND) {
      this.angleIn = angle;
      this.angleOut = angle + ANGLE_PI;
      this.arcto(side);
    } else {
      const middle = fromPolar(this.radius, angle);
      const delta = { x: side ? middle.y : -middle.y, y: side ? -middle.x : middle.x };
      if (this.lineCap === LINECAP_SQUARE) { middle.x += this.center.x; middle.y += this.center.y; } else { middle.x = this.center.x; middle.y = this.center.y; }
      delta.x += middle.x;
      delta.y += middle.y;
      const border = this.borders[side];
      border.lineto(delta, false);
      delta.x = middle.x - delta.x + middle.x;
      delta.y = middle.y - delta.y + middle.y;
      border.lineto(delta, false);
    }
  }

  inside(side: number, lineLength: number) {
    const border = this.borders[side];
    const rotate = sideToRotate(side);
    const theta = cdiv(angleDiff(this.angleIn, this.angleOut), 2);
    let sigma: Vec = { x: 0, y: 0 };
    let intersect: boolean;
    if (!border.movable || lineLength === 0 || theta > 0x59c000 || theta < -0x59c000) intersect = false;
    else {
      sigma = vectorUnit(theta);
      const minLength = Math.abs(mulDiv(this.radius, sigma.y, sigma.x));
      intersect = minLength !== 0 && this.lineLength >= minLength && lineLength >= minLength;
    }
    let delta: Vec;
    if (!intersect) {
      delta = fromPolar(this.radius, this.angleOut + rotate);
      delta.x += this.center.x;
      delta.y += this.center.y;
      border.movable = false;
    } else {
      const phi = this.angleIn + theta + rotate;
      const length = divFix(this.radius, sigma.x);
      delta = fromPolar(length, phi);
      delta.x += this.center.x;
      delta.y += this.center.y;
    }
    border.lineto(delta, false);
  }

  outside(side: number, lineLength: number) {
    const border = this.borders[side];
    if (this.lineJoin === LINEJOIN_ROUND) {
      this.arcto(side);
      return;
    }
    const radius = this.radius;
    let sigma: Vec = { x: 0, y: 0 };
    let theta = 0, phi = 0;
    const rotate = sideToRotate(side);
    let bevel = this.lineJoin === LINEJOIN_BEVEL;
    const fixedBevel = this.lineJoin !== LINEJOIN_MITER_VARIABLE;
    if (!bevel) {
      theta = cdiv(angleDiff(this.angleIn, this.angleOut), 2);
      if (theta === ANGLE_PI2) theta = -rotate;
      phi = this.angleIn + theta + rotate;
      sigma = fromPolar(this.miterLimit, theta);
      if (sigma.x < 0x10000) {
        if (fixedBevel || Math.abs(theta) > 57) bevel = true;
      }
    }
    if (bevel) {
      if (fixedBevel) {
        const delta = fromPolar(radius, this.angleOut + rotate);
        delta.x += this.center.x;
        delta.y += this.center.y;
        border.movable = false;
        border.lineto(delta, false);
      } else {
        const middle = fromPolar(mulFix(radius, this.miterLimit), phi);
        const coef = divFix(0x10000 - sigma.x, sigma.y);
        const delta = { x: mulFix(middle.y, coef), y: mulFix(-middle.x, coef) };
        middle.x += this.center.x;
        middle.y += this.center.y;
        delta.x += middle.x;
        delta.y += middle.y;
        border.lineto(delta, false);
        delta.x = middle.x - delta.x + middle.x;
        delta.y = middle.y - delta.y + middle.y;
        border.lineto(delta, false);
        if (lineLength === 0) {
          const d = fromPolar(radius, this.angleOut + rotate);
          d.x += this.center.x;
          d.y += this.center.y;
          border.lineto(d, false);
        }
      }
    } else {
      const length = mulDiv(this.radius, this.miterLimit, sigma.x);
      const delta = fromPolar(length, phi);
      delta.x += this.center.x;
      delta.y += this.center.y;
      border.lineto(delta, false);
      if (lineLength === 0) {
        const d = fromPolar(this.radius, this.angleOut + rotate);
        d.x += this.center.x;
        d.y += this.center.y;
        border.lineto(d, false);
      }
    }
  }

  processCorner(lineLength: number) {
    const turn = angleDiff(this.angleIn, this.angleOut);
    if (turn === 0) return;
    const insideSide = turn < 0 ? 1 : 0;
    this.inside(insideSide, lineLength);
    this.outside(insideSide ? 0 : 1, lineLength);
  }

  subpathStart_(startAngle: number, lineLength: number) {
    const delta = fromPolar(this.radius, startAngle + ANGLE_PI2);
    this.borders[0].moveto({ x: this.center.x + delta.x, y: this.center.y + delta.y });
    this.borders[1].moveto({ x: this.center.x - delta.x, y: this.center.y - delta.y });
    this.subpathAngle = startAngle;
    this.firstPoint = false;
    this.subpathLineLength = lineLength;
  }

  lineTo(to: Vec) {
    let delta = { x: to.x - this.center.x, y: to.y - this.center.y };
    if (delta.x === 0 && delta.y === 0) return;
    const lineLength = vectorLength(delta);
    const angle = atan2(delta.x, delta.y);
    delta = fromPolar(this.radius, angle + ANGLE_PI2);
    if (this.firstPoint) this.subpathStart_(angle, lineLength);
    else {
      this.angleOut = angle;
      this.processCorner(lineLength);
    }
    for (let b = 0, side = 1; side >= 0; side--, b++) {
      this.borders[b].lineto({ x: to.x + delta.x, y: to.y + delta.y }, true);
      delta = { x: -delta.x, y: -delta.y };
    }
    this.angleIn = angle;
    this.center = { x: to.x, y: to.y };
    this.lineLength = lineLength;
  }

  conicTo(control: Vec, to: Vec) {
    if (isSmall(this.center.x - control.x) && isSmall(this.center.y - control.y) && isSmall(control.x - to.x) && isSmall(control.y - to.y)) {
      this.center = { x: to.x, y: to.y };
      return;
    }
    // bez_stack: arc points at arc, arc+1, arc+2 (end, control, start)
    const stack: Vec[] = new Array(34);
    let arc = 0;
    const limit = 30;
    let firstArc = true;
    stack[0] = { x: to.x, y: to.y };
    stack[1] = { x: control.x, y: control.y };
    stack[2] = { x: this.center.x, y: this.center.y };
    while (arc >= 0) {
      let angleIn = this.angleIn, angleOut = this.angleIn;
      if (arc < limit) {
        // ft_conic_is_small_enough
        const d1 = { x: stack[arc + 1].x - stack[arc + 2].x, y: stack[arc + 1].y - stack[arc + 2].y };
        const d2 = { x: stack[arc].x - stack[arc + 1].x, y: stack[arc].y - stack[arc + 1].y };
        const close1 = isSmall(d1.x) && isSmall(d1.y), close2 = isSmall(d2.x) && isSmall(d2.y);
        if (close1) {
          if (!close2) angleIn = angleOut = atan2(d2.x, d2.y);
        } else if (close2) angleIn = angleOut = atan2(d1.x, d1.y);
        else { angleIn = atan2(d1.x, d1.y); angleOut = atan2(d2.x, d2.y); }
        const theta = Math.abs(angleDiff(angleIn, angleOut));
        if (!(theta < SMALL_CONIC_THRESHOLD)) {
          if (this.firstPoint) this.angleIn = angleIn;
          // ft_conic_split
          const b = (k: number) => stack[arc + k] ??= { x: 0, y: 0 };
          b(4).x = stack[arc + 2].x;
          let a = stack[arc].x + stack[arc + 1].x, bb = stack[arc + 1].x + stack[arc + 2].x;
          b(3).x = sar(bb, 1);
          stack[arc + 2].x = sar(a + bb, 2);
          stack[arc + 1].x = sar(a, 1);
          b(4).y = stack[arc + 2].y;
          a = stack[arc].y + stack[arc + 1].y;
          bb = stack[arc + 1].y + stack[arc + 2].y;
          b(3).y = sar(bb, 1);
          stack[arc + 2].y = sar(a + bb, 2);
          stack[arc + 1].y = sar(a, 1);
          arc += 2;
          continue;
        }
      }
      if (firstArc) {
        firstArc = false;
        if (this.firstPoint) this.subpathStart_(angleIn, 0);
        else {
          this.angleOut = angleIn;
          this.processCorner(0);
        }
      } else if (Math.abs(angleDiff(this.angleIn, angleIn)) > SMALL_CONIC_THRESHOLD / 4) {
        this.center = { x: stack[arc + 2].x, y: stack[arc + 2].y };
        this.angleOut = angleIn;
        this.lineJoin = LINEJOIN_ROUND;
        this.processCorner(0);
        this.lineJoin = this.lineJoinSaved;
      }
      {
        const theta = cdiv(angleDiff(angleIn, angleOut), 2);
        const phi = angleIn + theta;
        const length = divFix(this.radius, ftCos(theta));
        const alpha0 = this.handleWideStrokes ? atan2(stack[arc].x - stack[arc + 2].x, stack[arc].y - stack[arc + 2].y) : 0;
        for (let side = 0; side <= 1; side++) {
          const border = this.borders[side];
          const rotate = sideToRotate(side);
          const ctrl = fromPolar(length, phi + rotate);
          ctrl.x += stack[arc + 1].x;
          ctrl.y += stack[arc + 1].y;
          const end = fromPolar(this.radius, angleOut + rotate);
          end.x += stack[arc].x;
          end.y += stack[arc].y;
          if (this.handleWideStrokes) {
            const start = border.pts[border.n - 1];
            const alpha1 = atan2(end.x - start.x, end.y - start.y);
            if (Math.abs(angleDiff(alpha0, alpha1)) > ANGLE_PI / 2) {
              const beta = atan2(stack[arc + 2].x - start.x, stack[arc + 2].y - start.y);
              const gamma = atan2(stack[arc].x - end.x, stack[arc].y - end.y);
              const blen = vectorLength({ x: end.x - start.x, y: end.y - start.y });
              const sinA = Math.abs(ftSin(alpha1 - gamma));
              const sinB = Math.abs(ftSin(beta - gamma));
              const alen = mulDiv(blen, sinA, sinB);
              const delta = fromPolar(alen, beta);
              delta.x += start.x;
              delta.y += start.y;
              const s = { x: start.x, y: start.y };
              border.movable = false;
              border.lineto(delta, false);
              border.lineto(end, false);
              border.conicto(ctrl, s);
              border.lineto(end, false);
              continue;
            }
          }
          border.conicto(ctrl, end);
        }
      }
      arc -= 2;
      this.angleIn = angleOut;
    }
    this.center = { x: to.x, y: to.y };
    this.lineLength = 0;
  }

  beginSubPath(to: Vec, open: boolean) {
    this.firstPoint = true;
    this.center = { x: to.x, y: to.y };
    this.subpathOpen = open;
    this.handleWideStrokes = this.lineJoin !== LINEJOIN_ROUND || (this.subpathOpen && this.lineCap === LINECAP_BUTT);
    this.subpathStart = { x: to.x, y: to.y };
    this.angleIn = 0;
  }

  addReverseLeft(open: boolean) {
    const right = this.borders[0], left = this.borders[1];
    const newPoints = left.n - left.start;
    if (newPoints > 0) {
      for (let i = left.n - 1; i >= left.start; i--) {
        let t = left.tags[i];
        if (open) t &= ~(TAG_BEGIN | TAG_END);
        else {
          const tt = t & (TAG_BEGIN | TAG_END);
          if (tt === TAG_BEGIN || tt === TAG_END) t ^= TAG_BEGIN | TAG_END;
        }
        right.pts.push(left.pts[i]);
        right.tags.push(t);
      }
      left.pts.length = left.start;
      left.tags.length = left.start;
      right.movable = false;
      left.movable = false;
    }
  }

  endSubPath() {
    if (this.subpathOpen) {
      const right = this.borders[0];
      this.cap(this.angleIn, 0);
      this.addReverseLeft(true);
      this.center = { x: this.subpathStart.x, y: this.subpathStart.y };
      this.cap(this.subpathAngle + ANGLE_PI, 0);
      right.close(false);
    } else {
      if (!isSmall(this.center.x - this.subpathStart.x) || !isSmall(this.center.y - this.subpathStart.y)) this.lineTo(this.subpathStart);
      this.angleOut = this.subpathAngle;
      this.processCorner(this.subpathLineLength);
      this.borders[0].close(false);
      this.borders[1].close(true);
    }
  }

  /** FT_Stroker_ParseOutline (closed contours). */
  parse(o: Outline) {
    for (const b of this.borders) { b.pts = []; b.tags = []; b.start = -1; b.valid = false; }
    let last = -1;
    for (let n = 0; n < o.contours.length; n++) {
      const first = last + 1;
      last = o.contours[n];
      if (last <= first) continue;
      let limit = last;
      let vStart = { x: o.x[first], y: o.y[first] };
      const vLast = { x: o.x[last], y: o.y[last] };
      let vControl = { ...vStart };
      let point = first;
      let tag = o.tags[first] & 3;
      if (tag === 2) throw new Error('FreeType stroker: an outline starting with a cubic control point');
      if (tag === 0) {
        if ((o.tags[last] & 3) === 1) {
          vStart = vLast;
          limit--;
        } else {
          vStart = { x: cdiv(vStart.x + vLast.x, 2), y: cdiv(vStart.y + vLast.y, 2) };
        }
        point--;
      }
      this.beginSubPath(vStart, false);
      let closed = false;
      while (point < limit) {
        point++;
        tag = o.tags[point] & 3;
        if (tag === 1) {
          this.lineTo({ x: o.x[point], y: o.y[point] });
          continue;
        }
        if (tag === 0) {
          vControl = { x: o.x[point], y: o.y[point] };
          for (;;) {
            if (point < limit) {
              point++;
              tag = o.tags[point] & 3;
              const vec = { x: o.x[point], y: o.y[point] };
              if (tag === 1) {
                this.conicTo(vControl, vec);
                break;
              }
              if (tag !== 0) throw new Error('FreeType stroker: invalid outline');
              const vMiddle = { x: cdiv(vControl.x + vec.x, 2), y: cdiv(vControl.y + vec.y, 2) };
              this.conicTo(vControl, vMiddle);
              vControl = vec;
              continue;
            }
            this.conicTo(vControl, vStart);
            closed = true;
            break;
          }
          if (closed) break;
          continue;
        }
        throw new Error('FreeType stroker: cubic curves are not supported');
      }
      if (!this.firstPoint) this.endSubPath();
    }
  }
}

/** FT_Outline_Get_Orientation: 0 TrueType (clockwise), 1 PostScript, 2 none. */
function orientation(o: Outline): number {
  if (o.x.length === 0) return 0;
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  for (let i = 0; i < o.x.length; i++) {
    xMin = Math.min(xMin, o.x[i]); xMax = Math.max(xMax, o.x[i]); yMin = Math.min(yMin, o.y[i]); yMax = Math.max(yMax, o.y[i]);
  }
  if (xMin === xMax || yMin === yMax) return 2;
  if (xMin < -0x1000000 || yMin < -0x1000000 || xMax > 0x1000000 || yMax > 0x1000000) return 2;
  const xshift = Math.max(msb((Math.abs(xMax) | Math.abs(xMin)) >>> 0) - 14, 0);
  const yshift = Math.max(msb((yMax - yMin) >>> 0) - 14, 0);
  let area = 0, last = -1;
  for (const c of o.contours) {
    const first = last + 1;
    last = c;
    let px = sar(o.x[last], xshift), py = sar(o.y[last], yshift);
    for (let n = first; n <= last; n++) {
      const cx = sar(o.x[n], xshift), cy = sar(o.y[n], yshift);
      area += (cy - py) * (cx + px);
      px = cx;
      py = cy;
    }
  }
  return area > 0 ? 1 : area < 0 ? 0 : 2;
}

/** FT_Glyph_StrokeBorder(glyph, stroker, inside = false): the outside border of the stroked outline. */
export function strokeOutsideBorder(o: Outline, radius: number, lineCap: number, lineJoin: number, miterLimit: number): Outline {
  // FT_Outline_GetOutsideBorder: FT_STROKER_BORDER_LEFT (0) for TrueType's orientation, else RIGHT (1)
  const border = orientation(o) === 0 ? 0 : 1;
  const st = new Stroker(radius, lineCap, lineJoin, miterLimit);
  st.parse(o);
  const b = st.borders[border];
  const out: Outline = { x: [], y: [], tags: [], contours: [] };
  if (!b.counts()) return out;
  for (let i = 0; i < b.n; i++) {
    out.x.push(b.pts[i].x);
    out.y.push(b.pts[i].y);
    const t = b.tags[i];
    out.tags.push(t & TAG_ON ? 1 : t & TAG_CUBIC ? 2 : 0);
    if (t & TAG_END) out.contours.push(i);
  }
  return out;
}
