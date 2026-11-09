// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StandardRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum } from '../../../../../../../jre/index.ts';
import { Room } from '../Room.ts';

let Dungeon, Terrain, AquariumRoom, BurnedRoom, CaveRoom, CavesFissureRoom, CellBlockRoom, ChasmBridgeRoom, ChasmRoom, CircleBasinRoom, CirclePitRoom, CircleWallRoom, FissureRoom, GrassyGraveRoom, HallwayRoom, LibraryHallRoom, LibraryRingRoom, MinefieldRoom, PillarsRoom, PlantsRoom, PlatformRoom, RegionDecoBridgeRoom, RegionDecoLineRoom, RegionDecoPatchRoom, RingRoom, RitualRoom, RuinsRoom, SegmentedLibraryRoom, SegmentedRoom, SewerPipeRoom, SkullsRoom, StatuesRoom, StripedRoom, StudyRoom, SuspiciousChestRoom, WaterBridgeRoom, Random, Reflection;

export class StandardRoom extends Room {
  sizeCat: StandardRoom$SizeCategory = null;
  static rooms: ArrayList<JClass<StandardRoom>> = null;
  static chances: number[][] = null;
  _StandardRoom(): this {
    this._Room$();
    this.setSizeCat$();
    return this;
  }
  sizeCatProbs(): number[] {
    return [1, 0, 0];
  }
  setSizeCat$(): boolean {
    return this.setSizeCat$int$int(0, (StandardRoom$SizeCategory.values().length - 1) | 0);
  }
  setSizeCat$int(maxRoomValue: number): boolean {
    return this.setSizeCat$int$int(0, (maxRoomValue - 1) | 0);
  }
  setSizeCat$int$int(minOrdinal: number, maxOrdinal: number): boolean {
    let probs = this.sizeCatProbs();
    let categories = StandardRoom$SizeCategory.values();
    if (probs.length !== categories.length) {
      return false;
    }
    for (let i = 0; i < minOrdinal; i++) {
      probs[i] = 0;
    }
    for (let i = (maxOrdinal + 1) | 0; i < categories.length; i++) {
      probs[i] = 0;
    }
    let ordinal = Random.chances$floatArr(probs);
    if (ordinal !== -1) {
      this.sizeCat = categories[ordinal];
      return true;
    } else {
      return false;
    }
  }
  minWidth(): number {
    return this.sizeCat.minDim;
  }
  maxWidth(): number {
    return this.sizeCat.maxDim;
  }
  minHeight(): number {
    return this.sizeCat.minDim;
  }
  maxHeight(): number {
    return this.sizeCat.maxDim;
  }
  sizeFactor(): number {
    return this.sizeCat.roomValue;
  }
  mobSpawnWeight(): number {
    if (this.isEntrance()) {
      return 1;
    }
    return this.sizeFactor();
  }
  connectionWeight(): number {
    return Math.imul(this.sizeFactor(), this.sizeFactor());
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    let cell = l.pointToCell(this.pointInside(p, 1));
    return (Terrain.flags[l.map_[cell]] & Terrain.SOLID) === 0;
  }
  static createRoom(): StandardRoom {
    return Reflection.newInstance(StandardRoom.rooms.get(Random.chances$floatArr(StandardRoom.chances[Dungeon.depth])));
  }
  static $clinit() {
    StandardRoom.rooms = new ArrayList();
    StandardRoom.rooms.add($J.cls(SewerPipeRoom));
    StandardRoom.rooms.add($J.cls(RingRoom));
    StandardRoom.rooms.add($J.cls(WaterBridgeRoom));
    StandardRoom.rooms.add($J.cls(RegionDecoPatchRoom));
    StandardRoom.rooms.add($J.cls(CircleBasinRoom));
    StandardRoom.rooms.add($J.cls(RegionDecoLineRoom));
    StandardRoom.rooms.add($J.cls(SegmentedRoom));
    StandardRoom.rooms.add($J.cls(PillarsRoom));
    StandardRoom.rooms.add($J.cls(ChasmBridgeRoom));
    StandardRoom.rooms.add($J.cls(CellBlockRoom));
    StandardRoom.rooms.add($J.cls(CaveRoom));
    StandardRoom.rooms.add($J.cls(RegionDecoBridgeRoom));
    StandardRoom.rooms.add($J.cls(CavesFissureRoom));
    StandardRoom.rooms.add($J.cls(CirclePitRoom));
    StandardRoom.rooms.add($J.cls(CircleWallRoom));
    StandardRoom.rooms.add($J.cls(HallwayRoom));
    StandardRoom.rooms.add($J.cls(LibraryHallRoom));
    StandardRoom.rooms.add($J.cls(LibraryRingRoom));
    StandardRoom.rooms.add($J.cls(StatuesRoom));
    StandardRoom.rooms.add($J.cls(SegmentedLibraryRoom));
    StandardRoom.rooms.add($J.cls(RuinsRoom));
    StandardRoom.rooms.add($J.cls(RegionDecoPatchRoom));
    StandardRoom.rooms.add($J.cls(ChasmRoom));
    StandardRoom.rooms.add($J.cls(SkullsRoom));
    StandardRoom.rooms.add($J.cls(RitualRoom));
    StandardRoom.rooms.add($J.cls(PlantsRoom));
    StandardRoom.rooms.add($J.cls(AquariumRoom));
    StandardRoom.rooms.add($J.cls(PlatformRoom));
    StandardRoom.rooms.add($J.cls(BurnedRoom));
    StandardRoom.rooms.add($J.cls(FissureRoom));
    StandardRoom.rooms.add($J.cls(GrassyGraveRoom));
    StandardRoom.rooms.add($J.cls(StripedRoom));
    StandardRoom.rooms.add($J.cls(StudyRoom));
    StandardRoom.rooms.add($J.cls(SuspiciousChestRoom));
    StandardRoom.rooms.add($J.cls(MinefieldRoom));
    StandardRoom.chances = $J.newArray(27, null);
    StandardRoom.chances[1] = [16, 8, 8, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0];
    StandardRoom.chances[2] = [16, 8, 8, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    StandardRoom.chances[4] = StandardRoom.chances[3] = StandardRoom.chances[2];
    StandardRoom.chances[5] = [16, 8, 8, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    StandardRoom.chances[6] = [0, 0, 0, 0, 0, 10, 10, 10, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    StandardRoom.chances[10] = StandardRoom.chances[9] = StandardRoom.chances[8] = StandardRoom.chances[7] = StandardRoom.chances[6];
    StandardRoom.chances[11] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 8, 8, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    StandardRoom.chances[15] = StandardRoom.chances[14] = StandardRoom.chances[13] = StandardRoom.chances[12] = StandardRoom.chances[11];
    StandardRoom.chances[16] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 5, 5, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    StandardRoom.chances[20] = StandardRoom.chances[19] = StandardRoom.chances[18] = StandardRoom.chances[17] = StandardRoom.chances[16];
    StandardRoom.chances[21] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    StandardRoom.chances[26] = StandardRoom.chances[25] = StandardRoom.chances[24] = StandardRoom.chances[23] = StandardRoom.chances[22] = StandardRoom.chances[21];
  }
}

export class StandardRoom$SizeCategory extends JEnum {
  minDim: number = 0;
  maxDim: number = 0;
  roomValue: number = 0;
  static NORMAL: StandardRoom$SizeCategory = null;
  static LARGE: StandardRoom$SizeCategory = null;
  static GIANT: StandardRoom$SizeCategory = null;
  static $VALUES: StandardRoom$SizeCategory[] = null;
  _StandardRoom$SizeCategory($name: string, $ordinal: number, min: number, max: number, val: number): this {
    this._JEnum($name, $ordinal);
    this.minDim = min;
    this.maxDim = max;
    this.roomValue = val;
    return this;
  }
  static values(): StandardRoom$SizeCategory[] { return StandardRoom$SizeCategory.$VALUES.slice(); }
  static valueOf(name: string): StandardRoom$SizeCategory { return $J.enumValueOf(StandardRoom$SizeCategory, name); }
  static $clinit() {
    StandardRoom$SizeCategory.NORMAL = new StandardRoom$SizeCategory()._StandardRoom$SizeCategory('NORMAL', 0, 4, 10, 1);
    StandardRoom$SizeCategory.LARGE = new StandardRoom$SizeCategory()._StandardRoom$SizeCategory('LARGE', 1, 10, 14, 2);
    StandardRoom$SizeCategory.GIANT = new StandardRoom$SizeCategory()._StandardRoom$SizeCategory('GIANT', 2, 14, 18, 3);
    StandardRoom$SizeCategory.$VALUES = [StandardRoom$SizeCategory.NORMAL, StandardRoom$SizeCategory.LARGE, StandardRoom$SizeCategory.GIANT];
  }
}

$J.define(StandardRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room', ctors: { '': '_StandardRoom' }, meths: { 'setSizeCat(int,int)': 'setSizeCat$int$int', 'setSizeCat(int)': 'setSizeCat$int', 'setSizeCat()': 'setSizeCat$' }, clinit: true, lazy: ['rooms', 'chances'] });
$J.define(StandardRoom$SizeCategory, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int,int,int': '_StandardRoom$SizeCategory' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'LARGE', 'GIANT'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  AquariumRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.AquariumRoom');
  BurnedRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.BurnedRoom');
  CaveRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom');
  CavesFissureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CavesFissureRoom');
  CellBlockRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CellBlockRoom');
  ChasmBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ChasmBridgeRoom');
  ChasmRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ChasmRoom');
  CircleBasinRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CircleBasinRoom');
  CirclePitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CirclePitRoom');
  CircleWallRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CircleWallRoom');
  FissureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.FissureRoom');
  GrassyGraveRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.GrassyGraveRoom');
  HallwayRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.HallwayRoom');
  LibraryHallRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.LibraryHallRoom');
  LibraryRingRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.LibraryRingRoom');
  MinefieldRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.MinefieldRoom');
  PillarsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PillarsRoom');
  PlantsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PlantsRoom');
  PlatformRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PlatformRoom');
  RegionDecoBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RegionDecoBridgeRoom');
  RegionDecoLineRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RegionDecoLineRoom');
  RegionDecoPatchRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RegionDecoPatchRoom');
  RingRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RingRoom');
  RitualRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RitualRoom');
  RuinsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RuinsRoom');
  SegmentedLibraryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SegmentedLibraryRoom');
  SegmentedRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SegmentedRoom');
  SewerPipeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SewerPipeRoom');
  SkullsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SkullsRoom');
  StatuesRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StatuesRoom');
  StripedRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StripedRoom');
  StudyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StudyRoom');
  SuspiciousChestRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SuspiciousChestRoom');
  WaterBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.WaterBridgeRoom');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
