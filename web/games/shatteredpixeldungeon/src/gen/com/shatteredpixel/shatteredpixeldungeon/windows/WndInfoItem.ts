// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Window } from '../ui/Window.ts';

let Heap$Type, PixelScene, ItemSlot, IconTitle, WndUseItem;

export class WndInfoItem extends Window {
  static readonly GAP: number = 2;
  static readonly WIDTH_MIN: number = 120;
  static readonly WIDTH_MAX: number = 220;
  static INSTANCE: WndInfoItem = null;
  _WndInfoItem$Heap(heap: Heap): this {
    this._Window$();
    if (WndInfoItem.INSTANCE != null) {
      WndInfoItem.INSTANCE.hide();
    }
    WndInfoItem.INSTANCE = this;
    if (heap.type_ === Heap$Type.HEAP) {
      this.fillFields$Item$WndInfoItem(heap.peek());
    } else {
      this.fillFields$Heap$WndInfoItem(heap);
    }
    return this;
  }
  _WndInfoItem$Item(item: Item): this {
    this._Window$();
    if (WndInfoItem.INSTANCE != null) {
      WndInfoItem.INSTANCE.hide();
    }
    WndInfoItem.INSTANCE = this;
    this.fillFields$Item$WndInfoItem(item);
    return this;
  }
  hide(): void {
    super.hide();
    if (WndInfoItem.INSTANCE === this) {
      WndInfoItem.INSTANCE = null;
    }
  }
  fillFields$Heap$WndInfoItem(heap: Heap): void {
    let titlebar = new IconTitle()._IconTitle$Heap(heap);
    titlebar.color(Window.TITLE_COLOR);
    let txtInfo = PixelScene.renderTextBlock$String$int(heap.info(), 6);
    this.layoutFields(titlebar, txtInfo);
  }
  fillFields$Item$WndInfoItem(item: Item): void {
    let color = Window.TITLE_COLOR;
    if (item.levelKnown && item.level$() > 0) {
      color = ItemSlot.UPGRADED;
    } else if (item.levelKnown && item.level$() < 0) {
      color = ItemSlot.DEGRADED;
    }
    let titlebar = new IconTitle()._IconTitle$Item(item);
    titlebar.color(color);
    let txtInfo = PixelScene.renderTextBlock$String$int(item.info(), 6);
    this.layoutFields(titlebar, txtInfo);
  }
  layoutFields(title: IconTitle, info: RenderedTextBlock): void {
    let width = WndInfoItem.WIDTH_MIN;
    info.maxWidth$int(width);
    while (PixelScene.landscape() && info.height() > Math.fround(100) && width < WndInfoItem.WIDTH_MAX) {
      width = (width + 20) | 0;
      info.maxWidth$int(width);
    }
    if (this instanceof WndUseItem) {
      title.setRect(0, 0, Math.fround((width - 16) | 0), 0);
    } else {
      title.setRect(0, 0, Math.fround(width), 0);
    }
    this.add$Gizmo(title);
    info.setPos(title.left(), Math.fround(title.bottom() + WndInfoItem.GAP));
    this.add$Gizmo(info);
    this.resize(width, $J.d2i((Math.fround(info.bottom() + 2))));
  }
}

$J.define(WndInfoItem, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndInfoItem$Item', 'com.shatteredpixel.shatteredpixeldungeon.items.Heap': '_WndInfoItem$Heap' }, meths: { 'fillFields(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'fillFields$Item$WndInfoItem', 'fillFields(com.shatteredpixel.shatteredpixeldungeon.items.Heap)': 'fillFields$Heap$WndInfoItem' } });
$J.module(() => {
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
});
