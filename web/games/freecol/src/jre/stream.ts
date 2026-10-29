// @ts-nocheck
// java.util.stream. Terminal operations push the elements through the stages one at a time, as Java's
// pipelines do (a sink returns true to ask for no more elements, as Java's cancellationRequested), so
// side effects in lambdas happen in Java's order and short-circuiting stops where Java stops. iterator()
// pulls instead (generators), lazily as Java's does.
import { $J, JObject, defineLib, str, IllegalStateException, NullPointerException } from './lang.ts';
import { ArrayList, HashMap, HashSet, LinkedHashSet, Optional, sortArray } from './util.ts';

/** Push every element of a source to sink until it asks to stop; true when it asked. */
function each(src: any, sink: (x: any) => any): boolean {
  if (Array.isArray(src)) {
    for (let i = 0; i < src.length; i++) if (sink(src[i])) return true;
    return false;
  }
  if (src instanceof Stream) return src.$run(sink);
  if (src.$each) return src.$each(sink);
  if (typeof src.iterator === 'function' && typeof src.hasNext !== 'function') {
    const it = src.iterator();
    while (it.hasNext()) if (sink(it.next())) return true;
    return false;
  }
  for (const x of src) if (sink(x)) return true;
  return false;
}

/** A stage: run pushes, pull (a generator function) pulls. */
function stage(cls: any, run: (sink: any) => boolean, pull: () => Iterable<any>) {
  const s = new cls(null);
  s.run = run;
  s.pullf = pull;
  return s;
}

export class Stream extends JObject {
  src: any;
  run: any = null;
  pullf: any = null;
  constructor(src: any) {
    super();
    this.src = src;
  }
  $run(sink: (x: any) => any): boolean {
    return this.run !== null ? this.run(sink) : each(this.src, sink);
  }
  $pull(): Iterable<any> {
    return this.pullf !== null ? this.pullf() : this.src;
  }
  static of(...xs: any[]) {
    return new this(xs);
  }
  static ofNullable(x: any) {
    return new Stream(x == null ? [] : [x]);
  }
  static empty() {
    return new this([]);
  }
  static concat(a: any, b: any) {
    return stage(this, (sink) => a.$run(sink) || b.$run(sink), function* () {
      yield* a.$pull();
      yield* b.$pull();
    });
  }
  static generate(f: any) {
    return new this((function* () {
      for (;;) yield f();
    })());
  }
  static iterate(seed: any, a: any, b?: any) {
    return new this((function* () {
      if (b === undefined) {
        for (let x = seed; ; x = a(x)) yield x;
      } else {
        for (let x = seed; a(x); x = b(x)) yield x;
      }
    })());
  }
  [Symbol.iterator]() {
    return this.$pull()[Symbol.iterator]();
  }
  filter(p: any) {
    const up = this;
    return stage(this.constructor, (sink) => up.$run((x) => (p(x) ? sink(x) : false)), function* () {
      for (const x of up.$pull()) if (p(x)) yield x;
    });
  }
  $mapTo(cls: any, f: any) {
    const up = this;
    return stage(cls, (sink) => up.$run((x) => sink(f(x))), function* () {
      for (const x of up.$pull()) yield f(x);
    });
  }
  map(f: any) {
    return this.$mapTo(this.constructor, f);
  }
  mapToObj(f: any) {
    return this.$mapTo(Stream, f);
  }
  mapToInt(f: any) {
    return this.$mapTo(IntStream, f);
  }
  mapToLong(f: any) {
    return this.mapToInt(f);
  }
  mapToDouble(f: any) {
    return this.$mapTo(DoubleStream, f);
  }
  $as(cls: any) {
    const up = this;
    return stage(cls, (sink) => up.$run(sink), () => up.$pull());
  }
  boxed() {
    return this.$as(Stream);
  }
  asDoubleStream() {
    return this.$as(DoubleStream);
  }
  $flatTo(cls: any, f: any) {
    const up = this;
    return stage(cls, (sink) => up.$run((x) => {
      const r = f(x);
      return r != null ? r.$run(sink) : false;
    }), function* () {
      for (const x of up.$pull()) {
        const r = f(x);
        if (r != null) yield* r.$pull();
      }
    });
  }
  flatMap(f: any) {
    return this.$flatTo(this.constructor, f);
  }
  flatMapToInt(f: any) {
    return this.$flatTo(IntStream, f);
  }
  peek(f: any) {
    const up = this;
    return stage(this.constructor, (sink) => up.$run((x) => {
      f(x);
      return sink(x);
    }), function* () {
      for (const x of up.$pull()) {
        f(x);
        yield x;
      }
    });
  }
  distinct() {
    const up = this;
    return stage(this.constructor, (sink) => {
      const seen = new HashSet();
      return up.$run((x) => (seen.add(x) ? sink(x) : false));
    }, function* () {
      const seen = new HashSet();
      for (const x of up.$pull()) if (seen.add(x)) yield x;
    });
  }
  sorted(c?: any) {
    const up = this;
    const prim = this instanceof IntStream || this instanceof DoubleStream;
    const all = () => {
      const a: any[] = [];
      up.$run((x) => {
        a.push(x);
      });
      if (prim) a.sort((p, q) => $J.dcmp(p, q));
      else sortArray(a, c ?? null);
      return a;
    };
    return stage(this.constructor, (sink) => each(all(), sink), function* () {
      yield* all();
    });
  }
  limit(n: number) {
    const up = this;
    return stage(this.constructor, (sink) => {
      if (n <= 0) return false;
      let i = 0, stopped = false;
      up.$run((x) => {
        if (sink(x)) return (stopped = true);
        return ++i >= n;
      });
      return stopped;
    }, function* () {
      if (n <= 0) return;
      let i = 0;
      for (const x of up.$pull()) {
        yield x;
        if (++i >= n) return;
      }
    });
  }
  skip(n: number) {
    const up = this;
    return stage(this.constructor, (sink) => {
      let i = 0;
      return up.$run((x) => (i++ >= n ? sink(x) : false));
    }, function* () {
      let i = 0;
      for (const x of up.$pull()) if (i++ >= n) yield x;
    });
  }
  takeWhile(p: any) {
    const up = this;
    return stage(this.constructor, (sink) => {
      let stopped = false;
      up.$run((x) => {
        if (!p(x)) return true;
        if (sink(x)) return (stopped = true);
        return false;
      });
      return stopped;
    }, function* () {
      for (const x of up.$pull()) {
        if (!p(x)) return;
        yield x;
      }
    });
  }
  dropWhile(p: any) {
    const up = this;
    return stage(this.constructor, (sink) => {
      let dropping = true;
      return up.$run((x) => {
        if (dropping && p(x)) return false;
        dropping = false;
        return sink(x);
      });
    }, function* () {
      let dropping = true;
      for (const x of up.$pull()) {
        if (dropping && p(x)) continue;
        dropping = false;
        yield x;
      }
    });
  }
  sequential() {
    return this;
  }
  parallel() {
    return this;
  }
  unordered() {
    return this;
  }
  onClose() {
    return this;
  }
  close() {}
  forEach(f: any) {
    this.$run((x) => {
      f(x);
    });
  }
  forEachOrdered(f: any) {
    this.forEach(f);
  }
  collect(c: any, acc?: any, _comb?: any) {
    if (acc !== undefined) {
      const r = c();
      this.$run((x) => {
        acc(r, x);
      });
      return r;
    }
    const a = c.supplier()();
    const accumulate = c.accumulator();
    this.$run((x) => {
      accumulate(a, x);
    });
    const fin = c.finisher();
    return fin ? fin(a) : a;
  }
  toArray(_gen?: any) {
    const a: any[] = [];
    this.$run((x) => {
      a.push(x);
    });
    return a;
  }
  toList() {
    return ArrayList.from(this.toArray());
  }
  reduce(a: any, b?: any, _c?: any) {
    if (b === undefined) {
      let found = false, r: any = null;
      this.$run((x) => {
        if (!found) {
          found = true;
          r = x;
        } else r = a(r, x);
      });
      return found ? Optional.of(r) : Optional.empty();
    }
    let r = a;
    this.$run((x) => {
      r = b(r, x);
    });
    return r;
  }
  count() {
    let n = 0;
    this.$run(() => {
      n++;
    });
    return n;
  }
  anyMatch(p: any) {
    let r = false;
    this.$run((x) => (p(x) ? (r = true) : false));
    return r;
  }
  allMatch(p: any) {
    let r = true;
    this.$run((x) => {
      if (p(x)) return false;
      r = false;
      return true;
    });
    return r;
  }
  noneMatch(p: any) {
    return !this.anyMatch(p);
  }
  findFirst() {
    let found = false, r: any = null;
    this.$run((x) => {
      found = true;
      r = x;
      return true;
    });
    if (!found) return Optional.empty();
    if (r == null) throw new NullPointerException();
    return Optional.of(r);
  }
  findAny() {
    return this.findFirst();
  }
  min(c?: any) {
    let found = false, r: any = null;
    this.$run((x) => {
      if (!found) {
        found = true;
        r = x;
      } else if ((c ? c(r, x) : $J.compareTo(r, x)) > 0) r = x; // BinaryOperator.minBy
    });
    return found ? Optional.of(r) : Optional.empty();
  }
  max(c?: any) {
    let found = false, r: any = null;
    this.$run((x) => {
      if (!found) {
        found = true;
        r = x;
      } else if ((c ? c(r, x) : $J.compareTo(r, x)) < 0) r = x; // BinaryOperator.maxBy
    });
    return found ? Optional.of(r) : Optional.empty();
  }
  iterator() {
    const src = this.src;
    if (this.run === null && !Array.isArray(src) && typeof src.iterator === 'function' && typeof src.hasNext !== 'function') return src.iterator();
    const it = this.$pull()[Symbol.iterator]();
    let nx: any = null;
    return {
      hasNext: () => {
        if (nx === null) nx = it.next();
        return !nx.done;
      },
      next: () => {
        if (nx === null) nx = it.next();
        const v = nx.value;
        nx = null;
        return v;
      },
    };
  }
  spliterator() {
    return this;
  }
}
defineLib(Stream, 'java.util.stream.Stream');

export class IntStream extends Stream {
  static range(a: number, b: number) {
    return stage(IntStream, (sink) => {
      for (let i = a; i < b; i++) if (sink(i)) return true;
      return false;
    }, function* () {
      for (let i = a; i < b; i++) yield i;
    });
  }
  static rangeClosed(a: number, b: number) {
    return IntStream.range(a, b + 1);
  }
  sum() {
    let s = 0;
    this.$run((x) => {
      s = (s + x) | 0;
    });
    return s;
  }
  average() {
    let s = 0, n = 0;
    this.$run((x) => {
      s += x;
      n++;
    });
    return n ? Optional.of(s / n) : Optional.empty();
  }
  max() {
    let found = false, r = 0;
    this.$run((x) => {
      if (!found || x > r) {
        found = true;
        r = x;
      }
    });
    return found ? Optional.of(r) : Optional.empty();
  }
  min() {
    let found = false, r = 0;
    this.$run((x) => {
      if (!found || x < r) {
        found = true;
        r = x;
      }
    });
    return found ? Optional.of(r) : Optional.empty();
  }
  summaryStatistics() {
    const xs = this.toArray();
    return {
      getMin: () => Math.min(...xs), getMax: () => Math.max(...xs), getSum: () => xs.reduce((a, b) => a + b, 0),
      getCount: () => xs.length, getAverage: () => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0),
    };
  }
}
defineLib(IntStream, 'java.util.stream.IntStream');
export const LongStream = IntStream;

export class DoubleStream extends Stream {
  sum() {
    // Java's DoubleStream.sum uses Kahan summation
    let sum = 0, c = 0, simple = 0;
    this.$run((x) => {
      simple += x;
      const y = x - c;
      const t = sum + y;
      c = (t - sum) - y;
      sum = t;
    });
    if (Number.isNaN(sum) && (simple === Infinity || simple === -Infinity)) return simple;
    return sum;
  }
  average() {
    const xs = this.toArray();
    return xs.length ? Optional.of(new DoubleStream(xs).sum() / xs.length) : Optional.empty();
  }
  max() {
    let found = false, r = 0;
    this.$run((x) => {
      if (!found || x > r) {
        found = true;
        r = x;
      }
    });
    return found ? Optional.of(r) : Optional.empty();
  }
  min() {
    let found = false, r = 0;
    this.$run((x) => {
      if (!found || x < r) {
        found = true;
        r = x;
      }
    });
    return found ? Optional.of(r) : Optional.empty();
  }
}
defineLib(DoubleStream, 'java.util.stream.DoubleStream');

export class StreamSupport {
  static stream(it: any, _parallel?: boolean) {
    return new Stream(it);
  }
}

$J.streamOf = (c: any) => new Stream(c);
$J.streamOfArray = (a: any[]) => new Stream(a);
$J.intStreamOf = (a: number[]) => new IntStream(a);

/* ------------------------------------------------------------------ collectors */

class C extends JObject {
  sup: any;
  acc: any;
  fin: any;
  constructor(sup: any, acc: any, fin: any = null) {
    super();
    this.sup = sup; this.acc = acc; this.fin = fin;
  }
  supplier() {
    return this.sup;
  }
  accumulator() {
    return this.acc;
  }
  finisher() {
    return this.fin;
  }
  combiner() {
    return null;
  }
  characteristics() {
    return new HashSet();
  }
}

export class Collector {
  static of(sup: any, acc: any, _comb: any, fin?: any, ..._ch: any[]) {
    return new C(sup, acc, typeof fin === 'function' ? fin : null);
  }
}
export const Collector_Characteristics = { IDENTITY_FINISH: 'IDENTITY_FINISH', UNORDERED: 'UNORDERED', CONCURRENT: 'CONCURRENT' };

function finish(c: any, a: any) {
  const f = c.finisher();
  return f ? f(a) : a;
}

export class Collectors {
  static toList() {
    return new C(() => new ArrayList(), (l: any, x: any) => l.add(x));
  }
  static toUnmodifiableList() {
    return Collectors.toList();
  }
  static toSet() {
    return new C(() => new HashSet(), (s: any, x: any) => s.add(x));
  }
  static toUnmodifiableSet() {
    return Collectors.toSet();
  }
  static toCollection(f: any) {
    return new C(f, (s: any, x: any) => s.add(x));
  }
  static toMap(kf: any, vf: any, merge?: any, sup?: any) {
    if (merge === undefined) {
      return new C(() => new HashMap(), (m: any, x: any) => {
        const k = kf(x);
        const v = vf(x);
        if (v == null) throw new NullPointerException();
        const u = m.putIfAbsent(k, v);
        if (u != null) throw new IllegalStateException('Duplicate key ' + str(k) + ' (attempted merging values ' + str(u) + ' and ' + str(v) + ')');
      });
    }
    return new C(sup ?? (() => new HashMap()), (m: any, x: any) => m.merge(kf(x), vf(x), merge));
  }
  static groupingBy(f: any, a?: any, b?: any) {
    let mapFactory = () => new HashMap();
    let down = Collectors.toList();
    if (b !== undefined) {
      mapFactory = a;
      down = b;
    } else if (a !== undefined) down = a;
    const dsup = down.supplier(), dacc = down.accumulator();
    return new C(mapFactory, (m: any, x: any) => {
      const k = f(x);
      if (k == null) throw new NullPointerException('element cannot be mapped to a null key');
      const container = m.computeIfAbsent(k, () => dsup());
      dacc(container, x);
    }, down.finisher() ? (m: any) => {
      m.replaceAll((_k: any, v: any) => down.finisher()(v));
      return m;
    } : null);
  }
  static partitioningBy(p: any, down?: any) {
    const d = down ?? Collectors.toList();
    return new C(() => ({ f: d.supplier()(), t: d.supplier()() }), (o: any, x: any) => d.accumulator()(p(x) ? o.t : o.f, x), (o: any) => {
      const m = new (Partition as any)();
      m.f = finish(d, o.f);
      m.t = finish(d, o.t);
      return m;
    });
  }
  static counting() {
    return new C(() => [0], (a: any, _x: any) => a[0]++, (a: any) => a[0]);
  }
  static summingInt(f: any) {
    return new C(() => [0], (a: any, x: any) => (a[0] = (a[0] + f(x)) | 0), (a: any) => a[0]);
  }
  static summingLong(f: any) {
    return new C(() => [0], (a: any, x: any) => (a[0] += f(x)), (a: any) => a[0]);
  }
  static summingDouble(f: any) {
    return new C(() => [], (a: any, x: any) => a.push(f(x)), (a: any) => new DoubleStream(a).sum());
  }
  static averagingInt(f: any) {
    return new C(() => [0, 0], (a: any, x: any) => { a[0] += f(x); a[1]++; }, (a: any) => (a[1] ? a[0] / a[1] : 0));
  }
  static averagingDouble(f: any) {
    return new C(() => [], (a: any, x: any) => a.push(f(x)), (a: any) => (a.length ? new DoubleStream(a).sum() / a.length : 0));
  }
  static joining(delim = '', prefix = '', suffix = '') {
    return new C(() => [], (a: any, x: any) => a.push(str(x)), (a: any) => prefix + a.join(delim) + suffix);
  }
  static mapping(f: any, down: any) {
    return new C(down.supplier(), (a: any, x: any) => down.accumulator()(a, f(x)), down.finisher());
  }
  static filtering(p: any, down: any) {
    return new C(down.supplier(), (a: any, x: any) => { if (p(x)) down.accumulator()(a, x); }, down.finisher());
  }
  static flatMapping(f: any, down: any) {
    return new C(down.supplier(), (a: any, x: any) => { const s = f(x); if (s) s.forEach((y: any) => down.accumulator()(a, y)); }, down.finisher());
  }
  static collectingAndThen(down: any, f: any) {
    return new C(down.supplier(), down.accumulator(), (a: any) => f(finish(down, a)));
  }
  static maxBy(c: any) {
    return new C(() => ({ v: null, has: false }), (a: any, x: any) => {
      if (!a.has || c(a.v, x) < 0) a.v = x;
      a.has = true;
    }, (a: any) => (a.has ? Optional.of(a.v) : Optional.empty()));
  }
  static minBy(c: any) {
    return new C(() => ({ v: null, has: false }), (a: any, x: any) => {
      if (!a.has || c(a.v, x) > 0) a.v = x;
      a.has = true;
    }, (a: any) => (a.has ? Optional.of(a.v) : Optional.empty()));
  }
  static reducing(a: any, b?: any, c?: any) {
    if (b === undefined) {
      return new C(() => ({ v: null, has: false }), (s: any, x: any) => {
        s.v = s.has ? a(s.v, x) : x;
        s.has = true;
      }, (s: any) => (s.has ? Optional.of(s.v) : Optional.empty()));
    }
    if (c === undefined) return new C(() => ({ v: a }), (s: any, x: any) => (s.v = b(s.v, x)), (s: any) => s.v);
    return new C(() => ({ v: a }), (s: any, x: any) => (s.v = c(s.v, b(x))), (s: any) => s.v);
  }
}

/** Collectors.partitioningBy's map: false, then true. */
class Partition extends HashMap {
  f: any;
  t: any;
  constructor() {
    super();
  }
  get(k: any) {
    return k ? this.t : this.f;
  }
  size() {
    return 2;
  }
  containsKey(k: any) {
    return k === true || k === false;
  }
  entrySet() {
    const m = new (require_linked())();
    m.put(false, this.f);
    m.put(true, this.t);
    return m.entrySet();
  }
  keySet() {
    return this.entrySet().stream().map((e: any) => e.getKey()).collect(Collectors.toList());
  }
  values() {
    return ArrayList.from([this.f, this.t]);
  }
}
import { LinkedHashMap } from './util.ts';
function require_linked() {
  return LinkedHashMap;
}
