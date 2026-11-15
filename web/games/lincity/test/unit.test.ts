// The pieces under the translation: glibc's rand() and printf rounding, the data pack, the storage names.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gzipSync } from 'fflate';
import { srand, rand, sprintf } from '../src/lc/c.ts';
import { unpackData } from '../src/data.ts';
import { gzipName, storageName, homePath } from '../src/files.ts';
import { HOME } from '../src/lc/stdio.ts';

const here = dirname(new URL(import.meta.url).pathname);
const ORIG = join(here, '..', '..', '..', '..', 're', 'lincity', 'orig', 'lincity-1.13.1');

test('rand() is glibc\'s (TYPE_3 additive feedback)', () => {
  srand(1);
  assert.deepEqual([rand(), rand(), rand(), rand(), rand()], [1804289383, 846930886, 1681692777, 1714636915, 1957747793]);
  srand(0); // glibc takes 0 as 1
  assert.equal(rand(), 1804289383);
  srand(42);
  assert.deepEqual([rand(), rand(), rand()], [71876166, 708592740, 1483128881]);
});

test('printf rounds as glibc does (exact binary value, ties to even)', () => {
  assert.equal(sprintf('%.1f', 0.05), '0.1');
  assert.equal(sprintf('%.1f', 0.25), '0.2');
  assert.equal(sprintf('%.0f', 2.5), '2');
  assert.equal(sprintf('%.0f', 3.5), '4');
  assert.equal(sprintf('%5.1f%%', 12.345), ' 12.3%');
  assert.equal(sprintf('%d,%03d', 12, 7), '12,007');
});

test('the data pack holds the original\'s files byte for byte', () => {
  const files = unpackData(readFileSync(join(here, '..', 'assets', 'lincity-data.bin')));
  assert.equal(files.size, 523);
  for (const f of ['colour.pal', 'help/index.hlp', 'messages/not_enough_tech.mes', 'opening/good_times.scn', 'icons/buldoze-button.csi']) {
    assert.ok(files.has(f), f);
  }
});

test('the data pack is the original\'s tree byte for byte', { skip: existsSync(ORIG) ? false : 'the original is missing (re/lincity/fetch.sh)' }, () => {
  const files = unpackData(readFileSync(join(here, '..', 'assets', 'lincity-data.bin')));
  for (const [name, data] of files) assert.deepEqual(data, new Uint8Array(readFileSync(join(ORIG, name))), name);
});

test('the files kept in the account\'s storage', () => {
  assert.equal(storageName(`${HOME}/.lincityrc`), 'lincityrc');
  assert.equal(storageName(`${HOME}/.lincity/3_my town`), 'scene-3');
  assert.equal(storageName(`${HOME}/.lincity/res.tmp`), null);
  assert.equal(storageName(`${HOME}/.lincity/results`), null);
  assert.equal(storageName(`${HOME}/.lincity/0_x`), null);
  const scene = gzipSync(new Uint8Array([1, 2, 3]), { filename: '3_my town', mtime: 0 });
  assert.equal(gzipName(scene), '3_my town');
  assert.equal(homePath('scene-3', scene), `${HOME}/.lincity/3_my town`);
  assert.equal(homePath('scene-4', scene), `${HOME}/.lincity/4_`);
  assert.equal(homePath('lincityrc', new Uint8Array(0)), `${HOME}/.lincityrc`);
  assert.equal(homePath('other', scene), null);
});
