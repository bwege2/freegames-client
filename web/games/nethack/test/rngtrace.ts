// Development (re/nethack/oracle/rngtrace.py runs it): the callers of every draw from the random
// generators in one run of a session, one line per draw.
//   node games/nethack/test/rngtrace.ts SESSION.txt RUNINDEX OUTFILE
import { writeFileSync } from 'node:fs';
import { runOnce } from './harness.ts';
import { parseSession } from './session.ts';

const [path, idxs, outPath] = process.argv.slice(2);
const sess = parseSession(path);
const idx = Number(idxs);
const SKIP = new Set(['onDraw', 'rngDraw', 'next', 'RND', 'rn2', 'rnd', 'rn1', 'd', 'rnl', 'rne', 'rnz', 'rn2_on_display_rng', 'runOnce', 'Object.rngDraw']);
let files = new Map<string, Uint8Array>();
for (let i = 0; i < idx; i++) {
  const r = await runOnce({ keys: sess.runs[i].keys, args: sess.runs[i].args, seed: sess.seed, login: sess.login, time: sess.time, files });
  files = r.files;
}
Error.stackTraceLimit = 30;
const lines: string[] = [];
const r = sess.runs[idx];
await runOnce({
  keys: r.keys, args: r.args, seed: sess.seed, login: sess.login, time: sess.time, files,
  onDraw() {
    const st = new Error().stack!.split('\n').slice(1);
    const frames = st.map((l) => {
      const m = /at (?:async )?([\w$.]+)(?: \[as [^\]]*\])? \(.*\/([\w.]+\.ts):(\d+)/.exec(l);
      return m ? { name: m[1].replace(/^.*\./, ''), where: `${m[2]}:${m[3]}` } : { name: '?', where: '' };
    }).filter((f) => !SKIP.has(f.name));
    lines.push(frames.slice(0, 6).map((f, i) => (i === 0 ? `${f.name}@${f.where}` : f.name)).join(' < '));
  },
});
writeFileSync(outPath, lines.join('\n') + '\n');
