// The parts of src/landscape.cpp, src/heightmap.cpp (FixSlopes),
// src/water_cmd.cpp and src/clear_cmd.cpp that turn the TGP height map into
// the tile map of a new game, in the original's order (src/genworld.cpp):
// heights, FixSlopes, water, GenerateClearTile. Rivers, towns, industries,
// objects and trees are later stages.

import type { HeightMap } from './tgp.ts';
import { RandomContext } from './random.ts';
import {
  ClearGround, DIR_OFFSET, FLOOD_FROM_DIRS, MAX_TILE_HEIGHT, SLOPE_STEEP, TileType, World,
  TROPICZONE_DESERT, TROPICZONE_RAINFOREST,
} from './world.ts';
import { Landscape, type GenerationSettings } from './settings.ts';
import { createRivers } from './rivers.ts';
import { getTreeGround, setTreeGroundDensity, tileLoopTrees, TreeGround } from './trees.ts';

/** InitializeLandscape from src/landscape.cpp: the map buffer's first state. */
export function initializeLandscape(world: World, freeformEdges: boolean): void {
  const start = freeformEdges ? 1 : 0;
  for (let y = start; y < world.sizeY - 1; y++) {
    for (let x = start; x < world.sizeX - 1; x++) {
      const tile = world.tileXY(x, y);
      world.makeClear(tile, ClearGround.Grass, 3);
      world.setTileHeight(tile, 0);
      world.type[tile] = (world.type[tile] & 0xf0); // TropicZone::Normal
      world.m6[tile] = 0; // ClearBridgeMiddle
    }
  }
  for (let x = 0; x < world.sizeX; x++) world.makeVoid(world.tileXY(x, world.sizeY - 1));
  for (let y = 0; y < world.sizeY; y++) world.makeVoid(world.tileXY(world.sizeX - 1, y));
}

/** TgenSetTileHeight + the transfer loop at the end of GenerateTerrainPerlin. */
export function applyHeights(world: World, hm: HeightMap, maxHeight: number, freeformEdges: boolean): void {
  // GenerateTerrainPerlin makes the north and west border void first, then
  // transfers the heights to every tile (void included; only inner tiles are
  // turned into clear grass by TgenSetTileHeight).
  if (freeformEdges) {
    for (let x = 0; x < world.sizeX; x++) world.makeVoid(world.tileXY(x, 0));
    for (let y = 0; y < world.sizeY; y++) world.makeVoid(world.tileXY(0, y));
  }
  for (let y = 0; y < hm.sizeY; y++) {
    for (let x = 0; x < hm.sizeX; x++) {
      const tile = world.tileXY(x, y);
      const h = hm.h[x + y * hm.dimX] >> 4;
      world.setTileHeight(tile, Math.min(maxHeight, Math.max(0, h)));
      if (world.isInnerTile(tile)) world.makeClear(tile, ClearGround.Grass, 3);
    }
  }
}

/** FixSlopes from src/heightmap.cpp: no step may be steeper than one level. */
export function fixSlopes(world: World, mapHeightLimit: number, rng: RandomContext): void {
  const width = world.sizeX, height = world.sizeY;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      let current = MAX_TILE_HEIGHT;
      if (col !== 0) current = world.tileHeight(world.tileXY(col - 1, row));
      if (row !== 0) current = Math.min(current, world.tileHeight(world.tileXY(col, row - 1)));
      const tile = world.tileXY(col, row);
      if (world.tileHeight(tile) >= current + 2) {
        world.setTileHeight(tile, current + 1);
        if (world.isInnerTile(tile) && rng.nextRange(mapHeightLimit) <= current) world.makeClear(tile, ClearGround.Rocks, 3);
      }
    }
  }
  for (let row = height - 1; row >= 0; row--) {
    for (let col = width - 1; col >= 0; col--) {
      let current = MAX_TILE_HEIGHT;
      if (col !== width - 1) current = world.tileHeight(world.tileXY(col + 1, row));
      if (row !== height - 1) current = Math.min(current, world.tileHeight(world.tileXY(col, row + 1)));
      const tile = world.tileXY(col, row);
      if (world.tileHeight(tile) >= current + 2) {
        world.setTileHeight(tile, current + 1);
        if (world.isInnerTile(tile) && rng.nextRange(mapHeightLimit) <= current) world.makeClear(tile, ClearGround.Rocks, 3);
      }
    }
  }
}

/** ConvertGroundTilesIntoWaterTiles from src/water_cmd.cpp. */
export function convertGroundTilesIntoWaterTiles(world: World): void {
  for (let tile = 0; tile < world.size; tile++) {
    if (world.tileType(tile) !== TileType.Clear) continue;
    const slope = world.tileSlope(tile);
    const z = world.tileZ(tile);
    if (z !== 0) continue;
    switch (slope) {
      case 0x00:
        world.makeSea(tile);
        break;
      case 0x08: case 0x04: case 0x02: case 0x01: // SLOPE_N/E/S/W
        world.makeShore(tile);
        break;
      default: {
        const dirs = FLOOD_FROM_DIRS[slope & ~SLOPE_STEEP] ?? [];
        for (const dir of dirs) {
          const [dx, dy] = DIR_OFFSET[dir];
          const x = world.tileX(tile) + dx, y = world.tileY(tile) + dy;
          if (!world.inMap(x, y)) { world.makeShore(tile); break; }
          const dest = world.tileXY(x, y);
          const slopeDest = world.tileSlope(dest) & ~SLOPE_STEEP;
          if (slopeDest === 0x00 || slopeDest === 0x01 || slopeDest === 0x02 || slopeDest === 0x04 || slopeDest === 0x08 || world.tileType(dest) === TileType.Void) {
            world.makeShore(tile);
            break;
          }
        }
        break;
      }
    }
  }
}

function setClearGroundDensity(world: World, tile: number, ground: ClearGround, density: number): void {
  world.m5[tile] = (ground << 2) | (density & 3);
}

/** GenerateClearTile from src/clear_cmd.cpp: rough land and rocky patches. */
export function generateClearTile(world: World, rng: RandomContext): void {
  const isClear = (t: number): boolean => world.tileType(t) === TileType.Clear;
  const isDesert = (t: number): boolean => isClear(t) && world.clearGround(t) === ClearGround.Desert;

  let i = world.scaleBySize((rng.next() & 0x3ff) + 0x400);
  const gi = world.scaleBySize((rng.next() & 0x7f) + 0x80);
  do {
    const tile = world.wrapTile(rng.next());
    if (isClear(tile) && !isDesert(tile)) setClearGroundDensity(world, tile, ClearGround.Rough, 3);
  } while (--i > 0);

  i = gi;
  if (i > 0) {
    do {
      const r = rng.next();
      let tile = world.wrapTile(r);
      if (isClear(tile) && !isDesert(tile)) {
        let j = ((r >>> 16) & 0xf) + 5;
        for (;;) {
          setClearGroundDensity(world, tile, ClearGround.Rocks, 3);
          let next = -1;
          for (;;) {
            if (--j === 0) break;
            const dir = rng.next() & 3;
            const [dx, dy] = DIR_OFFSET[[1, 3, 5, 7][dir] ?? 0];
            const nx = world.tileX(tile) + dx, ny = world.tileY(tile) + dy;
            if (!world.inMap(nx, ny)) { next = -1; break; }
            next = world.tileXY(nx, ny);
            if (isClear(next) && !isDesert(next)) break;
          }
          if (j === 0 || next < 0) break;
          tile = next;
        }
      }
    } while (--i > 0);
  }
}

/** GenerateLandscape for TerraGenesis, in the original's order. */
export interface LandscapeResult {
  snowLine: number;
  runner: TileLoopRunner;
}

export function generateLandscape(world: World, hm: HeightMap, maxHeight: number, mapHeightLimit: number, settings: GenerationSettings, rng: RandomContext): LandscapeResult {
  world.landscapeKind = settings.landscape;
  initializeLandscape(world, settings.freeformEdges);
  applyHeights(world, hm, maxHeight, settings.freeformEdges);
  fixSlopes(world, mapHeightLimit, rng);
  convertGroundTilesIntoWaterTiles(world);

  let snowLine = settings.snowLineHeight;
  const runner = new TileLoopRunner(world, settings, rng);
  if (settings.landscape === Landscape.Arctic) {
    snowLine = calculateSnowLine(world, settings);
  } else if (settings.landscape === Landscape.Tropic) {
    createDesertOrRainForest(world, settings, snowLine, runner);
  }

  createRivers(world, settings, rng, runner, snowLine, mapHeightLimit);

  // _GenerateWorld calls GenerateClearTile after GenerateLandscape.
  generateClearTile(world, rng);
  return { snowLine, runner };
}


// ---- Climate post-processing and the tile loop ----------------------------
// src/landscape.cpp CalculateCoverageLine/CreateDesertOrRainForest and
// src/clear_cmd.cpp TileLoop_Clear.

// src/table/genland.h `_make_desert_or_rainforest_data`: the 11x11 square
// around a tile plus 28 tiles at distance six that smooth the transition.
const DESERT_OFFSETS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) out.push([dx, dy]);
  for (let d = -3; d <= 3; d++) {
    out.push([6, d], [-6, d]);
    out.push([d, 6], [d, -6]);
  }
  return out;
})();

export function calculateCoverageLine(world: World, coverage: number, edgeMultiplier: number): number {
  const histogram = new Int32Array(256);
  const edgeHistogram = new Int32Array(256);
  for (let tile = 0; tile < world.size; tile++) {
    const h = world.height[tile];
    histogram[h]++;
    if (edgeMultiplier !== 0) {
      const x = world.tileX(tile), y = world.tileY(tile);
      for (const [dx, dy] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= world.sizeX || ny >= world.sizeY) continue;
        const neighbour = world.tileXY(nx, ny);
        if (world.tileType(neighbour) !== TileType.Void && world.height[neighbour] < h) edgeHistogram[h]++;
      }
    }
  }
  const landTiles = world.size - histogram[0];
  let bestScore = landTiles;
  const goalTiles = Math.trunc(landTiles * coverage / 100);
  let bestH = 255;
  let currentTiles = 0;
  for (let h = 255; h > 0; h--) {
    currentTiles += histogram[h];
    let score = goalTiles - currentTiles;
    if (edgeMultiplier !== 0 && h > 1) {
      score -= edgeHistogram[1] * edgeMultiplier;
      score -= edgeHistogram[h] * edgeMultiplier;
    }
    if (Math.abs(score) < Math.abs(bestScore)) { bestScore = score; bestH = h; }
  }
  return bestH;
}

export function calculateSnowLine(world: World, settings: GenerationSettings): number {
  return Math.max(calculateCoverageLine(world, settings.snowCoverage, 0), 2);
}

export function calculateDesertLine(world: World, settings: GenerationSettings): number {
  return calculateCoverageLine(world, 100 - settings.desertCoverage, 4);
}

function addDiffWrap(world: World, tile: number, dx: number, dy: number): number {
  const x = world.tileX(tile) + dx, y = world.tileY(tile) + dy;
  if (x < 0 || y < 0 || x >= world.sizeX || y >= world.sizeY) return -1;
  return world.tileXY(x, y);
}

export function createDesertOrRainForest(world: World, settings: GenerationSettings, snowLine: number, runner: TileLoopRunner): void {
  const desertLine = calculateDesertLine(world, settings);
  for (let tile = 0; tile < world.size; tile++) {
    let ok = true;
    for (const [dx, dy] of DESERT_OFFSETS) {
      const t = addDiffWrap(world, tile, dx, dy);
      if (t !== -1 && !(world.height[t] < desertLine && world.tileType(t) !== TileType.Water)) { ok = false; break; }
    }
    if (ok && world.tileType(tile) !== TileType.Void) setTropicZone(world, tile, TROPICZONE_DESERT);
  }

  runner.run(world, snowLine, 256, false);

  for (let tile = 0; tile < world.size; tile++) {
    let ok = true;
    for (const [dx, dy] of DESERT_OFFSETS) {
      const t = addDiffWrap(world, tile, dx, dy);
      if (t !== -1 && world.tileType(t) === TileType.Clear && world.clearGround(t) === ClearGround.Desert) { ok = false; break; }
    }
    if (ok && world.tileType(tile) !== TileType.Void) setTropicZone(world, tile, TROPICZONE_RAINFOREST);
  }
}

export function setTropicZone(world: World, tile: number, zone: number): void {
  world.setTropicZone(tile, zone);
}

export function getTropicZone(world: World, tile: number): number {
  return world.getTropicZone(tile);
}

function makeSnow(world: World, tile: number, density: number): void {
  world.m3[tile] |= 0x10;
  if (world.clearGround(tile) === ClearGround.Fields) world.m5[tile] = (ClearGround.Grass << 2) | density;
  else world.m5[tile] = (world.m5[tile] & 0xfc) | (density & 3);
}

function clearSnow(world: World, tile: number): void {
  world.m3[tile] &= ~0x10;
  world.m5[tile] = (world.m5[tile] & 0xfc) | 3;
}

function tileLoopClearAlps(world: World, tile: number, snowLine: number): void {
  const k = world.tileZ(tile) - snowLine + 1;
  if ((world.m3[tile] & 0x10) === 0) {
    if (k >= 0) makeSnow(world, tile, 0);
    return;
  }
  const current = world.clearDensity(tile);
  const required = k < 0 ? 0 : Math.min(k, 3);
  if (current === required) {
    if (k >= 0) return;
    clearSnow(world, tile);
  } else {
    world.m5[tile] = (world.m5[tile] & 0xfc) | (current + (current < required ? 1 : -1));
  }
}

function neighbourIsNormal(world: World, tile: number): boolean {
  const x = world.tileX(tile), y = world.tileY(tile);
  for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= world.sizeX || ny >= world.sizeY) continue;
    const t = world.tileXY(nx, ny);
    if (world.tileType(t) === TileType.Void) continue;
    if (getTropicZone(world, t) !== TROPICZONE_DESERT) return true;
    if (world.tileType(t) === TileType.Water && world.waterClass(t) === 0) return true;
  }
  return false;
}

function tileLoopClearDesert(world: World, tile: number): void {
  let current = 0;
  if (world.clearGround(tile) === ClearGround.Desert) current = world.clearDensity(tile);
  let expected = 0;
  if (getTropicZone(world, tile) === TROPICZONE_DESERT) expected = neighbourIsNormal(world, tile) ? 1 : 3;
  if (current === expected) return;
  if (expected === 0) world.m5[tile] = (ClearGround.Grass << 2) | 3;
  else world.m5[tile] = (ClearGround.Desert << 2) | expected;
}

// GetFloodingBehaviour and TileLoop_Water, src/water_cmd.cpp.
const FLOOD_NONE = 0;
const FLOOD_ACTIVE = 1;
const FLOOD_PASSIVE = 2;
const FLOOD_DRYUP = 3;

function isSlopeWithOneCornerRaised(slope: number): boolean {
  return slope === 0x01 || slope === 0x02 || slope === 0x04 || slope === 0x08;
}

function getFloodingBehaviour(world: World, tile: number): number {
  switch (world.tileType(tile)) {
    case TileType.Water:
      if (world.waterTileType(tile) === 1) { // Coast
        return isSlopeWithOneCornerRaised(world.tileSlope(tile)) ? FLOOD_ACTIVE : FLOOD_DRYUP;
      }
      return world.waterClass(tile) === 0 ? FLOOD_ACTIVE : FLOOD_NONE;
    case TileType.Trees:
      return getTreeGround(world, tile) === TreeGround.Shore ? FLOOD_DRYUP : FLOOD_NONE;
    case TileType.Void:
      return FLOOD_ACTIVE;
    default:
      return FLOOD_NONE;
  }
}

function doFloodTile(world: World, target: number): void {
  const slope = world.tileSlope(target);
  if (slope !== 0x00) {
    if (world.tileType(target) === TileType.Trees) {
      if (!isSlopeWithOneCornerRaised(slope)) {
        setTreeGroundDensity(world, target, TreeGround.Shore, 3);
        return;
      }
    }
    world.doClearSquare(target);
    world.makeShore(target);
  } else {
    world.doClearSquare(target);
    world.makeSea(target);
  }
}

function doDryUp(world: World, tile: number): void {
  if (world.tileType(tile) === TileType.Trees && getTreeGround(world, tile) === TreeGround.Shore) {
    setTreeGroundDensity(world, tile, TreeGround.Grass, 3);
    return;
  }
  world.doClearSquare(tile);
}

function reverseDir(dir: number): number { return (dir + 4) % 8; }

export function tileLoopWater(world: World, tile: number): void {
  if (world.tileType(tile) === TileType.Water) {
    if ((world.m3[tile] & 1) !== 0) return;
  }

  switch (getFloodingBehaviour(world, tile)) {
    case FLOOD_ACTIVE: {
      let continueFlooding = false;
      for (let dir = 0; dir < 8; dir++) {
        const dest = addDiffWrap(world, tile, DIR_OFFSET[dir][0], DIR_OFFSET[dir][1]);
        if (dest === -1 || world.tileType(dest) === TileType.Void) continue;
        if (world.tileType(dest) === TileType.Water) continue;
        continueFlooding = true;
        if (world.tileType(dest) === TileType.Trees && getTreeGround(world, dest) === TreeGround.Shore) continue;
        const [slopeDest, zDest] = world.tileSlopeZ(dest);
        if (zDest > 0) continue;
        const dirs = FLOOD_FROM_DIRS[slopeDest & ~SLOPE_STEEP] ?? [];
        if (!dirs.includes(reverseDir(dir))) continue;
        doFloodTile(world, dest);
      }
      if (!continueFlooding && world.tileType(tile) === TileType.Water) world.m3[tile] |= 1;
      break;
    }
    case FLOOD_DRYUP: {
      const slopeHere = world.tileSlope(tile) & ~SLOPE_STEEP;
      for (const dir of FLOOD_FROM_DIRS[slopeHere] ?? []) {
        const dest = addDiffWrap(world, tile, DIR_OFFSET[dir][0], DIR_OFFSET[dir][1]);
        if (dest === -1) continue;
        const behaviour = getFloodingBehaviour(world, dest);
        if (behaviour === FLOOD_ACTIVE || behaviour === FLOOD_PASSIVE) return;
      }
      doDryUp(world, tile);
      break;
    }
    default:
      break;
  }
}

function tileLoopClear(
  world: World, settings: GenerationSettings, rng: RandomContext, tile: number,
  counter: number, snowLine: number,
): void {
  if (world.tileType(tile) === TileType.Water) {
    tileLoopWater(world, tile);
    return;
  }
  if (world.tileType(tile) === TileType.Trees) {
    tileLoopTrees(world, settings, rng, tile, counter, snowLine);
    return;
  }
  if (world.tileType(tile) !== TileType.Clear) return;
  if (world.landscapeKind === Landscape.Arctic) tileLoopClearAlps(world, tile, snowLine);
  else if (world.landscapeKind === Landscape.Tropic) tileLoopClearDesert(world, tile);
  if ((world.m3[tile] & 0x10) !== 0) return;
  if (world.clearGround(tile) !== ClearGround.Grass) return;
  if (world.clearDensity(tile) === 3) return;
  const clearCounter = (world.m5[tile] >> 5) & 7;
  if (clearCounter < 7) world.m5[tile] += 1 << 5;
  else {
    world.m5[tile] &= 0x1f;
    const d = world.clearDensity(tile);
    world.m5[tile] = (world.m5[tile] & 0xfc) | (d + 1);
  }
}

const TILE_UPDATE_FREQUENCY = 256;
const TILE_LOOP_FEEDBACK = [0xd8f, 0x1296, 0x2496, 0x4357, 0x8679, 0x1030e, 0x206cd, 0x403fe, 0x807b8, 0x1004b2, 0x2006a8, 0x4004b2, 0x800b87];

export class TileLoopRunner {
  tile = 1;
  counter = 0;
  readonly feedback: number;
  private readonly settings: GenerationSettings;
  private readonly rng: RandomContext;
  constructor(world: World, settings: GenerationSettings, rng: RandomContext) {
    this.feedback = TILE_LOOP_FEEDBACK[world.logX + world.logY - 12];
    this.settings = settings;
    this.rng = rng;
  }
  run(world: World, snowLine: number, loops: number, advanceCounter: boolean): void {
    for (let i = 0; i < loops; i++) {
      let count = world.size / TILE_UPDATE_FREQUENCY;
      if (this.counter % TILE_UPDATE_FREQUENCY === 0) {
        tileLoopClear(world, this.settings, this.rng, 0, this.counter, snowLine);
        count--;
      }
      while (count-- > 0) {
        tileLoopClear(world, this.settings, this.rng, this.tile, this.counter, snowLine);
        this.tile = ((this.tile >>> 1) ^ (-(this.tile & 1) & this.feedback)) >>> 0;
      }
      if (advanceCounter) this.counter++;
    }
  }
}
