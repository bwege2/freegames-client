// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/Runestone.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Dungeon, Actor, Invisibility, MagicImmune, Talent, InventoryStone, Catalog, ItemSpriteSheet;

export class Runestone extends Item {
  anonymous: boolean = false;
  _Runestone(): this {
    this._Item();
    this.stackable = true;
    this.defaultAction_ = Item.AC_THROW;
    this.anonymous = false;
    return this;
  }
  anonymize(): void {
    this.image_ = ItemSpriteSheet.STONE_HOLDER;
    this.anonymous = true;
  }
  onThrow(cell: number): void {
    if (this instanceof InventoryStone || Dungeon.hero.buff($J.cls(MagicImmune)) != null || (Dungeon.level.pit[cell] && Actor.findChar(cell) == null)) {
      if (!this.anonymous) {
        super.onThrow(cell);
      }
    } else {
      if (!this.anonymous) {
        Catalog.countUse($J.getClass(this));
        Talent.onRunestoneUsed(Item.curUser, cell, $J.getClass(this));
      }
      this.activate(cell);
      if (Actor.findChar(cell) == null) {
        Dungeon.level.pressCell$int(cell);
      }
      Invisibility.dispel$();
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(15, this.quantity);
  }
  energyVal(): number {
    return Math.imul(3, this.quantity);
  }
}

export class Runestone$PlaceHolder extends Runestone {
  _Runestone$PlaceHolder(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_HOLDER;
    return this;
  }
  activate(cell: number): void {
  }
  isSimilar(item: Item): boolean {
    return item instanceof Runestone;
  }
  info(): string {
    return '';
  }
}

$J.define(Runestone, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Runestone' } });
$J.define(Runestone$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_Runestone$PlaceHolder' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  InventoryStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
