// Madness Interactive Reloaded port (GPL-3.0). Abilities and improbability disks: Character/Components/Abilities/*
// (CharacterAbilityComponent, NoStun, NoWaitForAttackTurn, NoWeapons, Flying, TeleportDash, HolyShield, Telekinesis,
// RichBoss), Character/Systems/CharacterAbilitySystem.cs, Level/Systems/RichBossSystem.cs with RichCharacterComponent.cs,
// Improbability/ImprobabilityDisks.cs and Improbability/Disks/*.cs.
import { HandLook } from '../data/animation.ts';
import { AgilitySkillLevel, CharacterStats, floorLevelAt } from '../data/registry.ts';
import { rotation, scaling, mmul, translation, type Mat } from '../engine/matrix.ts';
import { noiseValue } from '../engine/noise.ts';
import { Layers } from '../engine/physics.ts';
import {
  add, clamp, deltaAngle, dist, Easings, lerp, lerpAngle, lerpV, mapRange, mul, normalize, pickRandom, randomFloat, randomPointInCircle, reflect, smoothApproach,
  smoothApproachV, snap, sub, v2, vectorToAngle, len, type Vec2,
} from '../engine/util.ts';
import { CharacterFlags, getFloorOffset, HalfHeight, hasRoundsLeft, type BodyPart, type Character, type Weapon } from './character.ts';
import { castBulletRay, shootWeapon, SOUNDS, tryThrowWeapon } from './combat.ts';
import type { Scene } from './scene.ts';
import type { DrawItem } from './extras.ts';
import { AC } from '../data/animation.ts';

/** AbilitySlot: None, Ability1..4 (Left Shift, Q, Left Ctrl, R) */
export type Slot = 0 | 1 | 2 | 3 | 4;
export type Behaviour = 'Hold' | 'Toggle' | 'Always';

export abstract class Ability {
  isUsing = false;
  initialised = false;
  abstract readonly name: string;
  readonly slot: Slot;
  readonly behaviour: Behaviour;
  constructor(slot: Slot, behaviour: Behaviour) { this.slot = slot; this.behaviour = behaviour; }
  initialise(_s: Scene, _c: Character): void { /* nothing */ }
  start(_s: Scene, _c: Character): void { /* nothing */ }
  update(_s: Scene, _c: Character): void { /* nothing */ }
  fixed(_s: Scene, _c: Character, _dt: number): void { /* nothing */ }
  end(_s: Scene, _c: Character): void { /* nothing */ }
  constraints(): number { return 0; }
}

class NoStun extends Ability {
  name = 'No stun';
  constructor() { super(0, 'Toggle'); }
  initialise(_s: Scene, c: Character): void { c.flags &= ~CharacterFlags.StunAnimationOnNonFatalAttack; }
}
class NoWaitForAttackTurn extends Ability {
  name = 'No wait for attack turn';
  constructor() { super(0, 'Toggle'); }
  initialise(_s: Scene, c: Character): void { if (c.ai) c.ai.waitsForAttackTurn = false; }
}
class NoWeapons extends Ability {
  name = 'No weapons allowed';
  constructor() { super(0, 'Toggle'); }
  initialise(_s: Scene, c: Character): void { if (c.ai) c.ai.allowPickup = false; }
  update(s: Scene, c: Character): void {
    if (c.hasWeaponEquipped) {
      if (randomFloat() > 0.5) tryThrowWeapon(s, c);
      else if (!c.constrainsAny(AC.PreventThrowing)) s.dropWeapon(c);
    }
  }
}

class Flying extends Ability {
  name = 'Flying';
  private progress = 0;
  private wasFlying = false;
  constructor(slot: Slot) { super(slot, 'Toggle'); }
  update(s: Scene, c: Character): void {
    const dt = s.clock.dt;
    this.progress = clamp(this.progress + (this.isUsing ? 1 : -1) * dt / 0.4, 0, 1);
    const anim = Easings.cubicOut(this.progress);
    const sn = Math.sin(s.clock.time * 4) * Math.abs(c.positioning.flyingVelocity * 0.002);
    let target = mapRange(-1, 1, 500, 600, sn);
    const hit = s.physics.raycast(c.positioning.globalCenter, v2(0, 1), Number.MAX_VALUE, Layers.BlockMovement | Layers.BlockPhysics);
    if (hit) target = Math.min(target, hit.distance - HalfHeight * c.positioning.scale);
    c.positioning.flyingOffset = lerp(0, target, anim);
    if (this.wasFlying && !c.positioning.isFlying) s.audio.play(pickRandom(SOUNDS.softBodyImpact), 0.5, randomFloat(0.9, 1.1));
    this.wasFlying = c.positioning.isFlying;
  }
}

class TeleportDash extends Ability {
  name = 'Teleport';
  private flipFlop = false;
  private routine = false;
  distance = 1500;
  constructor(slot: Slot) { super(slot, 'Hold'); }
  constraints(): number { return this.routine ? (AC.PreventDying | AC.PreventAllMovement) >>> 0 : 0; }
  start(_s: Scene, c: Character): void { setAll(c, null); }
  end(_s: Scene, c: Character): void { setAll(c, null); }
  update(s: Scene, c: Character): void {
    if (!this.isUsing || c.isPlayingAnimation) { this.flipFlop = false; return; }
    const level = s.level;
    if (this.routine) return;
    if (this.flipFlop && Math.abs(c.walkAcceleration.x) < 100) this.flipFlop = false;
    else if (!this.flipFlop && Math.abs(c.walkAcceleration.x) > 10) {
      this.flipFlop = true;
      const sign = Math.sign(c.walkAcceleration.x);
      const p = c.positioning;
      c.dodgeMeter = c.stats.dodgeAbility;
      this.routine = true;
      this.distance = Math.abs((c.aimTargetPosition.x - p.globalCenter.x) * 0.9);
      if (this.distance < 500) this.distance = 1500;
      const b = c.boundingBox();
      s.audio.play('sounds/tricky_teleport.wav', 0.9, randomFloat(0.9, 1.1));
      const start = { ...p.globalCenter };
      const initial = { ...start };
      const fl = level.floorLine;
      const endX = clamp(start.x + this.distance * sign, fl[0].x, fl[fl.length - 1].x);
      const end = v2(endX, floorLevelAt(level, endX) + getFloorOffset(p.scale));
      const duration = clamp(this.distance / 30000, 0.05, 0.1);
      let t = 0;
      s.routineFor(duration + 1, () => {
        if (!this.routine) return;
        t += s.clock.dt;
        const progress = t / duration;
        p.globalCenter = v2(lerp(start.x, end.x, progress), lerp(start.y, end.y, progress));
        p.globalTarget = { ...p.globalCenter };
        p.hopStartingPosition = p.nextHopPosition = p.globalCenter.x;
        p.hopAnimationTimer = 0;
        const pivot = sign > 0 ? v2(b.maxX + p.globalCenter.x - initial.x, b.minY) : v2(b.minX + p.globalCenter.x - initial.x, b.minY);
        setAll(c, scaling((1 - Math.abs(progress - 0.5) * 2) * Math.abs(start.x - end.x) * 0.5 / (b.maxX - b.minX) + 1, 1, pivot));
        if (t > duration) { setAll(c, null); this.routine = false; }
      });
    }
  }
}
function setAll(c: Character, m: Mat | null): void {
  const p = c.positioning;
  c.teleportTransform = m;
  void p;
}

class HolyShield extends Ability {
  name = 'Holy shield';
  private visibility = 0;
  private offset = v2();
  private flash = 0;
  private blocker: import('../engine/physics.ts').Body | null = null;
  private pose = (c: Character): void => {
    const t = Easings.cubicInOut(this.visibility);
    const p = c.positioning;
    const second = p.hands[1], first = p.hands[0];
    p.secondaryHandFollowsPrimary = false;
    second.posePosition = lerpV(second.posePosition, add(p.handMousePosition, mul(c.aimDirection, -20)), t);
    second.poseRotation = lerpAngle(second.poseRotation, vectorToAngle(c.aimDirection) + 45 * p.flipScaling, t);
    if (t > 0.3) second.look = HandLook.Open;
    first.posePosition = lerpV(first.posePosition, v2(p.isFlipped ? 50 : -50, -80), t);
    first.poseRotation = lerpAngle(first.poseRotation, p.isFlipped ? 180 + 45 : -45, t);
    first.look = HandLook.Fist;
  };
  shieldAt = v2();
  shieldDir = v2(1, 0);
  constructor(slot: Slot) { super(slot, 'Hold'); }
  constraints(): number { return this.isUsing ? AC.PreventAllAttacking : 0; }
  start(s: Scene, c: Character): void {
    if (!c.positioning.handPoseFunctionOverride.includes(this.pose)) c.positioning.handPoseFunctionOverride.push(this.pose);
    this.offset = v2();
    const self = this;
    this.blocker = s.physics.add({
      owner: { ignoreLineOfSight: true, onShot: (e: import('./extras.ts').HitEvent & { params?: import('./combat.ts').BulletParameters }) => {
        if (!e.params) return;
        const reflected = normalize(add(reflect(e.direction, e.normal), randomPointInCircle(0, 0.2)));
        castBulletRay(s, { ...e.params, origin: e.point, direction: reflected, enemyCollisionLayer: c.enemyCollisionLayer, ignore: c.attackIgnore, canBeAutoDodged: false, clusterSize: 1 }, 0, 0);
        self.flash = 1;
      } },
      filterBits: Layers.BlockBullets,
      collider: { kind: 'rect', matrix: () => [123, 0, 0, 500, self.shieldAt.x, self.shieldAt.y], size: 1 },
    });
  }
  private removeBlocker(s: Scene): void { if (this.blocker) { s.physics.remove(this.blocker); this.blocker = null; } }
  update(s: Scene, c: Character): void {
    const dt = s.clock.dt;
    const last = this.visibility;
    if (this.isUsing) this.visibility += dt / 0.3;
    else { this.removeBlocker(s); this.visibility -= dt / 0.3; }
    this.visibility = clamp(this.visibility, 0, 1);
    this.flash = clamp(this.flash - dt / 0.3, 0, 1);
    if (this.visibility < 1.401298464324817e-45) {
      if (last >= 1.401298464324817e-45) { const i = c.positioning.handPoseFunctionOverride.indexOf(this.pose); if (i >= 0) c.positioning.handPoseFunctionOverride.splice(i, 1); }
      c.holyShield = null;
      return;
    }
    let p = { ...c.positioning.body.computedVisualCenter };
    this.offset = smoothApproachV(this.offset, mul(c.aimDirection, 400 * c.positioning.scale), 12, dt);
    p = add(p, this.offset);
    p.y += 50;
    this.shieldAt = p;
    this.shieldDir = c.aimDirection;
    if (last === 0 && this.visibility > 0) s.audio.play('sounds/holy_shield.wav', 0.6, 1);
    c.holyShield = { pos: p, dir: { ...c.aimDirection }, visibility: this.visibility, flash: this.flash };
  }
  end(s: Scene): void { this.removeBlocker(s); }
}

class Telekinesis extends Ability {
  name = 'Telekinesis';
  private affected: Weapon[] = [];
  private timers: number[] = [];
  private ignore: boolean[] = [];
  private time = 0;
  private wasUsing = false;
  private pose = (c: Character): void => {
    const t = Easings.cubicInOut(clamp(this.time * 4, 0, 1));
    const p = c.positioning;
    const second = p.hands[1], first = p.hands[0];
    p.secondaryHandFollowsPrimary = false;
    second.posePosition = lerpV(second.posePosition, add(p.handMousePosition, mul(c.aimDirection, 40)), t);
    second.poseRotation = lerpAngle(second.poseRotation, vectorToAngle(c.aimDirection), t);
    second.look = HandLook.Point;
    first.posePosition = lerpV(first.posePosition, v2(p.isFlipped ? 50 : -50, -80), t);
    first.poseRotation = lerpAngle(first.poseRotation, p.isFlipped ? 180 + 45 : -45, t);
    first.look = HandLook.Fist;
  };
  constructor(slot: Slot) { super(slot, 'Hold'); }
  constraints(): number { return this.isUsing ? AC.PreventAllAttacking : 0; }
  start(s: Scene, c: Character): void {
    const radius = 400;
    this.affected = s.weapons.filter((w) => !w.wielder && hasRoundsLeft(w) && dist(w.physPos ?? w.transform.position, c.aimTargetPosition) < radius);
    for (const w of s.weapons) {
      if (w.wielder === c) continue;
      if (w.wielder && dist(w.transform.position, c.aimTargetPosition) < radius) {
        const owner = w.wielder;
        s.dropWeapon(owner);
        owner.playAnimation(s.reg.anim('stun_gun_stolen'));
        this.affected.unshift(w);
      }
    }
    this.timers = this.affected.map(() => randomFloat(0, 1));
    this.ignore = this.affected.map(() => false);
    this.time = 0;
    this.wasUsing = true;
    if (!c.positioning.handPoseFunctionOverride.includes(this.pose)) c.positioning.handPoseFunctionOverride.push(this.pose);
  }
  update(s: Scene, c: Character): void {
    const dt = s.clock.dt;
    if (!this.isUsing && this.wasUsing) {
      this.time -= dt;
      if (this.time < 0) {
        const i = c.positioning.handPoseFunctionOverride.indexOf(this.pose);
        if (i >= 0) c.positioning.handPoseFunctionOverride.splice(i, 1);
        this.time = 0;
        this.wasUsing = false;
      }
      return;
    }
    if (this.isUsing && c.dodgeMeter < c.stats.dodgeAbility) c.dodgeMeter += dt;
    this.time += dt;
  }
  fixed(s: Scene, c: Character, dt: number): void {
    const aim = { ...c.aimTargetPosition };
    const floor = floorLevelAt(s.level, aim.x);
    const df = clamp(mapRange(0, 1000, 0, 1, Math.abs(floor - c.aimTargetPosition.y)), 0, 1);
    aim.x = lerp(Math.sign(c.aimDirection.x) * 10000, c.aimTargetPosition.x, df);
    aim.y = lerp(c.aimTargetPosition.y, floor, df);
    this.affected.forEach((w, i) => {
      if (this.ignore[i] || w.removed) return;
      if (w.isAttachedToWall && !w.wielder) w.isAttachedToWall = false;
      if (w.wielder || w.stuckInside || w.thrown || w.physPos === undefined) return;
      const n = this.affected.length;
      const target = add(c.aimTargetPosition, mul(v2(noiseValue(s.clock.time * 0.004, i * 552.5234, 0), noiseValue(s.clock.time * 0.004, -i * 552.5234, 37.29372)), mapRange(0, 5, 0, 500, n)));
      const influence = lerp(0.4, 1, hash(i * 323.5689237));
      const delta = sub(target, w.physPos);
      const m = len(delta);
      const f = 1 - clamp(forceKernel(m * 0.02), 0, 1);
      w.velocity = smoothApproachV(w.velocity, v2(), 12 * influence, dt);
      w.rotationalVelocity = smoothApproach(w.rotationalVelocity, 0, 9 * influence, dt);
      w.acceleration = add(add(w.acceleration ?? v2(), mul(delta, f / m * 35000 * dt * influence)), v2(0, 120 * dt));
      const dir = normalize(sub(aim, w.physPos));
      if (w.data.meleeDamageType !== 'Axe') {
        const ta = Math.atan2(dir.y, dir.x) * 180 / Math.PI + w.instr.onFloorAngle;
        w.rotationalAcceleration = (w.rotationalAcceleration ?? 0) + deltaAngle(w.physRot ?? 0, ta) * dt * 15;
      } else w.rotationalAcceleration = (w.rotationalAcceleration ?? 0) + 2500 * dt;
      if (w.data.weaponType === 'Firearm') { if (df < 0.8) w.isFlipped = Math.cos(((w.physRot ?? 0) + w.instr.onFloorAngle) * Math.PI / 180) < 0; } else w.isFlipped = true;
      const attacking = (c.ai && c.ai.hasKillTarget) || (c.isPlayer && s.input.attack);
      if (!attacking) return;
      this.timers[i] += dt;
      w.timer += dt;
      if (w.data.weaponType === 'Firearm') {
        if (this.timers[i] > 0.3) {
          if (hasRoundsLeft(w)) {
            w.acceleration = add(w.acceleration, mul(dir, -w.data.recoil * 400));
            w.rotationalAcceleration = (w.rotationalAcceleration ?? 0) - w.data.rotationalRecoilIntensity * 25;
            shootWeapon(s, w, c, 0);
          }
          this.timers[i] = randomFloat(-0.1, 0.2);
          w.timer = 0;
        }
      } else {
        const x = clamp((this.timers[i] - 0.7) * 3, 0, 1);
        const mm = 2.70158 * x * x * x - 1.70158 * x * x;
        w.acceleration = add(w.acceleration, mul(dir, mm * 120000 * dt));
        if (mm >= 0.9) {
          this.ignore[i] = true;
          w.thrown = { damage: w.data.throwableDamage, heavy: w.data.throwableHeavy, thrower: c, hitLayer: (Layers.BlockPhysics | c.enemyCollisionLayer) >>> 0 };
        }
      }
    });
  }
  end(): void { this.time = Math.min(this.time, 0.25); this.affected = []; this.timers = []; }
}
const forceKernel = (x: number): number => { const sigma = 2; return Math.exp(-(x * x) / (2 * sigma * sigma)); };
/** Utilities.Hash: a float hash in [0, 1) */
function hash(x: number): number { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); }

/** RichBossAbilityComponent + RichCharacterComponent + RichBossSystem */
export class RichBoss extends Ability {
  name = 'MAG RICH';
  target = v2();
  currentPhase: 'Sword' | 'Gun' | 'Dying' = 'Sword';
  visiblePhase: 'Sword' | 'Gun' | 'Dying' = 'Sword';
  phaseTimer = 0;
  barrel = v2();
  gunRecoil = 0;
  gunRecoilVel = 0;
  gunSlideTimer = Number.MAX_VALUE;
  shooting = false;
  lastHealth = 1;
  healthFlash = 0;
  attackAcc = 0;
  warning: { t: number } | null = null;
  constructor() { super(0, 'Always'); }
  private pose = (c: Character): void => {
    const p = c.positioning;
    const holding = p.isFlipped ? p.hands[0] : p.hands[1];
    const other = p.isFlipped ? p.hands[1] : p.hands[0];
    if (this.visiblePhase === 'Gun') {
      holding.posePosition = add(mul(c.aimDirection, 500), v2(this.gunRecoil * p.flipScaling * -50, 100 + this.gunRecoil * 100));
      holding.poseRotation = vectorToAngle(c.aimDirection) + this.gunRecoil * 15 * p.flipScaling;
      holding.look = HandLook.HoldPistol;
      holding.shouldFollowRecoil = true;
      other.shouldFollowRecoil = p.ironSightProgress >= 0.9;
      other.posePosition = v2(p.flipScaling * -100, -300);
      other.poseRotation = p.isFlipped ? 180 : 0;
      other.look = HandLook.Fist;
    } else {
      this.fistFight(c);
      other.poseRotation = 80;
    }
  };
  fistFight: (c: Character) => void = () => {};
  initialise(s: Scene, c: Character): void {
    this.fistFight = s.fistFight;
    c.positioning.handPoseFunctionOverride.push(this.pose);
    c.flags &= ~(CharacterFlags.AttackResponseMelee | CharacterFlags.AttackResponseThrownProjectile | CharacterFlags.DeleteRagdoll | CharacterFlags.StunAnimationOnNonFatalAttack);
    c.flags |= CharacterFlags.NoRagdoll;
    c.ai = null;
    c.rich = this;
  }
  update(s: Scene, c: Character): void {
    const dt = s.clock.dt;
    const p = s.player;
    if (!p) return;
    this.gunSlideTimer += dt;
    this.gunRecoilVel += (0 - this.gunRecoil) * 0.5;
    this.gunRecoilVel = smoothApproach(this.gunRecoilVel, 0, 15, dt);
    this.gunRecoil += this.gunRecoilVel * dt;
    c.positioning.currentRecoil = this.gunRecoil * 1.2;
    c.positioning.hopAnimationDuration = 0.4;
    if (!c.isAlive) {
      if (this.currentPhase !== 'Dying') {
        s.forceReachGoal();
        c.stopAllAnimations();
        const anim = s.reg.anim(this.currentPhase === 'Sword' ? 'rich_death_sword' : this.currentPhase === 'Gun' ? 'rich_death_gun' : 'rich_death_unarmed');
        const pa = c.playAnimation(anim);
        this.currentPhase = 'Dying';
        s.audio.play('sounds/rich_boss_battle/death.wav');
        s.music.play('sounds/music/Lothyde/strenuous_end.ogg', false);
        s.delay(5, () => s.music.play('sounds/music/Lothyde/underachiever_(feat_cheshyre).ogg'));
        s.delay(3.2, () => s.shake(100));
        pa.onEnd = () => { if (!c.hasBeenRagdolled && !c.removed) { s.stamp(c); s.deleteCharacter(c); } };
      }
      return;
    }
    if (!c.isPlayingAnimation) this.target = add(p.positioning.head.globalPosition, v2(0, 70));
    const d = Math.abs(this.target.x - c.positioning.globalCenter.x);
    if (!c.isPlayingAnimation && d > 300)
      c.aimTargetPosition = smoothApproachV(c.aimTargetPosition, add(this.target, mul(v2(noiseValue(s.clock.time * 0.2, 95829, 0), noiseValue(s.clock.time * 0.2, -95829, 37.29372)), 150)), 2, dt);
    c.aimOrigin = { ...c.positioning.head.globalPosition };
    c.relativeAimTargetPosition = sub(c.aimTargetPosition, c.aimOrigin);
    const flipped = c.aimTargetPosition.x < c.positioning.globalCenter.x;
    if (flipped !== c.positioning.isFlipped) { c.positioning.isFlipped = flipped; c.needsLookUpdate = true; }
    const maxD = this.visiblePhase === 'Gun' ? 2500 : 1200;
    if (snap(d, 300) > maxD) c.walkAcceleration.x = smoothApproach(c.walkAcceleration.x, clamp(c.aimTargetPosition.x - c.positioning.globalCenter.x, -500, 500), 2, dt);
    else c.walkAcceleration.x = 0;
    const facing = c.positioning.isFlipped === (this.target.x < c.positioning.globalCenter.x);
    if (!p.isAlive) return;
    this.attackAcc += dt;
    while (this.attackAcc >= 0.25) {
      this.attackAcc -= 0.25;
      if (c.isPlayingAnimation || this.phaseTimer <= 3 || this.shooting) continue;
      if (randomFloat() > 0.95 && this.phaseTimer > 9) {
        if (this.currentPhase === 'Sword') { this.currentPhase = 'Gun'; c.playAnimation(s.reg.anim('rich_sword_to_unarmed')); } else { this.currentPhase = 'Sword'; c.playAnimation(s.reg.anim('rich_unarmed_to_sword')); }
        this.phaseTimer = 0;
      }
      if (d < 900 && randomFloat() > 0.2 && facing) {
        c.playAnimation(s.reg.anim('rich_unarmed_attack'));
        s.delay(1.2, () => { if (c.isAlive) this.areaHit(s, c, v2(c.positioning.flipScaling * 25, randomFloat(10, 20)), randomFloat(-12, 12), 'sounds/rich_boss_battle/punch.wav', 20); });
      } else if (this.currentPhase === 'Sword' && d < 1500 && facing) {
        if (randomFloat() > 0.3) {
          c.playAnimation(s.reg.anim('rich_sword_attack'));
          s.delay(1.54, () => { if (c.isAlive) this.swordImpact(s, c); });
        }
      } else if (this.currentPhase === 'Gun') {
        c.positioning.handMousePosition = v2();
        if (!this.shooting && randomFloat() > 0.92 && c.isAlive) this.shootGun(s, c);
      }
    }
    this.phaseTimer += dt;
    if (this.visiblePhase !== this.currentPhase && this.phaseTimer > 1) this.visiblePhase = this.currentPhase;
  }
  /** UnarmedMeleeHit and the first part of SwordImpact: everyone in a 700 square around the target dies */
  private areaHit(s: Scene, c: Character, vel: Vec2, torque: number, sound: string, shake: number): void {
    const t = this.target;
    for (const b of s.physics.bodies) {
      if ((b.filterBits & Layers.AllCharacters) === 0) continue;
      const part = b.owner as BodyPart;
      if (!part || !('character' in part)) continue;
      const pos = part.transform.position;
      if (Math.abs(pos.x - t.x) > 350 || Math.abs(pos.y - t.y) > 350) continue;
      const victim = part.character;
      if (victim === c || victim.rich) continue;
      if (victim.hasFlag(CharacterFlags.Invincible) || victim.constrainsAny(AC.PreventDying)) continue;
      if (victim.isPlayer && s.disks.has('god')) continue;
      victim.kill();
      s.turnIntoRagdoll(victim, typeof vel === 'function' ? vel : vel, torque);
    }
    if (sound) s.audio.play(sound, 2, 1);
    s.shake(shake);
  }
  private swordImpact(s: Scene, c: Character): void {
    this.areaHit(s, c, v2(randomFloat(-8, 8), randomFloat(5, 15)), randomFloat(-8, 8), '', 0);
    const x = c.positioning.globalCenter.x + 1300 * c.positioning.flipScaling;
    const tex = pickRandom(s.textureFolder('textures/rich_sword_impact'));
    const sz = s.textureSize(tex);
    const k = BackgroundSizeRatio * randomFloat(0.95, 1.053);
    const pos = add(v2(x, floorLevelAt(s.level, x)), randomPointInCircle(0, 10));
    s.props.push({ texture: tex, pos, size: v2(sz.w * k * (randomFloat() > 0.5 ? -1 : 1), sz.h * k), rot: 0, layer: -100, order: 9, columns: 1, rows: 1, duration: Infinity, tint: [1, 1, 1, 1], tag: null });
    s.audio.play(pickRandom(s.soundFolder('sounds/rich_boss_battle/sword')), 2, 1);
    s.shake(120);
  }
  private shootGun(s: Scene, c: Character): void {
    this.shooting = true;
    s.audio.play('sounds/rich_boss_battle/shot_warning.wav');
    s.flash = { color: [1, 0, 0, 0.5], time: 0.5 };
    this.warning = { t: 0 };
    s.routineFor(1, (dt) => { if (this.warning) this.warning.t += dt; });
    s.delay(1, () => {
      this.warning = null;
      if (!c.isAlive) { this.shooting = false; return; }
      s.audio.play(pickRandom(s.soundFolder('sounds/rich_boss_battle/gun')));
      s.effects.muzzleFlash(add(this.barrel, mul(c.aimDirection, 300)), vectorToAngle(c.aimDirection), 4);
      s.shake(250);
      s.flash = { color: [1, 0, 0, 1], time: 0.4 };
      this.gunRecoil += 0.5;
      this.gunRecoilVel += 25;
      this.gunSlideTimer = 0;
      let bullet = { ...this.barrel };
      const dir = c.aimDirection;
      const ignore = new Set<unknown>(c.attackIgnore);
      for (let i = 0; i < 64; i++) {
        const hit = s.physics.raycast(bullet, dir, Number.MAX_VALUE, (Layers.AllCharacters | Layers.BlockBullets) >>> 0, ignore);
        if (!hit) { bullet = add(bullet, mul(dir, 10000)); break; }
        bullet = hit.position;
        const part = hit.body.owner as BodyPart;
        if (part && typeof part === 'object' && 'character' in part) {
          ignore.add(part);
          const victim = part.character;
          if (victim === c || victim.rich) continue;
          if (victim.hasFlag(CharacterFlags.Invincible) || victim.constrainsAny(AC.PreventDying | AC.PreventBeingShot)) continue;
          if (victim.isPlayer && s.disks.has('god')) continue;
          victim.kill();
          s.turnIntoRagdoll(victim, add(mul(dir, 7), v2(0, randomFloat(1, 12))), randomFloat(2, 5) * -c.positioning.flipScaling);
          s.addWound(part, v2(), 0.5);
        } else break;
      }
      s.effects.tracer(this.barrel, bullet);
      s.delay(1, () => { this.shooting = false; });
    });
  }
  /** RichBossSystem.Render: the sword, the gun and its slide */
  draw(s: Scene, c: Character, out: DrawItem[]): void {
    const p = c.positioning;
    const W: [number, number, number, number] = [1, 1, 1, 1];
    const flipAround = (pt: Vec2, deg: number): Mat => mmul(scaling(p.flipScaling, 1, pt), rotation(deg * Math.PI / 180, pt));
    const sword = 'textures/weapons/mag_tacticalkatana/base.png';
    const ss = s.textureSize(sword);
    if (this.visiblePhase === 'Sword') {
      const hand = p.isFlipped ? p.hands[0] : p.hands[1];
      const c0 = add(hand.globalPosition, v2(0, ss.h / 2 - 200));
      out.push({ tex: sword, m: mmul([ss.w * 1.2, 0, 0, ss.h * 1.2, c0.x, c0.y], flipAround(hand.globalPosition, hand.globalRotation + (p.isFlipped ? 180 : 0))), color: W, mode: 0, layer: hand.apparentLayer, order: hand.apparentOrder - 1 });
    } else if (this.currentPhase !== 'Dying' || c.isAlive) {
      const pp = add(p.body.computedVisualCenter, v2(-250 * p.flipScaling, 150));
      out.push({ tex: sword, m: mmul([ss.w * 1.2, 0, 0, ss.h * 1.2, pp.x, pp.y], flipAround(pp, p.body.globalRotation + 180)), color: W, mode: 0, layer: c.layer, order: 1 });
    }
    const offset = v2(150, 35);
    const h = p.isFlipped !== (this.visiblePhase !== 'Gun');
    const hand = h ? p.hands[0] : p.hands[1];
    this.barrel = add(hand.globalPosition, rotateDeg(v2(offset.x + 290, (offset.y + 120) * p.flipScaling), hand.globalRotation));
    const gun = 'textures/weapons/mag_automag/base.png';
    const slide = 'textures/weapons/mag_automag/slide.png';
    const gs = s.textureSize(gun), sl = s.textureSize(slide);
    const m = flipAround(hand.globalPosition, hand.globalRotation + (p.isFlipped ? 180 : 0));
    const gc = add(hand.globalPosition, offset);
    let sc = add(gc, v2(15, 125));
    if (this.gunSlideTimer < 1) sc = add(sc, v2(Math.sin(clamp(this.gunSlideTimer * 5, 0, 1) * Math.PI) * -90, 0));
    out.push({ tex: gun, m: mmul([gs.w, 0, 0, gs.h, gc.x, gc.y], m), color: W, mode: 0, layer: hand.apparentLayer, order: hand.apparentOrder - 1 });
    out.push({ tex: slide, m: mmul([sl.w, 0, 0, sl.h, sc.x, sc.y], m), color: W, mode: 0, layer: hand.apparentLayer, order: hand.apparentOrder - 1 });
    void translation;
  }
}
const rotateDeg = (p: Vec2, deg: number): Vec2 => { const r = deg * Math.PI / 180; return v2(p.x * Math.cos(r) - p.y * Math.sin(r), p.x * Math.sin(r) + p.y * Math.cos(r)); };
const BackgroundSizeRatio = 3 / (1080 / 800);

/** CharacterStatsDeserialiser's type names → abilities */
export function abilityFromType(name: string, slot: Slot): Ability | null {
  switch (name.split('.').pop()) {
    case 'NoStunAbilityComponent': return new NoStun();
    case 'NoWaitForAttackTurn': return new NoWaitForAttackTurn();
    case 'NoWeapons': return new NoWeapons();
    case 'RichBossAbilityComponent': return new RichBoss();
    case 'FlyingAbilityComponent': return new Flying(slot);
    case 'TeleportDashAbilityComponent': return new TeleportDash(slot);
    case 'HolyShieldAbilityComponent': return new HolyShield(slot);
    case 'TelekinesisAbilityComponent': return new Telekinesis(slot);
    default: return null;
  }
}
/** CharacterComponent.TryGetNextAbilitySlot */
export function nextSlot(c: Character): Slot | 0 {
  for (const sl of [1, 2, 3, 4] as Slot[]) if (!c.abilities.some((a) => a.slot === sl)) return sl;
  return 0;
}
export function addAbility(c: Character, a: Ability): void { c.abilities.push(a); }

/** CharacterAbilitySystem.ProcessAbility */
export function updateAbilities(s: Scene, c: Character): void {
  for (const a of c.abilities) {
    if (!a.initialised) { a.initialise(s, c); a.initialised = true; }
    if (!c.isAlive) {
      if (a.isUsing) a.end(s, c);
      a.isUsing = false;
      continue;
    }
    const held = c.isPlayer && a.slot > 0 ? s.input.abilityHeld[a.slot - 1] : false;
    const pressed = c.isPlayer && a.slot > 0 ? s.input.abilityPressed[a.slot - 1] : false;
    const released = c.isPlayer && a.slot > 0 ? s.input.abilityReleased[a.slot - 1] : false;
    if (!a.isUsing && pressed) a.start(s, c);
    if (a.behaviour === 'Always') a.isUsing = true;
    else if (a.behaviour === 'Hold') a.isUsing = held;
    else if (pressed) a.isUsing = !a.isUsing;
    a.update(s, c);
    if (released) a.end(s, c);
  }
  c.additionalConstraints = c.abilities.reduce((f, a) => (f | a.constraints()) >>> 0, 0);
}
export function fixedAbilities(s: Scene, c: Character, dt: number): void { if (c.isAlive) for (const a of c.abilities) a.fixed(s, c, dt); }

// ---------- improbability disks ----------
export interface Disk { id: string; name: string; texture: string; description: string; apply?: (s: Scene, c: Character) => void; abilities?: string[] }

/** new CharacterStats(stats) copies only these fields (CharacterStats.cs), the others are reset to their defaults */
function copyStats(o: CharacterStats, over: Partial<CharacterStats>): CharacterStats {
  const s = new CharacterStats();
  for (const k of ['name', 'scale', 'aimingRandomness', 'shootingTimeout', 'recoilHandlingAbility', 'accurateShotChance', 'dodgeAbility', 'jumpDodgeDuration',
    'agilitySkillLevel', 'panicIntensity', 'meleeSkill', 'canDeflect', 'dodgeOversaturate', 'headHealth', 'bodyHealth'] as const) (s as unknown as Record<string, unknown>)[k] = o[k];
  s.unarmedSeq = [...o.unarmedSeq]; s.swordSeq = [...o.swordSeq]; s.twoHandedSeq = [...o.twoHandedSeq]; s.bluntSeq = [...o.bluntSeq];
  s.twoHandedGunSeq = [...o.twoHandedGunSeq]; s.oneHandedGunSeq = [...o.oneHandedGunSeq];
  return Object.assign(s, over);
}
const stat = (f: (o: CharacterStats) => Partial<CharacterStats>) => (_s: Scene, c: Character): void => { c.stats = copyStats(c.stats, f(c.stats)); };
const withAbility = (...make: ((sl: Slot) => Ability)[]) => (_s: Scene, c: Character): void => {
  for (const m of make) { const sl = nextSlot(c); if (sl) addAbility(c, m(sl as Slot)); }
};
const M = (t: string): string => `textures/ui/modifiers/${t}.png`;
export const DISKS: Disk[] = [
  { id: 'tricky', name: '003', texture: M('003'), description: 'Grants you Tricky-like powers.', abilities: ['Teleport', 'Immortality'], apply: (s, c) => {
    c.look = c.look.copy(); c.look.jitter = true;
    c.stats = copyStats(c.stats, { agilitySkillLevel: AgilitySkillLevel.Master, dodgeAbility: 1, meleeSkill: 45, headHealth: 5, bodyHealth: 5, meleeKnockback: 8, recoilHandlingAbility: 4 });
    c.positioning.body.maxHealth = c.positioning.body.health = 5;
    c.positioning.head.maxHealth = c.positioning.head.health = 5;
    c.positioning.topWalkSpeed *= 1.2;
    c.positioning.hopAnimationDuration *= 0.7;
    withAbility((sl) => new TeleportDash(sl))(s, c);
  } },
  { id: 'fast_melee', name: 'Armstrong', texture: M('Armstrong'), description: 'Increases your melee attack speed.', apply: stat((o) => ({ meleeSkill: o.meleeSkill + 10 })) },
  { id: 'very_strong', name: 'Arnold', texture: M('Arnold'), description: 'Boosts your melee attack strength.', apply: stat((o) => ({ meleeSkill: o.meleeSkill + 10, meleeKnockback: o.meleeKnockback + 8 })) },
  { id: 'infinite_ammo', name: 'FLCL', texture: M('FLCL'), description: 'Your weapons will never run out.' },
  { id: 'grunt', name: 'Grunt', texture: M('Grunt'), description: 'You will be downgraded to Grunt level.', apply: stat((o) => ({ dodgeAbility: o.dodgeAbility * 0.1, meleeSkill: o.meleeSkill * 0.1, agilitySkillLevel: AgilitySkillLevel.None, jumpDodgeDuration: 0 })) },
  { id: 'agent', name: 'Agent', texture: M('Agent'), description: 'You will be downgraded to Agent level.', apply: stat((o) => ({ dodgeAbility: o.dodgeAbility * 0.25, meleeSkill: o.meleeSkill * 0.25, agilitySkillLevel: AgilitySkillLevel.Novice, jumpDodgeDuration: 0.25 })) },
  { id: 'engineer', name: 'Engineer', texture: M('Engineer'), description: 'You will be downgraded to Engineer level.', apply: stat((o) => ({ dodgeAbility: o.dodgeAbility * 0.5, meleeSkill: o.meleeSkill * 0.5, agilitySkillLevel: AgilitySkillLevel.Adept, jumpDodgeDuration: 0.25 })) },
  { id: 'soldat', name: 'Soldat', texture: M('Soldat'), description: 'You will be downgraded to Soldat level.', apply: stat((o) => ({ dodgeAbility: o.dodgeAbility * 0.8, meleeSkill: o.meleeSkill * 0.8, agilitySkillLevel: AgilitySkillLevel.Master })) },
  { id: 'more_dodge', name: 'Wick', texture: M('Wick'), description: 'Makes you less vulnerable.', apply: stat((o) => ({ dodgeAbility: o.dodgeAbility * 4 })) },
  { id: 'fast_walking', name: 'Gump', texture: M('Gump'), description: 'Increases your movement speed.' },
  { id: 'auditor', name: 'HP', texture: M('HP'), description: 'You will be imbued with Higher Powers.', abilities: ['Conjuring'], apply: (s, c) => { c.auditorFire = true; withAbility((sl) => new SpawnMenu(sl))(s, c); } },
  { id: 'telekinesis', name: 'Phantom Madness', texture: M('PhantomMadness'), description: 'Grants telekinesis powers.', abilities: ['Telekinesis'], apply: withAbility((sl) => new Telekinesis(sl)) },
  { id: 'jebus', name: 'Savior', texture: M('Savior'), description: 'Grants Christoff-like powers.', abilities: ['Flying', 'Telekinesis', 'Holy shield'],
    apply: withAbility((sl) => new Flying(sl), (sl) => new Telekinesis(sl), (sl) => new HolyShield(sl)) },
  { id: 'god', name: 'Willis', texture: M('Willis'), description: 'You will be invincible.' },
  { id: 'more_enemies', name: 'Menagerie', texture: M('Menagerie'), description: 'Increases enemy count.' },
  { id: 'fewer_enemies', name: 'Ghost Protocol', texture: M('GhostProtocol'), description: 'Decreases enemy count.' },
  { id: 'everyone_evil', name: 'STATEOFEMERGENCY', texture: M('STATEOFEMERGENCY'), description: 'There is no allegiance.' },
];
const INCOMPATIBLE: string[][] = [['grunt', 'agent', 'engineer', 'soldat'], ['auditor', 'jebus'], ['auditor', 'tricky'], ['jebus', 'telekinesis'], ['more_enemies', 'fewer_enemies']];
export function incompatible(a: string, b: string): boolean { return INCOMPATIBLE.some((g) => g.includes(a) && g.includes(b) && a !== b); }

/** the disks the player has unlocked and enabled (UserData: disks.txt, and the enabled set the original keeps in memory) */
export class DiskState {
  unlocked = new Set<string>();
  enabled = new Set<string>();
  onChange: () => void = () => {};
  has(id: string): boolean { return this.enabled.has(id); }
  known(id: string): boolean { return DISKS.some((d) => d.id === id); }
  isUnlocked(id: string): boolean { return this.unlocked.has(id); }
  name(id: string): string { return DISKS.find((d) => d.id === id)?.name ?? id; }
  unlock(id: string): void { if (!this.unlocked.has(id)) { this.unlocked.add(id); this.onChange(); } }
  toggle(id: string): void {
    if (this.enabled.has(id)) this.enabled.delete(id);
    else if (this.unlocked.has(id) && ![...this.enabled].some((e) => incompatible(e, id))) this.enabled.add(id);
    this.onChange();
  }
  /** CharacterUtilities.ApplyActiveModifiers */
  apply(s: Scene, c: Character): void { for (const d of DISKS) if (this.enabled.has(d.id)) d.apply?.(s, c); }
}

/** SpawnMenuAbilityComponent ("Conjuring"): a menu of weapons and allies to conjure next to the player */
export class SpawnMenu extends Ability {
  name = 'Conjuring';
  open = false;
  constructor(slot: Slot) { super(slot, 'Toggle'); }
  start(s: Scene): void { this.open = !this.open; s.audio.play('sounds/conjure.wav', 0.5); }
  update(_s: Scene, c: Character): void { c.spawnMenu = this.open ? this : null; }
  conjureWeapon(s: Scene, c: Character, key: string): void {
    const w = s.reg.weapons.get(key);
    if (!w) return;
    s.createWeapon(add(c.aimTargetPosition, v2(0, 0)), w);
    s.audio.play('sounds/conjure.wav');
  }
  conjureAlly(s: Scene, c: Character, stats: string, look: string): void {
    const ally = s.createCharacter('Conjured', v2(c.aimTargetPosition.x, floorLevelAt(s.level, c.aimTargetPosition.x)), c.faction.id, look, stats);
    ally.ai = (s.newAi)();
    s.audio.play('sounds/higher_powers.wav');
  }
}

declare module './character.ts' {
  interface Character {
    rich?: RichBoss;
    teleportTransform?: Mat | null;
    holyShield?: { pos: Vec2; dir: Vec2; visibility: number; flash: number } | null;
    auditorFire?: boolean;
    spawnMenu?: SpawnMenu | null;
  }
}
