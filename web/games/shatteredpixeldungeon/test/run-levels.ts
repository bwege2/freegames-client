// Prints what the oracle prints, from the port: node games/shatteredpixeldungeon/test/run-levels.ts SEED CLASS DEPTHS [CLOCK_MS]
// (the oracle: re/shatteredpixeldungeon/oracle/run.sh levels SEED CLASS DEPTHS).
import { bootPort } from './harness.ts';

const [seed, cls, depths, clock] = process.argv.slice(2);
const port = await bootPort(clock ? Number(clock) : Date.now());
const t0 = performance.now();
const out = port.Oracle.levels(BigInt(seed), Number(cls), Number(depths));
process.stdout.write(out);
process.stderr.write(`${depths} levels in ${((performance.now() - t0) / 1000).toFixed(1)} s\n`);
