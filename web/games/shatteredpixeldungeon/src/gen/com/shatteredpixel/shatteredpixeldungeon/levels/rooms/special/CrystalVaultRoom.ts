// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalVaultRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from './SpecialRoom.ts';

let Challenges, Dungeon, CrystalMimic, Mimic, Generator, Generator$Category, Heap$Type, CrystalKey, IronKey, MimicTooth, RatSkull, Terrain, Painter, Room$Door$Type, PathFinder, Random;

export class CrystalVaultRoom extends SpecialRoom {
  prizeClasses: ArrayList<Generator$Category> = null;
  _CrystalVaultRoom(): this {
    this._SpecialRoom();
    this.prizeClasses = new ArrayList(Arrays.asList(Generator$Category.WAND, Generator$Category.RING, Generator$Category.ARTIFACT));
    return this;
  }
  minHeight(): number {
    return 7;
  }
  maxHeight(): number {
    return 7;
  }
  minWidth(): number {
    return 7;
  }
  maxWidth(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    let c = level.pointToCell(this.center());
    Random.shuffle$List(this.prizeClasses);
    let i1: Item;
    let i2: Item;
    i1 = this.prize();
    i2 = this.prize();
    let i1Pos: number;
    let i2Pos: number;
    let doorPos = level.pointToCell(this.entrance());
    do {
      let neighbourIdx = Random.Int$int(PathFinder.CIRCLE8.length);
      i1Pos = (c + PathFinder.CIRCLE8[neighbourIdx]) | 0;
      i2Pos = (c + PathFinder.CIRCLE8[((neighbourIdx + 4) | 0) % 8]) | 0;
    } while (level.adjacent(i1Pos, doorPos) || level.adjacent(i2Pos, doorPos));
    level.drop(i1, i1Pos).type_ = Heap$Type.CRYSTAL_CHEST;
    let altChance = Math.fround(Math.fround(1 / 10) * RatSkull.exoticChanceMultiplier$());
    if (altChance > Math.fround(0.1)) {
      altChance = Math.fround((Math.fround(altChance + Math.fround(0.1))) / 2);
    }
    altChance = Math.fround(altChance * MimicTooth.mimicChanceMultiplier$());
    if (Random.Float$() < altChance) {
      level.mobs.add(Mimic.spawnAt$int$Class$ItemArr(i2Pos, $J.cls(CrystalMimic), [i2]));
    } else {
      level.drop(i2, i2Pos).type_ = Heap$Type.CRYSTAL_CHEST;
    }
    Painter.set$Level$int$int(level, i1Pos, Terrain.PEDESTAL);
    Painter.set$Level$int$int(level, i2Pos, Terrain.PEDESTAL);
    level.addItemToSpawn(new CrystalKey()._CrystalKey$int(Dungeon.depth));
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  prize(): Item {
    let cat = this.prizeClasses.removeAt(0);
    this.prizeClasses.add(cat);
    let prize: Item;
    do {
      prize = Generator.random$Category(cat);
    } while (prize == null || Challenges.isItemBlocked(prize));
    return prize;
  }
}

$J.define(CrystalVaultRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalVaultRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_CrystalVaultRoom' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CrystalMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalMimic');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
