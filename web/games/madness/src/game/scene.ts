// Madness Interactive Reloaded port (GPL-3.0). One level being played: Scenes/SceneUtils.PrepareGameScene and
// CampaignScene.Create (what is built, in which order the systems run), the level objects' SpawnInGameScene,
// Prefabs (characters, enemies, the player, weapons, doors, effects), Level/Systems/EnemySpawningSystem.cs,
// LevelProgressSystem.cs, LevelProgressTriggerSystem.cs, DoorSystem.cs, Weapons/Systems/AccurateShotSystem.cs,
// Camera/Systems/CameraMovementSystem.cs (PlayerTarget) and CameraShakeSystem.cs, Character/Systems/PlayerDeathSequenceSystem.cs.
import { Faction, floorLevelAt, type Level, type LevelObject, type Registry, type WeaponInstructions } from '../data/registry.ts';
import { Transform } from '../engine/matrix.ts';
import { Layers, PhysicsWorld, type Body } from '../engine/physics.ts';
import {
  add, clamp, dist, distSq, Easings, lerp, lerpV, evalCurve, mul, normalize, pickRandom, randomFloat, randomInt, randomPointInCircle, rect, rectCenter,
  smoothApproach, smoothApproachV, sub, v2, type Rect, type Vec2, nanFallback, nanFallbackV,
} from '../engine/util.ts';
import {
  buildCharacter, Character, getFloorOffset, Layer, newAi, hasRoundsLeft, type BodyPart, type Weapon, CharacterFlags,
} from './character.ts';
import { processWalking, updateAi, updateCharacterSystem, updateExitDoor, updateImpactOffsets, updateJumpDodge, updatePickup, updatePlayer, type PlayerInput } from './control.ts';
import { updateMeleeSequence, updateWeapon, weaponPhysicsInterpolate, weaponPhysicsStep } from './combat.ts';
import { constrainDecorations, positionCharacter } from './positioning.ts';
import { Ragdoll, ragdollLifetime, VerletSystem } from './ragdoll.ts';
import { LevelExtras, type DrawItem } from './extras.ts';
import { abilityFromType, addAbility, DiskState, fixedAbilities, nextSlot, updateAbilities, type Slot } from './abilities.ts';
import { internals } from './positioning.ts';
import { Tutorial } from './tutorial.ts';
import type { Audio, Clock, SceneBase, TextureSize } from './scene-api.ts';

export interface Door {
  topLeft: Vec2; topRight: Vec2; bottomLeft: Vec2; bottomRight: Vec2; spawnPoint: Vec2; facing: Vec2;
  enemySpawner: boolean; isLevelProgressionDoor: boolean; isPortal: boolean; texture: string; horizontal: boolean;
  isOpen: boolean; busy: boolean; changedAt: number; tag: number | null;
}

export interface Effect { texture: string; columns: number; rows: number; pos: Vec2; rot: number; size: Vec2; time: number; duration: number; tint: string | null; layer: number; order: number }
export interface Decal { blood: boolean; pos: Vec2; rot: number; scale: Vec2; index: number; color: string; front: boolean }
export interface Casing { texture: string; columns: number; frame: number; pos: Vec2; vel: Vec2; rot: number; rotVel: number; size: number; life: number; sounds: string[]; resting: boolean }
export interface Stamp { sprites: { texture: string; matrix: import('../engine/matrix.ts').Mat; hflip: boolean; vflip: boolean; layer: number; order: number }[] }

export interface SceneHooks {
  /** LevelProgressSystem.TransitionToNextLevel */
  nextLevel(carried: { key: string; ammo: number; infinite: boolean } | null): void;
  stat(kind: 'kill' | 'death'): void;
  music(path: string | null, loop?: boolean, offset?: number): void;
  /** CutsceneComponent: the app plays the slides; done() when they are over */
  cutscene?(key: string, done: () => void): void;
  /** how often the current level has been attempted (CampaignStats) */
  attempts?: number;
  /** Tricky's immortality: MadnessCommands.Revive */
  revive?(): void;
  playerLook?: import('../data/registry.ts').CharacterLook;
  playerLookKey?: string;
  playerStats?: string;
}

const CASINGS: Record<string, { texture: string; columns: number; sounds: string[] }> = {
  Small: { texture: 'textures/bullet_casings/9mm.png', columns: 4, sounds: [1, 2, 3, 4].map((i) => `sounds/casing/brass_${i}.wav`) },
  Medium: { texture: 'textures/bullet_casings/50ae.png', columns: 3, sounds: [1, 2, 3, 4].map((i) => `sounds/casing/brass_${i}.wav`) },
  RifleCasing: { texture: 'textures/bullet_casings/5.56.png', columns: 3, sounds: [1, 2, 3, 4].map((i) => `sounds/casing/brass_${i}.wav`) },
  ShotgunShell: { texture: 'textures/bullet_casings/12gauge.png', columns: 3, sounds: [1, 2, 3, 4].map((i) => `sounds/casing/shell_${i}.wav`) },
};
const BLOOD_SPURTS: [string, number, number, boolean][] = [
  ['blood_spurt_1x12', 12, 1, true], ['blood_spurt_1x14', 14, 1, true], ['blood_spurt_1x15', 15, 1, true], ['blood_spurt_1x18', 18, 1, true],
  ['blood_spurt_1x20', 20, 1, true], ['blood_spurt_1x21', 21, 1, true], ['blood_spurt_1x21', 21, 1, true], ['blood_spurt_6_1x7', 7, 2, true],
  ['blood_spurt_1_1x15', 15, 3, false], ['blood_spurt_3_1x13', 13, 3, false], ['blood_spurt_4_1x11', 11, 2, false],
  ['blood_spurt_5_1x8', 8, 2, false], ['blood_spurt_2_1x16', 16, 3, false],
];
const DEFLECTION_SPARKS: [string, number][] = [['bulletdeflect_1_1x13', 13], ['bulletdeflect_2_1x10', 10], ['bulletdeflect_3_1x8', 8], ['bulletdeflect_4_1x12', 12], ['bulletdeflect_5_1x8', 8]];

export class Scene implements SceneBase {
  readonly clock: Clock = { dt: 0, time: 0, sinceSceneChange: 0, timeScale: 1 };
  readonly physics = new PhysicsWorld();
  readonly characters: Character[] = [];
  readonly weapons: Weapon[] = [];
  readonly doors: Door[] = [];
  readonly ragdolls: Ragdoll[] = [];
  readonly fx: Effect[] = [];
  readonly decals: Decal[] = [];
  readonly casings: Casing[] = [];
  readonly stamps: Stamp[] = [];
  readonly tracers: { from: Vec2; to: Vec2; life: number }[] = [];
  readonly wounds = new Map<BodyPart, { p: Vec2; size: number; slash: boolean }[]>();
  readonly backgrounds: { texture: string; center: Vec2; scale: number }[] = [];
  readonly props: { texture: string; pos: Vec2; size: Vec2; rot: number; layer: number; order: number; columns: number; rows: number; duration: number; tint: [number, number, number, number]; tag?: number | null }[] = [];
  readonly progressTriggers: { rect: Rect; expired: boolean }[] = [];
  player: Character | null = null;
  highlightedWeapon: Weapon | null = null;
  lastAccurateShotTime = -1e9;
  accurateShot: { origin: Character; target: Character; time: number; lifespan: number } | null = null;
  deathSequence: { time: number } | null = null;
  readonly progress = { bodyCount: { current: 0, target: 0 }, timed: 0, goalReached: false };
  readonly spawner = { spawnInstructions: [] as { statsKey: string; lookKey: string; factionKey: string }[], weapons: [] as string[], maxEnemyCount: 10,
    weaponChance: 0.05, interval: 1, spawnPoints: [] as Vec2[], doors: [] as Door[], enabled: true, spawnTimer: 0 };
  readonly camera = { position: v2(), ortho: 1, shake: 0, shakeOffset: 0, viewW: 1920, viewH: 1080, initialised: false };
  private routines: { remaining: number; fn: ((dt: number) => void) | null; done: (() => void) | null }[] = [];
  private readonly verlet = new VerletSystem();
  private fixedAcc = 0;
  private measureAcc = 0;
  private entityIds = new WeakMap<Character, number>();
  private nextEntityId = 1;
  paused = false;
  /** Settings.General.Screenshake */
  screenshake = 1;
  /** Settings.Video.StampRagdolls: without it there is no StampSystem */
  stampRagdolls = true;
  /** ExperimentModeComponent.IsEditMode: the world stands still while the player edits it */
  editing = false;
  /** AiCharacterSystem.AutoSpawn */
  autoSpawn = true;
  /** the player's input this frame (abilities read it) */
  input: PlayerInput = { left: false, right: false, jumpDodge: false, interact: false, attack: false, melee: false, blockAim: false, throw: false, pressed: new Set(), worldMouse: v2(), abilityHeld: [false, false, false, false], abilityPressed: [false, false, false, false], abilityReleased: [false, false, false, false] };
  get mouseWorld(): Vec2 { return this.input.worldMouse; }
  get mouseClicked(): boolean { return this.input.pressed.has('attack'); }
  readonly disks: DiskState;
  readonly extras: LevelExtras;
  readonly draws: DrawItem[] = [];
  tutorial: Tutorial | null = null;
  accurateShotFinished = false;
  cutscene: string | null = null;
  notice: { text: string; time: number } | null = null;
  get levelAttempts(): number { return this.hooks.attempts ?? 1; }
  readonly music = { play: (p: string | null, loop = true): void => this.hooks.music(p, loop), loop: (p: string, loop = true): void => this.hooks.music(p, loop) };
  fistFight = (c: Character): void => internals.fistFight(c);
  newAi = newAi;
  textureFolder(f: string): string[] { return this.folders(f); }
  /** Level.CurrentLevel */
  readonly level: Level;

  readonly reg: Registry;
  readonly audio: Audio;
  private readonly tex: (p: string) => TextureSize;
  private readonly folders: (p: string) => string[];
  readonly hooks: SceneHooks;
  constructor(reg: Registry, level: Level, audio: Audio, tex: (p: string) => TextureSize,
    folders: (p: string) => string[], hooks: SceneHooks, carried: { key: string; ammo: number; infinite: boolean } | null, disks: DiskState = new DiskState()) {
    this.reg = reg; this.audio = audio; this.tex = tex; this.folders = folders; this.hooks = hooks;
    this.level = level;
    this.lastAccurateShotTime = -3.4e38;
    this.disks = disks;
    Faction.everyoneEvil = disks.has('everyone_evil');
    this.extras = new LevelExtras(this);
    this.buildLevel(carried);
    this.extras.init();
    const teach = [...this.extras.systems].find((n) => n.startsWith('Teach'));
    this.tutorial = teach ? new Tutorial(teach) : null;
  }

  textureSize(p: string): TextureSize { return this.tex(p); }
  soundFolder(p: string): string[] { return this.folders(p); }
  entityId(c: Character): number {
    let id = this.entityIds.get(c);
    if (!id) { id = this.nextEntityId++; this.entityIds.set(c, id); }
    return id;
  }
  delay(seconds: number, fn: () => void): void { this.routines.push({ remaining: seconds, fn: null, done: fn }); }
  routineFor(seconds: number, fn: (dt: number) => void): void { this.routines.push({ remaining: seconds, fn, done: null }); }
  shake(v: number): void { this.camera.shake += v; }
  campaignStat(kind: 'kill' | 'death'): void { this.hooks.stat(kind); }

  // ---------- building (PrepareGameScene + SpawnInGameScene) ----------
  private buildLevel(carried: { key: string; ammo: number; infinite: boolean } | null): void {
    const level = this.level;
    const spawn = level.objects.find((o) => o.$type === 'PlayerSpawn');
    const pos = spawn ? v2(spawn.Position.X, spawn.Position.Y) : v2();
    this.player = this.createPlayer(pos);
    if (spawn?.SpawnWeapon && this.reg.weapons.has(spawn.SpawnWeapon)) this.equipWeapon(this.player, this.createWeapon(pos, this.reg.weapons.get(spawn.SpawnWeapon)!));
    else if (carried && this.reg.weapons.has(carried.key)) {
      const w = this.createWeapon(pos, this.reg.weapons.get(carried.key)!);
      w.remainingRounds = carried.ammo;
      w.infiniteAmmo = carried.infinite;
      this.equipWeapon(this.player, w);
    }
    for (const o of level.objects) {
      try { this.spawnObject(o); } catch (e) { console.warn(`failed to spawn ${o.$type}`, e); }
    }
    const sp = this.spawner;
    sp.doors = this.doors.filter((d) => d.enemySpawner);
    sp.spawnPoints = level.objects.filter((o) => o.$type === 'EnemySpawner').map((o) => v2(o.Position.X, o.Position.Y));
    sp.spawnInstructions = level.enemySpawnInstructions;
    sp.maxEnemyCount = level.maxEnemyCount;
    sp.interval = level.enemySpawnInterval;
    sp.weapons = level.weapons;
    sp.weaponChance = level.weaponChance;
    this.progress.bodyCount.target = level.progressionType === 'BodyCount' ? level.bodyCountToWin : 2147483647;
    for (const d of this.doors) { d.busy = false; this.closeDoor(d); }
    // CampaignScene / PrepareGameScene: the enemy count disks
    if (level.enemySpawnInstructions.length > 0) {
      if (this.disks.has('fewer_enemies')) {
        if (level.progressionType === 'BodyCount' && sp.maxEnemyCount > 1) sp.maxEnemyCount--;
        sp.interval *= 1.4;
        if (level.progressionType === 'BodyCount' && this.progress.bodyCount.target > 5) this.progress.bodyCount.target = Math.trunc(this.progress.bodyCount.target / 2);
      }
      if (this.disks.has('more_enemies')) {
        if (level.progressionType === 'BodyCount' && sp.maxEnemyCount > 1) sp.maxEnemyCount += 4;
        sp.interval *= 0.1;
        if (level.progressionType === 'BodyCount' && this.progress.bodyCount.target > 1) this.progress.bodyCount.target *= 2;
      }
    }
  }

  private spawnObject(o: LevelObject): void {
    const r = (q: { MinX: number; MinY: number; MaxX: number; MaxY: number }): Rect => rect(q.MinX, q.MinY, q.MaxX, q.MaxY);
    const tag: number | null = o.Tag?.Value ?? null;
    const wall = (q: Rect, bits: number): void => { this.physics.add({ owner: { wall: true, tag }, filterBits: bits, collider: { kind: 'aabb', ...q } }); };
    if (this.extras.spawn(o)) return;
    const blockerBits = (t: number): number => (t === 0 ? Layers.BlockAll : t === 1 ? Layers.BlockMovement : t === 2 ? Layers.BlockBullets : 0);
    switch (o.$type) {
      case 'Background': this.backgrounds.push({ texture: o.TexturePath, center: v2(o.Center.X, o.Center.Y), scale: o.Scale }); break;
      case 'Door': this.createDoor(o.Properties, tag); break;
      case 'AllBlocker': wall(r(o.Rectangle), Layers.BlockAll); break;
      case 'MovementBlocker': wall(r(o.Rectangle), Layers.BlockMovement); break;
      case 'RectWall': wall(r(o.Rectangle), blockerBits(o.BlockerType)); break;
      case 'LineWall': this.physics.add({ owner: { wall: true, tag }, filterBits: blockerBits(o.BlockerType), collider: { kind: 'line', a: v2(o.A.X, o.A.Y), b: v2(o.B.X, o.B.Y), radius: o.Radius } }); break;
      case 'DecalZone': wall(r(o.Rectangle), Layers.DecalZone); break;
      case 'NPC': {
        const i = o.Instructions;
        const w = i.Weapon ? this.reg.weapons.get(i.Weapon) ?? null : null;
        const c = this.createEnemyWithWeapon(v2(i.BottomCenter.X, i.BottomCenter.Y), w, i.Stats, i.Look, i.Faction ?? 'aahw', true, i.ScaleOverride ? i.Scale : undefined);
        c.name = i.Name;
        if (i.IsProgressionRequirement) c.needsToDie = true;
        if (o.StartAnimation && this.reg.animations.has(o.StartAnimation)) this.delay(0, () => c.playAnimation(this.reg.anim(o.StartAnimation)));
        break;
      }
      case 'LevelWeapon': {
        const instr = this.reg.weapons.get(o.WeaponKey);
        if (!instr) break;
        const w = this.createWeapon(v2(o.Position.X, o.Position.Y), instr);
        w.transform.rotation = -o.Angle;
        w.isAttachedToWall = !!o.AttachedToWall;
        w.remainingRounds = o.Ammo < 0 || o.Ammo === 2147483647 ? w.data.roundsPerMagazine : clamp(o.Ammo, 0, w.data.roundsPerMagazine);
        w.transform.recalc();
        break;
      }
      case 'LevelProgressTrigger': this.progressTriggers.push({ rect: r(o.Rectangle), expired: false }); break;
      case 'PlayerPoster': {
        const tex = `textures/props/player_poster_${(o.Type ?? 0) + 1}.png`;
        const sz = this.tex(tex);
        this.props.push({ texture: tex, pos: v2(o.Position.X, o.Position.Y), size: v2(sz.w * o.Scale, sz.h * o.Scale), rot: -o.Angle, layer: Layer.BackgroundBehind, order: 1, columns: 1, rows: 1, duration: Infinity, tint: [1, 1, 1, 1] });
        break;
      }
      case 'FlipbookRect': {
        const sz = this.tex(o.TexturePath);
        const c = o.Color ?? { R: 1, G: 1, B: 1, A: 1 };
        this.props.push({ texture: o.TexturePath, pos: v2(o.Position.X, o.Position.Y), size: v2(sz.w / o.Columns * o.Scale, sz.h / o.Rows * o.Scale), rot: -o.Angle,
          layer: o.Layer, order: o.OrderInLayer, columns: o.Columns, rows: o.Rows, duration: o.Duration === 'Infinity' ? Infinity : Number(o.Duration), tint: [c.R, c.G, c.B, c.A], tag });
        break;
      }
      case 'Disk': {
        if (!o.DiskId || !o.Texture) break;
        const sz = this.tex(o.Texture);
        this.props.push({ texture: o.Texture, pos: v2(o.Position.X, o.Position.Y), size: v2(sz.w, sz.h), rot: o.Angle, layer: o.RenderOrder?.Layer ?? -100, order: o.RenderOrder?.OrderInLayer ?? 0, columns: 1, rows: 1, duration: Infinity, tint: [1, 1, 1, 1] });
        break;
      }
      default: break; // PlayerSpawn, EnemySpawner: read above
    }
  }

  /** Prefabs.CreateDoor + DoorComponent */
  private createDoor(p: LevelObject, tag: number | null = null): void {
    const xy = (q: { X: number | string; Y: number | string }): Vec2 => v2(Number(q.X), Number(q.Y));
    const d: Door = {
      topLeft: xy(p.TopLeft), topRight: xy(p.TopRight), bottomLeft: xy(p.BottomLeft), bottomRight: xy(p.BottomRight), spawnPoint: xy(p.SpawnPoint),
      facing: v2(), enemySpawner: !!p.EnemySpawnerDoor, isLevelProgressionDoor: !!p.IsLevelProgressionDoor, isPortal: !!p.IsPortal,
      texture: typeof p.Texture === 'string' ? p.Texture : 'textures/doors/door_1.png', horizontal: p.Behaviour === 1 || p.Behaviour === 'Horizontal',
      isOpen: true, busy: false, changedAt: -10, tag,
    };
    const bottom = mul(add(d.bottomLeft, d.bottomRight), 0.5);
    d.facing = normalize(sub(bottom, d.spawnPoint));
    if (Number.isNaN(d.facing.x) || Number.isNaN(d.facing.y)) d.facing = v2(0, -1);
    this.doors.push(d);
  }
  openDoor(d: Door): void {
    if (d.isOpen) return;
    d.isOpen = true;
    d.changedAt = this.clock.time;
    d.busy = true;
    this.delay(0.4, () => { d.busy = false; });
    this.audio.play('sounds/doors/door_open.wav', 0.25);
  }
  closeDoor(d: Door): void {
    if (!d.isOpen) return;
    d.isOpen = false;
    d.changedAt = this.clock.time;
    d.busy = true;
    this.delay(0.4, () => { d.busy = false; });
    this.audio.play('sounds/doors/door_close.wav', 0.25);
  }

  /** Prefabs.CreateCharacter: the character plus its bodies in the physics world */
  createCharacter(name: string, bottom: Vec2, factionKey: string, lookKey: string, statsKey: string, scaleOverride?: number): Character {
    const look = this.reg.looks.get(lookKey) ?? this.reg.looks.get('grunt')!;
    const stats = this.reg.stats.get(statsKey) ?? this.reg.stats.get('grunt')!;
    const faction = this.reg.faction(factionKey);
    const c = buildCharacter({ name, bottom, faction, look, stats, scaleOverride, textureSize: (p) => this.tex(p) });
    for (const part of [c.positioning.body, c.positioning.head] as BodyPart[]) {
      const body: Body = { owner: part, filterBits: faction.collisionLayer, collider: { kind: 'rect', matrix: () => part.transform.localToWorld, size: part.colliderSize } };
      part.body = body;
      this.physics.add(body);
    }
    this.characters.push(c);
    c.abilities = [];
    for (const name of stats.abilities) {
      const sl = nextSlot(c);
      const a = abilityFromType(name, sl as Slot);
      if (a) addAbility(c, a);
    }
    return c;
  }
  /** Prefabs.CreateEnemy */
  createEnemy(bottom: Vec2, statsKey: string, lookKey: string, factionKey: string, scaleOverride?: number): Character {
    const c = this.createCharacter('Unnamed NPC', bottom, factionKey, lookKey, statsKey, scaleOverride);
    c.ai = newAi();
    c.onDeath.push(() => { this.progress.bodyCount.current++; });
    return c;
  }
  /** Prefabs.CreateEnemyWithWeapon */
  createEnemyWithWeapon(bottom: Vec2, weapon: WeaponInstructions | null, statsKey: string, lookKey: string, factionKey: string, randomAmmo = true, scaleOverride?: number): Character {
    const c = this.createEnemy(bottom, statsKey, lookKey, factionKey, scaleOverride);
    if (weapon) {
      const w = this.createWeapon(bottom, weapon);
      if (randomAmmo && w.data.roundsPerMagazine > 0) w.remainingRounds = randomInt(Math.min(w.data.roundsPerMagazine, 8), w.data.roundsPerMagazine);
      this.equipWeapon(c, w);
    }
    return c;
  }
  /** Prefabs.CreatePlayer: the look is the grunt's (GameLoadingSteps.LoadPlayerLook, cosmetic), the stats "player" */
  createPlayer(bottom: Vec2): Character {
    const c = this.createCharacter('Player', bottom, 'player', this.hooks.playerLookKey ?? 'grunt', this.hooks.playerStats ?? 'player');
    // GameLoadingSteps.LoadPlayerLook: the player's own look (player.look), cosmetic; a campaign may set its own
    c.look = (this.hooks.playerLookKey ? this.reg.looks.get(this.hooks.playerLookKey)! : this.hooks.playerLook ?? c.look).copy();
    if (!this.hooks.playerLookKey) c.look.cosmetic = true;
    c.needsLookUpdate = true;
    c.flags &= ~(CharacterFlags.StunAnimationOnNonFatalAttack | CharacterFlags.DeleteRagdoll);
    c.isPlayer = true;
    this.disks.apply(this, c);
    c.player = { respondToUserInput: true, isDoingDyingSequence: false };
    return c;
  }

  /** Prefabs.CreateWeapon */
  createWeapon(position: Vec2, instr: WeaponInstructions): Weapon {
    const t = new Transform();
    t.position = { ...position };
    const sprite = new Transform();
    sprite.parent = t;
    const sz = this.tex(instr.baseTexture);
    sprite.scale = v2(sz.w, sz.h);
    const parts = instr.animatedParts.map((p) => {
      const pt = new Transform();
      pt.parent = t;
      const ps = this.tex(p.texture);
      pt.scale = v2(ps.w * p.scale.x, ps.h * p.scale.y);
      pt.position = p.translation?.[0]?.value ? { ...p.translation[0].value } : v2();
      return { transform: pt, texture: p.texture, playing: false, time: 0, visible: true };
    });
    const w: Weapon = {
      instr, data: instr.data, key: instr.id, transform: t, sprite, holdPoints: instr.holdPoints.map((h) => ({ ...h })),
      barrelEndPoint: { ...instr.barrelEndPoint }, casingEjectionPoint: { ...instr.casingEjectionPoint }, wielder: null,
      isAttachedToWall: false, remainingRounds: instr.data.roundsPerMagazine, isFiring: false, isFlipped: false, isBusyBurstFiring: false,
      timer: Number.MAX_VALUE, hasBeenPumped: true, infiniteAmmo: false, layer: 0, order: 0, textureWidth: sz.w, velocity: v2(), rotationalVelocity: 0,
      onFloor: false, measured: v2(), measuredRotation: 0, prevPosition: { ...position }, prevRotation: 0, despawnTime: 200, despawnTimer: 0,
      thrown: null, stuckInside: null, parts, removed: false,
    };
    t.recalc();
    this.weapons.push(w);
    return w;
  }
  /** CharacterComponent.EquipWeapon */
  equipWeapon(c: Character, w: Weapon): boolean {
    if (w.wielder || !c.isAlive || w.removed) return false;
    if (c.hasWeaponEquipped) this.dropWeapon(c);
    w.thrown = null;
    w.isAttachedToWall = false;
    w.stuckInside = null;
    w.wielder = c;
    w.timer = Number.MAX_VALUE;
    c.equipped = w;
    return true;
  }
  /** CharacterComponent.DropWeapon */
  dropWeapon(c: Character): void {
    const w = c.equipped;
    if (!w || w.removed) { c.equipped = null; return; }
    w.wielder = null;
    w.transform.recalc();
    const hp = w.holdPoints[0];
    const m = w.transform.localToWorld;
    w.transform.position = add(w.transform.position, v2(hp.x * m[0] + hp.y * m[2], hp.x * m[1] + hp.y * m[3]));
    w.physPos = undefined;
    if (!hasRoundsLeft(w) && !w.isAttachedToWall) w.despawnTime = 5;
    c.equipped = null;
  }
  /** ExperimentModeSystem.ClearAll: stamps, every other character, every weapon and the decals */
  cleanup(): void {
    this.stamps.length = 0;
    for (const c of [...this.characters]) if (c !== this.player) this.deleteCharacter(c);
    for (const w of [...this.weapons]) {
      for (const c of this.characters) if (c.equipped === w) c.equipped = null;
      this.removeWeapon(w);
    }
    this.decals.length = 0;
  }
  removeWeapon(w: Weapon): void {
    w.removed = true;
    const i = this.weapons.indexOf(w);
    if (i >= 0) this.weapons.splice(i, 1);
  }

  /** MadnessUtils.EjectHeadDecorations: detachable head apparel flies off (shown as an effect that falls) */
  ejectHeadDecorations(c: Character): void {
    for (const d of c.positioning.headDecorations) {
      if (!d.renderer.visible || d.ejected || !d.piece?.detachable) continue;
      d.ejected = true;
      const vel = add(c.positioning.head.velocity, v2(0, randomFloat(15, 54)));
      this.casings.push({ texture: d.renderer.texture, columns: 1, frame: 0, pos: { ...d.transform.position }, vel: mul(vel, 40), rot: d.transform.rotation,
        rotVel: randomFloat(-360, 360), size: d.transform.scale.x, life: 30, sounds: [], resting: false });
    }
  }

  /** MadnessUtils.TurnIntoRagdoll */
  turnIntoRagdoll(c: Character, addVelocity: Vec2 = v2(), addTorque = 0): void {
    if (c.isAlive || c.hasBeenRagdolled || c.hasFlag(CharacterFlags.NoRagdoll)) return;
    const center = c.positioning.body.computedVisualCenter;
    c.hasBeenRagdolled = true;
    if (c.hasWeaponEquipped) this.dropWeapon(c);
    const layer = c.isPlayer ? Layer.PlayerRagdoll : randomInt(Layer.RagdollsLower, Layer.RagdollsUpper);
    c.walkAcceleration = v2();
    c.layer = layer;
    for (const l of [c.positioning.body, c.positioning.head, ...c.positioning.hands]) { l.renderer.tint = [1, 1, 1]; l.renderer.layer = layer; l.renderer.additional = null; }
    for (const d of [...c.positioning.bodyDecorations, ...c.positioning.headDecorations]) { d.renderer.layer = layer; d.renderer.tint = [1, 1, 1]; d.renderer.additional = null; }
    for (const f of c.positioning.feet) { f.renderer.layer = layer; f.renderer.tint = [1, 1, 1]; }
    for (const h of c.positioning.hands) h.look = 5; // HandLook.Open
    if (randomFloat() > 0.8) this.ejectHeadDecorations(c);
    const r = Ragdoll.build(this, c, center);
    r.shouldDelete = c.hasFlag(CharacterFlags.DeleteRagdoll);
    for (const n of r.nodes) {
      let rot = sub(n.position, center);
      rot = normalize(v2(-rot.y, rot.x));
      n.acceleration = add(n.acceleration, add(mul(nanFallbackV(rot), addTorque), addVelocity));
    }
    // the feet follow the body (TransformConstraintComponent)
    c.feetOffsets = c.positioning.feet.map((f) => {
      const inv = c.positioning.body.transform.worldToLocal;
      return v2(f.transform.position.x * inv[0] + f.transform.position.y * inv[2] + inv[4], f.transform.position.x * inv[1] + f.transform.position.y * inv[3] + inv[5]);
    });
    c.ragdoll = r;
    this.ragdolls.push(r);
  }
  /** Stamper.Stamp: the character's sprites are left on the background */
  stamp(c: Character): void {
    if (!this.stampRagdolls) return;
    this.stamps.push({ sprites: this.characterSprites(c).map((s) => ({ ...s, layer: Layer.BackgroundBehind, order: 2 })) });
    if (this.stamps.length > 64) this.stamps.shift();
  }
  /** CharacterComponent.Delete */
  deleteCharacter(c: Character): void {
    c.removed = true;
    const i = this.characters.indexOf(c);
    if (i >= 0) this.characters.splice(i, 1);
    this.physics.remove(c.positioning.head.body);
    this.physics.remove(c.positioning.body.body);
    if (c.ragdoll) { const j = this.ragdolls.indexOf(c.ragdoll); if (j >= 0) this.ragdolls.splice(j, 1); }
    this.wounds.delete(c.positioning.head);
    this.wounds.delete(c.positioning.body);
  }
  /** the sprites of a character for stamping and rendering */
  characterSprites(c: Character): Stamp['sprites'] {
    const out: Stamp['sprites'] = [];
    const pos = c.positioning;
    const push = (t: Transform, r: { texture: string; hflip: boolean; vflip: boolean; layer: number; order: number; visible: boolean; additional: import('../engine/matrix.ts').Mat | null }): void => {
      if (!r.visible || !r.texture) return;
      let m = t.localToWorld;
      if (r.additional) m = mulMat(m, r.additional);
      out.push({ texture: r.texture, matrix: m, hflip: r.hflip, vflip: r.vflip, layer: r.layer, order: r.order });
    };
    for (const f of pos.feet) push(f.transform, { ...f.renderer });
    push(pos.body.transform, pos.body.renderer);
    for (const d of pos.bodyDecorations) if (!d.ejected && d.piece) push(d.transform, d.renderer);
    push(pos.head.transform, pos.head.renderer);
    for (const d of pos.headDecorations) if (!d.ejected && d.piece) push(d.transform, d.renderer);
    for (const h of pos.hands) push(h.transform, h.renderer);
    return out;
  }

  /** BodyPartShapeComponent.TryAddHole: a wound in the body part's texture space; returns the size used */
  addWound(part: BodyPart, local: Vec2, size: number): number {
    const list = this.wounds.get(part) ?? [];
    if (list.length < 16) list.push({ p: { ...local }, size: Math.min(size, 0.5), slash: false });
    this.wounds.set(part, list);
    return size;
  }
  addSlash(part: BodyPart, local: Vec2): void {
    const list = this.wounds.get(part) ?? [];
    if (list.length < 16) list.push({ p: { ...local }, size: 0.15, slash: true });
    this.wounds.set(part, list);
  }

  /** WeaponSystem.EjectCasingParticle */
  ejectCasing(w: Weapon): void {
    const c = CASINGS[w.data.ejectionParticle];
    if (!c) return;
    const m = w.transform.localToWorld;
    const p = { x: w.casingEjectionPoint.x * m[0] + w.casingEjectionPoint.y * m[2] + m[4], y: w.casingEjectionPoint.x * m[1] + w.casingEjectionPoint.y * m[3] + m[5] };
    const up = normalize(v2(m[2], m[3]));
    const vel = add(mul(up, 2000), randomPointInCircle(0, 500));
    this.casings.push({ texture: c.texture, columns: c.columns, frame: randomInt(0, c.columns), pos: p, vel, rot: w.transform.rotation, rotVel: randomFloat(-720, 720),
      size: w.data.casingSize * 60, life: 8, sounds: c.sounds, resting: false });
    if (this.casings.length > 200) this.casings.shift();
  }

  readonly effects = {
    muzzleFlash: (pos: Vec2, rot: number, size: number): void => {
      this.fx.push({ texture: `textures/muzzle_flashes/muzzle_flash_${randomInt(1, 5)}.png`, columns: 5, rows: 1, pos, rot, size: v2(256 * size, 256 * size),
        time: 0.2 * 0, duration: randomFloat(0.05, 0.12), tint: null, layer: Layer.Effects, order: 0 });
    },
    bloodSpurt: (pos: Vec2, rot: number, color: string, size: number): void => {
      const [name, cols, sz, point] = pickRandom(BLOOD_SPURTS);
      const s = 256 * size * sz * randomFloat(0.9, 1.1);
      this.fx.push({ texture: `textures/blood_impact/${name}.png`, columns: cols, rows: 1, pos, rot: point ? rot : 0, size: v2(s, s),
        time: 0, duration: randomFloat(0.4, 0.5), tint: color, layer: Layer.Effects, order: 0 });
    },
    deflectionSpark: (pos: Vec2, rot: number, size: number): void => {
      const [name, cols] = pickRandom(DEFLECTION_SPARKS);
      this.fx.push({ texture: `textures/bullet_deflect/${name}.png`, columns: cols, rows: 1, pos, rot: rot - 90, size: v2(256 * size, 256 * size),
        time: 0, duration: randomFloat(0.1, 0.2), tint: null, layer: Layer.BackgroundInFront, order: 0 });
    },
    bulletHole: (pos: Vec2, angle: number, scale: number): void => {
      const p = add(pos, randomPointInCircle(0, 50));
      this.decals.push({ blood: false, pos: p, rot: angle, scale: v2(scale * 0.5, scale), index: randomInt(0, 5), color: '#000000', front: false });
      if (this.decals.length > 1024) this.decals.shift();
      const [name, cols] = pickRandom([['bulletimpact_1_1x7', 7], ['bulletimpact_2_1x10', 10], ['bulletimpact_3_1x10', 10], ['bulletimpact_4_1x9', 9], ['bulletimpact_5_1x12', 12]] as [string, number][]);
      this.fx.push({ texture: `textures/bullet_impact/${name}.png`, columns: cols, rows: 1, pos, rot: angle - 90, size: v2(256, 256),
        time: 0, duration: randomFloat(0.15, 0.25), tint: null, layer: Layer.Effects, order: 0 });
    },
    bloodSplat: (pos: Vec2, angle: number, color: string, scale: number): void => {
      const p = add(pos, randomPointInCircle(0, 50));
      const inside = floorLevelAt(this.level, p.x) > p.y || this.physics.queryPoint(p, Layers.BlockBullets).length > 0;
      if (this.physics.queryPoint(p, Layers.DecalZone).length === 0 && !inside) return;
      this.decals.push({ blood: true, pos: p, rot: angle, scale: v2(scale, scale), index: randomInt(0, 10), color, front: inside });
      if (this.decals.length > 1024) this.decals.shift();
    },
    tracer: (from: Vec2, to: Vec2): void => { this.tracers.push({ from, to, life: 0.07 }); if (this.tracers.length > 64) this.tracers.shift(); },
  };

  isTargetedByAccurateShot(c: Character | null): boolean { return !!c && !!this.accurateShot && this.accurateShot.target === c; }
  /** CharacterUtilities.DoAccurateShot + Prefabs.CreateAccurateShotWarning */
  doAccurateShot(shooter: Character, victim: Character): void {
    if (this.clock.time - this.lastAccurateShotTime < 5 || this.accurateShot) return;
    this.lastAccurateShotTime = this.clock.time;
    this.audio.play('sounds/accurate_shot_warning_alt.wav');
    this.accurateShot = { origin: shooter, target: victim, time: 0, lifespan: 2 };
  }
  private updateAccurateShot(): void {
    const a = this.accurateShot;
    if (!a) return;
    const ai = a.origin.ai;
    if (!ai) { this.accurateShot = null; return; }
    ai.isDoingAccurateShot = true;
    ai.wants.ironSight.value = true;
    a.origin.attacksCannotBeAutoDodged = true;
    a.time += this.clock.dt;
    const abort = (): void => {
      this.accurateShot = null;
      ai.isDoingAccurateShot = false;
      this.delay(0.05, () => { a.origin.attacksCannotBeAutoDodged = false; });
    };
    if (!a.target.isAlive || !a.origin.isAlive || a.target.hasBeenRagdolled || a.origin.hasBeenRagdolled || !a.origin.hasWeaponEquipped) { abort(); return; }
    if (a.time >= a.lifespan && a.origin.equipped) {
      a.origin.equipped.isFiring = true;
      this.accurateShotFinished = true;
      this.flash = { color: [1, 0, 0, 0.8], time: 0.1 };
      abort();
    }
  }
  flash: { color: [number, number, number, number]; time: number } | null = null;

  /** CharacterMovementSystem.OverlapsWithOpenPortal */
  overlapsWithOpenPortal(c: Character): boolean {
    const b = c.boundingBox();
    for (const d of this.doors) {
      if (!(d.isPortal || d.isLevelProgressionDoor) || !d.isOpen) continue;
      const db = { minX: Math.min(d.bottomLeft.x, d.topLeft.x), minY: Math.min(d.bottomLeft.y, d.bottomRight.y), maxX: Math.max(d.topRight.x, d.bottomRight.x), maxY: Math.max(d.topRight.y, d.topLeft.y) };
      if (d.facing.x < 0) db.maxX += 1000; else db.minX -= 1000;
      if (db.minX <= b.maxX && db.maxX >= b.minX && db.minY <= b.maxY && db.maxY >= b.minY) return true;
    }
    return false;
  }

  /** MadnessCommands.Revive: a new player where the old one lies */
  revive(): void {
    const old = this.player;
    if (!old || old.isAlive) return;
    let pos = { ...old.positioning.body.transform.position };
    if (old.ragdoll && old.ragdoll.nodes.length) {
      pos = v2(0, 0);
      for (const n of old.ragdoll.nodes) pos = add(pos, n.position);
      pos = mul(pos, 1 / old.ragdoll.nodes.length);
    }
    const fl = this.level.floorLine;
    if (fl.length) pos.x = clamp(pos.x, Math.min(...fl.map((p) => p.x)), Math.max(...fl.map((p) => p.x)));
    this.deleteCharacter(old);
    this.deathSequence = null;
    this.player = this.createPlayer(v2(pos.x, floorLevelAt(this.level, pos.x)));
  }

  /** CutscenePlayerSystem: a CutsceneComponent; the app plays it */
  startCutscene(key: string, progress: boolean): void {
    this.cutscene = key;
    const done = (): void => {
      this.cutscene = null;
      if (progress) { this.forceReachGoal(); this.transitionToNextLevel(); }
    };
    if (this.hooks.cutscene) this.hooks.cutscene(key, done); else done();
  }

  startDeathSequence(): void {
    if (this.disks.has('tricky')) {
      this.flash = { color: [1, 0, 0, 1], time: 2 };
      this.audio.play('sounds/tricky_revive.wav', 4);
      this.deathSequence = { time: 0 };
      this.delay(2, () => this.revive());
      return;
    }
    if (this.deathSequence) return;
    this.hooks.music(null);
    this.audio.play('sounds/death.ogg');
    this.delay(1, () => { if (this.deathSequence) this.audio.play('sounds/music/death.ogg'); });
    this.deathSequence = { time: 0 };
    this.shake(20);
  }

  // ---------- the frame ----------
  /** Scene.UpdateSystems in PrepareGameScene's order, then the routines; FixedUpdate (60 per second) for the weapons' physics */
  update(realDt: number, input: PlayerInput): void {
    if (this.paused) return;
    this.input = input;
    if (this.cutscene) return;
    if (this.editing) { this.updateCamera(0, realDt); for (const c of this.characters) { c.needsLookUpdate = true; } return; }
    const dt = Math.min(realDt, 0.1) * this.clock.timeScale;
    this.clock.dt = dt;
    this.clock.time += dt;
    this.clock.sinceSceneChange += realDt;
    this.fixedAcc += dt;
    while (this.fixedAcc >= 1 / 60) {
      this.fixedAcc -= 1 / 60;
      for (const w of this.weapons) weaponPhysicsStep(this, w, 1 / 60);
      for (const c of this.characters) fixedAbilities(this, c, 1 / 60);
    }
    this.verlet.update(this, this.ragdolls);
    for (const c of this.characters) if (!c.removed) updateImpactOffsets(this, c);
    for (const c of this.characters) updateJumpDodge(this, c);
    for (const c of [...this.characters]) updateAbilities(this, c);
    updateAi(this);
    if (this.player && !this.player.removed) updatePlayer(this, this.player, input);
    for (const c of this.characters) updateExitDoor(this, c);
    for (const c of this.characters) updatePickup(this, c);
    for (const c of this.characters) processWalking(this, c);
    for (const c of [...this.characters]) positionCharacter(this, c);
    for (const c of this.characters) constrainDecorations(c);
    for (const w of this.weapons) weaponPhysicsInterpolate(w, this.fixedAcc * 60);
    for (const w of [...this.weapons]) {
      w.transform.recalc();
      updateWeapon(this, w);
      w.transform.recalc();
      // WeaponPartAnimationSystem: slides and pumps follow their curves
      w.parts.forEach((p, i) => {
        const a = w.instr.animatedParts[i];
        if (p.playing) { p.time += dt; if (p.time >= a.duration) { p.time = a.duration; p.playing = false; } }
        if (a.translation?.length) p.transform.position = evalCurve(a.translation, p.time / a.duration, lerpV, v2());
        if (a.visibility?.length) p.visible = evalCurve(a.visibility, p.time / a.duration, lerp, 1) > 0.5;
        if (!hasRoundsLeft(w) && a.invisibleWhenOutOfAmmo && !w.data.isPumpAction) p.visible = false;
        p.transform.recalc();
      });
      w.sprite.recalc();
    }
    if (this.deathSequence) this.deathSequence.time += dt;
    this.updateAccurateShot();
    for (const c of this.characters) updateCharacterSystem(this, c);
    this.updateDoors();
    this.updateRagdolls(dt);
    for (const c of [...this.characters]) updateMeleeSequence(this, c);
    this.updateProgressTriggers();
    this.updateCamera(dt, realDt);
    for (const c of this.characters) c.lifetime += dt;
    this.updateEffects(dt);
    this.updateDespawn(dt);
    this.measure(dt);
    this.updateSpawning(dt);
    this.extras.update(dt);
    this.tutorial?.update(this, dt);
    if (this.notice) { this.notice.time += realDt; if (this.notice.time > 4) this.notice = null; }
    this.updateProgress(dt);
    // the routines (RoutineScheduler, pausable)
    const rs = this.routines;
    this.routines = [];
    for (const r of rs) {
      if (r.fn) r.fn(dt);
      r.remaining -= dt;
      if (r.remaining <= 0) r.done?.(); else this.routines.push(r);
    }
    if (this.flash) { this.flash.time -= realDt; if (this.flash.time <= 0) this.flash = null; }
  }

  private measure(dt: number): void {
    this.measureAcc += dt;
    const steps = Math.floor(this.measureAcc * 100);
    this.measureAcc -= steps / 100;
    if (steps <= 0) return;
    for (const c of this.characters) {
      for (const p of [c.positioning.head, c.positioning.body]) { p.velocity = mul(sub(p.transform.position, p.prevPosition), 100); p.prevPosition = { ...p.transform.position }; }
      for (const h of c.positioning.hands) { h.velocity = mul(sub(h.transform.position, h.prevPosition), 100); h.prevPosition = { ...h.transform.position }; }
    }
    for (const w of this.weapons) {
      w.measured = mul(sub(w.transform.position, w.prevPosition), 100);
      const d = ((w.transform.rotation - w.prevRotation + 180) % 360 + 360) % 360 - 180;
      w.measuredRotation = d * 100;
      w.prevPosition = { ...w.transform.position };
      w.prevRotation = w.transform.rotation;
    }
  }

  private updateRagdolls(dt: number): void {
    for (const r of [...this.ragdolls]) {
      const c = r.character;
      // feet follow the body
      if (c.feetOffsets) c.positioning.feet.forEach((f, i) => {
        const m = c.positioning.body.transform.localToWorld;
        const o = c.feetOffsets![i];
        f.transform.position = v2(o.x * m[0] + o.y * m[2] + m[4], o.x * m[1] + o.y * m[3] + m[5]);
        f.transform.rotation = c.positioning.body.transform.rotation;
        f.transform.recalc();
      });
      constrainDecorations(c);
      const what = ragdollLifetime(r, dt);
      if (what === 'stamp') { this.stamp(c); this.deleteCharacter(c); } else if (what === 'delete') this.deleteCharacter(c);
    }
  }

  /** DoorSystem.ProcessDoor */
  private updateDoors(): void {
    const pc = this.player && !this.player.removed ? this.player : null;
    for (const d of this.doors) {
      const wants = !!pc && pc.isAlive && !pc.positioning.isFlying && Math.sign(pc.walkAcceleration.x) !== Math.sign(d.facing.x)
        && Math.abs(pc.walkAcceleration.x) > 50
        && (d.facing.x > 0 ? pc.positioning.globalCenter.x < d.spawnPoint.x : pc.positioning.globalCenter.x > d.spawnPoint.x);
      if (d.isPortal) {
        if (!d.busy) {
          if (pc && pc.isAlive && !pc.positioning.isFlying && Math.abs(pc.positioning.globalCenter.x - d.spawnPoint.x) < 800) this.openDoor(d); else this.closeDoor(d);
        }
      } else if (d.isLevelProgressionDoor && d.isOpen) {
        if (this.progress.goalReached && wants) { this.transitionToNextLevel(); d.isLevelProgressionDoor = false; }
      }
    }
  }

  private updateProgressTriggers(): void {
    if (!this.player || !this.progress.goalReached) return;
    const b = this.player.boundingBox();
    for (const t of this.progressTriggers) {
      const r = t.rect;
      if (!t.expired && r.minX <= b.maxX && r.maxX >= b.minX && r.minY <= b.maxY && r.maxY >= b.minY) { t.expired = true; this.transitionToNextLevel(); }
    }
  }

  private transitioning = false;
  /** LevelProgressSystem.TransitionToNextLevel */
  transitionToNextLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    const w = this.player?.hasWeaponEquipped ? this.player.equipped! : null;
    this.hooks.nextLevel(w ? { key: w.key, ammo: w.remainingRounds, infinite: w.infiniteAmmo } : null);
  }

  /** LevelProgressSystem.Update / CheckGoalReached */
  private updateProgress(dt: number): void {
    const p = this.player;
    if (!p || p.removed) return;
    if (!(p.isAlive && !p.player!.isDoingDyingSequence)) return;
    if (this.characters.some((c) => c.needsToDie && c.isAlive)) return;
    switch (this.level.progressionType) {
      case 'BodyCount': if (this.progress.bodyCount.current >= this.progress.bodyCount.target) this.forceReachGoal(); break;
      case 'Time': this.progress.timed += dt; if (this.progress.timed >= this.level.timeLimitInSeconds) this.forceReachGoal(); break;
      case 'Always': this.forceReachGoal(); break;
      default: break;
    }
  }
  forceReachGoal(): void {
    if (!this.progress.goalReached) this.audio.play('sounds/proceed.wav');
    this.progress.goalReached = true;
    const d = this.doors.find((x) => x.isLevelProgressionDoor);
    if (d) this.openDoor(d);
  }

  // EnemySpawningSystem
  private liveEnemyCount(): number {
    const p = this.player;
    if (!p) return 0;
    return this.characters.filter((c) => c.isAlive && !c.isPlayer && c.faction.isEnemiesWith(p.faction)).length;
  }
  private maxEnemyCount(live: number): number {
    if (this.level.progressionType === 'BodyCount') return Math.min(this.spawner.maxEnemyCount, this.progress.bodyCount.target - this.progress.bodyCount.current - live);
    return this.spawner.maxEnemyCount;
  }
  private updateSpawning(dt: number): void {
    const sp = this.spawner;
    if (!sp.enabled) return;
    let live = this.liveEnemyCount();
    const max = this.maxEnemyCount(live);
    live += this.doors.filter((d) => d.isOpen || d.busy).length;
    if (!(live - max - 1 < -1)) return;
    const p = this.player;
    if (this.clock.sinceSceneChange > 1) sp.spawnTimer += dt;
    if (!this.progress.goalReached && this.autoSpawn && sp.spawnTimer > sp.interval && (!p || p.isAlive)) {
      const { point, isDoor } = this.randomSpawnPoint();
      sp.spawnTimer = randomFloat(-1, 1);
      if (sp.spawnInstructions.length === 0) return;
      if (isDoor) {
        const door = this.doorNearest(point);
        if (door && !door.isOpen && !door.busy) {
          const m = this.maxEnemyCount(live);
          const amount = m === 0 ? 0 : randomInt(1, Math.min(m, 3));
          if (amount > 0) this.doorSpawn(amount, door, point);
        }
      } else this.spawnEnemy(pickRandom(sp.spawnInstructions), point, null);
    }
  }
  private doorSpawn(amount: number, door: Door, point: Vec2): void {
    const wasPortal = door.isPortal;
    door.isPortal = false;
    this.openDoor(door);
    let t = 0.4 * 1.5;
    for (let i = 0; i < amount; i++) {
      this.delay(t, () => this.spawnEnemy(pickRandom(this.spawner.spawnInstructions), point, door));
      if (amount > 1) t += randomFloat(0.1, 0.4);
    }
    this.delay(t + 0.4 * 0.5, () => { this.closeDoor(door); door.isPortal = wasPortal; });
  }
  private spawnEnemy(instr: { statsKey: string; lookKey: string; factionKey: string }, spawnPoint: Vec2, door: Door | null): void {
    const floorPos = v2(spawnPoint.x, floorLevelAt(this.level, spawnPoint.x));
    const sp = this.spawner;
    let c: Character;
    if (randomFloat() > sp.weaponChance) c = this.createEnemy(spawnPoint, instr.statsKey, instr.lookKey, instr.factionKey);
    else {
      const key = sp.weapons.length ? sp.weapons[randomInt(0, sp.weapons.length)] : null;
      c = this.createEnemyWithWeapon(spawnPoint, key ? this.reg.weapons.get(key) ?? null : null, instr.statsKey, instr.lookKey, instr.factionKey);
    }
    const off = getFloorOffset(c.positioning.scale);
    const onFloor = v2(floorPos.x, floorPos.y + off);
    const final = door ? v2(spawnPoint.x, spawnPoint.y + off) : spawnPoint;
    c.positioning.globalCenter = { ...onFloor };
    c.positioning.globalTarget = v2(onFloor.x, 0);
    if (spawnPoint.y - onFloor.y > 1000) c.playAnimation(this.reg.anim('spawn_jump'));
    else if (door) {
      c.tint = [0, 0, 0];
      const dir = { ...door.facing };
      dir.x = nanFallback(dir.x);
      if (dir.y < 0) c.exitDoor = { start: final, end: onFloor, duration: 0.3, time: 0, isVertical: true };
      else if (Math.abs(dir.x) >= 0.01) {
        c.positioning.isFlipped = dir.x < 0;
        const speed = randomFloat(150, 350);
        c.exitDoor = { start: onFloor, end: add(onFloor, v2(dir.x * speed, 0)), duration: 0.2, time: 0, isVertical: false };
      }
    }
  }
  private doorNearest(p: Vec2): Door | null {
    let min = Number.MAX_VALUE;
    let n: Door | null = null;
    for (const d of this.doors) {
      if (!d.enemySpawner) continue;
      const ds = distSq(d.spawnPoint, p);
      if (ds < min) { min = ds; n = d; if (ds <= 1.401298464324817e-45) return n; }
    }
    return n;
  }
  private randomSpawnPoint(): { point: Vec2; isDoor: boolean } {
    const pts = this.spawner.spawnPoints;
    const doors = this.spawner.doors;
    const hasPts = pts.length > 0;
    const hasDoors = doors.some((d) => d.enemySpawner);
    if (!hasPts && !hasDoors) return { point: v2(), isDoor: false };
    if (hasPts && !hasDoors) return { point: pickRandom(pts), isDoor: false };
    if (!hasPts && hasDoors) return { point: pickRandom(doors).spawnPoint, isDoor: true };
    const ratio = doors.length / (pts.length + doors.length);
    if (randomFloat() < ratio) return { point: pickRandom(doors).spawnPoint, isDoor: true };
    return { point: pickRandom(pts), isDoor: false };
  }

  /** CameraMovementSystem with the PlayerTarget, CameraShakeSystem */
  private updateCamera(dt: number, realDt: number): void {
    const cam = this.camera;
    const p = this.player;
    const b = { ...this.level.levelBounds };
    b.minX -= 100; b.maxX += 100;
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    let ortho = this.level.fullZoom ? Math.max(bw / cam.viewW, bh / cam.viewH) : Math.min(bw / cam.viewW, bh / cam.viewH);
    let pos = cam.position;
    if (p && p.isAlive) {
      const target = { ...p.positioning.globalCenter };
      const w = cam.viewW * ortho;
      const h = cam.viewH * ortho;
      const coord = (v: number, lo: number, hi: number, size: number): number => {
        const mn = lo + size * 0.5;
        const mx = hi - size * 0.5;
        return mn >= mx ? (lo + hi) * 0.5 : clamp(v, mn, mx);
      };
      target.x = coord(target.x, b.minX, b.maxX, w);
      target.y = coord(target.y, b.minY, b.maxY, h);
      pos = cam.initialised ? smoothApproachV(pos, target, 5, dt) : target;
      cam.initialised = true;
    }
    if (this.deathSequence && p) {
      const t = Easings.cubicInOut(clamp(this.deathSequence.time / 6));
      const bp = mul(add(p.positioning.body.transform.position, p.positioning.head.transform.position), 0.5);
      pos = v2(lerp(pos.x, bp.x, t), lerp(pos.y, bp.y, t));
      ortho = ortho * Math.exp(t * Math.log(1 / ortho));
    }
    cam.position = pos;
    cam.ortho = ortho;
    cam.shakeOffset = cam.shake * Math.sin(this.clock.time * 70) * 0.3 * this.screenshake;
    cam.shake = smoothApproach(cam.shake, 0, 4, realDt);
  }

  private updateEffects(dt: number): void {
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const e = this.fx[i];
      e.time += dt;
      if (e.time >= e.duration) this.fx.splice(i, 1);
    }
    for (let i = this.tracers.length - 1; i >= 0; i--) { this.tracers[i].life -= dt; if (this.tracers[i].life < 0) this.tracers.splice(i, 1); }
    for (let i = this.casings.length - 1; i >= 0; i--) {
      const c = this.casings[i];
      c.life -= dt;
      if (c.life <= 0) { this.casings.splice(i, 1); continue; }
      if (c.resting) continue;
      c.vel.y -= 9000 * dt;
      const next = add(c.pos, mul(c.vel, dt));
      const floor = floorLevelAt(this.level, next.x);
      const hit = this.physics.queryPoint(next, Layers.BlockPhysics).length > 0;
      if (next.y < floor || hit) {
        if (Math.abs(c.vel.y) > 300 && c.sounds.length) this.audio.play(pickRandom(c.sounds), 0.3);
        c.vel = v2(c.vel.x * 0.4, Math.abs(c.vel.y) * 0.3);
        c.rotVel *= 0.5;
        if (Math.abs(c.vel.y) < 100) { c.resting = true; c.pos.y = Math.max(c.pos.y, floor); }
      } else c.pos = next;
      c.rot += c.rotVel * dt;
    }
  }

  /** DespawnSystem for weapons */
  private updateDespawn(dt: number): void {
    for (const w of [...this.weapons]) {
      if (w.wielder) { w.despawnTimer = 0; continue; }
      w.despawnTimer += dt;
      if (w.despawnTimer > w.despawnTime) this.removeWeapon(w);
    }
    if (this.weapons.length > 64) {
      const idle = this.weapons.filter((w) => !w.wielder);
      if (idle.length) this.removeWeapon(idle[0]);
    }
  }

}

function mulMat(a: import('../engine/matrix.ts').Mat, b: import('../engine/matrix.ts').Mat): import('../engine/matrix.ts').Mat {
  return [
    a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

declare module './character.ts' {
  interface Character { feetOffsets?: Vec2[] }
}
export { dist, rectCenter };
