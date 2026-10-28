// The rest of the C library and Unix as the game sees them: the clock, the user, the terminal's
// settings, keys, sleeping, exit, qsort and POSIX regular expressions. The oracle's stub.c fixes the same
// things to the same values (uid 1000, pid 4242, a Linux console's tty settings).
import { Ptr } from './ptr.ts';
import { cstr, jstr, putstr } from './cstring.ts';
import { R, termTake } from './fs.ts';
import { Exit, platform } from './platform.ts';

// ---- keys and time passing ----
export async function getchar(): Promise<number> {
  return platform().getKey(termTake());
}

export async function fgetc(f: any): Promise<number> {
  if (f === R.stdin) return getchar();
  return f.getByte();
}

export const getc = fgetc;

export async function usleep(us: number): Promise<number> {
  await platform().delay(us / 1000, termTake());
  return 0;
}

export async function sleep(s: number): Promise<number> {
  await platform().delay(s * 1000, termTake());
  return 0;
}

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
  const p: any = platform();
  const d = new Date(v * 1000);
  const local = !!p.localTime;
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
  const p: any = platform();
  const ms = p.localTime
    ? new Date(tm.tm_year + 1900, tm.tm_mon, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec).getTime()
    : Date.UTC(tm.tm_year + 1900, tm.tm_mon, tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);
  return Math.floor(ms / 1000);
}

// ---- the user and the process ----
export function getuid(): number { return 1000; }
export function geteuid(): number { return 1000; }
export function getgid(): number { return 1000; }
export function getegid(): number { return 1000; }
export function setuid(_u: number): number { return 0; }
export function setgid(_g: number): number { return 0; }
export function getpid(): number { return 4242; }

const envCache = new Map<string, Ptr>();

export function getenv(name: Ptr): Ptr | null {
  const n = jstr(name);
  const env: Record<string, string> = { TERM: 'vt100', HOME: '/nethack', USER: platform().login(), LOGNAME: platform().login() };
  const v = env[n];
  if (v === undefined) return null;
  const key = n + '=' + v;
  let p = envCache.get(key);
  if (!p) {
    p = cstr(v);
    envCache.set(key, p);
  }
  return p;
}

let loginPtr: Ptr | null = null;
let loginName = '';

export function getlogin(): Ptr {
  const l = platform().login();
  if (!loginPtr || loginName !== l) {
    loginPtr = cstr(l);
    loginName = l;
  }
  return loginPtr;
}

const pw: any = {};

export function getpwuid(uid: number): any {
  if (uid !== 1000) return null;
  Object.assign(pw, { pw_name: getlogin(), pw_passwd: cstr('x'), pw_uid: 1000, pw_gid: 1000, pw_gecos: getlogin(), pw_dir: cstr('.'), pw_shell: cstr('/bin/sh') });
  return pw;
}

export function getpwnam(name: Ptr): any {
  return jstr(name) === platform().login() ? getpwuid(1000) : null;
}

const exitHandlers: (() => any)[] = [];

export function atexit(f: () => any): number {
  exitHandlers.push(f);
  return 0;
}

export function resetSys(): void {
  exitHandlers.length = 0;
  envCache.clear();
}

export function exit(status: number): never {
  if (typeof process !== 'undefined' && process.env?.NH_TRACE_EXIT) console.error(new Error(`exit(${status})`).stack);
  while (exitHandlers.length) exitHandlers.pop()!();
  throw new Exit(status);
}

export function abort(): never {
  throw new Error('abort()');
}

export function signal(_s: number, _h: any): any { return null; }
export function sigaction(_s: number, _a: any, _o: any): number { return 0; }
export function kill(_p: number, _s: number): number { return 0; }
export function fork(): number { return -1; }
export function wait(_s: any): number { return -1; }
export function execl(..._a: any[]): number { return -1; }
export function execv(..._a: any[]): number { return -1; }
export function free(_p: any): void {}

// ---- the terminal's settings ----
export function isatty(fd: number): number {
  return fd >= 0 && fd <= 2 ? 1 : 0;
}

export function ioctl(_fd: number, _req: number, ..._a: any[]): number {
  R.errno = 25; // ENOTTY: the window size comes from the terminal entry
  return -1;
}

/** a Linux console's settings (stub.c: __wrap_tcgetattr) */
export function tcgetattr(_fd: number, t: any): number {
  t.c_iflag = 0o2400; // ICRNL | IXON
  t.c_oflag = 0o5; // OPOST | ONLCR
  t.c_cflag = 0o277; // CS8 | CREAD | B38400
  t.c_lflag = 0o100073; // ISIG | ICANON | ECHO | ECHOE | ECHOK | IEXTEN
  t.c_line = 0;
  t.c_cc.fill(0);
  t.c_cc[0] = 3;
  t.c_cc[1] = 28;
  t.c_cc[2] = 127;
  t.c_cc[3] = 21;
  t.c_cc[4] = 4;
  t.c_cc[6] = 1;
  t.c_cc[10] = 26;
  t.c_ispeed = 0o17;
  t.c_ospeed = 0o17;
  return 0;
}

export function tcsetattr(_fd: number, _act: number, _t: any): number {
  return 0;
}

export function cfgetospeed(t: any): number {
  return t.c_ospeed;
}

export function fpathconf(_fd: number, _name: number): number {
  return 0;
}

// ---- qsort: glibc's merge sort (msort_with_tmp), comparison for comparison: the comparators of
// NetHack (sortloot_cmp) name objects as they go, which can draw random numbers ----
async function msort(items: any[], cmp: (a: any, b: any) => any): Promise<any[]> {
  const n = items.length;
  if (n <= 1) return items;
  const n1 = n >> 1;
  const left = await msort(items.slice(0, n1), cmp);
  const right = await msort(items.slice(n1), cmp);
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    let r = cmp(left[i], right[j]);
    if (r instanceof Promise) r = await r;
    if (r <= 0) out.push(left[i++]);
    else out.push(right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

export async function qsort(base: any, n: number, _size: number, cmp: (a: any, b: any) => any): Promise<void> {
  if (n < 2) return;
  if (base instanceof Ptr && (ArrayBuffer.isView(base.a) || !(base.a[base.o] && typeof base.a[base.o] === 'object' && base.a[base.o].$cp))) {
    // numbers or pointers: the comparator gets pointers to the elements
    const a = base.a;
    const cells = [];
    for (let i = 0; i < n; i++) cells.push(new Ptr([a[base.o + i]], 0));
    const sorted = await msort(cells, cmp);
    for (let i = 0; i < n; i++) a[base.o + i] = sorted[i].a[0];
    return;
  }
  // an array of structs: the slots stay, their contents move
  const arr = base instanceof Ptr ? base.a : base.$a;
  const start = base instanceof Ptr ? base.o : base.$i;
  const copies = [];
  for (let i = 0; i < n; i++) copies.push(arr[start + i].$clone());
  const sorted = await msort(copies, cmp);
  for (let i = 0; i < n; i++) arr[start + i].$cp(sorted[i]);
}

// ---- POSIX regular expressions (autopickup exceptions, menu colors) ----
export function regcomp(re: any, pattern: Ptr, flags: number): number {
  try {
    re.$re = new RegExp(jstr(pattern), flags & 2 ? 'i' : '');
    return 0;
  } catch {
    return 1;
  }
}

export function regexec(re: any, s: Ptr, _n: number, _m: any, _f: number): number {
  return re.$re && re.$re.test(jstr(s)) ? 0 : 1;
}

export function regerror(_e: number, _re: any, buf: Ptr, n: number): number {
  const msg = 'Invalid regular expression';
  if (n > 0) putstr(buf, msg.slice(0, n - 1));
  return msg.length + 1;
}

export function regfree(re: any): void {
  re.$re = null;
}
