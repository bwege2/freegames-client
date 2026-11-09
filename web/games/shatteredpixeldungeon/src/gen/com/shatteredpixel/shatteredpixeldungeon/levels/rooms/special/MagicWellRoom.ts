// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/MagicWellRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blob, WaterOfAwareness, WaterOfHealth, IronKey, Terrain, Painter, Room$Door$Type, Random;

export class MagicWellRoom extends SpecialRoom {
  static WATERS: JClass<any>[] = null;
  overrideWater: JClass<WellWater> = null;
  _MagicWellRoom(): this {
    this._SpecialRoom();
    this.overrideWater = null;
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    Painter.set$Level$int$int$int(level, c.x, c.y, Terrain.WELL);
    let waterClass = this.overrideWater != null ? this.overrideWater : Random.element$ObjectArr(MagicWellRoom.WATERS);
    Blob.seed$int$int$Class$Level((c.x + Math.imul(level.width(), c.y)) | 0, 1, waterClass, level);
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  static $clinit() {
    MagicWellRoom.WATERS = [$J.cls(WaterOfAwareness), $J.cls(WaterOfHealth)];
  }
}

$J.define(MagicWellRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicWellRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_MagicWellRoom' }, clinit: true, lazy: ['WATERS'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  WaterOfAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfAwareness');
  WaterOfHealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfHealth');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
