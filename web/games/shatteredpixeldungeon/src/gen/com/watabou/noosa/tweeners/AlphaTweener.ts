// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/tweeners/AlphaTweener.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Tweener } from './Tweener.ts';

export class AlphaTweener extends Tweener {
  image_: Visual = null;
  start_: number = 0;
  delta: number = 0;
  _AlphaTweener(image: Visual, alpha: number, time: number): this {
    this._Tweener(image, time);
    this.image_ = image;
    this.start_ = image.alpha$();
    this.delta = Math.fround(alpha - this.start_);
    return this;
  }
  updateValues(progress: number): void {
    this.image_.alpha$float(Math.fround(this.start_ + Math.fround(this.delta * progress)));
  }
}

$J.define(AlphaTweener, 'com.watabou.noosa.tweeners.AlphaTweener', { kind: 'class', sup: 'com.watabou.noosa.tweeners.Tweener', ctors: { 'com.watabou.noosa.Visual,float,float': '_AlphaTweener' } });
