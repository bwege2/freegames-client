// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/DemonSpawnerRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, Statistics, DemonSpawner, Terrain, Painter, Room$Door$Type;

export class DemonSpawnerRoom extends SpecialRoom {
  _DemonSpawnerRoom(): this {
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
    door.set$Type(Room$Door$Type.UNLOCKED);
    let spawner = new DemonSpawner()._DemonSpawner();
    spawner.pos = (cx + Math.imul(cy, level.width())) | 0;
    Statistics.spawnersAlive++;
    spawner.spawnRecorded = true;
    level.mobs.add(spawner);
    let vis = new DemonSpawnerRoom$CustomFloor()._DemonSpawnerRoom$CustomFloor();
    vis.setRect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, (this.height() - 2) | 0);
    level.customTiles.add(vis);
  }
  connect(room: Room): boolean {
    if (room.isExit()) {
      return false;
    } else {
      return super.connect(room);
    }
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
}

export class DemonSpawnerRoom$CustomFloor extends CustomTilemap {
  _DemonSpawnerRoom$CustomFloor(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let cell = (this.tileX + Math.imul(this.tileY, Dungeon.level.width())) | 0;
    let map = Dungeon.level.map_;
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      if (i % this.tileW === 0) {
        cell = (this.tileX + Math.imul(((this.tileY + $J.idiv(i, this.tileW)) | 0), Dungeon.level.width())) | 0;
      }
      if (Dungeon.level.findMob(cell) instanceof DemonSpawner) {
        (data[(i - 1) | 0]) = (5 + Math.imul(4, 8)) | 0;
        data[i] = (6 + Math.imul(4, 8)) | 0;
        (data[(i + 1) | 0]) = (7 + Math.imul(4, 8)) | 0;
        i++;
        cell++;
      } else if (map[cell] === Terrain.EMPTY_DECO) {
        if (Statistics.amuletObtained) {
          data[i] = 31;
        } else {
          data[i] = 27;
        }
      } else {
        data[i] = 19;
      }
      cell++;
    }
    v.map(data, this.tileW);
    return v;
  }
}

$J.define(DemonSpawnerRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.DemonSpawnerRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_DemonSpawnerRoom' } });
$J.define(DemonSpawnerRoom$CustomFloor, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.DemonSpawnerRoom$CustomFloor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_DemonSpawnerRoom$CustomFloor' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  DemonSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DemonSpawner');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
