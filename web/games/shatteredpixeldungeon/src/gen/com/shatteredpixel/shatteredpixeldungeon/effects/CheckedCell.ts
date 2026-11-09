// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/CheckedCell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Dungeon, DungeonTilemap, TextureCache, Game;

export class CheckedCell extends Image {
  alpha_: number = 0;
  delay_: number = 0;
  _CheckedCell(): this {
    this._Image$Object(TextureCache.createSolid(-11162881));
    return this;
  }
  reset(pos: number, visSource: number): void {
    this.revive();
    this.origin.set$float(0.5);
    this.point$PointF(DungeonTilemap.tileToWorld(pos).offset$float$float(Math.fround($J.idiv(DungeonTilemap.SIZE, 2)), Math.fround($J.idiv(DungeonTilemap.SIZE, 2))));
    this.alpha_ = Math.fround(0.8);
    this.scale_.set$float(Math.fround(DungeonTilemap.SIZE * this.alpha_));
    this.delay_ = (Math.fround(Dungeon.level.trueDistance(pos, visSource) - 1));
    if (this.delay_ > Math.fround(0)) {
      this.delay_ = Math.fround(Math.fround($J.pow(this.delay_, Math.fround(0.67))) / 10);
      this.alpha$float(0);
    }
  }
  update(): void {
    if ((this.delay_ = Math.fround(this.delay_ - Game.elapsed)) > Math.fround(0)) {
      this.alpha$float(0);
    } else if ((this.alpha_ = Math.fround(this.alpha_ - Game.elapsed)) > Math.fround(0)) {
      this.alpha$float(this.alpha_);
      this.scale_.set$float(Math.fround(DungeonTilemap.SIZE * this.alpha_));
    } else {
      this.kill();
    }
  }
}

$J.define(CheckedCell, 'com.shatteredpixel.shatteredpixeldungeon.effects.CheckedCell', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_CheckedCell' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Game = $J.load('com.watabou.noosa.Game');
});
