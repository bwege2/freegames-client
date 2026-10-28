// node games/frozenbubble/test/run-port.ts <session.txt> <trace.out>: the port's traces (trace.out and
// trace.out.state), as re/frozenbubble/oracle/run.sh writes the original's.
import { writeFileSync } from 'node:fs';
import { runPort } from './harness.ts';

const [session, out] = process.argv.slice(2);
const r = await runPort(session, { mutate: process.env.FB_MUTATE ? (g) => { g.TIME_HURRY_MAX += 1; } : undefined });
writeFileSync(out, `${r.trace.join('\n')}\n`);
writeFileSync(`${out}.state`, r.state.length ? `${r.state.join('\n')}\n` : '');
