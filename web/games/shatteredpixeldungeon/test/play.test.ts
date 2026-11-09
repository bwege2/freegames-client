// Gameplay against the original: the whole translated game runs headless in node (scenes, sprites, particles,
// windows, text, the actor step) as the gameplay oracle runs Shattered Pixel Dungeon 4.0.2 on the JVM
// (OracleMain "play": an 800x600 screen, 1/60 s frames, the scripted keys and taps of test/scripts), and its
// output must be the original's line by line: the game's log, the hero's state after every command, and the
// saved game and level at the end (test/oracle/play-*.txt.gz, re/shatteredpixeldungeon/oracle/goldens.sh).
// Each run is a new node process, as each oracle run is a new JVM (the game's state is static). The mutation
// checks change a combat rule and expect the comparison to fail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assetsDir, golden, goldenDir, normalizePlay } from './harness.ts';

const here = path.dirname(new URL(import.meta.url).pathname);
const goldens = fs.existsSync(goldenDir)
  ? fs.readdirSync(goldenDir).filter((f) => f.startsWith('play-') && f.endsWith('.txt.gz')).map((f) => f.replace(/\.txt\.gz$/, '')).sort()
  : [];
const skip = !assetsDir()
  ? "no assets: add the game's assets/ (re/shatteredpixeldungeon/tools/assets.sh) or run re/shatteredpixeldungeon/fetch.sh"
  : goldens.length === 0 ? 'no play transcripts in test/oracle (re/shatteredpixeldungeon/oracle/goldens.sh)' : false;

/** The port's transcript for a golden's arguments (a child process), and the golden. */
function run(name: string, mutation?: string) {
  const g = golden(name);
  const env = { ...process.env, SPD_MUTATE: mutation ?? '' };
  const mine = execFileSync(process.execPath, ['--max-old-space-size=1500', path.join(here, 'run-play.ts'), g.meta.seed, g.meta.class,
    '@' + path.join(here, 'scripts', g.meta.script + '.txt'), g.meta.clock], { env, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  return { mine: normalizePlay(mine), theirs: normalizePlay(g.text), meta: g.meta };
}

/** The first differing line, with the lines before it. */
function lineDiff(mine: string, theirs: string): string | null {
  if (mine === theirs) return null;
  const a = mine.split('\n'), b = theirs.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    const ctx = b.slice(Math.max(0, i - 3), i).map((l) => '    ' + l.substring(0, 200)).join('\n');
    let c = 0;
    const x = a[i] ?? '<missing>', y = b[i] ?? '<missing>';
    while (c < x.length && c < y.length && x[c] === y[c]) c++;
    const from = Math.max(0, c - 100);
    return `line ${i + 1}, character ${c}, after:\n${ctx}\n  port:     ${x.substring(from, c + 160)}\n  original: ${y.substring(from, c + 160)}`;
  }
  return 'they differ in length only';
}

for (const name of goldens) {
  test(`play as the original plays: ${name}`, { skip, timeout: 600000 }, () => {
    const { mine, theirs, meta } = run(name);
    const d = lineDiff(mine, theirs);
    if (d) assert.fail(`seed ${meta.seed}, hero class ${meta.class}, script ${meta.script}: the port's transcript differs at ${d}`);
  });
}

const fight = goldens.find((g) => g.endsWith('-descend')) ?? goldens[0];

test('mutation check: a rat that hits 1 harder is seen', { skip, timeout: 600000 }, () => {
  const { mine, theirs } = run(fight, 'rat-damage');
  assert.ok(lineDiff(mine, theirs), 'the comparison must fail when a combat rule changes');
});

test('mutation check: a hero with an eighth of the accuracy is seen', { skip, timeout: 600000 }, () => {
  const { mine, theirs } = run(fight, 'hero-accuracy');
  assert.ok(lineDiff(mine, theirs), 'the comparison must fail when a combat rule changes');
});
