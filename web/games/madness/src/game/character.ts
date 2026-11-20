// Madness Interactive Reloaded port (GPL-3.0). A character as MIR builds it (Prefabs.CreateCharacter):
// Character/Components/CharacterComponent.cs, CharacterPositioning.cs, CharacterConstants.cs, Animation/AnimatedLimb.cs
// and its subclasses, BodyPartComponent.cs, ImpactOffsetComponent.cs; the ECS entities become fields.
import { ActiveAnimation, AC, HandLook, type CharacterAnimation } from '../data/animation.ts';
import type { CharacterLook, CharacterStats, Faction, ArmourPiece, WeaponInstructions } from '../data/registry.ts';
import { Transform } from '../engine/matrix.ts';
import type { Body } from '../engine/physics.ts';
import { randomFloat, randomInt, v2, type Vec2, nanFallbackV, normalize, sub } from '../engine/util.ts';
import type { Mat } from '../engine/matrix.ts';

export const HalfHeight = 200;
export const HandHeight = 183;
export const getFloorOffset = (scale: number): number => HalfHeight * scale + 14;
export const HeadOffsetRelativeToBody = v2(0.3 - 0.35, 0.6 - 0.22);
export const HeadRotationPivot = v2(-0.2, -0.3);
export const BodyRotationPivot = v2(0, -0.5);
export const HandOffset1 = v2(-105.09, 26.76);
export const HandOffset2 = v2(160.63, 39.61);
export const IronsightOffset = v2(-25, 50);
export const AccurateShotWarningDuration = 2;
export const AccurateShotCooldown = 5;
export const MaxHandRange = 280;
export const DodgeRegenerationCooldown = 0.8;
export const RenderOrders = { HeadBaseOrder: 3000, BodyBaseOrder: 2000, FootBaseOrder: 1000, HeadDecorOrder: 3100, BodyDecorOrder: 2100, MainHandOrder: 4000, OtherHandOrder: -100 };
/** Graphics/RenderOrders.cs layers */
export const Layer = { BackgroundBehind: -100, Default: 0, RagdollsLower: 1, RagdollsUpper: 20, CharacterLower: 20, CharacterUpper: 199, Effects: 200, BackgroundInFront: 300, PlayerRagdoll: 302, UserInterface: 350 };

export const CharacterFlags = {
  None: 0, Invincible: 1, NoRagdoll: 2, AttackResponseThrownProjectile: 4, AttackResponseMelee: 8, AttackResponseBullet: 16,
  StunAnimationOnNonFatalAttack: 32, DeleteRagdoll: 64, Default: 4 | 8 | 64 | 16 | 32,
};

export const HandPositionMode = { None: 0, OneHand: 1, TwoHands: 2 } as const;
export type HandPositionMode = number;

/** a QuadShapeComponent on the limb's entity */
export interface Renderer {
  texture: string;
  hflip: boolean;
  vflip: boolean;
  layer: number;
  order: number;
  tint: [number, number, number];
  visible: boolean;
  /** QuadShapeComponent.AdditionalTransform */
  additional: Mat | null;
}
const renderer = (texture: string, layer: number, order: number): Renderer =>
  ({ texture, hflip: false, vflip: false, layer, order, tint: [1, 1, 1], visible: true, additional: null });

export class ImpactOffset { translation = v2(); rotation = 0; decaySpeed = 12; }

export class AnimatedLimb {
  readonly transform = new Transform();
  globalPosition = v2();
  globalRotation = 0;
  animationPosition = v2();
  animationAngle = 0;
  scale = v2(1, 1);
  animationScale = v2(1, 1);
  renderer: Renderer;
  constructor(renderer: Renderer) { this.renderer = renderer; }
  get unscaled(): boolean { return Math.abs(1 - this.animationScale.x) < 0.001 && Math.abs(1 - this.animationScale.y) < 0.001; }
}

/** BodyPartComponent with its physics body, impact offset and measured velocity */
export class BodyPart extends AnimatedLimb {
  health = 5;
  maxHealth = 5;
  readonly impact = new ImpactOffset();
  body!: Body;
  velocity = v2();
  prevPosition = v2();
  colliderSize = 1;
  readonly character: Character;
  readonly isHead: boolean;
  constructor(r: Renderer, character: Character, isHead: boolean) { super(r); this.character = character; this.isHead = isHead; }
  damage(d: number): void { this.health = Math.min(this.health - d, this.maxHealth); }
}

export class HeadLimb extends BodyPart { direction = v2(); lookOffset = v2(); bobOffset = v2(); }
export class BodyLimb extends BodyPart { computedVisualCenter = v2(); initialOffset = v2(); }
export class HandLimb extends AnimatedLimb {
  isLeftHand = false;
  look: HandLook = HandLook.Fist;
  shouldFollowRecoil = false;
  animatedHandLook: HandLook | null = null;
  previousAnimatedPosition = v2();
  previousAnimatedAngle = 0;
  posePosition = v2();
  poseRotation = 0;
  apparentLayer = 0;
  apparentOrder = 0;
  initialOffset = v2();
  velocity = v2();
  prevPosition = v2();
}
export class FootLimb {
  readonly transform = new Transform();
  globalPosition = v2();
  offset = v2();
  initialOffset = v2();
  renderer: Renderer;
  constructor(renderer: Renderer) { this.renderer = renderer; }
}
/** an apparel sprite constrained to the head or body (TransformConstraintComponent) */
export class Decoration {
  readonly transform = new Transform();
  piece: ArmourPiece | null = null;
  positionOffset = v2();
  ejected = false;
  renderer: Renderer;
  constructor(renderer: Renderer) { this.renderer = renderer; }
}

export class CharacterPositioning {
  globalCenter: Vec2;
  globalTarget: Vec2;
  isFlipped = false;
  currentRecoil = 0;
  smoothRecoil = 0;
  randomHeightOffset = randomFloat(-25, 5);
  noiseOffset = randomFloat(-1000, 1000);
  get flipScaling(): number { return this.isFlipped ? -1 : 1; }
  topWalkSpeed = 500;
  hopStartingPosition = -1;
  nextHopPosition = 0;
  hopAnimationTimer = -1;
  hopAnimationDuration = 0.33;
  hopTargetHeight = 10;
  currentHoppingHeight = 0;
  hopAcceleration = 1;
  get isBusyHopping(): boolean { return this.hopAnimationTimer >= 0; }
  tiltIntensity = 0;
  flyingOffset = 0;
  get isFlying(): boolean { return this.flyingOffset > 1.401298464324817e-45; }
  flyingVelocity = 0;
  flyingAnimationOffset = 0;
  lookOffsetSpeed = 15;
  lookDirectionSpeed = 20;
  handPositionMode: HandPositionMode = HandPositionMode.None;
  ironSightProgress = 0;
  meleeBlockProgress = 0;
  handMousePosition = v2();
  recoilPositionOffset = v2();
  recoilAngleOffset = 0;
  secondaryHandFollowsPrimary = false;
  handPoseFunctionOverride: ((c: Character) => void)[] = [];
  meleeBlockImpactIntensity = 0;
  smoothedMeleeBlockImpactIntensity = 0;
  shouldFeetFollowBody = true;
  readonly headDecorations: Decoration[] = [];
  readonly bodyDecorations: Decoration[] = [];
  readonly scale: number;
  readonly head: HeadLimb;
  readonly body: BodyLimb;
  readonly hands: [HandLimb, HandLimb];
  readonly feet: [FootLimb, FootLimb];
  constructor(scale: number, center: Vec2, head: HeadLimb, body: BodyLimb, hands: [HandLimb, HandLimb], feet: [FootLimb, FootLimb]) {
    this.scale = scale; this.head = head; this.body = body; this.hands = hands; this.feet = feet;
    this.globalCenter = v2(center.x, center.y);
    this.globalTarget = v2(center.x, center.y);
    body.initialOffset = sub(body.globalPosition, center);
    for (const f of feet) f.initialOffset = sub(f.globalPosition, center);
    for (const h of hands) h.initialOffset = sub(h.globalPosition, center);
  }
}

export interface Weapon {
  instr: WeaponInstructions;
  data: WeaponInstructions['data'];
  key: string;
  readonly transform: Transform;
  /** the base sprite, a child of transform with the texture's size */
  readonly sprite: Transform;
  holdPoints: Vec2[];
  barrelEndPoint: Vec2;
  casingEjectionPoint: Vec2;
  wielder: Character | null;
  isAttachedToWall: boolean;
  remainingRounds: number;
  isFiring: boolean;
  isFlipped: boolean;
  isBusyBurstFiring: boolean;
  timer: number;
  hasBeenPumped: boolean;
  infiniteAmmo: boolean;
  layer: number;
  order: number;
  textureWidth: number;
  /** VelocityComponent */
  velocity: Vec2;
  rotationalVelocity: number;
  onFloor: boolean;
  /** MeasuredVelocityComponent */
  measured: Vec2;
  measuredRotation: number;
  prevPosition: Vec2;
  prevRotation: number;
  /** DespawnComponent: despawns after this many seconds lying around */
  despawnTime: number;
  despawnTimer: number;
  /** ThrowableProjectileComponent */
  thrown: { damage: number; heavy: boolean; thrower: Character | null; hitLayer: number } | null;
  stuckInside: { parent: Transform; localOffset: Vec2; localRotation: number } | null;
  /** the animated parts (slide, pump): textures and their curves */
  parts: { transform: Transform; texture: string; playing: boolean; time: number; visible: boolean }[];
  removed: boolean;
}
export const hasRoundsLeft = (w: Weapon): boolean => w.infiniteAmmo || w.remainingRounds > 0;

export interface AiState {
  seed: number;
  isDocile: boolean;
  hasKillTarget: boolean;
  killTarget: Character | null;
  tooBusyToAttack: boolean;
  hasItemTarget: boolean;
  itemTarget: Weapon | null;
  wantsToPickupWeapon: boolean;
  waitsForAttackTurn: boolean;
  aimingPosition: Vec2;
  wants: Record<'ironSight' | 'interact' | 'shoot' | 'accurateShot' | 'reload' | 'walkLeft' | 'walkRight', { value: boolean; prev: boolean }>;
  panicLevel: number;
  attackModeDuration: number;
  wanderTargetPosition: number;
  wanderTargetRemainingTime: number;
  isDoingAccurateShot: boolean;
  allowPickup: boolean;
}
export function newAi(): AiState {
  const b = () => ({ value: false, prev: false });
  return {
    seed: randomFloat(-500, 500), isDocile: false, hasKillTarget: false, killTarget: null, tooBusyToAttack: false,
    hasItemTarget: false, itemTarget: null, wantsToPickupWeapon: true, waitsForAttackTurn: true, aimingPosition: v2(),
    wants: { ironSight: b(), interact: b(), shoot: b(), accurateShot: b(), reload: b(), walkLeft: b(), walkRight: b() },
    panicLevel: 0, attackModeDuration: 0, wanderTargetPosition: 0, wanderTargetRemainingTime: 0, isDoingAccurateShot: false, allowPickup: true,
  };
}

export class Character {
  isAlive = true;
  hasBeenRagdolled = false;
  allowWalking = true;
  flags = CharacterFlags.Default;
  aimTargetPosition = v2();
  relativeAimTargetPosition = v2();
  walkAcceleration = v2();
  aimOrigin = v2();
  dodgeMeter = 1;
  dodgeRegenCooldownTimer = 0;
  isMeleeBlocking = false;
  isIronSighting = false;
  currentAttackerCount = 0;
  attacksCannotBeAutoDodged = false;
  equipped: Weapon | null = null;
  handPickupRange = 400;
  needsLookUpdate = true;
  readonly animations: ActiveAnimation[] = [];
  animationFlipFlop = 0;
  animationMixDuration = 0.3125;
  animationMixProgress = 0;
  animationTransitionFactor = 0;
  animationTransitionFactorEased = 0;
  tint: [number, number, number] = [1, 1, 1];
  enableAnimationClock = true;
  deflectionLine = { a: v2(), b: v2() };
  additionalConstraints = 0;
  readonly onDeath: ((c: Character) => void)[] = [];
  readonly attackIgnore = new Set<unknown>();
  /** LifetimeComponent */
  lifetime = 0;
  /** components the original attaches to the entity */
  ai: AiState | null = null;
  isPlayer = false;
  player: { respondToUserInput: boolean; isDoingDyingSequence: boolean } | null = null;
  jumpDodge: { animation: CharacterAnimation; initialAcceleration: Vec2; time: number; duration: number; shouldDash: boolean } | null = null;
  pickup: { time: number; duration: number; pickupTime: number; target: Weapon; initialTargetRotation: number; last: Vec2; started: boolean } | null = null;
  melee: { keys: import('../data/registry.ts').MeleeSequenceKey[]; currentIndex: number; isComplete: boolean; canContinue: boolean; speed: number; hitframesSpent: number; animationTimer: number; lastAnim: ActiveAnimation | null } | null = null;
  exitDoor: { duration: number; start: Vec2; end: Vec2; time: number; isVertical: boolean } | null = null;
  needsToDie = false;
  abilities: import('./abilities.ts').Ability[] = [];
  ragdoll: import('./ragdoll.ts').Ragdoll | null = null;
  removed = false;
  /** RenderOrder layer of the whole character */
  layer: number;

  name: string;
  readonly positioning: CharacterPositioning;
  stats: CharacterStats;
  look: CharacterLook;
  faction: Faction;
  constructor(name: string, positioning: CharacterPositioning, stats: CharacterStats, look: CharacterLook, faction: Faction, layer: number) {
    this.name = name; this.positioning = positioning; this.stats = stats; this.look = look; this.faction = faction;
    this.layer = layer;
  }
  get collisionLayer(): number { return this.faction.collisionLayer; }
  get enemyCollisionLayer(): number { return this.faction.attackHitLayerComposite; }
  get aimDirection(): Vec2 { return nanFallbackV(normalize(sub(this.aimTargetPosition, this.aimOrigin))); }
  get hasWeaponEquipped(): boolean { return this.equipped !== null && !this.equipped.removed; }
  get mainAnimation(): ActiveAnimation | null { return this.animations.length ? this.animations[this.animations.length - 1] : null; }
  get isPlayingAnimation(): boolean { return this.animations.length !== 0; }
  hasFlag(f: number): boolean { return (this.flags & f) === f; }
  isDeflectingBullets(): boolean { return this.isMeleeBlocking && this.stats.canDeflect && !!this.equipped && this.equipped.data.canDeflectBullets; }
  hasDodge(): boolean { return Math.trunc(this.dodgeMeter * 100) >= 1; }
  isLowOnDodge(threshold = 0.5): boolean { return this.stats.dodgeAbility <= 1.401298464324817e-45 ? false : this.dodgeMeter / this.stats.dodgeAbility < threshold; }
  drainDodge(drain: number): void {
    this.dodgeMeter -= drain;
    if (this.dodgeMeter < 0) this.dodgeMeter = 0;
    this.dodgeRegenCooldownTimer = DodgeRegenerationCooldown;
  }
  kill(): void {
    if (this.isAlive) {
      const listeners = [...this.onDeath];
      this.onDeath.length = 0;
      for (const l of listeners) l(this);
    }
    this.isAlive = false;
  }
  getWeaponBarrelDistance(): number {
    const w = this.equipped;
    if (!w) return 0;
    if (w.data.weaponType === 'Melee') return 0;
    return w.textureWidth;
  }
  hasWeaponOfType(t: 'Firearm' | 'Melee'): boolean { return !!this.equipped && this.equipped.data.weaponType === t; }

  // AnimatedCharacterExtensions
  getAnimationConstraints(): number {
    let f = AC.AllowAll;
    for (const item of this.animations) {
      const cons = item.animation.constraints;
      for (let i = 0; i < cons.length; i++) {
        const next = i + 1 === cons.length ? null : cons[i + 1];
        if (item.unscaledTimer >= cons[i].time && (!next || item.unscaledTimer < next.time)) { f = (f | cons[i].constraints) >>> 0; break; }
      }
    }
    return (f | this.additionalConstraints) >>> 0;
  }
  constrainsAny(mask: number): boolean { return ((this.getAnimationConstraints() & mask) >>> 0) !== 0; }
  constrainsAll(mask: number): boolean { return ((this.getAnimationConstraints() & mask) >>> 0) === (mask >>> 0); }
  isPlayingAnimationGroup(group: string): boolean {
    const g = group.toLowerCase();
    return this.animations.some((a) => a.animation.group.toLowerCase() === g);
  }
  isPlayingAnimationExact(anim: CharacterAnimation): boolean { return this.animations.some((a) => a.animation === anim); }
  playAnimation(anim: CharacterAnimation, speed = 1): ActiveAnimation {
    this.resetAnimation();
    this.animationMixProgress = 0;
    const a = new ActiveAnimation(anim, speed);
    this.animations.push(a);
    return a;
  }
  stopAllAnimations(): void { this.animations.length = 0; this.resetAnimation(); }
  resetAnimation(): void {
    const p = this.positioning;
    p.head.animationAngle = 0;
    p.head.animationPosition = v2();
    p.body.animationAngle = 0;
    p.body.animationPosition = v2();
    for (const h of p.hands) { h.animationAngle = 0; h.animationPosition = v2(); h.animatedHandLook = null; }
  }
  isHeadAnimated(): boolean { return this.mainAnimation?.animation.head != null; }
  isBodyAnimated(): boolean { return this.mainAnimation?.animation.body != null; }
  isHandAnimated(hand: HandLimb): boolean {
    if (!this.isPlayingAnimation) return false;
    const anim = this.mainAnimation!.animation;
    if (!anim.hands) return false;
    const i = hand.isLeftHand ? 1 : 0;
    const idx = this.positioning.isFlipped ? this.positioning.hands.length - 1 - i : i;
    return anim.hands.length - 1 >= idx;
  }
  /** the character's bounding box: head and body quads */
  boundingBox(): { minX: number; minY: number; maxX: number; maxY: number } {
    const r = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const t of [this.positioning.head.transform, this.positioning.body.transform]) {
      const m = t.localToWorld;
      for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) {
        const px = x * m[0] + y * m[2] + m[4];
        const py = x * m[1] + y * m[3] + m[5];
        r.minX = Math.min(r.minX, px); r.maxX = Math.max(r.maxX, px);
        r.minY = Math.min(r.minY, py); r.maxY = Math.max(r.maxY, py);
      }
    }
    return r;
  }
}

/** Prefabs.CreateCharacter, without the scene: the caller registers bodies and keeps the character */
export function buildCharacter(p: {
  name: string; bottom: Vec2; faction: Faction; look: CharacterLook; stats: CharacterStats; scaleOverride?: number;
  textureSize: (path: string) => { w: number; h: number };
}): Character {
  const scale = p.scaleOverride ?? p.stats.scale;
  const layer = randomInt(Layer.CharacterLower, Layer.CharacterUpper) + 1;
  const body = new BodyLimb(renderer(p.look.body.right, layer, 0), null as unknown as Character, false);
  const head = new HeadLimb(renderer(p.look.head.right, layer, 1), null as unknown as Character, true);
  head.colliderSize = 0.8;
  const bs = p.textureSize(p.look.body.right);
  const hs = p.textureSize(p.look.head.right);
  body.transform.scale = v2(bs.w * scale * p.look.body.textureScale, bs.h * scale * p.look.body.textureScale);
  head.transform.scale = v2(hs.w * scale * p.look.head.textureScale, hs.h * scale * p.look.head.textureScale);
  head.transform.localPivot = v2(HeadRotationPivot.x * scale, HeadRotationPivot.y * scale);
  body.transform.localPivot = v2(BodyRotationPivot.x * scale, BodyRotationPivot.y * scale);
  body.transform.position = v2(p.bottom.x, p.bottom.y);
  body.transform.recalc();
  const hp = HeadOffsetRelativeToBody;
  const m = body.transform.localToWorld;
  head.transform.position = v2(hp.x * scale * m[0] + hp.y * scale * m[2] + m[4], hp.x * scale * m[1] + hp.y * scale * m[3] + m[5]);
  head.transform.recalc();
  body.globalPosition = v2(body.transform.position.x, body.transform.position.y);
  head.globalPosition = v2(head.transform.position.x, head.transform.position.y);
  body.maxHealth = body.health = p.stats.bodyHealth;
  head.maxHealth = head.health = p.stats.headHealth;
  const bodyCenter = v2(p.bottom.x, p.bottom.y + HalfHeight * scale);
  const hand1 = new HandLimb(renderer('textures/bodies/default/hand_fist.png', layer, 1));
  const hand2 = new HandLimb(renderer('textures/bodies/default/hand_fist_back.png', layer, -1));
  hand1.globalPosition = v2(bodyCenter.x + HandOffset1.x * scale, bodyCenter.y + HandOffset1.y * scale);
  hand2.globalPosition = v2(bodyCenter.x + HandOffset2.x * scale, bodyCenter.y + HandOffset2.y * scale);
  hand2.isLeftHand = true;
  const footTex = p.look.feet ?? 'textures/bodies/default/foot.png';
  const foot1 = new FootLimb(renderer(footTex, layer, -2));
  const foot2 = new FootLimb(renderer(footTex, layer, -1));
  foot1.globalPosition = v2(p.bottom.x + 40 * scale, p.bottom.y + 10 * scale);
  foot2.globalPosition = v2(p.bottom.x - 30 * scale, p.bottom.y - 6 * scale);
  const pos = new CharacterPositioning(scale, bodyCenter, head, body, [hand1, hand2], [foot1, foot2]);
  pos.hopAnimationDuration = p.stats.walkHopDuration;
  const c = new Character(p.name, pos, p.stats, p.look, p.faction, layer);
  (body as { character: Character }).character = c;
  (head as { character: Character }).character = c;
  c.attackIgnore.add(body);
  c.attackIgnore.add(head);
  for (let i = 0; i < 3; i++) {
    const d = new Decoration(renderer('', layer, 2));
    d.piece = p.look.headLayers[i];
    pos.headDecorations.push(d);
  }
  for (let i = 0; i < 2; i++) {
    const d = new Decoration(renderer('', layer, 0));
    d.piece = p.look.bodyLayers[i];
    pos.bodyDecorations.push(d);
  }
  return c;
}
