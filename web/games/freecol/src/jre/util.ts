// @ts-nocheck
// java.util as the translated FreeCol code uses it. HashMap and HashSet keep Java's iteration order
// exactly (Java's hashing, table sizes, resizing, and where each operation links a new entry), because
// FreeCol's results depend on it.
//
// The hash table (HashMap, its tree bins) and PriorityQueue are adapted from OpenJDK 21:
//
//   Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
  $J, JObject, JString, defineLib, ifaceSet, str, stringHash, identityHash, jsIter,
  IllegalArgumentException, IllegalStateException, IndexOutOfBoundsException, NoSuchElementException,
  NullPointerException, UnsupportedOperationException, ClassCastException, IOException,
} from './lang.ts';

/* ------------------------------------------------------------------ interfaces */

function iface(name: string, javaName: string, supers: string[] = []): any {
  const C = { [name]: class {} }[name];
  defineLib(C, javaName, { kind: 'interface', ifaces: supers });
  return C;
}
export const Collection = iface('Collection', 'java.util.Collection', ['java.lang.Iterable']);
export const List = iface('List', 'java.util.List', ['java.util.Collection']);
export const JSet = iface('JSet', 'java.util.Set', ['java.util.Collection']);
export const SortedSet = iface('SortedSet', 'java.util.SortedSet', ['java.util.Set']);
export const Queue = iface('Queue', 'java.util.Queue', ['java.util.Collection']);
export const Deque = iface('Deque', 'java.util.Deque', ['java.util.Queue']);
export const JMap = iface('JMap', 'java.util.Map');
export const SortedMap = iface('SortedMap', 'java.util.SortedMap', ['java.util.Map']);
export const NavigableMap = iface('NavigableMap', 'java.util.NavigableMap', ['java.util.SortedMap']);
export const JMap_Entry = iface('JMap_Entry', 'java.util.Map$Entry');
export const Iterator = iface('Iterator', 'java.util.Iterator');
export const ListIterator = iface('ListIterator', 'java.util.ListIterator', ['java.util.Iterator']);
export const Enumeration = iface('Enumeration', 'java.util.Enumeration');
export const RandomAccess = iface('RandomAccess', 'java.util.RandomAccess');
export const EventListener = iface('EventListener', 'java.util.EventListener');

/* List.of, Map.of, ... */
(List as any).of = (...xs: any[]) => ArrayList.from(xs);
(List as any).copyOf = (c: any) => ArrayList.from([...c]);
(JSet as any).of = (...xs: any[]) => { const s = new LinkedHashSet(); for (const x of xs) s.add(x); return s; };
(JSet as any).copyOf = (c: any) => { const s = new LinkedHashSet(); for (const x of c) s.add(x); return s; };
(JMap as any).of = (...kv: any[]) => { const m = new LinkedHashMap(); for (let i = 0; i < kv.length; i += 2) m.put(kv[i], kv[i + 1]); return m; };
(JMap as any).entry = (k: any, v: any) => new AbstractMap_SimpleEntry(k, v);
(JMap as any).ofEntries = (...es: any[]) => { const m = new LinkedHashMap(); for (const e of es) m.put(e.getKey(), e.getValue()); return m; };
(JMap as any).copyOf = (o: any) => { const m = new LinkedHashMap(); m.putAll(o); return m; };
(JMap_Entry as any).comparingByKey = (c?: any) => (a: any, b: any) => (c ? c(a.getKey(), b.getKey()) : $J.compareTo(a.getKey(), b.getKey()));
(JMap_Entry as any).comparingByValue = (c?: any) => (a: any, b: any) => (c ? c(a.getValue(), b.getValue()) : $J.compareTo(a.getValue(), b.getValue()));

/* ------------------------------------------------------------------ iterators */

class ArrayIter extends JObject {
  i = 0;
  last = -1;
  list: any;
  a: any[];
  constructor(list: any, a: any[]) {
    super();
    this.list = list; this.a = a;
  }
  hasNext() {
    return this.i < this.list.size();
  }
  next() {
    if (this.i >= this.list.size()) throw new NoSuchElementException();
    this.last = this.i;
    return this.list.get(this.i++);
  }
  remove() {
    if (this.last < 0) throw new IllegalStateException();
    this.list.removeAt(this.last);
    this.i = this.last;
    this.last = -1;
  }
  forEachRemaining(f: any) {
    while (this.hasNext()) f(this.next());
  }
  // ListIterator
  hasPrevious() {
    return this.i > 0;
  }
  previous() {
    this.last = --this.i;
    return this.list.get(this.i);
  }
  nextIndex() {
    return this.i;
  }
  previousIndex() {
    return this.i - 1;
  }
  set(x: any) {
    this.list.set(this.last, x);
  }
  add(x: any) {
    this.list.add(this.i++, x);
    this.last = -1;
  }
}
defineLib(ArrayIter, 'java.util.ArrayList$Itr', { ifaces: ['java.util.ListIterator'] });

/* ------------------------------------------------------------------ AbstractCollection */

export class AbstractCollection extends JObject {
  _AbstractCollection(): this {
    return this;
  }
  isEmpty(): boolean {
    return this.size() === 0;
  }
  contains(o: any): boolean {
    for (const x of this) if ($J.equals(o, x)) return true;
    return false;
  }
  containsAll(c: any): boolean {
    for (const x of c) if (!this.contains(x)) return false;
    return true;
  }
  addAll(c: any): boolean {
    let mod = false;
    if (typeof c.iterator === 'function') {
      for (const it = c.iterator(); it.hasNext(); ) if (this.add(it.next())) mod = true;
    } else {
      for (const x of c) if (this.add(x)) mod = true;
    }
    return mod;
  }
  add(_x: any): boolean {
    throw new UnsupportedOperationException();
  }
  remove(o: any): boolean {
    const it = this.iterator();
    while (it.hasNext()) {
      if ($J.equals(o, it.next())) {
        it.remove();
        return true;
      }
    }
    return false;
  }
  removeAll(c: any): boolean {
    let mod = false;
    const it = this.iterator();
    while (it.hasNext()) {
      if (c.contains(it.next())) {
        it.remove();
        mod = true;
      }
    }
    return mod;
  }
  retainAll(c: any): boolean {
    let mod = false;
    const it = this.iterator();
    while (it.hasNext()) {
      if (!c.contains(it.next())) {
        it.remove();
        mod = true;
      }
    }
    return mod;
  }
  removeIf(p: any): boolean {
    let mod = false;
    const it = this.iterator();
    while (it.hasNext()) {
      if (p(it.next())) {
        it.remove();
        mod = true;
      }
    }
    return mod;
  }
  clear() {
    const it = this.iterator();
    while (it.hasNext()) {
      it.next();
      it.remove();
    }
  }
  toArray(): any[] {
    return [...this];
  }
  stream(): any {
    return $J.streamOf(this);
  }
  parallelStream(): any {
    return this.stream();
  }
  forEach(f: any) {
    for (const x of this) f(x);
  }
  spliterator(): any {
    return this;
  }
  toString(): string {
    const parts: string[] = [];
    for (const x of this) parts.push(x === this ? '(this Collection)' : str(x));
    return '[' + parts.join(', ') + ']';
  }
}

/* ------------------------------------------------------------------ ArrayList */

/** java.util.AbstractList: a list made of get(i) and size() (Swing's and FreeCol's own lists). */
export class AbstractList extends AbstractCollection {
  modCount = 0;
  _AbstractList(): this {
    return this;
  }
  add(i: any, x?: any): boolean {
    if (arguments.length === 1) {
      this.add(this.size(), i);
      return true;
    }
    throw new UnsupportedOperationException();
  }
  set(_i: number, _x: any): any {
    throw new UnsupportedOperationException();
  }
  removeAt(_i: number): any {
    throw new UnsupportedOperationException();
  }
  iterator(): any {
    return new ArrayIter(this, null);
  }
  listIterator(i = 0): any {
    const it = new ArrayIter(this, null);
    it.i = i;
    return it;
  }
  indexOf(o: any): number {
    for (let i = 0, n = this.size(); i < n; i++) if (o == null ? this.get(i) == null : $J.equals(o, this.get(i))) return i;
    return -1;
  }
  lastIndexOf(o: any): number {
    for (let i = this.size() - 1; i >= 0; i--) if (o == null ? this.get(i) == null : $J.equals(o, this.get(i))) return i;
    return -1;
  }
  contains(o: any): boolean {
    return this.indexOf(o) >= 0;
  }
  clear() {
    for (let i = this.size() - 1; i >= 0; i--) this.removeAt(i);
  }
  subList(a: number, b: number) {
    return new SubList(this, a, b);
  }
  equals(o: any): boolean {
    return listEquals(this, o);
  }
  hashCode(): number {
    let h = 1;
    for (let i = 0, n = this.size(); i < n; i++) h = (Math.imul(31, h) + $J.hashCode(this.get(i))) | 0;
    return h;
  }
  [Symbol.iterator]() {
    const r: any[] = [];
    for (let i = 0, n = this.size(); i < n; i++) r.push(this.get(i));
    return r[Symbol.iterator]();
  }
}
defineLib(AbstractList, 'java.util.AbstractList', { ifaces: ['java.util.List'] });

export class ArrayList extends AbstractCollection {
  a: any[] = [];
  constructor(arg?: any) {
    super();
    if (arg != null && typeof arg === 'object') this.addAll(arg);
  }
  _ArrayList(arg?: any): this {
    if (arg != null && typeof arg === 'object') this.addAll(arg);
    return this;
  }
  static from(a: any[]): ArrayList {
    const l = new ArrayList();
    l.a = a;
    return l;
  }
  size(): number {
    return this.a.length;
  }
  isEmpty(): boolean {
    return this.a.length === 0;
  }
  get(i: number): any {
    if (i < 0 || i >= this.a.length) throw new IndexOutOfBoundsException('Index ' + i + ' out of bounds for length ' + this.a.length);
    return this.a[i];
  }
  set(i: number, x: any): any {
    if (i < 0 || i >= this.a.length) throw new IndexOutOfBoundsException('Index ' + i + ' out of bounds for length ' + this.a.length);
    const old = this.a[i];
    this.a[i] = x;
    return old;
  }
  add(i: any, x?: any): boolean {
    if (arguments.length === 2) {
      if (i < 0 || i > this.a.length) throw new IndexOutOfBoundsException('Index: ' + i + ', Size: ' + this.a.length);
      this.a.splice(i, 0, x);
      return;
    }
    this.a.push(i);
    return true;
  }
  addAll(i: any, c?: any): boolean {
    if (arguments.length === 2) {
      const xs = [...c];
      this.a.splice(i, 0, ...xs);
      return xs.length > 0;
    }
    const xs = i instanceof ArrayList ? i.a.slice() : [...i];
    for (const x of xs) this.a.push(x);
    return xs.length > 0;
  }
  removeAt(i: number): any {
    if (i < 0 || i >= this.a.length) throw new IndexOutOfBoundsException('Index ' + i + ' out of bounds for length ' + this.a.length);
    return this.a.splice(i, 1)[0];
  }
  remove(o: any): boolean {
    const i = this.indexOf(o);
    if (i < 0) return false;
    this.a.splice(i, 1);
    return true;
  }
  indexOf(o: any): number {
    const a = this.a;
    if (o == null) {
      for (let i = 0; i < a.length; i++) if (a[i] == null) return i;
    } else {
      for (let i = 0; i < a.length; i++) if ($J.equals(o, a[i])) return i;
    }
    return -1;
  }
  lastIndexOf(o: any): number {
    for (let i = this.a.length - 1; i >= 0; i--) if ($J.equals(o, this.a[i]) || (o == null && this.a[i] == null)) return i;
    return -1;
  }
  contains(o: any): boolean {
    return this.indexOf(o) >= 0;
  }
  clear() {
    this.a.length = 0;
  }
  removeIf(p: any): boolean {
    const n = this.a.length;
    this.a = this.a.filter((x) => !p(x));
    return this.a.length !== n;
  }
  removeAll(c: any): boolean {
    const n = this.a.length;
    this.a = this.a.filter((x) => !c.contains(x));
    return this.a.length !== n;
  }
  retainAll(c: any): boolean {
    const n = this.a.length;
    this.a = this.a.filter((x) => c.contains(x));
    return this.a.length !== n;
  }
  replaceAll(f: any) {
    for (let i = 0; i < this.a.length; i++) this.a[i] = f(this.a[i]);
  }
  sort(c: any) {
    sortArray(this.a, c);
  }
  iterator(): any {
    return new ArrayIter(this, this.a);
  }
  listIterator(i = 0): any {
    const it = new ArrayIter(this, this.a);
    it.i = i;
    return it;
  }
  [Symbol.iterator]() {
    return this.a.slice()[Symbol.iterator]();
  }
  /** A stream's source: the array and size as they are now, as ArrayList's spliterator. */
  $each(sink: (x: any) => any): boolean {
    const a = this.a, n = a.length;
    for (let i = 0; i < n; i++) if (sink(a[i])) return true;
    return false;
  }
  forEach(f: any) {
    for (const x of this.a.slice()) f(x);
  }
  toArray(): any[] {
    return this.a.slice();
  }
  subList(from: number, to: number): any {
    if (from < 0 || to > this.a.length || from > to) throw new IndexOutOfBoundsException('fromIndex: ' + from + ', toIndex: ' + to);
    return new SubList(this, from, to);
  }
  equals(o: any): boolean {
    return listEquals(this, o);
  }
  hashCode(): number {
    return listHash(this);
  }
  ensureCapacity() {}
  trimToSize() {}
  clone(): any {
    return ArrayList.from(this.a.slice());
  }
  // Java 21 SequencedCollection
  getFirst() {
    if (!this.a.length) throw new NoSuchElementException();
    return this.a[0];
  }
  getLast() {
    if (!this.a.length) throw new NoSuchElementException();
    return this.a[this.a.length - 1];
  }
  reversed() {
    return ArrayList.from(this.a.slice().reverse());
  }
}
defineLib(ArrayList, 'java.util.ArrayList', { ifaces: ['java.util.List', 'java.util.RandomAccess'] });

function listEquals(a: any, o: any): boolean {
  if (o === a) return true;
  if (!$J.isa(o, List)) return false;
  if (a.size() !== o.size()) return false;
  const i1 = a.iterator(), i2 = o.iterator();
  while (i1.hasNext()) if (!$J.equals(i1.next(), i2.next()) && !(false)) return false;
  return true;
}

function listHash(l: any): number {
  let h = 1;
  for (const x of l) h = (Math.imul(31, h) + $J.hashCode(x)) | 0;
  return h;
}

export class SubList extends AbstractCollection {
  root: any;
  from: number;
  to: number;
  constructor(root: any, from: number, to: number) {
    super();
    this.root = root; this.from = from; this.to = to;
  }
  size() {
    return this.to - this.from;
  }
  get(i: number) {
    return this.root.get(this.from + i);
  }
  set(i: number, x: any) {
    return this.root.set(this.from + i, x);
  }
  add(i: any, x?: any) {
    if (arguments.length === 2) {
      this.root.add(this.from + i, x);
      this.to++;
      return;
    }
    this.root.add(this.to, i);
    this.to++;
    return true;
  }
  removeAt(i: number) {
    this.to--;
    return this.root.removeAt(this.from + i);
  }
  remove(o: any) {
    const i = this.indexOf(o);
    if (i < 0) return false;
    this.removeAt(i);
    return true;
  }
  indexOf(o: any) {
    for (let i = 0; i < this.size(); i++) if ($J.equals(o, this.get(i)) || (o == null && this.get(i) == null)) return i;
    return -1;
  }
  contains(o: any) {
    return this.indexOf(o) >= 0;
  }
  clear() {
    while (this.to > this.from) this.removeAt(this.size() - 1);
  }
  iterator() {
    return new ArrayIter(this, null);
  }
  listIterator(i = 0) {
    const it = new ArrayIter(this, null);
    it.i = i;
    return it;
  }
  [Symbol.iterator]() {
    const r: any[] = [];
    for (let i = this.from; i < this.to; i++) r.push(this.root.get(i));
    return r[Symbol.iterator]();
  }
  subList(a: number, b: number) {
    return new SubList(this, a, b);
  }
  sort(c: any) {
    const xs = [...this];
    sortArray(xs, c);
    for (let i = 0; i < xs.length; i++) this.set(i, xs[i]);
  }
  equals(o: any) {
    return listEquals(this, o);
  }
  hashCode() {
    return listHash(this);
  }
}
defineLib(SubList, 'java.util.ArrayList$SubList', { ifaces: ['java.util.List', 'java.util.RandomAccess'] });

/** A stable sort with a Java comparator (or natural order): TimSort and merge sort are both stable. */
export function sortArray(a: any[], c: any) {
  const cmp = c ? (x: any, y: any) => c(x, y) : (x: any, y: any) => $J.compareTo(x, y);
  // Array.prototype.sort is stable (ES2019); a comparator that is not a total order may still
  // give a different order than Java's TimSort, as in Java itself between versions.
  a.sort(cmp);
}

/* ------------------------------------------------------------------ LinkedList, ArrayDeque */

export class LinkedList extends ArrayList {
  constructor(arg?: any) {
    super(arg);
  }
  _LinkedList(arg?: any): this {
    return this._ArrayList(arg);
  }
  addFirst(x: any) { this.a.unshift(x); }
  addLast(x: any) { this.a.push(x); }
  offer(x: any) { this.a.push(x); return true; }
  offerFirst(x: any) { this.a.unshift(x); return true; }
  offerLast(x: any) { this.a.push(x); return true; }
  push(x: any) { this.a.unshift(x); }
  pop() { return this.removeFirst(); }
  poll() { return this.a.length ? this.a.shift() : null; }
  pollFirst() { return this.poll(); }
  pollLast() { return this.a.length ? this.a.pop() : null; }
  peek() { return this.a.length ? this.a[0] : null; }
  peekFirst() { return this.peek(); }
  peekLast() { return this.a.length ? this.a[this.a.length - 1] : null; }
  element() { return this.getFirst(); }
  removeFirst() { if (!this.a.length) throw new NoSuchElementException(); return this.a.shift(); }
  removeLast() { if (!this.a.length) throw new NoSuchElementException(); return this.a.pop(); }
  remove(o?: any): any {
    if (arguments.length === 0) return this.removeFirst();
    return super.remove(o);
  }
  descendingIterator() {
    const r = ArrayList.from(this.a.slice().reverse());
    return r.iterator();
  }
  clone(): any {
    const l = new LinkedList();
    l.a = this.a.slice();
    return l;
  }
}
defineLib(LinkedList, 'java.util.LinkedList', { ifaces: ['java.util.List', 'java.util.Deque'] });
export class ArrayDeque extends LinkedList {
  _ArrayDeque(arg?: any): this {
    if (arg != null && typeof arg === 'object') this.addAll(arg);
    return this;
  }
}
defineLib(ArrayDeque, 'java.util.ArrayDeque', { ifaces: ['java.util.Deque'] });

/* ------------------------------------------------------------------ HashMap (Java's algorithm) */

class Node {
  before: Node = null; // LinkedHashMap
  after: Node = null;
  hash: number;
  key: any;
  value: any;
  next: Node;
  // a tree bin's node (HashMap.TreeNode): red-black links, and prev in the bin's list
  tree = false;
  parent: Node = null;
  left: Node = null;
  right: Node = null;
  prev: Node = null;
  red = false;
  constructor(hash: number, key: any, value: any, next: Node) { this.hash = hash; this.key = key; this.value = value; this.next = next; }
}

/*
 * Tree bins, as java.util.HashMap.TreeNode (OpenJDK 21) builds them: a bin of 8 or more entries in a table of
 * 64 or more becomes a red-black tree, and inserting, removing and resizing then reorder the bin's list (the
 * root moves to the front, a new entry follows its tree parent). Iteration follows that list, so the
 * algorithm is reproduced exactly (adapted from OpenJDK's HashMap.java, GPL-2.0 with the Classpath Exception).
 */
const UNTREEIFY_THRESHOLD = 6;

function comparableClassFor(x: any): any {
  if (typeof x === 'string') return 'string';
  if (typeof x === 'number') return 'number';
  if (x != null && typeof x === 'object') {
    const meta = Object.prototype.hasOwnProperty.call(x.constructor, '$meta') ? x.constructor.$meta : null;
    if (meta && meta.comparableSelf) return x.constructor;
  }
  return null;
}

function compareComparables(kc: any, k: any, x: any): number {
  if (x == null) return 0;
  const xc = typeof x === 'string' ? 'string' : typeof x === 'number' ? 'number' : x.constructor;
  return xc !== kc ? 0 : $J.compareTo(k, x);
}

function tieBreakOrder(a: any, b: any): number {
  let d = 0;
  if (a == null || b == null || (d = JString.compareTo($J.getClass(a).getName(), $J.getClass(b).getName())) === 0) {
    d = $J.identityHashCode(a) <= $J.identityHashCode(b) ? -1 : 1;
  }
  return d;
}

function treeRoot(r: Node): Node {
  for (let p: Node; ;) {
    if ((p = r.parent) == null) return r;
    r = p;
  }
}

function moveRootToFront(tab: Node[], root: Node) {
  let n: number;
  if (root != null && tab != null && (n = tab.length) > 0) {
    const index = (n - 1) & root.hash;
    const first = tab[index];
    if (root !== first) {
      let rn: Node;
      tab[index] = root;
      const rp = root.prev;
      if ((rn = root.next) != null) rn.prev = rp;
      if (rp != null) rp.next = rn;
      if (first != null) first.prev = root;
      root.next = first;
      root.prev = null;
    }
  }
}

function treeFind(p: Node, h: number, k: any, kc: any): Node {
  do {
    let ph: number, dir: number, pk: any;
    const pl = p.left, pr = p.right;
    let q: Node;
    if ((ph = p.hash) > h) p = pl;
    else if (ph < h) p = pr;
    else if ((pk = p.key) === k || (k != null && $J.equals(k, pk))) return p;
    else if (pl == null) p = pr;
    else if (pr == null) p = pl;
    else if ((kc != null || (kc = comparableClassFor(k)) != null) && (dir = compareComparables(kc, k, pk)) !== 0) p = dir < 0 ? pl : pr;
    else if ((q = treeFind(pr, h, k, kc)) != null) return q;
    else p = pl;
  } while (p != null);
  return null;
}

function getTreeNode(first: Node, h: number, k: any): Node {
  return treeFind(first.parent != null ? treeRoot(first) : first, h, k, null);
}

function treeify(head: Node, tab: Node[]) {
  let root: Node = null;
  for (let x = head, next: Node; x != null; x = next) {
    next = x.next;
    x.left = x.right = null;
    if (root == null) {
      x.parent = null;
      x.red = false;
      root = x;
    } else {
      const k = x.key, h = x.hash;
      let kc: any = null;
      for (let p = root; ;) {
        let dir: number;
        const ph = p.hash, pk = p.key;
        if (ph > h) dir = -1;
        else if (ph < h) dir = 1;
        else if ((kc == null && (kc = comparableClassFor(k)) == null) || (dir = compareComparables(kc, k, pk)) === 0) dir = tieBreakOrder(k, pk);
        const xp = p;
        if ((p = dir <= 0 ? p.left : p.right) == null) {
          x.parent = xp;
          if (dir <= 0) xp.left = x;
          else xp.right = x;
          root = balanceInsertion(root, x);
          break;
        }
      }
    }
  }
  moveRootToFront(tab, root);
}

/** A tree bin back to a list (HashMap.TreeNode.untreeify). */
function untreeify(head: Node): Node {
  for (let q = head; q != null; q = q.next) {
    q.tree = false;
    q.parent = q.left = q.right = q.prev = null;
    q.red = false;
  }
  return head;
}

function putTreeVal(map: HashMap, tab: Node[], first: Node, h: number, k: any, v: any): Node {
  let kc: any = null;
  let searched = false;
  const root = first.parent != null ? treeRoot(first) : first;
  for (let p = root; ;) {
    let dir: number, pk: any;
    const ph = p.hash;
    if (ph > h) dir = -1;
    else if (ph < h) dir = 1;
    else if ((pk = p.key) === k || (k != null && $J.equals(k, pk))) return p;
    else if ((kc == null && (kc = comparableClassFor(k)) == null) || (dir = compareComparables(kc, k, pk)) === 0) {
      if (!searched) {
        let q: Node, ch: Node;
        searched = true;
        if (((ch = p.left) != null && (q = treeFind(ch, h, k, kc)) != null) || ((ch = p.right) != null && (q = treeFind(ch, h, k, kc)) != null)) return q;
      }
      dir = tieBreakOrder(k, pk);
    }
    const xp = p;
    if ((p = dir <= 0 ? p.left : p.right) == null) {
      const xpn = xp.next;
      const x = map.newNode(h, k, v, xpn);
      x.tree = true;
      if (dir <= 0) xp.left = x;
      else xp.right = x;
      xp.next = x;
      x.parent = x.prev = xp;
      if (xpn != null) xpn.prev = x;
      moveRootToFront(tab, balanceInsertion(root, x));
      return null;
    }
  }
}

function removeTreeNode(node: Node, tab: Node[], movable: boolean) {
  let n: number;
  if (tab == null || (n = tab.length) === 0) return;
  const index = (n - 1) & node.hash;
  let first = tab[index], root = first, rl: Node;
  const succ = node.next, pred = node.prev;
  if (pred == null) tab[index] = first = succ;
  else pred.next = succ;
  if (succ != null) succ.prev = pred;
  if (first == null) return;
  if (root.parent != null) root = treeRoot(root);
  if (root == null || (movable && (root.right == null || (rl = root.left) == null || rl.left == null))) {
    tab[index] = untreeify(first);
    return;
  }
  const p = node, pl = node.left, pr = node.right;
  let replacement: Node;
  if (pl != null && pr != null) {
    let s = pr, sl: Node;
    while ((sl = s.left) != null) s = sl;
    const c = s.red;
    s.red = p.red;
    p.red = c;
    const sr = s.right;
    const pp = p.parent;
    if (s === pr) {
      p.parent = s;
      s.right = p;
    } else {
      const sp = s.parent;
      if ((p.parent = sp) != null) {
        if (s === sp.left) sp.left = p;
        else sp.right = p;
      }
      if ((s.right = pr) != null) pr.parent = s;
    }
    p.left = null;
    if ((p.right = sr) != null) sr.parent = p;
    if ((s.left = pl) != null) pl.parent = s;
    if ((s.parent = pp) == null) root = s;
    else if (p === pp.left) pp.left = s;
    else pp.right = s;
    replacement = sr != null ? sr : p;
  } else if (pl != null) replacement = pl;
  else if (pr != null) replacement = pr;
  else replacement = p;
  if (replacement !== p) {
    const pp = (replacement.parent = p.parent);
    if (pp == null) (root = replacement).red = false;
    else if (p === pp.left) pp.left = replacement;
    else pp.right = replacement;
    p.left = p.right = p.parent = null;
  }
  const r = p.red ? root : balanceDeletion(root, replacement);
  if (replacement === p) {
    const pp = p.parent;
    p.parent = null;
    if (pp != null) {
      if (p === pp.left) pp.left = null;
      else if (p === pp.right) pp.right = null;
    }
  }
  if (movable) moveRootToFront(tab, r);
}

function splitTree(b: Node, tab: Node[], index: number, bit: number) {
  let loHead: Node = null, loTail: Node = null, hiHead: Node = null, hiTail: Node = null;
  let lc = 0, hc = 0;
  for (let e = b, next: Node; e != null; e = next) {
    next = e.next;
    e.next = null;
    if ((e.hash & bit) === 0) {
      if ((e.prev = loTail) == null) loHead = e;
      else loTail.next = e;
      loTail = e;
      ++lc;
    } else {
      if ((e.prev = hiTail) == null) hiHead = e;
      else hiTail.next = e;
      hiTail = e;
      ++hc;
    }
  }
  if (loHead != null) {
    if (lc <= UNTREEIFY_THRESHOLD) tab[index] = untreeify(loHead);
    else {
      tab[index] = loHead;
      if (hiHead != null) treeify(loHead, tab);
    }
  }
  if (hiHead != null) {
    if (hc <= UNTREEIFY_THRESHOLD) tab[index + bit] = untreeify(hiHead);
    else {
      tab[index + bit] = hiHead;
      if (loHead != null) treeify(hiHead, tab);
    }
  }
}

function rotateLeft(root: Node, p: Node): Node {
  let r: Node, pp: Node, rl: Node;
  if (p != null && (r = p.right) != null) {
    if ((rl = p.right = r.left) != null) rl.parent = p;
    if ((pp = r.parent = p.parent) == null) (root = r).red = false;
    else if (pp.left === p) pp.left = r;
    else pp.right = r;
    r.left = p;
    p.parent = r;
  }
  return root;
}

function rotateRight(root: Node, p: Node): Node {
  let l: Node, pp: Node, lr: Node;
  if (p != null && (l = p.left) != null) {
    if ((lr = p.left = l.right) != null) lr.parent = p;
    if ((pp = l.parent = p.parent) == null) (root = l).red = false;
    else if (pp.right === p) pp.right = l;
    else pp.left = l;
    l.right = p;
    p.parent = l;
  }
  return root;
}

function balanceInsertion(root: Node, x: Node): Node {
  x.red = true;
  for (let xp: Node, xpp: Node, xppl: Node, xppr: Node; ;) {
    if ((xp = x.parent) == null) {
      x.red = false;
      return x;
    } else if (!xp.red || (xpp = xp.parent) == null) return root;
    if (xp === (xppl = xpp.left)) {
      if ((xppr = xpp.right) != null && xppr.red) {
        xppr.red = false;
        xp.red = false;
        xpp.red = true;
        x = xpp;
      } else {
        if (x === xp.right) {
          root = rotateLeft(root, (x = xp));
          xpp = (xp = x.parent) == null ? null : xp.parent;
        }
        if (xp != null) {
          xp.red = false;
          if (xpp != null) {
            xpp.red = true;
            root = rotateRight(root, xpp);
          }
        }
      }
    } else {
      if (xppl != null && xppl.red) {
        xppl.red = false;
        xp.red = false;
        xpp.red = true;
        x = xpp;
      } else {
        if (x === xp.left) {
          root = rotateRight(root, (x = xp));
          xpp = (xp = x.parent) == null ? null : xp.parent;
        }
        if (xp != null) {
          xp.red = false;
          if (xpp != null) {
            xpp.red = true;
            root = rotateLeft(root, xpp);
          }
        }
      }
    }
  }
}

function balanceDeletion(root: Node, x: Node): Node {
  for (let xp: Node, xpl: Node, xpr: Node; ;) {
    if (x == null || x === root) return root;
    else if ((xp = x.parent) == null) {
      x.red = false;
      return x;
    } else if (x.red) {
      x.red = false;
      return root;
    } else if ((xpl = xp.left) === x) {
      if ((xpr = xp.right) != null && xpr.red) {
        xpr.red = false;
        xp.red = true;
        root = rotateLeft(root, xp);
        xpr = (xp = x.parent) == null ? null : xp.right;
      }
      if (xpr == null) x = xp;
      else {
        let sl = xpr.left, sr = xpr.right;
        if ((sr == null || !sr.red) && (sl == null || !sl.red)) {
          xpr.red = true;
          x = xp;
        } else {
          if (sr == null || !sr.red) {
            if (sl != null) sl.red = false;
            xpr.red = true;
            root = rotateRight(root, xpr);
            xpr = (xp = x.parent) == null ? null : xp.right;
          }
          if (xpr != null) {
            xpr.red = xp == null ? false : xp.red;
            if ((sr = xpr.right) != null) sr.red = false;
          }
          if (xp != null) {
            xp.red = false;
            root = rotateLeft(root, xp);
          }
          x = root;
        }
      }
    } else {
      if (xpl != null && xpl.red) {
        xpl.red = false;
        xp.red = true;
        root = rotateRight(root, xp);
        xpl = (xp = x.parent) == null ? null : xp.left;
      }
      if (xpl == null) x = xp;
      else {
        let sl = xpl.left, sr = xpl.right;
        if ((sl == null || !sl.red) && (sr == null || !sr.red)) {
          xpl.red = true;
          x = xp;
        } else {
          if (sl == null || !sl.red) {
            if (sr != null) sr.red = false;
            xpl.red = true;
            root = rotateLeft(root, xpl);
            xpl = (xp = x.parent) == null ? null : xp.left;
          }
          if (xpl != null) {
            xpl.red = xp == null ? false : xp.red;
            if ((sl = xpl.left) != null) sl.red = false;
          }
          if (xp != null) {
            xp.red = false;
            root = rotateRight(root, xp);
          }
          x = root;
        }
      }
    }
  }
}

function spread(key: any): number {
  if (key == null) return 0;
  const h = $J.hashCode(key);
  return h ^ (h >>> 16);
}

function tableSizeFor(cap: number): number {
  const n = (-1 >>> Math.clz32(cap - 1)) | 0; // an int, as in Java (-1 for cap 0)
  return n < 0 ? 1 : n >= 1 << 30 ? 1 << 30 : n + 1;
}

function keyEq(a: any, b: any): boolean {
  return a === b || (a != null && $J.equals(a, b));
}

class MapEntry extends JObject {
  map: any;
  node: Node;
  constructor(map: any, node: Node) {
    super();
    this.map = map; this.node = node;
  }
  getKey() {
    return this.node.key;
  }
  getValue() {
    return this.node.value;
  }
  setValue(v: any) {
    const o = this.node.value;
    this.node.value = v;
    return o;
  }
  equals(o: any) {
    return $J.isa(o, JMap_Entry) && keyEq(this.getKey(), o.getKey()) && keyEq(this.getValue(), o.getValue()) || (o != null && o.getValue && this.getValue() == null && o.getValue() == null && keyEq(this.getKey(), o.getKey()));
  }
  hashCode() {
    return $J.hashCode(this.node.key) ^ $J.hashCode(this.node.value);
  }
  toString() {
    return str(this.node.key) + '=' + str(this.node.value);
  }
}
defineLib(MapEntry, 'java.util.HashMap$Node', { ifaces: ['java.util.Map$Entry'] });

export class AbstractMap extends JObject {
  _AbstractMap(): this {
    return this;
  }
  isEmpty() {
    return this.size() === 0;
  }
  getOrDefault(k: any, d: any) {
    const v = this.get(k);
    return v != null || this.containsKey(k) ? v : d;
  }
  containsValue(v: any) {
    for (const x of this.values()) if (keyEq(v, x)) return true;
    return false;
  }
  putAll(m: any) {
    for (const e of m.entrySet()) this.put(e.getKey(), e.getValue());
  }
  putIfAbsent(k: any, v: any) {
    let old = this.get(k);
    if (old == null) old = this.put(k, v);
    return old;
  }
  computeIfAbsent(k: any, f: any) {
    let v = this.get(k);
    if (v == null) {
      const nv = f(k);
      if (nv != null) {
        this.put(k, nv);
        return nv;
      }
    }
    return v;
  }
  computeIfPresent(k: any, f: any) {
    const old = this.get(k);
    if (old != null) {
      const nv = f(k, old);
      if (nv != null) this.put(k, nv);
      else this.remove(k);
      return nv;
    }
    return null;
  }
  compute(k: any, f: any) {
    const old = this.get(k);
    const nv = f(k, old);
    if (nv == null) {
      if (old != null || this.containsKey(k)) this.remove(k);
      return null;
    }
    this.put(k, nv);
    return nv;
  }
  merge(k: any, v: any, f: any) {
    const old = this.get(k);
    const nv = old == null ? v : f(old, v);
    if (nv == null) this.remove(k);
    else this.put(k, nv);
    return nv;
  }
  forEach(f: any) {
    for (const e of this.entrySet()) f(e.getKey(), e.getValue());
  }
  replaceAll(f: any) {
    for (const e of this.entrySet()) e.setValue(f(e.getKey(), e.getValue()));
  }
  replace(k: any, v: any) {
    if (this.containsKey(k)) return this.put(k, v);
    return null;
  }
  equals(o: any) {
    if (o === this) return true;
    if (!$J.isa(o, JMap) || o.size() !== this.size()) return false;
    for (const e of this.entrySet()) {
      const k = e.getKey(), v = e.getValue();
      if (v == null) {
        if (!(o.get(k) == null && o.containsKey(k))) return false;
      } else if (!$J.equals(v, o.get(k))) return false;
    }
    return true;
  }
  hashCode() {
    let h = 0;
    for (const e of this.entrySet()) h = (h + ($J.hashCode(e.getKey()) ^ $J.hashCode(e.getValue()))) | 0;
    return h;
  }
  toString() {
    const parts: string[] = [];
    for (const e of this.entrySet()) parts.push(str(e.getKey()) + '=' + str(e.getValue()));
    return '{' + parts.join(', ') + '}';
  }
}

/** A view of a map (keySet, values, entrySet). */
class MapView extends AbstractCollection {
  map: any;
  kind: number;
  constructor(map: any, kind: number) {
    super();
    this.map = map; this.kind = kind;
  }
  size() {
    return this.map.size();
  }
  iterator() {
    return this.map.$iter(this.kind);
  }
  [Symbol.iterator]() {
    return jsIter(this.iterator());
  }
  contains(o: any) {
    if (this.kind === 0) return this.map.containsKey(o);
    if (this.kind === 1) return this.map.containsValue(o);
    return o != null && this.map.containsKey(o.getKey()) && keyEq(this.map.get(o.getKey()), o.getValue());
  }
  remove(o: any) {
    if (this.kind === 0) {
      if (!this.map.containsKey(o)) return false;
      this.map.remove(o);
      return true;
    }
    return super.remove(o);
  }
  clear() {
    this.map.clear();
  }
  equals(o: any) {
    if (o === this) return true;
    if (!$J.isa(o, Collection) || o.size() !== this.size()) return false;
    return this.containsAll(o);
  }
  hashCode() {
    let h = 0;
    for (const x of this) h = (h + $J.hashCode(x)) | 0;
    return h;
  }
}
defineLib(MapView, 'java.util.HashMap$KeySet', { ifaces: ['java.util.Set'] });

class HashIter extends JObject {
  next_: Node = null;
  current: Node = null;
  index = 0;
  map: HashMap;
  kind: number;
  constructor(map: HashMap, kind: number) {
    super();
    this.map = map; this.kind = kind;
    const t = map.table;
    if (t && map.sz > 0) {
      while (this.index < t.length && (this.next_ = t[this.index++]) == null);
    }
  }
  hasNext() {
    return this.next_ != null;
  }
  nextNode(): Node {
    const e = this.next_;
    if (e == null) throw new NoSuchElementException();
    this.current = e;
    const t = this.map.table;
    if ((this.next_ = e.next) == null && t) {
      while (this.index < t.length && (this.next_ = t[this.index++]) == null);
    }
    return e;
  }
  next() {
    const e = this.nextNode();
    return this.kind === 0 ? e.key : this.kind === 1 ? e.value : new MapEntry(this.map, e);
  }
  remove() {
    const p = this.current;
    if (p == null) throw new IllegalStateException();
    this.current = null;
    this.map.removeNode(p.hash, p.key, null, false, false);
  }
  forEachRemaining(f: any) {
    while (this.hasNext()) f(this.next());
  }
}

export class HashMap extends AbstractMap {
  table: Node[] = null;
  sz = 0;
  threshold = 0;
  loadFactor = 0.75;
  constructor(a?: any, b?: any) {
    super();
    if (a !== undefined) this._HashMap(a, b);
  }
  _HashMap(a?: any, b?: any): this {
    if (typeof a === 'number') {
      if (a < 0) throw new IllegalArgumentException('Illegal initial capacity: ' + a);
      if (typeof b === 'number') this.loadFactor = b;
      this.threshold = tableSizeFor(a);
    } else if (a != null) {
      this.putMapEntries(a, false);
    }
    return this;
  }
  static newHashMap(n: number): HashMap {
    return new HashMap(Math.ceil(n / 0.75));
  }
  size() {
    return this.sz;
  }
  isEmpty() {
    return this.sz === 0;
  }
  getNode(key: any): Node {
    const t = this.table;
    let n: number, first: Node, e: Node;
    if (t != null && (n = t.length) > 0) {
      const h = spread(key);
      if ((first = t[(n - 1) & h]) != null) {
        if (first.hash === h && keyEq(key, first.key)) return first;
        if ((e = first.next) != null) {
          if (first.tree) return getTreeNode(first, h, key);
          do {
            if (e.hash === h && keyEq(key, e.key)) return e;
          } while ((e = e.next) != null);
        }
      }
    }
    return null;
  }
  get(key: any) {
    const e = this.getNode(key);
    return e == null ? null : e.value;
  }
  containsKey(key: any) {
    return this.getNode(key) != null;
  }
  getOrDefault(key: any, d: any) {
    const e = this.getNode(key);
    return e == null ? d : e.value;
  }
  newNode(h: number, k: any, v: any, next: Node): Node {
    return new Node(h, k, v, next);
  }
  afterNodeAccess(_e: Node) {}
  afterNodeInsertion() {}
  afterNodeRemoval(_e: Node) {}
  put(key: any, value: any) {
    return this.putVal(spread(key), key, value, false);
  }
  putIfAbsent(key: any, value: any) {
    return this.putVal(spread(key), key, value, true);
  }
  putVal(h: number, key: any, value: any, onlyIfAbsent: boolean) {
    let t = this.table;
    let n: number;
    if (t == null || (n = t.length) === 0) n = (t = this.resize()).length;
    const i = (n - 1) & h;
    let p = t[i];
    let e: Node = null;
    if (p == null) {
      t[i] = this.newNode(h, key, value, null);
    } else {
      if (p.hash === h && keyEq(key, p.key)) e = p;
      else if (p.tree) e = putTreeVal(this, t, p, h, key, value);
      else {
        for (let binCount = 0; ; ++binCount) {
          if ((e = p.next) == null) {
            p.next = this.newNode(h, key, value, null);
            if (binCount >= 7) this.treeifyBin(t, h);
            break;
          }
          if (e.hash === h && keyEq(key, e.key)) break;
          p = e;
        }
      }
      if (e != null) {
        const old = e.value;
        if (!onlyIfAbsent || old == null) e.value = value;
        this.afterNodeAccess(e);
        return old;
      }
    }
    if (++this.sz > this.threshold) this.resize();
    this.afterNodeInsertion();
    return null;
  }
  /** A long bin: a small table grows, in a big one the bin becomes a tree (HashMap.treeifyBin). */
  treeifyBin(t: Node[], h: number) {
    let n: number, e: Node;
    if (t == null || (n = t.length) < 64) this.resize();
    else if ((e = t[(n - 1) & h]) != null) {
      HashMap.treeBins++;
      let tl: Node = null;
      const hd = e;
      do {
        e.tree = true;
        e.prev = tl;
        tl = e;
      } while ((e = e.next) != null);
      treeify(hd, t);
    }
  }
  /** How many bins became trees (for the tests). */
  static treeBins = 0;
  resize(): Node[] {
    const oldTab = this.table;
    const oldCap = oldTab == null ? 0 : oldTab.length;
    const oldThr = this.threshold;
    let newCap = 0, newThr = 0;
    if (oldCap > 0) {
      if (oldCap >= 1 << 30) {
        this.threshold = 2147483647;
        return oldTab;
      } else if ((newCap = oldCap << 1) < 1 << 30 && oldCap >= 16) newThr = oldThr << 1;
    } else if (oldThr > 0) newCap = oldThr;
    else {
      newCap = 16;
      newThr = 12;
    }
    if (newThr === 0) {
      const ft = Math.fround(newCap * this.loadFactor);
      newThr = newCap < 1 << 30 && ft < 1 << 30 ? Math.trunc(ft) : 2147483647;
    }
    this.threshold = newThr;
    if (newCap > (1 << 22)) throw new Error("HashMap table of " + newCap + " (size " + this.sz + ", threshold " + oldThr + ")");
    const newTab: Node[] = new Array(newCap).fill(null);
    this.table = newTab;
    if (oldTab != null) {
      for (let j = 0; j < oldCap; ++j) {
        let e = oldTab[j];
        if (e != null) {
          oldTab[j] = null;
          if (e.next == null) newTab[e.hash & (newCap - 1)] = e;
          else if (e.tree) splitTree(e, newTab, j, oldCap);
          else {
            let loHead: Node = null, loTail: Node = null, hiHead: Node = null, hiTail: Node = null, next: Node;
            do {
              next = e.next;
              if ((e.hash & oldCap) === 0) {
                if (loTail == null) loHead = e;
                else loTail.next = e;
                loTail = e;
              } else {
                if (hiTail == null) hiHead = e;
                else hiTail.next = e;
                hiTail = e;
              }
            } while ((e = next) != null);
            if (loTail != null) {
              loTail.next = null;
              newTab[j] = loHead;
            }
            if (hiTail != null) {
              hiTail.next = null;
              newTab[j + oldCap] = hiHead;
            }
          }
        }
      }
    }
    return newTab;
  }
  putMapEntries(m: any, _evict: boolean) {
    const s = m.size();
    if (s > 0) {
      if (this.table == null) {
        const dt = Math.ceil(s / this.loadFactor);
        const t = dt < 1 << 30 ? Math.trunc(dt) : 1 << 30;
        if (t > this.threshold) this.threshold = tableSizeFor(t);
      } else {
        while (s > this.threshold && this.table.length < 1 << 30) this.resize();
      }
      for (const e of m.entrySet()) {
        const k = e.getKey();
        this.putVal(spread(k), k, e.getValue(), false);
      }
    }
  }
  putAll(m: any) {
    this.putMapEntries(m, true);
  }
  remove(key: any, value?: any) {
    if (arguments.length === 2) return this.removeNode(spread(key), key, value, true, true) != null;
    const e = this.removeNode(spread(key), key, null, false, true);
    return e == null ? null : e.value;
  }
  removeNode(h: number, key: any, value: any, matchValue: boolean, movable = true): Node {
    const t = this.table;
    let n: number;
    if (t != null && (n = t.length) > 0) {
      const index = (n - 1) & h;
      let p = t[index];
      if (p == null) return null;
      let node: Node = null, e: Node;
      if (p.hash === h && keyEq(key, p.key)) node = p;
      else if ((e = p.next) != null) {
        if (p.tree) node = getTreeNode(p, h, key);
        else {
          do {
            if (e.hash === h && keyEq(key, e.key)) {
              node = e;
              break;
            }
            p = e;
          } while ((e = e.next) != null);
        }
      }
      if (node != null && (!matchValue || node.value === value || (value != null && $J.equals(value, node.value)))) {
        if (node.tree) removeTreeNode(node, t, movable);
        else if (node === p) t[index] = node.next;
        else p.next = node.next;
        --this.sz;
        this.afterNodeRemoval(node);
        return node;
      }
    }
    return null;
  }
  clear() {
    const t = this.table;
    if (t != null && this.sz > 0) {
      this.sz = 0;
      t.fill(null);
    }
    this.clearLinks();
  }
  clearLinks() {}
  containsValue(v: any) {
    const t = this.table;
    if (t != null && this.sz > 0) {
      for (const e0 of t) for (let e = e0; e != null; e = e.next) if (e.value === v || (v != null && $J.equals(v, e.value))) return true;
    }
    return false;
  }
  /**
   * The bin of a key for computeIfAbsent, compute and merge, which resize before they look (if the map is
   * over its threshold), and link a new entry at the head of a list bin (or into a tree bin).
   */
  findForCompute(key: any): { h: number; t: Node[]; i: number; first: Node; old: Node; binCount: number } {
    const h = spread(key);
    let t = this.table;
    let n: number;
    if (this.sz > this.threshold || t == null || (n = t.length) === 0) n = (t = this.resize()).length;
    const i = (n - 1) & h;
    const first = t[i];
    let old: Node = null;
    let binCount = 0;
    if (first != null) {
      if (first.tree) old = getTreeNode(first, h, key);
      else {
        let e = first;
        do {
          if (e.hash === h && keyEq(key, e.key)) {
            old = e;
            break;
          }
          ++binCount;
        } while ((e = e.next) != null);
      }
    }
    return { h, t, i, first, old, binCount };
  }
  linkNew(f: { h: number; t: Node[]; i: number; first: Node; binCount: number }, key: any, v: any) {
    if (f.first != null && f.first.tree) putTreeVal(this, f.t, f.first, f.h, key, v);
    else {
      f.t[f.i] = this.newNode(f.h, key, v, f.first);
      if (f.binCount >= 7) this.treeifyBin(f.t, f.h);
    }
    ++this.sz;
    this.afterNodeInsertion();
  }
  computeIfAbsent(key: any, fn: any) {
    if (fn == null) throw new NullPointerException();
    const f = this.findForCompute(key);
    const old = f.old;
    if (old != null && old.value != null) {
      this.afterNodeAccess(old);
      return old.value;
    }
    const v = fn(key);
    if (v == null) return null;
    if (old != null) {
      old.value = v;
      this.afterNodeAccess(old);
      return v;
    }
    this.linkNew(f, key, v);
    return v;
  }
  compute(key: any, fn: any) {
    if (fn == null) throw new NullPointerException();
    const f = this.findForCompute(key);
    const old = f.old;
    const oldValue = old == null ? null : old.value;
    const v = fn(key, oldValue);
    if (old != null) {
      if (v != null) {
        old.value = v;
        this.afterNodeAccess(old);
      } else this.removeNode(f.h, key, null, false, true);
    } else if (v != null) {
      this.linkNew(f, key, v);
    }
    return v;
  }
  computeIfPresent(key: any, fn: any) {
    const e = this.getNode(key);
    if (e != null && e.value != null) {
      const v = fn(key, e.value);
      if (v == null) this.removeNode(e.hash, key, null, false, true);
      else {
        e.value = v;
        this.afterNodeAccess(e);
      }
      return v;
    }
    return null;
  }
  merge(key: any, value: any, fn: any) {
    if (value == null || fn == null) throw new NullPointerException();
    const f = this.findForCompute(key);
    const old = f.old;
    if (old != null) {
      let v;
      if (old.value != null) v = fn(old.value, value);
      else v = value;
      if (v != null) {
        old.value = v;
        this.afterNodeAccess(old);
      } else this.removeNode(f.h, key, null, false, true);
      return v;
    }
    this.linkNew(f, key, value);
    return value;
  }
  replace(key: any, a: any, b?: any) {
    const e = this.getNode(key);
    if (arguments.length === 3) {
      if (e != null && keyEq(a, e.value)) {
        e.value = b;
        this.afterNodeAccess(e);
        return true;
      }
      return false;
    }
    if (e != null) {
      const old = e.value;
      e.value = a;
      this.afterNodeAccess(e);
      return old;
    }
    return null;
  }
  $iter(kind: number): any {
    return new HashIter(this, kind);
  }
  keySet() {
    return new MapView(this, 0);
  }
  values() {
    return new MapView(this, 1);
  }
  entrySet() {
    return new MapView(this, 2);
  }
  forEach(f: any) {
    const t = this.table;
    if (t != null && this.sz > 0) for (const e0 of t) for (let e = e0; e != null; e = e.next) f(e.key, e.value);
  }
  replaceAll(f: any) {
    const t = this.table;
    if (t != null && this.sz > 0) for (const e0 of t) for (let e = e0; e != null; e = e.next) e.value = f(e.key, e.value);
  }
  clone(): any {
    const m = new (this.constructor as any)();
    m.putMapEntries(this, false);
    return m;
  }
}
defineLib(HashMap, 'java.util.HashMap', { ifaces: ['java.util.Map'] });

/* ------------------------------------------------------------------ LinkedHashMap */

class LinkedIter extends JObject {
  nextE: Node;
  current: Node = null;
  map: LinkedHashMap;
  kind: number;
  constructor(map: LinkedHashMap, kind: number) {
    super();
    this.map = map; this.kind = kind;
    this.nextE = map.head;
  }
  hasNext() {
    return this.nextE != null;
  }
  next() {
    const e = this.nextE;
    if (e == null) throw new NoSuchElementException();
    this.current = e;
    this.nextE = e.after;
    return this.kind === 0 ? e.key : this.kind === 1 ? e.value : new MapEntry(this.map, e);
  }
  remove() {
    const p = this.current;
    if (p == null) throw new IllegalStateException();
    this.current = null;
    this.map.removeNode(p.hash, p.key, null, false, false);
  }
}

export class LinkedHashMap extends HashMap {
  head: Node = null;
  tail: Node = null;
  accessOrder = false;
  constructor(a?: any, b?: any, c?: any) {
    super();
    if (a !== undefined) this._LinkedHashMap(a, b, c);
  }
  _LinkedHashMap(a?: any, b?: any, c?: any): this {
    if (typeof c === 'boolean') this.accessOrder = c;
    return this._HashMap(a, b);
  }
  newNode(h: number, k: any, v: any, next: Node): Node {
    const p = new Node(h, k, v, next);
    const last = this.tail;
    this.tail = p;
    if (last == null) this.head = p;
    else {
      p.before = last;
      last.after = p;
    }
    return p;
  }
  afterNodeRemoval(e: Node) {
    const b = e.before, a = e.after;
    e.before = e.after = null;
    if (b == null) this.head = a;
    else b.after = a;
    if (a == null) this.tail = b;
    else a.before = b;
  }
  afterNodeAccess(e: Node) {
    if (this.accessOrder && this.tail !== e) {
      const b = e.before, a = e.after;
      e.after = null;
      if (b == null) this.head = a;
      else b.after = a;
      if (a != null) a.before = b;
      let last = a != null ? this.tail : b;
      if (last == null) this.head = e;
      else {
        e.before = last;
        last.after = e;
      }
      this.tail = e;
    }
  }
  afterNodeInsertion() {
    const first = this.head;
    if (first != null && this.removeEldestEntry(new MapEntry(this, first))) this.removeNode(first.hash, first.key, null, false);
  }
  removeEldestEntry(_e: any) {
    return false;
  }
  get(key: any) {
    const e = this.getNode(key);
    if (e == null) return null;
    if (this.accessOrder) this.afterNodeAccess(e);
    return e.value;
  }
  clearLinks() {
    this.head = this.tail = null;
  }
  $iter(kind: number): any {
    return new LinkedIter(this, kind);
  }
  forEach(f: any) {
    for (let e = this.head; e != null; e = e.after) f(e.key, e.value);
  }
  replaceAll(f: any) {
    for (let e = this.head; e != null; e = e.after) e.value = f(e.key, e.value);
  }
}
defineLib(LinkedHashMap, 'java.util.LinkedHashMap', { ifaces: ['java.util.Map'] });

/* ------------------------------------------------------------------ IdentityHashMap, TreeMap, EnumMap */

/** IdentityHashMap: Java's order depends on identity hashes (differs run to run); this keeps insertion order. */
export class IdentityHashMap extends AbstractMap {
  m = new Map<any, any>();
  constructor(a?: any) {
    super();
    if (a != null && typeof a === 'object') this.putAll(a);
  }
  _IdentityHashMap(): this {
    return this;
  }
  size() { return this.m.size; }
  get(k: any) { return this.m.has(k) ? this.m.get(k) : null; }
  containsKey(k: any) { return this.m.has(k); }
  put(k: any, v: any) { const o = this.get(k); this.m.set(k, v); return o; }
  remove(k: any) { const o = this.get(k); this.m.delete(k); return o; }
  clear() { this.m.clear(); }
  $iter(kind: number) {
    const keys = [...this.m.keys()];
    let i = 0, cur: any = undefined;
    const self = this;
    return {
      hasNext: () => i < keys.length,
      next: () => {
        cur = keys[i++];
        if (kind === 0) return cur;
        if (kind === 1) return self.m.get(cur);
        return new AbstractMap_SimpleEntry(cur, self.m.get(cur), self);
      },
      remove: () => self.m.delete(cur),
    };
  }
  keySet() { return new MapView(this, 0); }
  values() { return new MapView(this, 1); }
  entrySet() { return new MapView(this, 2); }
}
defineLib(IdentityHashMap, 'java.util.IdentityHashMap', { ifaces: ['java.util.Map'] });

export class TreeMap extends AbstractMap {
  keys: any[] = [];
  vals: any[] = [];
  cmp: any = null;
  constructor(a?: any) {
    super();
    if (a !== undefined) this._TreeMap(a);
  }
  _TreeMap(a?: any): this {
    if (typeof a === 'function') this.cmp = a;
    else if (a != null && typeof a === 'object') this.putAll(a);
    return this;
  }
  c(a: any, b: any) {
    return this.cmp ? this.cmp(a, b) : $J.compareTo(a, b);
  }
  find(k: any): number {
    let lo = 0, hi = this.keys.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const r = this.c(this.keys[mid], k);
      if (r < 0) lo = mid + 1;
      else if (r > 0) hi = mid - 1;
      else return mid;
    }
    return -(lo + 1);
  }
  size() { return this.keys.length; }
  get(k: any) { const i = this.find(k); return i >= 0 ? this.vals[i] : null; }
  containsKey(k: any) { return this.find(k) >= 0; }
  put(k: any, v: any) {
    const i = this.find(k);
    if (i >= 0) { const o = this.vals[i]; this.vals[i] = v; return o; }
    const at = -i - 1;
    this.keys.splice(at, 0, k);
    this.vals.splice(at, 0, v);
    return null;
  }
  remove(k: any) {
    const i = this.find(k);
    if (i < 0) return null;
    const o = this.vals[i];
    this.keys.splice(i, 1);
    this.vals.splice(i, 1);
    return o;
  }
  clear() { this.keys = []; this.vals = []; }
  firstKey() { if (!this.keys.length) throw new NoSuchElementException(); return this.keys[0]; }
  lastKey() { if (!this.keys.length) throw new NoSuchElementException(); return this.keys[this.keys.length - 1]; }
  firstEntry() { return this.keys.length ? new AbstractMap_SimpleEntry(this.keys[0], this.vals[0]) : null; }
  lastEntry() { const n = this.keys.length; return n ? new AbstractMap_SimpleEntry(this.keys[n - 1], this.vals[n - 1]) : null; }
  floorKey(k: any) { const i = this.find(k); if (i >= 0) return this.keys[i]; const at = -i - 2; return at >= 0 ? this.keys[at] : null; }
  ceilingKey(k: any) { const i = this.find(k); if (i >= 0) return this.keys[i]; const at = -i - 1; return at < this.keys.length ? this.keys[at] : null; }
  floorEntry(k: any) { const fk = this.floorKey(k); return fk == null ? null : new AbstractMap_SimpleEntry(fk, this.get(fk)); }
  ceilingEntry(k: any) { const ck = this.ceilingKey(k); return ck == null ? null : new AbstractMap_SimpleEntry(ck, this.get(ck)); }
  $iter(kind: number) {
    let i = 0, last = -1;
    const self = this;
    return {
      hasNext: () => i < self.keys.length,
      next: () => {
        last = i++;
        if (kind === 0) return self.keys[last];
        if (kind === 1) return self.vals[last];
        const k = self.keys[last];
        return new AbstractMap_SimpleEntry(k, self.vals[last], self);
      },
      remove: () => { self.keys.splice(last, 1); self.vals.splice(last, 1); i = last; },
    };
  }
  keySet() { return new MapView(this, 0); }
  navigableKeySet() { return this.keySet(); }
  values() { return new MapView(this, 1); }
  entrySet() { return new MapView(this, 2); }
  descendingMap() { const m = new TreeMap((a: any, b: any) => this.c(b, a)); m.putAll(this); return m; }
}
defineLib(TreeMap, 'java.util.TreeMap', { ifaces: ['java.util.NavigableMap'] });

export class EnumMap extends AbstractMap {
  vals: any[] = [];
  has: boolean[] = [];
  n = 0;
  enumCls: any = null;
  constructor(a?: any) {
    super();
    if (a !== undefined) this._EnumMap(a);
  }
  _EnumMap(a: any): this {
    if (a instanceof EnumMap) {
      this.enumCls = a.enumCls;
      this.vals = a.vals.slice();
      this.has = a.has.slice();
      this.n = a.n;
    } else if (a && a.$c) this.enumCls = a.$c;
    else if (a != null && typeof a === 'object') this.putAll(a);
    return this;
  }
  universe(): any[] {
    return this.enumCls ? this.enumCls.$VALUES : [];
  }
  size() { return this.n; }
  get(k: any) { return k != null && this.has[k.$ordinal] ? this.vals[k.$ordinal] : null; }
  containsKey(k: any) { return k != null && !!this.has[k.$ordinal]; }
  put(k: any, v: any) {
    if (!this.enumCls) this.enumCls = k.getDeclaringClass().$c;
    const i = k.$ordinal;
    const o = this.has[i] ? this.vals[i] : null;
    if (!this.has[i]) this.n++;
    this.has[i] = true;
    this.vals[i] = v;
    return o;
  }
  remove(k: any) {
    if (k == null || !this.has[k.$ordinal]) return null;
    const o = this.vals[k.$ordinal];
    this.has[k.$ordinal] = false;
    this.vals[k.$ordinal] = undefined;
    this.n--;
    return o;
  }
  clear() { this.vals = []; this.has = []; this.n = 0; }
  $iter(kind: number) {
    const u = this.universe();
    const idx: number[] = [];
    for (let i = 0; i < u.length; i++) if (this.has[i]) idx.push(i);
    let j = 0, last = -1;
    const self = this;
    return {
      hasNext: () => j < idx.length,
      next: () => {
        last = idx[j++];
        if (kind === 0) return u[last];
        if (kind === 1) return self.vals[last];
        return new AbstractMap_SimpleEntry(u[last], self.vals[last], self);
      },
      remove: () => self.remove(u[last]),
    };
  }
  keySet() { return new MapView(this, 0); }
  values() { return new MapView(this, 1); }
  entrySet() { return new MapView(this, 2); }
}
defineLib(EnumMap, 'java.util.EnumMap', { ifaces: ['java.util.Map'] });

export class AbstractMap_SimpleEntry extends JObject {
  k: any;
  v: any;
  owner: any;
  constructor(k?: any, v?: any, owner?: any) {
    super();
    this.k = k; this.v = v; this.owner = owner;
    if (k != null && v === undefined && typeof k === 'object' && k.getKey) {
      this.k = k.getKey();
      this.v = k.getValue();
    }
  }
  _AbstractMap_SimpleEntry(k: any, v: any): this {
    this.k = k;
    this.v = v;
    return this;
  }
  getKey() { return this.k; }
  getValue() { return this.v; }
  setValue(v: any) { const o = this.v; this.v = v; if (this.owner) this.owner.put(this.k, v); return o; }
  equals(o: any) { return o != null && o.getKey && keyEq(this.k, o.getKey()) && keyEq(this.v, o.getValue()); }
  hashCode() { return $J.hashCode(this.k) ^ $J.hashCode(this.v); }
  toString() { return str(this.k) + '=' + str(this.v); }
}
defineLib(AbstractMap_SimpleEntry, 'java.util.AbstractMap$SimpleEntry', { ifaces: ['java.util.Map$Entry'] });
export const AbstractMap_SimpleImmutableEntry = AbstractMap_SimpleEntry;

/* ------------------------------------------------------------------ sets */

const PRESENT = {};

export class HashSet extends AbstractCollection {
  map: any;
  constructor(a?: any, b?: any) {
    super();
    this.map = null;
    this._HashSet(a, b);
  }
  _HashSet(a?: any, b?: any): this {
    if (this.map && a === undefined) return this;
    if (typeof a === 'number') this.map = new HashMap(a, b);
    else if (a != null && typeof a === 'object') {
      this.map = HashMap.newHashMap(Math.max(a.size(), 12));
      this.addAll(a);
    } else this.map = new HashMap();
    return this;
  }
  size() { return this.map.size(); }
  isEmpty() { return this.map.size() === 0; }
  contains(o: any) { return this.map.containsKey(o); }
  add(x: any) { return this.map.put(x, PRESENT) == null; }
  remove(o: any) { return this.map.remove(o) === PRESENT; }
  clear() { this.map.clear(); }
  iterator() { return this.map.$iter(0); }
  [Symbol.iterator]() { return jsIter(this.iterator()); }
  equals(o: any) {
    if (o === this) return true;
    if (!$J.isa(o, JSet) || o.size() !== this.size()) return false;
    return this.containsAll(o);
  }
  hashCode() {
    let h = 0;
    for (const x of this) h = (h + $J.hashCode(x)) | 0;
    return h;
  }
  clone(): any {
    const s = new (this.constructor as any)();
    s.addAll(this);
    return s;
  }
}
defineLib(HashSet, 'java.util.HashSet', { ifaces: ['java.util.Set'] });

export class LinkedHashSet extends HashSet {
  constructor(a?: any, b?: any) {
    super(0);
    this.map = null;
    this._LinkedHashSet(a, b);
  }
  _LinkedHashSet(a?: any, b?: any): this {
    if (typeof a === 'number') this.map = new LinkedHashMap(a, b);
    else if (a != null && typeof a === 'object') {
      this.map = new LinkedHashMap(Math.ceil(Math.max(a.size(), 12) / 0.75), 0.75);
      this.addAll(a);
    } else this.map = new LinkedHashMap(16, 0.75);
    return this;
  }
  getFirst() {
    return this.map.head ? this.map.head.key : (() => { throw new NoSuchElementException(); })();
  }
}
defineLib(LinkedHashSet, 'java.util.LinkedHashSet', { ifaces: ['java.util.Set'] });

export class TreeSet extends HashSet {
  constructor(a?: any) {
    super(0);
    this.map = new TreeMap(typeof a === 'function' ? a : undefined);
    if (a != null && typeof a === 'object') this.addAll(a);
  }
  _TreeSet(a?: any): this {
    return this;
  }
  first() { return this.map.firstKey(); }
  last() { return this.map.lastKey(); }
}
defineLib(TreeSet, 'java.util.TreeSet', { ifaces: ['java.util.SortedSet'] });

export class SetFromMap extends HashSet {
  constructor(m: any) {
    super(0);
    this.map = m;
  }
  add(x: any) { return this.map.put(x, true) == null; }
  remove(o: any) { return this.map.remove(o) != null; }
}

export class EnumSet extends HashSet {
  static noneOf(c: any) { const s = new EnumSet(); s.map = new EnumMap(c); return s; }
  static allOf(c: any) { const s = EnumSet.noneOf(c); for (const v of c.$c.$VALUES) s.add(v); return s; }
  static of(...xs: any[]) { const s = new EnumSet(); s.map = new EnumMap(); for (const x of xs) s.add(x); return s; }
  static copyOf(c: any) { const s = new EnumSet(); s.map = new EnumMap(); for (const x of c) s.add(x); return s; }
  static range(a: any, b: any) { const s = EnumSet.of(); const vs = a.getDeclaringClass().$c.$VALUES; for (let i = a.$ordinal; i <= b.$ordinal; i++) s.add(vs[i]); return s; }
  static complementOf(o: any) { const s = EnumSet.of(); const u = o.map.universe(); for (const v of u) if (!o.contains(v)) s.add(v); return s; }
}
defineLib(EnumSet, 'java.util.EnumSet', { ifaces: ['java.util.Set'] });

/* ------------------------------------------------------------------ PriorityQueue (Java's heap) */

export class PriorityQueue extends AbstractCollection {
  q: any[] = [];
  cmp: any = null;
  constructor(a?: any, b?: any) {
    super();
    if (a !== undefined) this._PriorityQueue(a, b);
  }
  _PriorityQueue(a?: any, b?: any): this {
    if (typeof a === 'function') this.cmp = a;
    else if (typeof b === 'function') this.cmp = b;
    else if (a != null && typeof a === 'object') {
      if (a instanceof PriorityQueue) this.cmp = a.cmp;
      for (const x of a) this.q.push(x);
      for (let i = (this.q.length >>> 1) - 1; i >= 0; i--) this.siftDown(i, this.q[i]);
    }
    return this;
  }
  c(a: any, b: any) {
    return this.cmp ? this.cmp(a, b) : $J.compareTo(a, b);
  }
  size() { return this.q.length; }
  add(x: any) { return this.offer(x); }
  offer(x: any) {
    if (x == null) throw new NullPointerException();
    const k = this.q.length;
    this.q.push(x);
    this.siftUp(k, x);
    return true;
  }
  peek() { return this.q.length ? this.q[0] : null; }
  element() { if (!this.q.length) throw new NoSuchElementException(); return this.q[0]; }
  poll() {
    const q = this.q;
    if (!q.length) return null;
    const result = q[0];
    const n = q.length - 1;
    const x = q[n];
    q.length = n;
    if (n > 0) this.siftDown(0, x);
    return result;
  }
  remove(o?: any): any {
    if (arguments.length === 0) {
      const x = this.poll();
      if (x == null) throw new NoSuchElementException();
      return x;
    }
    for (let i = 0; i < this.q.length; i++) {
      if ($J.equals(o, this.q[i])) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  }
  removeAt(i: number) {
    const q = this.q;
    const s = q.length - 1;
    if (s === i) q.length = s;
    else {
      const moved = q[s];
      q.length = s;
      this.siftDown(i, moved);
      if (q[i] === moved) {
        this.siftUp(i, moved);
        if (q[i] !== moved) return moved;
      }
    }
    return null;
  }
  contains(o: any) {
    for (const x of this.q) if ($J.equals(o, x)) return true;
    return false;
  }
  clear() { this.q.length = 0; }
  siftUp(k: number, x: any) {
    const q = this.q;
    while (k > 0) {
      const parent = (k - 1) >>> 1;
      const e = q[parent];
      if (this.c(x, e) >= 0) break;
      q[k] = e;
      k = parent;
    }
    q[k] = x;
  }
  siftDown(k: number, x: any) {
    const q = this.q;
    const n = q.length;
    const half = n >>> 1;
    while (k < half) {
      let child = (k << 1) + 1;
      let c = q[child];
      const right = child + 1;
      if (right < n && this.c(c, q[right]) > 0) c = q[(child = right)];
      if (this.c(x, c) <= 0) break;
      q[k] = c;
      k = child;
    }
    q[k] = x;
  }
  iterator() {
    const self = this;
    let i = 0, last = -1;
    return {
      hasNext: () => i < self.q.length,
      next: () => self.q[(last = i++)],
      remove: () => { self.removeAt(last); i = last; },
    };
  }
  [Symbol.iterator]() { return this.q.slice()[Symbol.iterator](); }
  toArray() { return this.q.slice(); }
  comparator() { return this.cmp; }
}
defineLib(PriorityQueue, 'java.util.PriorityQueue', { ifaces: ['java.util.Queue'] });

/* ------------------------------------------------------------------ Collections, Arrays, Objects */

export class Collections {
  static sort(l: any, c?: any) {
    l.sort(c ?? null);
  }
  static shuffle(l: any, rnd?: any) {
    if (!rnd) rnd = Collections.r || (Collections.r = new Random());
    const size = l.size();
    for (let i = size; i > 1; i--) Collections.swap(l, i - 1, rnd.nextInt(i));
  }
  static r: any = null;
  static swap(l: any, i: number, j: number) {
    l.set(i, l.set(j, l.get(i)));
  }
  static reverse(l: any) {
    const xs = [...l];
    xs.reverse();
    for (let i = 0; i < xs.length; i++) l.set(i, xs[i]);
  }
  static max(c: any, cmp?: any) {
    const it = c.iterator();
    let best = it.next();
    while (it.hasNext()) {
      const x = it.next();
      if ((cmp ? cmp(x, best) : $J.compareTo(x, best)) > 0) best = x;
    }
    return best;
  }
  static min(c: any, cmp?: any) {
    const it = c.iterator();
    let best = it.next();
    while (it.hasNext()) {
      const x = it.next();
      if ((cmp ? cmp(x, best) : $J.compareTo(x, best)) < 0) best = x;
    }
    return best;
  }
  static frequency(c: any, o: any) {
    let n = 0;
    for (const x of c) if ($J.equals(o, x) || (o == null && x == null)) n++;
    return n;
  }
  static addAll(c: any, ...xs: any[]) {
    let mod = false;
    for (const x of xs) if (c.add(x)) mod = true;
    return mod;
  }
  static nCopies(n: number, x: any) { return ArrayList.from(new Array(n).fill(x)); }
  static emptyList() { return new ArrayList(); }
  static emptySet() { return new HashSet(); }
  static emptyMap() { return new HashMap(); }
  static emptyIterator() { return new ArrayList().iterator(); }
  static singletonList(x: any) { return ArrayList.from([x]); }
  static singleton(x: any) { const s = new HashSet(); s.add(x); return s; }
  static singletonMap(k: any, v: any) { const m = new HashMap(); m.put(k, v); return m; }
  static unmodifiableList(l: any) { return l; }
  static unmodifiableCollection(l: any) { return l; }
  static unmodifiableSet(l: any) { return l; }
  static unmodifiableMap(l: any) { return l; }
  static unmodifiableSortedMap(l: any) { return l; }
  static synchronizedList(l: any) { return l; }
  static synchronizedMap(l: any) { return l; }
  static synchronizedSet(l: any) { return l; }
  static newSetFromMap(m: any) { return new SetFromMap(m); }
  static reverseOrder(c?: any) { return c ? (a: any, b: any) => c(b, a) : (a: any, b: any) => $J.compareTo(b, a); }
  static disjoint(a: any, b: any) { for (const x of a) if (b.contains(x)) return false; return true; }
  static list(e: any) { const l = new ArrayList(); while (e.hasMoreElements()) l.add(e.nextElement()); return l; }
  static enumeration(c: any) { const it = c.iterator(); return { hasMoreElements: () => it.hasNext(), nextElement: () => it.next() }; }
  static rotate(l: any, d: number) {
    const xs = [...l];
    const n = xs.length;
    if (!n) return;
    d = ((d % n) + n) % n;
    for (let i = 0; i < n; i++) l.set((i + d) % n, xs[i]);
  }
  static binarySearch(l: any, k: any, c?: any) {
    let lo = 0, hi = l.size() - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const r = c ? c(l.get(mid), k) : $J.compareTo(l.get(mid), k);
      if (r < 0) lo = mid + 1;
      else if (r > 0) hi = mid - 1;
      else return mid;
    }
    return -(lo + 1);
  }
}

export class Arrays {
  static asList(...xs: any[]) { return ArrayList.from(xs); }
  static stream(a: any[], from?: number, to?: number) {
    const xs = from === undefined ? a : a.slice(from, to);
    return $J.streamOfArray(xs);
  }
  static sort(a: any[], x?: any, y?: any, z?: any) {
    if (typeof x === 'number') {
      const part = a.slice(x, y);
      Arrays.sort(part, z);
      for (let i = 0; i < part.length; i++) a[x + i] = part[i];
      return;
    }
    if (x) sortArray(a, x);
    else if (a.length && typeof a[0] === 'number') a.sort((p, q) => $J.dcmp(p, q));
    else sortArray(a, null);
  }
  static fill(a: any[], x: any, y?: any, z?: any) {
    if (y === undefined) a.fill(x);
    else a.fill(z, x, y);
  }
  static copyOf(a: any[], n: number) {
    const r = a.slice(0, n);
    const def = a.length && typeof a[0] === 'number' ? 0 : a.length && typeof a[0] === 'boolean' ? false : null;
    while (r.length < n) r.push(def);
    return r;
  }
  static copyOfRange(a: any[], from: number, to: number) {
    const r = a.slice(from, to);
    while (r.length < to - from) r.push(typeof a[0] === 'number' ? 0 : null);
    return r;
  }
  static equals(a: any[], b: any[]) {
    if (a === b) return true;
    if (a == null || b == null || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!$J.equals(a[i], b[i]) && !(a[i] == null && b[i] == null)) return false;
    return true;
  }
  static hashCode(a: any[]) {
    if (a == null) return 0;
    let h = 1;
    for (const x of a) h = (Math.imul(31, h) + $J.hashCode(x)) | 0;
    return h;
  }
  static toString(a: any[]) {
    if (a == null) return 'null';
    return '[' + a.map((x) => str(x)).join(', ') + ']';
  }
  static deepToString(a: any[]) {
    return '[' + a.map((x) => (Array.isArray(x) ? Arrays.deepToString(x) : str(x))).join(', ') + ']';
  }
  static binarySearch(a: any[], k: any) {
    return Collections.binarySearch(ArrayList.from(a), k);
  }
}

export class Objects {
  static equals(a: any, b: any) { return a === b || (a != null && $J.equals(a, b)); }
  static hash(...xs: any[]) { return Arrays.hashCode(xs); }
  static hashCode(o: any) { return o == null ? 0 : $J.hashCode(o); }
  static toString(o: any, d?: any) { return o == null && d !== undefined ? d : str(o); }
  static requireNonNull(o: any, m?: any) {
    if (o == null) throw new NullPointerException(typeof m === 'function' ? m() : m === undefined ? null : m);
    return o;
  }
  static requireNonNullElse(o: any, d: any) { return o != null ? o : d; }
  static isNull(o: any) { return o == null; }
  static nonNull(o: any) { return o != null; }
  static compare(a: any, b: any, c: any) { return a === b ? 0 : c(a, b); }
}

/* ------------------------------------------------------------------ Optional */

export class Optional extends JObject {
  v: any;
  constructor(v: any) {
    super();
    this.v = v;
  }
  static EMPTY = new Optional(null);
  static of(v: any) { if (v == null) throw new NullPointerException(); return new Optional(v); }
  static ofNullable(v: any) { return v == null ? Optional.EMPTY : new Optional(v); }
  static empty() { return Optional.EMPTY; }
  isPresent() { return this.v != null; }
  isEmpty() { return this.v == null; }
  get() { if (this.v == null) throw new NoSuchElementException('No value present'); return this.v; }
  orElseThrow(f?: any) { if (this.v == null) { if (f) throw f(); throw new NoSuchElementException('No value present'); } return this.v; }
  orElse(d: any) { return this.v != null ? this.v : d; }
  orElseGet(f: any) { return this.v != null ? this.v : f(); }
  ifPresent(f: any) { if (this.v != null) f(this.v); }
  ifPresentOrElse(f: any, g: any) { if (this.v != null) f(this.v); else g(); }
  map(f: any) { return this.v == null ? this : Optional.ofNullable(f(this.v)); }
  flatMap(f: any) { return this.v == null ? this : f(this.v); }
  filter(p: any) { return this.v == null || p(this.v) ? this : Optional.EMPTY; }
  stream() { return $J.streamOfArray(this.v == null ? [] : [this.v]); }
  // OptionalInt, OptionalDouble
  getAsInt() { return this.get(); }
  getAsDouble() { return this.get(); }
  getAsLong() { return this.get(); }
  equals(o: any) { return o instanceof Optional && $J.equals(this.v, o.v) || (o instanceof Optional && this.v == null && o.v == null); }
  hashCode() { return $J.hashCode(this.v); }
  toString() { return this.v == null ? 'Optional.empty' : 'Optional[' + str(this.v) + ']'; }
}
defineLib(Optional, 'java.util.Optional');
export const OptionalInt = Optional;
export const OptionalDouble = Optional;
export const OptionalLong = Optional;

/* ------------------------------------------------------------------ Random (Java's generator) */

const M_HI = 0x5de, M_LO = 0xece66d, TWO24 = 0x1000000;

export class Random extends JObject {
  hi = 0;
  lo = 0;
  nextNextGaussian = 0;
  haveNextNextGaussian = false;
  static seedUniquifier = 8682522807148012;
  constructor(seed?: any) {
    super();
    if (seed === undefined) seed = (Random.seedUniquifier = (Random.seedUniquifier * 1181783497276652981) % 2 ** 53) ^ Date.now();
    this.setSeed(seed);
  }
  _Random(seed?: any): this {
    if (seed !== undefined) this.setSeed(seed);
    return this;
  }
  setSeed(seed: any) {
    const s = (BigInt.asUintN(64, BigInt(seed)) ^ 0x5deece66dn) & 0xffffffffffffn;
    this.hi = Number(s >> 24n);
    this.lo = Number(s & 0xffffffn);
    this.haveNextNextGaussian = false;
  }
  /** The 48-bit state as a BigInt (for saving). */
  getSeed(): bigint {
    return (BigInt(this.hi) << 24n) | BigInt(this.lo);
  }
  setState(seed: bigint) {
    this.hi = Number((seed >> 24n) & 0xffffffn);
    this.lo = Number(seed & 0xffffffn);
  }
  next(bits: number): number {
    const t = this.lo * M_LO + 0xb;
    const newLo = t % TWO24;
    const carry = Math.floor(t / TWO24);
    const newHi = (this.hi * M_LO + this.lo * M_HI + carry) % TWO24;
    this.hi = newHi;
    this.lo = newLo;
    // (int)(seed >>> (48 - bits))
    const v = Math.floor((newHi * TWO24 + newLo) / 2 ** (48 - bits));
    return v | 0;
  }
  nextInt(a?: number, b?: number): number {
    if (a === undefined) return this.next(32);
    if (b !== undefined) return boundedNextInt(this, a, b);
    const bound = a;
    if (bound <= 0) throw new IllegalArgumentException('bound must be positive');
    let r = this.next(31);
    const m = bound - 1;
    if ((bound & m) === 0) r = Number((BigInt(bound) * BigInt(r)) >> 31n);
    else {
      for (let u = r; ((u - (r = u % bound) + m) | 0) < 0; u = this.next(31));
    }
    return r;
  }
  nextLong(): number {
    const a = BigInt(this.next(32)), b = BigInt(this.next(32));
    return Number(BigInt.asIntN(64, (a << 32n) + b));
  }
  nextBoolean(): boolean {
    return this.next(1) !== 0;
  }
  nextFloat(): number {
    return this.next(24) / TWO24;
  }
  nextDouble(): number {
    return (this.next(26) * 2 ** 27 + this.next(27)) * 2 ** -53;
  }
  nextGaussian(): number {
    if (this.haveNextNextGaussian) {
      this.haveNextNextGaussian = false;
      return this.nextNextGaussian;
    }
    let v1, v2, s;
    do {
      v1 = 2 * this.nextDouble() - 1;
      v2 = 2 * this.nextDouble() - 1;
      s = v1 * v1 + v2 * v2;
    } while (s >= 1 || s === 0);
    const multiplier = Math.sqrt((-2 * Math.log(s)) / s);
    this.nextNextGaussian = v2 * multiplier;
    this.haveNextNextGaussian = true;
    return v1 * multiplier;
  }
  ints(n: number, origin: number, bound: number): any {
    const xs: number[] = [];
    for (let i = 0; i < n; i++) xs.push(boundedNextInt(this, origin, bound));
    return $J.intStreamOf(xs);
  }
}
defineLib(Random, 'java.util.Random');

function boundedNextInt(rng: Random, origin: number, bound: number): number {
  let r = rng.nextInt();
  if (origin < bound) {
    const n = (bound - origin) | 0;
    const m = (n - 1) | 0;
    if ((n & m) === 0) r = ((r & m) + origin) | 0;
    else if (n > 0) {
      for (let u = r >>> 1; ((u + m - (r = u % n)) | 0) < 0; u = rng.nextInt() >>> 1);
      r = (r + origin) | 0;
    } else {
      while (r < origin || r >= bound) r = rng.nextInt();
    }
  }
  return r;
}

export class SecureRandom extends Random {
  constructor() {
    super(Math.floor(Math.random() * 2 ** 48));
  }
}
defineLib(SecureRandom, 'java.security.SecureRandom');

/* ------------------------------------------------------------------ smaller utilities */

export class UUID extends JObject {
  s: string;
  constructor(s: string) {
    super();
    this.s = s;
  }
  static randomUUID() {
    const h = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < 36; i++) s += i === 8 || i === 13 || i === 18 || i === 23 ? '-' : i === 14 ? '4' : h[Math.floor(Math.random() * 16)];
    return new UUID(s);
  }
  static fromString(s: string) { return new UUID(s); }
  toString() { return this.s; }
  equals(o: any) { return o instanceof UUID && o.s === this.s; }
  hashCode() { return stringHash(this.s); }
  compareTo(o: UUID) { return JString.compareTo(this.s, o.s); }
}
defineLib(UUID, 'java.util.UUID', { ifaces: ['java.lang.Comparable'] });

export class StringTokenizer extends JObject {
  toks: string[];
  i = 0;
  constructor(s: string, delim = ' \t\n\r\f') {
    super();
    this.toks = [];
    let cur = '';
    for (const c of s) {
      if (delim.includes(c)) {
        if (cur) this.toks.push(cur);
        cur = '';
      } else cur += c;
    }
    if (cur) this.toks.push(cur);
  }
  hasMoreTokens() { return this.i < this.toks.length; }
  nextToken() { if (this.i >= this.toks.length) throw new NoSuchElementException(); return this.toks[this.i++]; }
  countTokens() { return this.toks.length - this.i; }
  hasMoreElements() { return this.hasMoreTokens(); }
  nextElement() { return this.nextToken(); }
}
defineLib(StringTokenizer, 'java.util.StringTokenizer');

export class JDate extends JObject {
  t: number;
  constructor(t?: number) {
    super();
    this.t = t === undefined ? $J.clock() : t;
  }
  getTime() { return this.t; }
  toString() { return new Date(this.t).toString(); }
  equals(o: any) { return o instanceof JDate && o.t === this.t; }
  hashCode() { return (this.t ^ (this.t / 2 ** 32)) | 0; }
  compareTo(o: JDate) { return $J.icmp(this.t, o.t); }
  before(o: JDate) { return this.t < o.t; }
  after(o: JDate) { return this.t > o.t; }
}
defineLib(JDate, 'java.util.Date', { ifaces: ['java.lang.Comparable'] });

export class Locale extends JObject {
  language: any;
  country: any;
  variant: any;
  constructor(language = '', country = '', variant = '') {
    super();
    this.language = language; this.country = country; this.variant = variant;
  }
  static US = new Locale('en', 'US');
  static ENGLISH = new Locale('en');
  static ROOT = new Locale('');
  static GERMANY = new Locale('de', 'DE');
  static GERMAN = new Locale('de');
  static UK = new Locale('en', 'GB');
  static def = Locale.US;
  static getDefault() { return Locale.def; }
  static setDefault(l: Locale) { Locale.def = l; }
  static forLanguageTag(t: string) { const p = t.split(/[-_]/); return new Locale(p[0], p[1] || '', p[2] || ''); }
  static getAvailableLocales() { return [Locale.US]; }
  getLanguage() { return this.language; }
  getCountry() { return this.country; }
  getVariant() { return this.variant; }
  getDisplayName() { return this.toString(); }
  getDisplayLanguage() { return this.language; }
  getDisplayCountry() { return this.country; }
  toLanguageTag() { return [this.language, this.country, this.variant].filter((x) => x).join('-'); }
  toString() {
    let s = this.language;
    if (this.country || this.variant) s += '_' + this.country;
    if (this.variant) s += '_' + this.variant;
    return s;
  }
  equals(o: any) { return o instanceof Locale && o.toString() === this.toString(); }
  hashCode() { return stringHash(this.toString()); }
}
defineLib(Locale, 'java.util.Locale');

export class AtomicInteger extends JObject {
  v: any;
  constructor(v = 0) { super(); this.v = v; }
  get() { return this.v; }
  set(v: number) { this.v = v; }
  incrementAndGet() { return ++this.v; }
  getAndIncrement() { return this.v++; }
  decrementAndGet() { return --this.v; }
  addAndGet(d: number) { return (this.v += d); }
  getAndAdd(d: number) { const o = this.v; this.v += d; return o; }
  intValue() { return this.v; }
  toString() { return String(this.v); }
}
defineLib(AtomicInteger, 'java.util.concurrent.atomic.AtomicInteger');
export const AtomicLong = AtomicInteger;
export class AtomicReference extends JObject {
  v: any;
  constructor(v: any = null) { super(); this.v = v; }
  get() { return this.v; }
  set(v: any) { this.v = v; }
  getAndSet(v: any) { const o = this.v; this.v = v; return o; }
  compareAndSet(e: any, v: any) { if (this.v === e) { this.v = v; return true; } return false; }
}
defineLib(AtomicReference, 'java.util.concurrent.atomic.AtomicReference');
export class AtomicBoolean extends JObject {
  v: any;
  constructor(v = false) { super(); this.v = v; }
  get() { return this.v; }
  set(v: boolean) { this.v = v; }
  getAndSet(v: boolean) { const o = this.v; this.v = v; return o; }
  compareAndSet(e: boolean, v: boolean) { if (this.v === e) { this.v = v; return true; } return false; }
}
defineLib(AtomicBoolean, 'java.util.concurrent.atomic.AtomicBoolean');

export class TimerTask extends JObject {
  cancelled = false;
  _TimerTask(): this { return this; }
  cancel() { this.cancelled = true; return true; }
}
defineLib(TimerTask, 'java.util.TimerTask', { ifaces: ['java.lang.Runnable'] });
export class Timer extends JObject {
  handles: any[] = [];
  constructor(..._a: any[]) { super(); }
  schedule(task: any, delay: number, period?: number) {
    const run = () => { if (!task.cancelled) task.run(); };
    if (period) this.handles.push(setInterval(run, period));
    else this.handles.push(setTimeout(run, delay));
  }
  scheduleAtFixedRate(task: any, delay: number, period: number) { this.schedule(task, delay, period); }
  cancel() { for (const h of this.handles) { clearTimeout(h); clearInterval(h); } this.handles = []; }
  purge() { return 0; }
}
defineLib(Timer, 'java.util.Timer');

export class TimeUnit extends JObject {
  ms: number;
  constructor(ms: number) { super(); this.ms = ms; }
  static MILLISECONDS = new TimeUnit(1);
  static SECONDS = new TimeUnit(1000);
  static MINUTES = new TimeUnit(60000);
  static MICROSECONDS = new TimeUnit(0.001);
  static NANOSECONDS = new TimeUnit(0.000001);
  /** Thread.sleep for n of this unit: the client's scheduler waits; elsewhere (no threads) it returns at once. */
  sleep(n: number) {
    if ($J.threads) $J.threads.sleep(n * this.ms);
  }
  toMillis(n: number) { return n * this.ms; }
  toSeconds(n: number) { return Math.trunc((n * this.ms) / 1000); }
}
defineLib(TimeUnit, 'java.util.concurrent.TimeUnit');

/* ------------------------------------------------------------------ functional interfaces */

function fiface(name: string, javaName: string, statics: any = {}): any {
  const C = { [name]: class {} }[name];
  defineLib(C, javaName, { kind: 'interface' });
  Object.assign(C, statics);
  return C;
}

const natural = (a: any, b: any) => $J.compareTo(a, b);
export const Comparator = fiface('Comparator', 'java.util.Comparator', {
  comparing: (f: any, c?: any) => (c ? (a: any, b: any) => c(f(a), f(b)) : (a: any, b: any) => $J.compareTo(f(a), f(b))),
  comparingInt: (f: any) => (a: any, b: any) => $J.icmp(f(a), f(b)),
  comparingLong: (f: any) => (a: any, b: any) => $J.icmp(f(a), f(b)),
  comparingDouble: (f: any) => (a: any, b: any) => $J.dcmp(f(a), f(b)),
  naturalOrder: () => natural,
  reverseOrder: () => (a: any, b: any) => $J.compareTo(b, a),
  nullsFirst: (c: any) => (a: any, b: any) => (a == null ? (b == null ? 0 : -1) : b == null ? 1 : c ? c(a, b) : 0),
  nullsLast: (c: any) => (a: any, b: any) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : c ? c(a, b) : 0),
  // default methods, receiver first
  reversed: (c: any) => (a: any, b: any) => c(b, a),
  thenComparing: (c: any, o: any, oc?: any) => {
    const other = oc ? (a: any, b: any) => oc(o(a), o(b)) : o.$key ? (a: any, b: any) => $J.compareTo(o(a), o(b)) : o;
    return (a: any, b: any) => { const r = c(a, b); return r !== 0 ? r : other(a, b); };
  },
  thenComparingKey: (c: any, f: any) => (a: any, b: any) => { const r = c(a, b); return r !== 0 ? r : $J.compareTo(f(a), f(b)); },
  thenComparingInt: (c: any, f: any) => (a: any, b: any) => { const r = c(a, b); return r !== 0 ? r : $J.icmp(f(a), f(b)); },
  thenComparingLong: (c: any, f: any) => (a: any, b: any) => { const r = c(a, b); return r !== 0 ? r : $J.icmp(f(a), f(b)); },
  thenComparingDouble: (c: any, f: any) => (a: any, b: any) => { const r = c(a, b); return r !== 0 ? r : $J.dcmp(f(a), f(b)); },
});
export const Predicate = fiface('Predicate', 'java.util.function.Predicate', {
  negate: (p: any) => (x: any) => !p(x),
  and: (p: any, q: any) => (x: any) => p(x) && q(x),
  or: (p: any, q: any) => (x: any) => p(x) || q(x),
  not: (p: any) => (x: any) => !p(x),
  isEqual: (o: any) => (x: any) => (o == null ? x == null : $J.equals(o, x)),
});
export const BiPredicate = fiface('BiPredicate', 'java.util.function.BiPredicate', {
  negate: (p: any) => (x: any, y: any) => !p(x, y),
  and: (p: any, q: any) => (x: any, y: any) => p(x, y) && q(x, y),
  or: (p: any, q: any) => (x: any, y: any) => p(x, y) || q(x, y),
});
export const JFunction = fiface('JFunction', 'java.util.function.Function', {
  identity: () => (x: any) => x,
  andThen: (f: any, g: any) => (x: any) => g(f(x)),
  compose: (f: any, g: any) => (x: any) => f(g(x)),
});
export const UnaryOperator = fiface('UnaryOperator', 'java.util.function.UnaryOperator', { identity: () => (x: any) => x });
export const BiFunction = fiface('BiFunction', 'java.util.function.BiFunction', { andThen: (f: any, g: any) => (x: any, y: any) => g(f(x, y)) });
export const Consumer = fiface('Consumer', 'java.util.function.Consumer', { andThen: (f: any, g: any) => (x: any) => { f(x); g(x); } });
export const BiConsumer = fiface('BiConsumer', 'java.util.function.BiConsumer', { andThen: (f: any, g: any) => (x: any, y: any) => { f(x, y); g(x, y); } });
export const Supplier = fiface('Supplier', 'java.util.function.Supplier');
export const BinaryOperator = fiface('BinaryOperator', 'java.util.function.BinaryOperator', {
  minBy: (c: any) => (a: any, b: any) => (c(a, b) <= 0 ? a : b),
  maxBy: (c: any) => (a: any, b: any) => (c(a, b) >= 0 ? a : b),
});
export const ToIntFunction = fiface('ToIntFunction', 'java.util.function.ToIntFunction');
export const ToDoubleFunction = fiface('ToDoubleFunction', 'java.util.function.ToDoubleFunction');
export const ToLongFunction = fiface('ToLongFunction', 'java.util.function.ToLongFunction');
export const IntFunction = fiface('IntFunction', 'java.util.function.IntFunction');
export const IntPredicate = fiface('IntPredicate', 'java.util.function.IntPredicate');
export const IntUnaryOperator = fiface('IntUnaryOperator', 'java.util.function.IntUnaryOperator');
export const IntBinaryOperator = fiface('IntBinaryOperator', 'java.util.function.IntBinaryOperator');
export const IntConsumer = fiface('IntConsumer', 'java.util.function.IntConsumer');
export const IntSupplier = fiface('IntSupplier', 'java.util.function.IntSupplier');
export const DoubleBinaryOperator = fiface('DoubleBinaryOperator', 'java.util.function.DoubleBinaryOperator');
export const BooleanSupplier = fiface('BooleanSupplier', 'java.util.function.BooleanSupplier');
export const ToIntBiFunction = fiface('ToIntBiFunction', 'java.util.function.ToIntBiFunction');
export const Callable = fiface('Callable', 'java.util.concurrent.Callable');

/* ------------------------------------------------------------------ Properties */

export class Properties extends HashMap {
  defaults: any = null;
  constructor(d?: any) {
    super();
    if (d instanceof Properties) this.defaults = d;
  }
  _Properties(): this {
    return this;
  }
  getProperty(k: string, d?: string) {
    const v = this.get(k);
    if (v != null) return v;
    if (this.defaults) return this.defaults.getProperty(k, d);
    return d === undefined ? null : d;
  }
  setProperty(k: string, v: string) {
    return this.put(k, v);
  }
  stringPropertyNames() {
    return this.keySet();
  }
  propertyNames() {
    const it = this.keySet().iterator();
    return { hasMoreElements: () => it.hasNext(), nextElement: () => it.next() };
  }
  /** Properties.load: \ escapes, \\u, line continuations, = : or whitespace separators, # ! comments. */
  load(input: any) {
    const text: string = typeof input === 'string' ? input : input.$readAllText();
    loadProperties(text, (k, v) => this.put(k, v));
  }
  store(out: any, comments?: string) {
    let s = '';
    if (comments != null) s += '#' + comments + '\n';
    s += '#' + new Date($J.clock()).toString() + '\n';
    for (const e of this.entrySet()) s += escapeProp(e.getKey(), true) + '=' + escapeProp(e.getValue(), false) + '\n';
    out.$writeText ? out.$writeText(s) : out.write(s);
  }
}
defineLib(Properties, 'java.util.Properties', { ifaces: ['java.util.Map'] });

function escapeProp(s: string, key: boolean): string {
  let r = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const code = s.charCodeAt(i);
    if (c === '\\') r += '\\\\';
    else if (c === ' ' && (i === 0 || key)) r += '\\ ';
    else if (c === '\t') r += '\\t';
    else if (c === '\n') r += '\\n';
    else if (c === '\r') r += '\\r';
    else if (c === '\f') r += '\\f';
    else if ('=:#!'.includes(c)) r += '\\' + c;
    else if (code < 0x20 || code > 0x7e) r += '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
    else r += c;
  }
  return r;
}

export function loadProperties(text: string, put: (k: string, v: string) => void) {
  const lines = text.split(/\r\n|\r|\n/);
  for (let li = 0; li < lines.length; li++) {
    let line = lines[li];
    // logical line: continuation when it ends with an odd number of backslashes
    let start = 0;
    while (start < line.length && ' \t\f'.includes(line[start])) start++;
    if (start >= line.length) continue;
    if (line[start] === '#' || line[start] === '!') continue;
    line = line.substring(start);
    for (;;) {
      let bs = 0;
      for (let j = line.length - 1; j >= 0 && line[j] === '\\'; j--) bs++;
      if (bs % 2 === 1 && li + 1 < lines.length) {
        line = line.substring(0, line.length - 1);
        let next = lines[++li];
        let s = 0;
        while (s < next.length && ' \t\f'.includes(next[s])) s++;
        line += next.substring(s);
      } else break;
    }
    // key ends at an unescaped = : or whitespace
    let k = 0;
    let hasSep = false;
    let precedingBackslash = false;
    while (k < line.length) {
      const c = line[k];
      if ((c === '=' || c === ':') && !precedingBackslash) {
        hasSep = true;
        break;
      } else if ((c === ' ' || c === '\t' || c === '\f') && !precedingBackslash) break;
      precedingBackslash = c === '\\' ? !precedingBackslash : false;
      k++;
    }
    let v = k + (hasSep ? 1 : 0);
    while (v < line.length && ' \t\f'.includes(line[v])) v++;
    if (!hasSep && v < line.length && (line[v] === '=' || line[v] === ':')) {
      v++;
      while (v < line.length && ' \t\f'.includes(line[v])) v++;
    }
    put(unescapeProp(line.substring(0, k)), unescapeProp(line.substring(v)));
  }
}

function unescapeProp(s: string): string {
  if (!s.includes('\\')) return s;
  let r = '';
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    if (c === '\\' && i + 1 < s.length) {
      c = s[++i];
      if (c === 'u') {
        r += String.fromCharCode(parseInt(s.substr(i + 1, 4), 16));
        i += 4;
        continue;
      }
      r += c === 't' ? '\t' : c === 'n' ? '\n' : c === 'r' ? '\r' : c === 'f' ? '\f' : c;
    } else r += c;
  }
  return r;
}

export { ifaceSet };
