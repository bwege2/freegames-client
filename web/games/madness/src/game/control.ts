// Madness Interactive Reloaded port (GPL-3.0). Who wants to go where: Character/Systems/PlayerCharacterSystem.cs,
// AiCharacterSystem.cs, CharacterMovementSystem.cs, JumpDodgeSystem.cs, CharacterPickupSystem.cs, CharacterSystem.cs,
// ImpactOffsetSystem.cs and ExitDoorSystem.cs, translated line by line.
import { AC, HandLook } from '../data/animation.ts';
import { AgilitySkillLevel, isCloseToEdge, isFlatAt } from '../data/registry.ts';
import { transformPoint } from '../engine/matrix.ts';
import { noiseSimplex, noiseValue } from '../engine/noise.ts';
import { Layers } from '../engine/physics.ts';
import {
  add, clamp, smoothAngleApproach, dist, distSq, Easings, lenSq, lerp, lerpAngle, lerpV, mapRange, mul, nanFallbackV, normalize,
  pickRandom, randomFloat, rotatePoint, smoothApproachV, sub, v2, type Vec2, len, rectCenter, rectContains, RAD2DEG,
} from '../engine/util.ts';
import {
  AccurateShotCooldown, AccurateShotWarningDuration, HalfHeight, HandOffset1, HandOffset2, HandPositionMode, IronsightOffset,
  MaxHandRange, hasRoundsLeft, type Character, type Weapon,
} from './character.ts';
import { Animations, dodgeAnimation, tryJumpDodge, tryThrowWeapon, tryPerformMeleeAttack, getBarrel } from './combat.ts';
import type { Scene } from './scene.ts';

export interface PlayerInput {
  left: boolean; right: boolean; jumpDodge: boolean; interact: boolean; attack: boolean; melee: boolean; blockAim: boolean; throw: boolean;
  pressed: Set<'left' | 'right' | 'jumpDodge' | 'interact' | 'attack' | 'melee' | 'throw'>;
  worldMouse: Vec2;
  abilityHeld: boolean[]; abilityPressed: boolean[]; abilityReleased: boolean[];
}

const normalisedSineWave = (x: number): number => Math.sin(6.2831853 * x + 4.71238898) * 0.5 + 0.5;
export const timeSafeRandom = (s: Scene, seed = 0): number => noiseValue(s.clock.time * 31.32486, seed, -seed * 34.459) * 0.5 + 0.5;

/** PlayerCharacterSystem.Update */
export function updatePlayer(s: Scene, c: Character, input: PlayerInput): void {
  const player = c.player!;
  if (!c.isAlive) {
    if (!player.isDoingDyingSequence) {
      s.campaignStat('death');
      player.isDoingDyingSequence = true;
      s.startDeathSequence();
    }
    return;
  }
  let equipped = c.hasWeaponEquipped ? c.equipped : null;
  const prevFlipped = c.positioning.isFlipped;
  c.isIronSighting = c.hasWeaponEquipped && player.respondToUserInput && input.blockAim;
  c.aimOrigin = { ...c.positioning.globalCenter };
  if (equipped && equipped.data.weaponType === 'Firearm') {
    const a = c.aimDirection;
    const th = Math.atan2(a.y, a.x);
    const iron = IronsightOffset.y * Easings.quadInOut(c.positioning.ironSightProgress) * c.positioning.scale;
    const barrel = sub(equipped.barrelEndPoint, equipped.transform.localPivot);
    const o = barrel.y + iron;
    c.aimOrigin = add(c.aimOrigin, rotatePoint(v2(0, o * c.positioning.flipScaling), th * RAD2DEG));
  }
  if (c.constrainsAny(AC.FaceForwards)) c.aimTargetPosition = add(c.positioning.head.globalPosition, v2(c.positioning.flipScaling * 10000, 0));
  else if (!c.constrainsAny(AC.PreventAiming)) {
    c.aimTargetPosition = player.respondToUserInput ? nanFallbackV(input.worldMouse) : add(c.positioning.head.globalPosition, v2(c.positioning.flipScaling * 10000, 0));
    c.relativeAimTargetPosition = sub(c.aimTargetPosition, c.aimOrigin);
  } else c.aimTargetPosition = add(c.aimOrigin, c.relativeAimTargetPosition);
  let targetHand = sub(c.aimTargetPosition, c.aimOrigin);
  const maxHandRange = MaxHandRange * (equipped?.data.maxHandRangeMultiplier ?? 1) * c.positioning.scale;
  if (lenSq(targetHand) > maxHandRange * maxHandRange) targetHand = mul(normalize(targetHand), maxHandRange);
  c.positioning.handMousePosition = targetHand;
  if (c.hasWeaponEquipped && equipped) c.positioning.handPositionMode = equipped.holdPoints.length > 1 ? HandPositionMode.TwoHands : HandPositionMode.OneHand;
  else equipped = null;
  const shouldBeDirectedRight = c.aimTargetPosition.x > c.positioning.globalCenter.x;
  c.walkAcceleration = v2();
  if (player.respondToUserInput) {
    const nearest = nearestWeaponForPlayer(s, c, input.worldMouse);
    s.highlightedWeapon = nearest;
    if (input.pressed.has('interact') && !c.constrainsAny(AC.PreventWorldInteraction)) {
      pickupWithAnimation(s, c, nearest);
      equipped = c.hasWeaponEquipped ? c.equipped : null;
    }
    if (c.hasWeaponEquipped && equipped && equipped.data.weaponType === 'Firearm' && !c.constrainsAny(AC.PreventShooting)) {
      if (input.pressed.has('attack') && !hasRoundsLeft(equipped) && !s.disks.has('infinite_ammo')) s.audio.play('sounds/firearms/dry_fire.wav');
      if (equipped.data.automatic) { if (input.attack) equipped.isFiring = true; } else if (input.pressed.has('attack')) equipped.isFiring = true;
    }
    c.isMeleeBlocking = false;
    if (!c.hasWeaponEquipped || equipped?.data.weaponType === 'Melee') {
      c.isMeleeBlocking = c.hasWeaponEquipped && c.isIronSighting && !c.constrainsAny(AC.PreventBlock);
      if (input.pressed.has('attack') || input.pressed.has('melee')) tryPerformMeleeAttack(s, equipped, c);
      if (!c.constrainsAny(AC.PreventFlip)) c.positioning.isFlipped = !shouldBeDirectedRight;
    } else if (c.hasWeaponEquipped && equipped && equipped.data.weaponType === 'Firearm') {
      if (input.pressed.has('melee')) {
        if (!c.constrainsAny(AC.PreventFlip)) c.positioning.isFlipped = !shouldBeDirectedRight;
        tryPerformMeleeAttack(s, equipped, c);
      }
    }
    if (input.pressed.has('throw')) tryThrowWeapon(s, c);
    if (c.allowWalking && (!c.constrainsAny(AC.PreventWalking) || c.stats.agilitySkillLevel === AgilitySkillLevel.Master)) {
      if (input.pressed.has('left') || input.pressed.has('right')) {
        c.lifetime = 0;
        c.positioning.hopAnimationTimer = -1;
        c.positioning.hopStartingPosition = c.positioning.globalCenter.x;
      }
      if (!(input.right && input.left)) {
        let m = c.isIronSighting ? 0.5 : 1;
        if (s.disks.has('fast_walking')) m *= 1.5;
        if (input.right) {
          if (!c.isPlayingAnimation) c.positioning.isFlipped = !shouldBeDirectedRight;
          c.walkAcceleration = v2(c.positioning.topWalkSpeed * m, 0);
        }
        if (input.left) {
          if (!c.isPlayingAnimation) c.positioning.isFlipped = !shouldBeDirectedRight;
          c.walkAcceleration = v2(-c.positioning.topWalkSpeed * m, 0);
        }
      }
    }
    if (input.pressed.has('jumpDodge')) tryJumpDodge(s, c);
  }
  if (c.isIronSighting && !c.isPlayingAnimation) c.positioning.isFlipped = !shouldBeDirectedRight;
  if (c.positioning.isFlipped !== prevFlipped) c.needsLookUpdate = true;
}

function nearestWeaponForPlayer(s: Scene, c: Character, mouse: Vec2): Weapon | null {
  let min = Number.MAX_VALUE;
  let nearest: Weapon | null = null;
  for (const w of s.weapons) {
    if (!hasRoundsLeft(w) || w.wielder || w.thrown) continue;
    if (distSq(w.transform.position, c.positioning.globalCenter) > c.handPickupRange * c.handPickupRange * c.stats.scale) continue;
    let d = distSq(w.transform.position, mouse);
    if (w.data.weaponType === 'Melee') d *= 0.5;
    else { d /= lerp(w.remainingRounds, 1, 0.5); d /= lerp(w.data.damage, 1, 0.5); }
    if (d < min) { min = d; nearest = w; }
  }
  return nearest;
}

/** CharacterUtilities.PickupWithAnimation */
export function pickupWithAnimation(s: Scene, c: Character, w: Weapon | null): void {
  if (c.pickup) return;
  if (c.hasWeaponEquipped) s.dropWeapon(c);
  if (!w) return;
  let delay = 0;
  if (!c.jumpDodge) {
    c.pickup = { time: 0, duration: 0.4, pickupTime: 0.4, target: w, initialTargetRotation: 0, last: v2(), started: false };
    delay = c.pickup.pickupTime * c.pickup.duration;
  }
  s.delay(delay, () => {
    if (s.equipWeapon(c, w)) s.audio.play(pickRandom(s.soundFolder('sounds/pickup')));
  });
}

/** AiCharacterSystem.Update */
export function updateAi(s: Scene): void {
  const dt = s.clock.dt;
  const maxAttackers = s.level?.maxSimultaneousAttackingEnemies ?? 2;
  for (const c of s.characters) {
    const ai = c.ai;
    if (!ai || !ai.hasKillTarget || !c.isAlive || !ai.killTarget || ai.killTarget.removed) continue;
    const target = ai.killTarget;
    if (target.currentAttackerCount >= maxAttackers) ai.tooBusyToAttack = ai.waitsForAttackTurn;
    else { target.currentAttackerCount++; ai.tooBusyToAttack = false; }
  }
  for (const c of [...s.characters]) {
    const ai = c.ai;
    if (!ai) continue;
    if (!c.isAlive) {
      if (!c.hasBeenRagdolled && !c.isPlayingAnimationGroup('deaths')) s.turnIntoRagdoll(c);
      continue;
    }
    let killTargetChar: Character | null = null;
    const prevFlipped = c.positioning.isFlipped;
    if (ai.hasKillTarget && (ai.isDocile || !ai.killTarget || ai.killTarget.removed || !ai.killTarget.isAlive)) ai.hasKillTarget = false;
    else if (ai.hasKillTarget) killTargetChar = ai.killTarget;
    if (ai.hasItemTarget && (!ai.itemTarget || ai.itemTarget.removed || ai.itemTarget.wielder || !hasRoundsLeft(ai.itemTarget))) ai.hasItemTarget = false;
    if (!ai.isDocile && !ai.hasKillTarget) { ai.attackModeDuration = 0; findKillTarget(s, c); } else ai.attackModeDuration += dt;
    if (!killTargetChar && ai.killTarget && !ai.killTarget.removed) killTargetChar = ai.killTarget;
    c.isIronSighting = c.hasWeaponEquipped && ai.wants.ironSight.value;
    let originalPos = { ...c.positioning.globalCenter };
    c.aimOrigin = { ...originalPos };
    const aimingSource = { ...originalPos };
    let equipped = c.hasWeaponEquipped ? c.equipped : null;
    if (equipped) {
      aimingSource.y += equipped.barrelEndPoint.y;
      if (equipped.data.weaponType === 'Firearm') originalPos.y += 100 * c.positioning.ironSightProgress;
      if (equipped.data.weaponType === 'Melee' && timeSafeRandom(s, ai.seed - 42.23) > 0.2) findItemTarget(s, c);
    } else if (timeSafeRandom(s, ai.seed + 2239) > 0.6 && !ai.hasItemTarget) findItemTarget(s, c);
    let targetHand = sub(ai.aimingPosition, originalPos);
    const maxHandRange = MaxHandRange * (equipped?.data.maxHandRangeMultiplier ?? 1) * c.positioning.scale;
    if (lenSq(targetHand) > maxHandRange * maxHandRange) targetHand = mul(normalize(targetHand), maxHandRange);
    c.positioning.handMousePosition = targetHand;
    c.aimTargetPosition = { ...ai.aimingPosition };
    if (c.hasWeaponEquipped && equipped) {
      if (!hasRoundsLeft(equipped) && !ai.isDocile) { s.dropWeapon(c); continue; }
      c.positioning.handPositionMode = equipped.holdPoints.length > 1 ? HandPositionMode.TwoHands : HandPositionMode.OneHand;
    } else { c.positioning.handPositionMode = HandPositionMode.None; equipped = null; }
    if (ai.wants.interact.value && !c.constrainsAny(AC.PreventWorldInteraction)) pickupNearestWeapon(s, c);
    equipped = c.hasWeaponEquipped ? c.equipped : null;
    if (!ai.isDocile && !ai.isDoingAccurateShot && c.hasWeaponEquipped && equipped && equipped.data.weaponType === 'Firearm'
      && !s.isTargetedByAccurateShot(ai.killTarget)) {
      const became = (b: { value: boolean; prev: boolean }) => b.value && !b.prev;
      if (became(ai.wants.shoot) && !hasRoundsLeft(equipped)) s.audio.play('sounds/firearms/dry_fire.wav');
      if (became(ai.wants.accurateShot) && ai.panicLevel < 0.1 && s.clock.time - s.lastAccurateShotTime > AccurateShotCooldown && killTargetChar) {
        s.doAccurateShot(c, killTargetChar);
      } else if (equipped.data.automatic) { if (ai.wants.shoot.value) equipped.isFiring = true; } else if (became(ai.wants.shoot)) equipped.isFiring = true;
    }
    const shouldBeDirectedRight = c.aimTargetPosition.x > c.positioning.globalCenter.x;
    c.isMeleeBlocking = false;
    if (!ai.isDocile && !ai.tooBusyToAttack && (!c.hasWeaponEquipped || equipped?.data.weaponType === 'Melee')) {
      if (!c.constrainsAny(AC.PreventBlock)) c.isMeleeBlocking = c.hasWeaponEquipped && c.isIronSighting;
      if (!c.isMeleeBlocking && ai.wants.shoot.value && !ai.isDoingAccurateShot && !s.isTargetedByAccurateShot(ai.killTarget)) {
        if (ai.hasKillTarget) tryPerformMeleeAttack(s, equipped, c);
      }
      if (!c.constrainsAny(AC.PreventFlip)) c.positioning.isFlipped = !shouldBeDirectedRight;
    }
    if ((ai.wants.walkLeft.value && !ai.wants.walkLeft.prev) || (ai.wants.walkRight.value && !ai.wants.walkRight.prev)) {
      c.lifetime = 0;
      c.positioning.hopAnimationTimer = -1;
      c.positioning.hopStartingPosition = c.positioning.globalCenter.x;
    }
    if (!c.isPlayingAnimation) c.positioning.isFlipped = !shouldBeDirectedRight;
    if (!c.exitDoor) {
      c.walkAcceleration = v2();
      if (!(ai.wants.walkRight.value && ai.wants.walkLeft.value) && c.allowWalking) {
        let m = c.isIronSighting ? 0.5 : 1;
        if (ai.wants.walkRight.value) {
          if (!c.constrainsAny(AC.PreventFlip)) c.positioning.isFlipped = !shouldBeDirectedRight;
          if (c.positioning.isFlipped) m *= 0.5;
          c.walkAcceleration = v2(c.positioning.topWalkSpeed * m, 0);
        }
        if (ai.wants.walkLeft.value) {
          if (!c.constrainsAny(AC.PreventFlip)) c.positioning.isFlipped = !shouldBeDirectedRight;
          if (!c.positioning.isFlipped) m *= 0.5;
          c.walkAcceleration = v2(-c.positioning.topWalkSpeed * m, 0);
        }
      }
    }
    if (c.positioning.isFlipped !== prevFlipped) c.needsLookUpdate = true;
    originalPos = { ...c.positioning.head.transform.position };
    ai.panicLevel = clamp(ai.panicLevel - dt, 0, 1);
    for (const k of Object.values(ai.wants)) k.prev = k.value;
    ai.wants.shoot.value = false;
    ai.wants.walkRight.value = false;
    ai.wants.walkLeft.value = false;
    ai.wants.accurateShot.value = false;
    ai.wants.interact.value = false;
    ai.wants.ironSight.value = ai.isDoingAccurateShot;
    if (ai.hasKillTarget && killTargetChar) {
      let newAim = { ...ai.aimingPosition };
      if (c.constrainsAny(AC.FaceForwards)) newAim = add(c.positioning.head.globalPosition, v2(c.positioning.flipScaling * 10000, 0));
      else if (!c.constrainsAny(AC.PreventAiming)) {
        newAim = noiseValue(-113.234, s.clock.time * 0.05, ai.seed) > -30 ? { ...killTargetChar.positioning.head.globalPosition } : { ...killTargetChar.positioning.body.computedVisualCenter };
        if (c.hasWeaponEquipped) {
          const r = v2(noiseValue(s.clock.time * 0.343, ai.seed, 0), noiseValue(s.clock.time * 0.343, -ai.seed, 37.29372));
          newAim = add(newAim, mul(r, (c.stats.aimingRandomness / 2) * dist(ai.aimingPosition, c.positioning.globalCenter)));
        }
        c.relativeAimTargetPosition = sub(ai.aimingPosition, originalPos);
      } else newAim = add(originalPos, c.relativeAimTargetPosition);
      if (c.lifetime < 1) ai.aimingPosition = newAim;
      else ai.aimingPosition = smoothApproachV(ai.aimingPosition, newAim, c.stats.aimingSpeed, dt);
      if (!c.constrainsAny(AC.PreventBlock)) {
        if (c.hasWeaponEquipped && equipped) {
          if (!ai.isDoingAccurateShot && c.stats.canDeflect) {
            if (killTargetChar.hasWeaponOfType('Melee'))
              ai.wants.ironSight.value = noiseValue(ai.seed * 23.323, 1, s.clock.time * 0.2) < 0.5 && killTargetChar.isPlayingAnimationGroup('melee');
            else
              ai.wants.ironSight.value = noiseValue(ai.seed * -23.323, ai.seed, s.clock.time * 0.2) < 0.5
                && (ai.panicLevel > 0 || c.dodgeMeter < c.stats.dodgeAbility) && equipped.data.canDeflectBullets;
          }
        } else ai.wants.ironSight.value = killTargetChar.isPlayingAnimationGroup('melee');
      }
      if (!c.constrainsAll(AC.PreventAllAttacking)) {
        if (equipped) processAttacking(s, c, equipped, killTargetChar);
        else if (!c.constrainsAny(AC.PreventMelee)) {
          ai.attackModeDuration = 0;
          if (!ai.hasItemTarget) {
            if (ai.wantsToPickupWeapon) {
              findItemTarget(s, c);
              if (!ai.hasItemTarget) ai.wantsToPickupWeapon = false;
            } else if (ai.hasKillTarget && timeSafeRandom(s, ai.seed * 0.932) > 0.1) {
              const cv = s.reg.convars;
              if (!ai.tooBusyToAttack) {
                ai.wants.shoot.value = Math.abs(c.positioning.globalCenter.x - ai.aimingPosition.x) < MaxHandRange * 2;
                walkTowards(s, c, ai.aimingPosition.x, cv.enemyMeleeDistance.x, cv.enemyMeleeDistance.y);
              } else {
                ai.wants.shoot.value = false;
                walkTowards(s, c, ai.aimingPosition.x, cv.enemySafeDistanceFromPlayer, s.level ? s.level.levelBounds.maxX - s.level.levelBounds.minX : 6000);
              }
            } else ai.wantsToPickupWeapon = true;
          } else if (!c.constrainsAny(AC.PreventWalking | AC.PreventWorldInteraction)) walkToItem(s, c);
        }
      }
    } else if (ai.hasItemTarget && !equipped) {
      if (!c.constrainsAny(AC.PreventWalking | AC.PreventWorldInteraction)) walkToItem(s, c);
    } else wander(s, c);
  }
}

function walkToItem(_s: Scene, c: Character): void {
  const ai = c.ai!;
  const item = ai.itemTarget!.transform.position;
  if (item.x > c.positioning.globalCenter.x) ai.wants.walkRight.value = true; else ai.wants.walkLeft.value = true;
  if (dist(item, c.positioning.globalCenter) < c.handPickupRange * 2) ai.wants.interact.value = true;
  ai.aimingPosition = { ...item };
}

function wander(s: Scene, c: Character): void {
  const ai = c.ai!;
  const player = s.player;
  if (player && c.faction.isAlliedTo(player.faction)) {
    ai.wanderTargetRemainingTime = randomFloat(2, 20);
    ai.wanderTargetPosition = player.positioning.globalCenter.x;
  } else if (s.level && ai.wanderTargetRemainingTime <= 0) {
    ai.wanderTargetRemainingTime = randomFloat(2, 20);
    const fl = s.level.floorLine;
    ai.wanderTargetPosition = randomFloat(fl[0]?.x ?? 0, fl[fl.length - 1]?.x ?? 0);
  }
  ai.wanderTargetRemainingTime -= s.clock.dt;
  const target = ai.wanderTargetPosition;
  if (Math.abs(target - c.positioning.globalCenter.x) > 400)
    ai.aimingPosition = add(c.positioning.head.globalPosition, v2(Math.sign(target - c.positioning.globalCenter.x) * 1000, 0));
  walkTowards(s, c, target, 0, 1000);
}

function processAttacking(s: Scene, c: Character, w: Weapon, target: Character): void {
  const ai = c.ai!;
  const cv = s.reg.convars;
  const levelWidth = s.level ? s.level.levelBounds.maxX - s.level.levelBounds.minX : 6000;
  if (w.data.weaponType === 'Firearm') {
    if (!c.constrainsAny(AC.PreventShooting)) {
      if (ai.attackModeDuration > c.stats.shootingTimeout && (ai.tooBusyToAttack || Math.abs(ai.aimingPosition.x - c.positioning.globalCenter.x) < 1800)) {
        const barrel = getBarrel(w);
        const ignore = new Set<unknown>(c.attackIgnore);
        for (const b of s.physics.bodies) if ((b.owner as { ignoreLineOfSight?: boolean } | null)?.ignoreLineOfSight) ignore.add(b.owner);
        const hit = s.physics.raycast(barrel.position, barrel.direction, Number.MAX_VALUE, Layers.All, ignore);
        if (hit && (hit.body.owner === target.positioning.head || hit.body.owner === target.positioning.body || ai.tooBusyToAttack)) {
          let shootChance = noiseValue(ai.seed, s.clock.time * 3.412, 0) * 0.5 + 0.5;
          if (ai.tooBusyToAttack) shootChance *= 0.75;
          shootChance *= 0.9;
          const enough = s.clock.time - s.lastAccurateShotTime > AccurateShotWarningDuration;
          if (!ai.tooBusyToAttack && enough && c.stats.accurateShotChance > shootChance * 1.5) ai.wants.accurateShot.value = true;
          else ai.wants.shoot.value = shootChance > 0.5;
        }
      }
    }
    if (ai.tooBusyToAttack) walkTowards(s, c, ai.aimingPosition.x, cv.enemySafeDistanceFromPlayer, levelWidth);
    else {
      const len = target.getWeaponBarrelDistance();
      walkTowards(s, c, ai.aimingPosition.x, Math.max(len, cv.enemyGunDistance.x), Math.max(len, cv.enemyGunDistance.y));
    }
  } else {
    ai.wants.shoot.value = noiseValue(ai.seed, 512.534, s.clock.time * 0.4) > 0
      && Math.abs(c.positioning.globalCenter.x - target.positioning.globalCenter.x) < w.data.range + 200;
    if (!ai.tooBusyToAttack) walkTowards(s, c, ai.aimingPosition.x, w.data.range, cv.enemyMeleeDistance.y);
    else walkTowards(s, c, ai.aimingPosition.x, cv.enemySafeDistanceFromPlayer, levelWidth);
  }
}

function findKillTarget(s: Scene, c: Character): void {
  const ai = c.ai!;
  if (ai.isDocile) { ai.hasKillTarget = false; return; }
  let min = Number.MAX_VALUE;
  let found: Character | null = null;
  for (const o of s.characters) {
    if (o === c || !o.isAlive || !c.faction.isEnemiesWith(o.faction)) continue;
    const d = distSq(c.positioning.globalCenter, o.positioning.globalCenter);
    if (d < min) { min = d; found = o; }
  }
  ai.hasKillTarget = found !== null;
  if (found) ai.killTarget = found;
}

function findItemTarget(s: Scene, c: Character): void {
  const ai = c.ai!;
  if (!ai.allowPickup) return;
  let min = s.reg.convars.enemyWeaponSearchRange ** 2;
  let found: Weapon | null = null;
  for (const w of s.weapons) {
    if (!hasRoundsLeft(w) || w.stuckInside || w.isAttachedToWall || w.thrown || w.wielder) continue;
    if (w.despawnTimer < 1) continue;
    if (!s.level || rectContains(s.level.levelBounds, w.transform.position)) {
      const d = distSq(c.positioning.globalCenter, w.transform.position);
      if (d < min) {
        if (lenSq(w.velocity) > 25 * 25) continue;
        min = d;
        found = w;
      }
    }
  }
  ai.hasItemTarget = found !== null;
  if (found) ai.itemTarget = found;
}

function walkTowards(s: Scene, c: Character, x: number, minimumDistance: number, maximumDistance: number): void {
  const ai = c.ai!;
  const pos = c.positioning.globalCenter;
  const d = Math.abs(pos.x - x);
  ai.wants.walkLeft.value = false;
  ai.wants.walkRight.value = false;
  if (d < minimumDistance && !(s.level ? isCloseToEdge(s.level, pos.x, 1000) : false)) {
    if (x > pos.x) ai.wants.walkLeft.value = true; else ai.wants.walkRight.value = true;
  } else if (d > maximumDistance) {
    if (x < pos.x) ai.wants.walkLeft.value = true; else ai.wants.walkRight.value = true;
  } else if (noiseSimplex(-1439.234, s.clock.time * 0.05, ai.seed) > 0.2) {
    if (noiseValue(0, s.clock.time * 0.25, ai.seed) > 0) ai.wants.walkRight.value = true; else ai.wants.walkLeft.value = true;
  }
}

function pickupNearestWeapon(s: Scene, c: Character): void {
  if (c.pickup || c.hasWeaponEquipped) return;
  let min = c.handPickupRange * c.handPickupRange * c.stats.scale + 150;
  let nearest: Weapon | null = null;
  for (const w of s.weapons) {
    if (w.wielder || !hasRoundsLeft(w) || w.stuckInside || w.isAttachedToWall) continue;
    if (lenSq(w.velocity) > 25 * 25) continue;
    const d = distSq(w.transform.position, c.positioning.globalCenter);
    if (d < min) { min = d; nearest = w; }
  }
  if (!nearest) return;
  let delay = 0;
  if (!c.jumpDodge) {
    c.pickup = { time: 0, duration: 0.4, pickupTime: 0.4, target: nearest, initialTargetRotation: 0, last: v2(), started: false };
    delay = c.pickup.pickupTime * c.pickup.duration;
  }
  c.ai!.wantsToPickupWeapon = false;
  const w = nearest;
  s.delay(delay, () => { if (s.equipWeapon(c, w)) s.audio.play(pickRandom(s.soundFolder('sounds/pickup'))); });
}

/** CharacterMovementSystem.ProcessWalking */
export function processWalking(s: Scene, c: Character): void {
  if (!c.isAlive || c.exitDoor) return;
  const pos = c.positioning;
  const dt = s.clock.dt;
  let noCollide = false;
  if (c.isPlayer && !pos.isFlying) noCollide = s.overlapsWithOpenPortal(c);
  const isWalking = !c.constrainsAny(AC.PreventWalking) && lenSq(c.walkAcceleration) > 1;
  const outOfBounds = (p: Vec2): boolean => !!s.level && !rectContains(s.level.levelBounds, p);
  if (pos.isBusyHopping && isWalking) {
    if (c.stats.walkAnimation && s.reg.animations.has(c.stats.walkAnimation)) {
      const wa = s.reg.anim(c.stats.walkAnimation);
      if (!c.isPlayingAnimationExact(wa)) c.playAnimation(wa, randomFloat(0.9, 1.1));
    }
    const p = { ...pos.globalTarget };
    p.x = lerp(pos.hopStartingPosition, pos.nextHopPosition, Easings.quadInOut(pos.hopAnimationTimer));
    pos.currentHoppingHeight = normalisedSineWave(pos.hopAnimationTimer) * pos.hopTargetHeight * pos.hopAcceleration;
    p.y = pos.currentHoppingHeight;
    pos.globalTarget = p;
    pos.flyingVelocity = 0;
    pos.hopAnimationTimer += dt / pos.hopAnimationDuration;
    if (pos.hopAnimationTimer >= 1) {
      pos.globalTarget = v2(pos.nextHopPosition, 0);
      pos.hopAnimationTimer = -1;
      if (pos.scale > 1) {
        s.audio.play(pickRandom(s.soundFolder('sounds/mag_footstep')), pos.scale * 0.2);
        s.shake((pos.scale - 1) * 2);
      }
    }
  } else if (isWalking) {
    pos.hopAcceleration = clamp(pos.hopAcceleration + 0.4, 0, 1);
    const delta = c.walkAcceleration.x * randomFloat(0.6, 1.2) * pos.hopAcceleration;
    pos.hopAnimationTimer = 0;
    pos.hopTargetHeight = randomFloat(20, 40);
    pos.hopStartingPosition = pos.globalTarget.x;
    const test = v2(pos.globalCenter.x, pos.globalCenter.y + HalfHeight / 3 * pos.scale);
    const inside = !noCollide && (outOfBounds(test) || s.physics.queryPoint(test, Layers.BlockMovement).length > 0);
    if (inside) {
      const escape = s.level ? rectCenter(s.level.levelBounds) : test;
      const dir = normalize(sub(escape, pos.globalCenter));
      c.walkAcceleration.x = dir.x > 0 ? 500 : -500;
      pos.nextHopPosition = pos.globalTarget.x + c.walkAcceleration.x;
      pos.globalTarget = add(pos.globalTarget, v2(c.walkAcceleration.x * 0.2, 0));
    } else {
      const hit = noCollide ? null : s.physics.raycast(test, v2(delta > 0 ? 1 : -1, 0), Math.abs(delta), Layers.BlockMovement);
      pos.nextHopPosition = hit ? hit.position.x + (delta > 0 ? -100 : 100) : pos.globalTarget.x + delta;
    }
  }
  if (isWalking) {
    let speed = 18 / pos.scale;
    if (c.walkAcceleration.x > 0) speed *= -1;
    pos.feet.forEach((foot, i) => {
      const index = pos.isFlipped ? i : i + 1;
      foot.offset = v2(Math.cos(c.lifetime * speed + Math.PI * index) * 10 * pos.hopAcceleration,
        Math.sin(c.lifetime * speed + Math.PI * index) * 10 * pos.hopAcceleration);
    });
  } else {
    pos.hopAnimationTimer = -1;
    pos.globalTarget = v2(pos.globalTarget.x, 0);
    pos.hopAcceleration = 0.1;
    for (const f of pos.feet) f.offset = smoothApproachV(f.offset, v2(), 25, dt);
  }
}

/** JumpDodgeSystem.Update */
export function updateJumpDodge(s: Scene, c: Character): void {
  const j = c.jumpDodge;
  if (!j) return;
  const dt = s.clock.dt;
  j.time += dt;
  if (j.time > j.duration || c.isPlayingAnimationGroup('cutscene')) {
    c.walkAcceleration = { ...j.initialAcceleration };
    c.positioning.hopStartingPosition = c.positioning.globalCenter.x;
    c.positioning.hopAcceleration = 1;
    c.jumpDodge = null;
  } else {
    c.positioning.hopAcceleration = 0;
    c.positioning.hopAnimationTimer = -1;
    if (j.shouldDash) {
      const progress = j.time / j.duration;
      const v = j.initialAcceleration.x > 0 ? 2000 : -2000;
      c.walkAcceleration.x = v * Easings.circOut(clamp(progress));
      const next = add(c.positioning.globalTarget, mul(c.walkAcceleration, dt));
      if (s.physics.queryCircle(c.positioning.body.computedVisualCenter, 150 * c.positioning.scale, Layers.BlockMovement).length === 0)
        c.positioning.globalTarget = next;
    }
  }
}

/** CharacterPickupSystem.Update and its PickupHandPose */
export function updatePickup(s: Scene, c: Character): void {
  const p = c.pickup;
  if (!p) return;
  if (!p.started) {
    p.started = true;
    const f = (p.target.transform.position.x > c.positioning.globalCenter.x) !== c.positioning.isFlipped;
    p.initialTargetRotation = p.target.transform.rotation;
    c.positioning.handPoseFunctionOverride.push(pickupHandPose);
    c.playAnimation(f ? Animations.pickupBehind(s) : Animations.pickupFront(s), 1.2);
  }
  p.time += s.clock.dt;
  if (p.time > p.duration) {
    c.pickup = null;
    const i = c.positioning.handPoseFunctionOverride.indexOf(pickupHandPose);
    if (i >= 0) c.positioning.handPoseFunctionOverride.splice(i, 1);
  }
}
function pickupHandPose(c: Character): void {
  const p = c.pickup;
  if (!p) return;
  const w = p.target;
  if (w.removed) return;
  const pos = c.positioning;
  const mid = p.pickupTime;
  const first = pos.hands[0];
  const second = pos.hands[1];
  {
    const t = p.time / p.duration;
    const tEnter = mapRange(0, mid, 0, 1, t);
    const tExit = mapRange(mid, 1, 1, 0, t);
    const isExit = t > mid;
    const animTime = isExit ? Easings.cubicIn(tExit) : Easings.cubicInOut(tEnter);
    let target: Vec2;
    if (!isExit) {
      target = sub(transformPoint(v2(-w.holdPoints[0].x, -w.holdPoints[0].y), w.transform.localToWorld), pos.globalCenter);
      p.last = target;
      first.look = HandLook.Open;
    } else target = p.last;
    first.posePosition = lerpV(first.posePosition, target, animTime);
    first.poseRotation = lerpAngle(p.initialTargetRotation, first.poseRotation, 1 - animTime);
  }
  {
    const t = p.time / p.duration;
    const tEnter = mapRange(0, mid, 0, 1, t);
    const tExit = mapRange(mid, 1, 1, 0, t);
    const isExit = t > mid;
    const animTime = Easings.circIn(isExit ? Easings.cubicIn(tExit) : Easings.cubicInOut(tEnter));
    const equipped = c.hasWeaponEquipped ? c.equipped : null;
    if (w.holdPoints.length > 1 && !equipped) {
      const target = sub(transformPoint(w.holdPoints[1], w.transform.localToWorld), pos.globalCenter);
      second.posePosition.x = lerp(second.posePosition.x, target.x, animTime * animTime * animTime);
      second.posePosition.y = lerp(second.posePosition.y, target.y, animTime);
    } else if (w.holdPoints.length < 2 || !equipped) {
      const d = c.aimDirection;
      const flip = pos.flipScaling;
      const cd = normalize(v2(Math.sign(d.x) * Math.max(Math.abs(d.x), 0.5), clamp(d.y, -0.2, 0.2)));
      const deg = Math.atan2(cd.y, cd.x) * RAD2DEG;
      const pos1 = mul(rotatePoint(v2(HandOffset1.x, HandOffset1.y * flip), deg), pos.scale);
      const pos2 = mul(rotatePoint(v2(HandOffset2.x, HandOffset2.y * flip), deg), pos.scale);
      second.posePosition = lerpV(second.posePosition, flip < 0 ? pos1 : pos2, Easings.quadInOut(tExit));
    }
  }
}

/** CharacterSystem.Update */
export function updateCharacterSystem(s: Scene, c: Character): void {
  c.currentAttackerCount = 0;
  c.dodgeMeter = Math.min(c.stats.dodgeAbility, c.dodgeMeter);
  if (c.dodgeRegenCooldownTimer <= 1.401298464324817e-45 && c.stats.dodgeAbility > 1.401298464324817e-45) {
    if (c.positioning.isFlying || Math.abs(c.positioning.hopAcceleration) > 0.2)
      c.dodgeMeter = clamp(c.dodgeMeter + s.clock.dt * 0.6, 0, c.stats.dodgeAbility);
  } else c.dodgeRegenCooldownTimer -= s.clock.dt;
  if (c.hasWeaponEquipped) c.equipped!.despawnTimer = 0;
  c.additionalConstraints = 0;
}

/** ImpactOffsetSystem.Update */
export function updateImpactOffsets(s: Scene, c: Character): void {
  for (const part of [c.positioning.head, c.positioning.body]) {
    const io = part.impact;
    io.translation = smoothApproachV(io.translation, v2(), io.decaySpeed, s.clock.dt);
    const m = len(io.translation);
    if (m > 1.401298464324817e-45) io.translation = mul(io.translation, Math.min(m, 120) / m);
    io.rotation = smoothAngleApproach(io.rotation, 0, io.decaySpeed, s.clock.dt);
    io.rotation = Math.max(-25, Math.min(25, io.rotation));
  }
}

/** ExitDoorSystem.Update */
export function updateExitDoor(s: Scene, c: Character): void {
  const e = c.exitDoor;
  if (!e) return;
  const t = e.time / e.duration;
  c.positioning.globalCenter = lerpV(e.start, e.end, Easings.quadOut(t));
  c.positioning.globalTarget = v2(e.end.x, 0);
  if (e.time >= e.duration) {
    c.exitDoor = null;
    c.tint = [1, 1, 1];
  } else {
    const k = Easings.quadOut(t);
    c.tint = [k, k, k];
    e.time += s.clock.dt;
  }
  c.needsLookUpdate = true;
}

export { isFlatAt, dodgeAnimation };
