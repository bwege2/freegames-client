// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/ColorMath.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

let Random;

export class ColorMath extends JObject {
  _ColorMath(): this {
    return this;
  }
  static interpolate$int$int$float(A: number, B: number, p: number): number {
    if (p <= Math.fround(0)) {
      return A;
    } else if (p >= Math.fround(1)) {
      return B;
    }
    let ra = A >> 16;
    let ga = (A >> 8) & 255;
    let ba = A & 255;
    let rb = B >> 16;
    let gb = (B >> 8) & 255;
    let bb = B & 255;
    let p1 = Math.fround(1 - p);
    let r = $J.d2i((Math.fround(Math.fround(p1 * ra) + Math.fround(p * rb))));
    let g = $J.d2i((Math.fround(Math.fround(p1 * ga) + Math.fround(p * gb))));
    let b = $J.d2i((Math.fround(Math.fround(p1 * ba) + Math.fround(p * bb))));
    return ((r << 16) + (g << 8) + b) | 0;
  }
  static interpolate$float$intArr(p: number, colors: number[]): number {
    if (p <= Math.fround(0)) {
      return colors[0];
    } else if (p >= Math.fround(1)) {
      return colors[(colors.length - 1) | 0];
    }
    let segment = $J.d2i((Math.fround(((colors.length - 1) | 0) * p)));
    return ColorMath.interpolate$int$int$float(colors[segment], colors[(segment + 1) | 0], Math.fround((Math.fround(p * ((colors.length - 1) | 0))) % 1));
  }
  static random(a: number, b: number): number {
    return ColorMath.interpolate$int$int$float(a, b, Random.Float$());
  }
}

$J.define(ColorMath, 'com.watabou.utils.ColorMath', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ColorMath' }, meths: { 'interpolate(float,int[])': 'interpolate$float$intArr', 'interpolate(int,int,float)': 'interpolate$int$int$float' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
