// @ts-nocheck
// org.json's JSONObject, JSONArray, JSONTokener and JSONException as the game uses them (com/watabou/utils/
// Bundle.java), written for the port from their behaviour: org.json's licence is not free, so its code is
// neither translated nor copied. What the game sees is that of org.json 20170516 (the original's version),
// observed with probe programs on the JVM (re/shatteredpixeldungeon/NOTES.md, "org.json"):
//
// - A JSONObject keeps its members in a java.util.HashMap (the runtime's, OpenJDK's algorithm): toString()
//   and keys() follow its order. put(key, null) removes the key; a null key is a NullPointerException.
// - Values: ints are numbers, longs BigInts, doubles Double objects (the translator boxes the double
//   arguments of put), Strings, Booleans, JSONObject.NULL, nested objects and arrays.
// - Numbers are written as Java's toString writes them, and then, when the text has a '.' and no exponent,
//   without trailing zeros and the point: 1.0 -> 1, 0.10000000149011612 stays, 1.0E7 stays, -0.0 -> -0.
//   Non-finite doubles cannot be put (JSONException "JSON does not allow non-finite numbers.").
// - Strings are quoted with \" \\ \b \t \n \f \r, "</" as "<\/", and \u00XX (lowercase hex) for the
//   characters below U+0020, U+0080..U+009F and U+2000..U+20FF. Other objects are written as quoted
//   toString() (a Class: "class a.b.C"), enums as their name.
// - Getters: getInt/getLong take a Number (intValue, longValue: truncating) or a String that parses as
//   one (Integer.parseInt, Long.parseLong); getDouble a Number or a String Double.parseDouble reads;
//   getBoolean a Boolean or "true"/"false" in any case; getString only a String. The opt variants return
//   the default when the get fails; optString is the value's toString() ("" for null or a missing key).
// - The tokener reads org.json's relaxed syntax: unquoted words, single quotes, ';' between members,
//   missing array elements as null; numbers become Integer, Long or Double ("-0" and anything with '.', 'e'
//   or 'E' a Double), text that is not exactly a number ("007", "+1", ".5", too large) a String.
import { $J, JObject, Double, Float, defineLib, exc, dstr, fstr, str, RuntimeException, NullPointerException } from './lang.ts';
import { HashMap, ArrayList } from './util.ts';

export const JSONException = exc('JSONException', RuntimeException, 'org.json.JSONException');

/** JSONObject.NULL: equal to null, prints as null. */
class JsonNull extends JObject {
  equals(o: any) { return o == null || o === this; }
  hashCode() { return 0; }
  toString() { return 'null'; }
}
const NULL = new JsonNull();
const isNull = (v: any) => v == null || v === NULL;

function isFiniteDouble(v: any): boolean {
  if (v instanceof Double || v instanceof Float) return Number.isFinite(v.v);
  if (typeof v === 'number') return Number.isFinite(v);
  return true;
}
function testValidity(v: any) {
  if (!isFiniteDouble(v)) throw new JSONException('JSON does not allow non-finite numbers.');
}

/** A number's text as org.json writes it. */
export function numberToString(v: any): string {
  testValidity(v);
  let s: string;
  if (v instanceof Double) s = dstr(v.v);
  else if (v instanceof Float) s = fstr(v.v);
  else if (typeof v === 'number') s = Number.isInteger(v) && v >= -2147483648 && v <= 2147483647 ? String(v) : dstr(v);
  else s = String(v);
  if (s.indexOf('.') > 0 && s.indexOf('e') < 0 && s.indexOf('E') < 0) {
    while (s.endsWith('0')) s = s.substring(0, s.length - 1);
    if (s.endsWith('.')) s = s.substring(0, s.length - 1);
  }
  return s;
}

const hex4 = (c: number) => c.toString(16).padStart(4, '0');

/** JSONObject.quote. */
export function quote(s: string): string {
  if (s == null || s.length === 0) return '""';
  let out = '"';
  let b = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    switch (c) {
    case 0x5c: case 0x22: out += '\\' + s[i]; break;
    case 0x2f: if (b === 0x3c) out += '\\'; out += '/'; break;
    case 8: out += '\\b'; break;
    case 9: out += '\\t'; break;
    case 10: out += '\\n'; break;
    case 12: out += '\\f'; break;
    case 13: out += '\\r'; break;
    default:
      if (c < 0x20 || (c >= 0x80 && c < 0xa0) || (c >= 0x2000 && c < 0x2100)) out += '\\u' + hex4(c);
      else out += s[i];
    }
    b = c;
  }
  return out + '"';
}

/** A value as org.json writes it. */
function writeValue(v: any): string {
  if (isNull(v)) return 'null';
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'bigint' || v instanceof Double || v instanceof Float) return numberToString(v);
  if (typeof v === 'boolean') return String(v);
  if (v instanceof JSONObject || v instanceof JSONArray) return v.toString();
  if (Array.isArray(v)) return new JSONArray(v).toString();
  if (v instanceof $J.load('java.lang.Enum')) return quote(v.name());
  if ($J.isa(v, $J.load('java.util.Collection'))) return new JSONArray(v).toString();
  return quote(str(v));
}

/* ------------------------------------------------------------------ conversions of the getters */

function asInt(v: any): number | undefined {
  if (typeof v === 'number') return Number.isInteger(v) ? v | 0 : $J.d2i(v);
  if (typeof v === 'bigint') return $J.l2i(v);
  if (v instanceof Double || v instanceof Float) return $J.d2i(v.v);
  if (typeof v === 'string') { try { return $J.parseInt(v); } catch { return undefined; } }
  return undefined;
}
function asLong(v: any): bigint | undefined {
  if (typeof v === 'number') return Number.isInteger(v) ? BigInt(v) : $J.d2l(v);
  if (typeof v === 'bigint') return v;
  if (v instanceof Double || v instanceof Float) return $J.d2l(v.v);
  if (typeof v === 'string') { try { return $J.parseLong(v); } catch { return undefined; } }
  return undefined;
}
function asDouble(v: any): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Double || v instanceof Float) return v.v;
  if (typeof v === 'string') { try { return $J.parseDouble(v); } catch { return undefined; } }
  return undefined;
}
function asBoolean(v: any): boolean | undefined {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const l = v.toLowerCase();
    if (l === 'true') return true;
    if (l === 'false') return false;
  }
  return undefined;
}

/* ------------------------------------------------------------------ JSONObject */

export class JSONObject extends JObject {
  static NULL = NULL;
  map: HashMap;
  constructor(src?: any) {
    super();
    this.map = new HashMap();
    if (typeof src === 'string') {
      const t = new JSONTokener(src);
      t.readObjectInto(this);
    }
  }
  _JSONObject(src?: any): this {
    this.map = new HashMap();
    if (typeof src === 'string') new JSONTokener(src).readObjectInto(this);
    return this;
  }
  static quote(s: string) { return quote(s); }
  static numberToString(n: any) { return numberToString(n); }
  /** put(key, value) for boolean, int (a number), long (a BigInt), double (a Double), and Objects. */
  put(key: string, value: any): this {
    if (key == null) throw new NullPointerException('Null key.');
    if (value === null || value === undefined) {
      this.map.remove(key);
      return this;
    }
    testValidity(value);
    this.map.put(key, value);
    return this;
  }
  putOnce(key: string, value: any): this {
    if (key != null && value != null) {
      if (this.map.containsKey(key)) throw new JSONException('Duplicate key "' + key + '"');
      this.put(key, value);
    }
    return this;
  }
  opt(key: string): any { return key == null ? null : this.map.get(key); }
  get(key: string): any {
    if (key == null) throw new JSONException('Null key.');
    const v = this.opt(key);
    if (v == null) throw new JSONException('JSONObject[' + quote(key) + '] not found.');
    return v;
  }
  has(key: string) { return this.map.containsKey(key); }
  isNull(key: string) { return isNull(this.opt(key)); }
  remove(key: string) { return this.map.remove(key); }
  length() { return this.map.size(); }
  keys() { return this.map.keySet().iterator(); }
  keySet() { return this.map.keySet(); }
  names() {
    const a = new JSONArray();
    for (const it = this.keys(); it.hasNext(); ) a.put(it.next());
    return a.length() === 0 ? null : a;
  }
  fail(key: string, what: string): any { throw new JSONException('JSONObject[' + quote(key) + '] ' + what); }
  getInt(key: string): number { const r = asInt(this.get(key)); return r === undefined ? this.fail(key, 'is not an int.') : r; }
  getLong(key: string): bigint { const r = asLong(this.get(key)); return r === undefined ? this.fail(key, 'is not a long.') : r; }
  getDouble(key: string): number { const r = asDouble(this.get(key)); return r === undefined ? this.fail(key, 'is not a number.') : r; }
  getBoolean(key: string): boolean { const r = asBoolean(this.get(key)); return r === undefined ? this.fail(key, 'is not a Boolean.') : r; }
  getString(key: string): string { const v = this.get(key); return typeof v === 'string' ? v : this.fail(key, 'not a string.'); }
  getJSONObject(key: string): JSONObject { const v = this.get(key); return v instanceof JSONObject ? v : this.fail(key, 'is not a JSONObject.'); }
  getJSONArray(key: string): JSONArray { const v = this.get(key); return v instanceof JSONArray ? v : this.fail(key, 'is not a JSONArray.'); }
  optInt(key: string, def = 0): number { const v = this.opt(key); const r = v == null ? undefined : asInt(v); return r === undefined ? def : r; }
  optLong(key: string, def: bigint = 0n): bigint { const v = this.opt(key); const r = v == null ? undefined : asLong(v); return r === undefined ? def : r; }
  optDouble(key: string, def = NaN): number { const v = this.opt(key); const r = v == null ? undefined : asDouble(v); return r === undefined ? def : r; }
  optBoolean(key: string, def = false): boolean { const v = this.opt(key); const r = v == null ? undefined : asBoolean(v); return r === undefined ? def : r; }
  optString(key: string, def = ''): string { const v = this.opt(key); return isNull(v) ? def : str(v); }
  optJSONObject(key: string): JSONObject { const v = this.opt(key); return v instanceof JSONObject ? v : null; }
  optJSONArray(key: string): JSONArray { const v = this.opt(key); return v instanceof JSONArray ? v : null; }
  toString(): string {
    let s = '{';
    let first = true;
    for (const it = this.map.entrySet().iterator(); it.hasNext(); ) {
      const e = it.next();
      if (!first) s += ',';
      first = false;
      s += quote(e.getKey()) + ':' + writeValue(e.getValue());
    }
    return s + '}';
  }
  equals(o: any) { return this === o; }
  hashCode() { return $J.identityHashCode(this); }
}
defineLib(JSONObject, 'org.json.JSONObject');

/* ------------------------------------------------------------------ JSONArray */

export class JSONArray extends JObject {
  list: any[] = [];
  constructor(src?: any) {
    super();
    this.init(src);
  }
  _JSONArray(src?: any): this {
    this.list = [];
    this.init(src);
    return this;
  }
  init(src: any) {
    if (src == null) return;
    if (typeof src === 'string') new JSONTokener(src).readArrayInto(this);
    else if (Array.isArray(src)) for (const x of src) this.list.push(x);
    else if (typeof src.iterator === 'function') for (const it = src.iterator(); it.hasNext(); ) this.list.push(it.next());
  }
  length() { return this.list.length; }
  /** put(value) appends; put(index, value) sets, filling the gap with nulls (JSONObject.NULL). */
  put(a: any, b?: any): this {
    if (b === undefined) {
      testValidity(a);
      this.list.push(a == null ? null : a);
      return this;
    }
    const index = a;
    if (index < 0) throw new JSONException('JSONArray[' + index + '] not found.');
    testValidity(b);
    if (index < this.list.length) this.list[index] = b;
    else {
      while (index !== this.list.length) this.list.push(NULL);
      this.list.push(b);
    }
    return this;
  }
  opt(i: number): any { return i < 0 || i >= this.list.length ? null : this.list[i]; }
  get(i: number): any {
    const v = this.opt(i);
    if (v == null) throw new JSONException('JSONArray[' + i + '] not found.');
    return v;
  }
  isNull(i: number) { return isNull(this.opt(i)); }
  remove(i: number) { if (i < 0 || i >= this.list.length) return null; return this.list.splice(i, 1)[0]; }
  fail(i: number, what: string): any { throw new JSONException('JSONArray[' + i + '] ' + what); }
  getInt(i: number): number { const r = asInt(this.get(i)); return r === undefined ? this.fail(i, 'is not a number.') : r; }
  getLong(i: number): bigint { const r = asLong(this.get(i)); return r === undefined ? this.fail(i, 'is not a number.') : r; }
  getDouble(i: number): number { const r = asDouble(this.get(i)); return r === undefined ? this.fail(i, 'is not a number.') : r; }
  getBoolean(i: number): boolean { const r = asBoolean(this.get(i)); return r === undefined ? this.fail(i, 'is not a boolean.') : r; }
  getString(i: number): string { const v = this.get(i); return typeof v === 'string' ? v : this.fail(i, 'not a string.'); }
  getJSONObject(i: number): JSONObject { const v = this.get(i); return v instanceof JSONObject ? v : this.fail(i, 'is not a JSONObject.'); }
  getJSONArray(i: number): JSONArray { const v = this.get(i); return v instanceof JSONArray ? v : this.fail(i, 'is not a JSONArray.'); }
  optInt(i: number, def = 0): number { const v = this.opt(i); const r = v == null ? undefined : asInt(v); return r === undefined ? def : r; }
  optLong(i: number, def: bigint = 0n): bigint { const v = this.opt(i); const r = v == null ? undefined : asLong(v); return r === undefined ? def : r; }
  optDouble(i: number, def = NaN): number { const v = this.opt(i); const r = v == null ? undefined : asDouble(v); return r === undefined ? def : r; }
  optBoolean(i: number, def = false): boolean { const v = this.opt(i); const r = v == null ? undefined : asBoolean(v); return r === undefined ? def : r; }
  optString(i: number, def = ''): string { const v = this.opt(i); return isNull(v) ? def : str(v); }
  optJSONObject(i: number): JSONObject { const v = this.opt(i); return v instanceof JSONObject ? v : null; }
  iterator() { return ArrayList.from(this.list).iterator(); }
  toString(): string {
    let s = '[';
    for (let i = 0; i < this.list.length; i++) {
      if (i > 0) s += ',';
      s += writeValue(this.list[i]);
    }
    return s + ']';
  }
}
defineLib(JSONArray, 'org.json.JSONArray', { ifaces: ['java.lang.Iterable'] });

/* ------------------------------------------------------------------ JSONTokener */

/** A word that is not quoted: true, false, null (any case), a number, else the text itself. */
export function stringToValue(s: string): any {
  if (s === '') return s;
  const l = s.toLowerCase();
  if (l === 'true') return true;
  if (l === 'false') return false;
  if (l === 'null') return NULL;
  const c = s.charCodeAt(0);
  if ((c >= 48 && c <= 57) || c === 45) {
    try {
      if (s.includes('.') || s.includes('e') || s.includes('E') || s === '-0') {
        const d = $J.parseDouble(s);
        if (Number.isFinite(d)) return new Double(d);
      } else {
        const v = $J.parseLong(s);
        if (s === String(v)) return v >= -2147483648n && v <= 2147483647n ? Number(v) : v;
      }
    } catch {}
  }
  return s;
}

export class JSONTokener extends JObject {
  s: string;
  pos = 0;
  constructor(s: string) {
    super();
    this.s = s;
  }
  _JSONTokener(s: string): this { this.s = s; this.pos = 0; return this; }
  syntaxError(msg: string) {
    // org.json's position: the index, the character in the line and the line
    let line = 1, ch = 0;
    for (let i = 0; i < this.pos && i < this.s.length; i++) {
      if (this.s[i] === '\n') { line++; ch = 0; } else ch++;
    }
    return new JSONException(msg + ' at ' + this.pos + ' [character ' + (ch + 1) + ' line ' + line + ']');
  }
  more() { return this.pos < this.s.length; }
  next(): string { return this.pos < this.s.length ? this.s[this.pos++] : (this.pos++, ''); }
  back() { if (this.pos > 0) this.pos--; }
  nextClean(): string {
    for (;;) {
      const c = this.next();
      if (c === '' || c > ' ') return c;
    }
  }
  nextString(q: string): string {
    let sb = '';
    for (;;) {
      const c = this.next();
      switch (c) {
      case '': case '\n': case '\r':
        throw this.syntaxError('Unterminated string');
      case '\\': {
        const e = this.next();
        switch (e) {
        case 'b': sb += '\b'; break;
        case 't': sb += '\t'; break;
        case 'n': sb += '\n'; break;
        case 'f': sb += '\f'; break;
        case 'r': sb += '\r'; break;
        case 'u': {
          const h = this.s.substr(this.pos, 4);
          if (!/^[0-9a-fA-F]{4}$/.test(h)) throw this.syntaxError('Illegal escape.');
          this.pos += 4;
          sb += String.fromCharCode(parseInt(h, 16));
          break;
        }
        case '"': case "'": case '\\': case '/': sb += e; break;
        default: throw this.syntaxError('Illegal escape.');
        }
        break;
      }
      default:
        if (c === q) return sb;
        sb += c;
      }
    }
  }
  nextValue(): any {
    let c = this.nextClean();
    switch (c) {
    case '"': case "'": return this.nextString(c);
    case '{': this.back(); return this.readObjectInto(new JSONObject());
    case '[': this.back(); return this.readArrayInto(new JSONArray());
    default:
    }
    let sb = '';
    while (c !== '' && c >= ' ' && ',:]}/\\"[{;=#'.indexOf(c) < 0) {
      sb += c;
      c = this.next();
    }
    this.back();
    const t = sb.trim();
    if (t === '') throw this.syntaxError('Missing value');
    return stringToValue(t);
  }
  readObjectInto(o: JSONObject): JSONObject {
    if (this.nextClean() !== '{') throw this.syntaxError('A JSONObject text must begin with \'{\'');
    for (;;) {
      let c = this.nextClean();
      let key: string;
      switch (c) {
      case '': throw this.syntaxError('A JSONObject text must end with \'}\'');
      case '}': return o;
      default:
        this.back();
        key = str(this.nextValue());
      }
      c = this.nextClean();
      if (c !== ':') throw this.syntaxError("Expected a ':' after a key");
      if (key != null) {
        if (o.opt(key) != null) throw this.syntaxError('Duplicate key "' + key + '"');
        const v = this.nextValue();
        if (v != null) o.put(key, v);
      }
      switch (this.nextClean()) {
      case ';': case ',':
        if (this.nextClean() === '}') return o;
        this.back();
        break;
      case '}': return o;
      default: throw this.syntaxError("Expected a ',' or '}'");
      }
    }
  }
  readArrayInto(a: JSONArray): JSONArray {
    if (this.nextClean() !== '[') throw this.syntaxError("A JSONArray text must start with '['");
    let c = this.nextClean();
    if (c === '') throw this.syntaxError("Expected a ',' or ']'");
    if (c !== ']') {
      this.back();
      for (;;) {
        if (this.nextClean() === ',') {
          this.back();
          a.list.push(NULL);
        } else {
          this.back();
          a.list.push(this.nextValue());
        }
        switch (this.nextClean()) {
        case '': throw this.syntaxError("Expected a ',' or ']'");
        case ',':
          c = this.nextClean();
          if (c === '') throw this.syntaxError("Expected a ',' or ']'");
          if (c === ']') return a;
          this.back();
          break;
        case ']': return a;
        default: throw this.syntaxError("Expected a ',' or ']'");
        }
      }
    }
    return a;
  }
}
defineLib(JSONTokener, 'org.json.JSONTokener');

