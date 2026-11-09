// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/keys/IronKey.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Key } from './Key.ts';

let ItemSpriteSheet;

export class IronKey extends Key {
  $init_IronKey() {
    this.image_ = ItemSpriteSheet.IRON_KEY;
  }
  _IronKey$(): this {
    this._IronKey$int(0);
    return this;
  }
  _IronKey$int(depth: number): this {
    this._Key();
    this.$init_IronKey();
    this.depth_ = depth;
    return this;
  }
}

$J.define(IronKey, 'com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.keys.Key', ctors: { 'int': '_IronKey$int', '': '_IronKey$' } });
$J.module(() => {
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
