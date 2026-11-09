// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/BridgeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TunnelRoom } from './TunnelRoom.ts';

let Terrain, Painter, RingBridgeRoom, WalkwayRoom;

export class BridgeRoom extends TunnelRoom {
  _BridgeRoom(): this {
    this._TunnelRoom();
    return this;
  }
  paint(level: Level): void {
    if (Math.min(this.width(), this.height()) > 3) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    }
    super.paint(level);
    for (const $it0 = this.neigbours.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      if (r instanceof BridgeRoom || r instanceof RingBridgeRoom || r instanceof WalkwayRoom) {
        let i = this.intersect(r);
        if (i.width() !== 0) {
          i.left_++;
          i.right_--;
        } else {
          i.top_++;
          i.bottom_--;
        }
        Painter.fill$Level$int$int$int$int$int(level, i.left_, i.top_, (i.width() + 1) | 0, (i.height() + 1) | 0, Terrain.CHASM);
      }
    }
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return mergeTerrain === Terrain.CHASM;
  }
}

$J.define(BridgeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.BridgeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.TunnelRoom', ctors: { '': '_BridgeRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  RingBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.RingBridgeRoom');
  WalkwayRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.WalkwayRoom');
});
