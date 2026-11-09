// Runs every scenario in test/scenarios/ through the port (trace.ts) and compares the dump with the original's
// (test/golden/<name>.txt, written by re/hyperrogue/oracle/hyperrogue-oracle; re/hyperrogue/oracle/build.sh
// writes them all). The comparison is exact. Until all packages of stage 1 are ported, the game scenarios fail
// with "not ported: ..." (PORTING.md and PORTING-STAGE2.md, "Packages", say which package each needs).
// Each scenario runs in its own process (run-scenario.ts), as in the oracle: one scenario = one process.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const scenarios = readdirSync(join(here, 'scenarios')).filter((n) => n.endsWith('.txt')).sort();

/** the golden dump: golden/<name>, or golden/<name>.gz for the drawing scenarios (build.sh gzips those) */
function readGolden(name: string): string {
  const p = join(here, 'golden', name);
  if (existsSync(p)) return readFileSync(p, 'utf8');
  return gunzipSync(readFileSync(p + '.gz')).toString('utf8');
}

for (const name of scenarios) {
  test(`oracle: ${name.replace(/\.txt$/, '')}`, (t) => {
    const golden = readGolden(name);
    const r = spawnSync(process.execPath, [join(here, 'run-scenario.ts'), join(here, 'scenarios', name)],
      { encoding: 'utf8', maxBuffer: 1 << 28 });
    if (r.status !== 0) assert.fail(`${name}: the port failed:\n${r.stderr}`);
    const res = JSON.parse(r.stdout) as { out?: string; notported?: string; partial?: string };
    // a scenario that reaches code no package has ported yet is a TODO, not a failure (a stage in progress); what
    // it printed up to there must still match
    if (res.notported !== undefined) {
      if (res.partial && !golden.startsWith(res.partial)) {
        const g = golden.split('\n'), a = res.partial.split('\n');
        let k = 0;
        while (k < a.length && g[k] === a[k]) k++;
        assert.fail(`${name}: first difference at line ${k + 1} (before the unported "${res.notported}")\n  original: ${g[k] ?? '(end)'}\n  port:     ${a[k] ?? '(end)'}`);
      }
      t.todo(res.notported);
      return;
    }
    const actual = res.out!;
    if (actual === golden) return;
    const g = golden.split('\n'), a = actual.split('\n');
    let step = '(before the first dump)';
    for (let k = 0; k < Math.max(g.length, a.length); k++) {
      if (g[k]?.startsWith('== ')) step = g[k];
      if (g[k] !== a[k]) {
        assert.fail(`${name}: first difference at line ${k + 1}, in "${step}"\n  original: ${g[k] ?? '(end)'}\n  port:     ${a[k] ?? '(end)'}`);
      }
    }
  });
}
