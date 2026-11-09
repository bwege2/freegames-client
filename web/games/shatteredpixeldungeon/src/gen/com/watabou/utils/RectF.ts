// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/RectF.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class RectF extends JObject {
  left_: number = 0;
  top_: number = 0;
  right_: number = 0;
  bottom_: number = 0;
  _RectF$(): this {
    this._RectF$float$float$float$float(0, 0, 0, 0);
    return this;
  }
  _RectF$RectF(rect: RectF): this {
    this._RectF$float$float$float$float(rect.left_, rect.top_, rect.right_, rect.bottom_);
    return this;
  }
  _RectF$Rect(rect: Rect): this {
    this._RectF$float$float$float$float(Math.fround(rect.left_), Math.fround(rect.top_), Math.fround(rect.right_), Math.fround(rect.bottom_));
    return this;
  }
  _RectF$float$float$float$float(left: number, top: number, right: number, bottom: number): this {
    this.left_ = left;
    this.top_ = top;
    this.right_ = right;
    this.bottom_ = bottom;
    return this;
  }
  width(): number {
    return Math.fround(this.right_ - this.left_);
  }
  height(): number {
    return Math.fround(this.bottom_ - this.top_);
  }
  square(): number {
    return Math.fround(this.width() * this.height());
  }
  set$float$float$float$float(left: number, top: number, right: number, bottom: number): RectF {
    this.left_ = left;
    this.top_ = top;
    this.right_ = right;
    this.bottom_ = bottom;
    return this;
  }
  set$Rect(rect: Rect): RectF {
    return this.set$float$float$float$float(Math.fround(rect.left_), Math.fround(rect.top_), Math.fround(rect.right_), Math.fround(rect.bottom_));
  }
  setPos(x: number, y: number): RectF {
    return this.set$float$float$float$float(x, y, Math.fround(x + (Math.fround(this.right_ - this.left_))), Math.fround(y + (Math.fround(this.bottom_ - this.top_))));
  }
  shift(x: number, y: number): RectF {
    return this.set$float$float$float$float(Math.fround(this.left_ + x), Math.fround(this.top_ + y), Math.fround(this.right_ + x), Math.fround(this.bottom_ + y));
  }
  resize(w: number, h: number): RectF {
    return this.set$float$float$float$float(this.left_, this.top_, Math.fround(this.left_ + w), Math.fround(this.top_ + h));
  }
  isEmpty(): boolean {
    return this.right_ <= this.left_ || this.bottom_ <= this.top_;
  }
  setEmpty(): RectF {
    this.left_ = this.right_ = this.top_ = this.bottom_ = 0;
    return this;
  }
  intersect(other: RectF): RectF {
    let result = new RectF()._RectF$();
    result.left_ = Math.max(this.left_, other.left_);
    result.right_ = Math.min(this.right_, other.right_);
    result.top_ = Math.max(this.top_, other.top_);
    result.bottom_ = Math.min(this.bottom_, other.bottom_);
    return result;
  }
  union$RectF(other: RectF): RectF {
    let result = new RectF()._RectF$();
    result.left_ = Math.min(this.left_, other.left_);
    result.right_ = Math.max(this.right_, other.right_);
    result.top_ = Math.min(this.top_, other.top_);
    result.bottom_ = Math.max(this.bottom_, other.bottom_);
    return result;
  }
  union$float$float(x: number, y: number): RectF {
    if (this.isEmpty()) {
      return this.set$float$float$float$float(x, y, Math.fround(x + 1), Math.fround(y + 1));
    } else {
      if (x < this.left_) {
        this.left_ = x;
      } else if (x >= this.right_) {
        this.right_ = Math.fround(x + 1);
      }
      if (y < this.top_) {
        this.top_ = y;
      } else if (y >= this.bottom_) {
        this.bottom_ = Math.fround(y + 1);
      }
      return this;
    }
  }
  union$Point(p: Point): RectF {
    return this.union$float$float(Math.fround(p.x), Math.fround(p.y));
  }
  inside(p: Point): boolean {
    return Math.fround(p.x) >= this.left_ && Math.fround(p.x) < this.right_ && Math.fround(p.y) >= this.top_ && Math.fround(p.y) < this.bottom_;
  }
  shrink$float(d: number): RectF {
    return new RectF()._RectF$float$float$float$float(Math.fround(this.left_ + d), Math.fround(this.top_ + d), Math.fround(this.right_ - d), Math.fround(this.bottom_ - d));
  }
  shrink$(): RectF {
    return this.shrink$float(1);
  }
  scale(d: number): RectF {
    return new RectF()._RectF$float$float$float$float(Math.fround(this.left_ * d), Math.fround(this.top_ * d), Math.fround(this.right_ * d), Math.fround(this.bottom_ * d));
  }
}

$J.define(RectF, 'com.watabou.utils.RectF', { kind: 'class', sup: 'java.lang.Object', ctors: { 'float,float,float,float': '_RectF$float$float$float$float', 'com.watabou.utils.Rect': '_RectF$Rect', 'com.watabou.utils.RectF': '_RectF$RectF', '': '_RectF$' }, meths: { 'shrink()': 'shrink$', 'shrink(float)': 'shrink$float', 'union(com.watabou.utils.Point)': 'union$Point', 'union(float,float)': 'union$float$float', 'union(com.watabou.utils.RectF)': 'union$RectF', 'set(com.watabou.utils.Rect)': 'set$Rect', 'set(float,float,float,float)': 'set$float$float$float$float' } });
