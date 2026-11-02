// The replay text format and the mod ZIP reader.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReplayRecorder, encodeReplay, parseReplay } from '../src/replay.ts';
import { unzip } from '../src/unzip.ts';
import { decodeInput, encodeInput } from '../src/net.ts';

test('the replay format keeps the seed, players, mode and frame inputs', () => {
  const r = new ReplayRecorder(0xdeadbeef, 2, 'deathmatch');
  r.record([encodeInput({ thrust: true, brake: false, left: false, right: true, shield: false, fire: true }),
    encodeInput({ thrust: false, brake: true, left: true, right: false, shield: true, fire: false })]);
  r.record([0, 0]);
  const text = encodeReplay({ version: 1, seed: r.seed, players: 2, mode: 'deathmatch',
    wave: 7, scores: [100, 200], frags: [2, 1], frames: r.frames });
  const back = parseReplay(text);
  assert.ok(back);
  assert.equal(back.seed, 0xdeadbeef);
  assert.equal(back.players, 2);
  assert.equal(back.mode, 'deathmatch');
  assert.equal(back.wave, 7);
  assert.deepEqual(back.scores, [100, 200]);
  assert.deepEqual(back.frags, [2, 1]);
  assert.equal(back.frames.length, 2);
  assert.equal(encodeInput(decodeInput(back.frames[0][0])), r.frames[0][0]);
  assert.equal(encodeInput(decodeInput(back.frames[0][1])), r.frames[0][1]);
});

test('the mod ZIP reader extracts stored and deflated entries', async () => {
  const bytes = Uint8Array.from(Buffer.from(
    'UEsDBBQAAAAIAEFHYl0b1S1HDgAAAAwAAAAUAAAAU3ByaXRlcy9pY2w4XzIwMC5wbmfLSM3JyVcoLijKLEkFAFBLAwQUAAAACABBR2Jdser/dCUAAAAjAAAACgAAAFJFQURNRS50eHTzS8xNtVIISS0uUfDNT+FySS1OLsosKMnMz7NScFQoSS0u4QIAUEsBAhQDFAAAAAgAQUdiXRvVLUcOAAAADAAAABQAAAAAAAAAAAAAAIABAAAAAFNwcml0ZXMvaWNsOF8yMDAucG5nUEsBAhQDFAAAAAgAQUdiXbHq/3QlAAAAIwAAAAoAAAAAAAAAAAAAAIABQAAAAFJFQURNRS50eHRQSwUGAAAAAAIAAgB6AAAAjQAAAAAA',
    'base64'));
  const files = await unzip(bytes);
  assert.ok(files.has('Sprites/icl8_200.png'));
  assert.equal(new TextDecoder().decode(files.get('README.txt')), 'Name: Test Mod\nDescription: A test\n');
});
