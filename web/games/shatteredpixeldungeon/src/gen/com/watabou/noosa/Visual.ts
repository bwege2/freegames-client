// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Visual.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Gizmo } from './Gizmo.ts';

let Matrix, Game, PointF;

export class Visual extends Gizmo {
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  height_: number = 0;
  scale_: PointF = null;
  origin: PointF = null;
  matrix: number[] = null;
  rm: number = 0;
  gm: number = 0;
  bm: number = 0;
  am: number = 0;
  ra: number = 0;
  ga: number = 0;
  ba: number = 0;
  aa: number = 0;
  speed_: PointF = null;
  acc: PointF = null;
  angle: number = 0;
  angularSpeed: number = 0;
  lastX: number = 0;
  lastY: number = 0;
  lastW: number = 0;
  lastH: number = 0;
  lastA: number = 0;
  lastScale: PointF = null;
  lastOrigin: PointF = null;
  _Visual(x: number, y: number, width: number, height: number): this {
    this._Gizmo();
    this.lastScale = new PointF()._PointF$();
    this.lastOrigin = new PointF()._PointF$();
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
    this.scale_ = new PointF()._PointF$float$float(1, 1);
    this.origin = new PointF()._PointF$();
    this.matrix = $J.newArray(16, 0);
    this.resetColor();
    this.speed_ = new PointF()._PointF$();
    this.acc = new PointF()._PointF$();
    return this;
  }
  update(): void {
    this.updateMotion();
  }
  draw(): void {
    if (this.lastX !== this.x || this.lastY !== this.y || this.lastW !== this.width_ || this.lastH !== this.height_ || this.lastA !== this.angle || this.lastScale.x !== this.scale_.x || this.lastScale.y !== this.scale_.y || this.lastOrigin.x !== this.origin.x || this.lastOrigin.y !== this.origin.y) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.lastW = this.width_;
      this.lastH = this.height_;
      this.lastA = this.angle;
      this.lastScale.x = this.scale_.x;
      this.lastScale.y = this.scale_.y;
      this.lastOrigin.x = this.origin.x;
      this.lastOrigin.y = this.origin.y;
      this.updateMatrix();
    }
  }
  updateMatrix(): void {
    Matrix.setIdentity(this.matrix);
    Matrix.translate(this.matrix, this.x, this.y);
    if (this.origin.x !== Math.fround(0) || this.origin.y !== Math.fround(0)) {
      Matrix.translate(this.matrix, this.origin.x, this.origin.y);
    }
    if (this.angle !== Math.fround(0)) {
      Matrix.rotate(this.matrix, this.angle);
    }
    if (this.scale_.x !== Math.fround(1) || this.scale_.y !== Math.fround(1)) {
      Matrix.scale(this.matrix, this.scale_.x, this.scale_.y);
    }
    if (this.origin.x !== Math.fround(0) || this.origin.y !== Math.fround(0)) {
      Matrix.translate(this.matrix, Math.fround(-this.origin.x), Math.fround(-this.origin.y));
    }
  }
  point$(): PointF {
    return new PointF()._PointF$float$float(this.x, this.y);
  }
  point$PointF(p: PointF): PointF {
    this.x = p.x;
    this.y = p.y;
    return p;
  }
  point$Point(p: Point): Point {
    this.x = Math.fround(p.x);
    this.y = Math.fround(p.y);
    return p;
  }
  center$(): PointF {
    return new PointF()._PointF$float$float(Math.fround(this.x + Math.fround(this.width() / 2)), Math.fround(this.y + Math.fround(this.height() / 2)));
  }
  center$PointF(p: PointF): PointF {
    this.x = Math.fround(p.x - Math.fround(this.width() / 2));
    this.y = Math.fround(p.y - Math.fround(this.height() / 2));
    return p;
  }
  center$Visual(v: Visual): PointF {
    return new PointF()._PointF$float$float(Math.fround(this.x + Math.fround((Math.fround(this.width() - v.width())) / 2)), Math.fround(this.y + Math.fround((Math.fround(this.height() - v.height())) / 2)));
  }
  originToCenter(): void {
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
  }
  width(): number {
    return Math.fround(this.width_ * this.scale_.x);
  }
  height(): number {
    return Math.fround(this.height_ * this.scale_.y);
  }
  updateMotion(): void {
    if (this.acc.x !== Math.fround(0)) {
      this.speed_.x = Math.fround(this.speed_.x + Math.fround(this.acc.x * Game.elapsed));
    }
    if (this.speed_.x !== Math.fround(0)) {
      this.x = Math.fround(this.x + Math.fround(this.speed_.x * Game.elapsed));
    }
    if (this.acc.y !== Math.fround(0)) {
      this.speed_.y = Math.fround(this.speed_.y + Math.fround(this.acc.y * Game.elapsed));
    }
    if (this.speed_.y !== Math.fround(0)) {
      this.y = Math.fround(this.y + Math.fround(this.speed_.y * Game.elapsed));
    }
    if (this.angularSpeed !== Math.fround(0)) {
      this.angle = Math.fround(this.angle + Math.fround(this.angularSpeed * Game.elapsed));
    }
  }
  alpha$float(value: number): void {
    this.am = value;
    this.aa = 0;
  }
  alpha$(): number {
    return Math.fround(this.am + this.aa);
  }
  invert(): void {
    this.rm = this.gm = this.bm = Math.fround(-1);
    this.ra = this.ga = this.ba = +1;
  }
  lightness(value: number): void {
    if (value < 0.5) {
      this.rm = this.gm = this.bm = Math.fround(value * 2);
      this.ra = this.ga = this.ba = 0;
    } else {
      this.rm = this.gm = this.bm = Math.fround(2 - Math.fround(value * 2));
      this.ra = this.ga = this.ba = Math.fround(Math.fround(value * 2) - 1);
    }
  }
  brightness(value: number): void {
    this.rm = this.gm = this.bm = value;
  }
  tint$float$float$float$float(r: number, g: number, b: number, strength: number): void {
    this.rm = this.gm = this.bm = Math.fround(1 - strength);
    this.ra = Math.fround(r * strength);
    this.ga = Math.fround(g * strength);
    this.ba = Math.fround(b * strength);
  }
  tint$int$float(color: number, strength: number): void {
    this.rm = this.gm = this.bm = Math.fround(1 - strength);
    this.ra = Math.fround(Math.fround(((color >> 16) & 255) / 255) * strength);
    this.ga = Math.fround(Math.fround(((color >> 8) & 255) / 255) * strength);
    this.ba = Math.fround(Math.fround((color & 255) / 255) * strength);
  }
  tint$int(color: number): void {
    this.tint$int$float(color & 16777215, Math.fround(((color >> 24) & 255) / Math.fround(255)));
  }
  color$float$float$float(r: number, g: number, b: number): void {
    this.rm = this.gm = this.bm = 0;
    this.ra = r;
    this.ga = g;
    this.ba = b;
  }
  color$int(color: number): void {
    this.color$float$float$float(Math.fround(((color >> 16) & 255) / 255), Math.fround(((color >> 8) & 255) / 255), Math.fround((color & 255) / 255));
  }
  hardlight$float$float$float(r: number, g: number, b: number): void {
    this.ra = this.ga = this.ba = 0;
    this.rm = r;
    this.gm = g;
    this.bm = b;
  }
  hardlight$int(color: number): void {
    this.hardlight$float$float$float(Math.fround((color >> 16) / 255), Math.fround(((color >> 8) & 255) / 255), Math.fround((color & 255) / 255));
  }
  resetColor(): void {
    this.rm = this.gm = this.bm = this.am = 1;
    this.ra = this.ga = this.ba = this.aa = 0;
  }
  overlapsPoint(x: number, y: number): boolean {
    return x >= this.x && x < Math.fround(this.x + Math.fround(this.width_ * this.scale_.x)) && y >= this.y && y < Math.fround(this.y + Math.fround(this.height_ * this.scale_.y));
  }
  overlapsScreenPoint(x: number, y: number): boolean {
    let c = this.camera();
    if (c == null) {
      return false;
    }
    if (!c.hitTest(Math.fround(x), Math.fround(y))) {
      return false;
    }
    let p = c.screenToCamera(x, y);
    return this.overlapsPoint(p.x, p.y);
  }
  isVisible(): boolean {
    let c = this.camera();
    if (c == null || !this.visible_) {
      return false;
    }
    if (this.angle !== Math.fround(0)) {
      return true;
    }
    if (this.x > Math.fround(c.scroll_.x + c.width_)) {
      return false;
    } else if (!(this.x >= c.scroll_.x || Math.fround(this.x + this.width()) >= c.scroll_.x)) {
      return false;
    }
    if (this.y > Math.fround(c.scroll_.y + c.height_)) {
      return false;
    } else if (!(this.y >= c.scroll_.y || Math.fround(this.y + this.height()) >= c.scroll_.y)) {
      return false;
    }
    return true;
  }
}

$J.define(Visual, 'com.watabou.noosa.Visual', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'float,float,float,float': '_Visual' }, meths: { 'hardlight(int)': 'hardlight$int', 'hardlight(float,float,float)': 'hardlight$float$float$float', 'color(int)': 'color$int', 'color(float,float,float)': 'color$float$float$float', 'tint(int)': 'tint$int', 'tint(int,float)': 'tint$int$float', 'tint(float,float,float,float)': 'tint$float$float$float$float', 'alpha()': 'alpha$', 'alpha(float)': 'alpha$float', 'center(com.watabou.noosa.Visual)': 'center$Visual', 'center(com.watabou.utils.PointF)': 'center$PointF', 'center()': 'center$', 'point(com.watabou.utils.Point)': 'point$Point', 'point(com.watabou.utils.PointF)': 'point$PointF', 'point()': 'point$' } });
$J.module(() => {
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Game = $J.load('com.watabou.noosa.Game');
  PointF = $J.load('com.watabou.utils.PointF');
});
