// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretWellRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Blob, WaterOfAwareness, WaterOfHealth, Terrain, Painter, Room$Door$Type, Point, Random;

export class SecretWellRoom extends SecretRoom {
  static WATERS: JClass<any>[] = null;
  _SecretWellRoom(): this {
    this._SecretRoom();
    return this;
  }
  canConnect$Point(p: Point): boolean {
    return super.canConnect$Point(p) && ((p.x > ((this.left_ + 1) | 0) && p.x < ((this.right_ - 1) | 0)) || (p.y > ((this.top_ + 1) | 0) && p.y < ((this.bottom_ - 1) | 0)));
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let door = this.entrance();
    let well: Point;
    if (door.x === this.left_) {
      well = new Point()._Point$int$int((this.right_ - 2) | 0, door.y);
    } else if (door.x === this.right_) {
      well = new Point()._Point$int$int((this.left_ + 2) | 0, door.y);
    } else if (door.y === this.top_) {
      well = new Point()._Point$int$int(door.x, (this.bottom_ - 2) | 0);
    } else {
      well = new Point()._Point$int$int(door.x, (this.top_ + 2) | 0);
    }
    Painter.fill$Level$int$int$int$int$int(level, (well.x - 1) | 0, (well.y - 1) | 0, 3, 3, Terrain.CHASM);
    Painter.drawLine(level, door, well, Terrain.EMPTY);
    Painter.set$Level$Point$int(level, well, Terrain.WELL);
    let waterClass = Random.element$ObjectArr(SecretWellRoom.WATERS);
    Blob.seed$int$int$Class$Level((well.x + Math.imul(level.width(), well.y)) | 0, 1, waterClass, level);
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
  static $clinit() {
    SecretWellRoom.WATERS = [$J.cls(WaterOfAwareness), $J.cls(WaterOfHealth)];
  }
}

$J.define(SecretWellRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretWellRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretWellRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' }, clinit: true, lazy: ['WATERS'] });
$J.module(() => {
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  WaterOfAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfAwareness');
  WaterOfHealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfHealth');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
