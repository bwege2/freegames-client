// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/OptionSlider.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Chrome, Chrome$Type, PixelScene, ColorBlock, PointerArea, GameMath;

export class OptionSlider extends Component {
  pointerArea: PointerArea = null;
  title_: RenderedTextBlock = null;
  minTxt: RenderedTextBlock = null;
  maxTxt: RenderedTextBlock = null;
  minVal: number = 0;
  maxVal: number = 0;
  selectedVal: number = 0;
  sliderNode: NinePatch = null;
  BG: NinePatch = null;
  sliderBG: ColorBlock = null;
  sliderTicks: ColorBlock[] = null;
  tickDist: number = 0;
  _OptionSlider(title: string, minTxt: string, maxTxt: string, minVal: number, maxVal: number): this {
    this._Component();
    if (minVal > maxVal) {
      minVal = maxVal;
      this.active = false;
    }
    this.title_.text$String(title);
    this.minTxt.text$String(minTxt);
    this.maxTxt.text$String(maxTxt);
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.sliderTicks = $J.newArray((maxVal - minVal + 1) | 0, null);
    for (let i = 0; i < this.sliderTicks.length; i++) {
      this.add$Gizmo(this.sliderTicks[i] = new ColorBlock()._ColorBlock(1, 9, -14540254));
    }
    this.add$Gizmo(this.sliderNode);
    return this;
  }
  getSelectedValue(): number {
    return this.selectedVal;
  }
  setSelectedValue(val: number): void {
    this.selectedVal = val;
    this.sliderNode.x = Math.fround($J.d2i((Math.fround(this.x + Math.fround(this.tickDist * ((this.selectedVal - this.minVal) | 0))))) + 0.5);
    this.sliderNode.y = Math.fround(this.sliderBG.y - 4);
    PixelScene.align$Visual(this.sliderNode);
  }
  enable(value: boolean): void {
    this.active = value;
    this.title_.alpha(value ? 1 : Math.fround(0.3));
    this.minTxt.alpha(value ? 1 : Math.fround(0.3));
    this.maxTxt.alpha(value ? 1 : Math.fround(0.3));
    this.sliderNode.alpha$float(value ? 1 : Math.fround(0.3));
  }
  createChildren(): void {
    super.createChildren();
    this.add$Gizmo(this.BG = Chrome.get(Chrome$Type.RED_BUTTON));
    this.BG.alpha$float(0.5);
    this.add$Gizmo(this.title_ = PixelScene.renderTextBlock$int(9));
    this.add$Gizmo(this.minTxt = PixelScene.renderTextBlock$int(6));
    this.add$Gizmo(this.maxTxt = PixelScene.renderTextBlock$int(6));
    this.add$Gizmo(this.sliderBG = new ColorBlock()._ColorBlock(1, 1, -14540254));
    this.sliderNode = Chrome.get(Chrome$Type.RED_BUTTON);
    this.sliderNode.size(4, 7);
    this.pointerArea = new (OptionSlider$1())().$o(this)._PointerArea$float$float$float$float(0, 0, 0, 0).$init_anon();
    this.add$Gizmo(this.pointerArea);
  }
  layout(): void {
    if (this.title_.width() > Math.fround(Math.fround(0.6) * this.width_)) {
      let titleText = this.title_.text_;
      this.remove$Gizmo(this.title_);
      this.title_ = PixelScene.renderTextBlock$int(6);
      this.add$Gizmo(this.title_);
      this.title_.text$String(titleText);
    }
    this.title_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.title_.width())) / 2)), Math.fround(this.y + 2));
    PixelScene.align$Component(this.title_);
    this.sliderBG.y = Math.fround(Math.fround(this.y + this.height()) - 7);
    this.sliderBG.x = Math.fround(this.x + 2);
    this.sliderBG.size(Math.fround(this.width_ - 5), 1);
    this.tickDist = Math.fround(this.sliderBG.width() / ((this.maxVal - this.minVal) | 0));
    for (let i = 0; i < this.sliderTicks.length; i++) {
      this.sliderTicks[i].y = Math.fround(this.sliderBG.y - 4);
      this.sliderTicks[i].x = Math.fround(Math.fround(this.x + 2) + (Math.fround(this.tickDist * i)));
      PixelScene.align$Visual(this.sliderTicks[i]);
    }
    this.minTxt.setPos(Math.fround(this.x + 1), Math.fround(Math.fround(this.sliderBG.y - 5) - this.minTxt.height()));
    this.maxTxt.setPos(Math.fround(Math.fround(Math.fround(this.x + this.width()) - this.maxTxt.width()) - 1), Math.fround(Math.fround(this.sliderBG.y - 5) - this.minTxt.height()));
    this.sliderNode.x = Math.fround(Math.fround(this.x + Math.fround(this.tickDist * ((this.selectedVal - this.minVal) | 0))) + 0.5);
    this.sliderNode.y = Math.fround(this.sliderBG.y - 3);
    PixelScene.align$Visual(this.sliderNode);
    this.pointerArea.x = this.x;
    this.pointerArea.y = this.y;
    this.pointerArea.width_ = this.width();
    this.pointerArea.height_ = this.height();
    this.BG.size(this.width(), this.height());
    this.BG.x = this.x;
    this.BG.y = this.y;
  }
}

let $OptionSlider$1: any = null;
/** An anonymous class (OptionSlider.java:113). */
function OptionSlider$1(): any {
  return $OptionSlider$1 ??= $J.local(class extends PointerArea {
    pressed: boolean = false;
    $init_anon() {
      this.pressed = false;
      return this;
    }
    onPointerDown(event: PointerEvent): void {
      this.pressed = true;
      let p = this.camera().screenToCamera($J.d2i(event.current.x), $J.d2i(event.current.y));
      this.$outer.sliderNode.x = GameMath.gate(Math.fround(this.$outer.sliderBG.x - 2), Math.fround(p.x - Math.fround(this.$outer.sliderNode.width() / 2)), Math.fround(Math.fround(this.$outer.sliderBG.x + this.$outer.sliderBG.width()) - 2));
      this.$outer.sliderNode.brightness(1.5);
    }
    onPointerUp(event: PointerEvent): void {
      if (this.pressed) {
        let p = this.camera().screenToCamera($J.d2i(event.current.x), $J.d2i(event.current.y));
        this.$outer.sliderNode.x = GameMath.gate(Math.fround(this.$outer.sliderBG.x - 2), Math.fround(p.x - Math.fround(this.$outer.sliderNode.width() / 2)), Math.fround(Math.fround(this.$outer.sliderBG.x + this.$outer.sliderBG.width()) - 2));
        this.$outer.sliderNode.resetColor();
        this.$outer.selectedVal = (this.$outer.minVal + $J.roundf(Math.fround((Math.fround(this.$outer.sliderNode.x - this.x)) / this.$outer.tickDist))) | 0;
        this.$outer.sliderNode.x = Math.fround(Math.fround(this.x + Math.fround(this.$outer.tickDist * ((this.$outer.selectedVal - this.$outer.minVal) | 0))) + 0.5);
        PixelScene.align$Visual(this.$outer.sliderNode);
        this.$outer.onChange();
        this.pressed = false;
      }
    }
    onDrag(event: PointerEvent): void {
      if (this.pressed) {
        let p = this.camera().screenToCamera($J.d2i(event.current.x), $J.d2i(event.current.y));
        this.$outer.sliderNode.x = GameMath.gate(Math.fround(this.$outer.sliderBG.x - 2), Math.fround(p.x - Math.fround(this.$outer.sliderNode.width() / 2)), Math.fround(Math.fround(this.$outer.sliderBG.x + this.$outer.sliderBG.width()) - 2));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.OptionSlider$1', []);
}

$J.define(OptionSlider, 'com.shatteredpixel.shatteredpixeldungeon.ui.OptionSlider', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String,java.lang.String,java.lang.String,int,int': '_OptionSlider' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
