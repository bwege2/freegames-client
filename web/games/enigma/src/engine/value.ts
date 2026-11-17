// Enigma's Value (Value.cc): the attribute and message values. DEFAULT = undefined, NIL = null, BOOL,
// DOUBLE, STRING, OBJECT (by id, or by name for named objects), GROUP and TOKENS (descriptor strings as
// in the original), POSITION and GRIDPOS.

export class VObj { id: number; name: string | null; constructor(id: number, name: string | null) { this.id = id; this.name = name; } }
export class VGroup { desc: string; constructor(desc: string) { this.desc = desc; } }
export class VTokens { desc: string; constructor(desc: string) { this.desc = desc; } }
export class VPos {
  x: number; y: number; grid: boolean;
  constructor(x: number, y: number, grid: boolean) { this.x = x; this.y = y; this.grid = grid; }
}

export type Value = undefined | null | boolean | number | string | VObj | VGroup | VTokens | VPos;

export const VT = { DEFAULT: 0, NIL: 1, BOOL: 2, DOUBLE: 3, STRING: 4, OBJECT: 5, GROUP: 6, POSITION: 7, GRIDPOS: 8, TOKENS: 9 } as const;
export type VT = typeof VT[keyof typeof VT];

export function vtype(v: Value): VT {
  if (v === undefined) return VT.DEFAULT;
  if (v === null) return VT.NIL;
  switch (typeof v) {
    case 'boolean': return VT.BOOL;
    case 'number': return VT.DOUBLE;
    case 'string': return VT.STRING;
  }
  if (v instanceof VObj) return VT.OBJECT;
  if (v instanceof VGroup) return VT.GROUP;
  if (v instanceof VTokens) return VT.TOKENS;
  return (v as VPos).grid ? VT.GRIDPOS : VT.POSITION;
}

/** `if (Value v = ...)`: everything but DEFAULT */
export function vexists(v: Value): boolean { return v !== undefined; }

export function toBool(v: Value): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  return true;
}

export function roundNearest(v: number): number { return v > 0 ? Math.floor(v + 0.5) : -Math.floor(-v + 0.5); }

/** strtol(s, NULL, 0) */
function strtol0(s: string): number {
  const m = /^\s*([+-]?)(0[xX][0-9a-fA-F]+|0[0-7]*|[1-9][0-9]*)/.exec(s);
  if (!m) return 0;
  let n: number;
  const body = m[2];
  if (/^0[xX]/.test(body)) n = parseInt(body.slice(2), 16);
  else if (body.length > 1 && body[0] === '0') n = parseInt(body, 8);
  else n = parseInt(body, 10);
  n = n | 0;
  return m[1] === '-' ? -n : n;
}

export function toDouble(v: Value): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') { const m = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(v); return m ? Number(m[0]) : 0; }
  return 0;
}

export function toInt(v: Value): number {
  if (typeof v === 'number') return roundNearest(v) | 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') return v[0] === '%' ? strtol0(v.slice(1)) : strtol0(v);
  return 0;
}

/** operator const char* / to_string: DOUBLE is "%g" */
export function toStr(v: Value): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return fmtGShort(v);
  return '';
}

export function fmtGShort(n: number): string {
  if (!isFinite(n)) return n !== n ? 'nan' : n > 0 ? 'inf' : '-inf';
  if (n === 0) return Object.is(n, -0) ? '-0' : '0';
  const ex = n.toExponential(5);
  const X = Number(/e([+-]\d+)$/.exec(ex)![1]);
  if (X < -4 || X >= 6) {
    let mant = ex.slice(0, ex.indexOf('e')).replace(/\.?0+$/, '');
    const e = Math.abs(X);
    return mant + 'e' + (X < 0 ? '-' : '+') + (e < 10 ? '0' + e : String(e));
  }
  return n.toFixed(Math.max(0, 5 - X)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export function valueEquals(a: Value, b: Value): boolean {
  const ta = vtype(a), tb = vtype(b);
  // NAMEDOBJECT and OBJECT are different internal types
  if (ta !== tb) return false;
  switch (ta) {
    case VT.DOUBLE: case VT.BOOL: return Number(a) === Number(b);
    case VT.OBJECT: {
      const x = a as VObj, y = b as VObj;
      if ((x.name === null) !== (y.name === null)) return false;
      return x.name !== null ? x.name === y.name : x.id === y.id;
    }
    case VT.STRING: return a === b;
    case VT.GROUP: return (a as VGroup).desc === (b as VGroup).desc;
    case VT.TOKENS: return (a as VTokens).desc === (b as VTokens).desc;
    case VT.POSITION: case VT.GRIDPOS: return (a as VPos).x === (b as VPos).x && (a as VPos).y === (b as VPos).y;
  }
  return true;
}

/** the tokens of a TOKENS value (operator TokenList) */
export function toTokenList(v: Value): Value[] {
  switch (vtype(v)) {
    case VT.OBJECT: case VT.STRING: case VT.GROUP: case VT.POSITION: case VT.GRIDPOS: return [v];
    case VT.TOKENS: {
      const out: Value[] = [];
      for (const s of (v as VTokens).desc.split(';')) {
        if (s.length === 0) continue;
        if (s[0] === '#') out.push(new VObj(parseInt(s.slice(1), 10) || 0, null));
        else if (s[0] === '%') out.push(new VGroup(s.slice(1)));
        else out.push(s);
      }
      return out;
    }
  }
  return [];
}

/** Value(TokenList) */
export function makeTokens(list: Value[]): VTokens {
  let d = '';
  for (const t of list) {
    if (typeof t === 'string') { if (t === '') throw new Error('TokenList: illegal empty string value'); d += t; }
    else if (t instanceof VObj) d += t.name !== null ? t.name : `#${t.id}`;
    else if (t instanceof VGroup) d += '%' + t.desc;
    else throw new Error('TokenList: illegal value type');
    d += ';';
  }
  return new VTokens(d);
}
