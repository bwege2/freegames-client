// The rest of the C library and Unix as COW sees them, as the client oracle runs it: the clock (the
// platform's; the oracle's lockstep wrappers make it virtual), waiting (sleep, usleep, pause, select:
// through the platform, like the oracle's ls_idle()), the process, the user, exit, longjmp, qsort, the
// signals (nothing arrives), random() (glibc's TYPE_3 generator) and the C locale. From the NetHack port's
// runtime (web/games/nethack/src/rt/sys.ts), adapted.
import { Ptr } from './ptr.ts';
import { cstr, jstr } from './cstring.ts';
import { R, fdReadable } from './fs.ts';
import { Exit, LongJmp, platform } from './platform.ts';

// ---- waiting: the oracle's ls/ls.c ----

/** waits until a descriptor of fds is readable or the clock reaches the deadline; after every wake the
 * device input written so far becomes X events (xstub.c's wake hook) */
async function idle(fds: number[], deadline: number): Promise<void> {
  const p = platform();
  await p.idle(fds, deadline);
  p.x.pump();
}

async function sleepUs(us: number): Promise<void> {
  const p = platform();
  const deadline = p.nowUs() + us;
  while (p.nowUs() < deadline) await idle([], deadline);
}

export async function usleep(us: number): Promise<number> {
  await sleepUs(us);
  return 0;
}

export async function sleep(s: number): Promise<number> {
  await sleepUs(s * 1000000);
  return 0;
}

/** pause(): no signal ever arrives */
export async function pause(): Promise<number> {
  for (;;) await idle([], -1);
}

/** the bits of an fd_set (struct with a long array __fds_bits) */
function fdIsSet(set: any, fd: number): boolean {
  const w = set.__fds_bits[Math.floor(fd / 64)];
  return ((BigInt.asUintN(64, BigInt(Math.trunc(w))) >> BigInt(fd % 64)) & 1n) === 1n;
}

function fdZero(set: any): void {
  if (set) set.__fds_bits.fill(0);
}

function fdSet(set: any, fd: number): void {
  const i = Math.floor(fd / 64);
  const w = BigInt.asUintN(64, BigInt(Math.trunc(set.__fds_bits[i])));
  set.__fds_bits[i] = Number(BigInt.asIntN(64, w | (1n << BigInt(fd % 64))));
}

/** select() as the oracle's lockstep wrapper does it: the descriptors that are readable now, else, after
 * the deadline, 0, else wait (only reading is waited for: COW passes no write or error sets) */
export async function select(n: number, r: any, w: any, e: any, tv: any): Promise<number> {
  const p = platform();
  const deadline = tv ? p.nowUs() + tv.tv_sec * 1000000 + tv.tv_usec : -1;
  for (;;) {
    const want: number[] = [];
    if (r) for (let fd = 0; fd < n; fd++) if (fdIsSet(r, fd)) want.push(fd);
    const ready = want.filter((fd) => fdReadable(fd));
    if (ready.length) {
      fdZero(r);
      for (const fd of ready) fdSet(r, fd);
      fdZero(w);
      fdZero(e);
      return ready.length;
    }
    if (deadline >= 0 && p.nowUs() >= deadline) {
      fdZero(r);
      fdZero(w);
      fdZero(e);
      return 0;
    }
    await idle(want, deadline);
  }
}

// ---- the clock ----
export function time(t: Ptr | null): number {
  const v = Math.floor(platform().nowUs() / 1000000);
  if (t) t.a[t.o] = v;
  return v;
}

export function gettimeofday(tv: any, _tz: any): number {
  const us = platform().nowUs();
  tv.tv_sec = Math.floor(us / 1000000);
  tv.tv_usec = us % 1000000;
  return 0;
}

const tmStatic: any = {};

/** localtime(), in UTC (the oracle runs with TZ=UTC) */
export function localtime(t: Ptr): any {
  const v = t.a[t.o];
  const d = new Date(v * 1000);
  const y = d.getUTCFullYear();
  Object.assign(tmStatic, {
    tm_sec: d.getUTCSeconds(), tm_min: d.getUTCMinutes(), tm_hour: d.getUTCHours(), tm_mday: d.getUTCDate(),
    tm_mon: d.getUTCMonth(), tm_year: y - 1900, tm_wday: d.getUTCDay(),
    tm_yday: Math.floor((d.getTime() - Date.UTC(y, 0, 1)) / 86400000), tm_isdst: 0, tm_gmtoff: 0, tm_zone: cstr('UTC'),
  });
  return tmStatic;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ctime(t: Ptr): Ptr {
  const tm = localtime(t);
  const p2 = (v: number) => String(v).padStart(2, '0');
  return cstr(`${DAYS[tm.tm_wday]} ${MONTHS[tm.tm_mon]} ${String(tm.tm_mday).padStart(2, ' ')} ${p2(tm.tm_hour)}:${p2(tm.tm_min)}:${p2(tm.tm_sec)} ${tm.tm_year + 1900}\n`);
}

// ---- the process and the user ----
export function getuid(): number { return 1000; }
export function getpid(): number { return platform().pid; }

const envCache = new Map<string, Ptr>();

/** the environment as the coordinator gives it to COW: HOME (its directory), LC_ALL=C, no DISPLAY */
export function getenv(name: Ptr): Ptr | null {
  const n = jstr(name);
  const env: Record<string, string> = { HOME: platform().home, LC_ALL: 'C' };
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

const pw: any = {};

export function getpwuid(uid: number): any {
  if (uid !== 1000) return null;
  const l = cstr(platform().login);
  Object.assign(pw, { pw_name: l, pw_passwd: cstr('x'), pw_uid: 1000, pw_gid: 1000, pw_gecos: l, pw_dir: cstr(platform().home), pw_shell: cstr('/bin/sh') });
  return pw;
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
  while (exitHandlers.length) exitHandlers.pop()!();
  throw new Exit(status);
}

export function _exit(status: number): never {
  throw new Exit(status);
}

export function abort(): never {
  throw new Error('abort()');
}

export function longjmp(env: any, val: number): never {
  throw new LongJmp(env, val);
}

// no signal is ever delivered; nothing forks or runs other programs (the sound player, shell tools)
export function signal(_s: number, _h: any): any { return null; }
export function kill(_p: number, _s: number): number { return 0; }
export function fork(): number { R.errno = 11; return -1; }
export function vfork(): number { R.errno = 11; return -1; }
export function waitpid(_p: number, _s: any, _o: number): number { R.errno = 10; return -1; }
export function execvp(_f: any, _a: any): number { R.errno = 2; return -1; }
export function setpgid(_p: number, _g: number): number { return 0; }
export function popen(_c: any, _m: any): any { R.errno = 2; return null; }
export function pclose(_f: any): number { return -1; }
export function shmget(_k: number, _s: number, _f: number): number { R.errno = 38; return -1; }
export function shmat(_i: number, _a: any, _f: number): any { return -1; }
export function shmctl(_i: number, _c: number, _b: any): number { return -1; }
export function free(_p: any): void {}
export function setlocale(_c: number, l: Ptr | null): Ptr | null { return l ? cstr('C') : cstr('C'); }

// ---- qsort: glibc's merge sort (msort_with_tmp), comparison for comparison ----
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
    const a = base.a;
    const cells = [];
    for (let i = 0; i < n; i++) cells.push(new Ptr([a[base.o + i]], 0));
    const sorted = msort(cells, cmp);
    for (let i = 0; i < n; i++) a[base.o + i] = sorted[i].a[0];
    return;
  }
  const arr = base instanceof Ptr ? base.a : base.$a;
  const start = base instanceof Ptr ? base.o : base.$i;
  const copies = [];
  for (let i = 0; i < n; i++) copies.push(arr[start + i].$clone());
  const sorted = msort(copies, cmp);
  for (let i = 0; i < n; i++) arr[start + i].$cp(sorted[i]);
}

export function bsearch(key: any, base: any, n: number, _size: number, cmp: (a: any, b: any) => number): any {
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const p = base instanceof Ptr ? base.add(mid) : base.$a[base.$i + mid];
    const c = cmp(key, p);
    if (c < 0) hi = mid;
    else if (c > 0) lo = mid + 1;
    else return p;
  }
  return null;
}

// ---- random(): glibc's random_r TYPE_3 (from the Passage port's glibcRand.ts) ----
const rstate = new Int32Array(31);
let rptr = 0;

export function srandom(seed: number): void {
  seed >>>= 0;
  rstate[0] = seed === 0 ? 1 : seed | 0;
  for (let i = 1; i < 31; i++) {
    // 16807 * s[i-1] % 2147483647 by Schrage's method, as srandom_r (on the signed word)
    const prev = rstate[i - 1];
    const hi = Math.trunc(prev / 127773), lo = prev % 127773;
    let word = 16807 * lo - 2836 * hi;
    if (word < 0) word += 2147483647;
    rstate[i] = word;
  }
  rptr = 0;
  for (let k = 0; k < 310; k++) random();
}

export function random(): number {
  const f = (rptr + 3) % 31;
  const val = (rstate[f] + rstate[rptr]) | 0;
  rstate[f] = val;
  rptr = (rptr + 1) % 31;
  return val >>> 1;
}

srandom(1);

// ---- <math.h> ----
export const sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, atan2 = Math.atan2, hypot = Math.hypot;

/** rint(): to the nearest integer, ties to even (the default rounding mode) */
export function rint(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 ? 2 * Math.round(x / 2) : r;
}
