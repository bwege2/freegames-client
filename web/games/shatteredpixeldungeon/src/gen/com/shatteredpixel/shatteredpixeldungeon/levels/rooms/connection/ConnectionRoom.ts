// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/ConnectionRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { Room } from '../Room.ts';

let Dungeon, BridgeRoom, PerimeterRoom, RingBridgeRoom, RingTunnelRoom, TunnelRoom, WalkwayRoom, Random, Reflection;

export class ConnectionRoom extends Room {
  static rooms: ArrayList<JClass<ConnectionRoom>> = null;
  static chances: number[][] = null;
  _ConnectionRoom(): this {
    this._Room$();
    return this;
  }
  minWidth(): number {
    return 3;
  }
  maxWidth(): number {
    return 10;
  }
  minHeight(): number {
    return 3;
  }
  maxHeight(): number {
    return 10;
  }
  minConnections(direction: number): number {
    if (direction === Room.ALL) {
      return 2;
    } else {
      return 0;
    }
  }
  static createRoom(): ConnectionRoom {
    return Reflection.newInstance(ConnectionRoom.rooms.get(Random.chances$floatArr(ConnectionRoom.chances[Dungeon.depth])));
  }
  static $clinit() {
    ConnectionRoom.rooms = new ArrayList();
    ConnectionRoom.rooms.add($J.cls(TunnelRoom));
    ConnectionRoom.rooms.add($J.cls(BridgeRoom));
    ConnectionRoom.rooms.add($J.cls(PerimeterRoom));
    ConnectionRoom.rooms.add($J.cls(WalkwayRoom));
    ConnectionRoom.rooms.add($J.cls(RingTunnelRoom));
    ConnectionRoom.rooms.add($J.cls(RingBridgeRoom));
    ConnectionRoom.chances = $J.newArray(27, null);
    ConnectionRoom.chances[1] = [20, 1, 0, 2, 2, 1];
    ConnectionRoom.chances[4] = ConnectionRoom.chances[3] = ConnectionRoom.chances[2] = ConnectionRoom.chances[1];
    ConnectionRoom.chances[5] = [20, 0, 0, 0, 0, 0];
    ConnectionRoom.chances[6] = [0, 0, 22, 3, 0, 0];
    ConnectionRoom.chances[10] = ConnectionRoom.chances[9] = ConnectionRoom.chances[8] = ConnectionRoom.chances[7] = ConnectionRoom.chances[6];
    ConnectionRoom.chances[11] = [12, 0, 0, 5, 5, 3];
    ConnectionRoom.chances[15] = ConnectionRoom.chances[14] = ConnectionRoom.chances[13] = ConnectionRoom.chances[12] = ConnectionRoom.chances[11];
    ConnectionRoom.chances[16] = [0, 0, 18, 3, 3, 1];
    ConnectionRoom.chances[20] = ConnectionRoom.chances[19] = ConnectionRoom.chances[18] = ConnectionRoom.chances[17] = ConnectionRoom.chances[16];
    ConnectionRoom.chances[21] = ConnectionRoom.chances[5];
    ConnectionRoom.chances[22] = [15, 4, 0, 2, 3, 2];
    ConnectionRoom.chances[26] = ConnectionRoom.chances[25] = ConnectionRoom.chances[24] = ConnectionRoom.chances[23] = ConnectionRoom.chances[22];
  }
}

$J.define(ConnectionRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room', ctors: { '': '_ConnectionRoom' }, clinit: true, lazy: ['rooms', 'chances'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  BridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.BridgeRoom');
  PerimeterRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.PerimeterRoom');
  RingBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.RingBridgeRoom');
  RingTunnelRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.RingTunnelRoom');
  TunnelRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.TunnelRoom');
  WalkwayRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.WalkwayRoom');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
