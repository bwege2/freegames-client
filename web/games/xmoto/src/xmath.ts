// sin, cos and atan2 for the physics, the same in every browser: musl 1.2.5's src/math/{sin,cos,__sin,
// __cos,__rem_pio2,atan,atan2}.c (derived from FreeBSD's fdlibm), translated operation by operation.
// The ODE step of the original calls the C library's sin/cos/atan2; JavaScript engines differ from each
// other and from glibc in the last bit, which a physics simulation turns into different rides. The
// oracle (re/xmoto/oracle) links the same musl functions, so the port's floats can be compared bit for bit.
//
// musl: Copyright © 2005-2020 Rich Felker et al., MIT. fdlibm: Copyright (C) 1993 by Sun Microsystems,
// "Permission to use, copy, modify, and distribute this software is freely granted, provided that this
// notice is preserved." (web/games/xmoto/LICENSE.md)

const buf = new DataView(new ArrayBuffer(8));
function hi(x: number): number { buf.setFloat64(0, x); return buf.getUint32(0); }
function lo(x: number): number { buf.setFloat64(0, x); return buf.getUint32(4); }
function exp11(x: number): number { buf.setFloat64(0, x); return (buf.getUint32(0) >>> 20) & 0x7ff; }

const S1 = -1.66666666666666324348e-01, S2 = 8.33333333332248946124e-03, S3 = -1.98412698298579493134e-04,
  S4 = 2.75573137070700676789e-06, S5 = -2.50507602534068634195e-08, S6 = 1.58969099521155010221e-10;
function __sin(x: number, y: number, iy: number): number {
  const z = x * x;
  const w = z * z;
  const r = S2 + z * (S3 + z * S4) + z * w * (S5 + z * S6);
  const v = z * x;
  if (iy === 0) return x + v * (S1 + z * r);
  return x - ((z * (0.5 * y - v * r) - y) - v * S1);
}

const C1 = 4.16666666666666019037e-02, C2 = -1.38888888888741095749e-03, C3 = 2.48015872894767294178e-05,
  C4 = -2.75573143513906633035e-07, C5 = 2.08757232129817482790e-09, C6 = -1.13596475577881948265e-11;
function __cos(x: number, y: number): number {
  const z = x * x;
  let w = z * z;
  const r = z * (C1 + z * (C2 + z * C3)) + w * w * (C4 + z * (C5 + z * C6));
  const hz = 0.5 * z;
  w = 1.0 - hz;
  return w + (((1.0 - w) - hz) + (z * r - x * y));
}

const toint = 1.5 / Number.EPSILON;
const pio4 = 0.78539816339744827900; // 0x1.921fb54442d18p-1
const invpio2 = 6.36619772367581382433e-01, pio2_1 = 1.57079632673412561417e+00, pio2_1t = 6.07710050650619224932e-11,
  pio2_2 = 6.07710050630396597660e-11, pio2_2t = 2.02226624879595063154e-21, pio2_3 = 2.02226624871116645580e-21,
  pio2_3t = 8.47842766036889956997e-32;

/** __rem_pio2 for |x| < 2^20*pi/2 (the physics never reduces larger arguments) */
function remPio2(x: number, y: [number, number]): number {
  const h = hi(x);
  const sign = h >>> 31;
  const ix = h & 0x7fffffff;
  let z: number;
  const small = (k: number): number => {
    if (!sign) {
      z = x - k * pio2_1; y[0] = z - k * pio2_1t; y[1] = (z - y[0]) - k * pio2_1t; return k;
    }
    z = x + k * pio2_1; y[0] = z + k * pio2_1t; y[1] = (z - y[0]) + k * pio2_1t; return -k;
  };
  let medium = false;
  if (ix <= 0x400f6a7a) {
    if ((ix & 0xfffff) === 0x921fb) medium = true;
    else if (ix <= 0x4002d97c) return small(1);
    else return small(2);
  } else if (ix <= 0x401c463b) {
    if (ix <= 0x4015fdbc) {
      if (ix === 0x4012d97c) medium = true;
      else return small(3);
    } else {
      if (ix === 0x401921fb) medium = true;
      else return small(4);
    }
  } else if (ix < 0x413921fb) {
    medium = true;
  }
  if (!medium) throw new Error('rem_pio2: argument out of range');
  let fn = x * invpio2 + toint - toint;
  let n = fn | 0;
  let r = x - fn * pio2_1;
  let w = fn * pio2_1t;
  if (r - w < -pio4) { n--; fn--; r = x - fn * pio2_1; w = fn * pio2_1t; }
  else if (r - w > pio4) { n++; fn++; r = x - fn * pio2_1; w = fn * pio2_1t; }
  y[0] = r - w;
  let ey = exp11(y[0]);
  const ex = ix >>> 20;
  if (ex - ey > 16) {
    let t = r;
    w = fn * pio2_2;
    r = t - w;
    w = fn * pio2_2t - ((t - r) - w);
    y[0] = r - w;
    ey = exp11(y[0]);
    if (ex - ey > 49) {
      t = r;
      w = fn * pio2_3;
      r = t - w;
      w = fn * pio2_3t - ((t - r) - w);
      y[0] = r - w;
    }
  }
  y[1] = (r - y[0]) - w;
  return n;
}

const yy: [number, number] = [0, 0];

export function xsin(x: number): number {
  const ix = hi(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) {
    if (ix < 0x3e500000) return x;
    return __sin(x, 0.0, 0);
  }
  if (ix >= 0x7ff00000) return x - x;
  if (ix >= 0x413921fb) return Math.sin(x);
  const n = remPio2(x, yy);
  switch (n & 3) {
    case 0: return __sin(yy[0], yy[1], 1);
    case 1: return __cos(yy[0], yy[1]);
    case 2: return -__sin(yy[0], yy[1], 1);
    default: return -__cos(yy[0], yy[1]);
  }
}

export function xcos(x: number): number {
  const ix = hi(x) & 0x7fffffff;
  if (ix <= 0x3fe921fb) {
    if (ix < 0x3e46a09e) return 1.0;
    return __cos(x, 0);
  }
  if (ix >= 0x7ff00000) return x - x;
  if (ix >= 0x413921fb) return Math.cos(x);
  const n = remPio2(x, yy);
  switch (n & 3) {
    case 0: return __cos(yy[0], yy[1]);
    case 1: return -__sin(yy[0], yy[1], 1);
    case 2: return -__cos(yy[0], yy[1]);
    default: return __sin(yy[0], yy[1], 1);
  }
}

const atanhi = [4.63647609000806093515e-01, 7.85398163397448278999e-01, 9.82793723247329054082e-01, 1.57079632679489655800e+00];
const atanlo = [2.26987774529616870924e-17, 3.06161699786838301793e-17, 1.39033110312309984516e-17, 6.12323399573676603587e-17];
const aT = [3.33333333333329318027e-01, -1.99999999998764832476e-01, 1.42857142725034663711e-01, -1.11111104054623557880e-01,
  9.09088713343650656196e-02, -7.69187620504482999495e-02, 6.66107313738753120669e-02, -5.83357013379057348645e-02,
  4.97687799461593236017e-02, -3.65315727442169155270e-02, 1.62858201153657823623e-02];

export function xatan(x: number): number {
  let ix = hi(x);
  const sign = ix >>> 31;
  ix &= 0x7fffffff;
  let id: number;
  if (ix >= 0x44100000) {
    if (Number.isNaN(x)) return x;
    const z = atanhi[3] + 2 ** -120;
    return sign ? -z : z;
  }
  if (ix < 0x3fdc0000) {
    if (ix < 0x3e400000) return x;
    id = -1;
  } else {
    x = Math.abs(x);
    if (ix < 0x3ff30000) {
      if (ix < 0x3fe60000) { id = 0; x = (2.0 * x - 1.0) / (2.0 + x); }
      else { id = 1; x = (x - 1.0) / (x + 1.0); }
    } else if (ix < 0x40038000) { id = 2; x = (x - 1.5) / (1.0 + 1.5 * x); }
    else { id = 3; x = -1.0 / x; }
  }
  let z = x * x;
  const w = z * z;
  const s1 = z * (aT[0] + w * (aT[2] + w * (aT[4] + w * (aT[6] + w * (aT[8] + w * aT[10])))));
  const s2 = w * (aT[1] + w * (aT[3] + w * (aT[5] + w * (aT[7] + w * aT[9]))));
  if (id < 0) return x - x * (s1 + s2);
  z = atanhi[id] - (x * (s1 + s2) - atanlo[id] - x);
  return sign ? -z : z;
}

const pi = 3.1415926535897931160E+00, pi_lo = 1.2246467991473531772E-16;

export function xatan2(y: number, x: number): number {
  if (Number.isNaN(x) || Number.isNaN(y)) return x + y;
  let ix = hi(x); const lx = lo(x);
  let iy = hi(y); const ly = lo(y);
  if (((ix - 0x3ff00000) | lx) === 0) return xatan(y);
  const m = ((iy >>> 31) & 1) | ((ix >>> 30) & 2);
  ix &= 0x7fffffff;
  iy &= 0x7fffffff;
  if ((iy | ly) === 0) {
    switch (m) {
      case 0: case 1: return y;
      case 2: return pi;
      default: return -pi;
    }
  }
  if ((ix | lx) === 0) return m & 1 ? -pi / 2 : pi / 2;
  if (ix === 0x7ff00000) {
    if (iy === 0x7ff00000) {
      switch (m) {
        case 0: return pi / 4;
        case 1: return -pi / 4;
        case 2: return 3 * pi / 4;
        default: return -3 * pi / 4;
      }
    }
    switch (m) {
      case 0: return 0.0;
      case 1: return -0.0;
      case 2: return pi;
      default: return -pi;
    }
  }
  if (ix + (64 << 20) < iy || iy === 0x7ff00000) return m & 1 ? -pi / 2 : pi / 2;
  let z: number;
  if ((m & 2) && iy + (64 << 20) < ix) z = 0;
  else z = xatan(Math.abs(y / x));
  switch (m) {
    case 0: return z;
    case 1: return -z;
    case 2: return pi - (z - pi_lo);
    default: return (z - pi_lo) - pi;
  }
}
