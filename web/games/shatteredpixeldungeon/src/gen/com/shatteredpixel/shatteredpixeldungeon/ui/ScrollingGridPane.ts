// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ScrollingGridPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let PixelScene, ItemSprite, RenderedTextBlock, ColorBlock, Image;

export class ScrollingGridPane extends ScrollPane {
  items_: ArrayList<Component> = null;
  separators: ArrayList<ColorBlock> = null;
  static readonly ITEM_SIZE: number = 17;
  static readonly MIN_GROUP_SIZE: number = 54;
  _ScrollingGridPane(): this {
    this._ScrollPane(new Component()._Component());
    this.items_ = new ArrayList();
    this.separators = new ArrayList();
    return this;
  }
  onClick(x: number, y: number): void {
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if ((item instanceof ScrollingGridPane$GridItem) && (item).onClick(x, y)) {
        break;
      }
    }
  }
  addItem(item: ScrollingGridPane$GridItem): void {
    this.content_.add$Gizmo(item);
    this.items_.add(item);
  }
  addHeader$String(text: string): void {
    this.addHeader$String$int$boolean(text, 7, false);
  }
  addHeader$String$int$boolean(text: string, size: number, center: boolean): void {
    let header = new ScrollingGridPane$GridHeader()._ScrollingGridPane$GridHeader$String$int$boolean(text, size, center);
    this.content_.add$Gizmo(header);
    this.items_.add(header);
  }
  clear(): void {
    this.content_.clear();
    this.items_.clear();
    this.separators.clear();
  }
  layout(): void {
    let left = 0;
    let top = 0;
    let sepsUsed = 0;
    let freshRow = true;
    let lastWasSmallheader = false;
    let widthThisGroup = 0;
    for (let i = 0; i < this.items_.size(); i++) {
      let item = this.items_.get(i);
      if (item instanceof ScrollingGridPane$GridHeader) {
        if (left > Math.fround(0) || lastWasSmallheader) {
          let spacing = Math.max(0, Math.fround(ScrollingGridPane.MIN_GROUP_SIZE - widthThisGroup));
          let spaceLeft = Math.fround(this.width() - (Math.fround(left + spacing)));
          let spaceReq = 0;
          for (let j = (i + 1) | 0; j < this.items_.size(); j++) {
            if (this.items_.get(j) instanceof ScrollingGridPane$GridItem) {
              spaceReq = (spaceReq + (ScrollingGridPane.ITEM_SIZE + 1)) | 0;
            } else {
              break;
            }
          }
          spaceReq = Math.max(spaceReq, ScrollingGridPane.MIN_GROUP_SIZE);
          if (!(item).center_ && freshRow && spaceLeft >= Math.fround(spaceReq)) {
            left = Math.fround(left + spacing);
            top = Math.fround(top - Math.fround(item.height() + 1));
            let sep: ColorBlock;
            if (this.separators.size() > sepsUsed) {
              sep = this.separators.get(sepsUsed++);
            } else {
              sep = new ColorBlock()._ColorBlock(1, 1, -14540254);
              this.separators.add(sep);
              this.content_.add$Gizmo(sep);
              sepsUsed++;
            }
            sep.size(1, Math.fround(Math.fround(item.height() + 1) + ScrollingGridPane.ITEM_SIZE));
            sep.x = Math.fround(left - 1);
            sep.y = top;
          } else {
            left = 0;
            top = Math.fround(top + ((ScrollingGridPane.ITEM_SIZE + 2) | 0));
            freshRow = true;
          }
        }
        item.setRect(left, top, this.width(), item.height());
        top = Math.fround(top + Math.fround(item.height() + 1));
        widthThisGroup = 0;
        if (!(item).center_) {
          lastWasSmallheader = true;
        } else {
          lastWasSmallheader = false;
        }
      }
      if (item instanceof ScrollingGridPane$GridItem) {
        if (Math.fround(left + ScrollingGridPane.ITEM_SIZE) > this.width()) {
          left = 0;
          widthThisGroup = 0;
          top = Math.fround(top + ((ScrollingGridPane.ITEM_SIZE + 1) | 0));
          freshRow = false;
        }
        item.setRect(left, top, Math.fround(ScrollingGridPane.ITEM_SIZE), Math.fround(ScrollingGridPane.ITEM_SIZE));
        left = Math.fround(left + ((ScrollingGridPane.ITEM_SIZE + 1) | 0));
        widthThisGroup = Math.fround(widthThisGroup + ((ScrollingGridPane.ITEM_SIZE + 1) | 0));
        lastWasSmallheader = false;
      }
    }
    if (left > Math.fround(0)) {
      left = 0;
      top = Math.fround(top + ((ScrollingGridPane.ITEM_SIZE + 1) | 0));
    }
    while (this.separators.size() > sepsUsed) {
      let sep = this.separators.removeAt(sepsUsed);
      this.content_.remove$Gizmo(sep);
    }
    this.content_.setSize(this.width_, top);
    super.layout();
  }
}

export class ScrollingGridPane$GridItem extends Component {
  icon_: Image = null;
  secondIcon_: Visual = null;
  bg: ColorBlock = null;
  _ScrollingGridPane$GridItem(icon: Image): this {
    this._Component();
    if (icon instanceof ItemSprite) {
      this.icon_ = new ItemSprite()._ItemSprite$();
    } else {
      this.icon_ = new Image()._Image$();
    }
    this.icon_.copy(icon);
    this.add$Gizmo(this.icon_);
    return this;
  }
  addSecondIcon(icon: Visual): void {
    this.secondIcon_ = icon;
    this.add$Gizmo(this.secondIcon_);
    this.layout();
  }
  hardLightBG(r: number, g: number, b: number): void {
    this.bg.hardlight$float$float$float(r, g, b);
  }
  onClick(x: number, y: number): boolean {
    return false;
  }
  createChildren(): void {
    this.bg = new ColorBlock()._ColorBlock(1, 1, -1722591667);
    this.add$Gizmo(this.bg);
  }
  layout(): void {
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width(), this.height());
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height() - this.icon_.height())) / 2));
    this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width() - this.icon_.width())) / 2));
    PixelScene.align$Visual(this.icon_);
    if (this.secondIcon_ != null) {
      this.secondIcon_.x = Math.fround(Math.fround(this.x + this.width()) - this.secondIcon_.width());
      this.secondIcon_.y = this.y;
    }
  }
}

export class ScrollingGridPane$GridHeader extends Component {
  text_: RenderedTextBlock = null;
  center_: boolean = false;
  _ScrollingGridPane$GridHeader$String(text: string): this {
    this._ScrollingGridPane$GridHeader$String$int$boolean(text, 7, false);
    return this;
  }
  _ScrollingGridPane$GridHeader$String$int$boolean(text: string, size: number, center: boolean): this {
    this._Component();
    this.center_ = center;
    this.text_ = PixelScene.renderTextBlock$String$int(text, size);
    this.add$Gizmo(this.text_);
    return this;
  }
  createChildren(): void {
    super.createChildren();
  }
  layout(): void {
    super.layout();
    if (this.center_) {
      this.text_.align(RenderedTextBlock.CENTER_ALIGN);
      this.text_.maxWidth$int($J.d2i(this.width()));
      this.text_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width() - this.text_.width())) / 2)), Math.fround(this.y + 1));
    } else {
      this.text_.maxWidth$int($J.d2i(this.width()));
      this.text_.setPos(this.x, Math.fround(this.y + 1));
    }
  }
  height(): number {
    if (this.center_) {
      return Math.fround(this.text_.height() + 3);
    } else {
      return Math.fround(this.text_.height() + 2);
    }
  }
}

$J.define(ScrollingGridPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingGridPane', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane', ctors: { '': '_ScrollingGridPane' }, meths: { 'addHeader(java.lang.String,int,boolean)': 'addHeader$String$int$boolean', 'addHeader(java.lang.String)': 'addHeader$String' } });
$J.define(ScrollingGridPane$GridItem, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingGridPane$GridItem', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.Image': '_ScrollingGridPane$GridItem' } });
$J.define(ScrollingGridPane$GridHeader, 'com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingGridPane$GridHeader', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'java.lang.String,int,boolean': '_ScrollingGridPane$GridHeader$String$int$boolean', 'java.lang.String': '_ScrollingGridPane$GridHeader$String' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Image = $J.load('com.watabou.noosa.Image');
});
