// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ScrollingListPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { ScrollPane } from './ScrollPane.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let PixelScene, Window, BitmapText, ColorBlock, Image;

export class ScrollingListPane extends ScrollPane {
  items_: ArrayList<Component> = null;
  static readonly ITEM_HEIGHT: number = 18;
  _ScrollingListPane(): this {
    this._ScrollPane(new Component()._Component());
    this.items_ = new ArrayList();
    return this;
  }
  onClick(x: number, y: number): void {
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if ((item instanceof ScrollingListPane$ListItem) && (item).onClick(x, y)) {
        break;
      }
    }
  }
  addItem$Image$String$String(icon: Image, iconText: string, text: string): void {
    this.addItem$ListItem(new ScrollingListPane$ListItem()._ScrollingListPane$ListItem$Image$String$String(icon, iconText, text));
  }
  addItem$ListItem(item: ScrollingListPane$ListItem): void {
    this.content_.add$Gizmo(item);
    this.items_.add(item);
    this.layout();
  }
  addTitle(text: string): void {
    let title = new ScrollingListPane$ListTitle()._ScrollingListPane$ListTitle(text);
    this.content_.add$Gizmo(title);
    this.items_.add(title);
    this.layout();
  }
  clear(): void {
    this.content_.clear();
    this.items_.clear();
  }
  layout(): void {
    super.layout();
    let pos = 0;
    for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      item.setRect(0, pos, this.width_, Math.fround(ScrollingListPane.ITEM_HEIGHT));
      pos = Math.fround(pos + item.height());
    }
    this.content_.setSize(this.width_, pos);
  }
}

export class ScrollingListPane$ListItem extends Component {
  icon_: Image = null;
  iconLabel: BitmapText = null;
  label: RenderedTextBlock = null;
  line: ColorBlock = null;
  _ScrollingListPane$ListItem$Image$String(icon: Image, text: string): this {
    this._ScrollingListPane$ListItem$Image$String$String(icon, null, text);
    return this;
  }
  _ScrollingListPane$ListItem$Image$String$String(icon: Image, iconText: string, text: string): this {
    this._Component();
    if (icon != null) {
      this.icon_.copy(icon);
    } else {
      this.remove$Gizmo(this.label);
      this.label = PixelScene.renderTextBlock$int(9);
      this.add$Gizmo(this.label);
    }
    this.label.text$String(text);
    if (iconText != null) {
      this.iconLabel.text$String(iconText);
      this.iconLabel.measure();
    }
    return this;
  }
  onClick(x: number, y: number): boolean {
    return false;
  }
  hardlight(color: number): void {
    this.iconLabel.hardlight$int(color);
    this.label.hardlight(color);
  }
  hardlightIcon(color: number): void {
    this.icon_.hardlight$int(color);
  }
  createChildren(): void {
    this.icon_ = new Image()._Image$();
    this.add$Gizmo(this.icon_);
    this.iconLabel = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.iconLabel);
    this.label = PixelScene.renderTextBlock$int(7);
    this.add$Gizmo(this.label);
    this.line = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.line);
  }
  layout(): void {
    this.icon_.y = Math.fround(Math.fround(this.y + 1) + Math.fround((Math.fround(Math.fround(this.height() - 1) - this.icon_.height())) / 2));
    this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(16 - this.icon_.width())) / 2));
    PixelScene.align$Visual(this.icon_);
    this.iconLabel.x = Math.fround(this.icon_.x + Math.fround((Math.fround(this.icon_.width_ - this.iconLabel.width())) / 2));
    this.iconLabel.y = Math.fround(Math.fround(this.icon_.y + Math.fround((Math.fround(this.icon_.height_ - this.iconLabel.height())) / 2)) + 0.5);
    PixelScene.align$Visual(this.iconLabel);
    this.line.size(this.width_, 1);
    this.line.x = this.x;
    this.line.y = this.y;
    this.label.maxWidth$int($J.d2i((Math.fround(Math.fround(this.width_ - 16) - 1))));
    this.label.setPos(Math.fround(this.x + 17), Math.fround(this.y + Math.fround((Math.fround(this.height() - this.label.height())) / 2)));
    PixelScene.align$Component(this.label);
  }
}

export class ScrollingListPane$ListTitle extends Component {
  label: RenderedTextBlock = null;
  line: ColorBlock = null;
  _ScrollingListPane$ListTitle(title: string): this {
    this._Component();
    this.label.text$String(title);
    return this;
  }
  createChildren(): void {
    this.label = PixelScene.renderTextBlock$int(9);
    this.label.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.label);
    this.line = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.line);
  }
  layout(): void {
    this.line.size(this.width_, 1);
    this.line.x = this.x;
    this.line.y = this.y;
    this.label.maxWidth$int($J.d2i((Math.fround(this.width_ - 1))));
    this.label.setPos(Math.fround((Math.fround(this.width_ - this.label.width())) / 2), Math.fround(this.y + Math.fround((Math.fround(this.height() - this.label.height())) / 2)));
    PixelScene.align$Component(this.label);
  }
}

$J.define(ScrollingListPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane', ctors: { '': '_ScrollingListPane' }, meths: { 'addItem(com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane$ListItem)': 'addItem$ListItem', 'addItem(com.watabou.noosa.Image,java.lang.String,java.lang.String)': 'addItem$Image$String$String' } });
$J.define(ScrollingListPane$ListItem, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane$ListItem', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String': '_ScrollingListPane$ListItem$Image$String$String', 'com.watabou.noosa.Image,java.lang.String': '_ScrollingListPane$ListItem$Image$String' } });
$J.define(ScrollingListPane$ListTitle, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane$ListTitle', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String': '_ScrollingListPane$ListTitle' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Image = $J.load('com.watabou.noosa.Image');
});
