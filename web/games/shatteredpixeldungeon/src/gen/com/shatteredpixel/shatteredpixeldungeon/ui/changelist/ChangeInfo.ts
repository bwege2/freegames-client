// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/ChangeInfo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Component } from '../../../../watabou/noosa/ui/Component.ts';

let PixelScene, ColorBlock;

export class ChangeInfo extends Component {
  line: ColorBlock = null;
  title_: RenderedTextBlock = null;
  major: boolean = false;
  text_: RenderedTextBlock = null;
  buttons: ArrayList<ChangeButton> = null;
  _ChangeInfo(title: string, majorTitle: boolean, text: string): this {
    this._Component();
    this.buttons = new ArrayList();
    if (majorTitle) {
      this.title_ = PixelScene.renderTextBlock$String$int(title, 9);
      this.line = new ColorBlock()._ColorBlock(1, 1, -14540254);
      this.add$Gizmo(this.line);
    } else {
      this.title_ = PixelScene.renderTextBlock$String$int(title, 6);
      this.line = new ColorBlock()._ColorBlock(1, 1, -13421773);
      this.add$Gizmo(this.line);
    }
    this.major = majorTitle;
    this.add$Gizmo(this.title_);
    if (text != null && !$J.equals(text, '')) {
      this.text_ = PixelScene.renderTextBlock$String$int(text, 6);
      this.add$Gizmo(this.text_);
    }
    return this;
  }
  hardlight(color: number): void {
    this.title_.hardlight(color);
    if (this.text_ != null) {
      this.text_.hardlight(color);
    }
  }
  addButton(button: ChangeButton): void {
    this.buttons.add(button);
    this.add$Gizmo(button);
    button.setSize(16, 16);
    this.layout();
  }
  onClick(x: number, y: number): boolean {
    for (const $it0 = this.buttons.iterator(); $it0.hasNext(); ) {
      let button = $it0.next();
      if (button.inside(x, y)) {
        button.onClick();
        return true;
      }
    }
    return false;
  }
  layout(): void {
    let posY = Math.fround(this.y + 3);
    if (this.major) {
      posY = Math.fround(posY + 2);
    }
    this.title_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.title_.width())) / 2)), posY);
    PixelScene.align$Component(this.title_);
    posY = Math.fround(posY + Math.fround(this.title_.height() + 2));
    if (this.text_ != null) {
      this.text_.maxWidth$int($J.d2i(this.width()));
      this.text_.setPos(this.x, posY);
      posY = Math.fround(posY + this.text_.height());
    }
    let posX = this.x;
    let tallest = 0;
    for (const $it1 = this.buttons.iterator(); $it1.hasNext(); ) {
      let change = $it1.next();
      if (Math.fround(posX + change.width()) >= this.right()) {
        posX = this.x;
        posY = Math.fround(posY + tallest);
        tallest = 0;
      }
      if (posX === this.x) {
        let offset = this.width_;
        for (const $it2 = this.buttons.iterator(); $it2.hasNext(); ) {
          let b = $it2.next();
          offset = Math.fround(offset - b.width());
          if (offset <= Math.fround(0)) {
            offset = Math.fround(offset + b.width());
            break;
          }
        }
        posX = Math.fround(posX + Math.fround(offset / 2));
      }
      change.setPos(posX, posY);
      posX = Math.fround(posX + change.width());
      if (tallest < change.height()) {
        tallest = change.height();
      }
    }
    posY = Math.fround(posY + Math.fround(tallest + 2));
    this.height_ = Math.fround(posY - this.y);
    if (this.major) {
      this.line.size(this.width(), 1);
      this.line.x = this.x;
      this.line.y = Math.fround(this.y + 2);
    } else if (this.x === Math.fround(0)) {
      this.line.size(1, this.height());
      this.line.x = this.width_;
      this.line.y = this.y;
    } else {
      this.line.size(1, this.height());
      this.line.x = this.x;
      this.line.y = this.y;
    }
  }
}

$J.define(ChangeInfo, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String,boolean,java.lang.String': '_ChangeInfo' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
});
