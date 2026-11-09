// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Spinner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Fleeing } from './Mob.ts';

let Dungeon, Blob, Web, AscensionChallenge, Buff, Dread, Poison, Terror, MysteryMeat, Ballistica, GameScene, SpinnerSprite, PathFinder, Random;

export class Spinner extends Mob {
  webCoolDown: number = 0;
  lastEnemyPos: number = 0;
  static readonly WEB_COOLDOWN: string = 'web_cooldown';
  static readonly LAST_ENEMY_POS: string = 'last_enemy_pos';
  shotWebVisually: boolean = false;
  _Spinner(): this {
    this._Mob();
    this.spriteClass = $J.cls(SpinnerSprite);
    this.HP = this.HT = 50;
    this.defenseSkill_ = 17;
    this.EXP = 9;
    this.maxLvl = 17;
    this.loot = $J.cls(MysteryMeat);
    this.lootChance_ = 0.125;
    this.HUNTING = new Spinner$Hunting().$o(this)._Spinner$Hunting();
    this.FLEEING = new Spinner$Fleeing().$o(this)._Spinner$Fleeing();
    this.webCoolDown = 0;
    this.lastEnemyPos = -1;
    this.shotWebVisually = false;
    this.resistances_.add($J.cls(Poison));
    this.immunities_.add($J.cls(Web));
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(10, 20);
  }
  attackSkill(target: Char): number {
    return 22;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 6)) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Spinner.WEB_COOLDOWN, this.webCoolDown);
    bundle.put$String$int(Spinner.LAST_ENEMY_POS, this.lastEnemyPos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.webCoolDown = bundle.getInt(Spinner.WEB_COOLDOWN);
    this.lastEnemyPos = bundle.getInt(Spinner.LAST_ENEMY_POS);
  }
  act(): boolean {
    if (this.state_ === this.HUNTING || this.state_ === this.FLEEING) {
      this.webCoolDown--;
    }
    let lastState = this.state_;
    let result = super.act();
    if (!(lastState === this.WANDERING && this.state_ === this.HUNTING)) {
      if (!this.shotWebVisually) {
        if (this.enemy != null && this.enemySeen) {
          this.lastEnemyPos = this.enemy.pos;
        } else {
          this.lastEnemyPos = Dungeon.hero.pos;
        }
      }
      this.shotWebVisually = false;
    }
    return result;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(2) === 0) {
      let duration = Random.IntRange(7, 8);
      duration = $J.roundf(Math.fround(duration * (Math.fround(Math.fround(AscensionChallenge.statModifier(this) / 2) + 0.5))));
      Buff.affect$Char$Class(enemy, $J.cls(Poison)).set(Math.fround(duration));
      this.webCoolDown = 0;
      this.state_ = this.FLEEING;
    }
    return damage;
  }
  webPos(): number {
    let enemy = this.enemy;
    if (enemy == null) {
      return -1;
    }
    if (this.state_ !== this.FLEEING && enemy.pos === this.lastEnemyPos && this.canAttack(enemy)) {
      return -1;
    }
    let b: Ballistica;
    if (this.lastEnemyPos === enemy.pos) {
      b = new Ballistica()._Ballistica(enemy.pos, this.pos, Ballistica.WONT_STOP);
    } else {
      b = new Ballistica()._Ballistica(this.lastEnemyPos, enemy.pos, Ballistica.WONT_STOP);
    }
    let collisionIndex = 0;
    for (let i = 0; i < b.path.size(); i++) {
      if (b.path.get(i) === enemy.pos) {
        collisionIndex = i;
        break;
      }
    }
    if (b.path.size() <= ((collisionIndex + 1) | 0)) {
      return -1;
    }
    let webPos = b.path.get((collisionIndex + 1) | 0);
    let projectilePos = (new Ballistica()._Ballistica(this.pos, webPos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID)).collisionPos;
    if (webPos !== enemy.pos && projectilePos === webPos && Dungeon.level.passable[webPos]) {
      return webPos;
    } else {
      return -1;
    }
  }
  shootWeb(): void {
    let webPos = this.webPos();
    if (webPos !== -1) {
      let i: number;
      for (i = 0; i < PathFinder.CIRCLE8.length; i++) {
        if (((this.enemy.pos + PathFinder.CIRCLE8[i]) | 0) === webPos) {
          break;
        }
      }
      let leftPos = (this.enemy.pos + PathFinder.CIRCLE8[this.left(i)]) | 0;
      let rightPos = (this.enemy.pos + PathFinder.CIRCLE8[this.right(i)]) | 0;
      if (Dungeon.level.passable[leftPos]) {
        this.applyWebToCell(leftPos);
      }
      if (Dungeon.level.passable[webPos]) {
        this.applyWebToCell(webPos);
      }
      if (Dungeon.level.passable[rightPos]) {
        this.applyWebToCell(rightPos);
      }
      this.webCoolDown = 10;
      if (Dungeon.level.heroFOV[this.enemy.pos]) {
        Dungeon.hero.interrupt();
      }
    }
    this.next();
  }
  applyWebToCell(cell: number): void {
    GameScene.add$Blob(Blob.seed$int$int$Class(cell, 20, $J.cls(Web)));
  }
  left(direction: number): number {
    return direction === 0 ? 7 : (direction - 1) | 0;
  }
  right(direction: number): number {
    return direction === 7 ? 0 : (direction + 1) | 0;
  }
}

export class Spinner$Hunting extends Mob$Hunting {
  _Spinner$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV && this.$outer.webCoolDown <= 0 && this.$outer.lastEnemyPos !== -1) {
      if (this.$outer.webPos() !== -1) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.webPos());
          this.$outer.shotWebVisually = true;
          return false;
        } else {
          this.$outer.shootWeb();
          return true;
        }
      }
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

export class Spinner$Fleeing extends Mob$Fleeing {
  _Spinner$Fleeing(): this {
    this._Mob$Fleeing();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (this.$outer.buff($J.cls(Terror)) == null && this.$outer.buff($J.cls(Dread)) == null && enemyInFOV && this.$outer.enemy.buff($J.cls(Poison)) == null) {
      this.$outer.state_ = this.$outer.HUNTING;
      return true;
    }
    if (enemyInFOV && this.$outer.webCoolDown <= 0 && this.$outer.lastEnemyPos !== -1) {
      if (this.$outer.webPos() !== -1) {
        if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
          this.$outer.sprite_.zap$int(this.$outer.webPos());
          this.$outer.shotWebVisually = true;
          return false;
        } else {
          this.$outer.shootWeb();
          return true;
        }
      }
    }
    return super.act(enemyInFOV, justAlerted);
  }
}

$J.define(Spinner, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Spinner' } });
$J.define(Spinner$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Spinner$Hunting' }, inner: true });
$J.define(Spinner$Fleeing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner$Fleeing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Fleeing', ctors: { '': '_Spinner$Fleeing' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Web = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Web');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SpinnerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SpinnerSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
