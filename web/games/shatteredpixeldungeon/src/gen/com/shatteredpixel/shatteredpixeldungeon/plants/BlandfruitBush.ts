// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/BlandfruitBush.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Plant } from './Plant.ts';
import { Plant$Seed } from './Plant.ts';

let Dungeon, Blandfruit;

export class BlandfruitBush extends Plant {
  _BlandfruitBush(): this {
    this._Plant();
    this.image_ = 12;
    return this;
  }
  activate(ch: Char): void {
    Dungeon.level.drop(new Blandfruit()._Blandfruit(), this.pos).sprite_.drop$();
  }
}

export class BlandfruitBush$Seed extends Plant$Seed {
  _BlandfruitBush$Seed(): this {
    this._Plant$Seed();
    this.plantClass = $J.cls(BlandfruitBush);
    return this;
  }
}

$J.define(BlandfruitBush, 'com.shatteredpixel.shatteredpixeldungeon.plants.BlandfruitBush', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_BlandfruitBush' } });
$J.define(BlandfruitBush$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.BlandfruitBush$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_BlandfruitBush$Seed' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blandfruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit');
});
