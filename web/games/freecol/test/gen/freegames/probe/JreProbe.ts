// @ts-nocheck
// JreProbe.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
import { $J, ArrayList, Character, Collections, Collectors, Comparator, HashMap, HashSet, JObject, JString, LinkedHashMap, PriorityQueue, Random, StringBuilder, TreeMap } from '../../../../src/jre/index.ts';

/**
 * The runtime oracle: what the translated FreeCol code relies on from the Java library, exercised and
 * printed. The original prints this on the JVM (oracle/run.sh JreProbe); the test translates this same
 * file with j2ts and prints it in the port's runtime: the texts must be equal (test/jre.test.ts).
 * HashMap and HashSet orders (list and tree bins, resizing, removal), Random, float and double printing,
 * string hashes, integer and float arithmetic, sorting, shuffling, PriorityQueue, streams.
 */
export class JreProbe extends JObject {
  out: StringBuilder = null;
  _JreProbe(): this {
    this.out = new StringBuilder();
    return this;
  }
  p(s: string): void {
    this.out.append(s).append(String.fromCharCode(10 /* \u000a */));
  }
  static run(): string {
    let j = new JreProbe()._JreProbe();
    j.random();
    j.numbers();
    j.strings();
    j.hashMaps();
    j.treeBins();
    j.sets();
    j.queues();
    j.sorting();
    j.streams();
    return j.out.toString();
  }
  static main(args: string[]): void {
    $J.out.print(JreProbe.run());
  }
  random(): void {
    let r = new Random(42);
    let sb = new StringBuilder('random:');
    for (let i = 0; i < 5; i++) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextInt()));
    }
    for (let i = 0; i < 5; i++) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextInt(100)));
    }
    for (let i = 0; i < 5; i++) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextInt(7)));
    }
    for (let i = 0; i < 5; i++) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextInt(1 << 20)));
    }
    sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextInt(2147483647)));
    r.nextLong();
    sb.append(String.fromCharCode(32 /* ' ' */)).append($J.dstr(r.nextDouble()));
    sb.append(String.fromCharCode(32 /* ' ' */)).append($J.fstr(r.nextFloat()));
    sb.append(String.fromCharCode(32 /* ' ' */)).append(String(r.nextBoolean()));
    sb.append(String.fromCharCode(32 /* ' ' */)).append($J.dstr(r.nextGaussian()));
    sb.append(String.fromCharCode(32 /* ' ' */)).append($J.dstr(r.nextGaussian()));
    let xs = r.ints(8, 0, 10).toArray();
    for (let x of xs) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(x));
    }
    xs = r.ints(4, -5, 1000).toArray();
    for (let x of xs) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(x));
    }
    this.p(sb.toString());
    let s = new Random(-7);
    this.p('random(-7): ' + s.nextInt(1000) + ' ' + s.nextInt() + ' ' + new Random(123456789012).nextInt(50));
  }
  numbers(): void {
    let fs = [Math.fround(0.1), Math.fround(1.1), 2, Math.fround(-33), Math.fround(-12.5), 1E7, 9999999, Math.fround(0.001), Math.fround(9.9E-4), Math.fround(3.14159), Math.fround(1 / 3), Math.fround(2 / 3), 100.5, 0, Math.fround(-0), 1.6777216E7, Math.fround(1.4E-45), Math.fround(3.4028235E38), Math.fround(0.3), Math.fround(66.66)];
    let sb = new StringBuilder('floats:');
    for (let f of fs) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.fstr(f));
    }
    this.p(sb.toString());
    let ds = [0.1, 1 / 3, 2, 100.5, 1E21, 1E7, 9999999.999, 1.23456789E8, 0.001, 1E-4, -0, 1E-300, 4.9E-324, 1.7976931348623157E308, 0.1 + 0.2, 2 / 3, 66.66];
    sb = new StringBuilder('doubles:');
    for (let d of ds) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.dstr(d));
    }
    this.p(sb.toString());
    sb = new StringBuilder('int arithmetic:');
    let as$ = [7, -7, 2147483647, -2147483648, 0, 13];
    let bs = [2, -2, 3, -1, 5];
    for (let a of as$) {
      for (let b of bs) {
        sb.append(String.fromCharCode(32 /* ' ' */)).append(String($J.idiv(a, b))).append(String.fromCharCode(47 /* \u002f */)).append(String(a % b)).append(String.fromCharCode(47 /* \u002f */)).append(String(Math.imul(a, b))).append(String.fromCharCode(47 /* \u002f */)).append(String((a + b) | 0));
      }
    }
    this.p(sb.toString());
    sb = new StringBuilder('rounding:');
    let rs = [0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 0.49999999999999994, 1E10, -1E10, 2.6, -2.6];
    for (let d of rs) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String($J.round(d))).append(String.fromCharCode(47 /* \u002f */)).append(String($J.roundf(Math.fround(d)))).append(String.fromCharCode(47 /* \u002f */)).append(String($J.d2i(d))).append(String.fromCharCode(47 /* \u002f */)).append(String($J.d2i(Math.floor(d)))).append(String.fromCharCode(47 /* \u002f */)).append(String($J.d2l(d)));
    }
    this.p(sb.toString());
    let acc = 0;
    for (let i = 0; i < 100; i++) {
      acc = Math.fround(acc + Math.fround(Math.fround(Math.fround(0.1) * i) / 3));
    }
    let m = 1;
    for (let i = 1; i < 30; i++) {
      m = Math.fround(m * Math.fround(1.07));
    }
    this.p('float arithmetic: ' + $J.fstr(acc) + ' ' + $J.fstr(m) + ' ' + $J.fstr((Math.fround(acc / 7))) + ' ' + $J.d2i((Math.fround(acc * 1.5))) + ' ' + $J.fstr(Math.fround(Math.sqrt(acc))));
    this.p('hash of numbers: ' + $J.hashCode((-5)) + ' ' + $J.hashCode($J.boxD($J.boxD(2.5))) + ' ' + $J.Float_floatToIntBits(2.5) + ' ' + $J.hashCode($J.lshl(1, 40)) + ' ' + $J.hashCode(true));
    this.p('compare: ' + $J.dcmp(0, -0) + ' ' + $J.dcmp(NaN, 1) + ' ' + $J.icmp(3, -3));
    let od = $J.boxD(2);
    let of$ = $J.boxF(1.5);
    let dd = $J.boxD(0);
    let ld = new ArrayList();
    ld.add($J.boxD(3));
    ld.add($J.boxD(+dd + 1));
    let mf = new HashMap();
    $J.boxF(mf.put('x', $J.boxF(2)));
    let sum = 0;
    for (const $it0 = ld.iterator(); $it0.hasNext(); ) {
      let x = $it0.next();
      sum += x;
    }
    this.p('boxed: ' + $J.str(od) + ' ' + $J.str(of$) + ' ' + $J.str(dd) + ' ' + $J.str(ld) + ' ' + $J.str(mf) + ' ' + $J.dstr(sum) + ' ' + (+dd === 0) + ' ' + $J.str($J.boxD($J.boxD(4))) + ' ' + $J.equals(od, $J.boxD(2)) + ' ' + $J.hashCode(od));
    this.p('parse: ' + $J.parseInt('-123') + ' ' + $J.dstr($J.parseDouble('1.5e3')) + ' ' + $J.fstr(Math.fround($J.parseDouble('0.1'))) + ' ' + (255).toString(16));
  }
  strings(): void {
    let ss = ['', 'a', 'tile:1234', 'model.unit.freeColonist', 'Ä€ö ✓', 'AaAaAa', 'BBBBBB', 'player:19'];
    let sb = new StringBuilder('string hashes:');
    for (let s of ss) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String($J.hashCode(s)));
    }
    this.p(sb.toString());
    this.p('compareTo: ' + $J.compareTo('abc', 'abd') + ' ' + $J.compareTo('abc', 'ab') + ' ' + $J.compareTo('B', 'a') + ' ' + $J.compareTo('Ä', 'Z'));
    this.p('split: ' + JString.join('|', ...JString.split('a,b,,c,,', ',')) + ' / ' + JString.join('|', ...JString.split(JString.trim(' x  y z '), '\\s+')) + ' / ' + JString.split('a.b.c', '\\.').length + ' / ' + JString.join('|', ...JString.split('k=v=w', '=', 2)));
    this.p('format: ' + JString.format('%d %5d %-4s| %.2f %s %03d %x', 42, 7, 'ab', $J.boxD(3.14159), true, 5, 255));
    this.p('case: ' + 'Hello World'.toLowerCase() + ' ' + 'hello'.toUpperCase() + ' ' + JString.trim('  trim  ') + '|');
    this.p('replace: ' + JString.replaceChar('a.b.c', 46 /* '.' */, 47 /* \u002f */) + ' ' + JString.replace('aaa', 'aa', 'b') + ' ' + JString.replaceAll('x1y22z', '[0-9]+', '#'));
    this.p('chars: ' + String.fromCharCode((((97 /* 'a' */ + 2) | 0)) & 0xffff) + ' ' + 65 /* 'A' */ + ' ' + Character.isDigit(53 /* '5' */) + ' ' + String.fromCharCode(Character.toUpperCase(113 /* 'q' */)) + ' ' + String.fromCharCode('abc'.charCodeAt(1)));
  }
  static keys(m: JMap<string, number>): string {
    let sb = new StringBuilder();
    for (const $it1 = m.entrySet().iterator(); $it1.hasNext(); ) {
      let e = $it1.next();
      sb.append(e.getKey()).append(String.fromCharCode(61 /* '=' */)).append($J.str(e.getValue())).append(String.fromCharCode(32 /* ' ' */));
    }
    return JString.trim(sb.toString());
  }
  hashMaps(): void {
    let r = new Random(3);
    let m = new HashMap();
    for (let i = 0; i < 200; i++) {
      m.put('tile:' + r.nextInt(3000), i);
    }
    this.p('hashmap 200: ' + JreProbe.keys(m));
    for (let i = 0; i < 150; i++) {
      m.remove('tile:' + r.nextInt(3000));
    }
    let it = m.keySet().iterator();
    while (it.hasNext()) {
      if ($J.hashCode(it.next()) % 3 === 0) {
        it.remove();
      }
    }
    this.p('hashmap removed: ' + JreProbe.keys(m));
    for (let i = 0; i < 60; i++) {
      m.computeIfAbsent('unit:' + r.nextInt(500), (k) => k.length);
    }
    for (let i = 0; i < 60; i++) {
      m.merge('good:' + r.nextInt(20), 1, ($p0, $p1) => ($p0 + $p1));
    }
    m.putIfAbsent('unit:1', 99);
    m.compute('good:3', (k, v) => v == null ? -1 : Math.imul(v, 10));
    this.p('hashmap compute: ' + JreProbe.keys(m));
    let copy = new HashMap(m);
    this.p('hashmap copy: ' + JreProbe.keys(copy));
    let small = new HashMap(4);
    for (let i = 0; i < 30; i++) {
      small.put('k' + (Math.imul(i, 37) % 101), i);
    }
    this.p('hashmap(4): ' + JreProbe.keys(small));
    small.clear();
    for (let i = 0; i < 5; i++) {
      small.put('z' + i, i);
    }
    this.p('hashmap cleared: ' + JreProbe.keys(small));
    let lm = new LinkedHashMap();
    for (let i = 0; i < 20; i++) {
      lm.put('x' + r.nextInt(30), i);
    }
    lm.remove('x3');
    this.p('linkedhashmap: ' + JreProbe.keys(lm));
    let tm = new TreeMap(m);
    this.p('treemap: ' + tm.firstKey() + ' ' + tm.lastKey() + ' ' + tm.size());
    let groups = m.keySet().stream().collect(Collectors.groupingBy(($p0) => $p0.length));
    let sb = new StringBuilder('grouping:');
    for (const $it2 = groups.entrySet().iterator(); $it2.hasNext(); ) {
      let e = $it2.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(e.getKey())).append(String.fromCharCode(58 /* ':' */)).append(String(e.getValue().size()));
    }
    this.p(sb.toString());
  }
  /**
   * Keys with equal hash codes ("Aa" and "BB" hash alike) fill one bin: a tree in a table of 64 or more.
   */
  treeBins(): void {
    let same = new ArrayList();
    for (let i = 0; i < 64; i++) {
      let sb = new StringBuilder();
      for (let b = 0; b < 6; b++) {
        sb.append(((i >> b) & 1) === 0 ? 'Aa' : 'BB');
      }
      same.add(sb.toString());
    }
    let r = new Random(11);
    Collections.shuffle(same, r);
    let m = new HashMap();
    for (let i = 0; i < 70; i++) {
      m.put('f' + i, i);
    }
    for (let i = 0; i < 40; i++) {
      m.put(same.get(i), i);
    }
    this.p('tree bin: ' + JreProbe.keys(m));
    for (let i = 0; i < 40; i = (i + 3) | 0) {
      m.remove(same.get(i));
    }
    this.p('tree bin removed: ' + JreProbe.keys(m));
    for (let i = 70; i < 300; i++) {
      m.put('f' + i, i);
    }
    this.p('tree bin resized: ' + JreProbe.keys(m));
    for (let i = 1; i < 40; i = (i + 2) | 0) {
      m.remove(same.get(i));
    }
    this.p('tree bin untreeified: ' + JreProbe.keys(m));
    for (let i = 40; i < 64; i++) {
      m.computeIfAbsent(same.get(i), (k) => 7);
    }
    this.p('tree bin computed: ' + JreProbe.keys(m));
  }
  sets(): void {
    let r = new Random(5);
    let xs = new ArrayList();
    for (let i = 0; i < 40; i++) {
      xs.add('colony:' + r.nextInt(200));
    }
    let s = new HashSet(xs);
    this.p('hashset: ' + JString.join(' ', s));
    let t = new HashSet();
    for (const $it3 = xs.iterator(); $it3.hasNext(); ) {
      let x = $it3.next();
      t.add(x.toUpperCase());
    }
    t.removeIf((x) => x.endsWith('7'));
    this.p('hashset added: ' + JString.join(' ', t));
    let ints = new HashSet();
    for (let i = 0; i < 30; i++) {
      ints.add((r.nextInt(1000) - 300) | 0);
    }
    let sb = new StringBuilder('integer set:');
    for (const $it4 = ints.iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(String(i));
    }
    this.p(sb.toString());
  }
  queues(): void {
    let r = new Random(9);
    let q = new PriorityQueue(Comparator.thenComparing((Comparator.comparingInt((x) => x % 10)), Comparator.reverseOrder()));
    for (let i = 0; i < 25; i++) {
      q.add(r.nextInt(100));
    }
    q.remove($J.parseInt($J.str(q.toArray()[5])));
    let sb = new StringBuilder('priority queue:');
    for (const $it5 = q.iterator(); $it5.hasNext(); ) {
      let x = $it5.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(x));
    }
    sb.append(' /');
    while (!q.isEmpty()) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(q.poll()));
    }
    this.p(sb.toString());
  }
  sorting(): void {
    let r = new Random(13);
    let l = new ArrayList();
    for (let i = 0; i < 30; i++) {
      l.add(String.fromCharCode((((97 /* 'a' */ + r.nextInt(5)) | 0)) & 0xffff) + '' + i);
    }
    let byFirst = new ArrayList(l);
    byFirst.sort(Comparator.comparing((x) => x.charCodeAt(0)));
    this.p('stable sort: ' + JString.join(' ', byFirst));
    Collections.shuffle(l, new Random(1));
    this.p('shuffled: ' + JString.join(' ', l));
    Collections.sort(l);
    this.p('sorted: ' + JString.join(' ', l));
    Collections.reverse(l);
    this.p('max/min: ' + Collections.max(l) + ' ' + (Collections.min(l, Comparator.comparing(($p0) => $p0.length))));
  }
  streams(): void {
    let xs = new ArrayList();
    for (let i = 0; i < 20; i++) {
      xs.add((Math.imul(i, 7)) % 13);
    }
    this.p('streams: ' + $J.str(xs.stream().filter((x) => x > 3).map((x) => Math.imul(x, 2)).collect(Collectors.toList())) + ' ' + xs.stream().mapToInt(($p0) => (+$p0)).sum() + ' ' + xs.stream().distinct().count() + ' ' + xs.stream().max(Comparator.naturalOrder()).get() + ' ' + $J.str(xs.stream().sorted(Comparator.reverseOrder()).limit(3).collect(Collectors.toList())) + ' ' + xs.stream().map(($p0) => $J.str($p0)).collect(Collectors.joining(',', '[', ']')) + ' ' + $J.str(xs.stream().collect(Collectors.toSet())));
  }
}

$J.define(JreProbe, 'freegames.probe.JreProbe', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_JreProbe' } });
