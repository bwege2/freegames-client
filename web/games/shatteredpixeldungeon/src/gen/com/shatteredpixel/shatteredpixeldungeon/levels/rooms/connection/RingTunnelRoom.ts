// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/RingTunnelRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, GameMath, Rect;

export class RingTunnelRoom extends TunnelRoom {
  connSpace: Rect = null;
  _RingTunnelRoom(): this {
    this._TunnelRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  paint(level: Level): void {
    super.paint(level);
    let floor = level.tunnelTile();
    let ring = this.getConnectionSpace();
    Painter.fill$Level$int$int$int$int$int(level, ring.left_, ring.top_, 3, 3, floor);
    Painter.fill$Level$int$int$int$int$int(level, (ring.left_ + 1) | 0, (ring.top_ + 1) | 0, 1, 1, Terrain.WALL);
  }
  getConnectionSpace(): Rect {
    if (this.connSpace == null) {
      let c = this.getDoorCenter();
      c.x = $J.d2i(GameMath.gate(Math.fround((this.left_ + 2) | 0), Math.fround(c.x), Math.fround((this.right_ - 2) | 0)));
      c.y = $J.d2i(GameMath.gate(Math.fround((this.top_ + 2) | 0), Math.fround(c.y), Math.fround((this.bottom_ - 2) | 0)));
      this.connSpace = new Rect()._Rect$int$int$int$int((c.x - 1) | 0, (c.y - 1) | 0, (c.x + 1) | 0, (c.y + 1) | 0);
    }
    return this.connSpace;
  }
}

$J.define(RingTunnelRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.RingTunnelRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.TunnelRoom', ctors: { '': '_RingTunnelRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Rect = $J.load('com.watabou.utils.Rect');
});
