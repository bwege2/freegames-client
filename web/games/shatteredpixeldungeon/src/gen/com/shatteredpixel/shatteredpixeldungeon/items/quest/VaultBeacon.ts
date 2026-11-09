// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/VaultBeacon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Spell } from '../spells/Spell.ts';

let Dungeon, ScrollOfTeleportation, Catalog, ItemSprite$Glowing, ItemSpriteSheet;

export class VaultBeacon extends Spell {
  static WHITE: ItemSprite$Glowing = null;
  _VaultBeacon(): this {
    this._Spell();
    this.image_ = ItemSpriteSheet.RETURN_BEACON;
    this.stackable = true;
    this.unique = true;
    return this;
  }
  onCast(hero: Hero): void {
    if (ScrollOfTeleportation.teleportToLocation(hero, Dungeon.level.entrance())) {
      hero.spendAndNext(1);
      Catalog.countUse($J.getClass(this));
      this.detach(hero.belongings.backpack);
    }
  }
  glowing(): ItemSprite$Glowing {
    return VaultBeacon.WHITE;
  }
  static $clinit() {
    VaultBeacon.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777215);
  }
}

$J.define(VaultBeacon, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.VaultBeacon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_VaultBeacon' }, clinit: true, lazy: ['WHITE'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
