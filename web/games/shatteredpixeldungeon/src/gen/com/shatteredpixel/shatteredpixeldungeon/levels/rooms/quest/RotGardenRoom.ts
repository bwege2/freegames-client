// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/RotGardenRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from '../special/SpecialRoom.ts';

let Dungeon, RotHeart, RotLasher, IronKey, Terrain, Painter, Room$Door$Type, PathFinder, Random;

export class RotGardenRoom extends SpecialRoom {
  _RotGardenRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 10;
  }
  minHeight(): number {
    return 10;
  }
  paint(level: Level): void {
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.set$Level$Point$int(level, entrance, Terrain.LOCKED_DOOR);
    let candidates = new ArrayList();
    let passable = $J.newArray(level.length(), false);
    let entryPos = level.pointToCell(this.entrance());
    let openCells: number;
    do {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.HIGH_GRASS);
      for (let i = 0; i < 12; i++) {
        Painter.set$Level$Point$int(level, this.random$int(1), Terrain.WALL);
      }
      for (let i = 0; i < 8; i++) {
        Painter.set$Level$Point$int(level, this.random$int(2), Terrain.WALL);
      }
      for (let i = 0; i < 4; i++) {
        Painter.set$Level$Point$int(level, this.random$int(3), Terrain.WALL);
      }
      Painter.drawInside(level, this, entrance, 3, Terrain.HIGH_GRASS);
      for (let i = 0; i < passable.length; i++) {
        passable[i] = level.map_[i] !== Terrain.WALL;
      }
      PathFinder.buildDistanceMap$int$booleanArr(entryPos, passable);
      candidates.clear();
      openCells = 0;
      for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
        let p = $it0.next();
        let i = level.pointToCell(p);
        if (PathFinder.distance[i] !== 2147483647) {
          openCells++;
          if (PathFinder.distance[i] >= 7) {
            candidates.add(i);
          }
        } else {
          if (level.map_[i] === Terrain.HIGH_GRASS) {
            level.map_[i] = Terrain.WALL;
          }
        }
      }
      Random.shuffle$List(candidates);
      let closestPos = 7;
      while (candidates.size() > 5) {
        for (let i of $J.toArrayInto(candidates.toArray(), $J.newArray(0, null))) {
          if (candidates.size() > 5 && PathFinder.distance[i] === closestPos) {
            candidates.remove(i);
          }
        }
        closestPos++;
      }
    } while (candidates.isEmpty() || openCells < 35);
    let heartPos = Random.element$Collection(candidates);
    RotGardenRoom.placePlant(level, heartPos, new RotHeart()._RotHeart());
    let newPassable = Arrays.copyOf(passable, passable.length);
    let maxLashers = 6;
    for (let i = 1; i <= maxLashers; i++) {
      let pos: number;
      let tries = 50;
      do {
        pos = level.pointToCell(this.random$());
        tries--;
      } while (tries > 0 && !RotGardenRoom.validPlantPos(passable, newPassable, level, pos, heartPos, entryPos));
      if (tries <= 0) {
        break;
      }
      RotGardenRoom.placePlant(level, pos, new RotLasher()._RotLasher());
    }
    for (let i = 0; i < PathFinder.CIRCLE8.length; i = (i + 2) | 0) {
      if ((level.map_[(heartPos + PathFinder.CIRCLE8[i]) | 0]) !== Terrain.WALL) {
        Painter.set$Level$int$int(level, (heartPos + (PathFinder.CIRCLE8[(i + 1) | 0])) | 0, Terrain.HIGH_GRASS);
      }
    }
  }
  static validPlantPos(passable: boolean[], newPassable: boolean[], level: Level, pos: number, heartPos: number, entryPos: number): boolean {
    if (level.map_[pos] !== Terrain.HIGH_GRASS) {
      return false;
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      if (level.findMob((pos + i) | 0) != null) {
        return false;
      }
    }
    newPassable[pos] = false;
    if (level.distance(pos, heartPos) > 2) {
      for (let i of PathFinder.NEIGHBOURS4) {
        (newPassable[(pos + i) | 0]) = false;
      }
    } else {
      for (let i of PathFinder.NEIGHBOURS8) {
        (newPassable[(pos + i) | 0]) = false;
      }
    }
    PathFinder.buildDistanceMap$int$booleanArr(heartPos, newPassable);
    if (PathFinder.distance[entryPos] === 2147483647) {
      $J.system_arraycopy(passable, 0, newPassable, 0, passable.length);
      return false;
    } else {
      $J.system_arraycopy(newPassable, 0, passable, 0, passable.length);
      return true;
    }
  }
  static placePlant(level: Level, pos: number, plant: Mob): void {
    plant.pos = pos;
    level.mobs.add(plant);
    Painter.set$Level$int$int(level, pos, Terrain.GRASS);
  }
}

$J.define(RotGardenRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RotGardenRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_RotGardenRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  RotHeart = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotHeart');
  RotLasher = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotLasher');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
