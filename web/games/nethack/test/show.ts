// Development: shows screens of a golden. node games/nethack/test/show.ts PATH.json.gz [run] [frame,frame,...|last|every:N]
import { loadGolden } from './golden.ts';
import { VT } from '../src/vt.ts';

const g = loadGolden(process.argv[2]);
const run = g.runs[Number(process.argv[3] ?? 0)];
const which = process.argv[4] ?? 'last';
const vt = new VT();
const n = run.frames.length;
const pick = (i: number) => which === 'last' ? i === n - 1 : which.startsWith('every:') ? i % Number(which.slice(6)) === 0
  : which.split(',').map(Number).includes(i);
run.frames.forEach((f, i) => {
  vt.feed(Uint8Array.from(f[3], (c) => c.charCodeAt(0)));
  if (pick(i)) console.log(`--- frame ${i} (key ${f[1]}, draws ${f[2]})\n${vt.text()}`);
});
console.log(`${n} frames, status ${run.status}`);
