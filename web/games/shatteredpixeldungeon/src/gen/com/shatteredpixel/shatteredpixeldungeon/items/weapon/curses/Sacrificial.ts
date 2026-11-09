// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Sacrificial.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Bleeding, Buff, ItemSprite$Glowing, Random;

export class Sacrificial extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Sacrificial(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 10) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let missingPercent = Math.fround(attacker.HP / Math.fround(attacker.HT));
      let bleedAmt = Math.fround(Math.fround(($J.pow(missingPercent, 2) * attacker.HT)) / 8);
      if (Random.Float$() < bleedAmt) {
        Buff.affect$Char$Class(attacker, $J.cls(Bleeding)).set$float$Class(Math.max(1, bleedAmt), $J.getClass(this));
      }
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Sacrificial.BLACK;
  }
  static $clinit() {
    Sacrificial.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Sacrificial, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Sacrificial', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Sacrificial' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
