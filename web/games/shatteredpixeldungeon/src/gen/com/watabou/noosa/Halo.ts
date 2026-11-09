// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Halo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Halo extends Image {
  static CACHE_KEY: any = null;
  static readonly RADIUS: number = 128;
  radius_: number = 0;
  brightness_: number = 0;
  $init_Halo() {
    this.radius_ = Math.fround(Halo.RADIUS);
    this.brightness_ = 1;
  }
  _Halo$(): this {
    this._Image$();
    this.$init_Halo();
    if (!TextureCache.contains(Halo.CACHE_KEY)) {
      let pixmap = (TextureCache.create(Halo.CACHE_KEY, (Math.imul(2, Halo.RADIUS) + 1) | 0, (Math.imul(2, Halo.RADIUS) + 1) | 0)).bitmap_;
      pixmap.setColor(0);
      pixmap.fill();
      pixmap.setColor(-248);
      for (let i = 0; i < Halo.RADIUS; i = (i + 2) | 0) {
        pixmap.fillCircle(Halo.RADIUS, Halo.RADIUS, ((Halo.RADIUS - i) | 0));
      }
    }
    this.texture(Halo.CACHE_KEY);
    return this;
  }
  _Halo$float$int$float(radius: number, color: number, brightness: number): this {
    this._Halo$();
    this.hardlight$int(color);
    this.alpha$float(this.brightness_ = brightness);
    this.radius(radius);
    return this;
  }
  point$float$float(x: number, y: number): Halo {
    this.x = Math.fround(x - (Math.fround(this.width() / 2)));
    this.y = Math.fround(y - (Math.fround(this.height() / 2)));
    return this;
  }
  alpha$float(value: number): void {
    this.brightness_ = value;
    super.alpha$float(value);
  }
  radius(value: number): void {
    this.scale_.set$float(Math.fround((this.radius_ = value) / Halo.RADIUS));
  }
  static $clinit() {
    Halo.CACHE_KEY = $J.cls(Halo);
  }
}

$J.define(Halo, 'com.watabou.noosa.Halo', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'float,int,float': '_Halo$float$int$float', '': '_Halo$' }, meths: { 'alpha(float)': 'alpha$float', 'point(float,float)': 'point$float$float' }, clinit: true, lazy: ['CACHE_KEY'] });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
});
