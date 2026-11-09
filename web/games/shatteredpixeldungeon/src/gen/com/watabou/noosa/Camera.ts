// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Camera.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../jre/index.ts';
import { Gizmo } from './Gizmo.ts';

let Matrix, Game, Point, PointF, Random;

export class Camera extends Gizmo {
  static all: ArrayList<Camera> = null;
  static invW2: number = 0;
  static invH2: number = 0;
  static main: Camera = null;
  fullScreen: boolean = false;
  zoom_: number = 0;
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  height_: number = 0;
  screenWidth_: number = 0;
  screenHeight_: number = 0;
  matrix: number[] = null;
  edgeScroll: PointF = null;
  scroll_: PointF = null;
  centerOffset: PointF = null;
  shakeMagX: number = 0;
  shakeMagY: number = 0;
  shakeTime: number = 0;
  shakeDuration: number = 0;
  shakeX: number = 0;
  shakeY: number = 0;
  followTarget_: Visual = null;
  panTarget: PointF = null;
  panIntensity: number = 0;
  followDeadzone: number = 0;
  _Camera(x: number, y: number, width: number, height: number, zoom: number): this {
    this._Gizmo();
    this.shakeMagX = 10;
    this.shakeMagY = 10;
    this.shakeTime = 0;
    this.shakeDuration = 1;
    this.followTarget_ = null;
    this.panTarget = new PointF()._PointF$();
    this.panIntensity = 0;
    this.followDeadzone = 0;
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
    this.zoom_ = zoom;
    this.screenWidth_ = $J.d2i((Math.fround(width * zoom)));
    this.screenHeight_ = $J.d2i((Math.fround(height * zoom)));
    this.edgeScroll = new PointF()._PointF$();
    this.scroll_ = new PointF()._PointF$();
    this.centerOffset = new PointF()._PointF$();
    this.matrix = $J.newArray(16, 0);
    Matrix.setIdentity(this.matrix);
    return this;
  }
  static reset$(): Camera {
    return Camera.reset$Camera(Camera.createFullscreen(1));
  }
  static reset$Camera(newCamera: Camera): Camera {
    Camera.invW2 = Math.fround(2 / Game.width);
    Camera.invH2 = Math.fround(2 / Game.height);
    let length = Camera.all.size();
    for (let i = 0; i < length; i++) {
      Camera.all.get(i).destroy();
    }
    Camera.all.clear();
    return Camera.main = Camera.add(newCamera);
  }
  static add(camera: Camera): Camera {
    Camera.all.add(camera);
    return camera;
  }
  static remove(camera: Camera): Camera {
    Camera.all.remove(camera);
    return camera;
  }
  static updateAll(): void {
    let length = Camera.all.size();
    for (let i = 0; i < length; i++) {
      let c = Camera.all.get(i);
      if (c != null && c.exists && c.active) {
        c.update();
      }
    }
  }
  static createFullscreen(zoom: number): Camera {
    let w = $J.d2i(Math.ceil(Math.fround(Game.width / zoom)));
    let h = $J.d2i(Math.ceil(Math.fround(Game.height / zoom)));
    let c = new Camera()._Camera($J.idiv($J.d2i((Math.fround(Game.width - Math.fround(w * zoom)))), 2), $J.idiv($J.d2i((Math.fround(Game.height - Math.fround(h * zoom)))), 2), w, h, zoom);
    c.fullScreen = true;
    return c;
  }
  destroy(): void {
    this.panIntensity = 0;
  }
  zoom$float(value: number): void {
    this.zoom$float$float$float(value, Math.fround(this.scroll_.x + Math.fround(this.width_ / 2)), Math.fround(this.scroll_.y + Math.fround(this.height_ / 2)));
  }
  zoom$float$float$float(value: number, fx: number, fy: number): void {
    let offsetAdjust = this.centerOffset.clone();
    this.centerOffset.scale(this.zoom_).invScale(value);
    this.zoom_ = value;
    this.width_ = $J.d2i((Math.fround(this.screenWidth_ / this.zoom_)));
    this.height_ = $J.d2i((Math.fround(this.screenHeight_ / this.zoom_)));
    this.snapTo$float$float(Math.fround(fx - offsetAdjust.x), Math.fround(fy - offsetAdjust.y));
  }
  resize(width: number, height: number): void {
    this.width_ = width;
    this.height_ = height;
    this.screenWidth_ = $J.d2i((Math.fround(width * this.zoom_)));
    this.screenHeight_ = $J.d2i((Math.fround(height * this.zoom_)));
  }
  update(): void {
    super.update();
    let deadX = 0;
    let deadY = 0;
    if (this.followTarget_ != null && this.followTarget_.visible_) {
      this.panTarget.x = Math.fround(this.followTarget_.x + Math.fround(this.followTarget_.width() / 2));
      this.panTarget.y = Math.fround(this.followTarget_.y + Math.fround(this.followTarget_.height() / 2));
      this.panTarget.offset$PointF(this.centerOffset);
      deadX = Math.fround(Math.fround(this.width_ * this.followDeadzone) / 2);
      deadY = Math.fround(Math.fround(this.height_ * this.followDeadzone) / 2);
    }
    if (this.panIntensity > 0) {
      let panX = Math.fround(this.panTarget.x - (Math.fround(this.scroll_.x + Math.fround(this.width_ / 2))));
      let panY = Math.fround(this.panTarget.y - (Math.fround(this.scroll_.y + Math.fround(this.height_ / 2))));
      if (panX > deadX) {
        panX = Math.fround(panX - deadX);
      } else if (panX < Math.fround(-deadX)) {
        panX = Math.fround(panX + deadX);
      } else {
        panX = 0;
      }
      if (panY > deadY) {
        panY = Math.fround(panY - deadY);
      } else if (panY < Math.fround(-deadY)) {
        panY = Math.fround(panY + deadY);
      } else {
        panY = 0;
      }
      panX = Math.fround(panX * Math.min(1, Math.fround(Game.elapsed * this.panIntensity)));
      panY = Math.fround(panY * Math.min(1, Math.fround(Game.elapsed * this.panIntensity)));
      this.scroll_.offset$float$float(panX, panY);
    }
    if ((this.shakeTime = Math.fround(this.shakeTime - Game.elapsed)) > Math.fround(0)) {
      let damping = Math.fround(this.shakeTime / this.shakeDuration);
      this.shakeX = Math.fround(Random.Float$float$float(Math.fround(-this.shakeMagX), +this.shakeMagX) * damping);
      this.shakeY = Math.fround(Random.Float$float$float(Math.fround(-this.shakeMagY), +this.shakeMagY) * damping);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
    this.updateMatrix();
  }
  center(): PointF {
    return new PointF()._PointF$float$float(Math.fround($J.idiv(this.width_, 2)), Math.fround($J.idiv(this.height_, 2)));
  }
  hitTest(x: number, y: number): boolean {
    return x >= Math.fround(this.x) && y >= Math.fround(this.y) && x < Math.fround((this.x + this.screenWidth_) | 0) && y < Math.fround((this.y + this.screenHeight_) | 0);
  }
  shift(point: PointF): void {
    this.scroll_.offset$PointF(point);
    this.panIntensity = 0;
  }
  setCenterOffset(x: number, y: number): void {
    this.scroll_.x = Math.fround(this.scroll_.x + Math.fround(x - this.centerOffset.x));
    this.scroll_.y = Math.fround(this.scroll_.y + Math.fround(y - this.centerOffset.y));
    if (this.panTarget != null) {
      this.panTarget.x = Math.fround(this.panTarget.x + Math.fround(x - this.centerOffset.x));
      this.panTarget.y = Math.fround(this.panTarget.y + Math.fround(y - this.centerOffset.y));
    }
    this.centerOffset.set$float$float(x, y);
  }
  snapTo$float$float(x: number, y: number): void {
    this.scroll_.set$float$float(Math.fround(x - Math.fround(this.width_ / 2)), Math.fround(y - Math.fround(this.height_ / 2))).offset$PointF(this.centerOffset);
    this.panIntensity = 0;
    this.followTarget_ = null;
  }
  snapTo$PointF(point: PointF): void {
    this.snapTo$float$float(point.x, point.y);
  }
  panTo(dst: PointF, intensity: number): void {
    this.panTarget = dst.offset$PointF(this.centerOffset);
    this.panIntensity = intensity;
    this.followTarget_ = null;
  }
  panFollow(target: Visual, intensity: number): void {
    this.followTarget_ = target;
    this.panIntensity = intensity;
  }
  followTarget(): Visual {
    return this.followTarget_;
  }
  setFollowDeadzone(deadzone: number): void {
    this.followDeadzone = deadzone;
  }
  screenToCamera(x: number, y: number): PointF {
    return new PointF()._PointF$float$float(Math.fround(Math.fround(((x - this.x) | 0) / this.zoom_) + this.scroll_.x), Math.fround(Math.fround(((y - this.y) | 0) / this.zoom_) + this.scroll_.y));
  }
  cameraToScreen(x: number, y: number): Point {
    return new Point()._Point$int$int($J.d2i((Math.fround(Math.fround((Math.fround(x - this.scroll_.x)) * this.zoom_) + this.x))), $J.d2i((Math.fround(Math.fround((Math.fround(y - this.scroll_.y)) * this.zoom_) + this.y))));
  }
  screenWidth(): number {
    return Math.fround(this.width_ * this.zoom_);
  }
  screenHeight(): number {
    return Math.fround(this.height_ * this.zoom_);
  }
  updateMatrix(): void {
    this.matrix[0] = Math.fround(+this.zoom_ * Camera.invW2);
    this.matrix[5] = Math.fround(Math.fround(-this.zoom_) * Camera.invH2);
    this.matrix[12] = Math.fround(Math.fround(-1 + Math.fround(this.x * Camera.invW2)) - Math.fround((Math.fround(this.scroll_.x + this.shakeX)) * this.matrix[0]));
    this.matrix[13] = Math.fround(Math.fround(+1 - Math.fround(this.y * Camera.invH2)) - Math.fround((Math.fround(this.scroll_.y + this.shakeY)) * this.matrix[5]));
  }
  shake(magnitude: number, duration: number): void {
    this.shakeMagX = this.shakeMagY = magnitude;
    this.shakeTime = this.shakeDuration = duration;
  }
  static $clinit() {
    Camera.all = new ArrayList();
  }
}

$J.define(Camera, 'com.watabou.noosa.Camera', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'int,int,int,int,float': '_Camera' }, meths: { 'snapTo(com.watabou.utils.PointF)': 'snapTo$PointF', 'snapTo(float,float)': 'snapTo$float$float', 'zoom(float,float,float)': 'zoom$float$float$float', 'zoom(float)': 'zoom$float', 'reset(com.watabou.noosa.Camera)': 'reset$Camera', 'reset()': 'reset$' }, clinit: true, lazy: ['all', 'invW2', 'invH2', 'main'] });
$J.module(() => {
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Game = $J.load('com.watabou.noosa.Game');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
