// The game world: one 0 A.D. skirmish map, its entities, the five-resource economy, construction,
// production, combat and victory, on 0 A.D.'s 200 ms turn.
//
// The numbers come from the resolved templates (data/template-info.ts). The parts that 0 A.D.
// implements in its C++ simulation are reimplemented here in TypeScript: movement, gathering,
// foundations, production queues, attack timing, projectiles, population and conquest.
import type { Scenario, Placement } from '../data/map.ts';
import type { Terrain } from '../data/pmp.ts';
import type { TemplateInfo, Resource } from '../data/template-info.ts';
import { RESOURCES } from '../data/template-info.ts';
import { NavGrid } from './path.ts';
import { Rng } from './rng.ts';
import { attackDamage, canTarget, targetScore, totalDamage } from './combat.ts';
import { acceptsResource, builderMultiplier, capacity, gatherRate, MAX_POPULATION, supplyType } from './economy.ts';
import type {
  Entity, EntityKind, Order, PlayerState, Projectile, UnitRole, Vec2, WorldOptions, WorldSnapshot,
} from './types.ts';
import { TURN_S } from './types.ts';

const START_RESOURCES = 300;

const PLAYER_COLORS: [number, number, number][] = [[1, 1, 1], [21 / 255, 55 / 255, 149 / 255], [150 / 255, 20 / 255, 20 / 255]];
const FOG_CELL = 4;

// The two civilisations the slice ships. 0 A.D.'s civ data (simulation/data/civs/{athen,cart}.json)
// replaces the map's generic skirmish units with the civ's own; Carthage's ranged citizen soldier is an
// archer, Athens' is a slinger. The other starting entity, a cavalryman, has no Village-phase
// equivalent in this port and is dropped (README.md).
const CIV_UNITS: Record<string, { civilian: string; melee: string; ranged: string }> = {
  athen: {
    civilian: 'units/athen/support_civilian',
    melee: 'units/athen/infantry_spearman_b',
    ranged: 'units/athen/infantry_slinger_b',
  },
  cart: {
    civilian: 'units/cart/support_civilian',
    melee: 'units/cart/infantry_spearman_b',
    ranged: 'units/cart/infantry_archer_b',
  },
};

/** The Village-phase buildings the port can place (the same seven in both civilisations). */
const BUILDINGS = ['house', 'storehouse', 'farmstead', 'field', 'barracks', 'defense_tower'];

/** A civilisation the port knows (`athen`, `cart`), or `athen` for anything else. */
export function knownCiv(civ: string): string {
  return CIV_UNITS[civ] ? civ : 'athen';
}

/** The other playable civilisation. */
export function otherCiv(civ: string): string {
  return knownCiv(civ) === 'athen' ? 'cart' : 'athen';
}

/** One of a civilisation's buildings, by the short template name (`house`, `barracks`, ...). */
export function civBuilding(civ: string, building: string): string {
  return `structures/${knownCiv(civ)}/${building}`;
}

/** The civilisation's citizen templates the map's generic skirmish entities become. */
export function civUnit(civ: string, kind: 'civilian' | 'melee' | 'ranged'): string {
  return CIV_UNITS[knownCiv(civ)][kind];
}

/** The buildings a player may place: all of them are Village-phase in the pinned templates. */
export function buildable(civ: string): string[] {
  return BUILDINGS.map((b) => civBuilding(civ, b));
}

const SCENERY = new Set(['actor|flora/trees/grass_1.xml', 'actor|geology/stone_granite_greek_med.xml']);

export interface TrainingOption { template: string; info: TemplateInfo; affordable: boolean; reason: string }
export interface BuildOption { template: string; info: TemplateInfo; affordable: boolean; reason: string }

export class World {
  readonly scenario: Scenario;
  readonly terrain: Terrain;
  readonly nav: NavGrid;
  readonly rng: Rng;
  readonly players: PlayerState[];
  readonly entities = new Map<number, Entity>();
  readonly projectiles: Projectile[] = [];
  readonly fogSize: number;
  /** per player id (index 0 unused): the cells that player has seen and sees now */
  readonly explored: Uint8Array[];
  readonly visible: Uint8Array[];
  time = 0;
  /** whole turns simulated (time / TURN_S); the lockstep's turn number */
  turn = 0;
  nextId = 1;
  winner: number | null = null;
  private readonly templateInfo: (name: string) => TemplateInfo;
  private readonly hasTemplate: (name: string) => boolean;
  private readonly onVictory?: (winner: number) => void;
  /** units killed/created, for the HUD and tests */
  readonly stats = { trained: [0, 0, 0], killed: [0, 0, 0], gathered: [0, 0, 0] };

  constructor(options: WorldOptions) {
    this.scenario = options.scenario;
    this.terrain = options.terrain;
    this.templateInfo = options.templates.info;
    this.hasTemplate = options.templates.has;
    this.onVictory = options.onVictory;
    this.rng = new Rng(options.seed ?? 1);
    const start = options.startingResources ?? START_RESOURCES;
    this.players = [
      { id: 0, name: 'Gaia', civ: 'gaia', color: [1, 1, 1], resources: { food: 0, wood: 0, stone: 0, metal: 0 }, popUsed: 0, popCap: 0, techs: new Set(), defeated: false },
      ...(options.players ?? [
        { name: 'Player 1', civ: 'athen', color: PLAYER_COLORS[1] },
        { name: 'Player 2', civ: 'athen', color: PLAYER_COLORS[2] },
      ]).map((p, i) => ({
        id: i + 1,
        name: p.name,
        civ: p.civ,
        color: p.color,
        resources: { food: start, wood: start, stone: start, metal: start } as Record<Resource, number>,
        popUsed: 0,
        popCap: 0,
        techs: new Set<string>(['phase_village']),
        defeated: false,
      })),
    ];
    const water = this.scenario.environment.water?.height ?? null;
    this.nav = new NavGrid(this.terrain, water);
    this.fogSize = Math.ceil(this.terrain.size / FOG_CELL);
    this.explored = this.players.map(() => new Uint8Array(this.fogSize * this.fogSize));
    this.visible = this.players.map(() => new Uint8Array(this.fogSize * this.fogSize));
    for (const placement of this.scenario.placements) this.spawnPlacement(placement);
    this.rebuildNav();
    this.recomputePopulation();
    this.updateFog();
    this.checkVictory();
  }

  // ---------------------------------------------------------------- creation

  private makeEntity(template: string, info: TemplateInfo, player: number, x: number, z: number, yaw: number): Entity {
    const kind: EntityKind = info.structure ? 'building' : info.unit ? 'unit' : info.resource ? 'resource' : 'scenery';
    let role: UnitRole | null = null;
    if (kind === 'unit') {
      if (info.classes.includes('CitizenSoldier') || info.visibleClasses.includes('Soldier')) role = 'soldier';
      else if (info.visibleClasses.includes('Civilian') || info.classes.includes('Civilian')) role = 'civilian';
      else role = 'fauna';
    }
    const width = info.footprint.width || info.footprint.radius * 2;
    const depth = info.footprint.depth || info.footprint.radius * 2;
    const radius = Math.max(0.4, info.footprint.shape === 'circle' ? info.footprint.radius : Math.max(width, depth) / 2);
    const supply = info.supply;
    return {
      id: this.nextId++, template, info, player, kind, role,
      x, z, yaw,
      hp: info.health, maxHp: info.health,
      radius, height: info.footprint.height || 4,
      alive: true, selected: false,
      construction: null, production: [], queueMax: 16, rally: null,
      order: null, path: [], pathIndex: 0,
      speed: info.walkSpeed,
      carry: null,
      attackCooldown: 0, pendingAttack: null, attackTarget: null,
      stance: 'aggressive',
      amount: supply ? (Number.isFinite(supply.max) ? supply.max : Infinity) : 0,
      capturePoints: info.capturePoints,
      supplyType: supply?.type ?? '',
      maxGatherers: supply?.maxGatherers ?? 0,
      diminishingReturns: supply?.diminishingReturns ?? 1,
      gatherers: 0,
      population: kind === 'unit' ? info.cost.population : 0,
      xp: 0,
      lastCombat: 0,
      seed: Math.floor(this.rng.next() * 0x7fffffff),
      uid: 0,
    };
  }

  private spawnPlacement(p: Placement): void {
    let template = p.template;
    if (template.startsWith('actor|')) {
      if (!SCENERY.has(template)) return;
      const info = this.templateInfo(template);
      const e = this.makeEntity(template, info, 0, p.x, p.z, p.angle);
      e.uid = p.uid;
      e.kind = 'scenery';
      e.role = null;
      e.height = 2;
      e.radius = 1;
      e.maxHp = 1;
      e.hp = 1;
      this.entities.set(e.id, e);
      return;
    }
    const civ = this.players[p.player]?.civ ?? 'athen';
    if (template === 'skirmish/structures/default_civil_centre') template = civBuilding(civ, 'civil_centre');
    else if (template === 'skirmish/units/default_support_civilian') template = civUnit(civ, 'civilian');
    else if (template === 'skirmish/units/default_infantry_melee_b') template = civUnit(civ, 'melee');
    else if (template === 'skirmish/units/default_infantry_ranged_b') template = civUnit(civ, 'ranged');
    if (!this.hasTemplate(template)) return;
    const info = this.templateInfo(template);
    if (!info.unit && !info.structure && !info.resource) return;
    const e = this.makeEntity(template, info, p.player, p.x, p.z, p.angle);
    e.uid = p.uid;
    if (p.player > 2) return;
    this.entities.set(e.id, e);
  }

  /** Rebuild the static navigation grid after a building/resource is removed. */
  rebuildNav(): void {
    const water = this.scenario.environment.water?.height ?? null;
    const nav = new NavGrid(this.terrain, water);
    for (const e of this.entities.values()) {
      if (!e.alive) continue;
      if (e.kind === 'building') {
        const w = e.info.obstruction.staticWidth || e.info.footprint.width || e.info.footprint.radius * 2;
        const d = e.info.obstruction.staticDepth || e.info.footprint.depth || e.info.footprint.radius * 2;
        nav.addObstacle(e.x, e.z, w, d);
      } else if (e.kind === 'resource' || e.kind === 'scenery') {
        if (e.info.obstruction.staticWidth > 0) {
          nav.addObstacle(e.x, e.z, e.info.obstruction.staticWidth, e.info.obstruction.staticDepth);
        } else if (e.info.footprint.shape === 'circle') {
          nav.addObstacle(e.x, e.z, e.radius * 2, e.radius * 2, true);
        } else if (e.info.footprint.width > 0) {
          nav.addObstacle(e.x, e.z, e.info.footprint.width, e.info.footprint.depth);
        }
      }
    }
    // assign into the readonly property once (the nav is replaced on every rebuild)
    (this as { nav: NavGrid }).nav = nav;
  }

  // ---------------------------------------------------------------- players

  recomputePopulation(): void {
    for (const p of this.players) {
      p.popUsed = 0;
      p.popCap = 0;
    }
    for (const e of this.entities.values()) {
      if (!e.alive) continue;
      if (e.player === 0) continue;
      if (e.kind === 'unit') this.players[e.player].popUsed += e.population;
      if (e.kind === 'building' && !e.construction) this.players[e.player].popCap += e.info.populationBonus;
    }
    for (let i = 1; i < this.players.length; i++) this.players[i].popCap = Math.min(MAX_POPULATION, this.players[i].popCap);
  }

  queuedPopulation(player: number): number {
    let n = 0;
    for (const e of this.entities.values()) {
      if (!e.alive || e.player !== player || e.kind !== 'building') continue;
      for (const item of e.production) {
        if (this.hasTemplate(item.template)) n += this.templateInfo(item.template).cost.population;
      }
    }
    return n;
  }

  canAfford(player: number, info: TemplateInfo): boolean {
    const p = this.players[player];
    for (const r of RESOURCES) if (p.resources[r] < info.cost.resources[r]) return false;
    return true;
  }

  pay(player: number, info: TemplateInfo): boolean {
    const p = this.players[player];
    if (!this.canAfford(player, info)) return false;
    for (const r of RESOURCES) p.resources[r] -= info.cost.resources[r];
    return true;
  }

  // ---------------------------------------------------------------- public queries

  entity(id: number): Entity | undefined { return this.entities.get(id); }

  template(name: string): TemplateInfo { return this.templateInfo(name); }

  aliveEntities(): Entity[] {
    return [...this.entities.values()].filter((e) => e.alive);
  }

  entitiesOf(player: number): Entity[] {
    return this.aliveEntities().filter((e) => e.player === player);
  }

  /** Buildings a player may place now: requirements and affordability from the templates. */
  buildOptions(player: number): BuildOption[] {
    const p = this.players[player];
    const out: BuildOption[] = [];
    for (const template of buildable(p.civ)) {
      if (!this.hasTemplate(template)) continue;
      const info = this.templateInfo(template);
      const missing = info.requirements.techs.filter((t) => !p.techs.has(t));
      out.push({
        template, info,
        affordable: missing.length === 0 && this.canAfford(player, info),
        reason: missing.length ? `needs ${missing.join(', ')}` : this.canAfford(player, info) ? '' : 'not enough resources',
      });
    }
    return out;
  }

  /** Units a building can train now. Only templates shipped with the port are offered. */
  trainOptions(building: Entity): TrainingOption[] {
    if (building.kind !== 'building' || building.construction || !building.info.trainer) return [];
    const p = this.players[building.player];
    if (p.defeated) return [];
    const out: TrainingOption[] = [];
    const popAvailable = p.popCap - p.popUsed - this.queuedPopulation(building.player);
    for (const raw of building.info.trainer.entities) {
      const template = raw.replace(/\{civ\}/g, p.civ).replace(/\{native\}/g, p.civ);
      if (!this.hasTemplate(template)) continue;
      const info = this.templateInfo(template);
      if (!info.unit) continue;
      const missing = info.requirements.techs.filter((t) => !p.techs.has(t));
      let reason = '';
      if (missing.length) reason = `needs ${missing.join(', ')}`;
      else if (!this.canAfford(building.player, info)) reason = 'not enough resources';
      else if (popAvailable < info.cost.population) reason = 'population limit';
      out.push({ template, info, affordable: reason === '', reason });
    }
    return out;
  }

  // ---------------------------------------------------------------- orders

  private stopGathering(e: Entity): void {
    if (e.order?.type === 'gather') {
      const target = this.entities.get(e.order.target);
      if (target) target.gatherers = Math.max(0, target.gatherers - 1);
    }
  }

  setOrder(e: Entity, order: Order | null): void {
    this.stopGathering(e);
    e.order = order;
    e.path = [];
    e.pathIndex = 0;
    e.pendingAttack = null;
    if (order?.type === 'gather') {
      const target = this.entities.get(order.target);
      if (target) target.gatherers++;
    }
    if (order?.type === 'attack') e.attackTarget = order.target;
  }

  /** Issue a move order to one or more units; formations are not implemented, units fan out. */
  orderMove(ids: number[], x: number, z: number): void {
    const units = ids.map((id) => this.entities.get(id)).filter((e): e is Entity => !!e && e.alive && e.kind === 'unit');
    if (!units.length) return;
    const cols = Math.ceil(Math.sqrt(units.length));
    units.forEach((e, i) => {
      const ox = (i % cols) - (cols - 1) / 2;
      const oz = Math.floor(i / cols) - (Math.ceil(units.length / cols) - 1) / 2;
      const tx = x + ox * (e.radius * 2 + 0.6);
      const tz = z + oz * (e.radius * 2 + 0.6);
      const spot = this.nav.nearestFree(tx, tz, 8) ?? { x, z };
      this.setOrder(e, { type: 'move', x: spot.x, z: spot.z });
      e.path = this.nav.findPath(e.x, e.z, spot.x, spot.z) ?? [];
      e.pathIndex = 0;
    });
  }

  orderAttack(ids: number[], target: number): boolean {
    const t = this.entities.get(target);
    if (!t || !t.alive) return false;
    let any = false;
    for (const id of ids) {
      const e = this.entities.get(id);
      if (!e || !e.alive || e.kind !== 'unit') continue;
      if (t.player === e.player) continue;
      this.setOrder(e, { type: 'attack', target });
      any = true;
    }
    return any;
  }

  orderGather(ids: number[], target: number): boolean {
    const t = this.entities.get(target);
    if (!t || !t.alive || !t.info.supply) return false;
    const supply = supplyType(t.info.supply.type);
    let any = false;
    for (const id of ids) {
      const e = this.entities.get(id);
      if (!e || !e.alive || e.kind !== 'unit' || !e.info.gatherer) continue;
      if (gatherRate(e.info, supply, t.diminishingReturns) <= 0) continue;
      if (t.gatherers >= t.maxGatherers) continue;
      this.setOrder(e, { type: 'gather', target, resource: supply.generic, specific: supply.specific });
      any = true;
    }
    return any;
  }

  orderBuild(ids: number[], target: number): boolean {
    const t = this.entities.get(target);
    if (!t || !t.alive || t.kind !== 'building' || !t.construction) return false;
    let any = false;
    for (const id of ids) {
      const e = this.entities.get(id);
      if (!e || !e.alive || e.kind !== 'unit' || !e.info.builder) continue;
      this.setOrder(e, { type: 'build', target });
      any = true;
    }
    return any;
  }

  // ---------------------------------------------------------------- placement / training

  /** Validate a building footprint without changing the world. */
  canPlace(template: string, x: number, z: number): boolean {
    if (!this.hasTemplate(template)) return false;
    const info = this.templateInfo(template);
    const w = info.footprint.width || info.footprint.radius * 2;
    const d = info.footprint.depth || info.footprint.radius * 2;
    if (!this.nav.freeArea(x, z, w, d, info.footprint.shape === 'circle')) return false;
    for (const e of this.entities.values()) {
      if (!e.alive || e.kind === 'scenery') continue;
      if (Math.abs(e.x - x) < (w + e.radius * 2) / 2 && Math.abs(e.z - z) < (d + e.radius * 2) / 2) return false;
    }
    return true;
  }

  placeBuilding(player: number, template: string, x: number, z: number, yaw = 0): Entity | null {
    if (player < 1 || player >= this.players.length) return null;
    const info = this.templateInfo(template);
    if (!info.structure || !this.canPlace(template, x, z)) return null;
    if (!this.pay(player, info)) return null;
    const e = this.makeEntity(template, info, player, x, z, yaw);
    e.construction = { progress: 0, work: 0 };
    e.hp = 1;
    this.entities.set(e.id, e);
    this.nav.addObstacle(x, z, info.obstruction.staticWidth || info.footprint.width || info.footprint.radius * 2,
      info.obstruction.staticDepth || info.footprint.depth || info.footprint.radius * 2);
    return e;
  }

  queueTraining(buildingId: number, template: string): boolean {
    const b = this.entities.get(buildingId);
    if (!b || !b.alive || b.kind !== 'building' || b.construction || b.production.length >= b.queueMax) return false;
    const p = this.players[b.player];
    if (p.defeated || !this.hasTemplate(template)) return false;
    const info = this.templateInfo(template);
    if (!info.unit) return false;
    if (info.requirements.techs.some((t) => !p.techs.has(t))) return false;
    if (!b.info.trainer?.entities.some((raw) => raw.replace(/\{civ\}/g, p.civ).replace(/\{native\}/g, p.civ) === template)) return false;
    if (p.popUsed + this.queuedPopulation(b.player) + info.cost.population > p.popCap) return false;
    if (!this.pay(b.player, info)) return false;
    b.production.push({ template, remaining: info.cost.buildTime, total: info.cost.buildTime });
    return true;
  }

  /** Convenience for the AI/UI: the nearest completed building that can train this unit. */
  findTrainer(player: number, template: string): Entity | null {
    let best: Entity | null = null;
    let bestD = Infinity;
    const p = this.players[player];
    for (const e of this.entities.values()) {
      if (!e.alive || e.kind !== 'building' || e.player !== player || e.construction || !e.info.trainer) continue;
      const ok = e.info.trainer.entities.some((raw) => raw.replace(/\{civ\}/g, p.civ).replace(/\{native\}/g, p.civ) === template);
      if (!ok) continue;
      const cc = this.entitiesOf(player).find((b) => b.kind === 'building' && b.info.classes.includes('ConquestCritical'));
      const d = cc ? Math.hypot(e.x - cc.x, e.z - cc.z) : 0;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  // ---------------------------------------------------------------- simulation

  update(): void {
    this.time += TURN_S;
    this.turn++;
    if (this.winner !== null) return;
    const list = this.aliveEntities();
    for (const e of list) {
      if (!e.alive) continue;
      if (e.kind === 'unit') this.updateUnit(e);
      else if (e.kind === 'building') this.updateBuilding(e);
    }
    this.updateProjectiles();
    this.separateUnits();
    for (const e of [...this.entities.values()]) if (!e.alive && this.time - e.lastCombat > 2) this.entities.delete(e.id);
    this.recomputePopulation();
    this.updateFog();
    this.checkVictory();
  }

  private groundAt(x: number, z: number): number { return this.terrain.heightAt(x, z); }

  private updateUnit(e: Entity): void {
    e.attackCooldown = Math.max(0, e.attackCooldown - TURN_S);
    if (!e.order && e.carry) {
      this.returnCarry(e);
      return;
    }
    if (e.pendingAttack) {
      e.pendingAttack.timer -= TURN_S;
      if (e.pendingAttack.timer <= 0) {
        this.resolveAttack(e, e.pendingAttack.target);
        e.pendingAttack = null;
      }
    }
    if (e.order?.type === 'attack') {
      const t = this.entities.get(e.order.target);
      if (!t || !t.alive || t.player === e.player) {
        this.setOrder(e, null);
      } else {
        this.updateAttackOrder(e, t);
        return;
      }
    } else if (e.order?.type === 'gather') {
      this.updateGatherOrder(e);
      return;
    } else if (e.order?.type === 'build') {
      this.updateBuildOrder(e);
      return;
    } else if (e.order?.type === 'move') {
      if (this.moveAlongPath(e)) {
        this.setOrder(e, null);
      } else {
        return;
      }
    }
    // idle: military units look for a target; civilians flee from nearby enemies
    if (e.role === 'soldier' && e.stance !== 'passive') this.autoAcquire(e);
    else if (e.role === 'civilian' && e.stance !== 'passive') this.flee(e);
  }

  private autoAcquire(e: Entity): void {
    const attack = e.info.attack.melee ?? e.info.attack.ranged;
    if (!attack) return;
    const range = e.stance === 'standground' ? attack.maxRange + 3 : e.info.visionRange;
    let best: Entity | null = null;
    let bestScore = -Infinity;
    for (const t of this.entities.values()) {
      if (!t.alive || t.player === e.player || t.player === 0) continue;
      if (t.kind !== 'unit' && t.kind !== 'building') continue;
      const d = Math.hypot(t.x - e.x, t.z - e.z);
      if (d > range + t.radius) continue;
      const score = targetScore(e, attack, t);
      if (score > bestScore) { bestScore = score; best = t; }
    }
    if (best) {
      this.setOrder(e, { type: 'attack', target: best.id });
      this.updateAttackOrder(e, best);
    }
  }

  private flee(e: Entity): void {
    let threat: Entity | null = null;
    let best = Infinity;
    for (const t of this.entities.values()) {
      if (!t.alive || t.player === e.player || t.player === 0 || t.kind !== 'unit') continue;
      const d = Math.hypot(t.x - e.x, t.z - e.z);
      if (d < 22 && d < best) { best = d; threat = t; }
    }
    if (!threat) return;
    const cc = this.entitiesOf(e.player).find((b) => b.kind === 'building' && b.info.classes.includes('ConquestCritical'));
    const target = cc ?? this.entitiesOf(e.player).find((b) => b.kind === 'building');
    if (!target) return;
    if (Math.hypot(target.x - e.x, target.z - e.z) < 8) return;
    this.setOrder(e, { type: 'move', x: target.x, z: target.z });
    e.path = this.nav.findPath(e.x, e.z, target.x, target.z) ?? [];
    e.pathIndex = 0;
  }

  private updateAttackOrder(e: Entity, t: Entity): void {
    const attack = e.info.attack.melee ?? e.info.attack.ranged;
    if (!attack) { this.setOrder(e, null); return; }
    if (!canTarget(attack, t.info)) { this.setOrder(e, null); return; }
    const d = Math.hypot(t.x - e.x, t.z - e.z);
    const range = attack.maxRange + t.radius + e.radius - 0.3;
    e.yaw = Math.atan2(t.x - e.x, t.z - e.z);
    if (d > range) {
      if (e.path.length === 0 || e.pathIndex >= e.path.length) {
        e.path = this.nav.findPath(e.x, e.z, t.x, t.z) ?? [];
        e.pathIndex = 0;
      }
      this.moveAlongPath(e);
      return;
    }
    e.path = [];
    e.pathIndex = 0;
    if (e.attackCooldown > 0 || e.pendingAttack) return;
    e.attackCooldown = attack.repeatTime / 1000;
    if (attack.prepareTime > 0) e.pendingAttack = { target: t.id, timer: attack.prepareTime / 1000 };
    else this.resolveAttack(e, t.id);
  }

  private resolveAttack(e: Entity, targetId: number): void {
    const t = this.entities.get(targetId);
    if (!t || !t.alive) return;
    const attack = e.info.attack.melee ?? e.info.attack.ranged;
    if (!attack) return;
    const d = Math.hypot(t.x - e.x, t.z - e.z);
    if (d > attack.maxRange + t.radius + 2.5) return;
    if (attack.projectile) {
      this.spawnProjectile(e, t, attack);
    } else {
      this.damage(t, attackDamage(attack, t.info), e);
    }
    // 0 A.D.'s capture: an infantry attack also takes loyalty from a building. A Civic Centre
    // whose capture points reach zero changes owner, which is the conquest victory of the slice.
    const captureValue = e.info.attack.capture?.captureValue ?? 0;
    if (t.kind === 'building' && captureValue > 0 && t.alive) {
      const amount = captureValue * Math.pow(0.9, t.info.captureResistance);
      t.capturePoints -= amount;
      if (t.capturePoints <= 0) this.captureBuilding(t, e.player, e);
    }
  }

  private captureBuilding(target: Entity, owner: number, captor: Entity): void {
    const old = target.player;
    if (old === owner || owner < 1) return;
    target.player = owner;
    target.capturePoints = target.info.capturePoints;
    target.production = [];
    target.rally = null;
    target.hp = Math.max(1, target.hp);
    target.lastCombat = this.time;
    for (const e of this.entities.values()) {
      if (e.order?.type === 'attack' && e.order.target === target.id) this.setOrder(e, null);
      if (e.order?.type === 'gather' && e.order.target === target.id) this.setOrder(e, null);
    }
    this.recomputePopulation();
    this.updateFog();
    this.checkVictory();
    void captor;
  }

  private spawnProjectile(e: Entity, t: Entity, attack: NonNullable<Entity['info']['attack']['ranged']>): void {
    const p = attack.projectile!;
    const spread = p.spread * Math.sqrt(this.rng.next());
    const angle = this.rng.next() * Math.PI * 2;
    const tx = t.x + Math.cos(angle) * spread;
    const tz = t.z + Math.sin(angle) * spread;
    const y0 = this.groundAt(e.x, e.z) + p.launchPoint;
    const ty = this.groundAt(t.x, t.z) + t.height * 0.55;
    const dist = Math.max(0.5, Math.hypot(tx - e.x, tz - e.z));
    const time = dist / Math.max(1, p.speed);
    const g = p.gravity || 9.8;
    this.projectiles.push({
      id: this.nextId++, owner: e.player,
      x: e.x, y: y0, z: e.z,
      vx: (tx - e.x) / time,
      vy: (ty - y0 + 0.5 * g * time * time) / time,
      vz: (tz - e.z) / time,
      gravity: g, target: t.id,
      damage: attackDamage(attack, t.info),
      bonuses: attack.bonuses,
      ttl: Math.max(2, time * 2.5),
    });
    e.lastCombat = this.time;
  }

  private updateProjectiles(): void {
    for (const p of this.projectiles) {
      const dt = TURN_S;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.y += p.vy * dt;
      p.vy -= p.gravity * dt;
      p.ttl -= dt;
      const t = this.entities.get(p.target);
      if (t && t.alive) {
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (d < t.radius + 0.8 && p.y < this.groundAt(t.x, t.z) + t.height + 1 && p.y > this.groundAt(t.x, t.z) - 1) {
          this.damage(t, p.damage, this.entities.get(p.id) ?? null, p.owner);
          p.ttl = -1;
          continue;
        }
      }
      if (p.y <= this.groundAt(p.x, p.z)) p.ttl = -1;
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) if (this.projectiles[i].ttl <= 0 || !Number.isFinite(this.projectiles[i].ttl)) this.projectiles.splice(i, 1);
  }

  private damage(t: Entity, damage: Record<string, number>, attacker: Entity | null, owner = attacker?.player ?? -1): void {
    if (!t.alive) return;
    const amount = totalDamage(damage);
    if (amount <= 0) return;
    t.hp -= amount;
    t.lastCombat = this.time;
    if (attacker) {
      attacker.lastCombat = this.time;
      if (t.kind === 'unit' && t.role === 'soldier' && t.order?.type !== 'attack') {
        const attack = t.info.attack.melee ?? t.info.attack.ranged;
        if (attack && owner > 0 && owner !== t.player && t.stance === 'aggressive') this.setOrder(t, { type: 'attack', target: attacker.id });
      }
    }
    if (t.hp <= 0) this.kill(t, owner >= 0 ? owner : (attacker?.player ?? -1));
  }

  private kill(t: Entity, killer: number): void {
    if (!t.alive) return;
    t.alive = false;
    t.hp = 0;
    t.lastCombat = this.time;
    t.order = null;
    t.path = [];
    t.pathIndex = 0;
    if (killer > 0 && killer < this.players.length) this.stats.killed[killer]++;
    if (t.kind === 'unit' || t.kind === 'building' || t.kind === 'resource') {
      for (const e of this.entities.values()) {
        if (e.order?.type === 'gather' && e.order.target === t.id) this.setOrder(e, null);
        if (e.order?.type === 'attack' && e.order.target === t.id) this.setOrder(e, null);
        if (e.order?.type === 'build' && e.order.target === t.id) this.setOrder(e, null);
      }
      if (t.kind === 'building' || t.kind === 'resource') this.rebuildNav();
    }
  }

  private updateGatherOrder(e: Entity): void {
    if (e.order?.type !== 'gather') return;
    const target = this.entities.get(e.order.target);
    if (!target || !target.alive || !target.info.supply) {
      this.tryRetargetGather(e);
      return;
    }
    const supply = supplyType(target.info.supply.type);
    const resource = supply.generic;
    const cap = capacity(e.info, resource);
    if (cap <= 0) { this.setOrder(e, null); return; }
    if (e.carry && e.carry.amount >= cap) {
      // go to a dropsite
      const drop = this.findDropsite(e, resource);
      if (!drop) { e.path = []; return; }
      const dd = Math.hypot(drop.x - e.x, drop.z - e.z) - drop.radius;
      if (dd > 2.5) {
        if (!e.path.length) e.path = this.nav.findPath(e.x, e.z, drop.x, drop.z) ?? [];
        this.moveAlongPath(e);
      } else {
        const p = this.players[e.player];
        p.resources[resource] += e.carry.amount;
        this.stats.gathered[e.player] += e.carry.amount;
        e.carry = null;
        e.path = [];
      }
      return;
    }
    const range = e.info.gatherer!.maxDistance + target.radius;
    const d = Math.hypot(target.x - e.x, target.z - e.z);
    if (d > range) {
      if (!e.path.length || e.pathIndex >= e.path.length) {
        e.path = this.nav.findPath(e.x, e.z, target.x, target.z) ?? [];
        e.pathIndex = 0;
      }
      this.moveAlongPath(e);
      return;
    }
    e.yaw = Math.atan2(target.x - e.x, target.z - e.z);
    if (!e.carry) e.carry = { resource, amount: 0, specific: supply.specific };
    if (e.carry.resource !== resource) { e.carry = { resource, amount: 0, specific: supply.specific }; }
    const rate = gatherRate(e.info, supply, target.diminishingReturns);
    if (rate <= 0) { this.setOrder(e, null); return; }
    const want = Math.min(rate * TURN_S, cap - e.carry.amount, Number.isFinite(target.amount) ? target.amount : Infinity);
    if (want <= 0) {
      if (target.amount <= 0) this.tryRetargetGather(e);
      return;
    }
    const taken = Number.isFinite(target.amount) ? Math.min(want, target.amount) : want;
    e.carry.amount += taken;
    if (Number.isFinite(target.amount)) {
      target.amount -= taken;
      if (target.amount <= 0.0001) {
        target.amount = 0;
        this.kill(target, e.player);
        this.tryRetargetGather(e);
      }
    }
  }

  /** An idle unit that still carries resources takes them to the nearest dropsite. */
  private returnCarry(e: Entity): void {
    if (!e.carry) return;
    const drop = this.findDropsite(e, e.carry.resource);
    if (!drop) { e.path = []; return; }
    const d = Math.hypot(drop.x - e.x, drop.z - e.z) - drop.radius;
    if (d > 2.5) {
      if (!e.path.length || e.pathIndex >= e.path.length) {
        e.path = this.nav.findPath(e.x, e.z, drop.x, drop.z) ?? [];
        e.pathIndex = 0;
      }
      this.moveAlongPath(e);
      return;
    }
    this.players[e.player].resources[e.carry.resource] += e.carry.amount;
    this.stats.gathered[e.player] += e.carry.amount;
    e.carry = null;
    e.path = [];
  }

  private tryRetargetGather(e: Entity): void {
    if (e.order?.type !== 'gather') { this.setOrder(e, null); return; }
    const resource = e.order.resource;
    let best: Entity | null = null;
    let bestD = 45;
    for (const t of this.entities.values()) {
      if (!t.alive || !t.info.supply || t.player !== 0) continue;
      if (supplyType(t.info.supply.type).generic !== resource) continue;
      const d = Math.hypot(t.x - e.x, t.z - e.z);
      if (d < bestD) { bestD = d; best = t; }
    }
    if (best) this.setOrder(e, { type: 'gather', target: best.id, resource, specific: supplyType(best.info.supply!.type).specific });
    else this.setOrder(e, null);
  }

  private findDropsite(e: Entity, resource: Resource): Entity | null {
    let best: Entity | null = null;
    let bestD = Infinity;
    for (const b of this.entities.values()) {
      if (!b.alive || b.kind !== 'building' || b.player !== e.player || b.construction) continue;
      if (!acceptsResource(b.info, resource)) continue;
      const d = Math.hypot(b.x - e.x, b.z - e.z);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  private updateBuildOrder(e: Entity): void {
    if (e.order?.type !== 'build') return;
    const target = this.entities.get(e.order.target);
    if (!target || !target.alive || !target.construction) { this.setOrder(e, null); return; }
    const d = Math.hypot(target.x - e.x, target.z - e.z) - target.radius - e.radius;
    if (d > 2.5) {
      if (!e.path.length || e.pathIndex >= e.path.length) {
        e.path = this.nav.findPath(e.x, e.z, target.x, target.z) ?? [];
        e.pathIndex = 0;
      }
      this.moveAlongPath(e);
      return;
    }
    e.yaw = Math.atan2(target.x - e.x, target.z - e.z);
    e.path = [];
    // Foundation.Build: deltaHP = work * (maxHP/BuildTime) * CalculateBuildMultiplier(n).
    // The port adds the same fraction of the build time for each builder in range.
    let builders = 0;
    for (const o of this.entities.values()) {
      if (!o.alive || o.kind !== 'unit' || o.order?.type !== 'build' || o.order.target !== target.id) continue;
      const od = Math.hypot(target.x - o.x, target.z - o.z) - target.radius - o.radius;
      if (od <= 2.5) builders++;
    }
    const work = (e.info.builder?.rate ?? 1) * TURN_S;
    target.construction.work += work;
    target.construction.progress = Math.min(1, target.construction.progress + work * builderMultiplier(Math.max(1, builders)) / target.info.cost.buildTime);
    target.hp = Math.max(1, target.maxHp * target.construction.progress);
    if (target.construction.progress >= 1) {
      target.construction = null;
      target.hp = target.maxHp;
      this.recomputePopulation();
      for (const o of this.entities.values()) {
        if (o.order?.type === 'build' && o.order.target === target.id) this.setOrder(o, null);
      }
    }
  }

  private updateBuilding(e: Entity): void {
    if (e.construction) return;
    if (e.production.length) {
      const item = e.production[0];
      item.remaining -= TURN_S;
      if (item.remaining <= 0) {
        const info = this.templateInfo(item.template);
        e.production.shift();
        const spot = this.findSpawnSpot(e);
        if (spot) {
          const u = this.makeEntity(item.template, info, e.player, spot.x, spot.z, this.rng.next() * Math.PI * 2);
          u.order = e.rally ? { type: 'move', x: e.rally.x, z: e.rally.z } : null;
          if (u.order) { u.path = this.nav.findPath(u.x, u.z, u.order.x, u.order.z) ?? []; u.pathIndex = 0; }
          this.entities.set(u.id, u);
          this.stats.trained[e.player]++;
          this.recomputePopulation();
        } else {
          // no room: retry next turn
          e.production.unshift(item);
          item.remaining = TURN_S;
        }
      }
    }
    const attack = e.info.attack.ranged;
    if (attack && e.attackCooldown <= 0) {
      let best: Entity | null = null;
      let bestD = Infinity;
      for (const t of this.entities.values()) {
        if (!t.alive || t.player === e.player || t.player === 0) continue;
        if (t.kind !== 'unit' && t.kind !== 'building') continue;
        if (!canTarget(attack, t.info)) continue;
        const d = Math.hypot(t.x - e.x, t.z - e.z);
        if (d <= attack.maxRange + t.radius && d < bestD) { bestD = d; best = t; }
      }
      if (best) {
        e.attackCooldown = attack.repeatTime / 1000;
        this.spawnProjectile(e, best, attack);
      }
    }
    e.attackCooldown = Math.max(0, e.attackCooldown - TURN_S);
  }

  private findSpawnSpot(b: Entity): Vec2 | null {
    const spot = this.nav.freeSpot(b.x, b.z, b.radius + 2, this.rng);
    if (!spot) return null;
    for (const e of this.entities.values()) {
      if (!e.alive || e.kind !== 'unit') continue;
      if (Math.hypot(e.x - spot.x, e.z - spot.z) < e.radius + 1) return null;
    }
    return spot;
  }

  /** Move along the current path; true when the path is finished. */
  private moveAlongPath(e: Entity): boolean {
    if (!e.path.length || e.pathIndex >= e.path.length) return true;
    let remaining = e.speed * TURN_S;
    while (remaining > 0 && e.pathIndex < e.path.length) {
      const wp = e.path[e.pathIndex];
      const dx = wp.x - e.x, dz = wp.z - e.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.05) { e.pathIndex++; continue; }
      if (d <= remaining) {
        e.x = wp.x; e.z = wp.z;
        remaining -= d;
        e.pathIndex++;
      } else {
        e.x += (dx / d) * remaining;
        e.z += (dz / d) * remaining;
        e.yaw = Math.atan2(dx, dz);
        remaining = 0;
      }
      if (d > 0.05) e.yaw = Math.atan2(dx, dz);
    }
    if (e.pathIndex >= e.path.length) { e.path = []; e.pathIndex = 0; return true; }
    return false;
  }

  private separateUnits(): void {
    const units: Entity[] = [];
    for (const e of this.entities.values()) if (e.alive && e.kind === 'unit') units.push(e);
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i], b = units[j];
        const dx = b.x - a.x, dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const min = a.radius + b.radius - 0.25;
        if (d >= min || d < 1e-5) continue;
        const push = (min - d) * 0.5;
        const nx = dx / d, nz = dz / d;
        if (!this.nav.isBlocked(a.x - nx * push, a.z - nz * push)) { a.x -= nx * push; a.z -= nz * push; }
        if (!this.nav.isBlocked(b.x + nx * push, b.z + nz * push)) { b.x += nx * push; b.z += nz * push; }
      }
    }
  }

  private checkVictory(): void {
    if (this.winner !== null) return;
    for (let i = 1; i < this.players.length; i++) {
      const crit = this.entitiesOf(i).filter((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'));
      if (crit.length === 0) {
        this.players[i].defeated = true;
        const alive = this.players.filter((p) => p.id > 0 && !p.defeated);
        if (alive.length === 1) {
          this.winner = alive[0].id;
          this.onVictory?.(this.winner);
        }
      }
    }
  }

  // ---------------------------------------------------------------- fog of war

  updateFog(): void {
    const n = this.fogSize;
    for (let p = 1; p < this.players.length; p++) this.visible[p].fill(0);
    for (const e of this.entities.values()) {
      if (!e.alive || e.player === 0 || e.player >= this.players.length) continue;
      const visible = this.visible[e.player];
      const range = e.info.visionRange > 0 ? e.info.visionRange : (e.kind === 'unit' ? 12 : 10);
      const r = Math.ceil(range / FOG_CELL);
      const ci = Math.floor(e.x / FOG_CELL), cj = Math.floor(e.z / FOG_CELL);
      for (let j = Math.max(0, cj - r); j <= Math.min(n - 1, cj + r); j++) {
        for (let i = Math.max(0, ci - r); i <= Math.min(n - 1, ci + r); i++) {
          const dx = (i + 0.5) * FOG_CELL - e.x;
          const dz = (j + 0.5) * FOG_CELL - e.z;
          if (dx * dx + dz * dz <= range * range) visible[j * n + i] = 1;
        }
      }
    }
    for (let p = 1; p < this.players.length; p++) {
      const visible = this.visible[p], explored = this.explored[p];
      for (let i = 0; i < visible.length; i++) if (visible[i]) explored[i] = 1;
    }
  }

  /** The fog cell index of a world position. */
  fogIndex(x: number, z: number): number {
    const i = Math.max(0, Math.min(this.fogSize - 1, Math.floor(x / FOG_CELL)));
    const j = Math.max(0, Math.min(this.fogSize - 1, Math.floor(z / FOG_CELL)));
    return j * this.fogSize + i;
  }

  isVisible(x: number, z: number, player = 1): boolean { return this.visible[player]?.[this.fogIndex(x, z)] === 1; }
  isExplored(x: number, z: number, player = 1): boolean { return this.explored[player]?.[this.fogIndex(x, z)] === 1; }

  /** For rendering: enemy entities are drawn only in visible cells; Gaia resources in explored cells. */
  entityVisible(e: Entity, player = 1): boolean {
    if (e.player === player) return true;
    if (e.player === 0) return this.isExplored(e.x, e.z, player);
    return this.isVisible(e.x, e.z, player);
  }

  // ---------------------------------------------------------------- save / load

  serialize(): WorldSnapshot {
    return {
      time: this.time,
      turn: this.turn,
      nextId: this.nextId,
      rng: this.rng.state,
      players: this.players.map((p) => ({ ...p, resources: { ...p.resources }, techs: [...p.techs] })),
      entities: [...this.entities.values()].map((e) => {
        const { info: _info, selected: _selected, ...rest } = e;
        return { ...rest, order: e.order ? { ...e.order } : null, production: e.production.map((i) => ({ ...i })), path: e.path.map((p) => ({ ...p })) };
      }),
      projectiles: this.projectiles.map((p) => ({ ...p })),
      winner: this.winner,
      explored: bytesToBase64(this.explored[1]),
      explored2: bytesToBase64(this.explored[2]),
    };
  }

  /**
   * A 32-bit hash of everything a lockstep simulation must agree on: whole turns, both players' purses,
   * entity positions/health/orders and projectiles, quantised so sub-millimetre float noise does not
   * count. Two clients exchange it; a difference means a desynchronised simulation.
   */
  stateHash(): number {
    let h = 0x811c9dc5;
    const mix = (value: number): void => {
      h ^= value | 0;
      h = Math.imul(h, 0x01000193);
    };
    mix(this.turn);
    for (let p = 1; p < this.players.length; p++) {
      const s = this.players[p];
      mix(Math.round(s.resources.food * 100));
      mix(Math.round(s.resources.wood * 100));
      mix(Math.round(s.resources.stone * 100));
      mix(Math.round(s.resources.metal * 100));
      mix(s.popUsed);
      mix(s.popCap);
      mix(s.defeated ? 1 : 0);
    }
    for (const e of this.entities.values()) {
      mix(e.id);
      mix(Math.round(e.x * 1000));
      mix(Math.round(e.z * 1000));
      mix(Math.round(e.hp * 100));
      mix(e.alive ? 1 : 0);
      mix(e.order?.type === 'move' ? Math.round(e.order.x * 1000) : (e.order && 'target' in e.order ? e.order.target : 0));
      mix(e.construction ? Math.round(e.construction.progress * 1000) : -1);
      mix(e.production.length);
      mix(e.carry ? Math.round(e.carry.amount * 100) : -1);
      mix(e.capturePoints);
    }
    for (const p of this.projectiles) {
      mix(p.id);
      mix(Math.round(p.x * 100));
      mix(Math.round(p.z * 100));
    }
    return h >>> 0;
  }

  static restore(snapshot: WorldSnapshot, options: WorldOptions): World {
    const world = new World({ ...options, scenario: { ...options.scenario, placements: [] } });
    world.time = snapshot.time;
    world.turn = snapshot.turn ?? Math.round(snapshot.time / TURN_S);
    world.nextId = snapshot.nextId;
    world.rng.state = snapshot.rng;
    world.winner = snapshot.winner;
    for (const p of snapshot.players) {
      const target = world.players[p.id];
      if (!target) continue;
      target.name = p.name ?? target.name;
      target.civ = p.id === 0 ? 'gaia' : knownCiv(p.civ ?? target.civ);
      target.color = p.color ? [...p.color] as [number, number, number] : target.color;
      target.resources = { ...p.resources };
      target.popUsed = p.popUsed;
      target.popCap = p.popCap;
      target.techs = new Set(p.techs);
      target.defeated = p.defeated;
    }
    world.entities.clear();
    for (const e of snapshot.entities) {
      world.entities.set(e.id, { ...e, info: options.templates.info(e.template), selected: false });
    }
    world.projectiles.length = 0;
    for (const p of snapshot.projectiles) world.projectiles.push({ ...p });
    const explored = base64ToBytes(snapshot.explored);
    if (explored.length === world.explored[1].length) world.explored[1].set(explored);
    if (snapshot.explored2) {
      const explored2 = base64ToBytes(snapshot.explored2);
      if (explored2.length === world.explored[2].length) world.explored[2].set(explored2);
    } else {
      world.explored[2].set(world.explored[1]);
    }
    world.rebuildNav();
    world.recomputePopulation();
    world.updateFog();
    return world;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
