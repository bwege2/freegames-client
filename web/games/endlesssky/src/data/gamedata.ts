// The game's data model, loaded from the reference release's data/*.txt with
// the original's loaders (GameData, System, Planet, Ship, Outfit, Weapon,
// Government, Fleet, StartConditions).
import { ALWAYS, loadParagraphs, parseConditionSet, type Condition, type ConditionalText, type Conditions } from './conditions.ts';
import { Stats, loadStats } from './attributes.ts';
export { Stats } from './attributes.ts';
import { token, value, type DataNode } from './node.ts';

export interface Point {
  x: number;
  y: number;
}

export interface Hardpoint {
  point: Point;
  outfit: string;
  turret: boolean;
  angle: number;
}

export interface EnginePoint {
  point: Point;
  facing: number;
  zoom: number;
  side: string;
}

export interface Submunition {
  outfit: string;
  count: number;
  offset: Point;
  facing: number;
  spawnOn: number;
}

/** Source/Weapon.cpp. All values are the original's units (pixels/frame). */
export interface Weapon {
  sprite: string;
  hardpointSprite: string;
  sound: string;
  hitEffects: { name: string; count: number }[];
  fireEffects: { name: string; count: number }[];
  dieEffects: { name: string; count: number }[];
  liveEffects: { name: string; count: number }[];
  targetEffects: { name: string; count: number }[];
  submunitions: Submunition[];
  ammo: string;
  ammoUsage: number;
  inaccuracy: number;
  inaccuracyInverted: boolean;
  inaccuracyDistribution: string;
  velocity: number;
  randomVelocity: number;
  lifetime: number;
  randomLifetime: number;
  reload: number;
  burstReload: number;
  burstCount: number;
  fadeOut: number;
  firingEnergy: number;
  firingHeat: number;
  firingFuel: number;
  firingShields: number;
  firingHull: number;
  firingForce: number;
  shieldDamage: number;
  hullDamage: number;
  hitForce: number;
  blastRadius: number;
  piercing: number;
  triggerRadius: number;
  rangeOverride: number;
  velocityOverride: number;
  homing: boolean;
  blindspot: boolean;
  leading: boolean;
  throttleControl: boolean;
  turn: number;
  acceleration: number;
  drag: number;
  splitRange: number;
  missileStrength: number;
  antiMissile: number;
  isStreamed: boolean;
  isClustered: boolean;
  isSafe: boolean;
  isPhasing: boolean;
  isParallel: boolean;
  isGravitational: boolean;
  noShipCollisions: boolean;
  noAsteroidCollisions: boolean;
  hasIcon: boolean;
}

export function emptyWeapon(): Weapon {
  return {
    sprite: '', hardpointSprite: '', sound: '',
    hitEffects: [], fireEffects: [], dieEffects: [], liveEffects: [], targetEffects: [], submunitions: [],
    ammo: '', ammoUsage: 0,
    inaccuracy: 0, inaccuracyInverted: false, inaccuracyDistribution: '',
    velocity: 0, randomVelocity: 0, lifetime: 0, randomLifetime: 0, reload: 1, burstReload: 1, burstCount: 1, fadeOut: 0,
    firingEnergy: 0, firingHeat: 0, firingFuel: 0, firingShields: 0, firingHull: 0, firingForce: 0,
    shieldDamage: 0, hullDamage: 0, hitForce: 0, blastRadius: 0, piercing: 0, triggerRadius: 0,
    rangeOverride: 0, velocityOverride: 0,
    homing: false, blindspot: false, leading: false, throttleControl: false,
    turn: 0, acceleration: 0, drag: 0, splitRange: 0, missileStrength: 0, antiMissile: 0,
    isStreamed: false, isClustered: false, isSafe: false, isPhasing: false, isParallel: false,
    isGravitational: false, noShipCollisions: false, noAsteroidCollisions: false, hasIcon: false,
  };
}

/** Source/Weapon.cpp: Load, for the attributes the port simulates. */
export function loadWeapon(node: DataNode): Weapon {
  const weapon = emptyWeapon();
  let isLoaded = false;
  for (const child of node.children) {
    const key = token(child, 0);
    const hasValue = child.tokens.length >= 2;
    if (key === 'stream') weapon.isStreamed = true;
    else if (key === 'cluster') weapon.isClustered = true;
    else if (key === 'safe') weapon.isSafe = true;
    else if (key === 'phasing') { weapon.isPhasing = true; weapon.noAsteroidCollisions = true; }
    else if (key === 'parallel') weapon.isParallel = true;
    else if (key === 'gravitational') weapon.isGravitational = true;
    else if (key === 'no ship collisions') weapon.noShipCollisions = true;
    else if (key === 'no asteroid collisions') weapon.noAsteroidCollisions = true;
    else if (key === 'homing') {
      weapon.homing = true;
      if (child.tokens.length === 2) {
        const level = value(child, 1);
        if (level >= 3) { weapon.throttleControl = true; if (level >= 4) weapon.leading = true; }
        else if (level === 1) weapon.blindspot = true;
        else if (level === 0) weapon.homing = false;
      }
      for (const grand of child.children) {
        if (token(grand, 0) === 'blindspot') weapon.blindspot = true;
        else if (token(grand, 0) === 'throttle control') weapon.throttleControl = true;
        else if (token(grand, 0) === 'leading') weapon.leading = true;
      }
    } else if (!hasValue) continue;
    else if (key === 'sprite') weapon.sprite = token(child, 1);
    else if (key === 'hardpoint sprite') weapon.hardpointSprite = token(child, 1);
    else if (key === 'icon') weapon.hasIcon = true;
    else if (key === 'sound') weapon.sound = token(child, 1);
    else if (key === 'ammo') {
      weapon.ammo = token(child, 1);
      weapon.ammoUsage = child.tokens.length >= 3 ? Math.max(0, value(child, 2)) : 1;
    } else if (key === 'fire effect') weapon.fireEffects.push({ name: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1 });
    else if (key === 'live effect') weapon.liveEffects.push({ name: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1 });
    else if (key === 'hit effect') weapon.hitEffects.push({ name: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1 });
    else if (key === 'target effect') weapon.targetEffects.push({ name: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1 });
    else if (key === 'die effect') weapon.dieEffects.push({ name: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1 });
    else if (key === 'submunition') {
      const sub: Submunition = { outfit: token(child, 1), count: child.tokens.length >= 3 ? value(child, 2) : 1, offset: { x: 0, y: 0 }, facing: 0, spawnOn: 1 };
      for (const grand of child.children) {
        const gk = token(grand, 0);
        if (gk === 'facing') sub.facing = value(grand, 1);
        else if (gk === 'offset') sub.offset = { x: value(grand, 1), y: value(grand, 2) };
        else if (gk === 'spawn on') {
          sub.spawnOn = 0;
          for (const kind of grand.tokens.slice(1)) {
            if (kind === 'natural') sub.spawnOn |= 1;
            else if (kind === 'collision') sub.spawnOn |= 2;
            else if (kind === 'explosion') sub.spawnOn |= 4;
            else if (kind === 'anti-missile') sub.spawnOn |= 8;
          }
        }
      }
      weapon.submunitions.push(sub);
    } else if (key === 'inaccuracy') {
      weapon.inaccuracy = value(child, 1);
      for (const grand of child.children) for (const word of grand.tokens) {
        if (word === 'inverted') weapon.inaccuracyInverted = true;
        else if (word === 'triangular' || word === 'uniform' || word === 'narrow' || word === 'medium' || word === 'wide') weapon.inaccuracyDistribution = word;
      }
    } else {
      const v = value(child, 1);
      switch (key) {
        case 'lifetime': weapon.lifetime = Math.max(0, v); break;
        case 'random lifetime': weapon.randomLifetime = Math.max(0, v); break;
        case 'fade out': weapon.fadeOut = Math.max(0, v); break;
        case 'reload': weapon.reload = Math.max(1, v); break;
        case 'burst reload': weapon.burstReload = Math.max(1, v); break;
        case 'burst count': weapon.burstCount = Math.max(1, v); break;
        case 'missile strength': weapon.missileStrength = Math.max(0, v); break;
        case 'anti-missile': weapon.antiMissile = Math.max(0, v); break;
        case 'velocity': weapon.velocity = v; break;
        case 'random velocity': weapon.randomVelocity = v; break;
        case 'acceleration': weapon.acceleration = v; break;
        case 'drag': weapon.drag = v; break;
        case 'turn': weapon.turn = v; break;
        case 'firing energy': weapon.firingEnergy = v; break;
        case 'firing heat': weapon.firingHeat = v; break;
        case 'firing fuel': weapon.firingFuel = v; break;
        case 'firing shields': weapon.firingShields = v; break;
        case 'firing hull': weapon.firingHull = v; break;
        case 'firing force': weapon.firingForce = v; break;
        case 'shield damage': weapon.shieldDamage = v; break;
        case 'hull damage': weapon.hullDamage = v; break;
        case 'hit force': weapon.hitForce = v; break;
        case 'blast radius': weapon.blastRadius = Math.max(0, v); break;
        case 'piercing': weapon.piercing = Math.max(0, v); break;
        case 'trigger radius': weapon.triggerRadius = Math.max(0, v); break;
        case 'range override': weapon.rangeOverride = Math.max(0, v); break;
        case 'velocity override': weapon.velocityOverride = Math.max(0, v); break;
        case 'split range': weapon.splitRange = Math.max(0, v); break;
        default: break;
      }
    }
    isLoaded = true;
  }
  void isLoaded;
  return weapon;
}

export interface Outfit {
  name: string;
  category: string;
  series: string;
  index: number;
  cost: number;
  mass: number;
  stats: Stats;
  thumbnail: string;
  description: ConditionalText[];
  weapon: Weapon | null;
  licenses: string[];
}

export interface ShipModel {
  name: string;
  displayName: string;
  plural: string;
  noun: string;
  category: string;
  sprite: string;
  thumbnail: string;
  base: Stats;
  defaultOutfits: Map<string, number>;
  guns: Hardpoint[];
  turrets: Hardpoint[];
  engines: EnginePoint[];
  explosion: Weapon | null;
  description: ConditionalText[];
  neverDisabled: boolean;
  variantOf: string;
}

export interface Planet {
  name: string;
  displayName: string;
  attributes: Set<string>;
  government: string;
  description: ConditionalText[];
  spaceport: ConditionalText[];
  landscapes: { name: string; weight: number }[];
  shipyards: string[];
  outfitters: string[];
  requiredReputation: number;
  security: number;
  tribute: number;
  wormhole: string;
  system: string;
  hasSpaceport: boolean;
}

export interface SystemObject {
  planet: string;
  sprite: string;
  distance: number;
  period: number;
  offset: number;
  parent: number;
  isStar: boolean;
  index: number;
}

export interface TradePrice {
  base: number;
  supply: number;
  exports: number;
  price: number;
}

export interface StarSystem {
  name: string;
  displayName: string;
  position: Point;
  government: string;
  attributes: Set<string>;
  links: string[];
  trade: Map<string, TradePrice>;
  objects: SystemObject[];
  fleets: { name: string; weight: number }[];
  jumpRange: number;
  hidden: boolean;
  shrouded: boolean;
  inaccessible: boolean;
  minables: unknown[];
}

export interface Government {
  name: string;
  displayName: string;
  swizzle: number;
  color: string;
  playerReputation: number;
  attitudes: Map<string, number>;
  friendlyHail: string;
  hostileHail: string;
}

export interface FleetVariant {
  weight: number;
  ships: { model: string; count: number }[];
}

export interface Fleet {
  name: string;
  government: string;
  names: string;
  variants: FleetVariant[];
  cargo: number;
}

export interface ShipyardSale {
  name: string;
  ships: string[];
}

export interface OutfitterSale {
  name: string;
  outfits: string[];
}

export interface StartScenario {
  name: string;
  displayName: string;
  description: ConditionalText[];
  system: string;
  planet: string;
  date: { day: number; month: number; year: number };
  credits: number;
  score: number;
  debt: number;
  mortgage: { principal: number; interest: number; term: number } | null;
  conditions: Map<string, number>;
  ships: { model: string; name: string }[];
}

export interface Effect {
  name: string;
  sprite: string;
  frameRate: number;
  lifetime: number;
  randomAngle: number;
  randomVelocity: number;
  randomSpin: number;
  velocityScale: number;
  noRepeat: boolean;
  rewind: boolean;
  sound: string;
}

export interface Commodity {
  name: string;
  low: number;
  high: number;
  items: string[];
}

/** Read an `attributes` block (ship / outfit) into a model. */
function shipStats(node: DataNode): Stats {
  return loadStats(node);
}

function parseOutfits(node: DataNode): Map<string, number> {
  const result = new Map<string, number>();
  for (const child of node.children) {
    const name = token(child, 0);
    const count = child.tokens.length >= 2 ? value(child, 1) : 1;
    if (name && count > 0) result.set(name, (result.get(name) ?? 0) + count);
  }
  return result;
}

function parseSaleList(node: DataNode): string[] {
  return node.children.map((c) => token(c, 0)).filter(Boolean);
}

export class GameData {
  readonly ships = new Map<string, ShipModel>();
  readonly outfits = new Map<string, Outfit>();
  readonly systems = new Map<string, StarSystem>();
  readonly planets = new Map<string, Planet>();
  readonly governments = new Map<string, Government>();
  readonly fleets = new Map<string, Fleet>();
  readonly shipyards = new Map<string, ShipyardSale>();
  readonly outfitters = new Map<string, OutfitterSale>();
  readonly starts = new Map<string, StartScenario>();
  readonly effects = new Map<string, Effect>();
  readonly commodities: Commodity[] = [];
  readonly specialCommodities: Commodity[] = [];
  readonly warnings: string[] = [];

  /** Load the whole data tree. Files are loaded in the order the original's
   *  UniverseObjects::Load sees them (sorted by path). */
  load(files: readonly { path: string; text: string }[], parseData: (text: string, file: string) => DataNode[]): void {
    const all: DataNode[] = [];
    for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
      all.push(...parseData(file.text, file.path));
    }
    // First the things other definitions refer to by name, then the ships
    // (variants), then the references.
    for (const node of all) this.loadNode(node);
    this.finish();
  }

  private loadNode(node: DataNode): void {
    const key = token(node, 0);
    if (key === 'trade') this.loadTrade(node);
    else if (key === 'commodity') this.loadCommodity(node);
    else if (key === 'system') this.loadSystem(node);
    else if (key === 'planet') this.loadPlanet(node);
    else if (key === 'outfit') this.loadOutfit(node);
    else if (key === 'ship') this.loadShip(node);
    else if (key === 'government') this.loadGovernment(node);
    else if (key === 'fleet') this.loadFleet(node);
    else if (key === 'shipyard') this.loadShipyard(node);
    else if (key === 'outfitter') this.loadOutfitter(node);
    else if (key === 'start') this.loadStart(node);
    else if (key === 'effect') this.loadEffect(node);
    else if (key === 'add' || key === 'remove') {
      // Data patches are applied by events in the original; base data files do
      // not use them (events are not simulated by this port).
    } else if (key === 'event' || key === 'mission' || key === 'person' || key === 'phrase' || key === 'tip'
      || key === 'news' || key === 'conversation' || key === 'effect' || key === 'star' || key === 'minable'
      || key === 'hazard' || key === 'galaxy' || key === 'color' || key === 'swizzle' || key === 'interface'
      || key === 'help' || key === 'message' || key === 'confusion' || key === 'formation' || key === 'category'
      || key === 'substitutions' || key === 'rating' || key === 'wormhole' || key === 'asteroid' || key === 'location') {
      // Not part of this round's simulation; kept in data for later (see README).
    } else if (key) {
      this.warnings.push(`unhandled top-level node "${key}" in ${node.file}:${node.line}`);
    }
  }

  private loadTrade(node: DataNode): void {
    for (const child of node.children) {
      if (token(child, 0) === 'commodity' && child.tokens.length >= 2) {
        const name = token(child, 1);
        const special = child.tokens.length < 4;
        const list = special ? this.specialCommodities : this.commodities;
        let commodity = list.find((c) => c.name === name);
        if (!commodity) {
          commodity = { name, low: 0, high: 0, items: [] };
          list.push(commodity);
        }
        if (!special) {
          commodity.low = value(child, 2);
          commodity.high = value(child, 3);
        }
        commodity.items = child.children.map((g) => token(g, 0));
      }
    }
  }

  private loadCommodity(node: DataNode): void {
    // A standalone "commodity" node is a display item in the original; the
    // price range lives in the `trade` block.
    if (node.tokens.length >= 2) {
      const name = token(node, 1);
      if (!this.specialCommodities.some((c) => c.name === name) && !this.commodities.some((c) => c.name === name))
        this.specialCommodities.push({ name, low: 0, high: 0, items: [] });
    }
  }

  private loadSystem(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    let system = this.systems.get(name);
    if (!system) {
      system = {
        name, displayName: name, position: { x: 0, y: 0 }, government: '', attributes: new Set(), links: [],
        trade: new Map(), objects: [], fleets: [], jumpRange: 0, hidden: false, shrouded: false,
        inaccessible: false, minables: [],
      };
      this.systems.set(name, system);
    }
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'pos' && child.tokens.length >= 3) system.position = { x: value(child, 1), y: value(child, 2) };
      else if (key === 'display name' && hasValue) system.displayName = token(child, 1);
      else if (key === 'government' && hasValue) system.government = token(child, 1);
      else if (key === 'link' && hasValue) system.links.push(token(child, 1));
      else if (key === 'attributes') for (const a of child.tokens.slice(1)) system.attributes.add(a);
      else if (key === 'trade' && child.tokens.length >= 3) {
        const commodity = token(child, 1);
        system.trade.set(commodity, { base: value(child, 2), supply: 0, exports: 0, price: value(child, 2) });
      } else if (key === 'jump range' && hasValue) system.jumpRange = Math.max(0, value(child, 1));
      else if (key === 'hidden') system.hidden = true;
      else if (key === 'shrouded') system.shrouded = true;
      else if (key === 'inaccessible') system.inaccessible = true;
      else if (key === 'fleet' && child.tokens.length >= 3) system.fleets.push({ name: token(child, 1), weight: value(child, 2) });
      else if (key === 'object') this.loadObject(child, system.objects, -1);
    }
  }

  private loadObject(node: DataNode, objects: SystemObject[], parent: number): void {
    const isAdd = token(node, 0) === 'add';
    const offset = isAdd ? 1 : 0;
    const planet = node.tokens.length >= 2 + offset ? token(node, 1 + offset) : '';
    const object: SystemObject = {
      planet, sprite: '', distance: 0, period: 0, offset: 0, parent,
      isStar: false, index: objects.length,
    };
    objects.push(object);
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'object') this.loadObject(child, objects, object.index);
      else if (key === 'sprite' && hasValue) {
        object.sprite = token(child, 1);
        object.isStar = token(child, 1).startsWith('star/');
      } else if (key === 'distance' && hasValue) object.distance = value(child, 1);
      else if (key === 'period' && hasValue) object.period = value(child, 1);
      else if (key === 'offset' && hasValue) object.offset = value(child, 1);
    }
  }

  private loadPlanet(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    let planet = this.planets.get(name);
    if (!planet) {
      planet = {
        name, displayName: name, attributes: new Set(), government: '', description: [], spaceport: [],
        landscapes: [], shipyards: [], outfitters: [], requiredReputation: 0, security: 0, tribute: 0,
        wormhole: '', system: '', hasSpaceport: false,
      };
      this.planets.set(name, planet);
    }
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'display name' && hasValue) planet.displayName = token(child, 1);
      else if (key === 'attributes') for (const a of child.tokens.slice(1)) planet.attributes.add(a);
      else if (key === 'description') planet.description.push(loadParagraphs(child));
      else if (key === 'spaceport' || key === 'port') {
        planet.hasSpaceport = true;
        planet.spaceport.push(loadParagraphs(child));
      } else if (key === 'landscape') {
        for (const sprite of child.tokens.slice(1)) planet.landscapes.push({ name: sprite, weight: 1 });
        for (const grand of child.children) planet.landscapes.push({ name: token(grand, 0), weight: grand.tokens.length >= 2 ? value(grand, 1) : 1 });
      } else if (key === 'government' && hasValue) planet.government = token(child, 1);
      else if (key === 'shipyard' && hasValue) planet.shipyards.push(token(child, 1));
      else if (key === 'outfitter' && hasValue) planet.outfitters.push(token(child, 1));
      else if (key === 'required reputation' && hasValue) planet.requiredReputation = value(child, 1);
      else if (key === 'security' && hasValue) planet.security = value(child, 1);
      else if (key === 'tribute' && hasValue) planet.tribute = value(child, 1);
      else if (key === 'wormhole' && hasValue) planet.wormhole = token(child, 1);
    }
  }

  private loadOutfit(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    let outfit = this.outfits.get(name);
    if (!outfit) {
      outfit = {
        name, category: '', series: '', index: 0, cost: 0, mass: 0, stats: new Stats(),
        thumbnail: '', description: [], weapon: null, licenses: [],
      };
      this.outfits.set(name, outfit);
    }
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'category' && hasValue) outfit.category = token(child, 1);
      else if (key === 'series' && hasValue) outfit.series = token(child, 1);
      else if (key === 'index' && hasValue) outfit.index = value(child, 1);
      else if (key === 'cost' && hasValue) outfit.cost = value(child, 1);
      else if (key === 'mass' && hasValue) outfit.mass = value(child, 1);
      else if (key === 'thumbnail' && hasValue) outfit.thumbnail = token(child, 1);
      else if (key === 'description') outfit.description.push(loadParagraphs(child));
      else if (key === 'weapon') outfit.weapon = loadWeapon(child);
      else if (key === 'licenses') outfit.licenses.push(...child.tokens.slice(1));
      else if (hasValue && isNumeric(token(child, 1)) && !NON_ATTRIBUTE_OUTFIT_KEYS.has(key)) outfit.stats.add(key, value(child, 1));
    }
  }

  private loadShip(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    const variantOf = node.tokens.length >= 3 ? name : '';
    const trueName = node.tokens.length >= 3 ? token(node, 2) : name;
    const existing = this.ships.get(trueName);
    const baseModel = variantOf ? this.ships.get(variantOf) : undefined;
    // A variant starts from its base model; a plain ship starts empty.
    const ship: ShipModel = existing ?? {
      name: trueName,
      displayName: trueName,
      plural: '',
      noun: '',
      category: '',
      sprite: '',
      thumbnail: '',
      base: baseModel ? baseModel.base.clone() : new Stats(),
      defaultOutfits: new Map(baseModel?.defaultOutfits ?? []),
      guns: baseModel ? baseModel.guns.map((h) => ({ ...h, point: { ...h.point } })) : [],
      turrets: baseModel ? baseModel.turrets.map((h) => ({ ...h, point: { ...h.point } })) : [],
      engines: baseModel ? baseModel.engines.map((e) => ({ ...e, point: { ...e.point } })) : [],
      explosion: baseModel?.explosion ?? null,
      description: baseModel ? [...baseModel.description] : [],
      neverDisabled: baseModel?.neverDisabled ?? false,
      variantOf: variantOf ?? '',
    };
    ship.variantOf = variantOf ?? '';
    let hasOutfits = false;
    let hasArmament = false;
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'sprite' && hasValue) ship.sprite = token(child, 1);
      else if (key === 'thumbnail' && hasValue) ship.thumbnail = token(child, 1);
      else if (key === 'name' && hasValue) ship.displayName = token(child, 1);
      else if (key === 'display name' && hasValue) ship.displayName = token(child, 1);
      else if (key === 'plural' && hasValue) ship.plural = token(child, 1);
      else if (key === 'noun' && hasValue) ship.noun = token(child, 1);
      else if (key === 'never disabled') ship.neverDisabled = true;
      else if (key === 'attributes') {
        // A variant's attributes override/add to the base model's.
        if (variantOf) for (const [k, v] of loadStats(child).precise) ship.base.precise.set(k, v);
        else ship.base = shipStats(child);
        if (variantOf) {
          const over = loadStats(child);
          for (const [k, v] of over.precise) ship.base.precise.set(k, v);
          if (over.cost) ship.base.cost = over.cost;
          if (over.mass) ship.base.mass = over.mass;
        }
      } else if (key === 'add' && token(child, 1) === 'attributes') {
        const extra = loadStats(child);
        ship.base.addStats(extra);
      } else if (key === 'outfits') {
        if (!hasOutfits) {
          ship.defaultOutfits.clear();
          hasOutfits = true;
        }
        for (const [outfit, count] of parseOutfits(child)) ship.defaultOutfits.set(outfit, (ship.defaultOutfits.get(outfit) ?? 0) + count);
      } else if (key === 'gun' || key === 'turret') {
        if (!hasArmament) {
          ship.guns = [];
          ship.turrets = [];
          hasArmament = true;
        }
        const hardpoint: Hardpoint = {
          point: { x: child.tokens.length >= 3 ? value(child, 1) : 0, y: child.tokens.length >= 3 ? value(child, 2) : 0 },
          outfit: child.tokens.length >= 4 ? token(child, 3) : (hasValue ? token(child, 1) : ''),
          turret: key === 'turret',
          angle: 0,
        };
        for (const grand of child.children) {
          if (token(grand, 0) === 'angle' && grand.tokens.length >= 2) hardpoint.angle = value(grand, 1);
        }
        (key === 'turret' ? ship.turrets : ship.guns).push(hardpoint);
      } else if (key === 'engine' && child.tokens.length >= 3) {
        const engine: EnginePoint = { point: { x: value(child, 1), y: value(child, 2) }, facing: 0, zoom: 1, side: '' };
        for (const grand of child.children) {
          if (token(grand, 0) === 'angle' && grand.tokens.length >= 2) engine.facing = value(grand, 1);
          else if (token(grand, 0) === 'zoom' && grand.tokens.length >= 2) engine.zoom = value(grand, 1);
        }
        ship.engines.push(engine);
      } else if (key === 'weapon') ship.explosion = loadWeapon(child);
      else if (key === 'description') ship.description.push(loadParagraphs(child));
    }
    if (!ship.plural) ship.plural = ship.displayName + 's';
    if (!existing) this.ships.set(trueName, ship);
  }

  private loadGovernment(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    let government = this.governments.get(name);
    if (!government) {
      government = {
        name, displayName: name, swizzle: 0, color: '', playerReputation: 0, attitudes: new Map(),
        friendlyHail: '', hostileHail: '',
      };
      this.governments.set(name, government);
    }
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'display name' && hasValue) government.displayName = token(child, 1);
      else if (key === 'swizzle' && hasValue) government.swizzle = value(child, 1);
      else if (key === 'color' && hasValue) government.color = token(child, 1);
      else if (key === 'player reputation' && hasValue) government.playerReputation = value(child, 1);
      else if (key === 'friendly hail' && hasValue) government.friendlyHail = token(child, 1);
      else if (key === 'hostile hail' && hasValue) government.hostileHail = token(child, 1);
      else if (key === 'attitude toward') {
        for (const grand of child.children) if (grand.tokens.length >= 2) government.attitudes.set(token(grand, 0), value(grand, 1));
      }
    }
  }

  private loadFleet(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const name = token(node, 1);
    let fleet = this.fleets.get(name);
    if (!fleet) {
      fleet = { name, government: '', names: '', variants: [], cargo: 0 };
      this.fleets.set(name, fleet);
    }
    for (const child of node.children) {
      const key = token(child, 0);
      if (key === 'government' && child.tokens.length >= 2) fleet.government = token(child, 1);
      else if (key === 'names' && child.tokens.length >= 2) fleet.names = token(child, 1);
      else if (key === 'cargo' && child.tokens.length >= 2) fleet.cargo = value(child, 1);
      else if (key === 'variant') {
        const weight = child.tokens.length >= 2 ? value(child, 1) : 1;
        const variant: FleetVariant = { weight, ships: [] };
        for (const grand of child.children) {
          const model = token(grand, 0);
          if (model) variant.ships.push({ model, count: grand.tokens.length >= 2 ? value(grand, 1) : 1 });
        }
        fleet.variants.push(variant);
      }
    }
  }

  private loadShipyard(node: DataNode): void {
    if (node.tokens.length < 2) return;
    this.shipyards.set(token(node, 1), { name: token(node, 1), ships: parseSaleList(node) });
  }

  private loadOutfitter(node: DataNode): void {
    if (node.tokens.length < 2) return;
    this.outfitters.set(token(node, 1), { name: token(node, 1), outfits: parseSaleList(node) });
  }

  private loadStart(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const start: StartScenario = {
      name: token(node, 1), displayName: token(node, 1), description: [], system: '', planet: '',
      date: { day: 1, month: 1, year: 3013 }, credits: 0, score: 0, debt: 0, mortgage: null,
      conditions: new Map(), ships: [],
    };
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'name' && hasValue) start.displayName = token(child, 1);
      else if (key === 'description') start.description.push(loadParagraphs(child));
      else if (key === 'system' && hasValue) start.system = token(child, 1);
      else if (key === 'planet' && hasValue) start.planet = token(child, 1);
      else if (key === 'date' && child.tokens.length >= 4) start.date = { day: value(child, 1), month: value(child, 2), year: value(child, 3) };
      else if (key === 'credits' && hasValue) start.credits = value(child, 1);
      else if (key === 'score' && hasValue) start.score = value(child, 1);
      else if (key === 'debt' && hasValue) start.debt = value(child, 1);
      else if (key === 'account') {
        for (const grand of child.children) {
          const gk = token(grand, 0);
          if (gk === 'credits' && grand.tokens.length >= 2) start.credits = value(grand, 1);
          else if (gk === 'score' && grand.tokens.length >= 2) start.score = value(grand, 1);
          else if (gk === 'mortgage') {
            const mortgage = { principal: 0, interest: 0, term: 0 };
            for (const term of grand.children) {
              if (token(term, 0) === 'principal') mortgage.principal = value(term, 1);
              else if (token(term, 0) === 'interest') mortgage.interest = value(term, 1);
              else if (token(term, 0) === 'term') mortgage.term = value(term, 1);
            }
            start.mortgage = mortgage;
          }
        }
      } else if (key === 'set' && hasValue) start.conditions.set(token(child, 1), 1);
      else if (key === 'ship' && hasValue) start.ships.push({ model: token(child, 1), name: child.tokens.length >= 3 ? token(child, 2) : '' });
    }
    this.starts.set(start.name, start);
  }

  private loadEffect(node: DataNode): void {
    if (node.tokens.length < 2) return;
    const effect: Effect = {
      name: token(node, 1), sprite: '', frameRate: 1, lifetime: 1, randomAngle: 0,
      randomVelocity: 0, randomSpin: 0, velocityScale: 1, noRepeat: false, rewind: false, sound: '',
    };
    for (const child of node.children) {
      const key = token(child, 0);
      const hasValue = child.tokens.length >= 2;
      if (key === 'sprite' && hasValue) {
        effect.sprite = token(child, 1);
        for (const grand of child.children) {
          const gk = token(grand, 0);
          if (gk === 'frame rate' && grand.tokens.length >= 2) effect.frameRate = value(grand, 1) / 60;
          else if (gk === 'frame time' && grand.tokens.length >= 2) effect.frameRate = 1 / value(grand, 1);
          else if (gk === 'no repeat') effect.noRepeat = true;
          else if (gk === 'rewind') effect.rewind = true;
        }
      } else if (key === 'lifetime' && hasValue) effect.lifetime = value(child, 1);
      else if (key === 'random angle' && hasValue) effect.randomAngle = value(child, 1);
      else if (key === 'random velocity' && hasValue) effect.randomVelocity = value(child, 1);
      else if (key === 'random spin' && hasValue) effect.randomSpin = value(child, 1);
      else if (key === 'velocity scale' && hasValue) effect.velocityScale = value(child, 1);
      else if (key === 'sound' && hasValue) effect.sound = token(child, 1);
    }
    this.effects.set(effect.name, effect);
  }

  private finish(): void {
    // Resolve links (the original links only systems that exist and are valid).
    for (const system of this.systems.values()) {
      system.links = system.links.filter((name) => {
        const other = this.systems.get(name);
        if (!other) { this.warnings.push(`system ${system.name} links missing system ${name}`); return false; }
        return true;
      });
      // Add the reverse direction, as System::Link does.
      for (const name of system.links) {
        const other = this.systems.get(name)!;
        if (!other.links.includes(system.name)) other.links.push(system.name);
      }
      for (const object of system.objects) {
        if (!object.planet) continue;
        const planet = this.planets.get(object.planet);
        if (!planet) { this.warnings.push(`system ${system.name} has missing planet ${object.planet}`); continue; }
        planet.system = system.name;
      }
    }
    // Default display names and plural names.
    for (const ship of this.ships.values()) {
      if (!ship.displayName) ship.displayName = ship.name;
      if (!ship.plural) ship.plural = ship.displayName + 's';
    }
    // Submunitions are referenced by outfit name; keep them for the simulation.
    for (const outfit of this.outfits.values()) {
      if (outfit.weapon) {
        for (const sub of outfit.weapon.submunitions) {
          const other = this.outfits.get(sub.outfit);
          if (other?.weapon) (sub as Submunition & { weapon?: Weapon }).weapon = other.weapon;
        }
      }
    }
  }

  /** A ship's final stats with its installed outfits (Ship::FinishLoading). */
  shipAttributes(model: ShipModel, outfits: ReadonlyMap<string, number> = model.defaultOutfits): Stats {
    const stats = model.base.clone();
    for (const [name, count] of outfits) {
      const outfit = this.outfits.get(name);
      if (outfit) {
        stats.addStats(outfit.stats, count);
        stats.mass += outfit.mass * count;
        stats.cost += outfit.cost * count;
      }
    }
    return stats;
  }

  /** Outfit cost of a model with its default outfits (Ship::Cost). */
  shipCost(model: ShipModel, outfits: ReadonlyMap<string, number> = model.defaultOutfits): number {
    let cost = model.base.cost;
    for (const [name, count] of outfits) cost += (this.outfits.get(name)?.cost ?? 0) * count;
    return cost;
  }

  /** Weapon of an outfit, following the submunition pointers. */
  weaponOf(outfitName: string): Weapon | null {
    return this.outfits.get(outfitName)?.weapon ?? null;
  }

  /** System::Trade: base - 100 * erf(supply / 20000), truncated toward zero. */
  tradePrice(system: StarSystem, commodity: string): number {
    const price = system.trade.get(commodity);
    return price ? price.price : 0;
  }

  setSupply(system: StarSystem, commodity: string, tons: number): void {
    const price = system.trade.get(commodity);
    if (!price) return;
    price.supply = tons;
    price.price = price.base + Math.trunc(-100 * erf(tons / 20000));
  }

  /** System::StepEconomy: 89% kept, daily production with sigma 2000. */
  stepEconomy(system: StarSystem, normal: () => number): void {
    for (const price of system.trade.values()) {
      price.exports = 0.1 * price.supply;
      price.supply *= 0.89;
      price.supply += normal() * 2000;
      price.price = price.base + Math.trunc(-100 * erf(price.supply / 20000));
    }
  }

  /** A fleet variant chosen by weight; null if the fleet has no variants. */
  fleetVariant(fleet: Fleet, random: () => number): FleetVariant | null {
    const total = fleet.variants.reduce((sum, v) => sum + v.weight, 0);
    if (total <= 0) return null;
    let roll = random() * total;
    for (const variant of fleet.variants) {
      roll -= variant.weight;
      if (roll < 0) return variant;
    }
    return fleet.variants[fleet.variants.length - 1] ?? null;
  }

  /** The conditions a start scenario sets, plus the ones this port derives. */
  startConditions(start: StartScenario): Map<string, number> {
    const c = new Map(start.conditions);
    c.set('days since start', 0);
    return c;
  }
}

const NON_ATTRIBUTE_OUTFIT_KEYS = new Set([
  'category', 'series', 'index', 'cost', 'mass', 'thumbnail', 'description', 'weapon', 'licenses',
  'flare sprite', 'reverse flare sprite', 'steering flare sprite', 'flare sound', 'reverse flare sound',
  'steering flare sound', 'afterburner effect', 'jump effect', 'hyperdrive sound', 'hyperdrive in sound',
  'hyperdrive out sound', 'jump sound', 'jump in sound', 'jump out sound', 'cargo scan sound', 'outfit scan sound',
  'display name', 'plural',
]);

function isNumeric(text: string): boolean {
  return text.length > 0 && Number.isFinite(Number(text));
}

/** Math.erf, as the price formula uses (the original is the C library's erf). */
export function erf(x: number): number {
  // Abramowitz & Stegun 7.1.26, |error| < 1.5e-7; prices are integers, so it
  // matches the libm result for every supply value in the game's data.
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return sign * y;
}

export type { Condition, ConditionalText, Conditions };
export { ALWAYS, parseConditionSet };
