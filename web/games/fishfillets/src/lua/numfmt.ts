// printf's %e, %f and %g as glibc does them: from the exact decimal value of the double, rounded half
// to even (JS's toExponential and toFixed round exact ties up). Lua 5.0 prints numbers with "%.14g".

/** the exact value of x > 0 as digits d (no leading or trailing zeros) and the decimal exponent of d[0] */
function exact(x: number): { d: string; e: number } {
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const bexp = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e2: number;
  if (bexp === 0) e2 = -1074;
  else { mant |= 1n << 52n; e2 = bexp - 1075; }
  let digits: string;
  let scale: number; // value = digits * 10^scale
  if (e2 >= 0) { digits = (mant << BigInt(e2)).toString(); scale = 0; } else { digits = (mant * 5n ** BigInt(-e2)).toString(); scale = e2; }
  const stripped = digits.replace(/0+$/, '');
  scale += digits.length - stripped.length;
  return { d: stripped, e: stripped.length - 1 + scale };
}

/** n significant digits, rounded half to even; returns the digits and the exponent of the first */
function round(d: string, e: number, n: number): { h: string; e: number } {
  if (n <= 0) {
    // everything is rounded away: 0, or 1 at the next power of ten
    const up = n === 0 && (d[0] > '5' || (d[0] === '5' && d.length > 1));
    return up ? { h: '1', e: e + 1 } : { h: '', e };
  }
  if (d.length <= n) return { h: d.padEnd(n, '0'), e };
  let head = d.slice(0, n);
  const rest = d.slice(n);
  let up = false;
  if (rest[0] > '5') up = true;
  else if (rest[0] === '5') up = rest.length > 1 || (head.charCodeAt(n - 1) - 48) % 2 === 1;
  if (up) {
    const inc = (BigInt(head) + 1n).toString();
    if (inc.length > n) { head = inc.slice(0, n); e++; } else head = inc;
  }
  return { h: head, e };
}

const sign = (x: number) => (x < 0 || Object.is(x, -0) ? '-' : '');

export function fmtE(x: number, prec: number, upper = false): string {
  if (!Number.isFinite(x)) return special(x, upper);
  const s = sign(x);
  x = Math.abs(x);
  let mant: string, ex: number;
  if (x === 0) { mant = '0'.repeat(prec + 1); ex = 0; } else {
    const { d, e } = exact(x);
    const r = round(d, e, prec + 1);
    mant = r.h;
    ex = r.e;
  }
  const body = prec > 0 ? `${mant[0]}.${mant.slice(1)}` : mant[0];
  const es = `${ex < 0 ? '-' : '+'}${String(Math.abs(ex)).padStart(2, '0')}`;
  return `${s}${body}${upper ? 'E' : 'e'}${es}`;
}

export function fmtF(x: number, prec: number): string {
  if (!Number.isFinite(x)) return special(x, false);
  const s = sign(x);
  x = Math.abs(x);
  let digits: string; // all digits from 10^E down to 10^-prec
  let E: number;
  if (x === 0) { digits = '0'.repeat(prec + 1); E = 0; } else {
    const { d, e } = exact(x);
    const n = e + 1 + prec;
    const r = round(d, e, n);
    E = r.e;
    digits = r.h;
    if (digits === '') { digits = '0'.repeat(prec + 1); E = 0; } else if (E < 0) {
      digits = '0'.repeat(-E) + digits;
      E = 0;
    }
    const want = E + 1 + prec;
    digits = digits.padEnd(want, '0');
  }
  const intPart = digits.slice(0, E + 1);
  const frac = digits.slice(E + 1, E + 1 + prec);
  return `${s}${intPart}${prec > 0 ? '.' + frac : ''}`;
}

export function fmtGexact(x: number, prec: number, alt = false, upper = false): string {
  if (!Number.isFinite(x)) return special(x, upper);
  const P = prec === 0 ? 1 : prec;
  let X = 0;
  if (x !== 0) {
    const { d, e } = exact(Math.abs(x));
    X = round(d, e, P).e;
  }
  let s: string;
  if (P > X && X >= -4) {
    s = fmtF(x, P - 1 - X);
    if (!alt && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  } else {
    s = fmtE(x, P - 1, upper);
    if (!alt) {
      const [m, ex] = s.split(upper ? 'E' : 'e');
      s = (m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m) + (upper ? 'E' : 'e') + ex;
    }
  }
  return s;
}

function special(x: number, upper: boolean): string {
  const s = Number.isNaN(x) ? 'nan' : x > 0 ? 'inf' : '-inf';
  return upper ? s.toUpperCase() : s;
}
