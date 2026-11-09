// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Vampiric.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Weapon$Enchantment } from '../Weapon.ts';

let Char$Alignment, Mimic, FloatingText, CharSprite, ItemSprite$Glowing, Random;

export class Vampiric extends Weapon$Enchantment {
  static RED: ItemSprite$Glowing = null;
  _Vampiric(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let missingPercent = Math.fround(((attacker.HT - attacker.HP) | 0) / Math.fround(attacker.HT));
    let healChance = Math.fround(Math.fround(0.05) + Math.fround(0.25 * missingPercent));
    healChance = Math.fround(healChance * this.procChanceMultiplier(attacker));
    if (Random.Float$() < healChance && attacker.alignment !== defender.alignment && (defender.alignment !== Char$Alignment.NEUTRAL || defender instanceof Mimic)) {
      let powerMulti = Math.max(1, healChance);
      let healAmt = $J.roundf(Math.fround(Math.fround(damage * 0.5) * powerMulti));
      healAmt = Math.min(healAmt, (attacker.HT - attacker.HP) | 0);
      if (healAmt > 0 && attacker.isAlive()) {
        attacker.HP = (attacker.HP + healAmt) | 0;
        attacker.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healAmt), FloatingText.HEALING, []);
      }
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Vampiric.RED;
  }
  static $clinit() {
    Vampiric.RED = new ItemSprite$Glowing()._ItemSprite$Glowing$int(6684706);
  }
}

$J.define(Vampiric, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vampiric', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Vampiric' }, clinit: true, lazy: ['RED'] });
$J.module(() => {
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
