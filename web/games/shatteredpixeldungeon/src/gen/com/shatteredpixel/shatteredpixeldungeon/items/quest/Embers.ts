// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/Embers.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let ItemSprite$Glowing, ItemSpriteSheet;

export class Embers extends Item {
  _Embers(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.EMBER;
    this.unique = true;
    return this;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(6684672, 3);
  }
}

$J.define(Embers, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Embers' } });
$J.module(() => {
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
