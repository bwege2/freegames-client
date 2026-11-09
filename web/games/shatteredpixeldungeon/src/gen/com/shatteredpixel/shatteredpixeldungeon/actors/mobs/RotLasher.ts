// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RotLasher.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Actor, Char$Property, ToxicGas, Buff, Burning, Cripple, FloatingText, Generator$Category, CharSprite, RotLasherSprite, Random;

export class RotLasher extends Mob {
  _RotLasher(): this {
    this._Mob();
    this.spriteClass = $J.cls(RotLasherSprite);
    this.HP = this.HT = 80;
    this.defenseSkill_ = 0;
    this.EXP = 1;
    this.loot = Generator$Category.SEED;
    this.lootChance_ = 0.75;
    this.state_ = this.WANDERING = new RotLasher$Waiting().$o(this)._RotLasher$Waiting();
    this.viewDistance = 1;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.MINIBOSS);
    this.immunities_.add($J.cls(ToxicGas));
    return this;
  }
  act(): boolean {
    if (this.HP < this.HT && (this.enemy == null || !Dungeon.level.adjacent(this.pos, this.enemy.pos))) {
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(Math.min(5, (this.HT - this.HP) | 0)), FloatingText.HEALING, []);
      this.HP = Math.min(this.HT, (this.HP + 5) | 0);
    }
    return super.act();
  }
  damage(dmg: number, src: any): void {
    if (src instanceof Burning) {
      this.destroy();
      this.sprite_.die();
    } else {
      super.damage(dmg, src);
    }
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    if (enemy === Dungeon.hero) {
      Statistics.questScores[1] = (Statistics.questScores[1] - 100) | 0;
    }
    return super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    Buff.affect$Char$Class$float(enemy, $J.cls(Cripple), 2);
    return super.attackProc(enemy, damage);
  }
  reset(): boolean {
    return true;
  }
  getCloser(target: number): boolean {
    return false;
  }
  getFurther(target: number): boolean {
    return false;
  }
  damageRoll(): number {
    return Random.NormalIntRange(10, 20);
  }
  attackSkill(target: Char): number {
    return 25;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 8)) | 0;
  }
}

export class RotLasher$Waiting extends Mob$Wandering {
  _RotLasher$Waiting(): this {
    this._Mob$Wandering();
    return this;
  }
  noticeEnemy(): boolean {
    this.$outer.spend(Actor.TICK);
    return super.noticeEnemy();
  }
}

$J.define(RotLasher, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotLasher', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_RotLasher' }, meths: { 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float' } });
$J.define(RotLasher$Waiting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotLasher$Waiting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_RotLasher$Waiting' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  RotLasherSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RotLasherSprite');
  Random = $J.load('com.watabou.utils.Random');
});
