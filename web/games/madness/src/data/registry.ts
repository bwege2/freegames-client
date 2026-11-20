// Madness Interactive Reloaded port (GPL-3.0). The game's data files and their readers:
// Shared/Serialisation/BaseDeserialiser.cs + KeyValueDeserialiser.cs (.stats, .look, .armor), HandArmourDeserialiser.cs
// (.hand), CharacterStats(Deserialiser).cs, CharacterLook(Deserialiser).cs, ArmourPiece/ArmourDeserialiser.cs,
// Weapons/WeaponData.cs + WeaponInstructions.cs (.json), MeleeSequenceDeserialiser.cs (.seq), Faction.cs (.json),
// Level/Level.cs (.json) and Registries/Registries.cs (keys are file names without extension).
import { parseAnimation, type CharacterAnimation, HandLook, HAND_LOOKS } from './animation.ts';
import { v2, type Vec2, type Rect, rect } from '../engine/util.ts';
import { Layers } from '../engine/physics.ts';

/** what the game reads from its base/ folder: by path relative to base/ */
export interface AssetSource {
  text(path: string): string;
  has(path: string): boolean;
  list(folder: string): string[];
}

/** BaseDeserialiser.Read: version line first, then non-empty, non-comment lines */
export function readLines(text: string): { s: string; raw: string; n: number }[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  if (!/^\d+(\.\d+){1,3}$/.test(lines[0].trim())) throw new Error(`expected a version, got "${lines[0]}"`);
  const out: { s: string; raw: string; n: number }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim() || l.startsWith('#')) continue;
    out.push({ s: l.trim(), raw: l, n: i + 1 });
  }
  return out;
}

/** KeyValueDeserialiser: "key value" lines; an array key is followed by indented entries */
export function readKeyValues(text: string, arrayKeys: ReadonlySet<string>): Map<string, string | string[]> {
  const out = new Map<string, string | string[]>();
  let arr: string[] | null = null;
  for (const line of readLines(text)) {
    if (arr && (line.raw.startsWith('\t') || line.raw.startsWith(' '))) { arr.push(line.s); continue; }
    arr = null;
    const m = /^(\S+)\s*(.*)$/.exec(line.s)!;
    if (arrayKeys.has(m[1])) { arr = []; out.set(m[1], arr); } else out.set(m[1], m[2].trim());
  }
  return out;
}

const parseBool = (s: string): boolean => s.trim().toLowerCase() === 'true';
const parseVec = (s: string): Vec2 => { const [x, y] = s.trim().split(/\s+/).map(Number); return v2(x, y); };

export const AgilitySkillLevel = { None: 0, Novice: 1, Adept: 2, Master: 3 } as const;
export type AgilitySkillLevel = number;

export class CharacterStats {
  name = 'Untitled';
  scale = 1;
  aimingRandomness = 1;
  aimingSpeed = 40;
  shootingTimeout = 1;
  recoilHandlingAbility = 0.4;
  accurateShotChance = 0;
  dodgeAbility = 0;
  jumpDodgeDuration = 0.7;
  walkHopDuration = 0.33;
  agilitySkillLevel: AgilitySkillLevel = AgilitySkillLevel.None;
  panicIntensity = 2;
  meleeSkill = 0.2;
  meleeKnockback = 0;
  canDeflect = false;
  dodgeOversaturate = false;
  headHealth = 0.2;
  bodyHealth = 0.3;
  unarmedSeq = ['unarmed'];
  swordSeq = ['sword_2', 'sword'];
  twoHandedSeq = ['twohanded_blunt'];
  bluntSeq = ['blunt'];
  twoHandedGunSeq = ['twohanded_gun'];
  oneHandedGunSeq = ['onehanded_gun'];
  abilities: string[] = [];
  walkAnimation: string | null = null;
}

const STATS_ARRAYS = new Set(['abilities', 'unarmed_seq', 'sword_seq', 'two_handed_seq', 'two_handed_gun_seq', 'one_handed_gun_seq', 'blunt_seq']);
export function parseStats(text: string): CharacterStats {
  const s = new CharacterStats();
  for (const [k, v] of readKeyValues(text, STATS_ARRAYS)) {
    const f = typeof v === 'string' ? parseFloat(v) : 0;
    switch (k) {
      case 'scale': s.scale = Math.min(4, Math.max(0.1, f)); break;
      case 'hop_duration': s.walkHopDuration = f; break;
      case 'aiming_randomness': s.aimingRandomness = f; break;
      case 'aiming_speed': s.aimingSpeed = f; break;
      case 'shooting_timeout': s.shootingTimeout = f; break;
      case 'recoil_handling': s.recoilHandlingAbility = f; break;
      case 'accurate_shot_chance': s.accurateShotChance = f; break;
      case 'dodge': s.dodgeAbility = f; break;
      case 'melee': s.meleeSkill = f; break;
      case 'melee_knockback': s.meleeKnockback = f; break;
      case 'panic': s.panicIntensity = f; break;
      case 'head_health': s.headHealth = f; break;
      case 'body_health': s.bodyHealth = f; break;
      case 'jump_dodge_duration': s.jumpDodgeDuration = f; break;
      case 'can_deflect': s.canDeflect = parseBool(v as string); break;
      case 'dodge_oversaturate': s.dodgeOversaturate = parseBool(v as string); break;
      case 'walk_anim': s.walkAnimation = v as string; break;
      case 'abilities': s.abilities = v as string[]; break;
      case 'name': s.name = v as string; break;
      case 'unarmed_seq': s.unarmedSeq = v as string[]; break;
      case 'sword_seq': s.swordSeq = v as string[]; break;
      case 'two_handed_seq': s.twoHandedSeq = v as string[]; break;
      case 'two_handed_gun_seq': s.twoHandedGunSeq = v as string[]; break;
      case 'one_handed_gun_seq': s.oneHandedGunSeq = v as string[]; break;
      case 'blunt_seq': s.bluntSeq = v as string[]; break;
      case 'agility_skill_level': s.agilitySkillLevel = ['none', 'novice', 'adept', 'master'].indexOf((v as string).toLowerCase()); break;
      default: throw new Error(`invalid stats key ${k}`);
    }
  }
  return s;
}

export const ArmourPieceType = { Unknown: 0, Body: 1, Head: 2, HeadAccessory: 3, BodyAccessory: 4, Hand: 5 } as const;
export type ArmourPieceType = number;
export class ArmourPiece {
  name = '';
  type: ArmourPieceType = ArmourPieceType.Unknown;
  right = '';
  left = '';
  offsetLeft = v2();
  offsetRight = v2();
  hidden = false;
  detachable = false;
  brokenKeys: string[] | null = null;
  textureScale = 1;
  deflectChance = 0;
  proceduralDamageScale = 1;
}
const ARMOUR_TYPES = ['unknown', 'body', 'head', 'headaccessory', 'bodyaccessory', 'hand'];
export function parseArmour(text: string): ArmourPiece {
  const p = new ArmourPiece();
  for (const [k, v] of readKeyValues(text, new Set(['broken']))) {
    const s = v as string;
    switch (k) {
      case 'name': p.name = s; break;
      case 'type': p.type = ARMOUR_TYPES.indexOf(s.toLowerCase()); break;
      case 'texture-scale': p.textureScale = parseFloat(s); break;
      case 'deflect-chance': p.deflectChance = parseFloat(s); break;
      case 'left': p.left = s; break;
      case 'right': p.right = s; break;
      case 'broken': p.brokenKeys = v as string[]; break;
      case 'detach': p.detachable = parseBool(s); break;
      case 'hidden': p.hidden = parseBool(s); break;
      case 'damage-size': p.proceduralDamageScale = parseFloat(s); break;
      case 'offset-left': p.offsetLeft = parseVec(s); break;
      case 'offset-right': p.offsetRight = parseVec(s); break;
      case 'offset': p.offsetLeft = parseVec(s); p.offsetRight = parseVec(s); break;
      default: break; // order, category: character creator only
    }
  }
  if (!p.left) p.left = p.right;
  return p;
}

export class HandArmourPiece {
  name = '';
  textureScale = 1;
  looks = new Map<HandLook, { front: string; back: string }>();
}
export function parseHandArmour(text: string): HandArmourPiece {
  const piece = new HandArmourPiece();
  let current: HandLook | null = null;
  for (const line of readLines(text)) {
    const id = HAND_LOOKS.findIndex((n) => line.s.toLowerCase().startsWith(n.toLowerCase()));
    if (id >= 0) { current = id; continue; }
    const m = /^(\S+)\s+(.*)$/.exec(line.s);
    if (!m) continue;
    if (current !== null) {
      const e = piece.looks.get(current) ?? { front: '', back: '' };
      if (m[1].toLowerCase() === 'back') e.back = m[2].trim(); else if (m[1].toLowerCase() === 'front') e.front = m[2].trim();
      piece.looks.set(current, e);
    } else if (m[1] === 'name') piece.name = m[2];
    else if (m[1] === 'texture-scale') piece.textureScale = parseFloat(m[2]);
  }
  return piece;
}

export class CharacterLook {
  name = 'Untitled';
  head!: ArmourPiece;
  body!: ArmourPiece;
  headLayers: (ArmourPiece | null)[] = [null, null, null];
  bodyLayers: (ArmourPiece | null)[] = [null, null];
  hands: HandArmourPiece | null = null;
  feet: string | null = null;
  headFlesh: string | null = null;
  bodyFlesh: string | null = null;
  headGore: string | null = null;
  bodyGore: string | null = null;
  cosmetic = false;
  bloodColour = '#ff0000';
  jitter = false;
  copy(): CharacterLook {
    const c = Object.assign(new CharacterLook(), this);
    c.headLayers = [...this.headLayers];
    c.bodyLayers = [...this.bodyLayers];
    return c;
  }
  headDeflectionChance(): number {
    if (this.cosmetic) return 0;
    return Math.max(0, this.head.deflectChance, ...this.headLayers.map((l) => l?.deflectChance ?? 0));
  }
  bodyDeflectionChance(): number {
    if (this.cosmetic) return 0;
    return Math.max(0, this.body.deflectChance, ...this.bodyLayers.map((l) => l?.deflectChance ?? 0));
  }
}

export interface WeaponData {
  name: string; damage: number; useDelay: number; maxHandRangeMultiplier: number;
  throwableDamage: number; throwableHeavy: boolean; throwableSharpBoxes: Rect[];
  weaponType: 'Firearm' | 'Melee';
  bulletsPerShot: number; roundsPerMagazine: number; burstFireCount: number; accuracy: number; recoil: number;
  rotationalRecoilIntensity: number; recoilHandling: number; automatic: boolean; shootSounds: string[];
  canBulletsBeDeflected: boolean; ejectionParticle: 'Small' | 'Medium' | 'ShotgunShell' | 'RifleCasing' | 'None';
  casingSize: number; isPumpAction: boolean; range: number; canDeflectBullets: boolean; specialMelee: boolean;
  meleeDamageType: 'Firearm' | 'Blade' | 'Axe' | 'Blunt'; meleeSize: 'Small' | 'Medium' | 'Large';
}
export interface AnimatedPartInstr {
  texture: string; scale: Vec2; duration: number; invisibleWhenOutOfAmmo: boolean; outOfAmmoKeyframeTime: number;
  translation: { value: Vec2; position: number }[] | null; visibility: { value: number; position: number }[] | null;
}
export interface WeaponInstructions {
  id: string; data: WeaponData; baseTexture: string; holdForGrip: boolean; holdStockHandPose: boolean;
  barrelEndPoint: Vec2; casingEjectionPoint: Vec2; holdPoints: Vec2[]; animatedParts: AnimatedPartInstr[]; onFloorAngle: number;
}
const xy = (o: { X: number; Y: number } | null | undefined): Vec2 => v2(o?.X ?? 0, o?.Y ?? 0);
export function parseWeapon(json: string): WeaponInstructions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j: any = JSON.parse(json.replace(/^﻿/, ''));
  const d = j.WeaponData;
  const curve = (c: { Keys?: { Value: unknown; Position: number }[] } | null | undefined) =>
    c?.Keys ? c.Keys.map((k) => ({ value: k.Value, position: k.Position })) : null;
  return {
    id: j.Id,
    data: {
      name: d.Name, damage: d.Damage, useDelay: d.UseDelay ?? 0, maxHandRangeMultiplier: d.MaxHandRangeMultiplier ?? 1,
      throwableDamage: d.ThrowableDamage ?? 15, throwableHeavy: !!d.ThrowableHeavy,
      throwableSharpBoxes: (d.ThrowableSharpBoxes ?? []).map((r: { MinX: number; MinY: number; MaxX: number; MaxY: number }) => rect(r.MinX, r.MinY, r.MaxX, r.MaxY)),
      weaponType: d.WeaponType ?? 'Firearm', bulletsPerShot: d.BulletsPerShot ?? 1, roundsPerMagazine: d.RoundsPerMagazine ?? 12,
      burstFireCount: d.BurstFireCount ?? 0, accuracy: d.Accuracy ?? 0, recoil: d.Recoil ?? 0,
      rotationalRecoilIntensity: d.RotationalRecoilIntensity ?? 1, recoilHandling: d.RecoilHandling ?? 0, automatic: !!d.Automatic,
      shootSounds: d.ShootSounds ?? [], canBulletsBeDeflected: d.CanBulletsBeDeflected ?? true,
      ejectionParticle: d.EjectionParticle ?? 'Small', casingSize: d.CasingSize ?? 1, isPumpAction: !!d.IsPumpAction,
      range: d.Range ?? 500, canDeflectBullets: !!d.CanDeflectBullets, specialMelee: !!d.SpecialMelee,
      meleeDamageType: d.MeleeDamageType ?? 'Firearm', meleeSize: d.MeleeSize ?? 'Medium',
    },
    baseTexture: j.BaseTexture, holdForGrip: !!j.HoldForGrip, holdStockHandPose: !!j.HoldStockHandPose,
    barrelEndPoint: xy(j.BarrelEndPoint), casingEjectionPoint: xy(j.CasingEjectionPoint),
    holdPoints: (j.HoldPoints ?? []).map(xy),
    animatedParts: (j.AnimatedParts ?? []).map((p: Record<string, never>) => ({
      texture: p.Texture, scale: xy(p.Scale ?? { X: 1, Y: 1 }), duration: p.Duration ?? 1,
      invisibleWhenOutOfAmmo: !!p.InvisbleWhenOutOfAmmo, outOfAmmoKeyframeTime: p.OutOfAmmoKeyframeTime ?? 0,
      translation: curve(p.TranslationCurve)?.map((k) => ({ value: xy(k.value as { X: number; Y: number }), position: k.position })) ?? null,
      visibility: curve(p.VisibilityCurve) as { value: number; position: number }[] | null,
    })),
    onFloorAngle: j.OnFloorAngle ?? 0,
  };
}

export interface MeleeSequenceKey { right: CharacterAnimation; left: CharacterAnimation; transitionFrame: number; hitFrames: number[] }
export function parseMeleeSequence(text: string, anims: Map<string, CharacterAnimation>): MeleeSequenceKey[] {
  const keys: MeleeSequenceKey[] = [];
  for (const line of readLines(text)) {
    const parts = line.s.split(/[\t ]+/).filter(Boolean);
    if (parts.length !== 3) continue;
    let right: CharacterAnimation | undefined;
    let left: CharacterAnimation | undefined;
    if (anims.has(parts[0])) right = left = anims.get(parts[0]);
    else if (parts[0].startsWith('[') && parts[0].endsWith(']')) {
      const arr = parts[0].slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
      right = anims.get(arr[0]);
      left = anims.get(arr[1]);
    }
    if (!right || !left) continue;
    const hitFrames = parts[2].slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean).map((s) => parseInt(s, 10));
    keys.push({ right, left, transitionFrame: parseInt(parts[1], 10), hitFrames });
  }
  return keys;
}

export class Faction {
  readonly collisionLayer: number;
  readonly id: string;
  readonly name: string;
  readonly registry: Registry;
  constructor(id: string, name: string, registry: Registry, layer: number) { this.id = id; this.name = name; this.registry = registry; this.collisionLayer = layer; }
  /** Faction.AttackHitLayerComposite (FactionRelationships.GetAllies yields the faction itself, so any ally removes its own layer) */
  get attackHitLayerComposite(): number {
    let enemy = Layers.AllCharacters;
    const allies = Faction.everyoneEvil ? null : this.registry.allies.get(this.id);
    if (allies) for (const a of allies) if (a !== this.id) enemy &= ~this.collisionLayer;
    if (!this.isEnemiesWith(this)) enemy &= ~this.collisionLayer;
    return enemy >>> 0;
  }
  /** the improbability disk "everyone_evil" (STATEOFEMERGENCY) */
  static everyoneEvil = false;
  isAlliedTo(o: Faction): boolean { return Faction.everyoneEvil ? false : this.registry.allies.get(this.id)?.has(o.id) ?? false; }
  isEnemiesWith(o: Faction): boolean { return Faction.everyoneEvil ? true : this.registry.enemies.get(this.id)?.has(o.id) ?? false; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LevelObject = { $type: string } & Record<string, any>;
/** MIR's AssetRef strings may carry the `base:` package prefix; the port's asset keys are relative to base/ */
export const assetPath = (p: string): string => (p.startsWith('base:') ? p.slice(5) : p);
/** every asset reference in a level object, however deeply its editor component nests it */
function fixAssetPaths<T>(v: T): T {
  if (typeof v === 'string') return assetPath(v) as unknown as T;
  if (Array.isArray(v)) return v.map(fixAssetPaths) as unknown as T;
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = fixAssetPaths(x);
    return out as T;
  }
  return v;
}
export interface Level {
  id: string;
  displayName: string;
  progressionType: 'Always' | 'BodyCount' | 'Time' | 'Explicit';
  levelType: 'Unknown' | 'Campaign' | 'Experiment';
  enemySpawnInterval: number;
  maxEnemyCount: number;
  maxSimultaneousAttackingEnemies: number;
  backgroundMusic: string | null;
  weaponChance: number;
  levelBounds: Rect;
  bodyCountToWin: number;
  timeLimitInSeconds: number;
  fullZoom: boolean;
  openingTransition: boolean;
  exitingTransition: boolean;
  enemySpawnInstructions: { statsKey: string; lookKey: string; factionKey: string }[];
  weapons: string[];
  floorLine: Vec2[];
  objects: LevelObject[];
}
export function parseLevel(json: string, id: string): Level {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j: any = JSON.parse(json.replace(/^﻿/, ''));
  const b = j.LevelBounds;
  return {
    id,
    displayName: j.DisplayName ?? 'untitled',
    progressionType: j.ProgressionType ?? 'BodyCount',
    levelType: j.LevelType ?? 'Unknown',
    enemySpawnInterval: j.EnemySpawnInterval ?? 2,
    maxEnemyCount: j.MaxEnemyCount ?? 4,
    maxSimultaneousAttackingEnemies: j.MaxSimultaneousAttackingEnemies ?? 2,
    backgroundMusic: j.BackgroundMusic && j.BackgroundMusic !== 0 ? assetPath(String(j.BackgroundMusic)) : null,
    weaponChance: j.WeaponChance ?? 0.5,
    levelBounds: rect(b.MinX, b.MinY, b.MaxX, b.MaxY),
    bodyCountToWin: j.BodyCountToWin ?? 50,
    timeLimitInSeconds: j.TimeLimitInSeconds ?? -1,
    fullZoom: !!j.FullZoom,
    openingTransition: j.OpeningTransition ?? true,
    exitingTransition: j.ExitingTransition ?? true,
    enemySpawnInstructions: (j.EnemySpawnInstructions ?? []).map((e: { StatsKey?: string; LookKey?: string; FactionKey?: string }) =>
      ({ statsKey: e.StatsKey ?? 'grunt', lookKey: e.LookKey ?? 'grunt', factionKey: e.FactionKey ?? 'aahw' })),
    weapons: j.Weapons ?? [],
    floorLine: (j.FloorLine ?? []).map(xy),
    objects: (j.Objects ?? []).map((o: LevelObject) => {
      const r = fixAssetPaths(o) as LevelObject;
      r.$type = o.$type.split(',')[0].split('.').pop()!;
      return r;
    }),
  };
}

/** Level.GetFloorLevelAt */
export function floorLevelAt(level: Level, x: number): number {
  const fl = level.floorLine;
  if (fl.length === 0) return 0;
  if (fl.length === 1) return fl[0].y;
  for (let i = 1; i < fl.length; i++) {
    if (fl[i].x > x) {
      const p = fl[i - 1];
      return p.y + (x - p.x) * (fl[i].y - p.y) / (fl[i].x - p.x);
    }
  }
  return fl[fl.length - 1].y;
}
/** Level.IsFlatAt */
export function isFlatAt(level: Level, x: number): boolean {
  const p1 = floorLevelAt(level, x - 132);
  const p2 = floorLevelAt(level, x + 132);
  return p1 > p2 ? p1 - p2 < 24 : p2 - p1 < 24;
}
export const isCloseToEdge = (level: Level, x: number, expand = 200): boolean =>
  x < level.levelBounds.minX + expand || x > level.levelBounds.maxX - expand;

export interface Campaign { id: string; name: string; author: string; description: string; levels: string[] }

const base = (p: string): string => p.split('/').pop()!.replace(/\.[^.]+$/, '');

/** Registries.cs: everything under data/, keyed by file name */
export class Registry {
  readonly animations = new Map<string, CharacterAnimation>();
  readonly stats = new Map<string, CharacterStats>();
  readonly looks = new Map<string, CharacterLook>();
  readonly armour = new Map<string, ArmourPiece>();
  readonly hands = new Map<string, HandArmourPiece>();
  readonly weapons = new Map<string, WeaponInstructions>();
  readonly melee = new Map<string, MeleeSequenceKey[]>();
  readonly factions = new Map<string, Faction>();
  readonly allies = new Map<string, Set<string>>();
  readonly enemies = new Map<string, Set<string>>();
  readonly campaigns = new Map<string, Campaign>();
  readonly levelFiles = new Map<string, string>();
  private readonly levels = new Map<string, Level>();
  convars = { panicMultiplier: 0.2, dodgeFromBehindCostMultiplier: 1.2, dodgePointBlankCostMultiplier: 80, pointBlankDistance: 100,
    deflectDodgeCost: 0.1, jumpDodgeChance: 0.2, enemyMeleeDistance: v2(220, 700), enemyGunDistance: v2(1000, 2000),
    enemySafeDistanceFromPlayer: 1000, enemyWeaponSearchRange: 1500 };

  readonly src: AssetSource;
  constructor(src: AssetSource) {
    this.src = src;
    for (const p of src.list('data/animations')) {
      if (!p.endsWith('.anim')) continue;
      const parts = p.split('/');
      this.animations.set(base(p), parseAnimation(src.text(p), base(p), parts[parts.length - 2]));
    }
    for (const p of src.list('data/armour')) {
      if (p.endsWith('.armor')) this.armour.set(base(p), parseArmour(src.text(p)));
      else if (p.endsWith('.hand')) this.hands.set(base(p), parseHandArmour(src.text(p)));
    }
    for (const p of src.list('data/stats')) this.stats.set(base(p), parseStats(src.text(p)));
    for (const p of src.list('data/looks')) this.looks.set(base(p), this.parseLook(src.text(p)));
    for (const p of src.list('data/weapons')) if (p.endsWith('.json')) { const w = parseWeapon(src.text(p)); this.weapons.set(w.id, w); }
    for (const p of src.list('data/melee_sequences')) this.melee.set(base(p), parseMeleeSequence(src.text(p), this.animations));
    let layer: number = Layers.CharacterStart;
    for (const p of src.list('data/factions').sort()) {
      const j = JSON.parse(src.text(p).replace(/^﻿/, '')) as { Name: string; Allies?: string[]; Enemies?: string[] };
      layer = (layer << 1) >>> 0;
      this.factions.set(base(p), new Faction(base(p), j.Name, this, layer));
      this.allies.set(base(p), new Set(j.Allies ?? []));
      this.enemies.set(base(p), new Set(j.Enemies ?? []));
    }
    for (const p of src.list('data/campaigns')) {
      if (!p.endsWith('meta.json')) continue;
      const j = JSON.parse(src.text(p).replace(/^﻿/, ''));
      this.campaigns.set(j.id, { id: j.id, name: j.name, author: j.author, description: j.description, levels: j.levels });
    }
    for (const p of src.list('data/levels')) if (p.endsWith('.json')) this.levelFiles.set(base(p), p);
    if (src.has('data/convars.txt')) this.readConvars(src.text('data/convars.txt'));
  }

  private readConvars(text: string): void {
    const c = this.convars;
    for (const [k, v] of readKeyValues(text, new Set())) {
      const n = (v as string).split(/\s+/).map(Number);
      switch (k) {
        case 'PanicMultiplier': c.panicMultiplier = n[0]; break;
        case 'DodgeFromBehindCostMultiplier': c.dodgeFromBehindCostMultiplier = n[0]; break;
        case 'DodgePointBlankCostMultiplier': c.dodgePointBlankCostMultiplier = n[0]; break;
        case 'PointBlankDistance': c.pointBlankDistance = n[0]; break;
        case 'DeflectDodgeCost': c.deflectDodgeCost = n[0]; break;
        case 'JumpDodgeChance': c.jumpDodgeChance = n[0]; break;
        case 'EnemyMeleeDistance': c.enemyMeleeDistance = v2(n[0], n[1]); break;
        case 'EnemyGunDistance': c.enemyGunDistance = v2(n[0], n[1]); break;
        case 'EnemySafeDistanceFromPlayer': c.enemySafeDistanceFromPlayer = n[0]; break;
        case 'EnemyWeaponSearchRange': c.enemyWeaponSearchRange = n[0]; break;
        default: break;
      }
    }
  }

  /** CharacterLookDeserialiser */
  parseLook(text: string): CharacterLook {
    const look = new CharacterLook();
    for (const [k, v] of readKeyValues(text, new Set(['body', 'head']))) {
      const s = v as string;
      switch (k) {
        case 'name': look.name = s; break;
        case 'blood': look.bloodColour = s.trim(); break;
        case 'jitter': look.jitter = parseBool(s); break;
        case 'head_flesh': look.headFlesh = s; break;
        case 'body_flesh': look.bodyFlesh = s; break;
        case 'head_gore': look.headGore = s; break;
        case 'body_gore': look.bodyGore = s; break;
        case 'feet': look.feet = s; break;
        case 'hands': {
          const h = this.hands.get(s);
          if (!h) throw new Error(`unregistered glove armour piece ${s}`);
          look.hands = h;
          break;
        }
        case 'body': (v as string[]).forEach((key, i) => {
          const p = this.armour.get(key);
          if (!p) throw new Error(`unregistered body armour piece ${key}`);
          if (i === 0) look.body = p; else look.bodyLayers[i - 1] = p;
        }); break;
        case 'head': (v as string[]).forEach((key, i) => {
          const p = this.armour.get(key);
          if (!p) throw new Error(`unregistered head armour piece ${key}`);
          if (i === 0) look.head = p; else look.headLayers[i - 1] = p;
        }); break;
        default: break;
      }
    }
    return look;
  }

  level(id: string): Level {
    let l = this.levels.get(id);
    if (!l) {
      const p = this.levelFiles.get(id);
      if (!p) throw new Error(`no level ${id}`);
      l = parseLevel(this.src.text(p), id);
      this.levels.set(id, l);
    }
    return l;
  }
  anim(name: string): CharacterAnimation {
    const a = this.animations.get(name);
    if (!a) throw new Error(`no animation ${name}`);
    return a;
  }
  faction(id: string): Faction {
    return this.factions.get(id) ?? this.factions.get('aahw')!;
  }
}
