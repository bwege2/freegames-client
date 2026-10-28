// printf and scanf as glibc does them, for the formats NetHack uses.
import { Ptr } from './ptr.ts';
import { isspace, jstr, putstr } from './cstring.ts';

/** a va_list: the variadic arguments of a call, read one by one */
export class VaList {
  args: any[];
  i = 0;
  constructor(args: any[]) {
    this.args = args;
  }
  next(): any {
    return this.args[this.i++];
  }
  copy(): VaList {
    const v = new VaList(this.args);
    v.i = this.i;
    return v;
  }
}

function pad(s: string, width: number, left: boolean, zero: boolean): string {
  if (s.length >= width) return s;
  if (left) return s + ' '.repeat(width - s.length);
  if (zero) {
    const sign = s[0] === '-' || s[0] === '+' || s[0] === ' ' ? s[0] : '';
    const body = sign ? s.slice(1) : s;
    let pre = '';
    if (body.startsWith('0x') || body.startsWith('0X')) {
      pre = body.slice(0, 2);
      return sign + pre + '0'.repeat(width - s.length) + body.slice(2);
    }
    return sign + '0'.repeat(width - s.length) + body;
  }
  return ' '.repeat(width - s.length) + s;
}

function num(v: any): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v == null) return 0;
  return 1;
}

function unsigned(v: number, long: boolean): number {
  if (v >= 0) return v;
  return long ? v + 18446744073709551616 : (v >>> 0);
}

/** the text of printf(fmt, args...) */
export function format(fmt: string, next: () => any): string {
  let out = '';
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') {
      out += ch;
      continue;
    }
    i++;
    let left = false, zero = false, plus = false, space = false, alt = false;
    for (;; i++) {
      const f = fmt[i];
      if (f === '-') left = true;
      else if (f === '0') zero = true;
      else if (f === '+') plus = true;
      else if (f === ' ') space = true;
      else if (f === '#') alt = true;
      else break;
    }
    let width = 0;
    if (fmt[i] === '*') {
      width = num(next());
      if (width < 0) {
        left = true;
        width = -width;
      }
      i++;
    } else while (fmt[i] >= '0' && fmt[i] <= '9') width = width * 10 + (fmt.charCodeAt(i++) - 48);
    let prec = -1;
    if (fmt[i] === '.') {
      i++;
      prec = 0;
      if (fmt[i] === '*') {
        prec = num(next());
        i++;
      } else while (fmt[i] >= '0' && fmt[i] <= '9') prec = prec * 10 + (fmt.charCodeAt(i++) - 48);
    }
    let long = false;
    while ('hlLqjzt'.includes(fmt[i])) {
      if (fmt[i] === 'l' || fmt[i] === 'L' || fmt[i] === 'q' || fmt[i] === 'j' || fmt[i] === 'z') long = true;
      i++;
    }
    const conv = fmt[i];
    let s = '';
    switch (conv) {
      case '%':
        out += '%';
        continue;
      case 'd':
      case 'i': {
        let v = num(next());
        if (!long) v |= 0;
        s = Math.abs(v).toString();
        if (prec >= 0) {
          s = s.padStart(prec, '0');
          if (prec === 0 && v === 0) s = '';
          zero = false;
        }
        s = (v < 0 ? '-' : plus ? '+' : space ? ' ' : '') + s;
        break;
      }
      case 'u':
      case 'x':
      case 'X':
      case 'o': {
        let v = unsigned(num(next()), long);
        if (!long) v = v >>> 0;
        s = conv === 'u' ? v.toString() : conv === 'o' ? v.toString(8) : v.toString(16);
        if (conv === 'X') s = s.toUpperCase();
        if (prec >= 0) {
          s = s.padStart(prec, '0');
          if (prec === 0 && v === 0) s = '';
          zero = false;
        }
        if (alt && v !== 0) s = (conv === 'o' ? '0' : conv === 'x' ? '0x' : conv === 'X' ? '0X' : '') + s;
        break;
      }
      case 'c':
        s = String.fromCharCode(num(next()) & 255);
        break;
      case 's': {
        const v = next();
        s = typeof v === 'string' ? v : v instanceof Ptr ? jstr(v, prec >= 0 ? prec : Infinity) : '(null)';
        if (prec >= 0) s = s.slice(0, prec);
        zero = false;
        break;
      }
      case 'p': {
        const v = next();
        s = v ? '0x1' : '(nil)';
        break;
      }
      case 'f':
      case 'F':
      case 'e':
      case 'E':
      case 'g':
      case 'G': {
        const v = num(next());
        const p = prec < 0 ? 6 : prec;
        if (conv === 'f' || conv === 'F') s = v.toFixed(p);
        else if (conv === 'e' || conv === 'E') {
          s = v.toExponential(p).replace(/e([+-])(\d)$/, 'e$10$2');
          if (conv === 'E') s = s.toUpperCase();
        } else {
          const P = p === 0 ? 1 : p;
          const exp = v === 0 ? 0 : Math.floor(Math.log10(Math.abs(v)));
          if (exp < -4 || exp >= P) s = v.toExponential(P - 1).replace(/e([+-])(\d)$/, 'e$10$2');
          else s = v.toFixed(Math.max(0, P - 1 - exp));
          if (!alt && s.includes('.')) s = s.replace(/\.?0+(e|$)/, '$1');
        }
        if (v >= 0 && plus) s = '+' + s;
        else if (v >= 0 && space) s = ' ' + s;
        break;
      }
      default:
        s = '%' + (conv ?? '');
    }
    out += pad(s, width, left, zero);
  }
  return out;
}

/** the arguments as a function that hands them out */
function argsOf(args: any[] | VaList): () => any {
  if (args instanceof VaList) return () => args.next();
  let k = 0;
  return () => args[k++];
}

export function sprintf(buf: Ptr, fmt: Ptr, ...args: any[]): number {
  const s = format(jstr(fmt), argsOf(args));
  putstr(buf, s);
  return s.length;
}

export function vsprintf(buf: Ptr, fmt: Ptr, ap: VaList): number {
  return sprintf(buf, fmt, ap as any);
}

export function snprintf(buf: Ptr, n: number, fmt: Ptr, ...args: any[]): number {
  const s = format(jstr(fmt), argsOf(args.length === 1 && args[0] instanceof VaList ? args[0] : args));
  if (n > 0) putstr(buf, s.slice(0, n - 1));
  return s.length;
}

export function vsnprintf(buf: Ptr, n: number, fmt: Ptr, ap: VaList): number {
  const s = format(jstr(fmt), argsOf(ap));
  if (n > 0) putstr(buf, s.slice(0, n - 1));
  return s.length;
}

// sprintf's own handling of a VaList passed as the only argument (vsprintf through sprintf)
const _sprintf = sprintf;
export { _sprintf };

/** scanf on the text s: returns [conversions assigned (or -1), characters consumed] */
export function scan(s: string, fmt: string, args: any[]): [number, number] {
  let si = 0, n = 0, k = 0;
  const store = (p: any, v: any) => {
    if (p instanceof Ptr) p.a[p.o] = v;
  };
  for (let fi = 0; fi < fmt.length; fi++) {
    const f = fmt[fi];
    if (isspace(f.charCodeAt(0))) {
      while (si < s.length && isspace(s.charCodeAt(si))) si++;
      continue;
    }
    if (f !== '%') {
      if (s[si] !== f) return [n === 0 && si >= s.length ? -1 : n, si];
      si++;
      continue;
    }
    fi++;
    let skip = false;
    if (fmt[fi] === '*') {
      skip = true;
      fi++;
    }
    let width = 0;
    while (fmt[fi] >= '0' && fmt[fi] <= '9') width = width * 10 + (fmt.charCodeAt(fi++) - 48);
    while ('hlLqjz'.includes(fmt[fi])) fi++;
    const conv = fmt[fi];
    if (conv === '%') {
      while (si < s.length && isspace(s.charCodeAt(si))) si++;
      if (s[si] !== '%') return [n, si];
      si++;
      continue;
    }
    if (conv !== 'c' && conv !== '[') while (si < s.length && isspace(s.charCodeAt(si))) si++;
    if (si >= s.length) return [n === 0 ? -1 : n, si];
    const max = width || Infinity;
    if (conv === 'd' || conv === 'i' || conv === 'u' || conv === 'x' || conv === 'X' || conv === 'o') {
      const base = conv === 'x' || conv === 'X' ? 16 : conv === 'o' ? 8 : 10;
      let j = si, txt = '';
      if ((s[j] === '-' || s[j] === '+') && j - si < max) txt += s[j++];
      if (base === 16 && s[j] === '0' && (s[j + 1] === 'x' || s[j + 1] === 'X') && j + 2 - si <= max) j += 2;
      while (j < s.length && j - si < max && !Number.isNaN(parseInt(s[j], base)) && parseInt(s[j], base) < base) txt += s[j++];
      if (!/[0-9a-fA-F]/.test(txt)) return [n, si];
      si = j;
      if (!skip) {
        store(args[k++], parseInt(txt, base));
        n++;
      }
    } else if (conv === 's') {
      let j = si;
      while (j < s.length && j - si < max && !isspace(s.charCodeAt(j))) j++;
      if (!skip) {
        putstr(args[k++], s.slice(si, j));
        n++;
      }
      si = j;
    } else if (conv === 'c') {
      const w = width || 1;
      if (!skip) {
        const p = args[k++];
        for (let q = 0; q < w; q++) p.a[p.o + q] = s.charCodeAt(si + q);
        n++;
      }
      si += w;
    } else if (conv === '[') {
      fi++;
      let neg = false;
      if (fmt[fi] === '^') {
        neg = true;
        fi++;
      }
      let set = '';
      if (fmt[fi] === ']') set += fmt[fi++];
      while (fi < fmt.length && fmt[fi] !== ']') set += fmt[fi++];
      let j = si;
      while (j < s.length && j - si < max && (set.includes(s[j]) !== neg)) j++;
      if (j === si) return [n, si];
      if (!skip) {
        putstr(args[k++], s.slice(si, j));
        n++;
      }
      si = j;
    } else return [n, si];
  }
  return [n, si];
}

export function sscanf(str: Ptr, fmt: Ptr, ...args: any[]): number {
  return scan(jstr(str), jstr(fmt), args)[0];
}
