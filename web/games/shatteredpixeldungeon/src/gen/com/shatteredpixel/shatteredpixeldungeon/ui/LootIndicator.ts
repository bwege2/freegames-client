// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/LootIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Tag } from './Tag.ts';

let Dungeon, SPDAction, Heap$Type, ItemSlot;

export class LootIndicator extends Tag {
  slot_: ItemSlot = null;
  lastItem: Item = null;
  lastQuantity: number = 0;
  _LootIndicator(): this {
    this._Tag(1595544);
    this.lastItem = null;
    this.lastQuantity = 0;
    this.setSize(Math.fround(Tag.SIZE), Math.fround(Tag.SIZE));
    this.visible_ = false;
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.slot_ = new (LootIndicator$1())().$o(this)._ItemSlot$();
    this.slot_.showExtraInfo(false);
    this.add$Gizmo(this.slot_);
  }
  layout(): void {
    super.layout();
    if (!this.flipped) {
      this.slot_.setRect(this.x, this.y, Math.fround(Tag.SIZE), this.height_);
      this.slot_.setMargins(2, 2, 0, 2);
    } else {
      this.slot_.setRect(Math.fround(this.x + (Math.fround(this.width() - Tag.SIZE))), this.y, Math.fround(Tag.SIZE), this.height_);
      this.slot_.setMargins(0, 2, 2, 2);
    }
  }
  update(): void {
    if (Dungeon.hero.ready_) {
      let heap = Dungeon.level.heaps.get(Dungeon.hero.pos);
      if (heap != null) {
        let item = heap.type_ === Heap$Type.CHEST ? ItemSlot.CHEST : heap.type_ === Heap$Type.LOCKED_CHEST ? ItemSlot.LOCKED_CHEST : heap.type_ === Heap$Type.CRYSTAL_CHEST ? ItemSlot.CRYSTAL_CHEST : heap.type_ === Heap$Type.TOMB ? ItemSlot.TOMB : heap.type_ === Heap$Type.SKELETON ? ItemSlot.SKELETON : heap.type_ === Heap$Type.REMAINS ? ItemSlot.REMAINS : heap.peek();
        if (item !== this.lastItem || item.quantity$() !== this.lastQuantity) {
          this.lastItem = item;
          this.lastQuantity = item.quantity$();
          this.slot_.item$Item(item);
          this.flash();
        }
        this.visible_ = true;
      } else {
        this.lastItem = null;
        this.visible_ = false;
      }
    }
    this.slot_.enable(this.visible_ && Dungeon.hero.ready_);
    super.update();
  }
}

let $LootIndicator$1: any = null;
/** An anonymous class (LootIndicator.java:49). */
function LootIndicator$1(): any {
  return $LootIndicator$1 ??= $J.local(class extends ItemSlot {
    onClick(): void {
      this.$outer.onClick();
      if (Dungeon.hero.ready_ && Dungeon.hero.handle(Dungeon.hero.pos)) {
        Dungeon.hero.next();
      }
    }
    keyAction(): GameAction {
      return SPDAction.TAG_LOOT;
    }
    secondaryTooltipAction(): GameAction {
      return SPDAction.WAIT_OR_PICKUP;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.LootIndicator$1', []);
}

$J.define(LootIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.LootIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', ctors: { '': '_LootIndicator' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
});
