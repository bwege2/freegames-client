// OpenClonk port: the C++ standard library containers and algorithms as the translated engine uses them.
// std::vector is a JavaScript array (with the helpers below where C++ differs); std::map and std::set keep
// their keys ordered by the comparator, as C++ iterates them; std::sort is libstdc++'s introsort, step for
// step, because the order it leaves equal elements in is part of the game state (the reference is the
// original built on Linux with libstdc++).
import { Ptr, $oat } from './ptr.ts';

export type Less<T> = (a: T, b: T) => boolean;

export const less = <T>(a: T, b: T): boolean => {
  // std::pair's and std::tuple's operator< are memberwise; JavaScript would compare two "[object Object]"s
  if (a instanceof StdPair && b instanceof StdPair) return pair_lt(a, b);
  if (a instanceof StdString && b instanceof StdString) return a.lt(b);
  if (a instanceof StdTuple && b instanceof StdTuple) {
    for (let i = 0; i < a.length; i++) {
      if (less(a[i], b[i])) return true;
      if (less(b[i], a[i])) return false;
    }
    return false;
  }
  // pointers into one array: by their places (StdCompilerINIRead::getLineNumberOfPos keeps a sorted list of the line
  // breaks of its buffer, char pointers, and looks a position up in it with std::lower_bound)
  if (a instanceof Ptr && b instanceof Ptr && a.a === b.a && typeof a.o === 'number' && typeof b.o === 'number') return a.o < b.o;
  // pointers to plain objects: by their addresses (the port's addresses, $addr: in the order they were first asked
  // for); objects with a value of their own (valueOf) compare by it
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' &&
      (a as any).valueOf === Object.prototype.valueOf && (b as any).valueOf === Object.prototype.valueOf) {
    return $addr(a) < $addr(b);
  }
  return a < b;
};

/** std::tuple (std::make_tuple): its elements, compared memberwise */
export class StdTuple extends Array<any> {}
export function $tuple(...xs: any[]): StdTuple {
  const t = new StdTuple();
  t.push(...xs);
  return t;
}

// ---- std::vector helpers

/** vector::resize: new elements from make() (their default constructor) */
export function resize<T>(v: T[], n: number, make: () => T): void {
  if (n < v.length) v.length = n;
  else {
    const from = v.length;
    while (v.length < n) v.push(make());
    reindex(v, from);
  }
}

/** vector::erase(first, last) as indices */
export function erase<T>(v: T[], first: number, last = first + 1): void {
  v.splice(first, last - first);
}

/** vector::insert(pos, value) */
export function insert<T>(v: T[], pos: number, ...values: T[]): void {
  v.splice(pos, 0, ...values);
}

// ---- std::sort (libstdc++ bits/stl_algo.h, bits/stl_heap.h)

const S_threshold = 16;

/** std::sort(a.begin() + first, a.begin() + last, comp) */
export function sort<T>(a: T[], comp: Less<T> = less, first = 0, last = a.length): void {
  if (first !== last) {
    introsortLoop(a, first, last, lg(last - first) * 2, comp);
    finalInsertionSort(a, first, last, comp);
  }
}

function lg(n: number): number {
  return 31 - Math.clz32(n);
}

function swap<T>(a: T[], i: number, j: number): void {
  const t = a[i];
  a[i] = a[j];
  a[j] = t;
}

function introsortLoop<T>(a: T[], first: number, last: number, depth: number, comp: Less<T>): void {
  while (last - first > S_threshold) {
    if (depth === 0) {
      partialSort(a, first, last, last, comp);
      return;
    }
    --depth;
    const cut = unguardedPartitionPivot(a, first, last, comp);
    introsortLoop(a, cut, last, depth, comp);
    last = cut;
  }
}

function unguardedPartitionPivot<T>(a: T[], first: number, last: number, comp: Less<T>): number {
  const mid = first + ((last - first) >> 1);
  moveMedianToFirst(a, first, first + 1, mid, last - 1, comp);
  return unguardedPartition(a, first + 1, last, first, comp);
}

function moveMedianToFirst<T>(a: T[], result: number, x: number, y: number, z: number, comp: Less<T>): void {
  if (comp(a[x], a[y])) {
    if (comp(a[y], a[z])) swap(a, result, y);
    else if (comp(a[x], a[z])) swap(a, result, z);
    else swap(a, result, x);
  } else if (comp(a[x], a[z])) swap(a, result, x);
  else if (comp(a[y], a[z])) swap(a, result, z);
  else swap(a, result, y);
}

function unguardedPartition<T>(a: T[], first: number, last: number, pivot: number, comp: Less<T>): number {
  for (;;) {
    while (comp(a[first], a[pivot])) ++first;
    --last;
    while (comp(a[pivot], a[last])) --last;
    if (!(first < last)) return first;
    swap(a, first, last);
    ++first;
  }
}

function finalInsertionSort<T>(a: T[], first: number, last: number, comp: Less<T>): void {
  if (last - first > S_threshold) {
    insertionSort(a, first, first + S_threshold, comp);
    for (let i = first + S_threshold; i !== last; ++i) unguardedLinearInsert(a, i, comp);
  } else insertionSort(a, first, last, comp);
}

function insertionSort<T>(a: T[], first: number, last: number, comp: Less<T>): void {
  if (first === last) return;
  for (let i = first + 1; i !== last; ++i) {
    if (comp(a[i], a[first])) {
      const val = a[i];
      for (let k = i; k > first; --k) a[k] = a[k - 1];
      a[first] = val;
    } else unguardedLinearInsert(a, i, comp);
  }
}

function unguardedLinearInsert<T>(a: T[], last: number, comp: Less<T>): void {
  const val = a[last];
  let next = last - 1;
  while (comp(val, a[next])) {
    a[last] = a[next];
    last = next;
    --next;
  }
  a[last] = val;
}

function partialSort<T>(a: T[], first: number, middle: number, last: number, comp: Less<T>): void {
  // __heap_select
  makeHeap(a, first, middle, comp);
  for (let i = middle; i < last; ++i) if (comp(a[i], a[first])) popHeap(a, first, middle, i, comp);
  // __sort_heap
  while (middle - first > 1) {
    --middle;
    popHeap(a, first, middle, middle, comp);
  }
}

function makeHeap<T>(a: T[], first: number, last: number, comp: Less<T>): void {
  const len = last - first;
  if (len < 2) return;
  let parent = (len - 2) >> 1;
  for (;;) {
    adjustHeap(a, first, parent, len, a[first + parent], comp);
    if (parent === 0) return;
    parent--;
  }
}

function popHeap<T>(a: T[], first: number, last: number, result: number, comp: Less<T>): void {
  const value = a[result];
  a[result] = a[first];
  adjustHeap(a, first, 0, last - first, value, comp);
}

function adjustHeap<T>(a: T[], first: number, hole: number, len: number, value: T, comp: Less<T>): void {
  const top = hole;
  let second = hole;
  while (second < (len - 1) >> 1) {
    second = 2 * (second + 1);
    if (comp(a[first + second], a[first + second - 1])) second--;
    a[first + hole] = a[first + second];
    hole = second;
  }
  if ((len & 1) === 0 && second === (len - 2) >> 1) {
    second = 2 * (second + 1);
    a[first + hole] = a[first + second - 1];
    hole = second - 1;
  }
  // __push_heap
  let parent = (hole - 1) >> 1;
  while (hole > top && comp(a[first + parent], value)) {
    a[first + hole] = a[first + parent];
    hole = parent;
    parent = (hole - 1) >> 1;
  }
  a[first + hole] = value;
}

/** std::partial_sort(first, middle, last): libstdc++'s heap select and heap sort (also sort()'s fallback) */
export function partial_sort<T>(a: T[], comp: Less<T>, first: number, middle: number, last: number): void {
  partialSort(a, first, middle, last, comp);
}

/** std::stable_sort: any stable sort gives the same order */
export function stable_sort<T>(a: T[], comp: Less<T> = less, first = 0, last = a.length): void {
  const part = a.slice(first, last).map((v, i) => ({ v, i }));
  part.sort((x, y) => (comp(x.v, y.v) ? -1 : comp(y.v, x.v) ? 1 : x.i - y.i));
  for (let i = 0; i < part.length; i++) a[first + i] = part[i].v;
}

// ---- iterators

/**
 * An iterator into a container: a JavaScript array (std::vector, std::list, std::deque) or a container with
 * `items` (StdMap: its pairs, StdSet: its keys). `v` is the element (*it, it->...).
 */
export class Iter {
  c: any;
  i: number;
  rev: boolean;
  constructor(c: any, i: number, rev = false) {
    this.c = c;
    this.i = i;
    this.rev = rev;
  }
  private get arr(): any[] {
    return this.c.items ?? this.c;
  }
  get v(): any {
    return this.arr[this.rev ? this.i - 1 : this.i];
  }
  set v(x: any) {
    this.arr[this.rev ? this.i - 1 : this.i] = x;
  }
  inc(): this {
    this.i += this.rev ? -1 : 1;
    return this;
  }
  dec(): this {
    this.i += this.rev ? 1 : -1;
    return this;
  }
  postinc(): Iter {
    const r = this.copy();
    this.inc();
    return r;
  }
  postdec(): Iter {
    const r = this.copy();
    this.dec();
    return r;
  }
  add(n: number): Iter {
    return new Iter(this.c, this.i + (this.rev ? -n : n), this.rev);
  }
  eq(o: Iter | null): boolean {
    return o != null && this.c === o.c && this.i === o.i;
  }
  copy(): Iter {
    return new Iter(this.c, this.i, this.rev);
  }
  $clone(): Iter {
    return this.copy();
  }
}

export function $begin(c: any): Iter {
  return new Iter(c, 0);
}
export function $end(c: any): Iter {
  return new Iter(c, (c.items ?? c).length);
}
export function $rbegin(c: any): Iter {
  return new Iter(c, (c.items ?? c).length, true);
}
export function $rend(c: any): Iter {
  return new Iter(c, 0, true);
}

// ---- sequences (std::vector, std::list, std::deque as arrays)

/** a vector of n elements made by make() */
export function $filled<T>(n: number, make: () => T): T[] {
  const a: T[] = new Array(n);
  for (let i = 0; i < n; i++) a[i] = make();
  // objects know their places, as those pushed (&v[0] is the first object: SortFacesArray's helpers)
  if (n > 0 && a[0] && typeof a[0] === 'object' && !ArrayBuffer.isView(a[0])) reindex(a);
  return a;
}

/** objects in an array learn their (new) places from index `from` on */
function reindex(a: any[], from = 0): void {
  for (let i = from; i < a.length; i++) {
    const o = a[i];
    if (o && typeof o === 'object' && !(o instanceof Ptr)) {
      o.$a = a;
      o.$i = i;
    }
  }
}

/** push_back of an object */
export function $vpush(a: any[], o: any): void {
  a.push(o);
  if (o && typeof o === 'object') {
    o.$a = a;
    o.$i = a.length - 1;
  }
}

export function $vunshift(a: any[], o: any): void {
  a.unshift(o);
  reindex(a);
}

/** erase(it) / erase(first, last): the iterator after the removed ones */
export function seq_erase(a: any[], first: Iter, last?: Iter): Iter {
  a.splice(first.i, (last ? last.i : first.i + 1) - first.i);
  reindex(a, first.i);
  return new Iter(a, first.i);
}

/** vector::data() of objects: the first object */
export function seq_data(a: any[]): any {
  if (a.length && a[0] && typeof a[0] === 'object') {
    reindex(a);
    return a[0];
  }
  return new Ptr(a, 0);
}

/** insert(it, value) / insert(it, first, last): the iterator to the inserted element */
export function seq_insert(a: any[], pos: Iter, x: any, last?: Iter, copy?: (v: any) => any): Iter {
  if (x instanceof Iter && last instanceof Iter) {
    // a range of class values is copied (copy), pointers are not
    const src = (x.c.items ?? x.c).slice(x.i, last.i).map((v: any) => (copy ? copy(v) : v));
    a.splice(pos.i, 0, ...src);
  } else {
    a.splice(pos.i, 0, x);
  }
  reindex(a, pos.i);
  return new Iter(a, pos.i);
}

export function seq_emplace(a: any[], pos: Iter, x: any): Iter {
  return seq_insert(a, pos, x);
}

/** list::remove(value) */
export function seq_remove(a: any[], x: any): void {
  for (let i = a.length - 1; i >= 0; i--) if (a[i] === x) a.splice(i, 1);
}

export function seq_remove_if(a: any[], f: (x: any) => boolean): void {
  for (let i = a.length - 1; i >= 0; i--) if (f(a[i])) a.splice(i, 1);
}

/** list::sort: a stable merge sort */
export function seq_sort(a: any[], comp: Less<any> = less): void {
  stable_sort(a, comp);
}

export function seq_unique(a: any[]): void {
  for (let i = a.length - 1; i > 0; i--) if (a[i] === a[i - 1]) a.splice(i, 1);
}

export function seq_reverse(a: any[]): void {
  a.reverse();
}

export function seq_assign(a: any[], first: any, last?: any): void {
  if (first instanceof Iter && last instanceof Iter) {
    const src = (first.c.items ?? first.c).slice(first.i, last.i);
    a.length = 0;
    a.push(...src);
  } else if (first && first.a !== undefined && last && last.a === first.a) {
    // assign(first, last) from pointers into an array
    const src = Array.prototype.slice.call(first.a, first.o, last.o);
    a.length = 0;
    a.push(...src);
  } else if (typeof first === 'number') {
    // assign(n, value)
    a.length = 0;
    for (let i = 0; i < first; i++) a.push(cl(last));
  } else {
    throw new Error('seq_assign');
  }
}

export function seq_swap(a: any[], b: any[]): void {
  const t = a.slice();
  a.length = 0;
  a.push(...b);
  b.length = 0;
  b.push(...t);
}

/** list::splice(pos, other[, it]) */
export function seq_splice(a: any[], pos: Iter, b: any[], it?: Iter): void {
  if (it) {
    const [x] = b.splice(it.i, 1);
    a.splice(pos.i, 0, x);
  } else {
    a.splice(pos.i, 0, ...b);
    b.length = 0;
  }
}

export function seq_equal(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x && typeof x.op_eq === 'function' ? !x.op_eq(y) : x !== y) return false;
  }
  return true;
}

// ---- ordered containers

/** the first index in the sorted items whose key is not less than k */
function lowerBound<K>(items: any[], k: K, comp: Less<K>, key: (x: any) => K): number {
  let lo = 0, hi = items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (comp(key(items[mid]), k)) lo = mid + 1; else hi = mid;
  }
  return lo;
}

/** std::pair */
export function pair_lt(a: StdPair, b: StdPair): boolean {
  return less(a.first, b.first) || (!less(b.first, a.first) && less(a.second, b.second));
}
export function pair_gt(a: StdPair, b: StdPair): boolean { return pair_lt(b, a); }

export class StdPair {
  first: any;
  second: any;
  constructor(first: any = null, second: any = null) {
    this.first = first;
    this.second = second;
  }
  /** std::make_pair: the pair holds copies of its arguments (an lvalue is copied, as in C++) */
  static make(first: any, second: any): StdPair {
    return new StdPair(cl(first), cl(second));
  }
  $clone(): StdPair {
    return new StdPair(cl(this.first), cl(this.second));
  }
  $assign(o: StdPair): this {
    this.first = o.first;
    this.second = o.second;
    return this;
  }
}

/** a copy of a class value (a library container or a translated class) */
export function $copy(x: any): any {
  if (Array.isArray(x)) return x.slice();
  return cl(x);
}

function cl(x: any): any {
  return x && typeof x === 'object' && typeof x.$clone === 'function' ? x.$clone() : x;
}

/** std::map<K, V, Compare>: pairs in the comparator's order; two keys are the same if neither is less */
export class StdMap {
  items: StdPair[] = [];
  comp: Less<any>;
  constructor(comp: Less<any> = less) {
    this.comp = comp;
  }
  private pos(k: any): number {
    return lowerBound(this.items, k, this.comp, (p) => p.first);
  }
  private same(i: number, k: any): boolean {
    return i < this.items.length && !this.comp(k, this.items[i].first);
  }
  size(): number { return this.items.length; }
  empty(): boolean { return this.items.length === 0; }
  clear(): void { this.items = []; }
  count(k: any): number { return this.same(this.pos(k), k) ? 1 : 0; }
  find(k: any): Iter {
    const i = this.pos(k);
    return new Iter(this, this.same(i, k) ? i : this.items.length);
  }
  /** operator[]: the pair, inserted with make() if missing */
  entry(k: any, make: () => any): StdPair {
    const i = this.pos(k);
    if (this.same(i, k)) return this.items[i];
    const p = new StdPair(k, make());
    this.items.splice(i, 0, p);
    return p;
  }
  at(k: any): any {
    const i = this.pos(k);
    if (!this.same(i, k)) throw new StdException('map::at');
    return this.items[i].second;
  }
  /** insert(k, v) / emplace(k, v): pair<iterator, inserted> */
  insert(k: any, v: any): StdPair {
    const i = this.pos(k);
    if (this.same(i, k)) return new StdPair(new Iter(this, i), false);
    this.items.splice(i, 0, new StdPair(k, v));
    return new StdPair(new Iter(this, i), true);
  }
  insertPair(p: StdPair): StdPair {
    return this.insert(p.first, p.second);
  }
  emplace(k: any, v: any): StdPair {
    return this.insert(k, v);
  }
  /** erase(key) -> count, erase(iterator) -> the next iterator */
  erase(x: any): any {
    if (x instanceof Iter) {
      this.items.splice(x.i, 1);
      return new Iter(this, x.i);
    }
    const i = this.pos(x);
    if (!this.same(i, x)) return 0;
    this.items.splice(i, 1);
    return 1;
  }
  begin(): Iter { return new Iter(this, 0); }
  end(): Iter { return new Iter(this, this.items.length); }
  rbegin(): Iter { return new Iter(this, this.items.length, true); }
  rend(): Iter { return new Iter(this, 0, true); }
  lower_bound(k: any): Iter { return new Iter(this, this.pos(k)); }
  upper_bound(k: any): Iter {
    let i = this.pos(k);
    while (this.same(i, k)) i++;
    return new Iter(this, i);
  }
  /** equal_range(k): pair<lower_bound, upper_bound> (a multimap's equal entries are one entry here) */
  equal_range(k: any): StdPair { return new StdPair(this.lower_bound(k), this.upper_bound(k)); }
  [Symbol.iterator](): IterableIterator<StdPair> { return this.items[Symbol.iterator](); }
  $clone(): StdMap {
    const m = new StdMap(this.comp);
    m.items = this.items.map((p) => p.$clone());
    return m;
  }
  $assign(o: StdMap): this {
    this.items = o.items.map((p) => p.$clone());
    return this;
  }
}

/** std::multimap<K, V, Compare>: equal keys kept side by side in the order they were inserted (C4KeyboardInput's
 *  KeysByCode: every key binding of one key code; C4ScriptGuiWindow's childrenIDMap) */
export class StdMultiMap extends StdMap {
  /** insert(k, v) / emplace(k, v): at the end of the equal entries; the iterator of the new entry */
  insert(k: any, v: any): any {
    const i = this.upper_bound(k).i;
    this.items.splice(i, 0, new StdPair(k, v));
    return new Iter(this, i);
  }
  count(k: any): number {
    return this.upper_bound(k).i - this.lower_bound(k).i;
  }
  /** erase(key) -> how many were erased, erase(iterator) -> the next iterator */
  erase(x: any): any {
    if (x instanceof Iter) return super.erase(x);
    const a = this.lower_bound(x).i, b = this.upper_bound(x).i;
    this.items.splice(a, b - a);
    return b - a;
  }
  $clone(): StdMultiMap {
    const m = new StdMultiMap(this.comp);
    m.items = this.items.map((p) => p.$clone());
    return m;
  }
}

/** std::set<K, Compare> */
export class StdSet {
  items: any[] = [];
  comp: Less<any>;
  constructor(comp: Less<any> = less) {
    this.comp = comp;
  }
  private pos(k: any): number {
    return lowerBound(this.items, k, this.comp, (x) => x);
  }
  private same(i: number, k: any): boolean {
    return i < this.items.length && !this.comp(k, this.items[i]);
  }
  size(): number { return this.items.length; }
  empty(): boolean { return this.items.length === 0; }
  clear(): void { this.items = []; }
  count(k: any): number { return this.same(this.pos(k), k) ? 1 : 0; }
  find(k: any): Iter {
    const i = this.pos(k);
    return new Iter(this, this.same(i, k) ? i : this.items.length);
  }
  insert(k: any, last?: any): any {
    if (k instanceof Iter && k.c === this && last !== undefined && !(last instanceof Iter)) {
      // insert(hint, value) (CStdGL::GenVAOID): the value's place, whatever the hint; returns its iterator
      return this.insert(last).first;
    }
    if (last !== undefined) {
      // insert(first, last) from another container
      const src: any = (k as any).c ?? k;
      const items: any[] = src.items ?? src;
      const from = (k as any).i ?? 0;
      const to = (last as any).i ?? items.length;
      for (const x of items.slice(from, to)) this.insert(x);
      return undefined;
    }
    const i = this.pos(k);
    if (this.same(i, k)) return new StdPair(new Iter(this, i), false);
    this.items.splice(i, 0, k);
    return new StdPair(new Iter(this, i), true);
  }
  emplace(k: any): StdPair {
    return this.insert(k);
  }
  erase(x: any): any {
    if (x instanceof Iter) {
      this.items.splice(x.i, 1);
      return new Iter(this, x.i);
    }
    const i = this.pos(x);
    if (!this.same(i, x)) return 0;
    this.items.splice(i, 1);
    return 1;
  }
  begin(): Iter { return new Iter(this, 0); }
  end(): Iter { return new Iter(this, this.items.length); }
  rbegin(): Iter { return new Iter(this, this.items.length, true); }
  rend(): Iter { return new Iter(this, 0, true); }
  lower_bound(k: any): Iter { return new Iter(this, this.pos(k)); }
  upper_bound(k: any): Iter { let i = this.pos(k); while (this.same(i, k)) i++; return new Iter(this, i); }
  equal_range(k: any): StdPair { return new StdPair(this.lower_bound(k), this.upper_bound(k)); }
  [Symbol.iterator](): IterableIterator<any> { return this.items[Symbol.iterator](); }
  $clone(): StdSet {
    const s = new StdSet(this.comp);
    s.items = this.items.slice();
    return s;
  }
  $assign(o: StdSet): this {
    this.items = o.items.slice();
    return this;
  }
}

/** set(first, last), map from a range */
export function $fill_from(c: any, first: Iter, last: Iter): any {
  const src = (first.c.items ?? first.c).slice(first.i, last.i);
  for (const x of src) {
    if (c instanceof StdMap) c.insertPair(x);
    else c.insert(x);
  }
  return c;
}

/** a map or set from an initializer list */
export function $fill_list(c: any, list: any[]): any {
  for (const x of list) {
    if (c instanceof StdMap || c instanceof HashMap) c.insertPair(x);
    else c.insert(x);
  }
  return c;
}

/**
 * std::unordered_map: a JavaScript Map in insertion order (the original's order is libstdc++'s hash order;
 * the engine does not let the game state depend on it).
 */
export class HashMap {
  m = new Map<any, StdPair>();
  get items(): StdPair[] {
    return [...this.m.values()];
  }
  size(): number { return this.m.size; }
  empty(): boolean { return this.m.size === 0; }
  clear(): void { this.m.clear(); }
  count(k: any): number { return this.m.has(hkey(k)) ? 1 : 0; }
  find(k: any): Iter {
    const items = this.items;
    const i = items.findIndex((p) => hkey(p.first) === hkey(k));
    return new Iter({ items }, i < 0 ? items.length : i);
  }
  entry(k: any, make: () => any): StdPair {
    let p = this.m.get(hkey(k));
    if (!p) {
      p = new StdPair(k, make());
      this.m.set(hkey(k), p);
    }
    return p;
  }
  insert(k: any, v: any): StdPair {
    if (this.m.has(hkey(k))) return new StdPair(null, false);
    this.m.set(hkey(k), new StdPair(k, v));
    return new StdPair(null, true);
  }
  insertPair(p: StdPair): StdPair {
    return this.insert(p.first, p.second);
  }
  erase(x: any): any {
    if (x instanceof Iter) {
      const p = x.v as StdPair;
      this.m.delete(hkey(p.first));
      return new Iter({ items: this.items }, x.i);
    }
    return this.m.delete(hkey(x)) ? 1 : 0;
  }
  begin(): Iter { return new Iter({ items: this.items }, 0); }
  end(): Iter { return new Iter({ items: this.items }, this.m.size); }
  [Symbol.iterator](): IterableIterator<StdPair> { return this.m.values(); }
}

/** std::unordered_set (insertion order, as HashMap) */
export class HashSet {
  s = new Set<any>();
  get items(): any[] {
    return [...this.s];
  }
  size(): number { return this.s.size; }
  empty(): boolean { return this.s.size === 0; }
  clear(): void { this.s.clear(); }
  count(k: any): number { return this.s.has(k) ? 1 : 0; }
  insert(k: any): StdPair {
    const had = this.s.has(k);
    this.s.add(k);
    return new StdPair(null, !had);
  }
  erase(k: any): number {
    return this.s.delete(k) ? 1 : 0;
  }
  [Symbol.iterator](): IterableIterator<any> { return this.s.values(); }
  $clone(): HashSet {
    const h = new HashSet();
    for (const x of this.s) h.s.add(x);
    return h;
  }
}

/** a key for a JavaScript Map: strings (StdString) by their text, everything else as it is */
function hkey(k: any): any {
  if (k instanceof StdString) return k.str();
  return k;
}

/**
 * C4PropList::RefSet (std::unordered_set<C4Value *>): the values that refer to a proplist. C4Value's destructor takes a
 * value out of its proplist's set; the port does not run the destructors of the C++ code's local values, so the set
 * holds its values weakly and a value nothing refers to any more is left to the garbage collector (without that, every
 * C4Value local of the engine's C++ stayed in the set: half a million entries after 1,000 frames of Tutorial01).
 * Everything the game can see is the same as with a set that keeps them: it iterates only values that are still
 * reachable (ClearRefs sets them to nil), and size() and empty() count every value put in and not taken out, whether
 * the collector has taken it or not, so that a proplist's deletion (C4PropList::DelRef: empty() and Delete()) does
 * not depend on when the collector runs.
 */
export class WeakRefSet {
  private refs = new Set<WeakRef<object>>();
  private of = new WeakMap<object, WeakRef<object>>();
  /** values put in and not taken out (C4Value::DelDataRef) */
  private n = 0;
  private static readonly gone = new FinalizationRegistry<{ set: WeakRefSet; ref: WeakRef<object> }>((h) => { h.set.refs.delete(h.ref); });
  size(): number { return this.n; }
  empty(): boolean { return this.n === 0; }
  count(x: object): number { return this.of.has(x) ? 1 : 0; }
  insert(x: object): StdPair {
    if (this.of.has(x)) return new StdPair(null, false);
    const ref = new WeakRef(x);
    this.of.set(x, ref);
    this.refs.add(ref);
    WeakRefSet.gone.register(x, { set: this, ref }, ref);
    this.n++;
    return new StdPair(null, true);
  }
  erase(x: object): number {
    const ref = this.of.get(x);
    if (!ref) return 0;
    this.of.delete(x);
    this.refs.delete(ref);
    WeakRefSet.gone.unregister(ref);
    this.n--;
    return 1;
  }
  clear(): void {
    for (const ref of this.refs) WeakRefSet.gone.unregister(ref);
    this.refs.clear();
    this.of = new WeakMap();
    this.n = 0;
  }
  *[Symbol.iterator](): IterableIterator<any> {
    for (const ref of [...this.refs]) {
      const x = ref.deref();
      if (x !== undefined) yield x;
    }
  }
  $clone(): WeakRefSet {
    const s = new WeakRefSet();
    for (const x of this) s.insert(x);
    s.n = this.n;
    return s;
  }
}

// ---- std::string

const enc = new TextEncoder();
const dec = new TextDecoder();

/** std::string: bytes (UTF-8) */
export class StdString {
  d: Int8Array = new Int8Array(1);
  n = 0;

  /** from a C string (Ptr), a C string and a length, another string or JavaScript text */
  static of(x: any, len?: number | Ptr): StdString {
    const s = new StdString();
    if (ArrayBuffer.isView(x)) x = new Ptr(x, 0);      // a char array
    if (x instanceof StdString) {
      s.set(x.d.subarray(0, x.n));
    } else if (x && x.a !== undefined) {
      const a = x.a as Int8Array;
      let e = x.o;
      if (len !== undefined && typeof len === 'number') e = x.o + len;
      else if (len && (len as any).a === a) e = (len as any).o;     // string(first, last)
      else while (e < a.length && a[e]) e++;
      // a pointer into a typed array, or into a std::vector<char> (a JavaScript array: C4StartupMainDlg::UpdateParticipants)
      s.set(ArrayBuffer.isView(a) ? a.subarray(x.o, e) : Int8Array.from((a as unknown as number[]).slice(x.o, e)));
    } else if (typeof x === 'string') {
      s.set(new Int8Array(enc.encode(x).buffer));
    }
    return s;
  }
  static ofText(t: string): StdString {
    return StdString.of(t);
  }
  private set(b: Int8Array): void {
    this.d = new Int8Array(b.length + 1);
    this.d.set(b);
    this.n = b.length;
  }
  str(): string {
    return dec.decode(new Uint8Array(this.d.buffer, this.d.byteOffset, this.n));
  }
  c_str(): Ptr {
    return new Ptr(this.d, 0);
  }
  data(): any {
    return this.c_str();
  }
  size(): number { return this.n; }
  length(): number { return this.n; }
  reserve(_n: number): void {}
  resize(n: number, c = 0): void {
    const b = new Int8Array(n + 1);
    b.set(this.d.subarray(0, Math.min(n, this.d.length)));
    if (n > this.n) b.fill(c, this.n, n);
    b[n] = 0;
    this.d = b;
    this.n = n;
  }
  back(): number { return this.d[this.n - 1]; }
  pop_back(): void { this.resize(this.n - 1); }
  empty(): boolean { return this.n === 0; }
  clear(): void { this.set(new Int8Array(0)); }
  append(x: any, len?: number): this {
    if (typeof x === 'number') {
      // operator+=(char), append(count, char)
      if (len === undefined) this.push_back(x);
      else for (let i = 0; i < x; i++) this.push_back(len);
      return this;
    }
    const o = x instanceof StdString ? x : StdString.of(x, len);
    const b = new Int8Array(this.n + o.n);
    b.set(this.d.subarray(0, this.n));
    b.set(o.d.subarray(0, o.n), this.n);
    this.set(b);
    return this;
  }
  /** insert(pos, string or C string); insert(pos, count, char) (C4Game::GRBroadcast puts a '~' in front) */
  insert(pos: number, x: any, ch?: number): this {
    if (typeof x === 'number') {
      const fill = new Int8Array(x).fill(ch ?? 0);
      return this.insert(pos, StdString.of(new Ptr(fill, 0), x));
    }
    const o = x instanceof StdString ? x : StdString.of(x);
    const b = new Int8Array(this.n + o.n);
    b.set(this.d.subarray(0, pos));
    b.set(o.d.subarray(0, o.n), pos);
    b.set(this.d.subarray(pos, this.n), pos + o.n);
    this.set(b);
    return this;
  }
  push_back(c: number): void {
    const b = new Int8Array(this.n + 1);
    b.set(this.d.subarray(0, this.n));
    b[this.n] = c;
    this.set(b);
  }
  assign(x: any, last?: any): this {
    const o = x instanceof StdString ? x : StdString.of(x, last);
    this.set(o.d.subarray(0, o.n));
    return this;
  }
  plus(x: any): StdString {
    return this.$clone().append(x);
  }
  substr(pos = 0, len = Infinity): StdString {
    const s = new StdString();
    s.set(this.d.subarray(pos, Math.min(this.n, pos + len)));
    return s;
  }
  find(x: any, pos = 0): number {
    const t = x instanceof StdString ? x.str() : typeof x === 'number' ? String.fromCharCode(x) : StdString.of(x).str();
    const i = this.str().indexOf(t, pos);
    return i < 0 ? npos : i;
  }
  compare(x: any): number {
    const a = this.str(), b = (x instanceof StdString ? x : StdString.of(x)).str();
    return a < b ? -1 : a > b ? 1 : 0;
  }
  eq(x: any): boolean { return this.compare(x) === 0; }
  ne(x: any): boolean { return this.compare(x) !== 0; }
  lt(x: any): boolean { return this.compare(x) < 0; }
  at(i: number): number { return this.d[i]; }
  /** iterators over the bytes (std::transform, std::sregex_token_iterator): pointers into the buffer */
  begin(): Ptr { return new Ptr(this.d, 0); }
  end(): Ptr { return new Ptr(this.d, this.n); }
  cbegin(): Ptr { return this.begin(); }
  cend(): Ptr { return this.end(); }
  $clone(): StdString {
    const s = new StdString();
    s.set(this.d.subarray(0, this.n));
    return s;
  }
  $assign(o: StdString): this {
    return this.assign(o);
  }
  toString(): string {
    return this.str();
  }
}

export const npos = 18446744073709551615;

// ---- std::bitset

export class Bitset {
  d: boolean[];
  constructor(n: number) {
    this.d = new Array(n).fill(false);
  }
  test(i: number): boolean { return this.d[i]; }
  set(i?: number, v = true): this {
    if (i === undefined) this.d.fill(true); else this.d[i] = !!v;
    return this;
  }
  reset(i?: number): this {
    if (i === undefined) this.d.fill(false); else this.d[i] = false;
    return this;
  }
  flip(i?: number): this {
    if (i === undefined) this.d = this.d.map((x) => !x); else this.d[i] = !this.d[i];
    return this;
  }
  count(): number { return this.d.filter((x) => x).length; }
  any(): boolean { return this.d.some((x) => x); }
  none(): boolean { return !this.any(); }
  all(): boolean { return this.d.every((x) => x); }
  size(): number { return this.d.length; }
  $clone(): Bitset {
    const b = new Bitset(0);
    b.d = this.d.slice();
    return b;
  }
  $assign(o: Bitset): this {
    this.d = o.d.slice();
    return this;
  }
}

// ---- std::istringstream

/**
 * std::istringstream as StdMeshMaterialParserCtx reads numbers with it (`std::istringstream(s) >> i`): libstdc++'s
 * num_get in the "C" locale. Leading white space is skipped; an integer is [+-]digits, a floating-point number
 * [+-]digits[.digits][(e|E)[+-]digits]; what follows the number stays unread. Without a number (or out of the
 * type's range) the stream fails and the value is 0 (the limit when out of range), as C++11 specifies.
 */
export class IStringStream {
  private s: string;
  private at = 0;
  private failed = false;
  constructor(x: any) {
    this.s = (x instanceof StdString ? x : StdString.of(x)).str();
  }
  read(p: Ptr, kind: string): this {
    if (this.failed) return this;
    while (this.at < this.s.length && ' \t\n\v\f\r'.includes(this.s[this.at])) this.at++;
    const rest = this.s.slice(this.at);
    const m = kind[0] === 'f' ? /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest) : /^[+-]?\d+/.exec(rest);
    if (!m) {
      this.failed = true;
      p.a[p.o] = 0;
      return this;
    }
    this.at += m[0].length;
    if (kind[0] === 'f') {
      const v = parseFloat(m[0]);
      p.a[p.o] = kind === 'f32' ? Math.fround(v) : v;
      return this;
    }
    const bits = Number(kind.slice(1));
    const signed = kind[0] === 'i';
    const v = BigInt(m[0]);
    const lo = signed ? -(1n << BigInt(bits - 1)) : 0n;
    const hi = signed ? (1n << BigInt(bits - 1)) - 1n : (1n << BigInt(bits)) - 1n;
    if (signed ? v < lo || v > hi : v > hi || (v < 0n && -v > hi)) {
      this.failed = true;
      p.a[p.o] = Number(v < 0n && signed ? lo : hi);
      return this;
    }
    // an unsigned type takes a negative number modulo 2^bits, as strtoul does
    p.a[p.o] = Number(signed ? v : BigInt.asUintN(bits, v));
    return this;
  }
  fail(): boolean {
    return this.failed;
  }
  good(): boolean {
    return !this.failed && this.at < this.s.length;
  }
  eof(): boolean {
    return this.at >= this.s.length;
  }
  /** the next character, or EOF (-1) */
  peek(): number {
    return this.at < this.s.length ? this.s.charCodeAt(this.at) : -1;
  }
  get(): number {
    return this.at < this.s.length ? this.s.charCodeAt(this.at++) : -1;
  }
  /** a std::stringstream that is written to (C4ScriptGuiWindow::SetPositionStringProperties) */
  put(c: number): this {
    this.s += String.fromCharCode(c & 0xff);
    return this;
  }
  /** << of a std::stringstream that is written to (C4StartupAboutDlg's credits): text, C strings, numbers */
  write(x: any): this {
    if (x instanceof StdString) this.s += x.str();
    else if (x && x.a !== undefined) this.s += StdString.of(x).str();
    else if (typeof x === 'boolean') this.s += x ? '1' : '0';
    else this.s += String(x);
    return this;
  }
  /** the text written (std::stringstream::str) */
  str(): StdString {
    return StdString.of(this.s);
  }
  /** >> std::ws */
  ws(): this {
    while (this.at < this.s.length && ' \t\n\v\f\r'.includes(this.s[this.at])) this.at++;
    return this;
  }
}

// ---- exceptions

/** std::exception and the library's exceptions: what() is the message (a C string) */
/** the standard exception classes the original throws and catches, with their bases */
const EXCEPTION_BASES: Record<string, string> = {
  logic_error: 'exception', runtime_error: 'exception', invalid_argument: 'logic_error', out_of_range: 'logic_error',
  length_error: 'logic_error', domain_error: 'logic_error', range_error: 'runtime_error', overflow_error: 'runtime_error',
  regex_error: 'runtime_error', bad_alloc: 'exception',
};
/** catch (std::<name> &): a StdException of that class or one derived from it */
export function $isException(e: any, name: string): boolean {
  if (!e || !e.$stdexception) return false;
  for (let k: string | undefined = e.kind ?? 'exception'; k; k = EXCEPTION_BASES[k]) if (k === name) return true;
  return name === 'exception';
}
export class StdException extends Error {
  $stdexception = true;
  msg: any;
  kind = 'exception';
  constructor(msg: any = null, kind?: string) {
    super(typeof msg === 'string' ? msg : msg instanceof StdString ? msg.str() : 'std::exception');
    this.msg = msg;
    if (kind) this.kind = kind;
  }
  what(): any {
    if (this.msg && this.msg.a !== undefined) return this.msg;
    if (this.msg instanceof StdString) return this.msg.c_str();
    return StdString.of(this.message).c_str();
  }
  /** std::runtime_error(msg) as the base of a translated class: the message (a C string or a std::string) */
  $setmsg(msg: any): void {
    this.msg = msg instanceof StdString ? msg.$clone() : msg && msg.a !== undefined ? StdString.of(msg).c_str() : msg;
    this.message = msg instanceof StdString ? msg.str() : msg && msg.a !== undefined ? StdString.of(msg).str() : String(msg);
  }
}

/** throw (keeps the thrown value as it is: an object, a pointer to one, a number) */
export function $throw(x: any): never {
  throw x;
}

/** a function the game uses that is defined in a file the port does not translate (network, editor) */
export function $missing(name: string): never {
  throw new Error(`OpenClonk port: ${name} is not part of the port`);
}

/** delete p: its destructor */
export function $delete(p: any): void {
  if (p && typeof p.$dtor === 'function') p.$dtor();
}

/** dynamic_cast<T *>(p) */
export function $dyncast(p: any, C: any): any {
  if (p == null) return null;
  if (p instanceof C) return p;
  let k = p.constructor;
  while (k) {
    if (k.$mixins && k.$mixins.includes(C)) return p;
    k = Object.getPrototypeOf(k);
  }
  return null;
}

/** a class with a second base class: the base's methods copied in (its fields are the class's own) */
export function $mixin(C: any, B: any): void {
  (C.$mixins ??= []).push(B);
  let proto = B.prototype;
  while (proto && proto !== Object.prototype) {
    for (const k of Object.getOwnPropertyNames(proto)) {
      if (k === 'constructor' || k === '$clone' || k === '$assign') continue;
      if (!(k in C.prototype)) Object.defineProperty(C.prototype, k, Object.getOwnPropertyDescriptor(proto, k)!);
    }
    proto = Object.getPrototypeOf(proto);
  }
}

const iptrs = new Map<number, object>();
/** (T *) n for a magic number n: an object of its own for each number */
export function $iptr(n: number): object {
  let p = iptrs.get(n);
  if (!p) {
    p = Object.freeze({ $iptr: n });
    iptrs.set(n, p);
  }
  return p;
}

const addrs = new WeakMap<object, number>();
let nextAddr = 16;
/** (uintptr_t) p: a number for each object, in the order the numbers are asked for */
export function $addr(p: any): number {
  if (p == null) return 0;
  if (typeof p !== 'object' && typeof p !== 'function') return p;
  let a = addrs.get(p);
  if (a === undefined) {
    a = nextAddr;
    nextAddr += 16;
    addrs.set(p, a);
  }
  return a;
}

// ---- algorithms over iterators and ranges

export function $min(a: any, b: any): any {
  return b < a ? b : a;
}
export function $max(a: any, b: any): any {
  return a < b ? b : a;
}
/** std::min/max of class values: by the class's operator< (lt), the first one when they are equal */
export function $minBy(a: any, b: any, lt: (x: any, y: any) => boolean): any {
  return lt(b, a) ? b : a;
}
export function $maxBy(a: any, b: any, lt: (x: any, y: any) => boolean): any {
  return lt(a, b) ? b : a;
}
export function $min_list(l: any[]): any {
  return l.reduce((x, y) => (y < x ? y : x));
}
export function $max_list(l: any[]): any {
  return l.reduce((x, y) => (x < y ? y : x));
}
export function $abs64(x: bigint): bigint {
  return x < 0n ? -x : x;
}

function arrOf(it: Iter): any[] {
  return it.c.items ?? it.c;
}

/** the elements of [first, last): iterators (also reverse ones), Ptrs, pointers to objects in arrays */
function rangeOf(first: any, last: any): { get: (k: number) => any; set: (k: number, v: any) => void; n: number } {
  if (first == null || last == null) {
    return { get: () => undefined, set: () => {}, n: 0 };
  }
  if (first instanceof Iter) {
    const a = arrOf(first);
    if (first.rev) return { get: (k) => a[first.i - 1 - k], set: (k, v) => { a[first.i - 1 - k] = v; }, n: first.i - last.i };
    return { get: (k) => a[first.i + k], set: (k, v) => { a[first.i + k] = v; }, n: last.i - first.i };
  }
  if (first instanceof Ptr) {
    const a = first.a;
    return { get: (k) => a[first.o + k], set: (k, v) => { a[first.o + k] = v; }, n: last.o - first.o };
  }
  const a = first.$a;
  return { get: (k) => a[first.$i + k], set: (k, v) => { a[first.$i + k] = v; }, n: last.$i - first.$i };
}

function sortRange(first: any, last: any, f: (t: any[]) => void): void {
  const r = rangeOf(first, last);
  const t: any[] = [];
  for (let k = 0; k < r.n; k++) t.push(r.get(k));
  f(t);
  if (t.length && t[0] && typeof t[0] === 'object' && typeof t[0].$assign === 'function' && t[0].$a !== undefined) {
    // elements of an object array (they know their place): the values move, the objects
    // that pointers know stay where they are. Plain arrays of class references (C4Def*)
    // are reordered by reference instead.
    const vals = t.map((o) => o.$clone());
    for (let k = 0; k < r.n; k++) r.get(k).$assign(vals[k]);
    return;
  }
  for (let k = 0; k < r.n; k++) r.set(k, t[k]);
}

/** a callable: a function, or an object of a class with operator() (op_call) */
export function $fn(f: any): any {
  if (typeof f === 'function' || f == null) return f;
  let proto = Object.getPrototypeOf(f);
  while (proto) {
    const k = Object.getOwnPropertyNames(proto).find((n) => n.startsWith('op_call'));
    if (k) return (...a: any[]) => f[k](...a);
    proto = Object.getPrototypeOf(proto);
  }
  throw new Error('not callable');
}

/** obj->*member for a pointer to a data member: its name, or the path through an anonymous union ("$u1.speedFactor") */
export function $memberOf(obj: any, member: string): any {
  const path = member.split('.');
  for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  return obj;
}
export function $memberKey(member: string): string {
  return member.slice(member.lastIndexOf('.') + 1);
}

/** std::replace(first, last, old, new) */
export function std_replace(first: any, last: any, from: any, to: any): void {
  const r = rangeOf(first, last);
  for (let k = 0; k < r.n; k++) if (r.get(k) === from) r.set(k, to);
}
/** std::transform(first, last, out, f) with one input range */
export function std_transform(first: any, last: any, out: any, f: any): any {
  const r = rangeOf(first, last);
  const fn = $fn(f);
  if (out && typeof out.push === 'function' && !(out instanceof Ptr) && !(out instanceof Iter)) {
    for (let k = 0; k < r.n; k++) out.push(fn(r.get(k)));
    return out;
  }
  const o = rangeOf(out, out instanceof Ptr ? new Ptr(out.a, out.o + r.n) : out.add(r.n));
  for (let k = 0; k < r.n; k++) o.set(k, fn(r.get(k)));
  return out instanceof Ptr ? new Ptr(out.a, out.o + r.n) : out.add(r.n);
}
/** an output iterator inserting into a container: std::inserter(set, pos), std::back_inserter(vector) */
export function std_inserter(c: any): { push(v: any): void } {
  return { push: (v: any) => { c.insert(v); } };
}
export function std_back_inserter(c: any): { push(v: any): void } {
  return { push: (v: any) => { c.push(v); } };
}
/** std::set_difference(f1, l1, f2, l2, out) of two sorted ranges (std::set<int>: their order is the numbers') */
export function std_set_difference(f1: any, l1: any, f2: any, l2: any, out: { push(v: any): void }, comp: any = less): any {
  const a = rangeOf(f1, l1), b = rangeOf(f2, l2);
  const lt = $fn(comp);
  let i = 0, j = 0;
  while (i < a.n) {
    if (j >= b.n || lt(a.get(i), b.get(j))) out.push(a.get(i++));
    else if (lt(b.get(j), a.get(i))) j++;
    else { i++; j++; }
  }
  return out;
}
/** std::copy(first, last, out): from a range or a std::sregex_token_iterator into a range or an inserter */
export function std_copy(first: any, last: any, out: any): any {
  const items: any[] = [];
  if (first instanceof RegexTokenIterator) items.push(...first.tokens.slice(first.i).map((t) => t.str()));
  else { const r = rangeOf(first, last); for (let k = 0; k < r.n; k++) items.push(r.get(k)); }
  if (out && typeof out.push === 'function' && !(out instanceof Ptr) && !(out instanceof Iter)) {
    for (const v of items) out.push(v);
    return out;
  }
  if (out && typeof out === 'object' && !(out instanceof Ptr) && !(out instanceof Iter) && Array.isArray(out.$a)) {
    // &v[i] of an array of class objects (C4ParticleChunk::DeleteAndReplaceParticle: std::copy of vertices): each
    // value is assigned (operator=), the objects that pointers know stay where they are
    items.forEach((v, k) => $oat(out.$a, out.$i + k).$assign(v));
    return $oat(out.$a, out.$i + items.length);
  }
  const end = out instanceof Ptr ? new Ptr(out.a, out.o + items.length) : out.add(items.length);
  const o = rangeOf(out, end);
  items.forEach((v, k) => o.set(k, v));
  return end;
}

/**
 * std::uniform_real_distribution<float or double>(a, b) as libstdc++ draws: generate_canonical (one call of a 32-bit
 * engine: (rng() - min) / 2^32 in the result type, the value just below 1 if it rounds to 1), then (b - a) * u + a
 */
export class UniformRealDistribution {
  a: number;
  b: number;
  bits: number;
  constructor(a: number, b: number, bits = 64) { this.a = a; this.b = b; this.bits = bits; }
  call(rng: any): number {
    const f = this.bits === 32 ? Math.fround : (x: number) => x;
    let u = f(f($fn(rng)() >>> 0) / 4294967296);
    if (u >= 1) u = this.bits === 32 ? 0.99999994039535522 : 1 - 2 ** -53;
    return f(f(u * f(this.b - this.a)) + this.a);
  }
}

/** std::vector's capacity (C4ParticleChunk::ReserveSpace loops on it): what reserve asked for, at least the size */
export function $capacity(v: any[]): number {
  return Math.max(v.length, (v as any).$cap ?? 0);
}
export function $reserve(v: any[], n: number): void {
  if (n > $capacity(v)) (v as any).$cap = n;
}

/** std::chrono::steady_clock::now(): nanoseconds (every std::chrono duration and time point here is a number of them) */
export function $chronoNow(): number {
  return Math.round(performance.now() * 1e6);
}
/** std::chrono::duration_cast to a duration of `tick` nanoseconds: towards zero, as C++ does */
export function $durationCast(ns: number, tick: number): number {
  return Math.trunc(ns / tick) * tick;
}

/** std::all_of(first, last, pred) (C4TextureMap::LoadMap: a line of white space, std::all_of(first, last, &isspace)) */
export function std_all_of(first: any, last: any, f: any): boolean {
  const r = rangeOf(first, last);
  const fn = $fn(f);
  for (let k = 0; k < r.n; k++) if (!fn(r.get(k))) return false;
  return true;
}
export function std_any_of(first: any, last: any, f: any): boolean {
  const r = rangeOf(first, last);
  const fn = $fn(f);
  for (let k = 0; k < r.n; k++) if (fn(r.get(k))) return true;
  return false;
}
/**
 * std::stoul(str, &pos, base) as libstdc++ (strtoul with the checks): leading white space and a sign are taken, no
 * digits throw invalid_argument, a value beyond unsigned long throws out_of_range; *pos is the characters used
 */
export function $stoul(s: any, pos: Ptr | null, base = 10): number {
  const t = (s instanceof StdString ? s : StdString.of(s)).str();
  const m = /^[\t\n\v\f\r ]*([+-]?)(\d+)/.exec(base === 10 ? t : '');
  if (!m) throw new StdException('stoul', 'invalid_argument');
  let v = BigInt(m[2]);
  if (v > 0xffffffffffffffffn) throw new StdException('stoul', 'out_of_range');
  if (m[1] === '-') v = BigInt.asUintN(64, -v);
  if (pos) pos.a[pos.o] = m[0].length;
  return Number(v);
}

/** std::remove/unique/accumulate helpers used by the translated file and container code */
export function std_remove(_first: any, _last: any, _v: any): any { return null; }
export function std_remove_if(_first: any, _last: any, _f: any): any { return null; }
export function std_unique(_first: any, _last: any): any { return null; }
export function std_accumulate(first: any, last: any, init: any): any {
  let v = init;
  if (Array.isArray(first)) { for (let i = 0; i < (last?.length ?? first.length); i++) v += first[i]; }
  return v;
}

export function std_fill(first: any, last: any, v: any): void {
  if (Array.isArray(first)) { const n = last?.length ?? first.length; for (let i = 0; i < n; i++) first[i] = v; return; }
  // iterators, Ptrs: each element of [first, last) gets v (a class element is assigned, as C++'s operator= does)
  const r = rangeOf(first, last);
  for (let k = 0; k < r.n; k++) {
    const o = r.get(k);
    if (o && typeof o === 'object' && typeof o.$assign === 'function' && v && typeof v === 'object') o.$assign(v);
    else r.set(k, v);
  }
}
/** std::uninitialized_fill: the same fill (the elements are value-initialized before) */
export function std_uninitialized_fill(first: any, last: any, v: any): void {
  std_fill(first, last, v);
}
export function std_fill_n(first: any, n: number, v: any): any {
  if (first instanceof Iter || first instanceof Ptr) {
    std_fill(first, first.add(n), v);
    return first.add(n);
  }
  for (let i = 0; i < n; i++) first[i] = v;
  return first;
}

export function std_sort(first: any, last: any, comp: any = less): void {
  const c = $fn(comp);
  sortRange(first, last, (t) => sort(t, c));
}
export function std_stable_sort(first: any, last: any, comp: any = less): void {
  const c = $fn(comp);
  sortRange(first, last, (t) => stable_sort(t, c));
}
export function std_find(first: any, last: any, v: any, eq?: (a: any, b: any) => boolean): any {
  if (first instanceof Ptr) {
    // pointers into a string or an array (std::string::const_iterator)
    let p = first;
    while (p.o < last.o && p.a[p.o] !== v) p = p.add(1);
    return p;
  }
  const a = arrOf(first);
  // std::string elements compare by their text (std::find(SourceFiles.cbegin(), SourceFiles.cend(), szSource))
  for (let i = first.i; i < last.i; i++) {
    if (eq ? eq(a[i], v) : a[i] === v || (a[i] instanceof StdString && v != null && a[i].eq(v))) return new Iter(first.c, i);
  }
  return last.copy();
}
export function std_find_if(first: Iter, last: Iter, f: (x: any) => boolean): Iter {
  const a = arrOf(first);
  for (let i = first.i; i < last.i; i++) if (f(a[i])) return new Iter(first.c, i);
  return last.copy();
}
export function std_find_if_not(first: any, last: any, f: (x: any) => boolean): any {
  if (first instanceof Iter) return std_find_if(first, last, (x) => !f(x));
  // pointers into a C string
  let p = first;
  while (p.o < last.o && f(p.a[p.o])) p = p.add(1);
  return p;
}
export function std_count(first: Iter, last: Iter, v: any, eq?: (a: any, b: any) => boolean): number {
  const a = arrOf(first);
  let n = 0;
  for (let i = first.i; i < last.i; i++) if (eq ? eq(a[i], v) : a[i] === v) n++;
  return n;
}
export function std_reverse(first: any, last: any): void {
  sortRange(first, last, (t) => t.reverse());
}
export function std_distance(first: Iter, last: Iter): number {
  return last.i - first.i;
}
export function std_begin(c: any): any {
  return $begin(c);
}
export function std_end(c: any): any {
  return $end(c);
}
export function std_equal(f1: Iter, l1: Iter, f2: Iter): boolean {
  const a = arrOf(f1), b = arrOf(f2);
  for (let i = f1.i, j = f2.i; i < l1.i; i++, j++) if (a[i] !== b[j]) return false;
  return true;
}
export function std_lower_bound(first: Iter, last: Iter, v: any, comp: Less<any> = less): Iter {
  const a = arrOf(first);
  let lo = first.i, hi = last.i;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (comp(a[mid], v)) lo = mid + 1; else hi = mid;
  }
  return new Iter(first.c, lo);
}

// ---- std::regex (ECMAScript grammar, on bytes as the original's char regex)

/** regex flags (values of this runtime) */
export const $rx = {
  icase: 1, nosubs: 2, optimize: 4, ECMAScript: 16,
  match_default: 0, match_any: 1 << 7, format_default: 0, format_first_only: 1 << 11,
};

function latin1(p: any, end?: any): string {
  const a = p.a as Int8Array;
  let e = end ? end.o : p.o;
  if (!end) while (e < a.length && a[e]) e++;
  let s = '';
  for (let i = p.o; i < e; i++) s += String.fromCharCode(a[i] & 0xff);
  return s;
}

/** std::regex */
export class Regex {
  re: RegExp;
  constructor(pattern: any, flags = $rx.ECMAScript) {
    const src = pattern instanceof StdString ? latin1(pattern.c_str()) : latin1(pattern);
    try {
      this.re = new RegExp(src, 'g' + (flags & $rx.icase ? 'i' : ''));
    } catch (e) {
      throw new StdException(`regex_error: ${(e as Error).message}`);
    }
  }
}

/** a std::sub_match of a token iterator: the token's bytes [first, second) in the searched text */
export class TokenMatch {
  first: Ptr;
  second: Ptr;
  constructor(first: Ptr, second: Ptr) { this.first = first; this.second = second; }
  length(): number { return this.second.o - this.first.o; }
  str(): StdString { return StdString.of(this.first, this.second as any); }
  /** compare(const char * or std::string), as std::string's */
  compare(x: any): number { return this.str().compare(x); }
}

/**
 * std::sregex_token_iterator / std::cregex_token_iterator(first, last, re, submatch) (C4Sky::Init, C4TextureMap::LoadMap):
 * with submatch -1 the parts between the matches, else that submatch of each match; without arguments the end. Its
 * tokens point into the searched bytes (first, second), as std::sub_match's do.
 */
export class RegexTokenIterator {
  tokens: TokenMatch[] = [];
  i = 0;
  constructor(first?: Ptr, last?: Ptr, re?: Regex, sub = 0) {
    if (first === undefined) return;
    const text = latin1(first, last);
    const g = new RegExp(re!.re.source, re!.re.flags.includes('g') ? re!.re.flags : re!.re.flags + 'g');
    const at = (k: number) => new Ptr(first.a, first.o + k);
    if (sub === -1) {
      // as libstdc++: a leading empty part is kept, an empty last part is left out; without any match the whole
      // text is the one part, even when it is empty (regex_token_iterator::_M_init: the suffix; C4Sky::Init takes
      // parts.at(...) of an empty sky list)
      let from = 0, matched = false;
      for (let m = g.exec(text); m; m = g.exec(text)) {
        if (m[0] === '') { g.lastIndex++; continue; }
        this.tokens.push(new TokenMatch(at(from), at(m.index)));
        from = m.index + m[0].length;
        matched = true;
      }
      if (!matched || from < text.length) this.tokens.push(new TokenMatch(at(from), at(text.length)));
    } else {
      for (let m = g.exec(text); m; m = g.exec(text)) {
        if (m[0] === '') g.lastIndex++;
        const start = m.index + (sub ? m[0].indexOf(m[sub] ?? '') : 0);
        this.tokens.push(new TokenMatch(at(start), at(start + (m[sub] ?? '').length)));
      }
    }
  }
  /** it == end: both past their last token */
  eq(o: RegexTokenIterator): boolean {
    return this.i >= this.tokens.length && o.i >= o.tokens.length || (this === o);
  }
  inc(): this { this.i++; return this; }
  get v(): TokenMatch { return this.tokens[this.i]; }
}

/** std::cmatch: the sub-matches of the last search (bytes) */
export class RegexMatch {
  m: (string | undefined)[] = [];
  pos = 0;
  size(): number { return this.m.length; }
  position(i = 0): number { return i ? 0 : this.pos; }
  length(i = 0): number { return (this.m[i] ?? '').length; }
  at(i: number): SubMatch { return new SubMatch(this.m[i]); }
  *[Symbol.iterator](): IterableIterator<SubMatch> {
    for (const s of this.m) yield new SubMatch(s);
  }
}

export class SubMatch {
  s: string | undefined;
  constructor(s: string | undefined) {
    this.s = s;
  }
  str(): StdString {
    const b = new Int8Array((this.s ?? '').length);
    for (let i = 0; i < b.length; i++) b[i] = this.s!.charCodeAt(i);
    const r = new StdString();
    r.append(new Ptr(new Int8Array([...b, 0]), 0));
    return r;
  }
  length(): number { return (this.s ?? '').length; }
}

/** regex_search(first, last, m, re[, flags]) on a range of chars */
export function $regex_search(first: any, last: any, m: RegexMatch, re: Regex): boolean {
  const s = latin1(first, last);
  re.re.lastIndex = 0;
  const r = re.re.exec(s);
  if (!r) {
    m.m = [];
    return false;
  }
  m.m = [...r];
  m.pos = r.index;
  return true;
}

/** regex_match(first, last, m, re[, flags]): the whole range must match (std::regex_match) */
export function $regex_match(first: any, lastOrMatch: any, matchOrRe: any, maybeRe?: Regex): boolean {
  // regex_match(s, m, re) or regex_match(first, last, m, re)
  const m: RegexMatch = maybeRe ? matchOrRe : lastOrMatch;
  const re: Regex = maybeRe ? maybeRe : matchOrRe;
  const s = maybeRe ? latin1(first, lastOrMatch) : latin1(first);
  const anchored = new RegExp('^(?:' + re.re.source + ')$', re.re.flags.replace('g', ''));
  const r = anchored.exec(s);
  if (!r || r[0].length !== s.length) {
    m.m = [];
    return false;
  }
  m.m = [...r];
  m.pos = 0;
  return true;
}

/** regex_replace(s, re, fmt[, flags]): a std::string */
export function $regex_replace(s: any, re: Regex, fmt: any, flags = 0): StdString {
  const src = latin1(s);
  const f = fmt instanceof StdString ? latin1(fmt.c_str()) : latin1(fmt);
  const r = flags & $rx.format_first_only ? new RegExp(re.re.source, re.re.flags.replace('g', '')) : re.re;
  r.lastIndex = 0;
  const out = src.replace(r, f);
  const b = new Int8Array(out.length + 1);
  for (let i = 0; i < out.length; i++) b[i] = out.charCodeAt(i);
  const res = new StdString();
  res.append(new Ptr(b, 0));
  return res;
}

/** a copy of an iterator (std::set<unsigned>::iterator iter = NextVAOID; --iter;): Iter and Ptr move in place */
export function $itcopy(it: any): any {
  if (it instanceof Iter) return it.copy();
  if (it instanceof Ptr) return new Ptr(it.a, it.o);
  return it;
}

/** std::advance(it, n): the iterator itself moves (it is passed by reference) */
export function std_advance(it: any, n: number): void {
  if (it instanceof Iter) it.i += it.rev ? -n : n;
  else if (it instanceof Ptr) it.o += n;
  else throw new Error('std::advance of an unknown iterator');
}
