// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/WellWater.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Blob } from './Blob.ts';

let Dungeon, WaterOfAwareness, WaterOfHealth, Notes, Level, Terrain, GameScene, PathFinder, Random;

export class WellWater extends Blob {
  _WellWater(): this {
    this._Blob();
    this.alwaysVisible = true;
    return this;
  }
  evolve(): void {
    let cell: number;
    let seen = false;
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
  affect(pos: number): boolean {
    let heap: Heap;
    if (pos === Dungeon.hero.pos && this.affectHero(Dungeon.hero)) {
      this.clear(pos);
      return true;
    } else if ((heap = Dungeon.level.heaps.get(pos)) != null) {
      let oldItem = heap.peek();
      let newItem = this.affectItem(oldItem, pos);
      if (newItem != null) {
        if (newItem === oldItem) {
        } else if (oldItem.quantity$() > 1) {
          oldItem.quantity$int((oldItem.quantity$() - 1) | 0);
          heap.drop(newItem);
        } else {
          heap.replace(oldItem, newItem);
        }
        heap.sprite_.link$();
        this.clear(pos);
        return true;
      } else {
        let newPlace: number;
        do {
          newPlace = (pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
        } while (!Dungeon.level.passable[newPlace] && !Dungeon.level.avoid[newPlace]);
        Dungeon.level.drop(heap.pickUp(), newPlace).sprite_.drop$int(pos);
        return false;
      }
    } else {
      return false;
    }
  }
  static affectCell(cell: number): void {
    let waters = [$J.cls(WaterOfHealth), $J.cls(WaterOfAwareness)];
    for (let waterClass of waters) {
      let water = Dungeon.level.blobs.get(waterClass);
      if (water != null && water.volume_ > 0 && water.cur[cell] > 0 && water.affect(cell)) {
        Level.set$int$int(cell, Terrain.EMPTY_WELL);
        GameScene.updateMap$int(cell);
        if (water.landmark() != null) {
          if (water.volume_ <= 0) {
            Notes.remove$Landmark(water.landmark());
          } else {
            let removing = true;
            for (let i = 0; i < water.cur.length; i++) {
              if (water.cur[i] > 0 && Dungeon.level.visited[i]) {
                removing = false;
                break;
              }
            }
            if (removing) {
              Notes.remove$Landmark(water.landmark());
            }
          }
        }
        return;
      }
    }
  }
}

$J.define(WellWater, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WellWater', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_WellWater' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  WaterOfAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfAwareness');
  WaterOfHealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.WaterOfHealth');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
