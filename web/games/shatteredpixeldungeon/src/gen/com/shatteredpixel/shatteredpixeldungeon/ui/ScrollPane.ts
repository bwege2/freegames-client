// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ScrollPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { ScrollArea } from '../../../watabou/noosa/ScrollArea.ts';

let SPDAction, PixelScene, KeyBindings, KeyEvent, Camera, ColorBlock, Game, GameMath, PointF;

export class ScrollPane extends Component {
  static readonly THUMB_COLOR: number = -8683405;
  static readonly THUMB_ALPHA: number = 0.5;
  controller: ScrollPane$PointerController = null;
  keyListener: Signal$Listener<KeyEvent> = null;
  content_: Component = null;
  thumb: ColorBlock = null;
  keyScroll: number = 0;
  _ScrollPane(content: Component): this {
    this._Component();
    this.keyScroll = 0;
    this.content_ = content;
    this.addToBack(content);
    this.width_ = content.width();
    this.height_ = content.height();
    content.camera_ = new Camera()._Camera(0, 0, 1, 1, Math.fround(PixelScene.defaultZoom));
    Camera.add(content.camera_);
    KeyEvent.addKeyListener(this.keyListener = new (ScrollPane$1())().$o(this));
    return this;
  }
  destroy(): void {
    super.destroy();
    Camera.remove(this.content_.camera_);
    KeyEvent.removeKeyListener(this.keyListener);
  }
  scrollTo(x: number, y: number): void {
    let c = this.content_.camera_;
    c.scroll_.set$float$float(x, y);
    if (Math.fround(c.scroll_.x + this.width_) > this.content_.width()) {
      c.scroll_.x = Math.fround(this.content_.width() - this.width_);
    }
    if (c.scroll_.x < Math.fround(0)) {
      c.scroll_.x = 0;
    }
    if (Math.fround(c.scroll_.y + this.height_) > this.content_.height()) {
      c.scroll_.y = Math.fround(this.content_.height() - this.height_);
    }
    if (c.scroll_.y < Math.fround(0)) {
      c.scroll_.y = 0;
    }
    this.thumb.y = Math.fround(this.y + Math.fround(Math.fround(this.height_ * c.scroll_.y) / this.content_.height()));
  }
  update(): void {
    super.update();
    if (this.keyScroll !== Math.fround(0)) {
      this.scrollTo(this.content_.camera_.scroll_.x, Math.fround(this.content_.camera_.scroll_.y + (Math.fround(Math.fround(this.keyScroll * 150) * Game.elapsed))));
    }
  }
  createChildren(): void {
    this.controller = new ScrollPane$PointerController().$o(this)._ScrollPane$PointerController();
    this.add$Gizmo(this.controller);
    this.thumb = new ColorBlock()._ColorBlock(1, 1, ScrollPane.THUMB_COLOR);
    this.thumb.am = ScrollPane.THUMB_ALPHA;
    this.add$Gizmo(this.thumb);
  }
  layout(): void {
    this.content_.setPos(0, 0);
    this.controller.x = this.x;
    this.controller.y = this.y;
    this.controller.width_ = this.width_;
    this.controller.height_ = this.height_;
    let p = this.camera().cameraToScreen(this.x, this.y);
    let cs = this.content_.camera_;
    cs.x = p.x;
    cs.y = p.y;
    cs.resize($J.d2i(this.width_), $J.d2i(this.height_));
    this.thumb.visible_ = this.height_ < this.content_.height();
    if (this.thumb.visible_) {
      this.thumb.scale_.set$float$float(2, Math.fround(Math.fround(this.height_ * this.height_) / this.content_.height()));
      this.thumb.x = Math.fround(this.right() - this.thumb.width());
      this.thumb.y = Math.fround(this.y + Math.fround(Math.fround(this.height_ * this.content_.camera_.scroll_.y) / this.content_.height()));
    }
  }
  content(): Component {
    return this.content_;
  }
  onClick(x: number, y: number): void {
  }
}

export class ScrollPane$PointerController extends ScrollArea {
  dragThreshold: number = 0;
  dragging: boolean = false;
  lastPos: PointF = null;
  _ScrollPane$PointerController(): this {
    this._ScrollArea$float$float$float$float(0, 0, 0, 0);
    this.dragging = false;
    this.lastPos = new PointF()._PointF$();
    this.dragThreshold = Math.fround(Math.imul(PixelScene.defaultZoom, 8));
    return this;
  }
  onScroll(event: ScrollEvent): void {
    let newPt = new PointF()._PointF$PointF(this.lastPos);
    newPt.y = Math.fround(newPt.y - Math.fround(Math.fround(event.amount * this.$outer.content_.camera_.zoom_) * 10));
    this.scroll(newPt);
    this.dragging = false;
  }
  onPointerUp(event: PointerEvent): void {
    if (event === this.curEvent && this.dragging) {
      this.dragging = false;
      this.$outer.thumb.am = ScrollPane.THUMB_ALPHA;
      this.curEvent = null;
    }
  }
  onClick(event: PointerEvent): void {
    let p = this.$outer.content_.camera_.screenToCamera($J.d2i(event.current.x), $J.d2i(event.current.y));
    this.$outer.onClick(p.x, p.y);
  }
  onDrag(event: PointerEvent): void {
    if (this.dragging) {
      this.scroll(event.current);
    } else if (PointF.distance(event.current, event.start_) > this.dragThreshold) {
      this.dragging = true;
      this.lastPos.set$PointF(event.current);
      this.$outer.thumb.am = 1;
    }
  }
  scroll(current: PointF): void {
    let c = this.$outer.content_.camera_;
    c.shift(PointF.diff(this.lastPos, current).invScale(c.zoom_));
    if (Math.fround(c.scroll_.x + this.width_) > this.$outer.content_.width()) {
      c.scroll_.x = Math.fround(this.$outer.content_.width() - this.width_);
    }
    if (c.scroll_.x < Math.fround(0)) {
      c.scroll_.x = 0;
    }
    if (Math.fround(c.scroll_.y + this.height_) > this.$outer.content_.height()) {
      c.scroll_.y = Math.fround(this.$outer.content_.height() - this.height_);
    }
    if (c.scroll_.y < Math.fround(0)) {
      c.scroll_.y = 0;
    }
    this.$outer.thumb.y = Math.fround(this.y + Math.fround(Math.fround(this.height_ * c.scroll_.y) / this.$outer.content_.height()));
    this.lastPos.set$PointF(current);
  }
}

let $ScrollPane$1: any = null;
/** An anonymous class (ScrollPane.java:65). */
function ScrollPane$1(): any {
  return $ScrollPane$1 ??= $J.local(class extends JObject {
    onSignal(keyEvent: KeyEvent): boolean {
      let action = KeyBindings.getActionForKey(keyEvent);
      if (action === SPDAction.ZOOM_IN) {
        if (keyEvent.pressed) {
          this.$outer.keyScroll = Math.fround(this.$outer.keyScroll + 1);
        } else {
          this.$outer.keyScroll = Math.fround(this.$outer.keyScroll - 1);
        }
        this.$outer.keyScroll = GameMath.gate(Math.fround(-1), this.$outer.keyScroll, +1);
        return true;
      } else if (action === SPDAction.ZOOM_OUT) {
        if (keyEvent.pressed) {
          this.$outer.keyScroll = Math.fround(this.$outer.keyScroll - 1);
        } else {
          this.$outer.keyScroll = Math.fround(this.$outer.keyScroll + 1);
        }
        this.$outer.keyScroll = GameMath.gate(Math.fround(-1), this.$outer.keyScroll, +1);
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane$1', ['com.watabou.utils.Signal$Listener']);
}

$J.define(ScrollPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.ui.Component': '_ScrollPane' } });
$J.define(ScrollPane$PointerController, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane$PointerController', { kind: 'class', sup: 'com.watabou.noosa.ScrollArea', ctors: { '': '_ScrollPane$PointerController' }, inner: true });
$J.module(() => {
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Camera = $J.load('com.watabou.noosa.Camera');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PointF = $J.load('com.watabou.utils.PointF');
});
