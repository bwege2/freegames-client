// node games/abuse/test/run-online.ts <session> <trace out> <seat> <names,comma separated> <seed>: one
// client of an online round (a child process of online.test.ts, which relays the room's messages)
import { writeFileSync } from 'node:fs';
import { runPort } from './harness.ts';
import type { NetToWorker } from '../src/online.ts';

const [session, out, seat, names, seed] = process.argv.slice(2);
let listener: ((m: NetToWorker) => void) | null = null;
process.on('message', (m: { t: 'msg'; from: number; data: number[] }) => {
  listener?.({ t: 'msg', from: m.from, data: Uint8Array.from(m.data) });
});
const r = await runPort(session, 1, {
  online: {
    cfg: { seat: +seat, names: names.split(','), seed: +seed, levelSize: 2, kills: 25, gameName: 'test' },
    post: (m) => { if (m.t === 'send') process.send!({ to: m.to, data: [...m.data] }); },
    listen: (f) => { listener = f; },
  },
});
writeFileSync(out, r.lines.join('\n') + '\n');
process.exit(0);
