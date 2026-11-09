// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndEnergizeItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, EnergyCrystal, Trinket, Messages, AlchemyScene, GameScene, ItemSprite, ItemSpriteSheet, RedButton, GLog, WndBag, WndBag$ItemSelector, WndOptions, Game;

export class WndEnergizeItem extends WndInfoItem {
  static readonly GAP: number = 2;
  static readonly BTN_HEIGHT: number = 18;
  owner: WndBag = null;
  static selector: WndBag$ItemSelector = null;
  _WndEnergizeItem(item: Item, owner: WndBag): this {
    this._WndInfoItem$Item(item);
    this.owner = owner;
    let pos = Math.fround(this.height_);
    if (item.quantity$() === 1) {
      let btnEnergize = new (WndEnergizeItem$1())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize', [item.energyVal()]));
      btnEnergize.setRect(0, Math.fround(pos + WndEnergizeItem.GAP), Math.fround(this.width_), Math.fround(WndEnergizeItem.BTN_HEIGHT));
      btnEnergize.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
      this.add$Gizmo(btnEnergize);
      pos = btnEnergize.bottom();
    } else {
      let energyAll = item.energyVal();
      let btnEnergize1 = new (WndEnergizeItem$2())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize_1', [$J.idiv(energyAll, item.quantity$())]));
      btnEnergize1.setRect(0, Math.fround(pos + WndEnergizeItem.GAP), Math.fround(this.width_), Math.fround(WndEnergizeItem.BTN_HEIGHT));
      btnEnergize1.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
      this.add$Gizmo(btnEnergize1);
      let btnEnergizeAll = new (WndEnergizeItem$3())().$o(this).$c(item)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'energize_all', [energyAll]));
      btnEnergizeAll.setRect(0, Math.fround(btnEnergize1.bottom() + 1), Math.fround(this.width_), Math.fround(WndEnergizeItem.BTN_HEIGHT));
      btnEnergizeAll.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.ENERGY));
      this.add$Gizmo(btnEnergizeAll);
      pos = btnEnergizeAll.bottom();
    }
    this.resize(this.width_, $J.d2i(pos));
    return this;
  }
  hide(): void {
    super.hide();
    if (this.owner != null) {
      this.owner.hide();
      WndEnergizeItem.openItemSelector();
    }
  }
  static energizeAll(item: Item): void {
    if (item.isEquipped(Dungeon.hero) && !(item).doUnequip$Hero$boolean(Dungeon.hero, false)) {
      return;
    }
    item.detachAll(Dungeon.hero.belongings.backpack);
    WndEnergizeItem.energize(item);
  }
  static energizeOne(item: Item): void {
    if (item.quantity$() <= 1) {
      WndEnergizeItem.energizeAll(item);
    } else {
      WndEnergizeItem.energize(item.detach(Dungeon.hero.belongings.backpack));
    }
  }
  static energize(item: Item): void {
    let hero = Dungeon.hero;
    if (Game.scene() instanceof AlchemyScene) {
      Dungeon.energy = (Dungeon.energy + item.energyVal()) | 0;
      (Game.scene()).createEnergy();
      if (!item.isIdentified()) {
        (Game.scene()).showIdentify(item);
      }
    } else {
      hero.spend(Math.fround(-hero.cooldown()));
      new EnergyCrystal()._EnergyCrystal$int(item.energyVal()).doPickUp$Hero(hero);
      item.identify$();
      GLog.h('You energized: ' + item.name(), []);
    }
  }
  static openItemSelector(): WndBag {
    if (Game.scene() instanceof GameScene) {
      return GameScene.selectItem(WndEnergizeItem.selector);
    } else {
      let window = WndBag.getBag(WndEnergizeItem.selector);
      Game.scene().addToFront(window);
      return window;
    }
  }
  static $clinit() {
    WndEnergizeItem.selector = new (WndEnergizeItem$4())()._WndBag$ItemSelector();
  }
}

let $WndEnergizeItem$1$1: any = null;
/** An anonymous class (WndEnergizeItem.java:63). */
function WndEnergizeItem$1$1(): any {
  return $WndEnergizeItem$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        WndEnergizeItem.energizeAll(this.$cv_item);
      }
      WndEnergizeItem.openItemSelector();
    }
    hide(): void {
      super.hide();
      this.$outer.$outer.hide();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem$1$1', []);
}

let $WndEnergizeItem$1: any = null;
/** An anonymous class (WndEnergizeItem.java:56). */
function WndEnergizeItem$1(): any {
  return $WndEnergizeItem$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$cv_item instanceof Trinket) {
        Game.scene().addToFront(new (WndEnergizeItem$1$1())().$o(this).$c(this.$cv_item)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this.$cv_item), Messages.titleCase(this.$cv_item.name()), Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'trinket_no', [])]));
      } else {
        WndEnergizeItem.energizeAll(this.$cv_item);
        this.$outer.hide();
      }
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem$1', []);
}

let $WndEnergizeItem$2: any = null;
/** An anonymous class (WndEnergizeItem.java:94). */
function WndEnergizeItem$2(): any {
  return $WndEnergizeItem$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndEnergizeItem.energizeOne(this.$cv_item);
      this.$outer.hide();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem$2', []);
}

let $WndEnergizeItem$3: any = null;
/** An anonymous class (WndEnergizeItem.java:104). */
function WndEnergizeItem$3(): any {
  return $WndEnergizeItem$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      WndEnergizeItem.energizeAll(this.$cv_item);
      this.$outer.hide();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem$3', []);
}

let $WndEnergizeItem$4: any = null;
/** An anonymous class (WndEnergizeItem.java:184). */
function WndEnergizeItem$4(): any {
  return $WndEnergizeItem$4 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndEnergizeItem), 'prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return item.energyVal() > 0;
    }
    onSelect(item: Item): void {
      if (item != null) {
        let parentWnd = WndEnergizeItem.openItemSelector();
        if (Game.scene() instanceof GameScene) {
          GameScene.show(new WndEnergizeItem()._WndEnergizeItem(item, parentWnd));
        } else {
          Game.scene().addToFront(new WndEnergizeItem()._WndEnergizeItem(item, parentWnd));
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem$4', []);
}

$J.define(WndEnergizeItem, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndEnergizeItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.windows.WndBag': '_WndEnergizeItem' }, clinit: true, lazy: ['selector'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
});
