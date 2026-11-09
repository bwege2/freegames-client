// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/InventoryStone.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Runestone } from './Runestone.ts';

let Assets$Sounds, Invisibility, MagicImmune, Item, Messages, GameScene, WndBag$ItemSelector, Sample;

export class InventoryStone extends Runestone {
  static readonly AC_USE: string = 'USE';
  preferredBag_: JClass<Bag> = null;
  itemSelector: WndBag$ItemSelector = null;
  _InventoryStone(): this {
    this._Runestone();
    this.defaultAction_ = InventoryStone.AC_USE;
    this.preferredBag_ = null;
    this.itemSelector = new (InventoryStone$1())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(InventoryStone.AC_USE);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, InventoryStone.AC_USE) && hero.buff($J.cls(MagicImmune)) == null) {
      this.activate(Item.curUser.pos);
    }
  }
  activate(cell: number): void {
    GameScene.selectItem(this.itemSelector);
  }
  directActivate(): void {
    GameScene.selectItem(this.itemSelector);
  }
  useAnimation(): void {
    Item.curUser.spend(1);
    Item.curUser.busy();
    Item.curUser.sprite_.operate$int(Item.curUser.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    Invisibility.dispel$();
  }
  inventoryTitle(): string {
    return Messages.get$Object$String$ObjectArr(this, 'inv_title', []);
  }
  usableOnItem(item: Item): boolean {
    return true;
  }
}

let $InventoryStone$1: any = null;
/** An anonymous class (InventoryStone.java:90). */
function InventoryStone$1(): any {
  return $InventoryStone$1 ??= $J.local(class extends WndBag$ItemSelector {
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
      if (!(Item.curItem instanceof InventoryStone)) {
        return;
      }
      if (item != null) {
        (Item.curItem).onItemSelected(item);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone$1', []);
}

$J.define(InventoryStone, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_InventoryStone' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
