// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Obfuscation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Obfuscation extends Armor$Glyph {
  static GREY: ItemSprite$Glowing = null;
  _Obfuscation(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  static stealthBoost(owner: Char, level: number): number {
    if (level === -1) {
      return 0;
    } else {
      return Math.fround((Math.fround(1 + Math.fround(level / 3))) * Armor$Glyph.genericProcChanceMultiplier(owner));
    }
  }
  glowing(): ItemSprite$Glowing {
    return Obfuscation.GREY;
  }
  static $clinit() {
    Obfuscation.GREY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(8947848);
  }
}

$J.define(Obfuscation, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Obfuscation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Obfuscation' }, clinit: true, lazy: ['GREY'] });
$J.module(() => {
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
});
