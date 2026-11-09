// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM300.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { DelayedRockFall } from './DelayedRockFall.ts';

let Assets$Music, Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Actor, Char, Char$Property, Blob, ToxicGas, Barrier, Buff, Charm, Chill, Cripple, Frost, LockedFloor, Paralysis, Roots, Sleep, Slow, Terror, Vertigo, WallOfLight$LightWall, GnollGeomancer, Pylon, FloatingText, SparkParticle, DriedRose$GhostHero, LloydsBeacon, MetalShard, WandOfBlastWave, CavesBossLevel, CavesBossLevel$PylonEnergy, Level, Terrain, Ballistica, ConeAOE, Messages, GameScene, PixelScene, CharSprite, DM300Sprite, BossHealthBar, GLog, Game, Music, Sample, GameMath, PathFinder, Random;

export class DM300 extends Mob {
  pylonsActivated: number = 0;
  supercharged: boolean = false;
  chargeAnnounced: boolean = false;
  MIN_COOLDOWN: number = 0;
  MAX_COOLDOWN: number = 0;
  turnsSinceLastAbility: number = 0;
  abilityCooldown: number = 0;
  lastAbility: number = 0;
  static readonly NONE: number = 0;
  static readonly GAS: number = 1;
  static readonly ROCKS: number = 2;
  static readonly PYLONS_ACTIVATED: string = 'pylons_activated';
  static readonly SUPERCHARGED: string = 'supercharged';
  static readonly CHARGE_ANNOUNCED: string = 'charge_announced';
  static readonly TURNS_SINCE_LAST_ABILITY: string = 'turns_since_last_ability';
  static readonly ABILITY_COOLDOWN: string = 'ability_cooldown';
  static readonly LAST_ABILITY: string = 'last_ability';
  invulnWarned: boolean = false;
  _DM300(): this {
    this._Mob();
    this.spriteClass = $J.cls(DM300Sprite);
    this.HP = this.HT = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 400 : 300;
    this.EXP = 30;
    this.defenseSkill_ = 15;
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.LARGE);
    this.pylonsActivated = 0;
    this.supercharged = false;
    this.chargeAnnounced = false;
    this.MIN_COOLDOWN = 5;
    this.MAX_COOLDOWN = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 7 : 9;
    this.turnsSinceLastAbility = -1;
    this.abilityCooldown = Random.NormalIntRange(this.MIN_COOLDOWN, this.MAX_COOLDOWN);
    this.lastAbility = 0;
    this.invulnWarned = false;
    this.immunities_.add($J.cls(Sleep));
    this.resistances_.add($J.cls(Terror));
    this.resistances_.add($J.cls(Charm));
    this.resistances_.add($J.cls(Vertigo));
    this.resistances_.add($J.cls(Cripple));
    this.resistances_.add($J.cls(Chill));
    this.resistances_.add($J.cls(Frost));
    this.resistances_.add($J.cls(Roots));
    this.resistances_.add($J.cls(Slow));
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(15, 25);
  }
  attackSkill(target: Char): number {
    return 20;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 10)) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DM300.PYLONS_ACTIVATED, this.pylonsActivated);
    bundle.put$String$boolean(DM300.SUPERCHARGED, this.supercharged);
    bundle.put$String$boolean(DM300.CHARGE_ANNOUNCED, this.chargeAnnounced);
    bundle.put$String$int(DM300.TURNS_SINCE_LAST_ABILITY, this.turnsSinceLastAbility);
    bundle.put$String$int(DM300.ABILITY_COOLDOWN, this.abilityCooldown);
    bundle.put$String$int(DM300.LAST_ABILITY, this.lastAbility);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pylonsActivated = bundle.getInt(DM300.PYLONS_ACTIVATED);
    this.supercharged = bundle.getBoolean(DM300.SUPERCHARGED);
    this.chargeAnnounced = bundle.getBoolean(DM300.CHARGE_ANNOUNCED);
    this.turnsSinceLastAbility = bundle.getInt(DM300.TURNS_SINCE_LAST_ABILITY);
    this.abilityCooldown = bundle.getInt(DM300.ABILITY_COOLDOWN);
    this.lastAbility = bundle.getInt(DM300.LAST_ABILITY);
    if (this.turnsSinceLastAbility !== -1) {
      BossHealthBar.assignBoss$Mob(this);
      if (!this.supercharged && this.pylonsActivated === this.totalPylonsToActivate()) {
        BossHealthBar.bleed(true);
      }
    }
  }
  act(): boolean {
    if (this.paralysed > 0) {
      return super.act();
    }
    if (!this.supercharged) {
      if (this.turnsSinceLastAbility >= 0) {
        this.turnsSinceLastAbility++;
      }
      if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
        this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
        Dungeon.level.updateFieldOfView(this, this.fieldOfView);
      }
      let canReach: boolean;
      if (this.enemy == null || !this.enemy.isAlive()) {
        if (Dungeon.level.adjacent(this.pos, Dungeon.hero.pos)) {
          canReach = true;
        } else {
          canReach = (Dungeon.findStep(this, Dungeon.hero.pos, Dungeon.level.openSpace, this.fieldOfView, true) !== -1);
        }
      } else {
        if (Dungeon.level.adjacent(this.pos, this.enemy.pos)) {
          canReach = true;
        } else {
          canReach = (Dungeon.findStep(this, this.enemy.pos, Dungeon.level.openSpace, this.fieldOfView, true) !== -1);
        }
      }
      if (this.state_ !== this.HUNTING) {
        if (Dungeon.hero.invisible <= 0 && canReach) {
          this.beckon(Dungeon.hero.pos);
        }
      } else {
        if ((this.enemy == null || !this.enemy.isAlive()) && Dungeon.hero.invisible <= 0) {
          this.enemy = Dungeon.hero;
        }
        if (this.enemy != null && this.enemy.isAlive() && !canReach) {
          if (this.turnsSinceLastAbility >= this.MIN_COOLDOWN) {
            let aim = new ConeAOE()._ConeAOE$Ballistica$float$float$int(new Ballistica()._Ballistica(this.pos, this.enemy.pos, Ballistica.WONT_STOP), Infinity, 30, Ballistica.STOP_SOLID);
            if (aim.cells.contains(this.enemy.pos) && !Char.hasProp(this.enemy, Char$Property.INORGANIC)) {
              this.lastAbility = DM300.GAS;
              this.turnsSinceLastAbility = 0;
              if (this.sprite_ != null && (this.sprite_.visible_ || this.enemy.sprite_.visible_)) {
                this.sprite_.zap$int(this.enemy.pos);
                return false;
              } else {
                this.ventGas(this.enemy);
                Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
                return true;
              }
            } else if (this.enemy.paralysed <= 0) {
              this.lastAbility = DM300.ROCKS;
              this.turnsSinceLastAbility = 0;
              if (this.sprite_ != null && (this.sprite_.visible_ || this.enemy.sprite_.visible_)) {
                (this.sprite_).slam(this.enemy.pos);
                return false;
              } else {
                this.dropRocks(this.enemy);
                Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
                return true;
              }
            }
          }
        } else if (this.enemy != null && this.enemy.isAlive() && this.fieldOfView[this.enemy.pos]) {
          if (this.turnsSinceLastAbility > this.abilityCooldown) {
            if (this.lastAbility === DM300.NONE) {
              this.lastAbility = Random.Int$int(2) === 0 ? DM300.GAS : DM300.ROCKS;
            } else if (this.lastAbility === DM300.GAS) {
              this.lastAbility = Random.Int$int(4) === 0 ? DM300.GAS : DM300.ROCKS;
            } else {
              this.lastAbility = Random.Int$int(4) !== 0 ? DM300.GAS : DM300.ROCKS;
            }
            if (Char.hasProp(this.enemy, Char$Property.INORGANIC)) {
              this.lastAbility = DM300.ROCKS;
            }
            if (Dungeon.level.adjacent(this.pos, this.enemy.pos)) {
              this.spend(Actor.TICK);
            }
            this.turnsSinceLastAbility = 0;
            this.abilityCooldown = Random.NormalIntRange(this.MIN_COOLDOWN, this.MAX_COOLDOWN);
            if (this.lastAbility === DM300.GAS) {
              if (this.sprite_ != null && (this.sprite_.visible_ || this.enemy.sprite_.visible_)) {
                this.sprite_.zap$int(this.enemy.pos);
                return false;
              } else {
                this.ventGas(this.enemy);
                Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
                return true;
              }
            } else {
              if (this.sprite_ != null && (this.sprite_.visible_ || this.enemy.sprite_.visible_)) {
                (this.sprite_).slam(this.enemy.pos);
                return false;
              } else {
                this.dropRocks(this.enemy);
                Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
                return true;
              }
            }
          }
        }
      }
    } else {
      if (!this.chargeAnnounced) {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'supercharged', []));
        this.chargeAnnounced = true;
      }
      if (Dungeon.hero.invisible <= 0) {
        this.beckon(Dungeon.hero.pos);
        this.state_ = this.HUNTING;
        this.enemy = Dungeon.hero;
      }
    }
    return super.act();
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    if (enemy === Dungeon.hero && this.supercharged) {
      Statistics.qualifiedForBossChallengeBadge = false;
    }
    return super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
  }
  chooseEnemy(): Char {
    let enemy = super.chooseEnemy();
    if (this.supercharged && enemy == null) {
      enemy = Dungeon.hero;
    }
    return enemy;
  }
  move$int$boolean(step: number, travelling: boolean): void {
    super.move$int$boolean(step, travelling);
    if (travelling) {
      PixelScene.shake(Math.fround(this.supercharged ? 3 : 1), 0.25);
    }
    if (!this.flying && Dungeon.level.map_[this.pos] === Terrain.INACTIVE_TRAP && this.state_ === this.HUNTING) {
      if (Blob.volumeAt(this.pos, $J.cls(CavesBossLevel$PylonEnergy)) > 0) {
        return;
      }
      if (Dungeon.level.heroFOV[this.pos]) {
        if (this.buff($J.cls(Barrier)) == null) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'shield', []), []);
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
        this.sprite_.emitter().start(SparkParticle.STATIC, Math.fround(0.05), 20);
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String((30 + $J.idiv(((this.HT - this.HP) | 0), 10)) | 0), FloatingText.SHIELDING, []);
      }
      Buff.affect$Char$Class(this, $J.cls(Barrier)).setShield((30 + $J.idiv(((this.HT - this.HP) | 0), 10)) | 0);
    }
  }
  speed(): number {
    return Math.fround(super.speed() * (this.supercharged ? 2 : 1));
  }
  notice(): void {
    super.notice();
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      this.turnsSinceLastAbility = 0;
      this.yell(Messages.get$Object$String$ObjectArr(this, 'notice', []));
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch instanceof DriedRose$GhostHero) {
          (ch).sayBoss();
        }
      }
    }
  }
  onZapComplete(): void {
    this.ventGas(this.enemy);
    this.next();
  }
  ventGas(target: Char): void {
    Dungeon.hero.interrupt();
    let trajectory = new Ballistica()._Ballistica(this.pos, target.pos, Ballistica.STOP_TARGET);
    let gasMulti = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 2 : 1;
    Actor.addDelayed(new (DM300$1())().$o(this).$c(trajectory, gasMulti)._Actor().$init_anon(), target.cooldown());
  }
  onSlamComplete(): void {
    this.dropRocks(this.enemy);
    this.next();
  }
  dropRocks(target: Char): void {
    Dungeon.hero.interrupt();
    let rockCenter: number;
    if (Dungeon.level.adjacent(this.pos, target.pos)) {
      let oppositeAdjacent = (target.pos + (target.pos - this.pos)) | 0;
      let trajectory = new Ballistica()._Ballistica(target.pos, oppositeAdjacent, Ballistica.MAGIC_BOLT);
      WandOfBlastWave.throwChar(target, trajectory, 2, false, false, this);
      if (target === Dungeon.hero) {
        Dungeon.hero.interrupt();
      }
      rockCenter = trajectory.path.get(Math.min(trajectory.dist, 2));
    } else if (this.fieldOfView[target.pos] && Dungeon.level.distance(this.pos, target.pos) === 2) {
      let oppositeAdjacent = (target.pos + (target.pos - this.pos)) | 0;
      let trajectory = new Ballistica()._Ballistica(target.pos, oppositeAdjacent, Ballistica.MAGIC_BOLT);
      WandOfBlastWave.throwChar(target, trajectory, 1, false, false, this);
      if (target === Dungeon.hero) {
        Dungeon.hero.interrupt();
      }
      rockCenter = trajectory.path.get(Math.min(trajectory.dist, 1));
    } else {
      rockCenter = target.pos;
    }
    let safeCell: number;
    do {
      safeCell = (rockCenter + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
    } while (safeCell === this.pos || (Dungeon.level.solid[safeCell] && Random.Int$int(2) === 0) || (Blob.volumeAt(safeCell, $J.cls(CavesBossLevel$PylonEnergy)) > 0 && Random.Int$int(2) === 0));
    let rockCells = new ArrayList();
    let start = (rockCenter - Math.imul(Dungeon.level.width(), 3) - 3) | 0;
    let pos: number;
    for (let y = 0; y < 7; y++) {
      pos = (start + Math.imul(Dungeon.level.width(), y)) | 0;
      for (let x = 0; x < 7; x++) {
        if (!Dungeon.level.insideMap(pos)) {
          pos++;
          continue;
        }
        if (!Dungeon.level.solid[pos] && pos !== safeCell && Random.Int$int(Dungeon.level.distance(rockCenter, pos)) === 0) {
          rockCells.add(pos);
        }
        pos++;
      }
    }
    let delay = GameMath.gate(Actor.TICK, Math.fround($J.d2i(Math.ceil(target.cooldown()))), Math.fround(3 * Actor.TICK));
    for (const $it2 = rockCells.iterator(); $it2.hasNext(); ) {
      let i = $it2.next();
      GameScene.targetedCell$int$float(i, delay);
    }
    Buff.append$Char$Class$float(this, $J.cls(DM300$FallingRockBuff), delay).setRockPositions(rockCells);
  }
  damage(dmg: number, src: any): void {
    if (!BossHealthBar.isAssigned()) {
      this.notice();
    }
    let preHP = this.HP;
    super.damage(dmg, src);
    if (this.isInvulnerable($J.getClass(src))) {
      return;
    }
    let dmgTaken = (preHP - this.HP) | 0;
    if (dmgTaken > 0) {
      let lock = Dungeon.hero.buff($J.cls(LockedFloor));
      if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
        if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
          lock.addTime(Math.fround(dmgTaken / 2));
        } else {
          lock.addTime(Math.fround(dmgTaken));
        }
      }
    }
    let threshold: number;
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      threshold = Math.imul($J.idiv(this.HT, 4), ((3 - this.pylonsActivated) | 0));
    } else {
      threshold = Math.imul($J.idiv(this.HT, 3), ((2 - this.pylonsActivated) | 0));
    }
    if (this.HP <= threshold && threshold > 0) {
      this.HP = threshold;
      this.supercharge();
    }
  }
  totalPylonsToActivate(): number {
    return Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 3 : 2;
  }
  isInvulnerable(effect: JClass): boolean {
    if (this.supercharged && !this.invulnWarned) {
      this.invulnWarned = true;
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'charging_hint', []), []);
    }
    return this.supercharged || super.isInvulnerable(effect);
  }
  supercharge(): void {
    this.supercharged = true;
    (Dungeon.level).activatePylon();
    this.pylonsActivated++;
    this.spend(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 2 : 3);
    this.yell(Messages.get$Object$String$ObjectArr(this, 'charging', []));
    this.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Object$String$ObjectArr(this, 'invulnerable', []), []);
    (this.sprite_).updateChargeState(true);
    (this.sprite_).charge();
    this.chargeAnnounced = false;
  }
  isSupercharged(): boolean {
    return this.supercharged;
  }
  loseSupercharge(): void {
    this.supercharged = false;
    (this.sprite_).updateChargeState(false);
    this.turnsSinceLastAbility = Math.min(this.turnsSinceLastAbility, (this.MIN_COOLDOWN - 3) | 0);
    if (this.pylonsActivated < this.totalPylonsToActivate()) {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'charge_lost', []));
    } else {
      this.yell(Messages.get$Object$String$ObjectArr(this, 'pylons_destroyed', []));
      BossHealthBar.bleed(true);
      Game.runOnRenderThread(new (DM300$2())().$o(this));
    }
  }
  isAlive(): boolean {
    return super.isAlive() || this.pylonsActivated < this.totalPylonsToActivate();
  }
  die(cause: any): void {
    super.die(cause);
    GameScene.bossSlain();
    Dungeon.level.unseal();
    let shards = Random.chances$floatArr([0, 0, 6, 3, 1]);
    for (let i = 0; i < shards; i++) {
      let ofs: number;
      do {
        ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
      } while (!(Dungeon.level.passable[(this.pos + ofs) | 0]));
      Dungeon.level.drop(new MetalShard()._MetalShard(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
    }
    Badges.validateBossSlain();
    if (Statistics.qualifiedForBossChallengeBadge) {
      Badges.validateBossChallengeCompleted();
    }
    Statistics.bossScores[2] = (Statistics.bossScores[2] + 3000) | 0;
    let beacon = Dungeon.hero.belongings.getItem($J.cls(LloydsBeacon));
    if (beacon != null) {
      beacon.upgrade$();
    }
    this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated', []));
  }
  getCloser(target: number): boolean {
    if (super.getCloser(target)) {
      return true;
    } else {
      if (!this.supercharged || this.state_ !== this.HUNTING || this.rooted || target === this.pos || Dungeon.level.adjacent(this.pos, target)) {
        return false;
      }
      let bestpos = this.pos;
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((this.pos + i) | 0)) == null && Dungeon.level.trueDistance(bestpos, target) > Dungeon.level.trueDistance((this.pos + i) | 0, target)) {
          bestpos = (this.pos + i) | 0;
        }
      }
      if (bestpos !== this.pos) {
        Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
        let gate = CavesBossLevel.gate;
        for (let i of PathFinder.NEIGHBOURS9) {
          if ((Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.WALL || (Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.WALL_DECO) {
            let p = Dungeon.level.cellToPoint((this.pos + i) | 0);
            if (p.y < gate.bottom_ && p.x >= ((gate.left_ - 2) | 0) && p.x < ((gate.right_ + 2) | 0)) {
              continue;
            }
            if (!CavesBossLevel.diggableArea.inside$Point(p)) {
              continue;
            }
            Level.set$int$int((this.pos + i) | 0, Terrain.EMPTY_DECO);
            GameScene.updateMap$int((this.pos + i) | 0);
          }
          if (Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)) != null) {
            Dungeon.level.blobs.get($J.cls(WallOfLight$LightWall)).clear((this.pos + i) | 0);
          }
        }
        Dungeon.level.cleanWalls();
        Dungeon.observe$();
        this.spend(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 2 : 3);
        bestpos = this.pos;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((Actor.findChar((this.pos + i) | 0)) == null && Dungeon.level.openSpace[(this.pos + i) | 0] && Dungeon.level.trueDistance(bestpos, target) > Dungeon.level.trueDistance((this.pos + i) | 0, target)) {
            bestpos = (this.pos + i) | 0;
          }
        }
        if (bestpos !== this.pos) {
          this.move$int(bestpos);
        }
        PixelScene.shake(5, 1);
        return true;
      }
      return false;
    }
  }
  description(): string {
    let desc = super.description();
    if (this.supercharged) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_supercharged', []);
    }
    return desc;
  }
}

export class DM300$FallingRockBuff extends DelayedRockFall {
  _DM300$FallingRockBuff(): this {
    this._DelayedRockFall();
    return this;
  }
  affectChar(ch: Char): void {
    if (!(ch instanceof DM300 || ch instanceof Pylon)) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        ch.damage(Random.NormalIntRange(10, 20), this);
      } else {
        ch.damage(Random.NormalIntRange(6, 12), this);
      }
      if (ch.isAlive()) {
        Buff.prolong(ch, $J.cls(Paralysis), Math.fround(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 5 : 3));
      } else if (ch === Dungeon.hero) {
        Dungeon.fail(this.target);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(GnollGeomancer), 'rockfall_kill', []), []);
      }
    }
  }
}

let $DM300$1: any = null;
/** An anonymous class (DM300.java:381). */
function DM300$1(): any {
  return $DM300$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      let gasVented = 0;
      GameScene.add$Blob(Blob.seed$int$int$Class(this.$cv_trajectory.collisionPos, Math.imul(100, this.$cv_gasMulti), $J.cls(ToxicGas)));
      for (const $it1 = this.$cv_trajectory.subPath(0, this.$cv_trajectory.dist).iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        GameScene.add$Blob(Blob.seed$int$int$Class(i, Math.imul(20, this.$cv_gasMulti), $J.cls(ToxicGas)));
        gasVented = (gasVented + Math.imul(20, this.$cv_gasMulti)) | 0;
      }
      if (gasVented < Math.imul(250, this.$cv_gasMulti)) {
        let toVentAround = $J.d2i(Math.ceil(Math.fround((((Math.imul(250, this.$cv_gasMulti)) - gasVented) | 0) / 8)));
        for (let i of PathFinder.NEIGHBOURS8) {
          GameScene.add$Blob(Blob.seed$int$int$Class((this.$outer.pos + i) | 0, toVentAround, $J.cls(ToxicGas)));
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($trajectory, $gasMulti): this {
      this.$cv_trajectory = $trajectory; this.$cv_gasMulti = $gasMulti;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300$1', []);
}

let $DM300$2$1: any = null;
/** An anonymous class (DM300.java:556). */
function DM300$2$1(): any {
  return $DM300$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_BOSS_FINALE, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300$2$1', ['com.watabou.utils.Callback']);
}

let $DM300$2: any = null;
/** An anonymous class (DM300.java:553). */
function DM300$2(): any {
  return $DM300$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(0.5, new (DM300$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300$2', ['com.watabou.utils.Callback']);
}

$J.define(DM300, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_DM300' }, meths: { 'move(int,boolean)': 'move$int$boolean', 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float' } });
$J.define(DM300$FallingRockBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300$FallingRockBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DelayedRockFall', ctors: { '': '_DM300$FallingRockBuff' } });
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
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  Slow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  WallOfLight$LightWall = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.WallOfLight$LightWall');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  Pylon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  LloydsBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  CavesBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel');
  CavesBossLevel$PylonEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$PylonEnergy');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  DM300Sprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DM300Sprite');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
