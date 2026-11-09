// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretRunestoneRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Generator$Category, PotionOfLiquidFlame, StoneOfEnchantment, Terrain, Painter, Room$Door$Type, Point;

export class SecretRunestoneRoom extends SecretRoom {
  _SecretRunestoneRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let entrance = this.entrance();
    let center = this.center();
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      Painter.drawLine(level, new Point()._Point$int$int(center.x, (this.top_ + 1) | 0), new Point()._Point$int$int(center.x, (this.bottom_ - 1) | 0), Terrain.BOOKSHELF);
      if (entrance.x === this.left_) {
        Painter.fill$Level$int$int$int$int$int(level, (center.x + 1) | 0, (this.top_ + 1) | 0, (this.right_ - center.x - 1) | 0, (this.height() - 2) | 0, Terrain.EMPTY_SP);
      } else {
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (center.x - this.left_ - 1) | 0, (this.height() - 2) | 0, Terrain.EMPTY_SP);
      }
    } else {
      Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, center.y), new Point()._Point$int$int((this.right_ - 1) | 0, center.y), Terrain.BOOKSHELF);
      if (entrance.y === this.top_) {
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (center.y + 1) | 0, (this.width() - 2) | 0, (this.bottom_ - center.y - 1) | 0, Terrain.EMPTY_SP);
      } else {
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, (center.y - this.top_ - 1) | 0, Terrain.EMPTY_SP);
      }
    }
    level.addItemToSpawn(new PotionOfLiquidFlame()._PotionOfLiquidFlame());
    let dropPos: number;
    do {
      dropPos = level.pointToCell(this.random$());
    } while (level.map_[dropPos] !== Terrain.EMPTY);
    level.drop(Generator.randomUsingDefaults$Category(Generator$Category.STONE), dropPos);
    do {
      dropPos = level.pointToCell(this.random$());
    } while (level.map_[dropPos] !== Terrain.EMPTY || level.heaps.get(dropPos) != null);
    level.drop(Generator.randomUsingDefaults$Category(Generator$Category.STONE), dropPos);
    do {
      dropPos = level.pointToCell(this.random$());
    } while (level.map_[dropPos] !== Terrain.EMPTY_SP);
    level.drop(new StoneOfEnchantment()._StoneOfEnchantment(), dropPos);
    entrance.set$Type(Room$Door$Type.HIDDEN);
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.map_[l.pointToCell(p)] !== Terrain.EMPTY_SP;
  }
}

$J.define(SecretRunestoneRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRunestoneRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretRunestoneRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
