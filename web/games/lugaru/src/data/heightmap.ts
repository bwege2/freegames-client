// The original's terrain: Data/Textures/HeightMap.png is a 256 x 256 grayscale image.
// Terrain::load stores heightmap[x][z] = red/10; Terrain::scale is 6 (3 * megascale 1 *
// viewdistdetail 2), so a tile is 6 world units and the world is 1536 x 1536.
// The port's heightmap.json already applies the original's 180 degree indexing.
import { type Vec3 } from './math.ts';

export const TERRAIN_SIZE = 256;
export const TERRAIN_SCALE = 6;
export const TERRAIN_WORLD = (TERRAIN_SIZE - 1) * TERRAIN_SCALE;

export interface HeightMap {
  size: number;
  red: Uint8Array;
}

export function parseHeightMap(json: { size: number; red: number[] }): HeightMap {
  if (json.size !== TERRAIN_SIZE) throw new Error(`heightmap size ${json.size}`);
  return { size: json.size, red: Uint8Array.from(json.red) };
}

export function heightAtRaw(map: HeightMap, x: number, z: number): number {
  // The mesh uses heightmap * scale; getHeight adds opacity/8, which is at most 0.125
  // world units and is left out of the collision height.
  const px = x / TERRAIN_SCALE;
  const pz = z / TERRAIN_SCALE;
  if (px <= 0 || pz <= 0 || px >= map.size - 1 || pz >= map.size - 1) return 0;
  const tx = Math.floor(px);
  const tz = Math.floor(pz);
  const fx = px - tx;
  const fz = pz - tz;
  const h00 = map.red[tx * map.size + tz] * 0.6;
  const h10 = map.red[(tx + 1) * map.size + tz] * 0.6;
  const h01 = map.red[tx * map.size + (tz + 1)] * 0.6;
  const h11 = map.red[(tx + 1) * map.size + (tz + 1)] * 0.6;
  if (fx + fz <= 1) return h00 + (h10 - h00) * fx + (h01 - h00) * fz;
  return h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
}

/** Source/Environment/Terrain.cpp Terrain::getHeight, without the opacity/8 term. */
export function heightAt(map: HeightMap, x: number, z: number): number {
  return heightAtRaw(map, x, z);
}

/** Source/Environment/Terrain.cpp getNormal: central differences in tile space. */
export function normalAt(map: HeightMap, x: number, z: number): Vec3 {
  const d = TERRAIN_SCALE;
  const hx = heightAtRaw(map, x + d, z) - heightAtRaw(map, x - d, z);
  const hz = heightAtRaw(map, x, z + d) - heightAtRaw(map, x, z - d);
  const n = { x: -hx / (2 * d), y: 1, z: -hz / (2 * d) };
  const l = Math.hypot(n.x, n.y, n.z);
  return { x: n.x / l, y: n.y / l, z: n.z / l };
}

/**
 * The slope-driven second-texture opacity of Terrain::load. The original also adds a
 * random value to each tile (cosmetic noise); the deterministic slope part is kept.
 */
export function slopeBlend(map: HeightMap, x: number, z: number, environment: number): number {
  const tx = Math.floor(x / TERRAIN_SCALE);
  const tz = Math.floor(z / TERRAIN_SCALE);
  if (tx < 0 || tz < 0 || tx >= map.size - 1 || tz >= map.size - 1) return 0;
  const h = (i: number, j: number) => map.red[i * map.size + j];
  let slopeness = 0;
  if (environment === 1) {
    slopeness = Math.max(slopeness, h(tx, tz) - h(Math.min(tx + 1, map.size - 1), tz));
    slopeness = Math.max(slopeness, h(tx, tz) - h(tx, Math.min(tz + 1, map.size - 1)));
    slopeness = Math.max(slopeness, h(tx, tz) - h(Math.max(tx - 1, 0), tz));
    slopeness = Math.max(slopeness, h(tx, tz) - h(tx, Math.max(tz - 1, 0)));
    const s = slopeness / 10;
    return Math.min(1, Math.max(0, s * s * 10));
  }
  slopeness = Math.max(0, h(tx, tz) - h(tx, Math.min(tz + 1, map.size - 1)));
  const s = slopeness / 10;
  return Math.min(1, Math.max(0, s * s * 2));
}
