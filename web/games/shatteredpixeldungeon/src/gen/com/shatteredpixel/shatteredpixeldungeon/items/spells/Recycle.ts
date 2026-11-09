// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/Recycle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Speck, Transmuting, Generator, Generator$Category, Item, Potion, Brew, Elixir, ExoticPotion, Scroll, ScrollOfTransmutation, ExoticScroll, Runestone, TippedDart, Messages, Plant$Seed, ItemSpriteSheet, GLog, Reflection;

export class Recycle extends InventorySpell {
  _Recycle(): this {
    this._InventorySpell();
    this.image_ = ItemSpriteSheet.RECYCLE;
    this.talentFactor = 2;
    this.talentChance = Math.fround(1 / Math.fround(Recycle$Recipe.OUT_QUANTITY));
    return this;
  }
  usableOnItem(item: Item): boolean {
    return (item instanceof Potion && !(item instanceof Elixir || item instanceof Brew)) || item instanceof Scroll || item instanceof Plant$Seed || item instanceof Runestone || item instanceof TippedDart;
  }
  onItemSelected(item: Item): void {
    let result: Item;
    do {
      if (item instanceof Potion) {
        result = Generator.randomUsingDefaults$Category(Generator$Category.POTION);
        if (item instanceof ExoticPotion) {
          result = Reflection.newInstance(ExoticPotion.regToExo.get(result.getClass()));
        }
      } else if (item instanceof Scroll) {
        result = Generator.randomUsingDefaults$Category(Generator$Category.SCROLL);
        if (item instanceof ExoticScroll) {
          result = Reflection.newInstance(ExoticScroll.regToExo.get(result.getClass()));
        }
      } else if (item instanceof Plant$Seed) {
        result = Generator.randomUsingDefaults$Category(Generator$Category.SEED);
      } else if (item instanceof Runestone) {
        result = Generator.randomUsingDefaults$Category(Generator$Category.STONE);
      } else {
        result = TippedDart.randomTipped(1);
      }
    } while (result.getClass() === item.getClass() || Challenges.isItemBlocked(result));
    item.detach(Item.curUser.belongings.backpack);
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'recycled', [result.name()]), []);
    if (!result.collect$()) {
      Dungeon.level.drop(result, Item.curUser.pos).sprite_.drop$();
    }
    Transmuting.show$Char$Item$Item(Item.curUser, item, result);
    Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.CHANGE), Math.fround(0.2), 10);
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(Recycle$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(Recycle$Recipe.OUT_QUANTITY))))));
  }
}

export class Recycle$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 12;
  _Recycle$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfTransmutation)];
    this.inQuantity = [1];
    this.cost_ = 12;
    this.output = $J.cls(Recycle);
    this.outQuantity = Recycle$Recipe.OUT_QUANTITY;
    return this;
  }
}

$J.define(Recycle, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Recycle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.InventorySpell', ctors: { '': '_Recycle' } });
$J.define(Recycle$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Recycle$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_Recycle$Recipe' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Transmuting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Brew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew');
  Elixir = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
