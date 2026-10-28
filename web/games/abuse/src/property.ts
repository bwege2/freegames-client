// property.cpp: named numbers and strings kept between runs in defaults.prp (the editor's window
// positions, the volume window's position)
import { bytesOf, type bFILE } from './imlib/specs.ts';
import { dprintf, ExitProgram } from './imlib/dprint.ts';
import { open_FILE } from './game.ts';

/** (int)x for a double, as x86-64 converts it (cvttsd2si): NaN and out of range give INT_MIN */
function cvtt(x: number): number {
  if (Number.isNaN(x) || x >= 2147483648 || x <= -2147483649) return -2147483648;
  return Math.trunc(x) | 0;
}

class property {
  name: string;
  def_str: string | null;
  /** uninitialised in the original when made with a string; never read then */
  def_num = 0;
  next: property | null = null;

  constructor(Name: string, Def: number | string) {
    this.name = Name;
    if (typeof Def === 'number') {
      this.def_num = Def;
      this.def_str = null;
    } else this.def_str = Def;
  }

  set(x: number | string): void {
    if (this.def_str !== null) this.def_str = null;
    if (typeof x === 'number') this.def_num = x;
    else this.def_str = x;
  }
}

/** sscanf(s, "%lg", &x): [return value, x]. Leading white space is skipped; at the end of the
 *  input the result is EOF (-1). The number is read like strtod (decimal with exponent, hex,
 *  inf, nan). */
function scan_lg(s: string): [number, number] {
  let i = 0;
  while (i < s.length && ' \t\n\v\f\r'.includes(s[i])) i++;
  if (i >= s.length) return [-1, 0];
  const rest = s.slice(i);
  let m = /^[+-]?(inf(inity)?|nan(\([0-9A-Za-z_]*\))?)/i.exec(rest);
  if (m) {
    const neg = rest[0] === '-';
    const v = /^[+-]?inf/i.test(rest) ? Infinity : NaN;
    return [1, neg ? -v : v];
  }
  m = /^([+-]?)0[xX](([0-9a-fA-F]+)(\.([0-9a-fA-F]*))?|\.([0-9a-fA-F]+))([pP]([+-]?\d+))?/.exec(rest);
  if (m) {
    const ip = m[3] ?? '', fp = m[5] ?? m[6] ?? '';
    let v = 0;
    for (const c of ip) v = v * 16 + parseInt(c, 16);
    let scale = 1 / 16;
    for (const c of fp) {
      v += parseInt(c, 16) * scale;
      scale /= 16;
    }
    if (m[8] !== undefined) v *= Math.pow(2, parseInt(m[8], 10));
    return [1, m[1] === '-' ? -v : v];
  }
  m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);
  if (m) return [1, parseFloat(m[0])];
  return [0, 0];
}

export class property_manager {
  first: property | null = null;

  private find(name: string): property | null {
    for (let i = this.first; i; i = i.next) if (i.name === name) return i;
    return null;
  }

  /** ~property_manager */
  destroy(): void {
    while (this.first) this.first = this.first.next;
  }

  getd(name: string, def: number): number { return this.get(name, def); }

  /** get(name, int def) and get(name, char const *def) */
  get(name: string, def: number): number;
  get(name: string, def: string): string;
  get(name: string, def: number | string): number | string {
    const f = this.find(name);
    if (typeof def === 'number') {
      if (!f || f.def_str !== null) return def;
      return f.def_num;
    }
    if (!f || f.def_str === null) return def;
    return f.def_str;
  }

  setd(name: string, def: number): void { this.set(name, def); }

  /** set(name, double def) (stored as (int)def) and set(name, char const *def) */
  set(name: string, def: number | string): void {
    const v = typeof def === 'number' ? cvtt(def) : def;
    let f = this.find(name);
    if (f) f.set(v);
    else {
      f = new property(name, v);
      f.next = this.first;
      this.first = f;
    }
  }

  save(filename: string): void {
    const fp = open_FILE(filename, 'wb');
    if (!fp) dprintf(`Error opening ${filename} to save properties\n`);
    else {
      for (let i = this.first; i; i = i.next) {
        fp.write(bytesOf(`${i.name} = `));
        if (i.def_str !== null) fp.write(bytesOf(`"${i.def_str}"\n`));
        else fp.write(bytesOf(`${i.def_num}\n`));
      }
      fp.close();
    }
  }

  load(filename: string): void {
    const fp = open_FILE(filename, 'rb');
    if (fp) {
      const rd = new fgets_reader(fp);
      while (!rd.feof()) {
        const buf = rd.fgets(100);
        if (buf !== null) {
          // for (c1 = buf, c2 = name; *c1 && *c1 != '='; c1++, c2++) *c2 = *c1;
          let c1 = 0;
          while (c1 < buf.length && buf[c1] !== '=') c1++;
          if (c1 >= buf.length) {
            // fprintf(stderr, "Missing = for property line %s in file %s\n", buf, filename)
            throw new ExitProgram(1);
          }
          // *c2 = ' '; while (*c2 == ' ') { *c2 = 0; c2--; }: the trailing spaces go. A name of
          // nothing but spaces would read name[-1] (a stack byte, taken here as not a space).
          let name = buf.slice(0, c1);
          let e = name.length;
          while (e > 0 && name[e - 1] === ' ') e--;
          name = name.slice(0, e);
          c1++;
          while (buf[c1] === ' ') c1++;
          if (buf[c1] === '"') {
            c1++;
            let str = '';
            for (; c1 < buf.length && buf[c1] !== '"'; c1++) str += buf[c1];
            if (buf[c1] !== '"') {
              // fprintf(stderr, "Missing \" for property name %s in file %s\n", name, filename)
              throw new ExitProgram(1);
            }
            this.set(name, str);
          } else {
            const [n, x] = scan_lg(buf.slice(c1));
            // EOF (-1, nothing but white space after the '=') counts as success too and stores
            // the uninitialised double; the port takes it as 0
            if (n) this.set(name, x);
            else {
              // fprintf(stderr, "Bad number/string for property name %s in file %s\n", name, filename)
              throw new ExitProgram(1);
            }
          }
        }
      }
      // the original never closes the file (fp leaks)
    }
  }
}

/** stdio's fgets and feof over a whole file (a NUL in a line ends the C string) */
class fgets_reader {
  private data: Uint8Array;
  private pos = 0;
  private eof = false;

  constructor(fp: bFILE) {
    const size = fp.file_size();
    const d = new Uint8Array(size);
    const n = fp.read(d, size);
    this.data = d.subarray(0, n);
  }

  feof(): boolean { return this.eof; }

  fgets(size: number): string | null {
    let s = '';
    let got = 0;
    while (got < size - 1) {
      if (this.pos >= this.data.length) {
        this.eof = true;
        break;
      }
      const c = this.data[this.pos++];
      got++;
      s += String.fromCharCode(c);
      if (c === 10) break;
    }
    if (!got) return null;
    const z = s.indexOf('\0');
    return z >= 0 ? s.slice(0, z) : s;
  }
}

/** loader2.cpp: property_manager *prop (made and loaded by dev_init, saved at exit) */
export const PR = { prop: null as property_manager | null };
