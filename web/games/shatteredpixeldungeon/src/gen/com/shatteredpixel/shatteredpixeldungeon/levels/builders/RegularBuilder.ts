// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/RegularBuilder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, LinkedHashSet } from '../../../../../../jre/index.ts';
import { Builder } from './Builder.ts';

let Room, ConnectionRoom, MazeConnectionRoom, SecretRoom, ShopRoom, StandardRoom, Random;

export class RegularBuilder extends Builder {
  pathVariance: number = 0;
  pathLength: number = 0;
  pathLenJitterChances: number[] = null;
  pathTunnelChances: number[] = null;
  branchTunnelChances: number[] = null;
  extraConnectionChance: number = 0;
  entrance_: Room = null;
  exit_: Room = null;
  shop: Room = null;
  mainPathRooms: ArrayList<Room> = null;
  multiConnections: ArrayList<Room> = null;
  singleConnections: ArrayList<Room> = null;
  _RegularBuilder(): this {
    this._Builder();
    this.pathVariance = 45;
    this.pathLength = 0.25;
    this.pathLenJitterChances = [0, 0, 0, 1];
    this.pathTunnelChances = [2, 2, 1];
    this.branchTunnelChances = [1, 1, 0];
    this.extraConnectionChance = Math.fround(0.3);
    this.entrance_ = null;
    this.exit_ = null;
    this.shop = null;
    this.mainPathRooms = new ArrayList();
    this.multiConnections = new ArrayList();
    this.singleConnections = new ArrayList();
    return this;
  }
  setPathVariance(var$: number): RegularBuilder {
    this.pathVariance = var$;
    return this;
  }
  setPathLength(len: number, jitter: number[]): RegularBuilder {
    this.pathLength = len;
    this.pathLenJitterChances = jitter;
    return this;
  }
  setTunnelLength(path: number[], branch: number[]): RegularBuilder {
    this.pathTunnelChances = path;
    this.branchTunnelChances = branch;
    return this;
  }
  setExtraConnectionChance(chance: number): RegularBuilder {
    this.extraConnectionChance = chance;
    return this;
  }
  setupRooms(rooms: ArrayList<Room>): void {
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      r.setEmpty();
    }
    this.entrance_ = this.exit_ = this.shop = null;
    this.mainPathRooms.clear();
    this.singleConnections.clear();
    this.multiConnections.clear();
    for (const $it1 = rooms.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if (r.isEntrance()) {
        this.entrance_ = r;
      } else if (r.isExit()) {
        this.exit_ = r;
      } else if (r instanceof ShopRoom && r.maxConnections(Room.ALL) === 1) {
        this.shop = r;
      } else if (r.maxConnections(Room.ALL) > 1) {
        this.multiConnections.add(r);
      } else if (r.maxConnections(Room.ALL) === 1) {
        this.singleConnections.add(r);
      }
    }
    this.weightRooms(this.multiConnections);
    Random.shuffle$List(this.multiConnections);
    this.multiConnections = new ArrayList(new LinkedHashSet(this.multiConnections));
    Random.shuffle$List(this.multiConnections);
    let roomsOnMainPath = ($J.d2i((Math.fround(this.multiConnections.size() * this.pathLength))) + Random.chances$floatArr(this.pathLenJitterChances)) | 0;
    while (roomsOnMainPath > 0 && !this.multiConnections.isEmpty()) {
      let r = this.multiConnections.removeAt(0);
      if (r instanceof StandardRoom) {
        roomsOnMainPath = (roomsOnMainPath - (r).sizeFactor()) | 0;
      } else {
        roomsOnMainPath--;
      }
      this.mainPathRooms.add(r);
    }
  }
  weightRooms(rooms: ArrayList<Room>): void {
    for (let r of $J.toArrayInto(rooms.toArray(), $J.newArray(0, null))) {
      if (r instanceof StandardRoom) {
        for (let i = 1; i < (r).connectionWeight(); i++) {
          rooms.add(r);
        }
      }
    }
  }
  createBranches(rooms: ArrayList<Room>, branchable: ArrayList<Room>, roomsToBranch: ArrayList<Room>, connChances: number[]): boolean {
    let i = 0;
    let angle: number;
    let tries: number;
    let curr: Room;
    let connectingRoomsThisBranch = new ArrayList();
    let failedBranchAttempts = 0;
    let connectionChances = connChances.slice();
    while (i < roomsToBranch.size()) {
      if (failedBranchAttempts > 100) {
        return false;
      }
      let r = roomsToBranch.get(i);
      connectingRoomsThisBranch.clear();
      do {
        curr = Random.element$Collection(branchable);
      } while (r instanceof SecretRoom && curr instanceof ConnectionRoom);
      let connectingRooms = Random.chances$floatArr(connectionChances);
      if (connectingRooms === -1) {
        connectionChances = connChances.slice();
        connectingRooms = Random.chances$floatArr(connectionChances);
      }
      connectionChances[connectingRooms]--;
      for (let j = 0; j < connectingRooms; j++) {
        let t = r instanceof SecretRoom ? new MazeConnectionRoom()._MazeConnectionRoom() : ConnectionRoom.createRoom();
        tries = 3;
        do {
          angle = Builder.placeRoom(rooms, curr, t, this.randomBranchAngle(curr));
          tries--;
        } while (angle === Math.fround(-1) && tries > 0);
        if (angle === Math.fround(-1)) {
          t.clearConnections();
          for (const $it2 = connectingRoomsThisBranch.iterator(); $it2.hasNext(); ) {
            let c = $it2.next();
            c.clearConnections();
            rooms.remove(c);
          }
          connectingRoomsThisBranch.clear();
          break;
        } else {
          connectingRoomsThisBranch.add(t);
          rooms.add(t);
        }
        curr = t;
      }
      if (connectingRoomsThisBranch.size() !== connectingRooms) {
        failedBranchAttempts++;
        continue;
      }
      tries = 10;
      do {
        angle = Builder.placeRoom(rooms, curr, r, this.randomBranchAngle(curr));
        tries--;
      } while (angle === Math.fround(-1) && tries > 0);
      if (angle === Math.fround(-1)) {
        r.clearConnections();
        for (const $it3 = connectingRoomsThisBranch.iterator(); $it3.hasNext(); ) {
          let t = $it3.next();
          t.clearConnections();
          rooms.remove(t);
        }
        connectingRoomsThisBranch.clear();
        failedBranchAttempts++;
        continue;
      }
      for (let j = 0; j < connectingRoomsThisBranch.size(); j++) {
        if (Random.Int$int(3) <= 1) {
          branchable.add(connectingRoomsThisBranch.get(j));
        }
      }
      if (r.maxConnections(Room.ALL) > 1 && Random.Int$int(3) === 0) {
        if (r instanceof StandardRoom) {
          for (let j = 0; j < (r).connectionWeight(); j++) {
            branchable.add(r);
          }
        } else {
          branchable.add(r);
        }
      }
      i++;
    }
    return true;
  }
  randomBranchAngle(r: Room): number {
    return Random.Float$float(360);
  }
}

$J.define(RegularBuilder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.RegularBuilder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder', ctors: { '': '_RegularBuilder' } });
$J.module(() => {
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  ConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom');
  MazeConnectionRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.MazeConnectionRoom');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  ShopRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ShopRoom');
  StandardRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom');
  Random = $J.load('com.watabou.utils.Random');
});
