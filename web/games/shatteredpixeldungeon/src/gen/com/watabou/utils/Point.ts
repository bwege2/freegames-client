// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Point.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Point extends JObject {
  x: number = 0;
  y: number = 0;
  _Point$(): this {
    return this;
  }
  _Point$int$int(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  _Point$Point(p: Point): this {
    this.x = p.x;
    this.y = p.y;
    return this;
  }
  set$int$int(x: number, y: number): Point {
    this.x = x;
    this.y = y;
    return this;
  }
  set$Point(p: Point): Point {
    this.x = p.x;
    this.y = p.y;
    return this;
  }
  clone(): Point {
    return new Point()._Point$Point(this);
  }
  scale(f: number): Point {
    this.x = $J.d2i(Math.fround(this.x * f));
    this.y = $J.d2i(Math.fround(this.y * f));
    return this;
  }
  offset$int$int(dx: number, dy: number): Point {
    this.x = (this.x + dx) | 0;
    this.y = (this.y + dy) | 0;
    return this;
  }
  offset$Point(d: Point): Point {
    this.x = (this.x + d.x) | 0;
    this.y = (this.y + d.y) | 0;
    return this;
  }
  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }
  length(): number {
    return Math.fround(Math.sqrt((Math.imul(this.x, this.x) + Math.imul(this.y, this.y)) | 0));
  }
  static distance(a: Point, b: Point): number {
    let dx = Math.fround((a.x - b.x) | 0);
    let dy = Math.fround((a.y - b.y) | 0);
    return Math.fround(Math.sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy))));
  }
  equals(obj: any): boolean {
    if (obj instanceof Point) {
      let p = obj;
      return p.x === this.x && p.y === this.y;
    } else {
      return false;
    }
  }
}

$J.define(Point, 'com.watabou.utils.Point', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.watabou.utils.Point': '_Point$Point', 'int,int': '_Point$int$int', '': '_Point$' }, meths: { 'offset(com.watabou.utils.Point)': 'offset$Point', 'offset(int,int)': 'offset$int$int', 'set(com.watabou.utils.Point)': 'set$Point', 'set(int,int)': 'set$int$int' } });
