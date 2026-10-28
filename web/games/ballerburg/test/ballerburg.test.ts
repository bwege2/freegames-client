// Ballerburg's port against the original: re/ballerburg/oracle runs the original C sources of Ballerburg
// SDL 1.2.3 against a recording SDL with scripted mouse and keys and virtual time, and wrote for every
// frame (each SDL_Delay and SDL_WaitEvent) the hash of the drawing calls and sound chip writes, of the
// screen's pixels, of the game state and of the sound chip's samples, and how many random numbers were
// drawn (test/golden/). The port runs the same scripts and must match every frame. The scenarios: shots
// on one computer, the market (taxes, powder, balls, shaft towers, bricks, the king), against the
// computer, three computer-against-computer games to the end (all seven strategies), shaft towers shot
// down, the round limit, the people gone, and a capitulation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseScript, run } from './harness.ts';
import { GlibcRand } from '../src/glibcRand.ts';

const golden = join(import.meta.dirname, 'golden');

for (const f of readdirSync(golden).filter((x) => x.endsWith('.txt')).sort()) {
  test(`the original's frames: ${f}`, async () => {
    const { seed, events, frames } = parseScript(readFileSync(join(golden, f), 'utf8'));
    const r = await run(seed, events);
    for (let i = 0; i < Math.min(frames.length, r.lines.length); i++) {
      if (r.lines[i] !== frames[i]) assert.fail(`line ${i}:\n  original: ${frames[i].slice(0, 160)}\n  port:     ${r.lines[i].slice(0, 160)}`);
    }
    assert.equal(r.lines.length, frames.length, 'as many lines');
    const end = frames[frames.length - 1].split(' ');
    assert.equal(r.frames, Number(end[1]), 'as many frames');
  });
}

test("glibc rand(): srand(1)'s sequence", () => {
  const r = new GlibcRand(1);
  assert.deepEqual(Array.from({ length: 5 }, () => r.next()), [1804289383, 846930886, 1681692777, 1714636915, 1957747793]);
});
