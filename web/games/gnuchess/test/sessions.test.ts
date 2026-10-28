// The whole program against the original: every session of re/gnuchess/oracle/sessions/ that the
// native GNU Chess 6.3.0 (re/gnuchess/oracle, goldens.sh) ran is run through the port the same way
// (test/session.ts): its stdout must be the original's byte for byte, except where the input thread's
// prompt lands between the other threads' output (a race in the original: the prompts are compared as
// a sequence) and the time column of the thinking lines; stderr, the exit status and every file the
// program wrote must be the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runSession, splitPrompts, type Golden } from './session.ts';

const dir = join(import.meta.dirname, 'golden', 'sessions');
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

test('the sessions are there', () => {
  assert.ok(files.length >= 30, `${files.length} sessions`);
});

for (const f of files) {
  const c = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Golden;
  const first = c.input.slice(0, 4).join(' | ');
  test(`${c.name}: ${first}${c.input.length > 4 ? ' | …' : ''}`, () => {
    const r = runSession(c);
    const want = splitPrompts(c.stdout);
    const got = splitPrompts(r.stdout);
    assert.equal(got.text, want.text, 'stdout without the prompts');
    assert.deepEqual(got.prompts, want.prompts, 'the prompts');
    assert.equal(r.stderr, c.stderr, 'stderr');
    assert.equal(r.status, c.status, 'exit status');
    assert.deepEqual(r.written, c.written, 'the files written');
  });
}
