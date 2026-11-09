// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ItemButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Chrome, Chrome$Type, ItemSlot, Sample;

export class ItemButton extends Component {
  bg: NinePatch = null;
  slot_: ItemSlot = null;
  _ItemButton(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.RED_BUTTON);
    this.add$Gizmo(this.bg);
    this.slot_ = new (ItemButton$1())().$o(this)._ItemSlot$();
    this.slot_.enable(true);
    this.add$Gizmo(this.slot_);
  }
  onClick(): void {
  }
  onLongClick(): boolean {
    return false;
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    this.slot_.setRect(this.x, this.y, this.width_, this.height_);
    if (this.width() >= Math.fround(24) || this.height_ >= Math.fround(24)) {
      this.slot_.setMargins(2, 2, 2, 2);
    } else {
      this.slot_.setMargins(1, 1, 1, 1);
    }
  }
  item$(): Item {
    return this.slot_.item_;
  }
  item$Item(item: Item): void {
    this.slot_.item$Item(item);
  }
  clear(): void {
    this.slot_.clear();
  }
  slot(): ItemSlot {
    return this.slot_;
  }
}

let $ItemButton$1: any = null;
/** An anonymous class (ItemButton.java:44). */
function ItemButton$1(): any {
  return $ItemButton$1 ??= $J.local(class extends ItemSlot {
    onPointerDown(): void {
      this.$outer.bg.brightness(Math.fround(1.2));
      Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
    }
    onPointerUp(): void {
      this.$outer.bg.resetColor();
    }
    onClick(): void {
      this.$outer.onClick();
    }
    onLongClick(): boolean {
      return this.$outer.onLongClick();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton$1', []);
}

$J.define(ItemButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_ItemButton' }, meths: { 'item(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'item$Item', 'item()': 'item$' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
