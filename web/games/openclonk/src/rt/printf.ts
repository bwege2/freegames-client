// OpenClonk port: C's printf family as glibc formats (the engine's FormatString/StdStrBuf::Format use vasprintf).
// Text is bytes (UTF-8, as the engine keeps it). Floating-point numbers are converted exactly (the double's
// binary value as a decimal, rounded half to even, like glibc), not through JavaScript's toFixed.
import { $addr } from './std.ts';

/** an argument: int (number), long long (bigint), double (number), char* (bytes, string or null) */
export type PrintfArg = number | bigint | string | Uint8Array | null;

const enc = new TextEncoder();

export function bytesOf(s: string | Uint8Array): Uint8Array {
  return typeof s === 'string' ? enc.encode(s) : s;
}

/** sprintf(fmt, args...) as bytes */
export function sprintf(fmt: string | Uint8Array, args: PrintfArg[]): Uint8Array {
  const f = bytesOf(fmt);
  const out: number[] = [];
  let ai = 0;
  const next = (): PrintfArg => {
    if (ai >= args.length) throw new Error('printf: too few arguments');
    return args[ai++];
  };
  for (let i = 0; i < f.length; i++) {
    const c = f[i];
    if (c === 0) break;
    if (c !== 37 /* % */) { out.push(c); continue; }
    i++;
    if (f[i] === 37) { out.push(37); continue; }
    // flags
    let left = false, plus = false, space = false, alt = false, zero = false;
    for (;; i++) {
      const ch = f[i];
      if (ch === 45) left = true; else if (ch === 43) plus = true; else if (ch === 32) space = true;
      else if (ch === 35) alt = true; else if (ch === 48) zero = true; else break;
    }
    // width, precision
    let width = 0, prec = -1;
    if (f[i] === 42) {
      width = Number(next()); i++;
      if (width < 0) { left = true; width = -width; }
    } else while (f[i] >= 48 && f[i] <= 57) width = width * 10 + f[i++] - 48;
    if (f[i] === 46) {
      i++;
      prec = 0;
      if (f[i] === 42) { prec = Number(next()); i++; if (prec < 0) prec = -1; } else while (f[i] >= 48 && f[i] <= 57) prec = prec * 10 + f[i++] - 48;
    }
    // length
    let len = '';
    while ('hlLqjzt'.includes(String.fromCharCode(f[i]))) len += String.fromCharCode(f[i++]);
    const conv = String.fromCharCode(f[i]);
    let body: number[];
    let sign = '';
    let numeric = true;
    switch (conv) {
      case 'd': case 'i': {
        let v = intArg(next(), len, true);
        if (v < 0n) { sign = '-'; v = -v; } else if (plus) sign = '+'; else if (space) sign = ' ';
        body = ascii(intDigits(v, 10, prec));
        break;
      }
      case 'u': case 'x': case 'X': case 'o': {
        const v = intArg(next(), len, false);
        const base = conv === 'o' ? 8 : conv === 'u' ? 10 : 16;
        let s = intDigits(v, base, prec);
        if (conv === 'X') s = s.toUpperCase();
        if (alt && conv === 'o' && s[0] !== '0') s = '0' + s;
        if (alt && v !== 0n && (conv === 'x' || conv === 'X')) sign = conv === 'x' ? '0x' : '0X';
        body = ascii(s);
        break;
      }
      case 'c':
        body = [Number(next()) & 0xff];
        numeric = false;
        break;
      case 's': {
        const a = next();
        let b = a === null ? (prec < 0 || prec >= 6 ? ascii('(null)') : []) : Array.from(bytesOf(a as string | Uint8Array));
        const z = b.indexOf(0);
        if (z >= 0) b = b.slice(0, z);
        if (prec >= 0) b = b.slice(0, prec);
        body = b;
        numeric = false;
        break;
      }
      case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
        const x = Number(next());
        const neg = signbit(x);
        if (neg) sign = '-'; else if (plus) sign = '+'; else if (space) sign = ' ';
        if (!Number.isFinite(x)) {
          const s = Number.isNaN(x) ? 'nan' : 'inf';
          body = ascii(conv === conv.toUpperCase() ? s.toUpperCase() : s);
          zero = false;
        } else {
          body = ascii(formatFloat(Math.abs(x), conv, prec < 0 ? 6 : prec, alt));
        }
        break;
      }
      case 'p': {
        // a pointer as glibc prints it: (nil), or 0x and the address in hex (an object's number from rt/std $addr;
        // a pointer into an array: the array's number plus the offset). CStdFile::Create names a file in memory so
        const a = next() as unknown as { a?: unknown; o?: unknown } | null;
        if (a == null) { body = ascii('(nil)'); numeric = false; break; }
        const at = typeof a === 'object' && 'a' in a && typeof a.o === 'number' ? $addr(a.a) + a.o : $addr(a);
        body = ascii('0x' + at.toString(16));
        numeric = false;
        break;
      }
      default:
        throw new Error(`printf: conversion %${conv} not supported`);
    }
    // integer precision disables the 0 flag
    if ((conv === 'd' || conv === 'i' || conv === 'u' || conv === 'x' || conv === 'X' || conv === 'o') && prec >= 0) zero = false;
    const pre = ascii(sign);
    const pad = width - pre.length - body.length;
    if (pad > 0 && left) out.push(...pre, ...body, ...Array(pad).fill(32));
    else if (pad > 0 && zero && numeric) out.push(...pre, ...Array(pad).fill(48), ...body);
    else if (pad > 0) out.push(...Array(pad).fill(32), ...pre, ...body);
    else out.push(...pre, ...body);
  }
  return Uint8Array.from(out);
}

function signbit(x: number): boolean {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x);
  return (dv.getUint8(0) & 0x80) !== 0;
}

function ascii(s: string): number[] {
  const r: number[] = [];
  for (let i = 0; i < s.length; i++) r.push(s.charCodeAt(i));
  return r;
}

function intArg(a: PrintfArg, len: string, signed: boolean): bigint {
  const v = typeof a === 'bigint' ? a : BigInt(Math.trunc(Number(a)));
  const bits = len === 'hh' ? 8 : len === 'h' ? 16 : len === '' ? 32 : 64;
  return signed ? BigInt.asIntN(bits, v) : BigInt.asUintN(bits, v);
}

function intDigits(v: bigint, base: number, prec: number): string {
  if (prec === 0 && v === 0n) return '';
  const s = v.toString(base);
  return prec > s.length ? '0'.repeat(prec - s.length) + s : s;
}

/** x >= 0 finite: its exact value D / 10^k */
function exact(x: number): [bigint, number] {
  if (x === 0) return [0n, 0];
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, x);
  const hi = dv.getUint32(0), lo = dv.getUint32(4);
  const be = (hi >>> 20) & 0x7ff;
  let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e: number;
  if (be === 0) e = -1074; else { m |= 1n << 52n; e = be - 1075; }
  if (e >= 0) return [m << BigInt(e), 0];
  return [m * 5n ** BigInt(-e), -e];
}

/** D / 10^shift rounded half to even (shift may be negative: a multiplication) */
function roundDiv(d: bigint, shift: number): bigint {
  if (shift <= 0) return d * 10n ** BigInt(-shift);
  const p = 10n ** BigInt(shift);
  const q = d / p, r = d % p;
  const twice = r * 2n;
  if (twice > p || (twice === p && (q & 1n) === 1n)) return q + 1n;
  return q;
}

function fixed(d: bigint, k: number, prec: number, alt: boolean): string {
  const q = roundDiv(d, k - prec).toString();
  if (prec === 0) return q + (alt ? '.' : '');
  const s = q.length <= prec ? '0'.repeat(prec - q.length + 1) + q : q;
  return s.slice(0, s.length - prec) + '.' + s.slice(s.length - prec);
}

/** the digits (prec + 1 of them) and decimal exponent of %e */
function sci(d: bigint, k: number, prec: number): [string, number] {
  if (d === 0n) return ['0'.repeat(prec + 1), 0];
  let exp = d.toString().length - 1 - k;
  let q = roundDiv(d, k + exp - prec);
  if (q.toString().length > prec + 1) { exp += 1; q /= 10n; }
  return [q.toString(), exp];
}

function expStr(e: number, upper: boolean): string {
  const a = Math.abs(e);
  return (upper ? 'E' : 'e') + (e < 0 ? '-' : '+') + (a < 10 ? '0' + a : String(a));
}

function formatFloat(x: number, conv: string, prec: number, alt: boolean): string {
  const [d, k] = exact(x);
  const upper = conv === conv.toUpperCase();
  if (conv === 'f' || conv === 'F') return fixed(d, k, prec, alt);
  if (conv === 'e' || conv === 'E') {
    const [ds, e] = sci(d, k, prec);
    return ds[0] + (prec > 0 || alt ? '.' : '') + ds.slice(1) + expStr(e, upper);
  }
  // %g
  const P = prec === 0 ? 1 : prec;
  const [, X] = sci(d, k, P - 1);
  const X0 = d === 0n ? 0 : d.toString().length - 1 - k;   // the exponent before rounding
  let s: string;
  if (X === P && X0 < P && X0 >= -4) {
    // glibc: chosen as %f by the unrounded exponent, the rounding carried to 10^P: %e with no fraction digits
    const [ds, e] = sci(d, k, 0);
    s = ds[0] + (alt ? '.' : '') + expStr(e, upper);
  } else if (P > X && X >= -4) {
    s = fixed(d, k, P - 1 - X, alt);
    if (!alt && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  } else {
    const [ds, e] = sci(d, k, P - 1);
    let m = ds[0] + (P - 1 > 0 || alt ? '.' : '') + ds.slice(1);
    if (!alt && m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    s = m + expStr(e, upper);
  }
  return s;
}
