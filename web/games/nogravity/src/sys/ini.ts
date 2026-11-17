// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the configuration files ([class] / name=value), the
// format of the mission scripts (.cmx), the briefings and nogravity.ini: ReadConfig, GetConfigItem and
// SelectConfigClass of rlx32/src/sysini.c. Lines are read with fgets(255): a line holding '@' ends the
// file, lines shorter than 3 characters and ';' comments are skipped, names are compared without case.

export interface ConfigFile {
  classes: { name: string; items: { name: string; data: string }[] }[];
  current: { name: string; items: { name: string; data: string }[] } | null;
}

const isspace = (c: string): boolean => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\v' || c === '\f';
const trimLeft = (s: string): string => { let i = 0; while (i < s.length && isspace(s[i])) i++; return s.slice(i); };
const trim = (s: string): string => { s = trimLeft(s); let j = s.length; while (j > 0 && isspace(s[j - 1])) j--; return s.slice(0, j); };
export const stricmp = (a: string, b: string): number => (a.toLowerCase() === b.toLowerCase() ? 0 : 1);

/** fgets(n): the lines of a text file as fgets returns them (including the '\n', at most n - 1 chars) */
export function fgetsLines(text: string, n: number): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    let j = i;
    while (j < text.length && j - i < n - 1 && text[j] !== '\n') j++;
    if (j < text.length && text[j] === '\n' && j - i < n - 1) j++;
    out.push(text.slice(i, j));
    i = j;
  }
  return out;
}

export function readConfig(text: string): ConfigFile {
  const c: ConfigFile = { classes: [], current: null };
  let cls: ConfigFile['classes'][number] | null = null;
  for (const raw of fgetsLines(text, 255)) {
    if (raw.includes('@')) return c;
    if (raw.length > 250) return c;
    const str = trim(raw);
    if (str.length < 3) continue;
    if (str[0] === ';') continue;
    if (str[0] === '[') {
      const e = str.indexOf(']', 1);
      if (e < 0) continue;
      const a = Math.min(e - 1, 31);
      if (a === 0) return c;
      cls = { name: trim(str.slice(1, 1 + a)), items: [] };
      c.classes.push(cls);
    } else {
      if (!cls) continue;
      const e = str.indexOf('=');
      if (e < 0) continue;
      cls.items.push({ name: trim(str.slice(0, e).slice(0, 31)), data: trimLeft(str.slice(e + 1)) });
    }
  }
  return c;
}
export function selectClass(name: string, c: ConfigFile): boolean {
  const k = c.classes.find((x) => stricmp(x.name, name) === 0);
  if (!k) return false;
  c.current = k;
  return true;
}
function item(name: string, c: ConfigFile): string | null {
  if (!c.current) return null;
  const i = c.current.items.find((x) => stricmp(x.name, name) === 0);
  return i ? i.data : null;
}
/** strtol(s, NULL, 0): decimal, 0x hex, leading 0 octal; stops at the first invalid character */
export function strtol0(s: string): number {
  let i = 0;
  while (i < s.length && isspace(s[i])) i++;
  let sign = 1;
  if (s[i] === '+' || s[i] === '-') { if (s[i] === '-') sign = -1; i++; }
  let base = 10;
  if (s[i] === '0' && (s[i + 1] === 'x' || s[i + 1] === 'X') && /[0-9a-fA-F]/.test(s[i + 2] ?? '')) { base = 16; i += 2; }
  else if (s[i] === '0') base = 8;
  let v = 0;
  for (; i < s.length; i++) {
    const d = parseInt(s[i], 36);
    if (Number.isNaN(d) || d >= base) break;
    v = v * base + d;
  }
  return (sign * v) | 0;
}
/** atol */
export function atol(s: string): number {
  const m = /^\s*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1], 10) | 0 : 0;
}
export const getStr = (name: string, c: ConfigFile): string | null => item(name, c);
export function getLong(name: string, c: ConfigFile): number { const s = item(name, c); return s === null ? 0 : strtol0(s); }
export function getLong2(name: string, c: ConfigFile): number | null { const s = item(name, c); return s === null ? null : strtol0(s); }
function boolOf(s: string): number {
  let b = 0;
  if (atol(s) === 1) b = 1;
  const l = s.toLowerCase();
  if (l === 'yes' || l === 'ok' || l === 'y' || l === 'true') b = 1;
  return b;
}
export function getBool(name: string, c: ConfigFile): number { const s = item(name, c); return s === null ? 0 : boolOf(s); }
export function getBool2(name: string, c: ConfigFile): number | null { const s = item(name, c); return s === null ? null : boolOf(s); }

/** array_loadtext (systools.c): at most maxy lines (fgets(255)) with trailing control characters cut,
 * up to a line starting with '@' */
export function loadTextList(text: string, maxy: number): string[] {
  const out: string[] = [];
  for (const raw of fgetsLines(text, 255)) {
    if (maxy <= 0) break;
    let l = raw.length;
    while (l > 0 && raw.charCodeAt(l - 1) > 0 && raw.charCodeAt(l - 1) < 0x20) l--;
    const s = raw.slice(0, l);
    if (s[0] === '@') break;
    out.push(s);
    maxy--;
  }
  return out;
}
