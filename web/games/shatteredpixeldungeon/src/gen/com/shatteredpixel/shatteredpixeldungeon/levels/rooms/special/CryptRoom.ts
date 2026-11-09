// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CryptRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Generator, Gold, Heap$Type, Armor$Glyph, IronKey, Terrain, Painter, Room$Door$Type, Point;

export class CryptRoom extends SpecialRoom {
  _CryptRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    let cx = c.x;
    let cy = c.y;
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
    if (entrance.x === this.left_) {
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), Terrain.STATUE);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), Terrain.STATUE);
      cx = (this.right_ - 2) | 0;
    } else if (entrance.x === this.right_) {
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), Terrain.STATUE);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), Terrain.STATUE);
      cx = (this.left_ + 2) | 0;
    } else if (entrance.y === this.top_) {
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), Terrain.STATUE);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), Terrain.STATUE);
      cy = (this.bottom_ - 2) | 0;
    } else if (entrance.y === this.bottom_) {
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), Terrain.STATUE);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), Terrain.STATUE);
      cy = (this.top_ + 2) | 0;
    }
    level.drop(CryptRoom.prize(level), (cx + Math.imul(cy, level.width())) | 0).type_ = Heap$Type.TOMB;
  }
  static prize(level: Level): Item {
    let prize = Generator.randomArmor$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
    if (Challenges.isItemBlocked(prize)) {
      return new Gold()._Gold$().random();
    }
    let curse = Armor$Glyph.randomCurse([]);
    if (!prize.cursed) {
      prize.upgrade$();
      if (!prize.hasGoodGlyph()) {
        prize.inscribe$Glyph(curse);
      }
    }
    prize.cursed = prize.cursedKnown = true;
    return prize;
  }
}

$J.define(CryptRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CryptRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_CryptRoom' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
