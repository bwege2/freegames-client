// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/StyledButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Button } from './Button.ts';

let Assets$Sounds, Chrome, PixelScene, Sample;

export class StyledButton extends Button {
  bg: NinePatch = null;
  text_: RenderedTextBlock = null;
  icon_: Image = null;
  leftJustify: boolean = false;
  multiline: boolean = false;
  $init_StyledButton() {
    this.leftJustify = false;
  }
  _StyledButton$Type$String(type$: Chrome$Type, label: string): this {
    this._StyledButton$Type$String$int(type$, label, 9);
    return this;
  }
  _StyledButton$Type$String$int(type$: Chrome$Type, label: string, size: number): this {
    this._Button();
    this.$init_StyledButton();
    this.bg = Chrome.get(type$);
    this.addToBack(this.bg);
    this.text_ = PixelScene.renderTextBlock$int(size);
    this.text_.text$String(label);
    this.add$Gizmo(this.text_);
    return this;
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    let componentWidth = 0;
    if (this.icon_ != null) {
      componentWidth = Math.fround(componentWidth + Math.fround(this.icon_.width() + 2));
    }
    if (this.text_ != null && !$J.equals(this.text_.text$(), '')) {
      if (this.multiline) {
        this.text_.maxWidth$int($J.d2i((Math.fround(Math.fround(Math.fround(this.width_ - componentWidth) - this.bg.marginHor()) - 2))));
      }
      componentWidth = Math.fround(componentWidth + Math.fround(this.text_.width() + 2));
      this.text_.setPos(Math.fround(Math.fround(Math.fround(this.x + Math.fround((Math.fround(this.width() + componentWidth)) / 2)) - this.text_.width()) - 1), Math.fround(this.y + Math.fround((Math.fround(this.height() - this.text_.height())) / 2)));
      PixelScene.align$Component(this.text_);
    }
    if (this.icon_ != null) {
      this.icon_.x = Math.fround(Math.fround(this.x + Math.fround((Math.fround(this.width() - componentWidth)) / 2)) + 1);
      this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height() - this.icon_.height())) / 2));
      PixelScene.align$Visual(this.icon_);
    }
    if (this.leftJustify) {
      if (this.icon_ != null) {
        this.icon_.x = Math.fround(Math.fround(this.x + this.bg.marginLeft()) + 1);
        PixelScene.align$Visual(this.icon_);
        this.text_.setPos(Math.fround(Math.fround(this.icon_.x + this.icon_.width()) + 1), this.text_.top());
        PixelScene.align$Component(this.text_);
      } else if (this.text_ != null) {
        this.text_.setPos(Math.fround(Math.fround(this.x + this.bg.marginLeft()) + 1), this.text_.top());
        PixelScene.align$Component(this.text_);
      }
    }
  }
  onPointerDown(): void {
    this.bg.brightness(Math.fround(1.2));
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
    this.bg.resetColor();
  }
  enable(value: boolean): void {
    this.active = value;
    this.text_.alpha(value ? 1 : Math.fround(0.3));
    if (this.icon_ != null) {
      this.icon_.alpha$float(value ? 1 : Math.fround(0.3));
    }
  }
  text$String(value: string): void {
    this.text_.text$String(value);
    this.layout();
  }
  text$(): string {
    return this.text_.text$();
  }
  textColor(value: number): void {
    this.text_.hardlight(value);
  }
  icon$Image(icon: Image): void {
    if (this.icon_ != null) {
      this.remove$Gizmo(this.icon_);
    }
    this.icon_ = icon;
    if (this.icon_ != null) {
      this.add$Gizmo(this.icon_);
      this.layout();
    }
  }
  icon$(): Image {
    return this.icon_;
  }
  alpha$float(value: number): void {
    if (this.icon_ != null) {
      this.icon_.alpha$float(value);
    }
    if (this.bg != null) {
      this.bg.alpha$float(value);
    }
    if (this.text_ != null) {
      this.text_.alpha(value);
    }
  }
  alpha$(): number {
    if (this.icon_ != null) {
      return this.icon_.alpha$();
    } else {
      return this.bg.alpha$();
    }
  }
  reqWidth(): number {
    let reqWidth = 0;
    if (this.icon_ != null) {
      reqWidth = Math.fround(reqWidth + Math.fround(this.icon_.width() + 2));
    }
    if (this.text_ != null && !$J.equals(this.text_.text$(), '')) {
      reqWidth = Math.fround(reqWidth + Math.fround(this.text_.width() + 2));
    }
    return reqWidth;
  }
  reqHeight(): number {
    let reqHeight = 0;
    if (this.icon_ != null) {
      reqHeight = Math.max(Math.fround(this.icon_.height() + 4), reqHeight);
    }
    if (this.text_ != null && !$J.equals(this.text_.text$(), '')) {
      reqHeight = Math.max(Math.fround(this.text_.height() + 4), reqHeight);
    }
    return reqHeight;
  }
}

$J.define(StyledButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String,int': '_StyledButton$Type$String$int', 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String': '_StyledButton$Type$String' }, meths: { 'alpha()': 'alpha$', 'alpha(float)': 'alpha$float', 'icon()': 'icon$', 'icon(com.watabou.noosa.Image)': 'icon$Image', 'text()': 'text$', 'text(java.lang.String)': 'text$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
