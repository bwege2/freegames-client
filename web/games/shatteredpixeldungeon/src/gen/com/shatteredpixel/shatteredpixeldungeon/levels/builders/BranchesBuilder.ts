// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/BranchesBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class BranchesBuilder extends RegularBuilder {
  _BranchesBuilder(): this {
    this._RegularBuilder();
    return this;
  }
  build(rooms: ArrayList<Room>): ArrayList<Room> {
    this.setupRooms(rooms);
    if (this.entrance_ == null) {
      return null;
    }
    let branchable = new ArrayList();
    this.entrance_.setSize$();
    this.entrance_.setPos(0, 0);
    branchable.add(this.entrance_);
    if (this.shop != null) {
      Builder.placeRoom(branchable, this.entrance_, this.shop, Random.Float$float(360));
    }
    let mainBranchRooms = Math.max(Random.Int$int$int(2, 3), this.mainPathRooms.size());
    let pathTunnels = this.pathTunnelChances.slice();
    for (let i = 1; i < mainBranchRooms; i++) {
      let prev = this.entrance_;
      let r = this.mainPathRooms.get(0);
      let tunnels = Random.chances$floatArr(pathTunnels);
      if (tunnels === -1) {
        pathTunnels = this.pathTunnelChances.slice();
        tunnels = Random.chances$floatArr(pathTunnels);
      }
      pathTunnels[tunnels]--;
      for (let j = 0; j < tunnels; j++) {
        let t = ConnectionRoom.createRoom();
        let result: number;
        do {
          result = Builder.placeRoom(rooms, prev, t, Random.Float$float(360));
        } while (result === Math.fround(-1));
        branchable.add(t);
        rooms.add(t);
        prev = t;
      }
      let result: number;
      do {
        result = Builder.placeRoom(rooms, prev, r, Random.Float$float(360));
      } while (result === Math.fround(-1));
      branchable.add(r);
      this.mainPathRooms.remove(r);
    }
    let roomsToBranch = new ArrayList();
    roomsToBranch.addAll(this.mainPathRooms);
    roomsToBranch.addAll(this.multiConnections);
    if (this.exit_ != null) {
      roomsToBranch.add(this.exit_);
    }
    roomsToBranch.addAll(this.singleConnections);
    if (!this.createBranches(rooms, branchable, roomsToBranch, this.branchTunnelChances)) {
      return null;
    }
    Builder.findNeighbours(rooms);
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      for (const $it1 = r.neigbours.iterator(); $it1.hasNext(); ) {
        let n = $it1.next();
        if (!n.connected_.containsKey(r) && Random.Float$() < this.extraConnectionChance) {
          r.connect(n);
        }
      }
    }
    return rooms;
  }
  randomBranchAngle(r: Room): number {
    let entranceCenter = new PointF()._PointF$Point(this.entrance_.center());
    let toCenter = Builder.angleBetweenPoints(new PointF()._PointF$float$float(Math.fround(((r.left_ + r.right_) | 0) / 2), Math.fround(((r.top_ + r.bottom_) | 0) / 2)), entranceCenter);
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

$J.define(BranchesBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.BranchesBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder', ctors: { '': '_BranchesBuilder' } });
$J.module(() => {
  Builder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
