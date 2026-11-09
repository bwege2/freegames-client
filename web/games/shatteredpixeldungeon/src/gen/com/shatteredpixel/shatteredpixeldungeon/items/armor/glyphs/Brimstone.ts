// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Brimstone.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Armor$Glyph } from '../Armor.ts';

let ItemSprite$Glowing;

export class Brimstone extends Armor$Glyph {
  static ORANGE: ItemSprite$Glowing = null;
  _Brimstone(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Brimstone.ORANGE;
  }
  static $clinit() {
    Brimstone.ORANGE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16729088);
  }
}

$J.define(Brimstone, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Brimstone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Brimstone' }, clinit: true, lazy: ['ORANGE'] });
$J.module(() => {
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
});
