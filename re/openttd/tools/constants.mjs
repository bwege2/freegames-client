#!/usr/bin/env node
// Evaluate the simple SpriteID constants in OpenTTD's src/table/sprites.h.
// They are `static const SpriteID NAME = <expr>;` with + - * / << and other
// constants, so a small fixed-point evaluator is enough (there is no C++
// compiler in the build environment for this worktree).
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] ?? new URL('../orig/openttd-15.3/src/table/sprites.h', import.meta.url).pathname;
const text = readFileSync(path, 'utf8');
const defs = new Map();
for (const m of text.matchAll(/static const(?:expr)? [A-Za-z0-9_:<>]+ ([A-Z][A-Z0-9_]+)\s*=\s*([^;]+);/g)) {
  const [, name, expr] = m;
  if (!/^[-+*/()<>0-9A-Z_\s]+$/.test(expr)) continue;
  defs.set(name, expr.trim());
}

const values = new Map();
const evalExpr = (expr) => {
  const toks = expr.replace(/\b([A-Z][A-Z0-9_]+)\b/g, (n) => {
    if (values.has(n)) return String(values.get(n));
    throw new Error(`unknown ${n}`);
  });
  if (!/^[-+*/()<>0-9\s]+$/.test(toks)) throw new Error(`unparsable ${expr}`);
  // JS has << and arithmetic; >>> is not used here.
  return Function(`"use strict"; return (${toks});`)();
};
for (let progress = true; progress;) {
  progress = false;
  for (const [name, expr] of defs) {
    if (values.has(name)) continue;
    try { values.set(name, evalExpr(expr)); progress = true; } catch { /* wait for dependencies */ }
  }
}
for (const [name, expr] of defs) if (!values.has(name)) console.error('unresolved', name, expr);

const wanted = [
  'SPR_OPENTTD_BASE', 'OPENTTD_SPRITE_COUNT', 'SPR_NEWGRFS_BASE', 'SPR_SIGNALS_BASE',
  'SPR_SHORE_BASE', 'SPR_2CCMAP_BASE', 'SPR_CANALS_BASE', 'SPR_ONEWAY_BASE',
  'SPR_TRAMWAY_BASE', 'SPR_SLOPES_BASE', 'SPR_TRACKS_FOR_SLOPES_BASE',
  'SPR_AIRPORTX_BASE', 'SPR_ROADSTOP_BASE', 'SPR_AQUEDUCT_BASE', 'SPR_AUTORAIL_BASE',
  'SPR_AIRPORT_PREVIEW_BASE', 'SPR_RAILTYPE_TUNNEL_BASE', 'SPR_PALETTE_BASE',
  'SPR_ROAD_WAYPOINTS_BASE', 'SPR_OVERLAY_ROCKS_BASE', 'SPR_BRIDGE_DECKS_BASE',
  'SPR_ELRAIL_BASE', 'SPR_MAPGEN_BEGIN', 'SPR_MAPGEN_END', 'SPR_FLAT_GRASS_TILE',
  'SPR_FLAT_WATER_TILE', 'SPR_FLAT_BARE_LAND', 'SPR_FLAT_ROUGH_LAND',
  'SPR_FLAT_ROCKY_LAND_1', 'SPR_TREE_BASE', 'SPR_HOUSE_BASE', 'SPR_INDUSTRY_BASE',
  'SPR_ORIGINALSHORE_START', 'SPR_ORIGINALSHORE_END', 'SPR_ASCII_SPACE',
  'SPR_EMPTY', 'SPR_SELECT_TILE', 'SPR_OPENTTD_BASE',
];
const out = {};
for (const w of wanted) if (values.has(w)) out[w] = values.get(w);
console.log(JSON.stringify(out, null, 1));
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(out, null, 1) + '\n');
