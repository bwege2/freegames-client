// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/xml/xml.cpp:
// the game's own small XML reader (and writer, for the config file), with its quirks: an attribute's
// value starts two characters after '=', a tag that contains "/>" anywhere has no content, a closing
// tag is the first "</name>" after the opening one. Changed for the browser by the freegames project, 2026.
import { hashDjb2a } from './math.ts';

export interface XMLEntry {
  name: string;
  nameHash: number;
  attributes: Map<string, string>;
  content: string;
  children: XMLEntry[];
  lineNumber: number;
  comment?: boolean;
}

const newEntry = (): XMLEntry => ({ name: '', nameHash: 0, attributes: new Map(), content: '', children: [], lineNumber: 0 });

function lineNumber(buf: string, pos: number): number {
  let n = 1;
  for (let i = 0; i < pos && i < buf.length; i++) if (buf[i] === '\n') n++;
  return n;
}

export class XMLDocument {
  root: XMLEntry | null = null;
  private hash: boolean;

  constructor(text: string | null, hash = false) {
    this.hash = hash;
    if (text === null) return;
    const hdr = text.indexOf('<?xml');
    const end = text.indexOf('?>');
    if (hdr < 0 || end < 0) return;
    const start = end + 2;
    this.parseContent(text, start, text.substring(start), null);
  }

  private parseTagLine(line: number, buf: string, e: XMLEntry): boolean {
    let nameEnd = buf.search(/[ />\t]/);
    if (nameEnd < 0) nameEnd = buf.length;
    e.name = buf.substring(1, nameEnd);
    if (this.hash) e.nameHash = hashDjb2a(e.name);
    let i = nameEnd;
    const at = (k: number): string => (k < buf.length ? buf[k] : '\0');
    for (;;) {
      while (at(i) === ' ' || at(i) === '\t') i++;
      if (at(i) === '\0') break;
      if (at(i) === '>' || buf.startsWith('/>', i)) break;
      const ns = i;
      while (at(i) !== '=' && at(i) !== '\0') i++;
      if (at(i) === '\0') break;
      const ne = i;
      i += 2;
      const ds = i;
      while (at(i) !== '\'' && at(i) !== '"' && at(i) !== '\0') i++;
      if (at(i) === '\0') break;
      const de = i;
      i++;
      e.attributes.set(buf.substring(ns, ne), buf.substring(ds, de));
    }
    e.lineNumber = line;
    return !buf.includes('/>');
  }

  private parseContent(origin: string, startPos: number, buf: string, parent: XMLEntry | null): boolean {
    if (!buf.includes('<')) {
      if (parent) parent.content = buf;
      return true;
    }
    let cur = 0;
    while (cur < buf.length) {
      const open = buf.indexOf('<', cur);
      if (open < 0) return true;
      if (buf.startsWith('<!--', open)) {
        const cc = buf.indexOf('-->', cur);
        if (cc < 0) return false;
        cur = cc + 3;
        continue;
      }
      let close = buf.indexOf('>', cur);
      if (close < 0) return false;
      close += 1;
      let e: XMLEntry;
      if (!parent) {
        this.root = newEntry();
        e = this.root;
      } else {
        e = newEntry();
        parent.children.push(e);
      }
      const tag = buf.substring(open, close);
      const has = this.parseTagLine(lineNumber(origin, startPos + open), tag, e);
      if (!has) {
        cur = close;
        continue;
      }
      const closeEl = `</${e.name}>`;
      const cp = buf.indexOf(closeEl, cur);
      if (cp < 0) return false;
      if (close < cp) {
        if (!this.parseContent(origin, startPos + close, buf.substring(close, cp), e)) return false;
      }
      cur = cp + closeEl.length;
    }
    return false;
  }

  static attr(e: XMLEntry, name: string): string | undefined {
    return e.attributes.get(name);
  }

  /** iGetEntryAttribute (std::stoi) */
  static int(e: XMLEntry, name: string): number | undefined {
    const v = e.attributes.get(name);
    if (v === undefined) return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  /** fGetEntryAttribute (std::stof) */
  static float(e: XMLEntry, name: string): number | undefined {
    const v = e.attributes.get(name);
    if (v === undefined) return undefined;
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : Math.fround(n);
  }

  static bool(e: XMLEntry, name: string): boolean | undefined {
    const v = e.attributes.get(name);
    if (v === undefined) return undefined;
    return v === 'on' || v === 'true' || v === 'yes' || v === '1';
  }

  findEntryByName(parent: XMLEntry, name: string): XMLEntry | null {
    return parent.children.find((c) => c.name === name) ?? null;
  }

  // ---- writer (cXMLDocument::Save)
  createRoot(name: string): XMLEntry {
    this.root = newEntry();
    this.root.name = name;
    return this.root;
  }

  addEntry(parent: XMLEntry, name: string): XMLEntry {
    const e = newEntry();
    e.name = name;
    parent.children.push(e);
    return e;
  }

  addComment(parent: XMLEntry, text: string): void {
    const e = newEntry();
    e.name = text;
    e.comment = true;
    parent.children.push(e);
  }

  static setAttr(e: XMLEntry, name: string, value: string | number | boolean): void {
    if (typeof value === 'boolean') e.attributes.set(name, value ? 'on' : 'off');
    else if (typeof value === 'number') e.attributes.set(name, Number.isInteger(value) && !Object.is(value, -0) ? String(value) : value.toFixed(6));
    else e.attributes.set(name, value);
  }

  save(): string {
    let out = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const rec = (e: XMLEntry, level: number): void => {
      const pad = '    '.repeat(level);
      if (e.comment) {
        out += `${pad}<!--${e.name}-->\n`;
        return;
      }
      out += `${pad}<${e.name}`;
      for (const [k, v] of e.attributes) out += ` ${k}="${v}"`;
      if (e.children.length || e.content) {
        if (e.content) {
          out += `>${e.content}</${e.name}>\n`;
        } else {
          out += '>\n';
          for (const c of e.children) rec(c, level + 1);
          out += `${pad}</${e.name}>\n`;
        }
      } else {
        out += '/>\n';
      }
    };
    if (this.root) rec(this.root, 0);
    return out;
  }
}
