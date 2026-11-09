// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfDetectMagic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Belongings$Backpack, Talent, EquipableItem, Item, Armor, Wand, Weapon, Catalog, Messages, ItemSpriteSheet, GLog;

export class StoneOfDetectMagic extends InventoryStone {
  _StoneOfDetectMagic(): this {
    this._InventoryStone();
    this.preferredBag_ = $J.cls(Belongings$Backpack);
    this.image_ = ItemSpriteSheet.STONE_DETECT;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return (item instanceof EquipableItem || item instanceof Wand) && (!item.isIdentified() || !item.cursedKnown);
  }
  onItemSelected(item: Item): void {
    item.cursedKnown = true;
    this.useAnimation();
    let negativeMagic = false;
    let positiveMagic = false;
    negativeMagic = item.cursed;
    if (!negativeMagic) {
      if (item instanceof Weapon && (item).hasCurseEnchant()) {
        negativeMagic = true;
      } else if (item instanceof Armor && (item).hasCurseGlyph()) {
        negativeMagic = true;
      }
    }
    positiveMagic = item.trueLevel() > 0;
    if (!positiveMagic) {
      if (item instanceof Weapon && (item).hasGoodEnchant()) {
        positiveMagic = true;
      } else if (item instanceof Armor && (item).hasGoodGlyph()) {
        positiveMagic = true;
      }
    }
    if (!positiveMagic && !negativeMagic) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'detected_none', []), []);
    } else if (positiveMagic && negativeMagic) {
      GLog.h(Messages.get$Object$String$ObjectArr(this, 'detected_both', []), []);
    } else if (positiveMagic) {
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'detected_good', []), []);
    } else if (negativeMagic) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'detected_bad', []), []);
    }
    if (!this.anonymous) {
      Item.curItem.detach(Item.curUser.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      Talent.onRunestoneUsed(Item.curUser, Item.curUser.pos, $J.getClass(this));
    }
  }
}

$J.define(StoneOfDetectMagic, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDetectMagic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone', ctors: { '': '_StoneOfDetectMagic' } });
$J.module(() => {
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
