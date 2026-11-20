// Madness Interactive Reloaded port (GPL-3.0). Fighting: Weapons/Systems/WeaponSystem.cs, BulletEmitter.cs,
// Character/MeleeUtils.cs, Systems/MeleeSequenceSystem.cs, CharacterUtilities.cs (damage, death animations, dodges,
// stuns, throwing), Physics/Systems/VelocitySystem.cs (weapons flying and lying around) and Shared/Animations.cs.
import { AC, type CharacterAnimation } from '../data/animation.ts';
import { AgilitySkillLevel, isFlatAt } from '../data/registry.ts';
import { transformNormal, transformPoint } from '../engine/matrix.ts';
import { Layers, sampleNormal } from '../engine/physics.ts';
import {
  add, clamp, deltaAngle, distSq, len, lerp, mapRange, mul, normalize, pickRandom, pickRandom2, randomFloat, randomInt,
  randomPointInCircle, reflect, smoothApproach, snap, sub, v2, vectorToAngle, type Vec2, RAD2DEG, nanFallback, lenSq,
} from '../engine/util.ts';
import { CharacterFlags, hasRoundsLeft, type BodyPart, type Character, type Weapon } from './character.ts';
import type { Scene } from './scene.ts';

/** Shared/Animations.cs */
export const Animations = {
  dodge: (s: Scene) => [s.reg.anim('dodge_1'), s.reg.anim('dodge_2')],
  fistMeleeHits: (s: Scene) => [s.reg.anim('hit_enemy_1'), s.reg.anim('hit_enemy_2')],
  pickupFront: (s: Scene) => s.reg.anim('pickup_1'),
  pickupBehind: (s: Scene) => s.reg.anim('pickup_2'),
  deathByHeadshot: (s: Scene, behind: boolean) => behind
    ? ['b_headshot_touch_back', 'b_headshot_stumble_for'].map((n) => s.reg.anim(n))
    : ['f_headshot_touch_for', 'f_headshot_touch_for2', 'f_headshot_touch_back', 'f_headshot_touch_back2', 'f_headshot_suffer_for',
      'f_headshot_suffer_for2', 'f_headshot_suffer_back', 'f_headshot_suffer_back2', 'f_headshot_stumble_for', 'f_headshot_stumble_for2',
      'f_headshot_stumble_for3', 'f_headshot_stumble_back', 'f_headshot_stumble_back2', 'f_headshot_stumble_back3', 'f_headshot_pain_for',
      'f_headshot_pain_for2', 'f_headshot_pain_back', 'f_headshot_pain_back2', 'f_headshot_limp_for', 'f_headshot_limp_back',
      'f_headshot_fly_back', 'f_headshot_instafall_back'].map((n) => s.reg.anim(n)),
  deathByThroatshot: (s: Scene, behind: boolean) => (behind ? ['b_throatshot_stumble_for', 'b_throatshot_stumble_back']
    : ['f_throatshot_touch_back', 'f_throatshot_touch_for', 'f_throatshot_suffer_back', 'f_throatshot_stumble_back', 'f_throatshot_stumble_back2',
      'f_throatshot_pain_for', 'f_throatshot_pain_for2', 'f_throatshot_limp_for']).map((n) => s.reg.anim(n)),
  deathByBodyshot: (s: Scene, behind: boolean) => (behind ? ['b_bodyshot_pain_for', 'b_bodyshot_stumble_for']
    : ['f_bodyshot_touch_for', 'f_bodyshot_touch_for2', 'f_bodyshot_suffer_back', 'f_bodyshot_stumble_back', 'f_bodyshot_pain_for']).map((n) => s.reg.anim(n)),
  deathByLegshot: (s: Scene, behind: boolean) => (behind ? ['b_legshot_suffer_back'] : ['f_legshot_pain_back', 'f_legshot_suffer_for']).map((n) => s.reg.anim(n)),
  throwAnim: (s: Scene, flipped: boolean) => s.reg.anim(flipped ? 'throw_right' : 'throw_left'),
  stationaryJump: (s: Scene, a: AgilitySkillLevel) => (a === AgilitySkillLevel.Master ? s.reg.anim('jump_master_stationary') : null),
  backwardsJump: (s: Scene, a: AgilitySkillLevel) => (a === AgilitySkillLevel.Novice ? s.reg.anim('jump_novice_backward')
    : a === AgilitySkillLevel.Adept ? s.reg.anim('jump_adept_backward') : a === AgilitySkillLevel.Master ? s.reg.anim('jump_master_backward') : null),
  forwardsJump: (s: Scene, a: AgilitySkillLevel) => (a === AgilitySkillLevel.Novice ? s.reg.anim('jump_novice_forward')
    : a === AgilitySkillLevel.Adept ? s.reg.anim('jump_adept_forward') : a === AgilitySkillLevel.Master ? s.reg.anim('jump_master_forward') : null),
};
/** DoubleSidedMultiple.PickRandom(bool): FromBehind when true */
const pickSided = (list: CharacterAnimation[]): CharacterAnimation => pickRandom(list);

const SOUNDS = {
  nearMiss: [2, 3, 4, 5].map((i) => `sounds/nearmiss/${i}.wav`),
  bulletDeflection: [1, 2, 3, 4, 5, 6].map((i) => `sounds/deflection/bullet_deflect_${i}.wav`),
  swish: [1, 2, 3].map((i) => `sounds/swish/swish-${i}.wav`),
  jump: [1, 2, 3].map((i) => `sounds/jump/jump-${i}.wav`),
  meleeDodge: [1, 2, 3].map((i) => `sounds/melee_dodge/melee_dodge_${i}.wav`),
  genericPunch: [1, 2, 3].map((i) => `sounds/punch/generic_punch-${i}.wav`),
  livingPunch: ['sounds/punch/generic_punch-1.wav', 'sounds/punch/generic_punch-2.wav', ...[1, 2, 3, 4].map((i) => `sounds/punch/living_punch-${i}.wav`)],
  genericSword: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `sounds/sword/blade_generic_impact_${i}.wav`),
  livingSword: [...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `sounds/sword/blade_generic_impact_${i}.wav`), 'sounds/sword/blade_living_impact_1.wav', 'sounds/sword/blade_living_impact_2.wav'],
  clashBlade: [1, 2, 3, 4, 5].map((i) => `sounds/melee_clash/blade/blade_clash_${i}.wav`),
  clashBlunt: [1, 2, 3, 4].map((i) => `sounds/melee_clash/blunt/blunt_clash_${i}.wav`),
  softBodyImpact: [1, 2, 3, 4, 5].map((i) => `sounds/physics/soft_body_impact_${i}.wav`),
};
export { SOUNDS };

function clashFor(a: Weapon | null, b: Weapon | null): string {
  if (!a && !b) return pickRandom(SOUNDS.genericPunch);
  const at = a?.data.meleeDamageType;
  const bt = b?.data.meleeDamageType;
  if (at === 'Blade' && bt === 'Blade') return pickRandom(SOUNDS.clashBlade);
  if ((at === 'Blunt' || at === 'Axe') && (bt === 'Blunt' || bt === 'Axe')) return pickRandom(SOUNDS.clashBlunt);
  return pickRandom(pickRandom2(SOUNDS.clashBlade, SOUNDS.clashBlunt));
}

/** WeaponSystem.GetBarrel */
export function getBarrel(w: Weapon): { position: Vec2; direction: Vec2 } {
  return { position: transformPoint(w.barrelEndPoint, w.transform.localToWorld), direction: normalize(transformNormal(v2(1, 0), w.transform.localToWorld)) };
}
export const getDamageAtDistance = (damage: number, d: number): number => Math.max((2 * damage) / Math.pow(d, 0.1), damage);

/** WeaponSystem.Update for one weapon (the firearm part; physics is updateWeaponPhysics) */
export function updateWeapon(s: Scene, w: Weapon): void {
  if (w.isAttachedToWall) w.despawnTimer = 0;
  else if (w.wielder) {
    w.timer += s.clock.dt;
    w.isAttachedToWall = false;
    if (w.data.weaponType === 'Firearm') processFirearm(s, w, w.wielder);
  } else if (w.stuckInside) {
    const p = w.stuckInside;
    w.transform.position = transformPoint(p.localOffset, p.parent.localToWorld);
    w.transform.rotation = p.parent.rotation + p.localRotation;
  } else {
    w.transform.localPivot = v2();
    if (!hasRoundsLeft(w) && w.onFloor) w.transform.scale = v2(1, w.isFlipped ? -0.5 : 0.5);
    else w.transform.scale = v2(1, w.isFlipped ? -1 : 1);
  }
  w.isFiring = false;
}

const shouldPump = (w: Weapon): boolean => w.data.isPumpAction && w.timer >= w.data.useDelay * 0.2 && !w.hasBeenPumped && hasRoundsLeft(w);
function pumpAction(s: Scene, w: Weapon): void {
  s.audio.play('sounds/firearms/shotgun_cock.wav');
  for (const p of w.parts) { p.playing = true; p.time = 0; }
  w.hasBeenPumped = true;
}

const infiniteCheat = (s: Scene, c: Character): boolean => c.isPlayer && s.disks.has('infinite_ammo');

/** WeaponSystem.ShootWeapon (telekinesis fires weapons nobody holds) */
export function shootWeapon(s: Scene, w: Weapon, wielder: Character, recoilMultiplier = 1): void {
  if (w.data.weaponType !== 'Firearm') return;
  const cheat = infiniteCheat(s, wielder);
  if (shouldPump(w)) { pumpAction(s, w); if (w.remainingRounds !== w.data.roundsPerMagazine || cheat) s.ejectCasing(w); }
  if (hasRoundsLeft(w) || cheat) {
    emitBulletFrom(s, w, wielder, recoilMultiplier);
    w.hasBeenPumped = false;
    if (!hasRoundsLeft(w) && !cheat && !w.data.isPumpAction)
      w.parts.forEach((p, i) => { const a = w.instr.animatedParts[i]; p.playing = false; p.time = a.outOfAmmoKeyframeTime * a.duration; });
  }
}

function processFirearm(s: Scene, w: Weapon, wielder: Character): void {
  const d = w.data;
  const cheat = infiniteCheat(s, wielder);
  if (shouldPump(w)) {
    pumpAction(s, w);
    if (w.remainingRounds !== d.roundsPerMagazine || cheat) s.ejectCasing(w);
  }
  if (w.isFiring && w.timer >= d.useDelay && (hasRoundsLeft(w) || cheat)) {
    if (!d.automatic && d.burstFireCount > 1) {
      if (!w.isBusyBurstFiring) {
        w.isBusyBurstFiring = true;
        for (let i = 0; i < d.burstFireCount; i++) s.delay(i * d.useDelay, () => emitBulletFrom(s, w, wielder));
        s.delay((d.burstFireCount + 1) * d.useDelay, () => { w.isBusyBurstFiring = false; });
      }
    } else emitBulletFrom(s, w, wielder);
    w.hasBeenPumped = false;
    if (!hasRoundsLeft(w) && !cheat) {
      if (wielder.isPlayer) s.audio.play('sounds/out_of_ammo.wav');
      // the slide stays back: OutOfAmmoKeyframeTime of each animated part
      if (!d.isPumpAction) w.parts.forEach((p, i) => { const a = w.instr.animatedParts[i]; p.playing = false; p.time = a.outOfAmmoKeyframeTime * a.duration; });
    }
  }
}

function emitBulletFrom(s: Scene, w: Weapon, wielder: Character, recoilMultiplier = 1): void {
  const d = w.data;
  const infinite = w.infiniteAmmo || infiniteCheat(s, wielder);
  if ((!infinite && !hasRoundsLeft(w)) || w.removed) return;
  if (infinite) w.remainingRounds++; else w.remainingRounds--;
  w.timer = 0;
  const barrel = getBarrel(w);
  if (d.shootSounds.length > 0) {
    const sound = pickRandom(d.shootSounds);
    let volume = 1;
    if (!infinite && wielder.isPlayer) {
      const r = (w.remainingRounds / d.roundsPerMagazine) / 0.5;
      if (r < 1) {
        s.audio.play('sounds/low_ammo_warn.wav', (1 - r) * 0.9);
        volume = lerp(r, 1, 0.8);
      }
    }
    s.audio.play(sound, volume);
  }
  const size = clamp(d.damage * 2.5 * randomFloat(0.8, 1.2) * d.bulletsPerShot, 1.5, 3.3);
  s.effects.muzzleFlash(add(barrel.position, mul(barrel.direction, 80 * size)), Math.atan2(barrel.direction.y, barrel.direction.x) * RAD2DEG, size);
  if (!d.isPumpAction) s.ejectCasing(w);
  wielder.positioning.currentRecoil += d.recoil * recoilMultiplier;
  if (!d.isPumpAction) for (const p of w.parts) { p.playing = true; p.time = 0; }
  for (let i = 0; i < d.bulletsPerShot; i++) {
    const dir = add(barrel.direction, mul(randomPointInCircle(), 1 - d.accuracy));
    s.shake(d.damage * 4);
    castBulletRay(s, {
      origin: barrel.position, direction: dir, isCosmetic: false, clusterSize: d.bulletsPerShot, damage: d.damage,
      enemyCollisionLayer: wielder.enemyCollisionLayer, ignore: wielder.attackIgnore,
      canBeDeflected: d.canBulletsBeDeflected && d.bulletsPerShot === 1, canBeAutoDodged: !wielder.attacksCannotBeAutoDodged,
      originCharacter: wielder, originWeapon: w,
    }, 0, 0);
  }
}

export interface BulletParameters {
  origin: Vec2; direction: Vec2; isCosmetic: boolean; clusterSize: number; damage: number; enemyCollisionLayer: number;
  ignore: ReadonlySet<unknown>; canBeDeflected: boolean; canBeAutoDodged: boolean; originCharacter: Character | null; originWeapon: Weapon | null;
}
const bulletHoleSize = (dist: number, damage: number, n: number): number => (0.1 + getDamageAtDistance(damage, dist) * 0.07) * lerp(n, 1, 0.55);

/** BulletEmitter.CastBulletRay */
export function castBulletRay(s: Scene, pp: BulletParameters, totalDistance: number, iteration: number): void {
  if (iteration >= 8) return;
  const origin = pp.origin;
  const dir = pp.direction;
  const ph = s.physics;
  let isExitWound = ph.queryPoint(add(origin, mul(dir, 5)), pp.enemyCollisionLayer, pp.ignore).length > 0;
  const hit = ph.raycast(origin, dir, Number.MAX_VALUE, (pp.enemyCollisionLayer | Layers.BlockBullets) >>> 0, pp.ignore);
  if (!hit) { s.effects.tracer(origin, add(origin, mul(normalize(dir), 10000))); return; }
  totalDistance += hit.distance;
  s.effects.tracer(origin, hit.position);
  if ((hit.body.filterBits & Layers.BlockBullets) === Layers.BlockBullets) {
    if (ph.queryPoint(hit.position, Layers.DecalZone).length > 0) s.effects.bulletHole(hit.position, vectorToAngle(hit.normal), 50);
  }
  if (len(sub(origin, hit.position)) < 5) isExitWound = false;
  if (pp.isCosmetic && iteration > 1) return;
  const part = hit.body.owner as BodyPart | null;
  const isBodyPart = !!part && typeof part === 'object' && 'character' in part && 'isHead' in part;
  const victim = isBodyPart ? part.character : null;
  const hitTransform = isBodyPart ? part.transform : null;
  const localPoint = hitTransform ? transformPoint(hit.position, hitTransform.worldToLocal) : v2();
  const victimIsPlayer = !!victim?.isPlayer;
  if (victimIsPlayer && s.disks.has('god')) return;
  const cv = s.reg.convars;
  let hasDodged = false;
  if (victim && victim.isAlive) {
    const isDodging = victim.constrainsAny(AC.PreventBeingShot);
    if (isDodging || victim.hasFlag(CharacterFlags.Invincible)) {
      hasDodged = true;
      if (!victimIsPlayer) victim.drainDodge(0.005);
    }
    let canDodge = victim.hasDodge() && !isDodging;
    if (canDodge && victim.ai) victim.ai.panicLevel += cv.panicMultiplier * victim.stats.panicIntensity;
    let willDeflect = pp.clusterSize === 1 && (dir.x > 0) === victim.positioning.isFlipped;
    const deflectingWeapon = canDodge && victim.isMeleeBlocking && victim.hasWeaponEquipped && !!victim.equipped?.data.canDeflectBullets && pp.canBeDeflected;
    const armourChance = part === victim.positioning.head ? victim.look.headDeflectionChance() : victim.look.bodyDeflectionChance();
    const deflectingArmour = !victim.look.cosmetic && armourChance > randomFloat();
    willDeflect = willDeflect && (deflectingArmour || deflectingWeapon);
    if (willDeflect) {
      if (deflectingWeapon) victim.drainDodge(cv.deflectDodgeCost * pp.damage);
      if (victim.hasDodge() || victim.stats.dodgeOversaturate) {
        const perfect = deflectingWeapon && !pp.canBeAutoDodged && victim.positioning.meleeBlockProgress < 1;
        if (pp.canBeAutoDodged || perfect) {
          let hitPosOnLine = hit.position;
          if (deflectingWeapon) {
            hitPosOnLine = closestPointOnLine(victim.deflectionLine.a, victim.deflectionLine.b, hit.position);
            victim.positioning.meleeBlockImpactIntensity += randomFloat(-1, 1);
          }
          if (perfect) {
            if (pp.originCharacter) { pp.originCharacter.dodgeMeter = -1; pp.originCharacter.dodgeRegenCooldownTimer = 10; }
            victim.dodgeMeter = victim.stats.dodgeAbility;
            victim.positioning.meleeBlockProgress = 1;
            victim.positioning.meleeBlockImpactIntensity += 1;
            victim.positioning.currentRecoil += 2;
            s.audio.play('sounds/deflection/perfect_deflect_1.wav', 2);
            s.routineFor(0.5, (dt) => { s.clock.timeScale = smoothApproach(s.clock.timeScale, 1, 1, dt); });
            s.delay(0.05, () => { s.clock.timeScale = 0.2; });
            s.delay(0.5, () => { s.clock.timeScale = 1; });
          } else s.audio.play(pickRandom(SOUNDS.bulletDeflection), 0.5);
          if (deflectingArmour && victim.isAlive && victim.hasFlag(CharacterFlags.StunAnimationOnNonFatalAttack)) {
            if ((dir.x < 0) === victim.positioning.isFlipped) victim.playAnimation(s.reg.anim('stun_light_forwards'), 1.2);
            else victim.playAnimation(s.reg.anim('stun_light_backwards'), 1.2);
          }
          const returnDir = perfect
            ? normalize(sub(pp.originCharacter?.positioning.head.globalPosition ?? pp.origin, hitPosOnLine))
            : normalize(v2(dir.x * -1, dir.y * randomFloat(-12, 12)));
          s.delay(0.05, () => castBulletRay(s, {
            ...pp, origin: hitPosOnLine, direction: returnDir, originCharacter: victim, enemyCollisionLayer: victim.enemyCollisionLayer,
            ignore: victim.attackIgnore, canBeAutoDodged: true,
          }, totalDistance, iteration + 1));
          s.effects.deflectionSpark(hitPosOnLine, vectorToAngle(returnDir), 1);
          return;
        }
      }
    } else if (canDodge) {
      const fromFacing = (dir.x > 0) === victim.positioning.isFlipped;
      let cost = Math.max(pp.damage, 0.4) / 1.5 * (victim.stats.dodgeOversaturate ? 1 : pp.clusterSize);
      if (!fromFacing) cost *= cv.dodgeFromBehindCostMultiplier;
      const dsq = distSq(hit.position, origin);
      if (!victimIsPlayer) {
        const pb = cv.pointBlankDistance;
        if (dsq < pb * pb) { if (!victim.stats.dodgeOversaturate) cost *= cv.dodgePointBlankCostMultiplier; } else
          cost /= mapRange(1600 * 1600, 2500 * 2500, 1, 8, clamp(dsq, 1600 * 1600, 2500 * 2500));
      }
      victim.drainDodge(cost);
      const shouldJumpDodge = victim.stats.agilitySkillLevel !== AgilitySkillLevel.None && !victimIsPlayer && randomFloat() < cv.jumpDodgeChance;
      canDodge = victim.hasDodge() || victim.stats.dodgeOversaturate || shouldJumpDodge;
      if (canDodge && pp.canBeAutoDodged) {
        if (shouldJumpDodge) tryJumpDodge(s, victim); else dodgeAnimation(s, victim);
        if (victimIsPlayer) s.audio.play(pickRandom(SOUNDS.nearMiss), 1);
        hasDodged = true;
      }
    }
  }
  if (hasDodged) { castBulletRay(s, { ...pp, origin: hit.position }, totalDistance, iteration + 1); return; }
  if (victim && !victim.hasFlag(CharacterFlags.AttackResponseBullet)) return;
  // IsShotTriggerComponent (turrets, the train engine, the holy shield)
  const trig = hit.body.owner as { onShot?: (e: import('./extras.ts').HitEvent & { params?: BulletParameters }) => void } | null;
  if (trig && typeof trig === 'object' && trig.onShot) trig.onShot({ point: hit.position, normal: hit.normal, direction: dir, damage: pp.damage, isCosmetic: pp.isCosmetic, weapon: pp.originWeapon, params: pp });
  if (isBodyPart && part.renderer.hflip) localPoint.x *= -1;
  if (victim && part) {
    if (victim.isAlive && totalDistance < 300 && randomFloat() > 0.95) s.audio.play('sounds/splatter.wav', 1, randomFloat(0.95, 1.05));
    if (part === victim.positioning.head && randomFloat() > 0.5) {
      const orig = victim.look;
      victim.look = orig.copy();
      orig.headLayers.forEach((l, i) => {
        if (l?.brokenKeys?.length) victim.look.headLayers[i] = s.reg.armour.get(pickRandom(l.brokenKeys)) ?? l;
      });
      victim.needsLookUpdate = true;
    }
    const rot = 3 * (dir.x > 0 ? 1 : -1);
    if (localPoint.y > part.transform.localRotationPivot.y) part.impact.rotation += -rot; else part.impact.rotation += rot;
    part.impact.translation = add(part.impact.translation, mul(dir, 6));
    const wasAlive = victim.isAlive;
    if (!victim.isAlive && victim.ragdoll) victim.ragdoll.push(part, mul(dir, pp.damage));
    if (randomFloat() > 0.7) s.effects.bloodSplat(hit.position, randomFloat(-25, 25) + vectorToAngle(dir), victim.look.bloodColour, randomFloat(250, 400));
    doGunDamage(s, getDamageAtDistance(pp.damage, totalDistance), part, victim, dir, localPoint);
    if (pp.originCharacter?.isPlayer && wasAlive && !victim.isAlive) s.campaignStat('kill');
    if (victim.ai) victim.ai.panicLevel += 0.25;
    // BodyPartShapeComponent: the wound, the blood spurt, and the bullet going on through the body
    const scaleSq = victim.positioning.scale ** 2;
    let size = bulletHoleSize(totalDistance, pp.damage, pp.clusterSize) / (iteration + 1) * (isExitWound ? 2 : 0.5);
    if (pp.isCosmetic) size *= 0.5;
    size /= scaleSq;
    size = s.addWound(part, localPoint, size);
    s.effects.bloodSpurt(hit.position, Math.atan2(dir.y, dir.x) * RAD2DEG, victim.look.bloodColour, clamp(size * 4, 1, 1.4));
    const cosmetic = getDamageAtDistance(pp.damage, totalDistance) / (iteration + 1) < 0.4;
    castBulletRay(s, { ...pp, origin: hit.position, isCosmetic: cosmetic }, totalDistance, iteration + 1);
    if (victim.hasFlag(CharacterFlags.StunAnimationOnNonFatalAttack) && victim.isAlive && !isExitWound) {
      if ((dir.x < 0) === victim.positioning.isFlipped) victim.playAnimation(s.reg.anim('stun_light_forwards'), 1.2);
      else victim.playAnimation(s.reg.anim('stun_light_backwards'), 1.2);
    }
  }
}

export function closestPointOnLine(a: Vec2, b: Vec2, p: Vec2): Vec2 {
  const ab = sub(b, a);
  const l2 = ab.x * ab.x + ab.y * ab.y;
  if (l2 === 0) return a;
  const t = clamp(((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2);
  return add(a, mul(ab, t));
}

/** CharacterUtilities.UpdateAliveStatus */
export function updateAliveStatus(c: Character): void {
  if (c.constrainsAny(AC.PreventDying)) return;
  if (c.positioning.head.health <= 1.401298464324817e-45 || c.positioning.body.health <= 1.401298464324817e-45) c.kill();
}

/** CharacterUtilities.DoGunDamage */
function doGunDamage(s: Scene, damage: number, part: BodyPart, c: Character, dir: Vec2, local: Vec2): void {
  part.damage(damage);
  if (!c.hasBeenRagdolled) {
    updateAliveStatus(c);
    if (!c.isAlive && !c.hasFlag(CharacterFlags.NoRagdoll)) tryStartDeathAnimation(s, c, dir, local, 0.8);
  }
}

/** CharacterUtilities.TryStartDeathAnimation */
export function tryStartDeathAnimation(s: Scene, c: Character, dir: Vec2, local: Vec2, chance = 0.5): void {
  if (c.constrainsAny(AC.PreventDying)) return;
  c.allowWalking = false;
  c.kill();
  if (c.constrainsAny(AC.PreventDeathAnimation) || c.positioning.isFlying || c.isPlayingAnimationGroup('deaths')) {
    const a = c.mainAnimation;
    if (c.positioning.isFlying || (a && !c.constrainsAny(AC.PreventRagdoll) && a.unscaledTimer > a.animation.totalDuration * 0.2)) s.turnIntoRagdoll(c);
    return;
  }
  const head = c.positioning.head;
  const body = c.positioning.body;
  const headMore = head.health / head.maxHealth < body.health / body.maxHealth;
  const intensity = 1 / Math.max(0.01, Math.min(head.health, body.health) + 1);
  const behind = (dir.x > 0) === c.positioning.isFlipped;
  if (headMore && randomFloat() > 0.8) s.ejectHeadDecorations(c);
  const play = (anim: CharacterAnimation): void => {
    s.dropWeapon(c);
    if (s.level && !isFlatAt(s.level, c.positioning.globalCenter.x)) { s.turnIntoRagdoll(c); return; }
    c.stopAllAnimations();
    c.playAnimation(anim, 1);
    s.routineFor(anim.totalDuration, () => {
      const flat = s.level ? isFlatAt(s.level, c.positioning.body.computedVisualCenter.x) : true;
      if (!flat && !c.constrainsAny(AC.PreventRagdoll)) s.turnIntoRagdoll(c);
    });
    s.delay(anim.totalDuration, () => {
      if (!c.hasBeenRagdolled && !c.removed) {
        if (c.isPlayer) s.turnIntoRagdoll(c);
        else { s.stamp(c); s.deleteCharacter(c); }
      }
    });
  };
  if (intensity > 1.25 && randomFloat() > 1 - chance) {
    if (headMore) {
      if (randomFloat() > 1 - chance) { play(pickSided(Animations.deathByHeadshot(s, behind))); return; }
    } else {
      let list = local.y < 0 ? Animations.deathByLegshot(s, behind) : Animations.deathByThroatshot(s, behind);
      if (Math.abs(local.y) < 0.2) list = Animations.deathByBodyshot(s, behind);
      play(pickSided(list));
      return;
    }
  }
  if (!c.constrainsAny(AC.PreventRagdoll)) s.turnIntoRagdoll(c);
}

/** CharacterUtilities.StunHeavy */
export function stunHeavy(s: Scene, c: Character, facingImpact: boolean): void {
  if (c.positioning.isFlying) return;
  if (!s.level || !isFlatAt(s.level, c.positioning.globalCenter.x)) return;
  if (!c.hasFlag(CharacterFlags.StunAnimationOnNonFatalAttack)) return;
  c.melee = null;
  const dir = facingImpact === c.positioning.isFlipped ? 1 : -1;
  if (s.physics.raycast(c.positioning.body.computedVisualCenter, v2(dir, 0), 800, Layers.BlockMovement | Layers.BlockPhysics)) {
    c.playAnimation(s.reg.anim(facingImpact ? 'stun_wall_heavy_backwards' : 'stun_wall_heavy_forwards'));
    return;
  }
  c.playAnimation(s.reg.anim(facingImpact ? pickRandom2('stun_heavy_backwards', 'stun_heavy_backwards2') : 'stun_heavy_forwards'));
}

/** CharacterUtilities.TryJumpDodge */
export function tryJumpDodge(s: Scene, c: Character): void {
  if (c.constrainsAny(AC.PreventDodge)) return;
  c.melee = null;
  const walking = Math.abs(c.walkAcceleration.x) > 0.1;
  const a = c.stats.agilitySkillLevel;
  let anim: CharacterAnimation | null;
  if (c.positioning.isFlying) {
    anim = walking ? s.reg.anim((c.walkAcceleration.x > 0) === c.positioning.isFlipped ? 'jump_flight_backward' : 'jump_flight_forward') : s.reg.anim('jump_flight_stationary');
  } else if (walking) anim = (c.walkAcceleration.x > 0) === c.positioning.isFlipped ? Animations.backwardsJump(s, a) : Animations.forwardsJump(s, a);
  else anim = Animations.stationaryJump(s, a);
  if (!anim) return;
  const master = a === AgilitySkillLevel.Master;
  if (!master && s.level && !isFlatAt(s.level, c.positioning.globalTarget.x)) { dodgeAnimation(s, c); return; }
  if (walking) {
    const range = 800;
    const targetX = c.positioning.globalTarget.x + (c.walkAcceleration.x > 0 ? range : -range);
    if (!master && s.level && !isFlatAt(s.level, targetX)) { dodgeAnimation(s, c); return; }
    if (s.physics.raycast(c.positioning.body.globalPosition, c.walkAcceleration, range, Layers.BlockMovement)) { dodgeAnimation(s, c); return; }
  }
  c.playAnimation(anim, 1);
  c.drainDodge(1 / 4);
  c.jumpDodge = { animation: anim, duration: c.stats.jumpDodgeDuration, initialAcceleration: { ...c.walkAcceleration }, shouldDash: walking, time: 0 };
  s.audio.play(pickRandom(SOUNDS.jump), 0.3);
}

export const canDodge = (c: Character): boolean => (c.hasFlag(CharacterFlags.Invincible) ? true : c.constrainsAny(AC.PreventDodge) ? false : c.hasDodge());

/** CharacterUtilities.TryDodgeAnimation */
export function dodgeAnimation(s: Scene, c: Character): void {
  if (c.hasFlag(CharacterFlags.Invincible) || c.constrainsAny(AC.PreventDodge)) return;
  const list = Animations.dodge(s);
  c.playAnimation(list[c.animationFlipFlop % list.length], 1 / ((c.stats.scale + 1) / 2));
  c.animationFlipFlop++;
}

/** CharacterUtilities.TryThrowWeapon */
export function tryThrowWeapon(s: Scene, c: Character): boolean {
  if (!c.isAlive || !c.hasWeaponEquipped) return false;
  if (c.isPlayingAnimation && c.constrainsAny(AC.PreventThrowing)) return false;
  const speed = 1.3;
  const a = Animations.throwAnim(s, c.positioning.isFlipped);
  c.playAnimation(a, speed);
  s.delay(a.totalDuration / speed * 0.5, () => {
    if (!c.isAlive || !c.hasWeaponEquipped) return;
    const w = c.equipped!;
    w.thrown = { damage: w.data.throwableDamage, heavy: w.data.throwableHeavy, thrower: c, hitLayer: (Layers.BlockPhysics | c.enemyCollisionLayer) >>> 0 };
    w.ignore = c.attackIgnore;
    s.dropWeapon(c);
    w.wielder = null;
    const delta = sub(c.aimTargetPosition, c.positioning.head.globalPosition);
    const dir = normalize(delta);
    let distanceToTarget: number;
    const hit = s.physics.raycast(w.transform.position, dir, 15000, (c.enemyCollisionLayer | Layers.BlockPhysics) >>> 0, c.attackIgnore);
    distanceToTarget = hit ? hit.distance : len(delta);
    const throwSpeed = 1e4 * 0.8;
    w.overrideVelocity = mul(dir, throwSpeed);
    s.audio.play(pickRandom(SOUNDS.swish));
    if (w.data.weaponType === 'Melee') {
      if (w.data.meleeDamageType === 'Blade' || w.data.meleeDamageType === 'Blunt') {
        const target = vectorToAngle(dir) + (c.positioning.isFlipped ? 90 : -90);
        w.rotationalVelocity = deltaAngle(w.transform.rotation, target) / (distanceToTarget / throwSpeed);
      } else if (w.data.meleeDamageType === 'Axe') {
        const target = vectorToAngle(dir);
        w.rotationalVelocity = (deltaAngle(w.transform.rotation, target) + (c.positioning.isFlipped ? 360 : -360) * 1.2) / (distanceToTarget / throwSpeed);
      }
    } else w.rotationalVelocity = w.measuredRotation;
  });
  return true;
}

declare module './character.ts' {
  interface Weapon { overrideVelocity?: Vec2 | null; ignore?: ReadonlySet<unknown>; wasOnFloor?: boolean; acceleration?: Vec2; rotationalAcceleration?: number; physPos?: Vec2; physRot?: number; lastPos?: Vec2; lastRot?: number }
}

/** VelocitySystem.FixedUpdate for a weapon (60 per second) */
export function weaponPhysicsStep(s: Scene, w: Weapon, fixedDt: number): void {
  const enabled = !w.wielder && !w.stuckInside && !w.isAttachedToWall;
  if (!enabled || w.physPos === undefined) {
    w.physPos = { ...w.transform.position }; w.lastPos = { ...w.transform.position };
    w.physRot = w.transform.rotation; w.lastRot = w.transform.rotation;
    w.acceleration = v2(); w.rotationalAcceleration = 0;
    if (!enabled) return;
  }
  const ph = s.physics;
  const projectile = w.thrown;
  const layerMask = projectile && !projectile.heavy ? projectile.hitLayer : Layers.BlockPhysics;
  w.lastPos = { ...w.physPos! };
  w.lastRot = w.physRot!;
  let isProjectile = !!projectile;
  const acc = w.acceleration ?? v2();
  acc.y += projectile && !projectile.heavy ? -10 : -120;
  if (w.overrideVelocity) { w.velocity = { ...w.overrideVelocity }; w.overrideVelocity = null; acc.x = 0; acc.y = 0; } else {
    w.velocity = add(w.velocity, acc);
    w.rotationalVelocity += w.rotationalAcceleration ?? 0;
  }
  let vel = mul(w.velocity, 0.025);
  let mag = len(vel);
  let floorNormal = v2(1, 0);
  let onSurface = false;
  if (projectile && projectile.heavy && mag > 50) {
    const rh = ph.raycast(w.physPos!, vel, mag, projectile.hitLayer, w.ignore);
    if (rh) { processThrowable(s, w, rh); w.velocity = mul(w.velocity, 0.8); vel = mul(vel, 0.8); mag *= 0.8; }
  }
  if (w.thrown && mag < 20) w.thrown = null;
  const hit = mag > 0 ? ph.raycast(w.physPos!, vel, mag, layerMask, w.ignore) : null;
  if (hit) {
    if (isProjectile && w.thrown && !w.thrown.heavy && mag > 50) processThrowable(s, w, hit);
    else isProjectile = false;
    floorNormal = hit.normal;
    w.rotationalVelocity *= -1;
    w.velocity = mul(reflect(w.velocity, hit.normal), randomFloat(0.1, 0.4));
    if (!w.wasOnFloor && mag > 20) {
      const folder = w.data.weaponType === 'Firearm' ? 'sounds/weapon_drop/firearm' : 'sounds/weapon_drop/sword';
      s.audio.play(pickRandom(s.soundFolder(folder)), mapRange(20, 150, 0.2, 1, mag), randomFloat(0.98, 1.02));
    }
    onSurface = true;
  } else {
    const inside = ph.queryPoint(add(w.physPos!, vel), layerMask, w.ignore);
    if (inside.length === 0) w.physPos = add(w.physPos!, vel);
    else {
      floorNormal = sampleNormal(inside[0].collider, w.physPos!);
      onSurface = true;
      w.physPos = add(w.physPos!, mul(floorNormal, 5));
      w.velocity = v2();
    }
  }
  if (onSurface) {
    if (isProjectile && w.thrown) w.thrown = null;
    let floorAngle = nanFallback(vectorToAngle(floorNormal) - 90);
    floorAngle += w.instr.onFloorAngle;
    const target = snap(w.physRot! - floorAngle, 180) + floorAngle;
    w.rotationalVelocity += deltaAngle(w.physRot!, target) * 10;
    w.rotationalVelocity = smoothApproach(w.rotationalVelocity, 0, 25, fixedDt);
  }
  w.rotationalVelocity *= 0.9995;
  w.velocity = mul(w.velocity, 0.9995);
  w.physRot = w.physRot! + 0.025 * w.rotationalVelocity;
  w.acceleration = v2();
  w.rotationalAcceleration = 0;
  w.onFloor = lenSq(sub(w.physPos!, w.lastPos)) <= 1.401298464324817e-45;
  w.wasOnFloor = onSurface;
}

/** VelocitySystem.Update: interpolate between fixed steps */
export function weaponPhysicsInterpolate(w: Weapon, t: number): void {
  if (w.wielder || w.stuckInside || w.isAttachedToWall || w.physPos === undefined) return;
  w.transform.position = v2(lerp(w.lastPos!.x, w.physPos.x, t), lerp(w.lastPos!.y, w.physPos.y, t));
  w.transform.rotation = lerp(w.lastRot!, w.physRot!, t);
}

function processThrowable(s: Scene, w: Weapon, hit: import('../engine/physics.ts').RayHit): void {
  const proj = w.thrown!;
  const part = hit.body.owner as BodyPart;
  if (!part || typeof part !== 'object' || !('character' in part)) return;
  part.impact.translation = add(part.impact.translation, mul(hit.normal, -20));
  const c = part.character;
  if (!c.hasFlag(CharacterFlags.AttackResponseThrownProjectile)) return;
  if (c.constrainsAll(AC.PreventAllDamage)) return;
  let damage = proj.damage * 0.009;
  let stuck = false;
  if (w.data.throwableSharpBoxes.length > 0) {
    // the original tests its sharp boxes against the body part; the port counts any hit of a sharp weapon
    for (let i = 0; i < 4; i++) s.effects.bloodSpurt(hit.position, vectorToAngle(hit.normal), c.look.bloodColour, 1.5);
    s.audio.play(pickRandom(SOUNDS.livingSword));
    stuck = true;
    w.stuckInside = { parent: part.transform, localOffset: transformPoint(w.physPos!, part.transform.worldToLocal), localRotation: w.physRot! - part.transform.rotation };
    damage *= 80;
    s.addWound(part, transformPoint(hit.position, part.transform.worldToLocal), 0.1);
  }
  if (c.hasWeaponEquipped) {
    const dropped = c.equipped!;
    s.dropWeapon(c);
    s.delay(0.01, () => {
      dropped.acceleration = add(dropped.acceleration ?? v2(), mul(v2(c.positioning.isFlipped ? -1 : 1, 1.2), 1500));
      dropped.rotationalAcceleration = (dropped.rotationalAcceleration ?? 0) + randomFloat(-1000, 1000);
    });
  }
  part.damage(damage);
  updateAliveStatus(c);
  if (c.isAlive) stunHeavy(s, c, c.positioning.isFlipped === hit.normal.x < 0);
  else {
    if (proj.thrower?.isPlayer) s.campaignStat('kill');
    const local = transformPoint(hit.position, part.transform.worldToLocal);
    if (part.renderer.hflip) local.x *= -1;
    tryStartDeathAnimation(s, c, mul(hit.normal, -1), local, 0.9);
  }
  w.rotationalVelocity *= -0.3;
  if (!stuck) s.audio.play(pickRandom(c.isAlive ? SOUNDS.livingPunch : SOUNDS.genericPunch));
  else w.thrown = null;
}

/** MeleeUtils.GetMeleeAnimationSpeedFor */
const meleeSpeed = (c: Character): number => clamp(c.stats.meleeSkill * 1.5 + 0.5, 1, 3) / c.stats.scale;

/** MeleeUtils.TryPerformMeleeAttack */
export function tryPerformMeleeAttack(s: Scene, w: Weapon | null, c: Character): void {
  if (c.constrainsAny(AC.PreventMelee)) return;
  const speed = meleeSpeed(c);
  c.animationFlipFlop++;
  if (c.melee) c.melee.canContinue = true;
  else if (c.stats.unarmedSeq.length > 0) {
    let seq = pickRandom(c.stats.unarmedSeq);
    if (w) {
      switch (w.data.meleeDamageType) {
        case 'Blade': seq = pickRandom(c.stats.swordSeq); break;
        case 'Axe': seq = pickRandom(c.stats.bluntSeq); break;
        case 'Firearm': seq = pickRandom(w.holdPoints.length === 2 ? c.stats.twoHandedGunSeq : c.stats.oneHandedGunSeq); break;
        case 'Blunt': seq = pickRandom(w.holdPoints.length === 2 ? c.stats.twoHandedSeq : c.stats.bluntSeq); break;
      }
    }
    const keys = s.reg.melee.get(seq);
    if (!keys) return;
    c.melee = { keys, currentIndex: 0, isComplete: false, canContinue: false, speed, hitframesSpent: 0, animationTimer: 0, lastAnim: null };
  }
}

/** the highest key count of an active animation (ActiveCharacterAnimation.MaxKeyCount) */
function maxKeyCount(a: CharacterAnimation): number {
  let m = 0;
  for (const h of a.hands ?? []) m = Math.max(m, h.translation?.length ?? 0, h.rotation?.length ?? 0);
  if (a.head) m = Math.max(m, a.head.translation?.length ?? 0, a.head.rotation?.length ?? 0);
  if (a.body) m = Math.max(m, a.body.translation?.length ?? 0, a.body.rotation?.length ?? 0);
  return m;
}

/** MeleeSequenceSystem.Update for one character */
export function updateMeleeSequence(s: Scene, c: Character): void {
  const comp = c.melee;
  if (!comp) return;
  if (comp.isComplete) { c.melee = null; return; }
  const keyIndex = comp.currentIndex % comp.keys.length;
  const key = comp.keys[keyIndex];
  if (c.constrainsAny(AC.PreventMelee)) { c.melee = null; return; }
  if (comp.lastAnim && comp.animationTimer < comp.lastAnim.animation.totalDuration * 0.99) {
    const melee = comp.lastAnim;
    const frame = Math.ceil(comp.animationTimer / melee.animation.totalDuration * maxKeyCount(melee.animation));
    if (comp.hitframesSpent < key.hitFrames.length && frame >= key.hitFrames[comp.hitframesSpent]) {
      s.audio.play(pickRandom(SOUNDS.swish), 0.3, randomFloat(0.9, 1.2));
      processHitFrame(s, c, keyIndex === comp.keys.length - 1);
    }
    if (comp.animationTimer > melee.animation.totalDuration * 0.9 && !comp.canContinue) { comp.isComplete = true; return; }
    if (frame >= key.transitionFrame) {
      if (comp.currentIndex + 1 === comp.keys.length) { comp.isComplete = true; return; }
      if (comp.canContinue) { comp.lastAnim = null; comp.currentIndex++; }
    }
    comp.animationTimer += s.clock.dt * melee.speed;
  } else {
    comp.canContinue = false;
    comp.hitframesSpent = 0;
    comp.lastAnim = c.playAnimation(!c.positioning.isFlipped ? key.right : key.left, comp.speed);
    comp.animationTimer = 0;
  }
}

function processHitFrame(s: Scene, c: Character, finalAttack: boolean): void {
  c.melee!.hitframesSpent++;
  const center = c.aimOrigin;
  const dir = c.aimDirection;
  const mult = Math.pow(c.positioning.scale, 8);
  const w = c.hasWeaponEquipped ? c.equipped : null;
  if (w) {
    if (w.data.weaponType === 'Firearm')
      doMeleeHit(s, c, center, dir, w.data.range * c.positioning.scale, (w.data.throwableHeavy ? 0.25 : 0.125) * c.stats.meleeSkill * mult, c.enemyCollisionLayer, w);
    else doMeleeHit(s, c, center, dir, w.data.range * c.positioning.scale, w.data.damage * mult, c.enemyCollisionLayer, w);
  } else doMeleeHit(s, c, center, dir, 256 * c.positioning.scale, 0.12 * c.stats.meleeSkill * mult, c.enemyCollisionLayer, null, finalAttack);
}

type Response = 'Invalid' | 'Unobstructed' | 'BlockVictim' | 'StunVictim';
export function interactionResponse(a: Pick<Weapon['data'], 'weaponType' | 'specialMelee' | 'meleeDamageType' | 'meleeSize'>, v: Pick<Weapon['data'], 'weaponType' | 'specialMelee' | 'meleeDamageType' | 'meleeSize'>): Response {
  if (a.weaponType !== 'Melee' || v.weaponType !== 'Melee') return 'Invalid';
  if (v.specialMelee) return 'BlockVictim';
  if (a.specialMelee) return 'StunVictim';
  switch (a.meleeDamageType) {
    case 'Blade': case 'Axe':
      if (a.meleeSize === 'Small') return v.meleeDamageType === 'Blunt' && v.meleeSize === 'Large' ? 'StunVictim' : 'BlockVictim';
      return (v.meleeDamageType === 'Blade' || v.meleeDamageType === 'Axe') && v.meleeSize === 'Small' ? 'StunVictim' : 'BlockVictim';
    case 'Blunt':
      if (a.meleeSize === 'Large') {
        if (v.meleeSize === 'Small' && v.meleeDamageType === 'Blade') return 'StunVictim';
        if (v.meleeSize === 'Medium') return 'StunVictim';
        return 'BlockVictim';
      }
      if (v.meleeSize === 'Small' && v.meleeDamageType === 'Blade') return 'StunVictim';
      if (v.meleeSize === 'Medium' && v.meleeDamageType === 'Blunt') return 'StunVictim';
      return 'BlockVictim';
    default: return 'BlockVictim';
  }
}
function blockResponse(actor: Character, victim: Character): Response {
  const vw = victim.hasWeaponEquipped ? victim.equipped : null;
  const aw = actor.hasWeaponEquipped ? actor.equipped : null;
  if (vw && aw) return interactionResponse(aw.data, vw.data);
  if (vw) return 'Unobstructed';
  if (aw) return 'StunVictim';
  return 'BlockVictim';
}

/** MeleeUtils.DoMeleeHit */
export function doMeleeHit(s: Scene, actor: Character, origin: Vec2, dir: Vec2, distance: number, damage: number, layer: number, weapon: Weapon | null, finalAttack = false): void {
  distance += 200;
  const hit = s.physics.raycast(origin, dir, distance, (layer | Layers.BlockPhysics) >>> 0, actor.attackIgnore);
  if (!hit) return;
  const part = hit.body.owner as BodyPart;
  const isPart = !!part && typeof part === 'object' && 'character' in part && 'isHead' in part;
  if (!isPart) return;
  const local = transformPoint(hit.position, part.transform.worldToLocal);
  const victim = part.character;
  if (victim.hasFlag(CharacterFlags.AttackResponseMelee)) {
    const rot = 5 * actor.stats.meleeSkill * (dir.x > 0 ? 1 : -1);
    if (local.y > part.transform.localRotationPivot.y) part.impact.rotation += -rot; else part.impact.rotation += rot;
    part.impact.translation = add(part.impact.translation, mul(dir, 25 * actor.stats.meleeSkill));
  }
  if (!victim.hasFlag(CharacterFlags.AttackResponseMelee)) return;
  if (victim.constrainsAny(AC.PreventBeingMeleed)) return;
  const victimIsPlayer = victim.isPlayer;
  if (victimIsPlayer && s.disks.has('god')) return;
  if (victim.isMeleeBlocking && canDodge(victim)) {
    if (victim.hasWeaponEquipped && victim.positioning.meleeBlockProgress < 1 && !actor.isPlayer) {
      actor.dodgeMeter = 0;
      actor.dodgeRegenCooldownTimer = 1;
      if (randomFloat() > actor.stats.meleeSkill) s.dropWeapon(actor);
      actor.playAnimation(s.reg.anim(!actor.positioning.isFlipped ? 'melee_stun_sword_L' : 'melee_stun_sword_R'));
      s.audio.play('sounds/melee_clash/parry.wav');
      victim.positioning.meleeBlockImpactIntensity -= 3;
      victim.positioning.meleeBlockProgress = lerp(victim.positioning.meleeBlockProgress, 1, 0.8);
      victim.positioning.tiltIntensity -= 7;
      return;
    }
    const r = blockResponse(actor, victim);
    if (r === 'BlockVictim') {
      victim.drainDodge(damage * 0.02);
      s.audio.play(clashFor(victim.equipped, actor.equipped));
      victim.positioning.meleeBlockImpactIntensity += randomFloat(-1, 1);
      victim.positioning.tiltIntensity += 4;
      return;
    }
    if (r === 'StunVictim') {
      victim.drainDodge(damage * 0.1);
      s.audio.play(clashFor(victim.equipped, actor.equipped));
      victim.playAnimation(s.reg.anim(!victim.positioning.isFlipped ? 'melee_stun_sword_L' : 'melee_stun_sword_R'));
      victim.positioning.meleeBlockImpactIntensity += randomFloat(-1, 1);
      return;
    }
  }
  if (victimIsPlayer && actor.hasWeaponEquipped && canDodge(victim)) {
    victim.drainDodge(damage * 1.5);
    if (victim.dodgeMeter > 0 || victim.stats.dodgeOversaturate) {
      dodgeAnimation(s, victim);
      s.audio.play(pickRandom(SOUNDS.meleeDodge), 1, randomFloat(0.9, 1.1));
      return;
    }
  }
  if (!weapon && victimIsPlayer && canDodge(victim)) victim.drainDodge(damage);
  else part.damage(damage);
  if (!victimIsPlayer && !finalAttack) {
    if (victim.hasFlag(CharacterFlags.StunAnimationOnNonFatalAttack) && victim.dodgeMeter < 0.5) {
      if ((victim.positioning.globalCenter.x > actor.positioning.globalCenter.x) !== victim.positioning.isFlipped)
        victim.playAnimation(s.reg.anim('stun_light_forwards'), 1.2);
      else victim.playAnimation(s.reg.anim(pickRandom2('stun_light_backwards', 'stun_light_backwards2')), 1.2);
    }
  }
  if (weapon && (weapon.data.meleeDamageType === 'Blade' || weapon.data.meleeDamageType === 'Axe')) {
    const lp = { ...local };
    if (part.renderer.hflip) lp.x *= -1;
    s.addSlash(part, add(lp, mul(hit.normal, -0.1)));
    for (let i = 0; i < randomInt(1, 3); i++) s.effects.bloodSpurt(hit.position, Math.atan2(hit.normal.y, hit.normal.x) * RAD2DEG, victim.look.bloodColour, clamp(damage * 4, 1, 2));
    s.audio.play(pickRandom(victim.isAlive ? SOUNDS.livingSword : SOUNDS.genericSword));
  } else s.audio.play(pickRandom(victim.isAlive ? SOUNDS.livingPunch : SOUNDS.genericPunch));
  updateAliveStatus(victim);
  if (victim.isAlive) {
    if (!actor.hasWeaponEquipped && !victim.isPlayer && finalAttack) {
      if (victim.hasWeaponEquipped) {
        const vw = victim.equipped!;
        s.delay(0.01, () => {
          vw.acceleration = add(vw.acceleration ?? v2(), mul(v2(victim.positioning.isFlipped ? -1 : 1, 0.5), 500));
          vw.rotationalAcceleration = (vw.rotationalAcceleration ?? 0) + randomFloat(-1000, 1000);
        });
        s.dropWeapon(victim);
      }
      victim.melee = null;
      if (!victim.isPlayingAnimationGroup('stun')) stunHeavy(s, victim, true);
    } else {
      const hits = Animations.fistMeleeHits(s);
      if (!victim.isPlayingAnimation || victim.isPlayingAnimationGroup(hits[0].group)) victim.playAnimation(pickRandom(hits));
    }
  } else {
    if (actor.isPlayer) s.campaignStat('kill');
    if (!victim.constrainsAny(AC.PreventRagdoll)) {
      const added = mul(actor.aimDirection, Math.max(0.5, actor.stats.meleeKnockback));
      added.y *= 1.5;
      const hv = sub(actor.positioning.hands[0].animationPosition, actor.positioning.hands[0].previousAnimatedPosition);
      s.turnIntoRagdoll(victim, add(added, mul(hv, 2)));
    }
  }
}

export { hasRoundsLeft };
