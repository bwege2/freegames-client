#!/usr/bin/env node
// Read the map arrays out of an OpenTTD 15.3 savegame (uncompressed or zlib)
// for the tests. Only the CH_RIFF map chunks MAPT (tile type) and MAPH (tile
// height) are needed; the full format is docs/savegame_format.md.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

export function saveData(file) {
  const b = readFileSync(file);
  const tag = b.subarray(0, 4).toString('latin1');
  const version = (b[4] << 8) | b[5];
  if (tag === 'OTTN') return { version, data: b.subarray(8) };
  if (tag === 'OTTZ') return { version, data: inflateSync(b.subarray(8)) };
  throw new Error(`unsupported savegame compression ${tag}; set savegame_format = zlib or none`);
}

/** The CH_RIFF chunk with this tag (the map chunks), big-endian uint24 length. */
export function riffChunk(data, tag) {
  const needle = Buffer.from(tag);
  let at = 0;
  for (;;) {
    at = data.indexOf(needle, at);
    if (at < 0) throw new Error(`chunk ${tag} not found`);
    const type = data[at + 4];
    if ((type & 0x0f) === 0) {
      const length = (data[at + 5] << 16) | (data[at + 6] << 8) | data[at + 7];
      return { type, length, payload: data.subarray(at + 8, at + 8 + length) };
    }
    at += 4;
  }
}

export function readMap(file, mapSize) {
  const { version, data } = saveData(file);
  const type = riffChunk(data, 'MAPT');
  const height = riffChunk(data, 'MAPH');
  const size = mapSize ?? Math.round(Math.sqrt(type.length));
  if (type.length !== size * size || height.length !== size * size) {
    throw new Error(`map chunk lengths ${type.length}/${height.length} do not fit ${size}x${size}`);
  }
  const extra = {};
  for (const tag of ['MAPO', 'MAP5']) {
    try {
      const c = riffChunk(data, tag);
      if (c.length === size * size) extra[tag === 'MAPO' ? 'm1' : 'm5'] = new Uint8Array(c.payload);
    } catch { /* optional chunk */ }
  }
  return { version, size, type: new Uint8Array(type.payload), height: new Uint8Array(height.payload), ...extra };
}
