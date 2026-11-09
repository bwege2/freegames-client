// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Potential.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Hero, EnergyParticle, ItemSprite$Glowing, Random;

export class Potential extends Armor$Glyph {
  static WHITE: ItemSprite$Glowing = null;
  _Potential(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, armor.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 6))) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance && defender instanceof Hero) {
      let powerMulti = Math.max(1, procChance);
      let wands = (defender).belongings.charge(powerMulti);
      if (wands > 0) {
        defender.sprite_.centerEmitter().burst(EnergyParticle.FACTORY, 10);
      }
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Potential.WHITE;
  }
  static $clinit() {
    Potential.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(16777215, Math.fround(0.6));
  }
}

$J.define(Potential, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Potential', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Potential' }, clinit: true, lazy: ['WHITE'] });
$J.module(() => {
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  EnergyParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
