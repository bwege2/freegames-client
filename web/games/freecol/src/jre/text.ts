// @ts-nocheck
// java.text as Swing and FreeCol's client use it: attributed text (fonts and text attributes), character
// iterators, line and word breaks, number formats, collation. Left-to-right text only: FreeCol's
// languages that the port shows are written left to right (re/freecol/NOTES.md, deviations).
import { $J, JObject, defineLib, str, IllegalArgumentException, NullPointerException } from './lang.ts';
import { HashMap, HashSet, Locale } from './util.ts';

export class AttributedCharacterIterator_Attribute extends JObject {
  name: string;
  static instanceMap = new Map<string, any>();
  constructor(name?: string) {
    super();
    if (name !== undefined) this._AttributedCharacterIterator_Attribute(name);
  }
  _AttributedCharacterIterator_Attribute(name: string) {
    this.name = name;
    if (this.constructor === AttributedCharacterIterator_Attribute) AttributedCharacterIterator_Attribute.instanceMap.set(name, this);
    return this;
  }
  getName() {
    return this.name;
  }
  equals(o: any) {
    return this === o;
  }
  hashCode() {
    return $J.identityHash ? $J.identityHash(this) : 1;
  }
  toString() {
    return $J.getClass(this).getName() + '(' + this.name + ')';
  }
  readResolve() {
    return AttributedCharacterIterator_Attribute.instanceMap.get(this.name) ?? this;
  }
  static LANGUAGE = new AttributedCharacterIterator_Attribute('language');
  static READING = new AttributedCharacterIterator_Attribute('reading');
  static INPUT_METHOD_SEGMENT = new AttributedCharacterIterator_Attribute('input_method_segment');
}
defineLib(AttributedCharacterIterator_Attribute, 'java.text.AttributedCharacterIterator$Attribute', { ifaces: ['java.io.Serializable'] });
(AttributedCharacterIterator_Attribute.prototype as any)['_AttributedCharacterIterator$Attribute'] = AttributedCharacterIterator_Attribute.prototype._AttributedCharacterIterator_Attribute;

export class CharacterIterator {
  static DONE = 0xffff;
}
defineLib(CharacterIterator, 'java.text.CharacterIterator', { kind: 'interface' });
export class AttributedCharacterIterator {}
defineLib(AttributedCharacterIterator, 'java.text.AttributedCharacterIterator', { kind: 'interface', ifaces: ['java.text.CharacterIterator'] });

/** java.text.StringCharacterIterator. */
export class StringCharacterIterator extends JObject {
  text: string;
  begin: number;
  end: number;
  pos: number;
  constructor(text?: string, a?: number, b?: number, c?: number) {
    super();
    if (text !== undefined) this._StringCharacterIterator(text, a, b, c);
  }
  _StringCharacterIterator(text: string, a?: number, b?: number, c?: number) {
    if (text == null) throw new NullPointerException();
    this.text = text;
    if (b === undefined) {
      this.begin = 0;
      this.end = text.length;
      this.pos = a ?? 0;
    } else {
      this.begin = a;
      this.end = b;
      this.pos = c;
    }
    return this;
  }
  setText(t: string) {
    this.text = t;
    this.begin = 0;
    this.end = t.length;
    this.pos = 0;
  }
  first() {
    this.pos = this.begin;
    return this.current();
  }
  last() {
    this.pos = this.end > this.begin ? this.end - 1 : this.end;
    return this.current();
  }
  setIndex(p: number) {
    if (p < this.begin || p > this.end) throw new IllegalArgumentException('Invalid index');
    this.pos = p;
    return this.current();
  }
  current() {
    return this.pos >= this.begin && this.pos < this.end ? this.text.charCodeAt(this.pos) : 0xffff;
  }
  next() {
    if (this.pos < this.end - 1) {
      this.pos++;
      return this.text.charCodeAt(this.pos);
    }
    this.pos = this.end;
    return 0xffff;
  }
  previous() {
    if (this.pos > this.begin) {
      this.pos--;
      return this.text.charCodeAt(this.pos);
    }
    return 0xffff;
  }
  getBeginIndex() {
    return this.begin;
  }
  getEndIndex() {
    return this.end;
  }
  getIndex() {
    return this.pos;
  }
  clone() {
    return new StringCharacterIterator(this.text, this.begin, this.end, this.pos);
  }
}
defineLib(StringCharacterIterator, 'java.text.StringCharacterIterator', { ifaces: ['java.text.CharacterIterator'] });

export class Annotation extends JObject {
  value: any;
  constructor(v?: any) {
    super();
    this.value = v;
  }
  getValue() {
    return this.value;
  }
}
defineLib(Annotation, 'java.text.Annotation');

/** java.text.AttributedString: runs of attributes over a text. */
export class AttributedString extends JObject {
  text: string;
  runs: { start: number; end: number; attrs: Map<any, any> }[] = [];
  constructor(a?: any, b?: any) {
    super();
    if (a === undefined) return;
    if (typeof a === 'string') {
      this.text = a;
      if (b != null) for (const e of b.entrySet()) this.addAttribute(e.getKey(), e.getValue());
    } else {
      // an AttributedCharacterIterator
      let s = '';
      const begin = a.getBeginIndex();
      for (let c = a.first(); c !== 0xffff; c = a.next()) s += String.fromCharCode(c);
      this.text = s;
      if (a.runs) for (const r of a.runs) this.runs.push({ start: r.start - begin, end: r.end - begin, attrs: new Map(r.attrs) });
    }
  }
  addAttribute(k: any, v: any, start = 0, end?: number) {
    if (k == null) throw new NullPointerException();
    this.runs.push({ start, end: end ?? this.text.length, attrs: new Map([[k, v]]) });
  }
  addAttributes(m: any, start: number, end: number) {
    const attrs = new Map();
    for (const e of m.entrySet()) attrs.set(e.getKey(), e.getValue());
    this.runs.push({ start, end, attrs });
  }
  getIterator(..._a: any[]) {
    return new AttributedStringIterator(this);
  }
}
defineLib(AttributedString, 'java.text.AttributedString');

class AttributedStringIterator extends StringCharacterIterator {
  runs: { start: number; end: number; attrs: Map<any, any> }[];
  constructor(s: AttributedString) {
    super(s.text);
    this.runs = s.runs;
  }
  attrsAt(i: number) {
    const m = new HashMap();
    for (const r of this.runs) if (i >= r.start && i < r.end) for (const [k, v] of r.attrs) m.put(k, v);
    return m;
  }
  getAttributes() {
    return this.attrsAt(this.pos);
  }
  getAttribute(k: any) {
    return this.attrsAt(this.pos).get(k);
  }
  getAllAttributeKeys() {
    const s = new HashSet();
    for (const r of this.runs) for (const k of r.attrs.keys()) s.add(k);
    return s;
  }
  boundaries(): number[] {
    const b = new Set<number>([this.begin, this.end]);
    for (const r of this.runs) {
      b.add(Math.max(this.begin, Math.min(this.end, r.start)));
      b.add(Math.max(this.begin, Math.min(this.end, r.end)));
    }
    return [...b].sort((x, y) => x - y);
  }
  getRunStart(_a?: any) {
    let s = this.begin;
    for (const b of this.boundaries()) if (b <= this.pos) s = b;
    return s;
  }
  getRunLimit(_a?: any) {
    for (const b of this.boundaries()) if (b > this.pos) return b;
    return this.end;
  }
}
defineLib(AttributedStringIterator, 'java.text.AttributedString$AttributedStringIterator', { ifaces: ['java.text.AttributedCharacterIterator'] });

/* ------------------------------------------------------------------ breaks */

/** java.text.BreakIterator for line, word, character and sentence breaks (simple rules for Latin text). */
export class BreakIterator extends JObject {
  static DONE = -1;
  kind: string;
  text: string = '';
  begin = 0;
  end = 0;
  pos = 0;
  constructor(kind = 'line') {
    super();
    this.kind = kind;
  }
  static getLineInstance(_l?: any) {
    return new BreakIterator('line');
  }
  static getWordInstance(_l?: any) {
    return new BreakIterator('word');
  }
  static getCharacterInstance(_l?: any) {
    return new BreakIterator('char');
  }
  static getSentenceInstance(_l?: any) {
    return new BreakIterator('sentence');
  }
  setText(t: any) {
    if (typeof t === 'string') {
      this.text = t;
      this.begin = 0;
      this.end = t.length;
    } else {
      let s = '';
      this.begin = t.getBeginIndex();
      for (let c = t.first(); c !== 0xffff; c = t.next()) s += String.fromCharCode(c);
      this.text = s;
      this.end = this.begin + s.length;
    }
    this.pos = this.begin;
  }
  getText() {
    return new StringCharacterIterator(this.text);
  }
  isBoundary(i: number) {
    if (i === this.begin || i === this.end) return true;
    const t = this.text, k = i - this.begin, a = t[k - 1], b = t[k];
    switch (this.kind) {
    case 'char':
      return !(b >= '\udc00' && b <= '\udfff');
    case 'word': {
      const w = (c: string) => /[\p{L}\p{N}_']/u.test(c);
      return w(a) !== w(b) || (!w(a) && !w(b));
    }
    case 'sentence':
      return /[.!?]/.test(a) && /\s/.test(b);
    default:
      // a line may break after spaces, after a hyphen, and before nothing else
      return (/\s/.test(a) && !/\s/.test(b)) || (a === '-' && /\S/.test(b) && !/\s/.test(a)) || a === '\n';
    }
  }
  first() {
    this.pos = this.begin;
    return this.pos;
  }
  last() {
    this.pos = this.end;
    return this.pos;
  }
  current() {
    return this.pos;
  }
  next(n?: number) {
    if (n !== undefined) {
      let r = this.pos;
      for (let i = 0; i < n; i++) r = this.next();
      for (let i = 0; i > n; i--) r = this.previous();
      return r;
    }
    if (this.pos >= this.end) return BreakIterator.DONE;
    for (let i = this.pos + 1; i <= this.end; i++) {
      if (this.isBoundary(i)) {
        this.pos = i;
        return i;
      }
    }
    return BreakIterator.DONE;
  }
  previous() {
    if (this.pos <= this.begin) return BreakIterator.DONE;
    for (let i = this.pos - 1; i >= this.begin; i--) {
      if (this.isBoundary(i)) {
        this.pos = i;
        return i;
      }
    }
    return BreakIterator.DONE;
  }
  following(off: number) {
    this.pos = off;
    return this.next();
  }
  preceding(off: number) {
    this.pos = off;
    return this.previous();
  }
  clone() {
    const b = new BreakIterator(this.kind);
    Object.assign(b, this);
    return b;
  }
}
defineLib(BreakIterator, 'java.text.BreakIterator');

/** java.text.Bidi: everything left to right. */
export class Bidi extends JObject {
  static DIRECTION_LEFT_TO_RIGHT = 0;
  static DIRECTION_RIGHT_TO_LEFT = 1;
  static DIRECTION_DEFAULT_LEFT_TO_RIGHT = -2;
  static DIRECTION_DEFAULT_RIGHT_TO_LEFT = -1;
  length = 0;
  constructor(a?: any, b?: any, _c?: any, _d?: any, len?: number) {
    super();
    if (typeof a === 'string') this.length = a.length;
    else if (Array.isArray(a)) this.length = len ?? a.length;
    else if (a && a.getEndIndex) this.length = a.getEndIndex() - a.getBeginIndex();
    void b;
  }
  static requiresBidi(_t: any, _s?: number, _l?: number) {
    return false;
  }
  isLeftToRight() {
    return true;
  }
  isRightToLeft() {
    return false;
  }
  isMixed() {
    return false;
  }
  baseIsLeftToRight() {
    return true;
  }
  getBaseLevel() {
    return 0;
  }
  getLength() {
    return this.length;
  }
  getLevelAt(_i: number) {
    return 0;
  }
  getRunCount() {
    return 1;
  }
  getRunStart(_i: number) {
    return 0;
  }
  getRunLimit(_i: number) {
    return this.length;
  }
  getRunLevel(_i: number) {
    return 0;
  }
  createLineBidi(a: number, b: number) {
    const x = new Bidi();
    x.length = b - a;
    return x;
  }
  static reorderVisually(_levels: number[], _ls: number, objs: any[], os: number, count: number) {
    void objs;
    void os;
    void count;
  }
}
defineLib(Bidi, 'java.text.Bidi');

/** sun.font.BidiUtils for left-to-right text. */
export const BidiUtils: any = {
  getLevels: (bidi: any) => new Array(bidi.getLength()).fill(0),
  createVisualToLogicalMap: (levels: number[]) => levels.map((_l, i) => i),
  createInverseMap: (v: number[]) => {
    if (v == null) return null;
    const r: number[] = [];
    v.forEach((x, i) => (r[x] = i));
    return r;
  },
  createContiguousOrder: (v: number[]) => v,
  reorderVisually: (_levels: number[], _objs: any[]) => {},
};
defineLib(BidiUtils, 'sun.font.BidiUtils');

/* ------------------------------------------------------------------ collation, numbers */

/** java.text.Collator: the locale's order through Intl.Collator. */
export class Collator extends JObject {
  static PRIMARY = 0;
  static SECONDARY = 1;
  static TERTIARY = 2;
  static IDENTICAL = 3;
  locale: string;
  strength = 2;
  c: Intl.Collator;
  constructor(locale = 'en') {
    super();
    this.locale = locale;
    this.c = new Intl.Collator(locale);
  }
  static getInstance(l?: any) {
    return new Collator(l ? str(l).replace('_', '-') : 'en');
  }
  setStrength(s: number) {
    this.strength = s;
    this.c = new Intl.Collator(this.locale, { sensitivity: s === 0 ? 'base' : s === 1 ? 'accent' : 'variant' });
  }
  getStrength() {
    return this.strength;
  }
  compare(a: any, b: any) {
    return this.c.compare(str(a), str(b));
  }
  equals(o: any) {
    return o instanceof Collator && o.locale === this.locale && o.strength === this.strength;
  }
}
defineLib(Collator, 'java.text.Collator', { ifaces: ['java.util.Comparator'] });
void Locale;
