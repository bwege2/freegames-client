#!/usr/bin/env node
// Build the port's sprite assets from the pinned OpenTTD 15.3 / OpenGFX 8.0
// files: the six OpenGFX GRFs, OpenTTD's own openttd.grf, and the sprite
// index ranges of the climates. Output: 8bpp index atlases (one byte per
// pixel, exactly the GRF's palette indices) and a JSON of sprite rectangles.
//
// Run: node re/openttd/tools/build-assets.mjs
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readBaseGrf, readNewGrf, pick8bppAll, SPRITES } from './grf.mjs';

const here = new URL('../', import.meta.url).pathname;
const orig = here + 'orig/';
const out = here + '../../web/games/openttd/assets/sprites/';
mkdirSync(out, { recursive: true });

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const base = readBaseGrf(orig + 'opengfx-8.0/ogfx1_base.grf');
const logos = readBaseGrf(orig + 'opengfx-8.0/ogfxi_logos.grf');
const climates = {
  arctic: readBaseGrf(orig + 'opengfx-8.0/ogfxc_arctic.grf'),
  tropic: readBaseGrf(orig + 'opengfx-8.0/ogfxh_tropical.grf'),
  toyland: readBaseGrf(orig + 'opengfx-8.0/ogfxt_toyland.grf'),
};
const extraDefault = readNewGrf(orig + 'openttd-15.3/media/baseset/openttd.grf', SPRITES.SPR_NEWGRFS_BASE);
const extraBaseset = readNewGrf(orig + 'opengfx-8.0/ogfxe_extra.grf', SPRITES.SPR_NEWGRFS_BASE);

// The climate sprite index ranges (src/table/landscape_sprite.h), read from
// the source so they cannot drift from the pinned version.
const lsh = readFileSync(orig + 'openttd-15.3/src/table/landscape_sprite.h', 'utf8');
const ranges = {};
for (const m of lsh.matchAll(/static constexpr std::pair<SpriteID, SpriteID> _landscape_spriteindexes_(\w+)\[\] = \{([\s\S]*?)\n\};/g)) {
  ranges[m[1]] = [...m[2].matchAll(/\{\s*(0x[0-9A-Fa-f]+|\d+)\s*,\s*(0x[0-9A-Fa-f]+|\d+)\s*\}/g)]
    .map((r) => [Number(r[1]), Number(r[2])]);
}
const rangeFor = { arctic: 'arctic', tropic: 'tropic', toyland: 'toyland' };

const copyMap = (src) => new Map(src);
const applySequence = (map, seq, ids) => {
  if (seq.length !== ids.length) throw new Error(`sequence ${seq.length} does not fit ${ids.length} ids`);
  seq.forEach((entry, i) => { if (entry) map.set(ids[i], entry); });
};

const baseMap = new Map();
for (let id = 0; id < base.sequence.length; id++) if (base.sequence[id]) baseMap.set(id, base.sequence[id]);
// logos load at 4793
for (let i = 0; i < logos.sequence.length; i++) if (logos.sequence[i]) baseMap.set(4793 + i, logos.sequence[i]);

// Start from base + logos, then the climate's replacements, then the two
// extra GRFs (default extra first, baseset extra last: src/gfxinit.cpp).
const finals = {};
for (const [climate, grf] of Object.entries(climates)) {
  const map = copyMap(baseMap);
  const ids = [];
  for (const [lo, hi] of ranges[rangeFor[climate]]) for (let id = lo; id <= hi; id++) ids.push(id);
  applySequence(map, grf.sequence, ids);
  for (const [id, entry] of extraDefault.sprites) map.set(id, entry);
  for (const [id, entry] of extraDefault.recolours) map.set(id, { recolour: entry });
  for (const [id, entry] of extraBaseset.sprites) map.set(id, entry);
  for (const [id, entry] of extraBaseset.recolours) map.set(id, { recolour: entry });
  finals[climate] = map;
}
{
  const map = copyMap(baseMap);
  for (const [id, entry] of extraDefault.sprites) map.set(id, entry);
  for (const [id, entry] of extraDefault.recolours) map.set(id, { recolour: entry });
  for (const [id, entry] of extraBaseset.sprites) map.set(id, entry);
  for (const [id, entry] of extraBaseset.recolours) map.set(id, { recolour: entry });
  finals.temperate = map;
}

// ActivateOldShore (src/newgrf.cpp): the old shore sprites are duplicated to
// the shore sprite range after the extra GRFs are loaded.
const OLD_SHORE = [[4063, 5937], [4064, 5938], [4068, 5939], [4062, 5940],
  [4066, 5942], [4065, 5944], [4069, 5945], [4067, 5948]];
for (const map of Object.values(finals)) {
  for (const [from, to] of OLD_SHORE) {
    const entry = map.get(from);
    if (entry) map.set(to, entry);
  }
}

// Collect every image variant once, then pack with a shelf packer.
const variants = new Set();
for (const map of Object.values(finals)) {
  for (const entry of map.values()) if (entry.variants) for (const v of entry.variants) variants.add(v);
}
const all = [...variants].sort((a, b) => b.height - a.height || b.width - a.width);
const ATLAS = 2048, PAD = 1;
const atlases = [];
let cx = 0, cy = 0, rowH = 0, current = null;
const place = (s) => {
  if (!current || cx + s.width + PAD > ATLAS) {
    if (current && cy + rowH + PAD <= ATLAS) { /* next row */ } else if (current) { /* new atlas */ }
    if (current && cx + s.width + PAD > ATLAS) { cx = 0; cy += rowH; rowH = 0; }
    if (!current || cy + s.height + PAD > ATLAS) {
      current = { width: ATLAS, height: ATLAS, data: new Uint8Array(ATLAS * ATLAS), used: 0 };
      atlases.push(current); cx = 0; cy = 0; rowH = 0;
    }
  }
  if (s.width > ATLAS || s.height > ATLAS) throw new Error(`sprite too large ${s.width}x${s.height}`);
  const x = cx, y = cy;
  for (let r = 0; r < s.height; r++) current.data.set(s.pixels.subarray(r * s.width, (r + 1) * s.width), (y + r) * ATLAS + x);
  current.used += s.width * s.height;
  s.atlas = current; s.x = x; s.y = y;
  cx += s.width + PAD;
  if (s.height > rowH) rowH = s.height;
};
for (const v of all) place(v);
while (atlases.length && atlases[atlases.length - 1].used === 0) atlases.pop();

// Write atlases and the per-climate sprite tables.
const atlasFiles = [];
for (let i = 0; i < atlases.length; i++) {
  const file = `atlas-${i}.bin`;
  writeFileSync(out + file, atlases[i].data);
  atlasFiles.push({ file, width: atlases[i].width, height: atlases[i].height, sha256: sha256(atlases[i].data), usedPixels: atlases[i].used });
}

const table = {};
const recolourTable = {};
for (const [climate, map] of Object.entries(finals)) {
  const sprites = {}, recolours = {};
  for (const [id, entry] of map) {
    if (entry.variants) sprites[id] = entry.variants.map((v) => ({ a: atlases.indexOf(v.atlas), x: v.x, y: v.y, w: v.width, h: v.height, xo: v.xoff, yo: v.yoff, z: v.zoom }));
    else recolours[id] = Buffer.from(entry.recolour).toString('hex');
  }
  table[climate] = sprites;
  recolourTable[climate] = recolours;
}
writeFileSync(out + 'sprites.json', JSON.stringify({ atlases: atlasFiles, moves: 0, sprites: table, recolours: recolourTable }));

const source = {
  'opengfx-8.0/ogfx1_base.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfx1_base.grf')),
  'opengfx-8.0/ogfxi_logos.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfxi_logos.grf')),
  'opengfx-8.0/ogfxc_arctic.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfxc_arctic.grf')),
  'opengfx-8.0/ogfxh_tropical.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfxh_tropical.grf')),
  'opengfx-8.0/ogfxt_toyland.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfxt_toyland.grf')),
  'opengfx-8.0/ogfxe_extra.grf': sha256(readFileSync(orig + 'opengfx-8.0/ogfxe_extra.grf')),
  'openttd-15.3/media/baseset/openttd.grf': sha256(readFileSync(orig + 'openttd-15.3/media/baseset/openttd.grf')),
};
const manifest = {
  source,
  baseEntries: base.count, baseImages: base.stats.images, baseRecolours: base.stats.recolours,
  logoEntries: logos.count,
  climates: Object.fromEntries(Object.entries(climates).map(([k, v]) => [k, { entries: v.count, images: v.stats.images, recolours: v.stats.recolours, ranges: ranges[rangeFor[k]] }])),
  extras: {
    default: { entries: extraDefault.stats.entries, images: extraDefault.sprites.size, recolours: extraDefault.recolours.size },
    baseset: { entries: extraBaseset.stats.entries, images: extraBaseset.sprites.size, recolours: extraBaseset.recolours.size },
  },
  finals: Object.fromEntries(Object.entries(finals).map(([k, m]) => [k, { ids: m.size }])),
  atlases: atlasFiles,
  uniqueSprites: all.length,
  pixels: all.reduce((s, v) => s + v.width * v.height, 0),
};
writeFileSync(out + 'manifest.json', JSON.stringify(manifest, null, 1) + '\n');
console.log('wrote', atlasFiles.length, 'atlases,', all.length, 'unique sprites,', manifest.pixels, 'pixels');
console.log('final ids:', manifest.finals);
