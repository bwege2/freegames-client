// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/YogDzewa.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashSet, JObject } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { RipperDemon } from './RipperDemon.ts';
import { Eye } from './Eye.ts';
import { Scorpio } from './Scorpio.ts';

let Assets$Music, Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Actor, Char, Char$Property, Invisibility, Light, LockedFloor, Bee, Eye$DeathGaze, YogFist, YogFist$BrightFist, YogFist$BurningFist, YogFist$DarkFist, YogFist$RottingFist, YogFist$RustedFist, YogFist$SoiledFist, Sheep, Beam$DeathRay, CellEmitter, Pushing, PurpleParticle, ShadowParticle, DriedRose$GhostHero, Bestiary, Ballistica, Messages, GameScene, CharSprite, LarvaSprite, YogSprite, DungeonTilemap, BossHealthBar, GLog, Game, Music, Sample, GameMath, PathFinder, Random, Reflection;

export class YogDzewa extends Mob {
  phase: number = 0;
  abilityCooldown: number = 0;
  static readonly MIN_ABILITY_CD: number = 10;
  static readonly MAX_ABILITY_CD: number = 15;
  summonCooldown: number = 0;
  static readonly MIN_SUMMON_CD: number = 10;
  static readonly MAX_SUMMON_CD: number = 15;
  fistSummons: ArrayList<JClass> = null;
  challengeSummons: ArrayList<JClass> = null;
  regularSummons: ArrayList<JClass> = null;
  targetedCells: ArrayList<number> = null;
  static readonly PHASE: string = 'phase';
  static readonly ABILITY_CD: string = 'ability_cd';
  static readonly SUMMON_CD: string = 'summon_cd';
  static readonly FIST_SUMMONS: string = 'fist_summons';
  static readonly REGULAR_SUMMONS: string = 'regular_summons';
  static readonly CHALLENGE_SUMMONS: string = 'challenges_summons';
  static readonly TARGETED_CELLS: string = 'targeted_cells';
  _YogDzewa(): this {
    this._Mob();
    this.spriteClass = $J.cls(YogSprite);
    this.HP = this.HT = 1000;
    this.EXP = 50;
    this.state_ = this.HUNTING;
    this.viewDistance = 12;
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.DEMONIC);
    this.properties_.add(Char$Property.STATIC);
    this.phase = 0;
    this.fistSummons = new ArrayList();
    this.challengeSummons = new ArrayList();
    Random.pushGenerator$long(BigInt.asIntN(64, Dungeon.seedCurDepth() + 1n));
    this.fistSummons.add(Random.Int$int(2) === 0 ? $J.cls(YogFist$BurningFist) : $J.cls(YogFist$SoiledFist));
    this.fistSummons.add(Random.Int$int(2) === 0 ? $J.cls(YogFist$RottingFist) : $J.cls(YogFist$RustedFist));
    this.fistSummons.add(Random.Int$int(2) === 0 ? $J.cls(YogFist$BrightFist) : $J.cls(YogFist$DarkFist));
    Random.shuffle$List(this.fistSummons);
    if (Random.Int$int(2) === 0) {
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(1)));
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(2)));
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(0)));
    } else {
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(2)));
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(0)));
      this.challengeSummons.add(YogDzewa.getPairedFist(this.fistSummons.get(1)));
    }
    Random.popGenerator();
    this.regularSummons = new ArrayList();
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      for (let i = 0; i < 6; i++) {
        if (i >= 4) {
          this.regularSummons.add($J.cls(YogDzewa$YogRipper));
        } else if (i >= Statistics.spawnersAlive) {
          this.regularSummons.add($J.cls(YogDzewa$Larva));
        } else {
          this.regularSummons.add(i % 2 === 0 ? $J.cls(YogDzewa$YogEye) : $J.cls(YogDzewa$YogScorpio));
        }
      }
    } else {
      for (let i = 0; i < 4; i++) {
        if (i >= Statistics.spawnersAlive) {
          this.regularSummons.add($J.cls(YogDzewa$Larva));
        } else {
          this.regularSummons.add($J.cls(YogDzewa$YogRipper));
        }
      }
    }
    Random.shuffle$List(this.regularSummons);
    this.targetedCells = new ArrayList();
    return this;
  }
  static getPairedFist(fist: JClass): JClass {
    if (fist === $J.cls(YogFist$BurningFist)) {
      return $J.cls(YogFist$SoiledFist);
    }
    if (fist === $J.cls(YogFist$SoiledFist)) {
      return $J.cls(YogFist$BurningFist);
    }
    if (fist === $J.cls(YogFist$RottingFist)) {
      return $J.cls(YogFist$RustedFist);
    }
    if (fist === $J.cls(YogFist$RustedFist)) {
      return $J.cls(YogFist$RottingFist);
    }
    if (fist === $J.cls(YogFist$BrightFist)) {
      return $J.cls(YogFist$DarkFist);
    }
    if (fist === $J.cls(YogFist$DarkFist)) {
      return $J.cls(YogFist$BrightFist);
    }
    return null;
  }
  attackSkill(target: Char): number {
    return Char.INFINITE_ACCURACY;
  }
  act(): boolean {
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    this.throwItems();
    this.sprite_.hideAlert();
    this.sprite_.hideLost();
    this.enemy = this.chooseEnemy();
    this.enemySeen = this.enemy != null && this.enemy.isAlive() && this.fieldOfView[this.enemy.pos] && this.enemy.invisible <= 0;
    if (this.phase === 0) {
      if (Dungeon.hero.viewDistance >= Dungeon.level.distance(this.pos, Dungeon.hero.pos)) {
        Dungeon.observe$();
      }
      if (Dungeon.level.heroFOV[this.pos]) {
        this.notice();
      }
    }
    if (this.phase === 0) {
      this.spend(Actor.TICK);
      return true;
    } else {
      if (!this.targetedCells.isEmpty() && !Dungeon.hero.rooted) {
        let terrainAffected = false;
        let affected = new HashSet();
        for (const $it0 = this.targetedCells.iterator(); $it0.hasNext(); ) {
          let i = $it0.next();
          let b = new Ballistica()._Ballistica(this.pos, i, Ballistica.WONT_STOP);
          this.sprite_.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(b.collisionPos)));
          for (const $it1 = b.path.iterator(); $it1.hasNext(); ) {
            let p = $it1.next();
            let ch = Actor.findChar(p);
            if (ch != null && (ch.alignment !== this.alignment || ch instanceof Bee)) {
              affected.add(ch);
            }
            if (Dungeon.level.flamable[p]) {
              Dungeon.level.destroy(p);
              GameScene.updateMap$int(p);
              terrainAffected = true;
            }
          }
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
        if (terrainAffected) {
          Dungeon.observe$();
        }
        Invisibility.dispel$Char(this);
        for (const $it2 = affected.iterator(); $it2.hasNext(); ) {
          let ch = $it2.next();
          if (ch === Dungeon.hero) {
            Statistics.bossScores[4] = (Statistics.bossScores[4] - 500) | 0;
          }
          if (Char.hit$Char$Char$boolean(this, ch, true)) {
            if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
              ch.damage(Random.NormalIntRange(30, 50), new Eye$DeathGaze()._Eye$DeathGaze());
            } else {
              ch.damage(Random.NormalIntRange(20, 30), new Eye$DeathGaze()._Eye$DeathGaze());
            }
            if (Dungeon.level.heroFOV[this.pos]) {
              ch.sprite_.flash();
              CellEmitter.center(this.pos).burst(PurpleParticle.BURST, Random.IntRange(1, 2));
            }
            if (!ch.isAlive() && ch === Dungeon.hero) {
              Badges.validateDeathFromEnemyMagic();
              Dungeon.fail(this);
              GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()]), []);
            }
          } else {
            ch.sprite_.showStatus(CharSprite.NEUTRAL, ch.defenseVerb(), []);
          }
        }
        this.targetedCells.clear();
      }
      if (this.abilityCooldown <= Math.fround(0)) {
        let beams = (1 + $J.idiv(((this.HT - this.HP) | 0), 400)) | 0;
        let affectedCells = new HashSet();
        for (let i = 0; i < beams; i++) {
          let targetPos = Dungeon.hero.pos;
          if (i !== 0) {
            do {
              targetPos = (Dungeon.hero.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
            } while (Dungeon.level.trueDistance(this.pos, Dungeon.hero.pos) > Dungeon.level.trueDistance(this.pos, targetPos));
          }
          this.targetedCells.add(targetPos);
          let b = new Ballistica()._Ballistica(this.pos, targetPos, Ballistica.WONT_STOP);
          affectedCells.addAll(b.path);
        }
        let allAdjTargeted = true;
        for (let i of PathFinder.NEIGHBOURS9) {
          if (!affectedCells.contains((Dungeon.hero.pos + i) | 0) && Dungeon.level.passable[(Dungeon.hero.pos + i) | 0]) {
            allAdjTargeted = false;
            break;
          }
        }
        if (allAdjTargeted) {
          this.targetedCells.removeAt((this.targetedCells.size() - 1) | 0);
        }
        let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(Dungeon.hero.cooldown()))), Math.fround(3 * Actor.TICK));
        for (const $it3 = this.targetedCells.iterator(); $it3.hasNext(); ) {
          let i = $it3.next();
          let b = new Ballistica()._Ballistica(this.pos, i, Ballistica.WONT_STOP);
          for (const $it4 = b.path.iterator(); $it4.hasNext(); ) {
            let p = $it4.next();
            GameScene.targetedCell$int$float(p, delay);
            affectedCells.add(p);
          }
        }
        this.spend(delay);
        Dungeon.hero.interrupt();
        this.abilityCooldown = Math.fround(this.abilityCooldown + Random.NormalFloat(Math.fround(YogDzewa.MIN_ABILITY_CD), Math.fround(YogDzewa.MAX_ABILITY_CD)));
        this.abilityCooldown = Math.fround(this.abilityCooldown - ((this.phase - 1) | 0));
      } else {
        this.spend(Actor.TICK);
      }
      while (this.summonCooldown <= Math.fround(0)) {
        let cls = this.regularSummons.removeAt(0);
        let summon = Reflection.newInstance(cls);
        this.regularSummons.add(cls);
        let spawnPos = -1;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Actor.findChar((this.pos + i) | 0)) == null) {
            if (spawnPos === -1 || Dungeon.level.trueDistance(Dungeon.hero.pos, spawnPos) > Dungeon.level.trueDistance(Dungeon.hero.pos, (this.pos + i) | 0)) {
              spawnPos = (this.pos + i) | 0;
            }
          }
        }
        if (spawnPos === -1) {
          for (let i of PathFinder.NEIGHBOURS8) {
            if ((Actor.findChar((this.pos + i) | 0)) instanceof Sheep) {
              if (spawnPos === -1 || Dungeon.level.trueDistance(Dungeon.hero.pos, spawnPos) > Dungeon.level.trueDistance(Dungeon.hero.pos, (this.pos + i) | 0)) {
                spawnPos = (this.pos + i) | 0;
              }
            }
          }
          if (spawnPos !== -1) {
            Actor.findChar(spawnPos).die(null);
          }
        }
        if (spawnPos !== -1) {
          summon.pos = spawnPos;
          GameScene.add$Mob(summon);
          Actor.add$Actor(new Pushing()._Pushing$Char$int$int(summon, this.pos, summon.pos));
          summon.beckon(Dungeon.hero.pos);
          Dungeon.level.occupyCell(summon);
          this.summonCooldown = Math.fround(this.summonCooldown + Random.NormalFloat(Math.fround(YogDzewa.MIN_SUMMON_CD), Math.fround(YogDzewa.MAX_SUMMON_CD)));
          this.summonCooldown = Math.fround(this.summonCooldown - ((this.phase - 1) | 0));
          if (this.findFist() != null) {
            this.summonCooldown = Math.fround(this.summonCooldown + ((YogDzewa.MIN_SUMMON_CD - (this.phase - 1)) | 0));
          }
        } else {
          break;
        }
      }
    }
    if (this.summonCooldown > Math.fround(0)) {
      this.summonCooldown--;
    }
    if (this.abilityCooldown > Math.fround(0)) {
      this.abilityCooldown--;
    }
    if (this.phase === 5 && this.abilityCooldown > Math.fround(2)) {
      this.abilityCooldown = 2;
    }
    if (this.phase === 5 && this.summonCooldown > Math.fround(3)) {
      this.summonCooldown = 3;
    }
    return true;
  }
  processFistDeath(): void {
    if (this.phase === 4 && this.findFist() == null) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'hope', []));
      this.summonCooldown = -15;
      this.phase = 5;
      BossHealthBar.bleed(true);
      Game.runOnRenderThread(new (YogDzewa$1())().$o(this));
    }
  }
  isAlive(): boolean {
    return super.isAlive() || this.phase !== 5;
  }
  isInvulnerable(effect: JClass): boolean {
    return this.phase === 0 || this.findFist() != null || super.isInvulnerable(effect);
  }
  damage(dmg: number, src: any): void {
    let preHP = this.HP;
    super.damage(dmg, src);
    if (this.phase === 0 || this.findFist() != null) {
      return;
    }
    if (this.phase < 4) {
      this.HP = Math.max(this.HP, (this.HT - Math.imul(300, this.phase)) | 0);
    } else if (this.phase === 4) {
      this.HP = Math.max(this.HP, 100);
    }
    let dmgTaken = (preHP - this.HP) | 0;
    if (dmgTaken > 0) {
      this.abilityCooldown = Math.fround(this.abilityCooldown - Math.fround(dmgTaken / 10));
      this.summonCooldown = Math.fround(this.summonCooldown - Math.fround(dmgTaken / 10));
    }
    if (this.phase < 4 && this.HP <= ((this.HT - Math.imul(300, this.phase)) | 0)) {
      this.phase++;
      this.updateVisibility(Dungeon.level);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'darkness', []), []);
      this.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Object$String$ObjectArr(this, 'invulnerable', []), []);
      this.addFist(Reflection.newInstance(this.fistSummons.removeAt(0)));
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        this.addFist(Reflection.newInstance(this.challengeSummons.removeAt(0)));
      }
      (CellEmitter.get((Dungeon.level.exit() - 1) | 0)).burst(ShadowParticle.UP, 25);
      CellEmitter.get(Dungeon.level.exit()).burst(ShadowParticle.UP, 100);
      (CellEmitter.get((Dungeon.level.exit() + 1) | 0)).burst(ShadowParticle.UP, 25);
      if (this.abilityCooldown < Math.fround(5)) {
        this.abilityCooldown = 5;
      }
      if (this.summonCooldown < Math.fround(5)) {
        this.summonCooldown = 5;
      }
    }
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(dmgTaken / 3));
      } else {
        lock.addTime(Math.fround(dmgTaken / 2));
      }
    }
  }
  addFist(fist: YogFist): void {
    fist.pos = Dungeon.level.exit();
    (CellEmitter.get((Dungeon.level.exit() - 1) | 0)).burst(ShadowParticle.UP, 25);
    CellEmitter.get(Dungeon.level.exit()).burst(ShadowParticle.UP, 100);
    (CellEmitter.get((Dungeon.level.exit() + 1) | 0)).burst(ShadowParticle.UP, 25);
    if (this.abilityCooldown < Math.fround(5)) {
      this.abilityCooldown = 5;
    }
    if (this.summonCooldown < Math.fround(5)) {
      this.summonCooldown = 5;
    }
    let targetPos = (Dungeon.level.exit() + Dungeon.level.width()) | 0;
    if (!Dungeon.isChallenged(Challenges.STRONGER_BOSSES) && (Actor.findChar(targetPos) == null || Actor.findChar(targetPos) instanceof Sheep)) {
      fist.pos = targetPos;
    } else if ((Actor.findChar((targetPos - 1) | 0)) == null || (Actor.findChar((targetPos - 1) | 0)) instanceof Sheep) {
      fist.pos = (targetPos - 1) | 0;
    } else if ((Actor.findChar((targetPos + 1) | 0)) == null || (Actor.findChar((targetPos + 1) | 0)) instanceof Sheep) {
      fist.pos = (targetPos + 1) | 0;
    } else if (Actor.findChar(targetPos) == null || Actor.findChar(targetPos) instanceof Sheep) {
      fist.pos = targetPos;
    }
    if (Actor.findChar(fist.pos) instanceof Sheep) {
      Actor.findChar(fist.pos).die(null);
    }
    GameScene.add$Mob$float(fist, 4);
    Actor.add$Actor(new Pushing()._Pushing$Char$int$int(fist, Dungeon.level.exit(), fist.pos));
    Dungeon.level.occupyCell(fist);
  }
  updateVisibility(level: Level): void {
    let viewDistance = 4;
    if (this.phase > 1 && this.isAlive()) {
      viewDistance = Math.max((4 - (this.phase - 1)) | 0, 1);
    }
    if (Dungeon.isChallenged(Challenges.DARKNESS)) {
      viewDistance = Math.min(viewDistance, 2);
    }
    level.viewDistance = viewDistance;
    if (Dungeon.hero != null) {
      if (Dungeon.hero.buff($J.cls(Light)) == null) {
        Dungeon.hero.viewDistance = level.viewDistance;
      }
      Dungeon.observe$();
    }
  }
  findFist(): YogFist {
    for (const $it5 = Actor.chars().iterator(); $it5.hasNext(); ) {
      let c = $it5.next();
      if (c instanceof YogFist) {
        return c;
      }
    }
    return null;
  }
  beckon(cell: number): void {
  }
  clearEnemy(): void {
  }
  aggro(ch: Char): void {
    if (ch != null && ch.alignment !== this.alignment || !(ch instanceof YogDzewa$Larva || ch instanceof YogDzewa$YogRipper || ch instanceof YogDzewa$YogEye || ch instanceof YogDzewa$YogScorpio)) {
      for (const $it6 = Dungeon.level.mobs.clone().iterator(); $it6.hasNext(); ) {
        let mob = $it6.next();
        if (mob !== ch && Dungeon.level.distance(this.pos, mob.pos) <= 4 && mob.alignment === this.alignment && (mob instanceof YogDzewa$Larva || mob instanceof YogDzewa$YogRipper || mob instanceof YogDzewa$YogEye || mob instanceof YogDzewa$YogScorpio)) {
          mob.aggro(ch);
        }
      }
    }
  }
  die(cause: any): void {
    Bestiary.skipCountingEncounters = true;
    for (const $it7 = Dungeon.level.mobs.clone().iterator(); $it7.hasNext(); ) {
      let mob = $it7.next();
      if (mob instanceof YogDzewa$Larva || mob instanceof YogDzewa$YogRipper || mob instanceof YogDzewa$YogEye || mob instanceof YogDzewa$YogScorpio) {
        mob.die(cause);
      }
    }
    Bestiary.skipCountingEncounters = false;
    this.updateVisibility(Dungeon.level);
    GameScene.bossSlain();
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES) && Statistics.spawnersAlive === 4) {
      Badges.validateBossChallengeCompleted();
    } else {
      Statistics.qualifiedForBossChallengeBadge = false;
    }
    Statistics.bossScores[4] = (Statistics.bossScores[4] + (5000 + Math.imul(1250, Statistics.spawnersAlive))) | 0;
    Badges.validateTakingTheMick(cause);
    Dungeon.level.unseal();
    super.die(cause);
    this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated', []));
  }
  notice(): void {
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      this.yell(Messages.get$Object$String$ObjectArr(this, 'notice', []));
      for (const $it8 = Actor.chars().iterator(); $it8.hasNext(); ) {
        let ch = $it8.next();
        if (ch instanceof DriedRose$GhostHero) {
          (ch).sayBoss();
        }
      }
      Game.runOnRenderThread(new (YogDzewa$2())().$o(this));
      if (this.phase === 0) {
        this.phase = 1;
        this.summonCooldown = Random.NormalFloat(Math.fround(YogDzewa.MIN_SUMMON_CD), Math.fround(YogDzewa.MAX_SUMMON_CD));
        this.abilityCooldown = Random.NormalFloat(Math.fround(YogDzewa.MIN_ABILITY_CD), Math.fround(YogDzewa.MAX_ABILITY_CD));
      }
    }
  }
  description(): string {
    let desc = super.description();
    if (Statistics.spawnersAlive > 0) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_spawners', []);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(YogDzewa.PHASE, this.phase);
    bundle.put$String$float(YogDzewa.ABILITY_CD, this.abilityCooldown);
    bundle.put$String$float(YogDzewa.SUMMON_CD, this.summonCooldown);
    bundle.put$String$ClassArr(YogDzewa.FIST_SUMMONS, $J.toArrayInto(this.fistSummons.toArray(), $J.newArray(0, null)));
    bundle.put$String$ClassArr(YogDzewa.CHALLENGE_SUMMONS, $J.toArrayInto(this.challengeSummons.toArray(), $J.newArray(0, null)));
    bundle.put$String$ClassArr(YogDzewa.REGULAR_SUMMONS, $J.toArrayInto(this.regularSummons.toArray(), $J.newArray(0, null)));
    let bundleArr = $J.newArray(this.targetedCells.size(), 0);
    for (let i = 0; i < this.targetedCells.size(); i++) {
      bundleArr[i] = this.targetedCells.get(i);
    }
    bundle.put$String$intArr(YogDzewa.TARGETED_CELLS, bundleArr);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.phase = bundle.getInt(YogDzewa.PHASE);
    if (this.phase !== 0) {
      BossHealthBar.assignBoss$Mob(this);
      if (this.phase === 5) {
        BossHealthBar.bleed(true);
      }
    }
    this.abilityCooldown = bundle.getFloat(YogDzewa.ABILITY_CD);
    this.summonCooldown = bundle.getFloat(YogDzewa.SUMMON_CD);
    this.fistSummons.clear();
    Collections.addAll(this.fistSummons, ...bundle.getClassArray(YogDzewa.FIST_SUMMONS));
    this.challengeSummons.clear();
    Collections.addAll(this.challengeSummons, ...bundle.getClassArray(YogDzewa.CHALLENGE_SUMMONS));
    this.regularSummons.clear();
    Collections.addAll(this.regularSummons, ...bundle.getClassArray(YogDzewa.REGULAR_SUMMONS));
    for (let i of bundle.getIntArray(YogDzewa.TARGETED_CELLS)) {
      this.targetedCells.add(i);
    }
  }
}

export class YogDzewa$Larva extends Mob {
  _YogDzewa$Larva(): this {
    this._Mob();
    this.spriteClass = $J.cls(LarvaSprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 12;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 5;
    this.maxLvl = -2;
    this.properties_.add(Char$Property.DEMONIC);
    this.properties_.add(Char$Property.BOSS_MINION);
    return this;
  }
  attackSkill(target: Char): number {
    return 30;
  }
  damageRoll(): number {
    return Random.NormalIntRange(15, 25);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 4)) | 0;
  }
}

export class YogDzewa$YogRipper extends RipperDemon {
  _YogDzewa$YogRipper(): this {
    this._RipperDemon();
    this.maxLvl = -2;
    this.properties_.add(Char$Property.BOSS_MINION);
    return this;
  }
}

export class YogDzewa$YogEye extends Eye {
  _YogDzewa$YogEye(): this {
    this._Eye();
    this.maxLvl = -2;
    this.properties_.add(Char$Property.BOSS_MINION);
    return this;
  }
}

export class YogDzewa$YogScorpio extends Scorpio {
  _YogDzewa$YogScorpio(): this {
    this._Scorpio();
    this.maxLvl = -2;
    this.properties_.add(Char$Property.BOSS_MINION);
    return this;
  }
}

let $YogDzewa$1$1: any = null;
/** An anonymous class (YogDzewa.java:370). */
function YogDzewa$1$1(): any {
  return $YogDzewa$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.HALLS_BOSS_FINALE, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$1$1', ['com.watabou.utils.Callback']);
}

let $YogDzewa$1: any = null;
/** An anonymous class (YogDzewa.java:367). */
function YogDzewa$1(): any {
  return $YogDzewa$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(0.5, new (YogDzewa$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$1', ['com.watabou.utils.Callback']);
}

let $YogDzewa$2: any = null;
/** An anonymous class (YogDzewa.java:562). */
function YogDzewa$2(): any {
  return $YogDzewa$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.HALLS_BOSS, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$2', ['com.watabou.utils.Callback']);
}

$J.define(YogDzewa, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_YogDzewa' } });
$J.define(YogDzewa$Larva, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$Larva', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_YogDzewa$Larva' } });
$J.define(YogDzewa$YogRipper, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogRipper', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon', ctors: { '': '_YogDzewa$YogRipper' } });
$J.define(YogDzewa$YogEye, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogEye', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye', ctors: { '': '_YogDzewa$YogEye' } });
$J.define(YogDzewa$YogScorpio, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogScorpio', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio', ctors: { '': '_YogDzewa$YogScorpio' } });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Eye$DeathGaze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$DeathGaze');
  YogFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist');
  YogFist$BrightFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BrightFist');
  YogFist$BurningFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BurningFist');
  YogFist$DarkFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$DarkFist');
  YogFist$RottingFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RottingFist');
  YogFist$RustedFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RustedFist');
  YogFist$SoiledFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$SoiledFist');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  LarvaSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.LarvaSprite');
  YogSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.YogSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
