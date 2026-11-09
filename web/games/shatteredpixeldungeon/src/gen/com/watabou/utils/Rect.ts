// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Rect.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

let Point, Random;

export class Rect extends JObject {
  left_: number = 0;
  top_: number = 0;
  right_: number = 0;
  bottom_: number = 0;
  _Rect$(): this {
    this._Rect$int$int$int$int(0, 0, 0, 0);
    return this;
  }
  _Rect$Rect(rect: Rect): this {
    this._Rect$int$int$int$int(rect.left_, rect.top_, rect.right_, rect.bottom_);
    return this;
  }
  _Rect$int$int$int$int(left: number, top: number, right: number, bottom: number): this {
    this.left_ = left;
    this.top_ = top;
    this.right_ = right;
    this.bottom_ = bottom;
    return this;
  }
  width(): number {
    return (this.right_ - this.left_) | 0;
  }
  height(): number {
    return (this.bottom_ - this.top_) | 0;
  }
  square(): number {
    return Math.imul(this.width(), this.height());
  }
  set$int$int$int$int(left: number, top: number, right: number, bottom: number): Rect {
    this.left_ = left;
    this.top_ = top;
    this.right_ = right;
    this.bottom_ = bottom;
    return this;
  }
  set$Rect(rect: Rect): Rect {
    return this.set$int$int$int$int(rect.left_, rect.top_, rect.right_, rect.bottom_);
  }
  setPos(x: number, y: number): Rect {
    return this.set$int$int$int$int(x, y, (x + (this.right_ - this.left_)) | 0, (y + (this.bottom_ - this.top_)) | 0);
  }
  shift(x: number, y: number): Rect {
    return this.set$int$int$int$int((this.left_ + x) | 0, (this.top_ + y) | 0, (this.right_ + x) | 0, (this.bottom_ + y) | 0);
  }
  resize(w: number, h: number): Rect {
    return this.set$int$int$int$int(this.left_, this.top_, (this.left_ + w) | 0, (this.top_ + h) | 0);
  }
  isEmpty(): boolean {
    return this.right_ <= this.left_ || this.bottom_ <= this.top_;
  }
  setEmpty(): Rect {
    this.left_ = this.right_ = this.top_ = this.bottom_ = 0;
    return this;
  }
  intersect(other: Rect): Rect {
    let result = new Rect()._Rect$();
    result.left_ = Math.max(this.left_, other.left_);
    result.right_ = Math.min(this.right_, other.right_);
    result.top_ = Math.max(this.top_, other.top_);
    result.bottom_ = Math.min(this.bottom_, other.bottom_);
    return result;
  }
  union$Rect(other: Rect): Rect {
    let result = new Rect()._Rect$();
    result.left_ = Math.min(this.left_, other.left_);
    result.right_ = Math.max(this.right_, other.right_);
    result.top_ = Math.min(this.top_, other.top_);
    result.bottom_ = Math.max(this.bottom_, other.bottom_);
    return result;
  }
  union$int$int(x: number, y: number): Rect {
    if (this.isEmpty()) {
      return this.set$int$int$int$int(x, y, (x + 1) | 0, (y + 1) | 0);
    } else {
      if (x < this.left_) {
        this.left_ = x;
      } else if (x >= this.right_) {
        this.right_ = (x + 1) | 0;
      }
      if (y < this.top_) {
        this.top_ = y;
      } else if (y >= this.bottom_) {
        this.bottom_ = (y + 1) | 0;
      }
      return this;
    }
  }
  union$Point(p: Point): Rect {
    return this.union$int$int(p.x, p.y);
  }
  inside$Point(p: Point): boolean {
    return p.x >= this.left_ && p.x < this.right_ && p.y >= this.top_ && p.y < this.bottom_;
  }
  center(): Point {
    return new Point()._Point$int$int(($J.idiv(((this.left_ + this.right_) | 0), 2) + ((((this.right_ - this.left_) | 0) % 2) === 0 ? Random.Int$int(2) : 0)) | 0, ($J.idiv(((this.top_ + this.bottom_) | 0), 2) + ((((this.bottom_ - this.top_) | 0) % 2) === 0 ? Random.Int$int(2) : 0)) | 0);
  }
  shrink$int(d: number): Rect {
    return new Rect()._Rect$int$int$int$int((this.left_ + d) | 0, (this.top_ + d) | 0, (this.right_ - d) | 0, (this.bottom_ - d) | 0);
  }
  shrink$(): Rect {
    return this.shrink$int(1);
  }
  scale(d: number): Rect {
    return new Rect()._Rect$int$int$int$int(Math.imul(this.left_, d), Math.imul(this.top_, d), Math.imul(this.right_, d), Math.imul(this.bottom_, d));
  }
  getPoints(): ArrayList<Point> {
    let points = new ArrayList();
    for (let i = this.left_; i <= this.right_; i++) {
      for (let j = this.top_; j <= this.bottom_; j++) {
        points.add(new Point()._Point$int$int(i, j));
      }
    }
    return points;
  }
}

$J.define(Rect, 'com.watabou.utils.Rect', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,int': '_Rect$int$int$int$int', 'com.watabou.utils.Rect': '_Rect$Rect', '': '_Rect$' }, meths: { 'shrink()': 'shrink$', 'shrink(int)': 'shrink$int', 'inside(com.watabou.utils.Point)': 'inside$Point', 'union(com.watabou.utils.Point)': 'union$Point', 'union(int,int)': 'union$int$int', 'union(com.watabou.utils.Rect)': 'union$Rect', 'set(com.watabou.utils.Rect)': 'set$Rect', 'set(int,int,int,int)': 'set$int$int$int$int' } });
$J.module(() => {
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
