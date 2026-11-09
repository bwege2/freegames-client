// The runtime's longs (BigInts) and java.util.Random against Java: the expressions are written as the
// translator emits them (re/shatteredpixeldungeon/NOTES.md, "The translator: longs as BigInt"); the expected
// text is what the same Java expressions print on the JVM (JDK 21, a probe program, NOTES.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { $J, Random, JSONObject, JSONArray, JSONTokener } from '../src/jre/index.ts';

const JAVA = `0 0 0 0 0 0.0 0.0 7 0 0 0 0 0 0 0 -1
1 0 0 8192 1 1.0 1.0 38 0 1 1 1 -1 1 -1 -2
-1 144115188075855871 -1 -8192 -1 -1.0 -1.0 -24 0 -1 0 6 0 1 1 0
9007199254740993 70368744177664 0 8192 1 9.007199E15 9.007199254740992E15 279223176896970790 3002399751580331 993 2097153 5 -1801439850948199 9007199254740993 -9007199254740993 -9007199254740994
-8070450532247928832 81064793292668928 -1 0 0 -8.0704505E18 -8.070450532247929E18 8070450532247928839 -2690150177415976277 -832 -1879048192 0 1614090106449585766 8070450532247928832 8070450532247928832 8070450532247928831
9223372036854775807 72057594037927935 0 -8192 -1 9.223372E18 9.223372036854776E18 9223372036854775784 3074457345618258602 807 -2147483648 0 -1844674407370955162 9223372036854775807 -9223372036854775807 -9223372036854775808
-9223372036854775808 72057594037927936 -1 0 0 -9.223372E18 -9.223372036854776E18 -9223372036854775801 -3074457345618258602 -808 -2147483648 6 1844674407370955161 -9223372036854775808 -9223372036854775808 9223372036854775807
5429503678975 42417997491 0 44478494138163200 665016831 5.4295035E12 5.429503678975E12 168314614048232 1809834559658 975 665017615 5 -1085900735795 5429503678975 -5429503678975 -5429503678976
-4962768465676381896 1033096058 447 0.6374174 0.3090505681997092 -0.3624283173079059 false
3 -2 0 9223372036854775807 -9223372036854775808 0
9223372036854775807 -9223372036854775808 0 3 -3
-9223372036854775808 ppppppppp 78364164095
`;

test('long arithmetic, conversions and Random as Java computes them', () => {
  const xs = [0n, 1n, -1n, 9007199254740993n, -8070450532247928832n, 9223372036854775807n, -9223372036854775808n, 5429503678975n];
  let s = '';
  for (const x of xs) {
    s += [x, $J.lushr(x, 7), $J.lshr(x, 63), $J.lshl(x, 13), $J.l2i(x), $J.fstr($J.l2f(x)), $J.dstr(Number(x)),
      BigInt.asIntN(64, BigInt.asIntN(64, x * 31n) + 7n), $J.ldiv(x, 3n), $J.lrem(x, 1000n), $J.Long_hashCode(x),
      $J.lfloorMod(x, 7n), $J.lfloorDiv(x, -5n), $J.labs(x), BigInt.asIntN(64, -x), ~x].join(' ') + '\n';
  }
  const r = new Random(-8070450532247928832n);
  s += [r.nextLong(), r.nextInt(), r.nextInt(1000), $J.fstr(r.nextFloat()), $J.dstr(r.nextDouble()), $J.dstr(r.nextGaussian()), r.nextBoolean()].join(' ') + '\n';
  s += [$J.lround(2.5), $J.lround(-2.5), $J.lround(0.49999999999999994), $J.lround(1e19), $J.lround(-1e19), $J.lround(NaN)].join(' ') + '\n';
  s += [$J.d2l(1e19), $J.d2l(-1e19), $J.d2l(NaN), $J.d2l(3.99), $J.d2l(Math.fround(-3.99))].join(' ') + '\n';
  s += [$J.parseLong('-9223372036854775808'), (5429503678975n).toString(26), $J.parseLong('zzzzzzz', 36)].join(' ') + '\n';
  assert.equal(s, JAVA);
  assert.throws(() => $J.ldiv(1n, 0n), /by zero/);
  assert.throws(() => $J.lrem(1n, 0n), /by zero/);
  assert.throws(() => $J.parseLong('9223372036854775808'));
  assert.equal($J.hashCode(5n), 5);
  assert.equal($J.str(-5n), '-5');
  assert.ok($J.isa(5n, $J.load('java.lang.Long')) && !$J.isa(5, $J.load('java.lang.Long')));
});

// org.json 20170516 on the JVM (the probe of NOTES.md, "org.json"): the same puts, the same text
test('org.json: key order, numbers and string escapes as org.json writes them', () => {
  const o = new JSONObject();
  o.put('i', 5); o.put('neg', -7); o.put('l', 9007199254740993n); o.put('lmin', -9223372036854775808n);
  o.put('f01', $J.boxD(Math.fround(0.1))); o.put('one', $J.boxD(1)); o.put('f1', $J.boxD(Math.fround(1))); o.put('big', $J.boxD(1e21));
  o.put('fmax', $J.boxD(3.4028234663852886e38)); o.put('small', $J.boxD(1e-5)); o.put('nz', $J.boxD(-0)); o.put('half', $J.boxD(0.5));
  o.put('e7', $J.boxD(1e7)); o.put('e6', $J.boxD(123456)); o.put('dbl', $J.boxD(1234567.125)); o.put('b', true);
  o.put('s', 'a"b\\c/d</e f\u0001g\n\t\r\b\f\u007f\u0080ÿ ⃿℀ h');
  o.put('cls', $J.cls($J.load('java.lang.String')));
  o.put('arr', new JSONArray());
  o.put('float obj', $J.boxF(0.1));
  o.put('int obj', 3);
  assert.equal(o.toString(), '{"small":1.0E-5,"arr":[],"big":1.0E21,"b":true,"half":0.5,"f01":0.10000000149011612,"one":1,"i":5,"f1":1,'
    + '"cls":"class java.lang.String","l":9007199254740993,"nz":-0,"fmax":3.4028234663852886E38,"dbl":1234567.125,"int obj":3,"neg":-7,'
    + '"e6":123456,"e7":1.0E7,"s":"a\\"b\\\\c/d<\\/e\\u2028f\\u0001g\\n\\t\\r\\b\\f\u007f\\u0080ÿ\\u2000\\u20ff℀ h",'
    + '"lmin":-9223372036854775808,"float obj":0.1}');
  assert.throws(() => new JSONObject().put('x', $J.boxD(NaN)), /non-finite/);
  const a = new JSONArray();
  a.put(0, 1); a.put(3, $J.boxD(2.5)); a.put(1, 7n); a.put(5, true); a.put(6, 's'); a.put(7, $J.boxD(3));
  assert.equal(a.toString(), '[1,7,null,2.5,null,true,"s",3]');
  const g = new JSONObject('{"si":"123","sd":"1.5","d":1.5,"big":12345678901,"huge":9223372036854775808,"st":"TRUE","n":null,"e":1e5}');
  assert.equal(g.getInt('si'), 123); assert.equal(g.optInt('sd'), 0); assert.equal(g.getInt('d'), 1);
  assert.equal(g.getInt('big'), -539222987); assert.equal(g.getLong('big'), 12345678901n); assert.equal(g.optLong('huge'), 0n);
  assert.equal(g.getString('huge'), '9223372036854775808'); assert.equal(g.getBoolean('st'), true); assert.equal(g.optString('e'), '100000.0');
  assert.equal(g.optString('n'), ''); assert.equal(g.isNull('n'), true); assert.equal(g.isNull('missing'), true);
  assert.throws(() => g.getString('d'), /JSONObject\["d"\] not a string\./);
  assert.equal(new JSONTokener('[1,,2]').nextValue().toString(), '[1,null,2]');
  assert.equal(new JSONTokener('{a:1;"b":-0}').nextValue().toString(), '{"a":1,"b":-0}');
  assert.equal(new JSONTokener('007').nextValue(), '007');
});
