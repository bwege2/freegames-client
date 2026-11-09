// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FungalSentry.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Char$Property, ToxicGas, Buff, Poison, Ballistica, FungalSentrySprite, Random;

export class FungalSentry extends Mob {
  _FungalSentry(): this {
    this._Mob();
    this.spriteClass = $J.cls(FungalSentrySprite);
    this.HP = this.HT = 200;
    this.defenseSkill_ = 12;
    this.EXP = 10;
    this.maxLvl = -2;
    this.state_ = this.WANDERING = new FungalSentry$Waiting().$o(this)._FungalSentry$Waiting();
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.MINIBOSS);
    this.immunities_.add($J.cls(ToxicGas));
    this.immunities_.add($J.cls(Poison));
    return this;
  }
  reset(): boolean {
    return true;
  }
  spawningWeight(): number {
    return 0;
  }
  getCloser(target: number): boolean {
    return false;
  }
  getFurther(target: number): boolean {
    return false;
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 10);
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  attackProc(enemy: Char, damage: number): number {
    Buff.affect$Char$Class(enemy, $J.cls(Poison)).extend(6);
    return super.attackProc(enemy, damage);
  }
  attackSkill(target: Char): number {
    return 50;
  }
}

export class FungalSentry$Waiting extends Mob$Wandering {
  _FungalSentry$Waiting(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (enemyInFOV) {
      return this.noticeEnemy();
    } else {
      return this.continueWandering();
    }
  }
  noticeEnemy(): boolean {
    this.$outer.spend(Actor.TICK);
    return super.noticeEnemy();
  }
}

$J.define(FungalSentry, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalSentry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_FungalSentry' } });
$J.define(FungalSentry$Waiting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalSentry$Waiting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_FungalSentry$Waiting' }, inner: true });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  FungalSentrySprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FungalSentrySprite');
  Random = $J.load('com.watabou.utils.Random');
});
