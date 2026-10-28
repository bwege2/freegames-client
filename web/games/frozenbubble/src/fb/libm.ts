// sin and cos exactly as glibc's baseline (non-FMA) x86_64 libm computes them
// (sysdeps/ieee754/dbl-64/s_sin.c, IBM Accurate Mathematical Library, glibc 2.28 and later). Perl's
// sin/cos and the C extension call libm; V8's Math.sin/cos differ from it by an ulp for about 5 % of
// arguments, enough to change a bubble's path over a game. |x| < 105414350 only (the game never
// goes beyond); larger arguments fall back to Math.
import { SINCOSTAB_HEX } from './sincostab.ts';

const view = new DataView(new ArrayBuffer(8));
function fromHex(h: string): number {
  view.setUint32(0, parseInt(h.slice(0, 8), 16));
  view.setUint32(4, parseInt(h.slice(8), 16));
  return view.getFloat64(0);
}
const TAB = Float64Array.from(SINCOSTAB_HEX, fromHex);

function hi(x: number): number { view.setFloat64(0, x); return view.getUint32(0) | 0; }
function lo(x: number): number { view.setFloat64(0, x); return view.getUint32(4) | 0; }

const s1 = fromHex('bfc5555555555555'), s2 = fromHex('3f81111111110ece'), s3 = fromHex('bf2a01a019db08b8');
const s4 = fromHex('3ec71de27b9a7ed9'), s5 = fromHex('be5addffc2fcdf59');
const big = 52776558133248, hp0 = fromHex('3ff921fb54442d18'), hp1 = fromHex('3c91a62633145c07');
const mp1 = fromHex('3ff921fb58000000'), mp2 = fromHex('be4dde973c000000');
const pp3 = fromHex('bc8cb3b398000000'), pp4 = fromHex('bacd747f23e32ed7');
const hpinv = fromHex('3fe45f306dc9c883'), toint = 6755399441055744;
const sn3 = -1.66666666666664880952546298448555E-01, sn5 = 8.33333214285722277379541354343671E-03;
const cs2 = 4.99999999999999999999950396842453E-01, cs4 = -4.16666666666664434524222570944589E-02;
const cs6 = 1.38888874007937613028114285595617E-03;

const copysign = (a: number, b: number): number => ((b < 0 || Object.is(b, -0)) ? -Math.abs(a) : Math.abs(a));

function taylorSin(xx: number, x: number, dx: number): number {
  const poly = ((((s5 * xx + s4) * xx + s3) * xx + s2) * xx) + s1;
  const t = ((poly * x - 0.5 * dx) * xx + dx);
  return x + t;
}

function doCos(x: number, dx: number): number {
  if (x < 0) dx = -dx;
  const ux = big + Math.abs(x);
  x = Math.abs(x) - (ux - big) + dx;
  const xx = x * x;
  const s = x + x * xx * (sn3 + xx * sn5);
  const c = xx * (cs2 + xx * (cs4 + xx * cs6));
  const k = lo(ux) << 2;
  const sn = TAB[k], ssn = TAB[k + 1], cs = TAB[k + 2], ccs = TAB[k + 3];
  const cor = (ccs - s * ssn - cs * c) - sn * s;
  return cs + cor;
}

function doSin(x: number, dx: number): number {
  const xold = x;
  if (Math.abs(x) < 0.126) return taylorSin(x * x, x, dx);
  if (x <= 0) dx = -dx;
  const ux = big + Math.abs(x);
  x = Math.abs(x) - (ux - big);
  const xx = x * x;
  const s = x + (dx + x * xx * (sn3 + xx * sn5));
  const c = x * dx + xx * (cs2 + xx * (cs4 + xx * cs6));
  const k = lo(ux) << 2;
  const sn = TAB[k], ssn = TAB[k + 1], cs = TAB[k + 2], ccs = TAB[k + 3];
  const cor = (ssn + s * ccs - sn * c) + cs * s;
  return copysign(sn + cor, xold);
}

function reduce(x: number): [number, number, number] {
  const t = (x * hpinv + toint);
  const xn = t - toint;
  const y = (x - xn * mp1) - xn * mp2;
  const n = lo(t) & 3;
  let t1 = xn * pp3;
  const t2 = y - t1;
  let db = (y - t2) - t1;
  t1 = xn * pp4;
  const b = t2 - t1;
  db += (t2 - b) - t1;
  return [b, db, n];
}

function doSincos(a: number, da: number, n: number): number {
  const r = n & 1 ? doCos(a, da) : doSin(a, da);
  return n & 2 ? -r : r;
}

export function sin(x: number): number {
  const k = hi(x) & 0x7fffffff;
  if (k < 0x3e500000) return x;
  if (k < 0x3feb6000) return doSin(x, 0);
  if (k < 0x400368fd) return copysign(doCos(hp0 - Math.abs(x), hp1), x);
  if (k < 0x419921fb) { const [a, da, n] = reduce(x); return doSincos(a, da, n); }
  return Math.sin(x);
}

export function cos(x: number): number {
  const k = hi(x) & 0x7fffffff;
  if (k < 0x3e400000) return 1.0;
  if (k < 0x3feb6000) return doCos(x, 0);
  if (k < 0x400368fd) {
    const y = hp0 - Math.abs(x);
    const a = y + hp1;
    const da = (y - a) + hp1;
    return doSin(a, da);
  }
  if (k < 0x419921fb) { const [a, da, n] = reduce(x); return doSincos(a, da, n + 1); }
  return Math.cos(x);
}
