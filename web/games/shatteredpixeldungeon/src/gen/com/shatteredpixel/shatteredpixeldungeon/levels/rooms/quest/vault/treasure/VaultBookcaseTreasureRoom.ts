// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultBookcaseTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../../jre/index.ts';
import { VaultTreasureRoom } from './VaultTreasureRoom.ts';

let Heap$Type, PotionOfLiquidFlame, DwarfToken, Terrain, Painter, Room$Door$Type, GameMath, PathFinder, Random;

export class VaultBookcaseTreasureRoom extends VaultTreasureRoom {
  _VaultBookcaseTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    let firstItem: number;
    let secondItem: number;
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      let bookTop = $J.d2i(GameMath.gate(Math.fround((this.top_ + 1) | 0), Math.fround((entrance.y - 2) | 0), Math.fround((this.bottom_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, bookTop, 9, 5, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (bookTop + 1) | 0, 3, 3, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 6) | 0, (bookTop + 1) | 0, 3, 3, Terrain.EMPTY_SP);
      if (entrance.x === this.left_) {
        firstItem = (this.left_ + 3 + Math.imul(level.width(), ((bookTop + 2) | 0))) | 0;
        secondItem = (this.right_ - 3 + Math.imul(level.width(), ((bookTop + 2) | 0))) | 0;
      } else {
        firstItem = (this.right_ - 3 + Math.imul(level.width(), ((bookTop + 2) | 0))) | 0;
        secondItem = (this.left_ + 3 + Math.imul(level.width(), ((bookTop + 2) | 0))) | 0;
      }
    } else {
      let bookLeft = $J.d2i(GameMath.gate(Math.fround((this.left_ + 1) | 0), Math.fround((entrance.x - 2) | 0), Math.fround((this.right_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, bookLeft, (this.top_ + 1) | 0, 5, 9, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (bookLeft + 1) | 0, (this.top_ + 2) | 0, 3, 3, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, (bookLeft + 1) | 0, (this.top_ + 6) | 0, 3, 3, Terrain.EMPTY_SP);
      if (entrance.y === this.top_) {
        firstItem = (bookLeft + 2 + Math.imul(level.width(), ((this.top_ + 3) | 0))) | 0;
        secondItem = (bookLeft + 2 + Math.imul(level.width(), ((this.bottom_ - 3) | 0))) | 0;
      } else {
        firstItem = (bookLeft + 2 + Math.imul(level.width(), ((this.bottom_ - 3) | 0))) | 0;
        secondItem = (bookLeft + 2 + Math.imul(level.width(), ((this.top_ + 3) | 0))) | 0;
      }
    }
    Painter.set$Level$int$int(level, firstItem, Terrain.PEDESTAL);
    Painter.set$Level$int$int(level, secondItem, Terrain.PEDESTAL);
    let treasureItem = level.findPrizeItem$();
    if (treasureItem != null) {
      level.drop(treasureItem, firstItem);
    }
    treasureItem = (level).createEquipment(2);
    level.drop(treasureItem, secondItem).type_ = Heap$Type.CHEST;
    treasureItem = (level).findT3SolveItem();
    if (treasureItem == null) {
      treasureItem = (level).createConsumabe(2);
    }
    level.drop(treasureItem, (secondItem + PathFinder.NEIGHBOURS8[Random.Int$int(PathFinder.NEIGHBOURS8.length)]) | 0);
    treasureItem = new DwarfToken()._DwarfToken();
    level.drop(treasureItem, (secondItem + PathFinder.NEIGHBOURS8[Random.Int$int(PathFinder.NEIGHBOURS8.length)]) | 0);
    level.addItemToSpawn(new PotionOfLiquidFlame()._PotionOfLiquidFlame());
    Painter.drawInside(level, this, entrance, 2, Terrain.EMPTY_SP);
  }
}

$J.define(VaultBookcaseTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultBookcaseTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultBookcaseTreasureRoom' } });
$J.module(() => {
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
