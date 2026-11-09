// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/InventorySpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Spell } from './Spell.ts';

let Assets$Sounds, Invisibility, Talent, Item, MagicalInfusion, Catalog, Messages, GameScene, WndBag$ItemSelector, Sample, Random;

export class InventorySpell extends Spell {
  preferredBag_: JClass<Bag> = null;
  itemSelector: WndBag$ItemSelector = null;
  _InventorySpell(): this {
    this._Spell();
    this.preferredBag_ = null;
    this.itemSelector = new (InventorySpell$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  onCast(hero: Hero): void {
    GameScene.selectItem(this.itemSelector);
  }
  inventoryTitle(): string {
    return Messages.get$Object$String$ObjectArr(this, 'inv_title', []);
  }
  usableOnItem(item: Item): boolean {
    return true;
  }
}

let $InventorySpell$1: any = null;
/** An anonymous class (InventorySpell.java:56). */
function InventorySpell$1(): any {
  return $InventorySpell$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return this.$outer.inventoryTitle();
    }
    preferredBag(): JClass<Bag> {
      return this.$outer.preferredBag_;
    }
    itemSelectable(item: Item): boolean {
      return this.$outer.usableOnItem(item);
    }
    onSelect(item: Item): void {
      if (!(Item.curItem instanceof InventorySpell)) {
        return;
      }
      if (item != null) {
        if (!(Item.curItem instanceof MagicalInfusion)) {
          Item.curItem = this.$outer.detach(Item.curUser.belongings.backpack);
        }
        (Item.curItem).onItemSelected(item);
        if (!(Item.curItem instanceof MagicalInfusion)) {
          Item.curUser.spend(1);
          Item.curUser.busy();
          (Item.curUser.sprite_).operate$int(Item.curUser.pos);
          Sample.INSTANCE.play$Object(Assets$Sounds.READ);
          Invisibility.dispel$();
          Catalog.countUse(Item.curItem.getClass());
          if (Random.Float$() < (Item.curItem).talentChance) {
            Talent.onScrollUsed(Item.curUser, Item.curUser.pos, (Item.curItem).talentFactor, Item.curItem.getClass());
          }
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.InventorySpell$1', []);
}

$J.define(InventorySpell, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.InventorySpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_InventorySpell' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MagicalInfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
