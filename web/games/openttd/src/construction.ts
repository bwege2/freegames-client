// Milestone 5b: road and truck-stop construction with the original price
// bases from src/table/pricebase.h:
//   PR_BUILD_ROAD = 95
//   PR_CLEAR_ROAD = 40
//   PR_BUILD_STATION_TRUCK = 200
//   PR_CLEAR_STATION_TRUCK = 50
// Rules are simplified to what the scenario needs: flat, clear tiles; no
// houses, industries, trees, water or slopes; truck stops need an adjacent
// road. Town roads are pre-existing and cannot be demolished by the player.

import { TileType, World } from './sim/world.ts';
import type { Scenario } from './scenario.ts';

export const PRICE = {
  buildRoad: 95,
  clearRoad: 40,
  buildTruckStop: 200,
  clearTruckStop: 50,
  startingMoney: 100000,
} as const;

export type Owner = 'player' | 'town';

export interface Road {
  tile: number;
  owner: Owner;
}

export interface TruckStop {
  tile: number;
  orientation: number;
  sprite: number;
}

export interface ConstructionSave {
  money: number;
  roads: { tile: number; owner: Owner }[];
  stops: { tile: number; orientation: number; sprite: number }[];
}

export interface BuildResult {
  ok: boolean;
  cost: number;
  reason?: string;
}

const DIAG_OFFSETS: [number, number][] = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const TRUCK_STOP_SPRITES = [2708, 2709, 2710, 2711]; // SPR_TRUCK_STOP_{NE,SE,SW,NW}_GROUND

export class Construction {
  money: number = PRICE.startingMoney;
  readonly roads = new Map<number, Road>();
  readonly stops = new Map<number, TruckStop>();
  private readonly world: World;
  private readonly townRoads = new Set<number>();
  private readonly blocked = new Set<number>();

  constructor(world: World, scenario: Scenario | null) {
    this.world = world;
    if (scenario) {
      for (const road of scenario.town.roads) {
        this.townRoads.add(road.tile);
        this.roads.set(road.tile, { tile: road.tile, owner: 'town' });
      }
      for (const house of scenario.town.houses) this.blocked.add(house.tile);
      for (const industry of scenario.industries) {
        for (let dy = 0; dy < industry.height; dy++) for (let dx = 0; dx < industry.width; dx++) {
          this.blocked.add(world.tileXY(industry.x + dx, industry.y + dy));
        }
      }
    }
  }

  isTownRoad(tile: number): boolean { return this.townRoads.has(tile); }

  serialize(): ConstructionSave {
    return {
      money: this.money,
      roads: [...this.roads.values()].map((r) => ({ tile: r.tile, owner: r.owner })),
      stops: [...this.stops.values()].map((s) => ({ tile: s.tile, orientation: s.orientation, sprite: s.sprite })),
    };
  }

  restore(save: ConstructionSave): void {
    this.money = save.money;
    this.roads.clear();
    this.stops.clear();
    for (const r of save.roads) this.roads.set(r.tile, { tile: r.tile, owner: r.owner === 'town' ? 'town' : 'player' });
    for (const st of save.stops) this.stops.set(st.tile, { tile: st.tile, orientation: st.orientation, sprite: st.sprite });
  }

  private landOk(tile: number): boolean {
    return this.world.tileType(tile) === TileType.Clear && this.world.tileSlope(tile) === 0;
  }

  private hasAdjacentRoad(tile: number): number {
    const x = this.world.tileX(tile), y = this.world.tileY(tile);
    for (let d = 0; d < 4; d++) {
      const nx = x + DIAG_OFFSETS[d][0], ny = y + DIAG_OFFSETS[d][1];
      if (!this.world.inMap(nx, ny)) continue;
      if (this.roads.has(this.world.tileXY(nx, ny))) return d;
    }
    return -1;
  }

  canBuildRoad(tile: number): BuildResult {
    if (this.world.tileType(tile) === TileType.Water || this.world.tileSlope(tile) !== 0) {
      return { ok: false, cost: 0, reason: 'flat clear land required' };
    }
    if (this.blocked.has(tile)) return { ok: false, cost: 0, reason: 'occupied by a building' };
    if (this.stops.has(tile)) return { ok: false, cost: 0, reason: 'occupied by a truck stop' };
    if (this.roads.has(tile)) return { ok: true, cost: 0 }; // connecting to an existing road is free
    if (!this.landOk(tile)) return { ok: false, cost: 0, reason: 'flat clear land required' };
    return { ok: true, cost: PRICE.buildRoad };
  }

  /** Build one road tile, deducting the original price. */
  buildRoad(tile: number): BuildResult {
    const check = this.canBuildRoad(tile);
    if (!check.ok) return check;
    if (check.cost > this.money) return { ok: false, cost: 0, reason: 'not enough money' };
    if (!this.roads.has(tile)) this.roads.set(tile, { tile, owner: 'player' });
    this.money -= check.cost;
    return check;
  }

  /**
   * Build an L-shaped line: x first, then y. Diagonals in the map's tile grid
   * are therefore two straight runs; each tile is checked separately.
   */
  buildRoadLine(from: number, to: number): BuildResult {
    const ax = this.world.tileX(from), ay = this.world.tileY(from);
    const bx = this.world.tileX(to), by = this.world.tileY(to);
    let cost = 0;
    const tiles: number[] = [];
    const sx = Math.sign(bx - ax), sy = Math.sign(by - ay);
    for (let x = ax; x !== bx + sx && sx !== 0; x += sx) tiles.push(this.world.tileXY(x, ay));
    if (sx === 0) tiles.push(this.world.tileXY(ax, ay));
    for (let y = ay + (sx === 0 ? 0 : sy); y !== by + sy && sy !== 0; y += sy) tiles.push(this.world.tileXY(bx, y));
    for (const tile of tiles) {
      const r = this.buildRoad(tile);
      if (!r.ok) return { ok: false, cost, reason: r.reason };
      cost += r.cost;
    }
    return { ok: true, cost };
  }

  canPlaceTruckStop(tile: number): BuildResult {
    if (this.world.tileType(tile) === TileType.Water || this.world.tileSlope(tile) !== 0) {
      return { ok: false, cost: 0, reason: 'flat clear land required' };
    }
    if (this.blocked.has(tile)) return { ok: false, cost: 0, reason: 'occupied by a building' };
    if (this.roads.has(tile) || this.stops.has(tile)) return { ok: false, cost: 0, reason: 'tile is occupied' };
    if (this.hasAdjacentRoad(tile) < 0) return { ok: false, cost: 0, reason: 'truck stop must be next to a road' };
    return { ok: true, cost: PRICE.buildTruckStop };
  }

  placeTruckStop(tile: number): BuildResult {
    const check = this.canPlaceTruckStop(tile);
    if (!check.ok) return check;
    if (check.cost > this.money) return { ok: false, cost: 0, reason: 'not enough money' };
    const orientation = this.hasAdjacentRoad(tile);
    this.stops.set(tile, { tile, orientation, sprite: TRUCK_STOP_SPRITES[orientation] });
    this.money -= check.cost;
    return check;
  }

  /** Demolish a player road or truck stop for the original clear cost. */
  demolish(tile: number): BuildResult {
    if (this.stops.has(tile)) {
      if (PRICE.clearTruckStop > this.money) return { ok: false, cost: 0, reason: 'not enough money' };
      this.stops.delete(tile);
      this.money -= PRICE.clearTruckStop;
      return { ok: true, cost: PRICE.clearTruckStop };
    }
    const road = this.roads.get(tile);
    if (!road) return { ok: false, cost: 0, reason: 'nothing to demolish' };
    if (road.owner === 'town') return { ok: false, cost: 0, reason: 'town roads cannot be demolished' };
    if (PRICE.clearRoad > this.money) return { ok: false, cost: 0, reason: 'not enough money' };
    this.roads.delete(tile);
    this.money -= PRICE.clearRoad;
    return { ok: true, cost: PRICE.clearRoad };
  }
}
