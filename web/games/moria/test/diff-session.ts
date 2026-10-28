// Runs one golden through the port and prints the first screen that differs from the original's, per
// run (a tool for finding where the port goes wrong; the test is sessions.test.ts).
//   node games/moria/test/diff-session.ts games/moria/test/golden/create.json [run]
import { base64, firstDifference, loadGolden, runOnce } from './harness.ts';

const [path, only] = process.argv.slice(2);
const g = loadGolden(path);
let files = new Map<string, Uint8Array>();
let failed = false;
for (let i = 0; i < g.runs.length; i++) {
  const run = g.runs[i];
  const start = new Map(files);
  start.set('scores.dat', files.get('scores.dat') ?? new Uint8Array(0));
  let r;
  try {
    r = await runOnce(run.args, run.keys, start, g.time, g.login);
  } catch (e) {
    console.log(`run ${i}: the port threw after ${'?'} screens`);
    console.log(e);
    failed = true;
    break;
  }
  files = r.files;
  if (only !== undefined && Number(only) !== i) continue;
  const d = firstDifference(run, r.screens);
  if (d) {
    failed = true;
    console.log(`run ${i} (${run.args.join(' ')}): ${d}`);
  } else {
    const fileDiffs = Object.entries(run.files).filter(([n, b]) => base64(r.files.get(n) ?? new Uint8Array(0)) !== b).map(([n]) => n);
    console.log(`run ${i}: ${r.screens.length} screens the same` + (fileDiffs.length ? `; files differ: ${fileDiffs.join(', ')}` : ', files the same'));
    if (fileDiffs.length) failed = true;
  }
}
process.exit(failed ? 1 : 0);
