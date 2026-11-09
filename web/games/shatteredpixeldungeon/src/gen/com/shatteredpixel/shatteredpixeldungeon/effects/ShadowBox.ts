// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/ShadowBox.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { NinePatch } from '../../../watabou/noosa/NinePatch.ts';

let Assets$Interfaces, Texture;

export class ShadowBox extends NinePatch {
  static readonly SIZE: number = 16;
  _ShadowBox(): this {
    this._NinePatch$Object$int(Assets$Interfaces.SHADOW, 1);
    if (this.texture_.id_ === -1) {
      this.texture_.filter(Texture.LINEAR, Texture.LINEAR);
    }
    this.scale_.set$float$float(ShadowBox.SIZE, ShadowBox.SIZE);
    return this;
  }
  size(width: number, height: number): void {
    super.size(Math.fround(width / ShadowBox.SIZE), Math.fround(height / ShadowBox.SIZE));
  }
  boxRect(x: number, y: number, width: number, height: number): void {
    this.x = Math.fround(x - ShadowBox.SIZE);
    this.y = Math.fround(y - ShadowBox.SIZE);
    this.size(Math.fround(width + Math.fround(ShadowBox.SIZE * 2)), Math.fround(height + Math.fround(ShadowBox.SIZE * 2)));
  }
}

$J.define(ShadowBox, 'com.shatteredpixel.shatteredpixeldungeon.effects.ShadowBox', { kind: 'class', sup: 'com.watabou.noosa.NinePatch', ctors: { '': '_ShadowBox' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Texture = $J.load('com.watabou.glwrap.Texture');
});
