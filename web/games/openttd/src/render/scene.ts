// Ground sprite selection for the visible map, following the original's
// draw functions (src/clear_cmd.cpp DrawTile_Clear, src/water_cmd.cpp
// DrawTile_Water/DrawShoreTile). Only the tile types a new map has before
// towns/industries/trees are ported here; the rest return null for now.
import {
  ClearGround, SLOPE_TO_SHORE_SPRITE, SLOPE_TO_SPRITE_OFFSET, TileType, World,
} from '../sim/world.ts';
import { getTreeDensity, getTreeGround, TreeGround } from '../sim/trees.ts';

export const SPR_FLAT_BARE_LAND = 3924;
export const SPR_FLAT_GRASS_TILE = 3981;
export const SPR_FLAT_ROUGH_LAND = 4000;
export const SPR_FLAT_ROCKY_LAND_1 = 4023;
export const SPR_FLAT_WATER_TILE = 4061;
export const SPR_FARMLAND_BARE = 4126;
export const SPR_SHORE_BASE = 5936;

/** _landscape_clear_sprites_rough from src/table/clear_land.h. */
export const CLEAR_LAND_SPRITES_ROUGH = [
  SPR_FLAT_ROUGH_LAND, 4019, 4020, 4021, 4022, SPR_FLAT_ROUGH_LAND, 4019, 4020,
];

/** _clear_land_sprites_snow_desert from src/table/clear_land.h. */
export const CLEAR_LAND_SPRITES_SNOW_DESERT = [4493, 4512, 4531, 4550];

/** TileHash from src/tile_map.h. */
export function tileHash(x: number, y: number): number {
  let hash = x >> 4;
  hash ^= x >> 6;
  hash ^= y >> 4;
  hash -= y >> 6;
  return hash >>> 0;
}

/** The ground sprite a tile is drawn with, or null (void / not ported yet). */
export function groundSpriteId(world: World, tile: number): number | null {
  const kind = world.tileType(tile);
  switch (kind) {
    case TileType.Clear: {
      const slopeOffset = SLOPE_TO_SPRITE_OFFSET[world.tileSlope(tile)] ?? 0;
      const ground = world.clearGround(tile);
      const density = world.clearDensity(tile);
      switch (ground) {
        case ClearGround.Grass:
          return SPR_FLAT_BARE_LAND + slopeOffset + density * 19;
        case ClearGround.Rough:
          if (world.tileSlope(tile) !== 0) return SPR_FLAT_ROUGH_LAND + slopeOffset;
          return CLEAR_LAND_SPRITES_ROUGH[tileHash(world.tileX(tile), world.tileY(tile)) & 7];
        case ClearGround.Rocks:
          return SPR_FLAT_ROCKY_LAND_1 + slopeOffset;
        case ClearGround.Fields:
          return SPR_FARMLAND_BARE + (world.m3[tile] & 0xf) + slopeOffset;
        case ClearGround.Desert:
        case ClearGround.Snow:
          return CLEAR_LAND_SPRITES_SNOW_DESERT[Math.min(3, density)] + slopeOffset;
        default:
          return null;
      }
    }
    case TileType.Water: {
      const slope = world.tileSlope(tile);
      if (world.waterTileType(tile) === 1) { // WaterTileType::Coast
        return SPR_SHORE_BASE + (SLOPE_TO_SHORE_SPRITE[slope] ?? 0);
      }
      return SPR_FLAT_WATER_TILE;
    }
    case TileType.Trees: {
      const slopeOffset = SLOPE_TO_SPRITE_OFFSET[world.tileSlope(tile)] ?? 0;
      const ground = getTreeGround(world, tile);
      const density = getTreeDensity(world, tile);
      switch (ground) {
        case TreeGround.Shore:
          return SPR_SHORE_BASE + (SLOPE_TO_SHORE_SPRITE[world.tileSlope(tile)] ?? 0);
        case TreeGround.Grass:
          return SPR_FLAT_BARE_LAND + slopeOffset + density * 19;
        case TreeGround.Rough:
          if (world.tileSlope(tile) !== 0) return SPR_FLAT_ROUGH_LAND + slopeOffset;
          return CLEAR_LAND_SPRITES_ROUGH[tileHash(world.tileX(tile), world.tileY(tile)) & 7];
        default:
          return CLEAR_LAND_SPRITES_SNOW_DESERT[Math.min(3, density)] + slopeOffset;
      }
    }
    case TileType.House:
    case TileType.Industry:
    case TileType.Station:
    case TileType.Object:
    case TileType.Road:
      return null; // stage 3
    default:
      return null;
  }
}
