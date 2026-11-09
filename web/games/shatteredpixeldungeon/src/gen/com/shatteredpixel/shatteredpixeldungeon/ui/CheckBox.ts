// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/CheckBox.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RedButton } from './RedButton.ts';

let PixelScene, Icons;

export class CheckBox extends RedButton {
  checked: boolean = false;
  _CheckBox(label: string): this {
    this._RedButton$String(label);
    this.checked = false;
    this.icon$Image(Icons.get$Icons(Icons.UNCHECKED));
    return this;
  }
  layout(): void {
    super.layout();
    let margin = Math.fround((Math.fround(this.height_ - this.text_.height())) / 2);
    this.text_.setPos(Math.fround(this.x + margin), Math.fround(this.y + margin));
    PixelScene.align$Component(this.text_);
    margin = Math.fround((Math.fround(this.height_ - this.icon_.height_)) / 2);
    this.icon_.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - margin) - this.icon_.width_);
    this.icon_.y = Math.fround(this.y + margin);
    PixelScene.align$Visual(this.icon_);
    let size = 9;
    while (this.width_ > Math.fround(0) && this.text_.right() > this.icon_.x) {
      size--;
      this.remove$Gizmo(this.text_);
      this.text_ = PixelScene.renderTextBlock$String$int(this.text_.text_, size);
      margin = Math.fround((Math.fround(this.height_ - this.text_.height())) / 2);
      this.text_.setPos(Math.fround(this.x + margin), Math.fround(this.y + margin));
      PixelScene.align$Component(this.text_);
      this.add$Gizmo(this.text_);
    }
  }
  checked$(): boolean {
    return this.checked;
  }
  checked$boolean(value: boolean): void {
    if (this.checked !== value) {
      this.checked = value;
      this.icon_.copy(Icons.get$Icons(this.checked ? Icons.CHECKED : Icons.UNCHECKED));
    }
  }
  onClick(): void {
    super.onClick();
    this.checked$boolean(!this.checked);
  }
}

$J.define(CheckBox, 'com.shatteredpixel.shatteredpixeldungeon.ui.CheckBox', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.RedButton', ctors: { 'java.lang.String': '_CheckBox' }, meths: { 'checked(boolean)': 'checked$boolean', 'checked()': 'checked$' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
});
