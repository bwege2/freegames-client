// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/LoopBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Builder, ConnectionRoom, PointF, Random;

export class LoopBuilder extends RegularBuilder {
  curveExponent: number = 0;
  curveIntensity: number = 0;
  curveOffset: number = 0;
  loopCenter: PointF = null;
  _LoopBuilder(): this {
    this._RegularBuilder();
    this.curveExponent = 0;
    this.curveIntensity = 1;
    this.curveOffset = 0;
    return this;
  }
  setLoopShape(exponent: number, intensity: number, offset: number): LoopBuilder {
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
  build(rooms: ArrayList<Room>): ArrayList<Room> {
    this.setupRooms(rooms);
    if (this.entrance_ == null) {
      return null;
    }
    this.entrance_.setSize$();
    this.entrance_.setPos(0, 0);
    let startAngle = Random.Float$float$float(0, 360);
    this.mainPathRooms.add(0, this.entrance_);
    if (this.exit_ != null) {
      this.mainPathRooms.add($J.idiv(((this.mainPathRooms.size() + 1) | 0), 2), this.exit_);
    }
    let loop = new ArrayList();
    let pathTunnels = this.pathTunnelChances.slice();
    for (const $it0 = this.mainPathRooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      loop.add(r);
      let tunnels = Random.chances$floatArr(pathTunnels);
      if (tunnels === -1) {
        pathTunnels = this.pathTunnelChances.slice();
        tunnels = Random.chances$floatArr(pathTunnels);
      }
      pathTunnels[tunnels]--;
      for (let j = 0; j < tunnels; j++) {
        loop.add(ConnectionRoom.createRoom());
      }
    }
    let prev = this.entrance_;
    let targetAngle: number;
    for (let i = 1; i < loop.size(); i++) {
      let r = loop.get(i);
      targetAngle = Math.fround(startAngle + this.targetAngle(Math.fround(i / Math.fround(loop.size()))));
      if (Builder.placeRoom(rooms, prev, r, targetAngle) !== Math.fround(-1)) {
        prev = r;
        if (!rooms.contains(prev)) {
          rooms.add(prev);
        }
      } else {
        return null;
      }
    }
    while (!prev.connect(this.entrance_)) {
      let c = ConnectionRoom.createRoom();
      if (Builder.placeRoom(loop, prev, c, Builder.angleBetweenRooms(prev, this.entrance_)) === Math.fround(-1)) {
        return null;
      }
      loop.add(c);
      rooms.add(c);
      prev = c;
    }
    if (this.shop != null) {
      let angle: number;
      let tries = 10;
      do {
        angle = Builder.placeRoom(loop, this.entrance_, this.shop, Random.Float$float(360));
        tries--;
      } while (angle === Math.fround(-1) && tries >= 0);
      if (angle === Math.fround(-1)) {
        return null;
      }
    }
    this.loopCenter = new PointF()._PointF$();
    for (const $it1 = loop.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      this.loopCenter.x = Math.fround(this.loopCenter.x + Math.fround(((r.left_ + r.right_) | 0) / 2));
      this.loopCenter.y = Math.fround(this.loopCenter.y + Math.fround(((r.top_ + r.bottom_) | 0) / 2));
    }
    this.loopCenter.x = Math.fround(this.loopCenter.x / loop.size());
    this.loopCenter.y = Math.fround(this.loopCenter.y / loop.size());
    let branchable = new ArrayList(loop);
    let roomsToBranch = new ArrayList();
    roomsToBranch.addAll(this.multiConnections);
    roomsToBranch.addAll(this.singleConnections);
    this.weightRooms(branchable);
    if (!this.createBranches(rooms, branchable, roomsToBranch, this.branchTunnelChances)) {
      return null;
    }
    Builder.findNeighbours(rooms);
    for (const $it2 = rooms.iterator(); $it2.hasNext(); ) {
      let r = $it2.next();
      for (const $it3 = r.neigbours.iterator(); $it3.hasNext(); ) {
        let n = $it3.next();
        if (!n.connected_.containsKey(r) && Random.Float$() < this.extraConnectionChance) {
          r.connect(n);
        }
      }
    }
    return rooms;
  }
  randomBranchAngle(r: Room): number {
    if (this.loopCenter == null) {
      return super.randomBranchAngle(r);
    } else {
      let toCenter = Builder.angleBetweenPoints(new PointF()._PointF$float$float(Math.fround(((r.left_ + r.right_) | 0) / 2), Math.fround(((r.top_ + r.bottom_) | 0) / 2)), this.loopCenter);
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

$J.define(LoopBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.LoopBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder', ctors: { '': '_LoopBuilder' } });
$J.module(() => {
  Builder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
