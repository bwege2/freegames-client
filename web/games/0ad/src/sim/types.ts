// The simulation's basic types. The world runs at 0 A.D.'s 200 ms turn length
// (DEFAULT_TURN_LENGTH in source/simulation2/system/TurnManager.h); rendering interpolates.
import type { TemplateInfo, Resource } from '../data/template-info.ts';
import type { Scenario } from '../data/map.ts';
import type { Terrain } from '../data/pmp.ts';

export const TURN_MS = 200;
export const TURN_S = TURN_MS / 1000;

export type Stance = 'aggressive' | 'defensive' | 'standground' | 'passive';
export type EntityKind = 'unit' | 'building' | 'resource' | 'scenery';
export type UnitRole = 'soldier' | 'civilian' | 'fauna';

export interface Vec2 { x: number; z: number }

export interface MoveOrder { type: 'move'; x: number; z: number }
export interface GatherOrder { type: 'gather'; target: number; resource: Resource; specific: string }
export interface BuildOrder { type: 'build'; target: number }
export interface AttackOrder { type: 'attack'; target: number }
export type Order = MoveOrder | GatherOrder | BuildOrder | AttackOrder;

export interface ProductionItem {
  template: string;
  remaining: number;
  total: number;
}

export interface Projectile {
  id: number;
  owner: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  gravity: number;
  target: number;
  damage: Record<string, number>;
  bonuses: { classes: string[]; civ?: string; multiplier: number }[];
  ttl: number;
}

export interface Entity {
  id: number;
  template: string;
  info: TemplateInfo;
  player: number;
  kind: EntityKind;
  role: UnitRole | null;
  x: number;
  z: number;
  yaw: number;
  hp: number;
  maxHp: number;
  radius: number;
  height: number;
  alive: boolean;
  selected: boolean;
  /** foundations: 0..1; null when complete */
  construction: { progress: number; work: number } | null;
  production: ProductionItem[];
  queueMax: number;
  rally: Vec2 | null;
  order: Order | null;
  path: Vec2[];
  pathIndex: number;
  speed: number;
  carry: { resource: Resource; amount: number; specific: string } | null;
  attackCooldown: number;
  pendingAttack: { target: number; timer: number } | null;
  attackTarget: number | null;
  stance: Stance;
  amount: number;
  /** remaining capture points of a building (0 A.D. Capturable) */
  capturePoints: number;
  supplyType: string;
  maxGatherers: number;
  diminishingReturns: number;
  /** the number of gatherers currently on this supply, maintained by the world */
  gatherers: number;
  /** population cost for units, bonus for buildings */
  population: number;
  /** 0 A.D.'s <Loot> for the killer, not used by the slice except stats */
  xp: number;
  /** the last time (world seconds) this entity attacked or was attacked */
  lastCombat: number;
  /** cached template actor variant seed */
  seed: number;
  /** the map's original placement uid, for tests/saves */
  uid: number;
}

export interface PlayerState {
  id: number;
  name: string;
  civ: string;
  color: [number, number, number];
  resources: Record<Resource, number>;
  popUsed: number;
  popCap: number;
  /** techs the player has; the slice starts with phase_village */
  techs: Set<string>;
  defeated: boolean;
}

export interface PlayerOrderEvent {
  type: 'died' | 'trained' | 'constructed' | 'attacked' | 'depleted';
  entity: number;
  player: number;
}

export interface WorldOptions {
  scenario: Scenario;
  terrain: Terrain;
  templates: {
    info(template: string): TemplateInfo;
    has(template: string): boolean;
  };
  players?: { name: string; civ: string; color: [number, number, number] }[];
  /** each player's food/wood/stone/metal at the start (default 300, the slice's setting) */
  startingResources?: number;
  seed?: number;
  /** called when a player loses all ConquestCritical buildings */
  onVictory?: (winner: number) => void;
}

export type SerializedEntity = Omit<Entity, 'info' | 'selected'>;

export interface WorldSnapshot {
  time: number;
  /** whole turns; older slice saves have none (time / TURN_S then) */
  turn?: number;
  nextId: number;
  rng: number;
  players: (Omit<PlayerState, 'techs'> & { techs: string[] })[];
  entities: SerializedEntity[];
  projectiles: Projectile[];
  winner: number | null;
  /** player 1's explored cells, base64 */
  explored: string;
  /** player 2's explored cells (older saves share player 1's) */
  explored2?: string;
}
