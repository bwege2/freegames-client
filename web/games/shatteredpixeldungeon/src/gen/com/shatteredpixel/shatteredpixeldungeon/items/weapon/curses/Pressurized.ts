// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Pressurized.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let MeleeWeapon, GeyserTrap, Ballistica, ItemSprite$Glowing, Random;

export class Pressurized extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Pressurized(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 8) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let geyser = new GeyserTrap()._GeyserTrap();
      geyser.pos = defender.pos;
      if (weapon instanceof MeleeWeapon) {
        let aim = new Ballistica()._Ballistica(attacker.pos, defender.pos, Ballistica.STOP_TARGET);
        if (aim.path.size() > ((aim.dist + 1) | 0)) {
          geyser.centerKnockBackDirection = aim.path.get((aim.dist + 1) | 0);
        }
      }
      geyser.source_ = this;
      geyser.activate();
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Pressurized.BLACK;
  }
  static $clinit() {
    Pressurized.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Pressurized, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Pressurized', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Pressurized' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
