// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/CurseInfusion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, CellEmitter, ShadowParticle, EquipableItem, Item, Armor, Armor$Glyph, MetalShard, RingOfMight, ScrollOfRemoveCurse, Wand, SpiritBow, Weapon, Weapon$Enchantment, MagesStaff, Catalog, ItemSpriteSheet, Sample;

export class CurseInfusion extends InventorySpell {
  _CurseInfusion(): this {
    this._InventorySpell();
    this.image_ = ItemSpriteSheet.CURSE_INFUSE;
    this.talentChance = Math.fround(1 / Math.fround(CurseInfusion$Recipe.OUT_QUANTITY));
    return this;
  }
  usableOnItem(item: Item): boolean {
    return ((item instanceof EquipableItem && item.isUpgradable()) || item instanceof Wand || item instanceof SpiritBow);
  }
  onItemSelected(item: Item): void {
    CellEmitter.get(Item.curUser.pos).burst(ShadowParticle.UP, 5);
    Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
    item.cursed = true;
    if (item instanceof Weapon) {
      let w = item;
      if (w.enchantment != null) {
        if (w.hasGoodEnchant() || w.curseInfusionBonus) {
          w.enchant$Enchantment(Weapon$Enchantment.randomCurse([w.enchantment.getClass()]));
        }
      } else {
        w.enchant$Enchantment(Weapon$Enchantment.randomCurse([]));
      }
      w.curseInfusionBonus = true;
      if (w instanceof MagesStaff) {
        (w).updateWand(true);
      }
    } else if (item instanceof Armor) {
      let a = item;
      if (a.glyph_ != null) {
        if (a.hasGoodGlyph() || a.curseInfusionBonus) {
          a.inscribe$Glyph(Armor$Glyph.randomCurse([a.glyph_.getClass()]));
        }
      } else {
        a.inscribe$Glyph(Armor$Glyph.randomCurse([]));
      }
      a.curseInfusionBonus = true;
    } else if (item instanceof Wand) {
      (item).curseInfusionBonus = true;
      (item).updateLevel();
    } else if (item instanceof RingOfMight) {
      Item.curUser.updateHT(false);
    }
    Badges.validateItemLevelAquired(item);
    Item.updateQuickslot();
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(CurseInfusion$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(CurseInfusion$Recipe.OUT_QUANTITY))))));
  }
}

export class CurseInfusion$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 4;
  _CurseInfusion$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfRemoveCurse), $J.cls(MetalShard)];
    this.inQuantity = [1, 1];
    this.cost_ = 6;
    this.output = $J.cls(CurseInfusion);
    this.outQuantity = CurseInfusion$Recipe.OUT_QUANTITY;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(MetalShard));
    return super.brew(ingredients);
  }
}

$J.define(CurseInfusion, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.CurseInfusion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.InventorySpell', ctors: { '': '_CurseInfusion' } });
$J.define(CurseInfusion$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.CurseInfusion$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_CurseInfusion$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  RingOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
