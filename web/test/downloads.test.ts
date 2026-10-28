// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The player's download progress: what it says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { megabytes, progressText } from '../src/site/downloads.ts';

test('sizes', () => {
  assert.equal(megabytes(24_400_000), '24 MB');
  assert.equal(megabytes(4_012_345), '4.0 MB');
  assert.equal(megabytes(180_000), '0.2 MB');
});

test('progress: amount, percent, and the time left once there is a rate', () => {
  assert.equal(progressText(0, 21_700_000, 0), '0.0 of 22 MB (0 %)');
  assert.equal(progressText(3_200_000, 21_700_000, 500), '3.2 of 22 MB (14 %)', 'no estimate within the first second');
  assert.equal(progressText(3_200_000, 21_700_000, 2000), '3.2 of 22 MB (14 %) · about 12 s left');
  assert.equal(progressText(1_000_000, 9_300_000, 10_000), '1.0 of 9.3 MB (10 %) · about 1 min 23 s left');
  assert.equal(progressText(9_300_000, 9_300_000, 10_000), '9.3 of 9.3 MB (100 %)', 'nothing left: no estimate');
});
