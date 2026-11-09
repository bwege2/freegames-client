// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Repulsion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, WandOfBlastWave, Ballistica, ItemSprite$Glowing, Random;

export class Repulsion extends Armor$Glyph {
  static WHITE: ItemSprite$Glowing = null;
  _Repulsion(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, armor.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 5))) * this.procChanceMultiplier(defender));
    if (Dungeon.level.adjacent(attacker.pos, defender.pos) && Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let oppositeHero = (attacker.pos + (attacker.pos - defender.pos)) | 0;
      let trajectory = new Ballistica()._Ballistica(attacker.pos, oppositeHero, Ballistica.MAGIC_BOLT);
      WandOfBlastWave.throwChar(attacker, trajectory, $J.roundf(Math.fround(2 * powerMulti)), true, true, this);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Repulsion.WHITE;
  }
  static $clinit() {
    Repulsion.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16777215);
  }
}

$J.define(Repulsion, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Repulsion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Repulsion' }, clinit: true, lazy: ['WHITE'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
