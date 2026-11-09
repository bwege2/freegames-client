// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StatuesRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { StandardRoom } from './StandardRoom.ts';

let Terrain, Painter, Room$Door$Type, Carpet, Random;

export class StatuesRoom extends StandardRoom {
  _StatuesRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(7, super.minWidth());
  }
  minHeight(): number {
    return Math.max(7, super.minHeight());
  }
  sizeCatProbs(): number[] {
    return [9, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let rows = $J.idiv(((this.width() + 1) | 0), 6);
    let cols = $J.idiv(((this.height() + 1) | 0), 6);
    let w = $J.idiv(((this.width() - 4 - (rows - 1)) | 0), rows);
    let h = $J.idiv(((this.height() - 4 - (cols - 1)) | 0), cols);
    let Wspacing = rows % 2 === this.width() % 2 ? 2 : 1;
    let Hspacing = cols % 2 === this.height() % 2 ? 2 : 1;
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        let left = (this.left_ + 2 + (Math.imul(x, ((w + Wspacing) | 0)))) | 0;
        let top = (this.top_ + 2 + (Math.imul(y, ((h + Hspacing) | 0)))) | 0;
        Painter.fill$Level$int$int$int$int$int(level, left, top, w, h, Terrain.CUSTOM_DECO_EMPTY);
        Painter.set$Level$int$int$int(level, left, top, Terrain.STATUE);
        Painter.set$Level$int$int$int(level, (left + w - 1) | 0, top, Terrain.STATUE);
        Painter.set$Level$int$int$int(level, left, (top + h - 1) | 0, Terrain.STATUE);
        Painter.set$Level$int$int$int(level, (left + w - 1) | 0, (top + h - 1) | 0, Terrain.STATUE);
        let carpet = new Carpet()._Carpet();
        carpet.setRect$int$int$int$int(left, top, w, h);
        carpet.overrideTile$int$int$int(0, 0, Carpet.CITY_STATUE_TL);
        carpet.overrideTile$int$int$int((carpet.tileW - 1) | 0, 0, Carpet.CITY_STATUE_TR);
        carpet.overrideTile$int$int$int(0, (carpet.tileH - 1) | 0, Carpet.CITY_STATUE_BL);
        carpet.overrideTile$int$int$int((carpet.tileW - 1) | 0, (carpet.tileH - 1) | 0, Carpet.CITY_STATUE_BR);
        level.customTiles.add(carpet);
        if (w >= 5 && h >= 5 || ((this.isEntrance() || this.isExit()) && rows === 1 && cols === 1)) {
          let cx = (left + $J.idiv(w, 2)) | 0;
          if (w % 2 === 0 && Random.Int$int(2) === 0) {
            cx--;
          }
          let cy = (top + $J.idiv(h, 2)) | 0;
          if (h % 2 === 0 && Random.Int$int(2) === 0) {
            cy--;
          }
          if (this.isEntrance() && rows === 1 && cols === 1) {
            Painter.set$Level$int$int$int(level, cx, cy, Terrain.ENTRANCE);
            carpet.overrideTile$Level$int$int$int(level, cx, cy, Carpet.CITY_ENTRANCE);
          } else if (this.isExit() && rows === 1 && cols === 1) {
            Painter.set$Level$int$int$int(level, cx, cy, Terrain.EXIT);
            carpet.overrideTile$Level$int$int$int(level, cx, cy, Carpet.SKIP);
          } else {
            Painter.set$Level$int$int$int(level, cx, cy, Terrain.REGION_DECO);
            carpet.overrideTile$Level$int$int$int(level, cx, cy, Carpet.CITY_PEDESTAL);
          }
        }
      }
    }
  }
}

$J.define(StatuesRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StatuesRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_StatuesRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Random = $J.load('com.watabou.utils.Random');
});
