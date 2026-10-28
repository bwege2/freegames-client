// Development tool: runs one pMARS command line in the oracle (re/corewar/oracle/pmars-oracle, built
// by build.sh) and in the port, and shows where they differ.
//   node games/corewar/test/compare.ts [--time n] [--cycles n] [--input file] -- <pmars arguments>
// Warrior paths are relative to web/games/corewar/test/warriors (or absolute).
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from './record.ts';

const here = import.meta.dirname;
const oracle = join(here, '..', '..', '..', '..', 're', 'corewar', 'oracle', 'pmars-oracle');
const args = process.argv.slice(2);
let time = 0, cycles = -1, input: string[] = [];
while (args.length && args[0] !== '--') {
  const o = args.shift()!;
  if (o === '--time') time = Number(args.shift());
  else if (o === '--cycles') cycles = Number(args.shift());
  else if (o === '--input') input = readFileSync(args.shift()!, 'latin1').match(/[^\n]*\n|[^\n]+$/g) ?? [];
}
args.shift();
const cwd = join(here, 'warriors');
const tmp = mkdtempSync(join(tmpdir(), 'cw-'));
const env = { ...process.env, PMARS_TIME: String(time), PMARS_TRACE: join(tmp, 't'), PMARS_WIN: join(tmp, 'w'), PMARS_CYCLES: String(cycles) };
const o = spawnSync(oracle, args, { cwd, env, input: input.join(''), encoding: 'latin1', maxBuffer: 1 << 30 });
const want = {
  stdout: o.stdout, stderr: o.stderr, status: o.status ?? -1,
  trace: (existsSync(join(tmp, 't')) ? readFileSync(join(tmp, 't'), 'latin1') : '').split('\n').filter((l) => l),
  win: existsSync(join(tmp, 'w')) ? readFileSync(join(tmp, 'w'), 'latin1') : '',
};
const got = await run(args, { cwd, time, cycles, input });
let bad = 0;
const diff = (what: string, a: string, b: string) => {
  if (a === b) return console.log(`${what}: same (${a.length} chars)`);
  bad++;
  const al = a.split('\n'), bl = b.split('\n');
  let i = 0;
  while (i < al.length && al[i] === bl[i]) i++;
  console.log(`${what}: differ at line ${i + 1}\n  oracle: ${JSON.stringify(al.slice(i, i + 3))}\n  port:   ${JSON.stringify(bl.slice(i, i + 3))}`);
};
diff('stdout', want.stdout, got.stdout);
diff('stderr', want.stderr, got.stderr);
diff('window', want.win, got.win);
diff('trace', want.trace.join('\n'), got.trace.join('\n'));
if (want.status !== (got.status & 255)) { bad++; console.log(`status: oracle ${want.status}, port ${got.status}`); } else console.log(`status: ${want.status}`);
process.exit(bad ? 1 : 0);
