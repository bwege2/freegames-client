// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ToxicGasRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from './SpecialRoom.ts';
import { Blob } from '../../../actors/blobs/Blob.ts';
import { Trap } from '../../traps/Trap.ts';

let Dungeon, ToxicGas, Gold, Heap$Type, PotionOfPurity, TrinketCatalyst, Terrain, Painter, Room$Door$Type, Messages, GameScene;

export class ToxicGasRoom extends SpecialRoom {
  _ToxicGasRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.set$Level$Point$int(level, this.center(), Terrain.STATUE);
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let cell = level.pointToCell(p);
      if (level.map_[cell] === Terrain.EMPTY) {
        Blob.seed$int$int$Class$Level(cell, 30, $J.cls(ToxicGas), level);
      }
    }
    let traps = Math.min((this.width() - 2) | 0, (this.height() - 2) | 0);
    for (let i = 0; i < traps; i++) {
      let cell: number;
      do {
        cell = level.pointToCell(this.random$int(2));
      } while (level.map_[cell] !== Terrain.EMPTY);
      level.setTrap(new ToxicGasRoom$ToxicVent()._ToxicGasRoom$ToxicVent().reveal(), cell);
      Blob.seed$int$int$Class$Level(cell, 12, $J.cls(ToxicGasRoom$ToxicGasSeed), level);
      Painter.set$Level$int$int(level, cell, Terrain.INACTIVE_TRAP);
    }
    let goldPositions = new ArrayList();
    for (let i = 0; i < 8; i++) {
      let posToAdd: number;
      do {
        posToAdd = level.pointToCell(this.random$int(2));
      } while (level.map_[posToAdd] === Terrain.STATUE || goldPositions.contains(posToAdd));
      goldPositions.add(posToAdd);
    }
    let furthestPos = -1;
    let entryPos = level.pointToCell(this.entrance());
    for (const $it1 = goldPositions.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      if (furthestPos === -1 || level.trueDistance(entryPos, i) > level.trueDistance(entryPos, furthestPos)) {
        furthestPos = i;
      }
    }
    goldPositions.remove(furthestPos);
    let mainGold = new Gold()._Gold$().random();
    mainGold.quantity$int(Math.imul(mainGold.quantity$(), 2));
    level.drop(mainGold, furthestPos).type_ = Heap$Type.SKELETON;
    for (let i = 0; i < 2; i++) {
      let item = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
      if (item == null) {
        item = new Gold()._Gold$().random();
      }
      level.drop(item, goldPositions.removeAt(0)).type_ = Heap$Type.CHEST;
    }
    level.addItemToSpawn(new PotionOfPurity()._PotionOfPurity());
    this.entrance().set$Type(Room$Door$Type.REGULAR);
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    if (!super.canPlaceCharacter(p, l)) {
      return false;
    }
    let gas = l.blobs.get($J.cls(ToxicGas));
    return gas == null || gas.volume_ === 0 || gas.cur[l.pointToCell(p)] === 0;
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
}

export class ToxicGasRoom$ToxicGasSeed extends Blob {
  _ToxicGasRoom$ToxicGasSeed(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    let cell: number;
    let gas = Dungeon.level.blobs.get($J.cls(ToxicGas));
    for (let i = (this.area.top_ - 1) | 0; i <= this.area.bottom_; i++) {
      for (let j = (this.area.left_ - 1) | 0; j <= this.area.right_; j++) {
        cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
        if (Dungeon.level.insideMap(cell)) {
          if (Dungeon.level.map_[cell] !== Terrain.INACTIVE_TRAP) {
            this.off[cell] = 0;
            continue;
          }
          this.off[cell] = this.cur[cell];
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
          if (gas == null || gas.volume_ === 0) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, this.off[cell], $J.cls(ToxicGas)));
          } else if (gas.cur[cell] <= Math.imul(9, this.off[cell])) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, this.off[cell], $J.cls(ToxicGas)));
          }
        }
      }
    }
  }
}

export class ToxicGasRoom$ToxicVent extends Trap {
  _ToxicGasRoom$ToxicVent(): this {
    this._Trap();
    this.color_ = Trap.BLACK;
    this.shape = Trap.GRILL;
    this.canBeHidden = false;
    this.active = false;
    return this;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  activate(): void {
  }
}

$J.define(ToxicGasRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ToxicGasRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_ToxicGasRoom' } });
$J.define(ToxicGasRoom$ToxicGasSeed, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ToxicGasRoom$ToxicGasSeed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_ToxicGasRoom$ToxicGasSeed' } });
$J.define(ToxicGasRoom$ToxicVent, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ToxicGasRoom$ToxicVent', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_ToxicGasRoom$ToxicVent' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
