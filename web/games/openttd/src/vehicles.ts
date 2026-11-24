// Milestone 5c: the first earning road vehicle.
//
// Balogh Coal Truck, original data from src/table/engines.h:
//   ROV(1, 108, 90, ..., 96, 20, 38, 12)
// Purchase cost = GetPrice(PR_BUILD_VEHICLE_ROAD=14000, 108, -8) = 5906.
// Running cost = GetPrice(PR_RUNNING_ROADVEH=1600, 90, -8) = 562 per year.
// Speed 96, capacity 20 t.
// Coal payment follows GetTransportedGoodsIncome with a fast (<7 day)
// transit: dist * 255 * units * 5916 >> 21 (initial payment from
// src/table/cargo_const.h; transit periods 7/255).
// Time is simplified to one game day per real second; movement uses the
// original top speed with a linear acceleration approximation.

import type { Scenario } from './scenario.ts';
import { Construction } from './construction.ts';
import { World } from './sim/world.ts';

export const COAL_TRUCK = {
  name: 'Balogh Coal Truck',
  image: 0xcdc, // _roadveh_images[1]; the coal truck's image index is 1
  purchaseCost: 5906,
  runningCostPerYear: 562,
  maxSpeed: 96,
  capacity: 20,
  cargo: 'Coal',
} as const;

/** GetTransportedGoodsIncome for the fast-transit branch. */
export function coalPayment(units: number, distance: number, transitDays: number): number {
  if (units <= 0 || distance <= 0) return 0;
  const periods1 = 7, periods2 = 255;
  const over1 = Math.max(transitDays - periods1, 0);
  const over2 = Math.max(over1 - periods2, 0);
  if (over1 === 0) return Math.floor((distance * 255 * units * 5916) / 2 ** 21);
  // Slow branch: MIN_TIME_FACTOR 31, MAX_TIME_FACTOR 255.
  const timeFactor = Math.max(255 - over1 - over2, 31);
  return Math.floor((distance * timeFactor * units * 5916) / 2 ** 21);
}

export interface Truck {
  id: number;
  path: number[];
  pos: number;
  speed: number;
  cargo: number;
  loadedAt: number; // game days since loading
  orders: number[];
  dwell: number;
  reverseAfterDwell: boolean;
  revenue: number;
  running: number;
  trips: number;
}

export interface FleetSave {
  time: number;
  stock: number;
  revenue: number;
  runningCosts: number;
  purchases: number;
  nextId: number;
  trucks: Truck[];
}

export interface TruckView {
  id: number;
  tile: number;
  nextTile: number | null;
  between: number; // 0..1 along the segment
  cargo: number;
  orders: number[];
  speed: number;
  profit: number;
  revenue: number;
  running: number;
  trips: number;
}

const MAX_SPEED = COAL_TRUCK.maxSpeed / 48; // tiles per second (96 -> 2)
const ACCEL = 1; // tiles/s^2, an approximation of the original acceleration

export class Fleet {
  readonly trucks: Truck[] = [];
  time = 0;
  stock = 20; // coal available at the mine, tonnes
  revenue = 0;
  runningCosts = 0;
  purchases = 0;
  private nextId = 1;
  private readonly world: World;
  private readonly construction: Construction;
  private readonly scenario: Scenario;

  constructor(world: World, construction: Construction, scenario: Scenario) {
    this.world = world;
    this.construction = construction;
    this.scenario = scenario;
  }

  private industryDistance(stop: number, industry: { x: number; y: number; width: number; height: number }): number {
    const sx = this.world.tileX(stop), sy = this.world.tileY(stop);
    let best = Infinity;
    for (let y = industry.y; y < industry.y + industry.height; y++) {
      for (let x = industry.x; x < industry.x + industry.width; x++) {
        best = Math.min(best, Math.abs(sx - x) + Math.abs(sy - y));
      }
    }
    return best;
  }

  /** Truck-stop catchment rating (0..100) for an industry, four-tile radius. */
  ratingFor(stop: number, industryIndex: number): number {
    const d = this.industryDistance(stop, this.scenario.industries[industryIndex]);
    return d <= 4 ? Math.max(0, 100 - (d - 1) * 20) : 0;
  }

  private walkable(tile: number): boolean {
    return this.construction.roads.has(tile) || this.construction.stops.has(tile);
  }

  /** Four-directional BFS over roads and stops; no diagonal shortcuts. */
  findPath(from: number, to: number): number[] | null {
    if (!this.walkable(from) || !this.walkable(to)) return null;
    const prev = new Map<number, number>();
    prev.set(from, -1);
    const queue = [from];
    for (let i = 0; i < queue.length; i++) {
      const tile = queue[i];
      if (tile === to) {
        const path: number[] = [];
        for (let t = to; t !== -1; t = prev.get(t)!) path.push(t);
        return path.reverse();
      }
      const x = this.world.tileX(tile), y = this.world.tileY(tile);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        const nx = x + dx, ny = y + dy;
        if (!this.world.inMap(nx, ny)) continue;
        const next = this.world.tileXY(nx, ny);
        if (prev.has(next) || !this.walkable(next)) continue;
        prev.set(next, tile);
        queue.push(next);
      }
    }
    return null;
  }

  buyTruck(stop: number): { ok: boolean; reason?: string; truck?: Truck } {
    if (!this.construction.stops.has(stop)) return { ok: false, reason: 'select a truck stop first' };
    if (this.construction.money < COAL_TRUCK.purchaseCost) return { ok: false, reason: 'not enough money' };
    this.construction.money -= COAL_TRUCK.purchaseCost;
    this.purchases += COAL_TRUCK.purchaseCost;
    const truck: Truck = {
      id: this.nextId++, path: [stop], pos: 0, speed: 0, cargo: 0, loadedAt: 0,
      orders: [], dwell: 0, reverseAfterDwell: false, revenue: 0, running: 0, trips: 0,
    };
    this.trucks.push(truck);
    return { ok: true, truck };
  }

  setOrders(truck: Truck, orders: number[]): { ok: boolean; reason?: string } {
    if (orders.length < 2) return { ok: false, reason: 'two truck stops are needed' };
    const path = this.findPath(orders[0], orders[1]);
    if (path === null) return { ok: false, reason: 'no road route between the stops' };
    truck.orders = [...orders];
    truck.path = path;
    truck.pos = 0;
    truck.speed = 0;
    truck.dwell = 0.7;
    truck.reverseAfterDwell = false;
    truck.cargo = 0;
    this.arrive(truck, orders[0]);
    return { ok: true };
  }

  private arrive(truck: Truck, stop: number): void {
    const mineRating = this.ratingFor(stop, 0);
    const powerRating = this.ratingFor(stop, 1);
    if (mineRating > 0 && truck.cargo === 0) {
      const available = Math.max(0, Math.floor(this.stock * mineRating / 100));
      truck.cargo = Math.min(COAL_TRUCK.capacity, available);
      this.stock -= truck.cargo;
      truck.loadedAt = 0;
    } else if (powerRating > 0 && truck.cargo > 0) {
      const distance = Math.abs(this.world.tileX(truck.orders[0]) - this.world.tileX(truck.orders[1])) +
        Math.abs(this.world.tileY(truck.orders[0]) - this.world.tileY(truck.orders[1]));
      const payment = coalPayment(truck.cargo, distance, Math.floor(truck.loadedAt));
      this.construction.money += payment;
      this.revenue += payment;
      truck.revenue += payment;
      truck.trips++;
      truck.cargo = 0;
      // A done trip waits for the mine to produce again on the next visit.
    }
  }

  tick(dt: number): void {
    const days = dt;
    this.time += days; // 1 real second = 1 game day in 5c
    this.stock = Math.min(100, this.stock + (15 / 30) * days);
    for (const truck of this.trucks) {
      if (truck.orders.length < 2 || truck.path.length < 2) continue;
      if (truck.dwell > 0) {
        truck.dwell -= dt;
        if (truck.dwell <= 0) {
          truck.dwell = 0;
          if (truck.reverseAfterDwell) {
            truck.path.reverse();
            truck.reverseAfterDwell = false;
          }
          truck.pos = 0;
          truck.speed = 0;
        }
        continue;
      }
      truck.speed = Math.min(MAX_SPEED, truck.speed + ACCEL * dt);
      truck.pos += truck.speed * dt;
      truck.loadedAt += truck.cargo > 0 ? days : 0;
      const cost = (COAL_TRUCK.runningCostPerYear / 365) * days;
      this.construction.money -= cost;
      this.runningCosts += cost;
      truck.running += cost;
      if (truck.pos >= truck.path.length - 1) {
        truck.pos = truck.path.length - 1;
        truck.speed = 0;
        truck.dwell = 0.8;
        truck.reverseAfterDwell = true;
        this.arrive(truck, truck.path[truck.path.length - 1]);
      }
    }
  }

  truckAt(tile: number): Truck | null {
    for (const truck of this.trucks) {
      if (truck.path[Math.min(truck.path.length - 1, Math.floor(truck.pos))] === tile) return truck;
    }
    return null;
  }

  serialize(): FleetSave {
    return {
      time: this.time, stock: this.stock, revenue: this.revenue, runningCosts: this.runningCosts,
      purchases: this.purchases, nextId: this.nextId,
      trucks: this.trucks.map((t) => ({
        ...t, path: [...t.path], orders: [...t.orders],
      })),
    };
  }

  restore(save: FleetSave): void {
    this.time = save.time;
    this.stock = save.stock;
    this.revenue = save.revenue;
    this.runningCosts = save.runningCosts;
    this.purchases = save.purchases;
    this.nextId = save.nextId;
    this.trucks.length = 0;
    for (const t of save.trucks) {
      this.trucks.push({ ...t, path: [...t.path], orders: [...t.orders] });
    }
  }

  view(truck: Truck): TruckView {
    const i = Math.min(truck.path.length - 1, Math.floor(truck.pos));
    const next = i + 1 < truck.path.length ? truck.path[i + 1] : null;
    return {
      id: truck.id,
      tile: truck.path[i],
      nextTile: next,
      between: next === null ? 0 : truck.pos - i,
      cargo: truck.cargo,
      orders: truck.orders,
      speed: truck.speed,
      profit: truck.revenue - truck.running,
      revenue: truck.revenue,
      running: truck.running,
      trips: truck.trips,
    };
  }
}
