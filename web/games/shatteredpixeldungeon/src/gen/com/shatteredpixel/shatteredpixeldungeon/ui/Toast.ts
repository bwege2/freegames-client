// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Toast.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Chrome, Chrome$Type, PixelScene, IconButton, Icons, GameAction;

export class Toast extends Component {
  static readonly MARGIN_HOR: number = 2;
  static readonly MARGIN_VER: number = 2;
  bg: NinePatch = null;
  close: IconButton = null;
  text_: RenderedTextBlock = null;
  _Toast(text: string): this {
    this._Component();
    this.text(text);
    this.width_ = Math.fround(Math.fround(Math.fround(this.text_.width() + this.close.width()) + this.bg.marginHor()) + Math.fround(Toast.MARGIN_HOR * 3));
    this.height_ = Math.fround(Math.fround(Math.max(this.text_.height(), this.close.height()) + this.bg.marginVer()) + Math.fround(Toast.MARGIN_VER * 2));
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.TOAST_TR);
    this.add$Gizmo(this.bg);
    this.close = new (Toast$1())().$o(this)._IconButton$Image(Icons.get$Icons(Icons.CLOSE));
    this.close.setSize(this.close.icon_.width(), this.close.icon_.height());
    this.add$Gizmo(this.close);
    this.text_ = PixelScene.renderTextBlock$int(8);
    this.add$Gizmo(this.text_);
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    this.close.setPos(Math.fround(Math.fround(Math.fround(Math.fround(this.bg.x + this.bg.width()) - Math.fround(this.bg.marginHor() / 2)) - Toast.MARGIN_HOR) - this.close.width()), Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.close.height())) / 2)));
    PixelScene.align$Component(this.close);
    this.text_.setPos(Math.fround(Math.fround(this.close.left() - Toast.MARGIN_HOR) - this.text_.width()), Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.text_.height())) / 2)));
    PixelScene.align$Component(this.text_);
  }
  text(txt: string): void {
    this.text_.text$String(txt);
  }
  onClose(): void {
  }
}

let $Toast$1: any = null;
/** An anonymous class (Toast.java:54). */
function Toast$1(): any {
  return $Toast$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      this.$outer.onClose();
    }
    keyAction(): GameAction {
      return GameAction.BACK;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toast$1', []);
}

$J.define(Toast, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toast', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String': '_Toast' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  GameAction = $J.load('com.watabou.input.GameAction');
});
