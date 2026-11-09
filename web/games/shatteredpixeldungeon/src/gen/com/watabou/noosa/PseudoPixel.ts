// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/PseudoPixel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class PseudoPixel extends Image {
  _PseudoPixel$(): this {
    this._Image$Object(TextureCache.createSolid(-1));
    return this;
  }
  _PseudoPixel$float$float$int(x: number, y: number, color: number): this {
    this._PseudoPixel$();
    this.x = x;
    this.y = y;
    this.color$int(color);
    return this;
  }
  size$float$float(w: number, h: number): void {
    this.scale_.set$float$float(w, h);
  }
  size$float(value: number): void {
    this.scale_.set$float(value);
  }
}

$J.define(PseudoPixel, 'com.watabou.noosa.PseudoPixel', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'float,float,int': '_PseudoPixel$float$float$int', '': '_PseudoPixel$' }, meths: { 'size(float)': 'size$float', 'size(float,float)': 'size$float$float' } });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
});
