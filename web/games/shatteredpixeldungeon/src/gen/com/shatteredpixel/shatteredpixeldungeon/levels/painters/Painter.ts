// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/Painter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays, JObject } from '../../../../../../jre/index.ts';

let Point;

export class Painter extends JObject {
  _Painter(): this {
    return this;
  }
  static set$Level$int$int(level: Level, cell: number, value: number): void {
    level.map_[cell] = value;
  }
  static set$Level$int$int$int(level: Level, x: number, y: number, value: number): void {
    Painter.set$Level$int$int(level, (x + Math.imul(y, level.width())) | 0, value);
  }
  static set$Level$Point$int(level: Level, p: Point, value: number): void {
    Painter.set$Level$int$int$int(level, p.x, p.y, value);
  }
  static fill$Level$int$int$int$int$int(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    let width = level.width();
    let pos = (Math.imul(y, width) + x) | 0;
    for (let i = y; i < ((y + h) | 0); i++, pos = (pos + width) | 0) {
      Arrays.fill(level.map_, pos, (pos + w) | 0, value);
    }
  }
  static fill$Level$Rect$int(level: Level, rect: Rect, value: number): void {
    Painter.fill$Level$int$int$int$int$int(level, rect.left_, rect.top_, rect.width(), rect.height(), value);
  }
  static fill$Level$Rect$int$int(level: Level, rect: Rect, m: number, value: number): void {
    Painter.fill$Level$int$int$int$int$int(level, (rect.left_ + m) | 0, (rect.top_ + m) | 0, (rect.width() - Math.imul(m, 2)) | 0, (rect.height() - Math.imul(m, 2)) | 0, value);
  }
  static fill$Level$Rect$int$int$int$int$int(level: Level, rect: Rect, l: number, t: number, r: number, b: number, value: number): void {
    Painter.fill$Level$int$int$int$int$int(level, (rect.left_ + l) | 0, (rect.top_ + t) | 0, (rect.width() - (l + r)) | 0, (rect.height() - (t + b)) | 0, value);
  }
  static drawLine(level: Level, from: Point, to: Point, value: number): void {
    let x = Math.fround(from.x);
    let y = Math.fround(from.y);
    let dx = Math.fround((to.x - from.x) | 0);
    let dy = Math.fround((to.y - from.y) | 0);
    let movingbyX = Math.fround(Math.abs(dx)) >= Math.fround(Math.abs(dy));
    if (movingbyX) {
      dy = Math.fround(dy / Math.fround(Math.abs(dx)));
      dx = Math.fround(dx / Math.fround(Math.abs(dx)));
    } else {
      dx = Math.fround(dx / Math.fround(Math.abs(dy)));
      dy = Math.fround(dy / Math.fround(Math.abs(dy)));
    }
    Painter.set$Level$int$int$int(level, $J.roundf(x), $J.roundf(y), value);
    while ((movingbyX && Math.fround(to.x) !== x) || (!movingbyX && Math.fround(to.y) !== y)) {
      x = Math.fround(x + dx);
      y = Math.fround(y + dy);
      Painter.set$Level$int$int$int(level, $J.roundf(x), $J.roundf(y), value);
    }
  }
  static fillEllipse$Level$Rect$int(level: Level, rect: Rect, value: number): void {
    Painter.fillEllipse$Level$int$int$int$int$int(level, rect.left_, rect.top_, rect.width(), rect.height(), value);
  }
  static fillEllipse$Level$Rect$int$int(level: Level, rect: Rect, m: number, value: number): void {
    Painter.fillEllipse$Level$int$int$int$int$int(level, (rect.left_ + m) | 0, (rect.top_ + m) | 0, (rect.width() - Math.imul(m, 2)) | 0, (rect.height() - Math.imul(m, 2)) | 0, value);
  }
  static fillEllipse$Level$int$int$int$int$int(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    let radH = Math.fround(h / 2);
    let radW = Math.fround(w / 2);
    for (let i = 0; i < h; i++) {
      let rowY = -radH + 0.5 + i;
      let rowW = 2 * (Math.sqrt((radW * radW) * (1 - (rowY * rowY) / (radH * radH))));
      if (w % 2 === 0) {
        rowW = Number($J.lround(rowW / 2)) * 2;
      } else {
        rowW = Math.floor(rowW / 2) * 2;
        rowW++;
      }
      let cell = (x + $J.idiv(((w - $J.d2i(rowW)) | 0), 2) + (Math.imul(((y + i) | 0), level.width()))) | 0;
      Arrays.fill(level.map_, cell, (cell + $J.d2i(rowW)) | 0, value);
    }
  }
  static fillDiamond$Level$Rect$int(level: Level, rect: Rect, value: number): void {
    Painter.fillDiamond$Level$int$int$int$int$int(level, rect.left_, rect.top_, rect.width(), rect.height(), value);
  }
  static fillDiamond$Level$Rect$int$int(level: Level, rect: Rect, m: number, value: number): void {
    Painter.fillDiamond$Level$int$int$int$int$int(level, (rect.left_ + m) | 0, (rect.top_ + m) | 0, (rect.width() - Math.imul(m, 2)) | 0, (rect.height() - Math.imul(m, 2)) | 0, value);
  }
  static fillDiamond$Level$int$int$int$int$int(level: Level, x: number, y: number, w: number, h: number, value: number): void {
    let diamondWidth = (w - (h - 2 - h % 2)) | 0;
    diamondWidth = Math.max(diamondWidth, w % 2 === 0 ? 2 : 3);
    for (let i = 0; i <= h; i++) {
      Painter.fill$Level$int$int$int$int$int(level, (x + $J.idiv(((w - diamondWidth) | 0), 2)) | 0, (y + i) | 0, diamondWidth, (h - Math.imul(2, i)) | 0, value);
      diamondWidth = (diamondWidth + 2) | 0;
      if (diamondWidth > w) {
        break;
      }
    }
  }
  static drawInside(level: Level, room: Room, from: Point, n: number, value: number): Point {
    let step = new Point()._Point$();
    if (from.x === room.left_) {
      step.set$int$int(+1, 0);
    } else if (from.x === room.right_) {
      step.set$int$int(-1, 0);
    } else if (from.y === room.top_) {
      step.set$int$int(0, +1);
    } else if (from.y === room.bottom_) {
      step.set$int$int(0, -1);
    }
    let p = new Point()._Point$Point(from).offset$Point(step);
    for (let i = 0; i < n; i++) {
      if (value !== -1) {
        Painter.set$Level$Point$int(level, p, value);
      }
      p.offset$Point(step);
    }
    return p;
  }
}

$J.define(Painter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Painter' }, meths: { 'fillDiamond(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int,int,int,int)': 'fillDiamond$Level$int$int$int$int$int', 'fillDiamond(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int,int)': 'fillDiamond$Level$Rect$int$int', 'fillDiamond(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int)': 'fillDiamond$Level$Rect$int', 'fillEllipse(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int,int,int,int)': 'fillEllipse$Level$int$int$int$int$int', 'fillEllipse(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int,int)': 'fillEllipse$Level$Rect$int$int', 'fillEllipse(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int)': 'fillEllipse$Level$Rect$int', 'fill(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int,int,int,int,int)': 'fill$Level$Rect$int$int$int$int$int', 'fill(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int,int)': 'fill$Level$Rect$int$int', 'fill(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Rect,int)': 'fill$Level$Rect$int', 'fill(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int,int,int,int)': 'fill$Level$int$int$int$int$int', 'set(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.utils.Point,int)': 'set$Level$Point$int', 'set(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int,int)': 'set$Level$int$int$int', 'set(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int)': 'set$Level$int$int' } });
$J.module(() => {
  Point = $J.load('com.watabou.utils.Point');
});
