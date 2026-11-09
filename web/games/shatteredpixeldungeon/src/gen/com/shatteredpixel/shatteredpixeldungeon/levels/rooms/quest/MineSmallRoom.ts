// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineSmallRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CaveRoom } from '../standard/CaveRoom.ts';

let Blacksmith$Quest, Terrain, Painter, Room$Door$Type, SecretRoom, GameMath, Point, Random;

export class MineSmallRoom extends CaveRoom {
  _MineSmallRoom(): this {
    this._CaveRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(6, super.minWidth());
  }
  minHeight(): number {
    return Math.max(6, super.minHeight());
  }
  sizeCatProbs(): number[] {
    return [1, 0, 0];
  }
  fill(): number {
    return Math.fround(0.4);
  }
  paint(level: Level): void {
    super.paint(level);
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
      for (let i = 0; i < $J.idiv(Math.imul(this.width(), this.height()), 3); i++) {
        let r = this.random$int(1);
        if (level.map_[level.pointToCell(r)] !== Terrain.WALL) {
          Painter.set$Level$Point$int(level, r, Terrain.MINE_CRYSTAL);
        }
      }
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      for (const $it0 = this.connected_.keySet().iterator(); $it0.hasNext(); ) {
        let n = $it0.next();
        if (!(n instanceof SecretRoom) && this.connected_.get(n).type_ === Room$Door$Type.REGULAR) {
          if (Random.Int$int(10) === 0) {
            this.connected_.get(n).set$Type(Room$Door$Type.EMPTY);
          } else {
            this.connected_.get(n).set$Type(Room$Door$Type.WALL);
          }
          this.connected_.get(n).lockTypeChanges(true);
        }
      }
      let doors = new ArrayList();
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let d = $it1.next();
        if (d.type_ === Room$Door$Type.WALL) {
          doors.add(d);
        }
      }
      for (const $it2 = this.getPoints().iterator(); $it2.hasNext(); ) {
        let p = $it2.next();
        let cell = level.pointToCell(p);
        if (level.map_[cell] === Terrain.EMPTY) {
          let dist = 1000;
          for (const $it3 = doors.iterator(); $it3.hasNext(); ) {
            let d = $it3.next();
            dist = Math.min(dist, Point.distance(p, d));
          }
          dist = GameMath.gate(1, dist, 5);
          let val = Random.Float$float(Math.fround($J.pow(dist, 2)));
          if (val <= 0.75 || dist <= Math.fround(1)) {
            Painter.set$Level$int$int(level, cell, Terrain.MINE_BOULDER);
          } else if (val <= 5 && dist <= Math.fround(2)) {
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_DECO);
          }
        }
      }
    }
  }
}

$J.define(MineSmallRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineSmallRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom', ctors: { '': '_MineSmallRoom' } });
$J.module(() => {
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
