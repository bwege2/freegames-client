// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SpecialRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Exception } from '../../../../../../../jre/index.ts';
import { Room } from '../Room.ts';

let Dungeon, Dungeon$LimitedDrops, ArmoryRoom, CryptRoom, CrystalChoiceRoom, CrystalPathRoom, CrystalVaultRoom, GardenRoom, LaboratoryRoom, LibraryRoom, MagicWellRoom, MagicalFireRoom, PitRoom, PoolRoom, RunestoneRoom, SacrificeRoom, SentryRoom, StatueRoom, StorageRoom, ToxicGasRoom, TrapsRoom, TreasuryRoom, WeakFloorRoom, Game, Random, Reflection;

export class SpecialRoom extends Room {
  entrance_: Room$Door = null;
  static readonly ENTRANCE: string = 'entrance';
  static EQUIP_SPECIALS: ArrayList<JClass<SpecialRoom>> = null;
  static CONSUMABLE_SPECIALS: ArrayList<JClass<SpecialRoom>> = null;
  static CRYSTAL_KEY_SPECIALS: ArrayList<JClass<SpecialRoom>> = null;
  static POTION_SPAWN_ROOMS: ArrayList<JClass<SpecialRoom>> = null;
  static runSpecials: ArrayList<JClass<Room>> = null;
  static floorSpecials: ArrayList<JClass<Room>> = null;
  static pitNeededDepth: number = 0;
  static readonly ROOMS: string = 'special_rooms';
  static readonly PIT: string = 'pit_needed';
  _SpecialRoom(): this {
    this._Room$();
    return this;
  }
  minWidth(): number {
    return 5;
  }
  maxWidth(): number {
    return 10;
  }
  minHeight(): number {
    return 5;
  }
  maxHeight(): number {
    return 10;
  }
  maxConnections(direction: number): number {
    return 1;
  }
  entrance(): Room$Door {
    if (this.entrance_ == null) {
      if (this.connected_.isEmpty()) {
        return null;
      } else {
        this.entrance_ = this.connected_.values().iterator().next();
      }
    }
    return this.entrance_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.entrance() != null) {
      bundle.put$String$Bundlable(SpecialRoom.ENTRANCE, this.entrance());
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(SpecialRoom.ENTRANCE)) {
      this.entrance_ = bundle.get$String(SpecialRoom.ENTRANCE);
    }
  }
  static initForRun(): void {
    SpecialRoom.runSpecials = new ArrayList();
    let runEquipSpecials = SpecialRoom.EQUIP_SPECIALS.clone();
    let runConsSpecials = SpecialRoom.CONSUMABLE_SPECIALS.clone();
    Random.shuffle$List(runEquipSpecials);
    Random.shuffle$List(runConsSpecials);
    SpecialRoom.runSpecials.add(runConsSpecials.removeAt(0));
    while (!runEquipSpecials.isEmpty() || !runConsSpecials.isEmpty()) {
      if (!runEquipSpecials.isEmpty()) {
        SpecialRoom.runSpecials.add(runEquipSpecials.removeAt(0));
      }
      if (!runConsSpecials.isEmpty()) {
        SpecialRoom.runSpecials.add(runConsSpecials.removeAt(0));
      }
    }
    SpecialRoom.pitNeededDepth = -1;
  }
  static initForFloor(): void {
    SpecialRoom.floorSpecials = SpecialRoom.runSpecials.clone();
    if (Dungeon.labRoomNeeded()) {
      Dungeon$LimitedDrops.LAB_ROOM.count_++;
      SpecialRoom.floorSpecials.add(0, $J.cls(LaboratoryRoom));
    }
  }
  static useType(type$: JClass<Room>): void {
    SpecialRoom.floorSpecials.remove(type$);
    if (SpecialRoom.CRYSTAL_KEY_SPECIALS.contains(type$)) {
      SpecialRoom.floorSpecials.removeAll(SpecialRoom.CRYSTAL_KEY_SPECIALS);
    }
    if (SpecialRoom.POTION_SPAWN_ROOMS.contains(type$)) {
      SpecialRoom.floorSpecials.removeAll(SpecialRoom.POTION_SPAWN_ROOMS);
    }
    if (SpecialRoom.runSpecials.remove(type$)) {
      SpecialRoom.runSpecials.add(type$);
    }
  }
  static resetPitRoom(depth: number): void {
    if (SpecialRoom.pitNeededDepth === depth) {
      SpecialRoom.pitNeededDepth = -1;
    }
  }
  static createRoom(): SpecialRoom {
    if (Dungeon.depth === SpecialRoom.pitNeededDepth) {
      SpecialRoom.pitNeededDepth = -1;
      SpecialRoom.useType($J.cls(PitRoom));
      return new PitRoom()._PitRoom();
    } else if (SpecialRoom.floorSpecials.contains($J.cls(LaboratoryRoom))) {
      SpecialRoom.useType($J.cls(LaboratoryRoom));
      return new LaboratoryRoom()._LaboratoryRoom();
    } else {
      if (Dungeon.bossLevel$int((Dungeon.depth + 1) | 0)) {
        SpecialRoom.floorSpecials.remove($J.cls(WeakFloorRoom));
      }
      let index = Random.chances$floatArr([6, 3, 1]);
      while (index >= SpecialRoom.floorSpecials.size()) {
        index--;
      }
      let r = Reflection.newInstance(SpecialRoom.floorSpecials.get(index));
      if (r instanceof WeakFloorRoom) {
        SpecialRoom.pitNeededDepth = (Dungeon.depth + 1) | 0;
      }
      SpecialRoom.useType(r.getClass());
      return r;
    }
  }
  static restoreRoomsFromBundle(bundle: Bundle): void {
    SpecialRoom.runSpecials.clear();
    if (bundle.contains(SpecialRoom.ROOMS)) {
      for (let type$ of bundle.getClassArray(SpecialRoom.ROOMS)) {
        SpecialRoom.runSpecials.add(type$);
      }
    } else {
      SpecialRoom.initForRun();
      Game.reportException(new Exception('specials array didn\'t exist!'));
    }
    SpecialRoom.pitNeededDepth = bundle.getInt(SpecialRoom.PIT);
  }
  static storeRoomsInBundle(bundle: Bundle): void {
    bundle.put$String$ClassArr(SpecialRoom.ROOMS, $J.toArrayInto(SpecialRoom.runSpecials.toArray(), $J.newArray(0, null)));
    bundle.put$String$int(SpecialRoom.PIT, SpecialRoom.pitNeededDepth);
  }
  static $clinit() {
    SpecialRoom.EQUIP_SPECIALS = new ArrayList(Arrays.asList($J.cls(WeakFloorRoom), $J.cls(CryptRoom), $J.cls(PoolRoom), $J.cls(ArmoryRoom), $J.cls(SentryRoom), $J.cls(StatueRoom), $J.cls(CrystalVaultRoom), $J.cls(CrystalChoiceRoom), $J.cls(SacrificeRoom)));
    SpecialRoom.CONSUMABLE_SPECIALS = new ArrayList(Arrays.asList($J.cls(RunestoneRoom), $J.cls(GardenRoom), $J.cls(LibraryRoom), $J.cls(StorageRoom), $J.cls(TreasuryRoom), $J.cls(MagicWellRoom), $J.cls(ToxicGasRoom), $J.cls(MagicalFireRoom), $J.cls(TrapsRoom), $J.cls(CrystalPathRoom)));
    SpecialRoom.CRYSTAL_KEY_SPECIALS = new ArrayList(Arrays.asList($J.cls(PitRoom), $J.cls(CrystalVaultRoom), $J.cls(CrystalChoiceRoom), $J.cls(CrystalPathRoom)));
    SpecialRoom.POTION_SPAWN_ROOMS = new ArrayList(Arrays.asList($J.cls(PoolRoom), $J.cls(SentryRoom), $J.cls(StorageRoom), $J.cls(ToxicGasRoom), $J.cls(MagicalFireRoom), $J.cls(TrapsRoom)));
    SpecialRoom.runSpecials = new ArrayList();
    SpecialRoom.floorSpecials = new ArrayList();
    SpecialRoom.pitNeededDepth = -1;
  }
}

$J.define(SpecialRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room', ctors: { '': '_SpecialRoom' }, clinit: true, lazy: ['EQUIP_SPECIALS', 'CONSUMABLE_SPECIALS', 'CRYSTAL_KEY_SPECIALS', 'POTION_SPAWN_ROOMS', 'runSpecials', 'floorSpecials', 'pitNeededDepth'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  ArmoryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ArmoryRoom');
  CryptRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CryptRoom');
  CrystalChoiceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalChoiceRoom');
  CrystalPathRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalPathRoom');
  CrystalVaultRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalVaultRoom');
  GardenRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.GardenRoom');
  LaboratoryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.LaboratoryRoom');
  LibraryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.LibraryRoom');
  MagicWellRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicWellRoom');
  MagicalFireRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom');
  PitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PitRoom');
  PoolRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PoolRoom');
  RunestoneRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.RunestoneRoom');
  SacrificeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SacrificeRoom');
  SentryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SentryRoom');
  StatueRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StatueRoom');
  StorageRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StorageRoom');
  ToxicGasRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ToxicGasRoom');
  TrapsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TrapsRoom');
  TreasuryRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TreasuryRoom');
  WeakFloorRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
