// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfMastery.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { ExoticPotion } from './ExoticPotion.ts';

let Assets$Sounds, Talent, Item, Armor, SpiritBow, Weapon, Catalog, Messages, GameScene, ItemSprite, ItemSpriteSheet$Icons, GLog, WndBag$ItemSelector, WndOptions, Sample, Random;

export class PotionOfMastery extends ExoticPotion {
  static identifiedByUse: boolean = false;
  itemSelector: WndBag$ItemSelector = null;
  _PotionOfMastery(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_MASTERY;
    this.unique = true;
    this.talentFactor = 2;
    this.itemSelector = new (PotionOfMastery$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  drink(hero: Hero): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(hero.belongings.backpack);
      PotionOfMastery.identifiedByUse = true;
    } else {
      PotionOfMastery.identifiedByUse = false;
    }
    GameScene.selectItem(this.itemSelector);
  }
  static $clinit() {
    PotionOfMastery.identifiedByUse = false;
  }
}

let $PotionOfMastery$1$1: any = null;
/** An anonymous class (PotionOfMastery.java:91). */
function PotionOfMastery$1$1(): any {
  return $PotionOfMastery$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      switch (index) {
        case 0:
          Item.curUser.spendAndNext(1);
          PotionOfMastery.identifiedByUse = false;
          break;
        case 1:
          GameScene.selectItem(this.$outer.$outer.itemSelector);
          break;
      }
    }
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMastery$1$1', []);
}

let $PotionOfMastery$1: any = null;
/** An anonymous class (PotionOfMastery.java:69). */
function PotionOfMastery$1(): any {
  return $PotionOfMastery$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(PotionOfMastery), 'prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return (item instanceof Weapon && !(item instanceof SpiritBow) && !(item).masteryPotionBonus) || (item instanceof Armor && !(item).masteryPotionBonus);
    }
    onSelect(item: Item): void {
      if (item == null && PotionOfMastery.identifiedByUse) {
        GameScene.show(new (PotionOfMastery$1$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this.$outer), Messages.titleCase(this.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'warning', []), [Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(ExoticPotion), 'no', [])]));
      } else if (item != null) {
        if (item instanceof Weapon) {
          (item).masteryPotionBonus = true;
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(PotionOfMastery), 'weapon_easier', []), []);
        } else if (item instanceof Armor) {
          (item).masteryPotionBonus = true;
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(PotionOfMastery), 'armor_easier', []), []);
        }
        Item.updateQuickslot();
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        Item.curUser.sprite_.operate$int(Item.curUser.pos);
        if (!PotionOfMastery.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        PotionOfMastery.identifiedByUse = false;
        if (!this.$outer.anonymous) {
          Catalog.countUse($J.cls(PotionOfMastery));
          if (Random.Float$() < this.$outer.talentChance) {
            Talent.onPotionUsed(Item.curUser, Item.curUser.pos, this.$outer.talentFactor);
          }
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMastery$1', []);
}

$J.define(PotionOfMastery, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMastery', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfMastery' }, clinit: true, lazy: ['identifiedByUse'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
