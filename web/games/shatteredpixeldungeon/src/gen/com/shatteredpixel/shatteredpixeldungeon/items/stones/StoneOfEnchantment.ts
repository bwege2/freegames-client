// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfEnchantment.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Belongings$Backpack, Talent, Enchanting, Speck, Item, ScrollOfEnchantment, Weapon, Catalog, Messages, ItemSpriteSheet, GLog;

export class StoneOfEnchantment extends InventoryStone {
  _StoneOfEnchantment(): this {
    this._InventoryStone();
    this.preferredBag_ = $J.cls(Belongings$Backpack);
    this.image_ = ItemSpriteSheet.STONE_ENCHANT;
    this.unique = true;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return ScrollOfEnchantment.enchantable(item);
  }
  onItemSelected(item: Item): void {
    if (!this.anonymous) {
      Item.curItem.detach(Item.curUser.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      Talent.onRunestoneUsed(Item.curUser, Item.curUser.pos, $J.getClass(this));
    }
    if (item instanceof Weapon) {
      (item).enchant$();
    } else {
      (item).inscribe$();
    }
    Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.1), 5);
    Enchanting.show(Item.curUser, item);
    if (item instanceof Weapon) {
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'weapon', []), []);
    } else {
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'armor', []), []);
    }
    this.useAnimation();
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(5, this.quantity);
  }
}

$J.define(StoneOfEnchantment, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone', ctors: { '': '_StoneOfEnchantment' } });
$J.module(() => {
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
