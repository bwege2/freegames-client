// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM200.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Hunting } from './Mob.ts';

let Dungeon, Dungeon$LimitedDrops, Actor, Char$Property, Blob, ToxicGas, Generator, Generator$Category, Ballistica, GameScene, DM200Sprite, BArray, PathFinder, Random;

export class DM200 extends Mob {
  ventCooldown: number = 0;
  static readonly VENT_COOLDOWN: string = 'vent_cooldown';
  _DM200(): this {
    this._Mob();
    this.spriteClass = $J.cls(DM200Sprite);
    this.HP = this.HT = 80;
    this.defenseSkill_ = 12;
    this.EXP = 9;
    this.maxLvl = 17;
    this.loot = Random.oneOf([Generator$Category.WEAPON, Generator$Category.ARMOR]);
    this.lootChance_ = Math.fround(0.2);
    this.properties_.add(Char$Property.INORGANIC);
    this.properties_.add(Char$Property.LARGE);
    this.HUNTING = new DM200$Hunting().$o(this)._DM200$Hunting();
    this.ventCooldown = 0;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(10, 25);
  }
  attackSkill(target: Char): number {
    return 20;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 8)) | 0;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.DM200_EQUIP.count_)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.DM200_EQUIP.count_++;
    if (this.loot === Generator$Category.WEAPON) {
      return Generator.randomWeapon$int$boolean(4, true);
    } else {
      return Generator.randomArmor$int(4);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(DM200.VENT_COOLDOWN, this.ventCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.ventCooldown = bundle.getInt(DM200.VENT_COOLDOWN);
  }
  act(): boolean {
    this.ventCooldown--;
    return super.act();
  }
  onZapComplete(): void {
    this.zap$$DM200();
    this.next();
  }
  zap$$DM200(): void {
    this.spend(Actor.TICK);
    this.ventCooldown = 30;
    let trajectory = new Ballistica()._Ballistica(this.pos, this.enemy.pos, Ballistica.STOP_TARGET);
    for (const $it0 = trajectory.subPath(0, trajectory.dist).iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      GameScene.add$Blob(Blob.seed$int$int$Class(i, 20, $J.cls(ToxicGas)));
    }
    GameScene.add$Blob(Blob.seed$int$int$Class(trajectory.collisionPos, 100, $J.cls(ToxicGas)));
  }
  canVent(target: number): boolean {
    if (this.ventCooldown > 0) {
      return false;
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(target, BArray.not(Dungeon.level.solid, null), (Dungeon.level.distance(this.pos, target) + 1) | 0);
    if (PathFinder.distance[this.pos] === 2147483647) {
      return false;
    }
    return true;
  }
}

export class DM200$Hunting extends Mob$Hunting {
  _DM200$Hunting(): this {
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
      if (this.$outer.distance(this.$outer.enemy) >= 1 && Random.Int$int($J.idiv(100, this.$outer.distance(this.$outer.enemy))) === 0 && this.$outer.canVent(this.$outer.target)) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.enemy.pos);
          return false;
        } else {
          this.$outer.zap$$DM200();
          return true;
        }
      } else if (this.$outer.getCloser(this.$outer.target)) {
        this.$outer.spend(Math.fround(1 / this.$outer.speed()));
        return this.$outer.moveSprite(oldPos, this.$outer.pos);
      } else if (this.$outer.canVent(this.$outer.target)) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.enemy.pos);
          return false;
        } else {
          this.$outer.zap$$DM200();
          return true;
        }
      } else {
        return this.handleUnreachableTarget(enemyInFOV, justAlerted);
      }
    }
  }
}

$J.define(DM200, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_DM200' }, meths: { 'zap()': 'zap$$DM200' } });
$J.define(DM200$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_DM200$Hunting' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DM200Sprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
