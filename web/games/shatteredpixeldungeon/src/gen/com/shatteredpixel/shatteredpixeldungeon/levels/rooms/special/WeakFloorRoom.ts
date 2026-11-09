// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/WeakFloorRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Blob } from '../../../actors/blobs/Blob.ts';

let Assets$Environment, Dungeon, Notes$Landmark, Terrain, Painter, Room$Door$Type, Messages, Point, Random;

export class WeakFloorRoom extends SpecialRoom {
  _WeakFloorRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    let door = this.entrance();
    door.set$Type(Room$Door$Type.REGULAR);
    let well = null;
    if (door.x === this.left_) {
      for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
        Painter.drawInside(level, this, new Point()._Point$int$int(this.left_, i), Random.IntRange(1, (this.width() - 4) | 0), Terrain.EMPTY_SP);
      }
      well = new Point()._Point$int$int((this.right_ - 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 2) | 0 : (this.bottom_ - 1) | 0);
    } else if (door.x === this.right_) {
      for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
        Painter.drawInside(level, this, new Point()._Point$int$int(this.right_, i), Random.IntRange(1, (this.width() - 4) | 0), Terrain.EMPTY_SP);
      }
      well = new Point()._Point$int$int((this.left_ + 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 2) | 0 : (this.bottom_ - 1) | 0);
    } else if (door.y === this.top_) {
      for (let i = (this.left_ + 1) | 0; i < this.right_; i++) {
        Painter.drawInside(level, this, new Point()._Point$int$int(i, this.top_), Random.IntRange(1, (this.height() - 4) | 0), Terrain.EMPTY_SP);
      }
      well = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    } else if (door.y === this.bottom_) {
      for (let i = (this.left_ + 1) | 0; i < this.right_; i++) {
        Painter.drawInside(level, this, new Point()._Point$int$int(i, this.bottom_), Random.IntRange(1, (this.height() - 4) | 0), Terrain.EMPTY_SP);
      }
      well = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.top_ + 2) | 0);
    }
    Painter.set$Level$Point$int(level, well, Terrain.CHASM);
    let vis = new WeakFloorRoom$HiddenWell()._WeakFloorRoom$HiddenWell();
    vis.pos$int$int(well.x, well.y);
    level.customTiles.add(vis);
    Blob.seed$int$int$Class$Level((well.x + Math.imul(level.width(), well.y)) | 0, 1, $J.cls(WeakFloorRoom$WellID), level);
  }
}

export class WeakFloorRoom$HiddenWell extends CustomTilemap {
  _WeakFloorRoom$HiddenWell(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.WEAK_FLOOR;
    this.tileW = this.tileH = 1;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map([$J.idiv(Dungeon.depth, 5)], 1);
    return v;
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class WeakFloorRoom$WellID extends Blob {
  _WeakFloorRoom$WellID(): this {
    this._Blob();
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.DISTANT_WELL;
  }
  evolve(): void {
    let cell: number;
    for (let i = (this.area.top_ - 1) | 0; i <= this.area.bottom_; i++) {
      for (let j = (this.area.left_ - 1) | 0; j <= this.area.right_; j++) {
        cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
        if (Dungeon.level.insideMap(cell)) {
          this.off[cell] = this.cur[cell];
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        }
      }
    }
  }
}

$J.define(WeakFloorRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_WeakFloorRoom' } });
$J.define(WeakFloorRoom$HiddenWell, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom$HiddenWell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_WeakFloorRoom$HiddenWell' } });
$J.define(WeakFloorRoom$WellID, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom$WellID', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_WeakFloorRoom$WellID' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
