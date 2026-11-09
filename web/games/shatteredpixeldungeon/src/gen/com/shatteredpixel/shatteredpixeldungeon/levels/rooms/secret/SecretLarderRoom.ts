// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretLarderRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { SecretRoom } from './SecretRoom.ts';

let Dungeon, Hunger, ChargrilledMeat, Pasty, Terrain, Painter, Room$Door$Type, BlandfruitBush$Seed;

export class SecretLarderRoom extends SecretRoom {
  _SecretLarderRoom(): this {
    this._SecretRoom();
    return this;
  }
  minHeight(): number {
    return 6;
  }
  minWidth(): number {
    return 6;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let c = this.center();
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 3, Terrain.WATER);
    Painter.set$Level$Point$int(level, c, Terrain.GRASS);
    level.plant(new BlandfruitBush$Seed()._BlandfruitBush$Seed(), level.pointToCell(c));
    let extraFood = Math.imul($J.d2i((Math.fround(Hunger.STARVING - Hunger.HUNGRY))), ((1 + $J.idiv(Dungeon.depth, 5)) | 0));
    while (extraFood > 0) {
      let food: Food;
      if (Math.fround(extraFood) >= Hunger.STARVING) {
        food = new Pasty()._Pasty();
        extraFood = $J.d2i(Math.fround(extraFood - Hunger.STARVING));
      } else {
        food = new ChargrilledMeat()._ChargrilledMeat();
        extraFood = $J.d2i(Math.fround(extraFood - (Math.fround(Hunger.STARVING - Hunger.HUNGRY))));
      }
      let foodPos: number;
      do {
        foodPos = level.pointToCell(this.random$());
      } while (level.map_[foodPos] !== Terrain.EMPTY_SP || level.heaps.get(foodPos) != null);
      level.drop(food, foodPos);
    }
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
}

$J.define(SecretLarderRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretLarderRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretLarderRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  BlandfruitBush$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.BlandfruitBush$Seed');
});
