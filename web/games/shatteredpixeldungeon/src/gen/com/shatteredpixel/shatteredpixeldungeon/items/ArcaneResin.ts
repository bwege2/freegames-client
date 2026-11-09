// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/ArcaneResin.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';
import { Recipe } from './Recipe.ts';

let Assets$Sounds, Dungeon, Actor, HeroClass, Talent, Speck, MagicalHolster, Wand, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndBag$ItemSelector, Sample;

export class ArcaneResin extends Item {
  static readonly AC_APPLY: string = 'APPLY';
  itemSelector: WndBag$ItemSelector = null;
  _ArcaneResin(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.ARCANE_RESIN;
    this.stackable = true;
    this.defaultAction_ = ArcaneResin.AC_APPLY;
    this.bones = true;
    this.itemSelector = new (ArcaneResin$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(ArcaneResin.AC_APPLY);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, ArcaneResin.AC_APPLY)) {
      Item.curUser = hero;
      GameScene.selectItem(this.itemSelector);
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(30, this.quantity$());
  }
}

export class ArcaneResin$Recipe extends Recipe {
  _ArcaneResin$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    return ingredients.size() === 1 && ingredients.get(0) instanceof Wand && ingredients.get(0).cursedKnown && !ingredients.get(0).cursed;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 5;
  }
  brew(ingredients: ArrayList<Item>): Item {
    let result = this.sampleOutput(ingredients);
    let w = ingredients.get(0);
    if (!w.levelKnown) {
      result.quantity$int(this.resinQuantity(w));
    }
    w.quantity$int(0);
    return result;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    let w = ingredients.get(0);
    if (w.levelKnown) {
      return new ArcaneResin()._ArcaneResin().quantity$int(this.resinQuantity(w));
    } else {
      return new ArcaneResin()._ArcaneResin();
    }
  }
  resinQuantity(w: Wand): number {
    let level = (w.level$() - w.resinBonus) | 0;
    let quantity = Math.imul(2, ((level + 1) | 0));
    if (Dungeon.hero.heroClass !== HeroClass.MAGE && Dungeon.hero.hasTalent(Talent.WAND_PRESERVATION)) {
      quantity = (quantity + Dungeon.hero.pointsInTalent(Talent.WAND_PRESERVATION)) | 0;
    }
    return quantity;
  }
}

let $ArcaneResin$1: any = null;
/** An anonymous class (ArcaneResin.java:93). */
function ArcaneResin$1(): any {
  return $ArcaneResin$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(ArcaneResin), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(MagicalHolster);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Wand && item.isIdentified();
    }
    onSelect(item: Item): void {
      if (item != null && item instanceof Wand) {
        let w = item;
        if (w.level$() >= 3) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ArcaneResin), 'level_too_high', []), []);
          return;
        }
        let resinToUse = (w.level$() + 1) | 0;
        if (this.$outer.quantity$() < resinToUse) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ArcaneResin), 'not_enough', []), []);
        } else {
          Catalog.countUses($J.cls(ArcaneResin), resinToUse);
          if (resinToUse < this.$outer.quantity$()) {
            this.$outer.quantity$int((this.$outer.quantity$() - resinToUse) | 0);
          } else {
            this.$outer.detachAll(Dungeon.hero.belongings.backpack);
          }
          w.resinBonus++;
          w.curCharges++;
          w.updateLevel();
          Item.updateQuickslot();
          Item.curUser.sprite_.operate$int(Item.curUser.pos);
          Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
          Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.UP), Math.fround(0.2), 3);
          Item.curUser.spendAndNext(Actor.TICK);
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ArcaneResin), 'apply', []), []);
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin$1', []);
}

$J.define(ArcaneResin, 'com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_ArcaneResin' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(ArcaneResin$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_ArcaneResin$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
