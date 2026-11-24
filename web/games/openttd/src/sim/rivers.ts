// Rivers: src/landscape.cpp FindSpring/FlowRiver/CreateRivers/RiverMakeWider,
// src/water_cmd.cpp MakeRiverAndModifyDesertZoneAround, and the parts of
// src/pathfinder/yapf/yapf_river_builder.cpp the world generator uses.
//
// The river builder runs an A* search over tiles that a river can flow down
// to. Its cost includes a random component (riverRouteRandom), so the search
// order and the binary heap's tie breaking are part of the world's random
// sequence and are reproduced exactly.

import {
  ClearGround, SLOPE_E, SLOPE_ELEVATED, SLOPE_FLAT, SLOPE_N, SLOPE_S, SLOPE_STEEP, SLOPE_W,
  TileType, TROPICZONE_DESERT, TROPICZONE_NORMAL, TROPICZONE_RAINFOREST, WaterClass, World,
} from './world.ts';
import type { RandomContext } from './random.ts';
import { Landscape, type GenerationSettings } from './settings.ts';
import { placeTree } from './trees.ts';
import { convertGroundTilesIntoWaterTiles, type TileLoopRunner } from './landscape.ts';

// Direction tables, src/map.cpp. DiagDirections name tile-space steps.
const DIAG_OFF: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const DIR_OFF: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1],
];
const DIR_W = 6;

const MAX_SEARCH_NODES = 10000;

// libstdc++'s unordered_set iteration order is part of the generated world:
// CountConnectedSeaTiles stores its tiles in a std::unordered_set and the
// flattening loop visits them in that container's order. This is a faithful
// model of libstdc++'s unique-key hashtable (bucket-before-begin links,
// head insertion, prime bucket counts, rehash by prepending bucket segments).
const HASH_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 103, 109, 113, 127, 137, 139, 149, 157, 167, 179, 193,
  199, 211, 227, 241, 257, 277, 293, 313, 337, 359, 383, 409, 439, 467, 503,
  541, 577, 619, 661, 709, 761, 823, 887, 953, 1031, 1109, 1193, 1289, 1381,
  1493, 1613, 1741, 1879, 2029, 2179, 2357,
];
const HASH_FAST_BKT = [2, 2, 2, 3, 5, 5, 7, 7, 11, 11, 11, 11, 13, 13];
const BUCKET_HEADER = -2;

class TileUnorderedSet {
  private tiles: number[] = [];
  private next: number[] = [];
  private head = -1;
  private buckets: number[] = [];
  private bucketCount = 1;
  private nextResize = 0;
  private members = new Set<number>();
  size = 0;

  has(tile: number): boolean { return this.members.has(tile); }

  private bucketOf(tile: number): number { return tile % this.bucketCount; }

  private nextBucketCount(n: number): number {
    if (n < HASH_FAST_BKT.length) {
      if (n === 0) return 1;
      this.nextResize = HASH_FAST_BKT[n];
      return HASH_FAST_BKT[n];
    }
    let lo = 6, hi = HASH_PRIMES.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (HASH_PRIMES[mid] < n) lo = mid + 1; else hi = mid;
    }
    this.nextResize = HASH_PRIMES[lo];
    return HASH_PRIMES[lo];
  }

  private rehash(newCount: number): void {
    const old = this.values();
    this.tiles = [];
    this.next = [];
    this.head = -1;
    this.bucketCount = newCount;
    this.buckets = new Array(newCount).fill(-1);
    let beginBucket = 0;
    for (const tile of old) {
      const id = this.tiles.length;
      this.tiles.push(tile);
      this.next.push(-1);
      const b = this.bucketOf(tile);
      if (this.buckets[b] === -1) {
        this.next[id] = this.head;
        this.head = id;
        this.buckets[b] = BUCKET_HEADER;
        if (this.next[id] !== -1) this.buckets[beginBucket] = id;
        beginBucket = b;
      } else {
        const before = this.buckets[b];
        this.next[id] = before === BUCKET_HEADER ? this.head : this.next[before];
        if (before === BUCKET_HEADER) this.head = id; else this.next[before] = id;
      }
    }
  }

  insert(tile: number): void {
    if (this.size + 1 > this.nextResize) {
      const minBkts = Math.max(this.size + 1, this.nextResize ? 0 : 11);
      if (minBkts >= this.bucketCount) {
        const target = Math.max(minBkts + 1, this.bucketCount * 2);
        this.rehash(this.nextBucketCount(target));
      } else {
        this.nextResize = this.bucketCount;
      }
    }
    const id = this.tiles.length;
    this.tiles.push(tile);
    this.next.push(-1);
    const b = this.bucketOf(tile);
    if (this.buckets[b] === -1) {
      this.next[id] = this.head;
      this.head = id;
      this.buckets[b] = BUCKET_HEADER;
      if (this.next[id] !== -1) this.buckets[this.bucketOf(this.tiles[this.next[id]])] = id;
    } else {
      const before = this.buckets[b];
      this.next[id] = before === BUCKET_HEADER ? this.head : this.next[before];
      if (before === BUCKET_HEADER) this.head = id; else this.next[before] = id;
    }
    this.size++;
    this.members.add(tile);
  }

  values(): number[] {
    const out: number[] = [];
    for (let p = this.head; p !== -1; p = this.next[p]) out.push(this.tiles[p]);
    return out;
  }
}

function randomRange(rng: RandomContext, limit: number): number {
  if (limit <= 0) return 0;
  return Number((BigInt(rng.next() >>> 0) * BigInt(limit)) >> 32n);
}

function chance16(rng: RandomContext, a: number, b: number): boolean {
  const r = rng.next() >>> 0;
  return ((((r & 0xffff) * b + (b >> 1)) >> 16) < a);
}

function isValidTile(world: World, t: number): boolean {
  return t >= 0 && t < world.size && world.tileType(t) !== TileType.Void;
}

function addDiffWrap(world: World, t: number, dx: number, dy: number): number {
  const x = world.tileX(t) + dx, y = world.tileY(t) + dy;
  if (x < 0 || y < 0 || x >= world.sizeX || y >= world.sizeY) return -1;
  return world.tileXY(x, y);
}

function addByDiag(world: World, t: number, d: number): number {
  return t + DIAG_OFF[d][0] + DIAG_OFF[d][1] * world.sizeX;
}

/**
 * IsWaterTile, src/water_map.h: plain water only. Coast tiles (water with
 * WaterTileType::Coast) are deliberately not water for the river code.
 */
function isWaterTile(world: World, t: number): boolean {
  return world.tileType(t) === TileType.Water && world.waterTileType(t) === 0;
}

function isInclinedSlope(slope: number): boolean {
  return slope === (SLOPE_N | SLOPE_W) || slope === (SLOPE_S | SLOPE_W) ||
    slope === (SLOPE_S | SLOPE_E) || slope === (SLOPE_N | SLOPE_E);
}

function inclinedSlopeDirection(slope: number): number {
  switch (slope) {
    case 12: return 0; // SLOPE_NE
    case 6: return 1; // SLOPE_SE
    case 3: return 2; // SLOPE_SW
    case 9: return 3; // SLOPE_NW
    default: return -1;
  }
}

function reverseDiagDir(d: number): number { return 2 ^ d; }
function changeDiagDir(d: number, delta: number): number { return (d + delta) % 4; }

function complementSlope(slope: number): number { return slope ^ SLOPE_ELEVATED; }
function isSteepSlope(slope: number): boolean { return (slope & SLOPE_STEEP) !== 0; }
function isSlopeWithOneCornerRaised(slope: number): boolean {
  return slope === SLOPE_W || slope === SLOPE_S || slope === SLOPE_E || slope === SLOPE_N;
}

function isSlopeWithThreeCornersRaised(slope: number): boolean {
  return !isSteepSlope(slope) && isSlopeWithOneCornerRaised(complementSlope(slope));
}

function manhattan(world: World, a: number, b: number): number {
  return Math.abs(world.tileX(a) - world.tileX(b)) + Math.abs(world.tileY(a) - world.tileY(b));
}

function distanceSquare(world: World, a: number, b: number): number {
  const dx = world.tileX(a) - world.tileX(b), dy = world.tileY(a) - world.tileY(b);
  return dx * dx + dy * dy;
}

function distanceFromEdge(world: World, t: number): number {
  const x = world.tileX(t), y = world.tileY(t);
  return Math.min(x, y, world.sizeX - 1 - x, world.sizeY - 1 - y);
}

/** SpiralTileSequence from src/tilearea.cpp, in its exact visit order. */
export function* spiralTiles(world: World, center: number, diameter: number): Generator<number> {
  const maxRadius = Math.trunc(diameter / 2);
  const extent = [0, 0, 0, 0];
  let curRadius = 0;
  let dir = 0;
  let position: number;
  let x = world.tileX(center), y = world.tileY(center);

  const initPosition = (): void => { position = extent[dir] + curRadius * 2 + 1; };
  const increment = (): void => {
    if (dir === 4) { // INVALID_DIAGDIR: the first tile of an odd diameter
      x += DIR_OFF[DIR_W][0];
      y += DIR_OFF[DIR_W][1];
      dir = 0;
      initPosition();
      return;
    }
    x += DIAG_OFF[dir][0];
    y += DIAG_OFF[dir][1];
    --position;
    if (position > 0) return;
    ++dir;
    if (dir === 4) {
      x += DIR_OFF[DIR_W][0];
      y += DIR_OFF[DIR_W][1];
      ++curRadius;
      dir = 0;
    }
    initPosition();
  };
  const outside = (): boolean => x < 0 || y < 0 || x >= world.sizeX || y >= world.sizeY;
  const isEnd = (): boolean => curRadius === maxRadius && dir !== 4;

  if (diameter % 2 === 1) {
    extent.fill(1);
    dir = 4;
    position = 0;
  } else {
    initPosition();
    x = world.tileX(center) + 1;
    y = world.tileY(center);
  }
  while (!isEnd() && outside()) increment();

  while (!isEnd()) {
    yield x + y * world.sizeX;
    increment();
    while (!isEnd() && outside()) increment();
  }
}

/** MakeRiverAndModifyDesertZoneAround, src/water_cmd.cpp. */
function makeRiverAndModifyDesertZoneAround(world: World, rng: RandomContext, tile: number): void {
  world.makeWater(tile, WaterClass.River, rng.next() & 0xff);
  for (const t of spiralTiles(world, tile, 5)) {
    if (world.getTropicZone(t) === TROPICZONE_DESERT) world.setTropicZone(t, TROPICZONE_NORMAL);
  }
}

/**
 * CmdTerraformLand on the empty generated landscape, src/terraform_cmd.cpp.
 * `slope` selects corners, `up` raises (true) or lowers (false). The command
 * clears any water or clear tile it touches and then applies the new corner
 * heights, exactly as the native command does during world generation.
 */
export function terraformLand(world: World, mapHeightLimit: number, tile: number, slope: number, up: boolean): boolean {
  const direction = up ? 1 : -1;
  const newHeights = new Map<number, number>();
  const dirty = new Set<number>();
  const heightOf = (t: number): number => newHeights.get(t) ?? world.tileHeight(t);

  const addDirtyAround = (t: number): void => {
    const x = world.tileX(t), y = world.tileY(t);
    if (y >= 1) dirty.add(t - world.sizeX);
    if (y >= 1 && x >= 1) dirty.add(t - world.sizeX - 1);
    if (x >= 1) dirty.add(t - 1);
    dirty.add(t);
  };

  const terraformTileHeight = (t: number, height: number): boolean => {
    if (height < 0) return false;
    if (height > mapHeightLimit) return false;
    if (height === heightOf(t)) return false;
    addDirtyAround(t);
    newHeights.set(t, height);
    for (let d = 0; d < 4; d++) {
      const n = addDiffWrap(world, t, DIAG_OFF[d][0], DIAG_OFF[d][1]);
      if (n === -1) continue;
      const r = heightOf(n);
      let diff = height - r;
      if (Math.abs(diff) > 1) {
        diff += diff < 0 ? 1 : -1;
        if (!terraformTileHeight(n, r + diff)) return false;
      }
    }
    return true;
  };

  if ((slope & SLOPE_W) !== 0) {
    const t = tile + 1;
    if (t < world.size && !terraformTileHeight(t, world.tileHeight(t) + direction)) return false;
  }
  if ((slope & SLOPE_S) !== 0) {
    const t = tile + 1 + world.sizeX;
    if (t < world.size && !terraformTileHeight(t, world.tileHeight(t) + direction)) return false;
  }
  if ((slope & SLOPE_E) !== 0) {
    const t = tile + world.sizeX;
    if (t < world.size && !terraformTileHeight(t, world.tileHeight(t) + direction)) return false;
  }
  if ((slope & SLOPE_N) !== 0) {
    if (!terraformTileHeight(tile, world.tileHeight(tile) + direction)) return false;
  }

  const sorted = [...dirty].sort((a, b) => a - b);
  for (let pass = 0; pass < 2; pass++) {
    for (const t of sorted) {
      if (t >= world.size) continue;
      if (world.tileType(t) === TileType.Void) continue;
      const zN = heightOf(t);
      const zW = heightOf(t + 1);
      const zS = heightOf(t + 1 + world.sizeX);
      const zE = heightOf(t + world.sizeX);
      const zMin = Math.min(zN, zW, zS, zE);
      const zMax = Math.max(zN, zW, zS, zE);
      let tileh = zMax > zMin + 1 ? SLOPE_STEEP : SLOPE_FLAT;
      if (zW > zMin) tileh |= SLOPE_W;
      if (zS > zMin) tileh |= SLOPE_S;
      if (zE > zMin) tileh |= SLOPE_E;
      if (zN > zMin) tileh |= SLOPE_N;

      if (pass === 0) continue;
      const type = world.tileType(t);
      if (type === TileType.Clear) {
        world.doClearSquare(t);
      } else if (type === TileType.Water) {
        if (world.waterClass(t) === WaterClass.Canal) return false;
        world.doClearSquare(t);
      } else {
        return false; // no other tile type exists during landscape generation
      }
    }
  }

  for (const [t, h] of newHeights) world.setTileHeight(t, h);
  return true;
}

/** IsValidRiverTerminusTile, src/landscape.cpp. */
function isValidRiverTerminusTile(world: World, tile: number, height: number): boolean {
  if (!isValidTile(world, tile) || world.tileHeight(tile) !== height) return false;
  if (world.isTileFlat(tile) === null) return false;
  if (world.landscapeKind === Landscape.Tropic && world.getTropicZone(tile) === TROPICZONE_DESERT) return false;
  return true;
}

/** FindSpring, src/landscape.cpp. */
function findSpring(world: World, tile: number, freeformEdges: boolean): boolean {
  const refHeight = world.isTileFlat(tile);
  if (refHeight === null || isWaterTile(world, tile)) return false;
  if (world.landscapeKind === Landscape.Tropic && world.getTropicZone(tile) !== TROPICZONE_RAINFOREST) return false;

  let num = 0;
  const x = world.tileX(tile), y = world.tileY(tile);
  const lo = freeformEdges ? 1 : 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx, ny = y + dy;
      if (nx < lo || ny < lo || nx >= world.sizeX - 1 || ny >= world.sizeY - 1) continue;
      if (world.tileMaxZ(world.tileXY(nx, ny)) > refHeight) num++;
    }
  }
  if (num < 4) return false;

  for (let dx = -16; dx <= 16; dx++) {
    for (let dy = -16; dy <= 16; dy++) {
      const nx = x + dx, ny = y + dy;
      if (nx < lo || ny < lo || nx >= world.sizeX - 1 || ny >= world.sizeY - 1) continue;
      if (world.tileMaxZ(world.tileXY(nx, ny)) > refHeight + 2) return false;
    }
  }
  return true;
}

/** RiverFlowsDown, src/landscape.cpp. */
function riverFlowsDown(world: World, begin: number, end: number): boolean {
  const slopeEnd = world.tileSlope(end);
  if (slopeEnd !== SLOPE_FLAT && !isInclinedSlope(slopeEnd)) return false;
  const heightEnd = world.tileZ(end);
  const slopeBegin = world.tileSlope(begin);
  const heightBegin = world.tileZ(begin);
  if (heightEnd > heightBegin) return false;
  if (slopeEnd === slopeBegin && heightEnd < heightBegin) return true;
  return slopeEnd === SLOPE_FLAT || slopeBegin === SLOPE_FLAT;
}

/** MakeLake, src/landscape.cpp. */
function makeLake(world: World, rng: RandomContext, lakeCentre: number, heightLake: number): void {
  makeRiverAndModifyDesertZoneAround(world, rng, lakeCentre);
  const diameter = randomRange(rng, 8) + 3;
  for (let loops = 0; loops < 2; loops++) {
    for (const tile of spiralTiles(world, lakeCentre, diameter)) {
      if (!isValidRiverTerminusTile(world, tile, heightLake)) continue;
      for (let d = 0; d < 4; d++) {
        const t = addByDiag(world, tile, d);
        if (t >= 0 && t < world.size && isWaterTile(world, t)) {
          makeRiverAndModifyDesertZoneAround(world, rng, tile);
          break;
        }
      }
    }
  }
}

/** MakeWetlands, src/landscape.cpp. */
function makeWetlands(
  world: World, rng: RandomContext, settings: GenerationSettings, centre: number,
  height: number, riverLength: number,
): void {
  makeRiverAndModifyDesertZoneAround(world, rng, centre);
  const diameter = Math.max(riverLength, 16);
  const hasTrees = chance16(rng, 1, 2);
  for (const tile of spiralTiles(world, centre, diameter)) {
    if (!isValidRiverTerminusTile(world, tile, height)) continue;
    const radius = Math.trunc(diameter / 2);
    if (distanceSquare(world, tile, centre) > radius * radius && chance16(rng, 3, 4)) continue;
    if (chance16(rng, 1, 3)) {
      makeRiverAndModifyDesertZoneAround(world, rng, tile);
    } else if (world.tileType(tile) === TileType.Clear) {
      world.m5[tile] = (ClearGround.Rough << 2) | 3;
      if (hasTrees && settings.treePlacer !== 0) {
        placeTree(world, settings, tile, rng.next(), true);
      }
    }
  }
}

/** TryMakeRiverTerminus, src/landscape.cpp. */
function tryMakeRiverTerminus(
  world: World, rng: RandomContext, settings: GenerationSettings, tile: number, begin: number,
): boolean {
  if (!isValidTile(world, tile)) return false;
  if (tile === begin) return false;
  if (world.landscapeKind === Landscape.Tropic && world.getTropicZone(tile) === TROPICZONE_DESERT) return false;
  const heightLake = world.isTileFlat(tile);
  if (heightLake === null) return false;
  const heightBegin = world.tileHeight(begin);
  if (heightLake !== heightBegin) return false;

  if (chance16(rng, 1, 3)) {
    makeLake(world, rng, tile, heightLake);
  } else {
    makeWetlands(world, rng, settings, tile, heightLake, manhattan(world, tile, begin));
  }
  return true;
}

/** CountConnectedSeaTiles, src/landscape.cpp. */
function countConnectedSeaTiles(
  world: World, tile: number, sea: TileUnorderedSet, limit: number,
): boolean {
  if (!isWaterTile(world, tile) || world.waterClass(tile) !== WaterClass.Sea) return false;
  if (world.isTileFlat(tile) === null) return false;
  if (distanceFromEdge(world, tile) <= 1) return true;
  sea.insert(tile);
  if (sea.size > limit) return false;
  for (let d = 0; d < 4; d++) {
    const t = addByDiag(world, tile, d);
    if (isValidTile(world, t) && !sea.has(t) && countConnectedSeaTiles(world, t, sea, limit)) return true;
  }
  return false;
}

/** RiverMakeWider, src/landscape.cpp. */
export function riverMakeWider(
  world: World, rng: RandomContext, mapHeightLimit: number, tile: number, originTile: number,
): void {
  if (!isValidTile(world, tile)) return;
  if (isWaterTile(world, tile)) return;
  if (world.tileMaxZ(tile) === 0) return;

  let curSlope = world.tileSlope(tile);
  let desiredSlope = world.tileSlope(originTile);
  if (world.tileMaxZ(tile) > world.tileMaxZ(originTile)) return;

  if (curSlope !== SLOPE_FLAT && !isInclinedSlope(curSlope)) {
    if (isSteepSlope(curSlope)) return;
    let flatRiverFound = false;
    let slopedRiverFound = false;
    for (let d = 0; d < 4; d++) {
      const other = addByDiag(world, tile, d);
      if (!isValidTile(world, other)) continue;
      const otherSlope = world.tileSlope(other);
      if (isWaterTile(world, other) && world.waterClass(other) === WaterClass.River) {
        if (isInclinedSlope(otherSlope) && world.tileMaxZ(tile) === world.tileMaxZ(other)) {
          if (inclinedSlopeDirection(otherSlope) === changeDiagDir(d, 1) ||
              inclinedSlopeDirection(otherSlope) === changeDiagDir(d, 3)) {
            desiredSlope = otherSlope;
            slopedRiverFound = true;
            break;
          }
        }
        if (otherSlope === SLOPE_FLAT) flatRiverFound = true;
      }
    }
    if (!slopedRiverFound && !flatRiverFound) return;
    if (!slopedRiverFound && flatRiverFound) desiredSlope = SLOPE_FLAT;

    if (desiredSlope === SLOPE_FLAT && isSlopeWithThreeCornersRaised(curSlope)) {
      for (let d = 0; d < 4; d++) {
        const other = addByDiag(world, tile, d);
        if (!isValidTile(world, other)) continue;
        if (isInclinedSlope(world.tileSlope(other)) && isWaterTile(world, other)) return;
      }
      terraformLand(world, mapHeightLimit, tile, complementSlope(curSlope), true);
    } else if (isInclinedSlope(desiredSlope)) {
      const riverDirection = reverseDiagDir(inclinedSlopeDirection(desiredSlope));
      for (let d = 0; d < 4; d++) {
        if (d === 0 || d === 2) continue;
        const other = addByDiag(world, tile, changeDiagDir(riverDirection, d));
        if (isValidTile(world, other) && isWaterTile(world, other) &&
            world.waterClass(other) === WaterClass.River && world.tileSlope(other) === SLOPE_FLAT) return;
      }
      let toChange = curSlope ^ desiredSlope;
      if (!isSlopeWithOneCornerRaised(curSlope)) {
        toChange &= complementSlope(desiredSlope);
        terraformLand(world, mapHeightLimit, tile, toChange, false);
      }
      curSlope = world.tileSlope(tile);
      if (curSlope !== desiredSlope && isSlopeWithOneCornerRaised(curSlope)) {
        toChange = curSlope ^ desiredSlope;
        terraformLand(world, mapHeightLimit, tile, toChange, true);
      }
    }
    curSlope = world.tileSlope(tile);
  }

  if (isInclinedSlope(curSlope)) {
    const slopeDirection = inclinedSlopeDirection(curSlope);
    const upstreamTile = addByDiag(world, tile, slopeDirection);
    const downstreamTile = addByDiag(world, tile, reverseDiagDir(slopeDirection));
    if (!isValidTile(world, upstreamTile) || !isValidTile(world, downstreamTile)) return;

    const downstreamSlope = world.tileSlope(downstreamTile);
    const downstreamIsOcean = world.tileZ(downstreamTile) === 0 &&
      (downstreamSlope === SLOPE_FLAT || isSlopeWithOneCornerRaised(downstreamSlope));

    if (!isWaterTile(world, downstreamTile) && !downstreamIsOcean) {
      if (world.tileSlope(downstreamTile) !== SLOPE_FLAT) return;
      makeRiverAndModifyDesertZoneAround(world, rng, downstreamTile);
    }
    if (!isWaterTile(world, upstreamTile)) {
      if (world.tileSlope(upstreamTile) !== SLOPE_FLAT) return;
      makeRiverAndModifyDesertZoneAround(world, rng, upstreamTile);
    }
  }

  if (curSlope === desiredSlope) makeRiverAndModifyDesertZoneAround(world, rng, tile);
}

// ---- The YAPF river pathfinder -------------------------------------------

interface RiverNode {
  tile: number;
  parent: RiverNode | null;
  cost: number;
  estimate: number;
}

/** CBinaryHeapT<Node> from src/misc/binaryheap.hpp, compared by estimate. */
class NodeHeap {
  private data: (RiverNode | null)[] = [null];
  private items = 0;

  get length(): number { return this.items; }
  isEmpty(): boolean { return this.items === 0; }
  begin(): RiverNode | null { return this.items === 0 ? null : this.data[1]; }

  private heapifyDown(gap: number, item: RiverNode): number {
    let child = gap * 2;
    while (child <= this.items) {
      if (child < this.items && this.data[child + 1]!.estimate < this.data[child]!.estimate) child++;
      if (!(this.data[child]!.estimate < item.estimate)) break;
      this.data[gap] = this.data[child];
      gap = child;
      child = gap * 2;
    }
    return gap;
  }

  private heapifyUp(gap: number, item: RiverNode): number {
    while (gap > 1) {
      const parent = Math.trunc(gap / 2);
      if (!(item.estimate < this.data[parent]!.estimate)) break;
      this.data[gap] = this.data[parent];
      gap = parent;
    }
    return gap;
  }

  include(item: RiverNode): void {
    this.data.push(null);
    const gap = this.heapifyUp(++this.items, item);
    this.data[gap] = item;
  }

  findIndex(item: RiverNode): number {
    for (let i = 1; i <= this.items; i++) if (this.data[i] === item) return i;
    return 0;
  }

  remove(index: number): void {
    if (index === 0) return;
    if (index < this.items) {
      this.items--;
      const last = this.data[this.items + 1]!;
      let gap = this.heapifyUp(index, last);
      gap = this.heapifyDown(gap, last);
      if (this.items !== 0) this.data[gap] = last;
    } else {
      this.items--;
    }
    this.data.pop();
  }
}

class RiverBuilder {
  private readonly world: World;
  private readonly rng: RandomContext;
  private readonly settings: GenerationSettings;
  private readonly endTile: number;
  private startTile = 0;
  private open = new Map<number, RiverNode>();
  private closed = new Map<number, RiverNode>();
  private heap = new NodeHeap();
  private bestDest: RiverNode | null = null;
  private bestIntermediate: RiverNode | null = null;
  steps = 0;

  constructor(world: World, rng: RandomContext, settings: GenerationSettings, endTile: number) {
    this.world = world;
    this.rng = rng;
    this.settings = settings;
    this.endTile = endTile;
  }

  private addNewNode(node: RiverNode): void {
    const setIntermediate = this.bestIntermediate === null ||
      (this.bestIntermediate.estimate - this.bestIntermediate.cost) > (node.estimate - node.cost);

    const openNode = this.open.get(node.tile);
    if (openNode !== undefined) {
      if (node.estimate < openNode.estimate) {
        this.heap.remove(this.heap.findIndex(openNode));
        openNode.parent = node.parent;
        openNode.cost = node.cost;
        openNode.estimate = node.estimate;
        this.heap.include(openNode);
        if (setIntermediate) this.bestIntermediate = openNode;
      }
      return;
    }

    const closedNode = this.closed.get(node.tile);
    if (closedNode !== undefined) return;

    this.heap.include(node);
    this.open.set(node.tile, node);
    if (setIntermediate) this.bestIntermediate = node;
  }

  findPath(): RiverNode | null {
    const start: RiverNode = { tile: this.startTile, parent: null, cost: 0, estimate: 0 };
    this.open.set(start.tile, start);
    this.heap.include(start);

    for (;;) {
      this.steps++;
      const best = this.heap.begin();
      if (best === null) break;
      if (best.tile === this.endTile) { this.bestDest = best; break; }

      // PfFollowNode
      for (let d = 0; d < 4; d++) {
        const t = best.tile + DIAG_OFF[d][0] + DIAG_OFF[d][1] * this.world.sizeX;
        if (!isValidTile(this.world, t)) continue;
        if (!riverFlowsDown(this.world, best.tile, t)) continue;
        const cost = best.cost + 1 + randomRange(this.rng, this.settings.riverRouteRandom);
        const node: RiverNode = {
          tile: t, parent: best, cost, estimate: cost + manhattan(this.world, this.endTile, t),
        };
        this.addNewNode(node);
      }

      if (this.closed.size >= MAX_SEARCH_NODES) break;

      this.open.delete(best.tile);
      this.heap.remove(this.heap.findIndex(best));
      this.closed.set(best.tile, best);
    }

    return this.bestDest;
  }

  setStart(tile: number): void { this.startTile = tile; }
}

/** BuildRiver, src/pathfinder/yapf/yapf_river_builder.cpp. */
function buildRiver(
  world: World, rng: RandomContext, settings: GenerationSettings, mapHeightLimit: number,
  startTile: number, endTile: number, springTile: number, mainRiver: boolean,
): void {
  const builder = new RiverBuilder(world, rng, settings, endTile);
  builder.setStart(startTile);
  const best = builder.findPath();
  if (best === null) return;

  for (let node: RiverNode | null = best; node !== null; node = node.parent) {
    if (!isWaterTile(world, node.tile)) {
      makeRiverAndModifyDesertZoneAround(world, rng, node.tile);
    }
  }

  // LG_ORIGINAL is the only generator that skips widening; this port always
  // uses TerraGenesis.
  if (mainRiver) {
    const longRiverLength = settings.minRiverLength * 4;
    for (let node: RiverNode | null = best; node !== null; node = node.parent) {
      const centerTile = node.tile;
      const currentRiverLength = manhattan(world, springTile, centerTile);
      const diameter = Math.min(3, Math.trunc(currentRiverLength / Math.trunc(longRiverLength / 3)) + 1);
      if (diameter <= 1) continue;
      for (const tile of spiralTiles(world, centerTile, diameter)) {
        riverMakeWider(world, rng, mapHeightLimit, tile, centerTile);
      }
    }
  }
}

/** FlowRiver, src/landscape.cpp. Returns [found, mainRiver]. */
function flowRiver(
  world: World, rng: RandomContext, settings: GenerationSettings, mapHeightLimit: number,
  spring: number, begin: number, minRiverLength: number,
): [boolean, boolean] {
  if (isWaterTile(world, begin)) {
    return [manhattan(world, spring, begin) > minRiverLength, world.tileZ(begin) === 0];
  }

  const heightBegin = world.tileHeight(begin);
  const marks = new Set<number>([begin]);
  const queue: number[] = [begin];
  let found = false;
  let end = -1;

  for (let i = 0; i < queue.length; i++) {
    end = queue[i];
    const heightEnd = world.isTileFlat(end);
    if (heightEnd !== null && (heightEnd < heightBegin ||
        (heightEnd === heightBegin && isWaterTile(world, end)))) {
      if (isWaterTile(world, end) && world.waterClass(end) === WaterClass.Sea) {
        const seaSizeThreshold = Math.min(2 * Math.trunc(Math.sqrt(world.sizeX * world.sizeY)), 1024);
        const sea = new TileUnorderedSet();
        const foundEdge = countConnectedSeaTiles(world, end, sea, seaSizeThreshold);
        if (foundEdge || sea.size > seaSizeThreshold) {
          found = true;
          break;
        }
        for (const seaTile of sea.values()) {
          terraformLand(world, mapHeightLimit, seaTile, SLOPE_ELEVATED, false);
          const slope = complementSlope(world.tileSlope(seaTile));
          terraformLand(world, mapHeightLimit, seaTile, slope, true);
        }
      } else {
        found = true;
        break;
      }
    }

    for (let d = 0; d < 4; d++) {
      const t = addByDiag(world, end, d);
      if (isValidTile(world, t) && !marks.has(t) && riverFlowsDown(world, end, t)) {
        marks.add(t);
        queue.push(t);
      }
    }
  }

  let mainRiver = false;
  if (found) {
    [found, mainRiver] = flowRiver(world, rng, settings, mapHeightLimit, spring, end, minRiverLength);
  } else if (queue.length > 32) {
    const lakeCentre = queue[randomRange(rng, queue.length)];
    if (manhattan(world, spring, lakeCentre) > minRiverLength) {
      if (tryMakeRiverTerminus(world, rng, settings, lakeCentre, begin)) {
        end = lakeCentre;
        found = true;
      }
    }
  }

  if (found) {
    buildRiver(world, rng, settings, mapHeightLimit, begin, end, spring, mainRiver);
  }
  return [found, mainRiver];
}

/** CreateRivers, src/landscape.cpp. */
export function createRivers(
  world: World, settings: GenerationSettings, rng: RandomContext, runner: TileLoopRunner,
  snowLine: number, mapHeightLimit: number,
): void {
  const amount = settings.amountOfRivers;
  if (amount === 0) return;

  let wells = world.scaleBySize(4 << amount);
  const numShortRivers = wells - Math.max(1, Math.trunc(wells / 10));

  for (; wells > numShortRivers; wells--) {
    let done = false;
    for (let tries = 0; tries < 512 && !done; tries++) {
      const randomTile = world.wrapTile(rng.next());
      for (const t of spiralTiles(world, randomTile, 8)) {
        if (findSpring(world, t, settings.freeformEdges)) {
          done = flowRiver(world, rng, settings, mapHeightLimit, t, t, settings.minRiverLength * 4)[0];
          break;
        }
      }
    }
  }

  for (; wells !== 0; wells--) {
    let done = false;
    for (let tries = 0; tries < 128 && !done; tries++) {
      const randomTile = world.wrapTile(rng.next());
      for (const t of spiralTiles(world, randomTile, 8)) {
        if (findSpring(world, t, settings.freeformEdges)) {
          done = flowRiver(world, rng, settings, mapHeightLimit, t, t, settings.minRiverLength)[0];
          break;
        }
      }
    }
  }

  // Widening rivers may have left some tiles requiring to be watered.
  convertGroundTilesIntoWaterTiles(world);

  runner.run(world, snowLine, 256, false);
}
