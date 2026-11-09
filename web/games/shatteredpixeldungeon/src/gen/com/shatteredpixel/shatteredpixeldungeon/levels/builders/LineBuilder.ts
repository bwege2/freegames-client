// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/LineBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Builder, ConnectionRoom, Random;

export class LineBuilder extends RegularBuilder {
  _LineBuilder(): this {
    this._RegularBuilder();
    return this;
  }
  build(rooms: ArrayList<Room>): ArrayList<Room> {
    this.setupRooms(rooms);
    if (this.entrance_ == null) {
      return null;
    }
    let direction = Random.Float$float$float(0, 360);
    let branchable = new ArrayList();
    this.entrance_.setSize$();
    this.entrance_.setPos(0, 0);
    this.mainPathRooms.add(0, this.entrance_);
    if (this.exit_ != null) {
      this.mainPathRooms.add(this.exit_);
    }
    if (this.shop != null) {
      Builder.placeRoom(rooms, this.entrance_, this.shop, Math.fround(direction + 180));
    }
    let prev = this.entrance_;
    let pathTunnels = this.pathTunnelChances.slice();
    for (let i = 1; i < this.mainPathRooms.size(); i++) {
      let r = this.mainPathRooms.get(i);
      let tunnels = Random.chances$floatArr(pathTunnels);
      if (tunnels === -1) {
        pathTunnels = this.pathTunnelChances.slice();
        tunnels = Random.chances$floatArr(pathTunnels);
      }
      pathTunnels[tunnels]--;
      for (let j = 0; j < tunnels; j++) {
        let t = ConnectionRoom.createRoom();
        Builder.placeRoom(rooms, prev, t, Math.fround(direction + Random.Float$float$float(Math.fround(-this.pathVariance), this.pathVariance)));
        branchable.add(t);
        rooms.add(t);
        prev = t;
      }
      Builder.placeRoom(rooms, prev, r, Math.fround(direction + Random.Float$float$float(Math.fround(-this.pathVariance), this.pathVariance)));
      branchable.add(r);
      prev = r;
    }
    let roomsToBranch = new ArrayList();
    roomsToBranch.addAll(this.multiConnections);
    roomsToBranch.addAll(this.singleConnections);
    this.weightRooms(branchable);
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
}

$J.define(LineBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.LineBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder', ctors: { '': '_LineBuilder' } });
$J.module(() => {
  Builder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  Random = $J.load('com.watabou.utils.Random');
});
