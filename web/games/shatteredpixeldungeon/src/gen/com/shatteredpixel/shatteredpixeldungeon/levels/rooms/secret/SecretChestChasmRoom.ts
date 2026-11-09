// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretChestChasmRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Heap$Type, GoldenKey, PotionOfLevitation, Terrain, Painter, Room$Door$Type, Point;

export class SecretChestChasmRoom extends SecretRoom {
  _SecretChestChasmRoom(): this {
    this._SecretRoom();
    return this;
  }
  minWidth(): number {
    return 8;
  }
  maxWidth(): number {
    return 9;
  }
  minHeight(): number {
    return 8;
  }
  maxHeight(): number {
    return 9;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    let chests = 0;
    let p = new Point()._Point$int$int((this.left_ + 3) | 0, (this.top_ + 3) | 0);
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    level.drop(Generator.randomUsingDefaults$(), level.pointToCell(p)).type_ = Heap$Type.LOCKED_CHEST;
    if (level.heaps.get(level.pointToCell(p)) != null) {
      chests++;
    }
    p.x = (this.right_ - 3) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    level.drop(Generator.randomUsingDefaults$(), level.pointToCell(p)).type_ = Heap$Type.LOCKED_CHEST;
    if (level.heaps.get(level.pointToCell(p)) != null) {
      chests++;
    }
    p.y = (this.bottom_ - 3) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    level.drop(Generator.randomUsingDefaults$(), level.pointToCell(p)).type_ = Heap$Type.LOCKED_CHEST;
    if (level.heaps.get(level.pointToCell(p)) != null) {
      chests++;
    }
    p.x = (this.left_ + 3) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    level.drop(Generator.randomUsingDefaults$(), level.pointToCell(p)).type_ = Heap$Type.LOCKED_CHEST;
    if (level.heaps.get(level.pointToCell(p)) != null) {
      chests++;
    }
    p = new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0);
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    if (chests > 0) {
      level.drop(new GoldenKey()._GoldenKey$int(Dungeon.depth), level.pointToCell(p));
      chests--;
    }
    p.x = (this.right_ - 1) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    if (chests > 0) {
      level.drop(new GoldenKey()._GoldenKey$int(Dungeon.depth), level.pointToCell(p));
      chests--;
    }
    p.y = (this.bottom_ - 1) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    if (chests > 0) {
      level.drop(new GoldenKey()._GoldenKey$int(Dungeon.depth), level.pointToCell(p));
      chests--;
    }
    p.x = (this.left_ + 1) | 0;
    Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
    if (chests > 0) {
      level.drop(new GoldenKey()._GoldenKey$int(Dungeon.depth), level.pointToCell(p));
      chests--;
    }
    level.addItemToSpawn(new PotionOfLevitation()._PotionOfLevitation());
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
}

$J.define(SecretChestChasmRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretChestChasmRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretChestChasmRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
