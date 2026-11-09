// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/StatueRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SpecialRoom } from './SpecialRoom.ts';

let Dungeon, Statue, IronKey, Terrain, Painter, Room$Door$Type;

export class StatueRoom extends SpecialRoom {
  _StatueRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    let cx = c.x;
    let cy = c.y;
    let door = this.entrance();
    door.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
    if (door.x === this.left_) {
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.STATUE);
      cx = (this.right_ - 2) | 0;
    } else if (door.x === this.right_) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.STATUE);
      cx = (this.left_ + 2) | 0;
    } else if (door.y === this.top_) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.bottom_ - 1) | 0, (this.width() - 2) | 0, 1, Terrain.STATUE);
      cy = (this.bottom_ - 2) | 0;
    } else if (door.y === this.bottom_) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, 1, Terrain.STATUE);
      cy = (this.top_ + 2) | 0;
    }
    let statue = Statue.random$();
    statue.pos = (cx + Math.imul(cy, level.width())) | 0;
    level.mobs.add(statue);
  }
}

$J.define(StatueRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StatueRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_StatueRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
