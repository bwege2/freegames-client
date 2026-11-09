// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/WildEnergy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedSpell } from './TargetedSpell.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Assets$Sounds, ArtifactRecharge, Buff, Recharging, SpellSprite, Item, MetalShard, ScrollOfRecharging, CursedWand, Catalog, ItemSpriteSheet, Sample;

export class WildEnergy extends TargetedSpell {
  _WildEnergy(): this {
    this._TargetedSpell();
    this.image_ = ItemSpriteSheet.WILD_ENERGY;
    this.usesTargeting_ = true;
    this.talentChance = Math.fround(1 / Math.fround(WildEnergy$Recipe.OUT_QUANTITY));
    return this;
  }
  fx(bolt: Ballistica, callback: Callback): void {
    CursedWand.cursedZap(this, Item.curUser, bolt, callback);
  }
  affectTarget(bolt: Ballistica, hero: Hero): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    ScrollOfRecharging.charge(hero);
    SpellSprite.show$Char$int(hero, SpellSprite.CHARGE);
    hero.belongings.charge(1);
    ArtifactRecharge.chargeArtifacts(hero, 4);
    Buff.affect$Char$Class$float(hero, $J.cls(Recharging), 8);
    Buff.affect$Char$Class(hero, $J.cls(ArtifactRecharge)).extend(8).ignoreHornOfPlenty = false;
    this.onSpellused();
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(WildEnergy$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(WildEnergy$Recipe.OUT_QUANTITY))))));
  }
}

export class WildEnergy$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 5;
  _WildEnergy$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfRecharging), $J.cls(MetalShard)];
    this.inQuantity = [1, 1];
    this.cost_ = 4;
    this.output = $J.cls(WildEnergy);
    this.outQuantity = WildEnergy$Recipe.OUT_QUANTITY;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(MetalShard));
    return super.brew(ingredients);
  }
}

$J.define(WildEnergy, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.WildEnergy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell', ctors: { '': '_WildEnergy' } });
$J.define(WildEnergy$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.WildEnergy$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_WildEnergy$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
