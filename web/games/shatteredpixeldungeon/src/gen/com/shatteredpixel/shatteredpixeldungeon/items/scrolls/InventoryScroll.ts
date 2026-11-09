// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/InventoryScroll.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Scroll } from './Scroll.ts';
import { WndOptions } from '../../windows/WndOptions.ts';

let Assets$Sounds, Item, ScrollOfUpgrade, Messages, GameScene, ItemSprite, WndBag$ItemSelector, Sample;

export class InventoryScroll extends Scroll {
  static identifiedByUse: boolean = false;
  preferredBag_: JClass<Bag> = null;
  itemSelector: WndBag$ItemSelector = null;
  _InventoryScroll(): this {
    this._Scroll();
    this.preferredBag_ = null;
    this.itemSelector = new (InventoryScroll$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  doRead(): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(Item.curUser.belongings.backpack);
      InventoryScroll.identifiedByUse = true;
    } else {
      InventoryScroll.identifiedByUse = false;
    }
    GameScene.selectItem(this.itemSelector);
  }
  confirmCancelation(): void {
    GameScene.show(new InventoryScroll$WndConfirmCancel().$o(this)._InventoryScroll$WndConfirmCancel());
  }
  inventoryTitle(): string {
    return Messages.get$Object$String$ObjectArr(this, 'inv_title', []);
  }
  usableOnItem(item: Item): boolean {
    return true;
  }
  static $clinit() {
    InventoryScroll.identifiedByUse = false;
  }
}

export class InventoryScroll$WndConfirmCancel extends WndOptions {
  _InventoryScroll$WndConfirmCancel(): this {
    this._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this.$outer), Messages.titleCase(this.$outer.name()), Messages.get$Object$String$ObjectArr(this.$outer, 'warning', []), [Messages.get$Object$String$ObjectArr(this.$outer, 'yes', []), Messages.get$Object$String$ObjectArr(this.$outer, 'no', [])]);
    return this;
  }
  onSelect(index: number): void {
    switch (index) {
      case 0:
        Item.curUser.spendAndNext(Scroll.TIME_TO_READ);
        InventoryScroll.identifiedByUse = false;
        break;
      case 1:
        GameScene.selectItem(this.$outer.itemSelector);
        break;
    }
  }
  onBackPressed(): void {
  }
  getItemSelector(): WndBag$ItemSelector {
    return this.$outer.itemSelector;
  }
}

let $InventoryScroll$1: any = null;
/** An anonymous class (InventoryScroll.java:97). */
function InventoryScroll$1(): any {
  return $InventoryScroll$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return this.$outer.inventoryTitle();
    }
    preferredBag(): JClass<Bag> {
      return this.$outer.preferredBag_;
    }
    itemSelectable(item: Item): boolean {
      return this.$outer.usableOnItem(item);
    }
    onSelect(item: Item): void {
      if (!(Item.curItem instanceof InventoryScroll)) {
        return;
      }
      if (item != null) {
        if (!InventoryScroll.identifiedByUse && !(Item.curItem instanceof ScrollOfUpgrade)) {
          Item.curItem = this.$outer.detach(Item.curUser.belongings.backpack);
        }
        (Item.curItem).onItemSelected(item);
        if (!(Item.curItem instanceof ScrollOfUpgrade)) {
          (Item.curItem).readAnimation();
          Sample.INSTANCE.play$Object(Assets$Sounds.READ);
        }
      } else if (InventoryScroll.identifiedByUse && !(Item.curItem).anonymous) {
        (Item.curItem).confirmCancelation();
      } else if ((Item.curItem).anonymous) {
        Item.curUser.spendAndNext(Scroll.TIME_TO_READ);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll$1', []);
}

$J.define(InventoryScroll, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_InventoryScroll' }, clinit: true, lazy: ['identifiedByUse'] });
$J.define(InventoryScroll$WndConfirmCancel, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll$WndConfirmCancel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { '': '_InventoryScroll$WndConfirmCancel' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
