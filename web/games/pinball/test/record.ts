// Records the original's lines for every scenario into test/golden/ (needs re/pinball/orig):
//   node games/pinball/test/record.ts [--coverage] [name...]
// --coverage prints, per scenario and in total, how often the ball hit each part type.
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { Original } from './original.ts';
import { runScenario } from './run-scenario.ts';
import { SCENARIOS, type Scenario } from './scenarios.ts';

const args = process.argv.slice(2);
const coverage = args.includes('--coverage');
const names = args.filter((a) => !a.startsWith('--'));
const dir = join(import.meta.dirname, 'golden');
mkdirSync(dir, { recursive: true });

/** the part type of each object number of a scenario's table */
function kinds(sc: Scenario): string[] {
  return sc.spec.objects.map((o) => ('part' in o ? o.part : o.poly.type === 2 ? 'outline' : 'polygon'));
}

const total = new Map<string, number>();
for (const sc of SCENARIOS) {
  if (names.length && !names.includes(sc.name)) continue;
  const t0 = Date.now();
  const lines = runScenario(new Original(), sc);
  writeFileSync(join(dir, `${sc.name}.txt.gz`), gzipSync(lines.join('\n') + '\n', { level: 9 }));
  const k = kinds(sc);
  const hits = new Map<string, number>();
  for (const l of lines) {
    const h = / h=(\S*)/.exec(l)?.[1];
    if (!h) continue;
    for (const e of h.split(',')) {
      const name = k[Number(e.split('/')[0])] ?? '?';
      hits.set(name, (hits.get(name) ?? 0) + 1);
      total.set(name, (total.get(name) ?? 0) + 1);
    }
  }
  console.log(`${sc.name}: ${lines.length} frames, ${Date.now() - t0} ms`);
  if (coverage) console.log('  ' + [...hits.entries()].sort().map(([a, b]) => `${a} ${b}`).join(', '));
}
if (coverage) console.log('all: ' + [...total.entries()].sort().map(([a, b]) => `${a} ${b}`).join(', '));
