// Debugging aid (not a test): runs the port with every draw of rand_range() written to standard error as
// the oracle's trace build writes it (re/brogue/oracle/build.sh, TRACE=1): "R lower upper result rng".
// It runs a copy of src/ whose Math.ts writes the trace, so the port itself stays as translated. With
// TRACE_STACK=n it also writes the JavaScript stack at the n-th draw (counting all draws, from 1).
//   node test/rngtrace.ts [events file] -- <command line>      e.g. node test/rngtrace.ts -- --print-seed-catalog 1 1 1
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const here = import.meta.dirname;
const tmp = mkdtempSync(join(tmpdir(), 'brogue-trace-'));
cpSync(join(here, '..', 'src'), join(tmp, 'src'), { recursive: true });
cpSync(join(here, 'harness.ts'), join(tmp, 'test', 'harness.ts'));
const math = join(tmp, 'src', 'game', 'Math.ts');
const old = '  return lowerBound + range(interval, G.rogue.RNG);\n}';
const src = readFileSync(math, 'utf8');
if (!src.includes(old)) throw new Error('Math.ts: rand_range not as expected');
writeFileSync(math, src.replace(old,
  '  const r_ = lowerBound + range(interval, G.rogue.RNG);\n  process.stderr.write(`R ${lowerBound} ${upperBound} ${r_} ${G.rogue.RNG}\\n`);\n' +
  '  if (++globalThis.$draws === Number(process.env.TRACE_STACK)) process.stderr.write(new Error().stack + "\\n");\n  return r_;\n}'));
(globalThis as any).$draws = 0;
const argv = process.argv.slice(2);
const dash = argv.indexOf('--');
const eventsFile = dash > 0 ? argv[0] : null;
const args = dash >= 0 ? argv.slice(dash + 1) : argv;
const { parseEvents, runSession } = await import(join(tmp, 'test', 'harness.ts'));
const r = await runSession(args, eventsFile ? parseEvents(readFileSync(eventsFile, 'utf8')) : []);
process.stdout.write(r.stdout);
console.error(`status ${r.status}`);
