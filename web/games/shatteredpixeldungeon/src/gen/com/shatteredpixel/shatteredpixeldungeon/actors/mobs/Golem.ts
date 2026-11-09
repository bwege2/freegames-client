// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Golem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';
import { Mob$Hunting } from './Mob.ts';

let Dungeon, Dungeon$LimitedDrops, Actor, Char, Char$Property, MagicImmune, Hero, Imp$Quest, Generator, Generator$Category, ScrollOfTeleportation, GameScene, GolemSprite, BArray, PathFinder, Random;

export class Golem extends Mob {
  teleporting: boolean = false;
  selfTeleCooldown: number = 0;
  enemyTeleCooldown: number = 0;
  static readonly TELEPORTING: string = 'teleporting';
  static readonly SELF_COOLDOWN: string = 'self_cooldown';
  static readonly ENEMY_COOLDOWN: string = 'enemy_cooldown';
  _Golem(): this {
    this._Mob();
    this.spriteClass = $J.cls(GolemSprite);
    this.HP = this.HT = 120;
    this.defenseSkill_ = 15;
    this.EXP = 12;
    this.maxLvl = 22;
    this.loot = Random.oneOf([Generator$Category.WEAPON, Generator$Category.ARMOR]);
    this.lootChance_ = Math.fround(0.2);
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.LARGE);
    this.WANDERING = new Golem$Wandering().$o(this)._Golem$Wandering();
    this.HUNTING = new Golem$Hunting().$o(this)._Golem$Hunting();
    this.teleporting = false;
    this.selfTeleCooldown = 0;
    this.enemyTeleCooldown = 0;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(25, 30);
  }
  attackSkill(target: Char): number {
    return 28;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 12)) | 0;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.GOLEM_EQUIP.count_)));
  }
  rollToDropLoot(): void {
    Imp$Quest.oldProcess(this);
    super.rollToDropLoot();
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.GOLEM_EQUIP.count_++;
    if (this.loot === Generator$Category.WEAPON) {
      return Generator.randomWeapon$int$boolean(5, true);
    } else {
      return Generator.randomArmor$int(5);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Golem.TELEPORTING, this.teleporting);
    bundle.put$String$int(Golem.SELF_COOLDOWN, this.selfTeleCooldown);
    bundle.put$String$int(Golem.ENEMY_COOLDOWN, this.enemyTeleCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.teleporting = bundle.getBoolean(Golem.TELEPORTING);
    this.selfTeleCooldown = bundle.getInt(Golem.SELF_COOLDOWN);
    this.enemyTeleCooldown = bundle.getInt(Golem.ENEMY_COOLDOWN);
  }
  act(): boolean {
    this.selfTeleCooldown--;
    this.enemyTeleCooldown--;
    if (this.teleporting) {
      (this.sprite_).teleParticles(false);
      if (Actor.findChar(this.target) == null && Dungeon.level.openSpace[this.target]) {
        ScrollOfTeleportation.appear(this, this.target);
        this.selfTeleCooldown = 30;
      } else {
        this.target = Dungeon.level.randomDestination(this);
      }
      this.teleporting = false;
      this.spend(Actor.TICK);
      return true;
    }
    return super.act();
  }
  onZapComplete(): void {
    this.teleportEnemy();
    this.next();
  }
  teleportEnemy(): void {
    this.spend(Actor.TICK);
    let bestPos = this.enemy.pos;
    for (let i of PathFinder.NEIGHBOURS8) {
      if (Dungeon.level.passable[(this.pos + i) | 0] && (Actor.findChar((this.pos + i) | 0)) == null && Dungeon.level.trueDistance((this.pos + i) | 0, this.enemy.pos) > Dungeon.level.trueDistance(bestPos, this.enemy.pos)) {
        bestPos = (this.pos + i) | 0;
      }
    }
    if (this.enemy.buff($J.cls(MagicImmune)) != null) {
      bestPos = this.enemy.pos;
    }
    if (bestPos !== this.enemy.pos) {
      ScrollOfTeleportation.appear(this.enemy, bestPos);
      if (this.enemy instanceof Hero) {
        (this.enemy).interrupt();
        Dungeon.observe$();
        GameScene.updateFog$();
      }
    }
    this.enemyTeleCooldown = 20;
  }
  canTele(target: number): boolean {
    if (this.enemyTeleCooldown > 0) {
      return false;
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(target, BArray.not(Dungeon.level.solid, null), (Dungeon.level.distance(this.pos, target) + 1) | 0);
    if (PathFinder.distance[this.pos] === 2147483647) {
      return false;
    }
    return true;
  }
}

export class Golem$Wandering extends Mob$Wandering {
  _Golem$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  continueWandering(): boolean {
    this.$outer.enemySeen = false;
    let oldPos = this.$outer.pos;
    if (this.$outer.target !== -1 && this.$outer.getCloser(this.$outer.target)) {
      this.$outer.spend(Math.fround(1 / this.$outer.speed()));
      return this.$outer.moveSprite(oldPos, this.$outer.pos);
    } else if (!Dungeon.bossLevel$() && this.$outer.target !== -1 && this.$outer.target !== this.$outer.pos && this.$outer.selfTeleCooldown <= 0) {
      (this.$outer.sprite_).teleParticles(true);
      this.$outer.teleporting = true;
      this.$outer.spend(Math.fround(2 * Actor.TICK));
    } else {
      this.$outer.target = this.randomDestination();
      this.$outer.spend(Actor.TICK);
    }
    return true;
  }
}

export class Golem$Hunting extends Mob$Hunting {
  _Golem$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (!enemyInFOV || this.$outer.canAttack(this.$outer.enemy)) {
      return super.act(enemyInFOV, justAlerted);
    } else {
      if (this.handleRecentAttackers()) {
        return this.act(true, justAlerted);
      }
      this.$outer.enemySeen = true;
      this.$outer.target = this.$outer.enemy.pos;
      let oldPos = this.$outer.pos;
      if (this.$outer.distance(this.$outer.enemy) >= 1 && Random.Int$int($J.idiv(100, this.$outer.distance(this.$outer.enemy))) === 0 && !Char.hasProp(this.$outer.enemy, Char$Property.IMMOVABLE) && this.$outer.canTele(this.$outer.target)) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.enemy.pos);
          return false;
        } else {
          this.$outer.teleportEnemy();
          return true;
        }
      } else if (this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else if (!Char.hasProp(this.$outer.enemy, Char$Property.IMMOVABLE) && this.$outer.canTele(this.$outer.target)) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.enemy.pos);
          return false;
        } else {
          this.$outer.teleportEnemy();
          return true;
        }
      } else {
        return this.handleUnreachableTarget(enemyInFOV, justAlerted);
      }
    }
  }
}

$J.define(Golem, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Golem' } });
$J.define(Golem$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Golem$Wandering' }, inner: true });
$J.define(Golem$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Golem$Hunting' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GolemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GolemSprite');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
