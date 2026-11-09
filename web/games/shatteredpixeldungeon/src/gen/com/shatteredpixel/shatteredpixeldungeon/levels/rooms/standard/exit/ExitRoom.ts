// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/ExitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type, CaveExitRoom, CavesFissureExitRoom, CellBlockExitRoom, ChasmBridgeExitRoom, ChasmExitRoom, CircleBasinExitRoom, CircleWallExitRoom, HallwayExitRoom, LibraryHallExitRoom, LibraryRingExitRoom, PillarsExitRoom, RegionDecoBridgeExitRoom, RegionDecoLineExitRoom, RegionDecoPatchExitRoom, RingExitRoom, RitualExitRoom, RuinsExitRoom, StatuesExitRoom, WaterBridgeExitRoom, Random, Reflection;

export class ExitRoom extends StandardRoom {
  static rooms: ArrayList<JClass<StandardRoom>> = null;
  static chances: number[][] = null;
  _ExitRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 5);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 5);
  }
  isExit(): boolean {
    return true;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let exit = level.pointToCell(this.random$int(2));
    Painter.set$Level$int$int(level, exit, Terrain.EXIT);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, exit, LevelTransition$Type.REGULAR_EXIT));
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.pointToCell(p) !== l.exit();
  }
  static createExit(): StandardRoom {
    return Reflection.newInstance(ExitRoom.rooms.get(Random.chances$floatArr(ExitRoom.chances[Dungeon.depth])));
  }
  static $clinit() {
    ExitRoom.rooms = new ArrayList();
    ExitRoom.rooms.add($J.cls(WaterBridgeExitRoom));
    ExitRoom.rooms.add($J.cls(RegionDecoPatchExitRoom));
    ExitRoom.rooms.add($J.cls(RingExitRoom));
    ExitRoom.rooms.add($J.cls(CircleBasinExitRoom));
    ExitRoom.rooms.add($J.cls(RegionDecoLineExitRoom));
    ExitRoom.rooms.add($J.cls(ChasmBridgeExitRoom));
    ExitRoom.rooms.add($J.cls(PillarsExitRoom));
    ExitRoom.rooms.add($J.cls(CellBlockExitRoom));
    ExitRoom.rooms.add($J.cls(CaveExitRoom));
    ExitRoom.rooms.add($J.cls(RegionDecoBridgeExitRoom));
    ExitRoom.rooms.add($J.cls(CavesFissureExitRoom));
    ExitRoom.rooms.add($J.cls(CircleWallExitRoom));
    ExitRoom.rooms.add($J.cls(HallwayExitRoom));
    ExitRoom.rooms.add($J.cls(StatuesExitRoom));
    ExitRoom.rooms.add($J.cls(LibraryHallExitRoom));
    ExitRoom.rooms.add($J.cls(LibraryRingExitRoom));
    ExitRoom.rooms.add($J.cls(RegionDecoPatchExitRoom));
    ExitRoom.rooms.add($J.cls(RuinsExitRoom));
    ExitRoom.rooms.add($J.cls(ChasmExitRoom));
    ExitRoom.rooms.add($J.cls(RitualExitRoom));
    ExitRoom.chances = $J.newArray(27, null);
    ExitRoom.chances[1] = [4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    ExitRoom.chances[2] = [4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    ExitRoom.chances[5] = ExitRoom.chances[4] = ExitRoom.chances[3] = ExitRoom.chances[2];
    ExitRoom.chances[6] = [0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    ExitRoom.chances[10] = ExitRoom.chances[9] = ExitRoom.chances[8] = ExitRoom.chances[7] = ExitRoom.chances[6];
    ExitRoom.chances[11] = [0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    ExitRoom.chances[15] = ExitRoom.chances[14] = ExitRoom.chances[13] = ExitRoom.chances[12] = ExitRoom.chances[11];
    ExitRoom.chances[16] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1, 0, 0, 0, 0];
    ExitRoom.chances[20] = ExitRoom.chances[19] = ExitRoom.chances[18] = ExitRoom.chances[17] = ExitRoom.chances[16];
    ExitRoom.chances[21] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 3, 2, 1];
    ExitRoom.chances[26] = ExitRoom.chances[25] = ExitRoom.chances[24] = ExitRoom.chances[23] = ExitRoom.chances[22] = ExitRoom.chances[21];
  }
}

$J.define(ExitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ExitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_ExitRoom' }, clinit: true, lazy: ['rooms', 'chances'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  CaveExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CaveExitRoom');
  CavesFissureExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CavesFissureExitRoom');
  CellBlockExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CellBlockExitRoom');
  ChasmBridgeExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ChasmBridgeExitRoom');
  ChasmExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ChasmExitRoom');
  CircleBasinExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CircleBasinExitRoom');
  CircleWallExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CircleWallExitRoom');
  HallwayExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.HallwayExitRoom');
  LibraryHallExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.LibraryHallExitRoom');
  LibraryRingExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.LibraryRingExitRoom');
  PillarsExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.PillarsExitRoom');
  RegionDecoBridgeExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RegionDecoBridgeExitRoom');
  RegionDecoLineExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RegionDecoLineExitRoom');
  RegionDecoPatchExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RegionDecoPatchExitRoom');
  RingExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RingExitRoom');
  RitualExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RitualExitRoom');
  RuinsExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RuinsExitRoom');
  StatuesExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.StatuesExitRoom');
  WaterBridgeExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.WaterBridgeExitRoom');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
