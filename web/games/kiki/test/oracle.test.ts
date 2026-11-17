// The port's engine against the original's: re/kiki/oracle/ builds the original's game logic (kiki 1.0.2,
// src/base, src/world, src/items, src/bots, kodilib's math) headless, and re/kiki/oracle/golden.mjs ran 24
// scenarios on it: a level as the original's scripts build it (mutants placed where the port placed them),
// then 20-40 s of key presses with uneven frame times. Each dump has every object's position, the bots'
// orientation, move action and health or moves, the active state of switches, gears and wires, and the
// sounds played since the dump before. The port must print the same, numbers within 0.01 (the original
// computes in floats, the port in doubles).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { SCENARIOS, scenarioScript, scenarioName, runPort, undelta, fnv, same, type Delta } from './oracle.ts';

const golden = JSON.parse(gunzipSync(readFileSync(join(import.meta.dirname, 'golden', 'oracle.json.gz'))).toString()) as
  Record<string, { script: number; dumps: Delta[] }>;

for (const [level, seed, seconds, speed] of SCENARIOS) {
  test(`oracle: ${level}, ${seconds} s of keys (session ${seed}, speed ${speed ?? 7})`, () => {
    const g = golden[scenarioName(level, seed)];
    assert.ok(g, `no golden run for ${level} (re/kiki/oracle/golden.mjs)`);
    const script = scenarioScript(level, seed, seconds, speed);
    assert.equal(fnv(script), g.script, 'the scenario is the one the oracle ran');
    const want = undelta(g.dumps);
    const got = undelta(JSON.parse(JSON.stringify(
      // the port's dumps, through the same encoding
      (() => { const text = runPort(script.trim().split('\n')); return encode(text); })())));
    assert.equal(got.length, want.length, 'number of dumps');
    for (let d = 0; d < want.length; d++) {
      assert.equal(got[d].length, want[d].length, `dump ${d} (${want[d][0]}): number of lines`);
      for (let i = 0; i < want[d].length; i++) {
        assert.ok(same(got[d][i], want[d][i]), `dump ${d}, line ${i}:\n  original: ${want[d][i]}\n  port:     ${got[d][i]}`);
      }
    }
  });
}

function encode(text: string): Delta[] {
  const dumps: string[][] = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('t ')) dumps.push([line]);
    else if (line && dumps.length) dumps[dumps.length - 1].push(line);
  }
  return dumps.map((d) => ({ n: d.length, c: d.map((l, i) => [i, l] as [number, string]) }));
}
