// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Camouflage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Buff, Invisibility, ItemSprite$Glowing, Sample;

export class Camouflage extends Armor$Glyph {
  static GREEN: ItemSprite$Glowing = null;
  _Camouflage(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  static activate(ch: Char, level: number): void {
    if (level === -1) {
      return;
    }
    Buff.prolong(ch, $J.cls(Invisibility), Math.fround($J.roundf(Math.fround((Math.fround(3 + Math.fround(level / 2))) * Armor$Glyph.genericProcChanceMultiplier(ch)))));
    if (Dungeon.level.heroFOV[ch.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.MELD);
    }
  }
  glowing(): ItemSprite$Glowing {
    return Camouflage.GREEN;
  }
  static $clinit() {
    Camouflage.GREEN = new ItemSprite$Glowing()._ItemSprite$Glowing$int(4491298);
  }
}

$J.define(Camouflage, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Camouflage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Camouflage' }, clinit: true, lazy: ['GREEN'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
