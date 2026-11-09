// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/FigureEightBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { RegularBuilder } from './RegularBuilder.ts';

let Builder, Room, ConnectionRoom, PointF, Random;

export class FigureEightBuilder extends RegularBuilder {
  curveExponent: number = 0;
  curveIntensity: number = 0;
  curveOffset: number = 0;
  landmarkRoom: Room = null;
  firstLoop: ArrayList<Room> = null;
  secondLoop: ArrayList<Room> = null;
  firstLoopCenter: PointF = null;
  secondLoopCenter: PointF = null;
  _FigureEightBuilder(): this {
    this._RegularBuilder();
    this.curveExponent = 0;
    this.curveIntensity = 1;
    this.curveOffset = 0;
    return this;
  }
  setLoopShape(exponent: number, intensity: number, offset: number): FigureEightBuilder {
    this.curveExponent = Math.abs(exponent);
    this.curveIntensity = Math.fround(intensity % 1);
    this.curveOffset = Math.fround(offset % 0.5);
    return this;
  }
  targetAngle(percentAlong: number): number {
    percentAlong = Math.fround(percentAlong + this.curveOffset);
    return Math.fround(360 * Math.fround((this.curveIntensity * this.curveEquation(percentAlong) + Math.fround((Math.fround(1 - this.curveIntensity)) * (percentAlong)) - this.curveOffset)));
  }
  curveEquation(x: number): number {
    return $J.pow(4, Math.imul(2, this.curveExponent)) * ($J.pow((x % 0.5) - 0.25, (Math.imul(2, this.curveExponent) + 1) | 0)) + 0.25 + 0.5 * (Math.floor(2 * x));
  }
  setLandmarkRoom(room: Room): FigureEightBuilder {
    this.landmarkRoom = room;
    return this;
  }
  build(rooms: ArrayList<Room>): ArrayList<Room> {
    this.setupRooms(rooms);
    if (this.landmarkRoom == null) {
      for (const $it0 = this.mainPathRooms.iterator(); $it0.hasNext(); ) {
        let r = $it0.next();
        if (r.maxConnections(Room.ALL) >= 4 && (this.landmarkRoom == null || Math.imul(this.landmarkRoom.minWidth(), this.landmarkRoom.minHeight()) < Math.imul(r.minWidth(), r.minHeight()))) {
          this.landmarkRoom = r;
        }
      }
      if (!this.multiConnections.isEmpty()) {
        this.mainPathRooms.add(this.multiConnections.removeAt(0));
      }
    }
    this.mainPathRooms.remove(this.landmarkRoom);
    this.multiConnections.remove(this.landmarkRoom);
    let startAngle = Random.Float$float$float(0, 360);
    let roomsOnFirstLoop = $J.idiv(this.mainPathRooms.size(), 2);
    if (this.mainPathRooms.size() % 2 === 1) {
      roomsOnFirstLoop = (roomsOnFirstLoop + Random.Int$int(2)) | 0;
    }
    let roomsToLoop = this.mainPathRooms.clone();
    let firstLoopTemp = new ArrayList();
    firstLoopTemp.add(this.landmarkRoom);
    for (let i = 0; i < roomsOnFirstLoop; i++) {
      firstLoopTemp.add(roomsToLoop.removeAt(0));
    }
    firstLoopTemp.add($J.idiv(((firstLoopTemp.size() + 1) | 0), 2), this.entrance_);
    let pathTunnels = this.pathTunnelChances.slice();
    this.firstLoop = new ArrayList();
    for (const $it1 = firstLoopTemp.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      this.firstLoop.add(r);
      let tunnels = Random.chances$floatArr(pathTunnels);
      if (tunnels === -1) {
        pathTunnels = this.pathTunnelChances.slice();
        tunnels = Random.chances$floatArr(pathTunnels);
      }
      pathTunnels[tunnels]--;
      for (let j = 0; j < tunnels; j++) {
        this.firstLoop.add(ConnectionRoom.createRoom());
      }
    }
    let secondLoopTemp = new ArrayList();
    secondLoopTemp.add(this.landmarkRoom);
    secondLoopTemp.addAll(roomsToLoop);
    if (this.exit_ != null) {
      secondLoopTemp.add($J.idiv(((secondLoopTemp.size() + 1) | 0), 2), this.exit_);
    }
    this.secondLoop = new ArrayList();
    for (const $it2 = secondLoopTemp.iterator(); $it2.hasNext(); ) {
      let r = $it2.next();
      this.secondLoop.add(r);
      let tunnels = Random.chances$floatArr(pathTunnels);
      if (tunnels === -1) {
        pathTunnels = this.pathTunnelChances.slice();
        tunnels = Random.chances$floatArr(pathTunnels);
      }
      pathTunnels[tunnels]--;
      for (let j = 0; j < tunnels; j++) {
        this.secondLoop.add(ConnectionRoom.createRoom());
      }
    }
    this.landmarkRoom.setSize$();
    this.landmarkRoom.setPos(0, 0);
    let prev = this.landmarkRoom;
    let targetAngle: number;
    for (let i = 1; i < this.firstLoop.size(); i++) {
      let r = this.firstLoop.get(i);
      targetAngle = Math.fround(startAngle + this.targetAngle(Math.fround(i / Math.fround(this.firstLoop.size()))));
      if (Builder.placeRoom(rooms, prev, r, targetAngle) !== Math.fround(-1)) {
        prev = r;
        if (!rooms.contains(prev)) {
          rooms.add(prev);
        }
      } else {
        return null;
      }
    }
    while (!prev.connect(this.landmarkRoom)) {
      let c = ConnectionRoom.createRoom();
      if (Builder.placeRoom(rooms, prev, c, Builder.angleBetweenRooms(prev, this.landmarkRoom)) === Math.fround(-1)) {
        return null;
      }
      this.firstLoop.add(c);
      rooms.add(c);
      prev = c;
    }
    prev = this.landmarkRoom;
    startAngle = Math.fround(startAngle + 180);
    for (let i = 1; i < this.secondLoop.size(); i++) {
      let r = this.secondLoop.get(i);
      targetAngle = Math.fround(startAngle + this.targetAngle(Math.fround(i / Math.fround(this.secondLoop.size()))));
      if (Builder.placeRoom(rooms, prev, r, targetAngle) !== Math.fround(-1)) {
        prev = r;
        if (!rooms.contains(prev)) {
          rooms.add(prev);
        }
      } else {
        return null;
      }
    }
    while (!prev.connect(this.landmarkRoom)) {
      let c = ConnectionRoom.createRoom();
      if (Builder.placeRoom(rooms, prev, c, Builder.angleBetweenRooms(prev, this.landmarkRoom)) === Math.fround(-1)) {
        return null;
      }
      this.secondLoop.add(c);
      rooms.add(c);
      prev = c;
    }
    if (this.shop != null) {
      let angle: number;
      let tries = 10;
      do {
        angle = Builder.placeRoom(rooms, this.entrance_, this.shop, Random.Float$float(360));
        tries--;
      } while (angle === Math.fround(-1) && tries >= 0);
      if (angle === Math.fround(-1)) {
        return null;
      }
    }
    this.firstLoopCenter = new PointF()._PointF$();
    for (const $it3 = this.firstLoop.iterator(); $it3.hasNext(); ) {
      let r = $it3.next();
      this.firstLoopCenter.x = Math.fround(this.firstLoopCenter.x + Math.fround(((r.left_ + r.right_) | 0) / 2));
      this.firstLoopCenter.y = Math.fround(this.firstLoopCenter.y + Math.fround(((r.top_ + r.bottom_) | 0) / 2));
    }
    this.firstLoopCenter.x = Math.fround(this.firstLoopCenter.x / this.firstLoop.size());
    this.firstLoopCenter.y = Math.fround(this.firstLoopCenter.y / this.firstLoop.size());
    this.secondLoopCenter = new PointF()._PointF$();
    for (const $it4 = this.secondLoop.iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      this.secondLoopCenter.x = Math.fround(this.secondLoopCenter.x + Math.fround(((r.left_ + r.right_) | 0) / 2));
      this.secondLoopCenter.y = Math.fround(this.secondLoopCenter.y + Math.fround(((r.top_ + r.bottom_) | 0) / 2));
    }
    this.secondLoopCenter.x = Math.fround(this.secondLoopCenter.x / this.secondLoop.size());
    this.secondLoopCenter.y = Math.fround(this.secondLoopCenter.y / this.secondLoop.size());
    let branchable = new ArrayList(this.firstLoop);
    branchable.addAll(this.secondLoop);
    branchable.remove(this.landmarkRoom);
    let roomsToBranch = new ArrayList();
    roomsToBranch.addAll(this.multiConnections);
    roomsToBranch.addAll(this.singleConnections);
    this.weightRooms(branchable);
    if (!this.createBranches(rooms, branchable, roomsToBranch, this.branchTunnelChances)) {
      return null;
    }
    Builder.findNeighbours(rooms);
    for (const $it5 = rooms.iterator(); $it5.hasNext(); ) {
      let r = $it5.next();
      for (const $it6 = r.neigbours.iterator(); $it6.hasNext(); ) {
        let n = $it6.next();
        if (!n.connected_.containsKey(r) && Random.Float$() < this.extraConnectionChance) {
          r.connect(n);
        }
      }
    }
    return rooms;
  }
  randomBranchAngle(r: Room): number {
    let center: PointF;
    if (this.firstLoop.contains(r)) {
      center = this.firstLoopCenter;
    } else {
      center = this.secondLoopCenter;
    }
    if (center == null) {
      return super.randomBranchAngle(r);
    } else {
      let toCenter = Builder.angleBetweenPoints(new PointF()._PointF$float$float(Math.fround(((r.left_ + r.right_) | 0) / 2), Math.fround(((r.top_ + r.bottom_) | 0) / 2)), center);
      if (toCenter < Math.fround(0)) {
        toCenter = Math.fround(toCenter + 360);
      }
      let currAngle = Random.Float$float(360);
      for (let i = 0; i < 4; i++) {
        let newAngle = Random.Float$float(360);
        if (Math.fround(Math.abs(Math.fround(toCenter - newAngle))) < Math.fround(Math.abs(Math.fround(toCenter - currAngle)))) {
          currAngle = newAngle;
        }
      }
      return currAngle;
    }
  }
}

$J.define(FigureEightBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.FigureEightBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder', ctors: { '': '_FigureEightBuilder' } });
$J.module(() => {
  Builder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder');
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
