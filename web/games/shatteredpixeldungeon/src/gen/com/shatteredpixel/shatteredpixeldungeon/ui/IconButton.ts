// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/IconButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, PixelScene, Sample;

export class IconButton extends Button {
  icon_: Image = null;
  _IconButton$(): this {
    this._Button();
    return this;
  }
  _IconButton$Image(icon: Image): this {
    this._Button();
    this.icon$Image(icon);
    return this;
  }
  layout(): void {
    super.layout();
    if (this.icon_ != null) {
      this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.icon_.width())) / 2));
      this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height())) / 2));
      PixelScene.align$Visual(this.icon_);
    }
  }
  onPointerDown(): void {
    if (this.icon_ != null) {
      this.icon_.brightness(1.5);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
    if (this.icon_ != null) {
      this.icon_.resetColor();
    }
  }
  enable(value: boolean): void {
    this.active = value;
    if (this.icon_ != null) {
      this.icon_.alpha$float(value ? 1 : Math.fround(0.3));
    }
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
}

$J.define(IconButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'com.watabou.noosa.Image': '_IconButton$Image', '': '_IconButton$' }, meths: { 'icon()': 'icon$', 'icon(com.watabou.noosa.Image)': 'icon$Image' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
