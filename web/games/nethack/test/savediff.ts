// Development: compares a file the port leaves with the original's (the first differing bytes).
//   node games/nethack/test/savediff.ts PATH.json.gz RUN FILE [from]
import { loadGolden } from './golden.ts';
import { installation, runOnce } from './harness.ts';

const g = loadGolden(process.argv[2]);
const upto = Number(process.argv[3]);
const name = process.argv[4];
let files = new Map<string, Uint8Array>();
const inst = installation();
let mine: Uint8Array | undefined;
for (let r = 0; r <= upto; r++) {
  const run = g.runs[r];
  const res = await runOnce({ keys: Uint8Array.from(run.keys, (c) => c.charCodeAt(0)), args: run.args, seed: g.seed, login: g.login, time: g.time, files });
  files = new Map([...res.files].filter(([k, v]) => !inst.has(k) || inst.get(k)!.length !== v.length || inst.get(k)!.some((x, i) => x !== v[i])));
  mine = files.get(name);
}
const orig = new Uint8Array(Buffer.from(g.runs[upto].files[name], 'base64'));
const a = mine!;
console.log(`port ${a.length} bytes, original ${orig.length}`);
let i = Number(process.argv[5] ?? 0);
while (i < a.length && i < orig.length && a[i] === orig[i]) i++;
const hex = (b: Uint8Array, from: number) => Array.from(b.slice(from, from + 48), (x) => x.toString(16).padStart(2, '0')).join(' ');
console.log(`first difference at ${i}`);
console.log(`port: ${hex(a, Math.max(0, i - 16))}`);
console.log(`orig: ${hex(orig, Math.max(0, i - 16))}`);
