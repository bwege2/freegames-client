// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Chilling.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Chill, Splash, ItemSprite$Glowing, Random;

export class Chilling extends Weapon$Enchantment {
  static TEAL: ItemSprite$Glowing = null;
  _Chilling(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 4))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let durationToAdd = Math.fround(3 * powerMulti);
      let existing = defender.buff($J.cls(Chill));
      if (existing != null) {
        durationToAdd = Math.min(durationToAdd, Math.fround((Math.fround(6 * powerMulti)) - existing.cooldown()));
      }
      if (durationToAdd > Math.fround(0)) {
        Buff.affect$Char$Class$float(defender, $J.cls(Chill), durationToAdd);
      }
      Splash.at$PointF$int$int(defender.sprite_.center$(), -5056769, 5);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Chilling.TEAL;
  }
  static $clinit() {
    Chilling.TEAL = new ItemSprite$Glowing()._ItemSprite$Glowing$int(65535);
  }
}

$J.define(Chilling, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Chilling', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Chilling' }, clinit: true, lazy: ['TEAL'] });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
