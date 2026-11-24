// Tree generation: src/tree_cmd.cpp GenerateTrees/PlaceTree and the tree map
// helpers from src/tree_map.h, for the map generators. Trees are part of the
// generated world (and consume its random numbers) even before they are
// drawn, so this module is needed to compare any later stage against the
// native map.

import {
  ClearGround, DIR_OFFSET, TileType, WaterClass, World, SLOPE_N, SLOPE_S, SLOPE_E, SLOPE_W,
} from './world.ts';
import type { RandomContext } from './random.ts';
import { Landscape, type GenerationSettings } from './settings.ts';
import { tileLoopWater } from './landscape.ts';

export const TreeGround = {
  Grass: 0, Rough: 1, SnowDesert: 2, Shore: 3, RoughSnow: 4,
} as const;

const TREE_TEMPERATE = 0x00;
const TREE_SUB_ARCTIC = 0x0c;
const TREE_RAINFOREST = 0x14;
const TREE_CACTUS = 0x1b;
const TREE_SUB_TROPICAL = 0x1c;
const TREE_TOYLAND = 0x20;
const TREE_INVALID = 0xff;
const TREE_COUNT_TEMPERATE = TREE_SUB_ARCTIC - TREE_TEMPERATE;
const TREE_COUNT_SUB_ARCTIC = TREE_RAINFOREST - TREE_SUB_ARCTIC;
const TREE_COUNT_RAINFOREST = TREE_CACTUS - TREE_RAINFOREST;
const TREE_COUNT_SUB_TROPICAL = TREE_TOYLAND - TREE_SUB_TROPICAL;
const TREE_COUNT_TOYLAND = 9;
const MAP_HEIGHT_LIMIT_ORIGINAL = 15;
const DEFAULT_TREE_STEPS = 1000;
const DEFAULT_RAINFOREST_TREE_STEPS = 15000;
const GROVE_SEGMENTS = 16;
const GROVE_RADIUS = 16;

function gb(value: number, start: number, count: number): number {
  return (value >>> start) & ((1 << count) - 1);
}

function tileAddWrap(world: World, tile: number, dx: number, dy: number, freeformEdges: boolean): number {
  const x = world.tileX(tile) + dx;
  const y = world.tileY(tile) + dy;
  if ((x === 0 || y === 0) && freeformEdges) return -1;
  if (x < 0 || y < 0 || x >= world.sizeX - 1 || y >= world.sizeY - 1) return -1;
  return world.tileXY(x, y);
}

function canPlantTreesOnTile(world: World, tile: number, allowDesert: boolean): boolean {
  switch (world.tileType(tile)) {
    case TileType.Water:
      return world.waterTileType(tile) === 1 && !isOneCornerRaised(world.tileSlope(tile));
    case TileType.Clear: {
      const ground = world.clearGround(tile);
      return ground !== ClearGround.Fields && ground !== ClearGround.Rocks &&
        (allowDesert || ground !== ClearGround.Desert);
    }
    default:
      return false;
  }
}

function isOneCornerRaised(slope: number): boolean {
  return slope === SLOPE_W || slope === SLOPE_S || slope === SLOPE_E || slope === SLOPE_N;
}

/** GetRandomTreeType, src/tree_cmd.cpp. */
export function randomTreeType(world: World, settings: GenerationSettings, tile: number, seed: number): number {
  switch (settings.landscape) {
    case Landscape.Temperate:
      return Math.trunc(seed * TREE_COUNT_TEMPERATE / 256) + TREE_TEMPERATE;
    case Landscape.Arctic:
      return Math.trunc(seed * TREE_COUNT_SUB_ARCTIC / 256) + TREE_SUB_ARCTIC;
    case Landscape.Tropic: {
      switch (world.getTropicZone(tile)) {
        case 0: return Math.trunc(seed * TREE_COUNT_SUB_TROPICAL / 256) + TREE_SUB_TROPICAL;
        case 1: return seed > 12 ? TREE_INVALID : TREE_CACTUS;
        default: return Math.trunc(seed * TREE_COUNT_RAINFOREST / 256) + TREE_RAINFOREST;
      }
    }
    case Landscape.Toyland:
      return Math.trunc(seed * TREE_COUNT_TOYLAND / 256) + TREE_TOYLAND;
    default:
      return TREE_INVALID;
  }
}

/** MakeTree, src/tree_map.h. */
function makeTree(
  world: World, tile: number, type: number, count: number, growth: number,
  ground: number, density: number,
): void {
  world.setTileType(tile, TileType.Trees);
  const waterClass = ground === TreeGround.Shore ? WaterClass.Sea : WaterClass.Invalid;
  world.m1[tile] = (waterClass << 5) | 0x10; // OWNER_NONE
  world.m2[tile] = (ground << 6) | (density << 4);
  world.m3[tile] = type;
  world.m4[tile] = 0;
  world.m5[tile] = (count << 6) | growth;
  world.m6[tile] &= 0x03;
  world.m7[tile] = 0;
  world.m8[tile] = 0;
}

/** SetTreeGroundDensity, src/tree_map.h. */
function setTreeGroundDensity(world: World, tile: number, ground: number, density: number): void {
  world.m2[tile] = (world.m2[tile] & 0x0f) | (density << 4) | (ground << 6);
  const waterClass = ground === TreeGround.Shore ? WaterClass.Sea : WaterClass.Invalid;
  world.m1[tile] = (world.m1[tile] & 0x1f) | (waterClass << 5);
}

function getTreeGround(world: World, tile: number): number { return (world.m2[tile] >> 6) & 7; }

/** PlantTreesOnTile, src/tree_cmd.cpp. */
function plantTreesOnTile(
  world: World, tile: number, treeType: number, count: number, growth: number,
): void {
  let ground: number;
  let density = 3;
  if (world.tileType(tile) === TileType.Water) {
    ground = TreeGround.Shore;
    world.clearNeighbourNonFloodingStates(tile);
  } else {
    const clearGround = world.clearGround(tile);
    if ((world.m3[tile] & 0x10) !== 0) { // IsSnowTile
      ground = clearGround === ClearGround.Rough ? TreeGround.RoughSnow : TreeGround.SnowDesert;
    } else {
      switch (clearGround) {
        case ClearGround.Grass: ground = TreeGround.Grass; break;
        case ClearGround.Rough: ground = TreeGround.Rough; break;
        default: ground = TreeGround.SnowDesert; break;
      }
    }
    if (clearGround !== ClearGround.Rough) density = world.clearDensity(tile);
  }
  makeTree(world, tile, treeType, count, growth, ground, density);
}

/** PlaceTree, src/tree_cmd.cpp. */
export function placeTree(
  world: World, settings: GenerationSettings, tile: number, r: number, keepDensity = false,
): void {
  const tree = randomTreeType(world, settings, tile, gb(r, 24, 8));
  if (tree === TREE_INVALID) return;
  plantTreesOnTile(world, tile, tree, gb(r, 22, 2), Math.min(gb(r, 16, 3), 6));
  if (keepDensity) return;
  const ground = getTreeGround(world, tile);
  if (ground !== TreeGround.SnowDesert && ground !== TreeGround.RoughSnow && ground !== TreeGround.Shore) {
    setTreeGroundDensity(world, tile, gb(r, 28, 1), 3);
  }
}

interface Point { x: number; y: number; }

/** Point-in-triangle test, src/tree_cmd.cpp (integers). */
function isPointInTriangle(x: number, y: number, v1: Point, v2: Point, v3: Point): boolean {
  const s = (v1.x - v3.x) * (y - v3.y) - (v1.y - v3.y) * (x - v3.x);
  const t = (v2.x - v1.x) * (y - v1.y) - (v2.y - v1.y) * (x - v1.x);
  if ((s < 0) !== (t < 0) && s !== 0 && t !== 0) return false;
  const d = (v3.x - v2.x) * (y - v2.y) - (v3.y - v2.y) * (x - v2.x);
  return (d < 0) === (s + t <= 0);
}

function isPointInStarShapedPolygon(x: number, y: number, shape: Point[]): boolean {
  for (let i = 0; i < shape.length; i++) {
    const v1 = shape[i];
    const v2 = shape[(i + 1) % shape.length];
    if (isPointInTriangle(x, y, v1, v2, { x: 0, y: 0 })) return true;
  }
  return false;
}

/** CreateRandomStarShapedPolygon, src/tree_cmd.cpp. */
function createRandomStarShapedPolygon(rng: RandomContext, radius: number, shape: Point[]): void {
  const phaseDivisor = Math.fround(2147483647 / Math.PI * 2);
  const harmonics = [
    { amplitude: Math.trunc(radius / 2), phase: Math.fround(rng.next() / phaseDivisor), frequency: 1 },
    { amplitude: Math.trunc(radius / 4), phase: Math.fround(rng.next() / phaseDivisor), frequency: 2 },
    { amplitude: Math.trunc(radius / 8), phase: Math.fround(rng.next() / phaseDivisor), frequency: 3 },
    { amplitude: Math.trunc(radius / 16), phase: Math.fround(rng.next() / phaseDivisor), frequency: 4 },
  ];
  const step = Math.fround((Math.PI * 2) / shape.length);
  let theta = 0;
  for (let i = 0; i < shape.length; i++) {
    let deviation = 0;
    for (const h of harmonics) {
      deviation = Math.fround(deviation +
        Math.fround(Math.fround(Math.sin(Math.fround(Math.fround(theta + h.phase) * h.frequency))) * h.amplitude));
    }
    const adjustedRadius = Math.fround(Math.fround(radius / 2) + Math.fround(deviation / 2));
    shape[i] = {
      x: Math.trunc(Math.fround(Math.cos(theta) * adjustedRadius)),
      y: Math.trunc(Math.fround(Math.sin(theta) * adjustedRadius)),
    };
    theta = Math.fround(theta + step);
  }
}

/** PlaceTreeGroups, src/tree_cmd.cpp. */
function placeTreeGroups(
  world: World, settings: GenerationSettings, rng: RandomContext, numGroups: number,
): void {
  const grove: Point[] = new Array(GROVE_SEGMENTS);
  do {
    const centerTile = world.wrapTile(rng.next());
    createRandomStarShapedPolygon(rng, GROVE_RADIUS, grove);
    for (let i = 0; i < DEFAULT_TREE_STEPS; i++) {
      const r = rng.next();
      const x = gb(r, 0, 5) - GROVE_RADIUS;
      const y = gb(r, 8, 5) - GROVE_RADIUS;
      const curTile = tileAddWrap(world, centerTile, x, y, settings.freeformEdges);
      if (curTile === -1) continue;
      if (!canPlantTreesOnTile(world, curTile, true)) continue;
      if (!isPointInStarShapedPolygon(x, y, grove)) continue;
      placeTree(world, settings, curTile, r);
    }
  } while (--numGroups);
}

/** PlaceTreeAtSameHeight, src/tree_cmd.cpp. */
function placeTreeAtSameHeight(
  world: World, settings: GenerationSettings, rng: RandomContext, tile: number, height: number,
): void {
  for (let i = 0; i < DEFAULT_TREE_STEPS; i++) {
    const r = rng.next();
    const x = gb(r, 0, 5) - 16;
    const y = gb(r, 8, 5) - 16;
    const curTile = tileAddWrap(world, tile, x, y, settings.freeformEdges);
    if (curTile === -1) continue;
    if (Math.abs(x) + Math.abs(y) > 16) continue;
    if (!canPlantTreesOnTile(world, curTile, true)) continue;
    if (Math.abs(world.tileZ(curTile) - height) > 2) continue;
    placeTree(world, settings, curTile, r);
    break;
  }
}

/** PlaceTreesRandomly, src/tree_cmd.cpp. */
function placeTreesRandomly(
  world: World, settings: GenerationSettings, rng: RandomContext, mapHeightLimit: number, snowLine: number,
): void {
  let i = world.scaleBySize(DEFAULT_TREE_STEPS);
  do {
    const r = rng.next();
    const tile = world.wrapTile(r);
    if (canPlantTreesOnTile(world, tile, true)) {
      placeTree(world, settings, tile, r);
      if (settings.treePlacer !== 2) continue;
      const ht = world.tileZ(tile);
      let j = world.tileZ(tile) * 2;
      if (settings.landscape === Landscape.Arctic && ht > snowLine) j *= 3;
      if (mapHeightLimit > MAP_HEIGHT_LIMIT_ORIGINAL) j = Math.trunc(j * MAP_HEIGHT_LIMIT_ORIGINAL / mapHeightLimit);
      while (j-- > 0) placeTreeAtSameHeight(world, settings, rng, tile, ht);
    }
  } while (--i > 0);

  if (settings.landscape === Landscape.Tropic) {
    i = world.scaleBySize(DEFAULT_RAINFOREST_TREE_STEPS);
    do {
      const r = rng.next();
      const tile = world.wrapTile(r);
      if (world.getTropicZone(tile) === 2 && canPlantTreesOnTile(world, tile, false)) {
        placeTree(world, settings, tile, r);
      }
    } while (--i > 0);
  }
}

/** GenerateTrees, src/tree_cmd.cpp. */
export function generateTrees(
  world: World, settings: GenerationSettings, rng: RandomContext,
  mapHeightLimit: number, snowLine: number,
): void {
  if (settings.treePlacer === 0) return;
  const i = settings.treePlacer === 1
    ? (settings.landscape === Landscape.Arctic ? 15 : 6)
    : (settings.landscape === Landscape.Arctic ? 4 : 2);
  let numGroups = settings.landscape !== Landscape.Toyland
    ? world.scaleBySize(gb(rng.next(), 0, 5) + 25)
    : 0;
  if (numGroups !== 0) placeTreeGroups(world, settings, rng, numGroups);
  for (let n = i; n !== 0; n--) {
    placeTreesRandomly(world, settings, rng, mapHeightLimit, snowLine);
  }
}

// ---- TileLoop_Trees and its helpers --------------------------------------

export function getTreeType(world: World, tile: number): number { return world.m3[tile]; }
export function getTreeDensity(world: World, tile: number): number { return (world.m2[tile] >> 4) & 3; }
export function getTreeCount(world: World, tile: number): number { return ((world.m5[tile] >> 6) & 3) + 1; }
export function getTreeGrowth(world: World, tile: number): number { return world.m5[tile] & 7; }
export { getTreeGround, setTreeGroundDensity, canPlantTreesOnTile };

function addTreeGrowth(world: World, tile: number, amount: number): void { world.m5[tile] += amount; }
function addTreeCount(world: World, tile: number, amount: number): void { world.m5[tile] += amount << 6; }
function setTreeGrowth(world: World, tile: number, growth: number): void {
  world.m5[tile] = (world.m5[tile] & ~7) | (growth & 7);
}

function makeSnow(world: World, tile: number, density: number): void {
  world.m3[tile] |= 0x10;
  if (world.clearGround(tile) === ClearGround.Fields) {
    world.m5[tile] = (ClearGround.Grass << 2) | density;
  } else {
    world.m5[tile] = (world.m5[tile] & 0xfc) | (density & 3);
  }
}

/** TreesOnTileCanSpread, src/tree_cmd.cpp. */
function treesOnTileCanSpread(world: World, settings: GenerationSettings, tile: number): boolean {
  if (settings.landscape === Landscape.Tropic) {
    switch (world.getTropicZone(tile)) {
      case 1: return false;
      case 2: return settings.extraTreePlacement === 2 || settings.extraTreePlacement === 1;
      default: return settings.extraTreePlacement === 2;
    }
  }
  return settings.extraTreePlacement === 2;
}

/** TileLoopTreesDesert, src/tree_cmd.cpp. */
function tileLoopTreesDesert(world: World, rng: RandomContext, tile: number): void {
  switch (world.getTropicZone(tile)) {
    case 1:
      if (getTreeGround(world, tile) !== TreeGround.SnowDesert) {
        setTreeGroundDensity(world, tile, TreeGround.SnowDesert, 3);
      }
      break;
    case 2:
      rng.next(); // ambient sound roll; the draw is part of the map's RNG stream
      break;
    default:
      break;
  }
}

/** TileLoopTreesAlps, src/tree_cmd.cpp. */
function tileLoopTreesAlps(world: World, rng: RandomContext, tile: number, snowLine: number): void {
  const k = world.tileZ(tile) - snowLine + 1;
  if (k < 0) {
    switch (getTreeGround(world, tile)) {
      case TreeGround.SnowDesert: setTreeGroundDensity(world, tile, TreeGround.Grass, 3); break;
      case TreeGround.RoughSnow: setTreeGroundDensity(world, tile, TreeGround.Rough, 3); break;
      default: return;
    }
  } else {
    const density = Math.min(k, 3);
    const ground = getTreeGround(world, tile);
    if (ground !== TreeGround.SnowDesert && ground !== TreeGround.RoughSnow) {
      const tg = ground === TreeGround.Rough ? TreeGround.RoughSnow : TreeGround.SnowDesert;
      setTreeGroundDensity(world, tile, tg, density);
    } else if (getTreeDensity(world, tile) !== density) {
      setTreeGroundDensity(world, tile, ground, density);
    } else {
      if (density === 3) rng.next(); // ambient sound roll
      return;
    }
  }
}

/** TileLoop_Trees, src/tree_cmd.cpp. */
export function tileLoopTrees(
  world: World, settings: GenerationSettings, rng: RandomContext, tile: number,
  counter: number, snowLine: number,
): void {
  if (getTreeGround(world, tile) === TreeGround.Shore) {
    tileLoopWater(world, tile);
  } else if (settings.landscape === Landscape.Tropic) {
    tileLoopTreesDesert(world, rng, tile);
  } else if (settings.landscape === Landscape.Arctic) {
    tileLoopTreesAlps(world, rng, tile, snowLine);
  }

  const cycle = (11 * world.tileX(tile) + 9 * world.tileY(tile) + (counter >> 8)) >>> 0;
  if ((cycle & 7) === 7 && getTreeGround(world, tile) === TreeGround.Grass) {
    const density = getTreeDensity(world, tile);
    if (density < 3) setTreeGroundDensity(world, tile, TreeGround.Grass, density + 1);
  }

  if (settings.extraTreePlacement === 3) return;
  if (cycle % 16 !== 15) return;

  switch (getTreeGrowth(world, tile)) {
    case 3: // Grown
      if (settings.landscape === Landscape.Tropic && getTreeType(world, tile) !== 0x1b &&
          world.getTropicZone(tile) === 1) {
        addTreeGrowth(world, tile, 1);
      } else {
        const growR = rng.next();
        switch (gb(growR, 0, 3)) {
          case 0:
            addTreeGrowth(world, tile, 1);
            break;
          case 1:
            if (getTreeCount(world, tile) < 4 && treesOnTileCanSpread(world, settings, tile)) {
              addTreeCount(world, tile, 1);
              setTreeGrowth(world, tile, 0);
              break;
            }
            // fall through
          case 2: {
            if (!treesOnTileCanSpread(world, settings, tile)) break;
            const treeType = getTreeType(world, tile);
            const dirR = rng.next();
            const dir = dirR % 8;
            const target = tile + DIR_OFFSET[dir][0] + DIR_OFFSET[dir][1] * world.sizeX;
            if (target < 0 || target >= world.size) return;
            if (!canPlantTreesOnTile(world, target, false)) return;
            if (world.tileType(target) === TileType.Clear && world.clearGround(target) === ClearGround.Grass &&
                (world.m3[target] & 0x10) === 0 && world.clearDensity(target) !== 3) return;
            plantTreesOnTile(world, target, treeType, 0, 0);
            break;
          }
          default:
            return;
        }
      }
      break;
    case 6: // Dead
      if (!treesOnTileCanSpread(world, settings, tile)) {
        setTreeGrowth(world, tile, 0);
      } else if (getTreeCount(world, tile) > 1) {
        addTreeCount(world, tile, -1);
        setTreeGrowth(world, tile, 3);
      } else {
        const ground = getTreeGround(world, tile);
        switch (ground) {
          case TreeGround.Shore: world.makeShore(tile); break;
          case TreeGround.Grass: world.makeClear(tile, ClearGround.Grass, getTreeDensity(world, tile)); break;
          case TreeGround.Rough: world.makeClear(tile, ClearGround.Rough, 3); break;
          case TreeGround.RoughSnow: {
            const density = getTreeDensity(world, tile);
            world.makeClear(tile, ClearGround.Rough, 3);
            makeSnow(world, tile, density);
            break;
          }
          default:
            if (settings.landscape === Landscape.Tropic) {
              world.makeClear(tile, ClearGround.Desert, getTreeDensity(world, tile));
            } else {
              const density = getTreeDensity(world, tile);
              world.makeClear(tile, ClearGround.Grass, 3);
              makeSnow(world, tile, density);
            }
            break;
        }
      }
      break;
    default:
      addTreeGrowth(world, tile, 1);
      break;
  }
}
