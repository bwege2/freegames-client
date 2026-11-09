// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/GridBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, RuntimeException } from '../../../../../../jre/index.ts';
import { Builder } from './Builder.ts';

let Room, Point, PointF, Random, Rect, SparseArray;

export class GridBuilder extends Builder {
  static ROOM_SIZE: number = 0;
  extraConnectionChance: number = 0;
  _GridBuilder(): this {
    this._Builder();
    this.extraConnectionChance = Math.fround(0.55);
    return this;
  }
  build(rooms: ArrayList<Room>): ArrayList<Room> {
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      r.setEmpty();
    }
    let entrance = null;
    let exit = null;
    for (const $it1 = rooms.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if (r.isEntrance()) {
        entrance = r;
      } else if (r.isExit()) {
        exit = r;
      }
    }
    if (!entrance.forceSize(GridBuilder.ROOM_SIZE, GridBuilder.ROOM_SIZE)) {
      throw new RuntimeException('rigid room sizes for now!');
    }
    entrance.setPos(0, 0);
    let toPlace = new ArrayList();
    let multis = new ArrayList();
    let singles = new ArrayList();
    for (const $it2 = rooms.iterator(); $it2.hasNext(); ) {
      let r = $it2.next();
      if (r.maxConnections(Room.ALL) === 1) {
        singles.add(r);
      } else {
        multis.add(r);
      }
    }
    let maxWidth = 0;
    let maxHeight = 0;
    while (Math.fround((Math.imul(maxWidth, maxHeight))) < Math.fround(rooms.size() * 1.25)) {
      if (maxWidth < maxHeight || (maxWidth === maxHeight && Random.Int$int(2) === 0)) {
        maxWidth++;
      } else {
        maxHeight++;
      }
    }
    let placed = new ArrayList();
    if (!multis.isEmpty()) {
      toPlace.add(multis.removeAt(0));
    }
    if (!multis.isEmpty()) {
      toPlace.add(multis.removeAt(0));
    }
    while (!multis.isEmpty() || !singles.isEmpty()) {
      if (!multis.isEmpty()) {
        toPlace.add(multis.removeAt(0));
      }
      if (!multis.isEmpty()) {
        toPlace.add(multis.removeAt(0));
      }
      if (!multis.isEmpty()) {
        toPlace.add(multis.removeAt(0));
      }
      if (!singles.isEmpty()) {
        toPlace.add(singles.removeAt(0));
      }
    }
    toPlace.remove(entrance);
    let entryX: number;
    let entryY: number;
    switch (Random.Int$int(4)) {
      case 0:
      default:
        entryX = 0;
        entryY = Random.Int$int$int(0, maxHeight);
        break;
      case 1:
        entryX = Random.Int$int$int(0, maxWidth);
        entryY = 0;
        break;
      case 2:
        entryX = (maxWidth - 1) | 0;
        entryY = Random.Int$int$int(0, maxHeight);
        break;
      case 3:
        entryX = Random.Int$int$int(0, maxWidth);
        entryY = (maxHeight - 1) | 0;
        break;
    }
    entrance.setPos(Math.imul(entryX, ((GridBuilder.ROOM_SIZE - 1) | 0)), Math.imul(entryY, ((GridBuilder.ROOM_SIZE - 1) | 0)));
    placed.add(entrance);
    if (exit != null) {
      toPlace.remove(exit);
      toPlace.add(exit);
    }
    let aimCenter = new PointF()._PointF$float$float(Math.fround(maxWidth / 2), Math.fround(maxHeight / 2));
    let gridCells = new SparseArray()._SparseArray();
    gridCells.put(this.getIdx$int$int$GridBuilder(entryX, entryY), entrance);
    let roomPlacementFailures = 0;
    while (!toPlace.isEmpty()) {
      let r = toPlace.removeAt(0);
      let cellWidth = 1;
      let cellHeight = 1;
      if (!r.forceSize(GridBuilder.ROOM_SIZE, GridBuilder.ROOM_SIZE)) {
        if (!r.forceSize((Math.imul(2, GridBuilder.ROOM_SIZE) - 1) | 0, (Math.imul(2, GridBuilder.ROOM_SIZE) - 1) | 0)) {
          if (!r.forceSize(GridBuilder.ROOM_SIZE, (Math.imul(2, GridBuilder.ROOM_SIZE) - 1) | 0)) {
            if (!r.forceSize((Math.imul(2, GridBuilder.ROOM_SIZE) - 1) | 0, GridBuilder.ROOM_SIZE)) {
              throw new RuntimeException('rigid room sizes for now!');
            } else {
              cellWidth = 2;
              cellHeight = 1;
            }
          } else {
            cellWidth = 1;
            cellHeight = 2;
          }
        } else {
          cellWidth = cellHeight = 2;
        }
      }
      let tries = 0;
      do {
        r.neigbours.clear();
        tries++;
        if (tries > 100) {
          toPlace.add(Math.min(2, toPlace.size()), r);
          roomPlacementFailures++;
          if (roomPlacementFailures > 100) {
            return null;
          }
          break;
        }
        let n: Room;
        let nIdx: number;
        if (placed.size() < 3) {
          n = entrance;
          nIdx = this.getIdx$int$int$GridBuilder(entryX, entryY);
        } else {
          let keys = gridCells.keyArray();
          nIdx = keys[Random.Int$int(keys.length)];
          n = gridCells.get(nIdx, null);
        }
        let rIdx = nIdx;
        let xDiff = Math.fround(aimCenter.x - (((rIdx % 1000) - 100) | 0));
        let yDiff = Math.fround(aimCenter.y - ((($J.idiv(rIdx, 1000)) - 100) | 0));
        let dist = Math.fround(Math.sqrt($J.pow(xDiff, 2) + $J.pow(yDiff, 2)));
        if (Random.Float$float(12) < Math.fround(8 + dist) || (placed.size() === 1)) {
          if (Math.fround(Math.abs(xDiff)) >= Math.fround(Math.abs(yDiff))) {
            if (xDiff > Math.fround(0)) {
              rIdx = (rIdx + 1) | 0;
            } else {
              rIdx = (rIdx - 1) | 0;
            }
          } else {
            if (yDiff > Math.fround(0)) {
              rIdx = (rIdx + 1000) | 0;
            } else {
              rIdx = (rIdx - 1000) | 0;
            }
          }
        } else {
          switch (Random.Int$int(4)) {
            case 0:
              rIdx = (rIdx + 1) | 0;
              break;
            case 1:
              rIdx = (rIdx - 1000) | 0;
              break;
            case 2:
              rIdx = (rIdx - 1) | 0;
              break;
            case 3:
              rIdx = (rIdx + 1000) | 0;
              break;
          }
        }
        let x = ((rIdx % 1000) - 100) | 0;
        let y = (($J.idiv(rIdx, 1000)) - 100) | 0;
        let valid: boolean;
        if (x < 0 || x >= maxHeight || y < 0 || y >= maxHeight) {
          valid = false;
        } else if (gridCells.containsKey(rIdx)) {
          valid = false;
        } else if (cellWidth > 1 || cellHeight > 1) {
          let space = this.findFreeGridSpace(new Point()._Point$int$int(x, y), gridCells, cellWidth, cellHeight);
          if (Math.imul(cellWidth, cellHeight) <= 2) {
            space.left_ = Math.max(0, space.left_);
            space.top_ = Math.max(0, space.top_);
            space.right_ = Math.min((maxWidth - 1) | 0, space.right_);
            space.bottom_ = Math.min((maxHeight - 1) | 0, space.bottom_);
          }
          let excessWidth = (space.width() + 1 - cellWidth) | 0;
          let excessHeight = (space.height() + 1 - cellHeight) | 0;
          valid = excessWidth >= 0 && excessHeight >= 0;
          if (valid) {
            x = (space.left_ + (Random.Int$int((excessWidth + 1) | 0))) | 0;
            y = (space.top_ + (Random.Int$int((excessHeight + 1) | 0))) | 0;
            rIdx = this.getIdx$int$int$GridBuilder(x, y);
          }
        } else {
          valid = true;
        }
        if (valid) {
          r.setPos(Math.imul(x, ((GridBuilder.ROOM_SIZE - 1) | 0)), Math.imul(y, ((GridBuilder.ROOM_SIZE - 1) | 0)));
          for (const $it3 = placed.iterator(); $it3.hasNext(); ) {
            let other = $it3.next();
            if (other.getClass() === r.getClass()) {
              let i = r.intersect(other);
              if (i.width() > 0 || i.height() > 0) {
                valid = false;
              }
            }
          }
        }
        if (valid) {
          if (r.connect(n)) {
            placed.add(r);
            for (let i = 0; i < cellWidth; i++) {
              for (let j = 0; j < cellHeight; j++) {
                gridCells.put((rIdx + i + Math.imul(j, 1000)) | 0, r);
              }
            }
          }
        }
      } while (!placed.contains(r));
    }
    Builder.findNeighbours(rooms);
    for (const $it4 = rooms.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      for (const $it5 = r.neigbours.iterator(); $it5.hasNext(); ) {
        let n = $it5.next();
        if (!n.connected_.containsKey(r) && Random.Float$() < this.extraConnectionChance) {
          r.connect(n);
        }
      }
    }
    return rooms;
  }
  findFreeGridSpace(start: Point, collision: SparseArray<Room>, maxWidth: number, maxHeight: number): Rect {
    let space = new Rect()._Rect$int$int$int$int(start.x, start.y, start.x, start.y);
    let expanded = true;
    while (expanded) {
      expanded = false;
      if (space.left_ > ((start.x - (maxWidth - 1)) | 0)) {
        let valid = true;
        for (let y = space.top_; y <= space.bottom_; y++) {
          if (collision.containsKey(this.getIdx$int$int$GridBuilder((space.left_ - 1) | 0, y))) {
            valid = false;
            break;
          }
        }
        if (valid) {
          space.left_--;
          expanded = true;
        }
      }
      if (space.top_ > ((start.y - (maxHeight - 1)) | 0)) {
        let valid = true;
        for (let x = space.left_; x <= space.right_; x++) {
          if (collision.containsKey(this.getIdx$int$int$GridBuilder(x, (space.top_ - 1) | 0))) {
            valid = false;
            break;
          }
        }
        if (valid) {
          space.top_--;
          expanded = true;
        }
      }
      if (space.right_ < ((start.x + (maxWidth - 1)) | 0)) {
        let valid = true;
        for (let y = space.top_; y <= space.bottom_; y++) {
          if (collision.containsKey(this.getIdx$int$int$GridBuilder((space.right_ + 1) | 0, y))) {
            valid = false;
            break;
          }
        }
        if (valid) {
          space.right_++;
          expanded = true;
        }
      }
      if (space.bottom_ < ((start.y + (maxHeight - 1)) | 0)) {
        let valid = true;
        for (let x = space.left_; x <= space.right_; x++) {
          if (collision.containsKey(this.getIdx$int$int$GridBuilder(x, (space.bottom_ + 1) | 0))) {
            valid = false;
            break;
          }
        }
        if (valid) {
          space.bottom_++;
          expanded = true;
        }
      }
    }
    return space;
  }
  getIdx$Point$GridBuilder(p: Point): number {
    return (p.x + Math.imul(1000, p.y) + 100) | 0;
  }
  getIdx$int$int$GridBuilder(x: number, y: number): number {
    return (x + 100 + Math.imul(1000, ((y + 100) | 0))) | 0;
  }
  static $clinit() {
    GridBuilder.ROOM_SIZE = 11;
  }
}

$J.define(GridBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.GridBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder', ctors: { '': '_GridBuilder' }, meths: { 'getIdx(int,int)': 'getIdx$int$int$GridBuilder', 'getIdx(com.watabou.utils.Point)': 'getIdx$Point$GridBuilder' }, clinit: true, lazy: ['ROOM_SIZE'] });
$J.module(() => {
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
