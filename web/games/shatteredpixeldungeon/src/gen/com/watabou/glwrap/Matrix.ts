// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Matrix.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Matrix extends JObject {
  static readonly G2RAD: number = Math.fround(0.017453292);
  static identity: number[] = null;
  _Matrix(): this {
    return this;
  }
  static clone(m: number[]): number[] {
    let n = m.length;
    let res = $J.newArray(n, 0);
    do {
      res[--n] = m[n];
    } while (n > 0);
    return res;
  }
  static copy(src: number[], dst: number[]): void {
    let n = src.length;
    do {
      dst[--n] = src[n];
    } while (n > 0);
  }
  static setIdentity(m: number[]): void {
    $J.system_arraycopy(Matrix.identity, 0, m, 0, Matrix.identity.length);
  }
  static rotate(m: number[], a: number): void {
    a = Math.fround(a * Matrix.G2RAD);
    let sin = Math.fround(Math.sin(a));
    let cos = Math.fround(Math.cos(a));
    let m0 = m[0];
    let m1 = m[1];
    let m4 = m[4];
    let m5 = m[5];
    m[0] = Math.fround(Math.fround(m0 * cos) + Math.fround(m4 * sin));
    m[1] = Math.fround(Math.fround(m1 * cos) + Math.fround(m5 * sin));
    m[4] = Math.fround(Math.fround(Math.fround(-m0) * sin) + Math.fround(m4 * cos));
    m[5] = Math.fround(Math.fround(Math.fround(-m1) * sin) + Math.fround(m5 * cos));
  }
  static skewX(m: number[], a: number): void {
    let t = Math.tan(Math.fround(a * Matrix.G2RAD));
    m[4] = Math.fround(m[4] + Math.fround(-m[0]) * t);
    m[5] = Math.fround(m[5] + Math.fround(-m[1]) * t);
  }
  static skewY(m: number[], a: number): void {
    let t = Math.tan(Math.fround(a * Matrix.G2RAD));
    m[0] = Math.fround(m[0] + m[4] * t);
    m[1] = Math.fround(m[1] + m[5] * t);
  }
  static scale(m: number[], x: number, y: number): void {
    m[0] = Math.fround(m[0] * x);
    m[1] = Math.fround(m[1] * x);
    m[2] = Math.fround(m[2] * x);
    m[3] = Math.fround(m[3] * x);
    m[4] = Math.fround(m[4] * y);
    m[5] = Math.fround(m[5] * y);
    m[6] = Math.fround(m[6] * y);
    m[7] = Math.fround(m[7] * y);
  }
  static translate(m: number[], x: number, y: number): void {
    m[12] = Math.fround(m[12] + Math.fround(Math.fround(m[0] * x) + Math.fround(m[4] * y)));
    m[13] = Math.fround(m[13] + Math.fround(Math.fround(m[1] * x) + Math.fround(m[5] * y)));
  }
  static multiply(left: number[], right: number[], result: number[]): void {
    let ax1 = left[0];
    let ay1 = left[1];
    let az1 = left[2];
    let aw1 = left[3];
    let ax2 = left[4];
    let ay2 = left[5];
    let az2 = left[6];
    let aw2 = left[7];
    let ax3 = left[8];
    let ay3 = left[9];
    let az3 = left[10];
    let aw3 = left[11];
    let ax4 = left[12];
    let ay4 = left[13];
    let az4 = left[14];
    let aw4 = left[15];
    let bx1 = right[0];
    let by1 = right[1];
    let bz1 = right[2];
    let bw1 = right[3];
    let bx2 = right[4];
    let by2 = right[5];
    let bz2 = right[6];
    let bw2 = right[7];
    let bx3 = right[8];
    let by3 = right[9];
    let bz3 = right[10];
    let bw3 = right[11];
    let bx4 = right[12];
    let by4 = right[13];
    let bz4 = right[14];
    let bw4 = right[15];
    result[0] = Math.fround(Math.fround(Math.fround(Math.fround(ax1 * bx1) + Math.fround(ax2 * by1)) + Math.fround(ax3 * bz1)) + Math.fround(ax4 * bw1));
    result[1] = Math.fround(Math.fround(Math.fround(Math.fround(ay1 * bx1) + Math.fround(ay2 * by1)) + Math.fround(ay3 * bz1)) + Math.fround(ay4 * bw1));
    result[2] = Math.fround(Math.fround(Math.fround(Math.fround(az1 * bx1) + Math.fround(az2 * by1)) + Math.fround(az3 * bz1)) + Math.fround(az4 * bw1));
    result[3] = Math.fround(Math.fround(Math.fround(Math.fround(aw1 * bx1) + Math.fround(aw2 * by1)) + Math.fround(aw3 * bz1)) + Math.fround(aw4 * bw1));
    result[4] = Math.fround(Math.fround(Math.fround(Math.fround(ax1 * bx2) + Math.fround(ax2 * by2)) + Math.fround(ax3 * bz2)) + Math.fround(ax4 * bw2));
    result[5] = Math.fround(Math.fround(Math.fround(Math.fround(ay1 * bx2) + Math.fround(ay2 * by2)) + Math.fround(ay3 * bz2)) + Math.fround(ay4 * bw2));
    result[6] = Math.fround(Math.fround(Math.fround(Math.fround(az1 * bx2) + Math.fround(az2 * by2)) + Math.fround(az3 * bz2)) + Math.fround(az4 * bw2));
    result[7] = Math.fround(Math.fround(Math.fround(Math.fround(aw1 * bx2) + Math.fround(aw2 * by2)) + Math.fround(aw3 * bz2)) + Math.fround(aw4 * bw2));
    result[8] = Math.fround(Math.fround(Math.fround(Math.fround(ax1 * bx3) + Math.fround(ax2 * by3)) + Math.fround(ax3 * bz3)) + Math.fround(ax4 * bw3));
    result[9] = Math.fround(Math.fround(Math.fround(Math.fround(ay1 * bx3) + Math.fround(ay2 * by3)) + Math.fround(ay3 * bz3)) + Math.fround(ay4 * bw3));
    result[10] = Math.fround(Math.fround(Math.fround(Math.fround(az1 * bx3) + Math.fround(az2 * by3)) + Math.fround(az3 * bz3)) + Math.fround(az4 * bw3));
    result[11] = Math.fround(Math.fround(Math.fround(Math.fround(aw1 * bx3) + Math.fround(aw2 * by3)) + Math.fround(aw3 * bz3)) + Math.fround(aw4 * bw3));
    result[12] = Math.fround(Math.fround(Math.fround(Math.fround(ax1 * bx4) + Math.fround(ax2 * by4)) + Math.fround(ax3 * bz4)) + Math.fround(ax4 * bw4));
    result[13] = Math.fround(Math.fround(Math.fround(Math.fround(ay1 * bx4) + Math.fround(ay2 * by4)) + Math.fround(ay3 * bz4)) + Math.fround(ay4 * bw4));
    result[14] = Math.fround(Math.fround(Math.fround(Math.fround(az1 * bx4) + Math.fround(az2 * by4)) + Math.fround(az3 * bz4)) + Math.fround(az4 * bw4));
    result[15] = Math.fround(Math.fround(Math.fround(Math.fround(aw1 * bx4) + Math.fround(aw2 * by4)) + Math.fround(aw3 * bz4)) + Math.fround(aw4 * bw4));
  }
  static $clinit() {
    Matrix.identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
}

$J.define(Matrix, 'com.watabou.glwrap.Matrix', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Matrix' }, clinit: true, lazy: ['identity'] });
