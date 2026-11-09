// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DwarfKing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList, HashSet, JObject } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Ghoul } from './Ghoul.ts';
import { Monk } from './Monk.ts';
import { Warlock } from './Warlock.ts';
import { Golem } from './Golem.ts';
import { Buff } from '../buffs/Buff.ts';
import { Barrier } from '../buffs/Barrier.ts';

let Assets$Music, Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Degrade, Doom, LifeLink, LockedFloor, ClericSpell, Sheep, Beam$HealthRay, CellEmitter, Pushing, Speck, ElmoParticle, ShadowParticle, SparkParticle, KingsCrown, Viscosity, Viscosity$DeferedDamage, DriedRose$GhostHero, LloydsBeacon, RingOfForce, RingOfForce$Force, ScrollOfTeleportation, Wand, WandOfLightning, Bestiary, CityBossLevel, Ballistica, Messages, GameScene, CharSprite, KingSprite, BossHealthBar, BuffIndicator, GLog, Game, Music, Sample, PathFinder, Random, Reflection;

export class DwarfKing extends Mob {
  phase: number = 0;
  summonsMade: number = 0;
  summonCooldown: number = 0;
  abilityCooldown: number = 0;
  MIN_COOLDOWN: number = 0;
  MAX_COOLDOWN: number = 0;
  lastAbility: number = 0;
  static readonly NONE: number = 0;
  static readonly LINK: number = 1;
  static readonly TELE: number = 2;
  static readonly PHASE: string = 'phase';
  static readonly SUMMONS_MADE: string = 'summons_made';
  static readonly SUMMON_CD: string = 'summon_cd';
  static readonly ABILITY_CD: string = 'ability_cd';
  static readonly LAST_ABILITY: string = 'last_ability';
  _DwarfKing(): this {
    this._Mob();
    this.spriteClass = $J.cls(KingSprite);
    this.HP = this.HT = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 450 : 300;
    this.EXP = 40;
    this.defenseSkill_ = 22;
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.UNDEAD);
    this.phase = 1;
    this.summonsMade = 0;
    this.summonCooldown = 0;
    this.abilityCooldown = 0;
    this.MIN_COOLDOWN = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 8 : 10;
    this.MAX_COOLDOWN = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 10 : 14;
    this.lastAbility = 0;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(15, 25);
  }
  attackSkill(target: Char): number {
    return 26;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DwarfKing.PHASE, this.phase);
    bundle.put$String$int(DwarfKing.SUMMONS_MADE, this.summonsMade);
    bundle.put$String$float(DwarfKing.SUMMON_CD, this.summonCooldown);
    bundle.put$String$float(DwarfKing.ABILITY_CD, this.abilityCooldown);
    bundle.put$String$int(DwarfKing.LAST_ABILITY, this.lastAbility);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.phase = bundle.getInt(DwarfKing.PHASE);
    this.summonsMade = bundle.getInt(DwarfKing.SUMMONS_MADE);
    this.summonCooldown = bundle.getFloat(DwarfKing.SUMMON_CD);
    this.abilityCooldown = bundle.getFloat(DwarfKing.ABILITY_CD);
    this.lastAbility = bundle.getInt(DwarfKing.LAST_ABILITY);
    if (this.phase === 2) {
      this.properties_.add(Char$Property.IMMOVABLE);
    }
    BossHealthBar.assignBoss$Mob(this);
    if (this.phase === 3) {
      BossHealthBar.bleed(true);
    }
  }
  act(): boolean {
    if (this.pos === CityBossLevel.throne) {
      this.throwItems();
    }
    if (this.phase === 1) {
      if (this.summonCooldown <= Math.fround(0) && (this.summonSubject$int$DwarfKing(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 2 : 3))) {
        this.summonsMade++;
        this.summonCooldown = Math.fround(this.summonCooldown + Random.NormalIntRange(this.MIN_COOLDOWN, this.MAX_COOLDOWN));
      } else if (this.summonCooldown > Math.fround(0)) {
        this.summonCooldown--;
      }
      if (this.paralysed > 0) {
        this.spend(Actor.TICK);
        return true;
      }
      if (this.abilityCooldown <= Math.fround(0)) {
        if (this.lastAbility === DwarfKing.NONE) {
          this.lastAbility = Random.Int$int(2) === 0 ? DwarfKing.LINK : DwarfKing.TELE;
        } else if (this.lastAbility === DwarfKing.LINK) {
          this.lastAbility = Random.Int$int(8) === 0 ? DwarfKing.LINK : DwarfKing.TELE;
        } else {
          this.lastAbility = Random.Int$int(8) !== 0 ? DwarfKing.LINK : DwarfKing.TELE;
        }
        if (this.lastAbility === DwarfKing.LINK && this.lifeLinkSubject()) {
          this.abilityCooldown = Math.fround(this.abilityCooldown + Random.NormalIntRange(this.MIN_COOLDOWN, this.MAX_COOLDOWN));
          this.spend(Actor.TICK);
          return true;
        } else if (this.teleportSubject()) {
          this.lastAbility = DwarfKing.TELE;
          this.abilityCooldown = Math.fround(this.abilityCooldown + Random.NormalIntRange(this.MIN_COOLDOWN, this.MAX_COOLDOWN));
          this.spend(Actor.TICK);
          return true;
        }
      } else {
        this.abilityCooldown--;
      }
    } else if (this.phase === 2) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        if (this.summonsMade < 6) {
          if (this.summonsMade === 0) {
            this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
            this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_1', []));
          }
          this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          this.spend(Math.fround(3 * Actor.TICK));
          this.summonsMade = (this.summonsMade + 2) | 0;
          return true;
        } else if (this.shielding() <= 300 && this.summonsMade < 12) {
          if (this.summonsMade === 6) {
            this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
            this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_2', []));
          }
          this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          if (this.summonsMade === 6) {
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKMonk));
          } else {
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKWarlock));
          }
          this.summonsMade = (this.summonsMade + 3) | 0;
          this.spend(Math.fround(3 * Actor.TICK));
          return true;
        } else if (this.shielding() <= 150 && this.summonsMade < 18) {
          if (this.summonsMade === 12) {
            this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
            this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_3', []));
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKWarlock));
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKMonk));
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
            this.summonsMade = (this.summonsMade + 4) | 0;
            this.spend(Math.fround(3 * Actor.TICK));
          } else {
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGolem));
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGolem));
            this.summonsMade = (this.summonsMade + 2) | 0;
            this.spend(Actor.TICK);
          }
          return true;
        } else {
          this.spend(Actor.TICK);
          return true;
        }
      } else {
        if (this.summonsMade < 4) {
          if (this.summonsMade === 0) {
            this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
            this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_1', []));
          }
          this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          this.spend(Math.fround(3 * Actor.TICK));
          this.summonsMade++;
          return true;
        } else if (this.shielding() <= 200 && this.summonsMade < 8) {
          if (this.summonsMade === 4) {
            this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
            this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_2', []));
          }
          if (this.summonsMade === 7) {
            this.summonSubject$int$Class$DwarfKing(3, Random.Int$int(2) === 0 ? $J.cls(DwarfKing$DKMonk) : $J.cls(DwarfKing$DKWarlock));
          } else {
            this.summonSubject$int$Class$DwarfKing(3, $J.cls(DwarfKing$DKGhoul));
          }
          this.summonsMade++;
          this.spend(Actor.TICK);
          return true;
        } else if (this.shielding() <= 100 && this.summonsMade < 12) {
          this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
          Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
          this.yell(Messages.get$Object$String$ObjectArr(this, 'wave_3', []));
          this.summonSubject$int$Class$DwarfKing(4, $J.cls(DwarfKing$DKWarlock));
          this.summonSubject$int$Class$DwarfKing(4, $J.cls(DwarfKing$DKMonk));
          this.summonSubject$int$Class$DwarfKing(4, $J.cls(DwarfKing$DKGhoul));
          this.summonSubject$int$Class$DwarfKing(4, $J.cls(DwarfKing$DKGhoul));
          this.summonsMade = 12;
          this.spend(Actor.TICK);
          return true;
        } else {
          this.spend(Actor.TICK);
          return true;
        }
      }
    } else if (this.phase === 3 && this.buffs$Class($J.cls(DwarfKing$Summoning)).size() < 4) {
      if (this.summonSubject$int$DwarfKing(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 2 : 3)) {
        this.summonsMade++;
      }
    }
    return super.act();
  }
  summonSubject$int$DwarfKing(delay: number): boolean {
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      if (this.summonsMade % 3 === 2) {
        if (this.summonsMade % 9 === 8) {
          return this.summonSubject$int$Class$DwarfKing(delay, $J.cls(DwarfKing$DKGolem));
        } else {
          return this.summonSubject$int$Class$DwarfKing(delay, Random.Int$int(2) === 0 ? $J.cls(DwarfKing$DKMonk) : $J.cls(DwarfKing$DKWarlock));
        }
      } else {
        return this.summonSubject$int$Class$DwarfKing(delay, $J.cls(DwarfKing$DKGhoul));
      }
    } else {
      if (this.summonsMade % 4 === 3) {
        return this.summonSubject$int$Class$DwarfKing(delay, Random.Int$int(2) === 0 ? $J.cls(DwarfKing$DKMonk) : $J.cls(DwarfKing$DKWarlock));
      } else {
        return this.summonSubject$int$Class$DwarfKing(delay, $J.cls(DwarfKing$DKGhoul));
      }
    }
  }
  summonSubject$int$Class$DwarfKing(delay: number, type$: JClass<Mob>): boolean {
    let s = new DwarfKing$Summoning()._DwarfKing$Summoning();
    s.pos = (Dungeon.level).getSummoningPos();
    if (s.pos === -1) {
      return false;
    }
    s.summon = type$;
    s.delay_ = delay;
    s.attachTo(this);
    return true;
  }
  getSubjects(): HashSet<Mob> {
    let subjects = new HashSet();
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (m.alignment === this.alignment && (m instanceof Ghoul || m instanceof Monk || m instanceof Warlock || m instanceof Golem)) {
        subjects.add(m);
      }
    }
    return subjects;
  }
  lifeLinkSubject(): boolean {
    let furthest = null;
    for (const $it1 = this.getSubjects().iterator(); $it1.hasNext(); ) {
      let m = $it1.next();
      let alreadyLinked = false;
      for (const $it2 = m.buffs$Class($J.cls(LifeLink)).iterator(); $it2.hasNext(); ) {
        let l = $it2.next();
        if (l.object === this.id()) {
          alreadyLinked = true;
        }
      }
      if (!alreadyLinked) {
        if (furthest == null || Dungeon.level.distance(this.pos, furthest.pos) < Dungeon.level.distance(this.pos, m.pos)) {
          furthest = m;
        }
      }
    }
    if (furthest != null) {
      Buff.append$Char$Class$float(furthest, $J.cls(LifeLink), 100).object = this.id();
      Buff.append$Char$Class$float(this, $J.cls(LifeLink), 100).object = furthest.id();
      this.yell(Messages.get$Object$String$ObjectArr(this, 'lifelink_' + Random.IntRange(1, 2), []));
      this.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(this.sprite_.destinationCenter(), furthest.sprite_.destinationCenter()));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      return true;
    }
    return false;
  }
  teleportSubject(): boolean {
    if (this.enemy == null) {
      return false;
    }
    let furthest = null;
    for (const $it3 = this.getSubjects().iterator(); $it3.hasNext(); ) {
      let m = $it3.next();
      if (furthest == null || Dungeon.level.distance(this.pos, furthest.pos) < Dungeon.level.distance(this.pos, m.pos)) {
        furthest = m;
      }
    }
    if (furthest != null) {
      let bestDist: number;
      let bestPos = this.pos;
      let trajectory = new Ballistica()._Ballistica(this.enemy.pos, this.pos, Ballistica.STOP_TARGET);
      let targetCell = trajectory.path.get((trajectory.dist + 1) | 0);
      if (Actor.findChar(targetCell) == null && !Dungeon.level.solid[targetCell]) {
        bestPos = targetCell;
      } else {
        bestDist = Dungeon.level.trueDistance(this.pos, this.enemy.pos);
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Actor.findChar((this.pos + i) | 0)) == null && !(Dungeon.level.solid[(this.pos + i) | 0]) && Dungeon.level.trueDistance((this.pos + i) | 0, this.enemy.pos) > bestDist) {
            bestPos = (this.pos + i) | 0;
            bestDist = Dungeon.level.trueDistance((this.pos + i) | 0, this.enemy.pos);
          }
        }
      }
      Actor.add$Actor(new Pushing()._Pushing$Char$int$int(this, this.pos, bestPos));
      this.pos = bestPos;
      bestDist = Dungeon.level.trueDistance(this.enemy.pos, this.pos);
      bestPos = this.enemy.pos;
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((this.enemy.pos + i) | 0)) == null && !(Dungeon.level.solid[(this.enemy.pos + i) | 0]) && Dungeon.level.trueDistance((this.enemy.pos + i) | 0, this.pos) < bestDist) {
          bestPos = (this.enemy.pos + i) | 0;
          bestDist = Dungeon.level.trueDistance((this.enemy.pos + i) | 0, this.pos);
        }
      }
      if (bestPos !== this.enemy.pos) {
        ScrollOfTeleportation.appear(furthest, bestPos);
      }
      this.yell(Messages.get$Object$String$ObjectArr(this, 'teleport_' + Random.IntRange(1, 2), []));
      return true;
    }
    return false;
  }
  notice(): void {
    super.notice();
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      this.yell(Messages.get$Object$String$ObjectArr(this, 'notice', []));
      for (const $it4 = Actor.chars().iterator(); $it4.hasNext(); ) {
        let ch = $it4.next();
        if (ch instanceof DriedRose$GhostHero) {
          (ch).sayBoss();
        }
      }
    }
  }
  isInvulnerable(effect: JClass): boolean {
    if (effect === $J.cls(DwarfKing$KingDamager)) {
      return false;
    } else {
      return this.phase === 2 || super.isInvulnerable(effect);
    }
  }
  damage(dmg: number, src: any): void {
    if (src === Dungeon.hero && (!RingOfForce.fightingUnarmed(Dungeon.hero) || Dungeon.hero.buff($J.cls(RingOfForce$Force)) != null)) {
      Statistics.qualifiedForBossChallengeBadge = false;
    } else if (src instanceof Wand && !(src instanceof WandOfLightning)) {
      Statistics.qualifiedForBossChallengeBadge = false;
    } else if (src instanceof ClericSpell) {
      Statistics.qualifiedForBossChallengeBadge = false;
    }
    if (this.isInvulnerable($J.getClass(src))) {
      super.damage(dmg, src);
      return;
    } else if (this.phase === 3 && !(src instanceof Viscosity$DeferedDamage)) {
      if (dmg >= 0) {
        let deferred = Buff.affect$Char$Class(this, $J.cls(Viscosity$DeferedDamage));
        deferred.extend(Math.fround(dmg));
        this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Class$String$ObjectArr($J.cls(Viscosity), 'deferred', [dmg]), []);
      }
      return;
    }
    let preHP = this.HP;
    super.damage(dmg, src);
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(dmg / 5));
      } else {
        lock.addTime(Math.fround(dmg / 3));
      }
    }
    if (this.phase === 1) {
      let dmgTaken = (preHP - this.HP) | 0;
      this.abilityCooldown = Math.fround(this.abilityCooldown - Math.fround(dmgTaken / 8));
      this.summonCooldown = Math.fround(this.summonCooldown - Math.fround(dmgTaken / 8));
      if (this.HP <= (Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 100 : 50)) {
        this.HP = (Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 100 : 50);
        this.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Object$String$ObjectArr(this, 'invulnerable', []), []);
        ScrollOfTeleportation.appear(this, CityBossLevel.throne);
        this.properties_.add(Char$Property.IMMOVABLE);
        this.phase = 2;
        this.summonsMade = 0;
        this.sprite_.idle();
        Buff.affect$Char$Class(this, $J.cls(DwarfKing$DKBarrior)).setShield(this.HT);
        for (const $it5 = this.buffs$Class($J.cls(DwarfKing$Summoning)).iterator(); $it5.hasNext(); ) {
          let s = $it5.next();
          s.detach();
        }
        Bestiary.skipCountingEncounters = true;
        for (const $it6 = this.getSubjects().iterator(); $it6.hasNext(); ) {
          let m = $it6.next();
          m.die(null);
        }
        Bestiary.skipCountingEncounters = false;
        for (const $it7 = this.buffs$().iterator(); $it7.hasNext(); ) {
          let b = $it7.next();
          if (b instanceof LifeLink) {
            b.detach();
          }
        }
      }
    } else if (this.phase === 2 && this.shielding() === 0) {
      this.properties_.remove(Char$Property.IMMOVABLE);
      this.phase = 3;
      this.summonsMade = 1;
      this.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.4), 2);
      Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
      this.yell(Messages.get$Object$String$ObjectArr(this, 'enraged', [Dungeon.hero.name()]));
      BossHealthBar.bleed(true);
      Game.runOnRenderThread(new (DwarfKing$1())().$o(this));
    } else if (this.phase === 3 && preHP > 20 && this.HP < 20 && this.isAlive()) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'losing', []));
    }
  }
  isAlive(): boolean {
    return super.isAlive() || this.phase !== 3;
  }
  die(cause: any): void {
    GameScene.bossSlain();
    super.die(cause);
    let h = Dungeon.level.heaps.get(CityBossLevel.throne);
    if (h != null) {
      for (const $it8 = h.items_.iterator(); $it8.hasNext(); ) {
        let i = $it8.next();
        Dungeon.level.drop(i, (CityBossLevel.throne + Dungeon.level.width()) | 0);
      }
      h.destroy();
    }
    if (this.pos === CityBossLevel.throne) {
      Dungeon.level.drop(new KingsCrown()._KingsCrown(), (this.pos + Dungeon.level.width()) | 0).sprite_.drop$int(this.pos);
    } else {
      Dungeon.level.drop(new KingsCrown()._KingsCrown(), this.pos).sprite_.drop$();
    }
    Badges.validateBossSlain();
    if (Statistics.qualifiedForBossChallengeBadge) {
      Badges.validateBossChallengeCompleted();
    }
    Statistics.bossScores[3] = (Statistics.bossScores[3] + 4000) | 0;
    Dungeon.level.unseal();
    Bestiary.skipCountingEncounters = true;
    for (const $it9 = this.getSubjects().iterator(); $it9.hasNext(); ) {
      let m = $it9.next();
      m.die(null);
    }
    Bestiary.skipCountingEncounters = false;
    let beacon = Dungeon.hero.belongings.getItem($J.cls(LloydsBeacon));
    if (beacon != null) {
      beacon.upgrade$();
    }
    if (Dungeon.hero.buff($J.cls(Degrade)) != null) {
      Dungeon.hero.buff($J.cls(Degrade)).detach();
    }
    this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated', []));
  }
  isImmune(effect: JClass): boolean {
    if (this.phase > 1 && effect === $J.cls(Doom) && this.buff($J.cls(Doom)) != null) {
      return true;
    }
    return super.isImmune(effect);
  }
}

export class DwarfKing$DKGhoul extends Ghoul {
  _DwarfKing$DKGhoul(): this {
    this._Ghoul();
    this.properties_.add(Char$Property.BOSS_MINION);
    this.state_ = this.HUNTING;
    return this;
  }
  act(): boolean {
    this.partnerID = -2;
    return super.act();
  }
}

export class DwarfKing$DKMonk extends Monk {
  _DwarfKing$DKMonk(): this {
    this._Monk();
    this.properties_.add(Char$Property.BOSS_MINION);
    this.state_ = this.HUNTING;
    return this;
  }
}

export class DwarfKing$DKWarlock extends Warlock {
  _DwarfKing$DKWarlock(): this {
    this._Warlock();
    this.properties_.add(Char$Property.BOSS_MINION);
    this.state_ = this.HUNTING;
    return this;
  }
  zap(): void {
    if (this.enemy === Dungeon.hero) {
      Statistics.bossScores[3] = (Statistics.bossScores[3] - 400) | 0;
    }
    super.zap();
  }
}

export class DwarfKing$DKGolem extends Golem {
  _DwarfKing$DKGolem(): this {
    this._Golem();
    this.properties_.add(Char$Property.BOSS_MINION);
    this.state_ = this.HUNTING;
    return this;
  }
}

export class DwarfKing$Summoning extends Buff {
  delay_: number = 0;
  pos: number = 0;
  summon: JClass<Mob> = null;
  particles: Emitter = null;
  static readonly DELAY: string = 'delay';
  static readonly POS: string = 'pos';
  static readonly SUMMON: string = 'summon';
  _DwarfKing$Summoning(): this {
    this._Buff();
    return this;
  }
  getPos(): number {
    return this.pos;
  }
  act(): boolean {
    this.delay_--;
    if (this.delay_ <= 0) {
      if (this.summon === $J.cls(DwarfKing$DKGolem)) {
        this.particles.burst(SparkParticle.FACTORY, 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
      } else if (this.summon === $J.cls(DwarfKing$DKWarlock)) {
        this.particles.burst(ShadowParticle.CURSE, 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
      } else if (this.summon === $J.cls(DwarfKing$DKMonk)) {
        this.particles.burst(ElmoParticle.FACTORY, 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      } else {
        this.particles.burst(Speck.factory$int(Speck.BONE), 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.BONES);
      }
      this.particles = null;
      if (Actor.findChar(this.pos) != null) {
        let candidates = new ArrayList();
        for (let i of PathFinder.NEIGHBOURS8) {
          if (Dungeon.level.passable[(this.pos + i) | 0] && (Actor.findChar((this.pos + i) | 0)) == null) {
            candidates.add((this.pos + i) | 0);
          }
        }
        if (!candidates.isEmpty()) {
          this.pos = Random.element$Collection(candidates);
        }
      }
      if (Actor.findChar(this.pos) instanceof Sheep) {
        Actor.findChar(this.pos).die(null);
      }
      if (Actor.findChar(this.pos) == null) {
        let m = Reflection.newInstance(this.summon);
        m.pos = this.pos;
        m.maxLvl = -2;
        GameScene.add$Mob(m);
        Dungeon.level.occupyCell(m);
        m.state_ = m.HUNTING;
        if ((this.target).phase === 2) {
          Buff.affect$Char$Class(m, $J.cls(DwarfKing$KingDamager));
        }
      } else {
        let ch = Actor.findChar(this.pos);
        ch.damage(Random.NormalIntRange(20, 40), this);
        if ((this.target).phase === 2) {
          if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
            this.target.damage($J.idiv(this.target.HT, 18), new DwarfKing$KingDamager()._DwarfKing$KingDamager());
          } else {
            this.target.damage($J.idiv(this.target.HT, 12), new DwarfKing$KingDamager()._DwarfKing$KingDamager());
          }
        }
        if (!ch.isAlive() && ch === Dungeon.hero) {
          Dungeon.fail($J.cls(DwarfKing));
          GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [Messages.get$Class$String$ObjectArr($J.cls(DwarfKing), 'name', [])])), []);
        }
      }
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on && (this.particles == null || this.particles.parent == null)) {
      this.particles = CellEmitter.get(this.pos);
      if (this.summon === $J.cls(DwarfKing$DKGolem)) {
        this.particles.pour(SparkParticle.STATIC, Math.fround(0.05));
      } else if (this.summon === $J.cls(DwarfKing$DKWarlock)) {
        this.particles.pour(ShadowParticle.UP, Math.fround(0.1));
      } else if (this.summon === $J.cls(DwarfKing$DKMonk)) {
        this.particles.pour(ElmoParticle.FACTORY, Math.fround(0.1));
      } else {
        this.particles.pour(Speck.factory$int(Speck.RATTLE), Math.fround(0.1));
      }
    } else if (!on && this.particles != null) {
      this.particles.on = false;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DwarfKing$Summoning.DELAY, this.delay_);
    bundle.put$String$int(DwarfKing$Summoning.POS, this.pos);
    bundle.put$String$Class(DwarfKing$Summoning.SUMMON, this.summon);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.delay_ = bundle.getInt(DwarfKing$Summoning.DELAY);
    this.pos = bundle.getInt(DwarfKing$Summoning.POS);
    this.summon = bundle.getClass$String(DwarfKing$Summoning.SUMMON);
  }
}

export class DwarfKing$KingDamager extends Buff {
  _DwarfKing$KingDamager(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  act(): boolean {
    if (this.target.alignment !== Char$Alignment.ENEMY) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  detach(): void {
    super.detach();
    for (const $it10 = Dungeon.level.mobs.iterator(); $it10.hasNext(); ) {
      let m = $it10.next();
      if (m instanceof DwarfKing) {
        let damage = $J.idiv(m.HT, (Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 18 : 12));
        m.damage(damage, this);
      }
    }
  }
}

export class DwarfKing$DKBarrior extends Barrier {
  _DwarfKing$DKBarrior(): this {
    this._Barrier();
    return this;
  }
  act(): boolean {
    this.incShield$();
    return super.act();
  }
  icon(): number {
    return BuffIndicator.NONE;
  }
}

let $DwarfKing$1$1: any = null;
/** An anonymous class (DwarfKing.java:529). */
function DwarfKing$1$1(): any {
  return $DwarfKing$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.CITY_BOSS_FINALE, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$1$1', ['com.watabou.utils.Callback']);
}

let $DwarfKing$1: any = null;
/** An anonymous class (DwarfKing.java:526). */
function DwarfKing$1(): any {
  return $DwarfKing$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(0.5, new (DwarfKing$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$1', ['com.watabou.utils.Callback']);
}

$J.define(DwarfKing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_DwarfKing' }, meths: { 'summonSubject(int,java.lang.Class)': 'summonSubject$int$Class$DwarfKing', 'summonSubject(int)': 'summonSubject$int$DwarfKing' } });
$J.define(DwarfKing$DKGhoul, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKGhoul', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul', ctors: { '': '_DwarfKing$DKGhoul' } });
$J.define(DwarfKing$DKMonk, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKMonk', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk', ctors: { '': '_DwarfKing$DKMonk' } });
$J.define(DwarfKing$DKWarlock, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKWarlock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock', ctors: { '': '_DwarfKing$DKWarlock' } });
$J.define(DwarfKing$DKGolem, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKGolem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem', ctors: { '': '_DwarfKing$DKGolem' } });
$J.define(DwarfKing$Summoning, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$Summoning', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_DwarfKing$Summoning' } });
$J.define(DwarfKing$KingDamager, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$KingDamager', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_DwarfKing$KingDamager' } });
$J.define(DwarfKing$DKBarrior, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKBarrior', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier', ctors: { '': '_DwarfKing$DKBarrior' } });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  Beam$HealthRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$HealthRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  KingsCrown = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown');
  Viscosity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity');
  Viscosity$DeferedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  LloydsBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon');
  RingOfForce = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce');
  RingOfForce$Force = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$Force');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  CityBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  KingSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.KingSprite');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
