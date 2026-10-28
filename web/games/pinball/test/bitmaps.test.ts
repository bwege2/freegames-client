// The original bitmaps (src/assets.ts, from the Atari 800 repository's BITMAPS.OBJ) in the Apple's
// order: the ball is the ball IBALL draws, every bitmap block is the size RUN.S's equates give it,
// and (with re/pinball/orig present) src/assets.ts is what the conversion makes, with no pixel lost.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bitmapBytes } from '../src/bitmaps.ts';
import { IMAGE, SYM } from '../src/image.ts';
import { ORIG } from './apple2.ts';
import { render } from './gen-assets.ts';

test('the ball bitmap is the ball RUN.S draws (IBALL), the blocks fill $7000-$76F3', () => {
  const b = bitmapBytes();
  const R = SYM.RUN;
  assert.equal(b.length, 0x700);
  const at = R.BALLB - 0x7000;
  // IBALL's bitmap: 7 bytes after its descriptor's start
  const seg = IMAGE.RUN.find((s) => R.IBALL >= s.org && R.IBALL < s.org + s.hex.length / 2)!;
  const ib = Array.from({ length: 5 }, (_, i) => parseInt(seg.hex.slice((R.IBALL - seg.org + 7 + i) * 2, (R.IBALL - seg.org + 8 + i) * 2), 16));
  assert.deepEqual(Array.from(b.subarray(at, at + 5)), ib);
  // a frame of each animated part is there (not blank)
  for (const k of ['LAUNCHERB', 'LFLIPB', 'RFLIPB', 'BMP1B', 'LKICKB', 'KNOCK1B', 'ROLLB', 'LANEB', 'DROP1B', 'CATCH2B', 'SPINB', 'MAGB'] as const) {
    const o = R[k] - 0x7000;
    assert.ok(b.subarray(o, o + 5).some((v) => v !== 0), k);
  }
});

test('src/assets.ts is the conversion of the original files', { skip: !existsSync(join(ORIG, '../atari/Disk1/BITMAPS.OBJ')) && 'no re/pinball/orig/atari' }, () => {
  assert.equal(readFileSync(join(import.meta.dirname, '../src/assets.ts'), 'utf8'), render());
});
