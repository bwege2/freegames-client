// Runs one session with the port and prints its trace (harness.ts):
//   node run-port.ts <session> [config-out] [--mutate=side-attack]
import { readFileSync, writeFileSync } from 'node:fs';
import { mutation } from '../src/lw/core.ts';
import { runPort } from './harness.ts';

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
if (args.includes('--mutate=side-attack')) mutation.sideAttackFactor = 0;
const r = await runPort(readFileSync(files[0]!, 'latin1'));
process.stdout.write(r.trace.join('\n') + '\n');
if (files[1]) writeFileSync(files[1], r.config);
