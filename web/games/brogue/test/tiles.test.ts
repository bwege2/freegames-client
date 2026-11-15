// The glyphs as the original draws them: tiles.ts downscales tiles.png for a window size as tiles.c does,
// texture for texture and byte for byte (golden/tiles.json: the original's tiles.c, compiled with SDL2 by
// re/brogue/oracle/tilesdump.sh, for six window sizes, among them one of the single large texture).
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { decodePng } from '../src/png.ts';
import { TileSheet, createTextures } from '../src/tiles.ts';

const here = import.meta.dirname;
const sheet = new TileSheet(decodePng(readFileSync(join(here, '..', 'assets', 'tiles.png'))), readFileSync(join(here, '..', 'assets', 'tiles.bin')));
const golden = JSON.parse(readFileSync(join(here, 'golden', 'tiles.json'), 'utf8')) as
  { outputWidth: number; outputHeight: number; textures: { tileWidth: number; tileHeight: number; sha256: string }[] }[];

for (const g of golden) {
  test(`the textures of a ${g.outputWidth}x${g.outputHeight} window`, () => {
    const t = createTextures(sheet, g.outputWidth, g.outputHeight);
    assert.deepEqual(t.textures.map((x) => ({ tileWidth: x.tileWidth, tileHeight: x.tileHeight, sha256: createHash('sha256').update(x.alpha).digest('hex') })),
      g.textures);
  });
}
