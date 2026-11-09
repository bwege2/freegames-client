// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bee.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Char$Alignment, AllyBuff, Amok, StoneOfAggression$Aggression, Messages, BeeSprite, Random;

export class Bee extends Mob {
  level_: number = 0;
  potPos_: number = 0;
  potHolder: number = 0;
  static readonly LEVEL: string = 'level';
  static readonly POTPOS: string = 'potpos';
  static readonly POTHOLDER: string = 'potholder';
  static readonly ALIGMNENT: string = 'alignment';
  _Bee(): this {
    this._Mob();
    this.spriteClass = $J.cls(BeeSprite);
    this.viewDistance = 4;
    this.EXP = 0;
    this.flying = true;
    this.state_ = this.WANDERING;
    this.intelligentAlly = true;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Bee.LEVEL, this.level_);
    bundle.put$String$int(Bee.POTPOS, this.potPos_);
    bundle.put$String$int(Bee.POTHOLDER, this.potHolder);
    bundle.put$String$Enum(Bee.ALIGMNENT, this.alignment);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spawn(bundle.getInt(Bee.LEVEL));
    this.potPos_ = bundle.getInt(Bee.POTPOS);
    this.potHolder = bundle.getInt(Bee.POTHOLDER);
    if (bundle.contains(Bee.ALIGMNENT)) {
      this.alignment = bundle.getEnum(Bee.ALIGMNENT, $J.cls(Char$Alignment));
    }
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  spawn(level: number): void {
    this.level_ = level;
    this.HT = Math.imul(((2 + level) | 0), 4);
    this.defenseSkill_ = (9 + level) | 0;
  }
  setPotInfo(potPos: number, potHolder: Char): void {
    this.potPos_ = potPos;
    if (potHolder == null) {
      this.potHolder = -1;
    } else {
      this.potHolder = potHolder.id();
    }
  }
  potPos(): number {
    return this.potPos_;
  }
  potHolderID(): number {
    return this.potHolder;
  }
  attackSkill(target: Char): number {
    return this.defenseSkill_;
  }
  damageRoll(): number {
    return Random.NormalIntRange($J.idiv(this.HT, 10), $J.idiv(this.HT, 4));
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (enemy instanceof Mob) {
      (enemy).aggro(this);
    }
    return damage;
  }
  add(buff: Buff): boolean {
    if (super.add(buff)) {
      if (buff instanceof AllyBuff) {
        this.intelligentAlly = false;
        this.setPotInfo(-1, null);
      }
      return true;
    }
    return false;
  }
  chooseEnemy(): Char {
    if (this.alignment === Char$Alignment.ALLY || (this.potHolder === -1 && this.potPos_ === -1)) {
      return super.chooseEnemy();
    } else if (Actor.findById(this.potHolder) != null) {
      return Actor.findById(this.potHolder);
    } else {
      if ((this.alignment === Char$Alignment.ENEMY || this.buff($J.cls(Amok)) != null) && this.state_ !== this.PASSIVE && this.state_ !== this.SLEEPING) {
        if (this.enemy != null && this.enemy.buff($J.cls(StoneOfAggression$Aggression)) != null && Dungeon.level.distance(this.enemy.pos, this.potPos_) <= 3) {
          this.state_ = this.HUNTING;
          return this.enemy;
        }
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (ch !== this && this.fieldOfView[ch.pos] && Dungeon.level.distance(ch.pos, this.potPos_) <= 3 && ch.buff($J.cls(StoneOfAggression$Aggression)) != null) {
            this.state_ = this.HUNTING;
            return ch;
          }
        }
      }
      if (this.enemy == null || !this.enemy.isAlive() || !Actor.chars().contains(this.enemy) || this.state_ === this.WANDERING || Dungeon.level.distance(this.enemy.pos, this.potPos_) > 3 || (this.alignment === Char$Alignment.ALLY && this.enemy.alignment === Char$Alignment.ALLY) || (this.buff($J.cls(Amok)) == null && this.enemy.isInvulnerable($J.getClass(this)))) {
        let closest = null;
        for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
          let mob = $it1.next();
          if (!(mob === this) && Dungeon.level.distance(mob.pos, this.potPos_) <= 3 && mob.alignment !== Char$Alignment.NEUTRAL && !mob.isInvulnerable($J.getClass(this)) && !(this.alignment === Char$Alignment.ALLY && mob.alignment === Char$Alignment.ALLY)) {
            if (closest == null || Dungeon.level.distance(closest.pos, this.pos) > Dungeon.level.distance(mob.pos, this.pos)) {
              closest = mob;
            }
          }
        }
        if (closest != null) {
          return closest;
        } else {
          if (this.alignment !== Char$Alignment.ALLY && Dungeon.level.distance(Dungeon.hero.pos, this.potPos_) <= 3) {
            return Dungeon.hero;
          } else {
            return null;
          }
        }
      } else {
        return this.enemy;
      }
    }
  }
  getCloser(target: number): boolean {
    if (this.alignment === Char$Alignment.ALLY && this.enemy == null && this.buffs$Class($J.cls(AllyBuff)).isEmpty()) {
      target = Dungeon.hero.pos;
    } else if (this.enemy != null && Actor.findById(this.potHolder) === this.enemy) {
      target = this.enemy.pos;
    } else if (this.potPos_ !== -1 && (this.state_ === this.WANDERING || Dungeon.level.distance(target, this.potPos_) > 3)) {
      if (!Dungeon.level.insideMap(this.potPos_)) {
        this.potPos_ = -1;
      } else {
        this.target = target = this.potPos_;
      }
    }
    return super.getCloser(target);
  }
  description(): string {
    if (this.alignment === Char$Alignment.ALLY && this.buffs$Class($J.cls(AllyBuff)).isEmpty()) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_honey', []);
    } else {
      return super.description();
    }
  }
}

$J.define(Bee, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Bee' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  StoneOfAggression$Aggression = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression$Aggression');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BeeSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BeeSprite');
  Random = $J.load('com.watabou.utils.Random');
});
