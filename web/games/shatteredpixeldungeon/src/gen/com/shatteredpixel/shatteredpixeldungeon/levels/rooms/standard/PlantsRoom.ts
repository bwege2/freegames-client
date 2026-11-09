// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PlantsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Generator$Category, Terrain, Painter, Room$Door$Type, GrassyGraveRoom, Firebloom$Seed, Point, Random;

export class PlantsRoom extends StandardRoom {
  _PlantsRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 5);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 5);
  }
  sizeCatProbs(): number[] {
    return [3, 1, 0];
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    if (mergeTerrain === Terrain.EMPTY && (other instanceof PlantsRoom || other instanceof GrassyGraveRoom)) {
      super.merge(l, other, merge, Terrain.GRASS);
    } else {
      super.merge(l, other, merge, mergeTerrain);
    }
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.GRASS);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.HIGH_GRASS);
    if (Math.min(this.width(), this.height()) >= 7) {
      Painter.fill$Level$Rect$int$int(level, this, 3, Terrain.GRASS);
    }
    let center = this.center();
    if (Math.max(this.width(), this.height()) >= 9) {
      if (Math.min(this.width(), this.height()) >= 11) {
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 2) | 0, center.y), new Point()._Point$int$int((this.right_ - 2) | 0, center.y), Terrain.HIGH_GRASS);
        Painter.drawLine(level, new Point()._Point$int$int(center.x, (this.top_ + 2) | 0), new Point()._Point$int$int(center.x, (this.bottom_ - 2) | 0), Terrain.HIGH_GRASS);
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x - 1) | 0, (center.y - 1) | 0)));
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x + 1) | 0, (center.y - 1) | 0)));
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x - 1) | 0, (center.y + 1) | 0)));
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x + 1) | 0, (center.y + 1) | 0)));
      } else if (this.width() > this.height() || (this.width() === this.height() && Random.Int$int(2) === 0)) {
        Painter.drawLine(level, new Point()._Point$int$int(center.x, (this.top_ + 2) | 0), new Point()._Point$int$int(center.x, (this.bottom_ - 2) | 0), Terrain.HIGH_GRASS);
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x - 1) | 0, center.y)));
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int((center.x + 1) | 0, center.y)));
      } else {
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 2) | 0, center.y), new Point()._Point$int$int((this.right_ - 2) | 0, center.y), Terrain.HIGH_GRASS);
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int(center.x, (center.y - 1) | 0)));
        level.plant(PlantsRoom.randomSeed(), level.pointToCell(new Point()._Point$int$int(center.x, (center.y + 1) | 0)));
      }
    } else {
      level.plant(PlantsRoom.randomSeed(), level.pointToCell(center));
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && l.plants.get(l.pointToCell(p)) == null;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.plants.get(l.pointToCell(p)) == null;
  }
  static randomSeed(): Plant$Seed {
    let result: Plant$Seed;
    do {
      result = Generator.randomUsingDefaults$Category(Generator$Category.SEED);
    } while (result instanceof Firebloom$Seed);
    return result;
  }
}

$J.define(PlantsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PlantsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_PlantsRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GrassyGraveRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.GrassyGraveRoom');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
