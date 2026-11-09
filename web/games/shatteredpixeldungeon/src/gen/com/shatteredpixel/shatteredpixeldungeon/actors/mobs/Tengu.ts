// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Tengu.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Hunting } from './Mob.ts';
import { Buff } from '../buffs/Buff.ts';
import { Item } from '../../items/Item.ts';
import { Blob } from '../blobs/Blob.ts';

let Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Actor, Char$Property, Electricity, Fire, Blindness, Burning, Doom, Dread, LockedFloor, Roots, Terror, HeroSubClass, CellEmitter, FloatingText, Lightning, Speck, BlastParticle, FlameParticle, SmokeParticle, SparkParticle, TengusMask, DriedRose$GhostHero, LloydsBeacon, Bomb, PrisonBossLevel, PrisonBossLevel$State, Ballistica, Messages, GameScene, CharSprite, ItemSpriteSheet, MissileSprite, TenguSprite, DungeonTilemap, BossHealthBar, GLog, Sample, Emitter, BArray, GameMath, PathFinder, Random;

export class Tengu extends Mob {
  loading: boolean = false;
  static readonly LAST_ABILITY: string = 'last_ability';
  static readonly ABILITIES_USED: string = 'abilities_used';
  static readonly ARENA_JUMPS: string = 'arena_jumps';
  static readonly ABILITY_COOLDOWN: string = 'ability_cooldown';
  static throwingChar: Char = null;
  lastAbility: number = 0;
  abilitiesUsed: number = 0;
  arenaJumps: number = 0;
  abilityCooldown: number = 0;
  static readonly BOMB_ABILITY: number = 0;
  static readonly FIRE_ABILITY: number = 1;
  static readonly SHOCKER_ABILITY: number = 2;
  _Tengu(): this {
    this._Mob();
    this.spriteClass = $J.cls(TenguSprite);
    this.HP = this.HT = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 250 : 200;
    this.EXP = 20;
    this.defenseSkill_ = 15;
    this.HUNTING = new Tengu$Hunting().$o(this)._Tengu$Hunting();
    this.properties_.add(Char$Property.BOSS);
    this.viewDistance = 12;
    this.loading = false;
    this.immunities_.add($J.cls(Roots));
    this.immunities_.add($J.cls(Blindness));
    this.immunities_.add($J.cls(Dread));
    this.immunities_.add($J.cls(Terror));
    this.lastAbility = -1;
    this.abilitiesUsed = 0;
    this.arenaJumps = 0;
    this.abilityCooldown = 2;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(6, 12);
  }
  attackSkill(target: Char): number {
    if (Dungeon.level.adjacent(this.pos, target.pos)) {
      return 10;
    } else {
      return 20;
    }
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
  add(buff: Buff): boolean {
    if (Actor.chars().contains(this) || buff instanceof Doom || this.loading) {
      return super.add(buff);
    }
    return false;
  }
  damage(dmg: number, src: any): void {
    if (!Dungeon.level.mobs.contains(this)) {
      return;
    }
    let state = (Dungeon.level).state();
    let hpBracket = $J.idiv(this.HT, 8);
    let curbracket = $J.idiv(this.HP, hpBracket);
    let beforeHitHP = this.HP;
    super.damage(dmg, src);
    if (this.HP <= Math.imul(((curbracket - 1) | 0), hpBracket)) {
      this.HP = (Math.imul(((curbracket - 1) | 0), hpBracket) + 1) | 0;
    }
    let newBracket = $J.idiv(this.HP, hpBracket);
    dmg = (beforeHitHP - this.HP) | 0;
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(Math.imul(2, dmg) / 3));
      } else {
        lock.addTime(Math.fround(dmg));
      }
    }
    if (this.HP === 0 && state === PrisonBossLevel$State.FIGHT_ARENA) {
      Actor.add$Actor(new (Tengu$1())().$o(this)._Actor().$init_anon());
      return;
    }
    if (state === PrisonBossLevel$State.FIGHT_START && this.HP <= $J.idiv(this.HT, 2)) {
      this.HP = ($J.idiv(this.HT, 2));
      this.yell(Messages.get$Object$String$ObjectArr(this, 'interesting', []));
      (Dungeon.level).progress();
      BossHealthBar.bleed(true);
    } else if (newBracket !== curbracket) {
      Actor.add$Actor(new (Tengu$2())().$o(this)._Actor().$init_anon());
      return;
    }
  }
  isAlive(): boolean {
    return super.isAlive() || Dungeon.level.mobs.contains(this);
  }
  die(cause: any): void {
    if (Dungeon.hero.subClass === HeroSubClass.NONE) {
      Dungeon.level.drop(new TengusMask()._TengusMask(), this.pos).sprite_.drop$();
    }
    GameScene.bossSlain();
    super.die(cause);
    Badges.validateBossSlain();
    if (Statistics.qualifiedForBossChallengeBadge) {
      Badges.validateBossChallengeCompleted();
    }
    Statistics.bossScores[1] = (Statistics.bossScores[1] + 2000) | 0;
    let beacon = Dungeon.hero.belongings.getItem($J.cls(LloydsBeacon));
    if (beacon != null) {
      beacon.upgrade$();
    }
    this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated', []));
  }
  canAttack(enemy: Char): boolean {
    return new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.PROJECTILE).collisionPos === enemy.pos;
  }
  jump(): void {
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
      Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    }
    if (this.enemy == null) {
      this.enemy = this.chooseEnemy();
    }
    if (this.enemy == null) {
      this.enemy = Dungeon.hero;
    }
    let newPos: number;
    if (Dungeon.level instanceof PrisonBossLevel) {
      let level = Dungeon.level;
      if (level.state() === PrisonBossLevel$State.FIGHT_START) {
        level.cleanTenguCell();
        let tries = 100;
        do {
          newPos = (Dungeon.level).randomTenguCellPos();
          tries--;
        } while (tries > 0 && (level.trueDistance(newPos, this.enemy.pos) <= 3.5 || level.trueDistance(newPos, Dungeon.hero.pos) <= 3.5 || Actor.findChar(newPos) != null));
        if (tries <= 0) {
          newPos = this.pos;
        }
        if (level.heroFOV[this.pos]) {
          CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.WOOL), 6);
        }
        this.sprite_.move(this.pos, newPos);
        this.move$int(newPos);
        if (level.heroFOV[newPos]) {
          CellEmitter.get(newPos).burst(Speck.factory$int(Speck.WOOL), 6);
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
        let fill = Math.fround(Math.fround(0.9) - Math.fround(0.5 * (Math.fround((Math.fround(this.HP - (Math.fround(this.HT / 2)))) / (Math.fround(this.HT / 2))))));
        level.placeTrapsInTenguCell(fill);
      } else {
        let tries = 100;
        do {
          newPos = Random.Int$int(level.length());
          tries--;
        } while (tries > 0 && (level.solid[newPos] || level.distance(newPos, this.enemy.pos) < 5 || level.distance(newPos, this.enemy.pos) > 7 || level.distance(newPos, Dungeon.hero.pos) < 5 || level.distance(newPos, Dungeon.hero.pos) > 7 || level.distance(newPos, this.pos) < 5 || Actor.findChar(newPos) != null || Dungeon.level.heaps.get(newPos) != null));
        if (tries <= 0) {
          newPos = this.pos;
        }
        if (level.heroFOV[this.pos]) {
          CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.WOOL), 6);
        }
        this.sprite_.move(this.pos, newPos);
        this.move$int(newPos);
        if (this.arenaJumps < 4) {
          this.arenaJumps++;
        }
        if (level.heroFOV[newPos]) {
          CellEmitter.get(newPos).burst(Speck.factory$int(Speck.WOOL), 6);
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
      }
    } else {
      let level = Dungeon.level;
      newPos = level.randomRespawnCell(this);
      if (level.heroFOV[this.pos]) {
        CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.WOOL), 6);
      }
      this.sprite_.move(this.pos, newPos);
      this.move$int(newPos);
      if (level.heroFOV[newPos]) {
        CellEmitter.get(newPos).burst(Speck.factory$int(Speck.WOOL), 6);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    }
  }
  notice(): void {
    super.notice();
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      if (this.HP <= $J.idiv(this.HT, 2)) {
        BossHealthBar.bleed(true);
      }
      if (this.HP === this.HT) {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'notice_gotcha', [Dungeon.hero.name()]));
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (ch instanceof DriedRose$GhostHero) {
            (ch).sayBoss();
          }
        }
      } else {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'notice_have', [Dungeon.hero.name()]));
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Tengu.LAST_ABILITY, this.lastAbility);
    bundle.put$String$int(Tengu.ABILITIES_USED, this.abilitiesUsed);
    bundle.put$String$int(Tengu.ARENA_JUMPS, this.arenaJumps);
    bundle.put$String$int(Tengu.ABILITY_COOLDOWN, this.abilityCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.loading = true;
    super.restoreFromBundle(bundle);
    this.loading = false;
    this.lastAbility = bundle.getInt(Tengu.LAST_ABILITY);
    this.abilitiesUsed = bundle.getInt(Tengu.ABILITIES_USED);
    this.arenaJumps = bundle.getInt(Tengu.ARENA_JUMPS);
    this.abilityCooldown = bundle.getInt(Tengu.ABILITY_COOLDOWN);
    BossHealthBar.assignBoss$Mob(this);
    if (this.HP <= $J.idiv(this.HT, 2)) {
      BossHealthBar.bleed(true);
    }
  }
  canUseAbility(): boolean {
    if (this.HP > $J.idiv(this.HT, 2)) {
      return false;
    }
    if (this.abilitiesUsed >= this.targetAbilityUses()) {
      return false;
    } else {
      this.abilityCooldown--;
      if (((this.targetAbilityUses() - this.abilitiesUsed) | 0) >= 4 && !Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        this.abilityCooldown = 0;
      } else if (((this.targetAbilityUses() - this.abilitiesUsed) | 0) >= 3) {
        if (this.abilityCooldown === -1 || this.abilityCooldown > 1) {
          this.abilityCooldown = 1;
        }
      } else {
        if (this.abilityCooldown === -1) {
          this.abilityCooldown = Random.IntRange(1, 4);
        }
      }
      if (this.abilityCooldown === 0) {
        return true;
      } else {
        return false;
      }
    }
  }
  targetAbilityUses(): number {
    let targetAbilityUses = (1 + Math.imul(2, this.arenaJumps)) | 0;
    targetAbilityUses = (targetAbilityUses + (Math.max(0, (this.arenaJumps - 2) | 0))) | 0;
    return targetAbilityUses;
  }
  useAbility(): boolean {
    let abilityUsed = false;
    let abilityToUse = -1;
    while (!abilityUsed) {
      if (this.abilitiesUsed === 0) {
        abilityToUse = Tengu.BOMB_ABILITY;
      } else if (this.abilitiesUsed === 1) {
        abilityToUse = Tengu.SHOCKER_ABILITY;
      } else if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        abilityToUse = Math.imul(Random.Int$int(2), 2);
      } else {
        abilityToUse = Random.Int$int(3);
      }
      if (abilityToUse !== this.lastAbility || Random.Int$int(10) === 0) {
        switch (abilityToUse) {
          case Tengu.BOMB_ABILITY:
          default:
            abilityUsed = Tengu.throwBomb(this, Dungeon.hero);
            if (this.abilitiesUsed === 0 && !abilityUsed) {
              abilityToUse = Tengu.FIRE_ABILITY;
              abilityUsed = Tengu.throwFire(this, Dungeon.hero);
            }
            break;
          case Tengu.FIRE_ABILITY:
            abilityUsed = Tengu.throwFire(this, Dungeon.hero);
            break;
          case Tengu.SHOCKER_ABILITY:
            abilityUsed = Tengu.throwShocker(this, Dungeon.hero);
            if (this.abilitiesUsed === 1 && !abilityUsed) {
              abilityToUse = Tengu.FIRE_ABILITY;
              abilityUsed = Tengu.throwFire(this, Dungeon.hero);
            }
            break;
        }
        if (abilityUsed && abilityToUse !== Tengu.FIRE_ABILITY && Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
          Tengu.throwFire(this, Dungeon.hero);
        }
      }
    }
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      if (((this.targetAbilityUses() - this.abilitiesUsed) | 0) >= 4) {
      } else {
        this.spend(Actor.TICK);
      }
    } else {
      if (((this.targetAbilityUses() - this.abilitiesUsed) | 0) >= 4) {
        this.spend(Actor.TICK);
      } else {
        this.spend(Math.fround(2 * Actor.TICK));
      }
    }
    this.lastAbility = abilityToUse;
    this.abilitiesUsed++;
    return this.lastAbility === Tengu.FIRE_ABILITY;
  }
  static throwBomb(thrower: Char, target: Char): boolean {
    let targetCell = -1;
    for (let i of PathFinder.NEIGHBOURS8) {
      let cell = (target.pos + i) | 0;
      let bombHere = false;
      for (const $it1 = thrower.buffs$Class($J.cls(Tengu$BombAbility)).iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        if (b.bombPos === cell) {
          bombHere = true;
        }
      }
      if (!bombHere && !Dungeon.level.solid[cell] && (targetCell === -1 || Dungeon.level.trueDistance(cell, thrower.pos) < Dungeon.level.trueDistance(targetCell, thrower.pos))) {
        targetCell = cell;
      }
    }
    if (targetCell === -1) {
      return false;
    }
    let finalTargetCell = targetCell;
    Tengu.throwingChar = thrower;
    let item = new Tengu$BombAbility$BombItem()._Tengu$BombAbility$BombItem();
    thrower.sprite_.zap$int(finalTargetCell);
    (thrower.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(thrower.sprite_, finalTargetCell, item, new (Tengu$3())().$c(item, finalTargetCell, thrower));
    return true;
  }
  static throwFire(thrower: Char, target: Char): boolean {
    let aim = new Ballistica()._Ballistica(thrower.pos, target.pos, Ballistica.WONT_STOP);
    for (let i = 0; i < PathFinder.CIRCLE8.length; i++) {
      if (((aim.sourcePos + PathFinder.CIRCLE8[i]) | 0) === aim.path.get(1)) {
        thrower.sprite_.zap$int(target.pos);
        Buff.append$Char$Class(thrower, $J.cls(Tengu$FireAbility)).direction = i;
        thrower.sprite_.emitter().start(Speck.factory$int(Speck.STEAM), Math.fround(0.03), 10);
        return true;
      }
    }
    return false;
  }
  static throwShocker(thrower: Char, target: Char): boolean {
    let targetCell = -1;
    for (let i of PathFinder.NEIGHBOURS8) {
      let cell = (target.pos + i) | 0;
      if (Dungeon.level.distance(cell, thrower.pos) >= 2 && !Dungeon.level.solid[cell]) {
        let validTarget = true;
        for (const $it2 = thrower.buffs$Class($J.cls(Tengu$ShockerAbility)).iterator(); $it2.hasNext(); ) {
          let s = $it2.next();
          if (Dungeon.level.distance(cell, s.shockerPos) < 2) {
            validTarget = false;
            break;
          }
        }
        if (validTarget && Dungeon.level.trueDistance(cell, thrower.pos) < Dungeon.level.trueDistance(targetCell, thrower.pos)) {
          targetCell = cell;
        }
      }
    }
    if (targetCell === -1) {
      return false;
    }
    let finalTargetCell = targetCell;
    Tengu.throwingChar = thrower;
    let item = new Tengu$ShockerAbility$ShockerItem()._Tengu$ShockerAbility$ShockerItem();
    thrower.sprite_.zap$int(finalTargetCell);
    (thrower.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(thrower.sprite_, finalTargetCell, item, new (Tengu$4())().$c(item, finalTargetCell, thrower));
    return true;
  }
}

export class Tengu$Hunting extends Mob$Hunting {
  _Tengu$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    if (enemyInFOV && !this.$outer.isCharmedBy(this.$outer.enemy) && this.$outer.canAttack(this.$outer.enemy)) {
      if (this.$outer.canUseAbility()) {
        return this.$outer.useAbility();
      }
      this.$outer.recentlyAttackedBy.clear();
      this.$outer.target = this.$outer.enemy.pos;
      return this.$outer.doAttack(this.$outer.enemy);
    } else {
      return this.handleUnreachableTarget(enemyInFOV, justAlerted);
    }
  }
  handleUnreachableTarget(enemyInFOV: boolean, justAlerted: boolean): boolean {
    let oldEnemy = this.$outer.enemy;
    this.$outer.enemy = null;
    this.$outer.enemy = this.$outer.chooseEnemy();
    if (this.$outer.enemy != null && this.$outer.enemy !== oldEnemy) {
      this.recursing = true;
      let result = this.act(enemyInFOV, justAlerted);
      this.recursing = false;
      return result;
    }
    if (this.$outer.canUseAbility()) {
      return this.$outer.useAbility();
    }
    this.$outer.spend(Actor.TICK);
    return true;
  }
}

export class Tengu$BombAbility extends Buff {
  bombPos: number = 0;
  timer: number = 0;
  smokeEmitters: ArrayList<Emitter> = null;
  static readonly BOMB_POS: string = 'bomb_pos';
  static readonly TIMER: string = 'timer';
  _Tengu$BombAbility(): this {
    this._Buff();
    this.bombPos = -1;
    this.timer = 3;
    this.smokeEmitters = new ArrayList();
    return this;
  }
  act(): boolean {
    if (this.smokeEmitters.isEmpty()) {
      this.fx(true);
    }
    let p = DungeonTilemap.raisedTileCenterToWorld(this.bombPos);
    if (this.timer === 3) {
      FloatingText.show$float$float$int$String$int(p.x, p.y, this.bombPos, '3...', CharSprite.WARNING);
    } else if (this.timer === 2) {
      FloatingText.show$float$float$int$String$int(p.x, p.y, this.bombPos, '2...', CharSprite.WARNING);
    } else if (this.timer === 1) {
      FloatingText.show$float$float$int$String$int(p.x, p.y, this.bombPos, '1...', CharSprite.WARNING);
    } else {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.bombPos, BArray.not(Dungeon.level.solid, null), 2);
      for (let cell = 0; cell < PathFinder.distance.length; cell++) {
        if (PathFinder.distance[cell] < 2147483647) {
          let ch = Actor.findChar(cell);
          if (ch != null && !(ch instanceof Tengu)) {
            let dmg = Random.NormalIntRange((5 + Dungeon.scalingDepth()) | 0, (10 + Math.imul(Dungeon.scalingDepth(), 2)) | 0);
            dmg = (dmg - ch.drRoll()) | 0;
            if (dmg > 0) {
              ch.damage(dmg, $J.cls(Bomb));
            }
            if (ch === Dungeon.hero) {
              Statistics.qualifiedForBossChallengeBadge = false;
              Statistics.bossScores[1] = (Statistics.bossScores[1] - 100) | 0;
              if (!ch.isAlive()) {
                Dungeon.fail($J.cls(Tengu));
              }
            }
          }
        }
      }
      let h = Dungeon.level.heaps.get(this.bombPos);
      if (h != null) {
        for (let i of $J.toArrayInto(h.items_.toArray(), $J.newArray(0, null))) {
          if (i instanceof Tengu$BombAbility$BombItem) {
            h.remove(i);
          }
        }
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
      this.detach();
      return true;
    }
    this.timer--;
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on && this.bombPos !== -1) {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.bombPos, BArray.not(Dungeon.level.solid, null), 2);
      for (let i = 0; i < PathFinder.distance.length; i++) {
        if (PathFinder.distance[i] < 2147483647) {
          let e = CellEmitter.get(i);
          e.pour(SmokeParticle.FACTORY, 0.25);
          this.smokeEmitters.add(e);
        }
      }
    } else if (!on) {
      for (const $it3 = this.smokeEmitters.iterator(); $it3.hasNext(); ) {
        let e = $it3.next();
        e.burst(BlastParticle.FACTORY, 2);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Tengu$BombAbility.BOMB_POS, this.bombPos);
    bundle.put$String$int(Tengu$BombAbility.TIMER, this.timer);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.bombPos = bundle.getInt(Tengu$BombAbility.BOMB_POS);
    this.timer = bundle.getInt(Tengu$BombAbility.TIMER);
  }
}

export class Tengu$BombAbility$BombItem extends Item {
  _Tengu$BombAbility$BombItem(): this {
    this._Item();
    this.dropsDownHeap = true;
    this.unique = true;
    this.image_ = ItemSpriteSheet.TENGU_BOMB;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_pickup', []), []);
    return false;
  }
  onThrow(cell: number): void {
    super.onThrow(cell);
    if (Tengu.throwingChar != null) {
      Buff.append$Char$Class(Tengu.throwingChar, $J.cls(Tengu$BombAbility)).bombPos = cell;
      Tengu.throwingChar = null;
    } else {
      Buff.append$Char$Class(Item.curUser, $J.cls(Tengu$BombAbility)).bombPos = cell;
    }
  }
  emitter(): Emitter {
    let emitter = new Emitter()._Emitter();
    emitter.pos$float$float(7.5, 3.5);
    emitter.fillTarget = false;
    emitter.pour(SmokeParticle.SPEW, Math.fround(0.05));
    return emitter;
  }
}

export class Tengu$FireAbility extends Buff {
  direction: number = 0;
  curCells: number[] = null;
  toCells: HashSet<number> = null;
  static readonly DIRECTION: string = 'direction';
  static readonly CUR_CELLS: string = 'cur_cells';
  _Tengu$FireAbility(): this {
    this._Buff();
    this.toCells = new HashSet();
    return this;
  }
  act(): boolean {
    this.toCells.clear();
    if (this.curCells == null) {
      this.curCells = $J.newArray(1, 0);
      this.curCells[0] = this.target.pos;
      this.spreadFromCell(this.curCells[0]);
    } else {
      for (let c of this.curCells) {
        if (Blob.volumeAt(c, $J.cls(Tengu$FireAbility$FireBlob)) > 0) {
          this.spreadFromCell(c);
        }
      }
    }
    for (let c of this.curCells) {
      this.toCells.remove(c);
    }
    if (this.toCells.isEmpty()) {
      this.detach();
    } else {
      this.curCells = $J.newArray(this.toCells.size(), 0);
      let i = 0;
      for (const $it4 = this.toCells.iterator(); $it4.hasNext(); ) {
        let c = $it4.next();
        GameScene.add$Blob(Blob.seed$int$int$Class(c, 2, $J.cls(Tengu$FireAbility$FireBlob)));
        this.curCells[i] = c;
        i++;
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  spreadFromCell(cell: number): void {
    if (!(Dungeon.level.solid[(cell + PathFinder.CIRCLE8[this.left(this.direction)]) | 0])) {
      this.toCells.add((cell + PathFinder.CIRCLE8[this.left(this.direction)]) | 0);
    }
    if (!(Dungeon.level.solid[(cell + PathFinder.CIRCLE8[this.direction]) | 0])) {
      this.toCells.add((cell + PathFinder.CIRCLE8[this.direction]) | 0);
    }
    if (!(Dungeon.level.solid[(cell + PathFinder.CIRCLE8[this.right(this.direction)]) | 0])) {
      this.toCells.add((cell + PathFinder.CIRCLE8[this.right(this.direction)]) | 0);
    }
  }
  left(direction: number): number {
    return direction === 0 ? 7 : (direction - 1) | 0;
  }
  right(direction: number): number {
    return direction === 7 ? 0 : (direction + 1) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Tengu$FireAbility.DIRECTION, this.direction);
    if (this.curCells != null) {
      bundle.put$String$intArr(Tengu$FireAbility.CUR_CELLS, this.curCells);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.direction = bundle.getInt(Tengu$FireAbility.DIRECTION);
    if (bundle.contains(Tengu$FireAbility.CUR_CELLS)) {
      this.curCells = bundle.getIntArray(Tengu$FireAbility.CUR_CELLS);
    }
  }
}

export class Tengu$FireAbility$FireBlob extends Blob {
  _Tengu$FireAbility$FireBlob(): this {
    this._Blob();
    this.actPriority = (Actor.BUFF_PRIO - 1) | 0;
    this.alwaysVisible = true;
    return this;
  }
  evolve(): void {
    let observe = false;
    let burned = false;
    let cell: number;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        this.off[cell] = $J.d2i(GameMath.gate(0, Math.fround((this.cur[cell] - 1) | 0), 1));
        if (this.off[cell] > 0) {
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        }
        if (this.cur[cell] > 0 && this.off[cell] === 0) {
          let ch = Actor.findChar(cell);
          if (ch != null && !ch.isImmune($J.cls(Fire)) && !(ch instanceof Tengu)) {
            Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char(ch);
          }
          if (ch === Dungeon.hero) {
            Statistics.qualifiedForBossChallengeBadge = false;
            Statistics.bossScores[1] = (Statistics.bossScores[1] - 100) | 0;
          }
          let heap = Dungeon.level.heaps.get(cell);
          if (heap != null) {
            heap.burn();
          }
          let plant = Dungeon.level.plants.get(cell);
          if (plant != null) {
            plant.wither();
          }
          if (Dungeon.level.flamable[cell]) {
            Dungeon.level.destroy(cell);
            observe = true;
            GameScene.updateMap$int(cell);
          }
          burned = true;
          CellEmitter.get(cell).start(FlameParticle.FACTORY, Math.fround(0.03), 10);
        }
      }
    }
    if (observe) {
      Dungeon.observe$();
    }
    if (burned) {
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int(Speck.STEAM), Math.fround(0.2));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class Tengu$ShockerAbility extends Buff {
  shockerPos: number = 0;
  shockingOrdinals: boolean = null;
  static readonly SHOCKER_POS: string = 'shocker_pos';
  static readonly SHOCKING_ORDINALS: string = 'shocking_ordinals';
  _Tengu$ShockerAbility(): this {
    this._Buff();
    this.shockingOrdinals = null;
    return this;
  }
  act(): boolean {
    if (this.shockingOrdinals == null) {
      this.shockingOrdinals = Random.Int$int(2) === 1;
      this.spreadblob();
    } else if (this.shockingOrdinals) {
      this.target.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((this.shockerPos - 1 - Dungeon.level.width()) | 0, (this.shockerPos + 1 + Dungeon.level.width()) | 0, null));
      this.target.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((this.shockerPos - 1 + Dungeon.level.width()) | 0, (this.shockerPos + 1 - Dungeon.level.width()) | 0, null));
      if (Dungeon.level.distance(Dungeon.hero.pos, this.shockerPos) <= 1) {
        Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      }
      this.shockingOrdinals = false;
      this.spreadblob();
    } else {
      this.target.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((this.shockerPos - Dungeon.level.width()) | 0, (this.shockerPos + Dungeon.level.width()) | 0, null));
      this.target.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((this.shockerPos - 1) | 0, (this.shockerPos + 1) | 0, null));
      if (Dungeon.level.distance(Dungeon.hero.pos, this.shockerPos) <= 1) {
        Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
      }
      this.shockingOrdinals = true;
      this.spreadblob();
    }
    this.spend(Actor.TICK);
    return true;
  }
  spreadblob(): void {
    GameScene.add$Blob(Blob.seed$int$int$Class(this.shockerPos, 1, $J.cls(Tengu$ShockerAbility$ShockerBlob)));
    for (let i = this.shockingOrdinals ? 0 : 1; i < PathFinder.CIRCLE8.length; i = (i + 2) | 0) {
      if (!(Dungeon.level.solid[(this.shockerPos + PathFinder.CIRCLE8[i]) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((this.shockerPos + PathFinder.CIRCLE8[i]) | 0, 2, $J.cls(Tengu$ShockerAbility$ShockerBlob)));
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Tengu$ShockerAbility.SHOCKER_POS, this.shockerPos);
    if (this.shockingOrdinals != null) {
      bundle.put$String$boolean(Tengu$ShockerAbility.SHOCKING_ORDINALS, this.shockingOrdinals);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.shockerPos = bundle.getInt(Tengu$ShockerAbility.SHOCKER_POS);
    if (bundle.contains(Tengu$ShockerAbility.SHOCKING_ORDINALS)) {
      this.shockingOrdinals = bundle.getBoolean(Tengu$ShockerAbility.SHOCKING_ORDINALS);
    }
  }
}

export class Tengu$ShockerAbility$ShockerBlob extends Blob {
  _Tengu$ShockerAbility$ShockerBlob(): this {
    this._Blob();
    this.actPriority = (Actor.BUFF_PRIO - 1) | 0;
    this.alwaysVisible = true;
    return this;
  }
  evolve(): void {
    let shocked = false;
    let cell: number;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        this.off[cell] = this.cur[cell] > 0 ? (this.cur[cell] - 1) | 0 : 0;
        if (this.off[cell] > 0) {
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        }
        if (this.cur[cell] > 0 && this.off[cell] === 0) {
          shocked = true;
          let ch = Actor.findChar(cell);
          if (ch != null && !(ch instanceof Tengu)) {
            ch.damage((2 + Dungeon.scalingDepth()) | 0, new Electricity()._Electricity());
            if (ch === Dungeon.hero) {
              Statistics.qualifiedForBossChallengeBadge = false;
              Statistics.bossScores[1] = (Statistics.bossScores[1] - 100) | 0;
              if (!ch.isAlive()) {
                Dungeon.fail($J.cls(Tengu));
                GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Electricity), 'ondeath', []), []);
              }
            }
          }
        }
      }
    }
    if (shocked) {
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(SparkParticle.STATIC, Math.fround(0.1));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class Tengu$ShockerAbility$ShockerItem extends Item {
  _Tengu$ShockerAbility$ShockerItem(): this {
    this._Item();
    this.dropsDownHeap = true;
    this.unique = true;
    this.image_ = ItemSpriteSheet.TENGU_SHOCKER;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    GLog.w(Messages.get$Object$String$ObjectArr(this, 'cant_pickup', []), []);
    return false;
  }
  onThrow(cell: number): void {
    super.onThrow(cell);
    let buff: Tengu$ShockerAbility;
    if (Tengu.throwingChar != null) {
      buff = Buff.append$Char$Class(Tengu.throwingChar, $J.cls(Tengu$ShockerAbility));
      Tengu.throwingChar = null;
    } else {
      buff = Buff.append$Char$Class(Item.curUser, $J.cls(Tengu$ShockerAbility));
    }
    buff.shockerPos = cell;
    buff.spendToWhole();
  }
  emitter(): Emitter {
    let emitter = new Emitter()._Emitter();
    emitter.pos$float$float(5, 5);
    emitter.fillTarget = false;
    emitter.pour(SparkParticle.FACTORY, Math.fround(0.1));
    return emitter;
  }
}

let $Tengu$1: any = null;
/** An anonymous class (Tengu.java:163). */
function Tengu$1(): any {
  return $Tengu$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Actor.remove(this);
      (Dungeon.level).progress();
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$1', []);
}

let $Tengu$2: any = null;
/** An anonymous class (Tengu.java:189). */
function Tengu$2(): any {
  return $Tengu$2 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Actor.remove(this);
      this.$outer.jump();
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$2', []);
}

let $Tengu$3: any = null;
/** An anonymous class (Tengu.java:597). */
function Tengu$3(): any {
  return $Tengu$3 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_item.onThrow(this.$cv_finalTargetCell);
      this.$cv_thrower.next();
    }
    $c($item, $finalTargetCell, $thrower): this {
      this.$cv_item = $item; this.$cv_finalTargetCell = $finalTargetCell; this.$cv_thrower = $thrower;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$3', ['com.watabou.utils.Callback']);
}

let $Tengu$4: any = null;
/** An anonymous class (Tengu.java:965). */
function Tengu$4(): any {
  return $Tengu$4 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_item.onThrow(this.$cv_finalTargetCell);
      this.$cv_thrower.next();
    }
    $c($item, $finalTargetCell, $thrower): this {
      this.$cv_item = $item; this.$cv_finalTargetCell = $finalTargetCell; this.$cv_thrower = $thrower;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$4', ['com.watabou.utils.Callback']);
}

$J.define(Tengu, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Tengu' } });
$J.define(Tengu$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Tengu$Hunting' }, inner: true });
$J.define(Tengu$BombAbility, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$BombAbility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Tengu$BombAbility' } });
$J.define(Tengu$BombAbility$BombItem, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$BombAbility$BombItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Tengu$BombAbility$BombItem' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.define(Tengu$FireAbility, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$FireAbility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Tengu$FireAbility' } });
$J.define(Tengu$FireAbility$FireBlob, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$FireAbility$FireBlob', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Tengu$FireAbility$FireBlob' } });
$J.define(Tengu$ShockerAbility, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$ShockerAbility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Tengu$ShockerAbility' } });
$J.define(Tengu$ShockerAbility$ShockerBlob, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$ShockerAbility$ShockerBlob', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Tengu$ShockerAbility$ShockerBlob' } });
$J.define(Tengu$ShockerAbility$ShockerItem, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$ShockerAbility$ShockerItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Tengu$ShockerAbility$ShockerItem' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  SmokeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  TengusMask = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.TengusMask');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  LloydsBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.LloydsBeacon');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  PrisonBossLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel');
  PrisonBossLevel$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$State');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  TenguSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.TenguSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  BArray = $J.load('com.watabou.utils.BArray');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
