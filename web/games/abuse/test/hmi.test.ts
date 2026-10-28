// The HMI to MIDI converter (src/sdlport/hmi.ts, translated from sdlport/hmi.cpp) on synthetic HMI
// files (the original music is not free and not here), with the expected bytes worked out by hand
// from the C++, and the MIDI parser of src/sdlport/midi.ts reading the result back.
import test from 'node:test';
import assert from 'node:assert/strict';
import { load_hmi } from '../src/sdlport/hmi.ts';
import { parseMidi } from '../src/sdlport/midi.ts';

function le32(buf: number[], at: number, v: number): void {
  buf[at] = v & 0xff;
  buf[at + 1] = (v >>> 8) & 0xff;
  buf[at + 2] = (v >>> 16) & 0xff;
  buf[at + 3] = (v >>> 24) & 0xff;
}

/** an HMI file: track table at 0x100 (0xE8 points at it, 0xF4 at its end), tracks one after another,
 *  each with 0x60 at track+0x57 so its data starts at track+0x60 */
function hmi(tracks: number[][]): Uint8Array {
  const buf: number[] = new Array(0x110).fill(0);
  le32(buf, 0xe8, 0x100);
  le32(buf, 0xf4, 0x100 + 4 * tracks.length);
  tracks.forEach((data, i) => {
    const pos = buf.length;
    le32(buf, 0x100 + 4 * i, pos);
    const head = new Array(0x60).fill(0);
    head[0x57] = 0x60;
    buf.push(...head, ...data);
  });
  return Uint8Array.from(buf);
}

const HEADER = (n: number) => [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, n, 0, 0xc0];
const BPM = [0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, 0x0b, 0x00, 0xff, 0x51, 0x03, 0x18, 0x7f, 0xff, 0x00, 0xff, 0x2f, 0x00];

const SONG = [
  0x00, 0xc0, 0x05, //                  t=0   program 5
  0x00, 0x90, 0x3c, 0x64, 0x82, 0x00, //  t=0   note on 60 vel 100, duration 256 -> off at 256
  0x20, 0x3e, 0x50, 0x30, //            t=32  running status: note on 62 vel 80, duration 48 -> off at 80
  0x10, 0xfe, 0x14, 0xaa, 0xbb, //      t=48  HMI event 0xFE 0x14: skips 2 bytes, writes nothing
  0x82, 0x60, 0xff, 0x2f, 0x00, //      t=400 end of track (note-offs at 80 and 256 inserted before)
];

test('load_hmi converts a track: header, bpm track, note-offs inserted, running status expanded', () => {
  const out = load_hmi(hmi([SONG]));
  assert.ok(out);
  const track = [
    0x00, 0xc0, 0x05,
    0x00, 0x90, 0x3c, 0x64,
    0x20, 0x90, 0x3e, 0x50, //        delta 32, explicit status
    0x30, 0x90, 0x3e, 0x00, //        note-off of 62 at 80: delta 48 (the 0xFE event's 16 ticks included)
    0x81, 0x30, 0x90, 0x3c, 0x00, //  note-off of 60 at 256: delta 176
    0x81, 0x10, 0xff, 0x2f, 0x00, //  end at 400: delta 144
  ];
  assert.equal(track.length, 0x19);
  assert.deepEqual([...out], [...HEADER(2), ...BPM, 0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, 0x19, ...track]);
});

test('load_hmi: tracks sized by the next table entry, end marker added when a track just runs out', () => {
  const out = load_hmi(hmi([[0x00, 0xc0, 0x05], [0x00, 0xc1, 0x07, 0x00, 0x91, 0x40, 0x40, 0x10]]));
  assert.ok(out);
  const mtrk = (data: number[]) => [0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, data.length, ...data];
  assert.deepEqual(
    [...out],
    [
      ...HEADER(3),
      ...BPM,
      ...mtrk([0x00, 0xc0, 0x05, 0x00, 0xff, 0x2f, 0x00]),
      // the pending note-off (at 16) is dropped, as in the C
      ...mtrk([0x00, 0xc1, 0x07, 0x00, 0x91, 0x40, 0x40, 0x00, 0xff, 0x2f, 0x00]),
    ],
  );
});

test('load_hmi: too short input gives null', () => {
  assert.equal(load_hmi(new Uint8Array(0x20)), null);
});

test('parseMidi reads the converted song back with notes and times', () => {
  const song = parseMidi(load_hmi(hmi([SONG]))!);
  assert.equal(song.format, 1);
  assert.equal(song.division, 192);
  const spt = 1605631 / 1e6 / 192; // seconds per tick at the bpm track's tempo 0x187FFF
  const want = [
    [0, 0xc0, 5, 0],
    [0, 0x90, 60, 100],
    [32, 0x90, 62, 80],
    [80, 0x90, 62, 0],
    [256, 0x90, 60, 0],
  ];
  assert.equal(song.events.length, want.length);
  song.events.forEach((e, i) => {
    const [tick, status, d1, d2] = want[i]!;
    assert.deepEqual([e.tick, e.status, e.data1, e.data2], [tick, status, d1, d2]);
    assert.ok(Math.abs(e.time - tick! * spt) < 1e-9, `event ${i} time ${e.time}`);
  });
  assert.ok(Math.abs(song.duration - 400 * spt) < 1e-9);
});

test('parseMidi: tempo changes, track merge, malformed data does not throw', () => {
  // format 1, 96 tpq; track 1: tempo 1 s/quarter at 0, 0.5 s/quarter at tick 96; track 2: notes
  const t1 = [0x00, 0xff, 0x51, 0x03, 0x0f, 0x42, 0x40, 0x60, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0xff, 0x2f, 0x00];
  const t2 = [0x60, 0x91, 0x40, 0x40, 0x81, 0x40, 0x41, 0x40, 0x00, 0xff, 0x2f, 0x00];
  const chunk = (d: number[]) => [0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, d.length, ...d];
  const file = Uint8Array.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 2, 0, 96, ...chunk(t1), ...chunk(t2)]);
  const song = parseMidi(file);
  assert.deepEqual(
    song.events.map((e) => [e.tick, e.status, e.data1, e.data2, e.time]),
    [
      [96, 0x91, 0x40, 0x40, 1],
      [288, 0x91, 0x41, 0x40, 2], // running status; 192 ticks at 0.5 s/quarter
    ],
  );
  for (let cut = 0; cut < file.length; cut++) parseMidi(file.subarray(0, cut));
  const junk = Uint8Array.from(file);
  for (let i = 22; i < junk.length; i += 3) junk[i] = 0xff ^ junk[i]!;
  parseMidi(junk);
  load_hmi(Uint8Array.from({ length: 0x200 }, (_, i) => (i * 37) & 0xff));
});
