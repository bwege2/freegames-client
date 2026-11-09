// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/StatuesEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { StatuesRoom } from '../StatuesRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, Carpet, Rect;

export class StatuesEntranceRoom extends StatuesRoom {
  _StatuesEntranceRoom(): this {
    this._StatuesRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [3, 1, 0];
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let entrance = -1;
    if (this.width() >= 11 || this.height() >= 11) {
      let c = this.center();
      entrance = level.pointToCell(c);
      let carpet = new Carpet()._Carpet();
      let carpetRect = new Rect()._Rect$int$int$int$int((c.x - 1) | 0, (c.y - 1) | 0, (c.x + 1) | 0, (c.y + 1) | 0);
      if (this.width() % 2 === 0) {
        if (Math.fround(c.x) < Math.fround(((this.left_ + this.right_) | 0) / 2)) {
          carpetRect.right_++;
        } else {
          carpetRect.left_--;
        }
      }
      if (this.height() % 2 === 0) {
        if (Math.fround(c.y) < Math.fround(((this.top_ + this.bottom_) | 0) / 2)) {
          carpetRect.bottom_++;
        } else {
          carpetRect.top_--;
        }
      }
      for (const $it0 = carpetRect.getPoints().iterator(); $it0.hasNext(); ) {
        let p = $it0.next();
        if (level.map_[level.pointToCell(p)] !== Terrain.STATUE) {
          Painter.set$Level$Point$int(level, p, Terrain.EMPTY_DECO);
        }
      }
      carpet.setRect$int$int$int$int(carpetRect.left_, carpetRect.top_, (carpetRect.width() + 1) | 0, (carpetRect.height() + 1) | 0);
      carpet.overrideTile$int$Level$int(entrance, level, Carpet.CITY_ENTRANCE);
      level.customTiles.add(0, carpet);
    } else {
      for (const $it1 = this.getPoints().iterator(); $it1.hasNext(); ) {
        let p = $it1.next();
        if (level.map_[level.pointToCell(p)] === Terrain.ENTRANCE) {
          entrance = level.pointToCell(p);
          break;
        }
      }
    }
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
  }
}

$J.define(StatuesEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.StatuesEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StatuesRoom', ctors: { '': '_StatuesEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Rect = $J.load('com.watabou.utils.Rect');
});
