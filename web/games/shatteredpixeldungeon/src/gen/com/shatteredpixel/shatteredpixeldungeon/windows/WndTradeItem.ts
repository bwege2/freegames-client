// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndTradeItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WndInfoItem } from './WndInfoItem.ts';

let Dungeon, Actor, Buff, Shopkeeper, Gold, MasterThievesArmband, MasterThievesArmband$Thievery, MissileWeapon, MissileWeapon$UpgradedSetTracker, Catalog, Messages, GameScene, PixelScene, CharSprite, ItemSprite, ItemSpriteSheet, CurrencyIndicator, RedButton, WndOptions, WndUpgrade;

export class WndTradeItem extends WndInfoItem {
  static readonly GAP: number = 2;
  static readonly BTN_HEIGHT: number = 18;
  owner: WndBag = null;
  selling: boolean = false;
  $init_WndTradeItem() {
    this.selling = false;
  }
  _WndTradeItem$Item$WndBag(item: Item, owner: WndBag): this {
    this._WndInfoItem$Item(item);
    this.$init_WndTradeItem();
    this.selling = true;
    this.owner = owner;
    let pos = Math.fround(this.height_);
    let shop = null;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch instanceof Shopkeeper) {
        shop = ch;
        break;
      }
    }
    let finalShop = shop;
    if (item.quantity$() === 1 || (item instanceof MissileWeapon && item.isUpgradable())) {
      if (item instanceof MissileWeapon && (item).extraThrownLeft) {
        let warn = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndUpgrade), 'thrown_dust', []), 6);
        warn.hardlight(CharSprite.WARNING);
        warn.maxWidth$int(this.width_);
        warn.setPos(0, Math.fround(pos + WndTradeItem.GAP));
        this.add$Gizmo(warn);
        pos = warn.bottom();
      }
      let btnSell = new (WndTradeItem$1())().$o(this).$c(item, finalShop)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell', [item.value()]));
      btnSell.setRect(0, Math.fround(pos + WndTradeItem.GAP), Math.fround(this.width_), Math.fround(WndTradeItem.BTN_HEIGHT));
      btnSell.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
      this.add$Gizmo(btnSell);
      pos = btnSell.bottom();
    } else {
      let priceAll = item.value();
      let btnSell1 = new (WndTradeItem$2())().$o(this).$c(item, finalShop)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell_1', [$J.idiv(priceAll, item.quantity$())]));
      btnSell1.setRect(0, Math.fround(pos + WndTradeItem.GAP), Math.fround(this.width_), Math.fround(WndTradeItem.BTN_HEIGHT));
      btnSell1.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
      this.add$Gizmo(btnSell1);
      let btnSellAll = new (WndTradeItem$3())().$o(this).$c(item, finalShop)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell_all', [priceAll]));
      btnSellAll.setRect(0, Math.fround(btnSell1.bottom() + 1), Math.fround(this.width_), Math.fround(WndTradeItem.BTN_HEIGHT));
      btnSellAll.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
      this.add$Gizmo(btnSellAll);
      pos = btnSellAll.bottom();
    }
    this.resize(this.width_, $J.d2i(pos));
    return this;
  }
  _WndTradeItem$Heap(heap: Heap): this {
    this._WndInfoItem$Heap(heap);
    this.$init_WndTradeItem();
    this.selling = false;
    CurrencyIndicator.showGold = true;
    let item = heap.peek();
    let pos = Math.fround(this.height_);
    let price = Shopkeeper.sellPrice(item);
    let btnBuy = new (WndTradeItem$4())().$o(this).$c(heap)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'buy', [price]));
    btnBuy.setRect(0, Math.fround(pos + WndTradeItem.GAP), Math.fround(this.width_), Math.fround(WndTradeItem.BTN_HEIGHT));
    btnBuy.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
    btnBuy.enable(price <= Dungeon.gold);
    this.add$Gizmo(btnBuy);
    pos = btnBuy.bottom();
    let thievery = Dungeon.hero.buff($J.cls(MasterThievesArmband$Thievery));
    if (thievery != null && !thievery.isCursed() && thievery.chargesToUse(item) > 0) {
      let chance = thievery.stealChance(item);
      let chargesToUse = thievery.chargesToUse(item);
      let btnSteal = new (WndTradeItem$5())().$o(this).$c(chance, thievery, item, heap)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'steal', [Math.min(100, $J.d2i((Math.fround(chance * 100)))), chargesToUse]), 6);
      btnSteal.setRect(0, Math.fround(pos + 1), Math.fround(this.width_), Math.fround(WndTradeItem.BTN_HEIGHT));
      btnSteal.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_ARMBAND));
      this.add$Gizmo(btnSteal);
      pos = btnSteal.bottom();
    }
    this.resize(this.width_, $J.d2i(pos));
    return this;
  }
  hide(): void {
    super.hide();
    CurrencyIndicator.showGold = false;
    if (this.owner != null) {
      this.owner.hide();
    }
    if (this.selling) {
      Shopkeeper.sell();
    }
  }
  static sell$Item(item: Item): void {
    WndTradeItem.sell$Item$Shopkeeper(item, null);
  }
  static sell$Item$Shopkeeper(item: Item, shop: Shopkeeper): void {
    let hero = Dungeon.hero;
    if (item.isEquipped(hero) && !(item).doUnequip$Hero$boolean(hero, false)) {
      return;
    }
    item.detachAll(hero.belongings.backpack);
    if (item instanceof MissileWeapon && item.isUpgradable()) {
      Buff.affect$Char$Class(hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put((item).setID, 2147483647);
    }
    hero.spend(Math.fround(-hero.cooldown()));
    new Gold()._Gold$int(item.value()).doPickUp$Hero(hero);
    if (shop != null) {
      shop.buybackItems.add(item);
      while (shop.buybackItems.size() > Shopkeeper.MAX_BUYBACK_HISTORY) {
        shop.buybackItems.removeAt(0);
      }
    }
  }
  static sellOne$Item(item: Item): void {
    WndTradeItem.sellOne$Item$Shopkeeper(item, null);
  }
  static sellOne$Item$Shopkeeper(item: Item, shop: Shopkeeper): void {
    if (item.quantity$() <= 1) {
      WndTradeItem.sell$Item$Shopkeeper(item, shop);
    } else {
      let hero = Dungeon.hero;
      item = item.detach(hero.belongings.backpack);
      hero.spend(Math.fround(-hero.cooldown()));
      new Gold()._Gold$int(item.value()).doPickUp$Hero(hero);
      if (shop != null) {
        shop.buybackItems.add(item);
        while (shop.buybackItems.size() > Shopkeeper.MAX_BUYBACK_HISTORY) {
          shop.buybackItems.removeAt(0);
        }
      }
    }
  }
  buy(heap: Heap): void {
    let item = heap.pickUp();
    if (item == null) {
      return;
    }
    let price = Shopkeeper.sellPrice(item);
    Dungeon.gold = (Dungeon.gold - price) | 0;
    Catalog.countUses($J.cls(Gold), price);
    if (!item.doPickUp$Hero(Dungeon.hero)) {
      Dungeon.level.drop(item, heap.pos).sprite_.drop$();
    }
  }
}

let $WndTradeItem$1: any = null;
/** An anonymous class (WndTradeItem.java:89). */
function WndTradeItem$1(): any {
  return $WndTradeItem$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sell$Item$Shopkeeper(this.$cv_item, this.$cv_finalShop);
      this.$outer.hide();
    }
    $c($item, $finalShop): this {
      this.$cv_item = $item; this.$cv_finalShop = $finalShop;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$1', []);
}

let $WndTradeItem$2: any = null;
/** An anonymous class (WndTradeItem.java:105). */
function WndTradeItem$2(): any {
  return $WndTradeItem$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sellOne$Item$Shopkeeper(this.$cv_item, this.$cv_finalShop);
      this.$outer.hide();
    }
    $c($item, $finalShop): this {
      this.$cv_item = $item; this.$cv_finalShop = $finalShop;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$2', []);
}

let $WndTradeItem$3: any = null;
/** An anonymous class (WndTradeItem.java:115). */
function WndTradeItem$3(): any {
  return $WndTradeItem$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sell$Item$Shopkeeper(this.$cv_item, this.$cv_finalShop);
      this.$outer.hide();
    }
    $c($item, $finalShop): this {
      this.$cv_item = $item; this.$cv_finalShop = $finalShop;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$3', []);
}

let $WndTradeItem$4: any = null;
/** An anonymous class (WndTradeItem.java:147). */
function WndTradeItem$4(): any {
  return $WndTradeItem$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.buy(this.$cv_heap);
    }
    $c($heap): this {
      this.$cv_heap = $heap;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$4', []);
}

let $WndTradeItem$5$1: any = null;
/** An anonymous class (WndTradeItem.java:182). */
function WndTradeItem$5$1(): any {
  return $WndTradeItem$5$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        if (this.$cv_thievery.steal(this.$cv_item)) {
          let hero = Dungeon.hero;
          let item = this.$cv_heap.pickUp();
          this.$outer.$outer.hide();
          if (!item.doPickUp$Hero(hero)) {
            Dungeon.level.drop(item, this.$cv_heap.pos).sprite_.drop$();
          }
        } else {
          for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
            let mob = $it1.next();
            if (mob instanceof Shopkeeper) {
              mob.yell(Messages.get$Object$String$ObjectArr(mob, 'thief', []));
              (mob).flee();
              break;
            }
          }
          this.$outer.$outer.hide();
        }
      }
    }
    $c($thievery, $item, $heap): this {
      this.$cv_thievery = $thievery; this.$cv_item = $item; this.$cv_heap = $heap;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$5$1', []);
}

let $WndTradeItem$5: any = null;
/** An anonymous class (WndTradeItem.java:165). */
function WndTradeItem$5(): any {
  return $WndTradeItem$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$cv_chance >= Math.fround(1)) {
        this.$cv_thievery.steal(this.$cv_item);
        let hero = Dungeon.hero;
        let item = this.$cv_heap.pickUp();
        this.$outer.hide();
        if (!item.doPickUp$Hero(hero)) {
          Dungeon.level.drop(item, this.$cv_heap.pos).sprite_.drop$();
        }
      } else {
        GameScene.show(new (WndTradeItem$5$1())().$o(this).$c(this.$cv_thievery, this.$cv_item, this.$cv_heap)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ARTIFACT_ARMBAND), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(MasterThievesArmband), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(WndTradeItem), 'steal_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(WndTradeItem), 'steal_warn_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndTradeItem), 'steal_warn_no', [])]));
      }
    }
    $c($chance, $thievery, $item, $heap): this {
      this.$cv_chance = $chance; this.$cv_thievery = $thievery; this.$cv_item = $item; this.$cv_heap = $heap;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem$5', []);
}

$J.define(WndTradeItem, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Heap': '_WndTradeItem$Heap', 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.windows.WndBag': '_WndTradeItem$Item$WndBag' }, meths: { 'sellOne(com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper)': 'sellOne$Item$Shopkeeper', 'sellOne(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'sellOne$Item', 'sell(com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper)': 'sell$Item$Shopkeeper', 'sell(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'sell$Item' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  MasterThievesArmband = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband');
  MasterThievesArmband$Thievery = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$Thievery');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  CurrencyIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CurrencyIndicator');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade');
});
