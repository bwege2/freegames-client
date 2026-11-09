// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bandit.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Thief } from './Thief.ts';

let Dungeon, Blindness, Buff, Cripple, Poison, BanditSprite, Random;

export class Bandit extends Thief {
  item$Bandit: Item = null;
  _Bandit(): this {
    this._Thief();
    this.spriteClass = $J.cls(BanditSprite);
    this.lootChance_ = 1;
    return this;
  }
  steal(hero: Hero): boolean {
    if (super.steal(hero)) {
      Buff.prolong(hero, $J.cls(Blindness), Math.fround(Blindness.DURATION / 2));
      Buff.affect$Char$Class(hero, $J.cls(Poison)).set(Math.fround(Random.IntRange(5, 6)));
      Buff.prolong(hero, $J.cls(Cripple), Math.fround(Cripple.DURATION / 2));
      Dungeon.observe$();
      return true;
    } else {
      return false;
    }
  }
}

$J.define(Bandit, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bandit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief', ctors: { '': '_Bandit' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  BanditSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BanditSprite');
  Random = $J.load('com.watabou.utils.Random');
});
