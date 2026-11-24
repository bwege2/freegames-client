// Milestone 5a: one deterministic scenario on the generated map.
//
// Town and industry placement is simplified: the scenario searches the
// generated map for verified flat, clear land and places original OpenGFX
// building sprites there instead of running the full town/industry generator.
// The gameplay data below is copied from the original tables:
//   cargo: src/table/cargo_const.h MK(1, CT_COAL, ... initial payment 5916,
//          transit periods 7/255, weight 16)
//   coal mine: src/table/build_industry.h MI(_tile_table_coal_mine, ...
//          produces CT_COAL at rate 15)
//   power station: MI(_tile_table_power_station, ... accepts CT_COAL with
//          input multiplier 256; its coal-accepting tile has 8/8 acceptance,
//          src/table/build_industry.h _origin_industry_tile_specs)
// Sprites: SPR_BUILD_TOWNHOUSE_06_V1 (1446), SPR_ROAD_X (1333),
//          and industry sprites from the 2050/2054 ranges. See NOTES.md.

import { TileType, World } from './sim/world.ts';

export const COAL = {
  label: 'COAL',
  name: 'Coal',
  cargoBit: 1,
  initialPayment: 5916,
  transitPeriods: [7, 255] as const,
  weight: 16,
  classes: ['Bulk', 'Non-potable'],
} as const;

export const COAL_MINE = {
  name: 'Coal Mine',
  produces: { cargo: 'Coal', rate: 15 },
  accepts: [] as string[],
  width: 3,
  height: 2,
  sprite: 2050,
} as const;

export const POWER_STATION = {
  name: 'Power Station',
  produces: null,
  accepts: [{ cargo: 'Coal', multiplier: 256, tileAcceptance: 8 }],
  width: 4,
  height: 2,
  sprite: 2054,
} as const;

export const TOWN = {
  name: 'Barton',
  width: 5,
  height: 5,
  houseSprite: 1446,
  roadSprite: 1333,
  accepts: ['Passengers', 'Mail'],
} as const;

export interface ScenarioTile {
  tile: number;
  sprite: number;
  /** Screen y offset within the tile, before the sprite's own offsets. */
  dy: number;
}

export interface ScenarioIndustry {
  id: 'coal-mine' | 'power-station';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: number;
  produces: { cargo: string; rate: number } | null;
  accepts: readonly { cargo: string; multiplier: number; tileAcceptance?: number }[];
}

export interface ScenarioTown {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  houses: ScenarioTile[];
  roads: ScenarioTile[];
  accepts: readonly string[];
}

export interface Scenario {
  town: ScenarioTown;
  industries: ScenarioIndustry[];
  cargo: typeof COAL;
}

function isFlatClear(world: World, x: number, y: number): boolean {
  if (!world.inMap(x, y)) return false;
  const t = world.tileXY(x, y);
  return world.tileType(t) === TileType.Clear && world.tileSlope(t) === 0;
}

function areaFlatClear(world: World, x: number, y: number, w: number, h: number): boolean {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
    if (!isFlatClear(world, x + dx, y + dy)) return false;
  }
  return true;
}

function findArea(
  world: World, w: number, h: number, accept: (x: number, y: number) => boolean,
): { x: number; y: number } | null {
  const cx = world.sizeX >> 1, cy = world.sizeY >> 1;
  for (let r = 0; r < Math.max(world.sizeX, world.sizeY); r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 1 || y < 1 || x + w >= world.sizeX - 1 || y + h >= world.sizeY - 1) continue;
        if (accept(x, y) && areaFlatClear(world, x, y, w, h)) return { x, y };
      }
    }
  }
  return null;
}

function chebyshev(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

/** An L-shaped road corridor exists when both straight runs are flat/clear. */
function corridorFlatClear(world: World, ax: number, ay: number, bx: number, by: number): boolean {
  const sx = Math.sign(bx - ax), sy = Math.sign(by - ay);
  for (let x = ax; ; x += sx) {
    if (!isFlatClear(world, x, ay)) return false;
    if (x === bx) break;
  }
  for (let y = ay; ; y += sy) {
    if (!isFlatClear(world, bx, y)) return false;
    if (y === by) break;
  }
  return true;
}

/** Build the fixed scenario for a generated world. Deterministic. */
export function buildScenario(world: World): Scenario {
  const coal = findArea(world, COAL_MINE.width, COAL_MINE.height, () => true);
  if (!coal) throw new Error('scenario: no flat land for the coal mine');
  const power = findArea(world, POWER_STATION.width, POWER_STATION.height,
    (x, y) => chebyshev(x, y, coal.x, coal.y) >= 6 &&
      corridorFlatClear(world, coal.x - 1, coal.y + COAL_MINE.height - 1, x - 1, y + POWER_STATION.height - 1));
  if (!power) throw new Error('scenario: no flat land for the power station');
  const town = findArea(world, TOWN.width, TOWN.height,
    (x, y) => chebyshev(x, y, coal.x, coal.y) >= 10 && chebyshev(x, y, power.x, power.y) >= 10);
  if (!town) throw new Error('scenario: no flat land for the town');

  const houses: ScenarioTile[] = [];
  const roads: ScenarioTile[] = [];
  const houseOffsets: [number, number][] = [
    [0, 0], [0, 1], [0, 3], [0, 4], [1, 0], [3, 0], [4, 0], [4, 1],
    [4, 3], [4, 4], [1, 4], [3, 4],
  ];
  for (const [dx, dy] of houseOffsets) {
    houses.push({ tile: world.tileXY(town.x + dx, town.y + dy), sprite: TOWN.houseSprite, dy: 0 });
  }
  const roadTiles = new Set<number>();
  for (let i = 0; i < TOWN.width; i++) {
    for (const tile of [world.tileXY(town.x + i, town.y + 2), world.tileXY(town.x + 2, town.y + i)]) {
      if (roadTiles.has(tile)) continue;
      roadTiles.add(tile);
      roads.push({ tile, sprite: TOWN.roadSprite, dy: 0 });
    }
  }

  return {
    cargo: COAL,
    town: { ...TOWN, x: town.x, y: town.y, houses, roads },
    industries: [
      {
        id: 'coal-mine', name: COAL_MINE.name, x: coal.x, y: coal.y,
        width: COAL_MINE.width, height: COAL_MINE.height, sprite: COAL_MINE.sprite,
        produces: { ...COAL_MINE.produces }, accepts: [],
      },
      {
        id: 'power-station', name: POWER_STATION.name, x: power.x, y: power.y,
        width: POWER_STATION.width, height: POWER_STATION.height, sprite: POWER_STATION.sprite,
        produces: null, accepts: [{ ...POWER_STATION.accepts[0] }],
      },
    ],
  };
}

export type ScenarioSelection =
  | { kind: 'town'; town: ScenarioTown }
  | { kind: 'industry'; industry: ScenarioIndustry };

/** The town or industry footprint containing a tile, if any. */
export function scenarioAt(scenario: Scenario, world: World, tile: number): ScenarioSelection | null {
  const x = world.tileX(tile), y = world.tileY(tile);
  if (x >= scenario.town.x && x < scenario.town.x + scenario.town.width &&
      y >= scenario.town.y && y < scenario.town.y + scenario.town.height) {
    return { kind: 'town', town: scenario.town };
  }
  for (const industry of scenario.industries) {
    if (x >= industry.x && x < industry.x + industry.width &&
        y >= industry.y && y < industry.y + industry.height) {
      return { kind: 'industry', industry };
    }
  }
  return null;
}

/** One-line data for the selection panel. */
export function scenarioDescription(selection: ScenarioSelection): string {
  if (selection.kind === 'town') {
    const t = selection.town;
    return `${t.name} · ${t.houses.length} buildings · accepts ${t.accepts.join(', ')}`;
  }
  const i = selection.industry;
  const accepted = i.accepts.length === 0 ? 'accepts nothing' :
    i.accepts.map((a) => `accepts ${a.cargo} (x${a.multiplier}${a.tileAcceptance ? `, tile ${a.tileAcceptance}/8` : ''})`).join(', ');
  const produced = i.produces === null ? 'produces nothing' : `produces ${i.produces.cargo} (${i.produces.rate}/month)`;
  return `${i.name} · ${produced} · ${accepted}`;
}
