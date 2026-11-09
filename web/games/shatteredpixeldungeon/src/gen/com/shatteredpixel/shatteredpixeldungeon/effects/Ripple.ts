// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Ripple.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Effects, Effects$Type, DungeonTilemap, Game;

export class Ripple extends Image {
  static readonly TIME_TO_FADE: number = 0.5;
  time: number = 0;
  _Ripple(): this {
    this._Image$Image(Effects.get(Effects$Type.RIPPLE));
    return this;
  }
  reset(p: number): void {
    this.revive();
    this.x = Math.fround(Math.imul((p % Dungeon.level.width()), DungeonTilemap.SIZE));
    this.y = Math.fround(Math.imul(($J.idiv(p, Dungeon.level.width())), DungeonTilemap.SIZE));
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    this.scale_.set$float(0);
    this.time = Ripple.TIME_TO_FADE;
  }
  update(): void {
    super.update();
    if ((this.time = Math.fround(this.time - Game.elapsed)) <= Math.fround(0)) {
      this.kill();
    } else {
      let p = Math.fround(this.time / Ripple.TIME_TO_FADE);
      this.scale_.set$float(Math.fround(1 - p));
      this.alpha$float(p);
    }
  }
}

$J.define(Ripple, 'com.shatteredpixel.shatteredpixeldungeon.effects.Ripple', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_Ripple' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
});
