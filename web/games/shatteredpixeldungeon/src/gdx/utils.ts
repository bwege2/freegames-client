// @ts-nocheck
// libGDX 1.14.0's utilities the game uses (com.badlogic.gdx.utils): IntMap (the game's SparseArray extends it,
// and a level's saved form follows its iteration order), Array, IntArray, I18NBundle with PropertiesUtils.load.
// Translated by hand from gdx-1.14.0-sources.jar (Apache-2.0, Copyright 2011 See AUTHORS file; see core.ts),
// keeping the algorithms: IntMap's open addressing with Fibonacci hashing and its removal, I18NBundle's
// candidate locales and parent chain, PropertiesUtils' parser.
import { $J, JObject, defineLib, exc, NullPointerException, IllegalArgumentException, IllegalStateException,
  NoSuchElementException, RuntimeException } from '../jre/lang.ts';
import { Locale, ArrayList, LinkedHashSet } from '../jre/util.ts';
import { GdxRuntimeException } from './core.ts';

/* ------------------------------------------------------------------ what IntMap's toArray() gives */

/**
 * The Array and IntArray that IntMap.Values.toArray() and IntMap.Keys.toArray() return, as far as the game uses
 * them (toArray() of their items). libGDX's Array and IntArray themselves are translated (src/gen); these are
 * not registered under their names.
 */
class ItemList extends JObject {
  items: any[] = [];
  get size() { return this.items.length; }
  add(x: any) { this.items.push(x); }
  add$Object(x: any) { this.items.push(x); }
  get(i: number) { return this.items[i]; }
  toArray() { return this.items.slice(); }
  toArray$() { return this.items.slice(); }
  iterator() { return ArrayList.from(this.items).iterator(); }
}
const GdxArray = ItemList;
const IntArray = ItemList;

/* ------------------------------------------------------------------ small utilities */

/** utils.ArraySupplier: makes arrays of a size (ANY: Object[]). */
export const ArraySupplier: any = { ANY: { get: (n: number) => new Array(n).fill(null) }, object: () => ArraySupplier.ANY };
defineLib(ArraySupplier, 'com.badlogic.gdx.utils.ArraySupplier', { kind: 'interface' });

/** utils.LongMap: long keys (BigInts), as far as FreeType's Library uses it (its fonts' bytes by face). */
export class LongMap extends JObject {
  m = new Map<bigint, any>();
  get size() { return this.m.size; }
  get(k: bigint, def: any = null) { return this.m.has(k) ? this.m.get(k) : def; }
  put(k: bigint, v: any) { const old = this.get(k); this.m.set(k, v); return old; }
  remove(k: bigint) { const old = this.get(k); this.m.delete(k); return old; }
  containsKey(k: bigint) { return this.m.has(k); }
  values() { return ArrayList.from([...this.m.values()]); }
}
defineLib(LongMap, 'com.badlogic.gdx.utils.LongMap');

/** utils.StreamUtils: copying streams. */
export class StreamUtils extends JObject {
  static copyStreamToByteArray(input: any, _estimated?: number) {
    return Array.from(input.readAllBytes(), (b: number) => (b << 24) >> 24);
  }
  static copyStream(input: any, out: any) {
    const bytes = input.readAllBytes();
    if (out.put) out.put(Array.from(bytes, (b: number) => (b << 24) >> 24));
    else out.write(bytes);
  }
  static closeQuietly(c: any) {
    try { if (c != null) c.close(); } catch {}
  }
}
defineLib(StreamUtils, 'com.badlogic.gdx.utils.StreamUtils');

/** utils.BufferUtils: java.nio buffers (no native memory here: "unsafe" buffers are ordinary ones). */
export class BufferUtils {
  static newByteBuffer(n: number) { return $J.load('java.nio.ByteBuffer').allocateDirect(n).order($J.load('java.nio.ByteOrder').nativeOrder()); }
  static newUnsafeByteBuffer(n: number) { return BufferUtils.newByteBuffer(n); }
  static isUnsafeByteBuffer(_b: any) { return false; }
  static disposeUnsafeByteBuffer(_b: any) {}
  static newIntBuffer(n: number) { return BufferUtils.newByteBuffer(n * 4).asIntBuffer(); }
  static newFloatBuffer(n: number) { return BufferUtils.newByteBuffer(n * 4).asFloatBuffer(); }
  static newShortBuffer(n: number) { return BufferUtils.newByteBuffer(n * 2).asShortBuffer(); }
  /** copy(src, dst, numElements) of two buffers, copy(byte[] src, srcOffset, Buffer dst, numElements). */
  static copy(src: any, a: any, b: any, c?: any) {
    if (Array.isArray(src) || ArrayBuffer.isView(src)) {
      const off = a, dst = b, n = c;
      for (let i = 0; i < n; i++) dst.set(dst.pos + i, src[off + i]);
      dst.lim = dst.pos + n;
      return;
    }
    const dst = a, n = b;
    for (let i = 0; i < n; i++) dst.set(dst.pos + i, src.at(src.pos + i));
    dst.lim = dst.pos + n;
  }
}
defineLib(BufferUtils, 'com.badlogic.gdx.utils.BufferUtils');

/* ------------------------------------------------------------------ IntMap */

/** ObjectSet.tableSize: the power of two that holds capacity entries below the load factor. */
function tableSize(capacity: number, loadFactor: number): number {
  if (capacity < 0) throw new IllegalArgumentException('capacity must be >= 0: ' + capacity);
  const n = Math.max(2, $J.d2i(Math.ceil(Math.fround(capacity / loadFactor))));
  // MathUtils.nextPowerOfTwo
  let v = n - 1;
  v |= v >> 1; v |= v >> 2; v |= v >> 4; v |= v >> 8; v |= v >> 16;
  const size = v + 1;
  if (size > 1 << 30) throw new IllegalArgumentException('The required capacity is too large: ' + capacity);
  return size;
}

const FIB = 0x9e3779b97f4a7c15n;

/** com.badlogic.gdx.utils.IntMap: int keys, open addressing with linear probing (0 is kept aside). */
export class IntMap extends JObject {
  size = 0;
  keyTable: Int32Array;
  valueTable: any[];
  zeroValue: any = null;
  hasZeroValue = false;
  loadFactor: number;
  threshold: number;
  shift: number;
  mask: number;
  constructor(initialCapacity?: any, loadFactor?: number) {
    super();
    if (initialCapacity !== undefined) this._IntMap(initialCapacity, loadFactor);
  }
  _IntMap(initialCapacity: any = 51, loadFactor = Math.fround(0.8)): this {
    if (initialCapacity instanceof IntMap) {
      const map = initialCapacity;
      this._IntMap($J.d2i(Math.fround(map.keyTable.length * map.loadFactor)), map.loadFactor);
      this.keyTable.set(map.keyTable);
      for (let i = 0; i < map.valueTable.length; i++) this.valueTable[i] = map.valueTable[i];
      this.size = map.size;
      this.zeroValue = map.zeroValue;
      this.hasZeroValue = map.hasZeroValue;
      return this;
    }
    if (loadFactor <= 0 || loadFactor >= 1) throw new IllegalArgumentException('loadFactor must be > 0 and < 1: ' + $J.fstr(loadFactor));
    this.loadFactor = loadFactor;
    const ts = tableSize(initialCapacity, loadFactor);
    this.threshold = $J.d2i(Math.fround(ts * loadFactor));
    this.mask = ts - 1;
    this.shift = 64 - (32 - Math.clz32(this.mask)); // Long.numberOfLeadingZeros(mask)
    this.keyTable = new Int32Array(ts);
    this.valueTable = new Array(ts).fill(null);
    return this;
  }
  /** (int)(item * 0x9E3779B97F4A7C15L >>> shift) */
  place(item: number): number {
    return Number(BigInt.asIntN(32, BigInt.asUintN(64, BigInt(item) * FIB) >> BigInt(this.shift)));
  }
  locateKey(key: number): number {
    const keyTable = this.keyTable;
    for (let i = this.place(key); ; i = (i + 1) & this.mask) {
      const other = keyTable[i];
      if (other === 0) return -(i + 1);
      if (other === key) return i;
    }
  }
  put(key: number, value: any): any {
    if (key === 0) {
      const oldValue = this.zeroValue;
      this.zeroValue = value;
      if (!this.hasZeroValue) {
        this.hasZeroValue = true;
        this.size++;
      }
      return oldValue;
    }
    let i = this.locateKey(key);
    if (i >= 0) {
      const oldValue = this.valueTable[i];
      this.valueTable[i] = value;
      return oldValue;
    }
    i = -(i + 1);
    this.keyTable[i] = key;
    this.valueTable[i] = value;
    if (++this.size >= this.threshold) this.resize(this.keyTable.length << 1);
    return null;
  }
  putAll(map: IntMap) {
    this.ensureCapacity(map.size);
    if (map.hasZeroValue) this.put(0, map.zeroValue);
    for (let i = 0, n = map.keyTable.length; i < n; i++) {
      const key = map.keyTable[i];
      if (key !== 0) this.put(key, map.valueTable[i]);
    }
  }
  putResize(key: number, value: any) {
    const keyTable = this.keyTable;
    for (let i = this.place(key); ; i = (i + 1) & this.mask) {
      if (keyTable[i] === 0) {
        keyTable[i] = key;
        this.valueTable[i] = value;
        return;
      }
    }
  }
  /** get(key) and get(key, defaultValue) (a missing default is null, as get(key)). */
  get(key: number, defaultValue: any = null): any {
    if (key === 0) return this.hasZeroValue ? this.zeroValue : defaultValue;
    const i = this.locateKey(key);
    return i >= 0 ? this.valueTable[i] : defaultValue;
  }
  remove(key: number): any {
    if (key === 0) {
      if (!this.hasZeroValue) return null;
      this.hasZeroValue = false;
      const oldValue = this.zeroValue;
      this.zeroValue = null;
      this.size--;
      return oldValue;
    }
    let i = this.locateKey(key);
    if (i < 0) return null;
    const keyTable = this.keyTable, valueTable = this.valueTable;
    const oldValue = valueTable[i];
    const mask = this.mask;
    let next = (i + 1) & mask;
    while ((key = keyTable[next]) !== 0) {
      const placement = this.place(key);
      if (((next - placement) & mask) > ((i - placement) & mask)) {
        keyTable[i] = key;
        valueTable[i] = valueTable[next];
        i = next;
      }
      next = (next + 1) & mask;
    }
    keyTable[i] = 0;
    valueTable[i] = null;
    this.size--;
    return oldValue;
  }
  notEmpty() { return this.size > 0; }
  isEmpty() { return this.size === 0; }
  shrink(maximumCapacity: number) {
    if (maximumCapacity < 0) throw new IllegalArgumentException('maximumCapacity must be >= 0: ' + maximumCapacity);
    const ts = tableSize(maximumCapacity, this.loadFactor);
    if (this.keyTable.length > ts) this.resize(ts);
  }
  clear(maximumCapacity?: number) {
    if (maximumCapacity !== undefined) {
      const ts = tableSize(maximumCapacity, this.loadFactor);
      if (this.keyTable.length <= ts) {
        this.clear();
        return;
      }
      this.size = 0;
      this.hasZeroValue = false;
      this.zeroValue = null;
      this.resize(ts);
      return;
    }
    if (this.size === 0) return;
    this.size = 0;
    this.keyTable.fill(0);
    this.valueTable.fill(null);
    this.zeroValue = null;
    this.hasZeroValue = false;
  }
  containsValue(value: any, identity: boolean): boolean {
    const valueTable = this.valueTable;
    if (value == null) {
      if (this.hasZeroValue && this.zeroValue == null) return true;
      for (let i = valueTable.length - 1; i >= 0; i--) if (this.keyTable[i] !== 0 && valueTable[i] == null) return true;
    } else if (identity) {
      if (value === this.zeroValue) return true;
      for (let i = valueTable.length - 1; i >= 0; i--) if (valueTable[i] === value) return true;
    } else {
      if (this.hasZeroValue && $J.equals(value, this.zeroValue)) return true;
      for (let i = valueTable.length - 1; i >= 0; i--) if ($J.equals(value, valueTable[i])) return true;
    }
    return false;
  }
  containsKey(key: number): boolean {
    if (key === 0) return this.hasZeroValue;
    return this.locateKey(key) >= 0;
  }
  findKey(value: any, identity: boolean, notFound: number): number {
    const valueTable = this.valueTable;
    if (value == null) {
      if (this.hasZeroValue && this.zeroValue == null) return 0;
      for (let i = valueTable.length - 1; i >= 0; i--) if (this.keyTable[i] !== 0 && valueTable[i] == null) return this.keyTable[i];
    } else if (identity) {
      if (value === this.zeroValue) return 0;
      for (let i = valueTable.length - 1; i >= 0; i--) if (valueTable[i] === value) return this.keyTable[i];
    } else {
      if (this.hasZeroValue && $J.equals(value, this.zeroValue)) return 0;
      for (let i = valueTable.length - 1; i >= 0; i--) if ($J.equals(value, valueTable[i])) return this.keyTable[i];
    }
    return notFound;
  }
  ensureCapacity(additionalCapacity: number) {
    const ts = tableSize(this.size + additionalCapacity, this.loadFactor);
    if (this.keyTable.length < ts) this.resize(ts);
  }
  resize(newSize: number) {
    const oldCapacity = this.keyTable.length;
    this.threshold = $J.d2i(Math.fround(newSize * this.loadFactor));
    this.mask = newSize - 1;
    this.shift = 64 - (32 - Math.clz32(this.mask));
    const oldKeyTable = this.keyTable, oldValueTable = this.valueTable;
    this.keyTable = new Int32Array(newSize);
    this.valueTable = new Array(newSize).fill(null);
    if (this.size > 0) {
      for (let i = 0; i < oldCapacity; i++) {
        const key = oldKeyTable[i];
        if (key !== 0) this.putResize(key, oldValueTable[i]);
      }
    }
  }
  hashCode(): number {
    let h = this.size;
    if (this.hasZeroValue && this.zeroValue != null) h = (h + $J.hashCode(this.zeroValue)) | 0;
    for (let i = 0, n = this.keyTable.length; i < n; i++) {
      const key = this.keyTable[i];
      if (key !== 0) {
        h = (h + Math.imul(key, 31)) | 0;
        const value = this.valueTable[i];
        if (value != null) h = (h + $J.hashCode(value)) | 0;
      }
    }
    return h;
  }
  toString(): string {
    if (this.size === 0) return '[]';
    let s = '[';
    let i = this.keyTable.length;
    if (this.hasZeroValue) s += '0=' + $J.str(this.zeroValue);
    else {
      while (i-- > 0) {
        const key = this.keyTable[i];
        if (key === 0) continue;
        s += key + '=' + $J.str(this.valueTable[i]);
        break;
      }
    }
    while (i-- > 0) {
      const key = this.keyTable[i];
      if (key === 0) continue;
      s += ', ' + key + '=' + $J.str(this.valueTable[i]);
    }
    return s + ']';
  }
  // libGDX reuses two iterator objects per map (Collections.allocateIterators is false); new ones behave the
  // same for code that does not nest them, and the game does not
  iterator() { return this.entries(); }
  entries() { return new IntMap_Entries(this); }
  values() { return new IntMap_Values(this); }
  keys() { return new IntMap_Keys(this); }
}
defineLib(IntMap, 'com.badlogic.gdx.utils.IntMap', { ifaces: ['java.lang.Iterable'] });

export class IntMap_Entry extends JObject {
  key = 0;
  value: any = null;
  toString() { return this.key + '=' + $J.str(this.value); }
}
defineLib(IntMap_Entry, 'com.badlogic.gdx.utils.IntMap$Entry');

const INDEX_ILLEGAL = -2, INDEX_ZERO = -1;

class MapIterator extends JObject {
  hasNext_ = false;
  map: IntMap;
  nextIndex = 0;
  currentIndex = 0;
  constructor(map: IntMap) {
    super();
    this.map = map;
    this.reset();
  }
  reset() {
    this.currentIndex = INDEX_ILLEGAL;
    this.nextIndex = INDEX_ZERO;
    if (this.map.hasZeroValue) this.hasNext_ = true;
    else this.findNextIndex();
  }
  findNextIndex() {
    const keyTable = this.map.keyTable;
    for (const n = keyTable.length; ++this.nextIndex < n;) {
      if (keyTable[this.nextIndex] !== 0) {
        this.hasNext_ = true;
        return;
      }
    }
    this.hasNext_ = false;
  }
  hasNext() { return this.hasNext_; }
  remove() {
    let i = this.currentIndex;
    const map = this.map;
    if (i === INDEX_ZERO && map.hasZeroValue) {
      map.hasZeroValue = false;
      map.zeroValue = null;
    } else if (i < 0) {
      throw new IllegalStateException('next must be called before remove.');
    } else {
      const keyTable = map.keyTable, valueTable = map.valueTable, mask = map.mask;
      let next = (i + 1) & mask, key;
      while ((key = keyTable[next]) !== 0) {
        const placement = map.place(key);
        if (((next - placement) & mask) > ((i - placement) & mask)) {
          keyTable[i] = key;
          valueTable[i] = valueTable[next];
          i = next;
        }
        next = (next + 1) & mask;
      }
      keyTable[i] = 0;
      valueTable[i] = null;
      if (i !== this.currentIndex) --this.nextIndex;
    }
    this.currentIndex = INDEX_ILLEGAL;
    map.size--;
  }
  iterator() { return this; }
  advance(): number {
    if (!this.hasNext_) throw new NoSuchElementException();
    const i = this.nextIndex;
    this.currentIndex = i;
    this.findNextIndex();
    return i;
  }
}

export class IntMap_Entries extends MapIterator {
  entry = new IntMap_Entry();
  next() {
    const i = this.advance();
    this.entry.key = i === INDEX_ZERO ? 0 : this.map.keyTable[i];
    this.entry.value = i === INDEX_ZERO ? this.map.zeroValue : this.map.valueTable[i];
    return this.entry;
  }
}
defineLib(IntMap_Entries, 'com.badlogic.gdx.utils.IntMap$Entries', { ifaces: ['java.lang.Iterable', 'java.util.Iterator'] });

export class IntMap_Values extends MapIterator {
  next() {
    const i = this.advance();
    return i === INDEX_ZERO ? this.map.zeroValue : this.map.valueTable[i];
  }
  toArray() {
    const a = new GdxArray();
    while (this.hasNext_) a.add(this.next());
    return a;
  }
}
defineLib(IntMap_Values, 'com.badlogic.gdx.utils.IntMap$Values', { ifaces: ['java.lang.Iterable', 'java.util.Iterator'] });

export class IntMap_Keys extends MapIterator {
  next() {
    const i = this.advance();
    return i === INDEX_ZERO ? 0 : this.map.keyTable[i];
  }
  toArray(array?: IntArray) {
    const a = array ?? new IntArray();
    while (this.hasNext_) a.add(this.next());
    return a;
  }
}
defineLib(IntMap_Keys, 'com.badlogic.gdx.utils.IntMap$Keys');

/* ------------------------------------------------------------------ I18NBundle */

export const MissingResourceException = exc('MissingResourceException', RuntimeException, 'java.util.MissingResourceException');

const NONE = 0, SLASH = 1, UNICODE = 2, CONTINUE = 3, KEY_DONE = 4, IGNORE = 5;

/** java.lang.Character.isSpace (what PropertiesUtils uses): space, tab, newline, form feed, return. */
const isSpace = (c: number) => c === 32 || c === 9 || c === 10 || c === 12 || c === 13;

/** PropertiesUtils.load: a .properties text into a map, exactly as libGDX parses it. */
export function loadGdxProperties(properties: Map<string, string>, text: string) {
  let mode = NONE, unicode = 0, count = 0;
  let nextChar: number;
  const buf: number[] = [];
  let offset = 0, keyLength = -1;
  let firstChar = true;
  let pos = 0;
  const read = () => (pos < text.length ? text.charCodeAt(pos++) : -1);
  const str = (a: number, b: number) => String.fromCharCode(...buf.slice(a, b));
  const put = (k: string, v: string) => properties.set(k, v);
  for (;;) {
    let intVal = read();
    if (intVal === -1) break;
    nextChar = intVal;
    if (mode === UNICODE) {
      const digit = /[0-9a-fA-F]/.test(String.fromCharCode(nextChar)) ? parseInt(String.fromCharCode(nextChar), 16) : -1;
      if (digit >= 0) {
        unicode = (unicode << 4) + digit;
        if (++count < 4) continue;
      } else if (count <= 4) {
        throw new IllegalArgumentException('Invalid Unicode sequence: illegal character');
      }
      mode = NONE;
      buf[offset++] = unicode & 0xffff;
      if (nextChar !== 10) continue;
    }
    if (mode === SLASH) {
      mode = NONE;
      switch (nextChar) {
      case 13: mode = CONTINUE; continue;
      case 10: mode = IGNORE; continue;
      case 98: nextChar = 8; break; // b
      case 102: nextChar = 12; break; // f
      case 110: nextChar = 10; break; // n
      case 114: nextChar = 13; break; // r
      case 116: nextChar = 9; break; // t
      case 117: mode = UNICODE; unicode = count = 0; continue; // u
      default:
      }
    } else {
      let handled = false;
      switch (nextChar) {
      case 35: case 33: // # !
        if (firstChar) {
          for (;;) {
            intVal = read();
            if (intVal === -1) break;
            nextChar = intVal;
            if (nextChar === 13 || nextChar === 10) break;
          }
          handled = true;
        }
        break;
      case 10:
        if (mode === CONTINUE) {
          mode = IGNORE;
          handled = true;
          break;
        }
      // falls through
      case 13:
        mode = NONE;
        firstChar = true;
        if (offset > 0 || (offset === 0 && keyLength === 0)) {
          if (keyLength === -1) keyLength = offset;
          const temp = str(0, offset);
          put(temp.substring(0, keyLength), temp.substring(keyLength));
        }
        keyLength = -1;
        offset = 0;
        handled = true;
        break;
      case 92: // backslash
        if (mode === KEY_DONE) keyLength = offset;
        mode = SLASH;
        handled = true;
        break;
      case 58: case 61: // : =
        if (keyLength === -1) {
          mode = NONE;
          keyLength = offset;
          handled = true;
        }
        break;
      default:
      }
      if (handled) continue;
      if (isSpace(nextChar)) {
        if (mode === CONTINUE) mode = IGNORE;
        if (offset === 0 || offset === keyLength || mode === IGNORE) continue;
        if (keyLength === -1) {
          mode = KEY_DONE;
          continue;
        }
      }
      if (mode === IGNORE || mode === CONTINUE) mode = NONE;
    }
    firstChar = false;
    if (mode === KEY_DONE) {
      keyLength = offset;
      mode = NONE;
    }
    buf[offset++] = nextChar;
  }
  if (mode === UNICODE && count <= 4) throw new IllegalArgumentException('Invalid Unicode sequence: expected format \\uxxxx');
  if (keyLength === -1 && offset > 0) keyLength = offset;
  if (keyLength >= 0) {
    const temp = str(0, offset);
    let value = temp.substring(keyLength);
    if (mode === SLASH) value += '\u0000';
    put(temp.substring(0, keyLength), value);
  }
}

/** com.badlogic.gdx.utils.I18NBundle: a .properties bundle for a locale, with its parents for the fallbacks. */
export class I18NBundle extends JObject {
  static simpleFormatter = false;
  static exceptionOnMissingKey = true;
  parent: I18NBundle = null;
  locale: any = null;
  properties: Map<string, string> = null;
  static getSimpleFormatter() { return I18NBundle.simpleFormatter; }
  static setSimpleFormatter(b: boolean) { I18NBundle.simpleFormatter = b; }
  static getExceptionOnMissingKey() { return I18NBundle.exceptionOnMissingKey; }
  static setExceptionOnMissingKey(b: boolean) { I18NBundle.exceptionOnMissingKey = b; }
  static createBundle(base: any, a?: any, b?: any) {
    const locale = a instanceof Locale ? a : Locale.getDefault();
    const encoding = typeof a === 'string' ? a : typeof b === 'string' ? b : 'UTF-8';
    return I18NBundle.createBundleImpl(base, locale, encoding);
  }
  static createBundleImpl(baseFileHandle: any, locale: any, encoding: string) {
    if (baseFileHandle == null || locale == null || encoding == null) throw new NullPointerException();
    let bundle: I18NBundle = null;
    let baseBundle: I18NBundle = null;
    let targetLocale = locale;
    do {
      const candidateLocales = I18NBundle.getCandidateLocales(targetLocale);
      bundle = I18NBundle.loadBundleChain(baseFileHandle, encoding, candidateLocales, 0, baseBundle);
      if (bundle != null) {
        const bundleLocale = bundle.getLocale();
        const isBaseBundle = bundleLocale.equals(Locale.ROOT);
        if (!isBaseBundle || bundleLocale.equals(locale)) break;
        if (candidateLocales.length === 1 && bundleLocale.equals(candidateLocales[0])) break;
        if (baseBundle == null) baseBundle = bundle;
      }
      targetLocale = I18NBundle.getFallbackLocale(targetLocale);
    } while (targetLocale != null);
    if (bundle == null) {
      if (baseBundle == null) {
        throw new MissingResourceException("Can't find bundle for base file handle " + baseFileHandle.path() + ', locale ' + locale);
      }
      bundle = baseBundle;
    }
    return bundle;
  }
  static getCandidateLocales(locale: any): any[] {
    const language = locale.getLanguage(), country = locale.getCountry(), variant = locale.getVariant();
    const locales: any[] = [];
    if (variant !== '') locales.push(locale);
    if (country !== '') locales.push(locales.length === 0 ? locale : new Locale(language, country));
    if (language !== '') locales.push(locales.length === 0 ? locale : new Locale(language));
    locales.push(Locale.ROOT);
    return locales;
  }
  static getFallbackLocale(locale: any) {
    const def = Locale.getDefault();
    return locale.equals(def) ? null : def;
  }
  static loadBundleChain(base: any, encoding: string, candidates: any[], index: number, baseBundle: I18NBundle): I18NBundle {
    const targetLocale = candidates[index];
    let parent: I18NBundle = null;
    if (index !== candidates.length - 1) parent = I18NBundle.loadBundleChain(base, encoding, candidates, index + 1, baseBundle);
    else if (baseBundle != null && targetLocale.equals(Locale.ROOT)) return baseBundle;
    const bundle = I18NBundle.loadBundle(base, encoding, targetLocale);
    if (bundle != null) {
      bundle.parent = parent;
      return bundle;
    }
    return parent;
  }
  static loadBundle(base: any, _encoding: string, targetLocale: any): I18NBundle {
    let bundle: I18NBundle = null;
    const fh = I18NBundle.toFileHandle(base, targetLocale);
    let text: string = null;
    try {
      text = fh.readString();
    } catch (e) {
      text = null; // checkFileExistence: the file cannot be read
    }
    if (text != null) {
      bundle = new I18NBundle();
      bundle.properties = new Map();
      loadGdxProperties(bundle.properties, text);
      bundle.locale = targetLocale;
    }
    return bundle;
  }
  static toFileHandle(base: any, locale: any) {
    let sb = base.name();
    if (!locale.equals(Locale.ROOT)) {
      const language = locale.getLanguage(), country = locale.getCountry(), variant = locale.getVariant();
      if (!(language === '' && country === '' && variant === '')) {
        sb += '_';
        if (variant !== '') sb += language + '_' + country + '_' + variant;
        else if (country !== '') sb += language + '_' + country;
        else sb += language;
      }
    }
    return base.sibling(sb + '.properties');
  }
  getLocale() { return this.locale; }
  get(key: string): string {
    let result = this.properties.get(key);
    if (result === undefined) result = null;
    if (result == null) {
      if (this.parent != null) result = this.parent.get(key);
      if (result == null) {
        if (I18NBundle.exceptionOnMissingKey) throw new MissingResourceException("Can't find bundle key " + key);
        return '???' + key + '???';
      }
    }
    return result;
  }
  keys() {
    const r = new LinkedHashSet();
    for (const k of this.properties.keys()) r.add(k);
    return r;
  }
}
defineLib(I18NBundle, 'com.badlogic.gdx.utils.I18NBundle');

export { GdxRuntimeException };
