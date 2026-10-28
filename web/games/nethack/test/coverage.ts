// Development: what the goldens show (deepest level, the messages seen, how the runs ended).
//   node games/nethack/test/coverage.ts [golden ...]
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadGolden } from './golden.ts';
import { VT } from '../src/vt.ts';

const dir = join(import.meta.dirname, 'golden');
const names = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).filter((f) => f.endsWith('.json.gz'));
const allMsgs = new Map<string, number>();
for (const f of names) {
  const g = loadGolden(f.includes('/') ? f : join(dir, f));
  let deepest = 0, frames = 0;
  const ends: string[] = [];
  for (const run of g.runs) {
    const vt = new VT();
    for (const fr of run.frames) {
      vt.feed(Uint8Array.from(fr[3], (c) => c.charCodeAt(0)));
      const t = vt.lines();
      const m = /Dlvl:(\d+)/.exec(t[23] ?? '');
      if (m) deepest = Math.max(deepest, Number(m[1]));
      const msg = t[0].replace(/--More--/, '').trim();
      if (msg) for (const s of msg.split(/(?<=[.!?])\s+/)) allMsgs.set(s.replace(/\d+/g, '#'), (allMsgs.get(s) ?? 0) + 1);
      frames++;
    }
    const last = vt.lines().join(' ');
    ends.push(/killed by|died|quit|escaped|ascended|Be seeing you/.exec(last)?.[0] ?? String(run.status));
  }
  console.log(`${f}: ${frames} frames, deepest Dlvl ${deepest}, ends: ${ends.join(', ')}`);
}
console.log(`${allMsgs.size} different messages`);
if (process.env.MSGS) for (const [m, n] of [...allMsgs].sort()) console.log(`${n}\t${m}`);
