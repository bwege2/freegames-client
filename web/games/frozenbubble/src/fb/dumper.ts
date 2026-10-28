// The original keeps its settings and high scores as Perl source written by Data::Dumper and reads
// them back with eval (~/.frozen-bubble/rc, highscores, highscores-mptrain). The port writes the same
// text (Data::Dumper's default Indent=2 layout; hash keys sorted, as the oracle runs with
// $Data::Dumper::Sortkeys = 1 because Perl's hash order is random) and reads the subset of Perl it
// contains: `$name = value;` with numbers, quoted strings, undef, SDLK_ constants, array and hash refs.
import { KEYNAMES } from '../sdl/events.ts';

/** Perl's booleans (the result of `!`), which Data::Dumper (Perl 5.36 and later) writes as !!1 and !!0 */
export class PBool { readonly v: boolean; constructor(v: boolean) { this.v = v; } }

export type PValue = number | string | null | PBool | PValue[] | { [k: string]: PValue };

function quote(s: string): string { return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`; }

function scalar(v: number | string | null): string {
  if (v === null) return 'undef';
  if (typeof v === 'number') {
    if (Number.isInteger(v) && Math.abs(v) < 1e10 && String(v).length <= 10) return String(v);
    return quote(perlNum(v));
  }
  return quote(v);
}

function perlNum(n: number): string {
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  let s = n.toPrecision(15);
  if (s.includes('e')) {
    let [m, e] = s.split('e');
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    const ex = Number(e);
    return `${m}e${ex < 0 ? '-' : '+'}${String(Math.abs(ex)).padStart(2, '0')}`;
  }
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** a bareword written instead of a quoted string (rc: 'SDLK_LEFT' becomes SDLK_LEFT) */
export class Bare { readonly name: string; constructor(name: string) { this.name = name; } }

function dumpValue(v: PValue | Bare, pad: number): string {
  if (v instanceof Bare) return quote(v.name);
  if (v instanceof PBool) return v.v ? '!!1' : '!!0';
  if (v === null || typeof v !== 'object') return scalar(v);
  const sp = (n: number): string => ' '.repeat(n);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const inner = pad + 2;
    return `[\n${v.map((e) => sp(inner) + dumpValue(e, inner)).join(',\n')}\n${sp(pad)}]`;
  }
  const keys = Object.keys(v).sort();
  if (keys.length === 0) return '{}';
  const inner = pad + 2;
  return `{\n${keys.map((k) => {
    const lead = `${quote(k)} => `;
    return sp(inner) + lead + dumpValue((v as Record<string, PValue>)[k], inner + lead.length);
  }).join(',\n')}\n${sp(pad)}}`;
}

/** Data::Dumper->Dump([values], [names]) */
export function dump(values: (PValue | Bare)[], names: string[]): string {
  let out = '';
  values.forEach((v, i) => {
    const lead = `$${names[i]} = `;
    out += `${lead}${dumpValue(v, lead.length)};\n`;
  });
  return out;
}

/** reads `$var = value;` statements; unknown syntax stops the parse (like a failed eval) */
export function parseAssignments(src: string): Map<string, PValue> {
  const out = new Map<string, PValue>();
  let i = 0;
  const ws = (): void => {
    for (;;) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
      break;
    }
  };
  const value = (): PValue => {
    ws();
    const c = src[i];
    if (c === '[') {
      i++;
      const arr: PValue[] = [];
      for (;;) {
        ws();
        if (src[i] === ']') { i++; return arr; }
        arr.push(value());
        ws();
        if (src[i] === ',') i++;
      }
    }
    if (c === '{') {
      i++;
      const h: Record<string, PValue> = {};
      for (;;) {
        ws();
        if (src[i] === '}') { i++; return h; }
        const k = value();
        ws();
        if (src.startsWith('=>', i)) i += 2; else if (src[i] === ',') i++;
        const v = value();
        h[String(k)] = v;
        ws();
        if (src[i] === ',') i++;
      }
    }
    if (c === '!' && src[i + 1] === '!') {
      i += 2;
      const inner = value();
      return new PBool(!!inner && inner !== '0');
    }
    if (c === "'" || c === '"') {
      const q = c;
      i++;
      let s = '';
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\' && (src[i + 1] === q || src[i + 1] === '\\')) { s += src[i + 1]; i += 2; } else s += src[i++];
      }
      i++;
      return s;
    }
    const m = /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(src.slice(i, i + 40));
    if (m) { i += m[1].length; return Number(m[1]); }
    const w = /^[A-Za-z_]\w*/.exec(src.slice(i, i + 64));
    if (w) {
      i += w[0].length;
      if (w[0] === 'undef') return null;
      if (w[0].startsWith('SDLK_')) {
        // SDLK_x (a bareword constant, optionally called with ())
        if (src.startsWith('()', i)) i += 2;
        const name = w[0].slice(5);
        const v = KEYNAMES[name.toLowerCase()];
        if (v === undefined) throw new Error(`unknown key ${w[0]}`);
        return v;
      }
      throw new Error(`unknown bareword ${w[0]}`);
    }
    throw new Error(`parse error at ${i}`);
  };
  try {
    for (;;) {
      ws();
      if (i >= src.length) break;
      if (src[i] !== '$') throw new Error('expected $');
      const nm = /^\$(\w+)/.exec(src.slice(i));
      if (!nm) throw new Error('bad name');
      i += nm[0].length;
      ws();
      if (src[i] !== '=') throw new Error('expected =');
      i++;
      const v = value();
      out.set(nm[1], v);
      ws();
      if (src[i] === ';') i++;
    }
  } catch {
    // like Perl's eval: the statements before the error took effect
  }
  return out;
}
