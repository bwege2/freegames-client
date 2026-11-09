// The C standard library the system files of HyperRogue 13.1o use (package P8): files (fopen, fgets, fscanf,
// fprintf, ftell, truncate), the environment (getenv), stdout and exit(). Files live in memory (`cfs.files`, name
// -> contents); the website backs them with account storage in a later stage (load them into `cfs.files` before
// hyper_init, save them after `cfs.onwrite`). The formats stay the original's: the score/save file
// (`hyperrogue.log`, system.cpp saveStats/loadsave) is the same text the desktop game writes.
// A leaf module: imports nothing. (C) Zeno Rogue, GPL-2.0-or-later (HyperRogue 13.1o); TypeScript port.

/** the in-memory file system and the process environment */
export const cfs = {
  /** file name -> contents (byte strings: one char per byte) */
  files: new Map<string, string>(),
  /** environment variables (getenv); empty in the browser */
  env: new Map<string, string>(),
  /** stdout of the original (printf): the banner of initializeCLI, -help...; dropped by default */
  stdout: (_s: string): void => { },
  /** called after every change of a file (for the storage of a later stage) */
  onwrite: (_name: string): void => { },
};

/** exit(code): the original ends the process; the port throws this (the host decides what to do) */
export class c_exit extends Error {
  code: number;
  constructor(code: number) { super(`exit(${code})`); this.code = code; }
}
export function exit(code: number): never { throw new c_exit(code); }

export function printf(s: string): void { cfs.stdout(s); }

export function getenv(name: string): string | null {
  const v = cfs.env.get(name);
  return v === undefined ? null : v;
}

export function file_exists(name: string): boolean { return cfs.files.has(name); }

/** FILE */
export class FILE {
  name: string;
  pos = 0;
  append: boolean;
  eof = false;
  constructor(name: string, append: boolean) { this.name = name; this.append = append; }
  get data(): string { return cfs.files.get(this.name) ?? ''; }
}

/** fopen(name, mode): modes r, w, a (+ t / b ignored, as on Linux) */
export function fopen(name: string, mode: string): FILE | null {
  if (name === '') return null;
  const m = mode[0];
  if (m === 'r') {
    if (!cfs.files.has(name)) return null;
    return new FILE(name, false);
  }
  if (m === 'w') {
    cfs.files.set(name, '');
    cfs.onwrite(name);
    return new FILE(name, false);
  }
  if (m === 'a') {
    if (!cfs.files.has(name)) { cfs.files.set(name, ''); cfs.onwrite(name); }
    const f = new FILE(name, true);
    f.pos = f.data.length;
    return f;
  }
  return null;
}

export function fclose(_f: FILE): void { }

/** fputs / fprintf (the caller formats the text) */
export function fputs(s: string, f: FILE): void {
  let d = f.data;
  if (f.append) f.pos = d.length;
  d = d.slice(0, f.pos) + s + d.slice(f.pos + s.length);
  f.pos += s.length;
  cfs.files.set(f.name, d);
  cfs.onwrite(f.name);
}

export function ftell(f: FILE): number { return f.append ? f.data.length : f.pos; }

export function feof(f: FILE): boolean { return f.eof; }

/** fgets(buf, n, f): at most n-1 characters, up to and including a newline; null at the end of the file */
export function fgets(n: number, f: FILE): string | null {
  const d = f.data;
  if (f.pos >= d.length) { f.eof = true; return null; }
  let e = f.pos;
  while (e < d.length && e - f.pos < n - 1) {
    if (d[e++] === '\n') break;
  }
  const s = d.slice(f.pos, e);
  f.pos = e;
  if (f.pos >= d.length && s[s.length - 1] !== '\n') f.eof = true;
  return s;
}

function isspace(c: string): boolean { return c === ' ' || c === '\t' || c === '\n' || c === '\v' || c === '\f' || c === '\r'; }

/** fscanf(f, "%d", &x): the value, or null when nothing matched (EOF or no number) */
export function fscanf_d(f: FILE): number | null {
  const d = f.data;
  while (f.pos < d.length && isspace(d[f.pos])) f.pos++;
  if (f.pos >= d.length) { f.eof = true; return null; }
  const r = scan_int(d, f.pos);
  if (r === null) return null;
  f.pos = r[1];
  if (f.pos >= d.length) f.eof = true;
  return r[0];
}

/** fscanf(f, "%<max>s", buf): the word, or null at the end of the file */
export function fscanf_s(f: FILE, max: number): string | null {
  const d = f.data;
  while (f.pos < d.length && isspace(d[f.pos])) f.pos++;
  if (f.pos >= d.length) { f.eof = true; return null; }
  const st = f.pos;
  while (f.pos < d.length && !isspace(d[f.pos]) && f.pos - st < max) f.pos++;
  if (f.pos >= d.length) f.eof = true;
  return d.slice(st, f.pos);
}

/** %d at position i of s (after whitespace was skipped): [value as int, next position], or null.
 *  glibc stores the strtol value truncated to int. */
function scan_int(s: string, i: number): [number, number] | null {
  let j = i;
  if (s[j] === '+' || s[j] === '-') j++;
  const ds = j;
  while (j < s.length && s[j] >= '0' && s[j] <= '9') j++;
  if (j === ds) return null;
  let v = parseInt(s.slice(i, j), 10);
  if (!Number.isFinite(v) || Math.abs(v) > 9.2e18) v = v < 0 ? -0x80000000 : 0x7FFFFFFF;
  return [Number(BigInt.asIntN(32, BigInt(Math.trunc(v)))), j];
}

/** sscanf(s, fmt) for the conversions the system files use: %d and %<n>s (whitespace-separated). Returns the
 *  values matched, in order (as many as matched before the first failure). */
export function sscanf(s: string, fmt: string): (number | string)[] {
  const res: (number | string)[] = [];
  let i = 0;
  const re = /%(\d*)([ds])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fmt)) !== null) {
    while (i < s.length && isspace(s[i])) i++;
    if (i >= s.length) break;
    if (m[2] === 'd') {
      const r = scan_int(s, i);
      if (r === null) break;
      res.push(r[0]); i = r[1];
    }
    else {
      const max = m[1] ? parseInt(m[1], 10) : Infinity;
      const st = i;
      while (i < s.length && !isspace(s[i]) && i - st < max) i++;
      res.push(s.slice(st, i));
    }
  }
  return res;
}

/** truncate(name, len) */
export function truncate(name: string, len: number): number {
  const d = cfs.files.get(name);
  if (d === undefined) return -1;
  cfs.files.set(name, d.slice(0, len));
  cfs.onwrite(name);
  return 0;
}

const wdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n: number): string => String(n).padStart(2, '0');

/** strftime(buf, 128, "%c", localtime(&t)) in the C locale: "Thu Jan  1 00:00:00 2026" */
export function strftime_c(t: number): string {
  const d = new Date(t * 1000);
  return `${wdays[d.getDay()]} ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ` +
    `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())} ${d.getFullYear()}`;
}

/** localtime(t): the fields the game reads (tm_mon is 0-based, as in C) */
export function localtime(t: number): { tm_mon: number; tm_mday: number; tm_year: number } {
  const d = new Date(t * 1000);
  return { tm_mon: d.getMonth(), tm_mday: d.getDate(), tm_year: d.getFullYear() - 1900 };
}

// --- stage 2, package U3: the files in the website's account storage (src/index.ts loads them into cfs.files
// before hyper_init and writes changed ones back after cfs.onwrite) ---

/** the files the original reads and writes: the score file with the saved game, and the configuration */
export const STORED_FILES = ['hyperrogue.log', 'hyperrogue.ini'];
/** the storage limit per file (docs/GAME-INTEGRATION.md) */
export const STORAGE_FILE_LIMIT = 512 * 1024;

/** bytes -> the byte string of cfs.files (one char per byte) */
export function bytes_to_cstr(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return s;
}

/** the byte string of cfs.files -> bytes */
export function cstr_to_bytes(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xFF;
  return b;
}

/** the lines that begin an entry of the score file (system.cpp saveStats and the one-line records of
 *  tactics, Yendor, racing, loads, modes and achievements) */
const entry_start = /^(HyperRogue: game statistics|TACTICS |YENDOR |RACING |LOAD |MODE |ACHIEVEMENT )/;

/** The score file as stored: when it is larger than `limit`, the oldest entries are dropped (never the last one,
 *  which holds the saved game), cutting at the start of an entry. A deviation forced by the storage limit
 *  (README.md); the game's own copy in cfs.files stays whole while it runs. */
export function trim_scorefile(data: string, limit = STORAGE_FILE_LIMIT): string {
  if (data.length <= limit) return data;
  const starts: number[] = [];
  let pos = 0;
  while (pos < data.length) {
    if (entry_start.test(data.slice(pos, pos + 32))) starts.push(pos);
    const nl = data.indexOf('\n', pos);
    if (nl < 0) break;
    pos = nl + 1;
  }
  if (starts.length < 2) return data;
  const last = starts[starts.length - 1];
  for (const s of starts) {
    if (s === 0) continue;
    if (data.length - s <= limit || s === last) return data.slice(s);
  }
  return data.slice(last);
}
