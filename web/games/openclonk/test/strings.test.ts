// The string runtime (src/rt/StdBuf.ts, printf.ts) against the original's StdStrBuf, FormatString (glibc's
// vasprintf) and WildcardMatch, run by the oracle (re/openclonk/oracle/harness.cpp, string commands).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inputs, oracleMissing, runOracle } from './oracle.ts';
import { FormatString, StdStrBuf, WildcardMatch } from '../src/rt/StdBuf.ts';

const missing = oracleMissing();
const skip = missing ? `the oracle is missing: ${missing}` : false;

const hex = (b: Uint8Array | string) => Buffer.from(typeof b === 'string' ? Buffer.from(b, 'utf8') : b).toString('hex');
const unhex = (h: string) => new Uint8Array(Buffer.from(h, 'hex'));
const out = (b: StdStrBuf) => (b.isNull() ? '-' : hex(b.getData()!));

function commands(): string[] {
  const g = inputs(4242);
  const c: string[] = [];
  const word = (alpha: string, max: number) => { let s = ''; const n = g.int(0, max); for (let i = 0; i < n; i++) s += alpha[g.int(0, alpha.length - 1)]; return s; };
  const bytes = (max: number) => { const n = g.int(0, max); const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = g.int(1, 255); return b; };
  const ifmt = ['%d', '%5d', '%-5d|', '%05d', '%+d', '% d', '%x', '%X', '%#x', '%o', '%#o', '%u', '%.3d', '%8.3d', '%.0d', '%hd', '%hhd', '%i', 'a%db%dc'.slice(0, 4), '%%%d%%'];
  const ints = () => g.pick([0, 1, -1, 7, -42, 255, 65536, 2147483647, -2147483648, g.i32(), g.int(-1000, 1000)]);
  for (let i = 0; i < 300; i++) c.push(`fmti\t${hex(g.pick(ifmt))}\t${ints()}`);
  for (let i = 0; i < 60; i++) c.push(`fmti\t${hex(g.pick(['%c', '[%c]', '%3c', '%-3c|']))}\t${g.int(32, 126)}`);
  const lfmt = ['%lld', '%llu', '%llx', '%20lld', '%-20llX|', '%ld', '%lu', '%zu'];
  for (let i = 0; i < 100; i++) c.push(`fmtl\t${hex(g.pick(lfmt))}\t${g.pick([0n, 1n, (1n << 63n), (1n << 64n) - 1n, g.u64()])}`);
  const dfmt = ['%f', '%.0f', '%.1f', '%.2f', '%.10f', '%e', '%.3e', '%E', '%g', '%.3g', '%.10g', '%G', '%#g', '%10.4f', '%-10.2f|',
    '%+.3e', '%010.3f', '% g', '%.0e', '%#.0f', '%.17g', '%.0g', '%#.3g', '%.20f', '%12.5g'];
  const bitsOf = (x: number) => { const v = new DataView(new ArrayBuffer(8)); v.setFloat64(0, x); return v.getBigUint64(0); };
  const dbl = () => g.pick([
    () => bitsOf(g.pick([0, -0, 0.5, 1.5, 2.5, -2.5, 0.125, 0.375, 1e21, 1e22, 1e-5, 123456789, 9.9999995, 0.000123456, 1 / 3, 2 / 3,
      100, 1e100, -1e-300, 5e-324, 1.7976931348623157e308, 0.05, 0.15, 0.25, 999999.5, 99999.95, Infinity, -Infinity, NaN])),
    () => bitsOf((g.i32() / 65536)),
    () => bitsOf(g.int(-1000000, 1000000) / g.pick([1, 10, 100, 1000, 7, 3])),
    () => g.u64(),
  ])();
  for (let i = 0; i < 1500; i++) c.push(`fmtd\t${hex(g.pick(dfmt))}\t${dbl()}`);
  const sfmt = ['%s', '%10s', '%-10s|', '%.3s', '%5.2s', '<%s>'];
  for (let i = 0; i < 100; i++) c.push(`fmts\t${hex(g.pick(sfmt))}\t${hex(g.pick([word('abcXYZ 09', 12), 'Objects.ocd', 'Ä€x']))}`);
  const names = ['Objects.ocd', 'Clonk.ocd', 'DefCore.txt', 'Graphics.png', 'Script.c', 'StringTblDE.txt', 'Overlay.png', 'a', '', 'Material.ocg', '[x].txt', 'ÄÖÜ.c'];
  const wilds = ['*.ocd', '*', 'a?c', '[a-c]*', '*[x]*', 'Obj*.oc?', '*.*', 'string*de.txt', '*.[ct]*', '[]]*', '?', '', '*a*b*', 'Graphics*.png', '[Ä]*', '*[.]txt'];
  for (let i = 0; i < 400; i++) c.push(`wild\t${hex(g.pick(wilds))}\t${hex(g.pick([...names, word('abcx.[]*?', 8)]))}`);
  const alpha = 'ab, \t.xy';
  for (let i = 0; i < 300; i++) {
    const s = word(alpha, 16);
    c.push(`replace\t${hex(s)}\t${hex(g.pick(['a', 'ab', 'aa', ',', 'x', 'b ', 'bb']))}\t${hex(g.pick(['', 'b', 'ZZ', 'abc', '!']))}\t${g.int(0, Math.min(3, s.length))}`);
    c.push(`rchar\t${hex(s)}\t${g.pick([97, 98, 44, 32, 0])}\t${g.pick([65, 0, 95])}`);
    const p = g.int(0, s.length);
    c.push(`endrep\t${hex(s)}\t${p}\t${hex(word('XY', 4))}`);
    c.push(`section\t${hex(s)}\t${g.int(0, 4)}\t${g.pick([44, 32, 46])}`);
    c.push(`trim\t${hex(word(' \t\n\v\f\rab', 10))}`);
    c.push(`lower\t${hex(word('ABCxyz09ÄÖ', 10))}`);
    c.push(`hash\t${hex(g.pick([s, word('abcdefghij', 20)]))}`);
    c.push(`unicode\t${hex(bytes(12))}`);
    c.push(`unicode\t${hex(word('aÄ€ö', 6))}`);
  }
  return c;
}

function answer(line: string): string {
  const f = line.split('\t');
  const S = (i: number) => unhex(f[i]);
  const buf = (i: number) => { const b = new StdStrBuf(); b.Copy(S(i)); return b; };
  switch (f[0]) {
    case 'fmti': return out(FormatString(S(1), Number(f[2])));
    case 'fmtl': return out(FormatString(S(1), BigInt.asIntN(64, BigInt(f[2]))));
    case 'fmtd': { const v = new DataView(new ArrayBuffer(8)); v.setBigUint64(0, BigInt(f[2])); return out(FormatString(S(1), v.getFloat64(0))); }
    case 'fmts': return out(FormatString(S(1), S(2)));
    case 'wild': return WildcardMatch(S(1), S(2)) ? '1' : '0';
    case 'replace': { const b = buf(1); const n = b.Replace(S(2), S(3), Number(f[4])); return `${n}\t${out(b)}`; }
    case 'rchar': { const b = buf(1); const n = b.ReplaceChar(Number(f[2]), Number(f[3])); return `${n}\t${out(b)}`; }
    case 'endrep': { const b = buf(1); b.ReplaceEnd(Number(f[2]), S(3)); return out(b); }
    case 'section': { const b = buf(1), o = new StdStrBuf(); const ok = b.GetSection(Number(f[2]), o, Number(f[3])); return `${ok ? 1 : 0}\t${out(o)}`; }
    case 'trim': { const b = buf(1); const ch = b.TrimSpaces(); return `${ch ? 1 : 0}\t${out(b)}`; }
    case 'lower': { const b = buf(1); b.ToLowerCase(); return out(b); }
    case 'unicode': { const b = buf(1); const ch = b.EnsureUnicode(); return `${ch ? 1 : 0}\t${out(b)}`; }
    case 'hash': return String(buf(1).GetHash());
    default: return '?';
  }
}

test('strings, printf and wildcards are the original\'s', { skip }, () => {
  const cmds = commands();
  const theirs = runOracle(cmds);
  const bad: string[] = [];
  for (let i = 0; i < cmds.length; i++) {
    let mine: string;
    try { mine = answer(cmds[i]); } catch (e) { mine = `error ${(e as Error).message}`; }
    if (mine !== theirs[i]) {
      const f = cmds[i].split('\t').map((x, k) => (k && /^[0-9a-f]+$/.test(x) && x.length % 2 === 0 && x.length > 0 && !/^\d+$/.test(x) ? JSON.stringify(Buffer.from(x, 'hex').toString('latin1')) : x));
      bad.push(`${f.join(' ')}: port ${mine}, original ${theirs[i]}`);
    }
  }
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} of ${cmds.length} answers differ`);
});

test('StdStrBuf basics', () => {
  const b = new StdStrBuf();
  assert.ok(b.isNull());
  b.Append('abc');
  b.AppendChar(0x64);
  b.AppendFormat('%d-%s', 5, 'x');
  assert.equal(b.toString(), 'abcd5-x');
  assert.equal(b.getLength(), 7);
  assert.equal(b.getSize(), 8);
  const part = new StdStrBuf();
  assert.ok(b.SplitAtChar(0x35, part));
  assert.equal(b.toString(), 'abcd');
  assert.equal(part.toString(), '-x');
  assert.ok(new StdStrBuf('ab').op_lt(new StdStrBuf('abc')));
  assert.ok(new StdStrBuf('zz').op_lt(new StdStrBuf('abc')), 'shorter first');
  assert.ok(new StdStrBuf('abc').op_eq('abc'));
});
