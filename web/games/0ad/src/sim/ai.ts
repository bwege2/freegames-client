// The opponent. 0 A.D.'s Petra AI is a large scripted player (simulation/ai/petra/*.js) that uses
// the same commands a human does. This is a compact opponent of the same kind: it gathers with the
// original rates, builds with the original costs, trains the same units and attacks in a group.
// It never gets resources or units for free. README.md records what Petra does that this does not.
import { civBuilding, knownCiv, type World } from './world.ts';
import type { Entity } from './types.ts';
import { gatherRate, supplyType } from './economy.ts';
import type { Resource } from '../data/template-info.ts';
import { Rng } from './rng.ts';

const THINK_INTERVAL = 5;

interface AiState {
  lastThink: number;
  wave: boolean;
  target: number | null;
  desired: Record<Resource, number>;
}

export class Ai {
  readonly world: World;
  readonly player: number;
  /** the civilisation the opponent plays (athen or cart); its buildings and units come from the templates */
  readonly civ: string;
  private readonly rng: Rng;
  private state: AiState = { lastThink: -100, wave: false, target: null, desired: { food: 2, wood: 3, stone: 0, metal: 0 } };

  constructor(world: World, player = 2, seed = 7) {
    this.world = world;
    this.player = player;
    this.civ = knownCiv(world.players[player]?.civ ?? 'athen');
    this.rng = new Rng(seed);
  }

  update(): void {
    const p = this.world.players[this.player];
    if (p.defeated || this.world.winner !== null) return;
    if (this.world.time - this.state.lastThink < THINK_INTERVAL) return;
    this.state.lastThink = this.world.time;
    const my = this.world.entitiesOf(this.player);
    const units = my.filter((e) => e.kind === 'unit');
    const buildings = my.filter((e) => e.kind === 'building' && !e.construction);
    const civilians = units.filter((e) => e.role === 'civilian');
    const soldiers = units.filter((e) => e.role === 'soldier');
    const cc = buildings.find((b) => b.info.classes.includes('ConquestCritical'));

    this.manageEconomy(my, units, buildings, cc, civilians, soldiers);
    this.manageConstruction(my, buildings, cc);
    this.manageTraining(buildings, cc, civilians, soldiers);
    this.manageArmy(my, units, soldiers, buildings, cc);
  }

  private manageEconomy(my: Entity[], units: Entity[], buildings: Entity[], cc: Entity | undefined, civilians: Entity[], soldiers: Entity[]): void {
    const p = this.world.players[this.player];
    const hasStore = buildings.some((b) => b.template === civBuilding(this.civ, 'storehouse'));
    const hasFarm = buildings.some((b) => b.template === civBuilding(this.civ, 'farmstead'));
    this.state.desired = { food: 3, wood: 4, stone: hasStore ? 1 : 0, metal: hasStore ? 1 : 0 };
    if (civilians.length < 5) { this.state.desired.food = 1; this.state.desired.wood = 1; }
    // assign idle workers to the resource type that is furthest below its desired count
    for (const u of [...civilians, ...soldiers]) {
      if (u.order) continue;
      if (u.role === 'soldier' && this.state.wave) continue;
      const current: Record<Resource, number> = { food: 0, wood: 0, stone: 0, metal: 0 };
      for (const o of units) {
        if (o.order?.type === 'gather') current[o.order.resource]++;
      }
      const order: Resource[] = ['food', 'wood', 'stone', 'metal'];
      order.sort((a, b) => (this.state.desired[b] - current[b]) - (this.state.desired[a] - current[a]));
      const resource = order.find((r) => current[r] < this.state.desired[r] && gatherRate(u.info, { generic: r, specific: '', raw: r }) > 0) ?? order[0];
      this.assignGather(u, resource, units);
    }
    // keep a worker on a field if one exists
    if (hasFarm) {
      const field = buildings.find((b) => b.template === civBuilding(this.civ, 'field'));
      if (field && field.info.supply) {
        const gatherers = units.filter((u) => u.order?.type === 'gather' && u.order.target === field.id).length;
        if (gatherers < 2) {
          const worker = civilians.find((u) => !u.order) ?? soldiers.find((u) => !u.order);
          if (worker) this.world.orderGather([worker.id], field.id);
        }
      }
    }
    void cc; void p; void my;
  }

  private assignGather(worker: Entity, resource: Resource, units: Entity[]): void {
    let best: Entity | null = null;
    let bestD = Infinity;
    for (const t of this.world.entities.values()) {
      if (!t.alive || !t.info.supply || t.player !== 0) continue;
      const supply = supplyType(t.info.supply.type);
      if (supply.generic !== resource) continue;
      if (gatherRate(worker.info, supply, t.diminishingReturns) <= 0) continue;
      if (t.gatherers >= t.maxGatherers) continue;
      const d = Math.hypot(t.x - worker.x, t.z - worker.z);
      if (d < bestD) { bestD = d; best = t; }
    }
    if (!best) {
      // no matching resource: gather the closest thing the unit can gather
      for (const t of this.world.entities.values()) {
        if (!t.alive || !t.info.supply || t.player !== 0) continue;
        const supply = supplyType(t.info.supply.type);
        if (gatherRate(worker.info, supply, t.diminishingReturns) <= 0) continue;
        const d = Math.hypot(t.x - worker.x, t.z - worker.z);
        if (d < bestD) { bestD = d; best = t; }
      }
    }
    if (best) this.world.orderGather([worker.id], best.id);
    else if (units.includes(worker)) this.world.setOrder(worker, null);
  }

  private manageConstruction(my: Entity[], buildings: Entity[], cc: Entity | undefined): void {
    const p = this.world.players[this.player];
    const foundations = my.filter((e) => e.kind === 'building' && e.construction);
    // finish a foundation first
    if (foundations.length) {
      const builders = my.filter((u) => u.kind === 'unit' && u.role === 'civilian' && !u.carry && u.order?.type !== 'build').slice(0, 2);
      if (builders.length) this.world.orderBuild(builders.map((b) => b.id), foundations[0].id);
      return;
    }
    if (!cc) return;
    const has = (t: string) => buildings.some((b) => b.template === t);
    const house = civBuilding(this.civ, 'house');
    const storehouse = civBuilding(this.civ, 'storehouse');
    const farmstead = civBuilding(this.civ, 'farmstead');
    const field = civBuilding(this.civ, 'field');
    const barracks = civBuilding(this.civ, 'barracks');
    const wants: { template: string; check: boolean }[] = [
      { template: house, check: p.popCap - p.popUsed < 6 },
      { template: storehouse, check: !has(storehouse) },
      { template: farmstead, check: !has(farmstead) },
      { template: field, check: has(farmstead) && !has(field) },
      { template: barracks, check: !has(barracks) },
      { template: house, check: p.popUsed + 8 > p.popCap },
    ];
    for (const want of wants) {
      if (!want.check) continue;
      if (!this.world.canAfford(this.player, this.world.template(want.template))) continue;
      const spot = this.findBuildSpot(want.template, cc);
      if (!spot) continue;
      const b = this.world.placeBuilding(this.player, want.template, spot.x, spot.z, this.rng.next() * Math.PI * 2);
      if (!b) continue;
      const builders = my.filter((u) => u.kind === 'unit' && u.role === 'civilian' && !u.carry && u.order?.type !== 'build').slice(0, 2);
      if (builders.length) this.world.orderBuild(builders.map((x) => x.id), b.id);
      break;
    }
  }

  private findBuildSpot(template: string, cc: Entity): { x: number; z: number } | null {
    const info = this.world.template(template);
    const radius = Math.max(info.footprint.width, info.footprint.depth) / 2;
    for (let attempt = 0; attempt < 60; attempt++) {
      const angle = this.rng.next() * Math.PI * 2;
      const dist = 15 + radius + this.rng.next() * 20;
      const x = cc.x + Math.cos(angle) * dist;
      const z = cc.z + Math.sin(angle) * dist;
      if (this.world.canPlace(template, x, z)) return { x, z };
    }
    return null;
  }

  private manageTraining(buildings: Entity[], cc: Entity | undefined, civilians: Entity[], soldiers: Entity[]): void {
    const civilian = `units/${this.civ}/support_civilian`;
    if (cc) {
      const queued = cc.production.filter((i) => i.template.includes('support_civilian')).length;
      if (civilians.length + queued < 10 && this.world.canAfford(this.player, this.world.template(civilian))) {
        this.world.queueTraining(cc.id, civilian);
      }
    }
    const barracks = buildings.find((b) => b.template === civBuilding(this.civ, 'barracks'));
    if (barracks) {
      const q = barracks.production.length;
      if (soldiers.length + q < 22) {
        // the barracks' own Village-phase roster: a spearman and the civ's ranged soldier
        const options = this.world.trainOptions(barracks).filter((o) => o.affordable && o.info.unit);
        if (options.length) {
          const pick = options[soldiers.length % options.length];
          this.world.queueTraining(barracks.id, pick.template);
        }
      }
    }
  }

  private manageArmy(my: Entity[], units: Entity[], soldiers: Entity[], buildings: Entity[], cc: Entity | undefined): void {
    const enemies = [...this.world.entities.values()].filter((e) => e.alive && e.player === 1 && (e.kind === 'unit' || e.kind === 'building'));
    // defend the civic centre: attack enemies within 30 m
    if (cc) {
      const near = enemies.filter((e) => e.kind === 'unit' && Math.hypot(e.x - cc.x, e.z - cc.z) < 30);
      if (near.length) {
        for (const s of soldiers) {
          if (!s.order || s.order.type === 'move') this.world.orderAttack([s.id], near[0].id);
        }
        return;
      }
    }
    if (!soldiers.length) { this.state.wave = false; this.state.target = null; return; }
    if (this.state.wave && soldiers.length < 6) {
      // the wave was broken; stop feeding single soldiers into the enemy Civic Centre
      this.state.wave = false;
      this.state.target = null;
      return;
    }
    if (this.state.wave) {
      const target = this.state.target !== null ? this.world.entity(this.state.target) : null;
      if (target?.alive) {
        // keep every soldier of the wave on the target, including newly trained ones
        for (const s of soldiers) if (s.order?.type !== 'attack' || s.order.target !== target.id) this.world.orderAttack([s.id], target.id);
        return;
      }
      this.state.wave = false;
      this.state.target = null;
    }
    if (soldiers.length >= 12 && enemies.length) {
      let target: Entity | null = null;
      let best = Infinity;
      const base = cc ?? soldiers[0];
      for (const e of enemies) {
        const d = Math.hypot(e.x - base.x, e.z - base.z);
        const bias = e.kind === 'unit' ? -2000 : e.info.classes.includes('ConquestCritical') ? -300 : 0;
        if (d + bias < best) { best = d + bias; target = e; }
      }
      if (target) {
        this.state.wave = true;
        this.state.target = target.id;
        for (const s of soldiers) this.world.orderAttack([s.id], target.id);
      }
    }
    void my; void units; void buildings;
  }

  /** For the HUD: a one-line status of what the opponent is doing. */
  status(): string {
    const my = this.world.entitiesOf(this.player);
    const soldiers = my.filter((e) => e.role === 'soldier').length;
    const civilians = my.filter((e) => e.role === 'civilian').length;
    return `${soldiers} soldiers, ${civilians} civilians${this.state.wave ? ' — attacking' : ''}`;
  }
}
