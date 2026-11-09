// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfIdentify.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { InventoryScroll } from './InventoryScroll.ts';

let Badges, Identification, Item, Armor, Ring, ShardOfOblivion, Wand, Weapon, Messages, ItemSpriteSheet$Icons, GLog;

export class ScrollOfIdentify extends InventoryScroll {
  _ScrollOfIdentify(): this {
    this._InventoryScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_IDENTIFY;
    this.bones = true;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return !item.isIdentified();
  }
  onItemSelected(item: Item): void {
    Item.curUser.sprite_.parent.add$Gizmo(new Identification()._Identification(Item.curUser.sprite_.center$().offset$float$float(0, -16)));
    ScrollOfIdentify.IDItem(item);
  }
  static IDItem(item: Item): void {
    if (ShardOfOblivion.passiveIDDisabled()) {
      if (item instanceof Weapon) {
        (item).setIDReady();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [item.name()]);
        return;
      } else if (item instanceof Armor) {
        (item).setIDReady();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [item.name()]);
        return;
      } else if (item instanceof Ring) {
        (item).setIDReady();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [item.name()]);
        return;
      } else if (item instanceof Wand) {
        (item).setIDReady();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [item.name()]);
        return;
      }
    }
    item.identify$();
    GLog.i(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfIdentify), 'it_is', [item.title()]), []);
    Badges.validateItemLevelAquired(item);
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(ScrollOfIdentify, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll', ctors: { '': '_ScrollOfIdentify' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
