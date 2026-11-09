// Online lockstep (ONLINE.md): the game state after a sequence of inputs must not depend on what a client draws.
// Runs scenarios with and without frames drawn between the turns (svg ... screen: drawscreen at a window size, with
// the clock advancing) and compares every turn's dump and, at the end, the generators (rngstate).
//  * the original's behaviour (the port 1:1, as re/hyperrogue/tools/determinism.py finds in the oracle): drawing
//    consumes glibc rand() (so the rules' later rand() values differ), and in the Volcanic Wasteland the drawing's
//    checkTide turns cells beyond dcal to lava earlier (wparam differs a turn later); hrngen is never touched
//  * the online mode (`online 1`: G.online_isolated): every turn and both generators equal the plain run
// Each run is its own process (run-scenario.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const TURN = /^(round|move|wait|drop|orb)\b/;

/** the scenario's commands, the first `turns` turns, with two frames after each turn from turn `drawFrom` on
 *  ('plain': none; the SVGs are large, the output of a run must stay under maxBuffer) */
function variant(name: string, turns: number, kind: 'plain' | 'frames', online: boolean, drawFrom = 0): string {
  const lines = readFileSync(join(here, 'scenarios', name + '.txt'), 'utf8').split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'));
  const out: string[] = online ? ['online 1'] : [];
  let t = 0, n = 0;
  for (const l of lines) {
    out.push(l);
    if (!TURN.test(l)) continue;
    t += 40;
    if (kind === 'frames' && n >= drawFrom) out.push(`ticks ${t}`, 'svg 480 360 screen', `ticks ${t + 700}`, 'svg 320 200 screen');
    if (++n >= turns) break;
  }
  out.push('rngstate');
  return out.join('\n') + '\n';
}

function run(text: string): { turns: string[]; rng: string } {
  const dir = mkdtempSync(join(tmpdir(), 'hr-det-'));
  try {
    const f = join(dir, 's.txt');
    writeFileSync(f, text);
    const r = spawnSync(process.execPath, [join(here, 'run-scenario.ts'), f], { encoding: 'utf8', maxBuffer: 1 << 28 });
    if (r.status !== 0) assert.fail(`run-scenario: status ${r.status} ${r.signal ?? ''} ${r.error ?? ''}\n${r.stderr}`);
    const res = JSON.parse(r.stdout) as { out?: string; notported?: string };
    if (res.notported) assert.fail('not ported: ' + res.notported);
    const turns: string[] = [];
    let cur: string[] | null = null, rng = '';
    for (const l of res.out!.split('\n')) {
      if (l.startsWith('== ')) { cur = TURN.test(l.slice(3)) ? [l] : null; if (cur) turns.push(''); continue; }
      if (l.startsWith('rngstate ')) rng = l;
      if (cur) { cur.push(l); turns[turns.length - 1] = cur.join('\n'); if (l.startsWith('dcal ')) cur = null; }
    }
    return { turns, rng };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

const firstDiff = (a: string[], b: string[]): number => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };

for (const [name, turns, from] of [['multi2-start', 25, 0], ['multi3-orbs', 30, 0], ['lands-g', 126, 100]] as const) {
  test(`determinism: ${name}, online mode: drawing changes nothing`, () => {
    const plain = run(variant(name, turns, 'plain', true)), frames = run(variant(name, turns, 'frames', true, from));
    assert.equal(plain.turns.length, turns);
    const k = firstDiff(plain.turns, frames.turns);
    assert.ok(k === plain.turns.length && frames.turns.length === plain.turns.length,
      `turn ${k} differs:\n${plain.turns[k]}\n---\n${frames.turns[k]}`);
    assert.equal(frames.rng, plain.rng);
  });
}

test('determinism: the original\'s behaviour (online mode off): drawing consumes rand(), and the Volcano leaks', () => {
  const plain = run(variant('lands-g', 126, 'plain', false)), frames = run(variant('lands-g', 126, 'frames', false, 100));
  // hrngen (the rules' generator) is the same, glibc rand() is not
  assert.equal(frames.rng.split(' rand ')[0], plain.rng.split(' rand ')[0]);
  assert.notEqual(frames.rng.split(' rand ')[1], plain.rng.split(' rand ')[1]);
  // the 124th turn of lands-g (index 123; Volcanic Wasteland): the cells beyond dcal that the drawing turned to lava earlier have
  // their wparam set one turn earlier (the dcal hash differs), as in the original (determinism.py on the oracle)
  assert.equal(firstDiff(plain.turns, frames.turns), 123);
});
