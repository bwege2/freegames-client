// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfAugmentation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { InventoryStone } from './InventoryStone.ts';
import { Window } from '../../ui/Window.ts';

let Belongings$Backpack, Talent, Item, Armor, Armor$Augment, ScrollOfUpgrade, ScrollOfEnchantment, Weapon, Weapon$Augment, Catalog, Messages, GameScene, PixelScene, ItemSpriteSheet, RedButton, IconTitle;

export class StoneOfAugmentation extends InventoryStone {
  _StoneOfAugmentation(): this {
    this._InventoryStone();
    this.preferredBag_ = $J.cls(Belongings$Backpack);
    this.image_ = ItemSpriteSheet.STONE_AUGMENTATION;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return ScrollOfEnchantment.enchantable(item);
  }
  onItemSelected(item: Item): void {
    GameScene.show(new StoneOfAugmentation$WndAugment().$o(this)._StoneOfAugmentation$WndAugment(item));
  }
  apply$Weapon$Augment(weapon: Weapon, augment: Weapon$Augment): void {
    weapon.augment = augment;
    this.useAnimation();
    ScrollOfUpgrade.upgrade(Item.curUser);
    if (!this.anonymous) {
      Item.curItem.detach(Item.curUser.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      Talent.onRunestoneUsed(Item.curUser, Item.curUser.pos, $J.getClass(this));
    }
  }
  apply$Armor$Augment(armor: Armor, augment: Armor$Augment): void {
    armor.augment = augment;
    this.useAnimation();
    ScrollOfUpgrade.upgrade(Item.curUser);
    if (!this.anonymous) {
      Item.curItem.detach(Item.curUser.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      Talent.onRunestoneUsed(Item.curUser, Item.curUser.pos, $J.getClass(this));
    }
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(5, this.quantity);
  }
}

export class StoneOfAugmentation$WndAugment extends Window {
  static readonly WIDTH: number = 120;
  static readonly MARGIN: number = 2;
  static readonly BUTTON_WIDTH: number = 116;
  static readonly BUTTON_HEIGHT: number = 18;
  _StoneOfAugmentation$WndAugment(toAugment: Item): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$Item(toAugment);
    titlebar.setRect(0, 0, Math.fround(StoneOfAugmentation$WndAugment.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let msg = Messages.get$Object$String$ObjectArr(this, 'choice', []);
    if (toAugment instanceof Weapon && (toAugment).augment !== Weapon$Augment.NONE) {
      msg += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'already', []);
    } else if (toAugment instanceof Armor && (toAugment).augment !== Armor$Augment.NONE) {
      msg += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'already', []);
    }
    let tfMesage = PixelScene.renderTextBlock$String$int(msg, 6);
    tfMesage.maxWidth$int((StoneOfAugmentation$WndAugment.WIDTH - Math.imul(StoneOfAugmentation$WndAugment.MARGIN, 2)) | 0);
    tfMesage.setPos(Math.fround(StoneOfAugmentation$WndAugment.MARGIN), Math.fround(titlebar.bottom() + StoneOfAugmentation$WndAugment.MARGIN));
    this.add$Gizmo(tfMesage);
    let pos = Math.fround(tfMesage.bottom() + StoneOfAugmentation$WndAugment.MARGIN);
    if (toAugment instanceof Weapon) {
      for (let aug of Weapon$Augment.values()) {
        if ((toAugment).augment !== aug) {
          let btnAug = new (StoneOfAugmentation$WndAugment$1())().$o(this).$c(toAugment, aug)._RedButton$String(Messages.get$Object$String$ObjectArr(this, aug.name(), []));
          btnAug.setRect(Math.fround(StoneOfAugmentation$WndAugment.MARGIN), Math.fround(pos + StoneOfAugmentation$WndAugment.MARGIN), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_WIDTH), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_HEIGHT));
          this.add$Gizmo(btnAug);
          pos = btnAug.bottom();
        }
      }
    } else if (toAugment instanceof Armor) {
      for (let aug of Armor$Augment.values()) {
        if ((toAugment).augment !== aug) {
          let btnAug = new (StoneOfAugmentation$WndAugment$2())().$o(this).$c(toAugment, aug)._RedButton$String(Messages.get$Object$String$ObjectArr(this, aug.name(), []));
          btnAug.setRect(Math.fround(StoneOfAugmentation$WndAugment.MARGIN), Math.fround(pos + StoneOfAugmentation$WndAugment.MARGIN), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_WIDTH), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_HEIGHT));
          this.add$Gizmo(btnAug);
          pos = btnAug.bottom();
        }
      }
    }
    let btnCancel = new (StoneOfAugmentation$WndAugment$3())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'cancel', []));
    btnCancel.setRect(Math.fround(StoneOfAugmentation$WndAugment.MARGIN), Math.fround(pos + StoneOfAugmentation$WndAugment.MARGIN), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_WIDTH), Math.fround(StoneOfAugmentation$WndAugment.BUTTON_HEIGHT));
    this.add$Gizmo(btnCancel);
    this.resize(StoneOfAugmentation$WndAugment.WIDTH, ($J.d2i(btnCancel.bottom()) + StoneOfAugmentation$WndAugment.MARGIN) | 0);
    return this;
  }
  onBackPressed(): void {
    super.onBackPressed();
    this.$outer.activate(Item.curUser.pos);
  }
}

let $StoneOfAugmentation$WndAugment$1: any = null;
/** An anonymous class (StoneOfAugmentation.java:126). */
function StoneOfAugmentation$WndAugment$1(): any {
  return $StoneOfAugmentation$WndAugment$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.apply$Weapon$Augment(this.$cv_toAugment, this.$cv_aug);
    }
    $c($toAugment, $aug): this {
      this.$cv_toAugment = $toAugment; this.$cv_aug = $aug;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation$WndAugment$1', []);
}

let $StoneOfAugmentation$WndAugment$2: any = null;
/** An anonymous class (StoneOfAugmentation.java:143). */
function StoneOfAugmentation$WndAugment$2(): any {
  return $StoneOfAugmentation$WndAugment$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.apply$Armor$Augment(this.$cv_toAugment, this.$cv_aug);
    }
    $c($toAugment, $aug): this {
      this.$cv_toAugment = $toAugment; this.$cv_aug = $aug;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation$WndAugment$2', []);
}

let $StoneOfAugmentation$WndAugment$3: any = null;
/** An anonymous class (StoneOfAugmentation.java:158). */
function StoneOfAugmentation$WndAugment$3(): any {
  return $StoneOfAugmentation$WndAugment$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.activate(Item.curUser.pos);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation$WndAugment$3', []);
}

$J.define(StoneOfAugmentation, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone', ctors: { '': '_StoneOfAugmentation' }, meths: { 'apply(com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor,com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Augment)': 'apply$Armor$Augment', 'apply(com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon,com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment)': 'apply$Weapon$Augment' } });
$J.define(StoneOfAugmentation$WndAugment, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation$WndAugment', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_StoneOfAugmentation$WndAugment' }, inner: true });
$J.module(() => {
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Augment');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  ScrollOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
