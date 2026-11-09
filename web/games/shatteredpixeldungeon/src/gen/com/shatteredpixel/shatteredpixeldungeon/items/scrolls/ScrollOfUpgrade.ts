// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfUpgrade.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Statistics, Buff, Degrade, Belongings$Backpack, Speck, ShadowParticle, Item, Armor, Ring, Wand, Weapon, Catalog, Messages, GameScene, ItemSpriteSheet$Icons, GLog, WndUpgrade;

export class ScrollOfUpgrade extends InventoryScroll {
  _ScrollOfUpgrade(): this {
    this._InventoryScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_UPGRADE;
    this.preferredBag_ = $J.cls(Belongings$Backpack);
    this.unique = true;
    this.talentFactor = 2;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return item.isUpgradable();
  }
  onItemSelected(item: Item): void {
    GameScene.show(new WndUpgrade()._WndUpgrade(this, item, InventoryScroll.identifiedByUse));
  }
  reShowSelector(force: boolean): void {
    InventoryScroll.identifiedByUse = force;
    Item.curItem = this;
    GameScene.selectItem(this.itemSelector);
  }
  getSelector(force: boolean): WndBag$ItemSelector {
    InventoryScroll.identifiedByUse = force;
    Item.curItem = this;
    return this.itemSelector;
  }
  upgradeItem(item: Item): Item {
    ScrollOfUpgrade.upgrade(Item.curUser);
    Buff.detach(Item.curUser, $J.cls(Degrade));
    if (item instanceof Weapon) {
      let w = item;
      let wasCursed = w.cursed;
      let wasHardened = w.enchantHardened;
      let hadCursedEnchant = w.hasCurseEnchant();
      let hadGoodEnchant = w.hasGoodEnchant();
      item = w.upgrade$();
      if (w.cursedKnown && hadCursedEnchant && !w.hasCurseEnchant()) {
        ScrollOfUpgrade.removeCurse(Dungeon.hero);
      } else if (w.cursedKnown && wasCursed && !w.cursed) {
        ScrollOfUpgrade.weakenCurse(Dungeon.hero);
      }
      if (wasHardened && !w.enchantHardened) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'hardening_gone', []), []);
      } else if (hadGoodEnchant && !w.hasGoodEnchant()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'incompatible', []), []);
      }
    } else if (item instanceof Armor) {
      let a = item;
      let wasCursed = a.cursed;
      let wasHardened = a.glyphHardened;
      let hadCursedGlyph = a.hasCurseGlyph();
      let hadGoodGlyph = a.hasGoodGlyph();
      item = a.upgrade$();
      if (a.cursedKnown && hadCursedGlyph && !a.hasCurseGlyph()) {
        ScrollOfUpgrade.removeCurse(Dungeon.hero);
      } else if (a.cursedKnown && wasCursed && !a.cursed) {
        ScrollOfUpgrade.weakenCurse(Dungeon.hero);
      }
      if (wasHardened && !a.glyphHardened) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'hardening_gone', []), []);
      } else if (hadGoodGlyph && !a.hasGoodGlyph()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'incompatible', []), []);
      }
    } else if (item instanceof Wand || item instanceof Ring) {
      let wasCursed = item.cursed;
      item = item.upgrade$();
      if (item.cursedKnown && wasCursed && !item.cursed) {
        ScrollOfUpgrade.removeCurse(Dungeon.hero);
      }
    } else {
      item = item.upgrade$();
    }
    Badges.validateItemLevelAquired(item);
    Statistics.upgradesUsed++;
    Badges.validateMageUnlock();
    Catalog.countUse(item.getClass());
    return item;
  }
  static upgrade(hero: Hero): void {
    hero.sprite_.emitter().start(Speck.factory$int(Speck.UP), Math.fround(0.2), 3);
  }
  static weakenCurse(hero: Hero): void {
    GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfUpgrade), 'weaken_curse', []), []);
    hero.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 5);
  }
  static removeCurse(hero: Hero): void {
    GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfUpgrade), 'remove_curse', []), []);
    hero.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 10);
    Badges.validateClericUnlock();
  }
  value(): number {
    return this.isKnown() ? Math.imul(50, this.quantity) : super.value();
  }
  energyVal(): number {
    return this.isKnown() ? Math.imul(10, this.quantity) : super.energyVal();
  }
}

$J.define(ScrollOfUpgrade, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll', ctors: { '': '_ScrollOfUpgrade' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade');
});
