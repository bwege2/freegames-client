// common/Bson.h / Bson.cpp: the BSON subset the game's saves use, with the original's "nonconformance" hints.
//
// Representation of the variant's alternatives:
//   Object  Map<string, Bson>, iterated (and dumped) in key order like std::map<ByteString, Bson>
//   Array   Bson[]
//   String  a ByteString: a JS string of byte values 0..255 (one char per byte, not decoded)
//   User    Uint8Array
//   Double  number
//   Int32   number (int32)
//   Int64   bigint (int64)
//   Bool    boolean
// `b["key"] = value` is `b.set('key', value)` (returns the stored node, like the C++ reference),
// `b["key"]` (creating) is `b.index('key')`, `b.Get('key')` / `b.Get(i)` return the node or null.

// Bson::Type, in the order of the Wrapped variant
export const objectValue = 0, arrayValue = 1, stringValue = 2, userValue = 3, doubleValue = 4, int32Value = 5,
  int64Value = 6, boolValue = 7;

export type BsonObject = Map<string, Bson>;
export type BsonArray = Bson[];
type Wrapped = BsonObject | BsonArray | string | Uint8Array | number | bigint | boolean;

export class ParseError extends Error {}
export class DumpError extends Error {}

const maxDepth = 100;
const maxNodes = 1000000;

function defaultOf(type: number): Wrapped {
  switch (type) {
  case objectValue: return new Map();
  case arrayValue: return [];
  case stringValue: return '';
  case userValue: return new Uint8Array(0);
  case doubleValue: return 0;
  case int32Value: return 0;
  case int64Value: return 0n;
  default: return false;
  }
}

function byteCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export class Bson {
  private type: number;
  private wrapped: Wrapped;

  /** Bson() is an empty object (the variant's first alternative); Bson(Type) is that type's default */
  constructor(type = objectValue, value?: Wrapped) {
    this.type = type;
    this.wrapped = value === undefined ? defaultOf(type) : value;
  }

  static object(): Bson { return new Bson(objectValue); }
  static array(): Bson { return new Bson(arrayValue); }
  /** a ByteString (bytes as chars 0..255) */
  static string(s: string): Bson { return new Bson(stringValue, s); }
  static user(u: Uint8Array): Bson { return new Bson(userValue, u); }
  static double(d: number): Bson { return new Bson(doubleValue, d); }
  static int32(i: number): Bson { return new Bson(int32Value, i | 0); }
  static int64(i: bigint): Bson { return new Bson(int64Value, BigInt.asIntN(64, i)); }
  static bool(b: boolean): Bson { return new Bson(boolValue, b); }

  GetType(): number { return this.type; }
  Is(type: number): boolean { return this.type === type; }

  /** Ensure<Alternative>(): replaces the value with the alternative's default unless it already holds one */
  Ensure(type: number): void {
    if (this.type !== type) {
      this.type = type;
      this.wrapped = defaultOf(type);
    }
  }

  /** As<Alternative>(): throws (std::bad_variant_access in spirit) when the type differs */
  As<T extends Wrapped>(type: number): T {
    if (this.type !== type) throw new Error('Bson: bad variant access');
    return this.wrapped as T;
  }
  asObject(): BsonObject { return this.As<BsonObject>(objectValue); }
  asArray(): BsonArray { return this.As<BsonArray>(arrayValue); }
  asString(): string { return this.As<string>(stringValue); }
  asUser(): Uint8Array { return this.As<Uint8Array>(userValue); }
  asDouble(): number { return this.As<number>(doubleValue); }
  asInt32(): number { return this.As<number>(int32Value); }
  asInt64(): bigint { return this.As<bigint>(int64Value); }
  asBool(): boolean { return this.As<boolean>(boolValue); }

  /** operator[](key) / operator[](index): creates the node if missing */
  index(key: string | number): Bson {
    if (typeof key === 'number') {
      this.Ensure(arrayValue);
      const arr = this.wrapped as BsonArray;
      return arr[key];
    }
    this.Ensure(objectValue);
    const obj = this.wrapped as BsonObject;
    let node = obj.get(key);
    if (!node) {
      node = new Bson();
      obj.set(key, node);
    }
    return node;
  }

  /** b[key] = value: stores value (copied as C++ copies) and returns the stored node */
  set(key: string, value: Bson): Bson {
    this.Ensure(objectValue);
    const node = value.clone();
    (this.wrapped as BsonObject).set(key, node);
    return node;
  }

  /** const Bson *Get(key): null when missing; As<Object>/As<Array> must hold */
  Get(key: string | number): Bson | null {
    if (typeof key === 'number') {
      const arr = this.As<BsonArray>(arrayValue);
      if (key >= arr.length) return null;
      return arr[key];
    }
    const obj = this.As<BsonObject>(objectValue);
    return obj.get(key) ?? null;
  }

  GetSize(): number {
    if (this.type === objectValue) return (this.wrapped as BsonObject).size;
    return this.As<BsonArray>(arrayValue).length;
  }

  IsEmpty(): boolean { return this.GetSize() === 0; }

  /** Append(value): makes this an array if it is not one (Ensure<Array>) and returns the appended node */
  Append(value: Bson): Bson {
    this.Ensure(arrayValue);
    const node = value.clone();
    (this.wrapped as BsonArray).push(node);
    return node;
  }

  /** a deep copy (C++ copies Bson by value) */
  clone(): Bson {
    switch (this.type) {
    case objectValue: {
      const m: BsonObject = new Map();
      for (const [k, v] of this.wrapped as BsonObject) m.set(k, v.clone());
      return new Bson(objectValue, m);
    }
    case arrayValue: return new Bson(arrayValue, (this.wrapped as BsonArray).map((v) => v.clone()));
    case userValue: return new Bson(userValue, (this.wrapped as Uint8Array).slice());
    default: return new Bson(this.type, this.wrapped);
    }
  }

  /** objects' entries in key order (std::map iteration) */
  sortedEntries(): [string, Bson][] {
    return [...this.asObject().entries()].sort((a, b) => byteCompare(a[0], b[0]));
  }

  /** Bson::Parse(data, rootNonconformance) */
  static Parse(data: Uint8Array, rootNonconformance: Bson | null = null): Bson {
    const root = new Bson(objectValue);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    // Reader { at, data } where data = the bytes from `at` to `end`
    class Reader {
      at: number;
      end: number;
      constructor(at: number, end: number) { this.at = at; this.end = end; }
      copy(): Reader { return new Reader(this.at, this.end); }
      GetLeft(): number { return this.end - this.at; }
      Advance(by: number): void { this.at += by; }
      Throw(what: string): never { throw new ParseError(`${what} at byte offset ${this.at}`); }
      Bound(what: string, size: number): void {
        if (size < 0) this.Throw(`invalid size for ${what}`);
        if (this.GetLeft() < size) this.Throw(`missing ${what}`);
      }
      ReadI32(what: string): number { this.Bound(what, 4); return view.getInt32(this.at, true); }
      TakeI8(what: string): number { this.Bound(what, 1); const v = view.getInt8(this.at); this.Advance(1); return v; }
      TakeU8(what: string): number { this.Bound(what, 1); const v = view.getUint8(this.at); this.Advance(1); return v; }
      TakeI32(what: string): number { this.Bound(what, 4); const v = view.getInt32(this.at, true); this.Advance(4); return v; }
      TakeI64(what: string): bigint { this.Bound(what, 8); const v = view.getBigInt64(this.at, true); this.Advance(8); return v; }
      TakeF64(what: string): number { this.Bound(what, 8); const v = view.getFloat64(this.at, true); this.Advance(8); return v; }
    }
    const bytesToString = (from: number, to: number): string => {
      let s = '';
      for (let k = from; k < to; k++) s += String.fromCharCode(data[k]);
      return s;
    };
    interface StackEntry { value: Bson; nonconformance: Bson | null; reader: Reader }
    const stack: StackEntry[] = [];
    {
      const reader = new Reader(0, data.length);
      const size = reader.ReadI32('root size');
      const subreader = reader.copy();
      reader.Bound('root content', size);
      subreader.Advance(4);
      stack.push({ value: root, nonconformance: rootNonconformance, reader: subreader });
    }
    let nodes = 0;
    while (stack.length) {
      const top = stack[stack.length - 1];
      const reader = top.reader;
      nodes += 1;
      if (nodes >= maxNodes) reader.Throw('max node count exceeded');
      const elementReader = reader.copy();
      let elementType = reader.TakeI8('element type');
      if (elementType === 0) {
        stack.pop();
        continue;
      }
      let elementName: string;
      {
        const beginAt = reader.at;
        while (reader.TakeU8('element key byte'));
        elementName = bytesToString(beginAt, reader.at - 1);
      }
      const push = (element: Bson): Bson => {
        const value = top.value;
        if (value.Is(arrayValue)) {
          (value.wrapped as BsonArray).push(element);
          return element;
        }
        value.Ensure(objectValue);
        (value.wrapped as BsonObject).set(elementName, element);
        return element;
      };
      switch (elementType) {
      case 3:
      case 4: {
        let nonconformance: Bson | null = null;
        if (top.nonconformance && top.nonconformance.Is(objectValue)) {
          nonconformance = top.nonconformance.Get(elementName);
        }
        if (nonconformance && nonconformance.Is(arrayValue) && nonconformance.Get(0)!.asString() === 'objectEncodedAsArray') {
          elementType = 3;
        }
        const document = push(new Bson(elementType === 3 ? objectValue : arrayValue));
        const size = reader.ReadI32('document size');
        const subreader = reader.copy();
        reader.Bound('document content', size);
        reader.Advance(size);
        subreader.Advance(4);
        stack.push({ value: document, nonconformance, reader: subreader });
        if (stack.length >= maxDepth) reader.Throw('max depth exceeded');
        break;
      }
      case 2: {
        const sizeReader = reader.copy();
        const size = reader.TakeI32('string size');
        reader.Bound('string content', size);
        if (size < 1) sizeReader.Throw('invalid size for string');
        push(Bson.string(bytesToString(reader.at, reader.at + size - 1)));
        reader.Advance(size);
        break;
      }
      case 5: {
        const size = reader.TakeI32('userdata size');
        const subtypeReader = reader.copy();
        const subtype = reader.TakeU8('userdata subtype');
        if (subtype !== 128) subtypeReader.Throw(`bad userdata subtype ${subtype}`);
        reader.Bound('userdata content', size);
        push(Bson.user(data.slice(reader.at, reader.at + size)));
        reader.Advance(size);
        break;
      }
      case 1: push(Bson.double(reader.TakeF64('double value'))); break;
      case 8: push(Bson.bool(!!reader.TakeU8('bool value'))); break;
      case 10: break;
      case 16: push(Bson.int32(reader.TakeI32('int32 value'))); break;
      case 18: push(Bson.int64(reader.TakeI64('int64 value'))); break;
      default:
        elementReader.Throw(`bad element type ${elementType}`);
      }
    }
    return root;
  }

  /** Bson::Dump(rootNonconformance) */
  Dump(rootNonconformance: Bson | null = null): Uint8Array {
    if (!this.Is(objectValue)) throw new Error('assert(Is<Object>())');
    let buf = new Uint8Array(1024);
    let have = 0;
    const ensure = (n: number): void => {
      if (have + n > 0x7FFFFFFF) throw new DumpError('output too big');
      if (have + n <= buf.length) return;
      let size = buf.length * 2;
      while (size < have + n) size *= 2;
      const nb = new Uint8Array(size);
      nb.set(buf.subarray(0, have));
      buf = nb;
    };
    const writeI32At = (at: number, v: number): void => {
      buf[at] = v & 0xFF; buf[at + 1] = (v >>> 8) & 0xFF; buf[at + 2] = (v >>> 16) & 0xFF; buf[at + 3] = (v >>> 24) & 0xFF;
    };
    const writeU8 = (v: number): void => { ensure(1); buf[have++] = v & 0xFF; };
    const writeI32 = (v: number): void => { ensure(4); writeI32At(have, v); have += 4; };
    const writeBytes = (b: Uint8Array): void => { ensure(b.length); buf.set(b, have); have += b.length; };
    const writeByteString = (s: string): void => { ensure(s.length); for (let k = 0; k < s.length; k++) buf[have++] = s.charCodeAt(k) & 0xFF; };
    interface StackEntry { value: Bson; nonconformance: Bson | null; patchSizeAt: number; childIndex: number; children: [string, Bson][] | null }
    const stack: StackEntry[] = [];
    {
      const sizeAt = have;
      writeI32(0);
      stack.push({ value: this, nonconformance: rootNonconformance, patchSizeAt: sizeAt, childIndex: 0, children: this.sortedEntries() });
    }
    while (stack.length) {
      const top = stack[stack.length - 1];
      const value = top.value;
      const nonconformance = top.nonconformance;
      if (top.childIndex >= value.GetSize()) {
        writeU8(0);
        writeI32At(top.patchSizeAt, have - top.patchSizeAt);
        stack.pop();
        continue;
      }
      const childIndex = top.childIndex;
      top.childIndex += 1;
      let child: Bson;
      let elementName: string;
      if (value.Is(objectValue)) {
        [elementName, child] = top.children![childIndex];
      } else {
        elementName = String(childIndex);
        child = value.Get(childIndex)!;
      }
      if (nonconformance && nonconformance.Is(arrayValue) && nonconformance.Get(0)!.asString() === 'arrayEncodedWithBadKeys') {
        elementName = nonconformance.Get(1)!.asString();
      }
      const childType = child.GetType();
      const elementTypeAt = have;
      writeU8(0);
      writeByteString(elementName);
      writeU8(0);
      let elementType = 0;
      switch (childType) {
      case objectValue:
      case arrayValue: {
        elementType = childType === objectValue ? 3 : 4;
        const childNonconformance = (nonconformance && nonconformance.Is(objectValue)) ? nonconformance.Get(elementName) : null;
        if (childNonconformance && childNonconformance.Is(arrayValue) && childNonconformance.Get(0)!.asString() === 'objectEncodedAsArray') {
          elementType = 4;
        }
        const sizeAt = have;
        writeI32(0);
        stack.push({ value: child, nonconformance: childNonconformance, patchSizeAt: sizeAt, childIndex: 0,
          children: child.Is(objectValue) ? child.sortedEntries() : null });
        break;
      }
      case stringValue: {
        elementType = 2;
        const str = child.asString();
        if (str.length > 0x7FFFFFFF - 1) throw new DumpError('string too big');
        writeI32(str.length + 1);
        writeByteString(str);
        writeU8(0);
        break;
      }
      case userValue: {
        elementType = 5;
        const user = child.asUser();
        writeI32(user.length);
        writeU8(128);
        writeBytes(user);
        break;
      }
      case doubleValue: {
        elementType = 1;
        ensure(8);
        new DataView(buf.buffer).setFloat64(have, child.asDouble(), true);
        have += 8;
        break;
      }
      case int32Value: elementType = 16; writeI32(child.asInt32()); break;
      case int64Value: {
        elementType = 18;
        ensure(8);
        new DataView(buf.buffer).setBigInt64(have, child.asInt64(), true);
        have += 8;
        break;
      }
      case boolValue: elementType = 8; writeU8(child.asBool() ? 1 : 0); break;
      }
      buf[elementTypeAt] = elementType;
    }
    return buf.slice(0, have);
  }

  /** operator== */
  equals(other: Bson): boolean {
    if (this.type !== other.type) return false;
    switch (this.type) {
    case objectValue: {
      const a = this.sortedEntries(), b = other.sortedEntries();
      return a.length === b.length && a.every(([k, v], i) => k === b[i][0] && v.equals(b[i][1]));
    }
    case arrayValue: {
      const a = this.asArray(), b = other.asArray();
      return a.length === b.length && a.every((v, i) => v.equals(b[i]));
    }
    case userValue: {
      const a = this.asUser(), b = other.asUser();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    default: return this.wrapped === other.wrapped;
    }
  }
}
