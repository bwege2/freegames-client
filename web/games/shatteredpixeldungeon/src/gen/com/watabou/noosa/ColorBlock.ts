// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/ColorBlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { Image } from './Image.ts';

let TextureCache;

export class ColorBlock extends Image {
  _ColorBlock(width: number, height: number, color: number): this {
    this._Image$Object(TextureCache.createSolid(color));
    this.scale_.set$float$float(width, height);
    this.origin.set$float$float(0, 0);
    return this;
  }
  size(width: number, height: number): void {
    this.scale_.set$float$float(width, height);
  }
  width(): number {
    return this.scale_.x;
  }
  height(): number {
    return this.scale_.y;
  }
}

$J.define(ColorBlock, 'com.watabou.noosa.ColorBlock', { kind: 'class', ifaces: ['com.watabou.noosa.Resizable'], sup: 'com.watabou.noosa.Image', ctors: { 'float,float,int': '_ColorBlock' } });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
});
