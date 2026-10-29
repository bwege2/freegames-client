// Playing against the original: new games played by FreeCol's server and AI (every nation but one, as the
// original's debug run plays them; re/freecol/oracle/Oracle.java, the original with its AI threads
// scheduled deterministically) and by the port from the same seed are saved at the start of every turn;
// each savegame.xml must be the original's (but for the game's random UUID). Two games let the human seat
// skip its turns, two give it a scripted player that moves, lands and founds colonies through the
// client's messages. The mutation check then changes the port in three places and the comparison must
// catch each. Each game runs in a process of its own (play-run.ts), as each of the original's runs in a JVM
// of its own: FreeCol keeps state in static fields.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { oracleMissing, oracleOutput, runOracle } from './harness.ts';

const games = [
  { key: 'play-freecol-7', seed: 7, turns: 100, rules: 'freecol', script: false },
  { key: 'play-classic-2', seed: 2, turns: 60, rules: 'classic', script: false },
  { key: 'play-script-freecol-3', seed: 3, turns: 60, rules: 'freecol', script: true },
  { key: 'play-script-classic-5', seed: 5, turns: 60, rules: 'classic', script: true },
];
const fsg = (t: number) => `turn${String(t).padStart(3, '0')}.fsg`;
const missing = oracleMissing();
const skip = missing ? `the oracle is missing: ${missing}` : false;
const runner = path.join(path.dirname(fileURLToPath(import.meta.url)), 'play-run.ts');

function oracleGame(g: (typeof games)[number]): string {
  return oracleOutput(g.key, [fsg(g.turns)], (d) => runOracle(['Oracle', String(g.seed), String(g.turns), d, g.rules, ...(g.script ? ['script'] : [])]));
}

/** Plays a game in the port (a process of its own); the first turn whose save differs from the original's, or null. */
function firstDifference(g: (typeof games)[number], dir: string, turns: number, mutation: string | null = null): string | null {
  const out = execFileSync(process.execPath, [runner, JSON.stringify({ ...g, dir, turns, mutation })],
    { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(out.trim().split('\n').pop()!).diff;
}

for (const g of games) {
  test(`${g.key}: the port plays ${g.turns} turns as the original, turn by turn`, { skip, timeout: 3600000 }, () => {
    const dir = oracleGame(g);
    assert.ok(fs.existsSync(path.join(dir, fsg(g.turns))));
    const diff = firstDifference(g, dir, g.turns);
    if (diff) assert.fail(`${g.key} ${diff}`);
  });
}

test('mutation check: playing catches a changed port', { skip, timeout: 3600000 }, () => {
  const g = games[2];
  const dir = oracleGame(g);
  const turns = 20;
  const mutations: [string, string][] = [
    ['moves', 'every unit moves one step further'],
    ['production', 'a tile could produce one more of every goods type'],
    ['random', 'one bounded random draw in a thousand comes out one higher'],
  ];
  for (const [m, what] of mutations) {
    assert.ok(firstDifference(g, dir, turns, m), `the mutation "${what}" went unnoticed in ${turns} turns`);
  }
  assert.equal(firstDifference(g, dir, turns), null, 'the port is whole again');
});
