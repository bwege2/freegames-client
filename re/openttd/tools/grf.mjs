#!/usr/bin/env node
// OpenTTD (New)GRF container v2 reader: sprites, recolour palettes and the
// Action 5/8/0A subset the base sets use.
//
// The format is read from the pinned source:
//   src/spriteloader/sprite_file.cpp       container header, sprite section
//   src/spriteloader/grf.cpp               sprite decode (RLE, chunked rows)
//   src/spritecache.cpp                    LoadNextSprite, recolour sprites
//   src/newgrf/newgrf_act5.cpp             Action 5
//   src/newgrf/newgrf_acta.cpp             Action 0x0A
//   src/newgrf/newgrf_act1.cpp, act12.cpp  sequential sprite consumers
//   src/newgrf.cpp                         the data-section loop
//   src/gfxinit.cpp                        how the base sets are loaded

import { readFileSync } from 'node:fs';

export const GRF_SIGNATURE = Buffer.from([0x47, 0x52, 0x46, 0x82, 0x0d, 0x0a, 0x1a, 0x0a]);

const u8 = (b, o) => b[o];
const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const i16 = (b, o) => (b[o] | (b[o + 1] << 8)) << 16 >> 16;
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

/** E (extended byte): a byte, or 0xFF followed by a 16-bit little-endian word
 * (src/newgrf/newgrf_bytereader.h: ReadExtendedByte). */
function extByte(b, o) {
  const v = b[o.i++];
  if (v !== 0xff) return v;
  const r = u16(b, o.i);
  o.i += 2;
  return r;
}

/** Decode OpenTTD's sprite RLE (src/spriteloader/grf.cpp: DecodeSingleSprite). */
export function decodeRle(src, pos, size) {
  const out = new Uint8Array(size);
  let d = 0;
  while (d < size) {
    const code = (src[pos++] << 24) >> 24; // signed
    if (code >= 0) {
      const n = code === 0 ? 0x80 : code;
      if (d + n > size) throw new Error('RLE literal overrun');
      out.set(src.subarray(pos, pos + n), d);
      pos += n;
      d += n;
    } else {
      const offset = ((code & 7) << 8) | src[pos++];
      const n = -(code >> 3);
      if (offset === 0 || offset > d || d + n > size) throw new Error('RLE copy overrun');
      for (let i = 0; i < n; i++) out[d + i] = out[d - offset + i];
      d += n;
    }
  }
  return out;
}

/** Sprite components in the "type" byte (src/spriteloader/spriteloader.hpp). */
const C_RGB = 1, C_ALPHA = 2, C_PALETTE = 4;

/**
 * Decode one sprite from the sprite section.
 * @param {Buffer} file
 * @param {{offset:number, length:number, colour:number, zoom:number}} entry
 * @returns {{width:number,height:number,xoff:number,yoff:number,pixels:Uint8Array,alpha:Uint8Array|null}}
 */
export function decodeSprite(file, entry) {
  const colour = entry.colour;
  const type = colour & ~7;
  const bpp = ((colour & C_RGB) ? 3 : 0) + ((colour & C_ALPHA) ? 1 : 0) + ((colour & C_PALETTE) ? 1 : 0);
  let pos = entry.offset;
  const height = u16(file, pos); pos += 2;
  const width = u16(file, pos); pos += 2;
  const xoff = i16(file, pos); pos += 2;
  const yoff = i16(file, pos); pos += 2;

  if (width > 0x7fff || height > 0x7fff) throw new Error(`bad sprite size ${width}x${height}`);
  const chunked = (type & 0x08) !== 0;
  const decompSize = chunked ? u32(file, pos) : width * height * bpp;
  if (chunked) pos += 4;
  const raw = decodeRle(file, pos, decompSize);
  const pixels = new Uint8Array(width * height * bpp); // 0 = transparent
  const alpha = (colour & C_ALPHA) ? new Uint8Array(width * height).fill(255) : null;

  if (!chunked) {
    const need = width * height * bpp;
    pixels.set(raw.subarray(0, Math.min(need, raw.length)));
  } else {
    const wide = width > 256;
    for (let y = 0; y < height; y++) {
      let p;
      if (wide) {
        p = (raw[y * 4] | (raw[y * 4 + 1] << 8) | (raw[y * 4 + 2] << 16) | (raw[y * 4 + 3] << 24)) >>> 0;
      } else {
        p = raw[y * 2] | (raw[y * 2 + 1] << 8);
      }
      for (;;) {
        let last, len, skip;
        if (wide) {
          last = (raw[p + 1] & 0x80) !== 0;
          len = ((raw[p + 1] & 0x7f) << 8) | raw[p];
          skip = raw[p + 2] | (raw[p + 3] << 8);
          p += 4;
        } else {
          last = (raw[p] & 0x80) !== 0;
          len = raw[p++] & 0x7f;
          skip = raw[p++];
        }
        if (skip + len > width) throw new Error('chunked sprite row overrun');
        for (let x = 0; x < len; x++) {
          const di = (y * width + skip + x) * bpp;
          let si = p;
          if (colour & C_RGB) { pixels[di] = raw[si++]; pixels[di + 1] = raw[si++]; pixels[di + 2] = raw[si++]; }
          if (colour & C_ALPHA) { pixels[di + ((colour & C_RGB) ? 3 : 0)] = raw[si++]; }
          if (colour & C_PALETTE) { pixels[di + ((colour & C_RGB) ? 3 : 0) + ((colour & C_ALPHA) ? 1 : 0)] = raw[si++]; }
          p = si;
        }
        if (last) break;
      }
    }
  }

  if (alpha) {
    // Rebuild the per-pixel alpha plane for RGBA sprites.
    let ai = 0, pi = 0;
    for (let i = 0; i < width * height; i++) {
      if (colour & C_RGB) pi += 3;
      if (colour & C_ALPHA) alpha[ai++] = pixels[pi++];
      if (colour & C_PALETTE) pi++;
    }
  }
  return { width, height, xoff, yoff, pixels, alpha, components: colour };
}

/**
 * Parse the sprite section into a map id -> entries.
 * Container v2: after the signature a u32 offset (relative to the current
 * position), a compression byte, then the data section; the sprite section has
 * entries of id, length, colour, zoom, payload.
 */
export function parseSpriteSection(file) {
  if (u16(file, 0) !== 0) throw new Error('not a container v2 GRF');
  if (!file.subarray(2, 10).equals(GRF_SIGNATURE)) throw new Error('bad GRF signature');
  const dataOffset = u32(file, 10);
  const spriteSection = 14 + dataOffset;
  const sprites = new Map(); // id -> [{colour, zoom, offset, length}]
  let p = spriteSection;
  for (;;) {
    const id = u32(file, p);
    if (id === 0) break;
    const length = u32(file, p + 4);
    const colour = u8(file, p + 8);
    const zoom = length >= 2 ? u8(file, p + 9) : 255;
    const offset = p + 10; // after id, length, colour and zoom
    let list = sprites.get(id);
    if (!list) sprites.set(id, list = []);
    list.push({ colour, zoom, offset, length });
    p += 8 + length;
  }
  if (p !== file.length - 4) throw new Error(`sprite section ends at ${p}, file has ${file.length}`);
  return { sprites, spriteSection, dataStart: 15 };
}

/** Iterate the data section. Returns entries with their payload slice. */
export function dataEntries(file) {
  const out = [];
  let p = 15;
  for (;;) {
    const num = u32(file, p); p += 4;
    if (num === 0) break;
    const type = u8(file, p); p += 1;
    if (type === 0xfd) {
      const ref = u32(file, p); p += 4;
      out.push({ kind: 'sprite', ref, num, type, at: p - 5 });
    } else if (type === 0xff) {
      const payload = file.subarray(p, p + num); p += num;
      out.push({ kind: 'special', payload, num, type, at: p - num - 1 });
    } else {
      // Inline real sprite: 7 header bytes + (num - 8) data bytes.
      const offset = p;
      const payload = file.subarray(p, p + num - 1);
      p += num - 1;
      out.push({ kind: 'inline', payload, num, type, offset, at: p - num });
    }
  }
  return out;
}

/** Choose the 8bpp palette sprite variants (normal and 2x zoom) of a label. */
export function pick8bppAll(file, list) {
  const good = list.filter((e) => (e.colour & 4) && (e.colour & 3) === 0 && (e.zoom === 0 || e.zoom === 2));
  const seen = new Set();
  const out = [];
  for (const e of good) {
    if (seen.has(e.zoom)) continue;
    seen.add(e.zoom);
    const sprite = decodeSprite(file, e);
    sprite.zoom = e.zoom;
    out.push(sprite);
  }
  return out.sort((a, b) => a.zoom - b.zoom);
}

/** Choose one unzoomed 8bpp palette sprite (for callers that only need one). */
export function pick8bpp(list) {
  const good = list.filter((e) => (e.colour & 4) && (e.colour & 3) === 0);
  return good.find((e) => e.zoom === 0) ?? good.find((e) => e.zoom === 2) ?? null;
}

/**
 * Read a GRF whose data section is a sequence of sprites only (base sets):
 * each entry, including a recolour sprite, takes the next global sprite id.
 */
export function readBaseGrf(path) {
  const file = readFileSync(path);
  const { sprites } = parseSpriteSection(file);
  const entries = dataEntries(file);
  const result = { path, sprites: new Map(), recolours: new Map(), sequence: [], stats: { entries: entries.length, images: 0, recolours: 0, missing: 0 } };
  let id = 0;
  for (const e of entries) {
    if (e.kind === 'sprite') {
      const list = sprites.get(e.ref);
      if (!list) throw new Error(`sprite ref ${e.ref} at ${e.at} missing from sprite section`);
      const variants = pick8bppAll(file, list);
      if (variants.length) { result.sprites.set(id, { variants }); result.sequence.push({ variants }); result.stats.images++; }
      else { result.sequence.push(null); result.stats.missing++; }
    } else if (e.kind === 'special') {
      // Base sets: a recolour sprite, 257 bytes (index 0 unused).
      const data = Buffer.from(e.payload);
      result.recolours.set(id, data);
      result.sequence.push({ recolour: data });
      result.stats.recolours++;
    } else {
      throw new Error('inline sprite in a base set');
    }
    id++;
  }
  result.count = id;
  return result;
}

/**
 * Read a NewGRF the way src/newgrf.cpp does for the sprite stream: actions
 * 5 and 0x0A place sprites at absolute ids, actions 1 and 0x12 consume
 * sequential sprites (which we skip), everything else is metadata.
 */
export function readNewGrf(path, startSpriteId = 0) {
  const file = readFileSync(path);
  const { sprites } = parseSpriteSection(file);
  const entries = dataEntries(file);
  const result = { path, sprites: new Map(), recolours: new Map(), sequential: [], stats: { entries: entries.length, images: 0, actions: {} } };
  let cursor = 0;
  let lastAction = -1;

  const takeSprite = () => {
    if (cursor >= entries.length) throw new Error('sprite stream ended inside an action');
    const e = entries[cursor++];
    if (e.kind === 'special') {
      // A 0xFF entry in a sprite stream is a recolour sprite (LoadNextSprite).
      if (e.num === 1) return null; // empty pseudo-sprite
      return { recolour: Buffer.from(e.payload) };
    }
    if (e.kind !== 'sprite') throw new Error(`expected a real sprite at entry ${cursor - 1}, got ${e.kind} (after action 0x${lastAction.toString(16)})`);
    const list = sprites.get(e.ref);
    if (!list) throw new Error(`sprite ref ${e.ref} missing`);
    const variants = pick8bppAll(file, list);
    return variants.length ? { variants } : null;
  };
  const skipSprites = (n) => { for (let i = 0; i < n; i++) takeSprite(); };
  const assign = (id, item) => {
    if (!item) return;
    if (item.recolour) result.recolours.set(id, item.recolour);
    else { result.sprites.set(id, { variants: item.variants }); result.stats.images++; }
  };

  while (cursor < entries.length) {
    const e = entries[cursor++];
    if (e.kind !== 'special') throw new Error(`unexpected real sprite at data entry ${cursor - 1}`);
    const a = e.payload;
    const action = a[0];
    lastAction = action;
    result.stats.actions[action] = (result.stats.actions[action] ?? 0) + 1;
    const r = { i: 1 };
    switch (action) {
      case 0x01: { // Action1: <feature> <num-sets> <num-ent> [extended]
        r.i = 1; a[r.i++]; // feature
        let sets = a[r.i++];
        if (sets === 0 && a.length - r.i >= 3) { extByte(a, r); sets = extByte(a, r); }
        const nents = extByte(a, r);
        skipSprites(sets * nents);
        break;
      }
      case 0x05: { // Action5: <type> <num> [offset] then sprites
        const t = a[r.i++];
        const num = extByte(a, r);
        const offset = (t & 0x80) ? extByte(a, r) : 0;
        const type = t & 0x7f;
        const bases = ACTION5_BASES[type];
        if (bases === undefined) { skipSprites(num); break; }
        if (type === 0x0d && num === 10) {
          // The special openttd.grf shore block (newgrf_act5.cpp): the ten
          // sprites go to these fixed ids, not to consecutive ones.
          const ids = [0, 5, 7, 10, 11, 13, 14, 15, 16, 17];
          for (const o of ids) assign(SPRITES.SPR_SHORE_BASE + o, takeSprite());
          break;
        }
        const target = bases + offset;
        for (let i = 0; i < num; i++) assign(target + i, takeSprite());
        break;
      }
      case 0x0a: { // ActionA: <num-sets> {<num-sprites> <first-sprite>} then sprites
        const sets = a[r.i++];
        const plans = [];
        for (let i = 0; i < sets; i++) { const n = a[r.i++]; const first = u16(a, r.i); r.i += 2; plans.push({ n, first }); }
        for (const p of plans) {
          for (let j = 0; j < p.n; j++) assign(p.first + j, takeSprite());
        }
        break;
      }
      case 0x08: // Action8: GRF metadata.
      case 0x00: case 0x02: case 0x03: case 0x04: case 0x06: case 0x07: case 0x09:
      case 0x0b: case 0x0c: case 0x0d: case 0x0e: case 0x0f: case 0x10: case 0x13: case 0x14:
        break;
      case 0x11: { // sounds, no sprites
        break;
      }
      case 0x12: { // font glyphs: each definition consumes num_char sprites
        const numDef = a[r.i++];
        for (let i = 0; i < numDef; i++) { a[r.i++]; const n = a[r.i++]; u16(a, r.i); r.i += 2; skipSprites(n); }
        break;
      }
      default:
        // Unknown actions in these system GRFs (0x67, 0xE2) carry no sprites.
        break;
    }
  }
  return result;
}

// SpriteID bases from src/table/sprites.h (evaluated by constants.mjs).
export const SPRITES = {
  SPR_OPENTTD_BASE: 4896,
  OPENTTD_SPRITE_COUNT: 192,
  SPR_NEWGRFS_BASE: 6264,
  SPR_SIGNALS_BASE: 5088,
  SPR_ELRAIL_BASE: 5632,
  SPR_SHORE_BASE: 5936,
  SPR_2CCMAP_BASE: 5680,
  SPR_CANALS_BASE: 5328,
  SPR_ONEWAY_BASE: 6105,
  SPR_TRAMWAY_BASE: 5986,
  SPR_SLOPES_BASE: 5413,
  SPR_TRACKS_FOR_SLOPES_BASE: 5401,
  SPR_AIRPORTX_BASE: 5954,
  SPR_ROADSTOP_BASE: 5978,
  SPR_AQUEDUCT_BASE: 5393,
  SPR_AUTORAIL_BASE: 5577,
  SPR_AIRPORT_PREVIEW_BASE: 5969,
  SPR_RAILTYPE_TUNNEL_BASE: 6123,
  SPR_PALETTE_BASE: 6140,
  SPR_ROAD_WAYPOINTS_BASE: 6141,
  SPR_OVERLAY_ROCKS_BASE: 6145,
  SPR_BRIDGE_DECKS_BASE: 6240,
  SPR_MAPGEN_BEGIN: 4845,
  SPR_MAPGEN_END: 4882,
  SPR_FLAT_GRASS_TILE: 3981,
  SPR_FLAT_WATER_TILE: 4061,
  SPR_FLAT_BARE_LAND: 3924,
  SPR_FLAT_ROUGH_LAND: 4000,
  SPR_FLAT_ROCKY_LAND_1: 4023,
  SPR_ORIGINALSHORE_START: 4062,
  SPR_ORIGINALSHORE_END: 4069,
  SPR_EMPTY: 4078,
  SPR_SELECT_TILE: 752,
};

export const ACTION5_BASES = {
  0x04: SPRITES.SPR_SIGNALS_BASE,
  0x05: SPRITES.SPR_ELRAIL_BASE,
  0x06: SPRITES.SPR_SLOPES_BASE,
  0x08: SPRITES.SPR_CANALS_BASE,
  0x09: SPRITES.SPR_ONEWAY_BASE,
  0x0a: SPRITES.SPR_2CCMAP_BASE,
  0x0b: SPRITES.SPR_TRAMWAY_BASE,
  0x0d: SPRITES.SPR_SHORE_BASE,
  0x0f: SPRITES.SPR_TRACKS_FOR_SLOPES_BASE,
  0x10: SPRITES.SPR_AIRPORTX_BASE,
  0x11: SPRITES.SPR_ROADSTOP_BASE,
  0x12: SPRITES.SPR_AQUEDUCT_BASE,
  0x13: SPRITES.SPR_AUTORAIL_BASE,
  0x15: SPRITES.SPR_OPENTTD_BASE,
  0x16: SPRITES.SPR_AIRPORT_PREVIEW_BASE,
  0x17: SPRITES.SPR_RAILTYPE_TUNNEL_BASE,
  0x18: SPRITES.SPR_PALETTE_BASE,
  0x19: SPRITES.SPR_ROAD_WAYPOINTS_BASE,
  0x1a: SPRITES.SPR_OVERLAY_ROCKS_BASE,
  0x1b: SPRITES.SPR_BRIDGE_DECKS_BASE,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL('../orig/', import.meta.url).pathname;
  const base = readBaseGrf(root + 'opengfx-8.0/ogfx1_base.grf');
  console.log('base:', base.count, base.stats, 'pixels', [...base.sprites.values()].reduce((s, x) => s + x.width * x.height, 0));
  const extra = readNewGrf(root + 'openttd-15.3/media/baseset/openttd.grf', 0);
  console.log('openttd.grf:', extra.stats, 'max id', Math.max(...extra.sprites.keys()), 'pixels', [...extra.sprites.values()].reduce((s, x) => s + x.width * x.height, 0));
  const bx = readNewGrf(root + 'opengfx-8.0/ogfxe_extra.grf', 0);
  console.log('ogfxe_extra:', bx.stats, 'max id', Math.max(...bx.sprites.keys()), 'pixels', [...bx.sprites.values()].reduce((s, x) => s + x.width * x.height, 0));
}
