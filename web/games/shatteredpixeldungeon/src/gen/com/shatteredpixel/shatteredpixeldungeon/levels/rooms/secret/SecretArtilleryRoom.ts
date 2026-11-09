// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretArtilleryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Bomb$DoubleBomb, Terrain, Painter, Room$Door$Type;

export class SecretArtilleryRoom extends SecretRoom {
  _SecretArtilleryRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    Painter.set$Level$Point$int(level, this.center(), Terrain.STATUE_SP);
    for (let i = 0; i < 3; i++) {
      let itemPos: number;
      do {
        itemPos = level.pointToCell(this.random$());
      } while (level.map_[itemPos] !== Terrain.EMPTY_SP || level.heaps.get(itemPos) != null);
      if (i === 0) {
        level.drop(new Bomb$DoubleBomb()._Bomb$DoubleBomb(), itemPos);
      } else {
        level.drop(Generator.randomMissile$boolean(true), itemPos);
      }
    }
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
}

$J.define(SecretArtilleryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretArtilleryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretArtilleryRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Bomb$DoubleBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$DoubleBomb');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
