// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Albino.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Rat } from './Rat.ts';

let Bleeding, Buff, MysteryMeat, AlbinoSprite, Random;

export class Albino extends Rat {
  _Albino(): this {
    this._Rat();
    this.spriteClass = $J.cls(AlbinoSprite);
    this.HP = this.HT = 12;
    this.EXP = 2;
    this.loot = $J.cls(MysteryMeat);
    this.lootChance_ = 1;
    return this;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (damage > 0 && Random.Int$int(2) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Bleeding)).set$float(Random.NormalFloat(2, 3));
    }
    return damage;
  }
}

$J.define(Albino, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Albino', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', ctors: { '': '_Albino' } });
$J.module(() => {
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  AlbinoSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.AlbinoSprite');
  Random = $J.load('com.watabou.utils.Random');
});
