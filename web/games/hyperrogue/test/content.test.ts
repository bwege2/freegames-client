// The generated tables (src/content.ts) against the original's (the m/i/w/l lines of test/golden/content.txt):
// passes without any package ported. The isNative lines are part of the full oracle test (they need flags.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { content_tables } from './trace.ts';

const here = dirname(fileURLToPath(import.meta.url));

test('content tables equal the original\'s', () => {
  const golden = readFileSync(join(here, 'golden', 'content.txt'), 'utf8').split('\n').filter((l) => /^[miwl] /.test(l));
  const lines: string[] = [];
  content_tables((s) => lines.push(s.replace(/\n$/, '')));
  assert.equal(lines.length, golden.length);
  for (let i = 0; i < lines.length; i++) assert.equal(lines[i], golden[i]);
});
