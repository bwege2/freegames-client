// Typed values read from a resolved 0 A.D. template (data/templates.ts). Every name, number and
// formula here comes from the pinned templates; the comments point at the component that owns it.
// The port reads these values at runtime, so a changed template changes the game.
import { child, childText, path, pathText, tokens, type XmlElement } from './xml.ts';

export type Resource = 'food' | 'wood' | 'stone' | 'metal';
export const RESOURCES: Resource[] = ['food', 'wood', 'stone', 'metal'];

export interface AttackEffect {
  /** honour the original's Damage/Hack, Damage/Pierce, Damage/Crush */
  damage: Record<string, number>;
  bonuses: { classes: string[]; civ?: string; multiplier: number }[];
  maxRange: number;
  minRange: number;
  prepareTime: number;
  repeatTime: number;
  /** 0 A.D. calls the moment the projectile leaves the weapon the effect delay */
  effectDelay: number;
  restrictedClasses: string[];
  preferredClasses: string[];
  /** Attack/<type>/Capture: capture points per attack (0 A.D.'s Capturable system) */
  captureValue: number;
  projectile: { speed: number; spread: number; gravity: number; launchPoint: number } | null;
}

export interface TemplateInfo {
  name: string;
  civ: string;
  genericName: string;
  specificName: string;
  tooltip: string;
  history: string;
  classes: string[];
  visibleClasses: string[];
  phenotype: string[];
  rank: string;
  icon: string | null;
  requirements: { techs: string[] };
  health: number;
  regenRate: number;
  idleRegenRate: number;
  armour: Record<string, number>;
  attack: {
    melee?: AttackEffect;
    ranged?: AttackEffect;
    slaughter?: AttackEffect;
    capture?: AttackEffect;
  };
  cost: { population: number; buildTime: number; resources: Record<Resource, number> };
  walkSpeed: number;
  runMultiplier: number;
  turnRate: number;
  acceleration: number;
  visionRange: number;
  footprint: { shape: 'circle' | 'square'; radius: number; width: number; depth: number; height: number };
  obstruction: { staticWidth: number; staticDepth: number; unit: boolean; blockMovement: boolean; blockPathfinding: boolean; blockFoundation: boolean };
  populationBonus: number;
  /** <Capturable><CapturePoints> for buildings, 0 for units */
  capturePoints: number;
  /** <Resistance><Entity><Capture>, 0 A.D. reduces capture by 10% per point */
  captureResistance: number;
  trainer: { entities: string[]; batchTimeModifier: number } | null;
  builder: { entities: string[]; rate: number } | null;
  gatherer: {
    maxDistance: number;
    baseSpeed: number;
    rates: Record<string, number>;
    capacities: Record<Resource, number>;
  } | null;
  supply: {
    max: number;
    type: string;
    maxGatherers: number;
    diminishingReturns: number;
    killBeforeGather: boolean;
  } | null;
  dropsite: string[] | null;
  actorName: string | null;
  foundationActor: string | null;
  structure: boolean;
  unit: boolean;
  resource: boolean;
  /** the original's <Minimap><Type> */
  minimapType: string;
}

function numberAt(node: XmlElement | undefined, ...names: string[]): number {
  const text = pathText(node, ...names);
  const value = Number.parseFloat(text);
  return Number.isFinite(value) ? value : 0;
}

function boolAt(node: XmlElement | undefined, ...names: string[]): boolean {
  return pathText(node, ...names) === 'true';
}

function attack(node: XmlElement | undefined, kind: string): AttackEffect | undefined {
  const a = child(node, kind);
  if (!a) return undefined;
  const damage: Record<string, number> = {};
  for (const type of ['Hack', 'Pierce', 'Crush']) {
    const value = Number.parseFloat(pathText(a, 'Damage', type));
    if (Number.isFinite(value) && value !== 0) damage[type] = value;
  }
  const bonuses: AttackEffect['bonuses'] = [];
  const bonusesNode = child(a, 'Bonuses');
  for (const b of bonusesNode?.children ?? []) {
    const multiplier = Number.parseFloat(childText(b, 'Multiplier'));
    if (!Number.isFinite(multiplier)) continue;
    bonuses.push({
      classes: tokens(childText(b, 'Classes')),
      civ: childText(b, 'Civ') || undefined,
      multiplier,
    });
  }
  const proj = child(a, 'Projectile');
  return {
    damage,
    bonuses,
    maxRange: numberAt(a, 'MaxRange'),
    minRange: numberAt(a, 'MinRange'),
    prepareTime: numberAt(a, 'PrepareTime'),
    repeatTime: numberAt(a, 'RepeatTime') || 1000,
    effectDelay: numberAt(a, 'EffectDelay') || numberAt(a, 'Projectile', 'EffectDelay'),
    restrictedClasses: tokens(pathText(a, 'RestrictedClasses')),
    preferredClasses: tokens(pathText(a, 'PreferredClasses')),
    captureValue: numberAt(a, 'Capture'),
    projectile: proj
      ? {
          speed: numberAt(proj, 'Speed'),
          spread: numberAt(proj, 'Spread'),
          gravity: numberAt(proj, 'Gravity'),
          launchPoint: numberAt(proj, 'LaunchPoint', '@y'),
        }
      : null,
  };
}

/** Read the components the port uses. `name` is the template name it was resolved from. */
export function templateInfo(name: string, root: XmlElement): TemplateInfo {
  const identity = child(root, 'Identity');
  const cost = child(root, 'Cost');
  const footprint = child(root, 'Footprint');
  const square = child(footprint, 'Square');
  const obstruction = child(root, 'Obstruction');
  const resources: Record<Resource, number> = { food: 0, wood: 0, stone: 0, metal: 0 };
  for (const res of RESOURCES) resources[res] = numberAt(cost, 'Resources', res);
  const gatherer = child(root, 'ResourceGatherer');
  const rates: Record<string, number> = {};
  let capacities: Record<Resource, number> = { food: 0, wood: 0, stone: 0, metal: 0 };
  if (gatherer) {
    for (const r of child(gatherer, 'Rates')?.children ?? []) {
      const value = Number.parseFloat(r.text);
      if (Number.isFinite(value)) rates[r.name] = value;
    }
    capacities = { food: 0, wood: 0, stone: 0, metal: 0 };
    for (const res of RESOURCES) capacities[res] = numberAt(gatherer, 'Capacities', res);
  }
  const supplyNode = child(root, 'ResourceSupply');
  const armour: Record<string, number> = {};
  const resistance = path(root, 'Resistance', 'Entity', 'Damage');
  for (const type of ['Hack', 'Pierce', 'Crush']) armour[type] = Number.parseFloat(childText(resistance, type)) || 0;

  const trainerNode = child(root, 'Trainer');
  const builderNode = child(root, 'Builder');
  const classes = tokens(childText(identity, 'Classes'));
  const structure = classes.includes('Structure');
  const unit = classes.includes('Unit');
  const resource = !!supplyNode;

  return {
    name,
    civ: childText(identity, 'Civ'),
    genericName: childText(identity, 'GenericName'),
    specificName: childText(identity, 'SpecificName'),
    tooltip: childText(identity, 'Tooltip'),
    history: childText(identity, 'History'),
    classes,
    visibleClasses: tokens(childText(identity, 'VisibleClasses')),
    phenotype: tokens(childText(identity, 'Phenotype')),
    rank: childText(identity, 'Rank'),
    icon: childText(identity, 'Icon') || null,
    requirements: { techs: tokens(pathText(identity, 'Requirements', 'Techs')) },
    health: numberAt(root, 'Health', 'Max') || 1,
    regenRate: numberAt(root, 'Health', 'RegenRate'),
    idleRegenRate: numberAt(root, 'Health', 'IdleRegenRate'),
    armour,
    attack: {
      melee: attack(child(root, 'Attack'), 'Melee'),
      ranged: attack(child(root, 'Attack'), 'Ranged'),
      slaughter: attack(child(root, 'Attack'), 'Slaughter'),
      capture: attack(child(root, 'Attack'), 'Capture'),
    },
    cost: {
      population: numberAt(cost, 'Population'),
      buildTime: numberAt(cost, 'BuildTime'),
      resources,
    },
    walkSpeed: numberAt(root, 'UnitMotion', 'WalkSpeed'),
    runMultiplier: numberAt(root, 'UnitMotion', 'RunMultiplier') || 1,
    turnRate: numberAt(root, 'Position', 'TurnRate') || 14,
    acceleration: numberAt(root, 'UnitMotion', 'Acceleration') || 35,
    visionRange: numberAt(root, 'Vision', 'Range'),
    footprint: {
      shape: square ? 'square' : 'circle',
      radius: numberAt(footprint, 'Circle', '@radius') || numberAt(footprint, 'Circle', 'radius'),
      width: numberAt(footprint, 'Square', '@width') || numberAt(footprint, 'Square', 'width'),
      depth: numberAt(footprint, 'Square', '@depth') || numberAt(footprint, 'Square', 'depth'),
      height: numberAt(footprint, 'Height') || 4,
    },
    obstruction: {
      staticWidth: numberAt(obstruction, 'Static', '@width') || numberAt(obstruction, 'Static', 'width'),
      staticDepth: numberAt(obstruction, 'Static', '@depth') || numberAt(obstruction, 'Static', 'depth'),
      unit: !!child(obstruction, 'Unit'),
      blockMovement: boolAt(obstruction, 'BlockMovement'),
      blockPathfinding: boolAt(obstruction, 'BlockPathfinding'),
      blockFoundation: boolAt(obstruction, 'BlockFoundation'),
    },
    populationBonus: numberAt(root, 'Population', 'Bonus'),
    capturePoints: numberAt(root, 'Capturable', 'CapturePoints'),
    captureResistance: numberAt(root, 'Resistance', 'Entity', 'Capture') || 10,
    trainer: trainerNode
      ? {
          entities: tokens(childText(trainerNode, 'Entities')),
          batchTimeModifier: numberAt(trainerNode, 'BatchTimeModifier') || 1,
        }
      : null,
    builder: builderNode
      ? {
          entities: tokens(childText(builderNode, 'Entities')),
          rate: numberAt(builderNode, 'Rate') || 1,
        }
      : null,
    gatherer: gatherer
      ? {
          maxDistance: numberAt(gatherer, 'MaxDistance') || 2,
          baseSpeed: numberAt(gatherer, 'BaseSpeed') || 1,
          rates,
          capacities,
        }
      : null,
    supply: supplyNode
      ? {
          max: (() => {
            const t = childText(supplyNode, 'Max');
            if (t === 'Infinity') return Infinity;
            const v = Number.parseFloat(t);
            return Number.isFinite(v) ? v : 0;
          })(),
          type: childText(supplyNode, 'Type'),
          maxGatherers: numberAt(supplyNode, 'MaxGatherers') || 1,
          diminishingReturns: numberAt(supplyNode, 'DiminishingReturns') || 1,
          killBeforeGather: boolAt(supplyNode, 'KillBeforeGather'),
        }
      : null,
    dropsite: child(root, 'ResourceDropsite') ? tokens(pathText(root, 'ResourceDropsite', 'Types')) : null,
    actorName: (() => {
      const a = pathText(root, 'VisualActor', 'Actor');
      return a ? a.replace(/\{phenotype\}/g, 'male') : null;
    })(),
    foundationActor: pathText(root, 'VisualActor', 'FoundationActor') || null,
    structure,
    unit,
    resource,
    minimapType: pathText(root, 'Minimap', 'Type') || '',
  };
}

/** The production/builder lists with {civ} and {native} replaced by the civilisation. */
export function resolveCivList(list: string[], civ: string): string[] {
  return list.map((s) => s.replace(/\{civ\}/g, civ).replace(/\{native\}/g, civ));
}
