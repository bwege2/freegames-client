// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/PointF.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Point;

export class PointF extends JObject {
  static readonly PI: number = Math.fround(3.1415925);
  static readonly PI2: number = Math.fround(6.283185);
  static readonly G2R: number = Math.fround(0.017453292);
  x: number = 0;
  y: number = 0;
  _PointF$(): this {
    return this;
  }
  _PointF$float$float(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  _PointF$PointF(p: PointF): this {
    this.x = p.x;
    this.y = p.y;
    return this;
  }
  _PointF$Point(p: Point): this {
    this.x = Math.fround(p.x);
    this.y = Math.fround(p.y);
    return this;
  }
  clone(): PointF {
    return new PointF()._PointF$PointF(this);
  }
  scale(f: number): PointF {
    this.x = Math.fround(this.x * f);
    this.y = Math.fround(this.y * f);
    return this;
  }
  invScale(f: number): PointF {
    this.x = Math.fround(this.x / f);
    this.y = Math.fround(this.y / f);
    return this;
  }
  set$float$float(x: number, y: number): PointF {
    this.x = x;
    this.y = y;
    return this;
  }
  set$PointF(p: PointF): PointF {
    this.x = p.x;
    this.y = p.y;
    return this;
  }
  set$float(v: number): PointF {
    this.x = v;
    this.y = v;
    return this;
  }
  polar(a: number, l: number): PointF {
    this.x = Math.fround(l * Math.fround(Math.cos(a)));
    this.y = Math.fround(l * Math.fround(Math.sin(a)));
    return this;
  }
  offset$float$float(dx: number, dy: number): PointF {
    this.x = Math.fround(this.x + dx);
    this.y = Math.fround(this.y + dy);
    return this;
  }
  offset$PointF(p: PointF): PointF {
    this.x = Math.fround(this.x + p.x);
    this.y = Math.fround(this.y + p.y);
    return this;
  }
  negate(): PointF {
    this.x = Math.fround(-this.x);
    this.y = Math.fround(-this.y);
    return this;
  }
  normalize(): PointF {
    let l = this.length();
    this.x = Math.fround(this.x / l);
    this.y = Math.fround(this.y / l);
    return this;
  }
  floor(): Point {
    return new Point()._Point$int$int($J.d2i(this.x), $J.d2i(this.y));
  }
  isZero(): boolean {
    return this.x === Math.fround(0) && this.y === Math.fround(0);
  }
  length(): number {
    return Math.fround(Math.sqrt(Math.fround(Math.fround(this.x * this.x) + Math.fround(this.y * this.y))));
  }
  static sum(a: PointF, b: PointF): PointF {
    return new PointF()._PointF$float$float(Math.fround(a.x + b.x), Math.fround(a.y + b.y));
  }
  static diff(a: PointF, b: PointF): PointF {
    return new PointF()._PointF$float$float(Math.fround(a.x - b.x), Math.fround(a.y - b.y));
  }
  static inter(a: PointF, b: PointF, d: number): PointF {
    return new PointF()._PointF$float$float(Math.fround(a.x + Math.fround((Math.fround(b.x - a.x)) * d)), Math.fround(a.y + Math.fround((Math.fround(b.y - a.y)) * d)));
  }
  static distance(a: PointF, b: PointF): number {
    let dx = Math.fround(a.x - b.x);
    let dy = Math.fround(a.y - b.y);
    return Math.fround(Math.sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy))));
  }
  static angle$float$float(x: number, y: number): number {
    return Math.fround(Math.atan2(y, x));
  }
  static angle$PointF$PointF(start: PointF, end: PointF): number {
    return Math.fround(Math.atan2(Math.fround(end.y - start.y), Math.fround(end.x - start.x)));
  }
  static angle$Point$Point(start: Point, end: Point): number {
    return Math.fround(Math.atan2((end.y - start.y) | 0, (end.x - start.x) | 0));
  }
  equals(o: any): boolean {
    if (super.equals(o)) {
      return true;
    }
    return o instanceof PointF && ((o).x === this.x && (o).y === this.y);
  }
}

$J.define(PointF, 'com.watabou.utils.PointF', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.watabou.utils.Point': '_PointF$Point', 'com.watabou.utils.PointF': '_PointF$PointF', 'float,float': '_PointF$float$float', '': '_PointF$' }, meths: { 'angle(com.watabou.utils.Point,com.watabou.utils.Point)': 'angle$Point$Point', 'angle(com.watabou.utils.PointF,com.watabou.utils.PointF)': 'angle$PointF$PointF', 'angle(float,float)': 'angle$float$float', 'offset(com.watabou.utils.PointF)': 'offset$PointF', 'offset(float,float)': 'offset$float$float', 'set(float)': 'set$float', 'set(com.watabou.utils.PointF)': 'set$PointF', 'set(float,float)': 'set$float$float' } });
$J.module(() => {
  Point = $J.load('com.watabou.utils.Point');
});
