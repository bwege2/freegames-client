// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRemoveCurse.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Degrade, Belongings$Backpack, TormentedSpirit, Flare, ShadowParticle, EquipableItem, Item, Armor, Wand, Weapon, Messages, ItemSpriteSheet$Icons, GLog, Sample, PathFinder;

export class ScrollOfRemoveCurse extends InventoryScroll {
  _ScrollOfRemoveCurse(): this {
    this._InventoryScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_REMCURSE;
    this.preferredBag_ = $J.cls(Belongings$Backpack);
    return this;
  }
  doRead(): void {
    let spirit = null;
    for (let i of PathFinder.NEIGHBOURS8) {
      if ((Actor.findChar((Item.curUser.pos + i) | 0)) instanceof TormentedSpirit) {
        spirit = Actor.findChar((Item.curUser.pos + i) | 0);
      }
    }
    if (spirit != null) {
      this.identify$();
      Sample.INSTANCE.play$Object(Assets$Sounds.READ);
      this.readAnimation();
      new Flare()._Flare(6, 32).show$Visual$float(Item.curUser.sprite_, 2);
      if (Item.curUser.buff($J.cls(Degrade)) != null) {
        Buff.detach(Item.curUser, $J.cls(Degrade));
      }
      this.detach(Item.curUser.belongings.backpack);
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'spirit', []), []);
      spirit.cleanse();
    } else {
      super.doRead();
    }
  }
  usableOnItem(item: Item): boolean {
    return ScrollOfRemoveCurse.uncursable(item);
  }
  static uncursable(item: Item): boolean {
    if (item.isEquipped(Dungeon.hero) && Dungeon.hero.buff($J.cls(Degrade)) != null) {
      return true;
    }
    if ((item instanceof EquipableItem || item instanceof Wand) && ((!item.isIdentified() && !item.cursedKnown) || item.cursed)) {
      return true;
    } else if (item instanceof Weapon) {
      return (item).hasCurseEnchant();
    } else if (item instanceof Armor) {
      return (item).hasCurseGlyph();
    } else {
      return false;
    }
  }
  onItemSelected(item: Item): void {
    new Flare()._Flare(6, 32).show$Visual$float(Item.curUser.sprite_, 2);
    let procced = ScrollOfRemoveCurse.uncurse(Item.curUser, [item]);
    if (Item.curUser.buff($J.cls(Degrade)) != null) {
      Buff.detach(Item.curUser, $J.cls(Degrade));
      procced = true;
    }
    if (procced) {
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'cleansed', []), []);
    } else {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'not_cleansed', []), []);
    }
  }
  static uncurse(hero: Hero, items: Item[]): boolean {
    let procced = false;
    for (let item of items) {
      if (item != null) {
        item.cursedKnown = true;
        if (item.cursed) {
          procced = true;
          item.cursed = false;
        }
      }
      if (item instanceof Weapon) {
        let w = item;
        if (w.hasCurseEnchant()) {
          w.enchant$Enchantment(null);
          procced = true;
        }
      }
      if (item instanceof Armor) {
        let a = item;
        if (a.hasCurseGlyph()) {
          a.inscribe$Glyph(null);
          procced = true;
        }
      }
      if (item instanceof Wand) {
        (item).updateLevel();
      }
    }
    if (procced) {
      if (hero != null) {
        hero.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 10);
        hero.updateHT(false);
        Item.updateQuickslot();
      }
      Badges.validateClericUnlock();
    }
    return procced;
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(ScrollOfRemoveCurse, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll', ctors: { '': '_ScrollOfRemoveCurse' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  TormentedSpirit = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.TormentedSpirit');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
