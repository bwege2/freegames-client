// @ts-nocheck
// The JDK's internal plumbing that the translated Swing and AWT classes call (java.security's privileged
// actions, sun.awt.AppContext, jdk.internal.* helpers, PlatformLogger), and the old java.util collections
// they are built on (Vector, Stack, Hashtable, EventObject, BitSet, WeakHashMap). One application, one
// thread, no security manager: privileged actions just run, there is one AppContext.
//
// Hashtable's table (sizes, rehashing, the order its enumerations walk the buckets) follows OpenJDK 21:
//
//   Copyright (c) 1994, 2023, Oracle and/or its affiliates. All rights reserved.
//   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
//
//   This code is free software; you can redistribute it and/or modify it under the terms of the GNU General
//   Public License version 2 only, as published by the Free Software Foundation. Oracle designates this
//   particular file as subject to the "Classpath" exception as provided by Oracle in the LICENSE file that
//   accompanied this code.
//
//   This code is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
//   implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
//   version 2 for more details (a copy is included in the LICENSE file that accompanied this code).
//
// This file is therefore GPL-2.0-only WITH Classpath-exception-2.0 (the exception's text is in
// web/games/freecol/LICENSE.md).
import {
  $J, JObject, defineLib, exc, str, ensureInit, JError, RuntimeException, IllegalArgumentException, IndexOutOfBoundsException,
  ArrayIndexOutOfBoundsException, NoSuchElementException, NullPointerException, Exception, IOException,
} from './lang.ts';
import { AbstractCollection, ArrayList, HashMap, AbstractMap, AbstractMap_SimpleEntry, Collections } from './util.ts';

/* ------------------------------------------------------------------ errors */

export const InternalError = exc('InternalError', JError, 'java.lang.InternalError');
export const NoSuchMethodError = exc('NoSuchMethodError', JError, 'java.lang.NoSuchMethodError');
export const InvalidObjectException = exc('InvalidObjectException', IOException, 'java.io.InvalidObjectException');
export const UnsupportedEncodingException = exc('UnsupportedEncodingException', IOException, 'java.io.UnsupportedEncodingException');
export const PatternSyntaxException = exc('PatternSyntaxException', IllegalArgumentException, 'java.util.regex.PatternSyntaxException');
export const TooManyListenersException = exc('TooManyListenersException', Exception, 'java.util.TooManyListenersException');
export const MissingResourceException = exc('MissingResourceException', RuntimeException, 'java.util.MissingResourceException');
export const SocketException = exc('SocketException', IOException, 'java.net.SocketException');

/* ------------------------------------------------------------------ java.security, sun.security.action */

/** Privileged actions run as they are: there is no security manager. */
function runAction(a: any): any {
  return typeof a === 'function' ? a() : a.run();
}

export class AccessController {
  static doPrivileged(a: any, ..._rest: any[]) {
    return runAction(a);
  }
  static doPrivilegedWithCombiner(a: any, ..._rest: any[]) {
    return runAction(a);
  }
  static getContext() {
    return new AccessControlContext();
  }
  static checkPermission(_p: any) {}
}
defineLib(AccessController, 'java.security.AccessController');

export class AccessControlContext extends JObject {}
defineLib(AccessControlContext, 'java.security.AccessControlContext');
export class ProtectionDomain extends JObject {}
defineLib(ProtectionDomain, 'java.security.ProtectionDomain');

export class BasicPermission extends JObject {
  name: string;
  constructor(name?: string, _actions?: string) {
    super();
    this.name = name;
  }
  _BasicPermission(name: string, _actions?: string) {
    this.name = name;
    return this;
  }
  getName() {
    return this.name;
  }
}
defineLib(BasicPermission, 'java.security.BasicPermission');
export class FilePermission extends BasicPermission {}
defineLib(FilePermission, 'java.io.FilePermission');

/** sun.security.action.GetPropertyAction: a system property, privileged. */
export class GetPropertyAction extends JObject {
  theProp: string;
  defaultVal: string;
  constructor(p?: string, d?: string) {
    super();
    this.theProp = p;
    this.defaultVal = d ?? null;
  }
  run() {
    const v = $J.system_getProperty(this.theProp);
    return v == null ? this.defaultVal : v;
  }
  static privilegedGetProperty(p: string, d?: string) {
    const v = $J.system_getProperty(p);
    return v == null ? (d ?? null) : v;
  }
  static privilegedGetProperties() {
    return $J.systemProperties ? $J.systemProperties() : null;
  }
}
defineLib(GetPropertyAction, 'sun.security.action.GetPropertyAction');

export class GetBooleanAction extends JObject {
  theProp: string;
  constructor(p?: string) {
    super();
    this.theProp = p;
  }
  run() {
    return 'true' === $J.system_getProperty(this.theProp)?.toLowerCase?.();
  }
  static privilegedGetProperty(p: string) {
    return new GetBooleanAction(p).run();
  }
}
defineLib(GetBooleanAction, 'sun.security.action.GetBooleanAction');

export class GetIntegerAction extends JObject {
  theProp: string;
  defaultVal: number;
  defaultSet: boolean;
  constructor(p?: string, d?: number) {
    super();
    this.theProp = p;
    this.defaultSet = d !== undefined;
    this.defaultVal = d ?? 0;
  }
  run() {
    const v = $J.system_getProperty(this.theProp);
    const n = v == null ? NaN : parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
    return this.defaultSet ? this.defaultVal : null;
  }
  static privilegedGetProperty(p: string, d?: number) {
    return new GetIntegerAction(p, d).run();
  }
}
defineLib(GetIntegerAction, 'sun.security.action.GetIntegerAction');

/* ------------------------------------------------------------------ jdk.internal */

/** jdk.internal.util.OperatingSystem: the oracle's, Linux. */
class OperatingSystemValue extends JObject {
  n: string;
  o: number;
  constructor(n: string, o: number) {
    super();
    this.n = n;
    this.o = o;
  }
  name() {
    return this.n;
  }
  ordinal() {
    return this.o;
  }
  toString() {
    return this.n;
  }
}
export const OperatingSystem: any = {
  LINUX: new OperatingSystemValue('LINUX', 0),
  MACOS: new OperatingSystemValue('MACOS', 1),
  WINDOWS: new OperatingSystemValue('WINDOWS', 2),
  AIX: new OperatingSystemValue('AIX', 3),
  current() {
    return OperatingSystem.LINUX;
  },
  isLinux: () => true,
  isMacOS: () => false,
  isWindows: () => false,
  isAix: () => false,
};
defineLib(OperatingSystem, 'jdk.internal.util.OperatingSystem');

/** sun.reflect.misc.ReflectUtil, MethodUtil: no access checks here. */
export const ReflectUtil: any = {
  checkPackageAccess(_c: any) {},
  isPackageAccessible: (_c: any) => true,
  ensureMemberAccess() {},
};
defineLib(ReflectUtil, 'sun.reflect.misc.ReflectUtil');
export const MethodUtil: any = {
  invoke(m: any, target: any, args: any[]) {
    return m.invoke(target, ...(args ?? []));
  },
  getMethod(c: any, name: string, types: any[]) {
    return c.getMethod(name, ...(types ?? []));
  },
};
defineLib(MethodUtil, 'sun.reflect.misc.MethodUtil');

/** sun.util.logging.PlatformLogger: the JDK's own logging, quiet as in a release run. */
export class PlatformLogger_Level extends JObject {
  n: string;
  v: number;
  constructor(n: string, v: number) {
    super();
    this.n = n;
    this.v = v;
  }
  intValue() {
    return this.v;
  }
  getName() {
    return this.n;
  }
}
for (const [n, v] of [['ALL', -2147483648], ['FINEST', 300], ['FINER', 400], ['FINE', 500], ['CONFIG', 700], ['INFO', 800], ['WARNING', 900], ['SEVERE', 1000], ['OFF', 2147483647]] as const) {
  (PlatformLogger_Level as any)[n] = new PlatformLogger_Level(n, v);
}
defineLib(PlatformLogger_Level, 'sun.util.logging.PlatformLogger$Level');

export class PlatformLogger extends JObject {
  static loggers = new Map<string, PlatformLogger>();
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  static getLogger(name: string) {
    let l = PlatformLogger.loggers.get(name);
    if (!l) PlatformLogger.loggers.set(name, (l = new PlatformLogger(name)));
    return l;
  }
  isLoggable(level: any) {
    return level.v >= 900; // WARNING and above, as the JDK's default
  }
  isEnabled() {
    return true;
  }
  log(level: any, msg: string, ..._a: any[]) {
    if (this.isLoggable(level) && $J.verbose) console.error(this.name + ': ' + msg);
  }
  severe(msg: string, ..._a: any[]) {
    this.log(PlatformLogger_Level.SEVERE, msg);
  }
  warning(msg: string, ..._a: any[]) {
    this.log(PlatformLogger_Level.WARNING, msg);
  }
  info(_msg: string, ..._a: any[]) {}
  config(_msg: string, ..._a: any[]) {}
  fine(_msg: string, ..._a: any[]) {}
  finer(_msg: string, ..._a: any[]) {}
  finest(_msg: string, ..._a: any[]) {}
}
defineLib(PlatformLogger, 'sun.util.logging.PlatformLogger');

/** java.lang.ThreadLocal: one thread. */
export class ThreadLocal extends JObject {
  v: any;
  set_: boolean = false;
  init: any;
  constructor() {
    super();
  }
  _ThreadLocal() {
    return this;
  }
  static withInitial(f: any) {
    const t = new ThreadLocal();
    t.init = f;
    return t;
  }
  initialValue() {
    return this.init ? this.init() : null;
  }
  get() {
    if (!this.set_) {
      this.v = this.initialValue();
      this.set_ = true;
    }
    return this.v;
  }
  set(v: any) {
    this.v = v;
    this.set_ = true;
  }
  remove() {
    this.set_ = false;
    this.v = null;
  }
}
defineLib(ThreadLocal, 'java.lang.ThreadLocal');

/** Locks: one thread, nothing to wait for. */
export class ReentrantLock extends JObject {
  holds = 0;
  constructor(_fair?: boolean) {
    super();
  }
  lock() {
    this.holds++;
  }
  unlock() {
    this.holds--;
  }
  tryLock() {
    this.holds++;
    return true;
  }
  isHeldByCurrentThread() {
    return this.holds > 0;
  }
  newCondition() {
    return { await() {}, signal() {}, signalAll() {}, awaitNanos: () => 0 };
  }
}
defineLib(ReentrantLock, 'java.util.concurrent.locks.ReentrantLock');
export const LockSupport: any = {
  // the client's scheduler parks and unparks its threads; elsewhere they never block
  park(_b?: any) {
    if ($J.threads) $J.threads.park();
  },
  parkNanos(a: any, b?: number) {
    if ($J.threads) $J.threads.park((b ?? a) / 1e6);
  },
  unpark(t: any) {
    if ($J.threads && t) $J.threads.unpark(t);
  },
};
defineLib(LockSupport, 'java.util.concurrent.locks.LockSupport');

/* ------------------------------------------------------------------ sun.awt.AppContext */

/** The one application context: Swing keeps its per-application state in it. */
export class AppContext extends JObject {
  static EVENT_QUEUE_KEY = 'EventQueue';
  static EVENT_QUEUE_LOCK_KEY = 'EventQueue.Lock';
  static EVENT_QUEUE_COND_KEY = 'EventQueue.Condition';
  static DISPOSED_PROPERTY_NAME = 'disposed';
  static GUI_DISPOSED = 'guidisposed';
  static main: AppContext = null;
  table = new HashMap();
  constructor() {
    super();
    // as AppContext's constructor: the event queue's lock and its condition
    const lock = new ReentrantLock();
    this.table.put(AppContext.EVENT_QUEUE_LOCK_KEY, lock);
    this.table.put(AppContext.EVENT_QUEUE_COND_KEY, lock.newCondition());
  }
  static getAppContext() {
    return AppContext.main ??= new AppContext();
  }
  static getAppContexts() {
    return Collections.singleton(AppContext.getAppContext());
  }
  static isMainContext(ctx: any) {
    return ctx === AppContext.main;
  }
  static getSoftReferenceValue(key: any, supplier: any) {
    const ctx = AppContext.getAppContext();
    let v = ctx.get(key);
    if (v == null) {
      v = typeof supplier === 'function' ? supplier() : supplier.get();
      ctx.put(key, v);
    }
    return v;
  }
  isDisposed() {
    return false;
  }
  get(key: any) {
    return this.table.get(key);
  }
  put(key: any, value: any) {
    return this.table.put(key, value);
  }
  remove(key: any) {
    return this.table.remove(key);
  }
  getThreadGroup() {
    return null;
  }
  getContextClassLoader() {
    return null;
  }
  addPropertyChangeListener(..._a: any[]) {}
  removePropertyChangeListener(..._a: any[]) {}
  getPropertyChangeListeners(..._a: any[]) {
    return [];
  }
  dispose() {}
  toString() {
    return 'sun.awt.AppContext[threadGroup=main]';
  }
}
defineLib(AppContext, 'sun.awt.AppContext');

/* ------------------------------------------------------------------ java.util.EventObject */

export class EventObject extends JObject {
  source: any;
  constructor(source?: any) {
    super();
    if (source !== undefined) this._EventObject(source);
  }
  _EventObject(source: any) {
    if (source == null) throw new IllegalArgumentException('null source');
    this.source = source;
    return this;
  }
  getSource() {
    return this.source;
  }
  toString() {
    return $J.getClass(this).getName() + '[source=' + str(this.source) + ']';
  }
}
defineLib(EventObject, 'java.util.EventObject', { ifaces: ['java.io.Serializable'] });

export class EventListenerProxy extends JObject {
  listener: any;
  _EventListenerProxy(l: any) {
    this.listener = l;
    return this;
  }
  getListener() {
    return this.listener;
  }
}
defineLib(EventListenerProxy, 'java.util.EventListenerProxy', { ifaces: ['java.util.EventListener'] });

/* ------------------------------------------------------------------ Vector, Stack */

/** java.util.Vector: an ArrayList with the old names (and its init method). */
export class Vector extends ArrayList {
  constructor(arg?: any, _inc?: number) {
    super(typeof arg === 'object' ? arg : undefined);
  }
  _Vector(arg?: any, _inc?: number) {
    if (arg != null && typeof arg === 'object') this.addAll(arg);
    return this;
  }
  elementAt(i: number) {
    if (i >= this.a.length) throw new ArrayIndexOutOfBoundsException(i + ' >= ' + this.a.length);
    return this.a[i];
  }
  firstElement() {
    if (!this.a.length) throw new NoSuchElementException();
    return this.a[0];
  }
  lastElement() {
    if (!this.a.length) throw new NoSuchElementException();
    return this.a[this.a.length - 1];
  }
  addElement(x: any) {
    this.a.push(x);
  }
  insertElementAt(x: any, i: number) {
    if (i > this.a.length) throw new ArrayIndexOutOfBoundsException(i + ' > ' + this.a.length);
    this.a.splice(i, 0, x);
  }
  setElementAt(x: any, i: number) {
    if (i >= this.a.length) throw new ArrayIndexOutOfBoundsException(i + ' >= ' + this.a.length);
    this.a[i] = x;
  }
  removeElementAt(i: number) {
    if (i >= this.a.length) throw new ArrayIndexOutOfBoundsException(i + ' >= ' + this.a.length);
    this.a.splice(i, 1);
  }
  removeElement(x: any) {
    const i = this.indexOf(x);
    if (i < 0) return false;
    this.a.splice(i, 1);
    return true;
  }
  removeAllElements() {
    this.a.length = 0;
  }
  elements() {
    let i = 0;
    const a = this;
    return { hasMoreElements: () => i < a.a.length, nextElement: () => {
      if (i >= a.a.length) throw new NoSuchElementException('Vector Enumeration');
      return a.a[i++];
    }, asIterator() { return { hasNext: () => i < a.a.length, next: () => a.a[i++] }; } };
  }
  copyInto(arr: any[]) {
    for (let i = 0; i < this.a.length; i++) arr[i] = this.a[i];
  }
  setSize(n: number) {
    while (this.a.length < n) this.a.push(null);
    this.a.length = n;
  }
  capacity() {
    return Math.max(10, this.a.length);
  }
  ensureCapacity(_n: number) {}
  trimToSize() {}
  indexOf(o: any, from = 0) {
    for (let i = from; i < this.a.length; i++) if (o == null ? this.a[i] == null : $J.equals(o, this.a[i])) return i;
    return -1;
  }
  lastIndexOf(o: any, from?: number) {
    for (let i = from ?? this.a.length - 1; i >= 0; i--) if (o == null ? this.a[i] == null : $J.equals(o, this.a[i])) return i;
    return -1;
  }
  clone() {
    const v = new (this.constructor as any)();
    v.a = this.a.slice();
    return v;
  }
}
defineLib(Vector, 'java.util.Vector', { ifaces: ['java.util.List', 'java.util.RandomAccess', 'java.lang.Cloneable'] });

export class Stack extends Vector {
  _Stack() {
    return this;
  }
  push(x: any) {
    this.a.push(x);
    return x;
  }
  pop() {
    if (!this.a.length) throw new $J.EmptyStackException();
    return this.a.pop();
  }
  peek() {
    if (!this.a.length) throw new $J.EmptyStackException();
    return this.a[this.a.length - 1];
  }
  empty() {
    return this.a.length === 0;
  }
  search(o: any) {
    const i = this.lastIndexOf(o);
    return i >= 0 ? this.a.length - i : -1;
  }
}
defineLib(Stack, 'java.util.Stack');
export const EmptyStackException = exc('EmptyStackException', RuntimeException, 'java.util.EmptyStackException');
($J as any).EmptyStackException = EmptyStackException;

/* ------------------------------------------------------------------ Hashtable */

class HtEntry {
  hash: number;
  key: any;
  value: any;
  next: HtEntry;
  constructor(hash: number, key: any, value: any, next: HtEntry) {
    this.hash = hash;
    this.key = key;
    this.value = value;
    this.next = next;
  }
}

/** java.util.Hashtable as OpenJDK 21: capacity 11, rehash to 2n+1 at 0.75, new entries at a bucket's head. */
export class Hashtable extends AbstractMap {
  table: HtEntry[];
  count = 0;
  threshold: number;
  loadFactor: number;
  modCount = 0;
  constructor(a?: any, b?: number) {
    super();
    this._Hashtable(a, b);
  }
  _Hashtable(a?: any, b?: number) {
    if (a != null && typeof a === 'object') {
      this.init(Math.max(2 * a.size(), 11), 0.75);
      this.putAll(a);
    } else {
      this.init(a ?? 11, b ?? 0.75);
    }
    return this;
  }
  init(cap: number, lf: number) {
    if (cap < 0) throw new IllegalArgumentException('Illegal Capacity: ' + cap);
    if (cap === 0) cap = 1;
    this.loadFactor = lf;
    this.table = new Array(cap).fill(null);
    this.threshold = Math.min(Math.trunc(cap * lf), 2147483639 + 1);
  }
  size() {
    return this.count;
  }
  isEmpty() {
    return this.count === 0;
  }
  hashOf(key: any) {
    if (key == null) throw new NullPointerException();
    return $J.hashCode(key) | 0;
  }
  indexFor(hash: number) {
    return (hash & 0x7fffffff) % this.table.length;
  }
  find(key: any): HtEntry {
    const h = this.hashOf(key);
    for (let e = this.table[this.indexFor(h)]; e != null; e = e.next) if (e.hash === h && $J.equals(e.key, key)) return e;
    return null;
  }
  get(key: any) {
    const e = this.find(key);
    return e ? e.value : null;
  }
  containsKey(key: any) {
    return this.find(key) != null;
  }
  contains(value: any) {
    if (value == null) throw new NullPointerException();
    for (let i = this.table.length; i-- > 0;) for (let e = this.table[i]; e != null; e = e.next) if ($J.equals(e.value, value)) return true;
    return false;
  }
  containsValue(value: any) {
    return this.contains(value);
  }
  rehash() {
    const old = this.table;
    let n = (old.length << 1) + 1;
    if (n - 2147483639 > 0) n = 2147483639;
    const t: HtEntry[] = new Array(n).fill(null);
    this.modCount++;
    this.threshold = Math.min(Math.trunc(n * this.loadFactor), 2147483639 + 1);
    this.table = t;
    for (let i = old.length; i-- > 0;) {
      for (let e = old[i]; e != null;) {
        const nx = e.next;
        const idx = (e.hash & 0x7fffffff) % n;
        e.next = t[idx];
        t[idx] = e;
        e = nx;
      }
    }
  }
  put(key: any, value: any) {
    if (value == null) throw new NullPointerException();
    const h = this.hashOf(key);
    let idx = this.indexFor(h);
    for (let e = this.table[idx]; e != null; e = e.next) {
      if (e.hash === h && $J.equals(e.key, key)) {
        const old = e.value;
        e.value = value;
        return old;
      }
    }
    if (this.count >= this.threshold) {
      this.rehash();
      idx = this.indexFor(h);
    }
    this.table[idx] = new HtEntry(h, key, value, this.table[idx]);
    this.count++;
    this.modCount++;
    return null;
  }
  remove(key: any, value?: any) {
    const h = this.hashOf(key);
    const idx = this.indexFor(h);
    for (let e = this.table[idx], prev: HtEntry = null; e != null; prev = e, e = e.next) {
      if (e.hash === h && $J.equals(e.key, key) && (value === undefined || $J.equals(e.value, value))) {
        if (prev) prev.next = e.next;
        else this.table[idx] = e.next;
        this.modCount++;
        this.count--;
        return value === undefined ? e.value : true;
      }
    }
    return value === undefined ? null : false;
  }
  putAll(m: any) {
    for (const e of m.entrySet()) this.put(e.getKey(), e.getValue());
  }
  clear() {
    this.table.fill(null);
    this.modCount++;
    this.count = 0;
  }
  /** Entries in Hashtable's own order: buckets from the last to the first. */
  entriesInOrder(): HtEntry[] {
    const r: HtEntry[] = [];
    for (let i = this.table.length; i-- > 0;) for (let e = this.table[i]; e != null; e = e.next) r.push(e);
    return r;
  }
  enumerate(f: (e: HtEntry) => any) {
    const es = this.entriesInOrder();
    let i = 0;
    return {
      hasMoreElements: () => i < es.length,
      nextElement: () => {
        if (i >= es.length) throw new NoSuchElementException('Hashtable Enumerator');
        return f(es[i++]);
      },
      hasNext() { return i < es.length; },
      next() { return this.nextElement(); },
      asIterator() { return this; },
    };
  }
  keys() {
    return this.enumerate((e) => e.key);
  }
  elements() {
    return this.enumerate((e) => e.value);
  }
  keySet() {
    return new HtView(this, 0);
  }
  values() {
    return new HtView(this, 1);
  }
  entrySet() {
    return new HtView(this, 2);
  }
  forEach(f: any) {
    for (const e of this.entriesInOrder()) f(e.key, e.value);
  }
  getOrDefault(k: any, d: any) {
    const e = this.find(k);
    return e ? e.value : d;
  }
  clone() {
    const h = new (this.constructor as any)();
    h.init(this.table.length, this.loadFactor);
    for (const e of this.entriesInOrder().reverse()) h.put(e.key, e.value);
    return h;
  }
  toString() {
    const parts: string[] = [];
    for (const e of this.entriesInOrder()) parts.push(str(e.key) + '=' + str(e.value));
    return '{' + parts.join(', ') + '}';
  }
  hashCode() {
    let h = 0;
    for (const e of this.entriesInOrder()) h = (h + ($J.hashCode(e.key) ^ $J.hashCode(e.value))) | 0;
    return h;
  }
}
defineLib(Hashtable, 'java.util.Hashtable', { ifaces: ['java.util.Map', 'java.lang.Cloneable'] });

class HtView extends AbstractCollection {
  h: Hashtable;
  kind: number;
  constructor(h: Hashtable, kind: number) {
    super();
    this.h = h;
    this.kind = kind;
  }
  size() {
    return this.h.count;
  }
  iterator() {
    const es = this.h.entriesInOrder();
    const h = this.h;
    const kind = this.kind;
    let i = 0, last: HtEntry = null;
    return {
      hasNext: () => i < es.length,
      next: () => {
        if (i >= es.length) throw new NoSuchElementException();
        last = es[i++];
        return kind === 0 ? last.key : kind === 1 ? last.value : new HtMapEntry(last);
      },
      remove: () => {
        h.remove(last.key);
      },
    };
  }
  contains(o: any) {
    if (this.kind === 0) return this.h.containsKey(o);
    if (this.kind === 1) return this.h.contains(o);
    const e = this.h.find(o.getKey());
    return e != null && $J.equals(e.value, o.getValue());
  }
  remove(o: any) {
    if (this.kind === 0) return this.h.remove(o) != null;
    return super.remove(o);
  }
  clear() {
    this.h.clear();
  }
}
defineLib(HtView, 'java.util.Hashtable$View', { ifaces: ['java.util.Set'] });

class HtMapEntry extends JObject {
  e: HtEntry;
  constructor(e: HtEntry) {
    super();
    this.e = e;
  }
  getKey() {
    return this.e.key;
  }
  getValue() {
    return this.e.value;
  }
  setValue(v: any) {
    if (v == null) throw new NullPointerException();
    const o = this.e.value;
    this.e.value = v;
    return o;
  }
  equals(o: any) {
    return o != null && typeof o.getKey === 'function' && $J.equals(this.e.key, o.getKey()) && $J.equals(this.e.value, o.getValue());
  }
  hashCode() {
    return $J.hashCode(this.e.key) ^ $J.hashCode(this.e.value);
  }
  toString() {
    return str(this.e.key) + '=' + str(this.e.value);
  }
}
defineLib(HtMapEntry, 'java.util.Hashtable$Entry', { ifaces: ['java.util.Map$Entry'] });

/** WeakHashMap: JavaScript keeps the keys (no weak keys with Java's equality); the order is HashMap's. */
export class WeakHashMap extends HashMap {
  _WeakHashMap(..._a: any[]) {
    return this;
  }
}
defineLib(WeakHashMap, 'java.util.WeakHashMap');

/* ------------------------------------------------------------------ BitSet */

export class BitSet extends JObject {
  words: number[] = [];
  constructor(_n?: number) {
    super();
  }
  _BitSet(_n?: number) {
    return this;
  }
  get(i: number) {
    if (i < 0) throw new IndexOutOfBoundsException('bitIndex < 0: ' + i);
    return ((this.words[i >>> 5] ?? 0) & (1 << (i & 31))) !== 0;
  }
  set(i: number, j?: any, v?: boolean) {
    if (typeof j === 'boolean') {
      if (j) this.set(i);
      else this.clear(i);
      return;
    }
    if (j !== undefined) {
      for (let k = i; k < j; k++) {
        if (v === false) this.clear(k);
        else this.set(k);
      }
      return;
    }
    this.words[i >>> 5] = (this.words[i >>> 5] ?? 0) | (1 << (i & 31));
  }
  clear(i?: number, j?: number) {
    if (i === undefined) {
      this.words = [];
      return;
    }
    if (j !== undefined) {
      for (let k = i; k < j; k++) this.clear(k);
      return;
    }
    this.words[i >>> 5] = (this.words[i >>> 5] ?? 0) & ~(1 << (i & 31));
  }
  flip(i: number) {
    if (this.get(i)) this.clear(i);
    else this.set(i);
  }
  nextSetBit(from: number) {
    const n = this.words.length * 32;
    for (let i = from; i < n; i++) if (this.get(i)) return i;
    return -1;
  }
  nextClearBit(from: number) {
    for (let i = from; ; i++) if (!this.get(i)) return i;
  }
  cardinality() {
    let c = 0;
    for (const w of this.words) for (let x = w ?? 0; x; x &= x - 1) c++;
    return c;
  }
  isEmpty() {
    return this.words.every((w) => !w);
  }
  length() {
    for (let i = this.words.length * 32 - 1; i >= 0; i--) if (this.get(i)) return i + 1;
    return 0;
  }
  size() {
    return Math.max(64, Math.ceil(this.words.length / 2) * 64);
  }
  and(o: BitSet) {
    for (let i = 0; i < this.words.length; i++) this.words[i] = (this.words[i] ?? 0) & (o.words[i] ?? 0);
  }
  or(o: BitSet) {
    for (let i = 0; i < o.words.length; i++) this.words[i] = (this.words[i] ?? 0) | (o.words[i] ?? 0);
  }
  andNot(o: BitSet) {
    for (let i = 0; i < this.words.length; i++) this.words[i] = (this.words[i] ?? 0) & ~(o.words[i] ?? 0);
  }
  clone() {
    const b = new BitSet();
    b.words = this.words.slice();
    return b;
  }
  equals(o: any) {
    if (!(o instanceof BitSet)) return false;
    const n = Math.max(this.words.length, o.words.length);
    for (let i = 0; i < n; i++) if ((this.words[i] ?? 0) !== (o.words[i] ?? 0)) return false;
    return true;
  }
}
defineLib(BitSet, 'java.util.BitSet', { ifaces: ['java.lang.Cloneable'] });

/* ------------------------------------------------------------------ jdk.internal.access.SharedSecrets */

/** The JDK's back doors between its packages: access control is gone, so actions just run. */
const javaSecurityAccess = {
  doIntersectionPrivilege(action: any, ..._ctx: any[]) {
    return runAction(action);
  },
};
let javaAWTFontAccess: any = null;
export const SharedSecrets: any = {
  getJavaSecurityAccess: () => javaSecurityAccess,
  getJavaAWTFontAccess: () => javaAWTFontAccess,
  setJavaAWTFontAccess: (a: any) => {
    javaAWTFontAccess = a;
  },
};
defineLib(SharedSecrets, 'jdk.internal.access.SharedSecrets');

/* ------------------------------------------------------------------ java.lang.invoke */

/** MethodHandles: the one use is ensureInitialized (AWTAccessor, SwingAccessor): a class's static initializer. */
export const MethodHandles: any = {
  lookup: () => ({ ensureInitialized: (c: any) => ensureInit(c.$c ?? c) }),
};
defineLib(MethodHandles, 'java.lang.invoke.MethodHandles');

/** sun.java2d.Disposer: native resources freed after collection; there are none here. */
export const Disposer: any = {
  addRecord(..._a: any[]) {},
  addObjectRecord(..._a: any[]) {},
  addReference(..._a: any[]) {},
  getQueue: () => null,
  pollRemove() {},
};
defineLib(Disposer, 'sun.java2d.Disposer');

/**
 * sun.java2d.pipe.Region as AWT's heavyweight/lightweight mixing uses it (switched off here: the screen has
 * one heavyweight window per window): a region as its bounding box.
 */
export class Region extends JObject {
  lox: number;
  loy: number;
  hix: number;
  hiy: number;
  constructor(lox = 0, loy = 0, hix = 0, hiy = 0) {
    super();
    this.lox = lox;
    this.loy = loy;
    this.hix = Math.max(lox, hix);
    this.hiy = Math.max(loy, hiy);
  }
  static EMPTY_REGION = new Region(0, 0, 0, 0);
  static WHOLE_REGION = new Region(-2147483648, -2147483648, 2147483647, 2147483647);
  /** Region.clipRound: rounds half down (ceil(v - 0.5)) and clips to the int range. */
  static clipRound(v: number) {
    const r = Math.ceil(v - 0.5);
    return r < -2147483648 ? -2147483648 : r > 2147483647 ? 2147483647 : r;
  }
  static clipAdd(v: number, dv: number) {
    const r = v + dv;
    if ((r > v) !== (dv > 0)) return dv < 0 ? -2147483648 : 2147483647;
    return r < -2147483648 ? -2147483648 : r > 2147483647 ? 2147483647 : r;
  }
  static clipScale(v: number, sv: number) {
    if (sv === 1.0) return v;
    return Region.clipRound(v * sv);
  }
  static dimAdd(start: number, dim: number) {
    if (dim <= 0) return start;
    return Region.clipAdd(start, dim);
  }
  static getInstanceXYWH(x: number, y: number, w: number, h: number) {
    return new Region(x, y, x + w, y + h);
  }
  static getInstanceXYXY(x0: number, y0: number, x1: number, y1: number) {
    return new Region(x0, y0, x1, y1);
  }
  static getInstance(a: any, ...rest: any[]) {
    // (Shape, AffineTransform), (Region, Shape, AffineTransform), (Rectangle), (int[] box)
    if (Array.isArray(a)) return new Region(a[0], a[1], a[2], a[3]);
    const s = a instanceof Region ? rest[0] : a;
    const r = s.getBounds();
    return new Region(r.getX(), r.getY(), r.getX() + r.getWidth(), r.getY() + r.getHeight());
  }
  isEmpty() {
    return this.hix <= this.lox || this.hiy <= this.loy;
  }
  isRectangular() {
    return true;
  }
  getLoX() { return this.lox; }
  getLoY() { return this.loy; }
  getHiX() { return this.hix; }
  getHiY() { return this.hiy; }
  getWidth() { return this.hix - this.lox; }
  getHeight() { return this.hiy - this.loy; }
  getTranslatedRegion(dx: number, dy: number) {
    return new Region(this.lox + dx, this.loy + dy, this.hix + dx, this.hiy + dy);
  }
  getIntersection(o: Region) {
    return new Region(Math.max(this.lox, o.lox), Math.max(this.loy, o.loy), Math.min(this.hix, o.hix), Math.min(this.hiy, o.hiy));
  }
  getIntersectionXYWH(x: number, y: number, w: number, h: number) {
    return this.getIntersection(new Region(x, y, x + w, y + h));
  }
  getUnion(o: Region) {
    if (o.isEmpty()) return this;
    if (this.isEmpty()) return o;
    return new Region(Math.min(this.lox, o.lox), Math.min(this.loy, o.loy), Math.max(this.hix, o.hix), Math.max(this.hiy, o.hiy));
  }
  getDifference(o: Region) {
    return o.getIntersection(this).equals(this) ? Region.EMPTY_REGION : this;
  }
  contains(x: number, y: number) {
    return x >= this.lox && y >= this.loy && x < this.hix && y < this.hiy;
  }
  equals(o: any) {
    return o instanceof Region && o.lox === this.lox && o.loy === this.loy && o.hix === this.hix && o.hiy === this.hiy;
  }
  hashCode() {
    return (this.lox * 31 + this.loy * 17 + this.hix * 7 + this.hiy) | 0;
  }
  toString() {
    return 'Region[[' + this.lox + ', ' + this.loy + ' => ' + this.hix + ', ' + this.hiy + ']]';
  }
}
defineLib(Region, 'sun.java2d.pipe.Region');

/** java.awt.im.InputContext: no input methods (the page's keyboard gives characters). */
export class InputContext extends JObject {
  static getInstance() {
    return null;
  }
}
defineLib(InputContext, 'java.awt.im.InputContext');

/** com.sun.beans.util.Cache: values made by create(key) when first asked for (no weak references here). */
export class Cache extends JObject {
  $map = new Map<any, any>();
  _Cache(_keyKind?: any, _valueKind?: any, _identity?: boolean) {
    return this;
  }
  create(_key: any): any {
    return null;
  }
  get(key: any) {
    if (!this.$map.has(key)) this.$map.set(key, this.create(key));
    return this.$map.get(key);
  }
  remove(key: any) {
    this.$map.delete(key);
  }
  clear() {
    this.$map.clear();
  }
}
defineLib(Cache, 'com.sun.beans.util.Cache');

/** com.sun.beans.util.Cache.Kind. */
export const Cache_Kind = { STRONG: { name: () => 'STRONG' }, SOFT: { name: () => 'SOFT' }, WEAK: { name: () => 'WEAK' } };
