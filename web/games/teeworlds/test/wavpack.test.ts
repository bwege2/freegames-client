// The WavPack decoder port against the decoder the release bundles (re/teeworlds/tools/wavpack/golden.sh builds
// it unchanged and decodes every sound of datasrc/audio as CSound::LoadWV does, plus three damaged copies): the
// same channels, rate, bits, sample count, CRC error count and the same 16-bit samples (SHA-256), file by file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { GOLDEN } from './golden.ts';
import { WavpackDecoder } from '../src/client/engine/wavpack.ts';

const AUDIO = new URL('../assets/audio/', import.meta.url);
const ORIG_AUDIO = GOLDEN + '../orig/teeworlds-0.7.5-src/datasrc/audio/';

interface Row { name: string; channels: number; rate: number; bits: number; samples: number; unpacked: number; crcErrors: number; first: number[]; sha256: string }

function audioFile(name: string): Uint8Array | null {
  const a = new URL(name, AUDIO);
  if (existsSync(a)) return new Uint8Array(readFileSync(a));
  if (existsSync(ORIG_AUDIO + name)) return new Uint8Array(readFileSync(ORIG_AUDIO + name));
  return null;
}

/** what LoadWV keeps of a file, and the decoder's state after it */
export function decode(file: Uint8Array): Omit<Row, 'name'> {
  const d = new WavpackDecoder(file);
  assert.ok(d.open(), d.error);
  const n = d.total_samples >>> 0, ch = d.config.num_channels;
  const buf = new Int32Array(n * ch + 32);
  const unpacked = d.unpackSamples(buf, n);
  const s16 = new Int16Array(n * ch);
  for (let i = 0; i < n * ch; i++) s16[i] = buf[i];
  return {
    channels: ch, rate: d.config.sample_rate, bits: d.config.bits_per_sample, samples: n, unpacked, crcErrors: d.crc_errors,
    first: Array.from(s16.subarray(0, 16)), sha256: createHash('sha256').update(new Uint8Array(s16.buffer)).digest('hex'),
  };
}

const golden = JSON.parse(readFileSync(GOLDEN + 'wavpack.json', 'utf8')) as { files: Row[] };

test('every sound of the release decodes to the original decoder\'s samples', (t) => {
  let checked = 0;
  for (const row of golden.files) {
    const bad = row.name.startsWith('bad-');
    let file = audioFile(bad ? row.name.slice(4) : row.name);
    if (!file) continue;
    if (bad) {
      file = file.slice();
      file[file.length >> 1] ^= 0x55;
    }
    const { name: _, ...want } = row;
    assert.deepEqual(decode(file), want, row.name);
    checked++;
  }
  if (!checked) t.skip('no sounds (run re/teeworlds/tools/assets.sh or re/teeworlds/fetch.sh)');
  else assert.equal(checked, golden.files.length);
});
