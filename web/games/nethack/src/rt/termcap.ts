// The terminal entry: an 80x24 VT100 without colours, the same entry as the oracle's (stub.c).
// host.ts shows what the game writes with these sequences on the SDK's TextScreen.
import { Ptr } from './ptr.ts';
import { cstr, jstr, putstr } from './cstring.ts';

const STRCAPS: Record<string, string> = {
  cl: '\x1b[H\x1b[J', ce: '\x1b[K', cd: '\x1b[J', cm: '\x1b[%i%d;%dH', ho: '\x1b[H', nd: '\x1b[C',
  up: '\x1b[A', le: '\b', do: '\n', so: '\x1b[7m', se: '\x1b[m', us: '\x1b[4m', ue: '\x1b[m',
  md: '\x1b[1m', mr: '\x1b[7m', mb: '\x1b[5m', me: '\x1b[m',
};

export function tgetent(_bp: any, _name: Ptr): number {
  return 1;
}

export function tgetnum(id: Ptr): number {
  const s = jstr(id);
  if (s === 'co') return 80;
  if (s === 'li') return 24;
  return -1;
}

export function tgetflag(id: Ptr): number {
  const s = jstr(id);
  return s === 'am' || s === 'xn' || s === 'bs' ? 1 : 0;
}

/** tgetstr(id, &area): the capability copied to *area (which moves on), or a new string */
export function tgetstr(id: Ptr, area: Ptr | null): Ptr | null {
  const v = STRCAPS[jstr(id)];
  if (v === undefined) return null;
  if (area && area.a[area.o]) {
    const dst: Ptr = area.a[area.o];
    putstr(dst, v);
    area.a[area.o] = dst.add(v.length + 1);
    return dst;
  }
  return cstr(v);
}

const gotoBuf = new Ptr(new Int8Array(64), 0);

export function tgoto(cap: Ptr, col: number, row: number): Ptr {
  const s = jstr(cap);
  const args = [row, col];
  let n = 0, out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '%') {
      out += s[i];
      continue;
    }
    const c = s[++i];
    if (c === 'i') {
      args[0]++;
      args[1]++;
    } else if (c === 'd') out += String(args[n++ & 1]);
    else if (c === '.') out += String.fromCharCode(args[n++ & 1]);
    else if (c === '%') out += '%';
    else return cstr('OOPS');
  }
  putstr(gotoBuf, out);
  return gotoBuf;
}

/** writes str with putc, without terminfo's padding ($<..>) */
export function tputs(str: Ptr | null, _affcnt: number, putc: (c: number) => any): number {
  if (!str) return -1;
  const a = str.a;
  for (let i = str.o; a[i]; ) {
    if (a[i] === 36 && a[i + 1] === 60) {
      let j = i + 2;
      while (a[j] && a[j] !== 62) j++;
      if (a[j] === 62) {
        i = j + 1;
        continue;
      }
    }
    putc(a[i] & 255);
    i++;
  }
  return 0;
}

export function tparm(_s: Ptr, ..._a: any[]): Ptr {
  return cstr('');
}

export function has_colors(): number {
  return 0;
}
