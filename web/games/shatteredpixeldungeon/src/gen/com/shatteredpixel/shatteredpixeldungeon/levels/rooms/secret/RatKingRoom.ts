// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/RatKingRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SecretRoom } from './SecretRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, RatKing, Gold, Terrain, Painter, Room$Door$Type, SewerBossEntranceRoom, Messages, Carpet, Image, Random;

export class RatKingRoom extends SecretRoom {
  _RatKingRoom(): this {
    this._SecretRoom();
    return this;
  }
  canConnect$Room(r: Room): boolean {
    return !(r instanceof SewerBossEntranceRoom) && super.canConnect$Room(r);
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
  minWidth(): number {
    return 7;
  }
  maxWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  maxHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.HIDDEN);
    let door = level.pointToCell(entrance);
    let center = level.pointToCell(this.center());
    let w = level.width();
    let statuePositions = [(center - 2 - Math.imul(2, w)) | 0, (center - Math.imul(2, w)) | 0, (center + 2 - Math.imul(2, w)) | 0, (center + 2) | 0, (center + 2 + Math.imul(2, w)) | 0, (center + Math.imul(2, w)) | 0, (center - 2 + Math.imul(2, w)) | 0, (center - 2) | 0];
    for (let cell of statuePositions) {
      if (level.distance(door, cell) >= 2) {
        Painter.set$Level$int$int(level, cell, Terrain.CUSTOM_DECO);
      }
    }
    let c = new Carpet()._Carpet();
    c.setRect$int$int$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0, (this.width() - 4) | 0, (this.height() - 4) | 0);
    level.customTiles.add(c);
    let deco = new RatKingRoom$RatKingRoomDeco()._RatKingRoom$RatKingRoomDeco();
    deco.setRect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, (this.height() - 2) | 0);
    level.customTiles.add(deco);
    let statues = new RatKingRoom$RatKingStatues()._RatKingRoom$RatKingStatues();
    statues.setRect$int$int$int$int((this.left_ + 1) | 0, this.top_, (this.width() - 2) | 0, this.height());
    level.customTerrain.add(statues);
    let overhang = new RatKingRoom$StatueOverhang()._RatKingRoom$StatueOverhang();
    overhang.setRect$int$int$int$int((this.left_ + 1) | 0, this.top_, (this.width() - 2) | 0, this.height());
    level.customWalls.add(overhang);
    let king = new RatKing()._RatKing();
    king.pos = center;
    level.mobs.add(king);
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let cell = level.pointToCell(p);
      if (cell !== center && (level.map_[cell] === Terrain.EMPTY || level.map_[cell] === Terrain.EMPTY_SP)) {
        level.drop(new Gold()._Gold$int(Random.IntRange(5, 20)), cell);
      }
    }
  }
}

export class RatKingRoom$RatKingRoomDeco extends CustomTilemap {
  _RatKingRoom$RatKingRoomDeco(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.RAT_KING_ROOM;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let i = 0;
    for (let y = 0; y < this.tileH; y++) {
      let cell = (this.tileX + Math.imul(((this.tileY + y) | 0), Dungeon.level.width())) | 0;
      for (let x = 0; x < this.tileW; x++) {
        if (x === 2 && y === 2) {
          data[i] = 3;
        } else if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
          data[i] = 0;
        } else {
          data[i] = -1;
        }
        cell++;
        i++;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
      let img = new Image()._Image$Object(this.texture_);
      img.frame$int$int$int$int(64, 0, 16, 16);
      return img;
    } else {
      return super.image(tileX, tileY);
    }
  }
  name(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
      return Messages.get$Object$String$ObjectArr(this, 'statue_name', []);
    } else if (tileX === 2 && tileY === 2) {
      return Messages.get$Object$String$ObjectArr(this, 'pillow_name', []);
    } else {
      return super.name(tileX, tileY);
    }
  }
  desc(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
      return Messages.get$Object$String$ObjectArr(this, 'statue_desc', []);
    } else if (tileX === 2 && tileY === 2) {
      return Messages.get$Object$String$ObjectArr(this, 'pillow_desc', []);
    } else {
      return super.desc(tileX, tileY);
    }
  }
}

export class RatKingRoom$RatKingStatues extends CustomTilemap {
  _RatKingRoom$RatKingStatues(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.RAT_KING_ROOM;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let i = 0;
    for (let y = 0; y < this.tileH; y++) {
      let cell = (this.tileX + Math.imul(((this.tileY + y) | 0), Dungeon.level.width())) | 0;
      for (let x = 0; x < this.tileW; x++) {
        if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
          data[i] = 1;
        } else {
          data[i] = -1;
        }
        cell++;
        i++;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
}

export class RatKingRoom$StatueOverhang extends CustomTilemap {
  _RatKingRoom$StatueOverhang(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.RAT_KING_ROOM;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let i = 0;
    for (let y = 0; y < this.tileH; y++) {
      let cell = (this.tileX + Math.imul(((this.tileY + y) | 0), Dungeon.level.width())) | 0;
      for (let x = 0; x < this.tileW; x++) {
        if ((Dungeon.level.map_[(cell + Dungeon.level.width()) | 0]) === Terrain.CUSTOM_DECO) {
          data[i] = 2;
        } else {
          data[i] = -1;
        }
        cell++;
        i++;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
}

$J.define(RatKingRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.RatKingRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_RatKingRoom' }, meths: { 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room' } });
$J.define(RatKingRoom$RatKingRoomDeco, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.RatKingRoom$RatKingRoomDeco', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_RatKingRoom$RatKingRoomDeco' } });
$J.define(RatKingRoom$RatKingStatues, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.RatKingRoom$RatKingStatues', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_RatKingRoom$RatKingStatues' } });
$J.define(RatKingRoom$StatueOverhang, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.RatKingRoom$StatueOverhang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_RatKingRoom$StatueOverhang' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  RatKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SewerBossEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossEntranceRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Image = $J.load('com.watabou.noosa.Image');
  Random = $J.load('com.watabou.utils.Random');
});
