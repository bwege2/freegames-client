// Debugging aid: runs one script (or golden file) on the port and prints the oracle-format lines.
//   node games/ballerburg/test/run-script.ts <script or golden> [trace file]
// With ORACLE_TRACE=<file>, the oracle writes the same trace for the original; diff the two.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseScript, run } from './harness.ts';

const [file, traceFile] = process.argv.slice(2);
const { seed, events } = parseScript(readFileSync(file, 'utf8'));
const trace: string[] | undefined = traceFile ? [] : undefined;
const r = await run(seed, events, { trace });
console.log(r.lines.join('\n'));
if (traceFile) writeFileSync(traceFile, trace!.join('\n') + '\n');
