// Development: the files a run of a session leaves, port and original.
//   node games/nethack/test/files.ts PATH.json.gz [run]
import { loadGolden } from './golden.ts';
import { installation, runOnce } from './harness.ts';

const g = loadGolden(process.argv[2]);
const upto = Number(process.argv[3] ?? 0);
let files = new Map<string, Uint8Array>();
const inst = installation();
for (let r = 0; r <= upto; r++) {
  const run = g.runs[r];
  const res = await runOnce({ keys: Uint8Array.from(run.keys, (c) => c.charCodeAt(0)), args: run.args, seed: g.seed, login: g.login, time: g.time, files });
  files = new Map([...res.files].filter(([k, v]) => !inst.has(k) || inst.get(k)!.length !== v.length || inst.get(k)!.some((x, i) => x !== v[i])));
  if (r === upto) {
    console.log('port:', [...files].map(([k, v]) => `${k} ${v.length}`).join(', '));
    console.log('orig:', Object.entries(run.files).map(([k, v]) => `${k} ${Buffer.from(v, 'base64').length}`).join(', '));
  }
}
