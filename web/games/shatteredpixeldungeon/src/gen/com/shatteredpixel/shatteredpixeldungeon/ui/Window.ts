// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Window.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Group } from '../../../watabou/noosa/Group.ts';

let Chrome, Chrome$Type, SPDAction, ShadowBox, PixelScene, KeyBindings, KeyEvent, Camera, Game, PointerArea, PlatformSupport, Point;

export class Window extends Group {
  width_: number = 0;
  height_: number = 0;
  xOffset: number = 0;
  yOffset: number = 0;
  blocker: PointerArea = null;
  shadow: ShadowBox = null;
  chrome: NinePatch = null;
  static readonly WHITE: number = 16777215;
  static readonly TITLE_COLOR: number = 16777028;
  static readonly SHPX_COLOR: number = 3390259;
  _Window$(): this {
    this._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.WINDOW));
    return this;
  }
  _Window$int$int(width: number, height: number): this {
    this._Window$int$int$NinePatch(width, height, Chrome.get(Chrome$Type.WINDOW));
    return this;
  }
  _Window$int$int$NinePatch(width: number, height: number, chrome: NinePatch): this {
    this._Group();
    this.blocker = new (Window$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    this.blocker.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(this.blocker);
    this.chrome = chrome;
    this.width_ = width;
    this.height_ = height;
    this.shadow = new ShadowBox()._ShadowBox();
    this.shadow.am = 0.5;
    this.shadow.camera_ = PixelScene.uiCamera.visible_ ? PixelScene.uiCamera : Camera.main;
    this.add$Gizmo(this.shadow);
    chrome.x = Math.fround(-chrome.marginLeft());
    chrome.y = Math.fround(-chrome.marginTop());
    chrome.size(Math.fround(Math.fround(width - chrome.x) + chrome.marginRight()), Math.fround(Math.fround(height - chrome.y) + chrome.marginBottom()));
    this.add$Gizmo(chrome);
    let insets = Game.platform.getSafeInsets(PlatformSupport.INSET_BLK);
    let screenW = $J.d2i((Math.fround(Math.fround(Game.width - insets.left_) - insets.right_)));
    let screenH = $J.d2i((Math.fround(Math.fround(Game.height - insets.top_) - insets.bottom_)));
    this.camera_ = new Camera()._Camera(0, 0, $J.d2i(chrome.width_), $J.d2i(chrome.height_), Math.fround(PixelScene.defaultZoom));
    this.camera_.x = $J.d2i((Math.fround(insets.left_ + Math.fround((Math.fround(screenW - Math.fround(this.camera_.width_ * this.camera_.zoom_))) / 2))));
    this.camera_.y = $J.d2i((Math.fround(insets.top_ + Math.fround((Math.fround(screenH - Math.fround(this.camera_.height_ * this.camera_.zoom_))) / 2))));
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y - Math.fround(this.yOffset * this.camera_.zoom_)));
    this.camera_.scroll_.set$float$float(chrome.x, chrome.y);
    Camera.add(this.camera_);
    this.shadow.boxRect(Math.fround(this.camera_.x / this.camera_.zoom_), Math.fround(this.camera_.y / this.camera_.zoom_), chrome.width(), chrome.height_);
    KeyEvent.addKeyListener(this);
    return this;
  }
  resize(w: number, h: number): void {
    this.width_ = w;
    this.height_ = h;
    this.chrome.size(Math.fround((this.width_ + this.chrome.marginHor()) | 0), Math.fround((this.height_ + this.chrome.marginVer()) | 0));
    this.camera_.resize($J.d2i(this.chrome.width_), $J.d2i(this.chrome.height_));
    let insets = Game.platform.getSafeInsets(PlatformSupport.INSET_BLK);
    let screenW = $J.d2i((Math.fround(Math.fround(Game.width - insets.left_) - insets.right_)));
    let screenH = $J.d2i((Math.fround(Math.fround(Game.height - insets.top_) - insets.bottom_)));
    this.camera_.x = $J.idiv($J.d2i((Math.fround(screenW - this.camera_.screenWidth()))), 2);
    this.camera_.x = $J.d2i(Math.fround(this.camera_.x + insets.left_));
    this.camera_.x = $J.d2i(Math.fround(this.camera_.x + Math.fround(this.xOffset * this.camera_.zoom_)));
    this.camera_.y = $J.idiv($J.d2i((Math.fround(screenH - this.camera_.screenHeight()))), 2);
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y + insets.top_));
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y + Math.fround(this.yOffset * this.camera_.zoom_)));
    this.shadow.boxRect(Math.fround(this.camera_.x / this.camera_.zoom_), Math.fround(this.camera_.y / this.camera_.zoom_), this.chrome.width(), this.chrome.height_);
  }
  getOffset(): Point {
    return new Point()._Point$int$int(this.xOffset, this.yOffset);
  }
  offset$Point(offset: Point): void {
    this.offset$int$int(offset.x, offset.y);
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    this.camera_.x = $J.d2i(Math.fround(this.camera_.x - Math.fround(this.xOffset * this.camera_.zoom_)));
    this.xOffset = xOffset;
    this.camera_.x = $J.d2i(Math.fround(this.camera_.x + Math.fround(xOffset * this.camera_.zoom_)));
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y - Math.fround(this.yOffset * this.camera_.zoom_)));
    this.yOffset = yOffset;
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y + Math.fround(yOffset * this.camera_.zoom_)));
    this.shadow.boxRect(Math.fround(this.camera_.x / this.camera_.zoom_), Math.fround(this.camera_.y / this.camera_.zoom_), this.chrome.width(), this.chrome.height_);
  }
  boundOffsetWithMargin(margin: number): void {
    let x = Math.fround(this.camera_.x / this.camera_.zoom_);
    let y = Math.fround(this.camera_.y / this.camera_.zoom_);
    let sceneCam = PixelScene.uiCamera.visible_ ? PixelScene.uiCamera : Camera.main;
    let newXOfs = this.xOffset;
    if (newXOfs !== 0) {
      if (x < Math.fround(margin)) {
        newXOfs = $J.d2i(Math.fround(newXOfs + Math.fround(margin - x)));
      } else if (Math.fround(x + this.camera_.width_) > Math.fround((sceneCam.width_ - margin) | 0)) {
        newXOfs = $J.d2i(Math.fround(newXOfs + Math.fround(((sceneCam.width_ - margin) | 0) - (Math.fround(x + this.camera_.width_)))));
      }
    }
    let newYOfs = this.yOffset;
    if (newYOfs !== 0) {
      if (y < Math.fround(margin)) {
        newYOfs = $J.d2i(Math.fround(newYOfs + Math.fround(margin - y)));
      } else if (Math.fround(y + this.camera_.height_) > Math.fround((sceneCam.height_ - margin) | 0)) {
        newYOfs = $J.d2i(Math.fround(newYOfs + Math.fround(((sceneCam.height_ - margin) | 0) - (Math.fround(y + this.camera_.height_)))));
      }
    }
    this.offset$int$int(newXOfs, newYOfs);
  }
  hide(): void {
    if (this.parent != null) {
      this.parent.erase(this);
    }
    this.destroy();
  }
  destroy(): void {
    super.destroy();
    Camera.remove(this.camera_);
    KeyEvent.removeKeyListener(this);
  }
  onSignal(event: KeyEvent): boolean {
    if (event.pressed) {
      if (KeyBindings.getActionForKey(event) === SPDAction.BACK || KeyBindings.getActionForKey(event) === SPDAction.WAIT) {
        this.onBackPressed();
      }
    }
    return true;
  }
  onBackPressed(): void {
    this.hide();
  }
}

let $Window$1: any = null;
/** An anonymous class (Window.java:68). */
function Window$1(): any {
  return $Window$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      if (this.$outer.parent != null && !this.$outer.chrome.overlapsScreenPoint($J.d2i(event.current.x), $J.d2i(event.current.y))) {
        this.$outer.onBackPressed();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Window$1', []);
}

$J.define(Window, 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', { kind: 'class', ifaces: ['com.watabou.utils.Signal$Listener'], sup: 'com.watabou.noosa.Group', ctors: { 'int,int,com.watabou.noosa.NinePatch': '_Window$int$int$NinePatch', 'int,int': '_Window$int$int', '': '_Window$' }, meths: { 'offset(int,int)': 'offset$int$int', 'offset(com.watabou.utils.Point)': 'offset$Point' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  ShadowBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.ShadowBox');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  PlatformSupport = $J.load('com.watabou.utils.PlatformSupport');
  Point = $J.load('com.watabou.utils.Point');
});
