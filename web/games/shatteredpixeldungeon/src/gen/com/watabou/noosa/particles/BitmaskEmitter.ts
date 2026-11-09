// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/particles/BitmaskEmitter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Emitter } from './Emitter.ts';

let Random;

export class BitmaskEmitter extends Emitter {
  map_: SmartTexture = null;
  mapW: number = 0;
  mapH: number = 0;
  _BitmaskEmitter(target: Image): this {
    this._Emitter();
    this.target = target;
    this.map_ = target.texture_;
    this.mapW = this.map_.bitmap_.getWidth();
    this.mapH = this.map_.bitmap_.getHeight();
    return this;
  }
  emit(index: number): void {
    let frame = (this.target).frame$();
    let ofsX = Math.fround(frame.left_ * this.mapW);
    let ofsY = Math.fround(frame.top_ * this.mapH);
    let x: number;
    let y: number;
    do {
      x = Math.fround(Random.Float$float(frame.width()) * this.mapW);
      y = Math.fround(Random.Float$float(frame.height()) * this.mapH);
    } while ((this.map_.bitmap_.getPixel($J.d2i((Math.fround(x + ofsX))), $J.d2i((Math.fround(y + ofsY)))) & 255) === 0);
    this.factory.emit(this, index, Math.fround(this.target.x + Math.fround(x * this.target.scale_.x)), Math.fround(this.target.y + Math.fround(y * this.target.scale_.y)));
  }
}

$J.define(BitmaskEmitter, 'com.watabou.noosa.particles.BitmaskEmitter', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'com.watabou.noosa.Image': '_BitmaskEmitter' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
