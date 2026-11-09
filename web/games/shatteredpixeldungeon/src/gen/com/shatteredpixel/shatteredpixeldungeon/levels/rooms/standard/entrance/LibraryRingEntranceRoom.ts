// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/LibraryRingEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { LibraryRingRoom } from '../LibraryRingRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, Carpet, Random;

export class LibraryRingEntranceRoom extends LibraryRingRoom {
  _LibraryRingEntranceRoom(): this {
    this._LibraryRingRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 13);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 13);
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    Painter.fill$Level$Rect$int$int(level, this, 5, Terrain.EMPTY_SP);
    let p = this.center();
    Painter.set$Level$Point$int(level, p, Terrain.ENTRANCE_SP);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, level.pointToCell(p), LevelTransition$Type.REGULAR_ENTRANCE));
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((this.left_ + 5) | 0, (this.top_ + 5) | 0, (this.width() - 10) | 0, (this.height() - 10) | 0);
    carpet.overrideTile$Level$int$int$int(level, p.x, p.y, Carpet.CITY_ENTRANCE);
    level.customTiles.add(carpet);
    let dirX = 0;
    let dirY = 0;
    if (Random.Int$int(2) === 0) {
      dirX = Random.Int$int(2) === 0 ? +1 : -1;
    } else {
      dirY = Random.Int$int(2) === 0 ? +1 : -1;
    }
    p.x = (p.x + dirX) | 0;
    p.y = (p.y + dirY) | 0;
    while (level.map_[level.pointToCell(p)] !== Terrain.EMPTY) {
      Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
      p.x = (p.x + dirX) | 0;
      p.y = (p.y + dirY) | 0;
    }
  }
}

$J.define(LibraryRingEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.LibraryRingEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.LibraryRingRoom', ctors: { '': '_LibraryRingEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Random = $J.load('com.watabou.utils.Random');
});
