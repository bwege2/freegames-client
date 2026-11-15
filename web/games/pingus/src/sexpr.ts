// Pingus's data files are s-expressions: src/lisp/lexer.cpp, parser.cpp (the tokens, "(_ "...")" for
// translatable strings), src/util/sexpr_file_reader.cpp, overrride_file_reader.cpp and file_reader.cpp
// (the typed readers and their quirks: read_int refuses a real, read_float takes an int, read_string joins
// strings and symbols, a missing section leaves the value as it was).

export type Lisp =
  | { t: 'list'; v: Lisp[] }
  | { t: 'symbol'; v: string }
  | { t: 'string'; v: string }
  | { t: 'int'; v: number }
  | { t: 'float'; v: number }
  | { t: 'bool'; v: boolean };

const f32 = Math.fround;
const isSpace = (c: string) => c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\v' || c === '\f';
const isDigit = (c: string) => c >= '0' && c <= '9';
const isAlnum = (c: string) => isDigit(c) || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
const DELIMS = '"();';

type Tok = 'open' | 'close' | 'string' | 'symbol' | 'int' | 'real' | 'true' | 'false' | 'eof';

class Lexer {
  private i = 0;
  str = '';
  line = 0;
  private s: string;
  constructor(s: string) { this.s = s; }
  private ch(): string {
    // the lexer appends one blank after the last byte
    return this.i < this.s.length ? this.s[this.i] : this.i === this.s.length ? ' ' : '\0';
  }
  next(): Tok {
    const s = this.s;
    for (;;) {
      while (this.i <= s.length && isSpace(this.ch())) this.i++;
      if (this.i > s.length) return 'eof';
      const c = this.ch();
      if (c === ';') {
        while (this.i <= s.length && this.ch() !== '\n') this.i++;
        if (this.i > s.length) return 'eof';
        continue;
      }
      if (c === '(') { this.i++; return 'open'; }
      if (c === ')') { this.i++; return 'close'; }
      if (c === '"') {
        let out = '';
        for (;;) {
          this.i++;
          if (this.i > s.length) throw new Error('Parse error: EOF while parsing string.');
          let d = this.ch();
          if (d === '"') break;
          if (d === '\\') {
            this.i++;
            d = this.ch();
            if (d === 'n') d = '\n';
            else if (d === 't') d = '\t';
          }
          out += d;
        }
        this.i++;
        this.str = out;
        return 'string';
      }
      if (c === '#') {
        let tok = '';
        this.i++;
        while (this.i <= s.length && (isAlnum(this.ch()) || this.ch() === '_')) { tok += this.ch(); this.i++; }
        if (tok === 't') return 'true';
        if (tok === 'f') return 'false';
        throw new Error(`Parse Error: Unknown constant '${tok}'.`);
      }
      let tok = '';
      if (isDigit(c) || c === '-' || c === '.') {
        let nondigits = false, digits = false, points = 0;
        do {
          const d = this.ch();
          if (isDigit(d)) digits = true;
          else if (d === '.') ++points;
          else if (isAlnum(d) || d === '_') nondigits = true;
          tok += d;
          this.i++;
        } while (this.i <= s.length && !isSpace(this.ch()) && !DELIMS.includes(this.ch()));
        this.str = tok;
        if (nondigits || !digits || points > 1) return 'symbol';
        return points === 1 ? 'real' : 'int';
      }
      do { tok += this.ch(); this.i++; } while (this.i <= s.length && !isSpace(this.ch()) && !DELIMS.includes(this.ch()));
      this.str = tok;
      return 'symbol';
    }
  }
}

/** sscanf("%d"): leading sign and digits, the rest ignored */
function scanInt(s: string): number {
  const m = /^[+-]?\d+/.exec(s);
  return m ? (parseInt(m[0], 10) | 0) : 0;
}
/** sscanf("%f") into a float */
function scanFloat(s: string): number {
  const m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s);
  return m ? f32(parseFloat(m[0])) : 0;
}

/** lisp::Parser::parse: the whole file as one list of its top-level expressions */
export function parseLisp(text: string): Lisp {
  const lx = new Lexer(text);
  let tok = lx.next();
  if (tok !== 'open') throw new Error("Parse error: file doesn't start with '('");
  const parse = (): Lisp => {
    const entries: Lisp[] = [];
    while ((tok as Tok) !== 'close' && (tok as Tok) !== 'eof') {
      switch (tok) {
        case 'open':
          tok = lx.next();
          if (tok === 'symbol' && lx.str === '_') {
            tok = lx.next();
            if (tok !== 'string') throw new Error("Expected string after '(_' sequence");
            entries.push({ t: 'string', v: lx.str });
            tok = lx.next();
            if (tok !== 'close') throw new Error("Expected ')' after '(_ \"\"' sequence");
            break;
          }
          entries.push(parse());
          if (tok !== 'close') throw new Error("Expected ')' token");
          break;
        case 'symbol': entries.push({ t: 'symbol', v: lx.str }); break;
        case 'string': entries.push({ t: 'string', v: lx.str }); break;
        case 'int': entries.push({ t: 'int', v: scanInt(lx.str) }); break;
        case 'real': entries.push({ t: 'float', v: scanFloat(lx.str) }); break;
        case 'true': entries.push({ t: 'bool', v: true }); break;
        case 'false': entries.push({ t: 'bool', v: false }); break;
      }
      tok = lx.next();
    }
    return { t: 'list', v: entries };
  };
  const result = parse();
  if ((tok as Tok) !== 'eof') throw new Error((tok as Tok) === 'close' ? "Parse error: too many ')'" : 'extra tokens at end of file');
  return result;
}

function getFloat(l: Lisp): number {
  if (l.t === 'float') return l.v;
  if (l.t === 'int') return f32(l.v);
  throw new Error('Lisp is not a float');
}
function getInt(l: Lisp): number {
  if (l.t !== 'int') throw new Error('Lisp is not an int');
  return l.v;
}
function symbolOf(l: Lisp): string {
  if (l.t === 'list' && l.v.length > 0 && l.v[0].t === 'symbol') return l.v[0].v;
  return '';
}

export interface Vec3Like { x: number; y: number; z: number }
export interface ColorLike { r: number; g: number; b: number; a: number }
export interface ResDesc { name: string; modifier: string }

/** FileReader: every read returns undefined where the original's returns false (value untouched) */
export abstract class FileReader {
  abstract getName(): string;
  abstract readInt(name: string): number | undefined;
  abstract readFloat(name: string): number | undefined;
  abstract readBool(name: string): boolean | undefined;
  abstract readString(name: string): string | undefined;
  abstract readVector(name: string): Vec3Like | undefined;
  abstract readSize(name: string): { width: number; height: number } | undefined;
  abstract readVector2i(name: string): { x: number; y: number } | undefined;
  abstract readRect(name: string): { left: number; top: number; right: number; bottom: number } | undefined;
  abstract readColorf(name: string): ColorLike | undefined;
  abstract readColori(name: string): ColorLike | undefined;
  abstract readDesc(name: string): ResDesc | undefined;
  abstract readSection(name: string): FileReader | undefined;
  abstract getSections(): FileReader[];
  abstract getSectionNames(): string[];
  section(name: string): FileReader { return this.readSection(name) ?? EMPTY; }
}

/** static_cast<char>(int) then into Color's uint8_t */
const u8 = (v: number) => ((v | 0) & 0xff);

export class SExprReader extends FileReader {
  readonly sexpr: Lisp & { t: 'list' };
  constructor(sexpr: Lisp & { t: 'list' }) { super(); this.sexpr = sexpr; }
  static parse(text: string): SExprReader {
    const root = parseLisp(text) as Lisp & { t: 'list' };
    return new SExprReader(root.v[0] as Lisp & { t: 'list' });
  }
  static parseMany(text: string): SExprReader[] {
    const root = parseLisp(text) as Lisp & { t: 'list' };
    return root.v.map((l) => new SExprReader(l as Lisp & { t: 'list' }));
  }
  getName() { return (this.sexpr.v[0] as { v: string }).v; }
  private sub(name: string): (Lisp & { t: 'list' }) | undefined {
    for (let i = 1; i < this.sexpr.v.length; i++) {
      const s = this.sexpr.v[i];
      if (s.t === 'list' && symbolOf(s) === name) return s;
    }
    return undefined;
  }
  private item(name: string): Lisp | undefined {
    const s = this.sub(name);
    return s && s.v.length === 2 ? s.v[1] : undefined;
  }
  readInt(name: string) { const it = this.item(name); return it && it.t === 'int' ? it.v : undefined; }
  readFloat(name: string) {
    const it = this.item(name);
    if (!it) return undefined;
    if (it.t === 'float') return it.v;
    if (it.t === 'int') return f32(it.v);
    return undefined;
  }
  readBool(name: string) {
    const it = this.item(name);
    if (it && it.t === 'bool') return it.v;
    if (it && it.t === 'int') return it.v !== 0;
    return undefined;
  }
  readString(name: string) {
    const s = this.sub(name);
    if (!s) return undefined;
    let v = '';
    for (let i = 1; i < s.v.length; i++) {
      const it = s.v[i];
      if (it.t === 'string' || it.t === 'symbol') v += it.v;
    }
    return v;
  }
  readVector(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 4) return { x: getFloat(s.v[1]), y: getFloat(s.v[2]), z: getFloat(s.v[3]) };
    return undefined;
  }
  readSize(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 3) return { width: getInt(s.v[1]), height: getInt(s.v[2]) };
    return undefined;
  }
  readVector2i(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 3) return { x: getInt(s.v[1]), y: getInt(s.v[2]) };
    return undefined;
  }
  readRect(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 5) return { left: getInt(s.v[1]), top: getInt(s.v[2]), right: getInt(s.v[3]), bottom: getInt(s.v[4]) };
    return undefined;
  }
  readColorf(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 5) {
      const c = (l: Lisp) => u8(Math.trunc(f32(getFloat(l) * 255)));
      return { r: c(s.v[1]), g: c(s.v[2]), b: c(s.v[3]), a: c(s.v[4]) };
    }
    return undefined;
  }
  readColori(name: string) {
    const s = this.sub(name);
    if (s && s.v.length === 5) return { r: u8(getInt(s.v[1])), g: u8(getInt(s.v[2])), b: u8(getInt(s.v[3])), a: u8(getInt(s.v[4])) };
    return undefined;
  }
  readDesc(name: string) {
    const s = this.sub(name);
    if (!s) return undefined;
    const r = new SExprReader(s);
    return { name: r.readString('image') ?? '', modifier: r.readString('modifier') ?? 'ROT0' };
  }
  readSection(name: string) { const s = this.sub(name); return s ? new SExprReader(s) : undefined; }
  getSections() { return this.sexpr.v.slice(1).map((l) => new SExprReader(l as Lisp & { t: 'list' })); }
  getSectionNames() { return this.sexpr.v.slice(1).map((l) => symbolOf(l)); }
}

class EmptyReader extends FileReader {
  getName() { return ''; }
  readInt() { return undefined; }
  readFloat() { return undefined; }
  readBool() { return undefined; }
  readString() { return undefined; }
  readVector() { return undefined; }
  readSize() { return undefined; }
  readVector2i() { return undefined; }
  readRect() { return undefined; }
  readColorf() { return undefined; }
  readColori() { return undefined; }
  readDesc() { return undefined; }
  readSection() { return undefined; }
  getSections() { return []; }
  getSectionNames() { return []; }
}
export const EMPTY: FileReader = new EmptyReader();

/** OverrideFileReader: every value from `overrides` first (a prefab placed with its own settings) */
export class OverrideReader extends FileReader {
  private r: FileReader;
  private o: FileReader;
  constructor(r: FileReader, o: FileReader) { super(); this.r = r; this.o = o; }
  getName() { return this.r.getName(); }
  readInt(n: string) { return this.o.readInt(n) ?? this.r.readInt(n); }
  readFloat(n: string) { return this.o.readFloat(n) ?? this.r.readFloat(n); }
  readBool(n: string) { return this.o.readBool(n) ?? this.r.readBool(n); }
  readString(n: string) { return this.o.readString(n) ?? this.r.readString(n); }
  readVector(n: string) { return this.o.readVector(n) ?? this.r.readVector(n); }
  readSize(n: string) { return this.o.readSize(n) ?? this.r.readSize(n); }
  readVector2i(n: string) { return this.o.readVector2i(n) ?? this.r.readVector2i(n); }
  readRect(n: string) { return this.o.readRect(n) ?? this.r.readRect(n); }
  readColorf(n: string) { return this.o.readColorf(n) ?? this.r.readColorf(n); }
  readColori(n: string) { return this.o.readColori(n) ?? this.r.readColori(n); }
  readDesc(n: string) { return this.o.readDesc(n) ?? this.r.readDesc(n); }
  readSection(n: string): FileReader | undefined {
    const o = this.o.readSection(n);
    if (o) {
      const r = this.r.readSection(n);
      return r ? new OverrideReader(r, this.o) : o;
    }
    return this.r.readSection(n);
  }
  getSections() { return this.r.getSections().map((s) => new OverrideReader(s, this.o)); }
  getSectionNames() { return this.r.getSectionNames(); }
}
