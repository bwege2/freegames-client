// Prints what the gameplay oracle prints, from the port:
//   node games/shatteredpixeldungeon/test/run-play.ts SEED CLASS SCRIPT|@SCRIPTFILE [CLOCK_MS]
// (the oracle: re/shatteredpixeldungeon/oracle/run.sh play SEED CLASS SCRIPT|@SCRIPTFILE). play.test.ts runs
// it once per transcript, as a new process each time (the game's state is static).
import fs from 'node:fs';
import { playPort } from './harness.ts';

const [seed, cls, scriptArg, clock] = process.argv.slice(2);
const script = scriptArg.startsWith('@') ? fs.readFileSync(scriptArg.substring(1), 'utf8') : scriptArg;
const t0 = performance.now();
// SPD_MUTATE=NAME changes a rule first (harness.ts, mutate: the mutation checks of play.test.ts)
const out = await playPort(clock ? Number(clock) : Date.now(), BigInt(seed), Number(cls), script, process.env.SPD_MUTATE || undefined);
process.stdout.write(out);
process.stderr.write(`played in ${((performance.now() - t0) / 1000).toFixed(1)} s\n`);
