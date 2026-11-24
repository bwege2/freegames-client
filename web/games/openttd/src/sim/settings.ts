// The new-game settings the generator reads, with OpenTTD 15.3's defaults
// (src/settings_type.h and src/table/settings/*.ini). The port stores only
// what stage 2 uses; later stages extend it.
import { DEF_START_YEAR } from './date.ts';

export const Landscape = { Temperate: 0, Arctic: 1, Tropic: 2, Toyland: 3 } as const;
export type Landscape = typeof Landscape[keyof typeof Landscape];
export const CUSTOM_TERRAIN_TYPE = 5;
export const CUSTOM_SEA_LEVEL = 4;
export const CUSTOM_TOWN_NUMBER = 4;
export const MAP_HEIGHT_LIMIT_AUTO_MINIMUM = 30;
export const MAP_HEIGHT_LIMIT_AUTO_CEILING_ROOM = 15;
export const MAX_MAP_SIZE_BITS = 12;
export const MIN_MAP_SIZE_BITS = 6;
export const MAX_MAP_HEIGHT_LIMIT = 255;

export interface GenerationSettings {
  mapXLog: number;
  mapYLog: number;
  generationSeed: number;
  landscape: Landscape;
  tgenSmoothness: number; // 0..3
  variety: number; // 0..3
  quantitySeaLakes: number; // 0..4 (4 = custom)
  customSeaLevel: number; // percent when quantitySeaLakes == CUSTOM_SEA_LEVEL
  terrainType: number; // 0..5 (5 = custom)
  customTerrainType: number;
  mapHeightLimit: number; // 0 = auto
  freeformEdges: boolean;
  waterBorders: number; // BorderFlags bit set, 16 = random
  amountOfRivers: number;
  riverRouteRandom: number;
  minRiverLength: number;
  treePlacer: number; // 0 none, 1 original, 2 improved (the configured default)
  extraTreePlacement: number; // 0 no spread, 1 rainforest spread, 2 spread all, 3 no growth/spread
  startingYear: number;
  snowLineHeight: number;
  snowCoverage: number;
  desertCoverage: number;
}

/** The new-game defaults from the pinned OpenTTD 15.3 (256x256, temperate). */
export function defaultGeneration(seed = 1): GenerationSettings {
  return {
    mapXLog: 8,
    mapYLog: 8,
    generationSeed: seed >>> 0,
    landscape: Landscape.Temperate,
    tgenSmoothness: 1,
    variety: 0,
    quantitySeaLakes: 0,
    customSeaLevel: 1,
    terrainType: 1,
    customTerrainType: 30,
    mapHeightLimit: 0,
    freeformEdges: true,
    waterBorders: 16,
    amountOfRivers: 2,
    riverRouteRandom: 5,
    minRiverLength: 16,
    treePlacer: 2,
    extraTreePlacement: 2,
    startingYear: DEF_START_YEAR,
    snowLineHeight: 10,
    snowCoverage: 40,
    desertCoverage: 50,
  };
}
