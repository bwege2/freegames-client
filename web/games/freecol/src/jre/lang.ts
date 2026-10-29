// @ts-nocheck
// The parts of java.lang the translated FreeCol code uses (re/freecol/tools/j2ts, NOTES.md "The runtime").
// Java semantics where they differ from JavaScript: int division, float printing, string hashes,
// exceptions, class objects; and the registry that links the translated modules.

/* ------------------------------------------------------------------ registry */

const classes = new Map<string, any>();
const lambdaClasses = new Map<string, any>();
const linkers: (() => void)[] = [];
const primitiveClasses = new Map<string, JClass>();
let identitySeq = 1;

function own(c: any, p: string): any {
  return Object.prototype.hasOwnProperty.call(c, p) ? c[p] : undefined;
}

/** Interfaces of the Java library, by Java name (the runtime registers them). */
export function defineLib(cls: any, name: string, meta: any = {}) {
  cls.$meta = { kind: 'class', ...meta, name, lib: true };
  classes.set(name, cls);
  return cls;
}

/**
 * A library class the port does not provide yet (pending.ts): the module graph loads, and the first use
 * (new, a static member, an init method of a subclass) throws an error that names it.
 */
export function pendingClass(name: string, javaName: string): any {
  const fail = (what: string) => {
    throw new Error(`${javaName}${what} is not in the port's runtime yet (jre/pending.ts)`);
  };
  const C = { [name]: class extends JObject {
    constructor() {
      super();
      fail(' (new)');
    }
  } }[name];
  defineLib(C, javaName, { pending: true });
  const known = new Set<PropertyKey>(['prototype', '$meta', 'name', 'length', 'call', 'apply', 'bind', 'toString',
    Symbol.hasInstance, '$clinit', '$lazy', 'constructor']);
  return new Proxy(C, {
    get(t, p, r) {
      if (known.has(p) || typeof p === 'symbol' || Object.prototype.hasOwnProperty.call(t, p)) return Reflect.get(t, p, r);
      return fail('.' + String(p));
    },
  });
}

/* ------------------------------------------------------------------ Object */

export class JObject {
  declare $outer: any; // set by $o only: no field on every object
  /** Sets the enclosing instance of an inner class (before its init). */
  $o(outer: any): this {
    this.$outer = outer;
    return this;
  }
  equals(o: any): boolean {
    return this === o;
  }
  hashCode(): number {
    return identityHash(this);
  }
  toString(): string {
    return $J.getClass(this).getName() + '@' + (this.hashCode() >>> 0).toString(16);
  }
  /** Object.clone: a shallow copy (the class's fields copied, arrays shared). */
  clone(): any {
    const o = Object.create(Object.getPrototypeOf(this));
    Object.assign(o, this);
    if ((this as any).$outer !== undefined) o.$outer = (this as any).$outer;
    return o;
  }
  /** Object's monitor methods, called without a receiver in translated code. */
  wait(ms?: number) {
    $J.monitorWait(this, ms);
  }
  notify() {
    $J.monitorNotify(this, false);
  }
  notifyAll() {
    $J.monitorNotify(this, true);
  }
  getClass(): JClass {
    return $J.getClass(this);
  }
  [Symbol.iterator]() {
    return jsIter(this.iterator());
  }
}

/**
 * Object.hashCode / System.identityHashCode. Java's identity hashes come from HotSpot and differ between
 * JVMs, and a few of FreeCol's orders depend on them (enum constants hashed into HashSets of modifiers,
 * ...). The oracle runs HotSpot with -XX:hashCode=2, where every identity hash is 1, and so does the port:
 * both are then reproducible and the same.
 */
export function identityHash(_o: any): number {
  return 1;
}

/** A per-object number for names (Object.toString), not the hash. */
export function objectNumber(o: any): number {
  if (o.$num === undefined) Object.defineProperty(o, '$num', { value: identitySeq++, enumerable: false });
  return o.$num;
}

/** A Java Iterator as a JavaScript one. */
class JsIter {
  it: any;
  constructor(it: any) {
    this.it = it;
  }
  next() {
    return this.it.hasNext() ? { value: this.it.next(), done: false } : { value: undefined, done: true };
  }
  [Symbol.iterator]() {
    return this;
  }
}

export function jsIter(it: any): Iterator<any> {
  return new JsIter(it) as any;
}

/* ------------------------------------------------------------------ Class objects */

const modules: Record<string, any> = {};

export class JClass extends JObject {
  $c: any;
  $name: string;
  $prim: any;
  $array: any;
  constructor($c: any, $name: string, $prim = false, $array = false) {
    super();
    this.$c = $c; this.$name = $name; this.$prim = $prim; this.$array = $array;
  }
  getName(): string {
    return this.$name;
  }
  getSimpleName(): string {
    const n = this.$name;
    if (this.$array) return n;
    return n.substring(Math.max(n.lastIndexOf('.'), n.lastIndexOf('$')) + 1);
  }
  getTypeName(): string {
    return this.$name.replace(/\$/g, '.');
  }
  toString(): string {
    return (this.$prim ? '' : this.isInterface() ? 'interface ' : 'class ') + this.$name;
  }
  isInterface(): boolean {
    const m = this.$c && own(this.$c, '$meta');
    return !!m && m.kind === 'interface';
  }
  isEnum(): boolean {
    const m = this.$c && own(this.$c, '$meta');
    return !!m && m.kind === 'enum';
  }
  isPrimitive(): boolean {
    return this.$prim;
  }
  isArray(): boolean {
    return this.$array;
  }
  isInstance(o: any): boolean {
    return $J.isa(o, this.$c);
  }
  cast(o: any): any {
    if (o != null && !this.$prim && this.$c && !$J.isa(o, this.$c)) {
      throw new ClassCastException('Cannot cast ' + $J.getClass(o).getName() + ' to ' + this.$name);
    }
    return o;
  }
  isAssignableFrom(other: JClass): boolean {
    if (other === this) return true;
    if (!other.$c || !this.$c) return false;
    if (this.$c === JObject) return !other.$prim;
    if (other.$c.prototype instanceof this.$c) return true;
    return ifaceSet(other.$c).has(this.$c);
  }
  getEnumConstants(): any[] {
    return this.$c.$VALUES ? this.$c.$VALUES.slice() : null;
  }
  getSuperclass(): JClass {
    const p = Object.getPrototypeOf(this.$c);
    return p && p !== Function.prototype ? $J.cls(p) : null;
  }
  getDeclaredConstructor(...types: JClass[]): Constructor {
    const meta = own(this.$c, '$meta');
    const key = types.map((t) => t.$name).join(',');
    const init = meta && meta.ctors && meta.ctors[key];
    if (!init && !(key === '' && meta && meta.lib)) {
      throw new NoSuchMethodException(this.$name + '.<init>(' + key + ')');
    }
    return new Constructor(this, init);
  }
  getConstructor(...types: JClass[]): Constructor {
    return this.getDeclaredConstructor(...types);
  }
  getMethod(name: string, ...types: JClass[]): Method {
    const c = this.$c;
    const key = name + '(' + types.map((t) => t.$name).join(',') + ')';
    for (let k = c; k && k !== Function.prototype; k = Object.getPrototypeOf(k)) {
      const meta = own(k, '$meta');
      if (meta && meta.meths && meta.meths[key]) return new Method(this, meta.meths[key], name, types);
    }
    if (typeof c.prototype[name] === 'function' || typeof c[name] === 'function') return new Method(this, name, name, types);
    throw new NoSuchMethodException(this.$name + '.' + key);
  }
  getDeclaredMethod(name: string, ...types: JClass[]): Method {
    return this.getMethod(name, ...types);
  }
  getField(name: string): Field {
    if (!(name in this.$c)) throw new NoSuchFieldException(name);
    return new Field(this, name);
  }
  getDeclaredField(name: string): Field {
    return this.getField(name);
  }
  getModifiers(): number {
    return 1;
  }
  /** An array class's element class ('[Lpkg.C;', '[I', ...). */
  getComponentType(): any {
    const n = this.$name;
    if (!n || n[0] !== '[') return null;
    const e = n.substring(1);
    if (e[0] === 'L') {
      const c = classes.get(e.substring(1, e.length - 1));
      return $J.cls(c ?? JObject);
    }
    if (e[0] === '[') return $J.cls(e);
    return $J.cls({ I: 'int', J: 'long', D: 'double', F: 'float', Z: 'boolean', C: 'char', B: 'byte', S: 'short' }[e] ?? 'int');
  }
  /** A resource next to the class (or absolute, with a leading slash): the JDK's resources in /jdk/res. */
  resourcePath(name: string): string {
    if (name.startsWith('/')) return name.substring(1);
    const n = this.$name;
    const pkg = n.includes('.') ? n.substring(0, n.lastIndexOf('.')).replace(/\./g, '/') : '';
    return (pkg ? pkg + '/' : '') + name;
  }
  getResourceAsStream(name: string): any {
    return $J.classResource ? $J.classResource(this.resourcePath(name), true) : null;
  }
  getResource(name: string): any {
    return $J.classResource ? $J.classResource(this.resourcePath(name), false) : null;
  }
  /** Modules: the JDK's classes are java.desktop's or java.base's, the others the unnamed module's. */
  getModule(): any {
    const n = this.$name;
    const name = /^(javax\.swing|java\.awt|java\.beans|sun\.awt|sun\.swing|sun\.font|sun\.java2d|javax\.accessibility)/.test(n)
      ? 'java.desktop' : /^(java|javax|sun|jdk)\./.test(n) ? 'java.base' : null;
    return modules[name ?? ''] ??= { getName: () => name, isNamed: () => name != null, getClassLoader: () => null,
      getResourceAsStream: (_p: string) => null, toString: () => (name ? 'module ' + name : 'unnamed module') };
  }
  /** The JDK's classes come from the boot loader (null), the others from the application's. */
  getClassLoader(): any {
    return /^(java|javax|sun|jdk)\./.test(this.$name) ? null : $J.appClassLoader;
  }
  static forName(name: any, ...rest: any[]): JClass {
    if (typeof name !== 'string') {
      // forName(Module, String): null when the class is not there
      const c = classes.get(rest[0]);
      return c ? $J.cls(c) : $J.jdkResource?.(rest[0]) ? $J.cls(JObject) : null;
    }
    const c = classes.get(name);
    if (!c) throw new ClassNotFoundException(name);
    return $J.cls(c);
  }
}

export class Constructor extends JObject {
  cls: JClass;
  init: string;
  constructor(cls: JClass, init: string) {
    super();
    this.cls = cls; this.init = init;
  }
  newInstance(...args: any[]): any {
    const C = this.cls.$c;
    const meta = own(C, '$meta');
    if (meta && meta.lib) return new C(...args);
    const o = new C();
    return o[this.init](...args);
  }
  getDeclaringClass(): JClass {
    return this.cls;
  }
}

export class Method extends JObject {
  cls: JClass;
  ts: string;
  jname: string;
  types: JClass[];
  constructor(cls: JClass, ts: string, jname: string, types: JClass[]) {
    super();
    this.cls = cls; this.ts = ts; this.jname = jname; this.types = types;
  }
  getName(): string {
    return this.jname;
  }
  getModifiers(): number {
    return typeof this.cls.$c[this.ts] === 'function' && typeof this.cls.$c.prototype[this.ts] !== 'function' ? 9 : 1;
  }
  getParameterTypes(): JClass[] {
    return this.types;
  }
  getReturnType(): JClass {
    // the translation records the return types of FreeCol's getters (meta.returns) on the declaring class
    for (let k = this.cls.$c; k && k !== Function.prototype; k = Object.getPrototypeOf(k)) {
      const meta = own(k, '$meta');
      const r = meta && meta.returns && meta.returns[this.ts];
      if (r) return PRIMITIVES.has(r) ? $J.cls(r) : $J.cls($J.load(r));
    }
    return $J.cls(JObject);
  }
  invoke(obj: any, ...args: any[]): any {
    // a static method ignores its receiver, as in Java
    if (obj == null || (typeof this.cls.$c[this.ts] === "function" && typeof obj[this.ts] !== "function")) return this.cls.$c[this.ts](...args);
    return obj[this.ts](...args);
  }
}

const PRIMITIVES = new Set(['int', 'long', 'short', 'byte', 'char', 'boolean', 'float', 'double']);

export class Field extends JObject {
  cls: JClass;
  name: string;
  constructor(cls: JClass, name: string) {
    super();
    this.cls = cls; this.name = name;
  }
  get(obj: any): any {
    // a static field (getField finds only those on the class) ignores the object, as Java does
    return obj == null || this.name in this.cls.$c ? this.cls.$c[this.name] : obj[this.name];
  }
  getInt(obj: any): number {
    return this.get(obj) | 0;
  }
  getLong(obj: any): number {
    return this.get(obj);
  }
  getBoolean(obj: any): boolean {
    return !!this.get(obj);
  }
  set(obj: any, v: any) {
    if (obj == null) this.cls.$c[this.name] = v;
    else obj[this.name] = v;
  }
  getName(): string {
    return this.name;
  }
  getModifiers(): number {
    return 1 | 8 | 16; // public static final: what FreeCol and Swing look up by name are constants
  }
  setAccessible(_b: boolean) {}
}

/** The interfaces (as runtime objects) a class implements, transitively. */
export function ifaceSet(c: any): Set<any> {
  if (!c) return new Set();
  const cached = own(c, '$ifaceSet');
  if (cached) return cached;
  const s = new Set<any>();
  const parent = Object.getPrototypeOf(c);
  if (parent && parent !== Function.prototype) for (const i of ifaceSet(parent)) s.add(i);
  const meta = own(c, '$meta');
  const add = (i: any) => {
    if (!i || s.has(i)) return;
    s.add(i);
    for (const j of ifaceSet(i)) add(j);
  };
  if (meta && meta.ifaces) {
    for (const n of meta.ifaces) add(typeof n === 'string' ? classes.get(n) : n);
  }
  Object.defineProperty(c, '$ifaceSet', { value: s, enumerable: false });
  return s;
}

/* ------------------------------------------------------------------ Throwable */

export class Throwable extends JObject {
  detailMessage: string = null;
  cause: any = null;
  $stack: string;
  constructor(...a: any[]) {
    super();
    this.$stack = new Error().stack;
    if (a.length) this._Throwable(...a);
  }
  _Throwable(a?: any, b?: any): this {
    if (a instanceof Throwable || a instanceof Error) {
      this.cause = a;
      this.detailMessage = a == null ? null : $J.str(a);
    } else {
      this.detailMessage = a === undefined ? null : a;
      if (b !== undefined) this.cause = b;
    }
    return this;
  }
  getMessage(): string {
    return this.detailMessage;
  }
  getLocalizedMessage(): string {
    return this.getMessage();
  }
  getCause(): any {
    return this.cause;
  }
  initCause(c: any): this {
    this.cause = c;
    return this;
  }
  toString(): string {
    const m = this.getLocalizedMessage();
    const n = $J.getClass(this).getName();
    return m != null ? n + ': ' + m : n;
  }
  printStackTrace(s?: any) {
    const t = this.toString() + '\n' + this.$stack;
    if (s && s.println) s.println(t);
    else if ($J.verbose) console.error(t);
  }
  getStackTrace(): any[] {
    return [];
  }
  setStackTrace() {}
  addSuppressed() {}
  fillInStackTrace(): this {
    return this;
  }
}

/** Makes a Java exception class with the init method _Name. */
export function exc(name: string, parent: any, javaName: string): any {
  const C = {
    [name]: class extends parent {
      constructor(...a: any[]) {
        super();
        if (a.length) this._Throwable(...a);
      }
    },
  }[name];
  C.prototype['_' + name] = function (...a: any[]) {
    return this._Throwable(...a);
  };
  defineLib(C, javaName);
  return C;
}

export const Exception = exc('Exception', Throwable, 'java.lang.Exception');
export const JError = exc('JError', Throwable, 'java.lang.Error');
(JError as any).prototype._Error = (JError as any).prototype._JError;
export const RuntimeException = exc('RuntimeException', Exception, 'java.lang.RuntimeException');
export const IllegalArgumentException = exc('IllegalArgumentException', RuntimeException, 'java.lang.IllegalArgumentException');
export const IllegalStateException = exc('IllegalStateException', RuntimeException, 'java.lang.IllegalStateException');
export const NullPointerException = exc('NullPointerException', RuntimeException, 'java.lang.NullPointerException');
export const ClassCastException = exc('ClassCastException', RuntimeException, 'java.lang.ClassCastException');
export const ArithmeticException = exc('ArithmeticException', RuntimeException, 'java.lang.ArithmeticException');
export const NumberFormatException = exc('NumberFormatException', IllegalArgumentException, 'java.lang.NumberFormatException');
export const UnsupportedOperationException = exc('UnsupportedOperationException', RuntimeException, 'java.lang.UnsupportedOperationException');
export const IndexOutOfBoundsException = exc('IndexOutOfBoundsException', RuntimeException, 'java.lang.IndexOutOfBoundsException');
export const ArrayIndexOutOfBoundsException = exc('ArrayIndexOutOfBoundsException', IndexOutOfBoundsException, 'java.lang.ArrayIndexOutOfBoundsException');
export const StringIndexOutOfBoundsException = exc('StringIndexOutOfBoundsException', IndexOutOfBoundsException, 'java.lang.StringIndexOutOfBoundsException');
export const NegativeArraySizeException = exc('NegativeArraySizeException', RuntimeException, 'java.lang.NegativeArraySizeException');
export const SecurityException = exc('SecurityException', RuntimeException, 'java.lang.SecurityException');
export const ConcurrentModificationException = exc('ConcurrentModificationException', RuntimeException, 'java.util.ConcurrentModificationException');
export const NoSuchElementException = exc('NoSuchElementException', RuntimeException, 'java.util.NoSuchElementException');
export const ReflectiveOperationException = exc('ReflectiveOperationException', Exception, 'java.lang.ReflectiveOperationException');
export const ClassNotFoundException = exc('ClassNotFoundException', ReflectiveOperationException, 'java.lang.ClassNotFoundException');
export const NoSuchMethodException = exc('NoSuchMethodException', ReflectiveOperationException, 'java.lang.NoSuchMethodException');
export const NoSuchFieldException = exc('NoSuchFieldException', ReflectiveOperationException, 'java.lang.NoSuchFieldException');
export const InstantiationException = exc('InstantiationException', ReflectiveOperationException, 'java.lang.InstantiationException');
export const IllegalAccessException = exc('IllegalAccessException', ReflectiveOperationException, 'java.lang.IllegalAccessException');
export const InvocationTargetException = exc('InvocationTargetException', ReflectiveOperationException, 'java.lang.reflect.InvocationTargetException');
export const InterruptedException = exc('InterruptedException', Exception, 'java.lang.InterruptedException');
export const CloneNotSupportedException = exc('CloneNotSupportedException', Exception, 'java.lang.CloneNotSupportedException');
export const StackOverflowError = exc('StackOverflowError', JError, 'java.lang.StackOverflowError');
export const OutOfMemoryError = exc('OutOfMemoryError', JError, 'java.lang.OutOfMemoryError');
export const AssertionError = exc('AssertionError', JError, 'java.lang.AssertionError');
export const IOException = exc('IOException', Exception, 'java.io.IOException');
export const FileNotFoundException = exc('FileNotFoundException', IOException, 'java.io.FileNotFoundException');
export const EOFException = exc('EOFException', IOException, 'java.io.EOFException');
export const UncheckedIOException = exc('UncheckedIOException', RuntimeException, 'java.io.UncheckedIOException');
export const TimeoutException = exc('TimeoutException', Exception, 'java.util.concurrent.TimeoutException');
export const URISyntaxException = exc('URISyntaxException', Exception, 'java.net.URISyntaxException');
export const UnknownHostException = exc('UnknownHostException', IOException, 'java.net.UnknownHostException');
export const XMLStreamException = exc('XMLStreamException', Exception, 'javax.xml.stream.XMLStreamException');
export const TransformerException = exc('TransformerException', Exception, 'javax.xml.transform.TransformerException');
export const SAXException = exc('SAXException', Exception, 'org.xml.sax.SAXException');
export const HeadlessException = exc('HeadlessException', UnsupportedOperationException, 'java.awt.HeadlessException');
export const FontFormatException = exc('FontFormatException', Exception, 'java.awt.FontFormatException');
export const LineUnavailableException = exc('LineUnavailableException', Exception, 'javax.sound.sampled.LineUnavailableException');
export const UnsupportedAudioFileException = exc('UnsupportedAudioFileException', Exception, 'javax.sound.sampled.UnsupportedAudioFileException');

/** A native JavaScript error as the Java exception it stands for. */
function javaException(e: any): any {
  if (e instanceof JObject) return e;
  if (e instanceof RangeError && /call stack/i.test(e.message)) return new StackOverflowError(e.message).initCause(e);
  if (e instanceof TypeError) {
    const x = new NullPointerException(e.message);
    x.$stack = e.stack;
    return x;
  }
  const x = new RuntimeException(e && e.message ? e.message : String(e));
  x.$stack = e && e.stack;
  return x;
}

/* ------------------------------------------------------------------ Enum */

export class JEnum extends JObject {
  $name: string = null;
  $ordinal = 0;
  _JEnum(name: string, ordinal: number): this {
    this.$name = name;
    this.$ordinal = ordinal;
    return this;
  }
  name(): string {
    return this.$name;
  }
  ordinal(): number {
    return this.$ordinal;
  }
  toString(): string {
    return this.$name;
  }
  compareTo(o: any): number {
    return this.$ordinal - o.$ordinal;
  }
  getDeclaringClass(): JClass {
    let c = this.constructor as any;
    while (!own(c, '$VALUES') && Object.getPrototypeOf(c) !== JEnum) c = Object.getPrototypeOf(c);
    return $J.cls(c);
  }
  static valueOf(cls: any, name: string) {
    return $J.enumValueOf(cls, name);
  }
}

/* ------------------------------------------------------------------ Java's number printing */

/** Shortest digits and decimal exponent of x (x != 0, finite): x = 0.d1d2... * 10^(e+1) as d1.d2... * 10^e. */
function digitsOf(s: string): { digits: string; exp: number } {
  const m = /^(\d)(?:\.(\d+))?e([+-]\d+)$/.exec(s)!;
  let digits = m[1] + (m[2] || '');
  digits = digits.replace(/0+$/, '') || '0';
  return { digits, exp: parseInt(m[3], 10) };
}

function javaFormat(neg: boolean, digits: string, exp: number): string {
  const ax = (s: string) => (neg ? '-' : '') + s;
  if (exp >= -3 && exp < 7) {
    let r: string;
    if (exp >= 0) {
      const ip = digits.length > exp + 1 ? digits.substring(0, exp + 1) : digits + '0'.repeat(exp + 1 - digits.length);
      const fp = digits.length > exp + 1 ? digits.substring(exp + 1) : '0';
      r = ip + '.' + fp;
    } else {
      r = '0.' + '0'.repeat(-exp - 1) + digits;
    }
    return ax(r);
  }
  return ax(digits[0] + '.' + (digits.length > 1 ? digits.substring(1) : '0') + 'E' + exp);
}

/** Double.toString. */
export function dstr(d: number): string {
  if (Number.isNaN(d)) return 'NaN';
  if (d === Infinity) return 'Infinity';
  if (d === -Infinity) return '-Infinity';
  if (d === 0) return Object.is(d, -0) ? '-0.0' : '0.0';
  const a = Math.abs(d);
  let s = a.toExponential();
  // Java (JDK 19+): the shortest decimal that reads back, but with at least two digits: the closest of those
  if (!s.includes('.')) s = a.toExponential(1);
  const { digits, exp } = digitsOf(s);
  return javaFormat(d < 0, digits, exp);
}

/** Float.toString: the shortest decimal (at least two digits) that reads back as the same float. */
export function fstr(f: number): string {
  f = Math.fround(f);
  if (Number.isNaN(f)) return 'NaN';
  if (f === Infinity) return 'Infinity';
  if (f === -Infinity) return '-Infinity';
  if (f === 0) return Object.is(f, -0) ? '-0.0' : '0.0';
  const a = Math.abs(f);
  for (let p = 2; p <= 9; p++) {
    const s = a.toExponential(p - 1);
    if (Math.fround(parseFloat(s)) === a) {
      const { digits, exp } = digitsOf(s);
      return javaFormat(f < 0, digits, exp);
    }
  }
  return dstr(f);
}

/* ------------------------------------------------------------------ strings */

const strHashCache = new Map<string, number>();

export function stringHash(s: string): number {
  if (s.length < 48) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return h;
  }
  let h = strHashCache.get(s);
  if (h !== undefined) return h;
  h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  if (strHashCache.size < 200000) strHashCache.set(s, h);
  return h;
}

const bitsBuf = new DataView(new ArrayBuffer(8));

function doubleHash(d: number): number {
  const buf = bitsBuf;
  buf.setFloat64(0, Number.isNaN(d) ? NaN : d);
  return (buf.getInt32(0) ^ buf.getInt32(4)) | 0;
}

/** Java's regex syntax to JavaScript's (the parts FreeCol uses). */
export function jsRegex(re: string, flags = ''): RegExp {
  let s = re.replace(/\\p\{Alpha\}/g, '[A-Za-z]').replace(/\\p\{Digit\}/g, '[0-9]').replace(/\\p\{Alnum\}/g, '[A-Za-z0-9]')
    .replace(/\\p\{Punct\}/g, '[!-\\/:-@\\[-`{-~]').replace(/\\p\{Space\}/g, '\\s').replace(/\\p\{Upper\}/g, '[A-Z]')
    .replace(/\\p\{Lower\}/g, '[a-z]').replace(/\\Q([\s\S]*?)\\E/g, (_m, q) => q.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'));
  return new RegExp(s, flags.includes('u') || /\\p\{/.test(s) ? flags + (flags.includes('u') ? '' : 'u') : flags);
}

export class JString {
  static hashCode(s: string): number {
    return stringHash(s);
  }
  static compareTo(a: string, b: string): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const d = a.charCodeAt(i) - b.charCodeAt(i);
      if (d !== 0) return d;
    }
    return a.length - b.length;
  }
  static compareToIgnoreCase(a: string, b: string): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      let c1 = a.charCodeAt(i), c2 = b.charCodeAt(i);
      if (c1 !== c2) {
        c1 = Character.toLowerCase(Character.toUpperCase(c1));
        c2 = Character.toLowerCase(Character.toUpperCase(c2));
        if (c1 !== c2) return c1 - c2;
      }
    }
    return a.length - b.length;
  }
  static equalsIgnoreCase(a: string, b: string): boolean {
    return b != null && a.length === b.length && JString.compareToIgnoreCase(a, b) === 0;
  }
  static trim(s: string): string {
    let st = 0, len = s.length;
    while (st < len && s.charCodeAt(st) <= 32) st++;
    while (st < len && s.charCodeAt(len - 1) <= 32) len--;
    return st > 0 || len < s.length ? s.substring(st, len) : s;
  }
  static strip(s: string): string {
    return s.trim();
  }
  static isBlank(s: string): boolean {
    return s.trim().length === 0;
  }
  static split(s: string, regex: string, limit = 0): string[] {
    const list: string[] = [];
    // fast path of String.split: one character that is not a regex metacharacter, or an escaped one
    let ch: string | null = null;
    if (regex.length === 1 && '.$|()[{^?*+\\'.indexOf(regex) < 0) ch = regex;
    else if (regex.length === 2 && regex[0] === '\\' && !/[0-9a-zA-Z]/.test(regex[1])) ch = regex[1];
    if (ch !== null) {
      let off = 0, next: number;
      const limited = limit > 0;
      while ((next = s.indexOf(ch, off)) !== -1) {
        if (!limited || list.length < limit - 1) {
          list.push(s.substring(off, next));
          off = next + 1;
        } else {
          break;
        }
      }
      if (off === 0) return [s];
      if (!limited || list.length < limit) list.push(s.substring(off));
      let size = list.length;
      if (limit === 0) while (size > 0 && list[size - 1].length === 0) size--;
      return list.slice(0, size);
    }
    const re = jsRegex(regex, 'g');
    let index = 0;
    let m: RegExpExecArray | null;
    const matchLimited = limit > 0;
    while ((m = re.exec(s)) !== null) {
      if (m[0].length === 0) {
        if (re.lastIndex >= s.length) break;
        if (m.index === 0) { re.lastIndex++; continue; }
      }
      if (!matchLimited || list.length < limit - 1) {
        if (index === 0 && index === m.index && m.index === m.index + m[0].length) { re.lastIndex++; continue; }
        list.push(s.substring(index, m.index));
        index = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      } else if (list.length === limit - 1) {
        break;
      }
    }
    if (index === 0) return [s];
    if (!matchLimited || list.length < limit) list.push(s.substring(index));
    let size = list.length;
    if (limit === 0) while (size > 0 && list[size - 1].length === 0) size--;
    return list.slice(0, size);
  }
  static replace(s: string, a: string, b: string): string {
    return s.split(String(a)).join(String(b));
  }
  static replaceChar(s: string, a: number, b: number): string {
    return s.split(String.fromCharCode(a)).join(String.fromCharCode(b));
  }
  static replaceAll(s: string, regex: string, rep: string): string {
    return s.replace(jsRegex(regex, 'g'), javaReplacement(rep));
  }
  static replaceFirst(s: string, regex: string, rep: string): string {
    return s.replace(jsRegex(regex), javaReplacement(rep));
  }
  static matches(s: string, regex: string): boolean {
    return jsRegex('^(?:' + regex + ')$').test(s);
  }
  static toCharArray(s: string): number[] {
    const r = new Array(s.length);
    for (let i = 0; i < s.length; i++) r[i] = s.charCodeAt(i);
    return r;
  }
  static fromChars(a: number[], off = 0, n = a.length - off): string {
    let r = '';
    for (let i = off; i < off + n; i++) r += String.fromCharCode(a[i]);
    return r;
  }
  static newString(a?: any, b?: any, c?: any): string {
    if (a === undefined) return '';
    if (typeof a === 'string') return a;
    if (a instanceof StringBuilder) return a.toString();
    if (a instanceof Uint8Array || (Array.isArray(a) && (b === undefined || typeof b !== 'number') && a.$bytes)) return utf8Decode(a);
    if (Array.isArray(a)) {
      if (typeof b === 'number') return JString.fromChars(a, b, c);
      return JString.fromChars(a);
    }
    return utf8Decode(a);
  }
  static getBytes(s: string): Uint8Array {
    return new TextEncoder().encode(s);
  }
  static valueOf(x: any): string {
    return str(x);
  }
  static format(fmt: string, ...args: any[]): string {
    return javaFormatString(fmt, args);
  }
  static join(sep: string, ...elems: any[]): string {
    let items: any[];
    if (elems.length === 1 && elems[0] != null && typeof elems[0] !== 'string' && elems[0][Symbol.iterator]) items = [...elems[0]];
    else items = elems;
    return items.map((x) => str(x)).join(sep);
  }
  static chars(s: string): any {
    return $J.intStreamOf(JString.toCharArray(s));
  }
  static repeat(s: string, n: number): string {
    return s.repeat(n);
  }
  static codePointAt(s: string, i: number): number {
    return s.codePointAt(i);
  }
  static regionMatches(s: string, ...a: any[]): boolean {
    let ic = false;
    if (typeof a[0] === 'boolean') ic = a.shift();
    const [to, other, oo, len] = a;
    let x = s.substring(to, to + len), y = other.substring(oo, oo + len);
    if (to < 0 || oo < 0 || to + len > s.length || oo + len > other.length) return false;
    return ic ? JString.equalsIgnoreCase(x, y) : x === y;
  }
  static lastIndexOf(s: string, x: any, from?: number): number {
    return from === undefined ? s.lastIndexOf(x) : s.lastIndexOf(x, from);
  }
  static subSequence(s: string, a: number, b: number): string {
    return s.substring(a, b);
  }
  static isEmpty(s: string): boolean {
    return s.length === 0;
  }
  static toLowerCase(s: string): string {
    return s.toLowerCase();
  }
  static toUpperCase(s: string): string {
    return s.toUpperCase();
  }
  static strip$(s: string) {
    return s.trim();
  }
}
defineLib(JString, 'java.lang.String');

function javaReplacement(rep: string): string {
  // Java: \x is a literal x, $n a group; JavaScript: $$ is a literal $
  let out = '';
  for (let i = 0; i < rep.length; i++) {
    const c = rep[i];
    if (c === '\\' && i + 1 < rep.length) {
      const n = rep[++i];
      out += n === '$' ? '$$' : n;
    } else {
      out += c;
    }
  }
  return out;
}

export function utf8Decode(a: any): string {
  return new TextDecoder('utf-8').decode(a instanceof Uint8Array ? a : Uint8Array.from(a, (x: number) => x & 0xff));
}

/** java.util.Formatter, the conversions FreeCol uses. */
export function javaFormatString(fmt: string, args: any[]): string {
  let ai = 0;
  return fmt.replace(/%(\d+\$)?([-#+ 0,(]*)(\d+)?(\.\d+)?([a-zA-Z%])/g, (m, pos, flags, width, prec, conv) => {
    if (conv === '%') return '%';
    if (conv === 'n') return '\n';
    let arg = pos ? args[parseInt(pos, 10) - 1] : args[ai++];
    if ((arg instanceof Double || arg instanceof Float) && !'sS'.includes(conv)) arg = arg.v; // a boxed float or double
    let s: string;
    const p = prec ? parseInt(prec.substring(1), 10) : -1;
    switch (conv) {
    case 'd': {
      s = String(typeof arg === 'number' ? Math.trunc(arg) : arg);
      if (flags.includes(',')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      if (flags.includes('+') && !s.startsWith('-')) s = '+' + s;
      break;
    }
    case 'f': s = (arg as number).toFixed(p < 0 ? 6 : p); break;
    case 'e': s = (arg as number).toExponential(p < 0 ? 6 : p).replace(/e([+-])(\d)$/, 'e$10$2'); break;
    case 'x': s = ((arg as number) >>> 0).toString(16); break;
    case 'X': s = ((arg as number) >>> 0).toString(16).toUpperCase(); break;
    case 'o': s = ((arg as number) >>> 0).toString(8); break;
    case 'c': s = typeof arg === 'number' ? String.fromCharCode(arg) : String(arg); break;
    case 'b': case 'B': s = String(arg != null && arg !== false); break;
    case 's': case 'S': s = str(arg); if (p >= 0) s = s.substring(0, p); if (conv === 'S') s = s.toUpperCase(); break;
    default: s = str(arg);
    }
    if (width) {
      const w = parseInt(width, 10);
      if (s.length < w) {
        if (flags.includes('-')) s = s + ' '.repeat(w - s.length);
        else if (flags.includes('0') && /[dfx]/.test(conv)) s = (s.startsWith('-') ? '-' + '0'.repeat(w - s.length) + s.substring(1) : '0'.repeat(w - s.length) + s);
        else s = ' '.repeat(w - s.length) + s;
      }
    }
    return s;
  });
}

export function str(x: any): string {
  if (x === null || x === undefined) return 'null';
  switch (typeof x) {
  case 'string': return x;
  case 'number': return String(x);
  case 'boolean': return String(x);
  case 'function': return 'Lambda@' + (identityHash(x) >>> 0).toString(16);
  case 'bigint': return x.toString();
  default:
    if (Array.isArray(x)) return '[' + (x.$type || 'L') + '@' + (identityHash(x) >>> 0).toString(16);
    return x.toString();
  }
}

/* ------------------------------------------------------------------ StringBuilder */

export class StringBuilder extends JObject {
  s = '';
  constructor(a?: any) {
    super();
    if (typeof a === 'string') this.s = a;
    else if (a != null && typeof a === 'object') this.s = a.toString();
  }
  _StringBuilder(a?: any): this {
    if (typeof a === 'string') this.s = a;
    return this;
  }
  append(x: any, start?: number, end?: number): this {
    if (start !== undefined) {
      const t = x == null ? 'null' : typeof x === 'string' ? x : Array.isArray(x) ? JString.fromChars(x) : x.toString();
      this.s += Array.isArray(x) ? JString.fromChars(x, start, end) : t.substring(start, end);
      return this;
    }
    this.s += x === null || x === undefined ? 'null' : typeof x === 'string' ? x : str(x);
    return this;
  }
  appendChar(c: number): this {
    this.s += String.fromCharCode(c);
    return this;
  }
  insert(i: number, x: any): this {
    const t = x === null ? 'null' : typeof x === 'string' ? x : str(x);
    this.s = this.s.substring(0, i) + t + this.s.substring(i);
    return this;
  }
  length(): number {
    return this.s.length;
  }
  charAt(i: number): number {
    if (i < 0 || i >= this.s.length) throw new StringIndexOutOfBoundsException('index ' + i + ',length ' + this.s.length);
    return this.s.charCodeAt(i);
  }
  setCharAt(i: number, c: number) {
    this.s = this.s.substring(0, i) + String.fromCharCode(c) + this.s.substring(i + 1);
  }
  deleteCharAt(i: number): this {
    this.s = this.s.substring(0, i) + this.s.substring(i + 1);
    return this;
  }
  delete(a: number, b: number): this {
    b = Math.min(b, this.s.length);
    this.s = this.s.substring(0, a) + this.s.substring(b);
    return this;
  }
  replace(a: number, b: number, t: string): this {
    b = Math.min(b, this.s.length);
    this.s = this.s.substring(0, a) + t + this.s.substring(b);
    return this;
  }
  reverse(): this {
    this.s = this.s.split('').reverse().join('');
    return this;
  }
  setLength(n: number) {
    this.s = n <= this.s.length ? this.s.substring(0, n) : this.s + '\0'.repeat(n - this.s.length);
  }
  indexOf(t: string, from?: number): number {
    return this.s.indexOf(t, from);
  }
  lastIndexOf(t: string, from?: number): number {
    return from === undefined ? this.s.lastIndexOf(t) : this.s.lastIndexOf(t, from);
  }
  substring(a: number, b?: number): string {
    return this.s.substring(a, b);
  }
  isEmpty(): boolean {
    return this.s.length === 0;
  }
  capacity(): number {
    return this.s.length + 16;
  }
  ensureCapacity() {}
  trimToSize() {}
  chars(): any {
    return JString.chars(this.s);
  }
  toString(): string {
    return this.s;
  }
}
defineLib(StringBuilder, 'java.lang.StringBuilder', { ifaces: ['java.lang.CharSequence'] });
export const StringBuffer = StringBuilder;

/* ------------------------------------------------------------------ Character */

export class Character {
  static isDigit(c: number) {
    return /\p{Nd}/u.test(String.fromCharCode(c));
  }
  static isLetter(c: number) {
    return /\p{L}/u.test(String.fromCharCode(c));
  }
  static isLetterOrDigit(c: number) {
    return /[\p{L}\p{Nd}]/u.test(String.fromCharCode(c));
  }
  static isAlphabetic(c: number) {
    return /\p{Alphabetic}/u.test(String.fromCharCode(c));
  }
  static isWhitespace(c: number) {
    return (c >= 9 && c <= 13) || (c >= 28 && c <= 32) || (/\p{Zs}|\p{Zl}|\p{Zp}/u.test(String.fromCharCode(c)) && c !== 0xa0 && c !== 0x2007 && c !== 0x202f);
  }
  static isSpaceChar(c: number) {
    return /\p{Zs}|\p{Zl}|\p{Zp}/u.test(String.fromCharCode(c));
  }
  static isUpperCase(c: number) {
    return /\p{Lu}/u.test(String.fromCharCode(c));
  }
  static isLowerCase(c: number) {
    return /\p{Ll}/u.test(String.fromCharCode(c));
  }
  static toUpperCase(c: number) {
    const s = String.fromCharCode(c).toUpperCase();
    return s.length === 1 ? s.charCodeAt(0) : c;
  }
  static toLowerCase(c: number) {
    const s = String.fromCharCode(c).toLowerCase();
    return s.length === 1 ? s.charCodeAt(0) : c;
  }
  static toTitleCase(c: number) {
    return Character.toUpperCase(c);
  }
  static digit(c: number, radix: number) {
    let v = -1;
    if (c >= 48 && c <= 57) v = c - 48;
    else if (c >= 97 && c <= 122) v = c - 97 + 10;
    else if (c >= 65 && c <= 90) v = c - 65 + 10;
    return v >= 0 && v < radix ? v : -1;
  }
  static getNumericValue(c: number) {
    return Character.digit(c, 36);
  }
  static forDigit(d: number, radix: number) {
    return d < 10 ? 48 + d : 87 + d;
  }
  static isISOControl(c: number) {
    return c <= 0x1f || (c >= 0x7f && c <= 0x9f);
  }
  static compare(a: number, b: number) {
    return a - b;
  }
  static toChars(c: number) {
    return JString.toCharArray(String.fromCodePoint(c));
  }
}
defineLib(Character, 'java.lang.Character');

/* ------------------------------------------------------------------ boxed types as classes (for class objects and isa) */

export class JNumber extends JObject {}
defineLib(JNumber, 'java.lang.Number');
export class Integer extends JNumber {
  static readonly MAX_VALUE = 2147483647;
  static readonly MIN_VALUE = -2147483648;
}
defineLib(Integer, 'java.lang.Integer', { ifaces: ['java.lang.Comparable'] });
export class Long extends JNumber {}
defineLib(Long, 'java.lang.Long', { ifaces: ['java.lang.Comparable'] });
/**
 * A boxed float or double: JavaScript cannot tell 2.0 from 2, but Java prints a Double 2.0 as "2.0" and an
 * Integer 2 as "2". The translation boxes float and double values where Java does (into Object, a type
 * variable, Double) and unboxes them where Java does (unary +); ints and longs stay plain numbers.
 */
export class Float extends JNumber {
  v = 0;
  constructor(v?: number) {
    super();
    if (v !== undefined) this.v = Math.fround(v);
  }
  valueOf() { return this.v; }
  toString() { return fstr(this.v); }
  equals(o: any) { return o instanceof Float && $J.Float_floatToIntBits(o.v) === $J.Float_floatToIntBits(this.v); }
  hashCode() { return $J.Float_floatToIntBits(this.v); }
  compareTo(o: any) { return $J.dcmp(this.v, +o); }
}
defineLib(Float, 'java.lang.Float', { ifaces: ['java.lang.Comparable'] });
export class Double extends JNumber {
  v = 0;
  constructor(v?: number) {
    super();
    if (v !== undefined) this.v = v;
  }
  valueOf() { return this.v; }
  toString() { return dstr(this.v); }
  equals(o: any) { return o instanceof Double && (o.v === this.v ? (o.v !== 0 || Object.is(o.v, this.v)) : (Number.isNaN(o.v) && Number.isNaN(this.v))); }
  hashCode() { return doubleHash(this.v); }
  compareTo(o: any) { return $J.dcmp(this.v, +o); }
}
defineLib(Double, 'java.lang.Double', { ifaces: ['java.lang.Comparable'] });
export class Short extends JNumber {}
defineLib(Short, 'java.lang.Short');
export class Byte extends JNumber {}
defineLib(Byte, 'java.lang.Byte');
export class JBoolean extends JObject {}
defineLib(JBoolean, 'java.lang.Boolean', { ifaces: ['java.lang.Comparable'] });

/* library interfaces, as objects for isa and class literals */
function iface(name: string, javaName: string, supers: string[] = []): any {
  const C = { [name]: class {} }[name];
  defineLib(C, javaName, { kind: 'interface', ifaces: supers });
  return C;
}
export const Comparable = iface('Comparable', 'java.lang.Comparable');
export const CharSequence = iface('CharSequence', 'java.lang.CharSequence');
export const Iterable = iface('Iterable', 'java.lang.Iterable');
// Iterable's default methods (mixed into the classes that implement it)
Iterable.prototype.forEach = function (f: any) {
  for (const it = this.iterator(); it.hasNext();) f(it.next());
};
Iterable.prototype.spliterator = function () {
  return this;
};
export const Runnable = iface('Runnable', 'java.lang.Runnable');
export const Cloneable = iface('Cloneable', 'java.lang.Cloneable');
export const AutoCloseable = iface('AutoCloseable', 'java.lang.AutoCloseable');
export const Closeable = iface('Closeable', 'java.io.Closeable', ['java.lang.AutoCloseable']);
export const Serializable = iface('Serializable', 'java.io.Serializable');
export const Appendable = iface('Appendable', 'java.lang.Appendable');
export const Thread_UncaughtExceptionHandler = iface('Thread_UncaughtExceptionHandler', 'java.lang.Thread$UncaughtExceptionHandler');

/* ------------------------------------------------------------------ PrintStream (System.out, System.err) */

export class PrintStream extends JObject {
  buf = '';
  sink: any;
  constructor(sink: (s: string) => void = () => {}) {
    super();
    this.sink = sink;
  }
  print(s: any) {
    this.write(str(s));
  }
  println(s?: any) {
    this.write((s === undefined ? '' : str(s)) + '\n');
  }
  printf(fmt: string, ...args: any[]): this {
    this.write(javaFormatString(fmt, args));
    return this;
  }
  format(fmt: string, ...args: any[]): this {
    return this.printf(fmt, ...args);
  }
  write(s: any) {
    if (typeof s === 'number') s = String.fromCharCode(s);
    this.buf += s;
    let i: number;
    while ((i = this.buf.indexOf('\n')) >= 0) {
      this.sink(this.buf.substring(0, i));
      this.buf = this.buf.substring(i + 1);
    }
  }
  flush() {
    if (this.buf) {
      this.sink(this.buf);
      this.buf = '';
    }
  }
  close() {
    this.flush();
  }
}
defineLib(PrintStream, 'java.io.PrintStream');

/* ------------------------------------------------------------------ Thread (the browser has one) */

export class Thread extends JObject {
  static current: Thread = null;
  name = 'main';
  target: any = null;
  priority = 5;
  daemon = false;
  interrupted = false;
  static readonly MIN_PRIORITY = 1;
  static readonly NORM_PRIORITY = 5;
  static readonly MAX_PRIORITY = 10;
  constructor(...a: any[]) {
    super();
    if (a.length) this._Thread(...a);
  }
  _Thread(...a: any[]): this {
    // (), (name), (target), (target, name), (group, target), (group, name), (group, target, name[, stack])
    if (a.length && (a[0] == null || a[0] instanceof ThreadGroup)) a = a.slice(1);
    for (const x of a) {
      if (typeof x === 'string') this.name = x;
      else if (x != null && typeof x !== 'number' && typeof x !== 'boolean') this.target = x; // (…, stackSize, inheritThreadLocals)
    }
    return this;
  }
  /** The browser runs no threads: start() runs the work as a task (tasks.ts may replace this). */
  start() {
    $J.startThread(this);
  }
  run() {
    if (this.target) {
      if (typeof this.target === 'function') this.target();
      else this.target.run();
    }
  }
  getName() {
    return this.name;
  }
  setName(n: string) {
    this.name = n;
  }
  setDaemon(d: boolean) {
    this.daemon = d;
  }
  setPriority(p: number) {
    this.priority = p;
  }
  interrupt() {
    this.interrupted = true;
  }
  isInterrupted() {
    return this.interrupted;
  }
  isAlive() {
    return $J.threads ? $J.threads.isAlive(this) : false;
  }
  join(ms?: number) {
    if ($J.threads) $J.threads.join(this, ms);
  }
  getStackTrace() {
    return [];
  }
  getThreadGroup() {
    return ThreadGroup.main;
  }
  getContextClassLoader() {
    return $J.appClassLoader;
  }
  setContextClassLoader(_l: any) {}
  getPriority() {
    return this.priority;
  }
  isDaemon() {
    return this.daemon;
  }
  getId() {
    return 1;
  }
  setUncaughtExceptionHandler() {}
  toString() {
    return "Thread[#" + objectNumber(this) + "," + this.name + "," + this.priority + ",main]";
  }
  static currentThread(): Thread {
    if (!Thread.current) Thread.current = new Thread('main');
    return Thread.current;
  }
  /** Sleeping: the client's scheduler runs other threads meanwhile; elsewhere it returns at once. */
  static sleep(ms: number) {
    if ($J.threads) $J.threads.sleep(ms);
  }
  static yield() {
    if ($J.threads) $J.threads.sleep(1);
  }
  /** One thread at a time runs: it holds every monitor it asks about (synchronized blocks are its own). */
  static holdsLock(_o: any) {
    return true;
  }
  static onSpinWait() {
    if ($J.threads) $J.threads.sleep(1);
  }
  static dumpStack() {}
  static interrupted() {
    return false;
  }
  static setDefaultUncaughtExceptionHandler() {}
}
defineLib(Thread, 'java.lang.Thread', { ifaces: ['java.lang.Runnable'] });

/** One thread group: the application's. */
export class ThreadGroup extends JObject {
  static main: ThreadGroup = null;
  name: string;
  constructor(name = 'main') {
    super();
    this.name = name;
  }
  getName() {
    return this.name;
  }
  getParent() {
    return null;
  }
  isDestroyed() {
    return false;
  }
  isDaemon() {
    return false;
  }
  getMaxPriority() {
    return 10;
  }
  activeCount() {
    return 1;
  }
}
defineLib(ThreadGroup, 'java.lang.ThreadGroup');
ThreadGroup.main = new ThreadGroup('main');

export class Runtime extends JObject {
  static the = new Runtime();
  static getRuntime() {
    return Runtime.the;
  }
  maxMemory() {
    return 2 ** 31;
  }
  totalMemory() {
    return 2 ** 30;
  }
  freeMemory() {
    return 2 ** 29;
  }
  availableProcessors() {
    return 1;
  }
  gc() {}
  addShutdownHook(_t: any) {}
  removeShutdownHook(_t: any) {
    return true;
  }
  exec() {
    throw new IOException('exec');
  }
}
defineLib(Runtime, 'java.lang.Runtime');

export class StackTraceElement extends JObject {}

/* ------------------------------------------------------------------ $J: the helpers translated code calls */

export const $J = {
  verbose: false,
  out: new PrintStream((s) => { if ($J.verbose) console.log(s); }),
  err: new PrintStream((s) => { if ($J.verbose) console.error(s); }),
  properties: new Map<string, string>([
    ['line.separator', '\n'], ['file.separator', '/'], ['path.separator', ':'], ['user.home', '/home/player'],
    ['user.dir', '/'], ['user.name', 'player'], ['os.name', 'Linux'], ['os.arch', 'amd64'], ['os.version', ''],
    ['java.version', '21.0.12.1'], ['java.vendor', 'freegames'], ['java.io.tmpdir', '/tmp'],
    ['java.vm.name', 'freegames'], ['java.vm.vendor', 'freegames'], ['java.vm.version', ''],
  ]),
  /** What a Thread's start() does; the platform layer sets it. */
  startThread: (t: any) => { queueMicrotask(() => t.run()); },
  /** The TypeScript name of a translated method, by Java signature: m('a.B', 'save(java.io.File)'). */
  m(cls: string, sig: string): string {
    for (let C = $J.load(cls); C && C.$meta; C = Object.getPrototypeOf(C)) {
      const m = Object.prototype.hasOwnProperty.call(C, '$meta') && C.$meta.meths?.[sig];
      if (m) return m;
    }
    return sig.substring(0, sig.indexOf('('));
  },
  /**
   * Replaces a static method of a translated class with platform code; the class is still initialized
   * when the method is first called, as before.
   */
  replaceStatic(c: any, name: string, fn: (...a: any[]) => any) {
    const wrapped = function (this: any, ...a: any[]) {
      ensureInit(c);
      return fn.apply(this, a);
    };
    c[name] = wrapped;
    const state = own(c, '$init');
    if (state && !state.done) state.restore.push(() => { c[name] = fn; });
  },
  /** Replaces a constructor (an init method) of a translated class with platform code, as replaceStatic. */
  replaceCtor(c: any, sig: string, fn: (...a: any[]) => any) {
    const name = c.$meta.ctors[sig];
    c.prototype[name] = function (this: any, ...a: any[]) {
      ensureInit(c);
      return fn.apply(this, a);
    };
    const state = own(c, '$init');
    if (state && !state.done) state.restore.push(() => { c.prototype[name] = fn; });
  },
  /**
   * A hand-written subclass of translated classes answers to its ancestors' overloads (translated as
   * name$Types) with its own method of the plain name, which takes the overloads' arguments.
   */
  adoptOverloads(C: any) {
    const P = C.prototype;
    for (let A = Object.getPrototypeOf(C); A && A !== Function.prototype; A = Object.getPrototypeOf(A)) {
      const meths = Object.prototype.hasOwnProperty.call(A, '$meta') ? A.$meta.meths : null;
      if (!meths) continue;
      for (const sig in meths) {
        const ts = meths[sig], plain = sig.substring(0, sig.indexOf('('));
        if (ts !== plain && Object.prototype.hasOwnProperty.call(P, plain) && !Object.prototype.hasOwnProperty.call(P, ts)) P[ts] = P[plain];
      }
    }
    return C;
  },
  /** A new object of a translated class, by constructor signature: make('java.awt.Dimension', 'int,int', 1, 2). */
  make(cls: string, sig: string, ...args: any[]): any {
    const C = $J.load(cls);
    const init = C.$meta.ctors?.[sig];
    if (!init) throw new Error('no constructor ' + cls + '(' + sig + ')');
    return new C()[init](...args);
  },
  /** The client's thread scheduler (src/port/client/sched.ts), or null: threads run as tasks, nothing blocks. */
  threads: null as any,
  monitorWait(o: any, ms?: number) {
    if ($J.threads) $J.threads.monitorWait(o, ms);
  },
  monitorNotify(o: any, all: boolean) {
    if ($J.threads) $J.threads.monitorNotify(o, all);
  },
  /** Native methods of translated JDK classes, by 'binary.ClassName.method': function (self, args). */
  natives: new Map<string, (self: any, args: any[]) => any>(),
  nativeCall(cls: string, name: string, self: any, args: any[]): any {
    const f = $J.natives.get(cls + '.' + name);
    if (f) return f(self, args);
    if (name === 'initIDs') return undefined; // the JNI field and method caches of the JDK's C code
    throw new Error(`native method ${cls}.${name} is not in the port's runtime`);
  },
  /** The application's class loader: classes by name; resources are files of the virtual file system. */
  appClassLoader: {
    loadClass: (n: string) => JClass.forName(n),
    getResource: (_n: string) => null,
    getResourceAsStream: (_n: string) => null,
    getParent: () => null,
  } as any,

  // ---- registry
  define(cls: any, name: string, meta: any) {
    cls.$meta = { ...meta, name };
    classes.set(name, cls);
  },
  module(link: () => void) {
    linkers.push(link);
  },
  load(name: string): any {
    const c = classes.get(name);
    if (c) return c;
    const stub = { [name.substring(name.lastIndexOf('.') + 1)]: class extends JObject {} }[name.substring(name.lastIndexOf('.') + 1)];
    (stub as any).$meta = { name, kind: 'class', stub: true };
    classes.set(name, stub);
    return stub;
  },
  classByName(name: string): any {
    return classes.get(name);
  },
  linkAll() {
    for (const l of linkers) l();
    linkers.length = 0;
    // default methods of interfaces onto the classes that implement them, superclasses first
    const done = new Set<any>();
    const mix = (c: any) => {
      if (done.has(c) || !c || c === JObject) return;
      done.add(c);
      const p = Object.getPrototypeOf(c);
      if (p && p !== Function.prototype) mix(p);
      const meta = own(c, '$meta');
      if (!meta || meta.kind === 'interface') return;
      mixDefaults(c);
    };
    for (const c of classes.values()) mix(c);
    for (const c of classes.values()) {
      const meta = own(c, '$meta');
      if (meta && meta.clinit && own(c, '$clinit') && !own(c, '$init')) installLazyInit(c, meta);
    }
  },
  /** Java initializes a class on its first use (lazy hooks, installLinkAll); index.ts lists the order javac's
   *  dependencies suggest, which is only used to initialize everything up front when asked. */
  clinitAll(_order: string[]) {},
  initClass(c: any) {
    ensureInit(c);
  },
  /** A local or anonymous class: its interfaces, and their default methods. */
  local(cls: any, name: any, ifaces?: string[]) {
    if (Array.isArray(name)) {
      ifaces = name;
      name = null;
    }
    if (!own(cls, '$meta')) {
      cls.$meta = { name: name ?? (Object.getPrototypeOf(cls).$meta?.name ?? 'java.lang.Object') + '$anon', kind: 'class', ifaces };
      mixDefaults(cls);
    }
    return cls;
  },

  // ---- objects
  cls(c: any): JClass {
    if (typeof c === 'string') {
      let k = primitiveClasses.get(c);
      if (!k) {
        k = new JClass(null, c, !c.includes('[') && !c.includes('.'), c.includes('['));
        primitiveClasses.set(c, k);
      }
      return k;
    }
    let k = own(c, '$class');
    if (!k) {
      const meta = own(c, '$meta');
      k = new JClass(c, meta ? meta.name : c.name || 'anonymous');
      Object.defineProperty(c, '$class', { value: k, enumerable: false });
    }
    return k;
  },
  getClass(x: any): JClass {
    if (x == null) throw new NullPointerException();
    switch (typeof x) {
    case 'string': return $J.cls(JString);
    case 'number': return $J.cls(Number.isInteger(x) && x >= -2147483648 && x <= 2147483647 ? Integer : Double);
    case 'boolean': return $J.cls(JBoolean);
    case 'function': return $J.cls('lambda');
    default:
      if (Array.isArray(x)) return $J.cls('[' + (x.$type || 'Ljava.lang.Object;'));
      return $J.cls(x.constructor);
    }
  },
  isa(x: any, T: any): boolean {
    if (x === null || x === undefined || T == null) return false;
    if (x.$parked) return false; // a thread that waits for ever unwinds (client scheduler): no catch takes it
    switch (typeof x) {
    case 'string': return T === JString || T === JObject || T === Comparable || T === CharSequence || T === Serializable;
    case 'number': return T === Integer || T === Long || T === Double || T === Float || T === Short || T === Byte
      || T === JNumber || T === JObject || T === Comparable || T === Character || T === Serializable;
    case 'boolean': return T === JBoolean || T === JObject || T === Comparable || T === Serializable;
    case 'function': return T === JObject || (own(T, '$meta')?.kind === 'interface');
    default:
    }
    if (!(x instanceof JObject)) {
      // a native error, or an array
      if (Array.isArray(x)) return T === JObject || T === Cloneable || T === Serializable;
      return $J.isa(javaException(x), T);
    }
    if (x instanceof T) return true;
    const meta = own(T, '$meta');
    if (meta && meta.kind === 'interface') return ifaceSet(x.constructor).has(T);
    return false;
  },
  /** The exception a catch clause sees (native errors become Java exceptions). */
  exc(e: any): any {
    return javaException(e);
  },
  equals(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    // arrays (and plain objects) are equal only to themselves, as Java's arrays
    if (typeof a === 'object') return typeof a.equals === 'function' ? a.equals(b) : false;
    if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b);
    return false;
  },
  hashCode(x: any): number {
    if (x == null) return 0;
    switch (typeof x) {
    case 'string': return stringHash(x);
    // a boxed number: Integer (or Long) when integral, else Double; JavaScript cannot tell 2.0 from 2
    case 'number':
      if (Number.isInteger(x)) return x >= -2147483648 && x <= 2147483647 ? x : $J.Long_hashCode(x);
      return doubleHash(x);
    case 'boolean': return x ? 1231 : 1237;
    case 'function': return identityHash(x);
    default:
      if (Array.isArray(x)) return identityHash(x);
      return x.hashCode();
    }
  },
  str,
  fstr,
  dstr,
  compareTo(a: any, b: any): number {
    if (typeof a === 'string') return JString.compareTo(a, b);
    if (typeof a === 'number') return a < b ? -1 : a > b ? 1 : a === b ? 0 : $J.dcmp(a, b);
    if (typeof a === 'boolean') return a === b ? 0 : a ? 1 : -1;
    return a.compareTo(b);
  },
  identityHashCode(x: any): number {
    return x == null ? 0 : typeof x === 'object' || typeof x === 'function' ? identityHash(x) : $J.hashCode(x);
  },
  /** A function for an object that implements a functional interface (one per object and method). */
  fn(o: any, m: string): any {
    if (o == null || typeof o === 'function') return o;
    let fns = o.$fns;
    if (!fns) {
      fns = {};
      Object.defineProperty(o, '$fns', { value: fns, enumerable: false });
    }
    let f = fns[m];
    if (!f) {
      f = (...a: any[]) => o[m](...a);
      f.$target = o;
      fns[m] = f;
    }
    return f;
  },
  /** Collection.toArray(a): the elements copied into a if it is large enough (then a[size] = null), else a new array. */
  toArrayInto(elements: any[], a: any[]): any[] {
    if (a == null || a.length < elements.length) return elements;
    for (let i = 0; i < elements.length; i++) a[i] = elements[i];
    if (a.length > elements.length) a[elements.length] = null;
    return a;
  },
  /** A boxed char (Character) in a string concatenation. */
  cstr(c: any): string {
    return c == null ? 'null' : typeof c === 'number' ? String.fromCharCode(c) : String(c);
  },
  /** The object a function made by fn() stands for (a cast from a functional interface to its class). */
  unfn(f: any): any {
    return typeof f === 'function' && f.$target !== undefined ? f.$target : f;
  },
  /** A lambda for an interface whose values are objects (Iterable, listeners): an object with the method. */
  lambdaObj(fn: any, method: string, iface: string): any {
    const key = iface + '#' + method;
    let C = lambdaClasses.get(key);
    if (!C) {
      C = class extends JObject {};
      C.prototype[method] = function (...a: any[]) {
        return this.$fn(...a);
      };
      C.$meta = { name: iface + '$$Lambda', kind: 'class', ifaces: [iface] };
      mixDefaults(C);
      lambdaClasses.set(key, C);
    }
    const o = new C();
    o.$fn = fn;
    return o;
  },
  enumValueOf(c: any, name: string): any {
    const cls = c instanceof JClass ? c.$c : c;
    if (name == null) throw new NullPointerException('Name is null');
    for (const v of cls.$VALUES) if (v.$name === name) return v;
    throw new IllegalArgumentException('No enum constant ' + $J.cls(cls).getTypeName() + '.' + name);
  },

  // ---- numbers
  /** A double boxed as Java boxes it (Double), so that it prints as Java prints it. */
  boxD(x: any): any {
    return x == null || x instanceof Double ? x : new Double(+x);
  },
  boxF(x: any): any {
    return x == null || x instanceof Float ? x : new Float(+x);
  },
  idiv(a: number, b: number): number {
    if (b === 0) throw new ArithmeticException('/ by zero');
    return (a / b) | 0;
  },
  ldiv(a: number, b: number): number {
    if (b === 0) throw new ArithmeticException('/ by zero');
    if (Math.abs(a) <= 2 ** 53 && Math.abs(b) <= 2 ** 53) return Math.trunc(a / b);
    return Number(BigInt(Math.trunc(a)) / BigInt(Math.trunc(b)));
  },
  d2i(d: number): number {
    if (Number.isNaN(d)) return 0;
    if (d >= 2147483647) return 2147483647;
    if (d <= -2147483648) return -2147483648;
    return Math.trunc(d) | 0;
  },
  d2l(d: number): number {
    if (Number.isNaN(d)) return 0;
    if (d >= 9223372036854775807) return 9223372036854775807;
    if (d <= -9223372036854775808) return -9223372036854775808;
    return Math.trunc(d);
  },
  big(a: number): bigint {
    return BigInt.asIntN(64, BigInt(Math.trunc(a)));
  },
  lshl(a: number, n: number): number { return Number(BigInt.asIntN(64, $J.big(a) << BigInt(n & 63))); },
  lshr(a: number, n: number): number { return Number(BigInt.asIntN(64, $J.big(a) >> BigInt(n & 63))); },
  lushr(a: number, n: number): number { return Number(BigInt.asIntN(64, BigInt.asUintN(64, $J.big(a)) >> BigInt(n & 63))); },
  land(a: number, b: number): number { return Number(BigInt.asIntN(64, $J.big(a) & $J.big(b))); },
  lor(a: number, b: number): number { return Number(BigInt.asIntN(64, $J.big(a) | $J.big(b))); },
  lxor(a: number, b: number): number { return Number(BigInt.asIntN(64, $J.big(a) ^ $J.big(b))); },
  icmp(a: number, b: number): number {
    return a < b ? -1 : a === b ? 0 : 1;
  },
  dcmp(a: number, b: number): number {
    if (a < b) return -1;
    if (a > b) return 1;
    const an = Number.isNaN(a), bn = Number.isNaN(b);
    if (an || bn) return an === bn ? 0 : an ? 1 : -1;
    const az = Object.is(a, -0), bz = Object.is(b, -0);
    return az === bz ? 0 : az ? -1 : 1;
  },
  round(d: number): number {
    if (Number.isNaN(d)) return 0;
    return Math.round(d);
  },
  roundf(f: number): number {
    if (Number.isNaN(f)) return 0;
    return $J.d2i(Math.round(f));
  },
  rint(d: number): number {
    const r = Math.round(d);
    return Math.abs(d % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
  },
  pow(a: number, b: number): number {
    return Math.pow(a, b);
  },
  floorDiv(a: number, b: number): number {
    return Math.floor(a / b);
  },
  floorMod(a: number, b: number): number {
    return a - Math.floor(a / b) * b;
  },
  parseInt(s: string, radix = 10): number {
    if (s == null) throw new NumberFormatException('Cannot parse null string: null');
    const re = radix === 10 ? /^[+-]?\d+$/ : /^[+-]?[0-9a-zA-Z]+$/;
    const v = re.test(s) ? parseInt(s, radix) : NaN;
    if (Number.isNaN(v) || v > 2147483647 || v < -2147483648) {
      throw new NumberFormatException('For input string: "' + s + '"' + (radix !== 10 ? ' under radix ' + radix : ''));
    }
    return v;
  },
  parseLong(s: string, radix = 10): number {
    if (s == null || !/^[+-]?\d+$/.test(s)) throw new NumberFormatException('For input string: "' + s + '"');
    return parseInt(s, radix);
  },
  parseDouble(s: string): number {
    if (s == null) throw new NullPointerException();
    const t = s.trim();
    if (/^[+-]?(NaN|Infinity)$/.test(t)) return Number(t);
    if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?[fFdD]?$/.test(t)) throw new NumberFormatException('For input string: "' + s + '"');
    return parseFloat(t.replace(/[fFdD]$/, ''));
  },
  parseBoolean(s: string): boolean {
    return s != null && s.toLowerCase() === 'true';
  },
  Integer_decode(s: string): number {
    const m = /^([+-]?)(0x|0X|#|0)?(.*)$/.exec(s)!;
    const radix = m[2] === '0x' || m[2] === '0X' || m[2] === '#' ? 16 : m[2] === '0' && m[3] ? 8 : 10;
    const v = $J.parseInt((m[1] || '') + (m[2] === '0' && !m[3] ? '0' : m[3]), radix);
    return v;
  },
  Long_decode(s: string): number {
    return $J.Integer_decode(s);
  },
  Integer_toHexString(i: number): string {
    return (i >>> 0).toString(16);
  },
  Integer_toBinaryString(i: number): string {
    return (i >>> 0).toString(2);
  },
  Integer_signum(i: number): number {
    return Math.sign(i);
  },
  Integer_bitCount(i: number): number {
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    return (Math.imul((i + (i >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24);
  },
  /** Double's bits as a long (exact only below 2^53: longs are numbers here; used for hashing). */
  Double_doubleToLongBits(d: number): number {
    const v = new DataView(new ArrayBuffer(8));
    v.setFloat64(0, Number.isNaN(d) ? NaN : d);
    return Number(v.getBigInt64(0));
  },
  Double_longBitsToDouble(l: number): number {
    const v = new DataView(new ArrayBuffer(8));
    v.setBigInt64(0, BigInt.asIntN(64, BigInt(Math.trunc(l))));
    return v.getFloat64(0);
  },
  Long_toHexString(l: number): string {
    return BigInt.asUintN(64, BigInt(Math.trunc(l))).toString(16);
  },
  math_ulp(d: number): number {
    if (!Number.isFinite(d)) return Number.isNaN(d) ? NaN : Infinity;
    d = Math.abs(d);
    if (d === Number.MAX_VALUE) return 2 ** 971;
    const v = new DataView(new ArrayBuffer(8));
    v.setFloat64(0, d);
    v.setBigUint64(0, v.getBigUint64(0) + 1n);
    return v.getFloat64(0) - d;
  },
  system_getSecurityManager(): any {
    return null;
  },
  system_loadLibrary(_n: string) {},
  Float_floatToIntBits(f: number): number {
    if (Number.isNaN(f)) return 0x7fc00000;
    const b = bitsBuf;
    b.setFloat32(0, Number.isNaN(f) ? NaN : f);
    return Number.isNaN(f) ? 0x7fc00000 : b.getInt32(0);
  },
  Float_intBitsToFloat(i: number): number {
    const b = bitsBuf;
    b.setInt32(0, i);
    return b.getFloat32(0);
  },
  Float_isNaN(f: number) { return Number.isNaN(f); },
  Double_isNaN(f: number) { return Number.isNaN(f); },
  Double_isInfinite(f: number) { return f === Infinity || f === -Infinity; },
  Float_isInfinite(f: number) { return f === Infinity || f === -Infinity; },
  Double_isFinite(f: number) { return Number.isFinite(f); },
  Double_hashCode(d: number) { return doubleHash(d); },
  Long_hashCode(l: number) { return Number(BigInt.asIntN(32, $J.big(l) ^ ($J.big(l) >> 32n))); },
  Long_numberOfTrailingZeros(l: number) {
    if (l === 0) return 64;
    let n = 0;
    let b = $J.big(l);
    while ((b & 1n) === 0n) { b >>= 1n; n++; }
    return n;
  },
  Integer_numberOfTrailingZeros(i: number) {
    if (i === 0) return 32;
    return 31 - Math.clz32(i & -i);
  },
  Integer_numberOfLeadingZeros(i: number) { return Math.clz32(i); },
  Integer_highestOneBit(i: number) { return i === 0 ? 0 : (1 << (31 - Math.clz32(i))) | 0; },
  Integer_reverse(i: number) {
    let r = 0;
    for (let k = 0; k < 32; k++) { r = (r << 1) | (i & 1); i >>>= 1; }
    return r | 0;
  },
  Integer_compareTo(a: number, b: number) { return $J.icmp(a, b); },
  Character_isDigit(c: number) { return Character.isDigit(c); },

  // ---- arrays
  newArray(n: number, def: any): any[] {
    if (n < 0) throw new NegativeArraySizeException(String(n));
    return new Array(n).fill(def);
  },
  newArrayN(dims: number[], def: any): any[] {
    const make = (d: number): any[] => {
      const n = dims[d];
      if (n < 0) throw new NegativeArraySizeException(String(n));
      const a = new Array(n);
      for (let i = 0; i < n; i++) a[i] = d + 1 < dims.length ? make(d + 1) : def;
      return a;
    };
    return make(0);
  },

  // ---- System
  system_getProperty(k: string, def?: string): string {
    const v = $J.properties.get(k);
    return v === undefined ? (def === undefined ? null : def) : v;
  },
  system_setProperty(k: string, v: string): string {
    const old = $J.system_getProperty(k);
    $J.properties.set(k, v);
    return old;
  },
  system_getenv(_k?: string): any {
    return null;
  },
  system_currentTimeMillis(): number {
    return $J.clock();
  },
  system_nanoTime(): number {
    return Math.round(performance.now() * 1e6);
  },
  /** The wall clock; tests fix it. */
  clock: () => Date.now(),
  system_gc() {},
  system_exit(code: number) {
    throw new SystemExit(code);
  },
  system_arraycopy(src: any[], sp: number, dst: any[], dp: number, n: number) {
    if (src === dst && sp < dp) {
      for (let i = n - 1; i >= 0; i--) dst[dp + i] = src[sp + i];
    } else {
      for (let i = 0; i < n; i++) dst[dp + i] = src[sp + i];
    }
  },
  system_identityHashCode(x: any) {
    return $J.identityHashCode(x);
  },
  system_lineSeparator() {
    return '\n';
  },
  intStreamOf: null as any,
};

export class SystemExit extends Error {
  code: number;
  constructor(code: number) {
    super('System.exit(' + code + ')');
    this.code = code;
  }
}

/* ------------------------------------------------------------------ lazy class initialization */

/**
 * Java runs a class's static initializer when the class is first used: an instance is created, a static
 * method is called, or a static field (not a constant) is read or written. FreeCol depends on that order
 * (FreeCol's options read messages that are loaded later). Until then the class's static methods and init
 * methods are wrapped and its static fields are accessors; the first use runs $clinit (after the
 * superclass's) and puts the plain members back.
 */
function installLazyInit(c: any, meta: any) {
  const state = { done: false, running: false, restore: [] as (() => void)[] };
  Object.defineProperty(c, '$init', { value: state, enumerable: false });
  const fields: string[] = meta.lazy || [];
  for (const f of fields) {
    let v = own(c, f);
    Object.defineProperty(c, f, {
      configurable: true,
      enumerable: true,
      get() {
        ensureInit(c);
        return c[f];
      },
      set(x) {
        ensureInit(c);
        c[f] = x;
      },
    });
    state.restore.push(() => Object.defineProperty(c, f, { value: v, writable: true, configurable: true, enumerable: true }));
  }
  for (const k of Object.getOwnPropertyNames(c)) {
    if (k === '$clinit' || k === 'prototype' || k === 'length' || k === 'name' || fields.includes(k)) continue;
    const d = Object.getOwnPropertyDescriptor(c, k);
    if (!d || typeof d.value !== 'function') continue;
    const orig = d.value;
    c[k] = function (...a: any[]) {
      ensureInit(c);
      return orig.apply(this, a);
    };
    state.restore.push(() => { c[k] = orig; });
  }
  const inits = meta.ctors ? Object.values(meta.ctors) as string[] : [];
  for (const k of inits) {
    const orig = c.prototype[k];
    if (typeof orig !== 'function') continue;
    c.prototype[k] = function (...a: any[]) {
      ensureInit(c);
      return orig.apply(this, a);
    };
    state.restore.push(() => { c.prototype[k] = orig; });
  }
}

export function ensureInit(c: any) {
  const state = own(c, '$init');
  if (!state || state.done || state.running) return;
  state.running = true;
  const parent = Object.getPrototypeOf(c);
  if (parent && parent !== Function.prototype) ensureInit(parent);
  for (const r of state.restore) r();
  state.done = true;
  c.$clinit();
  state.running = false;
}

function mixDefaults(c: any) {
  const order: any[] = [];
  const seen = new Set<any>();
  const visit = (n: any) => {
    const i = typeof n === 'string' ? classes.get(n) : n;
    if (!i || seen.has(i)) return;
    seen.add(i);
    order.push(i);
    const m = own(i, '$meta');
    if (m && m.ifaces) for (const s of m.ifaces) visit(s);
  };
  const meta = own(c, '$meta');
  if (meta && meta.ifaces) for (const n of meta.ifaces) visit(n);
  for (const i of order) {
    for (const k of Object.getOwnPropertyNames(i.prototype)) {
      if (k === 'constructor') continue;
      if (!(k in c.prototype)) Object.defineProperty(c.prototype, k, { value: i.prototype[k], writable: true, configurable: true });
    }
  }
}

defineLib(JObject, 'java.lang.Object');
defineLib(Throwable, 'java.lang.Throwable');
defineLib(JEnum, 'java.lang.Enum', { ifaces: ['java.lang.Comparable'] });
defineLib(JClass, 'java.lang.Class');

// Lambdas are functions: as objects they answer equals and hashCode with their identity (Object's).
Object.defineProperty(Function.prototype, 'equals', { value: function (this: any, o: any) { return this === o; }, writable: true, configurable: true });
Object.defineProperty(Function.prototype, 'hashCode', { value: function (this: any) { return identityHash(this); }, writable: true, configurable: true });

// valueOf(String) of the boxed types, for reflection (FreeCol's Introspector converts strings to field values;
// translated calls are rewritten by the translator and do not come here)
const parseWhole = (s: any) => {
  if (typeof s === 'number') return s;
  const t = String(s);
  if (!/^[+-]?\d+$/.test(t)) throw new NumberFormatException('For input string: "' + t + '"');
  return parseInt(t, 10);
};
Object.assign(Integer, { valueOf: parseWhole });
Object.assign(Long, { valueOf: parseWhole });
Object.assign(Short, { valueOf: parseWhole });
Object.assign(Byte, { valueOf: parseWhole });
Object.assign(Float, { valueOf: (s: any) => Math.fround(typeof s === 'number' ? s : parseFloat(String(s))) });
Object.assign(Double, { valueOf: (s: any) => (typeof s === 'number' ? s : parseFloat(String(s))) });
Object.assign(JBoolean, { valueOf: (s: any) => (typeof s === 'boolean' ? s : String(s).toLowerCase() === 'true') });
