// The port's PNG decoder against Pillow (re/fishfillets/png_golden.py): one picture of every kind in
// the data must decode to the same RGBA pixels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng } from '../src/ui/png.ts';
import { ASSETS } from './harness.ts';

const golden = JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'png.json'), 'utf8')) as Record<string, string>;

test('PNG pictures decode as Pillow decodes them', () => {
  for (const [path, sha] of Object.entries(golden)) {
    const pic = decodePng(new Uint8Array(readFileSync(join(ASSETS, 'data', path))));
    const got = createHash('sha1').update(pic.px).digest('hex');
    assert.equal(got, sha, path);
  }
});
