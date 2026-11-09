// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/GooBossRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { StandardRoom } from '../standard/StandardRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, DiamondGooRoom, ThickPillarsGooRoom, ThinPillarsGooRoom, WalledGooRoom, Random;

export class GooBossRoom extends StandardRoom {
  _GooBossRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return false;
  }
  static randomGooRoom(): GooBossRoom {
    switch (Random.Int$int(4)) {
      case 0:
      default:
        return new DiamondGooRoom()._DiamondGooRoom();
      case 1:
        return new WalledGooRoom()._WalledGooRoom();
      case 2:
        return new ThinPillarsGooRoom()._ThinPillarsGooRoom();
      case 3:
        return new ThickPillarsGooRoom()._ThickPillarsGooRoom();
    }
  }
  setupGooNest(level: Level): void {
    let nest = new GooBossRoom$GooNest()._GooBossRoom$GooNest();
    nest.setRect$int$int$int$int((this.left_ + $J.idiv(this.width(), 2) - 2) | 0, (this.top_ + $J.idiv(this.height(), 2) - 2) | 0, (4 + this.width() % 2) | 0, (4 + this.height() % 2) | 0);
    level.customTiles.add(nest);
  }
}

export class GooBossRoom$GooNest extends CustomTilemap {
  _GooBossRoom$GooNest(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.SEWER_BOSS;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let x = 0; x < this.tileW; x++) {
      for (let y = 0; y < this.tileH; y++) {
        if ((x === 0 || x === ((this.tileW - 1) | 0)) && (y === 0 || y === ((this.tileH - 1) | 0))) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = -1;
        } else if ((x === 1 && y === 0) || (x === 0 && y === 1)) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 0;
        } else if ((x === ((this.tileW - 2) | 0) && y === 0) || (x === ((this.tileW - 1) | 0) && y === 1)) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 1;
        } else if ((x === 1 && y === ((this.tileH - 1) | 0)) || (x === 0 && y === ((this.tileH - 2) | 0))) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 2;
        } else if ((x === ((this.tileW - 2) | 0) && y === ((this.tileH - 1) | 0)) || (x === ((this.tileW - 1) | 0) && y === ((this.tileH - 2) | 0))) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 3;
        } else if (x === 0) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 4;
        } else if (y === 0) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 5;
        } else if (x === ((this.tileW - 1) | 0)) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 6;
        } else if (y === ((this.tileH - 1) | 0)) {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 7;
        } else {
          (data[(x + Math.imul(this.tileW, y)) | 0]) = 8;
        }
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
}

$J.define(GooBossRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.GooBossRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_GooBossRoom' } });
$J.define(GooBossRoom$GooNest, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.GooBossRoom$GooNest', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_GooBossRoom$GooNest' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  DiamondGooRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.DiamondGooRoom');
  ThickPillarsGooRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.ThickPillarsGooRoom');
  ThinPillarsGooRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.ThinPillarsGooRoom');
  WalledGooRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.WalledGooRoom');
  Random = $J.load('com.watabou.utils.Random');
});
