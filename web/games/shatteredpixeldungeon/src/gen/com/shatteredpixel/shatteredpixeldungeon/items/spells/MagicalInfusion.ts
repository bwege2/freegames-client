// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/MagicalInfusion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { InventorySpell } from './InventorySpell.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Assets$Sounds, Badges, Statistics, Buff, Degrade, Invisibility, Talent, Item, Armor, ScrollOfUpgrade, Wand, Weapon, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndUpgrade, Sample, Random;

export class MagicalInfusion extends InventorySpell {
  _MagicalInfusion(): this {
    this._InventorySpell();
    this.image_ = ItemSpriteSheet.MAGIC_INFUSE;
    this.unique = true;
    this.talentFactor = 2;
    return this;
  }
  usableOnItem(item: Item): boolean {
    return item.isUpgradable();
  }
  onItemSelected(item: Item): void {
    GameScene.show(new WndUpgrade()._WndUpgrade(this, item, false));
  }
  reShowSelector(): void {
    Item.curItem = this;
    GameScene.selectItem(this.itemSelector);
  }
  getSelector(): WndBag$ItemSelector {
    Item.curItem = this;
    return this.itemSelector;
  }
  useAnimation(): void {
    Item.curUser.spend(1);
    Item.curUser.busy();
    (Item.curUser.sprite_).operate$int(Item.curUser.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    Invisibility.dispel$();
    Catalog.countUse(Item.curItem.getClass());
    if (Random.Float$() < (Item.curItem).talentChance) {
      Talent.onScrollUsed(Item.curUser, Item.curUser.pos, (Item.curItem).talentFactor, $J.getClass(this));
    }
  }
  upgradeItem(item: Item): Item {
    ScrollOfUpgrade.upgrade(Item.curUser);
    Buff.detach(Item.curUser, $J.cls(Degrade));
    if (item instanceof Weapon && (item).enchantment != null) {
      item = (item).upgrade$boolean(true);
    } else if (item instanceof Armor && (item).glyph_ != null) {
      item = (item).upgrade$boolean(true);
    } else {
      let wasCursed = item.cursed;
      let wasCurseInfused = item instanceof Wand && (item).curseInfusionBonus;
      item = item.upgrade$();
      if (wasCursed) {
        item.cursed = true;
      }
      if (wasCurseInfused) {
        (item).curseInfusionBonus = true;
      }
    }
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'infuse', []), []);
    Badges.validateItemLevelAquired(item);
    Catalog.countUse(item.getClass());
    Statistics.upgradesUsed++;
    return item;
  }
  value(): number {
    return Math.imul(60, this.quantity);
  }
  energyVal(): number {
    return Math.imul(12, this.quantity);
  }
}

export class MagicalInfusion$Recipe extends Recipe$SimpleRecipe {
  _MagicalInfusion$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfUpgrade)];
    this.inQuantity = [1];
    this.cost_ = 12;
    this.output = $J.cls(MagicalInfusion);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(MagicalInfusion, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.InventorySpell', ctors: { '': '_MagicalInfusion' } });
$J.define(MagicalInfusion$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_MagicalInfusion$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
