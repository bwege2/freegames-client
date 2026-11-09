// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/EntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { StandardRoom } from '../StandardRoom.ts';

let Dungeon, SPDSettings, GuidePage, Guidebook, Document, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type, CaveEntranceRoom, CavesFissureEntranceRoom, CellBlockEntranceRoom, ChasmBridgeEntranceRoom, ChasmEntranceRoom, CircleBasinEntranceRoom, HallwayEntranceRoom, LibraryHallEntranceRoom, LibraryRingEntranceRoom, PillarsEntranceRoom, RegionDecoBridgeEntranceRoom, RegionDecoLineEntranceRoom, RegionDecoPatchEntranceRoom, RingEntranceRoom, RitualEntranceRoom, RuinsEntranceRoom, StatuesEntranceRoom, WaterBridgeEntranceRoom, CircleWallEntranceRoom, Point, Random, Reflection;

export class EntranceRoom extends StandardRoom {
  static rooms: ArrayList<JClass<StandardRoom>> = null;
  static chances: number[][] = null;
  _EntranceRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 5);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 5);
  }
  isEntrance(): boolean {
    return true;
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    if (Dungeon.depth <= 2) {
      return false;
    } else {
      return super.canMerge(l, other, p, mergeTerrain);
    }
  }
  canPlaceTrap(p: Point): boolean {
    if (Dungeon.depth === 1) {
      return false;
    } else {
      return super.canPlaceTrap(p);
    }
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let entrance: number;
    do {
      entrance = level.pointToCell(this.random$int(2));
    } while (level.findMob(entrance) != null);
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE);
    if (Dungeon.depth === 1) {
      level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.SURFACE));
    } else {
      level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
    }
    EntranceRoom.placeEarlyGuidePages(level, this);
  }
  static placeEarlyGuidePages(level: Level, r: Room): void {
    Random.pushGenerator$();
    if (Dungeon.depth === 1 && (!Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_INTRO) || SPDSettings.intro$())) {
      let pos: number;
      do {
        pos = level.pointToCell(new Point()._Point$int$int(Random.IntRange((r.left_ + 1) | 0, (r.right_ - 1) | 0), Random.IntRange((r.top_ + 1) | 0, (r.bottom_ - 2) | 0)));
      } while (pos === level.entrance() || level.map_[pos] === Terrain.REGION_DECO);
      level.drop(new Guidebook()._Guidebook(), pos);
      Document.ADVENTURERS_GUIDE.deletePage$String(Document.GUIDE_INTRO);
    }
    if (Dungeon.depth === 2 && !Document.ADVENTURERS_GUIDE.isPageFound$String(Document.GUIDE_SEARCHING)) {
      let pos: number;
      do {
        pos = level.pointToCell(new Point()._Point$int$int(Random.IntRange((r.left_ + 1) | 0, (r.right_ - 1) | 0), Random.IntRange((r.top_ + 1) | 0, (r.bottom_ - 2) | 0)));
      } while (pos === level.entrance() || level.map_[pos] === Terrain.REGION_DECO);
      let p = new GuidePage()._GuidePage();
      p.page$String(Document.GUIDE_SEARCHING);
      level.drop(p, pos);
    }
    Random.popGenerator();
  }
  static createEntrance(): StandardRoom {
    return Reflection.newInstance(EntranceRoom.rooms.get(Random.chances$floatArr(EntranceRoom.chances[Dungeon.depth])));
  }
  static $clinit() {
    EntranceRoom.rooms = new ArrayList();
    EntranceRoom.rooms.add($J.cls(WaterBridgeEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RegionDecoPatchEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RingEntranceRoom));
    EntranceRoom.rooms.add($J.cls(CircleBasinEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RegionDecoLineEntranceRoom));
    EntranceRoom.rooms.add($J.cls(ChasmBridgeEntranceRoom));
    EntranceRoom.rooms.add($J.cls(PillarsEntranceRoom));
    EntranceRoom.rooms.add($J.cls(CellBlockEntranceRoom));
    EntranceRoom.rooms.add($J.cls(CaveEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RegionDecoBridgeEntranceRoom));
    EntranceRoom.rooms.add($J.cls(CavesFissureEntranceRoom));
    EntranceRoom.rooms.add($J.cls(CircleWallEntranceRoom));
    EntranceRoom.rooms.add($J.cls(HallwayEntranceRoom));
    EntranceRoom.rooms.add($J.cls(StatuesEntranceRoom));
    EntranceRoom.rooms.add($J.cls(LibraryHallEntranceRoom));
    EntranceRoom.rooms.add($J.cls(LibraryRingEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RegionDecoPatchEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RuinsEntranceRoom));
    EntranceRoom.rooms.add($J.cls(ChasmEntranceRoom));
    EntranceRoom.rooms.add($J.cls(RitualEntranceRoom));
    EntranceRoom.chances = $J.newArray(27, null);
    EntranceRoom.chances[1] = [4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    EntranceRoom.chances[2] = EntranceRoom.chances[1];
    EntranceRoom.chances[3] = [4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    EntranceRoom.chances[5] = EntranceRoom.chances[4] = EntranceRoom.chances[3];
    EntranceRoom.chances[6] = [0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    EntranceRoom.chances[10] = EntranceRoom.chances[9] = EntranceRoom.chances[8] = EntranceRoom.chances[7] = EntranceRoom.chances[6];
    EntranceRoom.chances[11] = [0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    EntranceRoom.chances[15] = EntranceRoom.chances[14] = EntranceRoom.chances[13] = EntranceRoom.chances[12] = EntranceRoom.chances[11];
    EntranceRoom.chances[16] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0];
    EntranceRoom.chances[20] = EntranceRoom.chances[19] = EntranceRoom.chances[18] = EntranceRoom.chances[17] = EntranceRoom.chances[16];
    EntranceRoom.chances[21] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1];
    EntranceRoom.chances[26] = EntranceRoom.chances[25] = EntranceRoom.chances[24] = EntranceRoom.chances[23] = EntranceRoom.chances[22] = EntranceRoom.chances[21];
  }
}

$J.define(EntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_EntranceRoom' }, clinit: true, lazy: ['rooms', 'chances'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  GuidePage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.GuidePage');
  Guidebook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.Guidebook');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  CaveEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.CaveEntranceRoom');
  CavesFissureEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.CavesFissureEntranceRoom');
  CellBlockEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.CellBlockEntranceRoom');
  ChasmBridgeEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.ChasmBridgeEntranceRoom');
  ChasmEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.ChasmEntranceRoom');
  CircleBasinEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.CircleBasinEntranceRoom');
  HallwayEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.HallwayEntranceRoom');
  LibraryHallEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.LibraryHallEntranceRoom');
  LibraryRingEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.LibraryRingEntranceRoom');
  PillarsEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.PillarsEntranceRoom');
  RegionDecoBridgeEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RegionDecoBridgeEntranceRoom');
  RegionDecoLineEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RegionDecoLineEntranceRoom');
  RegionDecoPatchEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RegionDecoPatchEntranceRoom');
  RingEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RingEntranceRoom');
  RitualEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RitualEntranceRoom');
  RuinsEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RuinsEntranceRoom');
  StatuesEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.StatuesEntranceRoom');
  WaterBridgeEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.WaterBridgeEntranceRoom');
  CircleWallEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CircleWallEntranceRoom');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
