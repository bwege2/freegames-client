// Development: runs the port with keys and shows the screens.
//   node games/nethack/test/play.ts [--seed N] [--login NAME] [--all] 'KEYS' [-- args]
// KEYS takes JavaScript escapes (\n, \x1b).
import { runOnce } from './harness.ts';
import { VT } from '../src/vt.ts';

let argv = process.argv.slice(2);
let seed = 1, login = 'tester', all = false;
while (argv[0]?.startsWith('--') && argv[0] !== '--') {
  if (argv[0] === '--seed') { seed = Number(argv[1]); argv = argv.slice(2); }
  else if (argv[0] === '--login') { login = argv[1]; argv = argv.slice(2); }
  else if (argv[0] === '--all') { all = true; argv = argv.slice(1); }
  else break;
}
const text = (argv[0] ?? '').replace(/\\(x[0-9a-fA-F]{2}|n|r|e|\\)/g, (_m, e: string) =>
  e[0] === 'x' ? String.fromCharCode(parseInt(e.slice(1), 16)) : e === 'n' ? '\n' : e === 'r' ? '\r' : e === 'e' ? '\x1b' : '\\');
const keys = new Uint8Array([...text].map((c) => c.charCodeAt(0)));
const args = argv[1] === '--' ? argv.slice(2) : [];
const r = await runOnce({ keys, args, seed, login });
const vt = new VT();
for (const f of r.frames) {
  vt.feed(f.bytes);
  if (all) {
    console.log(`--- ${f.kind} key ${f.key} rng ${f.rng} cursor ${vt.y},${vt.x}`);
    console.log(vt.text().trimEnd());
  }
}
if (!all) console.log(vt.text());
console.log(`status ${r.status}, ${r.frames.length} frames${r.stderr ? ', stderr: ' + r.stderr : ''}`);
