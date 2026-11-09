// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretGardenRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Foliage, WandOfRegrowth$Dewcatcher$Seed, WandOfRegrowth$Seedpod$Seed, Patch, Terrain, Painter, Room$Door$Type, Starflower$Seed, Random;

export class SecretGardenRoom extends SecretRoom {
  _SecretGardenRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.GRASS);
    let grass = Patch.generate((this.width() - 2) | 0, (this.height() - 2) | 0, 0.5, 0, true);
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        if (grass[this.xyToPatchCoords(j, i)]) {
          (level.map_[(Math.imul(i, level.width()) + j) | 0]) = Terrain.HIGH_GRASS;
        }
      }
    }
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
    level.plant(new Starflower$Seed()._Starflower$Seed(), this.plantPos(level));
    level.plant(new WandOfRegrowth$Seedpod$Seed()._WandOfRegrowth$Seedpod$Seed(), this.plantPos(level));
    level.plant(new WandOfRegrowth$Dewcatcher$Seed()._WandOfRegrowth$Dewcatcher$Seed(), this.plantPos(level));
    if (Random.Int$int(2) === 0) {
      level.plant(new WandOfRegrowth$Seedpod$Seed()._WandOfRegrowth$Seedpod$Seed(), this.plantPos(level));
    } else {
      level.plant(new WandOfRegrowth$Dewcatcher$Seed()._WandOfRegrowth$Dewcatcher$Seed(), this.plantPos(level));
    }
    let light = level.blobs.get($J.cls(Foliage));
    if (light == null) {
      light = new Foliage()._Foliage();
    }
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        light.seed(level, (j + Math.imul(level.width(), i)) | 0, 1);
      }
    }
    level.blobs.put($J.cls(Foliage), light);
  }
  plantPos(level: Level): number {
    let pos: number;
    do {
      pos = level.pointToCell(this.random$());
    } while (level.plants.get(pos) != null);
    return pos;
  }
  xyToPatchCoords(x: number, y: number): number {
    return (x - this.left_ - 1 + (Math.imul(((y - this.top_ - 1) | 0), ((this.width() - 2) | 0)))) | 0;
  }
}

$J.define(SecretGardenRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretGardenRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretGardenRoom' } });
$J.module(() => {
  Foliage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Foliage');
  WandOfRegrowth$Dewcatcher$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Dewcatcher$Seed');
  WandOfRegrowth$Seedpod$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Seedpod$Seed');
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Random = $J.load('com.watabou.utils.Random');
});
