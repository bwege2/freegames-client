// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/MiningLevelPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap } from '../../../../../../jre/index.ts';
import { CavesPainter } from './CavesPainter.ts';

let DarkGold, Terrain, Room$Door$Type, MineSecretRoom, Graph, PathFinder, Random;

export class MiningLevelPainter extends CavesPainter {
  goldToAdd: number = 0;
  _MiningLevelPainter(): this {
    this._CavesPainter();
    this.goldToAdd = 0;
    return this;
  }
  padding(level: Level): number {
    return 3;
  }
  setGold(amount: number): RegularPainter {
    this.goldToAdd = amount;
    return this;
  }
  generateGold(level: Level, rooms: ArrayList<Room>): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WALL_DECO) {
        this.goldToAdd--;
      }
    }
    for (const $it0 = level.heaps.valueList().iterator(); $it0.hasNext(); ) {
      let h = $it0.next();
      for (const $it1 = h.items_.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        if (i instanceof DarkGold) {
          this.goldToAdd = (this.goldToAdd - i.quantity$()) | 0;
        }
      }
    }
    let map = level.map_;
    do {
      Random.shuffle$List(rooms);
      for (const $it2 = rooms.iterator(); $it2.hasNext(); ) {
        let r = $it2.next();
        if (r instanceof MineSecretRoom) {
          continue;
        }
        let goldPosCandidates = new ArrayList();
        for (const $it3 = r.getPoints().iterator(); $it3.hasNext(); ) {
          let p = $it3.next();
          let i = level.pointToCell(p);
          if (level.insideMap(i) && this.goldToAdd > 0 && map[i] === Terrain.WALL) {
            for (let j of PathFinder.NEIGHBOURS4) {
              if (level.insideMap((i + j) | 0) && (map[(i + j) | 0]) !== Terrain.WALL) {
                let o = level.cellToPoint((i + j) | 0);
                if (r.inside$Point(o)) {
                  goldPosCandidates.add(i);
                  break;
                }
              }
            }
          }
        }
        if (this.goldToAdd > 0 && !goldPosCandidates.isEmpty()) {
          let pos = Random.element$Collection(goldPosCandidates);
          map[pos] = Terrain.WALL_DECO;
          this.goldToAdd--;
          if (this.goldToAdd > 0) {
            let i = PathFinder.NEIGHBOURS4[Random.Int$int(4)];
            if (level.insideMap((pos + i) | 0) && (map[(pos + i) | 0]) === Terrain.WALL) {
              (map[(pos + i) | 0]) = Terrain.WALL_DECO;
              this.goldToAdd--;
            }
            if (Random.Int$int(2) === 0) {
              i = PathFinder.NEIGHBOURS4[Random.Int$int(4)];
              if (level.insideMap((pos + i) | 0) && (map[(pos + i) | 0]) === Terrain.WALL) {
                (map[(pos + i) | 0]) = Terrain.WALL_DECO;
                this.goldToAdd--;
              }
            }
          }
        }
      }
    } while (this.goldToAdd > 0);
  }
  paintDoors(l: Level, rooms: ArrayList<Room>): void {
    let roomMerges = new HashMap();
    let hiddenDoorChance = Math.fround(0.9);
    for (const $it4 = rooms.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      for (const $it5 = r.connected_.keySet().iterator(); $it5.hasNext(); ) {
        let n = $it5.next();
        let d = r.connected_.get(n);
        let door = (d.x + Math.imul(d.y, l.width())) | 0;
        if (d.type_ === Room$Door$Type.WALL || d.type_ === Room$Door$Type.HIDDEN) {
          l.map_[door] = Terrain.WALL;
        } else {
          if (Random.Float$() < hiddenDoorChance) {
            d.type_ = Room$Door$Type.HIDDEN;
            Graph.buildDistanceMap(rooms, r);
            if (n.distance_ === 2147483647) {
              l.map_[door] = Terrain.EMPTY;
              d.type_ = Room$Door$Type.EMPTY;
            } else {
              l.map_[door] = Terrain.WALL;
            }
          } else {
            l.map_[door] = Terrain.EMPTY;
            d.type_ = Room$Door$Type.EMPTY;
          }
        }
        if (l.map_[door] === Terrain.EMPTY) {
          if (roomMerges.get(r) === n || roomMerges.get(n) === r) {
            continue;
          } else if (this.mergeRooms(l, r, n, r.connected_.get(n), Terrain.EMPTY)) {
            roomMerges.put(r, n);
            roomMerges.put(n, r);
          }
        }
      }
    }
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    super.decorate(level, rooms);
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.CHASM) {
        level.map_[i] = Terrain.EMPTY;
      }
    }
  }
}

$J.define(MiningLevelPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.MiningLevelPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.CavesPainter', ctors: { '': '_MiningLevelPainter' } });
$J.module(() => {
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  MineSecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineSecretRoom');
  Graph = $J.load('com.watabou.utils.Graph');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
