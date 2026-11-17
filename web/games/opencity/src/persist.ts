// The original's save file stream (src/persistence.h and every SaveTo/LoadFrom): numbers written as text
// with `rfs << value << std::ends`, so each is followed by a NUL byte, read back with `rfs >> v;
// rfs.ignore();`. The first line is the signature "OpenCity_0.0.7".
export class Writer {
  private s = '';
  line(text: string): void { this.s += text + '\n'; }
  num(v: number): void { this.s += String(v) + '\0'; }
  bytes(): Uint8Array { return new TextEncoder().encode(this.s); }
}

export class Reader {
  private readonly s: string;
  private p = 0;

  constructor(bytes: Uint8Array) { this.s = new TextDecoder('latin1').decode(bytes); }

  line(): string {
    const e = this.s.indexOf('\n', this.p);
    const end = e < 0 ? this.s.length : e;
    const out = this.s.slice(this.p, end);
    this.p = e < 0 ? this.s.length : e + 1;
    return out;
  }

  /** operator>> for an integer (skips white space, reads sign and digits), then ignore() one byte */
  num(): number {
    while (this.p < this.s.length && /\s/.test(this.s[this.p])) this.p++;
    const m = /^[+-]?\d+/.exec(this.s.slice(this.p, this.p + 32));
    if (!m) throw new Error('bad save file');
    this.p += m[0].length + 1;
    return Number(m[0]);
  }
}
