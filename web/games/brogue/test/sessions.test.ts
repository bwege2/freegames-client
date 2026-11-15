// The port against the original: every session the oracle (re/brogue/oracle/: Brogue CE 1.15.1 built
// natively, its platform replaced by console.c) ran is run again on the port with the same command line
// and events (golden/<session>.json, written by re/brogue/oracle/goldens.sh). Every frame must be the
// original's (the screen as plotted, glyph and colours of every cell, at the same virtual time), the run
// must end the same way with the same standard output, and every file it leaves (recordings, saved games,
// high scores, run history) must be the original's byte for byte. Runs of a session follow each other in
// one directory, as in the oracle.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { parseEvents, runSession } from './harness.ts';

const GOLDEN = join(import.meta.dirname, 'golden');

interface GoldenRun {
  args: string[];
  events: string[];
  frames: string[];
  end: string;
  status: number;
  stdout: string;
  files: Record<string, { sha256: string; size: number; text?: string }>;
}

for (const file of readdirSync(GOLDEN).filter((f) => f.endsWith('.json')).sort()) {
  const parsed = JSON.parse(readFileSync(join(GOLDEN, file), 'utf8')) as { session?: string; runs?: GoldenRun[] };
  // tiles.json is the tile test's (a list of tile cases), not a session
  if (!parsed.runs) continue;
  const golden = parsed as { session: string; runs: GoldenRun[] };
  test(`session ${golden.session}`, async () => {
    let files = new Map<string, Uint8Array>();
    for (const [n, run] of golden.runs.entries()) {
      const what = `${golden.session}, run ${n + 1} (${run.args.join(' ') || 'no arguments'})`;
      const r = await runSession(run.args, parseEvents(run.events.join('\n')), files);
      const frames = r.frames.map((f) => `${f.vclock} ${f.hash}`);
      for (let i = 0; i < Math.max(frames.length, run.frames.length); i++) {
        if (frames[i] !== run.frames[i]) {
          assert.fail(`${what}: frame ${i} (event ${run.events[i] ?? '-'}): the original ${run.frames[i] ?? '(none)'}, the port ${frames[i] ?? '(none)'}`);
        }
      }
      assert.equal(r.end, run.end, `${what}: how it ended`);
      assert.equal(r.status, run.status, `${what}: exit status`);
      assert.equal(r.stdout, run.stdout, `${what}: standard output`);
      const got: Record<string, unknown> = {};
      for (const [name, data] of r.files) {
        const e: { sha256: string; size: number; text?: string } = { sha256: createHash('sha256').update(data).digest('hex'), size: data.length };
        if (name.endsWith('.txt')) e.text = Buffer.from(data).toString('latin1');
        got[name] = e;
      }
      assert.deepEqual(got, run.files, `${what}: the files it leaves`);
      files = r.files;
    }
  });
}
