// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/GardenRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Foliage, IronKey, Terrain, Painter, Room$Door$Type, BlandfruitBush$Seed, Sungrass$Seed, Random;

export class GardenRoom extends SpecialRoom {
  _GardenRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.HIGH_GRASS);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.GRASS);
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
    let bushes = Random.Int$int(3);
    if (bushes === 0) {
      level.plant(new Sungrass$Seed()._Sungrass$Seed(), this.plantPos(level));
    } else if (bushes === 1) {
      level.plant(new BlandfruitBush$Seed()._BlandfruitBush$Seed(), this.plantPos(level));
    } else if (Random.Int$int(5) === 0) {
      level.plant(new Sungrass$Seed()._Sungrass$Seed(), this.plantPos(level));
      level.plant(new BlandfruitBush$Seed()._BlandfruitBush$Seed(), this.plantPos(level));
    }
    let light = level.blobs.get($J.cls(Foliage));
    if (light == null) {
      light = new Foliage()._Foliage();
    }
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        light.seed(level, (j + Math.imul(level.width(), i)) | 0, 1);
      }
    }
    level.blobs.put($J.cls(Foliage), light);
  }
  plantPos(level: Level): number {
    let pos: number;
    do {
      pos = level.pointToCell(this.random$());
    } while (level.plants.get(pos) != null);
    return pos;
  }
}

$J.define(GardenRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.GardenRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_GardenRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Foliage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Foliage');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  BlandfruitBush$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.BlandfruitBush$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Random = $J.load('com.watabou.utils.Random');
});
