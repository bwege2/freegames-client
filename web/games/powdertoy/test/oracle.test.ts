// Runs every scenario in test/scenarios/ through the port (trace.ts) and compares the dump with the original's
// (test/golden/<name>.txt, written by re/powdertoy/oracle/powdertoy-oracle; re/powdertoy/oracle/build.sh writes
// them all). The comparison is exact: floats are dumped as their binary32 bits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScenario } from './trace.ts';

const here = dirname(fileURLToPath(import.meta.url));
const scenarios = readdirSync(join(here, 'scenarios')).filter((n) => n.endsWith('.txt')).sort();

for (const name of scenarios) {
  test(`oracle: ${name.replace(/\.txt$/, '')}`, () => {
    const golden = readFileSync(join(here, 'golden', name), 'utf8');
    const actual = runScenario(readFileSync(join(here, 'scenarios', name), 'utf8'));
    if (actual === golden) return;
    const g = golden.split('\n'), a = actual.split('\n');
    let frame = '(before the first dump)';
    for (let k = 0; k < Math.max(g.length, a.length); k++) {
      if (g[k]?.startsWith('frame ')) frame = g[k];
      if (g[k] !== a[k]) {
        assert.fail(`${name}: first difference at line ${k + 1}, in "${frame}"\n  original: ${g[k] ?? '(end)'}\n  port:     ${a[k] ?? '(end)'}`);
      }
    }
  });
}
