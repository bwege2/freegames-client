// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/HermitCrab.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Crab } from './Crab.ts';

let Dungeon, Generator, HermitCrabSprite;

export class HermitCrab extends Crab {
  _HermitCrab(): this {
    this._Crab();
    this.spriteClass = $J.cls(HermitCrabSprite);
    this.HP = this.HT = 25;
    this.baseSpeed = 1;
    this.lootChance_ = 0.5;
    return this;
  }
  rollToDropLoot(): void {
    super.rollToDropLoot();
    if (Dungeon.hero.lvl <= ((this.maxLvl + 2) | 0)) {
      Dungeon.level.drop(Generator.randomArmor$(), this.pos).sprite_.drop$();
    }
  }
  drRoll(): number {
    return (super.drRoll() + 2) | 0;
  }
}

$J.define(HermitCrab, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.HermitCrab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab', ctors: { '': '_HermitCrab' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  HermitCrabSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HermitCrabSprite');
});
