// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/SmokeBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Bomb } from './Bomb.ts';

let Dungeon, Blob, SmokeScreen, GameScene, ItemSpriteSheet, BArray, PathFinder;

export class SmokeBomb extends Bomb {
  _SmokeBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.SMOKE_BOMB;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  explode(cell: number): void {
    super.explode(cell);
    let centerVolume = 1000;
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 40, $J.cls(SmokeScreen)));
        centerVolume = (centerVolume - 40) | 0;
      }
    }
    if (centerVolume > 0) {
      GameScene.add$Blob(Blob.seed$int$int$Class(cell, centerVolume, $J.cls(SmokeScreen)));
    }
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 40) | 0));
  }
}

$J.define(SmokeBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.SmokeBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_SmokeBomb' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  SmokeScreen = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SmokeScreen');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
