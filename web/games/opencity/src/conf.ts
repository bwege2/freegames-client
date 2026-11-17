// src/conf.cpp: OpenCity's ".conf" files (key=value per line, '#' comments). Like the original, a last
// line without a newline is not read (Conf::Open stops when getline hits the end of the file), the key is
// trimmed on the right, the value on the left only, and the value ends at the next '=' (strtok).
export class Conf {
  private readonly data = new Map<string, string>();

  constructor(text: string) {
    const lines = text.split('\n');
    // the part after the last '\n' was read with eof set: the loop ends before processing it
    lines.pop();
    for (const line of lines) {
      if (line.length === 0 || line[0] === '#') continue;
      const tokens = line.split('=').filter((t) => t.length > 0);
      const key = (tokens[0] ?? '').replace(/\s+$/, '');
      const value = (tokens[1] ?? '').replace(/^\s+/, '');
      if (key.length > 0) this.data.set(key, value);
    }
  }

  getValue(key: string, def = ''): string {
    return this.data.has(key) ? this.data.get(key)! : def;
  }

  /** Conf::GetLint: strtol(value, NULL, 0) */
  getLint(key: string, def: number): number {
    if (!this.data.has(key)) return def;
    return strtol(this.data.get(key)!);
  }
}

/** strtol(s, NULL, 0): leading spaces, sign, 0x hex, leading 0 octal, else decimal; stops at the first bad digit */
export function strtol(s: string): number {
  const m = /^\s*([+-]?)(0[xX][0-9a-fA-F]+|0[0-7]*|[1-9][0-9]*)?/.exec(s);
  if (!m || !m[2]) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  const d = m[2];
  let v: number;
  if (/^0[xX]/.test(d)) v = parseInt(d.slice(2), 16);
  else if (d.length > 1 && d[0] === '0') v = parseInt(d, 8);
  else v = parseInt(d, 10);
  return sign * v;
}
