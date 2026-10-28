// The port against the original: re/corewar/oracle builds pMARS 0.9.5 from its sources (the X11 build,
// with a recording display in place of X) and runs every case of re/corewar/oracle/cases.txt; the
// goldens (test/golden/*.json) hold what it printed (stdout, stderr, exit status), what the X window's
// text panel showed (cdb), and what the core display showed: every display call of the first cycles of
// each round, and a hash of all of them for every round. The port runs the same cases with the same
// seed and the same cdb input and must match all of it: the results (wins, losses, ties per round),
// the listings (-V, -A), the assembler's messages and the traces.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { run } from './record.ts';

const dir = import.meta.dirname;
const warriors = join(dir, 'warriors');
const golden = join(dir, 'golden');

interface Case {
  name: string;
  args: string[];
  time: number;
  cycles: number;
  input: string | null;
  status: number;
  stdout: string;
  stderr: string;
  win: string;
  trace: string[];
}

const cases = readdirSync(golden).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(golden, f), 'latin1')) as Case);

test('there are goldens for every kind of case', () => {
  for (const kind of ['ex-', 'bm-', 'bm88-', 'cs-', 'out-', 'asm-', 'cl-', 'cdb-'])
    assert.ok(cases.some((c) => c.name.startsWith(kind)), kind);
});

for (const c of cases) {
  test(c.name, async () => {
    const input = c.input ? readFileSync(join(warriors, c.input), 'latin1').match(/[^\n]*\n|[^\n]+$/g) ?? [] : [];
    const got = await run(c.args, { cwd: warriors, time: c.time, cycles: c.cycles, input });
    assert.equal(got.stdout, c.stdout, 'stdout');
    assert.equal(got.stderr, c.stderr, 'stderr');
    assert.equal(got.win, c.win, 'the window (cdb)');
    assert.equal(got.status & 255, c.status, 'exit status');
    assert.equal(got.trace.length, c.trace.length, 'trace lines');
    for (let i = 0; i < c.trace.length; i++) if (got.trace[i] !== c.trace[i]) assert.equal(got.trace[i], c.trace[i], `trace line ${i + 1}`);
  });
}
