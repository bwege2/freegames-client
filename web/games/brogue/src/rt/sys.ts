// The rest of the C library as Brogue uses it: the clock (the platform's; the oracle fixes it), exit,
// qsort (glibc's merge sort, comparison for comparison), the maths functions. From the NetHack port's
// runtime (web/games/nethack/src/rt/sys.ts).
import { Ptr } from './ptr.ts';
import { jstr, putstr } from './cstring.ts';
import { Exit, platform } from './platform.ts';

// ---- the clock ----
export function time(t: Ptr | null): number {
  const v = platform().time();
  if (t) t.a[t.o] = v;
  return v;
}

const tmStatic: any = {};

/** localtime(), in UTC (the oracle runs with TZ=UTC; the browser's host gives its local time) */
export function localtime(t: Ptr): any {
  const v = t.a[t.o];
  const local = !!platform().localTime;
  const d = new Date(v * 1000);
  const y = local ? d.getFullYear() : d.getUTCFullYear();
  const start = local ? new Date(y, 0, 1) : new Date(Date.UTC(y, 0, 1));
  Object.assign(tmStatic, {
    tm_sec: local ? d.getSeconds() : d.getUTCSeconds(),
    tm_min: local ? d.getMinutes() : d.getUTCMinutes(),
    tm_hour: local ? d.getHours() : d.getUTCHours(),
    tm_mday: local ? d.getDate() : d.getUTCDate(),
    tm_mon: local ? d.getMonth() : d.getUTCMonth(),
    tm_year: y - 1900,
    tm_wday: local ? d.getDay() : d.getUTCDay(),
    tm_yday: Math.floor((d.getTime() - start.getTime()) / 86400000),
    tm_isdst: 0,
  });
  return tmStatic;
}

export function mktime(tm: any): number {
  const ms = platform().localTime
    ? new Date(tm.tm_year + 1900, tm.tm_mon, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec).getTime()
    : Date.UTC(tm.tm_year + 1900, tm.tm_mon, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);
  return Math.floor(ms / 1000);
}

export function difftime(a: number, b: number): number {
  return a - b;
}

/** strftime for the formats Brogue uses (%Y %m %d %H %M %S %y) */
export function strftime(buf: Ptr, max: number, fmt: Ptr, tm: any): number {
  const f = jstr(fmt);
  const two = (n: number) => String(n).padStart(2, '0');
  let out = '';
  for (let i = 0; i < f.length; i++) {
    if (f[i] !== '%') {
      out += f[i];
      continue;
    }
    const c = f[++i];
    if (c === 'Y') out += String(tm.tm_year + 1900);
    else if (c === 'y') out += two((tm.tm_year + 1900) % 100);
    else if (c === 'm') out += two(tm.tm_mon + 1);
    else if (c === 'd') out += two(tm.tm_mday);
    else if (c === 'H') out += two(tm.tm_hour);
    else if (c === 'M') out += two(tm.tm_min);
    else if (c === 'S') out += two(tm.tm_sec);
    else if (c === '%') out += '%';
    else throw new Error(`strftime: %${c}`);
  }
  if (out.length + 1 > max) return 0;
  putstr(buf, out);
  return out.length;
}

// ---- the process ----
export function getenv(_name: Ptr): Ptr | null {
  return null;
}

const exitHandlers: (() => any)[] = [];

export function atexit(f: () => any): number {
  exitHandlers.push(f);
  return 0;
}

export function resetSys(): void {
  exitHandlers.length = 0;
}

export function exit(status: number): never {
  while (exitHandlers.length) exitHandlers.pop()!();
  throw new Exit(status);
}

export function abort(): never {
  throw new Error('abort()');
}

export function free(_p: any): void {}

// ---- qsort: glibc's merge sort (msort_with_tmp: halves of n/2 and n - n/2), comparison for comparison ----
function msort(items: any[], cmp: (a: any, b: any) => number): any[] {
  const n = items.length;
  if (n <= 1) return items;
  const n1 = n >> 1;
  const left = msort(items.slice(0, n1), cmp);
  const right = msort(items.slice(n1), cmp);
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (cmp(left[i], right[j]) <= 0) out.push(left[i++]);
    else out.push(right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

export function qsort(base: any, n: number, _size: number, cmp: (a: any, b: any) => number): void {
  if (n < 2) return;
  if (base instanceof Ptr && (ArrayBuffer.isView(base.a) || !(base.a[base.o] && typeof base.a[base.o] === 'object' && base.a[base.o].$cp))) {
    // numbers or pointers: the comparator gets pointers to the elements
    const a = base.a;
    const cells = [];
    for (let i = 0; i < n; i++) cells.push(new Ptr([a[base.o + i]], 0));
    const sorted = msort(cells, cmp);
    for (let i = 0; i < n; i++) a[base.o + i] = sorted[i].a[0];
    return;
  }
  // an array of structs: the slots stay, their contents move
  const arr = base instanceof Ptr ? base.a : base.$a;
  const start = base instanceof Ptr ? base.o : base.$i;
  const copies = [];
  for (let i = 0; i < n; i++) copies.push(arr[start + i].$clone());
  const sorted = msort(copies, cmp);
  for (let i = 0; i < n; i++) arr[start + i].$cp(sorted[i]);
}

// ---- maths (libm; Brogue uses them for colours on the screen only) ----
export const sin = Math.sin;
export const cos = Math.cos;
export const sqrt = Math.sqrt;

/** lround: half away from zero */
export function lround(x: number): number {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

export function llabs(x: number): number {
  return Math.abs(x);
}
