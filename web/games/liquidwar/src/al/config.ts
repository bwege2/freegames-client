// al/config.ts: Allegro 4.4's config files (src/config.c), entry for entry: the file is a list of lines
// (name and value, or a blank line or comment kept as it is); sections are "[NAME]" entries; a new value
// is appended after the last non-blank line of its section's block; get_config_int reads with strtol
// (base 0); the file is written back as the list, "name = value" per line.

interface Entry {
  name: string | null;
  data: string | null;
}

function isspace(c: string): boolean {
  return c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '\f' || c === '\v';
}

function eqi(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function prettify(section: string): string {
  if (!section) return '';
  let out = section[0] !== '[' ? `[${section}` : section;
  if (out[out.length - 1] !== ']') out += ']';
  return out;
}

export class ConfigFile {
  private list: Entry[] = [];

  constructor(text = '') {
    let pos = 0;
    while (pos < text.length) {
      let end = pos;
      while (end < text.length && text[end] !== '\r' && text[end] !== '\n') end++;
      const line = text.slice(pos, end);
      if (end < text.length) {
        const c = text[end];
        end++;
        if (end < text.length && ((c === '\r' && text[end] === '\n') || (c === '\n' && text[end] === '\r'))) end++;
      }
      pos = end;
      this.list.push(parseLine(line));
    }
  }

  private find(section: string | null, name: string): number {
    let inSection = !section;
    for (let i = 0; i < this.list.length; i++) {
      const p = this.list[i]!;
      if (p.name !== null) {
        if (section && p.name[0] === '[' && p.name[p.name.length - 1] === ']') inSection = eqi(section, p.name);
        if ((inSection || name[0] === '[') && eqi(p.name, name)) return i;
      }
    }
    return -1;
  }

  getString(section: string, name: string, def: string): string {
    const i = this.find(prettify(section), name);
    const p = i >= 0 ? this.list[i]! : null;
    return p && p.data ? p.data : def;
  }

  getInt(section: string, name: string, def: number): number {
    const s = this.getString(section, name, '');
    return s ? strtol0(s) : def;
  }

  setString(section: string, name: string, val: string): void {
    const sec = prettify(section);
    const i = this.find(sec, name);
    if (i >= 0) {
      if (val) this.list[i]!.data = val;
      else this.list.splice(i, 1);
      return;
    }
    if (!val) return;
    if (sec) {
      let p = this.find(null, sec);
      if (p < 0) {
        p = this.list.length - 1;
        const last = p >= 0 ? this.list[p]! : null;
        if (last && last.data) {
          this.list.splice(p + 1, 0, { name: null, data: null });
          p++;
        }
        this.list.splice(p + 1, 0, { name: sec, data: null });
        p++;
      }
      while (p + 1 < this.list.length && ((this.list[p + 1]!.name) || this.list[p + 1]!.data)) p++;
      this.list.splice(p + 1, 0, { name, data: val });
    } else this.list.splice(0, 0, { name, data: val });
  }

  setInt(section: string, name: string, value: number): void {
    this.setString(section, name, String(value | 0));
  }

  /** the file as flush_config writes it */
  toString(): string {
    let out = '';
    for (const e of this.list) {
      if (e.name !== null) {
        out += e.name;
        if (e.name[0] !== '[') out += ' = ';
      }
      if (e.data !== null) out += e.data;
      out += '\n';
    }
    return out;
  }
}

function parseLine(buf: string): Entry {
  let i = 0;
  while (i < buf.length && isspace(buf[i]!)) i++;
  const start = i;
  while (i < buf.length && !isspace(buf[i]!) && buf[i] !== '=' && buf[i] !== '#') i++;
  if (i > start) {
    const name = buf.slice(start, i);
    while (i < buf.length && (isspace(buf[i]!) || buf[i] === '=')) i++;
    let val = buf.slice(i);
    let k = val.length - 1;
    while (k >= 0 && isspace(val[k]!)) k--;
    val = val.slice(0, k + 1);
    return { name, data: val };
  }
  return { name: null, data: buf };
}

/** strtol(s, NULL, 0): optional sign, 0x hex, leading 0 octal, stops at the first bad character */
export function strtol0(s: string): number {
  let i = 0;
  while (i < s.length && isspace(s[i]!)) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') {
    neg = s[i] === '-';
    i++;
  }
  let base = 10;
  if (s[i] === '0') {
    if ((s[i + 1] === 'x' || s[i + 1] === 'X') && /[0-9a-fA-F]/.test(s[i + 2] ?? '')) {
      base = 16;
      i += 2;
    } else {
      base = 8;
      i++;
    }
  }
  let v = 0;
  for (; i < s.length; i++) {
    const d = parseInt(s[i]!, 36);
    if (Number.isNaN(d) || d >= base) break;
    v = v * base + d;
  }
  return (neg ? -v : v) | 0;
}
