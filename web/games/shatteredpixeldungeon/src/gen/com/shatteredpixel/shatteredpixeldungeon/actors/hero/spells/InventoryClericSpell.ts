// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/InventoryClericSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ClericSpell } from './ClericSpell.ts';

let Messages, GameScene, WndBag$ItemSelector;

export class InventoryClericSpell extends ClericSpell {
  _InventoryClericSpell(): this {
    this._ClericSpell();
    return this;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.selectItem(new (InventoryClericSpell$1())().$o(this).$c(tome, hero)._WndBag$ItemSelector());
  }
  inventoryPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  preferredBag(): JClass<Bag> {
    return null;
  }
  usableOnItem(item: Item): boolean {
    return true;
  }
}

let $InventoryClericSpell$1: any = null;
/** An anonymous class (InventoryClericSpell.java:36). */
function InventoryClericSpell$1(): any {
  return $InventoryClericSpell$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return this.$outer.inventoryPrompt();
    }
    preferredBag(): JClass<Bag> {
      return this.$outer.preferredBag();
    }
    itemSelectable(item: Item): boolean {
      return this.$outer.usableOnItem(item);
    }
    onSelect(item: Item): void {
      this.$outer.onItemSelected(this.$cv_tome, this.$cv_hero, item);
    }
    $c($tome, $hero): this {
      this.$cv_tome = $tome; this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.InventoryClericSpell$1', []);
}

$J.define(InventoryClericSpell, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.InventoryClericSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_InventoryClericSpell' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
});
