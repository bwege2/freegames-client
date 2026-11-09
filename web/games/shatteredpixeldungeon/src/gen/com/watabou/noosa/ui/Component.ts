// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/ui/Component.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Group } from '../Group.ts';

export class Component extends Group {
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  height_: number = 0;
  _Component(): this {
    this._Group();
    this.createChildren();
    return this;
  }
  setPos(x: number, y: number): Component {
    this.x = x;
    this.y = y;
    this.layout();
    return this;
  }
  setSize(width: number, height: number): Component {
    this.width_ = width;
    this.height_ = height;
    this.layout();
    return this;
  }
  setRect(x: number, y: number, width: number, height: number): Component {
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
    this.layout();
    return this;
  }
  inside(x: number, y: number): boolean {
    return x >= this.x && y >= this.y && x < Math.fround(this.x + this.width_) && y < Math.fround(this.y + this.height_);
  }
  fill(c: Component): void {
    this.setRect(c.x, c.y, c.width_, c.height_);
  }
  left(): number {
    return this.x;
  }
  right(): number {
    return Math.fround(this.x + this.width_);
  }
  centerX(): number {
    return Math.fround(this.x + Math.fround(this.width_ / 2));
  }
  top(): number {
    return this.y;
  }
  bottom(): number {
    return Math.fround(this.y + this.height_);
  }
  centerY(): number {
    return Math.fround(this.y + Math.fround(this.height_ / 2));
  }
  width(): number {
    return this.width_;
  }
  height(): number {
    return this.height_;
  }
  createChildren(): void {
  }
  layout(): void {
  }
}

$J.define(Component, 'com.watabou.noosa.ui.Component', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_Component' } });
