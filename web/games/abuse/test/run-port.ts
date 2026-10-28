// node games/abuse/test/run-port.ts <session> <trace out> [seed]: the port's trace of a session, as
// re/abuse/oracle/run.sh writes the oracle's (one process per session: the program's state is global)
import { writeFileSync } from 'node:fs';
import { runPort } from './harness.ts';

const [session, out, seed] = process.argv.slice(2);
const r = await runPort(session, seed ? parseInt(seed, 10) : 1);
writeFileSync(out, r.lines.join('\n') + '\n');
