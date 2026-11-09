// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/Alchemize.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Spell } from './Spell.ts';
import { Recipe } from '../Recipe.ts';
import { WndInfoItem } from '../../windows/WndInfoItem.ts';

let Assets$Sounds, Dungeon, Talent, Shopkeeper, Item, Runestone, Trinket, MissileWeapon, Catalog, Messages, Plant$Seed, GameScene, PixelScene, CharSprite, ItemSprite, ItemSpriteSheet, RedButton, WndBag$ItemSelector, WndEnergizeItem, WndOptions, WndTradeItem, WndUpgrade, Sample, Random;

export class Alchemize extends Spell {
  static parentWnd: WndBag = null;
  static itemSelector: WndBag$ItemSelector = null;
  _Alchemize(): this {
    this._Spell();
    this.image_ = ItemSpriteSheet.ALCHEMIZE;
    this.talentChance = Math.fround(1 / Math.fround(Alchemize$Recipe.OUT_QUANTITY));
    return this;
  }
  onCast(hero: Hero): void {
    Alchemize.parentWnd = GameScene.selectItem(Alchemize.itemSelector);
  }
  value(): number {
    return $J.d2i((Math.fround(20 * (Math.fround(this.quantity / Math.fround(Alchemize$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(4 * (Math.fround(this.quantity / Math.fround(Alchemize$Recipe.OUT_QUANTITY))))));
  }
  static $clinit() {
    Alchemize.itemSelector = new (Alchemize$1())()._WndBag$ItemSelector();
  }
}

export class Alchemize$Recipe extends Recipe {
  static readonly OUT_QUANTITY: number = 8;
  _Alchemize$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() !== 2) {
      return false;
    }
    if (ingredients.get(0) instanceof Plant$Seed && ingredients.get(1) instanceof Runestone) {
      return true;
    }
    if (ingredients.get(0) instanceof Runestone && ingredients.get(1) instanceof Plant$Seed) {
      return true;
    }
    return false;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 2;
  }
  brew(ingredients: ArrayList<Item>): Item {
    ingredients.get(0).quantity$int((ingredients.get(0).quantity$() - 1) | 0);
    ingredients.get(1).quantity$int((ingredients.get(1).quantity$() - 1) | 0);
    return this.sampleOutput(null);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new Alchemize()._Alchemize().quantity$int(Alchemize$Recipe.OUT_QUANTITY);
  }
}

export class Alchemize$WndAlchemizeItem extends WndInfoItem {
  static readonly GAP: number = 2;
  static readonly BTN_HEIGHT: number = 18;
  owner: WndBag = null;
  _Alchemize$WndAlchemizeItem(item: Item, owner: WndBag): this {
    this._WndInfoItem$Item(item);
    this.owner = owner;
    let pos = Math.fround(this.height_);
    if (Shopkeeper.canSell(item)) {
      if (item.quantity$() === 1 || (item instanceof MissileWeapon && item.isUpgradable())) {
        if (item instanceof MissileWeapon && (item).extraThrownLeft) {
          let warn = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndUpgrade), 'thrown_dust', []), 6);
          warn.hardlight(CharSprite.WARNING);
          warn.maxWidth$int(this.width_);
          warn.setPos(0, Math.fround(pos + Alchemize$WndAlchemizeItem.GAP));
          this.add$Gizmo(warn);
          pos = warn.bottom();
        }
        let btnSell = new (Alchemize$WndAlchemizeItem$1())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell', [item.value()]));
        btnSell.setRect(0, Math.fround(pos + Alchemize$WndAlchemizeItem.GAP), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnSell.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
        this.add$Gizmo(btnSell);
        pos = btnSell.bottom();
      } else {
        let priceAll = item.value();
        let btnSell1 = new (Alchemize$WndAlchemizeItem$2())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell_1', [$J.idiv(priceAll, item.quantity$())]));
        btnSell1.setRect(0, Math.fround(pos + Alchemize$WndAlchemizeItem.GAP), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnSell1.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
        this.add$Gizmo(btnSell1);
        let btnSellAll = new (Alchemize$WndAlchemizeItem$3())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'sell_all', [priceAll]));
        btnSellAll.setRect(0, Math.fround(btnSell1.bottom() + 1), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnSellAll.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GOLD));
        this.add$Gizmo(btnSellAll);
        pos = btnSellAll.bottom();
      }
    }
    if (item.energyVal() > 0) {
      if (item.quantity$() === 1) {
        let btnEnergize = new (Alchemize$WndAlchemizeItem$4())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize', [item.energyVal()]));
        btnEnergize.setRect(0, Math.fround(pos + Alchemize$WndAlchemizeItem.GAP), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnEnergize.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
        this.add$Gizmo(btnEnergize);
        pos = btnEnergize.bottom();
      } else {
        let energyAll = item.energyVal();
        let btnEnergize1 = new (Alchemize$WndAlchemizeItem$5())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize_1', [$J.idiv(energyAll, item.quantity$())]));
        btnEnergize1.setRect(0, Math.fround(pos + Alchemize$WndAlchemizeItem.GAP), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnEnergize1.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
        this.add$Gizmo(btnEnergize1);
        let btnEnergizeAll = new (Alchemize$WndAlchemizeItem$6())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize_all', [energyAll]));
        btnEnergizeAll.setRect(0, Math.fround(btnEnergize1.bottom() + 1), Math.fround(this.width_), Math.fround(Alchemize$WndAlchemizeItem.BTN_HEIGHT));
        btnEnergizeAll.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
        this.add$Gizmo(btnEnergizeAll);
        pos = btnEnergizeAll.bottom();
      }
    }
    this.resize(this.width_, $J.d2i(pos));
    return this;
  }
  consumeAlchemize(): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    if (Item.curItem.quantity$() <= 1) {
      Item.curItem.detachAll(Dungeon.hero.belongings.backpack);
      if (this.owner != null) {
        this.owner.hide();
      }
    } else {
      Item.curItem.detach(Dungeon.hero.belongings.backpack);
      if (this.owner != null) {
        this.owner.hide();
      }
      GameScene.selectItem(Alchemize.itemSelector);
    }
    Catalog.countUse($J.getClass(this));
    if (Item.curItem instanceof Alchemize && Random.Float$() < (Item.curItem).talentChance) {
      Talent.onScrollUsed(Item.curUser, Item.curUser.pos, (Item.curItem).talentFactor, Item.curItem.getClass());
    }
  }
}

let $Alchemize$1: any = null;
/** An anonymous class (Alchemize.java:117). */
function Alchemize$1(): any {
  return $Alchemize$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Alchemize), 'prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return !(item instanceof Alchemize) && (Shopkeeper.canSell(item) || item.energyVal() > 0);
    }
    onSelect(item: Item): void {
      if (item != null) {
        if (Alchemize.parentWnd != null) {
          Alchemize.parentWnd = GameScene.selectItem(Alchemize.itemSelector);
        }
        GameScene.show(new Alchemize$WndAlchemizeItem()._Alchemize$WndAlchemizeItem(item, Alchemize.parentWnd));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$1', []);
}

let $Alchemize$WndAlchemizeItem$1: any = null;
/** An anonymous class (Alchemize.java:167). */
function Alchemize$WndAlchemizeItem$1(): any {
  return $Alchemize$WndAlchemizeItem$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sell$Item(this.$cv_item);
      this.$outer.hide();
      this.$outer.consumeAlchemize();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$1', []);
}

let $Alchemize$WndAlchemizeItem$2: any = null;
/** An anonymous class (Alchemize.java:184). */
function Alchemize$WndAlchemizeItem$2(): any {
  return $Alchemize$WndAlchemizeItem$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sellOne$Item(this.$cv_item);
      this.$outer.hide();
      this.$outer.consumeAlchemize();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$2', []);
}

let $Alchemize$WndAlchemizeItem$3: any = null;
/** An anonymous class (Alchemize.java:195). */
function Alchemize$WndAlchemizeItem$3(): any {
  return $Alchemize$WndAlchemizeItem$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndTradeItem.sell$Item(this.$cv_item);
      this.$outer.hide();
      this.$outer.consumeAlchemize();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$3', []);
}

let $Alchemize$WndAlchemizeItem$4$1: any = null;
/** An anonymous class (Alchemize.java:222). */
function Alchemize$WndAlchemizeItem$4$1(): any {
  return $Alchemize$WndAlchemizeItem$4$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        WndEnergizeItem.energizeAll(this.$cv_item);
      }
    }
    hide(): void {
      super.hide();
      this.$outer.$outer.hide();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$4$1', []);
}

let $Alchemize$WndAlchemizeItem$4: any = null;
/** An anonymous class (Alchemize.java:215). */
function Alchemize$WndAlchemizeItem$4(): any {
  return $Alchemize$WndAlchemizeItem$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$cv_item instanceof Trinket) {
        GameScene.show(new (Alchemize$WndAlchemizeItem$4$1())().$o(this).$c(this.$cv_item)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this.$cv_item), Messages.titleCase(this.$cv_item.name()), Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_no', [])]));
      } else {
        WndEnergizeItem.energizeAll(this.$cv_item);
        this.$outer.hide();
        this.$outer.consumeAlchemize();
      }
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$4', []);
}

let $Alchemize$WndAlchemizeItem$5: any = null;
/** An anonymous class (Alchemize.java:253). */
function Alchemize$WndAlchemizeItem$5(): any {
  return $Alchemize$WndAlchemizeItem$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndEnergizeItem.energizeOne(this.$cv_item);
      this.$outer.hide();
      this.$outer.consumeAlchemize();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$5', []);
}

let $Alchemize$WndAlchemizeItem$6: any = null;
/** An anonymous class (Alchemize.java:264). */
function Alchemize$WndAlchemizeItem$6(): any {
  return $Alchemize$WndAlchemizeItem$6 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndEnergizeItem.energizeAll(this.$cv_item);
      this.$outer.hide();
      this.$outer.consumeAlchemize();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem$6', []);
}

$J.define(Alchemize, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_Alchemize' }, clinit: true, lazy: ['parentWnd', 'itemSelector'] });
$J.define(Alchemize$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Alchemize$Recipe' } });
$J.define(Alchemize$WndAlchemizeItem, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$WndAlchemizeItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.windows.WndBag': '_Alchemize$WndAlchemizeItem' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndEnergizeItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTradeItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem');
  WndUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
