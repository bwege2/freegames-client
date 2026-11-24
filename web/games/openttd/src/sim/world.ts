// The map's tile data and the slope helpers the generator and the renderer
// need. Mirrors src/tile_type.h, src/tile_map.{h,cpp}, src/clear_map.h,
// src/water_map.h.

export const TileType = {
  Clear: 0, Railway: 1, Road: 2, House: 3, Trees: 4, Station: 5,
  Water: 6, Void: 7, Industry: 8, TunnelBridge: 9, Object: 10,
} as const;
export type TileType = typeof TileType[keyof typeof TileType];

export const ClearGround = { Grass: 0, Rough: 1, Rocks: 2, Fields: 3, Snow: 4, Desert: 5 } as const;
export type ClearGround = typeof ClearGround[keyof typeof ClearGround];

export const WaterTileType = { Clear: 0, Coast: 1, Lock: 2, Depot: 3 } as const;
export type WaterTileType = typeof WaterTileType[keyof typeof WaterTileType];

export const WaterClass = { Sea: 0, Canal: 1, River: 2, Invalid: 3 } as const;
export type WaterClass = typeof WaterClass[keyof typeof WaterClass];

export const SLOPE_FLAT = 0x00;
export const SLOPE_W = 0x01;
export const SLOPE_S = 0x02;
export const SLOPE_E = 0x04;
export const SLOPE_N = 0x08;
export const SLOPE_STEEP = 0x10;
export const SLOPE_ELEVATED = SLOPE_N | SLOPE_E | SLOPE_S | SLOPE_W;

/** TropicZone, src/tile_type.h. */
export const TROPICZONE_NORMAL = 0;
export const TROPICZONE_DESERT = 1;
export const TROPICZONE_RAINFOREST = 2;

export const OWNER_NONE = 0x10;
export const OWNER_WATER = 0x11;

export const TILE_SIZE = 16;
export const MAX_TILE_HEIGHT = 255;
export const TILE_PIXELS = 32;
export const TILE_HEIGHT = 8;

/** _slope_to_sprite_offset from src/landscape.cpp. */
export const SLOPE_TO_SPRITE_OFFSET = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0,
  0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 17, 0, 15, 18, 0,
];

/** _tileh_to_shoresprite from src/water_cmd.cpp (DrawShoreTile). */
export const SLOPE_TO_SHORE_SPRITE = [
  0, 1, 2, 3, 4, 16, 6, 7, 8, 9, 17, 11, 12, 13, 14, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 10, 15, 0,
];

export class World {
  readonly sizeX: number;
  readonly sizeY: number;
  readonly size: number;
  readonly logX: number;
  readonly logY: number;
  readonly type: Uint8Array;
  readonly height: Uint8Array;
  readonly m1: Uint8Array;
  readonly m2: Uint16Array;
  readonly m3: Uint8Array;
  readonly m4: Uint8Array;
  readonly m5: Uint8Array;
  readonly m6: Uint8Array;
  readonly m7: Uint8Array;
  readonly m8: Uint8Array;
  landscapeKind = 0;

  constructor(sizeX: number, sizeY: number) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.size = sizeX * sizeY;
    this.logX = Math.log2(sizeX);
    this.logY = Math.log2(sizeY);
    this.type = new Uint8Array(this.size);
    this.height = new Uint8Array(this.size);
    this.m1 = new Uint8Array(this.size);
    this.m2 = new Uint16Array(this.size);
    this.m3 = new Uint8Array(this.size);
    this.m4 = new Uint8Array(this.size);
    this.m5 = new Uint8Array(this.size);
    this.m6 = new Uint8Array(this.size);
    this.m7 = new Uint8Array(this.size);
    this.m8 = new Uint8Array(this.size);
  }

  tileXY(x: number, y: number): number { return x + y * this.sizeX; }
  tileX(t: number): number { return t % this.sizeX; }
  tileY(t: number): number { return Math.floor(t / this.sizeX); }
  inMap(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < this.sizeX && y < this.sizeY; }

  tileType(t: number): TileType { return (this.type[t] >> 4) as TileType; }
  setTileType(t: number, type: TileType): void { this.type[t] = (this.type[t] & 0x0f) | (type << 4); }
  tileHeight(t: number): number { return this.height[t]; }
  setTileHeight(t: number, h: number): void { this.height[t] = h & 0xff; }

  isInnerTile(t: number): boolean {
    const x = this.tileX(t), y = this.tileY(t);
    return x > 0 && y > 0 && x < this.sizeX - 1 && y < this.sizeY - 1;
  }

  clearGround(t: number): ClearGround { return ((this.m5[t] >> 2) & 7) as ClearGround; }
  clearDensity(t: number): number { return this.m5[t] & 3; }
  makeClear(t: number, ground: ClearGround, density: number): void {
    this.setTileType(t, TileType.Clear);
    this.m1[t] = OWNER_NONE;
    this.m2[t] = 0;
    this.m3[t] = 0;
    this.m4[t] = 0;
    this.m5[t] = (ground << 2) | (density & 3);
    this.m6[t] = 0;
    this.m7[t] = 0;
    this.m8[t] = 0;
  }

  /** DoClearSquare with _generating_world's density, src/landscape.cpp. */
  doClearSquare(t: number): void {
    this.makeClear(t, ClearGround.Grass, 3);
    this.clearNeighbourNonFloodingStates(t);
  }

  /** ClearNeighbourNonFloodingStates, src/water_cmd.cpp. */
  clearNeighbourNonFloodingStates(t: number): void {
    const x = this.tileX(t), y = this.tileY(t);
    for (const [dx, dy] of DIR_OFFSET) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= this.sizeX || ny >= this.sizeY) continue;
      const dest = this.tileXY(nx, ny);
      if (this.tileType(dest) === TileType.Water) this.m3[dest] &= ~1;
    }
  }

  makeVoid(t: number): void {
    this.setTileType(t, TileType.Void);
    this.height[t] = 0;
  }

  waterTileType(t: number): WaterTileType { return ((this.m5[t] >> 4) & 0xf) as WaterTileType; }
  waterClass(t: number): WaterClass { return ((this.m1[t] >> 5) & 3) as WaterClass; }

  makeSea(t: number): void {
    this.makeWater(t, WaterClass.Sea, 0);
  }

  makeShore(t: number): void {
    this.makeWater(t, WaterClass.Sea, 0);
    this.m5[t] = (WaterTileType.Coast << 4) | (this.m5[t] & 0xf);
  }

  makeWater(t: number, wc: WaterClass, randomBits: number): void {
    this.setTileType(t, TileType.Water);
    this.m1[t] = (wc << 5) | OWNER_WATER;
    this.m2[t] = 0;
    this.m3[t] = 0;
    this.m4[t] = randomBits;
    this.m5[t] = 0; // WaterTileType::Clear
    this.m6[t] = 0;
    this.m7[t] = 0;
    this.m8[t] = 0;
  }

  /** GetTileSlopeZ: the slope and the lowest corner height of a tile. */
  tileSlopeZ(t: number): [number, number] {
    const x = this.tileX(t), y = this.tileY(t);
    const x2 = Math.min(x + 1, this.sizeX - 1);
    const y2 = Math.min(y + 1, this.sizeY - 1);
    const hnorth = this.height[this.tileXY(x, y)];
    const hwest = this.height[this.tileXY(x2, y)];
    const heast = this.height[this.tileXY(x, y2)];
    const hsouth = this.height[this.tileXY(x2, y2)];
    return slopeGivenHeight(hnorth, hwest, heast, hsouth);
  }

  tileSlope(t: number): number { return this.tileSlopeZ(t)[0]; }

  /** GetTileZ: the lowest corner height in tile height units. */
  tileZ(t: number): number { return this.tileSlopeZ(t)[1]; }

  /** GetTileMaxZ: the highest corner height in tile height units. */
  tileMaxZ(t: number): number {
    const x = this.tileX(t), y = this.tileY(t);
    const x2 = Math.min(x + 1, this.sizeX - 1);
    const y2 = Math.min(y + 1, this.sizeY - 1);
    return Math.max(
      this.height[this.tileXY(x, y)],
      this.height[this.tileXY(x2, y)],
      this.height[this.tileXY(x, y2)],
      this.height[this.tileXY(x2, y2)],
    );
  }

  /** IsTileFlat: the flat height of a tile, or null when the tile is sloped. */
  isTileFlat(t: number): number | null {
    const [slope, z] = this.tileSlopeZ(t);
    return slope === SLOPE_FLAT ? z : null;
  }

  getTropicZone(t: number): number { return this.type[t] & 3; }
  setTropicZone(t: number, zone: number): void { this.type[t] = (this.type[t] & 0xfc) | (zone & 3); }

  /** A random tile, as Map::WrapToMap (the map side is a power of two). */
  wrapTile(r: number): number { return (r & (this.size - 1)) >>> 0; }

  /** Map::ScaleBySize */
  scaleBySize(n: number): number {
    return Math.ceil((n << (this.logX + this.logY - 12)) / 16);
  }
}

export function slopeGivenHeight(hnorth: number, hwest: number, heast: number, hsouth: number): [number, number] {
  const hminnw = Math.min(hnorth, hwest);
  const hmines = Math.min(heast, hsouth);
  const hmin = Math.min(hminnw, hmines);
  const hmaxnw = Math.max(hnorth, hwest);
  const hmaxes = Math.max(heast, hsouth);
  const hmax = Math.max(hmaxnw, hmaxes);
  let r = SLOPE_FLAT;
  if (hnorth !== hmin) r |= SLOPE_N;
  if (hwest !== hmin) r |= SLOPE_W;
  if (heast !== hmin) r |= SLOPE_E;
  if (hsouth !== hmin) r |= SLOPE_S;
  if (hmax - hmin === 2) r |= SLOPE_STEEP;
  return [r, hmin];
}

/** _flood_from_dirs[slope] from src/water_cmd.cpp, as Direction values
 * (N=0, NE=1, E=2, SE=3, S=4, SW=5, W=6, NW=7). */
export const FLOOD_FROM_DIRS: number[][] = [
  [7, 5, 3, 1], // SLOPE_FLAT
  [1, 3],       // SLOPE_W
  [7, 1],       // SLOPE_S
  [1],          // SLOPE_SW
  [7, 5],       // SLOPE_E
  [],           // SLOPE_EW
  [7],          // SLOPE_SE
  [0, 7, 1],    // SLOPE_WSE
  [5, 3],       // SLOPE_N
  [3],          // SLOPE_NW
  [],           // SLOPE_NS
  [2, 1, 3],    // SLOPE_NWS
  [5],          // SLOPE_NE
  [4, 5, 3],    // SLOPE_ENW
  [6, 5, 7],    // SLOPE_SEN
];

export const DIR_OFFSET: [number, number][] = [
  [-1, -1], // N
  [-1, 0],  // NE
  [-1, 1],  // E
  [0, 1],   // SE
  [1, 1],   // S
  [1, 0],   // SW
  [1, -1],  // W
  [0, -1],  // NW
];
