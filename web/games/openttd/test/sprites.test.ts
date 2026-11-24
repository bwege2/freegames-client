// The sprite assets are the original's 8bpp graphics, converted losslessly to
// one-byte-per-pixel atlases. The manifest records the SHA-256 of every pinned
// source GRF and of each atlas; the tests read those back and, when the
// reference tree is present, decode sprites again with the extractor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const here = import.meta.dirname;
const assets = join(here, '..', 'assets', 'sprites');
const manifest = JSON.parse(readFileSync(join(assets, 'manifest.json'), 'utf8'));
const sprites = JSON.parse(readFileSync(join(assets, 'sprites.json'), 'utf8'));

// Hashes of the pinned release files, recorded when the assets were built.
const SOURCE_SHA256 = {
  'opengfx-8.0/ogfx1_base.grf': 'f8201e87c7210493aaf525993013dc94dd4b7a801c4bb27df47544786bf8eaa9',
  'opengfx-8.0/ogfxi_logos.grf': '20644db32d97b2e1d7d7d9b73b0484b904a86f9e91752d9fc5f86bebb7706e5a',
  'opengfx-8.0/ogfxc_arctic.grf': '17cf3be5a9410d6807347a13b5655cf534f3b10f19d1bb7a43080f7c226817ce',
  'opengfx-8.0/ogfxh_tropical.grf': 'b9aa39877daccd417ee1b248010bc8891648accf1680d1443f58a8589189238c',
  'opengfx-8.0/ogfxt_toyland.grf': 'd01320fdcfc94cf4ef637ec72e892314dc5dc682b949e6957c3fb72cb9385986',
  'opengfx-8.0/ogfxe_extra.grf': '6472d934f15210dc4ad03acaad12d1e2717f4f5f836495cdd78bfc45fcbb0adb',
  'openttd-15.3/media/baseset/openttd.grf': 'a67704ee168710985220052e27be8a908eba07092a59f2f9b4734046d911286f',
};

test('the assets come from the pinned GRFs', () => {
  assert.deepEqual(manifest.source, SOURCE_SHA256);
});

test('sprite counts match the original loader', () => {
  assert.equal(manifest.baseEntries, 4793);
  assert.equal(manifest.baseImages, 4758);
  assert.equal(manifest.baseRecolours, 35);
  assert.equal(manifest.logoEntries, 103);
  assert.equal(manifest.climates.arctic.entries, 343);
  assert.equal(manifest.climates.tropic.entries, 558);
  assert.equal(manifest.climates.toyland.entries, 1195);
  assert.equal(manifest.climates.toyland.images, 1194);
  assert.equal(manifest.extras.default.images, 1018);
  assert.equal(manifest.extras.default.recolours, 257);
  assert.equal(manifest.extras.baseset.images, 1166);
  assert.equal(manifest.extras.baseset.recolours, 257);
  for (const climate of ['temperate', 'arctic', 'tropic', 'toyland']) assert.equal(manifest.finals[climate].ids, 6189);
});

test('atlas files match their hashes', () => {
  assert.equal(manifest.atlases.length, 3);
  for (const a of manifest.atlases) {
    const data = readFileSync(join(assets, a.file));
    assert.equal(data.length, a.width * a.height);
    assert.equal(createHash('sha256').update(data).digest('hex'), a.sha256);
  }
});

test('known sprites have the original geometry', () => {
  const t = sprites.sprites.temperate;
  const geom = (id: string) => {
    const e = t[id][0];
    return [e.w, e.h, e.xo, e.yo];
  };
  assert.deepEqual(geom('3981'), [64, 31, -31, 0]); // SPR_FLAT_GRASS_TILE
  assert.deepEqual(geom('4061'), [64, 31, -31, 0]); // SPR_FLAT_WATER_TILE
  assert.deepEqual(geom('4078'), [1, 1, 4, 3]); // SPR_EMPTY
  assert.deepEqual(geom('5936'), [64, 15, -31, 0]); // first shore sprite
  assert.deepEqual(geom('4896'), [34, 31, -31, 7]); // baseset extra wins over openttd.grf
  assert.equal(Object.keys(sprites.recolours.temperate).length, 292);
  assert.equal(sprites.recolours.temperate['771'].length, 514); // 257 bytes as hex
});

test('the extractor still reproduces sprites from the reference tree', { skip: !existsSync(join(here, '..', '..', '..', '..', 're', 'openttd', 'orig')) }, async () => {
  // @ts-expect-error -- the extractor is plain JavaScript, outside the web tsconfig
  const { readBaseGrf } = await import('../../../../re/openttd/tools/grf.mjs');
  const root = join(here, '..', '..', '..', '..', 're', 'openttd', 'orig');
  const base = readBaseGrf(join(root, 'opengfx-8.0', 'ogfx1_base.grf'));
  assert.equal(base.count, manifest.baseEntries);
  assert.equal(base.stats.images, manifest.baseImages);
  assert.equal(base.stats.recolours, manifest.baseRecolours);
  const atlas = readFileSync(join(assets, manifest.atlases[2].file));
  for (const id of [3981, 4061]) {
    const entry = base.sprites.get(id);
    assert.ok(entry);
    const v = entry.variants.find((x: { zoom: number }) => x.zoom === 0);
    const rect = sprites.sprites.temperate[String(id)][0];
    assert.deepEqual([v.width, v.height, v.xoff, v.yoff], [rect.w, rect.h, rect.xo, rect.yo]);
    const extracted = Buffer.alloc(v.width * v.height);
    for (let y = 0; y < v.height; y++) {
      const row = atlas.subarray((rect.y + y) * manifest.atlases[rect.a].width + rect.x, (rect.y + y) * manifest.atlases[rect.a].width + rect.x + v.width);
      row.copy(extracted, y * v.width);
    }
    assert.deepEqual(createHash('sha256').update(extracted).digest('hex'), createHash('sha256').update(Buffer.from(v.pixels)).digest('hex'), `sprite ${id} pixels`);
  }
});
