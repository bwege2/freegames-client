// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/RegularPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, RuntimeException } from '../../../../../../jre/index.ts';
import { Painter } from './Painter.ts';

let Dungeon, SPDSettings, TrapMechanism, Document, Level$Feeling, Patch, Terrain, Room$Door, Room$Door$Type, ConnectionRoom, SpecialRoom, StandardRoom$SizeCategory, Game, Graph, PathFinder, Point, Random, Rect, Reflection;

export class RegularPainter extends Painter {
  waterFill: number = 0;
  waterSmoothness: number = 0;
  grassFill: number = 0;
  grassSmoothness: number = 0;
  nTraps_: number = 0;
  trapClasses_: JClass<Trap>[] = null;
  trapChances_: number[] = null;
  _RegularPainter(): this {
    this._Painter();
    this.waterFill = 0;
    this.grassFill = 0;
    this.nTraps_ = 0;
    return this;
  }
  setWater(fill: number, smoothness: number): RegularPainter {
    this.waterFill = fill;
    this.waterSmoothness = smoothness;
    return this;
  }
  setGrass(fill: number, smoothness: number): RegularPainter {
    this.grassFill = fill;
    this.grassSmoothness = smoothness;
    return this;
  }
  setTraps(num: number, classes: JClass<any>[], chances: number[]): RegularPainter {
    this.nTraps_ = num;
    this.trapClasses_ = classes;
    this.trapChances_ = chances;
    return this;
  }
  padding(level: Level): number {
    return level.feeling === Level$Feeling.CHASM ? 2 : 1;
  }
  paint(level: Level, rooms: ArrayList<Room>): boolean {
    if (rooms != null) {
      let padding = this.padding(level);
      let leftMost = 2147483647;
      let topMost = 2147483647;
      for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
        let r = $it0.next();
        if (r.left_ < leftMost) {
          leftMost = r.left_;
        }
        if (r.top_ < topMost) {
          topMost = r.top_;
        }
      }
      leftMost = (leftMost - padding) | 0;
      topMost = (topMost - padding) | 0;
      let rightMost = 0;
      let bottomMost = 0;
      for (const $it1 = rooms.iterator(); $it1.hasNext(); ) {
        let r = $it1.next();
        r.shift(-leftMost, -topMost);
        if (r.right_ > rightMost) {
          rightMost = r.right_;
        }
        if (r.bottom_ > bottomMost) {
          bottomMost = r.bottom_;
        }
      }
      rightMost = (rightMost + padding) | 0;
      bottomMost = (bottomMost + padding) | 0;
      level.setSize((rightMost + 1) | 0, (bottomMost + 1) | 0);
    } else {
      if (level.length() === 0) {
        return false;
      }
      rooms = new ArrayList();
    }
    Random.shuffle$List(rooms);
    for (let r of $J.toArrayInto(rooms.toArray(), $J.newArray(0, null))) {
      if (r.connected_.isEmpty()) {
        Game.reportException(new RuntimeException('Painting a room with no connections! Room:' + r.getClass().getSimpleName() + ' Seed:' + Dungeon.seed + ' Depth:' + Dungeon.depth));
        if (r instanceof SpecialRoom) {
          return false;
        }
      }
      this.placeDoors(r);
      r.paint(level);
    }
    this.paintDoors(level, rooms);
    Random.pushGenerator$long(Random.Long$());
    if (this.waterFill > 0) {
      this.paintWater(level, rooms);
    }
    if (this.grassFill > 0) {
      this.paintGrass(level, rooms);
    }
    if (this.nTraps_ > 0) {
      this.paintTraps(level, rooms);
    }
    this.decorate(level, rooms);
    Random.popGenerator();
    return true;
  }
  placeDoors(r: Room): void {
    for (const $it2 = r.connected_.keySet().iterator(); $it2.hasNext(); ) {
      let n = $it2.next();
      let door = r.connected_.get(n);
      if (door == null) {
        let i = r.intersect(n);
        let doorSpots = new ArrayList();
        for (const $it3 = i.getPoints().iterator(); $it3.hasNext(); ) {
          let p = $it3.next();
          if (r.canConnect$Point(p) && n.canConnect$Point(p)) {
            doorSpots.add(p);
          }
        }
        if (doorSpots.isEmpty()) {
          Game.reportException(new RuntimeException('Could not place a door! r=' + r.getClass().getSimpleName() + ' n=' + n.getClass().getSimpleName()));
          continue;
        }
        door = new Room$Door()._Room$Door$Point(Random.element$Collection(doorSpots));
        r.connected_.put(n, door);
        n.connected_.put(r, door);
      }
    }
  }
  hiddenDoorChance(l: Level): number {
    let hiddenDoorChance = 0;
    if (Dungeon.depth > 1) {
      hiddenDoorChance = Math.min(1, Math.fround(Dungeon.depth / 20));
    }
    if (l.feeling === Level$Feeling.SECRETS) {
      hiddenDoorChance = Math.fround((Math.fround(0.5 + hiddenDoorChance)) / 2);
    }
    return hiddenDoorChance;
  }
  paintDoors(l: Level, rooms: ArrayList<Room>): void {
    let hiddenDoorChance = this.hiddenDoorChance(l);
    let roomMerges = new HashMap();
    for (const $it4 = rooms.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      for (const $it5 = r.connected_.keySet().iterator(); $it5.hasNext(); ) {
        let n = $it5.next();
        if (roomMerges.get(r) === n || roomMerges.get(n) === r) {
          continue;
        } else if (!roomMerges.containsKey(r) && !roomMerges.containsKey(n) && this.mergeRooms(l, r, n, r.connected_.get(n), Terrain.EMPTY)) {
          if ((r).sizeCat === StandardRoom$SizeCategory.NORMAL) {
            roomMerges.put(r, n);
          }
          if ((n).sizeCat === StandardRoom$SizeCategory.NORMAL) {
            roomMerges.put(n, r);
          }
          continue;
        }
        let d = r.connected_.get(n);
        let door = (d.x + Math.imul(d.y, l.width())) | 0;
        if (d.type_ === Room$Door$Type.REGULAR) {
          if (Random.Float$() < hiddenDoorChance) {
            d.type_ = Room$Door$Type.HIDDEN;
            if (l.feeling !== Level$Feeling.SECRETS) {
              Graph.buildDistanceMap(rooms, r);
              if (n.distance_ === 2147483647) {
                d.type_ = Room$Door$Type.UNLOCKED;
              }
            } else {
              let roomsInGraph = 0;
              Graph.buildDistanceMap(rooms, r);
              for (const $it6 = rooms.iterator(); $it6.hasNext(); ) {
                let rDest = $it6.next();
                if (rDest.distance_ !== 2147483647 && !(rDest instanceof ConnectionRoom)) {
                  roomsInGraph++;
                }
              }
              if (roomsInGraph < 2) {
                d.type_ = Room$Door$Type.UNLOCKED;
              } else {
                roomsInGraph = 0;
                Graph.buildDistanceMap(rooms, n);
                for (const $it7 = rooms.iterator(); $it7.hasNext(); ) {
                  let nDest = $it7.next();
                  if (nDest.distance_ !== 2147483647 && !(nDest instanceof ConnectionRoom)) {
                    roomsInGraph++;
                  }
                }
                if (roomsInGraph < 2) {
                  d.type_ = Room$Door$Type.UNLOCKED;
                }
              }
            }
            Graph.buildDistanceMap(rooms, r);
            if (l.feeling !== Level$Feeling.SECRETS && n.distance_ === 2147483647) {
              d.type_ = Room$Door$Type.UNLOCKED;
            }
          } else {
            d.type_ = Room$Door$Type.UNLOCKED;
          }
        }
        if (d.type_ === Room$Door$Type.UNLOCKED && (r.isEntrance() || n.isEntrance())) {
          if ((Dungeon.depth === 1 && SPDSettings.intro$()) || (Dungeon.depth === 2 && !Document.ADVENTURERS_GUIDE.isPageFound$String(Document.GUIDE_SEARCHING))) {
            d.type_ = Room$Door$Type.HIDDEN;
          }
        }
        switch (d.type_) {
          case Room$Door$Type.EMPTY:
            l.map_[door] = Terrain.EMPTY;
            break;
          case Room$Door$Type.TUNNEL:
            l.map_[door] = l.tunnelTile();
            break;
          case Room$Door$Type.WATER:
            l.map_[door] = Terrain.WATER;
            break;
          case Room$Door$Type.UNLOCKED:
            l.map_[door] = Terrain.DOOR;
            break;
          case Room$Door$Type.HIDDEN:
            l.map_[door] = Terrain.SECRET_DOOR;
            break;
          case Room$Door$Type.BARRICADE:
            l.map_[door] = Terrain.BARRICADE;
            break;
          case Room$Door$Type.LOCKED:
            l.map_[door] = Terrain.LOCKED_DOOR;
            break;
          case Room$Door$Type.CRYSTAL:
            l.map_[door] = Terrain.CRYSTAL_DOOR;
            break;
          case Room$Door$Type.WALL:
            l.map_[door] = Terrain.WALL;
            break;
        }
      }
    }
  }
  mergeRooms(l: Level, r: Room, n: Room, start: Point, mergeTerrain: number): boolean {
    let intersect = r.intersect(n);
    if (intersect.left_ === intersect.right_) {
      let merge = new Rect()._Rect$();
      merge.left_ = merge.right_ = intersect.left_;
      merge.top_ = merge.bottom_ = start != null ? start.y : intersect.center().y;
      let p = new Point()._Point$int$int(merge.left_, merge.top_);
      while (merge.top_ > intersect.top_ && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.top_--;
        p.y--;
      }
      p.y = merge.bottom_;
      while (merge.bottom_ < intersect.bottom_ && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.bottom_++;
        p.y++;
      }
      if (merge.height() >= 3) {
        r.merge(l, n, new Rect()._Rect$int$int$int$int(merge.left_, (merge.top_ + 1) | 0, (merge.left_ + 1) | 0, merge.bottom_), mergeTerrain);
        return true;
      } else {
        return false;
      }
    } else if (intersect.top_ === intersect.bottom_) {
      let merge = new Rect()._Rect$();
      merge.left_ = merge.right_ = start != null ? start.x : intersect.center().x;
      merge.top_ = merge.bottom_ = intersect.top_;
      let p = new Point()._Point$int$int(merge.left_, merge.top_);
      while (merge.left_ > intersect.left_ && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.left_--;
        p.x--;
      }
      p.x = merge.right_;
      while (merge.right_ < intersect.right_ && n.canMerge(l, r, p, mergeTerrain) && r.canMerge(l, n, p, mergeTerrain)) {
        merge.right_++;
        p.x++;
      }
      if (merge.width() >= 3) {
        r.merge(l, n, new Rect()._Rect$int$int$int$int((merge.left_ + 1) | 0, merge.top_, merge.right_, (merge.top_ + 1) | 0), mergeTerrain);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  paintWater(l: Level, rooms: ArrayList<Room>): void {
    let lake = Patch.generate(l.width(), l.height(), this.waterFill, this.waterSmoothness, true);
    if (!rooms.isEmpty()) {
      for (const $it8 = rooms.iterator(); $it8.hasNext(); ) {
        let r = $it8.next();
        for (const $it9 = r.waterPlaceablePoints().iterator(); $it9.hasNext(); ) {
          let p = $it9.next();
          let i = l.pointToCell(p);
          if (lake[i] && l.map_[i] === Terrain.EMPTY) {
            l.map_[i] = Terrain.WATER;
          }
        }
      }
    } else {
      for (let i = 0; i < l.length(); i++) {
        if (lake[i] && l.map_[i] === Terrain.EMPTY) {
          l.map_[i] = Terrain.WATER;
        }
      }
    }
  }
  paintGrass(l: Level, rooms: ArrayList<Room>): void {
    let grass = Patch.generate(l.width(), l.height(), this.grassFill, this.grassSmoothness, true);
    let grassCells = new ArrayList();
    if (!rooms.isEmpty()) {
      for (const $it10 = rooms.iterator(); $it10.hasNext(); ) {
        let r = $it10.next();
        for (const $it11 = r.grassPlaceablePoints().iterator(); $it11.hasNext(); ) {
          let p = $it11.next();
          let i = l.pointToCell(p);
          if (grass[i] && l.map_[i] === Terrain.EMPTY) {
            grassCells.add(i);
          }
        }
      }
    } else {
      for (let i = 0; i < l.length(); i++) {
        if (grass[i] && l.map_[i] === Terrain.EMPTY) {
          grassCells.add(i);
        }
      }
    }
    for (const $it12 = grassCells.iterator(); $it12.hasNext(); ) {
      let i = $it12.next();
      if (l.heaps.get(i) != null || l.findMob(i) != null) {
        l.map_[i] = Terrain.GRASS;
        continue;
      }
      let count = 1;
      for (let n of PathFinder.NEIGHBOURS8) {
        if (grass[(i + n) | 0]) {
          count++;
        }
      }
      l.map_[i] = (Random.Float$() < Math.fround(count / 12)) ? Terrain.HIGH_GRASS : Terrain.GRASS;
    }
  }
  paintTraps(l: Level, rooms: ArrayList<Room>): void {
    let validCells = new ArrayList();
    if (!rooms.isEmpty()) {
      for (const $it13 = rooms.iterator(); $it13.hasNext(); ) {
        let r = $it13.next();
        for (const $it14 = r.trapPlaceablePoints().iterator(); $it14.hasNext(); ) {
          let p = $it14.next();
          let i = l.pointToCell(p);
          if (l.map_[i] === Terrain.EMPTY) {
            validCells.add(i);
          }
        }
      }
    } else {
      for (let i = 0; i < l.length(); i++) {
        if (l.map_[i] === Terrain.EMPTY) {
          validCells.add(i);
        }
      }
    }
    this.nTraps_ = Math.min(this.nTraps_, $J.idiv(validCells.size(), 5));
    let validOpenSpace = new ArrayList();
    for (let i = 0; i < l.length(); i++) {
      l.passable[i] = (Terrain.flags[l.map_[i]] & Terrain.PASSABLE) !== 0;
    }
    for (const $it15 = validCells.iterator(); $it15.hasNext(); ) {
      let i = $it15.next();
      if ((l.passable[(i + PathFinder.CIRCLE4[0]) | 0] || l.passable[(i + PathFinder.CIRCLE4[2]) | 0]) && (l.passable[(i + PathFinder.CIRCLE4[1]) | 0] || l.passable[(i + PathFinder.CIRCLE4[3]) | 0])) {
        validOpenSpace.add(i);
      }
    }
    this.nTraps_ = Math.min(this.nTraps_, $J.idiv(validCells.size(), 5));
    let revealedChance = TrapMechanism.revealHiddenTrapChance$();
    let revealInc = 0;
    for (let i = 0; i < (l.feeling === Level$Feeling.TRAPS ? Math.imul(5, this.nTraps_) : this.nTraps_); i++) {
      let trap = Reflection.newInstance(this.trapClasses_[Random.chances$floatArr(this.trapChances_)]);
      let trapPos: number;
      if (trap.avoidsClosedSpaces && !validOpenSpace.isEmpty()) {
        trapPos = Random.element$Collection(validOpenSpace);
      } else {
        trapPos = Random.element$Collection(validCells);
      }
      validCells.remove(trapPos);
      validOpenSpace.remove(trapPos);
      for (let j = 0; j < PathFinder.CIRCLE4.length; j++) {
        validOpenSpace.remove(((trapPos + PathFinder.CIRCLE4[j]) | 0));
      }
      revealInc = Math.fround(revealInc + revealedChance);
      if (i >= this.nTraps_ || revealInc >= Math.fround(1)) {
        trap.reveal();
        revealInc--;
      } else {
        trap.hide();
      }
      l.setTrap(trap, trapPos);
      l.map_[trapPos] = trap.visible_ ? Terrain.TRAP : Terrain.SECRET_TRAP;
    }
  }
}

$J.define(RegularPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter', ctors: { '': '_RegularPainter' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Room$Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Game = $J.load('com.watabou.noosa.Game');
  Graph = $J.load('com.watabou.utils.Graph');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
